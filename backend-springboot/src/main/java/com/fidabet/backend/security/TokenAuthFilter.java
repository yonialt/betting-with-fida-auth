package com.fidabet.backend.security;

import com.fidabet.backend.service.TokenContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Rejects requests to protected routes (wallet, bets, user, favourites, settings) that do not
 * carry a valid {@code Authorization: Bearer <token>} header.
 *
 * <p>This closes a gap in the original Express server, where most protected handlers ignored the
 * token entirely. It is registered against specific URL patterns via
 * {@link com.fidabet.backend.config.WebConfig}, so public routes (auth, matches, football, redis,
 * ai, age-verification, health) are never blocked. CORS pre-flight ({@code OPTIONS}) is always
 * allowed through.</p>
 *
 * <p>The presented token is also stored in {@link TokenContext} for the duration of the request
 * so the service layer can resolve the acting user account (per-user wallet, bets, settings).</p>
 */
public class TokenAuthFilter extends OncePerRequestFilter {

    private final TokenService tokenService;

    public TokenAuthFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        try {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                chain.doFilter(request, response);
                return;
            }

            String token = bearerToken(request);
            if (!tokenService.isValid(token)) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }

            TokenContext.set(token);
            chain.doFilter(request, response);
        } finally {
            TokenContext.clear();
        }
    }

    private String bearerToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        return (header != null && header.startsWith("Bearer ")) ? header.substring("Bearer ".length()) : "";
    }
}
