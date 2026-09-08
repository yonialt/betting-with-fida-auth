package com.fidabet.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiFootballResponseDto<T> {
    private String get;
    private Parameters parameters;
    private List<String> errors;
    private Integer results;
    private Paging paging;
    private List<T> response;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Parameters {
        private String live;
        private String date;
        private String league;
        private String season;
        private String fixture;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Paging {
        private Integer current;
        private Integer total;
    }

    // Fixture details wrapper
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FixtureItem {
        private Fixture fixture;
        private League league;
        private Teams teams;
        private Goals goals;
        private Score score;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Fixture {
        private Long id;
        private String referee;
        private String timezone;
        private String date;
        private Long timestamp;
        private Periods periods;
        private Venue venue;
        private Status status;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Periods {
        private Long first;
        private Long second;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Venue {
        private Long id;
        private String name;
        private String city;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Status {
        private String longName;
        private String shortName; // "1H", "2H", "HT", "FT", "NS"
        private Integer elapsed;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class League {
        private Long id;
        private String name;
        private String country;
        private String logo;
        private String flag;
        private Integer season;
        private String round;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Teams {
        private Team home;
        private Team away;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Team {
        private Long id;
        private String name;
        private String logo;
        private Boolean winner;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Goals {
        private Integer home;
        private Integer away;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Score {
        private Goals halftime;
        private Goals fulltime;
        private Goals extratime;
        private Goals penalty;
    }

    // Odds item wrapper
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OddsItem {
        private League league;
        private Fixture fixture;
        private String update;
        private List<Bookmaker> bookmakers;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Bookmaker {
        private Long id;
        private String name;
        private List<Bet> bets;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Bet {
        private Long id;
        private String name; // e.g., "Match Winner", "Goals Over/Under"
        private List<BetValue> values;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BetValue {
        private String value; // e.g. "Home", "Draw", "Away", "Over 2.5"
        private String odd;   // e.g. "1.85"
    }
}
