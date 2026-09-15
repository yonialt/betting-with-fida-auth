package com.fidabet.backend.service;

import com.fidabet.backend.dto.ApiFootballResponseDto;
import com.fidabet.backend.dto.MarketGroupDto;
import com.fidabet.backend.dto.MatchDto;
import com.fidabet.backend.dto.OddsItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApiFootballService {

    private final RestClient apiFootballRestClient;
    private final OddsEngineService oddsEngineService;

    @Value("${api-football.api-key:}")
    private String apiKey;

    /**
     * Retrieve live fixtures with Redis caching (TTL: 20 seconds)
     */
    @Cacheable(value = "liveMatches", key = "#sport", unless = "#result == null || #result.isEmpty()")
    public List<MatchDto> getLiveMatches(String sport) {
        log.info("[Redis Cache Miss] Fetching live matches for sport: {}", sport);

        if (apiKey != null && apiKey.length() > 8) {
            try {
                ApiFootballResponseDto<ApiFootballResponseDto.FixtureItem> response = apiFootballRestClient
                        .get()
                        .uri("/fixtures?live=all")
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});

                if (response != null && response.getResponse() != null && !response.getResponse().isEmpty()) {
                    List<MatchDto> liveMatches = new ArrayList<>();
                    for (ApiFootballResponseDto.FixtureItem item : response.getResponse()) {
                        liveMatches.add(mapFixtureItemToMatchDto(item));
                    }
                    log.info("[API-Football] Received {} live fixtures from provider", liveMatches.size());
                    return liveMatches;
                }
            } catch (Exception e) {
                log.warn("[API-Football] Error fetching live fixtures, falling back to synthetic engine: {}", e.getMessage());
            }
        }

        // High-fidelity fallback/demo fixtures with live clock and rich markets
        return getFallbackLiveMatches();
    }

    /**
     * Retrieve upcoming fixtures with Redis caching (TTL: 180 seconds)
     */
    @Cacheable(value = "upcomingMatches", key = "#sport", unless = "#result == null || #result.isEmpty()")
    public List<MatchDto> getUpcomingMatches(String sport) {
        log.info("[Redis Cache Miss] Fetching upcoming matches for sport: {}", sport);

        if (apiKey != null && apiKey.length() > 8) {
            try {
                ApiFootballResponseDto<ApiFootballResponseDto.FixtureItem> response = apiFootballRestClient
                        .get()
                        .uri("/fixtures?next=20")
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});

                if (response != null && response.getResponse() != null) {
                    List<MatchDto> list = new ArrayList<>();
                    for (ApiFootballResponseDto.FixtureItem item : response.getResponse()) {
                        list.add(mapFixtureItemToMatchDto(item));
                    }
                    return list;
                }
            } catch (Exception e) {
                log.warn("[API-Football] Error fetching upcoming fixtures: {}", e.getMessage());
            }
        }

        return getFallbackLiveMatches();
    }

    /**
     * Retrieve match markets with Redis caching (TTL: 60 seconds)
     */
    @Cacheable(value = "matchMarkets", key = "#matchId", unless = "#result == null || #result.isEmpty()")
    public List<MarketGroupDto> getMatchMarkets(String matchId) {
        log.info("[Redis Cache Miss] Generating market groups for matchId: {}", matchId);

        MatchDto match = findMatchById(matchId);
        if (match != null) {
            return oddsEngineService.buildMarketGroups(match);
        }

        return Collections.emptyList();
    }

    /**
     * Manually invalidate all Redis caches and force fresh sync
     */
    @CacheEvict(value = {"liveMatches", "upcomingMatches", "matchMarkets", "matchStats"}, allEntries = true)
    public Map<String, Object> forceSyncAllCaches() {
        log.info("[Redis Cache Invalidation] Evicted all entries in liveMatches, upcomingMatches, matchMarkets");
        List<MatchDto> fresh = getLiveMatches("all");

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("timestamp", Instant.now().toString());
        result.put("syncedMatchesCount", fresh.size());
        return result;
    }

    private MatchDto mapFixtureItemToMatchDto(ApiFootballResponseDto.FixtureItem item) {
        ApiFootballResponseDto.Fixture f = item.getFixture();
        ApiFootballResponseDto.League l = item.getLeague();
        ApiFootballResponseDto.Teams t = item.getTeams();
        ApiFootballResponseDto.Goals g = item.getGoals();

        String id = String.valueOf(f.getId());
        String team1 = t.getHome() != null ? t.getHome().getName() : "Home Team";
        String team2 = t.getAway() != null ? t.getAway().getName() : "Away Team";
        int score1 = (g != null && g.getHome() != null) ? g.getHome() : 0;
        int score2 = (g != null && g.getAway() != null) ? g.getAway() : 0;
        int elapsed = (f.getStatus() != null && f.getStatus().getElapsed() != null) ? f.getStatus().getElapsed() : 0;

        Map<String, OddsItemDto> odds = oddsEngineService.calculateCoreOdds(id, team1, team2, score1, score2);

        return MatchDto.of(
                id,
                id.length() > 6 ? id.substring(id.length() - 6) : id,
                "football",
                l.getName() != null ? (l.getCountry() + ". " + l.getName()) : "Premier League",
                l.getCountry(),
                team1,
                team2,
                score1,
                score2,
                elapsed + "'",
                elapsed * 60,
                f.getStatus() != null ? f.getStatus().getShortName() : "1H",
                true,
                true,
                false,
                64,
                f.getVenue() != null ? f.getVenue().getName() : "National Stadium",
                f.getReferee(),
                odds
        );
    }

    private MatchDto findMatchById(String matchId) {
        return getFallbackLiveMatches().stream()
                .filter(m -> m.getId().equals(matchId))
                .findFirst()
                .orElse(null);
    }

    private List<MatchDto> getFallbackLiveMatches() {
        List<MatchDto> list = new ArrayList<>();

        // Match 1: Arsenal vs Manchester City
        list.add(MatchDto.of(
                "arg-1",
                "89421",
                "football",
                "England. Premier League",
                "England",
                "Arsenal",
                "Manchester City",
                2, 1,
                "78'", 78 * 60,
                "2H", true, true, true, 72,
                "Emirates Stadium", "Michael Oliver",
                oddsEngineService.calculateCoreOdds("arg-1", "Arsenal", "Manchester City", 2, 1)
        ));

        // Match 2: Real Madrid vs Barcelona (El Clasico)
        list.add(MatchDto.of(
                "arg-2",
                "89422",
                "football",
                "Spain. La Liga",
                "Spain",
                "Real Madrid",
                "Barcelona",
                1, 1,
                "64'", 64 * 60,
                "2H", true, true, false, 85,
                "Santiago Bernabéu", "Jesus Gil Manzano",
                oddsEngineService.calculateCoreOdds("arg-2", "Real Madrid", "Barcelona", 1, 1)
        ));

        // Match 3: Saint George vs Ethiopian Coffee
        list.add(MatchDto.of(
                "eth-1",
                "89423",
                "football",
                "Ethiopia. Premier League",
                "Ethiopia",
                "Saint George SC",
                "Ethiopian Coffee",
                0, 0,
                "32'", 32 * 60,
                "1H", true, true, false, 42,
                "Addis Ababa Stadium", null,
                oddsEngineService.calculateCoreOdds("eth-1", "Saint George SC", "Ethiopian Coffee", 0, 0)
        ));

        return list;
    }
}
