package com.fidabet.backend.controller;

import com.fidabet.backend.entity.User;
import com.fidabet.backend.model.UserProfile;
import com.fidabet.backend.security.TokenService;
import com.fidabet.backend.service.UserAccountService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Authentication endpoints, ported from the Express /api/auth/* routes.
 * The token lifecycle (issue on login/register, validate on session, invalidate on logout) is
 * preserved exactly; tokens are owned by the acting user and stored in PostgreSQL.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountService users;
    private final TokenService tokens;

    public AuthController(UserAccountService users, TokenService tokens) {
        this.users = users;
        this.tokens = tokens;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody(required = false) Map<String, Object> body) {
        User entity = users.login(strField(body, "username"));
        return authPayload(entity);
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody(required = false) Map<String, Object> body) {
        User entity = users.register(strField(body, "username"), strField(body, "phone"));
        return authPayload(entity);
    }

    @PostMapping("/refresh")
    public Map<String, Object> refresh(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        String token = bearer(authorization);
        User entity = token.isBlank() ? users.getCurrentUserEntity() : users.resolveUserOrDemo(token);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("token", tokens.issueAccessToken(entity));
        res.put("refreshToken", tokens.issueRefreshToken());
        return res;
    }

    /** Session restore on reload — succeeds only when the presented token is still valid. */
    @GetMapping("/session")
    public ResponseEntity<?> session(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        String token = bearer(authorization);
        if (!tokens.isValid(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("token", token);
        res.put("user", users.getCurrentUser(token));
        return ResponseEntity.ok(res);
    }

    /** Logout — invalidates the presented access token server-side. */
    @PostMapping("/logout")
    public Map<String, Object> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        tokens.invalidate(bearer(authorization));
        return Map.<String, Object>of("success", true);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword() {
        return Map.<String, Object>of("message", "Password reset instructions sent");
    }

    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp() {
        return Map.<String, Object>of("verified", true);
    }

    private Map<String, Object> authPayload(User entity) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("token", tokens.issueAccessToken(entity));
        res.put("refreshToken", tokens.issueRefreshToken());
        res.put("user", UserAccountService.toUserProfile(entity));
        return res;
    }

    private static String strField(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object v = body.get(key);
        return v == null ? null : String.valueOf(v);
    }

    private static String bearer(String authorization) {
        return (authorization != null && authorization.startsWith("Bearer "))
                ? authorization.substring("Bearer ".length()) : "";
    }
}
