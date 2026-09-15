package com.fidabet.backend.service;

import com.fidabet.backend.entity.BearerToken;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.model.UserProfile;
import com.fidabet.backend.repository.BearerTokenRepository;
import com.fidabet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

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

    /**
     * Resolve the acting user from the bearer token presented on the request.
     * Falls back to the shared demo user for unauthenticated demo flows.
     */
    @Transactional(readOnly = true)
    public User resolveUser(String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            Optional<BearerToken> bt = tokenRepository.findValidToken(bearerToken.trim());
            if (bt.isPresent()) {
                return bt.get().getUser();
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
                .build();
    }

    /**
     * Mirrors POST /api/auth/login: matches the username to a persistent account and marks
     * it logged-in. This demo backend performs no password check (matching the original
     * Express demo); the matched account is returned so a token can be issued for it.
     */
    @Transactional
    public User login(String username) {
        if (username == null || username.isBlank()) {
            return getCurrentUserEntity();
        }
        Optional<User> existing = userRepository.findByUsername(username);
        User user = existing.orElseGet(() -> {
            User created = User.builder()
                    .username(username)
                    .passwordHash("$2a$10$demo")
                    .balance(BigDecimal.ZERO)
                    .bonusBalance(BigDecimal.ZERO)
                    .currency("ETB")
                    .isLoggedIn(false)
                    .isAgeVerified(false)
                    .ageVerificationStatus("unverified")
                    .build();
            User saved = userRepository.save(created);
            log.info("Auto-provisioned account on first login: {}", username);
            return saved;
        });
        user.setIsLoggedIn(true);
        return userRepository.save(user);
    }

    /**
     * Mirrors POST /api/auth/register: creates a new persistent account with zero balance.
     * Throws when the username is missing or already taken.
     */
    @Transactional
    public User register(String username, String phone) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = User.builder()
                .username(username)
                .phone(phone)
                .passwordHash("$2a$10$demo")
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
