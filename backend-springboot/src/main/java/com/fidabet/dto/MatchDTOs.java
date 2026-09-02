package com.fidabet.dto;

import java.math.BigDecimal;
import java.util.List;

public class MatchDTOs {

    public static class OddsItemDto {
        private String id;
        private String label;
        private String name;
        private String marketName;
        private BigDecimal value;
        private Boolean isLocked;
        private BigDecimal previousValue;
        private String trend;
        private Long lastUpdated;

        public OddsItemDto() {}

        public OddsItemDto(String id, String label, String name, String marketName, BigDecimal value,
                           Boolean isLocked, BigDecimal previousValue, String trend, Long lastUpdated) {
            this.id = id;
            this.label = label;
            this.name = name;
            this.marketName = marketName;
            this.value = value;
            this.isLocked = isLocked;
            this.previousValue = previousValue;
            this.trend = trend;
            this.lastUpdated = lastUpdated;
        }

        public static OddsItemDtoBuilder builder() {
            return new OddsItemDtoBuilder();
        }

        public static class OddsItemDtoBuilder {
            private String id;
            private String label;
            private String name;
            private String marketName;
            private BigDecimal value;
            private Boolean isLocked;
            private BigDecimal previousValue;
            private String trend;
            private Long lastUpdated;

            public OddsItemDtoBuilder id(String id) { this.id = id; return this; }
            public OddsItemDtoBuilder label(String label) { this.label = label; return this; }
            public OddsItemDtoBuilder name(String name) { this.name = name; return this; }
            public OddsItemDtoBuilder marketName(String marketName) { this.marketName = marketName; return this; }
            public OddsItemDtoBuilder value(BigDecimal value) { this.value = value; return this; }
            public OddsItemDtoBuilder isLocked(Boolean isLocked) { this.isLocked = isLocked; return this; }
            public OddsItemDtoBuilder previousValue(BigDecimal previousValue) { this.previousValue = previousValue; return this; }
            public OddsItemDtoBuilder trend(String trend) { this.trend = trend; return this; }
            public OddsItemDtoBuilder lastUpdated(Long lastUpdated) { this.lastUpdated = lastUpdated; return this; }

            public OddsItemDto build() {
                return new OddsItemDto(id, label, name, marketName, value, isLocked, previousValue, trend, lastUpdated);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getMarketName() { return marketName; }
        public void setMarketName(String marketName) { this.marketName = marketName; }

        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }

        public Boolean getIsLocked() { return isLocked; }
        public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

        public BigDecimal getPreviousValue() { return previousValue; }
        public void setPreviousValue(BigDecimal previousValue) { this.previousValue = previousValue; }

        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }

        public Long getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(Long lastUpdated) { this.lastUpdated = lastUpdated; }
    }

    public static class QuickOddsDto {
        private OddsItemDto w1;
        private OddsItemDto x;
        private OddsItemDto w2;
        private OddsItemDto x1;
        private OddsItemDto x2;
        private OddsItemDto w12;
        private OddsItemDto totalOver;
        private OddsItemDto totalUnder;
        private String totalVal;

        public QuickOddsDto() {}

        public QuickOddsDto(OddsItemDto w1, OddsItemDto x, OddsItemDto w2, OddsItemDto x1, OddsItemDto x2,
                            OddsItemDto w12, OddsItemDto totalOver, OddsItemDto totalUnder, String totalVal) {
            this.w1 = w1;
            this.x = x;
            this.w2 = w2;
            this.x1 = x1;
            this.x2 = x2;
            this.w12 = w12;
            this.totalOver = totalOver;
            this.totalUnder = totalUnder;
            this.totalVal = totalVal;
        }

        public static QuickOddsDtoBuilder builder() {
            return new QuickOddsDtoBuilder();
        }

        public static class QuickOddsDtoBuilder {
            private OddsItemDto w1;
            private OddsItemDto x;
            private OddsItemDto w2;
            private OddsItemDto x1;
            private OddsItemDto x2;
            private OddsItemDto w12;
            private OddsItemDto totalOver;
            private OddsItemDto totalUnder;
            private String totalVal;

            public QuickOddsDtoBuilder w1(OddsItemDto w1) { this.w1 = w1; return this; }
            public QuickOddsDtoBuilder x(OddsItemDto x) { this.x = x; return this; }
            public QuickOddsDtoBuilder w2(OddsItemDto w2) { this.w2 = w2; return this; }
            public QuickOddsDtoBuilder x1(OddsItemDto x1) { this.x1 = x1; return this; }
            public QuickOddsDtoBuilder x2(OddsItemDto x2) { this.x2 = x2; return this; }
            public QuickOddsDtoBuilder w12(OddsItemDto w12) { this.w12 = w12; return this; }
            public QuickOddsDtoBuilder totalOver(OddsItemDto totalOver) { this.totalOver = totalOver; return this; }
            public QuickOddsDtoBuilder totalUnder(OddsItemDto totalUnder) { this.totalUnder = totalUnder; return this; }
            public QuickOddsDtoBuilder totalVal(String totalVal) { this.totalVal = totalVal; return this; }

            public QuickOddsDto build() {
                return new QuickOddsDto(w1, x, w2, x1, x2, w12, totalOver, totalUnder, totalVal);
            }
        }

        public OddsItemDto getW1() { return w1; }
        public void setW1(OddsItemDto w1) { this.w1 = w1; }

        public OddsItemDto getX() { return x; }
        public void setX(OddsItemDto x) { this.x = x; }

        public OddsItemDto getW2() { return w2; }
        public void setW2(OddsItemDto w2) { this.w2 = w2; }

        public OddsItemDto getX1() { return x1; }
        public void setX1(OddsItemDto x1) { this.x1 = x1; }

        public OddsItemDto getX2() { return x2; }
        public void setX2(OddsItemDto x2) { this.x2 = x2; }

        public OddsItemDto getW12() { return w12; }
        public void setW12(OddsItemDto w12) { this.w12 = w12; }

        public OddsItemDto getTotalOver() { return totalOver; }
        public void setTotalOver(OddsItemDto totalOver) { this.totalOver = totalOver; }

        public OddsItemDto getTotalUnder() { return totalUnder; }
        public void setTotalUnder(OddsItemDto totalUnder) { this.totalUnder = totalUnder; }

        public String getTotalVal() { return totalVal; }
        public void setTotalVal(String totalVal) { this.totalVal = totalVal; }
    }

    public static class MarketGroupDto {
        private String id;
        private String name;
        private List<OddsItemDto> items;

        public MarketGroupDto() {}

        public MarketGroupDto(String id, String name, List<OddsItemDto> items) {
            this.id = id;
            this.name = name;
            this.items = items;
        }

        public static MarketGroupDtoBuilder builder() {
            return new MarketGroupDtoBuilder();
        }

        public static class MarketGroupDtoBuilder {
            private String id;
            private String name;
            private List<OddsItemDto> items;

            public MarketGroupDtoBuilder id(String id) { this.id = id; return this; }
            public MarketGroupDtoBuilder name(String name) { this.name = name; return this; }
            public MarketGroupDtoBuilder items(List<OddsItemDto> items) { this.items = items; return this; }

            public MarketGroupDto build() {
                return new MarketGroupDto(id, name, items);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public List<OddsItemDto> getItems() { return items; }
        public void setItems(List<OddsItemDto> items) { this.items = items; }
    }

    public static class MatchStatsDto {
        private int[] possession;
        private int[] shotsOnTarget;
        private int[] shotsOffTarget;
        private int[] corners;
        private int[] yellowCards;
        private int[] redCards;
        private int[] fouls;
        private int[] attacks;
        private int[] dangerousAttacks;
        private List<String> setScores;
        private String currentPoints;

        public MatchStatsDto() {}

        public MatchStatsDto(int[] possession, int[] shotsOnTarget, int[] shotsOffTarget, int[] corners,
                             int[] yellowCards, int[] redCards, int[] fouls, int[] attacks,
                             int[] dangerousAttacks, List<String> setScores, String currentPoints) {
            this.possession = possession;
            this.shotsOnTarget = shotsOnTarget;
            this.shotsOffTarget = shotsOffTarget;
            this.corners = corners;
            this.yellowCards = yellowCards;
            this.redCards = redCards;
            this.fouls = fouls;
            this.attacks = attacks;
            this.dangerousAttacks = dangerousAttacks;
            this.setScores = setScores;
            this.currentPoints = currentPoints;
        }

        public static MatchStatsDtoBuilder builder() {
            return new MatchStatsDtoBuilder();
        }

        public static class MatchStatsDtoBuilder {
            private int[] possession;
            private int[] shotsOnTarget;
            private int[] shotsOffTarget;
            private int[] corners;
            private int[] yellowCards;
            private int[] redCards;
            private int[] fouls;
            private int[] attacks;
            private int[] dangerousAttacks;
            private List<String> setScores;
            private String currentPoints;

            public MatchStatsDtoBuilder possession(int[] possession) { this.possession = possession; return this; }
            public MatchStatsDtoBuilder shotsOnTarget(int[] shotsOnTarget) { this.shotsOnTarget = shotsOnTarget; return this; }
            public MatchStatsDtoBuilder shotsOffTarget(int[] shotsOffTarget) { this.shotsOffTarget = shotsOffTarget; return this; }
            public MatchStatsDtoBuilder corners(int[] corners) { this.corners = corners; return this; }
            public MatchStatsDtoBuilder yellowCards(int[] yellowCards) { this.yellowCards = yellowCards; return this; }
            public MatchStatsDtoBuilder redCards(int[] redCards) { this.redCards = redCards; return this; }
            public MatchStatsDtoBuilder fouls(int[] fouls) { this.fouls = fouls; return this; }
            public MatchStatsDtoBuilder attacks(int[] attacks) { this.attacks = attacks; return this; }
            public MatchStatsDtoBuilder dangerousAttacks(int[] dangerousAttacks) { this.dangerousAttacks = dangerousAttacks; return this; }
            public MatchStatsDtoBuilder setScores(List<String> setScores) { this.setScores = setScores; return this; }
            public MatchStatsDtoBuilder currentPoints(String currentPoints) { this.currentPoints = currentPoints; return this; }

            public MatchStatsDto build() {
                return new MatchStatsDto(possession, shotsOnTarget, shotsOffTarget, corners, yellowCards, redCards, fouls, attacks, dangerousAttacks, setScores, currentPoints);
            }
        }

        public int[] getPossession() { return possession; }
        public void setPossession(int[] possession) { this.possession = possession; }

        public int[] getShotsOnTarget() { return shotsOnTarget; }
        public void setShotsOnTarget(int[] shotsOnTarget) { this.shotsOnTarget = shotsOnTarget; }

        public int[] getShotsOffTarget() { return shotsOffTarget; }
        public void setShotsOffTarget(int[] shotsOffTarget) { this.shotsOffTarget = shotsOffTarget; }

        public int[] getCorners() { return corners; }
        public void setCorners(int[] corners) { this.corners = corners; }

        public int[] getYellowCards() { return yellowCards; }
        public void setYellowCards(int[] yellowCards) { this.yellowCards = yellowCards; }

        public int[] getRedCards() { return redCards; }
        public void setRedCards(int[] redCards) { this.redCards = redCards; }

        public int[] getFouls() { return fouls; }
        public void setFouls(int[] fouls) { this.fouls = fouls; }

        public int[] getAttacks() { return attacks; }
        public void setAttacks(int[] attacks) { this.attacks = attacks; }

        public int[] getDangerousAttacks() { return dangerousAttacks; }
        public void setDangerousAttacks(int[] dangerousAttacks) { this.dangerousAttacks = dangerousAttacks; }

        public List<String> getSetScores() { return setScores; }
        public void setSetScores(List<String> setScores) { this.setScores = setScores; }

        public String getCurrentPoints() { return currentPoints; }
        public void setCurrentPoints(String currentPoints) { this.currentPoints = currentPoints; }
    }

    public static class LiveMatchEventDto {
        private int minute;
        private String type;
        private String text;
        private int team;

        public LiveMatchEventDto() {}

        public LiveMatchEventDto(int minute, String type, String text, int team) {
            this.minute = minute;
            this.type = type;
            this.text = text;
            this.team = team;
        }

        public static LiveMatchEventDtoBuilder builder() {
            return new LiveMatchEventDtoBuilder();
        }

        public static class LiveMatchEventDtoBuilder {
            private int minute;
            private String type;
            private String text;
            private int team;

            public LiveMatchEventDtoBuilder minute(int minute) { this.minute = minute; return this; }
            public LiveMatchEventDtoBuilder type(String type) { this.type = type; return this; }
            public LiveMatchEventDtoBuilder text(String text) { this.text = text; return this; }
            public LiveMatchEventDtoBuilder team(int team) { this.team = team; return this; }

            public LiveMatchEventDto build() {
                return new LiveMatchEventDto(minute, type, text, team);
            }
        }

        public int getMinute() { return minute; }
        public void setMinute(int minute) { this.minute = minute; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public int getTeam() { return team; }
        public void setTeam(int team) { this.team = team; }
    }

    public static class SubGameDto {
        private String id;
        private String name;
        private Integer extraMarketsCount;
        private QuickOddsDto odds;

        public SubGameDto() {}

        public SubGameDto(String id, String name, Integer extraMarketsCount, QuickOddsDto odds) {
            this.id = id;
            this.name = name;
            this.extraMarketsCount = extraMarketsCount;
            this.odds = odds;
        }

        public static SubGameDtoBuilder builder() {
            return new SubGameDtoBuilder();
        }

        public static class SubGameDtoBuilder {
            private String id;
            private String name;
            private Integer extraMarketsCount;
            private QuickOddsDto odds;

            public SubGameDtoBuilder id(String id) { this.id = id; return this; }
            public SubGameDtoBuilder name(String name) { this.name = name; return this; }
            public SubGameDtoBuilder extraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; return this; }
            public SubGameDtoBuilder odds(QuickOddsDto odds) { this.odds = odds; return this; }

            public SubGameDto build() {
                return new SubGameDto(id, name, extraMarketsCount, odds);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Integer getExtraMarketsCount() { return extraMarketsCount; }
        public void setExtraMarketsCount(Integer extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; }

        public QuickOddsDto getOdds() { return odds; }
        public void setOdds(QuickOddsDto odds) { this.odds = odds; }
    }

    public static class MatchDto {
        private String id;
        private String matchCode;
        private String sport;
        private String league;
        private String team1;
        private String team2;
        private int score1;
        private int score2;
        private String timeDisplay;
        private int seconds;
        private String period;
        private boolean isLive;
        private boolean hasLiveStream;
        private boolean isFavorite;
        private int extraMarketsCount;
        private String venue;
        private String referee;
        private String currentAction;
        private QuickOddsDto odds;
        private List<MarketGroupDto> allMarkets;
        private MatchStatsDto stats;
        private List<LiveMatchEventDto> events;
        private List<SubGameDto> subGames;

        public MatchDto() {}

        public MatchDto(String id, String matchCode, String sport, String league, String team1, String team2,
                        int score1, int score2, String timeDisplay, int seconds, String period, boolean isLive,
                        boolean hasLiveStream, boolean isFavorite, int extraMarketsCount, String venue, String referee,
                        String currentAction, QuickOddsDto odds, List<MarketGroupDto> allMarkets, MatchStatsDto stats,
                        List<LiveMatchEventDto> events, List<SubGameDto> subGames) {
            this.id = id;
            this.matchCode = matchCode;
            this.sport = sport;
            this.league = league;
            this.team1 = team1;
            this.team2 = team2;
            this.score1 = score1;
            this.score2 = score2;
            this.timeDisplay = timeDisplay;
            this.seconds = seconds;
            this.period = period;
            this.isLive = isLive;
            this.hasLiveStream = hasLiveStream;
            this.isFavorite = isFavorite;
            this.extraMarketsCount = extraMarketsCount;
            this.venue = venue;
            this.referee = referee;
            this.currentAction = currentAction;
            this.odds = odds;
            this.allMarkets = allMarkets;
            this.stats = stats;
            this.events = events;
            this.subGames = subGames;
        }

        public static MatchDtoBuilder builder() {
            return new MatchDtoBuilder();
        }

        public static class MatchDtoBuilder {
            private String id;
            private String matchCode;
            private String sport;
            private String league;
            private String team1;
            private String team2;
            private int score1;
            private int score2;
            private String timeDisplay;
            private int seconds;
            private String period;
            private boolean isLive;
            private boolean hasLiveStream;
            private boolean isFavorite;
            private int extraMarketsCount;
            private String venue;
            private String referee;
            private String currentAction;
            private QuickOddsDto odds;
            private List<MarketGroupDto> allMarkets;
            private MatchStatsDto stats;
            private List<LiveMatchEventDto> events;
            private List<SubGameDto> subGames;

            public MatchDtoBuilder id(String id) { this.id = id; return this; }
            public MatchDtoBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
            public MatchDtoBuilder sport(String sport) { this.sport = sport; return this; }
            public MatchDtoBuilder league(String league) { this.league = league; return this; }
            public MatchDtoBuilder team1(String team1) { this.team1 = team1; return this; }
            public MatchDtoBuilder team2(String team2) { this.team2 = team2; return this; }
            public MatchDtoBuilder score1(int score1) { this.score1 = score1; return this; }
            public MatchDtoBuilder score2(int score2) { this.score2 = score2; return this; }
            public MatchDtoBuilder timeDisplay(String timeDisplay) { this.timeDisplay = timeDisplay; return this; }
            public MatchDtoBuilder seconds(int seconds) { this.seconds = seconds; return this; }
            public MatchDtoBuilder period(String period) { this.period = period; return this; }
            public MatchDtoBuilder isLive(boolean isLive) { this.isLive = isLive; return this; }
            public MatchDtoBuilder hasLiveStream(boolean hasLiveStream) { this.hasLiveStream = hasLiveStream; return this; }
            public MatchDtoBuilder isFavorite(boolean isFavorite) { this.isFavorite = isFavorite; return this; }
            public MatchDtoBuilder extraMarketsCount(int extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; return this; }
            public MatchDtoBuilder venue(String venue) { this.venue = venue; return this; }
            public MatchDtoBuilder referee(String referee) { this.referee = referee; return this; }
            public MatchDtoBuilder currentAction(String currentAction) { this.currentAction = currentAction; return this; }
            public MatchDtoBuilder odds(QuickOddsDto odds) { this.odds = odds; return this; }
            public MatchDtoBuilder allMarkets(List<MarketGroupDto> allMarkets) { this.allMarkets = allMarkets; return this; }
            public MatchDtoBuilder stats(MatchStatsDto stats) { this.stats = stats; return this; }
            public MatchDtoBuilder events(List<LiveMatchEventDto> events) { this.events = events; return this; }
            public MatchDtoBuilder subGames(List<SubGameDto> subGames) { this.subGames = subGames; return this; }

            public MatchDto build() {
                return new MatchDto(id, matchCode, sport, league, team1, team2, score1, score2, timeDisplay, seconds, period, isLive, hasLiveStream, isFavorite, extraMarketsCount, venue, referee, currentAction, odds, allMarkets, stats, events, subGames);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getMatchCode() { return matchCode; }
        public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

        public String getSport() { return sport; }
        public void setSport(String sport) { this.sport = sport; }

        public String getLeague() { return league; }
        public void setLeague(String league) { this.league = league; }

        public String getTeam1() { return team1; }
        public void setTeam1(String team1) { this.team1 = team1; }

        public String getTeam2() { return team2; }
        public void setTeam2(String team2) { this.team2 = team2; }

        public int getScore1() { return score1; }
        public void setScore1(int score1) { this.score1 = score1; }

        public int getScore2() { return score2; }
        public void setScore2(int score2) { this.score2 = score2; }

        public String getTimeDisplay() { return timeDisplay; }
        public void setTimeDisplay(String timeDisplay) { this.timeDisplay = timeDisplay; }

        public int getSeconds() { return seconds; }
        public void setSeconds(int seconds) { this.seconds = seconds; }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public boolean isLive() { return isLive; }
        public void setLive(boolean live) { isLive = live; }

        public boolean isHasLiveStream() { return hasLiveStream; }
        public void setHasLiveStream(boolean hasLiveStream) { this.hasLiveStream = hasLiveStream; }

        public boolean isFavorite() { return isFavorite; }
        public void setFavorite(boolean favorite) { isFavorite = favorite; }

        public int getExtraMarketsCount() { return extraMarketsCount; }
        public void setExtraMarketsCount(int extraMarketsCount) { this.extraMarketsCount = extraMarketsCount; }

        public String getVenue() { return venue; }
        public void setVenue(String venue) { this.venue = venue; }

        public String getReferee() { return referee; }
        public void setReferee(String referee) { this.referee = referee; }

        public String getCurrentAction() { return currentAction; }
        public void setCurrentAction(String currentAction) { this.currentAction = currentAction; }

        public QuickOddsDto getOdds() { return odds; }
        public void setOdds(QuickOddsDto odds) { this.odds = odds; }

        public List<MarketGroupDto> getAllMarkets() { return allMarkets; }
        public void setAllMarkets(List<MarketGroupDto> allMarkets) { this.allMarkets = allMarkets; }

        public MatchStatsDto getStats() { return stats; }
        public void setStats(MatchStatsDto stats) { this.stats = stats; }

        public List<LiveMatchEventDto> getEvents() { return events; }
        public void setEvents(List<LiveMatchEventDto> events) { this.events = events; }

        public List<SubGameDto> getSubGames() { return subGames; }
        public void setSubGames(List<SubGameDto> subGames) { this.subGames = subGames; }
    }
}
