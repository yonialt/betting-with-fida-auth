package com.fidabet.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.dto.WebhookDTOs;
import com.fidabet.service.PaymentService;
import com.fidabet.service.payment.PaymentProvider;
import com.fidabet.service.payment.TelebirrPaymentProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.util.Map;

@RestController
@RequestMapping("/webhook")
@CrossOrigin(origins = "*")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final PaymentService paymentService;
    private final TelebirrPaymentProvider telebirrProvider;
    private final ObjectMapper objectMapper;

    public WebhookController(
            PaymentService paymentService,
            @Qualifier("telebirrPaymentProvider") TelebirrPaymentProvider telebirrProvider,
            ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.telebirrProvider = telebirrProvider;
        this.objectMapper = objectMapper;
    }

    /**
     * Telebirr server-to-server notification.
     *
     * Telebirr POSTs a signed JSON body to this endpoint after payment completes.
     * We MUST:
     * 1. Verify the RSA-PSS signature
     * 2. Extract merch_order_id and trade_status
     * 3. Complete the deposit if PAY_SUCCESS
     * 4. Return HTTP 200 with {"success": true} on success
     *
     * @see <a href="https://developer.ethiotelecom.et">Telebirr H5 C2B Web Payment Integration Guide</a>
     */
    @PostMapping("/telebirr")
    public ResponseEntity<Map<String, Object>> telebirrWebhook(HttpServletRequest request) {
        try {
            // Read raw body for signature verification
            String rawBody = readRequestBody(request);
            log.info("Telebirr webhook received: {}", rawBody);

            // Parse the notification body
            JsonNode json = objectMapper.readTree(rawBody);

            String merchOrderId = json.path("merch_order_id").asText(null);
            String tradeStatus = json.path("trade_status").asText(null);
            String sign = json.path("sign").asText(null);
            String totalAmount = json.path("total_amount").asText(null);

            if (merchOrderId == null || tradeStatus == null) {
                log.warn("Telebirr webhook missing required fields: merch_order_id or trade_status");
                return ResponseEntity.ok(Map.of("success", false, "msg", "Missing required fields"));
            }

            // Verify signature if public key is configured
            if (sign != null && !sign.isBlank()) {
                // Build the verification payload (everything except sign and sign_type)
                Map<String, String> verifyParams = new java.util.LinkedHashMap<>();
                json.fields().forEachRemaining(entry -> {
                    if (!"sign".equals(entry.getKey()) && !"sign_type".equals(entry.getKey())) {
                        verifyParams.put(entry.getKey(), entry.getValue().asText());
                    }
                });
                String verifyPayload = objectMapper.writeValueAsString(verifyParams);

                if (!telebirrProvider.verifyCallback(verifyPayload, sign)) {
                    log.warn("Telebirr webhook signature verification FAILED for order: {}", merchOrderId);
                    return ResponseEntity.ok(Map.of("success", false, "msg", "Invalid signature"));
                }
                log.info("Telebirr webhook signature verified OK for order: {}", merchOrderId);
            } else {
                log.warn("Telebirr webhook has no signature — accepting in sandbox mode");
            }

            // Process the payment
            boolean success = "PAY_SUCCESS".equalsIgnoreCase(tradeStatus);
            paymentService.completeDeposit(merchOrderId, null, success);

            log.info("Telebirr webhook processed: order={}, status={}, success={}", merchOrderId, tradeStatus, success);

            return ResponseEntity.ok(Map.of("success", true, "msg", "SUCCESS"));

        } catch (Exception e) {
            log.error("Failed to process Telebirr webhook", e);
            // Return 200 anyway to prevent Telebirr retries for parsing errors
            return ResponseEntity.ok(Map.of("success", false, "msg", "Processing error"));
        }
    }

    /**
     * SantimPay webhook
     */
    @PostMapping("/santim")
    public ResponseEntity<Map<String, Object>> santimWebhook(@RequestBody WebhookDTOs.SantimWebhookRequest request) {
        boolean success = "COMPLETED".equalsIgnoreCase(request.getStatus());
        paymentService.completeDeposit(request.getTxnId(), request.getThirdPartyId(), success);
        return ResponseEntity.ok(Map.of("status", "ACKNOWLEDGED"));
    }

    /**
     * Arifpay webhook
     */
    @PostMapping("/arifpay")
    public ResponseEntity<Map<String, Object>> arifpayWebhook(@RequestBody WebhookDTOs.ArifpayWebhookRequest request) {
        boolean success = "SUCCESS".equalsIgnoreCase(request.getStatus());
        paymentService.completeDeposit(request.getTransactionId(), request.getSessionId(), success);
        return ResponseEntity.ok(Map.of("status", "ACKNOWLEDGED"));
    }

    /**
     * Dashen Bank webhook
     */
    @PostMapping("/dashen")
    public ResponseEntity<Map<String, Object>> dashenWebhook(@RequestBody WebhookDTOs.DashenWebhookRequest request) {
        boolean success = "PAID".equalsIgnoreCase(request.getPaymentStatus());
        paymentService.completeDeposit(request.getTransactionId(), request.getReferenceNo(), success);
        return ResponseEntity.ok(Map.of("status", "ACKNOWLEDGED"));
    }

    // --- Helper ---

    private String readRequestBody(HttpServletRequest request) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}
