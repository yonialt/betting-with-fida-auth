package com.fidabet.controller;

import com.fidabet.dto.AuthDTOs;
import com.fidabet.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDTOs.AuthResponse> register(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        AuthDTOs.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTOs.AuthResponse> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDTOs.AuthResponse> refresh(@Valid @RequestBody AuthDTOs.RefreshTokenRequest request) {
        AuthDTOs.AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody AuthDTOs.ForgotPasswordRequest request) {
        boolean sent = authService.forgotPassword(request.getPhone());
        return ResponseEntity.ok(Map.of(
                "success", sent,
                "message", "OTP sent successfully to " + request.getPhone()
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody AuthDTOs.VerifyOtpRequest request) {
        boolean valid = authService.verifyOtp(request.getPhone(), request.getOtp());
        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "message", valid ? "OTP verified successfully" : "Invalid OTP code"
        ));
    }
}
