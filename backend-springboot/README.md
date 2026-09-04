# Fida Bet — Spring Boot 3 + Redis + API-Football Backend

Production-ready sports betting match and odds engine built with **Spring Boot 3.3.3**, **Redis 7**, and **API-Football v3** (`v3.football.api-sports.io`).

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

```bash
cd backend-springboot
docker compose up -d
```

Check logs:
```bash
docker compose logs -f fidabet-backend
```

---

## Running Locally with Maven

Prerequisites:
- Java 17+
- Maven 3.8+
- Local Redis running on port 6379

```bash
cd backend-springboot
export API_FOOTBALL_KEY="your_api_sports_key_here"
mvn spring-boot:run
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
