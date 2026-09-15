package com.fidabet.backend.security;

import com.fidabet.backend.entity.BearerToken;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.repository.BearerTokenRepository;
import com.fidabet.backend.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Bearer token service backed by PostgreSQL.
 * Replaces the in-memory token store with database persistence.
 * Tokens are persisted and can be revoked on logout, surviving restarts.
 * Designed for horizontal scaling with database-backed token validation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();

    /** Token validity duration: 24 hours */
    private static final long TOKEN_VALIDITY_SECONDS = 86400;

    private final BearerTokenRepository tokenRepository;
    private final UserAccountService userAccountService;

    /**
     * Issue a new access token for the given user and persist it to the database.
     */
    @Transactional
    public String issueAccessToken(User user) {
        String token = randomToken("fidabet_at_");
        BearerToken bearerToken = BearerToken.builder()
                .user(user)
                .token(token)
                .isValid(true)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(TOKEN_VALIDITY_SECONDS))
                .build();
        tokenRepository.save(bearerToken);
        log.debug("Issued access token for user {}", user.getId());
        return token;
    }

    /**
     * Issue a refresh token (not tracked server-side, mirroring the original behavior).
     */
    public String issueRefreshToken() {
        return randomToken("fidabet_rt_");
    }

    /**
     * Check if the supplied token is a currently-valid access token.
     * Queries the database for token validation.
     */
    @Transactional(readOnly = true)
    public boolean isValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Optional<BearerToken> bearerToken = tokenRepository.findValidToken(token);
        return bearerToken.isPresent() && bearerToken.get().isValidToken();
    }

    /**
     * Invalidate a token server-side (logout).
     * Marks the token as invalid in the database.
     */
    @Transactional
    public void invalidate(String token) {
        if (token != null && !token.isBlank()) {
            tokenRepository.invalidateToken(token);
            log.debug("Invalidated token: {}", token.substring(0, Math.min(10, token.length())) + "...");
        }
    }

    private String randomToken(String prefix) {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return prefix + B64.encodeToString(bytes);
    }
}
