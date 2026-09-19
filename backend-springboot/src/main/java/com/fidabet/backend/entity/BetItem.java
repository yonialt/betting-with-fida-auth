package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Persistent bet slip item stored in PostgreSQL.
 * Part of the Bet entity hierarchy.
 */
@Entity
@Table(name = "bet_items", indexes = {
        @Index(name = "idx_bet_items_bet", columnList = "betId")
})
@Getter
@Setter
@ToString(exclude = "bet")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class BetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "betId", nullable = false)
    private Bet bet;

    @Column(nullable = false, length = 50)
    private String itemId;

    @Column(length = 50)
    private String matchId;

    @Column(length = 20)
    private String matchCode;

    @Column(length = 200)
    private String league;

    @Column(length = 200)
    private String matchTitle;

    @Column(length = 20)
    private String currentScore;

    @Column(length = 100)
    private String marketName;

    @Column(length = 200)
    private String selectionName;

    @Column(length = 50)
    private String selectionLabel;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal odds;

    @Column
    private Boolean isLive;

    @Column(precision = 12, scale = 2)
    private BigDecimal stake;

    /** Match kickoff time (ISO-8601), captured at placement. Used to prove the
     *  match has actually started before settlement is allowed to run. */
    @Column
    private Instant startTime;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final BetItem betItem = (BetItem) o;
        return Objects.equals(this.getId(), betItem.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }
}
