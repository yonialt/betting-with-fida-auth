package com.fidabet.backend.security;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Opaque bearer-token store, replacing the in-memory {@code validTokens} set from the
 * Express server (server.ts).
 *
 * <p>Design note: opaque, server-side tokens are deliberately kept (rather than stateless
 * JWTs) because the original contract requires <em>revocation</em> — logout must invalidate a
 * token so a copy left in another tab cannot restore the session. Stateless JWTs cannot be
 * revoked without a companion store, so an opaque token set is both simpler and stronger here.
 * Tokens are generated from {@link SecureRandom} instead of {@code Math.random()}.</p>
 */
@Service
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();

    /** Access tokens the backend has issued and still accepts. */
    private final Set<String> validAccessTokens = ConcurrentHashMap.newKeySet();

    private String randomToken(String prefix) {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return prefix + B64.encodeToString(bytes);
    }

    /** Issue a new access token and register it as valid. */
    public String issueAccessToken() {
        String token = randomToken("fidabet_at_");
        validAccessTokens.add(token);
        return token;
    }

    /** Issue a refresh token (not tracked server-side, mirroring the original behaviour). */
    public String issueRefreshToken() {
        return randomToken("fidabet_rt_");
    }

    /** True when the supplied token is a currently-valid access token. */
    public boolean isValid(String token) {
        return token != null && !token.isBlank() && validAccessTokens.contains(token);
    }

    /** Invalidate a token server-side (logout). */
    public void invalidate(String token) {
        if (token != null) {
            validAccessTokens.remove(token);
        }
    }
}
