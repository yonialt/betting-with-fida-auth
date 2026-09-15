package com.fidabet.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.backend.entity.Bet;
import com.fidabet.backend.entity.BetItem;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.model.BetSlipItem;
import com.fidabet.backend.model.PlacedBet;
import com.fidabet.backend.repository.BetRepository;
import com.fidabet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Betting operations backed by PostgreSQL.
 * Reproduces the total-odds and potential-win arithmetic, the cashout crediting,
 * and the bet lifecycle exactly; balance changes are delegated to UserAccountService
 * (atomic conditional SQL updates). All operations are transactional — the debit and
 * the bet insert commit or roll back together, so a failed placement never leaves a
 * half-completed balance change.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BetService {

    private final UserAccountService users;
    private final UserRepository userRepository;
    private final BetRepository betRepository;
    private final ObjectMapper objectMapper;

    /**
     * Place a bet. Returns the created PlacedBet, or null on a validation failure.
     * The reason is supplied through failureReason so the controller can pick the message.
     */
    @Transactional
    public PlacedBet place(User user, double stake, String betType, List<?> rawItems, String[] failureReason) {
        if (stake <= 0 || !Double.isFinite(stake)) {
            failureReason[0] = "Invalid stake amount";
            return null;
        }

        List<BetSlipItem> items = objectMapper.convertValue(
                rawItems == null ? Collections.emptyList() : rawItems,
                new TypeReference<List<BetSlipItem>>() {});

        // Validate items and odds BEFORE any balance mutation
        if (items.isEmpty()) {
            failureReason[0] = "No selections provided";
            return null;
        }
        for (BetSlipItem it : items) {
            if (it.getOdds() <= 0 || !Double.isFinite(it.getOdds())) {
                failureReason[0] = "Invalid odds on selection";
                return null;
            }
        }

        // Atomic conditional debit: check-and-debit in one SQL statement, so two
        // concurrent placements can never both succeed against the same balance.
        boolean debited = users.tryDebit(user, stake);
        if (!debited) {
            failureReason[0] = "Insufficient balance";
            return null;
        }

        // Calculate total odds and potential win
        double totalOdds = 1.0;
        for (BetSlipItem it : items) {
            totalOdds *= it.getOdds();
        }
        double potentialWin = round2(stake * totalOdds);

        String betId = "BET-" + (100000 + ThreadLocalRandom.current().nextInt(900000));
        Bet bet = Bet.builder()
                .user(user)
                .betId(betId)
                .type(betType == null ? "single" : betType)
                .totalOdds(BigDecimal.valueOf(round2(totalOdds)))
                .stake(BigDecimal.valueOf(round2(stake)))
                .potentialWin(BigDecimal.valueOf(potentialWin))
                .currency(users.currency(user))
                .status("active")
                .cashoutValue(BigDecimal.valueOf(round2(stake * 0.95)))
                .placedAt(Instant.now())
                .build();

        // Add items
        for (BetSlipItem item : items) {
            BetItem betItem = BetItem.builder()
                    .itemId(item.getId() != null ? item.getId() : "item-" + System.currentTimeMillis())
                    .matchId(item.getMatchId())
                    .matchCode(item.getMatchCode())
                    .league(item.getLeague())
                    .matchTitle(item.getMatchTitle())
                    .currentScore(item.getCurrentScore())
                    .marketName(item.getMarketName())
                    .selectionName(item.getSelectionName())
                    .selectionLabel(item.getSelectionLabel())
                    .odds(BigDecimal.valueOf(item.getOdds()))
                    .isLive(item.getIsLive())
                    .stake(item.getStake() != null ? BigDecimal.valueOf(item.getStake()) : null)
                    .build();
            bet.addItem(betItem);
        }

        bet = betRepository.save(bet);
        double newBalance = users.balance(userRepository.findById(user.getId()).orElse(user));
        log.info("Bet placed: {} by user {}, stake: {}, odds: {}, potential win: {}, remaining balance: {}",
                betId, user.getId(), stake, totalOdds, potentialWin, newBalance);

        return toPlacedBet(bet);
    }

    /**
     * Get bet history, optionally filtered by status.
     */
    @Transactional(readOnly = true)
    public List<PlacedBet> history(User user, String status) {
        Long userId = user.getId();
        List<Bet> bets;
        if (status != null && !status.isBlank()) {
            bets = betRepository.findByUser_IdAndStatusOrderByPlacedAtDesc(userId, status);
        } else {
            bets = betRepository.findByUser_IdOrderByPlacedAtDesc(userId);
        }
        return bets.stream()
                .map(this::toPlacedBet)
                .collect(Collectors.toList());
    }

    /**
     * Find a bet by ID.
     */
    @Transactional(readOnly = true)
    public Optional<PlacedBet> findById(String id) {
        Bet bet = betRepository.findByBetId(id)
                .orElse(null);
        return Optional.ofNullable(toPlacedBet(bet));
    }

    /**
     * Cash out a bet. Returns the SUCCESS envelope; or null when the bet is missing
     * (controller -> 404) or not active (controller distinguishes via failureReason).
     * Ownership is enforced: only the bet's owner can cash it out.
     */
    @Transactional
    public Map<String, Object> cashout(User user, String id, String[] failureReason) {
        Bet bet = betRepository.findByBetId(id)
                .orElse(null);
        if (bet == null) {
            failureReason[0] = "NOT_FOUND";
            return null;
        }
        if (!bet.getUser().getId().equals(user.getId())) {
            failureReason[0] = "NOT_FOUND"; // do not leak other users' bets
            return null;
        }
        if (!"active".equals(bet.getStatus())) {
            failureReason[0] = "NOT_ACTIVE";
            return null;
        }

        // Update bet status
        bet.setStatus("cashed_out");
        bet.setSettledAt(Instant.now());
        bet = betRepository.save(bet);

        // Credit the cashout value
        double cashoutValue = bet.getCashoutValue() != null ? bet.getCashoutValue().doubleValue() : 0;
        double newBalance = users.credit(user, cashoutValue);

        log.info("Bet cashed out: {} by user {}, cashout value: {}, new balance: {}",
                id, user.getId(), cashoutValue, newBalance);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("betId", bet.getBetId());
        res.put("cashoutValue", cashoutValue);
        res.put("newBalance", newBalance);
        return res;
    }

    /**
     * Convert Bet entity to PlacedBet DTO preserving the existing API contract.
     */
    public PlacedBet toPlacedBet(Bet bet) {
        if (bet == null) {
            return null;
        }
        List<BetSlipItem> items = bet.getItems() != null ?
                bet.getItems().stream()
                        .map(this::toBetSlipItem)
                        .collect(Collectors.toList()) : Collections.emptyList();

        return PlacedBet.builder()
                .id(bet.getBetId())
                .placedAt(bet.getPlacedAt() != null ? "Just now" : "Just now")
                .type(bet.getType())
                .items(items)
                .totalOdds(bet.getTotalOdds() != null ? bet.getTotalOdds().doubleValue() : 0)
                .stake(bet.getStake() != null ? bet.getStake().doubleValue() : 0)
                .potentialWin(bet.getPotentialWin() != null ? bet.getPotentialWin().doubleValue() : 0)
                .currency(bet.getCurrency())
                .status(bet.getStatus())
                .cashoutValue(bet.getCashoutValue() != null ? bet.getCashoutValue().doubleValue() : null)
                .build();
    }

    /**
     * Convert BetItem entity to BetSlipItem DTO.
     */
    private BetSlipItem toBetSlipItem(BetItem item) {
        if (item == null) {
            return null;
        }
        return BetSlipItem.builder()
                .id(item.getItemId())
                .matchId(item.getMatchId())
                .matchCode(item.getMatchCode())
                .league(item.getLeague())
                .matchTitle(item.getMatchTitle())
                .currentScore(item.getCurrentScore())
                .marketName(item.getMarketName())
                .selectionName(item.getSelectionName())
                .selectionLabel(item.getSelectionLabel())
                .odds(item.getOdds() != null ? item.getOdds().doubleValue() : 0)
                .isLive(item.getIsLive())
                .stake(item.getStake() != null ? item.getStake().doubleValue() : null)
                .build();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
