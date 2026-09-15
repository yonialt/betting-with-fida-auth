package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

/**
 * Persistent user settings stored in PostgreSQL.
 * Replaces the in-memory Map<String, Object> in SettingsService.
 */
@Entity
@Table(name = "user_settings", indexes = {
        @Index(name = "idx_user_settings_user", columnList = "userId", unique = true)
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class UserSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String oddsFormat = "decimal";

    @Column(length = 10)
    private String language = "en";

    @Column(nullable = false)
    private Boolean soundEffects = true;

    @Column(nullable = false)
    private Boolean autoAcceptOddsChanges = true;

    @Column(nullable = false)
    private Boolean compactView = false;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || HibernateProxy.class.isAssignableFrom(o.getClass())) return false;
        final UserSetting that = (UserSetting) o;
        return Objects.equals(this.getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }
}
