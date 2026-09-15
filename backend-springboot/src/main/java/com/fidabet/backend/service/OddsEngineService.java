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

        map.put("w1", OddsItemDto.of("w1-" + matchId, "1", team1, "1X2", w1Val, "same"));
        map.put("x", OddsItemDto.of("x-" + matchId, "X", "Draw", "1X2", xVal, "same"));
        map.put("w2", OddsItemDto.of("w2-" + matchId, "2", team2, "1X2", w2Val, "same"));

        map.put("x1", OddsItemDto.of("x1-" + matchId, "1X", team1 + " or Draw", "Double Chance", dc1x, "same"));
        map.put("w12", OddsItemDto.of("w12-" + matchId, "12", team1 + " or " + team2, "Double Chance", dc12, "same"));
        map.put("x2", OddsItemDto.of("x2-" + matchId, "X2", "Draw or " + team2, "Double Chance", dcX2, "same"));

        map.put("totalOver", OddsItemDto.of("tot-o-" + matchId, "Over 2.5", "Over 2.5 Goals", "Total Goals", 1.85, "same"));
        map.put("totalUnder", OddsItemDto.of("tot-u-" + matchId, "Under 2.5", "Under 2.5 Goals", "Total Goals", 1.95, "same"));
        map.put("handicap1", OddsItemDto.of("h1-" + matchId, "H1 (0.0)", team1 + " (0.0)", "Handicap", 1.90, "same"));
        map.put("handicap2", OddsItemDto.of("h2-" + matchId, "H2 (0.0)", team2 + " (0.0)", "Handicap", 1.90, "same"));

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

        groups.add(MarketGroupDto.of(
                "mg-1x2",
                "1X2 (Full Time Winner)",
                List.of(MarketGroupDto.MarketDto.of("m-1x2-" + match.getId(), "Match Result", matchWinnerList))
        ));

        // Double Chance Group
        List<OddsItemDto> dcList = new ArrayList<>();
        if (odds.containsKey("x1")) dcList.add(odds.get("x1"));
        if (odds.containsKey("w12")) dcList.add(odds.get("w12"));
        if (odds.containsKey("x2")) dcList.add(odds.get("x2"));

        groups.add(MarketGroupDto.of(
                "mg-dc",
                "Double Chance",
                List.of(MarketGroupDto.MarketDto.of("m-dc-" + match.getId(), "Double Chance", dcList))
        ));

        // Total Goals Group
        List<OddsItemDto> totalsList = new ArrayList<>();
        if (odds.containsKey("totalOver")) totalsList.add(odds.get("totalOver"));
        if (odds.containsKey("totalUnder")) totalsList.add(odds.get("totalUnder"));

        groups.add(MarketGroupDto.of(
                "mg-totals",
                "Total Goals (Over / Under 2.5)",
                List.of(MarketGroupDto.MarketDto.of("m-tot-" + match.getId(), "Total Goals 2.5", totalsList))
        ));

        return groups;
    }
}
