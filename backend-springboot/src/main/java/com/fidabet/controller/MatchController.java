package com.fidabet.controller;

import com.fidabet.dto.MatchDTOs;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.MatchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/live")
    public ResponseEntity<List<MatchDTOs.MatchDto>> getLiveMatches(
            @RequestParam(required = false, defaultValue = "all") String sport,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        List<MatchDTOs.MatchDto> matches = matchService.getLiveMatches(sport, userId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Page<MatchDTOs.MatchDto>> getUpcomingMatches(
            @RequestParam(required = false, defaultValue = "all") String sport,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        Page<MatchDTOs.MatchDto> matches = matchService.getUpcomingMatches(sport, pageable, userId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDTOs.MatchDto> getMatch(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        MatchDTOs.MatchDto match = matchService.getMatchDetails(id, userId);
        return ResponseEntity.ok(match);
    }

    @GetMapping("/{id}/markets")
    public ResponseEntity<List<MatchDTOs.MarketGroupDto>> getMatchMarkets(@PathVariable String id) {
        List<MatchDTOs.MarketGroupDto> markets = matchService.getMatchMarkets(id);
        return ResponseEntity.ok(markets);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<MatchDTOs.MatchStatsDto> getMatchStats(@PathVariable String id) {
        MatchDTOs.MatchStatsDto stats = matchService.getMatchStats(id);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<MatchDTOs.LiveMatchEventDto>> getMatchEvents(@PathVariable String id) {
        List<MatchDTOs.LiveMatchEventDto> events = matchService.getMatchEvents(id);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<MatchDTOs.MatchDto>> searchMatches(
            @RequestParam String query,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : null;
        List<MatchDTOs.MatchDto> matches = matchService.searchMatches(query, userId);
        return ResponseEntity.ok(matches);
    }
}
