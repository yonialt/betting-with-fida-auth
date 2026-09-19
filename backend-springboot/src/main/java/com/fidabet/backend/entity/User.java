package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Persistent user account stored in PostgreSQL.
 * Replaces the in-memory UserProfile state in UserAccountService.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_username", columnList = "username", unique = true),
        @Index(name = "idx_users_phone", columnList = "phone")
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Builder.Default
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal bonusBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String currency = "ETB";

    @Builder.Default
    @Column(nullable = false)
    private Boolean isLoggedIn = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isAgeVerified = false;

    @Column(length = 20)
    private String ageVerificationStatus;

    /** Profile picture (data URL, downscaled client-side; ~<= 100 KB). */
    @Column(length = 400_000)
    @Builder.Default
    private String avatarUrl = null;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || HibernateProxy.class.isAssignableFrom(o.getClass())) return false;
        final User user = (User) o;
        return Objects.equals(this.getId(), user.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }

    /** Two-decimal rounding helper for balance mutations (never leaves floating residue in storage). */
    public static BigDecimal round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
