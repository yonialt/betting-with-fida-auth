package com.fidabet.service;

import com.fidabet.dto.WalletDTOs;
import com.fidabet.dto.WebhookDTOs;
import com.fidabet.exception.PaymentException;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.Transaction;
import com.fidabet.model.User;
import com.fidabet.repository.TransactionRepository;
import com.fidabet.repository.UserRepository;
import com.fidabet.service.payment.PaymentProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final Map<String, PaymentProvider> providers;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;

    public PaymentService(
            List<PaymentProvider> providerList,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(p -> p.getProviderCode().toUpperCase(), Function.identity()));
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
    }

    @Transactional
    public WalletDTOs.DepositResponse initiateDeposit(String userId, WalletDTOs.DepositRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String method = request.getPaymentMethod().toUpperCase();
        PaymentProvider provider = providers.get(method);
        if (provider == null) {
            // Default to Telebirr if not found or if 'pgo' is passed
            provider = providers.getOrDefault("TELEBIRR", providers.values().iterator().next());
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        PaymentProvider.PaymentRequest payReq = new PaymentProvider.PaymentRequest(
                transactionId,
                user.getId(),
                request.getAmount(),
                user.getCurrency(),
                request.getPhone() != null ? request.getPhone() : user.getPhone(),
                request.getReturnUrl()
        );

        PaymentProvider.PaymentResponse payResp = provider.initiatePayment(payReq);

        Transaction txn = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .transactionId(transactionId)
                .userId(user.getId())
                .type("DEPOSIT")
                .amount(request.getAmount())
                .currency(user.getCurrency())
                .status("PENDING")
                .referenceId(payResp.referenceId())
                .paymentProvider(provider.getProviderCode())
                .build();

        transactionRepository.save(txn);

        eventPublisherService.publishEvent("fida-bet.payment.deposit", transactionId, txn);

        return WalletDTOs.DepositResponse.builder()
                .transactionId(transactionId)
                .referenceId(payResp.referenceId())
                .status("PENDING")
                .amount(request.getAmount())
                .currency(user.getCurrency())
                .paymentUrl(payResp.paymentUrl())
                .qrCode(payResp.qrCode())
                .message(payResp.message())
                .build();
    }

    @Transactional
    public boolean processTelebirrWebhook(WebhookDTOs.TelebirrWebhookRequest request) {
        PaymentProvider provider = providers.get("TELEBIRR");
        if (provider != null && !provider.verifyCallback(request.toString(), request.getSign())) {
            log.warn("Telebirr webhook signature verification failed!");
            throw new PaymentException("Invalid signature");
        }

        return completeDeposit(request.getOutTradeNo(), request.getTradeNo(), "SUCCESS".equalsIgnoreCase(request.getTradeStatus()));
    }

    @Transactional
    public boolean completeDeposit(String transactionId, String externalReference, boolean success) {
        Transaction txn = transactionRepository.findByTransactionId(transactionId)
                .or(() -> transactionRepository.findByReferenceId(transactionId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        // Idempotency check (ai-instructions.md Section 38)
        if ("COMPLETED".equals(txn.getStatus())) {
            log.info("Transaction {} already completed. Ignoring duplicate callback.", transactionId);
            return true;
        }

        if (success) {
            txn.setStatus("COMPLETED");
            if (externalReference != null) {
                txn.setReferenceId(externalReference);
            }
            transactionRepository.save(txn);

            // Credit user balance atomically
            User user = userRepository.findById(txn.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + txn.getUserId()));
            user.setBalance(user.getBalance().add(txn.getAmount()));
            userRepository.save(user);

            log.info("Credited {} {} to user {}", txn.getAmount(), txn.getCurrency(), user.getUsername());

            // Publish events & send real-time WebSocket update
            eventPublisherService.publishEvent("fida-bet.payment.completed", transactionId, txn);
            eventPublisherService.publishEvent("fida-bet.user.balance.update", user.getId(), user);

            realtimeMessagingService.sendUserBalanceUpdate(user.getId(), WalletDTOs.BalanceResponse.builder()
                    .userId(user.getId())
                    .balance(user.getBalance())
                    .bonusBalance(user.getBonusBalance())
                    .currency(user.getCurrency())
                    .build());

            return true;
        } else {
            txn.setStatus("FAILED");
            transactionRepository.save(txn);
            eventPublisherService.publishEvent("fida-bet.payment.failed", transactionId, txn);
            return false;
        }
    }
}
