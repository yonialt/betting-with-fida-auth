package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

/**
 * Backend registry of tradable prediction markets. The trading service validates
 * every incoming order against this registry (market exists, side is a valid
 * outcome, market is OPEN) before touching the wallet — orders for unknown or
 * closed markets are rejected.
 *
 * Rows are upserted lazily from trusted order payloads and managed through the
 * Polymarket admin editor (/api/polymarket-admin/data), so the markets shown in
 * the UI are exactly the markets the backend will accept trades on.
 */
@Entity
@Table(name = "pm_market_registry")
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class PmMarketRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Frontend market identifier (unique). */
    @Column(name = "marketId", nullable = false, unique = true, length = 120)
    private String marketId;

    @Column(nullable = false, length = 300)
    private String marketTitle;

    @Column(length = 60)
    private String category;

    /** OPEN | CLOSED | RESOLVED_YES | RESOLVED_NO */
    @Column(nullable = false, length = 20)
    private String status;

    /** true when the market supports both YES and NO outcomes. */
    @Column(nullable = false)
    private boolean binaryOutcomes = true;

    /** Optional display name for the YES outcome (multi-outcome markets). */
    @Column(length = 120)
    private String yesOutcomeName;

    /** Optional display name for the NO outcome. */
    @Column(length = 120)
    private String noOutcomeName;

    @Column(nullable = false)
    private Instant registeredAt;

    private Instant resolvedAt;

    /** Winning side after resolution ('yes' | 'no' | null). */
    @Column(length = 10)
    private String winningSide;

    /** Current YES price in cents (1..99). NO price is always 100 − YES. */
    @Column(name = "lastPriceCents")
    private Integer lastPriceCents;

    /** When the price last moved (trade impact or scheduled tick). */
    private Instant lastPriceChangedAt;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PmMarketRegistry)) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy
                ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
                : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
                : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        PmMarketRegistry that = (PmMarketRegistry) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}
