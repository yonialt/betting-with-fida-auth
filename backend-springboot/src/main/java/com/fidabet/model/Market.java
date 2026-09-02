package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "markets")
public class Market {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "market_type", length = 50)
    private String marketType;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    public Market() {}

    public Market(String id, String matchId, String name, String marketType, Boolean isLocked, Integer displayOrder) {
        this.id = id;
        this.matchId = matchId;
        this.name = name;
        this.marketType = marketType;
        this.isLocked = isLocked != null ? isLocked : false;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public static MarketBuilder builder() {
        return new MarketBuilder();
    }

    public static class MarketBuilder {
        private String id;
        private String matchId;
        private String name;
        private String marketType;
        private Boolean isLocked = false;
        private Integer displayOrder = 0;

        public MarketBuilder id(String id) { this.id = id; return this; }
        public MarketBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public MarketBuilder name(String name) { this.name = name; return this; }
        public MarketBuilder marketType(String marketType) { this.marketType = marketType; return this; }
        public MarketBuilder isLocked(Boolean isLocked) { this.isLocked = isLocked; return this; }
        public MarketBuilder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }

        public Market build() {
            return new Market(id, matchId, name, marketType, isLocked, displayOrder);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMarketType() { return marketType; }
    public void setMarketType(String marketType) { this.marketType = marketType; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
