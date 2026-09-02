package com.fidabet.service;

import com.fidabet.dto.WalletDTOs;
import com.fidabet.model.*;
import com.fidabet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private static final Logger log = LoggerFactory.getLogger(SettlementService.class);

    private final BetRepository betRepository;
    private final BetSelectionRepository betSelectionRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;

    public SettlementService(
            BetRepository betRepository,
            BetSelectionRepository betSelectionRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService) {
        this.betRepository = betRepository;
        this.betSelectionRepository = betSelectionRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
    }

    @Transactional
    public void settleBet(String betId, boolean won) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new IllegalArgumentException("Bet not found: " + betId));

        if (!"active".equalsIgnoreCase(bet.getStatus())) {
            log.warn("Bet {} is already settled. Status: {}", betId, bet.getStatus());
            return;
        }

        User user = userRepository.findById(bet.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + bet.getUserId()));

        if (won) {
            bet.setStatus("won");
            bet.setSettledAt(LocalDateTime.now());
            betRepository.save(bet);

            // Credit winnings to user balance
            user.setBalance(user.getBalance().add(bet.getPotentialWin()));
            userRepository.save(user);

            // Record transaction
            Transaction txn = Transaction.builder()
                    .id(UUID.randomUUID().toString())
                    .transactionId("TXN-WIN-" + bet.getBetCode())
                    .userId(user.getId())
                    .type("BET_WON")
                    .amount(bet.getPotentialWin())
                    .currency(user.getCurrency())
                    .status("COMPLETED")
                    .referenceId(betId)
                    .paymentProvider("WALLET")
                    .build();
            transactionRepository.save(txn);

            log.info("Bet {} WON. Credited payout of {} {} to user {}", betId, bet.getPotentialWin(), user.getCurrency(), user.getUsername());
        } else {
            bet.setStatus("lost");
            bet.setSettledAt(LocalDateTime.now());
            betRepository.save(bet);
            log.info("Bet {} LOST for user {}", betId, user.getUsername());
        }

        // Publish settlement event & send WebSocket update
        eventPublisherService.publishEvent("fida-bet.bet.settled", betId, bet);
        eventPublisherService.publishEvent("fida-bet.user.balance.update", user.getId(), user);

        realtimeMessagingService.sendUserBalanceUpdate(user.getId(), WalletDTOs.BalanceResponse.builder()
                .userId(user.getId())
                .balance(user.getBalance())
                .bonusBalance(user.getBonusBalance())
                .currency(user.getCurrency())
                .build());

        List<BetSelection> selections = betSelectionRepository.findByBetId(bet.getId());
        realtimeMessagingService.sendUserBetUpdate(user.getId(), bet);
    }
}
