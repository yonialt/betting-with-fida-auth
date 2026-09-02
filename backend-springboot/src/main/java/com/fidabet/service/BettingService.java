package com.fidabet.service;

import com.fidabet.dto.BetDTOs;
import com.fidabet.dto.WalletDTOs;
import com.fidabet.exception.InsufficientBalanceException;
import com.fidabet.exception.InvalidBetException;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.*;
import com.fidabet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BettingService {

    private static final Logger log = LoggerFactory.getLogger(BettingService.class);

    private final BetRepository betRepository;
    private final BetSelectionRepository betSelectionRepository;
    private final UserRepository userRepository;
    private final OddsRepository oddsRepository;
    private final MatchRepository matchRepository;
    private final TransactionRepository transactionRepository;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;

    public BettingService(
            BetRepository betRepository,
            BetSelectionRepository betSelectionRepository,
            UserRepository userRepository,
            OddsRepository oddsRepository,
            MatchRepository matchRepository,
            TransactionRepository transactionRepository,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService) {
        this.betRepository = betRepository;
        this.betSelectionRepository = betSelectionRepository;
        this.userRepository = userRepository;
        this.oddsRepository = oddsRepository;
        this.matchRepository = matchRepository;
        this.transactionRepository = transactionRepository;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
    }

    @Transactional
    public BetDTOs.BetDto placeBet(String userId, BetDTOs.PlaceBetRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidBetException("Bet slip cannot be empty");
        }
        if (request.getStake().compareTo(BigDecimal.ONE) < 0) {
            throw new InvalidBetException("Minimum stake is ETB 1.00");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getBalance().compareTo(request.getStake()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance! Current balance: " + user.getBalance() + " " + user.getCurrency());
        }

        // Deduct stake atomically (Optimistic locking protected via @Version on User)
        user.setBalance(user.getBalance().subtract(request.getStake()));
        userRepository.save(user);

        // Snapshot server-side odds (ai-instructions.md Section 18)
        BigDecimal totalOdds = BigDecimal.ONE;
        List<BetSelection> selectionsToSave = new ArrayList<>();
        String betId = "BET-" + (int)(100000 + Math.random() * 900000);
        String betCode = betId.substring(4);

        for (BetDTOs.BetSelectionRequest selReq : request.getItems()) {
            Odds serverOdds = oddsRepository.findById(selReq.getId())
                    .orElseThrow(() -> new InvalidBetException("Odds item not found or expired: " + selReq.getId()));

            if (Boolean.TRUE.equals(serverOdds.getIsLocked())) {
                throw new InvalidBetException("Market is currently locked for " + serverOdds.getName());
            }

            Match match = matchRepository.findById(serverOdds.getMatchId())
                    .orElseThrow(() -> new InvalidBetException("Match not found: " + serverOdds.getMatchId()));

            // Multiply server odds
            totalOdds = totalOdds.multiply(serverOdds.getValue());

            BetSelection selection = BetSelection.builder()
                    .id(UUID.randomUUID().toString())
                    .betId(betId)
                    .matchId(match.getId())
                    .matchCode(match.getMatchCode())
                    .league(match.getLeagueName())
                    .matchTitle(match.getTeam1() + " - " + match.getTeam2())
                    .currentScore(match.getScore1() + ":" + match.getScore2())
                    .marketName(serverOdds.getMarketName())
                    .selectionName(serverOdds.getName())
                    .selectionLabel(serverOdds.getLabel().equals("1") ? "W1" : serverOdds.getLabel().equals("2") ? "W2" : serverOdds.getLabel())
                    .odds(serverOdds.getValue()) // Authoritative server snapshot
                    .isLive(match.getIsLive())
                    .outcome("PENDING")
                    .build();

            selectionsToSave.add(selection);
        }

        totalOdds = totalOdds.setScale(2, RoundingMode.HALF_UP);
        BigDecimal potentialWin = request.getStake().multiply(totalOdds).setScale(2, RoundingMode.HALF_UP);
        BigDecimal cashoutValue = request.getStake().multiply(new BigDecimal("0.95")).setScale(2, RoundingMode.HALF_UP);

        String betType = request.getItems().size() > 1 ? "accumulator" : "single";

        Bet bet = Bet.builder()
                .id(betId)
                .betCode(betCode)
                .userId(user.getId())
                .type(betType)
                .totalOdds(totalOdds)
                .stake(request.getStake())
                .potentialWin(potentialWin)
                .currency(user.getCurrency())
                .status("active")
                .cashoutValue(cashoutValue)
                .placedAt(LocalDateTime.now())
                .build();

        Bet savedBet = betRepository.save(bet);
        betSelectionRepository.saveAll(selectionsToSave);

        // Record transaction
        Transaction txn = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .transactionId("TXN-BET-" + betCode)
                .userId(user.getId())
                .type("BET_PLACED")
                .amount(request.getStake())
                .currency(user.getCurrency())
                .status("COMPLETED")
                .referenceId(betId)
                .paymentProvider("WALLET")
                .build();
        transactionRepository.save(txn);

        log.info("Bet placed successfully: {} by user {}, stake: {}, totalOdds: {}", betId, user.getUsername(), request.getStake(), totalOdds);

        // Publish event & broadcast real-time updates
        eventPublisherService.publishEvent("fida-bet.bet.placed", betId, savedBet);
        eventPublisherService.publishEvent("fida-bet.user.balance.update", user.getId(), user);

        realtimeMessagingService.sendUserBalanceUpdate(user.getId(), WalletDTOs.BalanceResponse.builder()
                .userId(user.getId())
                .balance(user.getBalance())
                .bonusBalance(user.getBonusBalance())
                .currency(user.getCurrency())
                .build());

        BetDTOs.BetDto betDto = mapToBetDto(savedBet, selectionsToSave);
        realtimeMessagingService.sendUserBetUpdate(user.getId(), betDto);

        return betDto;
    }

    public Page<BetDTOs.BetDto> getBetHistory(String userId, String status, Pageable pageable) {
        Page<Bet> bets = (status != null && !status.equalsIgnoreCase("all"))
                ? betRepository.findByUserIdAndStatusOrderByPlacedAtDesc(userId, status.toLowerCase(), pageable)
                : betRepository.findByUserIdOrderByPlacedAtDesc(userId, pageable);

        return bets.map(b -> {
            List<BetSelection> selections = betSelectionRepository.findByBetId(b.getId());
            return mapToBetDto(b, selections);
        });
    }

    public BetDTOs.BetDto getBetById(String userId, String betId) {
        Bet bet = betRepository.findByIdAndUserId(betId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bet not found: " + betId));
        List<BetSelection> selections = betSelectionRepository.findByBetId(bet.getId());
        return mapToBetDto(bet, selections);
    }

    @Transactional
    public BetDTOs.CashoutResponse cashoutBet(String userId, String betId) {
        Bet bet = betRepository.findByIdAndUserId(betId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bet not found or does not belong to user: " + betId));

        if (!"active".equalsIgnoreCase(bet.getStatus())) {
            throw new InvalidBetException("Bet cannot be cashed out. Current status: " + bet.getStatus());
        }

        BigDecimal cashoutAmount = bet.getCashoutValue();
        if (cashoutAmount == null || cashoutAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidBetException("Cashout is not available for this bet");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Credit user balance atomically
        user.setBalance(user.getBalance().add(cashoutAmount));
        userRepository.save(user);

        bet.setStatus("cashed_out");
        bet.setSettledAt(LocalDateTime.now());
        betRepository.save(bet);

        // Record transaction
        Transaction txn = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .transactionId("TXN-CSH-" + bet.getBetCode())
                .userId(user.getId())
                .type("CASHOUT")
                .amount(cashoutAmount)
                .currency(user.getCurrency())
                .status("COMPLETED")
                .referenceId(betId)
                .paymentProvider("WALLET")
                .build();
        transactionRepository.save(txn);

        log.info("Bet {} cashed out for {} {} by user {}", betId, cashoutAmount, user.getCurrency(), user.getUsername());

        eventPublisherService.publishEvent("fida-bet.bet.cashedout", betId, bet);
        eventPublisherService.publishEvent("fida-bet.user.balance.update", user.getId(), user);

        realtimeMessagingService.sendUserBalanceUpdate(user.getId(), WalletDTOs.BalanceResponse.builder()
                .userId(user.getId())
                .balance(user.getBalance())
                .bonusBalance(user.getBonusBalance())
                .currency(user.getCurrency())
                .build());

        return BetDTOs.CashoutResponse.builder()
                .betId(betId)
                .cashoutAmount(cashoutAmount)
                .newBalance(user.getBalance())
                .currency(user.getCurrency())
                .message("Successfully cashed out " + cashoutAmount + " " + user.getCurrency())
                .build();
    }

    public BetDTOs.CashoutValueResponse getCashoutValue(String userId, String betId) {
        Bet bet = betRepository.findByIdAndUserId(betId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bet not found: " + betId));

        boolean eligible = "active".equalsIgnoreCase(bet.getStatus());
        return BetDTOs.CashoutValueResponse.builder()
                .betId(betId)
                .cashoutValue(bet.getCashoutValue())
                .isEligible(eligible)
                .build();
    }

    public BetDTOs.BetDto mapToBetDto(Bet bet, List<BetSelection> selections) {
        List<BetDTOs.BetSlipItemDto> items = selections.stream()
                .map(s -> BetDTOs.BetSlipItemDto.builder()
                        .id(s.getId())
                        .matchId(s.getMatchId())
                        .matchCode(s.getMatchCode())
                        .league(s.getLeague())
                        .matchTitle(s.getMatchTitle())
                        .currentScore(s.getCurrentScore())
                        .marketName(s.getMarketName())
                        .selectionName(s.getSelectionName())
                        .selectionLabel(s.getSelectionLabel())
                        .odds(s.getOdds())
                        .isLive(s.getIsLive())
                        .stake(bet.getStake())
                        .build())
                .collect(Collectors.toList());

        return BetDTOs.BetDto.builder()
                .id(bet.getId())
                .placedAt("Just now")
                .type(bet.getType())
                .items(items)
                .totalOdds(bet.getTotalOdds())
                .stake(bet.getStake())
                .potentialWin(bet.getPotentialWin())
                .currency(bet.getCurrency())
                .status(bet.getStatus())
                .cashoutValue(bet.getCashoutValue())
                .build();
    }
}
