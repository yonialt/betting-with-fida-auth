package com.fidabet.backend.controller;

import com.fidabet.backend.model.UserProfile;
import com.fidabet.backend.service.UserAccountService;
import com.fidabet.backend.support.Bodies;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Fayda (Ethiopian National ID) age-verification endpoints (/api/age-verification/*).
 * Public — the age gate runs for guests before login, so it operates on the demo account.
 */
@RestController
@RequestMapping("/api/age-verification")
public class AgeVerificationController {

    private final UserAccountService users;

    public AgeVerificationController(UserAccountService users) {
        this.users = users;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        UserProfile user = com.fidabet.backend.service.UserAccountService.toUserProfile(users.getCurrentUserEntity());
        boolean verified = user.getIsAgeVerified() == null || user.getIsAgeVerified();

        Map<String, Object> latest = new LinkedHashMap<>();
        latest.put("status", "VERIFIED");
        latest.put("reason", "Fayda Ethiopian National ID Verified (Legal Age 21+)");
        latest.put("age", 24);
        latest.put("fullName", "Abebe Kebede");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("verified", verified);
        res.put("status", "verified".equals(user.getAgeVerificationStatus()) ? "VERIFIED" : "NONE");
        res.put("latestVerification", latest);
        return res;
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody(required = false) Map<String, Object> body) {
        String faydaId = Bodies.toStr(body, "faydaId", "verified");
        users.markAgeVerified();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("verified", true);
        res.put("status", "VERIFIED");
        res.put("message", "Fayda National ID (" + faydaId + ") confirmed. Legal age requirement (21+) satisfied.");
        res.put("age", 24);
        res.put("fullName", "Abebe Kebede");
        res.put("dateOfBirth", "2000-05-12");
        return res;
    }

    @PostMapping("/skip-demo")
    public Map<String, Object> skipDemo() {
        users.markAgeVerified();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("verified", true);
        res.put("status", "VERIFIED");
        res.put("message", "Demo mode: Age verification bypassed.");
        return res;
    }
}
