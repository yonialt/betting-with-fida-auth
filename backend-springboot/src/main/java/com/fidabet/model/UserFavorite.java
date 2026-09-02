package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "match_id"})
})
public class UserFavorite {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public UserFavorite() {}

    public UserFavorite(String id, String userId, String matchId, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.matchId = matchId;
        this.createdAt = createdAt;
    }

    public static UserFavoriteBuilder builder() {
        return new UserFavoriteBuilder();
    }

    public static class UserFavoriteBuilder {
        private String id;
        private String userId;
        private String matchId;
        private LocalDateTime createdAt;

        public UserFavoriteBuilder id(String id) { this.id = id; return this; }
        public UserFavoriteBuilder userId(String userId) { this.userId = userId; return this; }
        public UserFavoriteBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public UserFavoriteBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public UserFavorite build() {
            return new UserFavorite(id, userId, matchId, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
