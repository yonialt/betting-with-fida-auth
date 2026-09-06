package com.fidabet.backend.controller;

import com.fidabet.backend.dto.MarketGroupDto;
import com.fidabet.backend.dto.MatchDto;
import com.fidabet.backend.service.ApiFootballService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/football")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ApiFootballController {

    private final ApiFootballService apiFootballService;

    @GetMapping("/fixtures/live")
    public ResponseEntity<List<MatchDto>> getLiveFixtures(
            @RequestParam(name = "sport", defaultValue = "all") String sport) {
        List<MatchDto> matches = apiFootballService.getLiveMatches(sport);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/fixtures/upcoming")
    public ResponseEntity<List<MatchDto>> getUpcomingFixtures(
            @RequestParam(name = "sport", defaultValue = "all") String sport) {
        List<MatchDto> matches = apiFootballService.getUpcomingMatches(sport);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/matches/{matchId}/markets")
    public ResponseEntity<List<MarketGroupDto>> getMatchMarkets(
            @PathVariable("matchId") String matchId) {
        List<MarketGroupDto> markets = apiFootballService.getMatchMarkets(matchId);
        return ResponseEntity.ok(markets);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> forceSync() {
        Map<String, Object> result = apiFootballService.forceSyncAllCaches();
        return ResponseEntity.ok(result);
    }
}
