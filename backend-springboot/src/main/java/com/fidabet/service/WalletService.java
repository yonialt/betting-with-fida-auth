package com.fidabet.service;

import com.fidabet.dto.WalletDTOs;
import com.fidabet.exception.InsufficientBalanceException;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.Transaction;
import com.fidabet.model.User;
import com.fidabet.repository.TransactionRepository;
import com.fidabet.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentService paymentService;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;

    public WalletService(
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            PaymentService paymentService,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.paymentService = paymentService;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
    }

    public WalletDTOs.BalanceResponse getBalance(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return WalletDTOs.BalanceResponse.builder()
                .userId(user.getId())
                .balance(user.getBalance())
                .bonusBalance(user.getBonusBalance())
                .currency(user.getCurrency())
                .build();
    }

    public WalletDTOs.DepositResponse deposit(String userId, WalletDTOs.DepositRequest request) {
        return paymentService.initiateDeposit(userId, request);
    }

    @Transactional
    public Transaction withdraw(String userId, WalletDTOs.WithdrawRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to withdraw " + request.getAmount() + " " + user.getCurrency());
        }

        // Deduct balance atomically
        user.setBalance(user.getBalance().subtract(request.getAmount()));
        userRepository.save(user);

        String transactionId = "TXN-WDR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        Transaction txn = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .transactionId(transactionId)
                .userId(user.getId())
                .type("WITHDRAWAL")
                .amount(request.getAmount())
                .currency(user.getCurrency())
                .status("PENDING")
                .paymentProvider(request.getPaymentMethod().toUpperCase())
                .referenceId(request.getAccountNumber())
                .build();

        Transaction savedTxn = transactionRepository.save(txn);
        log.info("Processed withdrawal request of {} {} for user {}", request.getAmount(), user.getCurrency(), user.getUsername());

        eventPublisherService.publishEvent("fida-bet.payment.withdrawal", transactionId, savedTxn);
        eventPublisherService.publishEvent("fida-bet.user.balance.update", user.getId(), user);

        realtimeMessagingService.sendUserBalanceUpdate(user.getId(), WalletDTOs.BalanceResponse.builder()
                .userId(user.getId())
                .balance(user.getBalance())
                .bonusBalance(user.getBonusBalance())
                .currency(user.getCurrency())
                .build());

        return savedTxn;
    }

    public Page<WalletDTOs.TransactionDto> getTransactions(String userId, Pageable pageable) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToTransactionDto);
    }

    private WalletDTOs.TransactionDto mapToTransactionDto(Transaction t) {
        return WalletDTOs.TransactionDto.builder()
                .id(t.getId())
                .transactionId(t.getTransactionId())
                .type(t.getType())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .status(t.getStatus())
                .referenceId(t.getReferenceId())
                .paymentProvider(t.getPaymentProvider())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
