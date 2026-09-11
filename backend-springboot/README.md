# Fida Bet — Spring Boot 3 + Redis + API-Football Backend

Production-ready sports betting match and odds engine built with **Spring Boot 3.3.3**, **Redis 7**, and **API-Football v3** (`v3.football.api-sports.io`).

## Quick Start (TL;DR)

Requires Docker Desktop (for Redis) and Java 17+. The Maven wrapper (`mvnw`) downloads Maven automatically — no separate Maven install needed.

```bash
cd backend-springboot

docker compose up -d redis
./mvnw spring-boot:run
```

App starts on **http://localhost:8080** — health check: `curl http://localhost:8080/actuator/health`

## Architecture & Caching Strategy

```
                          ┌────────────────────────┐
                          │   Frontend / Client    │
                          └───────────┬────────────┘
                                      │ HTTP / REST
                                      ▼
                        ┌───────────────────────────┐
                        │  ApiFootballController    │
                        └─────────────┬─────────────┘
                                      │
                       Cache-Aside (Spring @Cacheable)
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  ┌─────────────┐           ┌──────────────┐
                  │ Redis Cache │ [HIT]     │ ApiFootball  │ [MISS]
                  │ (Lettuce)   ├─────────► │   Service    │
                  └─────────────┘           └──────┬───────┘
                                                   │
                                                   ▼
                                        ┌────────────────────┐
                                        │ API-Football v3    │
                                        │ (api-sports.io)    │
                                        └────────────────────┘
```

### Granular Redis Cache TTLs
| Cache Region | Key Pattern | TTL | Purpose |
| :--- | :--- | :--- | :--- |
| `liveMatches` | `fidabet:liveMatches::<sport>` | 20s | High frequency updates for live fixture scores & clocks |
| `matchOdds` | `fidabet:matchOdds::<fixtureId>` | 15s | Real-time market odds drift & price locking |
| `matchMarkets`| `fidabet:matchMarkets::<fixtureId>` | 60s | Deep market groups (1X2, DC, Totals, Handicaps) |
| `upcomingMatches` | `fidabet:upcomingMatches::<sport>` | 180s | Pre-match schedules and team lineups |

### Distributed Lock for Cluster Polling
- `lock:scheduler:football-sync` uses `SETNX` with 15s expiration to guarantee only **one** instance queries API-Football across scaled container replicas, preventing API quota exhaustion.

---

## Running with Docker Compose

Starts both Redis and the backend container together. Requires Docker Desktop running.

```bash
cd backend-springboot
docker compose up -d
```

Check logs:
```bash
docker compose logs -f fidabet-backend
```

---

## Running Locally with Maven Wrapper (recommended for dev)

Prerequisites:
- Java 17+ (any modern JDK works; `mvnw` handles Maven itself)
- Docker Desktop running — needed for Redis (`docker compose up -d redis`)

```bash
cd backend-springboot

# 1. Start Redis (backend tolerates Redis being down, but caching endpoints need it)
docker compose up -d redis

# 2. Run the app (add API key only if you have one — demo fallback data is used without it)
./mvnw spring-boot:run
# or on Windows CMD/PowerShell: mvnw.cmd spring-boot:run

# Optional: real API-Football data
export API_FOOTBALL_KEY="your_api_sports_key_here"
./mvnw spring-boot:run
```

Run without Redis at all (caching endpoints will log errors but the app still starts):

```bash
API_FOOTBALL_SYNC_ENABLED=false ./mvnw spring-boot:run
```

---

## Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/football/fixtures/live?sport=all` | Cached live matches from API Football |
| `GET` | `/api/football/fixtures/upcoming?sport=all` | Cached upcoming matches |
| `GET` | `/api/football/matches/{id}/markets` | Full market groups (1X2, Totals, Asian Handicap) |
| `POST` | `/api/football/sync` | Invalidate all Redis caches and force immediate refresh |
| `GET` | `/api/redis/stats` | Real-time cache metrics (Hit rate %, keys, uptime) |
| `POST` | `/api/redis/flush?pattern=fidabet:*` | Invalidate specified key pattern |
