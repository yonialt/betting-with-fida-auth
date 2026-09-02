package com.fidabet.service.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("arifpayProvider")
public class ArifpayProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(ArifpayProvider.class);

    @Override
    public String getProviderCode() {
        return "ARIFPAY";
    }

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating Arifpay checkout for transaction: {}, amount: {}", request.transactionId(), request.amount());
        String referenceId = "ARIF-" + System.currentTimeMillis();
        String paymentUrl = "https://gateway.arifpay.net/checkout/" + referenceId;

        return new PaymentResponse(
                referenceId,
                paymentUrl,
                null,
                PaymentStatus.PENDING,
                "Redirect to Arifpay gateway."
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
