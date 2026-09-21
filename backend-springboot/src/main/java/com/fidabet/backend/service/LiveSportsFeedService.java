package com.fidabet.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.backend.dto.ApiFootballResponseDto;
import com.fidabet.backend.dto.MatchDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Live sportsbook feed backing {@code /api/matches/*} live queries.
 *
 * <p>When an API-Football key is configured, real live fixtures are fetched on a
 * schedule (every 30s — a handful of calls per day, safely inside the free tier
 * quota) and mapped to the sportsbook match shape. The snapshot is held in memory
 * so client polling never hits the provider directly.</p>
 *
 * <p>When no key is present — or the provider fails — the feed falls back to a
 * deterministic simulation built on the seed fixtures: the clock advances, goals
 * land occasionally, and odds are recomputed from the current score, so the live
 * board always moves instead of showing frozen data.</p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LiveSportsFeedService {

    private static final int MAX_LIVE_FIXTURES = 40;

    private final RestClient apiFootballRestClient;
    private final OddsEngineService oddsEngineService;
    private final ObjectMapper objectMapper;

    @Value("${api-football.api-key:}")
    private String apiKey;

    private volatile List<Map<String, Object>> liveSnapshot = List.of();
    private final AtomicLong lastFetchAt = new AtomicLong(0);
    private final AtomicBoolean initializing = new AtomicBoolean(false);

    /** Simulation state per fallback match id (persisted across ticks). */
    private final Map<String, int[]> simScores = new ConcurrentHashMap<>();
    private final Map<String, Integer> simMinutes = new ConcurrentHashMap<>();

    /** Refresh the snapshot: real fixtures when possible, simulated tick otherwise. */
    @Scheduled(initialDelay = 5_000L, fixedDelay = 30_000L)
    public void refresh() {
        List<Map<String, Object>> fresh = fetchRealFixtures();
        if (fresh != null) {
            liveSnapshot = fresh;
            log.info("[LiveFeed] Snapshot updated with {} real live fixtures", fresh.size());
        } else {
            liveSnapshot = simulateTick(liveSnapshot);
        }
        lastFetchAt.set(System.currentTimeMillis());
    }

    /** Current live board; lazily initialized so first requests never see an empty list. */
    public List<Map<String, Object>> snapshot() {
        if (lastFetchAt.get() == 0 && initializing.compareAndSet(false, true)) {
            try {
                refresh();
            } finally {
                initializing.set(false);
            }
        }
        return liveSnapshot;
    }

    public boolean hasRealData() {
        return apiKey != null && apiKey.length() > 8;
    }

    // ------------------------------------------------------------------
    // Real provider
    // ------------------------------------------------------------------

    private List<Map<String, Object>> fetchRealFixtures() {
        if (!hasRealData()) {
            return null;
        }
        try {
            ApiFootballResponseDto<ApiFootballResponseDto.FixtureItem> response = apiFootballRestClient
                    .get()
                    .uri("/fixtures?live=all")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null || response.getResponse() == null || response.getResponse().isEmpty()) {
                return null;
            }

            List<Map<String, Object>> out = new ArrayList<>();
            for (ApiFootballResponseDto.FixtureItem item : response.getResponse()) {
                MatchDto dto = mapFixtureItemToMatchDto(item);
                out.add(objectMapper.convertValue(dto, new TypeReference<Map<String, Object>>() {}));
            }
            // Cap the board so the UI stays responsive on the free tier.
            return out.size() > MAX_LIVE_FIXTURES ? new ArrayList<>(out.subList(0, MAX_LIVE_FIXTURES)) : out;
        } catch (Exception e) {
            log.warn("[LiveFeed] API-Football fetch failed, simulating instead: {}", e.getMessage());
            return null;
        }
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

        Map<String, com.fidabet.backend.dto.OddsItemDto> odds =
                oddsEngineService.calculateCoreOdds(id, team1, team2, score1, score2);

        MatchDto dto = new MatchDto();
        dto.setId(id);
        dto.setMatchCode(id.length() > 6 ? id.substring(id.length() - 6) : id);
        dto.setSport("football");
        dto.setLeague(l.getName() != null ? (l.getCountry() + ". " + l.getName()) : "Football");
        dto.setCountry(l.getCountry());
        dto.setFlag(null);
        dto.setTeam1(team1);
        dto.setTeam2(team2);
        dto.setScore1(score1);
        dto.setScore2(score2);
        dto.setTimeDisplay(elapsed + "'");
        dto.setSeconds(elapsed * 60);
        dto.setPeriod(f.getStatus() != null ? f.getStatus().getShortName() : "1H");
        dto.setIsLive(true);
        dto.setHasLiveStream(true);
        dto.setIsFavorite(false);
        dto.setExtraMarketsCount(64);
        dto.setVenue(f.getVenue() != null ? f.getVenue().getName() : null);
        dto.setReferee(f.getReferee());
        dto.setOdds(odds);
        return dto;
    }

    // ------------------------------------------------------------------
    // Simulation fallback
    // ------------------------------------------------------------------

    /**
     * Advance the simulated board one tick: clock runs, goals occasionally land,
     * odds recompute from the current score. Seed fixtures provide the initial board.
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> simulateTick(List<Map<String, Object>> current) {
        List<Map<String, Object>> board = current;
        if (board.isEmpty()) {
            board = loadSeedLiveMatches();
            if (board.isEmpty()) {
                return board;
            }
        }

        List<Map<String, Object>> out = new ArrayList<>(board.size());
        for (Map<String, Object> raw : board) {
            Map<String, Object> m = new java.util.LinkedHashMap<>((Map<String, Object>) raw);
            String id = str(m, "id");
            if (!Boolean.TRUE.equals(m.get("isLive"))) {
                out.add(m);
                continue;
            }

            int minute = simMinutes.merge(id, 1, Integer::sum);
            if (minute > 90) {
                // Full time: restart the fixture so the live board never empties out.
                simMinutes.put(id, 1);
                simScores.remove(id);
                minute = 1;
            }
            minute = Math.min(90, minute);

            int[] score = simScores.computeIfAbsent(id, k -> new int[]{
                    parseInt(m.get("score1")), parseInt(m.get("score2"))});

            // ~8% chance a goal lands per 30s tick, split between the two sides.
            if (ThreadLocalRandom.current().nextInt(100) < 8) {
                if (ThreadLocalRandom.current().nextBoolean()) {
                    score[0]++;
                } else {
                    score[1]++;
                }
            }

            m.put("seconds", minute * 60);
            m.put("timeDisplay", minute + "'");
            m.put("period", minute <= 45 ? "1H" : "2H");
            m.put("score1", score[0]);
            m.put("score2", score[1]);
            m.put("odds", objectMapper.convertValue(
                    oddsEngineService.calculateCoreOdds(id, str(m, "team1"), str(m, "team2"), score[0], score[1]),
                    new TypeReference<Map<String, Object>>() {}));
            out.add(m);
        }
        return out;
    }

    private List<Map<String, Object>> loadSeedLiveMatches() {
        try (InputStream in = new ClassPathResource("seed/initial-matches.json").getInputStream()) {
            List<Map<String, Object>> all = objectMapper.readValue(in, new TypeReference<List<Map<String, Object>>>() {});
            List<Map<String, Object>> live = new ArrayList<>();
            for (Map<String, Object> m : all) {
                if (Boolean.TRUE.equals(m.get("isLive"))) {
                    live.add(m);
                }
            }
            return live;
        } catch (Exception e) {
            log.warn("[LiveFeed] Could not load seed matches: {}", e.getMessage());
            return List.of();
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v == null ? "" : String.valueOf(v);
    }

    private static int parseInt(Object v) {
        try {
            return (v instanceof Number n) ? n.intValue() : Integer.parseInt(String.valueOf(v));
        } catch (Exception e) {
            return 0;
        }
    }
}
