package com.fidabet.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * FidaBet Backend Application.
 * Production-ready Spring Boot 3.3 + PostgreSQL + Redis + API-Football microservice.
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
@EnableTransactionManagement
public class FidaBetApplication {

    public static void main(String[] args) {
        SpringApplication.run(FidaBetApplication.class, args);
    }
}
