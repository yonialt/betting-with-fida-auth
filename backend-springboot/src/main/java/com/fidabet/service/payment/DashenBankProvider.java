package com.fidabet.service.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("dashenBankProvider")
public class DashenBankProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(DashenBankProvider.class);

    @Override
    public String getProviderCode() {
        return "DASHEN";
    }

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating Dashen Bank payment for transaction: {}, amount: {}", request.transactionId(), request.amount());
        String referenceId = "DASHEN-" + System.currentTimeMillis();
        String paymentUrl = "https://dashenbanksc.com/pg/checkout/" + referenceId;

        return new PaymentResponse(
                referenceId,
                paymentUrl,
                null,
                PaymentStatus.PENDING,
                "Redirect to Dashen Bank payment portal."
        );
    }

    @Override
    public PaymentStatus checkStatus(String referenceId) {
        return PaymentStatus.COMPLETED;
    }

    @Override
    public boolean verifyCallback(String payload, String signature) {
        return true;
    }
}
