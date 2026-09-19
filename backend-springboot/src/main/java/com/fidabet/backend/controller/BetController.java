package com.fidabet.backend.controller;

import com.fidabet.backend.model.PlacedBet;
import com.fidabet.backend.service.BetService;
import com.fidabet.backend.service.UserAccountService;
import com.fidabet.backend.support.Bodies;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Betting endpoints (/api/bets/*). Protected by the token filter. */
@RestController
@RequestMapping("/api/bets")
public class BetController {

    private final BetService bets;
    private final UserAccountService users;
    private final com.fidabet.backend.service.SportsbookSettlementService settlement;

    public BetController(BetService bets, UserAccountService users,
                         com.fidabet.backend.service.SportsbookSettlementService settlement) {
        this.bets = bets;
        this.users = users;
        this.settlement = settlement;
    }

    @PostMapping("/place")
    public ResponseEntity<?> place(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) Map<String, Object> body) {
        double stake = Bodies.toDouble(body, "stake", 0);
        String betType = Bodies.toStr(body, "betType", null);
        Object itemsRaw = body == null ? null : body.get("items");
        List<?> items = (itemsRaw instanceof List<?> l) ? l : null;

        String[] reason = new String[1];
        PlacedBet bet = bets.place(users.resolveUser(bearer(authorization)), stake, betType, items, reason);
        if (bet == null) {
            return ResponseEntity.badRequest().body(Map.of("error", reason[0]));
        }
        return ResponseEntity.ok(bet);
    }

    @GetMapping("/history")
    public List<PlacedBet> history(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "status", required = false) String status) {
        return bets.history(users.resolveUser(bearer(authorization)), status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        Optional<PlacedBet> bet = bets.findById(id);
        return bet.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Bet not found")));
    }

    @PostMapping("/{id}/cashout")
    public ResponseEntity<?> cashout(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id) {
        String[] reason = new String[1];
        Map<String, Object> result = bets.cashout(users.resolveUser(bearer(authorization)), id, reason);
        if (result == null) {
            if ("NOT_FOUND".equals(reason[0])) {
                return ResponseEntity.status(404).body(Map.of("error", "Bet not found"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Bet cannot be cashed out"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/cashout-value")
    public ResponseEntity<?> cashoutValue(@PathVariable String id) {
        return bets.findById(id)
                .<ResponseEntity<?>>map(b -> ResponseEntity.ok(Map.of("cashoutValue", b.getCashoutValue())))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Bet not found")));
    }

    /** Final score snapshot for a match (finished flag included) — used by the settlement UI/tests. */
    @GetMapping("/matches/{matchId}/result")
    public ResponseEntity<?> matchResult(@PathVariable String matchId) {
        Map<String, Object> score = bets.findFinalScore(matchId);
        if (score == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Match not found"));
        }
        return ResponseEntity.ok(score);
    }

    /** Manual settlement trigger (single bet): settles immediately if decidable. */
    @PostMapping("/settle/{betId}")
    public ResponseEntity<?> settleOne(@PathVariable String betId) {
        return ResponseEntity.ok(settlement.forceSettle(betId));
    }

    /** Manual settlement sweep (all active bets). */
    @PostMapping("/settle")
    public ResponseEntity<?> settleAll() {
        int n = settlement.settleAll();
        return ResponseEntity.ok(Map.of("settled", n));
    }

    private static String bearer(String authorization) {
        return (authorization != null && authorization.startsWith("Bearer "))
                ? authorization.substring("Bearer ".length()) : "";
    }
}
