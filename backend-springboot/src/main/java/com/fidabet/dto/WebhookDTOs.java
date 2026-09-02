package com.fidabet.dto;

import java.math.BigDecimal;

public class WebhookDTOs {

    public static class TelebirrWebhookRequest {
        private String outTradeNo;
        private String tradeNo;
        private BigDecimal totalAmount;
        private String tradeStatus;
        private String tradeDate;
        private String sign;

        public TelebirrWebhookRequest() {}

        public TelebirrWebhookRequest(String outTradeNo, String tradeNo, BigDecimal totalAmount, String tradeStatus, String tradeDate, String sign) {
            this.outTradeNo = outTradeNo;
            this.tradeNo = tradeNo;
            this.totalAmount = totalAmount;
            this.tradeStatus = tradeStatus;
            this.tradeDate = tradeDate;
            this.sign = sign;
        }

        public static TelebirrWebhookRequestBuilder builder() {
            return new TelebirrWebhookRequestBuilder();
        }

        public static class TelebirrWebhookRequestBuilder {
            private String outTradeNo;
            private String tradeNo;
            private BigDecimal totalAmount;
            private String tradeStatus;
            private String tradeDate;
            private String sign;

            public TelebirrWebhookRequestBuilder outTradeNo(String outTradeNo) { this.outTradeNo = outTradeNo; return this; }
            public TelebirrWebhookRequestBuilder tradeNo(String tradeNo) { this.tradeNo = tradeNo; return this; }
            public TelebirrWebhookRequestBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
            public TelebirrWebhookRequestBuilder tradeStatus(String tradeStatus) { this.tradeStatus = tradeStatus; return this; }
            public TelebirrWebhookRequestBuilder tradeDate(String tradeDate) { this.tradeDate = tradeDate; return this; }
            public TelebirrWebhookRequestBuilder sign(String sign) { this.sign = sign; return this; }

            public TelebirrWebhookRequest build() {
                return new TelebirrWebhookRequest(outTradeNo, tradeNo, totalAmount, tradeStatus, tradeDate, sign);
            }
        }

        public String getOutTradeNo() { return outTradeNo; }
        public void setOutTradeNo(String outTradeNo) { this.outTradeNo = outTradeNo; }

        public String getTradeNo() { return tradeNo; }
        public void setTradeNo(String tradeNo) { this.tradeNo = tradeNo; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public String getTradeStatus() { return tradeStatus; }
        public void setTradeStatus(String tradeStatus) { this.tradeStatus = tradeStatus; }

        public String getTradeDate() { return tradeDate; }
        public void setTradeDate(String tradeDate) { this.tradeDate = tradeDate; }

        public String getSign() { return sign; }
        public void setSign(String sign) { this.sign = sign; }
    }

    public static class SantimWebhookRequest {
        private String txnId;
        private String thirdPartyId;
        private BigDecimal amount;
        private String status;
        private String signature;

        public SantimWebhookRequest() {}

        public SantimWebhookRequest(String txnId, String thirdPartyId, BigDecimal amount, String status, String signature) {
            this.txnId = txnId;
            this.thirdPartyId = thirdPartyId;
            this.amount = amount;
            this.status = status;
            this.signature = signature;
        }

        public String getTxnId() { return txnId; }
        public void setTxnId(String txnId) { this.txnId = txnId; }

        public String getThirdPartyId() { return thirdPartyId; }
        public void setThirdPartyId(String thirdPartyId) { this.thirdPartyId = thirdPartyId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }

    public static class ArifpayWebhookRequest {
        private String sessionId;
        private String transactionId;
        private BigDecimal totalAmount;
        private String status;
        private String signature;

        public ArifpayWebhookRequest() {}

        public ArifpayWebhookRequest(String sessionId, String transactionId, BigDecimal totalAmount, String status, String signature) {
            this.sessionId = sessionId;
            this.transactionId = transactionId;
            this.totalAmount = totalAmount;
            this.status = status;
            this.signature = signature;
        }

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }

    public static class DashenWebhookRequest {
        private String referenceNo;
        private String transactionId;
        private BigDecimal amount;
        private String paymentStatus;
        private String hash;

        public DashenWebhookRequest() {}

        public DashenWebhookRequest(String referenceNo, String transactionId, BigDecimal amount, String paymentStatus, String hash) {
            this.referenceNo = referenceNo;
            this.transactionId = transactionId;
            this.amount = amount;
            this.paymentStatus = paymentStatus;
            this.hash = hash;
        }

        public String getReferenceNo() { return referenceNo; }
        public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

        public String getHash() { return hash; }
        public void setHash(String hash) { this.hash = hash; }
    }
}
