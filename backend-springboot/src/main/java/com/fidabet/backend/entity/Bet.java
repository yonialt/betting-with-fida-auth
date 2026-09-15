package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Persistent placed bet stored in PostgreSQL.
 * Replaces the in-memory PlacedBet list in BetService.
 */
@Entity
@Table(name = "bets", indexes = {
        @Index(name = "idx_bets_user", columnList = "userId"),
        @Index(name = "idx_bets_status", columnList = "status"),
        @Index(name = "idx_bets_placed_at", columnList = "placedAt")
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String betId;

    @Column(nullable = false, length = 20)
    private String type;

    @OneToMany(mappedBy = "bet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BetItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal totalOdds;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stake;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal potentialWin;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(precision = 12, scale = 2)
    private BigDecimal cashoutValue;

    @Column(nullable = false)
    private Instant placedAt;

    @Column
    private Instant settledAt;

    @PrePersist
    protected void onCreate() {
        if (placedAt == null) {
            placedAt = Instant.now();
        }
    }

    public void addItem(BetItem item) {
        items.add(item);
        item.setBet(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final Bet bet = (Bet) o;
        return Objects.equals(this.getId(), bet.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }
}
