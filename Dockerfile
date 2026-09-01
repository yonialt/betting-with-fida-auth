# Multi-stage build for Fida Bet
# This is a placeholder - actual Dockerfiles are in frontend/ and backend/

# Frontend stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Backend stage
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN ./mvnw clean package -DskipTests

# Production
FROM nginx:alpine
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
