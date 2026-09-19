package com.fidabet.backend.service;

import com.fidabet.backend.entity.PmMarketRegistry;
import com.fidabet.backend.repository.PmMarketRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Market price engine for the prediction-market trading domain. Entirely separate from
 * the sportsbook: nothing here touches bets, odds or settlements.
 *
 * Responsibilities:
 * <ul>
 *   <li>store the current YES price (cents 1..99) per market in {@link PmMarketRegistry};</li>
 *   <li>tick prices with a bounded random walk every 20s for OPEN markets, so open
 *       positions get live unrealized P/L from real price movement;</li>
 *   <li>snap the price at trade time (BUY pulls toward the traded side, SELL pushes it);</li>
 *   <li>NO price is always 100 − YES.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PmPriceService {

    private final PmMarketRegistryRepository registry;

    /** Maximum cents a price can drift per tick. */
    private static final int MAX_STEP_CENTS = 3;
    /** Yes-price bounds — prediction-market prices always live in 1..99. */
    private static final int PRICE_FLOOR = 1;
    private static final int PRICE_CEILING = 99;

    /**
     * Current YES price in cents. Never mutates state — used for valuation on
     * read-only paths (portfolio, market status). The registry's lastPriceCents is
     * seeded at market creation and kept warm by the scheduler and trades.
     */
    @Transactional(readOnly = true)
    public int currentYesPriceCents(PmMarketRegistry market) {
        Integer p = market.getLastPriceCents();
        if (p == null || p < PRICE_FLOOR || p > PRICE_CEILING) {
            return 50;
        }
        return p;
    }

    /** NO price is the complement of YES (binary market invariant). */
    public int noPriceFromYes(int yesPriceCents) {
        return 100 - yesPriceCents;
    }

    /** Current side price in cents for the given outcome side. */
    public int sidePriceCents(PmMarketRegistry market, String side) {
        int yes = currentYesPriceCents(market);
        return "yes".equalsIgnoreCase(side) ? yes : noPriceFromYes(yes);
    }

    /**
     * Read the current side price inside a read-write transaction (buy/sell flows).
     * Seeds a missing price column on legacy rows on demand.
     */
    @Transactional
    public int sidePriceCentsMutable(PmMarketRegistry market, String side) {
        int yes = currentYesPriceCentsMutable(market);
        return "yes".equalsIgnoreCase(side) ? yes : noPriceFromYes(yes);
    }

    /**
     * Read the current price inside a read-write transaction (buy/sell flows).
     * The price column may be null on legacy rows, so this seeds it once on demand.
     */
    @Transactional
    public int currentYesPriceCentsMutable(PmMarketRegistry market) {
        Integer p = market.getLastPriceCents();
        if (p == null || p < PRICE_FLOOR || p > PRICE_CEILING) {
            int seed = 50;
            market.setLastPriceCents(seed);
            return seed;
        }
        return p;
    }

    /**
     * Price update when a trade executes (the only real "traders move the market"
     * signal we have). A BUY on a side pushes that side's price up, a SELL pushes it
     * down, scaled by order size. Bounded to 1..99 and by MAX_STEP_CENTS per trade.
     */
    @Transactional
    public void applyTradeImpact(PmMarketRegistry market, String side, boolean isBuy, double shares) {
        int cur = currentYesPriceCentsMutable(market);
        // Size scaling: ~1c per 100 shares traded, capped at MAX_STEP_CENTS.
        double impact = Math.min(MAX_STEP_CENTS, Math.max(0.0, shares / 100.0));
        int dir;
        if ("yes".equalsIgnoreCase(side)) {
            dir = isBuy ? 1 : -1;
        } else {
            dir = isBuy ? -1 : 1; // buying NO is economically selling YES
        }
        int next = (int) Math.round(cur + dir * impact);
        next = Math.max(PRICE_FLOOR, Math.min(PRICE_CEILING, next));
        market.setLastPriceCents(next);
        market.setLastPriceChangedAt(Instant.now());
    }

    /**
     * Bounded random-walk tick for every OPEN market. Runs every 20s so open
     * positions see genuine price movement in the portfolio (unrealized P/L) and
     * on the market pages. Resolved/closed markets never move.
     */
    @Scheduled(fixedDelayString = "20000", initialDelayString = "15000")
    @Transactional
    public void tickPrices() {
        try {
            moveOpenMarkets();
        } catch (Exception e) {
            log.warn("PM price tick failed: {}", e.getMessage());
        }
    }

    protected void moveOpenMarkets() {
        for (PmMarketRegistry m : registry.findByStatus("OPEN")) {
            Integer curBoxed = m.getLastPriceCents();
            int cur = (curBoxed == null || curBoxed < PRICE_FLOOR || curBoxed > PRICE_CEILING) ? 50 : curBoxed;
            int step = java.util.concurrent.ThreadLocalRandom.current().nextInt(-MAX_STEP_CENTS, MAX_STEP_CENTS + 1);
            int next = Math.max(PRICE_FLOOR, Math.min(PRICE_CEILING, cur + step));
            m.setLastPriceCents(next);
            m.setLastPriceChangedAt(Instant.now());
            registry.save(m);
        }
    }
}
