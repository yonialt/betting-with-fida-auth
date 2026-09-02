package com.fidabet.dto;

import java.math.BigDecimal;

public class UserDTOs {

    public static class UserProfileResponse {
        private boolean isLoggedIn;
        private String username;
        private String userId;
        private String email;
        private String phone;
        private BigDecimal balance;
        private String currency;
        private BigDecimal bonusBalance;
        private boolean isVerified;
        private String role;

        public UserProfileResponse() {}

        public UserProfileResponse(boolean isLoggedIn, String username, String userId, String email, String phone,
                                   BigDecimal balance, String currency, BigDecimal bonusBalance, boolean isVerified, String role) {
            this.isLoggedIn = isLoggedIn;
            this.username = username;
            this.userId = userId;
            this.email = email;
            this.phone = phone;
            this.balance = balance;
            this.currency = currency;
            this.bonusBalance = bonusBalance;
            this.isVerified = isVerified;
            this.role = role;
        }

        public static UserProfileResponseBuilder builder() {
            return new UserProfileResponseBuilder();
        }

        public static class UserProfileResponseBuilder {
            private boolean isLoggedIn;
            private String username;
            private String userId;
            private String email;
            private String phone;
            private BigDecimal balance;
            private String currency;
            private BigDecimal bonusBalance;
            private boolean isVerified;
            private String role;

            public UserProfileResponseBuilder isLoggedIn(boolean isLoggedIn) { this.isLoggedIn = isLoggedIn; return this; }
            public UserProfileResponseBuilder username(String username) { this.username = username; return this; }
            public UserProfileResponseBuilder userId(String userId) { this.userId = userId; return this; }
            public UserProfileResponseBuilder email(String email) { this.email = email; return this; }
            public UserProfileResponseBuilder phone(String phone) { this.phone = phone; return this; }
            public UserProfileResponseBuilder balance(BigDecimal balance) { this.balance = balance; return this; }
            public UserProfileResponseBuilder currency(String currency) { this.currency = currency; return this; }
            public UserProfileResponseBuilder bonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; return this; }
            public UserProfileResponseBuilder isVerified(boolean isVerified) { this.isVerified = isVerified; return this; }
            public UserProfileResponseBuilder role(String role) { this.role = role; return this; }

            public UserProfileResponse build() {
                return new UserProfileResponse(isLoggedIn, username, userId, email, phone, balance, currency, bonusBalance, isVerified, role);
            }
        }

        public boolean isLoggedIn() { return isLoggedIn; }
        public void setLoggedIn(boolean loggedIn) { isLoggedIn = loggedIn; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public BigDecimal getBonusBalance() { return bonusBalance; }
        public void setBonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; }

        public boolean isVerified() { return isVerified; }
        public void setVerified(boolean verified) { isVerified = verified; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UpdateProfileRequest {
        private String email;
        private String phone;

        public UpdateProfileRequest() {}
        public UpdateProfileRequest(String email, String phone) {
            this.email = email;
            this.phone = phone;
        }

        public static UpdateProfileRequestBuilder builder() {
            return new UpdateProfileRequestBuilder();
        }

        public static class UpdateProfileRequestBuilder {
            private String email;
            private String phone;

            public UpdateProfileRequestBuilder email(String email) { this.email = email; return this; }
            public UpdateProfileRequestBuilder phone(String phone) { this.phone = phone; return this; }

            public UpdateProfileRequest build() {
                return new UpdateProfileRequest(email, phone);
            }
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class UserSettingsDto {
        private String oddsFormat;
        private String oddsAcceptanceMode;
        private String oddsDisplayMode;
        private boolean notificationsEnabled;
        private String theme;

        public UserSettingsDto() {}
        public UserSettingsDto(String oddsFormat, String oddsAcceptanceMode, String oddsDisplayMode, boolean notificationsEnabled, String theme) {
            this.oddsFormat = oddsFormat;
            this.oddsAcceptanceMode = oddsAcceptanceMode;
            this.oddsDisplayMode = oddsDisplayMode;
            this.notificationsEnabled = notificationsEnabled;
            this.theme = theme;
        }

        public static UserSettingsDtoBuilder builder() {
            return new UserSettingsDtoBuilder();
        }

        public static class UserSettingsDtoBuilder {
            private String oddsFormat;
            private String oddsAcceptanceMode;
            private String oddsDisplayMode;
            private boolean notificationsEnabled;
            private String theme;

            public UserSettingsDtoBuilder oddsFormat(String oddsFormat) { this.oddsFormat = oddsFormat; return this; }
            public UserSettingsDtoBuilder oddsAcceptanceMode(String oddsAcceptanceMode) { this.oddsAcceptanceMode = oddsAcceptanceMode; return this; }
            public UserSettingsDtoBuilder oddsDisplayMode(String oddsDisplayMode) { this.oddsDisplayMode = oddsDisplayMode; return this; }
            public UserSettingsDtoBuilder notificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; return this; }
            public UserSettingsDtoBuilder theme(String theme) { this.theme = theme; return this; }

            public UserSettingsDto build() {
                return new UserSettingsDto(oddsFormat, oddsAcceptanceMode, oddsDisplayMode, notificationsEnabled, theme);
            }
        }

        public String getOddsFormat() { return oddsFormat; }
        public void setOddsFormat(String oddsFormat) { this.oddsFormat = oddsFormat; }

        public String getOddsAcceptanceMode() { return oddsAcceptanceMode; }
        public void setOddsAcceptanceMode(String oddsAcceptanceMode) { this.oddsAcceptanceMode = oddsAcceptanceMode; }

        public String getOddsDisplayMode() { return oddsDisplayMode; }
        public void setOddsDisplayMode(String oddsDisplayMode) { this.oddsDisplayMode = oddsDisplayMode; }

        public boolean isNotificationsEnabled() { return notificationsEnabled; }
        public void setNotificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
    }
}
