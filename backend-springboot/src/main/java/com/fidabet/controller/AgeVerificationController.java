package com.fidabet.controller;

import com.fidabet.model.AgeVerification;
import com.fidabet.security.JwtAuthenticationFilter;
import com.fidabet.service.FaydaAgeVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/age-verification")
@CrossOrigin(origins = "*")
public class AgeVerificationController {

    private final FaydaAgeVerificationService verificationService;
    private final JwtAuthenticationFilter jwtFilter;

    public AgeVerificationController(FaydaAgeVerificationService verificationService,
                                     JwtAuthenticationFilter jwtFilter) {
        this.verificationService = verificationService;
        this.jwtFilter = jwtFilter;
    }

    /**
     * Check if the current user is age-verified.
     * GET /api/age-verification/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(HttpServletRequest request) {
        String userId = extractUserId(request);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean verified = verificationService.isAgeVerified(userId);
        AgeVerification latest = verificationService.getLatestVerification(userId);

        return ResponseEntity.ok(Map.of(
            "verified", verified,
            "latestVerification", latest != null ? Map.of(
                "status", latest.getStatus(),
                "age", latest.getAge(),
                "isAdult", latest.getIsAdult(),
                "reason", latest.getReason() != null ? latest.getReason() : "",
                "verifiedAt", latest.getVerifiedAt() != null ? latest.getVerifiedAt().toString() : null
            ) : null
        ));
    }

    /**
     * Submit a Fayda ID for age verification.
     * POST /api/age-verification/verify
     * Body: { "faydaId": "123456789012" }
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body,
                                                      HttpServletRequest request) {
        String userId = extractUserId(request);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String faydaId = body.get("faydaId");
        if (faydaId == null || faydaId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Fayda ID is required.",
                "status", "MISSING_ID"
            ));
        }

        Map<String, Object> result = verificationService.submitVerification(userId, faydaId);
        return ResponseEntity.ok(result);
    }

    /**
     * Skip verification (for demo/dev purposes only).
     * POST /api/age-verification/skip-demo
     */
    @PostMapping("/skip-demo")
    public ResponseEntity<Map<String, Object>> skipDemo(HttpServletRequest request) {
        String userId = extractUserId(request);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        // In mock mode, allow skipping for demo
        Map<String, Object> result = verificationService.submitVerification(userId, "123456789018");
        return ResponseEntity.ok(result);
    }

    /**
     * Reset verification (dev only - allows re-testing the gate).
     * POST /api/age-verification/reset
     */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> reset(HttpServletRequest request) {
        String userId = extractUserId(request);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        verificationService.resetVerification(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Verification reset. You can now re-verify."
        ));
    }

    private String extractUserId(HttpServletRequest request) {
        try {
            return jwtFilter.extractUserIdFromRequest(request);
        } catch (Exception e) {
            return null;
        }
    }
}
