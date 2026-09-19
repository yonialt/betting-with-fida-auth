package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A prediction-market position: shares of one outcome in one market, bought or
 * sold through the trading panel. One row per (user, market, side).
 *
 * Lifecycle:
 *  OPEN    — live exposure; buys/sells adjust shares and cost basis
 *  WON     — market resolved in the position's favour; shares paid at 1.00 each
 *  LOST    — market resolved against the position; shares written off
 *  CLOSED  — fully sold before resolution
 *
 * Entirely separate from the sportsbook Bet/BetItem pipeline: no odds accumulator
 * math, no bet slip. Avg price is stored in cents (1-99).
 */
@Entity
@Table(name = "pm_positions", indexes = {
        @Index(name = "idx_pm_pos_user", columnList = "userId"),
        @Index(name = "idx_pm_pos_market", columnList = "marketId"),
        @Index(name = "idx_pm_pos_status", columnList = "status"),
        @Index(name = "idx_pm_pos_opened", columnList = "openedAt")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_pm_pos_user_market_side", columnNames = {"userId", "marketId", "side"})
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class PmPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    /** Frontend market identifier (e.g. "fed-rates-october"). */
    @Column(name = "marketId", nullable = false, length = 120)
    private String marketId;

    /** Denormalized market question for display without a join. */
    @Column(nullable = false, length = 300)
    private String marketTitle;

    @Column(length = 60)
    private String category;

    /** 'yes' | 'no' */
    @Column(nullable = false, length = 10)
    private String side;

    /** Outcome display name ('Yes' / 'No' or a candidate name for multi-outcome markets). */
    @Column(nullable = false, length = 120)
    private String outcomeName;

    /** Open shares. */
    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal shares;

    /** Volume-weighted average entry price in cents (1-99). */
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal avgPriceCents;

    /** Total ETB spent net of sell proceeds. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal costBasis;

    /** Latest price seen when adding or selling. */
    @Column(precision = 6, scale = 2)
    private BigDecimal lastPriceCents;

    /** Realized P/L banked by partial sells (sum over closed lots). */
    @Column(precision = 14, scale = 2)
    private BigDecimal realizedPnl;

    /** open | won | lost | closed */
    @Column(nullable = false, length = 12)
    private String status;

    @Column(nullable = false)
    private Instant openedAt;

    private Instant resolvedAt;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PmPosition)) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy
                ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
                : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
                : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        PmPosition that = (PmPosition) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}
