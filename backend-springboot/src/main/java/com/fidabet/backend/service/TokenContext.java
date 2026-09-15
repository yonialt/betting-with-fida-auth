package com.fidabet.backend.service;

/**
 * Request-scoped holder for the bearer token presented on the current HTTP request.
 *
 * <p>{@link com.fidabet.backend.config.WebConfig} registers the token filter so that the raw
 * token survives into the service layer, where it is resolved to the owning user account
 * ({@code TokenAuthFilter} validates it, services map it to a persistent {@code User}).
 * Public routes leave this empty and services fall back to the demo user, mirroring the
 * original single-session demo behaviour.</p>
 */
public final class TokenContext {

    private static final ThreadLocal<String> TOKEN = new ThreadLocal<>();

    private TokenContext() {
    }

    public static void set(String token) {
        TOKEN.set(token);
    }

    public static String token() {
        return TOKEN.get();
    }

    public static void clear() {
        TOKEN.remove();
    }
}
