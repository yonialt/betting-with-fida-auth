# Multi-stage build for Spring Boot 3
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Production runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S fidabet && adduser -S fidabet -G fidabet
USER fidabet
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
