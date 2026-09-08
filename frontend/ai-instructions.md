# Fida Bet — AI Backend Development Instructions

> **Purpose:** This document is the operating instruction for any AI coding agent working on the Fida Bet backend.
>
> **Primary rule:** Build the backend according to the existing Fida Bet specification and existing application flow. Do not damage, replace, redesign, or unnecessarily modify the existing frontend or established project behavior.

---

# 1. AI ROLE

You are an AI Senior Backend Developer working on **Fida Bet**.

Your responsibility is to:

* Build the Spring Boot backend.
* Connect the backend to the existing React frontend.
* Implement the database and persistence layer.
* Implement authentication and authorization.
* Implement wallet and transaction functionality.
* Implement matches, markets, odds, and betting.
* Implement real-time functionality.
* Implement payment-provider integrations.
* Implement Kafka event-driven functionality.
* Implement Redis caching and rate limiting.
* Implement Elasticsearch search and analytics.
* Implement admin APIs.
* Implement monitoring and observability.
* Prepare the application for Docker deployment.

You must work **incrementally**.

Do not attempt to rebuild the entire application in one operation.

---

# 2. MOST IMPORTANT RULE — PROTECT THE EXISTING CODEBASE

The existing frontend is already built.

The current frontend contains:

* Header
* LeftSidebar
* MatchList
* EventDetailedView
* BetSlip
* TelebirrDepositModal
* LoginModal
* SettingsModal
* BonusesModal
* PartnersPanel
* Polymarket Page
* Footer

The frontend currently uses mock/in-memory data for:

* Matches
* Odds
* User profile
* Bets
* Polymarket
* Payment

The backend is currently missing.

Therefore:

**The backend must be built around the existing frontend rather than rebuilding the frontend around a new backend design.**

Source specification:

---

# 3. ABSOLUTE CODEBASE SAFETY RULES

Before modifying anything:

1. Inspect the existing repository.
2. Inspect the current directory structure.
3. Inspect `package.json`.
4. Inspect frontend API/data/state files.
5. Inspect existing routing.
6. Inspect existing components.
7. Inspect existing contexts/stores.
8. Inspect existing environment files.
9. Identify existing functionality.
10. Identify what is mock data.
11. Identify what must eventually be replaced by API calls.

Never assume the project structure.

Never invent existing files.

Never claim a file exists before inspecting it.

---

# 4. DO NOT BREAK EXISTING FRONTEND FUNCTIONALITY

The frontend is already functional as a UI.

Do NOT:

* redesign the UI;
* remove components;
* rename components unnecessarily;
* remove existing routes;
* replace the frontend architecture;
* rewrite working components without a requirement;
* remove mock data before the corresponding backend API exists;
* change the betting-slip behavior without understanding the current flow;
* change odds display behavior without understanding the existing odds model;
* change authentication UI unnecessarily;
* change payment UI unnecessarily.

When replacing mock data with API data:

**Replace the data source, not the entire UI.**

Example:

```text
Existing UI
    ↓
Existing React component
    ↓
Existing state/context
    ↓
NEW backend API
    ↓
PostgreSQL
```

Do not unnecessarily change:

```text
Existing UI
    ↓
NEW completely redesigned frontend architecture
```

---

# 5. NEVER ASSUME

The AI must not assume:

* an API already exists;
* a backend already exists;
* a database already exists;
* authentication already exists;
* Redis is already configured;
* Kafka is already configured;
* Elasticsearch is already configured;
* payment credentials exist;
* external odds providers are available;
* Telebirr credentials exist;
* production infrastructure exists.

If something is missing:

1. Identify it.
2. Build it if it is part of the specification.
3. If credentials/configuration are required, use environment variables.
4. Never hardcode secrets.

---

# 6. SOURCE OF TRUTH

The supplied Fida Bet backend specification is the primary functional reference.

The specification defines:

* current frontend state;
* backend requirements;
* database schema;
* services;
* API endpoints;
* WebSocket topics;
* Kafka topics;
* Redis caching;
* Elasticsearch;
* monitoring;
* Docker Compose;
* architecture;
* build order;
* security concerns.

Do not silently replace these requirements with a different architecture.

If a better implementation is technically necessary, explain the difference before making a major architectural change.

---

# 7. TECHNOLOGY STACK

Use the specified stack:

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Backend          | Spring Boot 3.4+                              |
| Language         | Java 21                                       |
| Database         | PostgreSQL 16                                 |
| Cache            | Redis 7                                       |
| Authentication   | Spring Security + JWT                         |
| JWT              | jjwt                                          |
| Real-time        | WebSocket / STOMP / SockJS                    |
| Migration        | Flyway                                        |
| Payments         | Telebirr, Santim Pay, Arifpay, Dashen Bank    |
| SMS              | Twilio or Ethiopian local SMS gateway         |
| Deployment       | Docker + Docker Compose                       |
| Monitoring       | Spring Actuator + Prometheus + Grafana        |
| Messaging        | Kafka                                         |
| Search/Analytics | Elasticsearch                                 |

Source specification:

---

# 8. BACKEND PROJECT STRUCTURE

The planned backend structure is:

```text
fida-bet-backend/
├── src/main/java/com/fidabet/
│   ├── FidaBetApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── WebSocketConfig.java
│   │   ├── CorsConfig.java
│   │   └── JwtConfig.java
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   ├── exception/
│   └── util/
├── src/main/resources/
│   ├── application.yml
│   ├── db/migration/
│   └── templates/
└── pom.xml
```

Do not arbitrarily restructure this unless there is a concrete reason.

Source specification:

---

# 9. DEPENDENCIES

The backend specification requires:

* Spring Boot Web
* Spring Security
* JWT / jjwt
* Spring Data JPA
* PostgreSQL
* Flyway
* WebSocket
* Redis
* Validation
* Lombok
* MapStruct

The specified versions include:

```text
jjwt: 0.12.6
MapStruct: 1.6.3
```

Do not randomly replace dependencies.

If dependency versions must change because of compatibility, explain why before changing them.

Source specification:

---

# 10. DATABASE IS THE SOURCE OF PERSISTENT STATE

Use PostgreSQL for persistent application data.

The specification defines these core tables:

```text
users
kyc_documents
transactions

sports
leagues
teams
matches

markets
odds

bets
bet_selections

match_events
match_stats

user_favorites
user_settings
```

Do not replace PostgreSQL with another database.

Use Flyway migrations.

Do not manually modify production database structures without a migration.

---

# 11. USER MODEL

The user model includes:

```text
id
username
email
password_hash
phone
currency
balance
bonus_balance
is_verified
is_active
created_at
updated_at
```

Default currency:

```text
ETB
```

Balance-related operations must be treated as critical financial operations.

Source specification:

---

# 12. AUTHENTICATION FLOW

Implement:

```text
Register
    ↓
Phone/email + OTP
    ↓
User account
```

Login:

```text
Username/password
    ↓
JWT
    ↓
Authenticated API requests
```

Also implement:

```text
Refresh token
Forgot password
SMS OTP
KYC submission
```

Required service methods:

```java
register(RegisterDTO dto)

login(LoginDTO dto)

refreshToken(String refreshToken)

forgotPassword(String phone)

submitKYC(KYCdto dto)
```

JWT payload follows the specification:

```json
{
  "sub": "user-uuid",
  "username": "Player_8831",
  "roles": ["USER"],
  "iat": 1725235200,
  "exp": 1725238800
}
```

Source specification:

---

# 13. WALLET RULES

Wallet operations are critical.

Implement:

```text
GET balance
Deposit
Withdrawal
Transaction history
Internal transfers
```

Wallet operations include:

```text
deposit
withdrawal
bet
win
cashout
bonus
```

Every balance-changing operation must be transactional.

Never trust the frontend balance.

Never trust the frontend stake calculation.

Never trust frontend odds.

The backend must calculate and validate financial operations.

---

# 14. PAYMENT FLOW

The payment flow defined by the specification is:

```text
Frontend
   ↓
POST /api/wallet/deposit
   ↓
Create pending transaction
   ↓
Call payment provider
   ↓
Receive payment URL
   ↓
User completes payment
   ↓
Provider webhook
   ↓
Verify webhook signature
   ↓
Update transaction
   ↓
Credit user balance
   ↓
Publish event
   ↓
WebSocket balance update
```

Source specification:

Never mark a payment as completed simply because the frontend says payment succeeded.

Payment confirmation must come from the provider callback/webhook and verification flow.

---

# 15. PAYMENT PROVIDER ABSTRACTION

Use the specified abstraction:

```java
public interface PaymentProvider {

    PaymentResponse initiatePayment(PaymentRequest request);

    PaymentStatus checkStatus(String referenceId);

    boolean verifyCallback(
        String payload,
        String signature
    );
}
```

Providers:

```text
TelebirrPaymentProvider
SantimPayProvider
ArifpayProvider
DashenBankProvider
```

The application should select the provider through the payment service.

Source specification:

---

# 16. MATCH DOMAIN

Implement:

```text
Sport
League
Team
Match
Market
Odds
Match Events
Match Statistics
```

Match states:

```text
upcoming
live
finished
cancelled
```

The backend must provide match information to the existing frontend.

Required match operations include:

```text
Get live matches
Get upcoming matches
Get match details
Get match statistics
Get match events
```

---

# 17. ODDS DOMAIN

Odds are server-controlled.

Implement:

```text
Update odds
Bulk update odds
Lock odds
Get current odds
```

Possible odds sources:

```text
Internal odds engine
External odds feed
Admin manual odds
```

The specification mentions external providers such as:

```text
BetRadar
Sportradar
```

Do not hardcode an external provider if credentials/configuration are unavailable.

---

# 18. CRITICAL BETTING RULE

Bet placement is a **financially sensitive and concurrency-sensitive operation**.

The betting service must be thread-safe.

Required flow:

```text
Receive bet request
       ↓
Validate bet slip
       ↓
Read current server-side odds
       ↓
Snapshot odds
       ↓
Validate balance
       ↓
Lock/protect balance
       ↓
Deduct stake
       ↓
Create bet
       ↓
Create selections
       ↓
Commit transaction
       ↓
Publish event
       ↓
Return confirmation
```

Never use odds supplied by the frontend as the authoritative value.

The server must snapshot the odds at placement time.

Source specification:

---

# 19. BET RACE-CONDITION PROTECTION

The specification requires optimistic locking around the user balance.

Use a version field such as:

```java
@Version
private Long version;
```

The important rule is:

```text
Two requests must not be able to spend the same balance.
```

The backend must protect against:

```text
Concurrent bet placement
Concurrent withdrawal
Concurrent cashout
Concurrent balance operations
```

Balance-changing operations must be transactional.

Source specification:

---

# 20. CASHOUT

Cashout flow:

```text
Verify bet exists
       ↓
Verify user owns bet
       ↓
Verify bet is active
       ↓
Calculate current cashout value
       ↓
Credit balance
       ↓
Mark bet cashed_out
       ↓
Commit transaction
```

Never allow a user to cash out another user's bet.

---

# 21. BET SETTLEMENT

Settlement flow:

```text
Match finished
      ↓
Evaluate selections
      ↓
Determine:
    won
    lost
    void
      ↓
Calculate payout
      ↓
Credit balance when applicable
      ↓
Update bet status
      ↓
Publish settlement event
      ↓
Update Redis/user statistics
      ↓
Send notifications
```

---

# 22. API CONTRACTS

Do not randomly rename or restructure the specified API routes.

## Public

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/verify-otp
```

## User

```text
GET  /api/user/profile
PUT  /api/user/profile
POST /api/user/kyc
```

## Wallet

```text
GET  /api/wallet/balance
POST /api/wallet/deposit
POST /api/wallet/withdraw
GET  /api/wallet/transactions
```

## Matches

```text
GET /api/matches/live?sport=football
GET /api/matches/upcoming?sport=football&page=0&size=20
GET /api/matches/{id}
GET /api/matches/{id}/markets
GET /api/matches/{id}/stats
GET /api/matches/{id}/events
```

## Betting

```text
POST /api/bets/place
GET  /api/bets/history?status=active&page=0&size=20
GET  /api/bets/{id}
POST /api/bets/{id}/cashout
GET  /api/bets/{id}/cashout-value
```

## Favorites

```text
GET    /api/favorites
POST   /api/favorites/{matchId}
DELETE /api/favorites/{matchId}
```

## Settings

```text
GET /api/settings
PUT /api/settings
```

Source specification:

---

# 23. WEBHOOKS

These endpoints do not use normal user authentication.

They require provider signature verification.

```text
POST /webhook/telebirr
POST /webhook/santim
POST /webhook/arifpay
POST /webhook/dashen
```

Webhook processing must be:

```text
Receive
   ↓
Validate request
   ↓
Verify signature
   ↓
Check idempotency
   ↓
Find transaction
   ↓
Process status
   ↓
Update transaction
   ↓
Update balance if appropriate
   ↓
Publish event
```

Never trust a webhook merely because it reaches the endpoint.

---

# 24. WEBSOCKET

Use:

```text
STOMP over SockJS
```

Endpoint:

```text
/ws
```

Topics:

```text
/topic/match/{id}/odds
/topic/match/{id}/score
/topic/match/{id}/events
/topic/match/{id}/stats
/topic/match/{id}/cashout
/topic/user/{id}/balance
/topic/user/{id}/bets
```

These topics correspond to the existing real-time requirements.

Source specification:

---

# 25. KAFKA

Kafka is part of the event-driven architecture.

Do not use Kafka as a replacement for PostgreSQL.

Use:

```text
PostgreSQL
    ↓
Source of persistent transactional state

Kafka
    ↓
Event transport / asynchronous processing

Redis
    ↓
Cache / fast-access state

WebSocket
    ↓
Real-time client delivery
```

---

# 26. KAFKA TOPICS

Core:

```text
fida-bet.odds.updates
fida-bet.odds.locked
fida-bet.match.score
fida-bet.match.events
fida-bet.match.status
```

Betting:

```text
fida-bet.bet.placed
fida-bet.bet.settled
fida-bet.bet.cashedout
```

Payments:

```text
fida-bet.payment.deposit
fida-bet.payment.completed
fida-bet.payment.failed
fida-bet.payment.withdrawal
```

Users:

```text
fida-bet.user.registered
fida-bet.user.balance.update
fida-bet.user.kyc.submitted
```

Notifications:

```text
fida-bet.notification.sms
fida-bet.notification.push
fida-bet.notification.email
```

Analytics:

```text
fida-bet.analytics.bet
fida-bet.analytics.user
```

Source specification:

---

# 27. KAFKA EVENT RULE

Events must contain enough information for downstream consumers to process them safely.

For example, an odds event contains:

```text
matchId
oddsId
newValue
timestamp
```

Bet events include information such as:

```text
betId
userId
stake
totalOdds
selection snapshots
placedAt
```

Partition odds events by `matchId` when ordering per match is required.

Source specification:

---

# 28. KAFKA CONSUMERS

Odds consumer:

```text
Kafka odds event
      ↓
Update PostgreSQL
      ↓
Broadcast WebSocket
      ↓
Update Redis
```

Bet consumer:

```text
Bet placed
      ↓
Update active bet count
      ↓
Publish analytics event
      ↓
Check bonus eligibility
```

Settlement consumer:

```text
Bet settled
      ↓
Credit winnings if won
      ↓
Send notification
      ↓
Update active bet count
      ↓
Update user statistics
```

Source specification:

---

# 29. KAFKA FAILURE HANDLING

Use retry and dead-letter handling as specified.

The system should not silently lose an event.

Use:

```text
Retry
   ↓
Failure
   ↓
Dead Letter Queue
```

Do not silently swallow Kafka processing exceptions.

---

# 30. REDIS

Redis is used for:

```text
Odds cache
Live match cache
Match detail cache
User balance cache
Active bet count
Session data
Rate limiting
OTP
Leaderboard
```

The specification defines TTLs for these cache keys.

Important examples:

```text
odds:{matchId}
match:live:{sport}
match:{id}
user:balance:{id}
user:active_bets:{id}
session:{jwt}
rate:limit:{ip}:{endpoint}
sms:otp:{phone}
leaderboard:daily
```

Source specification:

---

# 31. CACHE-ASIDE

For read operations:

```text
Request
   ↓
Redis
   ↓
Cache hit → return
   ↓
Cache miss
   ↓
PostgreSQL
   ↓
Populate Redis
   ↓
Return
```

For writes:

```text
Update PostgreSQL
       ↓
Update/invalidate Redis
       ↓
Publish event if required
```

Do not make Redis the authoritative source of financial truth.

---

# 32. RATE LIMITING

Use Redis-based rate limiting.

Specified examples:

```text
Login:
5 attempts / minute / IP

Register:
3 attempts / hour / IP
```

The broader security specification also identifies rate limiting as protection against abuse.

Source specification:

---

# 33. ELASTICSEARCH

Use Elasticsearch for:

```text
Full-text search
Match search
Team search
League search
Analytics
User activity logs
Match event logs
Bet analytics
```

PostgreSQL remains the primary transactional database.

Elasticsearch is for search/analytics use cases.

Source specification:

---

# 34. MONITORING

Use:

```text
Spring Boot Actuator
Prometheus
Grafana
```

Expose the specified Actuator endpoints:

```text
health
info
metrics
prometheus
loggers
```

Monitor:

```text
API request rate
API latency
p50
p95
p99
error rate

bets/min
average stake
win rate
GGR

payment volume
payment success rate
payment amount

odds update rate
Kafka lag
WebSocket connections

concurrent users

JVM memory
GC pauses
DB connection pool
Redis hit rate
```

Source specification:

---

# 35. ADMIN API

Implement the specified admin operations:

```text
GET  /api/admin/matches
POST /api/admin/matches
PUT  /api/admin/matches/{id}
PUT  /api/admin/matches/{id}/score
PUT  /api/admin/matches/{id}/status

GET  /api/admin/odds/{matchId}
PUT  /api/admin/odds/{id}
POST /api/admin/odds/bulk-update

GET /api/admin/users
GET /api/admin/users/{id}
PUT /api/admin/users/{id}/balance
GET /api/admin/users/{id}/bets

GET  /api/admin/transactions
POST /api/admin/transactions/{id}/approve

GET /api/admin/reports/daily
GET /api/admin/reports/bets
GET /api/admin/reports/ggr
```

Admin endpoints must be protected by authorization.

Never expose administrative operations to normal users.

Source specification:

---

# 36. SECURITY RULES

The following security requirements are mandatory:

## Balance

Protect balance operations with transactions and optimistic locking.

## Odds

Never trust frontend odds.

Snapshot odds on the server when placing a bet.

## Payments

Verify webhook signatures.

Make payment processing idempotent.

## JWT

Use:

```text
Short-lived access token
Refresh token
httpOnly storage where applicable
```

The specification identifies:

```text
Access token: 15 minutes
Refresh token: 7 days
```

## SQL Injection

Use JPA/parameterized queries.

Do not build unsafe SQL from user input.

## Rate limiting

Use Redis.

## Authorization

Verify the authenticated user owns resources before allowing operations.

Source specification:

---

# 37. FINANCIAL DATA RULES

Treat these as high-risk operations:

```text
Deposit
Withdrawal
Bet placement
Cashout
Winning payout
Balance adjustment
Bonus credit
Transaction reversal
```

Rules:

1. Use `BigDecimal` for monetary values.
2. Do not use floating-point arithmetic for money.
3. Use database transactions.
4. Validate ownership.
5. Validate balance.
6. Prevent duplicate processing.
7. Record transaction history.
8. Never trust frontend calculations.
9. Never silently modify balances.
10. Maintain an auditable transaction flow.

---

# 38. IDEMPOTENCY

The AI must consider duplicate requests.

Especially:

```text
Payment webhooks
Deposits
Withdrawals
Bet placement
Cashout
Settlement
Kafka event processing
```

A retry must not accidentally:

```text
credit balance twice
deduct balance twice
settle a bet twice
cash out twice
process a payment twice
```

---

# 39. FRONTEND INTEGRATION RULE

The frontend currently contains mock data.

The migration should happen gradually.

Example:

```text
OLD

React
 ↓
Mock initialMatches.ts


NEW

React
 ↓
Match API
 ↓
Spring Boot
 ↓
PostgreSQL
```

For odds:

```text
OLD

BettingContext
 ↓
Random fluctuation


NEW

Spring Boot
 ↓
Odds service
 ↓
Redis/Kafka
 ↓
WebSocket
 ↓
React
```

For user balance:

```text
OLD

Hardcoded balance


NEW

Authenticated API
 ↓
Wallet service
 ↓
PostgreSQL
 ↓
Redis/WebSocket
 ↓
React
```

---

# 40. DO NOT REMOVE MOCK DATA TOO EARLY

Until an equivalent backend endpoint is working:

```text
Do not delete the existing mock implementation.
```

Instead:

1. Build backend endpoint.
2. Test endpoint.
3. Connect frontend to endpoint.
4. Confirm UI still works.
5. Confirm loading/error states.
6. Only then remove or disable the corresponding mock source.

This prevents breaking the existing application.

---

# 41. IMPLEMENTATION ORDER

Follow this order unless there is a concrete dependency requiring otherwise.

## Phase 1

```text
Spring Boot
PostgreSQL
Redis
Docker
```

## Phase 2

```text
Authentication
JWT
OTP
User service
```

## Phase 3

```text
Sport
League
Team
Match
Market
Odds
Kafka
```

## Phase 4

```text
Betting engine
Wallet service
```

## Phase 5

```text
WebSocket
Kafka consumers
```

## Phase 6

```text
Telebirr
Other payment integrations
```

## Phase 7

```text
Elasticsearch
Search
```

## Phase 8

```text
Admin panel/API
```

## Phase 9

```text
Frontend → Backend API integration
```

## Phase 10

```text
Prometheus
Grafana
Monitoring
```

## Phase 11

```text
Load testing
Security audit
```

## Phase 12

```text
Staging
Production deployment
```

Source specification:

---

# 42. AI WORKFLOW FOR EVERY TASK

Every coding task must follow this workflow.

## STEP 1 — INSPECT

Before writing code:

```text
Inspect repository
Inspect relevant files
Inspect dependencies
Inspect current implementation
Inspect API contracts
Inspect database state
Inspect frontend usage
```

---

## STEP 2 — UNDERSTAND

Identify:

```text
What already exists?
What is missing?
What depends on this?
What consumes this?
What will this change affect?
```

---

## STEP 3 — PLAN

Before editing:

```text
Files to create
Files to modify
Files that must remain untouched
Dependencies required
API changes
Database changes
Frontend impact
Testing requirements
```

For major changes, explain the plan first.

---

## STEP 4 — IMPLEMENT THE SMALLEST SAFE CHANGE

Prefer:

```text
Create new file
Add isolated service
Add isolated controller
Add migration
Add DTO
Add repository
```

instead of:

```text
Rewrite large existing modules
```

---

# 43. FILE MODIFICATION RULE

Before modifying a file, determine:

```text
Why does this file need modification?
What currently depends on it?
Will its public API change?
Will frontend behavior change?
Will another service depend on it?
```

If the file does not need modification:

**Do not modify it.**

---

# 44. DATABASE MIGRATION RULE

Never modify existing database structure manually when Flyway is being used.

Use:

```text
src/main/resources/db/migration/
```

Example:

```text
V1__initial_schema.sql
V2__add_user_version.sql
V3__add_transaction_index.sql
```

Never rewrite an already-applied migration unless explicitly instructed.

Create a new migration.

---

# 45. TEST AFTER EVERY SIGNIFICANT CHANGE

After implementation:

```text
Compile
 ↓
Run tests
 ↓
Start application
 ↓
Check logs
 ↓
Test endpoint
 ↓
Check database
 ↓
Check dependent functionality
```

For frontend-related backend changes:

```text
Backend test
 ↓
API test
 ↓
Frontend integration test
 ↓
Confirm existing UI still works
```

---

# 46. DO NOT HIDE ERRORS

If something fails:

Do not:

* delete functionality;
* disable security;
* comment out important code;
* remove tests;
* bypass authentication;
* bypass payment verification;
* ignore database errors;
* silently change the architecture.

Instead:

```text
Identify error
 ↓
Explain cause
 ↓
Fix root cause
 ↓
Retest
```

---

# 47. ENVIRONMENT VARIABLES

Never hardcode:

```text
JWT secrets
Database passwords
Redis passwords
Kafka credentials
Telebirr credentials
Payment provider secrets
SMS credentials
Elasticsearch credentials
Grafana passwords
```

Use environment variables.

Examples from the specification include:

```text
JWT_SECRET
DB_PASSWORD
TELEBIRR_APP_ID
TELEBIRR_APP_KEY
RABBIT_PASSWORD
GRAFANA_PASSWORD
```

---

# 48. DOCKER

The intended architecture uses Docker Compose with services including:

```text
API
Frontend
PostgreSQL
Redis
Zookeeper
Kafka
Elasticsearch
Prometheus
Grafana
Nginx
```

The AI must not assume all services need to be started during every local development task.

Use the smallest required environment for development and testing when possible, while preserving the specified full-stack architecture.

Source specification:

---

# 49. ARCHITECTURE FLOW

The target system architecture is:

```text
CLIENTS
   │
   ▼
NGINX
   │
   ▼
SPRING BOOT API
   │
   ├──────────────► PostgreSQL
   │
   ├──────────────► Redis
   │
   ├──────────────► Kafka
   │
   └──────────────► Elasticsearch
                       │
                       ▼
                   Analytics
```

Kafka consumers handle asynchronous processing.

WebSocket provides real-time updates to clients.

External integrations include:

```text
Telebirr
Santim Pay
Arifpay
Dashen Bank
Sportradar
Twilio
Firebase
```

Source specification:

---

# 50. CORE DATA FLOWS

## Odds Flow

```text
Odds Engine
    ↓
Kafka
    ↓
Redis Cache
    ↓
WebSocket
    ↓
Frontend
```

The specification summarizes this as:

```text
Odds Engine → Kafka → Cache Update + WebSocket Broadcast
```

---

## Bet Flow

```text
Frontend
    ↓
Place Bet API
    ↓
Validate
    ↓
Server-side Odds Snapshot
    ↓
Balance Lock
    ↓
Deduct Stake
    ↓
Create Bet
    ↓
Kafka Event
    ↓
Settlement / Downstream Processing
```

---

## Payment Flow

```text
Frontend
    ↓
Payment API
    ↓
Pending Transaction
    ↓
Payment Provider
    ↓
Webhook
    ↓
Verification
    ↓
Kafka
    ↓
Balance Credit
    ↓
WebSocket
    ↓
Frontend
```

---

## Search Flow

```text
PostgreSQL
    ↓
Elasticsearch Sync
    ↓
Search API
    ↓
Frontend
```

Source specification:

---

# 51. WHEN IMPLEMENTING A NEW FEATURE

Use this checklist:

```text
[ ] Inspect existing implementation
[ ] Identify affected modules
[ ] Identify API contract
[ ] Identify database requirements
[ ] Identify authentication requirements
[ ] Identify authorization requirements
[ ] Identify caching requirements
[ ] Identify Kafka events
[ ] Identify WebSocket events
[ ] Identify frontend dependencies
[ ] Implement backend
[ ] Add migration
[ ] Add validation
[ ] Add exception handling
[ ] Add tests
[ ] Run application
[ ] Test API
[ ] Test integration
[ ] Confirm existing functionality still works
```

---

# 52. WHEN MODIFYING EXISTING CODE

Before modifying:

```text
READ FIRST.
UNDERSTAND SECOND.
MODIFY THIRD.
TEST FOURTH.
```

Never:

```text
GUESS → MODIFY → BREAK → TRY TO FIX
```

---

# 53. AI OUTPUT REQUIREMENTS

After completing a task, report:

```text
1. What was changed
2. Files created
3. Files modified
4. Files intentionally left untouched
5. Database migrations added
6. APIs added/changed
7. Dependencies added
8. Tests performed
9. Test results
10. Any remaining issue
```

If the task could not be completed safely, say so.

Do not pretend that an integration works when credentials or external services have not been tested.

---

# 54. MAJOR ARCHITECTURE CHANGE RULE

Do not make major architectural changes automatically.

Examples:

```text
Replacing PostgreSQL
Removing Kafka
Removing Redis
Replacing Spring Boot
Changing authentication architecture
Changing API routes
Changing database schema design
Replacing WebSocket
Changing payment architecture
Replacing Elasticsearch
```

Before making such a change:

```text
Explain:
- Existing design
- Proposed change
- Reason
- Affected components
- Migration impact
- Frontend impact
- Risk
```

Wait for approval when the change is not required to complete the current task.

---

# 55. PRIORITY RULE

When multiple tasks exist, use this priority:

```text
🔴 Critical
    ↓
🟡 High
    ↓
🟢 Medium
```

Critical backend functionality includes:

```text
Database
Authentication
Matches
Markets/Odds
Betting
Wallet
Payments
Frontend API integration
```

---

# 56. CURRENT MOCK → BACKEND MIGRATION

The frontend currently has:

```text
Matches       → mock
Odds          → simulated
User profile  → mock
Bets          → in-memory
Polymarket    → mock
Payment       → UI only
```

The goal is to gradually replace these with backend-backed functionality.

Do not perform the migration all at once.

Recommended sequence:

```text
Authentication
    ↓
User profile
    ↓
Matches
    ↓
Markets/Odds
    ↓
Wallet
    ↓
Bet placement
    ↓
Bet history
    ↓
WebSocket
    ↓
Payments
```

---

# 57. FINAL NON-NEGOTIABLE RULES

The AI must always remember:

### Rule 1

**Do not damage the existing codebase.**

### Rule 2

**Do not redesign working frontend functionality unless explicitly requested.**

### Rule 3

**Do not guess the repository structure. Inspect it.**

### Rule 4

**Do not trust frontend financial values.**

### Rule 5

**Do not trust frontend odds.**

### Rule 6

**Protect user balances from race conditions.**

### Rule 7

**Payment webhooks must be verified and idempotent.**

### Rule 8

**Use PostgreSQL for persistent transactional state.**

### Rule 9

**Use Redis as cache/fast state, not as the authoritative financial database.**

### Rule 10

**Use Kafka for the specified event-driven flows.**

### Rule 11

**Use WebSocket for real-time client updates.**

### Rule 12

**Use Flyway for database schema changes.**

### Rule 13

**Never hardcode secrets.**

### Rule 14

**Do not delete mock functionality until the replacement backend functionality is tested.**

### Rule 15

**Make the smallest safe change necessary.**

### Rule 16

**Test after every significant change.**

### Rule 17

**Do not silently change API contracts.**

### Rule 18

**Do not silently change architecture.**

### Rule 19

**Do not claim something works without testing it.**

### Rule 20

**Preserve the Fida Bet application flow.**

---

# 58. THE AI'S CORE MISSION

The mission is not simply:

```text
"Build a Spring Boot backend."
```

The mission is:

```text
BUILD THE FIDA BET BACKEND
+
CONNECT IT TO THE EXISTING FRONTEND
+
PRESERVE THE EXISTING APPLICATION FLOW
+
PROTECT FINANCIAL OPERATIONS
+
IMPLEMENT THE SPECIFIED ARCHITECTURE
+
MAKE CHANGES INCREMENTALLY
+
NEVER DAMAGE WORKING FUNCTIONALITY
```

The backend should become the real source of application data while the existing frontend remains the client experience.

**Inspect → Plan → Implement → Test → Verify → Continue.**
