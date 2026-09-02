package com.fidabet.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bet_selections")
public class BetSelection {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "bet_id", nullable = false, length = 64)
    private String betId;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @Column(name = "match_code", length = 20)
    private String matchCode;

    @Column(length = 150)
    private String league;

    @Column(name = "match_title", length = 255)
    private String matchTitle;

    @Column(name = "current_score", length = 50)
    private String currentScore;

    @Column(name = "market_name", length = 100)
    private String marketName;

    @Column(name = "selection_name", length = 150)
    private String selectionName;

    @Column(name = "selection_label", length = 50)
    private String selectionLabel;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal odds;

    @Column(name = "is_live", nullable = false)
    private Boolean isLive = false;

    @Column(nullable = false, length = 20)
    private String outcome = "PENDING";

    public BetSelection() {}

    public BetSelection(String id, String betId, String matchId, String matchCode, String league, String matchTitle,
                        String currentScore, String marketName, String selectionName, String selectionLabel,
                        BigDecimal odds, Boolean isLive, String outcome) {
        this.id = id;
        this.betId = betId;
        this.matchId = matchId;
        this.matchCode = matchCode;
        this.league = league;
        this.matchTitle = matchTitle;
        this.currentScore = currentScore;
        this.marketName = marketName;
        this.selectionName = selectionName;
        this.selectionLabel = selectionLabel;
        this.odds = odds;
        this.isLive = isLive != null ? isLive : false;
        this.outcome = outcome != null ? outcome : "PENDING";
    }

    public static BetSelectionBuilder builder() {
        return new BetSelectionBuilder();
    }

    public static class BetSelectionBuilder {
        private String id;
        private String betId;
        private String matchId;
        private String matchCode;
        private String league;
        private String matchTitle;
        private String currentScore;
        private String marketName;
        private String selectionName;
        private String selectionLabel;
        private BigDecimal odds;
        private Boolean isLive = false;
        private String outcome = "PENDING";

        public BetSelectionBuilder id(String id) { this.id = id; return this; }
        public BetSelectionBuilder betId(String betId) { this.betId = betId; return this; }
        public BetSelectionBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public BetSelectionBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
        public BetSelectionBuilder league(String league) { this.league = league; return this; }
        public BetSelectionBuilder matchTitle(String matchTitle) { this.matchTitle = matchTitle; return this; }
        public BetSelectionBuilder currentScore(String currentScore) { this.currentScore = currentScore; return this; }
        public BetSelectionBuilder marketName(String marketName) { this.marketName = marketName; return this; }
        public BetSelectionBuilder selectionName(String selectionName) { this.selectionName = selectionName; return this; }
        public BetSelectionBuilder selectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; return this; }
        public BetSelectionBuilder odds(BigDecimal odds) { this.odds = odds; return this; }
        public BetSelectionBuilder isLive(Boolean isLive) { this.isLive = isLive; return this; }
        public BetSelectionBuilder outcome(String outcome) { this.outcome = outcome; return this; }

        public BetSelection build() {
            return new BetSelection(id, betId, matchId, matchCode, league, matchTitle, currentScore, marketName, selectionName, selectionLabel, odds, isLive, outcome);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBetId() { return betId; }
    public void setBetId(String betId) { this.betId = betId; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public String getMatchCode() { return matchCode; }
    public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

    public String getLeague() { return league; }
    public void setLeague(String league) { this.league = league; }

    public String getMatchTitle() { return matchTitle; }
    public void setMatchTitle(String matchTitle) { this.matchTitle = matchTitle; }

    public String getCurrentScore() { return currentScore; }
    public void setCurrentScore(String currentScore) { this.currentScore = currentScore; }

    public String getMarketName() { return marketName; }
    public void setMarketName(String marketName) { this.marketName = marketName; }

    public String getSelectionName() { return selectionName; }
    public void setSelectionName(String selectionName) { this.selectionName = selectionName; }

    public String getSelectionLabel() { return selectionLabel; }
    public void setSelectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; }

    public BigDecimal getOdds() { return odds; }
    public void setOdds(BigDecimal odds) { this.odds = odds; }

    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
}
