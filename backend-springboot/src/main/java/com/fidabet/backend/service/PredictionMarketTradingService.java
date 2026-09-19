package com.fidabet.backend.service;

import com.fidabet.backend.entity.PmMarketRegistry;
import com.fidabet.backend.entity.PmPosition;
import com.fidabet.backend.entity.PmTrade;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.entity.WalletTransaction;
import com.fidabet.backend.repository.PmMarketRegistryRepository;
import com.fidabet.backend.repository.PmPositionRepository;
import com.fidabet.backend.repository.PmTradeRepository;
import com.fidabet.backend.repository.UserRepository;
import com.fidabet.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Prediction-market trading — a business domain fully separate from the sportsbook.
 * No Bet/BetItem/odds-accumulator logic is used or touched.
 *
 * Trading model (a market, not a bet slip):
 * <ol>
 *   <li>BUY  — opens/extends an ACTIVE position at the authoritative market price.
 *              Balance is debited; cost basis and average entry are recorded.</li>
 *   <li>PRICE MOVEMENT — every OPEN market carries a live YES price (PmPriceService);
 *              open positions are valued at that price for unrealized P/L.</li>
 *   <li>SELL — voluntary exit BEFORE resolution, any number of shares. Proceeds are
 *              credited immediately, realized P/L is booked for the sold lots, and the
 *              position stays ACTIVE with the remaining shares (partial sell) or closes.</li>
 *   <li>RESOLUTION — a separate operation: settles whatever is still OPEN when the
 *              market resolves. Sells are never touched by resolution.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionMarketTradingService {

    private final PmPositionRepository positions;
    private final PmTradeRepository trades;
    private final PmMarketRegistryRepository registry;
    private final WalletTransactionRepository ledger;
    private final UserRepository userRepository;
    private final UserAccountService users;
    private final PmPriceService priceService;

    private static final double MIN_ORDER_ETB = 1.0;
    private static final double MAX_ORDER_ETB = 1_000_000.0;

    // ------------------------------------------------------------------
    // BUY  — open / extend an ACTIVE position
    // ------------------------------------------------------------------

    /**
     * Execute a confirmed BUY. Returns the authoritative result map, or null with
     * failureReason set when any validation step fails.
     */
    @Transactional
    public Map<String, Object> buy(User user, String marketId, String marketTitle, String category,
                                   String side, String outcomeName, int priceCents, double amount,
                                   String[] failureReason) {

        // 1. Validate market id / side format
        if (marketId == null || marketId.isBlank()) {
            failureReason[0] = "Market is required";
            return null;
        }
        String normSide = normalizeSide(side);
        if (normSide == null) {
            failureReason[0] = "Invalid outcome: choose YES or NO";
            return null;
        }

        // 2. Validate the market against the backend registry (validates outcome too)
        PmMarketRegistry market = upsertMarket(marketId, marketTitle, category, outcomeName);
        if (!"OPEN".equals(market.getStatus())) {
            failureReason[0] = "Market is not open for trading";
            return null;
        }
        if (!market.isBinaryOutcomes()) {
            failureReason[0] = "Market outcome is not tradable";
            return null;
        }

        // 3. Validate price sanity (UI-provided; execution uses the authoritative price)
        if (priceCents < 1 || priceCents > 99) {
            failureReason[0] = "Invalid price: must be between 1% and 99%";
            return null;
        }

        // 4. Validate amount
        if (!Double.isFinite(amount) || amount < MIN_ORDER_ETB) {
            failureReason[0] = "Minimum trade amount is " + MIN_ORDER_ETB + " ETB";
            return null;
        }
        if (amount > MAX_ORDER_ETB) {
            failureReason[0] = "Maximum trade amount is " + MAX_ORDER_ETB + " ETB";
            return null;
        }

        // 5. Check balance + debit atomically (check-and-debit in one SQL statement)
        if (!users.tryDebit(user, amount)) {
            failureReason[0] = "Insufficient balance";
            return null;
        }

        // 6. Execute at the authoritative market price (executedPrice — the price the
        //    market actually quotes now), then let this order move the market.
        int executedPrice = priceService.sidePriceCentsMutable(market, normSide);
        double shares = round4(amount / (executedPrice / 100.0));
        priceService.applyTradeImpact(market, normSide, true, shares);

        PmPosition pos = upsertPositionOnBuy(user, market, normSide, outcomeName, executedPrice, shares, amount);
        PmTrade trade = recordTrade(user, market, normSide, pos.getOutcomeName(), "BUY", shares, executedPrice, amount);

        // 7. Wallet ledger transaction
        recordLedger(user, "pm_purchase", amount,
                "Prediction market: " + trade.getReference() + " — " + shares + " × " + normSide.toUpperCase());

        double newBalance = users.balance(userRepository.findById(user.getId()).orElse(user));

        log.info("PM BUY: user {} bought {} {} shares of '{}' at {}c for {} ETB (ref {})",
                user.getId(), shares, normSide, marketId, executedPrice, round2(amount), trade.getReference());

        // 8. Authoritative result — balance re-read from the DB after the debit
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "FILLED");
        result.put("reference", trade.getReference());
        result.put("action", "BUY");
        result.put("marketId", marketId);
        result.put("marketTitle", pos.getMarketTitle());
        result.put("side", normSide);
        result.put("outcomeName", pos.getOutcomeName());
        result.put("shares", shares);
        result.put("priceCents", executedPrice);
        result.put("amount", round2(amount));
        result.put("positionShares", pos.getShares().doubleValue());
        result.put("avgPriceCents", pos.getAvgPriceCents().doubleValue());
        result.put("currentPriceCents", priceService.sidePriceCents(market, normSide));
        result.put("balance", newBalance);
        result.put("executedAt", trade.getExecutedAt().toString());
        return result;
    }

    // ------------------------------------------------------------------
    // SELL — voluntary exit of ACTIVE shares at the live market price
    // ------------------------------------------------------------------

    /**
     * Sell any number of held shares at the current market price — BEFORE resolution.
     * Proceeds are credited immediately; realized P/L is booked for the sold lots;
     * remaining shares (if any) stay ACTIVE and keep tracking the market price.
     */
    @Transactional
    public Map<String, Object> sell(User user, String marketId, String side, int priceCents,
                                    double sharesToSell, String[] failureReason) {
        String normSide = normalizeSide(side);
        if (marketId == null || marketId.isBlank() || normSide == null) {
            failureReason[0] = "Market and side are required";
            return null;
        }
        if (priceCents < 1 || priceCents > 99) {
            failureReason[0] = "Invalid price: must be between 1% and 99%";
            return null;
        }
        if (!Double.isFinite(sharesToSell) || sharesToSell <= 0) {
            failureReason[0] = "Invalid share amount";
            return null;
        }

        // The market must still be tradable — no sells after resolution.
        PmMarketRegistry market = registry.findByMarketId(marketId).orElse(null);
        if (market == null) {
            failureReason[0] = "Unknown market: " + marketId;
            return null;
        }
        if (!"OPEN".equals(market.getStatus())) {
            failureReason[0] = "Market is not open for trading";
            return null;
        }

        // Position must be ACTIVE with enough shares. Rejects: selling more than
        // owned, selling a CLOSED/SETTLED position, negative positions.
        Optional<PmPosition> existing = positions.findByUser_IdAndMarketIdAndSide(user.getId(), marketId, normSide);
        if (existing.isEmpty() || !"open".equals(existing.get().getStatus())) {
            failureReason[0] = "No open position on this outcome";
            return null;
        }
        PmPosition pos = existing.get();
        if (pos.getShares() == null || pos.getShares().signum() <= 0) {
            failureReason[0] = "No open position on this outcome";
            return null;
        }
        if (BigDecimal.valueOf(sharesToSell).compareTo(pos.getShares()) > 0) {
            failureReason[0] = "Insufficient shares: you hold " + pos.getShares().stripTrailingZeros().toPlainString();
            return null;
        }

        // Execute at the authoritative market price, then let the sell move it.
        int executedPrice = priceService.sidePriceCentsMutable(market, normSide);
        priceService.applyTradeImpact(market, normSide, false, sharesToSell);

        // Accounting: proceeds at market price; cost removed at the position's avg entry.
        double proceeds = round2(sharesToSell * executedPrice / 100.0);
        double costRemoved = round2(pos.getAvgPriceCents().doubleValue() / 100.0 * sharesToSell);
        double realizedPnl = round2(proceeds - costRemoved);

        BigDecimal newShares = pos.getShares().subtract(BigDecimal.valueOf(sharesToSell));
        pos.setShares(newShares);
        pos.setCostBasis(BigDecimal.valueOf(round2(Math.max(0, pos.getCostBasis().doubleValue() - costRemoved))));
        pos.setLastPriceCents(BigDecimal.valueOf(executedPrice));
        // Bank the realized P/L on the position (survives partial sells).
        pos.setRealizedPnl(BigDecimal.valueOf(round2(
                (pos.getRealizedPnl() != null ? pos.getRealizedPnl().doubleValue() : 0.0) + realizedPnl)));
        boolean fullyClosed = newShares.signum() == 0;
        if (fullyClosed) {
            pos.setStatus("closed");
            pos.setResolvedAt(Instant.now()); // exit time (not market resolution)
        }
        pos = positions.save(pos);

        users.credit(user, proceeds);

        PmTrade trade = recordTrade(user, market, normSide, pos.getOutcomeName(), "SELL", sharesToSell, executedPrice, proceeds);
        recordLedger(user, "pm_sale", proceeds,
                "Prediction market sell: " + trade.getReference() + " — " + sharesToSell + " × " + normSide.toUpperCase());

        log.info("PM SELL: user {} sold {} {} shares of '{}' at {}c for {} ETB (realized {}, ref {})",
                user.getId(), sharesToSell, normSide, marketId, executedPrice, proceeds, realizedPnl, trade.getReference());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "FILLED");
        result.put("reference", trade.getReference());
        result.put("action", "SELL");
        result.put("marketId", marketId);
        result.put("marketTitle", pos.getMarketTitle());
        result.put("side", normSide);
        result.put("outcomeName", pos.getOutcomeName());
        result.put("shares", sharesToSell);
        result.put("priceCents", executedPrice);
        result.put("amount", proceeds);
        result.put("realizedPnl", realizedPnl);
        result.put("positionShares", pos.getShares().doubleValue());
        result.put("positionStatus", pos.getStatus());
        result.put("positionClosed", fullyClosed);
        result.put("currentPriceCents", priceService.sidePriceCents(market, normSide));
        result.put("balance", users.balance(userRepository.findById(user.getId()).orElse(user)));
        result.put("executedAt", trade.getExecutedAt().toString());
        return result;
    }

    // ------------------------------------------------------------------
    // RESOLUTION — a separate operation from selling
    // ------------------------------------------------------------------

    /**
     * Resolve a market to a winning side. Only positions that are still OPEN are
     * settled: winners are credited 1.00 ETB per share, losers are written off.
     * Positions the user already SOLD (closed) are never touched again.
     */
    @Transactional
    public Map<String, Object> resolveMarket(String marketId, String winningSide, String[] failureReason) {
        String normSide = normalizeSide(winningSide);
        if (marketId == null || marketId.isBlank() || normSide == null) {
            failureReason[0] = "marketId and winningSide ('yes'|'no') are required";
            return null;
        }

        PmMarketRegistry market = registry.findByMarketId(marketId).orElse(null);
        if (market == null) {
            failureReason[0] = "Unknown market: " + marketId;
            return null;
        }
        if (market.getStatus().startsWith("RESOLVED")) {
            failureReason[0] = "Market is already resolved";
            return null;
        }
        market.setStatus("RESOLVED_" + normSide.toUpperCase());
        market.setWinningSide(normSide);
        market.setResolvedAt(Instant.now());
        // Final price: winners settle at 100, losers at 0.
        market.setLastPriceCents("yes".equals(normSide) ? 100 : 0);
        market.setLastPriceChangedAt(Instant.now());
        registry.save(market);

        List<PmPosition> open = positions.findByMarketIdAndStatus(marketId, "open");
        int settled = 0;
        double totalPaid = 0;

        for (PmPosition pos : open) {
            if (pos.getShares() == null || pos.getShares().signum() <= 0) {
                pos.setStatus("closed");
                if (pos.getResolvedAt() == null) pos.setResolvedAt(Instant.now());
                positions.save(pos);
                continue;
            }
            boolean won = pos.getSide().equals(normSide);
            double payout = won ? round2(pos.getShares().doubleValue()) : 0.0;
            double costBasis = pos.getCostBasis() != null ? pos.getCostBasis().doubleValue() : 0.0;
            double settledPnl = won ? round2(payout - costBasis) : round2(-costBasis);

            pos.setStatus(won ? "won" : "lost");
            pos.setLastPriceCents(BigDecimal.valueOf(won ? 100 : 0));
            pos.setResolvedAt(Instant.now());
            pos.setRealizedPnl(BigDecimal.valueOf(round2(
                    (pos.getRealizedPnl() != null ? pos.getRealizedPnl().doubleValue() : 0.0)
                            + (won ? settledPnl : -costBasis))));
            positions.save(pos);

            // pos.getUser() is a lazy proxy that is detached when handed to other
            // transactional helpers (credit/currency) — re-fetch a fully loaded owner.
            User owner = userRepository.findById(pos.getUser().getId()).orElse(pos.getUser());

            recordTrade(owner, market, pos.getSide(), pos.getOutcomeName(),
                    won ? "RESOLVE_WIN" : "RESOLVE_LOSS",
                    pos.getShares().doubleValue(), won ? 100 : -1, payout);

            if (won) {
                users.credit(owner, payout);
                recordLedger(owner, "pm_payout", payout,
                        "Prediction market win: " + pos.getMarketTitle() + " — " + pos.getOutcomeName());
                totalPaid += payout;
            }
            settled++;
        }

        log.info("PM RESOLVE: market {} -> {}; {} positions settled, {} ETB paid",
                marketId, normSide, settled, round2(totalPaid));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("marketId", marketId);
        summary.put("winningSide", normSide);
        summary.put("settledPositions", settled);
        summary.put("totalPaidOut", round2(totalPaid));
        return summary;
    }

    // ------------------------------------------------------------------
    // Market registry (status management)
    // ------------------------------------------------------------------

    /** Backend view of a market's trading status, including the live price. */
    @Transactional(readOnly = true)
    public java.util.Optional<Map<String, Object>> marketStatus(String marketId) {
        return registry.findByMarketId(marketId).map(m -> {
            int yes = priceService.currentYesPriceCents(m);
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("marketId", m.getMarketId());
            r.put("marketTitle", m.getMarketTitle());
            r.put("status", m.getStatus());
            r.put("winningSide", m.getWinningSide());
            r.put("yesPriceCents", yes);
            r.put("noPriceCents", 100 - yes);
            r.put("lastPriceChangedAt", m.getLastPriceChangedAt() != null ? m.getLastPriceChangedAt().toString() : null);
            r.put("registeredAt", m.getRegisteredAt().toString());
            return r;
        });
    }

    /** Admin: flip a market OPEN/CLOSED. Returns null on invalid status. */
    @Transactional
    public Map<String, Object> setMarketStatus(String marketId, String status) {
        if (status == null || !("OPEN".equalsIgnoreCase(status.trim()) || "CLOSED".equalsIgnoreCase(status.trim()))) {
            return null;
        }
        String norm = status.trim().toUpperCase();
        PmMarketRegistry m = registry.findByMarketId(marketId).orElse(null);
        if (m == null) {
            m = PmMarketRegistry.builder()
                    .marketId(marketId)
                    .marketTitle(marketId)
                    .status(norm)
                    .binaryOutcomes(true)
                    .registeredAt(Instant.now())
                    .build();
        } else {
            m.setStatus(norm);
        }
        m = registry.save(m);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("marketId", m.getMarketId());
        r.put("status", m.getStatus());
        return r;
    }

    // ------------------------------------------------------------------
    // Portfolio queries (prediction-market domain only)
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Map<String, Object>> openPositions(User user) {
        List<PmPosition> open = positions.findOpenByUserId(user.getId());
        Map<String, PmMarketRegistry> markets = registryMapFor(open);
        return open.stream().map(p -> positionMap(p, false, markets)).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> positionHistory(User user) {
        List<PmPosition> hist = positions.findHistoryByUserId(user.getId());
        Map<String, PmMarketRegistry> markets = registryMapFor(hist);
        return hist.stream().map(p -> positionMap(p, true, markets)).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> activity(User user, int limit) {
        int safe = Math.min(Math.max(limit, 1), 200);
        return trades.findRecentByUserId(user.getId(), org.springframework.data.domain.PageRequest.of(0, safe))
                .stream().map(this::tradeMap).toList();
    }

    /**
     * Portfolio summary. Open positions are valued at the LIVE market price
     * (unrealized P/L moves with the market, independent of resolution);
     * realized P/L comes from each position's booked realizedPnl (sells +
     * settlements), so nothing is double counted.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> portfolio(User user) {
        List<PmPosition> open = positions.findOpenByUserId(user.getId());
        List<PmPosition> history = positions.findHistoryByUserId(user.getId());
        Map<String, PmMarketRegistry> markets = registryMapFor(open);

        double openCost = 0, openValue = 0;
        for (PmPosition p : open) {
            openCost += p.getCostBasis() != null ? p.getCostBasis().doubleValue() : 0.0;
            int curPrice = liveSidePrice(p, markets);
            openValue += p.getShares().doubleValue() * curPrice / 100.0;
        }
        double realized = 0;
        int won = 0, lost = 0, closed = 0;
        for (PmPosition p : history) {
            switch (p.getStatus()) {
                case "won" -> won++;
                case "lost" -> lost++;
                case "closed" -> closed++;
                default -> { }
            }
            realized += p.getRealizedPnl() != null ? p.getRealizedPnl().doubleValue() : 0.0;
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("openPositions", open.size());
        m.put("openCost", round2(openCost));
        m.put("openValue", round2(openValue));
        m.put("unrealizedPnl", round2(openValue - openCost));
        m.put("won", won);
        m.put("lost", lost);
        m.put("closed", closed);
        m.put("realizedPnl", round2(realized));
        m.put("cash", users.balance(userRepository.findById(user.getId()).orElse(user)));
        m.put("currency", users.currency(user));
        return m;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** Registry rows for the given positions, keyed by marketId (one query). */
    private Map<String, PmMarketRegistry> registryMapFor(List<PmPosition> list) {
        Map<String, PmMarketRegistry> map = new HashMap<>();
        for (PmPosition p : list) {
            if (p.getMarketId() != null && !map.containsKey(p.getMarketId())) {
                registry.findByMarketId(p.getMarketId()).ifPresent(m -> map.put(p.getMarketId(), m));
            }
        }
        return map;
    }

    /** Live side price for a position: the market's current quote (fallback: last seen / avg). */
    private int liveSidePrice(PmPosition p, Map<String, PmMarketRegistry> markets) {
        PmMarketRegistry m = markets.get(p.getMarketId());
        if (m != null && !"OPEN".equals(m.getStatus())) {
            // Resolved/closed markets are frozen at their final price.
            return priceService.sidePriceCents(m, p.getSide());
        }
        if (m != null) {
            return priceService.sidePriceCents(m, p.getSide());
        }
        return p.getLastPriceCents() != null ? p.getLastPriceCents().intValue() : p.getAvgPriceCents().intValue();
    }

    /**
     * Validate-or-register the market. Markets shown in the UI are upserted from
     * trusted authenticated order traffic, so backend validation and the UI stay
     * in sync. New markets start OPEN with a seeded YES price.
     */
    private PmMarketRegistry upsertMarket(String marketId, String title, String category, String outcomeName) {
        PmMarketRegistry m = registry.findByMarketId(marketId).orElse(null);
        if (m == null) {
            m = PmMarketRegistry.builder()
                    .marketId(marketId)
                    .marketTitle(title != null ? title : marketId)
                    .category(category)
                    .status("OPEN")
                    .binaryOutcomes(true)
                    .yesOutcomeName(outcomeName != null && "yes".equalsIgnoreCase(
                            outcomeName.isBlank() ? "yes" : outcomeName) ? outcomeName : "Yes")
                    .noOutcomeName("No")
                    .lastPriceCents(50)
                    .lastPriceChangedAt(Instant.now())
                    .registeredAt(Instant.now())
                    .build();
            m = registry.save(m);
        } else if (title != null && !title.isBlank() && !title.equals(m.getMarketTitle())) {
            m.setMarketTitle(title.length() > 300 ? title.substring(0, 299) + "…" : title);
            registry.save(m);
        }
        return m;
    }

    private PmPosition upsertPositionOnBuy(User user, PmMarketRegistry market, String side,
                                           String outcomeName, int priceCents, double shares, double amount) {
        PmPosition pos = positions.findByUser_IdAndMarketIdAndSide(user.getId(), market.getMarketId(), side)
                .orElse(null);
        if (pos == null) {
            pos = PmPosition.builder()
                    .user(user)
                    .marketId(market.getMarketId())
                    .marketTitle(market.getMarketTitle())
                    .category(market.getCategory())
                    .side(side)
                    .outcomeName(outcomeName != null && !outcomeName.isBlank() ? outcomeName : defaultOutcomeName(side))
                    .shares(BigDecimal.valueOf(shares))
                    .avgPriceCents(BigDecimal.valueOf(priceCents))
                    .costBasis(BigDecimal.valueOf(round2(amount)))
                    .lastPriceCents(BigDecimal.valueOf(priceCents))
                    .realizedPnl(BigDecimal.ZERO)
                    .status("open")
                    .openedAt(Instant.now())
                    .build();
        } else {
            BigDecimal prevShares = pos.getShares();
            BigDecimal newShares = prevShares.add(BigDecimal.valueOf(shares));
            BigDecimal newCost = pos.getCostBasis().add(BigDecimal.valueOf(round2(amount)));
            BigDecimal avg = newShares.signum() > 0
                    ? newCost.multiply(BigDecimal.valueOf(100)).divide(newShares, 2, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(priceCents);
            pos.setShares(newShares);
            pos.setCostBasis(newCost);
            pos.setAvgPriceCents(avg);
            pos.setLastPriceCents(BigDecimal.valueOf(priceCents));
            if (pos.getRealizedPnl() == null) {
                pos.setRealizedPnl(BigDecimal.ZERO);
            }
            // Reopening a fully-sold position: back to ACTIVE.
            if ("closed".equals(pos.getStatus())) {
                pos.setStatus("open");
                pos.setResolvedAt(null);
            }
        }
        return positions.save(pos);
    }

    private PmTrade recordTrade(User user, PmMarketRegistry market, String side, String outcomeName,
                                String action, double shares, int priceCents, double amount) {
        PmTrade t = PmTrade.builder()
                .user(user)
                .marketId(market != null ? market.getMarketId() : "unknown")
                .marketTitle(market != null ? market.getMarketTitle() : "Prediction market")
                .category(market != null ? market.getCategory() : null)
                .side(side)
                .outcomeName(outcomeName != null && !outcomeName.isBlank() ? outcomeName : defaultOutcomeName(side))
                .action(action)
                .shares(BigDecimal.valueOf(round4(shares)))
                .priceCents(priceCents >= 0 ? BigDecimal.valueOf(priceCents) : null)
                .amount(BigDecimal.valueOf(round2(amount)))
                .reference(nextReference())
                .executedAt(Instant.now())
                .build();
        return trades.save(t);
    }

    private void recordLedger(User user, String type, double amount, String notes) {
        WalletTransaction tx = WalletTransaction.builder()
                .user(user)
                .type(type)
                .amount(BigDecimal.valueOf(round2(amount)))
                .currency(users.currency(user))
                .status("completed")
                .paymentMethod("wallet")
                .timestamp(Instant.now())
                .transactionReference("TX-PM-" + (100000 + ThreadLocalRandom.current().nextInt(900000)))
                .notes(notes != null && notes.length() > 240 ? notes.substring(0, 239) + "…" : notes)
                .build();
        ledger.save(tx);
    }

    private Map<String, Object> positionMap(PmPosition p, boolean resolved, Map<String, PmMarketRegistry> markets) {
        int curPrice = liveSidePrice(p, markets);
        double shares = p.getShares() != null ? p.getShares().doubleValue() : 0.0;
        double avgPrice = p.getAvgPriceCents() != null ? p.getAvgPriceCents().doubleValue() : 0.0;
        double costBasis = p.getCostBasis() != null ? p.getCostBasis().doubleValue() : 0.0;

        double curValue = shares * curPrice / 100.0;
        double unrealized = round2(curValue - costBasis);
        double pnlPct = avgPrice > 0
                ? round2(((curPrice - avgPrice) / avgPrice) * 100.0)
                : 0.0;

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("marketId", p.getMarketId());
        m.put("marketTitle", p.getMarketTitle());
        m.put("category", p.getCategory());
        m.put("side", p.getSide());
        m.put("outcomeName", p.getOutcomeName());
        m.put("shares", shares);
        m.put("avgPriceCents", avgPrice);
        m.put("currentPriceCents", curPrice);
        m.put("lastPriceCents", p.getLastPriceCents() != null ? p.getLastPriceCents().doubleValue() : null);
        m.put("costBasis", round2(costBasis));
        m.put("currentValue", round2(curValue));
        m.put("unrealizedPnl", unrealized);
        m.put("pnlPercent", pnlPct);
        m.put("status", p.getStatus());
        if (resolved) {
            double booked = p.getRealizedPnl() != null ? p.getRealizedPnl().doubleValue() : 0.0;
            m.put("realizedPnl", round2(booked));
            // closeStatus distinguishes voluntary exits from settlements:
            // closed = sold before resolution; settled_won / settled_lost = market resolved.
            m.put("closeStatus",
                    "closed".equals(p.getStatus()) ? "closed"
                    : "won".equals(p.getStatus()) ? "settled_won"
                    : "lost".equals(p.getStatus()) ? "settled_lost"
                    : p.getStatus());
            // Exit price: sells recorded the exit in lastPriceCents; settlements pay 100/0.
            m.put("exitPriceCents",
                    "closed".equals(p.getStatus()) ? (p.getLastPriceCents() != null ? p.getLastPriceCents().doubleValue() : null)
                    : "won".equals(p.getStatus()) ? 100.0
                    : "lost".equals(p.getStatus()) ? 0.0
                    : null);
            m.put("resolvedAt", p.getResolvedAt() != null ? p.getResolvedAt().toString() : null);
        }
        m.put("openedAt", p.getOpenedAt().toString());
        return m;
    }

    private Map<String, Object> tradeMap(PmTrade t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("reference", t.getReference());
        m.put("marketId", t.getMarketId());
        m.put("marketTitle", t.getMarketTitle());
        m.put("category", t.getCategory());
        m.put("side", t.getSide());
        m.put("outcomeName", t.getOutcomeName());
        m.put("action", t.getAction());
        m.put("shares", t.getShares().doubleValue());
        m.put("priceCents", t.getPriceCents() != null ? t.getPriceCents().doubleValue() : null);
        m.put("amount", t.getAmount().doubleValue());
        m.put("executedAt", t.getExecutedAt().toString());
        return m;
    }

    private String normalizeSide(String side) {
        if (side == null) return null;
        String s = side.trim().toLowerCase();
        return ("yes".equals(s) || "no".equals(s)) ? s : null;
    }

    private String defaultOutcomeName(String side) {
        return "yes".equals(side) ? "Yes" : "No";
    }

    private String nextReference() {
        return "PM-" + (100000 + ThreadLocalRandom.current().nextInt(900000));
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static double round4(double v) {
        return Math.round(v * 10000.0) / 10000.0;
    }
}
