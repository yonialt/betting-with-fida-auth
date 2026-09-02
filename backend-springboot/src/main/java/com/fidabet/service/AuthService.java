package com.fidabet.service;

import com.fidabet.dto.AuthDTOs;
import com.fidabet.dto.UserDTOs;
import com.fidabet.exception.DuplicateResourceException;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.exception.UnauthorizedException;
import com.fidabet.model.KycDocument;
import com.fidabet.model.User;
import com.fidabet.repository.KycDocumentRepository;
import com.fidabet.repository.UserRepository;
import com.fidabet.security.CustomUserDetailsService;
import com.fidabet.security.JwtTokenProvider;
import com.fidabet.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final EventPublisherService eventPublisherService;

    public AuthService(
            UserRepository userRepository,
            KycDocumentRepository kycDocumentRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            CustomUserDetailsService userDetailsService,
            EventPublisherService eventPublisherService) {
        this.userRepository = userRepository;
        this.kycDocumentRepository = kycDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.eventPublisherService = eventPublisherService;
    }

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number is already registered");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        String userId = "user-" + UUID.randomUUID().toString().substring(0, 8);

        User user = User.builder()
                .id(userId)
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .currency("ETB")
                .balance(new BigDecimal("100.00")) // Welcome bonus
                .bonusBalance(new BigDecimal("50.00"))
                .isVerified(false)
                .isActive(true)
                .role("USER")
                .version(0L)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user: {} (id: {})", savedUser.getUsername(), savedUser.getId());

        eventPublisherService.publishEvent("fida-bet.user.registered", savedUser.getId(), savedUser);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        return AuthDTOs.AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToProfileResponse(savedUser))
                .build();
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthDTOs.AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToProfileResponse(user))
                .build();
    }

    public AuthDTOs.AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String userId = tokenProvider.getUserIdFromToken(refreshToken);
        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserById(userId);

        String newAccessToken = tokenProvider.generateAccessToken(principal);
        String newRefreshToken = tokenProvider.generateRefreshToken(principal);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthDTOs.AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToProfileResponse(user))
                .build();
    }

    public boolean forgotPassword(String phone) {
        log.info("Generating OTP for forgot password, phone: {}", phone);
        // OTP logic (in production: sends SMS through Ethio SMS Gateway / Twilio)
        eventPublisherService.publishEvent("fida-bet.notification.sms", phone, "Your OTP is 123456");
        return true;
    }

    public boolean verifyOtp(String phone, String otp) {
        log.info("Verifying OTP for phone: {}, code: {}", phone, otp);
        // Demo allows '123456' or any 6-digit code
        return "123456".equals(otp) || (otp != null && otp.length() == 6);
    }

    @Transactional
    public KycDocument submitKyc(String userId, AuthDTOs.KycRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        KycDocument document = KycDocument.builder()
                .id(UUID.randomUUID().toString())
                .userId(user.getId())
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .fileUrl(request.getFileUrl())
                .status("PENDING")
                .build();

        KycDocument saved = kycDocumentRepository.save(document);
        eventPublisherService.publishEvent("fida-bet.user.kyc.submitted", user.getId(), saved);
        return saved;
    }

    public UserDTOs.UserProfileResponse mapToProfileResponse(User user) {
        return UserDTOs.UserProfileResponse.builder()
                .isLoggedIn(true)
                .username(user.getUsername())
                .userId("ID: " + (user.getId().startsWith("user-") ? user.getId().substring(5) : user.getId()))
                .email(user.getEmail())
                .phone(user.getPhone())
                .balance(user.getBalance())
                .currency(user.getCurrency())
                .bonusBalance(user.getBonusBalance())
                .isVerified(user.getIsVerified())
                .role(user.getRole())
                .build();
    }
}
