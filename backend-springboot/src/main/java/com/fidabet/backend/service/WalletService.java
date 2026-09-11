package com.fidabet.backend.service;

import com.fidabet.backend.model.Transaction;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Wallet operations, ported from the Express /api/wallet/* routes. Balance mutation is delegated to
 * {@link UserAccountService} (the single source of truth for the balance); this service owns the
 * transaction ledger. Deposit/withdraw responses match the original SUCCESS envelope exactly.
 */
@Service
public class WalletService {

    private final UserAccountService users;
    private final List<Transaction> transactions = new ArrayList<>();

    public WalletService(UserAccountService users) {
        this.users = users;
        long now = System.currentTimeMillis();
        // Seed transactions mirror the two records the Express server started with.
        transactions.add(Transaction.builder()
                .id("TX-99201").type("deposit").amount(5000).currency("ETB")
                .status("completed").paymentMethod("telebirr")
                .timestamp(Instant.ofEpochMilli(now - 3_600_000L).toString()).build());
        transactions.add(Transaction.builder()
                .id("TX-99202").type("deposit").amount(9500).currency("ETB")
                .status("completed").paymentMethod("cbe_birr")
                .timestamp(Instant.ofEpochMilli(now - 86_400_000L).toString()).build());
    }

    public synchronized List<Transaction> transactions() {
        return new ArrayList<>(transactions);
    }

    public synchronized Map<String, Object> deposit(double amount, String paymentMethod) {
        double newBalance = users.credit(amount);
        Transaction tx = record("deposit", amount, paymentMethod);
        return successEnvelope(tx.getId(), amount, newBalance);
    }

    /** Returns the SUCCESS envelope, or {@code null} when funds are insufficient (HTTP 400). */
    public synchronized Map<String, Object> withdraw(double amount, String paymentMethod) {
        if (!users.tryDebit(amount)) {
            return null;
        }
        Transaction tx = record("withdrawal", amount, paymentMethod);
        return successEnvelope(tx.getId(), amount, users.balance());
    }

    private Transaction record(String type, double amount, String paymentMethod) {
        Transaction tx = Transaction.builder()
                .id(nextTransactionId())
                .type(type)
                .amount(amount)
                .currency(users.currency())
                .status("completed")
                .paymentMethod(paymentMethod == null ? "telebirr" : paymentMethod)
                .timestamp(Instant.now().toString())
                .build();
        transactions.add(0, tx); // unshift: newest first
        return tx;
    }

    private static Map<String, Object> successEnvelope(String txId, double amount, double balance) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("transactionId", txId);
        res.put("amount", amount);
        res.put("balance", balance);
        return res;
    }

    private static String nextTransactionId() {
        return "TX-" + (100000 + ThreadLocalRandom.current().nextInt(900000));
    }
}
