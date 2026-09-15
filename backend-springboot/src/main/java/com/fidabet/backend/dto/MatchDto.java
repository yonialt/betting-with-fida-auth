package com.fidabet.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MatchDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String matchCode;
    private String sport;
    private String league;
    private String country;
    private String flag;
    private String team1;
    private String team2;
    private String team1Logo;
    private String team2Logo;
    private Integer score1;
    private Integer score2;
    private String timeDisplay;
    private Integer seconds;
    private String period;
    private Boolean isLive;
    private Boolean hasLiveStream;
    private Boolean isFavorite;
    private Integer extraMarketsCount;
    private String venue;
    private String referee;

    // Quick access odds map: "w1", "x", "w2", "x1", "w12", "x2", "totalOver", "totalUnder", "handicap1", "handicap2"
    private Map<String, OddsItemDto> odds;

    /** Factory method for tests / fallback generation that avoids Lombok @Builder on this type. */
    public static MatchDto of(String id, String matchCode, String sport, String league, String country, String team1, String team2,
                              int score1, int score2, String timeDisplay, int seconds, String period, boolean isLive,
                              boolean hasLiveStream, boolean isFavorite, int extraMarketsCount, String venue, String referee,
                              Map<String, OddsItemDto> odds) {
        MatchDto dto = new MatchDto();
        dto.id = id;
        dto.matchCode = matchCode;
        dto.sport = sport;
        dto.league = league;
        dto.country = country;
        dto.team1 = team1;
        dto.team2 = team2;
        dto.score1 = score1;
        dto.score2 = score2;
        dto.timeDisplay = timeDisplay;
        dto.seconds = seconds;
        dto.period = period;
        dto.isLive = isLive;
        dto.hasLiveStream = hasLiveStream;
        dto.isFavorite = isFavorite;
        dto.extraMarketsCount = extraMarketsCount;
        dto.venue = venue;
        dto.referee = referee;
        dto.odds = odds;
        return dto;
    }
}
