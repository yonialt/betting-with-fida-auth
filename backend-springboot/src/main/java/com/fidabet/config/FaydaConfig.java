package com.fidabet.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Fayda Digital ID API integration.
 *
 * Register at https://id.gov.et/api or https://partner.fayda.et/
 * to obtain your client_id and client_secret.
 *
 * In mock mode (fayda.mock=true), the API is not called.
 */
@Configuration
@ConfigurationProperties(prefix = "fayda")
public class FaydaConfig {

    /** Base URL for Fayda API (production: https://id.gov.et) */
    private String baseUrl = "https://id.gov.et";

    /** OAuth 2.0 / OIDC client ID (from partner portal) */
    private String clientId = "";

    /** OAuth 2.0 / OIDC client secret (from partner portal) */
    private String clientSecret = "";

    /** Partner API key (from partner portal) */
    private String partnerApiKey = "";

    /** Mock mode — skip real API calls in development */
    private boolean mock = true;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public String getPartnerApiKey() { return partnerApiKey; }
    public void setPartnerApiKey(String partnerApiKey) { this.partnerApiKey = partnerApiKey; }

    public boolean isMock() { return mock; }
    public void setMock(boolean mock) { this.mock = mock; }
}
