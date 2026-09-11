package com.fidabet.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.backend.model.BetSlipItem;
import com.fidabet.backend.model.PlacedBet;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Betting operations, ported from the Express /api/bets/* routes. Reproduces the total-odds and
 * potential-win arithmetic, the cashout crediting, and the bet lifecycle exactly; balance changes
 * are delegated to {@link UserAccountService}.
 */
@Service
public class BetService {

    private final UserAccountService users;
    private final ObjectMapper objectMapper;
    private final List<PlacedBet> placedBets = new ArrayList<>();

    public BetService(UserAccountService users, ObjectMapper objectMapper) {
        this.users = users;
        this.objectMapper = objectMapper;
        // Seed bet mirrors the record the Express server started with.
        placedBets.add(PlacedBet.builder()
                .id("BET-849201")
                .placedAt("10 mins ago")
                .type("single")
                .items(List.of(BetSlipItem.builder()
                        .id("ger1-w1-init").matchId("ger-1").matchCode("155234")
                        .league("Germany. Bundesliga")
                        .matchTitle("Bayern München - Borussia Dortmund")
                        .currentScore("2:0").marketName("1X2").selectionName("Bayern München")
                        .selectionLabel("W1").odds(1.3).isLive(true).build()))
                .totalOdds(1.3).stake(100).potentialWin(130).currency("ETB")
                .status("active").cashoutValue(122.5).build());
    }

    /**
     * Place a bet. Returns the created {@link PlacedBet}, or {@code null} on a validation failure —
     * the reason is supplied through {@code failureReason} so the controller can pick the message.
     */
    public synchronized PlacedBet place(double stake, String betType, List<?> rawItems, String[] failureReason) {
        if (stake <= 0) {
            failureReason[0] = "Invalid stake amount";
            return null;
        }
        if (users.balance() < stake) {
            failureReason[0] = "Insufficient balance";
            return null;
        }

        List<BetSlipItem> items = objectMapper.convertValue(
                rawItems == null ? Collections.emptyList() : rawItems,
                new TypeReference<List<BetSlipItem>>() {});

        users.tryDebit(stake);

        double totalOdds = 1.0;
        for (BetSlipItem it : items) {
            totalOdds *= it.getOdds();
        }
        double potentialWin = round2(stake * totalOdds);

        PlacedBet bet = PlacedBet.builder()
                .id("BET-" + (100000 + ThreadLocalRandom.current().nextInt(900000)))
                .placedAt("Just now")
                .type(betType == null ? "single" : betType)
                .items(items)
                .totalOdds(round2(totalOdds))
                .stake(stake)
                .potentialWin(potentialWin)
                .currency(users.currency())
                .status("active")
                .cashoutValue(round2(stake * 0.95))
                .build();

        placedBets.add(0, bet);
        return bet;
    }

    public synchronized List<PlacedBet> history(String status) {
        List<PlacedBet> list = new ArrayList<>(placedBets);
        if (status != null && !status.isBlank()) {
            list.removeIf(b -> !status.equals(b.getStatus()));
        }
        return list;
    }

    public synchronized Optional<PlacedBet> findById(String id) {
        return placedBets.stream().filter(b -> b.getId().equals(id)).findFirst();
    }

    /**
     * Cash out a bet. Returns the SUCCESS envelope; or {@code null} when the bet is missing
     * (controller -> 404) or not active (controller distinguishes via {@link #findById}).
     */
    public synchronized Map<String, Object> cashout(String id, String[] failureReason) {
        Optional<PlacedBet> found = findById(id);
        if (found.isEmpty()) {
            failureReason[0] = "NOT_FOUND";
            return null;
        }
        PlacedBet bet = found.get();
        if (!"active".equals(bet.getStatus())) {
            failureReason[0] = "NOT_ACTIVE";
            return null;
        }
        bet.setStatus("cashed_out");
        double newBalance = users.credit(bet.getCashoutValue() == null ? 0 : bet.getCashoutValue());
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("betId", bet.getId());
        res.put("cashoutValue", bet.getCashoutValue());
        res.put("newBalance", newBalance);
        return res;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
