package com.fidabet.backend.service;

import com.fidabet.backend.dto.MarketGroupDto;
import com.fidabet.backend.dto.MatchDto;
import com.fidabet.backend.dto.OddsItemDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Slf4j
public class OddsEngineService {

    private static final double BOOKMAKER_MARGIN = 1.055; // 5.5% bookmaker overround

    /**
     * Compute clean odds with rounding to 2 decimal places
     */
    public double roundOdds(double val) {
        return BigDecimal.valueOf(Math.max(1.02, val))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    /**
     * Synthesize balanced 1X2 odds based on match score and momentum
     */
    public Map<String, OddsItemDto> calculateCoreOdds(String matchId, String team1, String team2, int score1, int score2) {
        int diff = score1 - score2;

        double baseW1 = 2.10 - (diff * 0.45);
        double baseW2 = 3.20 + (diff * 0.55);
        double baseX = 3.10 - (Math.abs(diff) * 0.30);

        // Normalize with bookmaker margin
        double impliedTotal = (1.0 / Math.max(0.1, baseW1)) + (1.0 / Math.max(0.1, baseX)) + (1.0 / Math.max(0.1, baseW2));
        double w1Val = roundOdds(baseW1 * (impliedTotal / BOOKMAKER_MARGIN));
        double xVal = roundOdds(baseX * (impliedTotal / BOOKMAKER_MARGIN));
        double w2Val = roundOdds(baseW2 * (impliedTotal / BOOKMAKER_MARGIN));

        // Derived double chance
        double dc1x = roundOdds(1.0 / ((1.0 / w1Val) + (1.0 / xVal)) * 1.03);
        double dc12 = roundOdds(1.0 / ((1.0 / w1Val) + (1.0 / w2Val)) * 1.03);
        double dcX2 = roundOdds(1.0 / ((1.0 / xVal) + (1.0 / w2Val)) * 1.03);

        Map<String, OddsItemDto> map = new HashMap<>();

        map.put("w1", OddsItemDto.builder()
                .id("w1-" + matchId)
                .label("1")
                .name(team1)
                .marketName("1X2")
                .value(w1Val)
                .trend("same")
                .build());

        map.put("x", OddsItemDto.builder()
                .id("x-" + matchId)
                .label("X")
                .name("Draw")
                .marketName("1X2")
                .value(xVal)
                .trend("same")
                .build());

        map.put("w2", OddsItemDto.builder()
                .id("w2-" + matchId)
                .label("2")
                .name(team2)
                .marketName("1X2")
                .value(w2Val)
                .trend("same")
                .build());

        map.put("x1", OddsItemDto.builder()
                .id("x1-" + matchId)
                .label("1X")
                .name(team1 + " or Draw")
                .marketName("Double Chance")
                .value(dc1x)
                .trend("same")
                .build());

        map.put("w12", OddsItemDto.builder()
                .id("w12-" + matchId)
                .label("12")
                .name(team1 + " or " + team2)
                .marketName("Double Chance")
                .value(dc12)
                .trend("same")
                .build());

        map.put("x2", OddsItemDto.builder()
                .id("x2-" + matchId)
                .label("X2")
                .name("Draw or " + team2)
                .marketName("Double Chance")
                .value(dcX2)
                .trend("same")
                .build());

        map.put("totalOver", OddsItemDto.builder()
                .id("tot-o-" + matchId)
                .label("Over 2.5")
                .name("Over 2.5 Goals")
                .marketName("Total Goals")
                .value(1.85)
                .trend("same")
                .build());

        map.put("totalUnder", OddsItemDto.builder()
                .id("tot-u-" + matchId)
                .label("Under 2.5")
                .name("Under 2.5 Goals")
                .marketName("Total Goals")
                .value(1.95)
                .trend("same")
                .build());

        map.put("handicap1", OddsItemDto.builder()
                .id("h1-" + matchId)
                .label("H1 (0.0)")
                .name(team1 + " (0.0)")
                .marketName("Handicap")
                .value(1.90)
                .trend("same")
                .build());

        map.put("handicap2", OddsItemDto.builder()
                .id("h2-" + matchId)
                .label("H2 (0.0)")
                .name(team2 + " (0.0)")
                .marketName("Handicap")
                .value(1.90)
                .trend("same")
                .build());

        return map;
    }

    /**
     * Build rich market groups for detailed match viewing
     */
    public List<MarketGroupDto> buildMarketGroups(MatchDto match) {
        if (match == null || match.getOdds() == null) {
            return Collections.emptyList();
        }

        Map<String, OddsItemDto> odds = match.getOdds();
        List<MarketGroupDto> groups = new ArrayList<>();

        // 1X2 Group
        List<OddsItemDto> matchWinnerList = new ArrayList<>();
        if (odds.containsKey("w1")) matchWinnerList.add(odds.get("w1"));
        if (odds.containsKey("x")) matchWinnerList.add(odds.get("x"));
        if (odds.containsKey("w2")) matchWinnerList.add(odds.get("w2"));

        groups.add(MarketGroupDto.builder()
                .id("mg-1x2")
                .name("1X2 (Full Time Winner)")
                .markets(List.of(MarketGroupDto.MarketDto.builder()
                        .id("m-1x2-" + match.getId())
                        .name("Match Result")
                        .odds(matchWinnerList)
                        .build()))
                .build());

        // Double Chance Group
        List<OddsItemDto> dcList = new ArrayList<>();
        if (odds.containsKey("x1")) dcList.add(odds.get("x1"));
        if (odds.containsKey("w12")) dcList.add(odds.get("w12"));
        if (odds.containsKey("x2")) dcList.add(odds.get("x2"));

        groups.add(MarketGroupDto.builder()
                .id("mg-dc")
                .name("Double Chance")
                .markets(List.of(MarketGroupDto.MarketDto.builder()
                        .id("m-dc-" + match.getId())
                        .name("Double Chance")
                        .odds(dcList)
                        .build()))
                .build());

        // Total Goals Group
        List<OddsItemDto> totalsList = new ArrayList<>();
        if (odds.containsKey("totalOver")) totalsList.add(odds.get("totalOver"));
        if (odds.containsKey("totalUnder")) totalsList.add(odds.get("totalUnder"));

        groups.add(MarketGroupDto.builder()
                .id("mg-totals")
                .name("Total Goals (Over / Under 2.5)")
                .markets(List.of(MarketGroupDto.MarketDto.builder()
                        .id("m-tot-" + match.getId())
                        .name("Total Goals 2.5")
                        .odds(totalsList)
                        .build()))
                .build());

        return groups;
    }
}
