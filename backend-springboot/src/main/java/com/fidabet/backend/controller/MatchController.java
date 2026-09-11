package com.fidabet.backend.controller;

import com.fidabet.backend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Sportsbook match & odds endpoints (/api/matches/*). Public — matches are loaded by the client on
 * boot as a guest. Literal sub-paths (live, upcoming, search) take precedence over the {id} pattern.
 */
@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matches;

    public MatchController(MatchService matches) {
        this.matches = matches;
    }

    @GetMapping
    public List<Map<String, Object>> all(
            @RequestParam(defaultValue = "all") String sport,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String timeFilter) {
        return matches.getAll(sport, status, timeFilter);
    }

    @GetMapping("/live")
    public List<Map<String, Object>> live(@RequestParam(defaultValue = "all") String sport) {
        return matches.getLive(sport);
    }

    @GetMapping("/upcoming")
    public Map<String, Object> upcoming(
            @RequestParam(defaultValue = "all") String sport,
            @RequestParam(defaultValue = "all") String timeFilter) {
        return matches.getUpcomingPage(sport, timeFilter);
    }

    @GetMapping("/search")
    public List<Map<String, Object>> search(@RequestParam(defaultValue = "") String query) {
        return matches.search(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable String id) {
        return matches.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Match not found")));
    }

    @GetMapping("/{id}/markets")
    public ResponseEntity<?> markets(@PathVariable String id) {
        return matches.getMarkets(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Match not found")));
    }

    @GetMapping("/{id}/stats")
    public Map<String, Object> stats(@PathVariable String id) {
        return matches.getStats(id);
    }

    @GetMapping("/{id}/events")
    public List<Map<String, Object>> events(@PathVariable String id) {
        return matches.getEvents(id);
    }
}
