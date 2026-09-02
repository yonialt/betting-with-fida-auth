package com.fidabet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDTOs {

    public static class CreateMatchRequest {
        @NotBlank
        private String matchCode;
        @NotBlank
        private String sportId;
        private String leagueId;
        @NotBlank
        private String leagueName;
        @NotBlank
        private String team1;
        @NotBlank
        private String team2;
        private LocalDateTime startTime;
        private String venue;
        private String referee;

        public CreateMatchRequest() {}

        public CreateMatchRequest(String matchCode, String sportId, String leagueId, String leagueName,
                                  String team1, String team2, LocalDateTime startTime, String venue, String referee) {
            this.matchCode = matchCode;
            this.sportId = sportId;
            this.leagueId = leagueId;
            this.leagueName = leagueName;
            this.team1 = team1;
            this.team2 = team2;
            this.startTime = startTime;
            this.venue = venue;
            this.referee = referee;
        }

        public static CreateMatchRequestBuilder builder() {
            return new CreateMatchRequestBuilder();
        }

        public static class CreateMatchRequestBuilder {
            private String matchCode;
            private String sportId;
            private String leagueId;
            private String leagueName;
            private String team1;
            private String team2;
            private LocalDateTime startTime;
            private String venue;
            private String referee;

            public CreateMatchRequestBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
            public CreateMatchRequestBuilder sportId(String sportId) { this.sportId = sportId; return this; }
            public CreateMatchRequestBuilder leagueId(String leagueId) { this.leagueId = leagueId; return this; }
            public CreateMatchRequestBuilder leagueName(String leagueName) { this.leagueName = leagueName; return this; }
            public CreateMatchRequestBuilder team1(String team1) { this.team1 = team1; return this; }
            public CreateMatchRequestBuilder team2(String team2) { this.team2 = team2; return this; }
            public CreateMatchRequestBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
            public CreateMatchRequestBuilder venue(String venue) { this.venue = venue; return this; }
            public CreateMatchRequestBuilder referee(String referee) { this.referee = referee; return this; }

            public CreateMatchRequest build() {
                return new CreateMatchRequest(matchCode, sportId, leagueId, leagueName, team1, team2, startTime, venue, referee);
            }
        }

        public String getMatchCode() { return matchCode; }
        public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

        public String getSportId() { return sportId; }
        public void setSportId(String sportId) { this.sportId = sportId; }

        public String getLeagueId() { return leagueId; }
        public void setLeagueId(String leagueId) { this.leagueId = leagueId; }

        public String getLeagueName() { return leagueName; }
        public void setLeagueName(String leagueName) { this.leagueName = leagueName; }

        public String getTeam1() { return team1; }
        public void setTeam1(String team1) { this.team1 = team1; }

        public String getTeam2() { return team2; }
        public void setTeam2(String team2) { this.team2 = team2; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public String getVenue() { return venue; }
        public void setVenue(String venue) { this.venue = venue; }

        public String getReferee() { return referee; }
        public void setReferee(String referee) { this.referee = referee; }
    }

    public static class UpdateMatchScoreRequest {
        @NotNull
        private Integer score1;
        @NotNull
        private Integer score2;
        private String timeDisplay;
        private String period;
        private String currentAction;

        public UpdateMatchScoreRequest() {}

        public UpdateMatchScoreRequest(Integer score1, Integer score2, String timeDisplay, String period, String currentAction) {
            this.score1 = score1;
            this.score2 = score2;
            this.timeDisplay = timeDisplay;
            this.period = period;
            this.currentAction = currentAction;
        }

        public Integer getScore1() { return score1; }
        public void setScore1(Integer score1) { this.score1 = score1; }

        public Integer getScore2() { return score2; }
        public void setScore2(Integer score2) { this.score2 = score2; }

        public String getTimeDisplay() { return timeDisplay; }
        public void setTimeDisplay(String timeDisplay) { this.timeDisplay = timeDisplay; }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public String getCurrentAction() { return currentAction; }
        public void setCurrentAction(String currentAction) { this.currentAction = currentAction; }
    }

    public static class UpdateMatchStatusRequest {
        @NotBlank
        private String status;
        private Boolean isLive;

        public UpdateMatchStatusRequest() {}

        public UpdateMatchStatusRequest(String status, Boolean isLive) {
            this.status = status;
            this.isLive = isLive;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Boolean getIsLive() { return isLive; }
        public void setIsLive(Boolean isLive) { this.isLive = isLive; }
    }

    public static class SingleOddsUpdate {
        @NotBlank
        private String oddsId;
        @NotNull
        private BigDecimal value;
        private Boolean isLocked;

        public SingleOddsUpdate() {}

        public SingleOddsUpdate(String oddsId, BigDecimal value, Boolean isLocked) {
            this.oddsId = oddsId;
            this.value = value;
            this.isLocked = isLocked;
        }

        public String getOddsId() { return oddsId; }
        public void setOddsId(String oddsId) { this.oddsId = oddsId; }

        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }

        public Boolean getIsLocked() { return isLocked; }
        public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    }

    public static class BulkOddsUpdateRequest {
        private String matchId;
        private List<SingleOddsUpdate> updates;

        public BulkOddsUpdateRequest() {}

        public BulkOddsUpdateRequest(String matchId, List<SingleOddsUpdate> updates) {
            this.matchId = matchId;
            this.updates = updates;
        }

        public String getMatchId() { return matchId; }
        public void setMatchId(String matchId) { this.matchId = matchId; }

        public List<SingleOddsUpdate> getUpdates() { return updates; }
        public void setUpdates(List<SingleOddsUpdate> updates) { this.updates = updates; }
    }

    public static class AdminUserDto {
        private String id;
        private String username;
        private String email;
        private String phone;
        private BigDecimal balance;
        private BigDecimal bonusBalance;
        private boolean isVerified;
        private boolean isActive;
        private String role;
        private LocalDateTime createdAt;

        public AdminUserDto() {}

        public AdminUserDto(String id, String username, String email, String phone, BigDecimal balance,
                            BigDecimal bonusBalance, boolean isVerified, boolean isActive, String role, LocalDateTime createdAt) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.phone = phone;
            this.balance = balance;
            this.bonusBalance = bonusBalance;
            this.isVerified = isVerified;
            this.isActive = isActive;
            this.role = role;
            this.createdAt = createdAt;
        }

        public static AdminUserDtoBuilder builder() {
            return new AdminUserDtoBuilder();
        }

        public static class AdminUserDtoBuilder {
            private String id;
            private String username;
            private String email;
            private String phone;
            private BigDecimal balance;
            private BigDecimal bonusBalance;
            private boolean isVerified;
            private boolean isActive;
            private String role;
            private LocalDateTime createdAt;

            public AdminUserDtoBuilder id(String id) { this.id = id; return this; }
            public AdminUserDtoBuilder username(String username) { this.username = username; return this; }
            public AdminUserDtoBuilder email(String email) { this.email = email; return this; }
            public AdminUserDtoBuilder phone(String phone) { this.phone = phone; return this; }
            public AdminUserDtoBuilder balance(BigDecimal balance) { this.balance = balance; return this; }
            public AdminUserDtoBuilder bonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; return this; }
            public AdminUserDtoBuilder isVerified(boolean isVerified) { this.isVerified = isVerified; return this; }
            public AdminUserDtoBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
            public AdminUserDtoBuilder role(String role) { this.role = role; return this; }
            public AdminUserDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public AdminUserDto build() {
                return new AdminUserDto(id, username, email, phone, balance, bonusBalance, isVerified, isActive, role, createdAt);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }

        public BigDecimal getBonusBalance() { return bonusBalance; }
        public void setBonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; }

        public boolean isVerified() { return isVerified; }
        public void setVerified(boolean verified) { isVerified = verified; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class AdminReportDto {
        private String date;
        private long totalBets;
        private BigDecimal totalVolume;
        private BigDecimal totalPayout;
        private BigDecimal grossGamingRevenue;
        private long activeUsers;
        private Map<String, Object> additionalMetrics;

        public AdminReportDto() {}

        public AdminReportDto(String date, long totalBets, BigDecimal totalVolume, BigDecimal totalPayout,
                              BigDecimal grossGamingRevenue, long activeUsers, Map<String, Object> additionalMetrics) {
            this.date = date;
            this.totalBets = totalBets;
            this.totalVolume = totalVolume;
            this.totalPayout = totalPayout;
            this.grossGamingRevenue = grossGamingRevenue;
            this.activeUsers = activeUsers;
            this.additionalMetrics = additionalMetrics;
        }

        public static AdminReportDtoBuilder builder() {
            return new AdminReportDtoBuilder();
        }

        public static class AdminReportDtoBuilder {
            private String date;
            private long totalBets;
            private BigDecimal totalVolume;
            private BigDecimal totalPayout;
            private BigDecimal grossGamingRevenue;
            private long activeUsers;
            private Map<String, Object> additionalMetrics;

            public AdminReportDtoBuilder date(String date) { this.date = date; return this; }
            public AdminReportDtoBuilder totalBets(long totalBets) { this.totalBets = totalBets; return this; }
            public AdminReportDtoBuilder totalVolume(BigDecimal totalVolume) { this.totalVolume = totalVolume; return this; }
            public AdminReportDtoBuilder totalPayout(BigDecimal totalPayout) { this.totalPayout = totalPayout; return this; }
            public AdminReportDtoBuilder grossGamingRevenue(BigDecimal grossGamingRevenue) { this.grossGamingRevenue = grossGamingRevenue; return this; }
            public AdminReportDtoBuilder activeUsers(long activeUsers) { this.activeUsers = activeUsers; return this; }
            public AdminReportDtoBuilder additionalMetrics(Map<String, Object> additionalMetrics) { this.additionalMetrics = additionalMetrics; return this; }

            public AdminReportDto build() {
                return new AdminReportDto(date, totalBets, totalVolume, totalPayout, grossGamingRevenue, activeUsers, additionalMetrics);
            }
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public long getTotalBets() { return totalBets; }
        public void setTotalBets(long totalBets) { this.totalBets = totalBets; }

        public BigDecimal getTotalVolume() { return totalVolume; }
        public void setTotalVolume(BigDecimal totalVolume) { this.totalVolume = totalVolume; }

        public BigDecimal getTotalPayout() { return totalPayout; }
        public void setTotalPayout(BigDecimal totalPayout) { this.totalPayout = totalPayout; }

        public BigDecimal getGrossGamingRevenue() { return grossGamingRevenue; }
        public void setGrossGamingRevenue(BigDecimal grossGamingRevenue) { this.grossGamingRevenue = grossGamingRevenue; }

        public long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

        public Map<String, Object> getAdditionalMetrics() { return additionalMetrics; }
        public void setAdditionalMetrics(Map<String, Object> additionalMetrics) { this.additionalMetrics = additionalMetrics; }
    }
}
