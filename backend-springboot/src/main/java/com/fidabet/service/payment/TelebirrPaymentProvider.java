package com.fidabet.service.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.config.TelebirrConfig;
import com.fidabet.exception.PaymentException;
import okhttp3.*;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Telebirr H5 C2B Web Payment Integration.
 *
 * Matches the official Ethio Telecom integration (same as telebirr-php library):
 * 1. Apply fabric token → POST /payment/v1/token
 * 2. Create order → POST /payment/v1/merchant/preOrder
 * 3. Build checkout URL → /payment/web/paygate?rawRequest
 * 4. Handle webhook notification → verify RSA-PSS signature
 *
 * @see <a href="https://github.com/MelakuDemeke/telebirr-php">Official PHP Library</a>
 */
@Component("telebirrPaymentProvider")
public class TelebirrPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(TelebirrPaymentProvider.class);

    private static final List<String> SIGN_EXCLUDES = Arrays.asList(
            "sign", "sign_type", "header", "refund_info", "openType", "raw_request"
    );

    private final TelebirrConfig config;
    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient;

    private String cachedFabricToken;
    private long fabricTokenExpiryMs = 0;

    public TelebirrPaymentProvider(TelebirrConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.httpClient = createTrustAllClient();
    }

    @Override
    public String getProviderCode() {
        return "TELEBIRR";
    }

    // ============================================================
    //  1. INITIATE PAYMENT
    // ============================================================

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        log.info("Initiating Telebirr payment: txn={}, amount={} {}",
                request.transactionId(), request.amount(), request.currency());

        try {
            // Step 1: Get fabric token (force refresh)
            clearFabricTokenCache();
            String fabricToken = applyFabricToken();

            // Step 2: Create order
            String merchOrderId = sanitizeOrderId(request.transactionId());
            JsonNode orderResponse = createOrder(fabricToken, merchOrderId,
                    request.amount().toPlainString(), request);

            // Step 3: Retry on auth errors
            String errorCode = orderResponse.path("errorCode").asText(null);
            if (errorCode != null && (errorCode.contains("49401024988") || errorCode.contains("49401031101"))) {
                log.warn("Telebirr auth error ({}), retrying with fresh token...", errorCode);
                clearFabricTokenCache();
                fabricToken = applyFabricToken();
                orderResponse = createOrder(fabricToken, merchOrderId,
                        request.amount().toPlainString(), request);
            }

            // Step 4: Extract prepay_id
            JsonNode bizContent = orderResponse.path("biz_content");
            String prepayId = bizContent.path("prepay_id").asText(null);

            if (prepayId == null || prepayId.isBlank()) {
                String code = orderResponse.path("code").asText("unknown");
                String msg = orderResponse.path("msg").asText("No prepay_id returned");
                throw new PaymentException("Telebirr order creation failed: [" + code + "] " + msg);
            }

            // Step 5: Build checkout URL
            String rawRequest = buildRawRequest(merchOrderId, prepayId);
            String checkoutUrl = config.getCheckoutBaseUrl()
                    + "/payment/web/paygate?" + rawRequest;

            log.info("Telebirr order created: merchOrderId={}, prepayId={}", merchOrderId, prepayId);

            return new PaymentResponse(
                    merchOrderId,
                    checkoutUrl,
                    null,
                    PaymentStatus.PENDING,
                    "Redirect to Telebirr checkout"
            );

        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Telebirr payment initiation failed", e);
            throw new PaymentException("Failed to initiate Telebirr payment: " + e.getMessage(), e);
        }
    }

    // ============================================================
    //  2. CHECK STATUS
    // ============================================================

    @Override
    public PaymentStatus checkStatus(String referenceId) {
        log.warn("checkStatus not implemented — relying on webhook");
        return PaymentStatus.PENDING;
    }

    // ============================================================
    //  3. VERIFY CALLBACK
    // ============================================================

    @Override
    public boolean verifyCallback(String payload, String signature) {
        if (payload == null || signature == null || signature.isBlank()) {
            log.warn("Telebirr callback missing payload or signature");
            return false;
        }

        try {
            Signature sig = Signature.getInstance("SHA256withRSA/PSS", new BouncyCastleProvider());
            sig.initVerify(loadPublicKey(config.getPublicKey()));
            sig.update(payload.getBytes(StandardCharsets.UTF_8));
            byte[] sigBytes = Base64.getDecoder().decode(signature);
            return sig.verify(sigBytes);
        } catch (Exception e) {
            log.error("Telebirr signature verification failed", e);
            return false;
        }
    }

    // ============================================================
    //  INTERNAL: Fabric Token
    // ============================================================

    private void clearFabricTokenCache() {
        cachedFabricToken = null;
        fabricTokenExpiryMs = 0;
    }

    private synchronized String applyFabricToken() {
        if (cachedFabricToken != null && System.currentTimeMillis() < fabricTokenExpiryMs - 60_000) {
            return cachedFabricToken;
        }

        log.info("Requesting new Telebirr fabric token from {}", config.getTokenUrl());

        try {
            Map<String, String> bodyMap = new HashMap<>();
            bodyMap.put("appSecret", config.getAppSecret());
            String jsonBody = objectMapper.writeValueAsString(bodyMap);

            RequestBody body = RequestBody.create(jsonBody,
                    MediaType.parse("application/json; charset=utf-8"));

            Request request = new Request.Builder()
                    .url(config.getTokenUrl())
                    .addHeader("X-APP-Key", config.getFabricAppId())
                    .post(body)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";
                log.debug("Fabric token response: {}", responseBody);

                JsonNode json = objectMapper.readTree(responseBody);
                String token = json.path("token").asText(null);

                if (token == null || token.isBlank()) {
                    throw new PaymentException("Failed to get fabric token: " + responseBody);
                }

                cachedFabricToken = token;
                fabricTokenExpiryMs = System.currentTimeMillis() + (2 * 60 * 60 * 1000);

                log.info("Telebirr fabric token acquired");
                return token;
            }
        } catch (PaymentException e) {
            throw e;
        } catch (IOException e) {
            throw new PaymentException("Failed to apply fabric token: " + e.getMessage(), e);
        }
    }

    // ============================================================
    //  INTERNAL: Create Order
    // ============================================================

    private JsonNode createOrder(String fabricToken, String merchOrderId, String amount, PaymentRequest request) {
        Map<String, String> bizContent = new LinkedHashMap<>();
        bizContent.put("notify_url", config.getNotifyUrl());
        bizContent.put("trade_type", "InApp");
        bizContent.put("appid", config.getMerchantAppId());
        bizContent.put("merch_code", config.getMerchantCode());
        bizContent.put("merch_order_id", merchOrderId);
        bizContent.put("title", "Fida Bet Deposit");
        bizContent.put("total_amount", amount);
        bizContent.put("trans_currency", "ETB");
        bizContent.put("timeout_express", "120m");

        if (request.phone() != null && !request.phone().isBlank()) {
            bizContent.put("buyer_id", request.phone());
        }

        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("timestamp", String.valueOf(System.currentTimeMillis()));
        wrapper.put("nonce_str", UUID.randomUUID().toString().replace("-", ""));
        wrapper.put("method", "payment.preorder");
        wrapper.put("version", "1.0");
        wrapper.put("biz_content", bizContent);
        wrapper.put("sign_type", "SHA256WithRSA");

        String sign = signRequestBody(wrapper);
        wrapper.put("sign", sign);

        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(wrapper);
        } catch (Exception e) {
            throw new PaymentException("Failed to serialize order request", e);
        }

        log.debug("CreateOrder request: {}", jsonBody);

        RequestBody body = RequestBody.create(jsonBody,
                MediaType.parse("application/json; charset=utf-8"));

        Request httpRequest = new Request.Builder()
                .url(config.getCreateOrderUrl())
                .addHeader("X-APP-Key", config.getFabricAppId())
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", fabricToken)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(httpRequest).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            log.debug("CreateOrder response: {}", responseBody);
            return objectMapper.readTree(responseBody);
        } catch (IOException e) {
            throw new PaymentException("Failed to create order: " + e.getMessage(), e);
        }
    }

    // ============================================================
    //  INTERNAL: Build Raw Request for Checkout
    // ============================================================

    private String buildRawRequest(String merchOrderId, String prepayId) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("appid", config.getMerchantAppId());
        params.put("merch_code", config.getMerchantCode());
        params.put("nonce_str", UUID.randomUUID().toString().replace("-", ""));
        params.put("prepay_id", prepayId);
        params.put("timestamp", String.valueOf(System.currentTimeMillis()));

        String sign = signFlatParams(params);
        params.put("sign", sign);
        params.put("sign_type", "SHA256WithRSA");

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }
        return sb.toString();
    }

    // ============================================================
    //  INTERNAL: Signing (SHA256withRSA/PSS)
    // ============================================================

    private String signRequestBody(Map<String, Object> req) {
        Map<String, String> flatParams = new HashMap<>();

        for (Map.Entry<String, Object> entry : req.entrySet()) {
            if (SIGN_EXCLUDES.contains(entry.getKey())) continue;
            Object val = entry.getValue();
            if (val instanceof String strVal) {
                flatParams.put(entry.getKey(), strVal);
            }
        }

        Object bizObj = req.get("biz_content");
        if (bizObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, String> bizContent = (Map<String, String>) bizObj;
            for (Map.Entry<String, String> entry : bizContent.entrySet()) {
                if (SIGN_EXCLUDES.contains(entry.getKey())) continue;
                flatParams.put(entry.getKey(), entry.getValue());
            }
        }

        return signFlatParams(flatParams);
    }

    private String signFlatParams(Map<String, String> params) {
        List<String> sortedKeys = new ArrayList<>(params.keySet());
        Collections.sort(sortedKeys);

        List<String> parts = new ArrayList<>();
        for (String key : sortedKeys) {
            parts.add(key + "=" + params.get(key));
        }
        String signString = String.join("&", parts);

        log.debug("SignString: {}", signString);

        try {
            Signature sig = Signature.getInstance("SHA256withRSA/PSS", new BouncyCastleProvider());
            sig.initSign(loadPrivateKey(config.getPrivateKey()));
            sig.update(signString.getBytes(StandardCharsets.UTF_8));
            byte[] signedBytes = sig.sign();
            return Base64.getEncoder().encodeToString(signedBytes);
        } catch (Exception e) {
            log.warn("Signing failed: {}", e.getMessage());
            return "";
        }
    }

    // ============================================================
    //  INTERNAL: Key Loading
    // ============================================================

    private PrivateKey loadPrivateKey(String keyStr) throws Exception {
        String cleanKey = keyStr
                .replaceAll("-----BEGIN (?:RSA )?PRIVATE KEY-----", "")
                .replaceAll("-----END (?:RSA )?PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    private PublicKey loadPublicKey(String keyStr) throws Exception {
        if (keyStr == null || keyStr.isBlank()) {
            throw new PaymentException("Telebirr public key not configured");
        }

        String cleanKey = keyStr
                .replaceAll("-----BEGIN PUBLIC KEY-----", "")
                .replaceAll("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    // ============================================================
    //  INTERNAL: Utilities
    // ============================================================

    private String sanitizeOrderId(String id) {
        return id.replaceAll("[^A-Za-z0-9]", "");
    }

    private OkHttpClient createTrustAllClient() {
        try {
            X509TrustManager trustManager = new X509TrustManager() {
                @Override public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                @Override public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                @Override public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[]{}; }
            };

            SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, new TrustManager[]{trustManager}, new SecureRandom());

            return new OkHttpClient.Builder()
                    .sslSocketFactory(sslContext.getSocketFactory(), trustManager)
                    .hostnameVerifier((hostname, session) -> true)
                    .retryOnConnectionFailure(true)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Telebirr HTTP client", e);
        }
    }
}
