package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 64)
    private String transactionId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "txn_type", nullable = false, length = 30)
    private String type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "ETB";

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "payment_provider", length = 50)
    private String paymentProvider;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Transaction() {}

    public Transaction(String id, String transactionId, String userId, String type, BigDecimal amount, String currency,
                       String status, String referenceId, String paymentProvider, String metadata, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.transactionId = transactionId;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.currency = currency != null ? currency : "ETB";
        this.status = status;
        this.referenceId = referenceId;
        this.paymentProvider = paymentProvider;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TransactionBuilder builder() {
        return new TransactionBuilder();
    }

    public static class TransactionBuilder {
        private String id;
        private String transactionId;
        private String userId;
        private String type;
        private BigDecimal amount;
        private String currency = "ETB";
        private String status;
        private String referenceId;
        private String paymentProvider;
        private String metadata;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public TransactionBuilder id(String id) { this.id = id; return this; }
        public TransactionBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public TransactionBuilder userId(String userId) { this.userId = userId; return this; }
        public TransactionBuilder type(String type) { this.type = type; return this; }
        public TransactionBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public TransactionBuilder currency(String currency) { this.currency = currency; return this; }
        public TransactionBuilder status(String status) { this.status = status; return this; }
        public TransactionBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public TransactionBuilder paymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; return this; }
        public TransactionBuilder metadata(String metadata) { this.metadata = metadata; return this; }
        public TransactionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TransactionBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Transaction build() {
            return new Transaction(id, transactionId, userId, type, amount, currency, status, referenceId, paymentProvider, metadata, createdAt, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
