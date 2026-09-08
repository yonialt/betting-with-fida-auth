# syntax=docker/dockerfile:1

# =============================================================================
# Fida Bet — Frontend (React 19 + Vite) & Realtime API (Express + WebSocket)
# Multi-stage build. Build context: repository root.
#   docker build -t fida-bet-frontend .
# =============================================================================

# ---------- Stage 1: dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ---------- Stage 2: build (vite bundle + esbuild server bundle) ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

# ---------- Stage 3: production runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY frontend/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
