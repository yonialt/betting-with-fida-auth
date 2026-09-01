package com.polymarket.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PolymarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(PolymarketApplication.class, args);
    }
}
