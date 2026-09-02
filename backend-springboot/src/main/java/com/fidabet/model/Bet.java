package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bets")
public class Bet {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "bet_code", unique = true, length = 64)
    private String betCode;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "bet_type", nullable = false, length = 20)
    private String type = "single";

    @Column(name = "total_odds", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalOdds;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal stake;

    @Column(name = "potential_win", nullable = false, precision = 15, scale = 2)
    private BigDecimal potentialWin;

    @Column(nullable = false, length = 10)
    private String currency = "ETB";

    @Column(nullable = false, length = 20)
    private String status = "active";

    @Column(name = "cashout_value", precision = 15, scale = 2)
    private BigDecimal cashoutValue;

    @CreationTimestamp
    @Column(name = "placed_at", nullable = false, updatable = false)
    private LocalDateTime placedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    public Bet() {}

    public Bet(String id, String betCode, String userId, String type, BigDecimal totalOdds, BigDecimal stake,
               BigDecimal potentialWin, String currency, String status, BigDecimal cashoutValue,
               LocalDateTime placedAt, LocalDateTime settledAt) {
        this.id = id;
        this.betCode = betCode;
        this.userId = userId;
        this.type = type != null ? type : "single";
        this.totalOdds = totalOdds;
        this.stake = stake;
        this.potentialWin = potentialWin;
        this.currency = currency != null ? currency : "ETB";
        this.status = status != null ? status : "active";
        this.cashoutValue = cashoutValue;
        this.placedAt = placedAt;
        this.settledAt = settledAt;
    }

    public static BetBuilder builder() {
        return new BetBuilder();
    }

    public static class BetBuilder {
        private String id;
        private String betCode;
        private String userId;
        private String type = "single";
        private BigDecimal totalOdds;
        private BigDecimal stake;
        private BigDecimal potentialWin;
        private String currency = "ETB";
        private String status = "active";
        private BigDecimal cashoutValue;
        private LocalDateTime placedAt;
        private LocalDateTime settledAt;

        public BetBuilder id(String id) { this.id = id; return this; }
        public BetBuilder betCode(String betCode) { this.betCode = betCode; return this; }
        public BetBuilder userId(String userId) { this.userId = userId; return this; }
        public BetBuilder type(String type) { this.type = type; return this; }
        public BetBuilder totalOdds(BigDecimal totalOdds) { this.totalOdds = totalOdds; return this; }
        public BetBuilder stake(BigDecimal stake) { this.stake = stake; return this; }
        public BetBuilder potentialWin(BigDecimal potentialWin) { this.potentialWin = potentialWin; return this; }
        public BetBuilder currency(String currency) { this.currency = currency; return this; }
        public BetBuilder status(String status) { this.status = status; return this; }
        public BetBuilder cashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; return this; }
        public BetBuilder placedAt(LocalDateTime placedAt) { this.placedAt = placedAt; return this; }
        public BetBuilder settledAt(LocalDateTime settledAt) { this.settledAt = settledAt; return this; }

        public Bet build() {
            return new Bet(id, betCode, userId, type, totalOdds, stake, potentialWin, currency, status, cashoutValue, placedAt, settledAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBetCode() { return betCode; }
    public void setBetCode(String betCode) { this.betCode = betCode; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getTotalOdds() { return totalOdds; }
    public void setTotalOdds(BigDecimal totalOdds) { this.totalOdds = totalOdds; }

    public BigDecimal getStake() { return stake; }
    public void setStake(BigDecimal stake) { this.stake = stake; }

    public BigDecimal getPotentialWin() { return potentialWin; }
    public void setPotentialWin(BigDecimal potentialWin) { this.potentialWin = potentialWin; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getCashoutValue() { return cashoutValue; }
    public void setCashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; }

    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
}
