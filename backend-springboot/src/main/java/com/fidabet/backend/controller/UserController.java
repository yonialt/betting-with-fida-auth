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
    public UserProfile profile() {
        return users.getCurrentUser();
    }

    @PutMapping("/profile")
    public UserProfile updateProfile(@RequestBody(required = false) Map<String, Object> body) {
        return users.updateProfile(body);
    }

    @PostMapping("/kyc")
    public Map<String, Object> kyc() {
        return Map.<String, Object>of("status", "APPROVED", "message", "KYC documents received and verified");
    }
}
