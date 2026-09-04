package com.fidabet.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class ApiFootballConfig {

    @Value("${api-football.base-url:https://v3.football.api-sports.io}")
    private String baseUrl;

    @Value("${api-football.api-key:}")
    private String apiKey;

    @Value("${api-football.provider:api-sports}")
    private String provider;

    @Value("${api-football.rapidapi-host:api-football-v1.p.rapidapi.com}")
    private String rapidApiHost;

    @Value("${api-football.timeout-ms:5000}")
    private int timeoutMs;

    @Bean
    public RestClient apiFootballRestClient() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultRequest(request -> {
                    if (apiKey != null && !apiKey.trim().isEmpty()) {
                        if ("rapidapi".equalsIgnoreCase(provider)) {
                            request.header("x-rapidapi-key", apiKey);
                            request.header("x-rapidapi-host", rapidApiHost);
                        } else {
                            request.header("x-apisports-key", apiKey);
                        }
                    }
                })
                .build();
    }
}
