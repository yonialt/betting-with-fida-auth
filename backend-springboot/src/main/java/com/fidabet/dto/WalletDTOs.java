package com.fidabet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletDTOs {

    public static class BalanceResponse {
        private String userId;
        private BigDecimal balance;
        private BigDecimal bonusBalance;
        private String currency;

        public BalanceResponse() {}

        public BalanceResponse(String userId, BigDecimal balance, BigDecimal bonusBalance, String currency) {
            this.userId = userId;
            this.balance = balance;
            this.bonusBalance = bonusBalance;
            this.currency = currency;
        }

        public static BalanceResponseBuilder builder() {
            return new BalanceResponseBuilder();
        }

        public static class BalanceResponseBuilder {
            private String userId;
            private BigDecimal balance;
            private BigDecimal bonusBalance;
            private String currency;

            public BalanceResponseBuilder userId(String userId) { this.userId = userId; return this; }
            public BalanceResponseBuilder balance(BigDecimal balance) { this.balance = balance; return this; }
            public BalanceResponseBuilder bonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; return this; }
            public BalanceResponseBuilder currency(String currency) { this.currency = currency; return this; }

            public BalanceResponse build() {
                return new BalanceResponse(userId, balance, bonusBalance, currency);
            }
        }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }

        public BigDecimal getBonusBalance() { return bonusBalance; }
        public void setBonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    public static class DepositRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "10.00", message = "Minimum deposit is ETB 10.00")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        private String phone;
        private String returnUrl;

        public DepositRequest() {}

        public DepositRequest(BigDecimal amount, String paymentMethod, String phone, String returnUrl) {
            this.amount = amount;
            this.paymentMethod = paymentMethod;
            this.phone = phone;
            this.returnUrl = returnUrl;
        }

        public static DepositRequestBuilder builder() {
            return new DepositRequestBuilder();
        }

        public static class DepositRequestBuilder {
            private BigDecimal amount;
            private String paymentMethod;
            private String phone;
            private String returnUrl;

            public DepositRequestBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
            public DepositRequestBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
            public DepositRequestBuilder phone(String phone) { this.phone = phone; return this; }
            public DepositRequestBuilder returnUrl(String returnUrl) { this.returnUrl = returnUrl; return this; }

            public DepositRequest build() {
                return new DepositRequest(amount, paymentMethod, phone, returnUrl);
            }
        }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    }

    public static class DepositResponse {
        private String transactionId;
        private String referenceId;
        private String status;
        private BigDecimal amount;
        private String currency;
        private String paymentUrl;
        private String qrCode;
        private String message;

        public DepositResponse() {}

        public DepositResponse(String transactionId, String referenceId, String status, BigDecimal amount,
                               String currency, String paymentUrl, String qrCode, String message) {
            this.transactionId = transactionId;
            this.referenceId = referenceId;
            this.status = status;
            this.amount = amount;
            this.currency = currency;
            this.paymentUrl = paymentUrl;
            this.qrCode = qrCode;
            this.message = message;
        }

        public static DepositResponseBuilder builder() {
            return new DepositResponseBuilder();
        }

        public static class DepositResponseBuilder {
            private String transactionId;
            private String referenceId;
            private String status;
            private BigDecimal amount;
            private String currency;
            private String paymentUrl;
            private String qrCode;
            private String message;

            public DepositResponseBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
            public DepositResponseBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
            public DepositResponseBuilder status(String status) { this.status = status; return this; }
            public DepositResponseBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
            public DepositResponseBuilder currency(String currency) { this.currency = currency; return this; }
            public DepositResponseBuilder paymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; return this; }
            public DepositResponseBuilder qrCode(String qrCode) { this.qrCode = qrCode; return this; }
            public DepositResponseBuilder message(String message) { this.message = message; return this; }

            public DepositResponse build() {
                return new DepositResponse(transactionId, referenceId, status, amount, currency, paymentUrl, qrCode, message);
            }
        }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

        public String getReferenceId() { return referenceId; }
        public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

        public String getQrCode() { return qrCode; }
        public void setQrCode(String qrCode) { this.qrCode = qrCode; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class WithdrawRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "50.00", message = "Minimum withdrawal is ETB 50.00")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        @NotBlank(message = "Account number or phone is required")
        private String accountNumber;

        public WithdrawRequest() {}

        public WithdrawRequest(BigDecimal amount, String paymentMethod, String accountNumber) {
            this.amount = amount;
            this.paymentMethod = paymentMethod;
            this.accountNumber = accountNumber;
        }

        public static WithdrawRequestBuilder builder() {
            return new WithdrawRequestBuilder();
        }

        public static class WithdrawRequestBuilder {
            private BigDecimal amount;
            private String paymentMethod;
            private String accountNumber;

            public WithdrawRequestBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
            public WithdrawRequestBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
            public WithdrawRequestBuilder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }

            public WithdrawRequest build() {
                return new WithdrawRequest(amount, paymentMethod, accountNumber);
            }
        }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    }

    public static class TransactionDto {
        private String id;
        private String transactionId;
        private String type;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String referenceId;
        private String paymentProvider;
        private LocalDateTime createdAt;

        public TransactionDto() {}

        public TransactionDto(String id, String transactionId, String type, BigDecimal amount, String currency,
                              String status, String referenceId, String paymentProvider, LocalDateTime createdAt) {
            this.id = id;
            this.transactionId = transactionId;
            this.type = type;
            this.amount = amount;
            this.currency = currency;
            this.status = status;
            this.referenceId = referenceId;
            this.paymentProvider = paymentProvider;
            this.createdAt = createdAt;
        }

        public static TransactionDtoBuilder builder() {
            return new TransactionDtoBuilder();
        }

        public static class TransactionDtoBuilder {
            private String id;
            private String transactionId;
            private String type;
            private BigDecimal amount;
            private String currency;
            private String status;
            private String referenceId;
            private String paymentProvider;
            private LocalDateTime createdAt;

            public TransactionDtoBuilder id(String id) { this.id = id; return this; }
            public TransactionDtoBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
            public TransactionDtoBuilder type(String type) { this.type = type; return this; }
            public TransactionDtoBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
            public TransactionDtoBuilder currency(String currency) { this.currency = currency; return this; }
            public TransactionDtoBuilder status(String status) { this.status = status; return this; }
            public TransactionDtoBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
            public TransactionDtoBuilder paymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; return this; }
            public TransactionDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public TransactionDto build() {
                return new TransactionDto(id, transactionId, type, amount, currency, status, referenceId, paymentProvider, createdAt);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

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

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
