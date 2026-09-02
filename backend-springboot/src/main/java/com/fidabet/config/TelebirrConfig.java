package com.fidabet.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "fidabet.payments.telebirr")
public class TelebirrConfig {

    /** Fabric App ID (UUID from Telebirr developer portal) */
    private String fabricAppId = "";

    /** App Secret for fabric token authentication */
    private String appSecret = "";

    /** Merchant App ID */
    private String merchantAppId = "";

    /** 6-digit Merchant Code */
    private String merchantCode = "";

    /** RSA Private Key (PEM or bare base64 DER) for signing requests */
    private String privateKey = "";

    /** Telebirr's public key for verifying webhook signatures */
    private String publicKey = "";

    /** Server-to-server notification URL (must be publicly reachable) */
    private String notifyUrl = "https://your-domain.com/webhook/telebirr";

    /** User return URL after payment (browser redirect) */
    private String redirectUrl = "https://your-domain.com/payment/return";

    /** Sandbox mode: uses test endpoints instead of production */
    private boolean sandbox = true;

    // --- Derived URLs based on environment ---
    // Official demo uses: https://196.188.120.3:38443/apiaccess/payment/gateway
    // New developer portal uses: https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway

    public String getApiBaseUrl() {
        return sandbox
                ? "https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway"
                : "https://superapp.ethiomobilemoney.et:38443/apiaccess/payment/gateway";
    }

    public String getCheckoutBaseUrl() {
        return sandbox
                ? "https://developerportal.ethiotelebirr.et:38443"
                : "https://superapp.ethiomobilemoney.et:38443";
    }

    public String getTokenUrl() {
        return getApiBaseUrl() + "/payment/v1/token";
    }

    public String getCreateOrderUrl() {
        return getApiBaseUrl() + "/payment/v1/merchant/preOrder";
    }

    public String getQueryOrderUrl() {
        return getApiBaseUrl() + "/payment/queryOrder";
    }

    // --- Getters and Setters ---

    public String getFabricAppId() { return fabricAppId; }
    public void setFabricAppId(String fabricAppId) { this.fabricAppId = fabricAppId; }

    public String getAppSecret() { return appSecret; }
    public void setAppSecret(String appSecret) { this.appSecret = appSecret; }

    public String getMerchantAppId() { return merchantAppId; }
    public void setMerchantAppId(String merchantAppId) { this.merchantAppId = merchantAppId; }

    public String getMerchantCode() { return merchantCode; }
    public void setMerchantCode(String merchantCode) { this.merchantCode = merchantCode; }

    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }

    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public String getNotifyUrl() { return notifyUrl; }
    public void setNotifyUrl(String notifyUrl) { this.notifyUrl = notifyUrl; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }

    public boolean isSandbox() { return sandbox; }
    public void setSandbox(boolean sandbox) { this.sandbox = sandbox; }
}
