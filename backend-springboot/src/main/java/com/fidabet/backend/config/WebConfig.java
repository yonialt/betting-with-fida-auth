package com.fidabet.backend.config;

import com.fidabet.backend.security.TokenAuthFilter;
import com.fidabet.backend.security.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web layer configuration:
 * <ul>
 *   <li>CORS — the SPA is now served from a different origin (Vite dev server / static host)
 *       than the API (:8080), so cross-origin calls must be permitted. Origins are configurable
 *       via {@code app.cors.allowed-origins}.</li>
 *   <li>Registers {@link TokenAuthFilter} against the protected route patterns only.</li>
 * </ul>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://107.23.159.58:3000}") String origins) {
        // APP_CORS_ALLOWED_ORIGINS env var is honored via relaxed binding (app.cors.allowed-origins).
        // Deployment default: same-origin nginx proxying means no CORS is needed in prod,
        // but the origins stay configurable for split-origin deployments.
        this.allowedOrigins = origins.split("\\s*,\\s*");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
        registry.addMapping("/ws/**")
                .allowedOrigins(allowedOrigins);
    }

    @Bean
    public FilterRegistrationBean<TokenAuthFilter> tokenAuthFilter(TokenService tokenService) {
        FilterRegistrationBean<TokenAuthFilter> registration = new FilterRegistrationBean<>(new TokenAuthFilter(tokenService));
        registration.addUrlPatterns(
                "/api/wallet/*",
                "/api/bets/*",
                "/api/pm/*",
                "/api/user/*",
                "/api/favorites", "/api/favorites/*",
                "/api/settings"
        );
        registration.setOrder(1);
        registration.setName("tokenAuthFilter");
        return registration;
    }
}
