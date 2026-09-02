package com.fidabet.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "odds")
public class Odds {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @Column(name = "market_id", length = 100)
    private String marketId;

    @Column(name = "sub_game_id", length = 100)
    private String subGameId;

    @Column(name = "market_name", nullable = false, length = 100)
    private String marketName;

    @Column(name = "selection_key", nullable = false, length = 50)
    private String selectionKey;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "odds_value", nullable = false, precision = 8, scale = 3)
    private BigDecimal value;

    @Column(name = "previous_value", precision = 8, scale = 3)
    private BigDecimal previousValue;

    @Column(nullable = false, length = 10)
    private String trend = "same";

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "last_updated")
    private Long lastUpdated;

    public Odds() {}

    public Odds(String id, String matchId, String marketId, String subGameId, String marketName, String selectionKey,
                String label, String name, BigDecimal value, BigDecimal previousValue, String trend, Boolean isLocked,
                Long version, Long lastUpdated) {
        this.id = id;
        this.matchId = matchId;
        this.marketId = marketId;
        this.subGameId = subGameId;
        this.marketName = marketName;
        this.selectionKey = selectionKey;
        this.label = label;
        this.name = name;
        this.value = value;
        this.previousValue = previousValue;
        this.trend = trend != null ? trend : "same";
        this.isLocked = isLocked != null ? isLocked : false;
        this.version = version != null ? version : 0L;
        this.lastUpdated = lastUpdated;
    }

    public static OddsBuilder builder() {
        return new OddsBuilder();
    }

    public static class OddsBuilder {
        private String id;
        private String matchId;
        private String marketId;
        private String subGameId;
        private String marketName;
        private String selectionKey;
        private String label;
        private String name;
        private BigDecimal value;
        private BigDecimal previousValue;
        private String trend = "same";
        private Boolean isLocked = false;
        private Long version = 0L;
        private Long lastUpdated;

        public OddsBuilder id(String id) { this.id = id; return this; }
        public OddsBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public OddsBuilder marketId(String marketId) { this.marketId = marketId; return this; }
        public OddsBuilder subGameId(String subGameId) { this.subGameId = subGameId; return this; }
        public OddsBuilder marketName(String marketName) { this.marketName = marketName; return this; }
        public OddsBuilder selectionKey(String selectionKey) { this.selectionKey = selectionKey; return this; }
        public OddsBuilder label(String label) { this.label = label; return this; }
        public OddsBuilder name(String name) { this.name = name; return this; }
        public OddsBuilder value(BigDecimal value) { this.value = value; return this; }
        public OddsBuilder previousValue(BigDecimal previousValue) { this.previousValue = previousValue; return this; }
        public OddsBuilder trend(String trend) { this.trend = trend; return this; }
        public OddsBuilder isLocked(Boolean isLocked) { this.isLocked = isLocked; return this; }
        public OddsBuilder version(Long version) { this.version = version; return this; }
        public OddsBuilder lastUpdated(Long lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public Odds build() {
            return new Odds(id, matchId, marketId, subGameId, marketName, selectionKey, label, name, value, previousValue, trend, isLocked, version, lastUpdated);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public String getMarketId() { return marketId; }
    public void setMarketId(String marketId) { this.marketId = marketId; }

    public String getSubGameId() { return subGameId; }
    public void setSubGameId(String subGameId) { this.subGameId = subGameId; }

    public String getMarketName() { return marketName; }
    public void setMarketName(String marketName) { this.marketName = marketName; }

    public String getSelectionKey() { return selectionKey; }
    public void setSelectionKey(String selectionKey) { this.selectionKey = selectionKey; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }

    public BigDecimal getPreviousValue() { return previousValue; }
    public void setPreviousValue(BigDecimal previousValue) { this.previousValue = previousValue; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public Long getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Long lastUpdated) { this.lastUpdated = lastUpdated; }
}
