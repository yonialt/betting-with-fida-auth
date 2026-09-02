package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "match_code", nullable = false, length = 20)
    private String matchCode;

    @Column(name = "sport_id", nullable = false, length = 50)
    private String sportId;

    @Column(name = "league_id", length = 100)
    private String leagueId;

    @Column(name = "league_name", nullable = false, length = 150)
    private String leagueName;

    @Column(nullable = false, length = 150)
    private String team1;

    @Column(nullable = false, length = 150)
    private String team2;

    @Column(nullable = false)
    private Integer score1 = 0;

    @Column(nullable = false)
    private Integer score2 = 0;

    @Column(name = "time_display", nullable = false, length = 20)
    private String timeDisplay = "00:00";

    @Column(nullable = false)
    private Integer seconds = 0;

    @Column(length = 100)
    private String period;

    @Column(name = "is_live", nullable = false)
    private Boolean isLive = false;

    @Column(name = "has_live_stream", nullable = false)
    private Boolean hasLiveStream = false;

    @Column(length = 150)
    private String venue;

    @Column(length = 150)
    private String referee;

    @Column(name = "current_action", length = 255)
    private String currentAction;

    @Column(name = "extra_markets_count", nullable = false)
    private Integer extraMarketsCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "UPCOMING";

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Match() {}

    public Match(String id, String matchCode, String sportId, String leagueId, String leagueName, String team1, String team2,
                 Integer score1, Integer score2, String timeDisplay, Integer seconds, String period, Boolean isLive,
                 Boolean hasLiveStream, String venue, String referee, String currentAction, Integer extraMarketsCount,
                 String status, LocalDateTime startTime, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.matchCode = matchCode;
        this.sportId = sportId;
        this.leagueId = leagueId;
        this.leagueName = leagueName;
        this.team1 = team1;
        this.team2 = team2;
        this.score1 = score1 != null ? score1 : 0;
        this.score2 = score2 != null ? score2 : 0;
        this.timeDisplay = timeDisplay != null ? timeDisplay : "00:00";
        this.seconds = seconds != null ? seconds : 0;
        this.period = period;
        this.isLive = isLive != null ? isLive : false;
        this.hasLiveStream = hasLiveStream != null ? hasLiveStream : false;
        this.venue = venue;
        this.referee = referee;
        this.currentAction = currentAction;
        this.extraMarketsCount = extraMarketsCount != null ? extraMarketsCount : 0;
        this.status = status != null ? status : "UPCOMING";
        this.startTime = startTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static MatchBuilder builder() {
        return new MatchBuilder();
    }

    public static class MatchBuilder {
        private String id;
        private String matchCode;
        private String sportId;
        private String leagueId;
        private String leagueName;
        private String team1;
        private String team2;
        private Integer score1 = 0;
        private Integer score2 = 0;
        private String timeDisplay = "00:00";
        private Integer seconds = 0;
        private String period;
        private Boolean isLive = false;
        private Boolean hasLiveStream = false;
        private String venue;
        private String referee;
        private String currentAction;
        private Integer extraMarketsCount = 0;
        private String status = "UPCOMING";
        private LocalDateTime startTime;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public MatchBuilder id(String id) { this.id = id; return this; }
        public MatchBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
        public MatchBuilder sportId(String sportId) { this.sportId = sportId; return this; }
        public MatchBuilder leagueId(String leagueId) { this.leagueId = leagueId; return this; }
        public MatchBuilder leagueName(String leagueName) { this.leagueName = leagueName; return this; }
        public MatchBuilder team1(String team1) { this.team1 = team1; return this; }
        public MatchBuilder team2(String team2) { this.team2 = team2; return this; }
        public MatchBuilder score1(Integer score1) { this.score1 = score1; return this; }
        public MatchBuilder score2(Integer score2) { this.score2 = score2; return this; }
        public MatchBuilder timeDisplay(String timeDisplay) { this.timeDisplay = timeDisplay; return this; }
        public MatchBuilder seconds(Integer seconds) { this.seconds = seconds; return this; }
        public MatchBuilder period(String period) { this.period = period; return this; }
        public MatchBuilder isLive(Boolean isLive) { this.isLive = isLive; return this; }
        public MatchBuilder hasLiveStream(Boolean hasLiveStream) { this.hasLiveStream = hasLiveStream; return this; }
        public MatchBuilder venue(String venue) { this.venue = venue; return this; }
        public MatchBuilder referee(String referee) { this.referee = referee; return this; }
        public MatchBuilder currentAction(String currentAction) { this.currentAction = currentAction; return this; }
        public MatchBuilder extraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; return this; }
        public MatchBuilder status(String status) { this.status = status; return this; }
        public MatchBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public MatchBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MatchBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Match build() {
            return new Match(id, matchCode, sportId, leagueId, leagueName, team1, team2, score1, score2, timeDisplay, seconds, period, isLive, hasLiveStream, venue, referee, currentAction, extraMarketsCount, status, startTime, createdAt, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public Integer getScore1() { return score1; }
    public void setScore1(Integer score1) { this.score1 = score1; }

    public Integer getScore2() { return score2; }
    public void setScore2(Integer score2) { this.score2 = score2; }

    public String getTimeDisplay() { return timeDisplay; }
    public void setTimeDisplay(String timeDisplay) { this.timeDisplay = timeDisplay; }

    public Integer getSeconds() { return seconds; }
    public void setSeconds(Integer seconds) { this.seconds = seconds; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }

    public Boolean getHasLiveStream() { return hasLiveStream; }
    public void setHasLiveStream(Boolean hasLiveStream) { this.hasLiveStream = hasLiveStream; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getReferee() { return referee; }
    public void setReferee(String referee) { this.referee = referee; }

    public String getCurrentAction() { return currentAction; }
    public void setCurrentAction(String currentAction) { this.currentAction = currentAction; }

    public Integer getExtraMarketsCount() { return extraMarketsCount; }
    public void setExtraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
