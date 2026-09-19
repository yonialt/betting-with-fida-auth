package com.fidabet.backend.service;

import com.fidabet.backend.entity.BearerToken;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.exception.InvalidCredentialsException;
import com.fidabet.backend.model.UserProfile;
import com.fidabet.backend.repository.BearerTokenRepository;
import com.fidabet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Persistent user account service backed by PostgreSQL.
 *
 * Identity model: the bearer token on every protected request identifies the acting user.
 * {@link #resolveUser(String)} maps the token to its owning user row, so each account has
 * its own balance, bets and settings, and all state survives restarts. Unauthenticated
 * demo flows (guest age-gate) fall back to a single shared demo account.
 *
 * Balance mutations use atomic conditional SQL updates, so concurrent debits can never
 * double-spend or drive the balance negative.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAccountService {

    /** Shared fallback account for unauthenticated demo flows. */
    private static final String DEMO_USERNAME = "Player_8831";

    private final UserRepository userRepository;
    private final BearerTokenRepository tokenRepository;

    /** BCrypt hasher for stored passwords (spring-security-crypto, standalone). */
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Resolve the acting user from the bearer token presented on the request.
     * Falls back to the shared demo user for unauthenticated demo flows.
     */
    @Transactional(readOnly = true)
    public User resolveUser(String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            Optional<BearerToken> bt = tokenRepository.findValidToken(bearerToken.trim());
            if (bt.isPresent()) {
                // Re-fetch by id so the returned entity is fully loaded. The raw
                // BearerToken.getUser() is a lazy proxy that detaches with the token
                // lookup's session and throws LazyInitializationException as soon as
                // later code touches balance/currency on it.
                Long uid = bt.get().getUser().getId();
                return userRepository.findById(uid).orElseGet(() -> bt.get().getUser());
            }
        }
        return getCurrentUserEntity();
    }

    /**
     * Resolve the acting user from a bearer token, falling back to the demo user when
     * the token is absent or unknown. Used by /api/auth/refresh with the old token.
     */
    @Transactional(readOnly = true)
    public User resolveUserOrDemo(String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            Optional<BearerToken> bt = tokenRepository.findValidToken(bearerToken.trim());
            if (bt.isPresent()) {
                return bt.get().getUser();
            }
        }
        return getCurrentUserEntity();
    }

    /**
     * Get or create the demo user. Deterministic lookup by username so the demo account
     * persists across restarts instead of being recreated on every boot.
     */
    @Transactional(readOnly = true)
    public synchronized User getCurrentUserEntity() {
        Optional<User> existing = userRepository.findByUsername(DEMO_USERNAME);
        return existing.orElseGet(this::createDemoUser);
    }

    /**
     * Create the initial demo user with seeded balance.
     */
    @Transactional
    protected User createDemoUser() {
        User user = User.builder()
                .username(DEMO_USERNAME)
                .phone("+251911223344")
                .email("player8831@fidabet.com")
                .passwordHash("$2a$10$demo")
                .balance(new BigDecimal("14500.00"))
                .bonusBalance(new BigDecimal("250.00"))
                .currency("ETB")
                .isLoggedIn(true)
                .isAgeVerified(true)
                .ageVerificationStatus("verified")
                .build();
        user = userRepository.save(user);
        log.info("Created demo user with id: {}", user.getId());
        return user;
    }

    /**
     * Get the user owning a bearer token as a UserProfile DTO.
     */
    @Transactional(readOnly = true)
    public UserProfile getCurrentUser(String bearerToken) {
        return toUserProfile(resolveUser(bearerToken));
    }

    /**
     * Convert User entity to UserProfile DTO preserving the existing API contract.
     */
    public static UserProfile toUserProfile(User user) {
        if (user == null) {
            return null;
        }
        return UserProfile.builder()
                .isLoggedIn(user.getIsLoggedIn())
                .username(user.getUsername())
                .userId("ID: " + user.getId())
                .balance(user.getBalance() != null ? user.getBalance().doubleValue() : 0.0)
                .currency(user.getCurrency() != null ? user.getCurrency() : "ETB")
                .bonusBalance(user.getBonusBalance() != null ? user.getBonusBalance().doubleValue() : 0.0)
                .phone(user.getPhone())
                .email(user.getEmail())
                .isAgeVerified(user.getIsAgeVerified())
                .ageVerificationStatus(user.getAgeVerificationStatus())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Mirrors POST /api/auth/login: validates the credentials, matches the username
     * (or phone number) to a persistent account, verifies the password against its
     * BCrypt hash and marks the account logged-in.
     *
     * Legacy accounts created before password storage existed (fixed demo hash) are
     * still accepted so existing demo users are not locked out.
     */
    @Transactional
    public User login(String usernameOrPhone, String password) {
        if (usernameOrPhone == null || usernameOrPhone.isBlank()) {
            throw new InvalidCredentialsException("Username is required");
        }
        if (password == null || password.isBlank()) {
            throw new InvalidCredentialsException("Password is required");
        }

        String key = usernameOrPhone.trim();
        Optional<User> existing = userRepository.findByUsername(key);
        if (existing.isEmpty() && key.matches("[0-9+\\s()-]{7,20}")) {
            existing = userRepository.findByPhone(normalizePhone(key));
        }
        if (existing.isEmpty()) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        User user = existing.get();
        verifyPasswordOrLegacy(user, password);
        user.setIsLoggedIn(true);
        return userRepository.save(user);
    }

    /**
     * Mirrors POST /api/auth/register: validates all fields, then creates a new
     * persistent account with a BCrypt-hashed password and zero balance.
     * Throws IllegalArgumentException with a user-facing message on invalid input.
     */
    @Transactional
    public User register(String username, String phone, String email, String password) {
        validateUsername(username);
        validatePhone(phone);
        if (email != null && !email.isBlank()) {
            validateEmail(email);
            email = email.trim();
        } else {
            email = null;
        }
        validatePassword(password);
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number is already registered");
        }

        User user = User.builder()
                .username(username)
                .phone(phone)
                .email(email)
                .passwordHash(encoder.encode(password))
                .balance(BigDecimal.ZERO)
                .bonusBalance(BigDecimal.ZERO)
                .currency("ETB")
                .isLoggedIn(true)
                .isAgeVerified(false)
                .ageVerificationStatus("unverified")
                .build();
        user = userRepository.save(user);
        log.info("Registered persistent account: {}", username);
        return user;
    }

    // ------------------------------------------------------------------
    // Validation helpers (shared rules with the frontend AuthModal)
    // ------------------------------------------------------------------

    /** Letters, numbers, dot, underscore, hyphen, @ — no spaces; 3-40 chars (emails allowed as usernames). */
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9._@-]{3,40}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9\\s()-]{7,20}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\s]+@[^@\s]+\\.[^@\s]{2,}$");

    private void validateUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        String u = username.trim();
        if (u.length() < 3 || u.length() > 40) {
            throw new IllegalArgumentException("Username must be 3-40 characters");
        }
        if (!USERNAME_PATTERN.matcher(u).matches()) {
            throw new IllegalArgumentException("Username may only contain letters, numbers, dots, dashes and underscores");
        }
    }

    /** Phone is optional at the API level (internal/test flows), but must be valid when present. */
    private void validatePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return;
        }
        String p = normalizePhone(phone);
        if (!PHONE_PATTERN.matcher(p).matches()) {
            throw new IllegalArgumentException("Enter a valid phone number (e.g. +251911000000)");
        }
        if (p.replaceAll("[^0-9]", "").length() < 9) {
            throw new IllegalArgumentException("Phone number is too short");
        }
    }

    private void validateEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (password.length() > 72) {
            throw new IllegalArgumentException("Password must be at most 72 characters");
        }
        if (!password.matches(".*[A-Za-z].*") || !password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain both letters and numbers");
        }
    }

    /** Strip separators/spaces so stored and typed phone numbers match. */
    private static String normalizePhone(String phone) {
        return phone == null ? null : phone.replaceAll("[\\s()-]", "");
    }

    /**
     * BCrypt verify with a legacy fallback: accounts created before password
     * storage existed carry the fixed demo hash and accept any password.
     */
    private void verifyPasswordOrLegacy(User user, String password) {
        String hash = user.getPasswordHash();
        if (hash == null || "$2a$10$demo".equals(hash)) {
            return; // legacy account — accept any password
        }
        if (!encoder.matches(password, hash)) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    /**
     * Mirrors PUT /api/user/profile: shallow-merge of provided fields for the acting user.
     */
    @Transactional
    public UserProfile updateProfile(String bearerToken, Map<String, Object> patch) {
        User user = resolveUser(bearerToken);
        if (patch != null) {
            if (patch.containsKey("username")) {
                String newUsername = str(patch.get("username"));
                if (newUsername != null && !newUsername.isBlank()) {
                    Optional<User> existing = userRepository.findByUsername(newUsername);
                    if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                        throw new IllegalArgumentException("Username already taken");
                    }
                    user.setUsername(newUsername);
                }
            }
            if (patch.containsKey("phone")) {
                user.setPhone(str(patch.get("phone")));
            }
            if (patch.containsKey("email")) {
                user.setEmail(str(patch.get("email")));
            }
            if (patch.containsKey("currency")) {
                user.setCurrency(str(patch.get("currency")));
            }
            if (patch.containsKey("avatarUrl")) {
                Object av = patch.get("avatarUrl");
                if (av == null) {
                    // Explicit null removes the profile picture.
                    user.setAvatarUrl(null);
                } else {
                    String s = String.valueOf(av);
                    // Validate data URLs: image only, decoded size capped at 300 KB.
                    if (s.startsWith("data:image/")) {
                        int b64 = s.indexOf(";base64,");
                        int decoded = b64 >= 0
                                ? (int) ((s.length() - (b64 + 8)) * 0.75)
                                : s.length();
                        if (decoded <= 300_000) {
                            user.setAvatarUrl(s);
                        }
        			}
                }
            }
            if (patch.containsKey("balance")) {
                Object bal = patch.get("balance");
                if (bal instanceof Number n) {
                    user.setBalance(User.round2(n.doubleValue()));
                }
            }
            if (patch.containsKey("bonusBalance")) {
                Object bal = patch.get("bonusBalance");
                if (bal instanceof Number n) {
                    user.setBonusBalance(User.round2(n.doubleValue()));
                }
            }
            user = userRepository.save(user);
        }
        return toUserProfile(user);
    }

    /**
     * Mark the acting user as age verified (persisted).
     */
    @Transactional
    public void markAgeVerified() {
        User user = resolveUser(TokenContext.token());
        user.setIsAgeVerified(true);
        user.setAgeVerificationStatus("verified");
        userRepository.save(user);
    }

    /**
     * Wallet balance envelope: { balance, bonusBalance, currency }.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> balanceView(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("balance", user.getBalance() != null ? user.getBalance().doubleValue() : 0.0);
        m.put("bonusBalance", user.getBonusBalance() != null ? user.getBonusBalance().doubleValue() : 0.0);
        m.put("currency", user.getCurrency() != null ? user.getCurrency() : "ETB");
        return m;
    }

    /**
     * Get the user's currency.
     */
    @Transactional(readOnly = true)
    public String currency(User user) {
        return user.getCurrency() != null ? user.getCurrency() : "ETB";
    }

    /**
     * Get the user's balance.
     */
    @Transactional(readOnly = true)
    public double balance(User user) {
        return user.getBalance() != null ? user.getBalance().doubleValue() : 0.0;
    }

    /**
     * Add funds (deposit / cashout). Returns the new balance, re-read after the
     * atomic SQL update.
     */
    @Transactional
    public double credit(User user, double amount) {
        userRepository.addBalance(user.getId(), User.round2(amount), Instant.now());
        return balance(userRepository.findById(user.getId()).orElse(user));
    }

    /**
     * Remove funds (withdraw / place-bet). Returns true and debits when sufficient;
     * false and leaves the balance untouched otherwise. Check-and-debit happens in one
     * atomic SQL statement, so concurrent debits cannot double-spend or go negative.
     */
    @Transactional
    public boolean tryDebit(User user, double amount) {
        int updated = userRepository.tryDebitBalance(user.getId(), User.round2(amount), Instant.now());
        return updated > 0;
    }

    /**
     * Get the user entity ID.
     */
    @Transactional(readOnly = true)
    public Long getUserId(User user) {
        return user.getId();
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }
}
