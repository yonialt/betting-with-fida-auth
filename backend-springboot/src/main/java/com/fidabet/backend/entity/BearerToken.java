package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

/**
 * Persistent bearer token stored in PostgreSQL.
 * Replaces the in-memory Set<String> in TokenService.
 * Enables token revocation on logout.
 */
@Entity
@Table(name = "bearer_tokens", indexes = {
        @Index(name = "idx_bearer_token_token", columnList = "token", unique = true),
        @Index(name = "idx_bearer_token_user", columnList = "userId"),
        @Index(name = "idx_bearer_token_expires", columnList = "expiresAt")
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class BearerToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Column(nullable = false)
    private Boolean isValid = true;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (expiresAt == null) {
            expiresAt = createdAt.plusSeconds(86400); // 24 hours default
        }
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValidToken() {
        return isValid && !isExpired();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final BearerToken that = (BearerToken) o;
        return Objects.equals(this.getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }
}
