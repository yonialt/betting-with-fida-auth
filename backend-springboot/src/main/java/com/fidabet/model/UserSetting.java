package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class UserSetting {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 36)
    private String userId;

    @Column(name = "odds_format", nullable = false, length = 20)
    private String oddsFormat = "decimal";

    @Column(name = "odds_acceptance_mode", nullable = false, length = 20)
    private String oddsAcceptanceMode = "increase";

    @Column(name = "odds_display_mode", nullable = false, length = 20)
    private String oddsDisplayMode = "simple";

    @Column(name = "notifications_enabled", nullable = false)
    private Boolean notificationsEnabled = true;

    @Column(nullable = false, length = 20)
    private String theme = "dark";

    public UserSetting() {}

    public UserSetting(String id, String userId, String oddsFormat, String oddsAcceptanceMode, String oddsDisplayMode, Boolean notificationsEnabled, String theme) {
        this.id = id;
        this.userId = userId;
        this.oddsFormat = oddsFormat != null ? oddsFormat : "decimal";
        this.oddsAcceptanceMode = oddsAcceptanceMode != null ? oddsAcceptanceMode : "increase";
        this.oddsDisplayMode = oddsDisplayMode != null ? oddsDisplayMode : "simple";
        this.notificationsEnabled = notificationsEnabled != null ? notificationsEnabled : true;
        this.theme = theme != null ? theme : "dark";
    }

    public static UserSettingBuilder builder() {
        return new UserSettingBuilder();
    }

    public static class UserSettingBuilder {
        private String id;
        private String userId;
        private String oddsFormat = "decimal";
        private String oddsAcceptanceMode = "increase";
        private String oddsDisplayMode = "simple";
        private Boolean notificationsEnabled = true;
        private String theme = "dark";

        public UserSettingBuilder id(String id) { this.id = id; return this; }
        public UserSettingBuilder userId(String userId) { this.userId = userId; return this; }
        public UserSettingBuilder oddsFormat(String oddsFormat) { this.oddsFormat = oddsFormat; return this; }
        public UserSettingBuilder oddsAcceptanceMode(String oddsAcceptanceMode) { this.oddsAcceptanceMode = oddsAcceptanceMode; return this; }
        public UserSettingBuilder oddsDisplayMode(String oddsDisplayMode) { this.oddsDisplayMode = oddsDisplayMode; return this; }
        public UserSettingBuilder notificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; return this; }
        public UserSettingBuilder theme(String theme) { this.theme = theme; return this; }

        public UserSetting build() {
            return new UserSetting(id, userId, oddsFormat, oddsAcceptanceMode, oddsDisplayMode, notificationsEnabled, theme);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOddsFormat() { return oddsFormat; }
    public void setOddsFormat(String oddsFormat) { this.oddsFormat = oddsFormat; }

    public String getOddsAcceptanceMode() { return oddsAcceptanceMode; }
    public void setOddsAcceptanceMode(String oddsAcceptanceMode) { this.oddsAcceptanceMode = oddsAcceptanceMode; }

    public String getOddsDisplayMode() { return oddsDisplayMode; }
    public void setOddsDisplayMode(String oddsDisplayMode) { this.oddsDisplayMode = oddsDisplayMode; }

    public Boolean getNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(Boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
