package com.fidabet.controller;

import com.fidabet.dto.AuthDTOs;
import com.fidabet.dto.UserDTOs;
import com.fidabet.model.KycDocument;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.AuthService;
import com.fidabet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTOs.UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserDTOs.UserProfileResponse profile = userService.getProfile(principal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTOs.UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserDTOs.UpdateProfileRequest request) {
        UserDTOs.UserProfileResponse updated = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/kyc")
    public ResponseEntity<KycDocument> submitKyc(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AuthDTOs.KycRequest request) {
        KycDocument document = authService.submitKyc(principal.getId(), request);
        return ResponseEntity.ok(document);
    }
}
