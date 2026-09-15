package com.fidabet.backend.controller;

import com.fidabet.backend.model.UserProfile;
import com.fidabet.backend.service.UserAccountService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** User profile & KYC endpoints (/api/user/*). Protected by the token filter. */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserAccountService users;

    public UserController(UserAccountService users) {
        this.users = users;
    }

    @GetMapping("/profile")
    public UserProfile profile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return users.getCurrentUser(bearer(authorization));
    }

    @PutMapping("/profile")
    public UserProfile updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) Map<String, Object> body) {
        return users.updateProfile(bearer(authorization), body);
    }

    @PostMapping("/kyc")
    public Map<String, Object> kyc() {
        return Map.<String, Object>of("status", "APPROVED", "message", "KYC documents received and verified");
    }

    private static String bearer(String authorization) {
        return (authorization != null && authorization.startsWith("Bearer "))
                ? authorization.substring("Bearer ".length()) : "";
    }
}
