package com.fidabet.backend.service;

import com.fidabet.backend.entity.PmMarketRegistry;
import com.fidabet.backend.entity.PmPosition;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.repository.PmMarketRegistryRepository;
import com.fidabet.backend.repository.PmPositionRepository;
import com.fidabet.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Acceptance test for the Polymarket-style trading workflow (spec section 15):
 *
 * BUY 100 YES @ 30c → ACTIVE position, balance debited 30
 * price moves to 70c → position still ACTIVE, value 70, unrealized +40
 * SELL 100 → balance credited 70, position CLOSED, realized +40, no resolution involved
 * partial sell: 40 of 100 → 40 closed (+16 realized), 60 remain ACTIVE
 * resolve → only the still-open shares settle; closed lots are never touched again
 */
@SpringBootTest
@Transactional
@org.springframework.test.context.ActiveProfiles("test")
class PredictionMarketTradingServiceTest {

    @Autowired
    private PredictionMarketTradingService trading;

    @Autowired
    private PmPriceService priceService;

    @Autowired
    private PmMarketRegistryRepository registry;

    @Autowired
    private PmPositionRepository positions;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAccountService users;

    private User user;
    private static final String MARKET = "election-acceptance-test";

    @BeforeEach
    void setUp() {
        user = users.register("pm-test@fidabet.test", null, null, "Passw0rd123");
        users.credit(user, 1000.00);
        // Seed the market at a known YES price of 30c (spec's initial price).
        registry.findByMarketId(MARKET).ifPresent(registry::delete);
        PmMarketRegistry m = PmMarketRegistry.builder()
                .marketId(MARKET)
                .marketTitle("Who will win the election?")
                .category("Politics")
                .status("OPEN")
                .binaryOutcomes(true)
                .yesOutcomeName("Yes")
                .noOutcomeName("No")
                .lastPriceCents(30)
                .registeredAt(java.time.Instant.now())
                .build();
        registry.save(m);
    }

    @Test
    void fullAcceptanceScenario() {
        String[] reason = new String[1];

        // ---------- Step 1: BUY 100 YES @ 30c → balance 1000 - 30 = 970 ----------
        Map<String, Object> buy = trading.buy(user, MARKET, "Who will win the election?", "Politics",
                "yes", "Yes", 30, 30.00, reason);
        assertThat(buy).as("BUY should fill: %s", reason[0]).isNotNull();
        assertThat(buy.get("balance")).isEqualTo(970.00);
        assertThat((double) buy.get("positionShares")).isEqualTo(100.0);
        assertThat((double) buy.get("avgPriceCents")).isEqualTo(30.0);

        // Position is ACTIVE while the market is unresolved.
        var open = positions.findOpenByUserId(user.getId());
        assertThat(open).hasSize(1);
        assertThat(open.get(0).getStatus()).isEqualTo("open");
        assertThat(open.get(0).getShares().doubleValue()).isEqualTo(100.0);

        // ---------- Step 2: price moves 30c → 70c; position stays ACTIVE ----------
        PmMarketRegistry m = registry.findByMarketId(MARKET).orElseThrow();
        m.setLastPriceCents(70);
        registry.save(m);

        var openPos = positions.findOpenByUserId(user.getId()).get(0);
        Map<String, Object> openMap = trading.openPositions(user).get(0);
        assertThat(openMap.get("currentPriceCents")).isEqualTo(70);
        // Current value = 100 × 0.70 = 70 ETB; unrealized P/L = 70 − 30 = +40.
        assertThat((double) openMap.get("currentValue")).isEqualTo(70.00);
        assertThat((double) openMap.get("unrealizedPnl")).isEqualTo(40.00);
        // Still ACTIVE — the market has NOT resolved.
        assertThat(openPos.getStatus()).isEqualTo("open");

        // ---------- Step 3: SELL all 100 → proceeds 70, realized +40, CLOSED ----------
        Map<String, Object> sell = trading.sell(user, MARKET, "yes", 70, 100.0, reason);
        assertThat(sell).as("SELL should fill: %s", reason[0]).isNotNull();
        assertThat(sell.get("action")).isEqualTo("SELL");
        assertThat(sell.get("amount")).isEqualTo(70.00);
        assertThat(sell.get("realizedPnl")).isEqualTo(40.00);
        assertThat(sell.get("positionClosed")).isEqualTo(true);
        // Balance 970 + 70 = 1040.
        assertThat(sell.get("balance")).isEqualTo(1040.00);

        // Position is CLOSED (sold), not waiting for any resolution.
        var hist = trading.positionHistory(user);
        assertThat(hist).hasSize(1);
        assertThat(hist.get(0).get("status")).isEqualTo("closed");
        assertThat(hist.get(0).get("closeStatus")).isEqualTo("closed");
        assertThat(hist.get(0).get("realizedPnl")).isEqualTo(40.00);
        assertThat(hist.get(0).get("exitPriceCents")).isEqualTo(70.0);

        // ---------- Step 4: the market is still OPEN; sold position untouched ----------
        assertThat(registry.findByMarketId(MARKET).orElseThrow().getStatus()).isEqualTo("OPEN");
        assertThat(positions.findOpenByUserId(user.getId())).isEmpty();

        // ---------- Step 5: partial sell — BUY 100 @ 30, price → 70, SELL 40 ----------
        // Reset the market price to 30c first (the earlier price move is history now;
        // a fresh buy at the CURRENT quote would fill at ~70c, which this step does
        // not exercise).
        m = registry.findByMarketId(MARKET).orElseThrow();
        m.setLastPriceCents(30);
        registry.save(m);

        buy = trading.buy(user, MARKET, "Who will win the election?", "Politics",
                "yes", "Yes", 30, 30.00, reason);
        assertThat(buy).as("re-buy should fill: %s", reason[0]).isNotNull();
        assertThat((double) buy.get("positionShares")).isEqualTo(100.0);
        assertThat((double) buy.get("avgPriceCents")).isEqualTo(30.0);

        m = registry.findByMarketId(MARKET).orElseThrow();
        m.setLastPriceCents(70);
        registry.save(m);

        Map<String, Object> partial = trading.sell(user, MARKET, "yes", 70, 40.0, reason);
        assertThat(partial).as("partial SELL should fill: %s", reason[0]).isNotNull();
        assertThat(partial.get("realizedPnl")).isEqualTo(16.00); // 40 × (70−30)/100
        assertThat(partial.get("positionClosed")).isEqualTo(false);
        assertThat((double) partial.get("positionShares")).isEqualTo(60.0);

        var stillOpen = trading.openPositions(user);
        assertThat(stillOpen).hasSize(1);
        assertThat((double) stillOpen.get(0).get("shares")).isEqualTo(60.0);
        // Remaining 60 shares continue to track the market price: 60 × 0.70 = 42.
        assertThat((double) stillOpen.get(0).get("currentValue")).isEqualTo(42.00);
        assertThat((double) stillOpen.get(0).get("unrealizedPnl")).isEqualTo(24.00);

        // ---------- Step 6: resolve — only the remaining 60 ACTIVE shares settle ----------
        Map<String, Object> summary = trading.resolveMarket(MARKET, "yes", reason);
        assertThat(summary).as("resolve should succeed: %s", reason[0]).isNotNull();
        assertThat((int) summary.get("settledPositions")).isEqualTo(1); // just the 60-share position

        // Winner settlement: 60 × 1.00 = 60 ETB credited.
        double finalBalance = users.balance(userRepository.findById(user.getId()).orElseThrow());
        // 1040 − 30 (re-buy) + 28 (partial proceeds) + 60 (settlement) = 1098.
        assertThat(finalBalance).isEqualTo(1098.00);

        var history = trading.positionHistory(user);
        // One position row per (user, market, side): the re-buy REOPENED the sold row,
        // and resolution settled it. Its realizedPnl aggregates every event:
        // 40 (first full sell) + 16 (partial sell) + 42 (settlement of 60 @ 100 vs 18 cost)
        assertThat(history).hasSize(1);
        assertThat(history.get(0).get("closeStatus")).isEqualTo("settled_won");
        assertThat(history.get(0).get("realizedPnl")).isEqualTo(98.00);
        assertThat((double) history.get(0).get("shares")).isEqualTo(60.0);

        // Market price froze at the resolution value.
        assertThat(registry.findByMarketId(MARKET).orElseThrow().getLastPriceCents()).isEqualTo(100);

        // ---------- Statement/Activity contains the full story ----------
        var activity = trading.activity(user, 50);
        assertThat(activity).extracting(a -> a.get("action"))
                .containsExactly("RESOLVE_WIN", "SELL", "BUY", "SELL", "BUY");
    }

    @Test
    void sellRejectsOversellingAndUnknownPositions() {
        String[] reason = new String[1];

        // Selling with no position is rejected.
        assertThat(trading.sell(user, MARKET, "yes", 50, 10.0, reason)).isNull();
        assertThat(reason[0]).contains("No open position");

        // BUY, then attempt to oversell.
        assertThat(trading.buy(user, MARKET, "t", "c", "yes", "Yes", 30, 30.00, reason)).isNotNull();
        assertThat(trading.sell(user, MARKET, "yes", 50, 999.0, reason)).isNull();
        assertThat(reason[0]).contains("Insufficient shares");

        // Selling a wrong side is rejected.
        assertThat(trading.sell(user, MARKET, "no", 50, 10.0, reason)).isNull();
        assertThat(reason[0]).contains("No open position");

        // Balance untouched by the failed sells.
        assertThat(users.balance(userRepository.findById(user.getId()).orElseThrow())).isEqualTo(970.00);
    }

    @Test
    void sellRejectedAfterMarketCloses() {
        String[] reason = new String[1];
        assertThat(trading.buy(user, MARKET, "t", "c", "yes", "Yes", 30, 30.00, reason)).isNotNull();

        PmMarketRegistry m = registry.findByMarketId(MARKET).orElseThrow();
        m.setStatus("CLOSED");
        registry.save(m);

        assertThat(trading.sell(user, MARKET, "yes", 50, 100.0, reason)).isNull();
        assertThat(reason[0]).isEqualTo("Market is not open for trading");

        // Position remains ACTIVE and untouched.
        assertThat(positions.findOpenByUserId(user.getId())).hasSize(1);
    }

    @Test
    void doubleResolutionIsRejected() {
        String[] reason = new String[1];
        assertThat(trading.buy(user, MARKET, "t", "c", "yes", "Yes", 30, 30.00, reason)).isNotNull();

        assertThat(trading.resolveMarket(MARKET, "yes", reason)).isNotNull();
        assertThat(trading.resolveMarket(MARKET, "no", reason)).isNull();
        assertThat(reason[0]).isEqualTo("Market is already resolved");
    }

    @Test
    void resolvedMarketRejectsNewTrades() {
        String[] reason = new String[1];
        trading.resolveMarket(MARKET, "yes", reason);
        assertThat(trading.buy(user, MARKET, "t", "c", "yes", "Yes", 30, 30.00, reason)).isNull();
        assertThat(reason[0]).isEqualTo("Market is not open for trading");
    }
}
