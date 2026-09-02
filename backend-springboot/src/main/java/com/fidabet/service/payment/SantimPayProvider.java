package com.fidabet.service.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("santimPayProvider")
public class SantimPayProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(SantimPayProvider.class);

    @Value("${fidabet.payments.santimpay.merchant-id:santim_fida_id}")
    private String merchantId;

    @Override
    public String getProviderCode() {
        return "SANTIMPAY";
    }

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating Santim Pay payment for transaction: {}, amount: {}", request.transactionId(), request.amount());
        String referenceId = "SANTIM-" + System.currentTimeMillis();
        String paymentUrl = "https://checkout.santimpay.com/pay/" + referenceId;

        return new PaymentResponse(
                referenceId,
                paymentUrl,
                null,
                PaymentStatus.PENDING,
                "Redirect to Santim Pay gateway."
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
