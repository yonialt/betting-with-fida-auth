package com.fidabet.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Persistent wallet transaction record stored in PostgreSQL.
 * Replaces the in-memory Transaction list in WalletService.
 */
@Entity
@Table(name = "wallet_transactions", indexes = {
        @Index(name = "idx_wallet_tx_user", columnList = "userId"),
        @Index(name = "idx_wallet_tx_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@ToString
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 50)
    private String paymentMethod;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(length = 100)
    private String transactionReference;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final WalletTransaction that = (WalletTransaction) o;
        return Objects.equals(this.getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(this.getId());
    }
}
