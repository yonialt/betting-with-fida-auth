package com.fidabet.backend.service;

import com.fidabet.backend.dto.MatchDto;
import com.fidabet.backend.entity.Bet;
import com.fidabet.backend.entity.BetItem;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.entity.WalletTransaction;
import com.fidabet.backend.repository.BetRepository;
import com.fidabet.backend.repository.UserRepository;
import com.fidabet.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Sportsbook settlement engine — the sportsbook's own lifecycle, fully separate from the
 * prediction-market (/api/pm/*) pipeline.
 *
 * Rules:
 * <ul>
 *   <li>A bet is settled ONLY after every one of its matches has actually finished
 *       (period FT/AET/PEN — HT also freezes a final score). A bet whose match has not
 *       started yet, or is still live, can never flip to won/lost. This is the fix for
 *       "won even when the match doesn't start / even when losing".</li>
 *   <li>Each selection is evaluated against the final score of its match:
 *       1X2 (W1/X/W2), Double Chance, Over/Under 2.5, BTTS. Unrecognised markets are
 *       voided individually (odds reset to 1.0) instead of guessing a winner.</li>
 *   <li>All-won bet → status "won", wallet credited potentialWin, ledger row written.
 *       Any-lost bet → status "lost", nothing credited, ledger row written.
 *       Partially decidable accumulators stay active until every leg is decidable.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SportsbookSettlementService {

    private final BetRepository betRepository;
    private final BetService betService;
    private final UserAccountService users;
    private final UserRepository userRepository;
    private final WalletTransactionRepository ledger;

    /** All bets whose match has not finished (any selection undecided). */
    private List<Bet> findActiveBets() {
        return betRepository.findAll().stream()
                .filter(b -> "active".equals(b.getStatus()))
                .toList();
    }

    /** Transactional proxy of this bean — self-invocation would bypass @Transactional. */
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private SportsbookSettlementService self;

    /**
     * Settlement sweep, runs every 60s. Delegates through the transactional proxy
     * (self-invocation would bypass @Transactional and break lazy collection loads).
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void scheduledSettle() {
        int n = self.settleAll();
        if (n > 0) {
            log.info("SPORTSBOOK SETTLE: {} bet(s) settled this sweep", n);
        }
    }

    /**
     * Settle every decidable active bet. Returns the number of bets settled.
     * Orchestrator only (no @Transactional here): each bet is settled in its OWN
     * transaction via the proxy, so one bet's failure can never poison another's
     * Hibernate session (lazy collections load fresh per bet).
     */
    public int settleAll() {
        int settled = 0;
        List<Long> ids = findActiveBets().stream().map(Bet::getId).toList();
        for (Long id : ids) {
            try {
                if (self.settleOneById(id)) settled++;
            } catch (Exception e) {
                log.warn("SPORTSBOOK SETTLE: failed to settle bet id {}: {}", id, e.getMessage());
            }
        }
        return settled;
    }

    /**
     * Settle one bet by primary key inside its own transaction. Public so the
     * sweep can call it through the transactional proxy.
     */
    @Transactional
    public boolean settleOneById(Long betRowId) {
        Bet bet = betRepository.findById(betRowId).orElse(null);
        if (bet == null || !"active".equals(bet.getStatus())) return false;
        return settleOne(bet);
    }

    /**
     * Force-settle a single bet against the current match data (manual admin trigger).
     * Returns a human-readable result description.
     */
    @Transactional
    public Map<String, Object> forceSettle(String betId) {
        Bet bet = betRepository.findByBetId(betId).orElse(null);
        Map<String, Object> res = new LinkedHashMap<>();
        if (bet == null) {
            res.put("error", "Bet not found");
            return res;
        }
        if (!"active".equals(bet.getStatus())) {
            res.put("error", "Bet is already " + bet.getStatus());
            res.put("betId", bet.getBetId());
            res.put("status", bet.getStatus());
            return res;
        }
        boolean done = settleOne(bet);
        res.put("betId", bet.getBetId());
        res.put("settled", done);
        res.put("status", bet.getStatus());
        return res;
    }

    /**
     * Attempt to settle one bet. Returns true if the bet reached a final state.
     */
    private boolean settleOne(Bet bet) {
        List<BetItem> items = bet.getItems();
        if (items == null || items.isEmpty()) return false;

        int wonLegs = 0;
        int lostLegs = 0;
        int pendingLegs = 0;
        List<BetItem> changed = new ArrayList<>();

        for (BetItem item : items) {
            String verdict = evaluateLeg(item);
            if ("pending".equals(verdict)) {
                pendingLegs++;
            } else if ("won".equals(verdict)) {
                wonLegs++;
            } else if ("lost".equals(verdict)) {
                lostLegs++;
            } else if ("void".equals(verdict)) {
                // Market unknown: reset the leg's odds to 1.0 so it neither wins nor loses.
                item.setOdds(java.math.BigDecimal.ONE);
                changed.add(item);
                wonLegs++; // neutral leg — count as "decided, not lost"
            }
        }

        if (pendingLegs > 0) {
            // Some legs still undecidable (match not started / not finished): keep active.
            if (!changed.isEmpty()) betRepository.save(bet);
            return false;
        }

        // Every leg decided.
        User owner = userRepository.findById(bet.getUser().getId()).orElse(bet.getUser());
        Instant now = Instant.now();

        if (lostLegs > 0) {
            bet.setStatus("lost");
            bet.setSettledAt(now);
            bet.setCashoutValue(null);
            betRepository.save(bet);
            recordLedger(owner, bet, "bet_loss", 0.0);
            log.info("SPORTSBOOK SETTLE: bet {} LOST ({} legs lost)", bet.getBetId(), lostLegs);
            return true;
        }

        // All legs won → pay potentialWin.
        double payout = bet.getPotentialWin() != null ? bet.getPotentialWin().doubleValue() : 0.0;
        bet.setStatus("won");
        bet.setSettledAt(now);
        bet.setCashoutValue(null);
        betRepository.save(bet);
        users.credit(owner, payout);
        recordLedger(owner, bet, "bet_payout", payout);
        log.info("SPORTSBOOK SETTLE: bet {} WON, paid {} {}", bet.getBetId(), payout, bet.getCurrency());
        return true;
    }

    /**
     * Evaluate one selection against its match's final score.
     * "pending" → match not finished/not found; "won"/"lost" → decided; "void" → unknown market.
     */
    private String evaluateLeg(BetItem item) {
        if (item.getMatchId() == null) return "void";
        Map<String, Object> score = betService.findFinalScore(item.getMatchId());
        if (score == null) return "pending";
        if (!Boolean.TRUE.equals(score.get("finished"))) return "pending";

        int s1 = ((Number) score.get("score1")).intValue();
        int s2 = ((Number) score.get("score2")).intValue();
        String label = item.getSelectionLabel() != null ? item.getSelectionLabel().trim() : "";
        String market = item.getMarketName() != null ? item.getMarketName().toLowerCase() : "";
        String selection = item.getSelectionName() != null ? item.getSelectionName().toLowerCase() : "";

        // 1X2
        if ("1x2".equals(market) || "1X2 (Full Time Winner)".equalsIgnoreCase(item.getMarketName() == null ? "" : item.getMarketName())) {
            switch (label) {
                case "1": case "W1": return s1 > s2 ? "won" : "lost";
                case "X": return s1 == s2 ? "won" : "lost";
                case "2": case "W2": return s2 > s1 ? "won" : "lost";
                default: return "void";
            }
        }
        // Double Chance
        if (market.contains("double")) {
            switch (label) {
                case "1X": return s1 >= s2 ? "won" : "lost";
                case "X2": return s2 >= s1 ? "won" : "lost";
                case "12": return s1 != s2 ? "won" : "lost";
                default: return "void";
            }
        }
        // Over/Under 2.5
        if (market.contains("total") || market.contains("over/under") || label.startsWith("Over") || label.startsWith("Under")) {
            int total = s1 + s2;
            if (label.startsWith("Over")) return total > 2 ? "won" : "lost";
            if (label.startsWith("Under")) return total < 3 ? "won" : "lost";
            return "void";
        }
        // BTTS
        if (market.contains("btts") || market.contains("both teams") || selection.contains("both teams")) {
            boolean btts = s1 > 0 && s2 > 0;
            if (selection.contains("yes")) return btts ? "won" : "lost";
            if (selection.contains("no")) return btts ? "lost" : "won";
            return "void";
        }

        return "void";
    }

    /** Wallet ledger row for a settlement (same table the wallet page reads). */
    private void recordLedger(User owner, Bet bet, String type, double amount) {
        try {
            WalletTransaction tx = WalletTransaction.builder()
                    .user(owner)
                    .type(type)
                    .amount(java.math.BigDecimal.valueOf(Math.round(amount * 100.0) / 100.0))
                    .currency(bet.getCurrency() != null ? bet.getCurrency() : "ETB")
                    .status("completed")
                    .paymentMethod("wallet")
                    .timestamp(Instant.now())
                    .transactionReference("TX-SB-" + (100000 + ThreadLocalRandom.current().nextInt(900000)))
                    .notes("Sportsbook bet " + bet.getBetId() + (amount > 0 ? " won" : " lost"))
                    .build();
            ledger.save(tx);
        } catch (Exception e) {
            log.warn("SPORTSBOOK SETTLE: ledger row failed for {}: {}", bet.getBetId(), e.getMessage());
        }
    }
}
