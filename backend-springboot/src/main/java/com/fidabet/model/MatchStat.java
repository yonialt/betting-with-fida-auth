package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "match_stats")
public class MatchStat {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "match_id", nullable = false, unique = true, length = 100)
    private String matchId;

    @Column(name = "possession_team1")
    private Integer possessionTeam1 = 50;

    @Column(name = "possession_team2")
    private Integer possessionTeam2 = 50;

    @Column(name = "shots_on_target_team1")
    private Integer shotsOnTargetTeam1 = 0;

    @Column(name = "shots_on_target_team2")
    private Integer shotsOnTargetTeam2 = 0;

    @Column(name = "shots_off_target_team1")
    private Integer shotsOffTargetTeam1 = 0;

    @Column(name = "shots_off_target_team2")
    private Integer shotsOffTargetTeam2 = 0;

    @Column(name = "corners_team1")
    private Integer cornersTeam1 = 0;

    @Column(name = "corners_team2")
    private Integer cornersTeam2 = 0;

    @Column(name = "yellow_cards_team1")
    private Integer yellowCardsTeam1 = 0;

    @Column(name = "yellow_cards_team2")
    private Integer yellowCardsTeam2 = 0;

    @Column(name = "red_cards_team1")
    private Integer redCardsTeam1 = 0;

    @Column(name = "red_cards_team2")
    private Integer redCardsTeam2 = 0;

    @Column(name = "fouls_team1")
    private Integer foulsTeam1 = 0;

    @Column(name = "fouls_team2")
    private Integer foulsTeam2 = 0;

    @Column(name = "attacks_team1")
    private Integer attacksTeam1 = 0;

    @Column(name = "attacks_team2")
    private Integer attacksTeam2 = 0;

    @Column(name = "dangerous_attacks_team1")
    private Integer dangerousAttacksTeam1 = 0;

    @Column(name = "dangerous_attacks_team2")
    private Integer dangerousAttacksTeam2 = 0;

    @Column(name = "set_scores_json", columnDefinition = "TEXT")
    private String setScoresJson;

    @Column(name = "current_points", length = 20)
    private String currentPoints;

    public MatchStat() {}

    public MatchStat(String id, String matchId, Integer possessionTeam1, Integer possessionTeam2,
                     Integer shotsOnTargetTeam1, Integer shotsOnTargetTeam2, Integer shotsOffTargetTeam1,
                     Integer shotsOffTargetTeam2, Integer cornersTeam1, Integer cornersTeam2,
                     Integer yellowCardsTeam1, Integer yellowCardsTeam2, Integer redCardsTeam1, Integer redCardsTeam2,
                     Integer foulsTeam1, Integer foulsTeam2, Integer attacksTeam1, Integer attacksTeam2,
                     Integer dangerousAttacksTeam1, Integer dangerousAttacksTeam2, String setScoresJson, String currentPoints) {
        this.id = id;
        this.matchId = matchId;
        this.possessionTeam1 = possessionTeam1 != null ? possessionTeam1 : 50;
        this.possessionTeam2 = possessionTeam2 != null ? possessionTeam2 : 50;
        this.shotsOnTargetTeam1 = shotsOnTargetTeam1 != null ? shotsOnTargetTeam1 : 0;
        this.shotsOnTargetTeam2 = shotsOnTargetTeam2 != null ? shotsOnTargetTeam2 : 0;
        this.shotsOffTargetTeam1 = shotsOffTargetTeam1 != null ? shotsOffTargetTeam1 : 0;
        this.shotsOffTargetTeam2 = shotsOffTargetTeam2 != null ? shotsOffTargetTeam2 : 0;
        this.cornersTeam1 = cornersTeam1 != null ? cornersTeam1 : 0;
        this.cornersTeam2 = cornersTeam2 != null ? cornersTeam2 : 0;
        this.yellowCardsTeam1 = yellowCardsTeam1 != null ? yellowCardsTeam1 : 0;
        this.yellowCardsTeam2 = yellowCardsTeam2 != null ? yellowCardsTeam2 : 0;
        this.redCardsTeam1 = redCardsTeam1 != null ? redCardsTeam1 : 0;
        this.redCardsTeam2 = redCardsTeam2 != null ? redCardsTeam2 : 0;
        this.foulsTeam1 = foulsTeam1 != null ? foulsTeam1 : 0;
        this.foulsTeam2 = foulsTeam2 != null ? foulsTeam2 : 0;
        this.attacksTeam1 = attacksTeam1 != null ? attacksTeam1 : 0;
        this.attacksTeam2 = attacksTeam2 != null ? attacksTeam2 : 0;
        this.dangerousAttacksTeam1 = dangerousAttacksTeam1 != null ? dangerousAttacksTeam1 : 0;
        this.dangerousAttacksTeam2 = dangerousAttacksTeam2 != null ? dangerousAttacksTeam2 : 0;
        this.setScoresJson = setScoresJson;
        this.currentPoints = currentPoints;
    }

    public static MatchStatBuilder builder() {
        return new MatchStatBuilder();
    }

    public static class MatchStatBuilder {
        private String id;
        private String matchId;
        private Integer possessionTeam1 = 50;
        private Integer possessionTeam2 = 50;
        private Integer shotsOnTargetTeam1 = 0;
        private Integer shotsOnTargetTeam2 = 0;
        private Integer shotsOffTargetTeam1 = 0;
        private Integer shotsOffTargetTeam2 = 0;
        private Integer cornersTeam1 = 0;
        private Integer cornersTeam2 = 0;
        private Integer yellowCardsTeam1 = 0;
        private Integer yellowCardsTeam2 = 0;
        private Integer redCardsTeam1 = 0;
        private Integer redCardsTeam2 = 0;
        private Integer foulsTeam1 = 0;
        private Integer foulsTeam2 = 0;
        private Integer attacksTeam1 = 0;
        private Integer attacksTeam2 = 0;
        private Integer dangerousAttacksTeam1 = 0;
        private Integer dangerousAttacksTeam2 = 0;
        private String setScoresJson;
        private String currentPoints;

        public MatchStatBuilder id(String id) { this.id = id; return this; }
        public MatchStatBuilder matchId(String matchId) { this.matchId = matchId; return this; }
        public MatchStatBuilder possessionTeam1(Integer possessionTeam1) { this.possessionTeam1 = possessionTeam1; return this; }
        public MatchStatBuilder possessionTeam2(Integer possessionTeam2) { this.possessionTeam2 = possessionTeam2; return this; }
        public MatchStatBuilder shotsOnTargetTeam1(Integer shotsOnTargetTeam1) { this.shotsOnTargetTeam1 = shotsOnTargetTeam1; return this; }
        public MatchStatBuilder shotsOnTargetTeam2(Integer shotsOnTargetTeam2) { this.shotsOnTargetTeam2 = shotsOnTargetTeam2; return this; }
        public MatchStatBuilder shotsOffTargetTeam1(Integer shotsOffTargetTeam1) { this.shotsOffTargetTeam1 = shotsOffTargetTeam1; return this; }
        public MatchStatBuilder shotsOffTargetTeam2(Integer shotsOffTargetTeam2) { this.shotsOffTargetTeam2 = shotsOffTargetTeam2; return this; }
        public MatchStatBuilder cornersTeam1(Integer cornersTeam1) { this.cornersTeam1 = cornersTeam1; return this; }
        public MatchStatBuilder cornersTeam2(Integer cornersTeam2) { this.cornersTeam2 = cornersTeam2; return this; }
        public MatchStatBuilder yellowCardsTeam1(Integer yellowCardsTeam1) { this.yellowCardsTeam1 = yellowCardsTeam1; return this; }
        public MatchStatBuilder yellowCardsTeam2(Integer yellowCardsTeam2) { this.yellowCardsTeam2 = yellowCardsTeam2; return this; }
        public MatchStatBuilder redCardsTeam1(Integer redCardsTeam1) { this.redCardsTeam1 = redCardsTeam1; return this; }
        public MatchStatBuilder redCardsTeam2(Integer redCardsTeam2) { this.redCardsTeam2 = redCardsTeam2; return this; }
        public MatchStatBuilder foulsTeam1(Integer foulsTeam1) { this.foulsTeam1 = foulsTeam1; return this; }
        public MatchStatBuilder foulsTeam2(Integer foulsTeam2) { this.foulsTeam2 = foulsTeam2; return this; }
        public MatchStatBuilder attacksTeam1(Integer attacksTeam1) { this.attacksTeam1 = attacksTeam1; return this; }
        public MatchStatBuilder attacksTeam2(Integer attacksTeam2) { this.attacksTeam2 = attacksTeam2; return this; }
        public MatchStatBuilder dangerousAttacksTeam1(Integer dangerousAttacksTeam1) { this.dangerousAttacksTeam1 = dangerousAttacksTeam1; return this; }
        public MatchStatBuilder dangerousAttacksTeam2(Integer dangerousAttacksTeam2) { this.dangerousAttacksTeam2 = dangerousAttacksTeam2; return this; }
        public MatchStatBuilder setScoresJson(String setScoresJson) { this.setScoresJson = setScoresJson; return this; }
        public MatchStatBuilder currentPoints(String currentPoints) { this.currentPoints = currentPoints; return this; }

        public MatchStat build() {
            return new MatchStat(id, matchId, possessionTeam1, possessionTeam2, shotsOnTargetTeam1, shotsOnTargetTeam2, shotsOffTargetTeam1, shotsOffTargetTeam2, cornersTeam1, cornersTeam2, yellowCardsTeam1, yellowCardsTeam2, redCardsTeam1, redCardsTeam2, foulsTeam1, foulsTeam2, attacksTeam1, attacksTeam2, dangerousAttacksTeam1, dangerousAttacksTeam2, setScoresJson, currentPoints);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMatchId() { return matchId; }
    public void setMatchId(String matchId) { this.matchId = matchId; }

    public Integer getPossessionTeam1() { return possessionTeam1; }
    public void setPossessionTeam1(Integer possessionTeam1) { this.possessionTeam1 = possessionTeam1; }

    public Integer getPossessionTeam2() { return possessionTeam2; }
    public void setPossessionTeam2(Integer possessionTeam2) { this.possessionTeam2 = possessionTeam2; }

    public Integer getShotsOnTargetTeam1() { return shotsOnTargetTeam1; }
    public void setShotsOnTargetTeam1(Integer shotsOnTargetTeam1) { this.shotsOnTargetTeam1 = shotsOnTargetTeam1; }

    public Integer getShotsOnTargetTeam2() { return shotsOnTargetTeam2; }
    public void setShotsOnTargetTeam2(Integer shotsOnTargetTeam2) { this.shotsOnTargetTeam2 = shotsOnTargetTeam2; }

    public Integer getShotsOffTargetTeam1() { return shotsOffTargetTeam1; }
    public void setShotsOffTargetTeam1(Integer shotsOffTargetTeam1) { this.shotsOffTargetTeam1 = shotsOffTargetTeam1; }

    public Integer getShotsOffTargetTeam2() { return shotsOffTargetTeam2; }
    public void setShotsOffTargetTeam2(Integer shotsOffTargetTeam2) { this.shotsOffTargetTeam2 = shotsOffTargetTeam2; }

    public Integer getCornersTeam1() { return cornersTeam1; }
    public void setCornersTeam1(Integer cornersTeam1) { this.cornersTeam1 = cornersTeam1; }

    public Integer getCornersTeam2() { return cornersTeam2; }
    public void setCornersTeam2(Integer cornersTeam2) { this.cornersTeam2 = cornersTeam2; }

    public Integer getYellowCardsTeam1() { return yellowCardsTeam1; }
    public void setYellowCardsTeam1(Integer yellowCardsTeam1) { this.yellowCardsTeam1 = yellowCardsTeam1; }

    public Integer getYellowCardsTeam2() { return yellowCardsTeam2; }
    public void setYellowCardsTeam2(Integer yellowCardsTeam2) { this.yellowCardsTeam2 = yellowCardsTeam2; }

    public Integer getRedCardsTeam1() { return redCardsTeam1; }
    public void setRedCardsTeam1(Integer redCardsTeam1) { this.redCardsTeam1 = redCardsTeam1; }

    public Integer getRedCardsTeam2() { return redCardsTeam2; }
    public void setRedCardsTeam2(Integer redCardsTeam2) { this.redCardsTeam2 = redCardsTeam2; }

    public Integer getFoulsTeam1() { return foulsTeam1; }
    public void setFoulsTeam1(Integer foulsTeam1) { this.foulsTeam1 = foulsTeam1; }

    public Integer getFoulsTeam2() { return foulsTeam2; }
    public void setFoulsTeam2(Integer foulsTeam2) { this.foulsTeam2 = foulsTeam2; }

    public Integer getAttacksTeam1() { return attacksTeam1; }
    public void setAttacksTeam1(Integer attacksTeam1) { this.attacksTeam1 = attacksTeam1; }

    public Integer getAttacksTeam2() { return attacksTeam2; }
    public void setAttacksTeam2(Integer attacksTeam2) { this.attacksTeam2 = attacksTeam2; }

    public Integer getDangerousAttacksTeam1() { return dangerousAttacksTeam1; }
    public void setDangerousAttacksTeam1(Integer dangerousAttacksTeam1) { this.dangerousAttacksTeam1 = dangerousAttacksTeam1; }

    public Integer getDangerousAttacksTeam2() { return dangerousAttacksTeam2; }
    public void setDangerousAttacksTeam2(Integer dangerousAttacksTeam2) { this.dangerousAttacksTeam2 = dangerousAttacksTeam2; }

    public String getSetScoresJson() { return setScoresJson; }
    public void setSetScoresJson(String setScoresJson) { this.setScoresJson = setScoresJson; }

    public String getCurrentPoints() { return currentPoints; }
    public void setCurrentPoints(String currentPoints) { this.currentPoints = currentPoints; }
}
