package com.fidabet.backend.controller;

import com.fidabet.backend.service.PredictionMarketTradingService;
import com.fidabet.backend.service.UserAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Prediction-market trading endpoints (/api/pm/*). Token-protected via the
 * WebConfig filter registration — every request resolves the acting user from the
 * bearer token. This pipeline is fully separate from the sportsbook /api/bets/* flow.
 *
 * <ul>
 *   <li>{@code POST /api/pm/orders}          — confirmed BUY / SELL order</li>
 *   <li>{@code GET  /api/pm/positions}       — open positions</li>
 *   <li>{@code GET  /api/pm/history}         — settled positions (won/lost/closed)</li>
 *   <li>{@code GET  /api/pm/activity}        — trade ledger feed</li>
 *   <li>{@code GET  /api/pm/portfolio}       — portfolio summary</li>
 *   <li>{@code GET  /api/pm/markets/{id}}    — backend market status</li>
 *   <li>{@code POST /api/pm/markets/{id}/status} — admin: open/close a market</li>
 *   <li>{@code POST /api/pm/markets/resolve} — admin: resolve + settle positions</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/pm")
public class PredictionMarketController {

    private final PredictionMarketTradingService trading;
    private final UserAccountService users;

    public PredictionMarketController(PredictionMarketTradingService trading, UserAccountService users) {
        this.trading = trading;
        this.users = users;
    }

    public record OrderRequest(
            String action,       // BUY | SELL
            String marketId,
            String marketTitle,
            String category,
            String side,         // yes | no
            String outcomeName,
            Integer priceCents,
            Double amount,       // ETB, BUY
            Double shares        // SELL
    ) {}

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) OrderRequest req) {
        if (req == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
        }
        var user = users.resolveUser(bearer(authorization));
        String[] reason = new String[1];

        String action = req.action() == null ? "BUY" : req.action().trim().toUpperCase();
        if ("BUY".equals(action)) {
            Map<String, Object> result = trading.buy(user, req.marketId(), req.marketTitle(), req.category(),
                    req.side(), req.outcomeName(),
                    req.priceCents() == null ? -1 : req.priceCents(),
                    req.amount() == null ? 0 : req.amount(),
                    reason);
            if (result == null) {
                return ResponseEntity.badRequest().body(Map.of("error", reason[0]));
            }
            return ResponseEntity.ok(result);
        }
        if ("SELL".equals(action)) {
            Map<String, Object> result = trading.sell(user, req.marketId(), req.side(),
                    req.priceCents() == null ? -1 : req.priceCents(),
                    req.shares() == null ? 0 : req.shares(),
                    reason);
            if (result == null) {
                return ResponseEntity.badRequest().body(Map.of("error", reason[0]));
            }
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(Map.of("error", "action must be BUY or SELL"));
    }

    @GetMapping("/positions")
    public List<Map<String, Object>> positions(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return trading.openPositions(users.resolveUser(bearer(authorization)));
    }

    @GetMapping("/history")
    public List<Map<String, Object>> history(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return trading.positionHistory(users.resolveUser(bearer(authorization)));
    }

    @GetMapping("/activity")
    public List<Map<String, Object>> activity(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "limit", defaultValue = "50") int limit) {
        return trading.activity(users.resolveUser(bearer(authorization)), limit);
    }

    @GetMapping("/portfolio")
    public Map<String, Object> portfolio(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return trading.portfolio(users.resolveUser(bearer(authorization)));
    }

    /** Backend market status for validation-aware UIs. */
    @GetMapping("/markets/{marketId}")
    public ResponseEntity<?> marketStatus(@PathVariable String marketId) {
        return trading.marketStatus(marketId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Unknown market")));
    }

    public record StatusRequest(String status) {}   // OPEN | CLOSED

    /** Admin: open or close a market for trading. */
    @PostMapping("/markets/{marketId}/status")
    public ResponseEntity<?> setMarketStatus(
            @PathVariable String marketId,
            @RequestBody StatusRequest req) {
        Map<String, Object> m = trading.setMarketStatus(marketId, req == null ? null : req.status());
        if (m == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "status must be OPEN or CLOSED"));
        }
        return ResponseEntity.ok(m);
    }

    public record ResolveRequest(String winningSide) {}

    /** Admin: resolve a market to a winning side; settles every open position. */
    @PostMapping("/markets/{marketId}/resolve")
    public ResponseEntity<?> resolve(
            @PathVariable String marketId,
            @RequestBody(required = false) ResolveRequest req) {
        String[] reason = new String[1];
        Map<String, Object> summary = trading.resolveMarket(marketId, req == null ? null : req.winningSide(), reason);
        if (summary == null) {
            return ResponseEntity.badRequest().body(Map.of("error", reason[0]));
        }
        return ResponseEntity.ok(summary);
    }

    private static String bearer(String authorization) {
        return (authorization != null && authorization.startsWith("Bearer "))
                ? authorization.substring("Bearer ".length()) : "";
    }
}
