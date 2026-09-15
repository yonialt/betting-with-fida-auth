package com.fidabet.backend.service;

import com.fidabet.backend.entity.User;
import com.fidabet.backend.entity.WalletTransaction;
import com.fidabet.backend.model.Transaction;
import com.fidabet.backend.repository.UserRepository;
import com.fidabet.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Wallet operations backed by PostgreSQL.
 * Balance mutation is delegated to UserAccountService (atomic conditional SQL updates);
 * this service owns the transaction ledger. Deposit/withdraw responses match the original
 * SUCCESS envelope exactly. All operations are transactional for data consistency —
 * a failed withdrawal rolls back the transaction row together with the debit.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final UserAccountService users;
    private final UserRepository userRepository;
    private final WalletTransactionRepository transactionRepository;

    /**
     * Get all transactions for the given user, newest first.
     */
    @Transactional(readOnly = true)
    public List<Transaction> transactions(User user) {
        List<WalletTransaction> walletTx = transactionRepository.findByUser_IdOrderByTimestampDesc(user.getId());
        List<Transaction> result = new ArrayList<>();
        for (WalletTransaction wt : walletTx) {
            result.add(toTransaction(wt));
        }
        return result;
    }

    /**
     * Deposit funds into the wallet.
     */
    @Transactional
    public Map<String, Object> deposit(User user, double amount, String paymentMethod) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (!Double.isFinite(amount)) {
            throw new IllegalArgumentException("Amount must be a finite number");
        }
        double newBalance = users.credit(user, amount);
        WalletTransaction tx = createTransaction(user, "deposit", amount, paymentMethod);
        log.info("Deposit: {} {} by user {}, new balance: {}", amount, tx.getCurrency(), user.getId(), newBalance);
        return successEnvelope(tx.getId().toString(), amount, newBalance);
    }

    /**
     * Withdraw funds from the wallet. Returns null when funds are insufficient (HTTP 400).
     * The conditional debit and the ledger write commit or roll back together.
     */
    @Transactional
    public Map<String, Object> withdraw(User user, double amount, String paymentMethod) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount greater than 0 required");
        }
        if (!Double.isFinite(amount)) {
            throw new IllegalArgumentException("Amount must be a finite number");
        }
        if (!users.tryDebit(user, amount)) {
            return null;
        }
        WalletTransaction tx = createTransaction(user, "withdrawal", amount, paymentMethod);
        double newBalance = users.balance(userRepository.findById(user.getId()).orElse(user));
        log.info("Withdrawal: {} {} by user {}, new balance: {}", amount, tx.getCurrency(), user.getId(), newBalance);
        return successEnvelope(tx.getId().toString(), amount, newBalance);
    }

    /**
     * Create a persisted transaction record.
     */
    @Transactional
    protected WalletTransaction createTransaction(User user, String type, double amount, String paymentMethod) {
        WalletTransaction tx = WalletTransaction.builder()
                .user(user)
                .type(type)
                .amount(User.round2(amount))
                .currency(users.currency(user))
                .status("completed")
                .paymentMethod(paymentMethod == null || paymentMethod.isBlank() ? "telebirr" : paymentMethod)
                .timestamp(Instant.now())
                .transactionReference("TX-" + (100000 + ThreadLocalRandom.current().nextInt(900000)))
                .build();
        return transactionRepository.save(tx);
    }

    /**
     * Convert WalletTransaction entity to Transaction DTO preserving the existing API contract.
     */
    public static Transaction toTransaction(WalletTransaction wt) {
        if (wt == null) {
            return null;
        }
        return Transaction.builder()
                .id(wt.getTransactionReference() != null ? wt.getTransactionReference() : "TX-" + wt.getId())
                .type(wt.getType())
                .amount(wt.getAmount() != null ? wt.getAmount().doubleValue() : 0.0)
                .currency(wt.getCurrency())
                .status(wt.getStatus())
                .paymentMethod(wt.getPaymentMethod())
                .timestamp(wt.getTimestamp() != null ? wt.getTimestamp().toString() : Instant.now().toString())
                .build();
    }

    private static Map<String, Object> successEnvelope(String txId, double amount, double balance) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("transactionId", txId);
        res.put("amount", amount);
        res.put("balance", balance);
        return res;
    }
}
