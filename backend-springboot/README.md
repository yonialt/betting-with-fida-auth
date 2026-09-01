# Polymarket Spring Boot Backend Service

A high-performance Spring Boot 3 microservice and API gateway for the Polymarket Gamma & CLOB Prediction Market APIs.

## Features
- **Polymarket Gamma API Integration**: Direct retrieval of real-time prediction market events, volume, odds, and categories.
- **In-Memory Caffeine Caching**: Reduces redundant network requests and guarantees sub-millisecond response times.
- **Type-safe DTO Mapping**: Standardized models for market probabilities, Yes/No outcomes, and multi-candidate events.
- **REST Endpoints**:
  - `GET /api/v1/polymarket/health` - Health check & connected API status.
  - `GET /api/v1/polymarket/events?limit=24&order=volume24hr&tag=crypto` - Live event stream.

## Requirements
- Java 17+
- Maven 3.8+

## How to Run
```bash
cd backend-springboot
mvn clean spring-boot:run
```

The service will start on port `8080` (or configured port in `application.yml`).
