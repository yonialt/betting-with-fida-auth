package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * One executed prediction-market trade. Append-only ledger — never updated.
 * Every confirmed order (buy/sell) and every resolution payout writes exactly one
 * row; this is the Activity feed.
 */
@Entity
@Table(name = "pm_trades", indexes = {
        @Index(name = "idx_pm_trade_user", columnList = "userId"),
        @Index(name = "idx_pm_trade_market", columnList = "marketId"),
        @Index(name = "idx_pm_trade_at", columnList = "executedAt")
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class PmTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(name = "marketId", nullable = false, length = 120)
    private String marketId;

    @Column(nullable = false, length = 300)
    private String marketTitle;

    @Column(length = 60)
    private String category;

    /** 'yes' | 'no' */
    @Column(nullable = false, length = 10)
    private String side;

    /** Outcome display name at execution time. */
    @Column(nullable = false, length = 120)
    private String outcomeName;

    /** BUY | SELL | RESOLVE_WIN | RESOLVE_LOSS */
    @Column(nullable = false, length = 14)
    private String action;

    /** Shares traded (or paid out on resolution). */
    @Column(nullable = false, precision = 18, scale = 4)
    private BigDecimal shares;

    /** Execution price in cents (null for RESOLVE_LOSS). */
    @Column(precision = 6, scale = 2)
    private BigDecimal priceCents;

    /** ETB value: cost (BUY), proceeds (SELL), payout (RESOLVE_WIN), 0 (RESOLVE_LOSS). */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    /** Server-generated reference, e.g. PM-482913. */
    @Column(nullable = false, unique = true, length = 40)
    private String reference;

    @Column(nullable = false)
    private Instant executedAt;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PmTrade)) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy
                ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
                : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
                : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        PmTrade that = (PmTrade) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy
                ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}
