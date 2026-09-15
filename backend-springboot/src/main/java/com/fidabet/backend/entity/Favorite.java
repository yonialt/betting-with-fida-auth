package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

/**
 * Persistent favorite match stored in PostgreSQL.
 * Replaces the in-memory Set<String> in FavouritesService.
 */
@Entity
@Table(name = "favorites", indexes = {
        @Index(name = "idx_favorites_user", columnList = "userId"),
        @Index(name = "idx_favorites_match", columnList = "matchId"),
        @Index(name = "idx_favorites_user_match", columnList = "userId, matchId", unique = true)
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String matchId;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final Favorite favorite = (Favorite) o;
        return Objects.equals(getUserId(), favorite.getUserId()) &&
                Objects.equals(getMatchId(), favorite.getMatchId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(getUserId(), getMatchId());
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}
