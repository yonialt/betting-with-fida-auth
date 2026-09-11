# Fida Bet — Architecture Analysis & Migration Blueprint

**Author:** Principal Architecture Review
**Date:** 2026-09-09
**Scope:** Full-stack audit of `betting-with-fida-auth`, prior to consolidating on Spring Boot and removing the Express layer.

---

## 1. Executive summary

The repository contains **two backends that do not talk to each other**:

1. **`frontend/server.ts` (Express + TypeScript)** — the *actual* backend the running application uses. It is a ~800-line, in-memory application server that also hosts the Vite dev server / static SPA. It owns authentication, wallet, betting, favourites, settings, age verification, an AI oracle, and match/odds data.
2. **`backend-springboot/` (Spring Boot 3 + Redis)** — a **partial, parallel stub**. It implements only the API-Football + Redis-cache + odds-engine slice. It has no auth, wallet, betting, user, or AI endpoints, **and the frontend never calls it.**

The React client speaks only to Express, same-origin, via relative `/api/*` calls (`VITE_API_BASE_URL` defaults to `/api`). Express even carries endpoints labelled *"Spring Boot 3 Controller Compatibility"* that imitate the Java service's shape — confirming Express was built to stand in for Spring Boot, not to proxy to it.

**Conclusion for the Express question:** Express is **not** a proxy. It contains substantial unique business logic. Per the agreed plan, that logic must be **migrated into Spring Boot first**, the frontend re-pointed at Spring Boot, and only then is Express removed.

A secondary finding: the **WebSocket layer is dead**. The client dials `/ws`, but neither backend serves it, so live updates silently fall back to client-side simulation.

---

## 2. Repository layout

```
betting-with-fida-auth/
├── frontend/                     # Vite + React 19 + TS SPA  (+ Express backend)
│   ├── server.ts                 # ★ Express app: REST API + Vite/SPA host (the real backend)
│   ├── src/
│   │   ├── server/               # Node-side services imported by server.ts
│   │   │   ├── apiFootballService.ts     # API-Football HTTP integration + odds drift
│   │   │   ├── freeMatchOddsService.ts   # "free" odds engine
│   │   │   └── redisCache.ts             # ioredis + in-memory Redis emulator (cache-aside)
│   │   ├── services/             # Browser-side clients
│   │   │   ├── fidaBetApi.ts             # ★ REST client (all /api calls)
│   │   │   ├── fidaBetWebSocket.ts       # WS client → /ws (currently unserved)
│   │   │   ├── polymarketGammaService.ts # calls public Polymarket Gamma API directly
│   │   │   └── mockMarketFeed.ts         # client-side candle/orderbook simulation
│   │   ├── context/BettingContext.tsx    # global app state
│   │   ├── components/           # sportsbook UI (MatchList, BetSlip, EventDetailedView…)
│   │   │   └── polymarket/       # ★ prediction-market UI (redesign target)
│   │   ├── data/                 # seed data (initialMatches, polymarket*)
│   │   └── types/                # shared TS types
│   └── package.json              # dev = "tsx server.ts"
│
└── backend-springboot/           # Spring Boot 3.3.3 (partial, unused by the app today)
    ├── pom.xml                   # web, data-redis, cache, actuator, validation, resilience4j, lombok
    ├── docker-compose.yml        # redis:7.2 + backend on :8080
    └── src/main/
        ├── resources/application.yml
        └── java/com/fidabet/backend/
            ├── config/            ApiFootballConfig, RedisConfig
            ├── controller/        ApiFootballController, RedisManagementController
            ├── service/           ApiFootballService, OddsEngineService, MatchSyncScheduler
            └── dto/               ApiFootball/Match/MarketGroup/OddsItem/CacheStats DTOs
```

---

## 3. Current runtime topology

```
                      ┌──────────────────────────────────────────┐
                      │  Browser (React 19 SPA, Vite)             │
                      │  fidaBetApi ──► /api/*   (same origin)     │
                      │  fidaBetWebSocket ──► /ws  (never answered)│
                      │  polymarketGammaService ──► gamma-api...   │ ── external, direct
                      └───────────────┬──────────────────────────┘
                                      │  http :3000 (single origin)
                                      ▼
             ┌───────────────────────────────────────────────────┐
             │  Express  (frontend/server.ts, tsx)                │
             │  • Vite middleware (dev) / static dist (prod)      │
             │  • REST API: auth, wallet, bets, matches, ai, …    │
             │  • in-memory state (user, bets, tx, favourites)    │
             │  • src/server/* → API-Football + Redis emulator    │
             └───────────────────────┬───────────────────────────┘
                                      │  (only if API_FOOTBALL_KEY / REDIS_URL set)
                                      ▼
                     API-Football v3   ·   Redis (optional)   ·   Gemini API

     ┌───────────────────────────────────────────────────────────┐
     │  Spring Boot :8080  — RUNNING SEPARATELY, NOT CALLED BY UI │
     │  /api/football/**, /api/redis/**  (+ Redis, API-Football)  │
     └───────────────────────────────────────────────────────────┘
```

The two backends overlap on the football/odds/Redis domain and diverge everywhere else.

---

## 4. Frontend stack

| Concern | Choice |
| :-- | :-- |
| Framework | React 19 + TypeScript 5.8 |
| Build/dev | Vite 6, `@vitejs/plugin-react`, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Dev server | **Express** via `tsx server.ts` (Vite runs in middleware mode) |
| State | React Context (`BettingContext`) + localStorage token cache |
| Charts | `lightweight-charts`, `recharts`, `d3-shape`, `@visx/curve` |
| Motion/icons | `motion`, `lucide-react`, `canvas-confetti` |
| API base | `import.meta.env.VITE_API_BASE_URL ?? '/api'` |
| WS base | `import.meta.env.VITE_WS_BASE_URL ?? '{ws|wss}://{host}/ws'` |

The client is a single-origin app: because Express serves both the SPA and `/api`, no CORS or proxy is configured today. **This is the main thing that changes after migration** (Vite and Spring Boot will be separate origins).

---

## 5. The Express layer — responsibility audit

This is the crux of the "proxy vs. logic" decision. Express owns the following **unique** logic, none of which exists in Spring Boot today:

| Domain | Endpoints | Logic held in Express |
| :-- | :-- | :-- |
| **Static/host** | `*` | Vite middleware (dev) or `dist` static + SPA fallback (prod) |
| **Auth** | `/api/auth/{login,register,refresh,session,logout,forgot-password,verify-otp}` | Issues mock bearer tokens into an in-memory `validTokens` set; `/session` validates it; `/logout` invalidates it. Real (if simplified) session lifecycle. |
| **Age verification (Fayda)** | `/api/age-verification/{status,verify,skip-demo}` | Mutates user verification state; returns Fayda National-ID payload. |
| **User/KYC** | `/api/user/{profile (GET/PUT),kyc}` | In-memory profile mutation. |
| **Wallet** | `/api/wallet/{balance,deposit,withdraw,transactions}` | **Mutates balance**, validates sufficient funds, appends transaction records. |
| **Betting** | `/api/bets/{place,history,:id,:id/cashout,:id/cashout-value}` | **Balance mutation**, total-odds/potential-win math, bet lifecycle, cashout crediting. |
| **Matches/Odds** | `/api/matches`, `/matches/{live,upcoming,search,:id,:id/markets,:id/stats,:id/events}` | Cache-aside via API-Football; falls back to in-memory `INITIAL_MATCHES`; synthesises market groups, stats, events. |
| **Football/Redis admin** | `/api/football/**`, `/api/redis/**`, `/api/sports/free/**` | Sync, cache flush, key inspection, odds drift, provider config. *(This is the slice Spring Boot duplicates.)* |
| **AI Oracle** | `/api/ai/oracle` | Calls **Gemini** (`@google/genai`, `gemini-2.5-flash`); heuristic fallback when no key. |
| **Favourites / Settings** | `/api/favorites/**`, `/api/settings` | In-memory set + settings object. |
| **Webhooks** | `/webhook/:provider` | Stub acknowledgement. |

**State model:** all state is module-level, in-memory (`currentUser`, `matches`, `placedBets`, `transactions`, `favoriteMatchIds`, `userSettings`, `validTokens`). It resets on restart and is not multi-user. This matters for the migration: Spring Boot should reproduce the same behaviour with singleton/service-scoped state (or a datastore) to preserve functionality, while being structured for real persistence later.

**Security posture (current):** protected routes are **not** actually guarded — most handlers ignore the bearer token entirely (only `/api/auth/session` and `/logout` check it). Wallet/bet/profile endpoints can be called without a valid token. This is a gap to close during migration (see §9).

---

## 6. Complete frontend → API request map

### 6a. Called explicitly by `fidaBetApi.ts` (the typed client)

| Client method | Method | Path | Notes |
| :-- | :-- | :-- | :-- |
| `login` | POST | `/auth/login` | stores token + refreshToken in localStorage |
| `register` | POST | `/auth/register` | stores tokens |
| `getSession` | GET | `/auth/session` | restore on reload; 401 clears token |
| `getProfile` | GET | `/user/profile` | |
| `getBalance` | GET | `/wallet/balance` | |
| `deposit` | POST | `/wallet/deposit` | `{amount, paymentMethod, phone}` |
| `withdraw` | POST | `/wallet/withdraw` | `{amount, paymentMethod, accountNumber}` |
| `getTransactions` | GET | `/wallet/transactions` | |
| `getAllMatches` | GET | `/matches?sport&status&timeFilter` | |
| `getLiveMatches` | GET | `/matches/live?sport` | |
| `getUpcomingMatches` | GET | `/matches/upcoming?sport&timeFilter&page&size` | paginated shape |
| `getMatchDetails` | GET | `/matches/:id` | |
| `getMatchMarkets` | GET | `/matches/:id/markets` | |
| `getMatchStats` | GET | `/matches/:id/stats` | |
| `getMatchEvents` | GET | `/matches/:id/events` | |
| `searchMatches` | GET | `/matches/search?query` | |
| `placeBet` | POST | `/bets/place` | `{stake, betType, items}` |
| `getBetHistory` | GET | `/bets/history?status` | |
| `cashoutBet` | POST | `/bets/:id/cashout` | |
| `getFavorites` | GET | `/favorites` | |
| `toggleFavorite` | POST/DELETE | `/favorites/:matchId` | method depends on state |
| `getSettings` | GET | `/settings` | |
| `updateSettings` | PUT | `/settings` | |

All requests attach `Authorization: Bearer <token>` when a token is present, and `Content-Type: application/json`. A 401/403 clears the stored session.

### 6b. Served by Express but not (yet) in the typed client

These exist as routes in `server.ts` and are used by admin/demo surfaces (e.g. `ApiFootballRedisModal`, `AdminPage`) or reserved:

`/api/health`, `/api/auth/{refresh,logout,forgot-password,verify-otp}`, `/api/age-verification/**`, `/api/user/kyc`, `/api/bets/:id`, `/api/bets/:id/cashout-value`, `/api/football/**` (status, sync, configure, cache/keys, cache/flush, drift, fixtures/live, fixtures/upcoming, matches/:id/markets), `/api/sports/free/**`, `/api/redis/{stats,flush}`, `/api/ai/oracle`, `/webhook/:provider`.

### 6c. External calls made directly from the browser

| Source | Target | Purpose |
| :-- | :-- | :-- |
| `polymarketGammaService.ts` | `https://gamma-api.polymarket.com/events` | Live Polymarket events; falls back to local `POLYMARKET_ALL_MARKETS` on any error. |
| `fidaBetWebSocket.ts` | `ws(s)://<host>/ws` | **Unserved** — 2 reconnect attempts then silent fallback to `mockMarketFeed`. |

---

## 7. Spring Boot backend — what exists vs. what's missing

**Implemented (verified from `pom.xml`, `application.yml`, `README.md`, and controller/service files):**

- `ApiFootballController` → `/api/football/fixtures/live`, `/fixtures/upcoming`, `/matches/{id}/markets`, `/sync`
- `RedisManagementController` → `/api/redis/stats`, `/api/redis/flush`
- `ApiFootballService`, `OddsEngineService`, `MatchSyncScheduler` (distributed `SETNX` lock for cluster-safe polling)
- `RedisConfig` (Lettuce pool, granular per-region TTLs), `ApiFootballConfig`
- Cross-cutting: Spring Cache (`@Cacheable`, `fidabet:` key prefix), Actuator, Bean Validation, **Resilience4j** circuit-breaker + rate-limiter on the API-Football feed, Jackson JSR-310, Lombok.

**Missing (must be built to replace Express) — the migration backlog:**

| Domain | New Spring Boot components required |
| :-- | :-- |
| Auth + security | `AuthController`, `AuthService`, token store (JWT or opaque), `SecurityConfig` (protect wallet/bet/user), CORS config |
| Wallet | `WalletController`, `WalletService`, transaction model |
| Betting | `BetController`, `BetService` (odds math, cashout, balance debit/credit) |
| User / KYC | `UserController`, profile + KYC |
| Age verification | `AgeVerificationController` (Fayda) |
| Matches (non-football) | `/api/matches`, `/matches/{live,upcoming,search,:id,:id/markets,:id/stats,:id/events}` on top of existing services + seed data |
| AI Oracle | `AiOracleController` → Gemini via REST (`RestClient`/WebClient) with heuristic fallback |
| Favourites / Settings | `FavouritesController`, `SettingsController` |
| Realtime | `WebSocketConfig` + STOMP or raw WS to replace the dead `/ws` |
| Seed data | Port `INITIAL_MATCHES` (and market/stat/event synthesis) into a Java seed/`data.json` resource |
| Static hosting *(optional)* | Serve the built SPA, or leave it to Vite/CDN |

---

## 8. Data & integrations

- **API-Football v3** (`v3.football.api-sports.io`) — live/upcoming fixtures + odds. Gated behind `API_FOOTBALL_KEY`; both backends degrade gracefully to seed data without it.
- **Redis** — cache-aside with granular TTLs (live 20s, odds 15s, markets 60s, upcoming 180s). Express ships an **in-memory Redis emulator** so it works with no Redis present; Spring Boot uses real Lettuce/Redis (compose provides `redis:7.2`).
- **Gemini** (`@google/genai`) — AI oracle text generation; heuristic fallback without `GEMINI_API_KEY`.
- **Polymarket Gamma API** — public prediction-market data, fetched **directly from the browser** (not proxied). Consider proxying this through Spring Boot post-migration for key-control, caching, and CSP tightening.

**Environment variables:** `GEMINI_API_KEY`, `API_FOOTBALL_KEY`, `API_FOOTBALL_PROVIDER`, `ODDS_API_KEY`, `REDIS_URL` (frontend/Express); `REDIS_HOST/PORT/PASSWORD`, `API_FOOTBALL_KEY/URL/PROVIDER` (Spring Boot).

---

## 9. Key findings & risks

1. **Two sources of truth.** The football/odds/Redis domain is implemented twice (TS + Java) and can drift. Consolidation removes this.
2. **Auth is not enforced.** Wallet, bet, and profile mutations don't verify the bearer token in Express. The migration must add real `SecurityConfig` so protected routes reject missing/invalid tokens (close the hole, don't port it forward).
3. **Dead WebSocket.** `/ws` is never served; realtime is faked client-side. Either implement server push in Spring Boot or remove the client dial and keep simulation as an explicit choice.
4. **Browser-side third-party calls.** Gamma API is called directly from the client — fine for a public API, but proxying it centralises caching, error handling, and CSP.
5. **In-memory state.** Acceptable for a demo; the Spring Boot port should keep the same behaviour while being structured so a real datastore can drop in (repository interfaces).
6. **Single-origin assumption.** Removing Express means the SPA and API become separate origins → CORS + a Vite dev proxy are mandatory to preserve current behaviour.
7. **Secrets in client env.** `GEMINI_API_KEY` currently lives with the Node server; after migration the AI key must live only in Spring Boot, never shipped to the browser.

---

## 10. Target architecture (post-migration)

```
   Browser (React SPA, Vite :5173 dev / static prod)
      │  /api/*  (Vite dev proxy → :8080 ; prod → same domain/reverse proxy)
      │  /ws     (STOMP/WebSocket)
      ▼
   Spring Boot :8080  ── the single backend
      • Security (token auth, CORS)         • Wallet / Bets / User / Age-verif
      • Auth / session                      • Matches / odds / markets / stats
      • AI Oracle (Gemini, server-side key) • Favourites / Settings
      • Realtime push (WebSocket)           • Redis cache-aside (Lettuce)
      │
      ▼
   API-Football v3   ·   Redis 7   ·   Gemini   ·   (proxied) Polymarket Gamma
```

Express is deleted; `npm run dev` becomes plain `vite`; the Node-only deps (`express`, `ioredis`, `@google/genai`) leave the frontend.

---

## 11. Migration plan (phased, reversible)

**Phase 0 — Safety net.** Freeze the API contract from §6 as the acceptance spec. Every migrated endpoint must return the same shape.

**Phase 1 — Spring Boot feature parity (additive, no deletion yet).**
Build the missing controllers/services from §7 behind the existing `/api/**` paths. Add `SecurityConfig` (protect wallet/bets/user; permit auth/matches/health), CORS for the Vite origin, seed data, and the Gemini oracle. Compile-check with Maven at each step.

**Phase 2 — Point the frontend at Spring Boot.**
Set `VITE_API_BASE_URL` (or a Vite dev proxy) to `:8080`. Verify every screen against the contract. Keep Express runnable as a rollback during this phase.

**Phase 3 — Realtime.**
Implement `/ws` (STOMP) for live odds/scores, or formally retire the client WS dial. Wire `fidaBetWebSocket` topics to the server.

**Phase 4 — Remove Express.**
Delete `server.ts`; move/retire `src/server/*`; change `dev` to `vite` and `build`/`start` accordingly; drop `express`, `ioredis`, `@google/genai` from `frontend/package.json`. Keep the Polymarket Gamma client (optionally proxy it).

**Phase 5 — Harden & document.**
CORS lockdown, input validation, rate limiting (already available via Resilience4j), performance passes (cache tuning, code-split the polymarket bundle), and a `CHANGELOG` of every change.

---

## 12. Deliverables tracker

| # | Deliverable | Status |
| :-- | :-- | :-- |
| 1 | Architecture doc + API map (this file) | ✅ drafted |
| 2 | Prediction-market UI redesign — preview | ✅ delivered, awaiting approval |
| 3 | Apply UI redesign to components | ⏳ after approval |
| 4 | Spring Boot feature-parity port | ⏳ needs `backend-springboot` folder connected |
| 5 | Frontend re-point + Express removal | ⏳ |
| 6 | Security / WebSocket / performance hardening | ⏳ |
| 7 | CHANGELOG of documented changes | ⏳ |

*Note: §7's Spring Boot internals are drawn from `pom.xml`, `application.yml`, `README.md`, the controller/service/dto file inventory, and the "Spring Boot compatibility" endpoints Express mirrors. They will be reconciled against the Java source once the `backend-springboot` folder is connected for staging.*
