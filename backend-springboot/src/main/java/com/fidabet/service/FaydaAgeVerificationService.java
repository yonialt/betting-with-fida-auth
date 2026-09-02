package com.fidabet.service;

import com.fidabet.config.FaydaConfig;
import com.fidabet.model.AgeVerification;
import com.fidabet.model.User;
import com.fidabet.repository.AgeVerificationRepository;
import com.fidabet.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * Fayda Age Verification Service
 *
 * Uses Ethiopia's national digital ID (Fayda) to verify users are 18+ before allowing bets.
 *
 * In MOCK mode (fayda.mock=true), simulates the verification flow for development.
 * In PRODUCTION mode, calls the real Fayda eSignet API using OpenID Connect.
 *
 * Fayda API Flow (Production):
 * 1. User enters their 12-digit Fayda ID
 * 2. Backend sends demographic auth request to Fayda API
 * 3. Fayda returns user's DOB and age
 * 4. Backend checks if age >= 18
 * 5. Verification result stored in DB
 */
@Service
public class FaydaAgeVerificationService {

    private static final Logger log = LoggerFactory.getLogger(FaydaAgeVerificationService.class);
    private static final int LEGAL_BETTING_AGE = 18;

    private final AgeVerificationRepository ageVerificationRepository;
    private final UserRepository userRepository;
    private final FaydaConfig faydaConfig;
    private final HttpClient httpClient;

    @Value("${fayda.mock:true}")
    private boolean mockMode;

    public FaydaAgeVerificationService(AgeVerificationRepository ageVerificationRepository,
                                       UserRepository userRepository,
                                       FaydaConfig faydaConfig) {
        this.ageVerificationRepository = ageVerificationRepository;
        this.userRepository = userRepository;
        this.faydaConfig = faydaConfig;
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Reset verification for a user (dev only)
     */
    @Transactional
    public void resetVerification(String userId) {
        ageVerificationRepository.findByUserIdAndStatus(userId, "VERIFIED")
            .ifPresent(v -> {
                ageVerificationRepository.delete(v);
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    user.setIsVerified(false);
                    userRepository.save(user);
                }
            });
    }

    /**
     * Check if a user is already age-verified
     */
    public boolean isAgeVerified(String userId) {
        return ageVerificationRepository.existsByUserIdAndStatus(userId, "VERIFIED");
    }

    /**
     * Get the latest verification for a user
     */
    public AgeVerification getLatestVerification(String userId) {
        return ageVerificationRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(null);
    }

    /**
     * Submit a Fayda ID for age verification.
     * In mock mode, simulates the verification.
     * In production, initiates the Fayda eSignet OIDC flow.
     */
    @Transactional
    public Map<String, Object> submitVerification(String userId, String faydaId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate Fayda ID format (12 digits)
        if (faydaId == null || !faydaId.matches("\\d{12}")) {
            return Map.of(
                "success", false,
                "message", "Invalid Fayda ID. Must be exactly 12 digits.",
                "status", "INVALID_ID"
            );
        }

        // Check if already verified
        if (isAgeVerified(userId)) {
            return Map.of(
                "success", true,
                "message", "Age already verified.",
                "status", "ALREADY_VERIFIED"
            );
        }

        if (mockMode) {
            return handleMockVerification(userId, faydaId, user);
        } else {
            return handleRealVerification(userId, faydaId, user);
        }
    }

    /**
     * Mock verification for development/testing.
     * Simulates Fayda API response with realistic data.
     */
    private Map<String, Object> handleMockVerification(String userId, String faydaId, User user) {
        log.info("MOCK MODE: Simulating Fayda age verification for user {}", userId);

        // Simulate age based on Fayda ID (use last 2 digits as age offset)
        int lastTwoDigits = Integer.parseInt(faydaId.substring(10));
        int simulatedAge = 18 + (lastTwoDigits % 40); // Age between 18-57
        LocalDate simulatedDob = LocalDate.now().minusYears(simulatedAge).minusMonths(lastTwoDigits % 12);
        boolean isAdult = simulatedAge >= LEGAL_BETTING_AGE;

        String status = isAdult ? "VERIFIED" : "REJECTED";
        String reason = isAdult
            ? "Age verified: " + simulatedAge + " years old (>= 18)"
            : "Age verification failed: " + simulatedAge + " years old (< 18)";

        // Save verification record
        AgeVerification verification = AgeVerification.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .faydaId(faydaId)
            .fullName("Mock User " + faydaId.substring(8))
            .dateOfBirth(simulatedDob.format(DateTimeFormatter.ISO_LOCAL_DATE))
            .age(simulatedAge)
            .isAdult(isAdult)
            .status(status)
            .verifiedAt(isAdult ? LocalDateTime.now() : null)
            .reason(reason)
            .build();

        ageVerificationRepository.save(verification);

        // Update user verification status if adult
        if (isAdult) {
            user.setIsVerified(true);
            userRepository.save(user);
        }

        log.info("MOCK verification result: {} (age={}, isAdult={})", status, simulatedAge, isAdult);

        return Map.of(
            "success", isAdult,
            "message", reason,
            "status", status,
            "age", simulatedAge,
            "fullName", verification.getFullName(),
            "dateOfBirth", verification.getDateOfBirth(),
            "verificationId", verification.getId()
        );
    }

    /**
     * Real Fayda API verification using OpenID Connect / demographic auth.
     *
     * Fayda eSignet OIDC Flow:
     * 1. GET /.well-known/openid-configuration → discover endpoints
     * 2. POST /oauth2/authorize → user authenticates (Fayda ID + OTP)
     * 3. POST /oauth2/token → exchange code for tokens
     * 4. Decode ID token → extract demographics (DOB, age)
     * 5. Check age >= 18
     */
    private Map<String, Object> handleRealVerification(String userId, String faydaId, User user) {
        log.info("PRODUCTION MODE: Calling Fayda API for age verification, faydaId=XXX{}", faydaId.substring(8));

        try {
            String baseUrl = faydaConfig.getBaseUrl();

            // Step 1: Call Fayda demographic verification endpoint
            String requestBody = String.format(
                "{\"faydaId\":\"%s\",\"authenticationType\":\"DEMOGRAPHIC\",\"attributes\":[\"age\",\"dateOfBirth\",\"fullName\"]}",
                faydaId
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/v1/verify/demographic"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + faydaConfig.getClientSecret())
                .header("X-Partner-API-Key", faydaConfig.getClientId())
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // Parse response (simplified — real implementation would use JSON parsing)
                String body = response.body();
                log.info("Fayda API response: status=200");

                // Extract age from response (in production, parse JSON properly)
                // This is a placeholder — real implementation depends on Fayda's actual response format
                int age = extractAgeFromResponse(body);
                String fullName = extractNameFromResponse(body);
                String dob = extractDobFromResponse(body);
                boolean isAdult = age >= LEGAL_BETTING_AGE;

                String status = isAdult ? "VERIFIED" : "REJECTED";
                String reason = isAdult
                    ? "Age verified via Fayda: " + age + " years old"
                    : "Underage via Fayda: " + age + " years old (minimum 18 required)";

                AgeVerification verification = AgeVerification.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .faydaId(faydaId)
                    .fullName(fullName)
                    .dateOfBirth(dob)
                    .age(age)
                    .isAdult(isAdult)
                    .status(status)
                    .verifiedAt(isAdult ? LocalDateTime.now() : null)
                    .reason(reason)
                    .build();

                ageVerificationRepository.save(verification);

                if (isAdult) {
                    user.setIsVerified(true);
                    userRepository.save(user);
                }

                return Map.of(
                    "success", isAdult,
                    "message", reason,
                    "status", status,
                    "age", age,
                    "fullName", fullName != null ? fullName : "",
                    "dateOfBirth", dob != null ? dob : "",
                    "verificationId", verification.getId()
                );
            } else {
                log.error("Fayda API error: status={}, body={}", response.statusCode(), response.body());
                return Map.of(
                    "success", false,
                    "message", "Fayda verification service returned error: " + response.statusCode(),
                    "status", "API_ERROR"
                );
            }
        } catch (Exception e) {
            log.error("Fayda API call failed", e);
            return Map.of(
                "success", false,
                "message", "Failed to connect to Fayda verification service: " + e.getMessage(),
                "status", "CONNECTION_ERROR"
            );
        }
    }

    // Helper methods for parsing Fayda API response (production)
    private int extractAgeFromResponse(String body) {
        // In production, use Jackson/Gson to parse JSON
        // For now, extract from a known field pattern
        try {
            int idx = body.indexOf("\"age\":");
            if (idx > 0) {
                String sub = body.substring(idx + 6).trim();
                StringBuilder num = new StringBuilder();
                for (char c : sub.toCharArray()) {
                    if (Character.isDigit(c)) num.append(c);
                    else break;
                }
                return Integer.parseInt(num.toString());
            }
        } catch (Exception e) {
            log.warn("Could not extract age from Fayda response");
        }
        return 0;
    }

    private String extractNameFromResponse(String body) {
        try {
            int idx = body.indexOf("\"fullName\":");
            if (idx > 0) {
                String sub = body.substring(idx + 11).trim();
                if (sub.startsWith("\"")) {
                    int end = sub.indexOf("\"", 1);
                    if (end > 1) return sub.substring(1, end);
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract name from Fayda response");
        }
        return null;
    }

    private String extractDobFromResponse(String body) {
        try {
            int idx = body.indexOf("\"dateOfBirth\":");
            if (idx > 0) {
                String sub = body.substring(idx + 14).trim();
                if (sub.startsWith("\"")) {
                    int end = sub.indexOf("\"", 1);
                    if (end > 1) return sub.substring(1, end);
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract DOB from Fayda response");
        }
        return null;
    }
}
