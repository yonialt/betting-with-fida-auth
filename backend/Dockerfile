# syntax=docker/dockerfile:1

# =============================================================================
# Fida Bet — Spring Boot 3 Backend (Java 17, Maven)
# Build context: backend/
#   docker build -t fida-bet-backend backend
# =============================================================================

# ---------- Stage 1: build with Maven ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first — only re-download when pom.xml changes
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Stage 2: slim JRE runtime ----------
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S fidabet && adduser -S fidabet -G fidabet
USER fidabet

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
