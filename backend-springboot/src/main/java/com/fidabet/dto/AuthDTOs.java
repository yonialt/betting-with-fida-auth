package com.fidabet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;

        private String email;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        public RegisterRequest() {}

        public RegisterRequest(String username, String email, String phone, String password) {
            this.username = username;
            this.email = email;
            this.phone = phone;
            this.password = password;
        }

        public static RegisterRequestBuilder builder() {
            return new RegisterRequestBuilder();
        }

        public static class RegisterRequestBuilder {
            private String username;
            private String email;
            private String phone;
            private String password;

            public RegisterRequestBuilder username(String username) { this.username = username; return this; }
            public RegisterRequestBuilder email(String email) { this.email = email; return this; }
            public RegisterRequestBuilder phone(String phone) { this.phone = phone; return this; }
            public RegisterRequestBuilder password(String password) { this.password = password; return this; }

            public RegisterRequest build() {
                return new RegisterRequest(username, email, phone, password);
            }
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Username or phone is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public static LoginRequestBuilder builder() {
            return new LoginRequestBuilder();
        }

        public static class LoginRequestBuilder {
            private String username;
            private String password;

            public LoginRequestBuilder username(String username) { this.username = username; return this; }
            public LoginRequestBuilder password(String password) { this.password = password; return this; }

            public LoginRequest build() {
                return new LoginRequest(username, password);
            }
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserDTOs.UserProfileResponse user;

        public AuthResponse() {}

        public AuthResponse(String token, String refreshToken, String tokenType, long expiresIn, UserDTOs.UserProfileResponse user) {
            this.token = token;
            this.refreshToken = refreshToken;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
            this.user = user;
        }

        public static AuthResponseBuilder builder() {
            return new AuthResponseBuilder();
        }

        public static class AuthResponseBuilder {
            private String token;
            private String refreshToken;
            private String tokenType;
            private long expiresIn;
            private UserDTOs.UserProfileResponse user;

            public AuthResponseBuilder token(String token) { this.token = token; return this; }
            public AuthResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
            public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
            public AuthResponseBuilder expiresIn(long expiresIn) { this.expiresIn = expiresIn; return this; }
            public AuthResponseBuilder user(UserDTOs.UserProfileResponse user) { this.user = user; return this; }

            public AuthResponse build() {
                return new AuthResponse(token, refreshToken, tokenType, expiresIn, user);
            }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }

        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

        public UserDTOs.UserProfileResponse getUser() { return user; }
        public void setUser(UserDTOs.UserProfileResponse user) { this.user = user; }
    }

    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public RefreshTokenRequest() {}
        public RefreshTokenRequest(String refreshToken) { this.refreshToken = refreshToken; }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        public ForgotPasswordRequest() {}
        public ForgotPasswordRequest(String phone) { this.phone = phone; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class VerifyOtpRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "OTP code is required")
        private String otp;

        public VerifyOtpRequest() {}
        public VerifyOtpRequest(String phone, String otp) {
            this.phone = phone;
            this.otp = otp;
        }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class KycRequest {
        @NotBlank(message = "Document type is required")
        private String documentType;

        @NotBlank(message = "Document number is required")
        private String documentNumber;

        private String fileUrl;

        public KycRequest() {}
        public KycRequest(String documentType, String documentNumber, String fileUrl) {
            this.documentType = documentType;
            this.documentNumber = documentNumber;
            this.fileUrl = fileUrl;
        }

        public static KycRequestBuilder builder() {
            return new KycRequestBuilder();
        }

        public static class KycRequestBuilder {
            private String documentType;
            private String documentNumber;
            private String fileUrl;

            public KycRequestBuilder documentType(String documentType) { this.documentType = documentType; return this; }
            public KycRequestBuilder documentNumber(String documentNumber) { this.documentNumber = documentNumber; return this; }
            public KycRequestBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }

            public KycRequest build() {
                return new KycRequest(documentType, documentNumber, fileUrl);
            }
        }

        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }

        public String getDocumentNumber() { return documentNumber; }
        public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    }
}
