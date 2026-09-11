package com.fidabet.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Serves the sportsbook match/odds contract (/api/matches/*), ported from the Express handlers.
 *
 * <p>The seed fixtures are the same {@code INITIAL_MATCHES} used by the frontend, ported to
 * {@code seed/initial-matches.json} and served through as loosely-typed maps so every field is
 * preserved byte-for-byte. Market groups, stats and events are synthesised exactly as the Express
 * fallback did. When a live feed (API-Football) is wired in later, this service is the seam to
 * delegate to it, mirroring the original try/fallback shape.</p>
 */
@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private final ObjectMapper objectMapper;
    private volatile List<Map<String, Object>> matches = List.of();

    public MatchService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() {
        try (InputStream in = new ClassPathResource("seed/initial-matches.json").getInputStream()) {
            List<Map<String, Object>> loaded = objectMapper.readValue(in, new TypeReference<List<Map<String, Object>>>() {});
            this.matches = Collections.unmodifiableList(loaded);
            log.info("Loaded {} seed matches", loaded.size());
        } catch (Exception e) {
            log.warn("Could not load seed matches: {}", e.getMessage());
            this.matches = List.of();
        }
    }

    // ---- Queries -----------------------------------------------------------

    public List<Map<String, Object>> getLive(String sport) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> m : matches) {
            if (isLive(m) && sportMatches(m, sport)) out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> getUpcoming(String sport, String timeFilter) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> m : matches) {
            if (!isLive(m) && sportMatches(m, sport) && timeMatches(m, timeFilter)) out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> getAll(String sport, String status, String timeFilter) {
        if ("live".equals(status)) return getLive(sport);
        if ("upcoming".equals(status)) return getUpcoming(sport, timeFilter);
        List<Map<String, Object>> out = new ArrayList<>(getLive(sport));
        out.addAll(getUpcoming(sport, timeFilter));
        return out;
    }

    /** Paginated envelope matching the Express /api/matches/upcoming shape. */
    public Map<String, Object> getUpcomingPage(String sport, String timeFilter) {
        List<Map<String, Object>> content = getUpcoming(sport, timeFilter);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("totalElements", content.size());
        res.put("totalPages", 1);
        res.put("size", content.size());
        res.put("number", 0);
        return res;
    }

    public List<Map<String, Object>> search(String query) {
        String q = query == null ? "" : query.toLowerCase();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> m : matches) {
            if (str(m, "team1").toLowerCase().contains(q)
                    || str(m, "team2").toLowerCase().contains(q)
                    || str(m, "league").toLowerCase().contains(q)) {
                out.add(m);
            }
        }
        return out;
    }

    public Optional<Map<String, Object>> getById(String id) {
        return matches.stream().filter(m -> id.equals(m.get("id"))).findFirst();
    }

    // ---- Synthesised sub-resources ----------------------------------------

    @SuppressWarnings("unchecked")
    public Optional<List<Map<String, Object>>> getMarkets(String id) {
        Optional<Map<String, Object>> match = getById(id);
        if (match.isEmpty()) return Optional.empty();

        Map<String, Object> odds = (Map<String, Object>) match.get().getOrDefault("odds", Map.of());
        List<Map<String, Object>> groups = new ArrayList<>();
        groups.add(group("mg-1x2", "1X2 (Match Winner)",
                List.of(market("m-1x2", "1X2", oddsList(odds, "w1", "x", "w2")))));
        groups.add(group("mg-double-chance", "Double Chance",
                List.of(market("m-dc", "Double Chance", oddsList(odds, "x1", "w12", "x2")))));
        groups.add(group("mg-totals", "Total Goals / Points", List.of(
                market("m-total-over", "Total Over", oddsList(odds, "totalOver")),
                market("m-total-under", "Total Under", oddsList(odds, "totalUnder")))));
        return Optional.of(groups);
    }

    public Map<String, Object> getStats(String id) {
        Optional<Map<String, Object>> match = getById(id);
        String score = match.map(m -> num(m, "score1") + ":" + num(m, "score2")).orElse("0:0");
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("matchId", id);
        res.put("possession1", 54);
        res.put("possession2", 46);
        res.put("shotsOnTarget1", 6);
        res.put("shotsOnTarget2", 3);
        res.put("corners1", 7);
        res.put("corners2", 4);
        res.put("fouls1", 9);
        res.put("fouls2", 12);
        res.put("yellowCards1", 1);
        res.put("yellowCards2", 2);
        res.put("redCards1", 0);
        res.put("redCards2", 0);
        res.put("currentScore", score);
        return res;
    }

    public List<Map<String, Object>> getEvents(String id) {
        Optional<Map<String, Object>> match = getById(id);
        String home = match.map(m -> str(m, "team1")).filter(s -> !s.isEmpty()).orElse("Home");
        String away = match.map(m -> str(m, "team2")).filter(s -> !s.isEmpty()).orElse("Away");

        Map<String, Object> ev1 = new LinkedHashMap<>();
        ev1.put("id", "ev-1");
        ev1.put("matchId", id);
        ev1.put("minute", "24");
        ev1.put("type", "goal");
        ev1.put("team", home);
        ev1.put("player", "Player 1");
        ev1.put("description", "Goal scored from inside the penalty area");

        Map<String, Object> ev2 = new LinkedHashMap<>();
        ev2.put("id", "ev-2");
        ev2.put("matchId", id);
        ev2.put("minute", "41");
        ev2.put("type", "yellow_card");
        ev2.put("team", away);
        ev2.put("player", "Player 2");
        ev2.put("description", "Tactical foul in midfield");

        return List.of(ev1, ev2);
    }

    // ---- helpers -----------------------------------------------------------

    private boolean isLive(Map<String, Object> m) {
        return Boolean.TRUE.equals(m.get("isLive"));
    }

    private boolean sportMatches(Map<String, Object> m, String sport) {
        return sport == null || sport.isBlank() || "all".equalsIgnoreCase(sport) || sport.equals(m.get("sport"));
    }

    private boolean timeMatches(Map<String, Object> m, String timeFilter) {
        if (timeFilter == null || timeFilter.isBlank() || "all".equalsIgnoreCase(timeFilter)) return true;
        return timeFilter.equals(m.get("timeCategory"));
    }

    private static List<Object> oddsList(Map<String, Object> odds, String... keys) {
        List<Object> out = new ArrayList<>();
        for (String k : keys) {
            Object v = odds.get(k);
            if (v != null) out.add(v);
        }
        return out;
    }

    private static Map<String, Object> group(String id, String name, List<Map<String, Object>> markets) {
        Map<String, Object> g = new LinkedHashMap<>();
        g.put("id", id);
        g.put("name", name);
        g.put("markets", markets);
        return g;
    }

    private static Map<String, Object> market(String id, String name, List<Object> odds) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("odds", odds);
        return m;
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v == null ? "" : String.valueOf(v);
    }

    private static String num(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v instanceof Number n) {
            return (n.doubleValue() == Math.floor(n.doubleValue())) ? String.valueOf(n.intValue()) : String.valueOf(n);
        }
        return v == null ? "0" : String.valueOf(v);
    }
}
