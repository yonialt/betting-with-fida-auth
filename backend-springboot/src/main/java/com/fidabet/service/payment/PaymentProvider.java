package com.fidabet.service.payment;

import java.math.BigDecimal;

public interface PaymentProvider {

    String getProviderCode();

    PaymentResponse initiatePayment(PaymentRequest request);

    PaymentStatus checkStatus(String referenceId);

    boolean verifyCallback(String payload, String signature);

    record PaymentRequest(
            String transactionId,
            String userId,
            BigDecimal amount,
            String currency,
            String phone,
            String returnUrl
    ) {}

    record PaymentResponse(
            String referenceId,
            String paymentUrl,
            String qrCode,
            PaymentStatus status,
            String message
    ) {}

    enum PaymentStatus {
        PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
