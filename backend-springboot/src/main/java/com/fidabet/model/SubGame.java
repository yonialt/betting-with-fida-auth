package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sub_games")
public class SubGame {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "match_id", nullable = false, length = 100)
    private String matchId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "extra_markets_count", nullable = false)
    private Integer extraMarketsCount = 0;

    public SubGame() {}

    public SubGame(String id, String matchId, String name, Integer extraMarketsCount) {
        this.id = id;
        this.matchId = matchId;
        this.name = name;
        this.extraMarketsCount = extraMarketsCount != null ? extraMarketsCount : 0;
    }

    public static SubGameBuilder builder() {
        return new SubGameBuilder();
    }

    public static class SubGameBuilder {
        private String id;
        private String matchId;
        private String name;
        private Integer extraMarketsCount = 0;

        public SubGameBuilder id(String id) { this.id = id; return this; }
        public SubGameBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public SubGameBuilder name(String name) { this.name = name; return this; }
        public SubGameBuilder extraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; return this; }

        public SubGame build() {
            return new SubGame(id, matchId, name, extraMarketsCount);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getExtraMarketsCount() { return extraMarketsCount; }
    public void setExtraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; }
}
