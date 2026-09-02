package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_events")
public class MatchEvent {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @Column(name = "event_minute", nullable = false)
    private Integer minute;

    @Column(name = "event_type", nullable = false, length = 20)
    private String type;

    @Column(name = "event_text", nullable = false, length = 255)
    private String text;

    @Column(name = "team_side", nullable = false)
    private Integer team;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public MatchEvent() {}

    public MatchEvent(String id, String matchId, Integer minute, String type, String text, Integer team, LocalDateTime createdAt) {
        this.id = id;
        this.matchId = matchId;
        this.minute = minute;
        this.type = type;
        this.text = text;
        this.team = team;
        this.createdAt = createdAt;
    }

    public static MatchEventBuilder builder() {
        return new MatchEventBuilder();
    }

    public static class MatchEventBuilder {
        private String id;
        private String matchId;
        private Integer minute;
        private String type;
        private String text;
        private Integer team;
        private LocalDateTime createdAt;

        public MatchEventBuilder id(String id) { this.id = id; return this; }
        public MatchEventBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public MatchEventBuilder minute(Integer minute) { this.minute = minute; return this; }
        public MatchEventBuilder type(String type) { this.type = type; return this; }
        public MatchEventBuilder text(String text) { this.text = text; return this; }
        public MatchEventBuilder team(Integer team) { this.team = team; return this; }
        public MatchEventBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MatchEvent build() {
            return new MatchEvent(id, matchId, minute, type, text, team, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public Integer getMinute() { return minute; }
    public void setMinute(Integer minute) { this.minute = minute; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Integer getTeam() { return team; }
    public void setTeam(Integer team) { this.team = team; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
