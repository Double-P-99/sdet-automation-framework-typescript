# SDET Automation Framework — Playwright + TypeScript + FastAPI

> **Senior SDET Portfolio Project** — A production-quality system demonstrating end-to-end SDET engineering: microservice backend, layered test strategy, API/DB/UI coverage, and CI/CD pipeline.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         System Under Test                            │
│                                                                      │
│  ┌──────────────────────┐      ┌──────────────────────────────────┐  │
│  │   Auth Service       │      │   Orders Service                 │  │
│  │   FastAPI :8001      │      │   FastAPI :8002                  │  │
│  │                      │      │                                  │  │
│  │  POST /auth/login    │      │  POST   /orders/                 │  │
│  │  POST /auth/refresh  │ JWT  │  GET    /orders/                 │  │
│  │  GET  /auth/me       │─────▶│  GET    /orders/:id              │  │
│  │  POST /auth/register │      │  PATCH  /orders/:id/status       │  │
│  └──────────┬───────────┘      │  DELETE /orders/:id              │  │
│             │                  └────────────┬─────────────────────┘  │
│             ▼                               ▼                        │
│        authdb (PostgreSQL)           ordersdb (PostgreSQL)           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      Test Automation Framework                       │
│                                                                      │
│  tests/smoke/        ▶ Service health, fast fail                    │
│  tests/api/          ▶ HTTP contract tests (auth + orders)          │
│  tests/integration/  ▶ Cross-service + API→DB validation            │
│  tests/login/        ▶ UI flows (practicesoftwaretesting.com)       │
│  tests/checkout/     ▶ UI flows (practicesoftwaretesting.com)       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
├── backend/
│   ├── auth_service/            FastAPI Auth microservice
│   │   ├── app/
│   │   │   ├── api/routes/      Route handlers
│   │   │   ├── core/            Config, security (JWT/bcrypt), logging
│   │   │   ├── db/              SQLAlchemy session + declarative base
│   │   │   ├── models/          ORM models (User)
│   │   │   ├── schemas/         Pydantic request/response schemas
│   │   │   └── services/        Business logic layer
│   │   ├── main.py              FastAPI app + request-tracing middleware
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── orders_service/          FastAPI Orders microservice (mirrors auth structure)
│   ├── db/init/                 DB init scripts + seed data
│   ├── docker-compose.yml       Production-like stack
│   └── docker-compose.test.yml  Ephemeral test stack (tmpfs postgres)
│
├── src/
│   ├── api/                     Typed API clients
│   │   ├── AuthApiClient.ts     Wraps all Auth Service endpoints
│   │   ├── OrdersApiClient.ts   Wraps all Orders Service endpoints
│   │   └── types/               Shared TypeScript interfaces
│   ├── db/                      DB validation layer
│   │   ├── DbClient.ts          pg Pool wrapper for test-side SQL
│   │   └── queries/             UserQueries, OrderQueries
│   ├── modules/
│   │   ├── login/               LoginDataBuilder, LoginFlow, LoginPage, LoginValidation
│   │   ├── checkout/            CheckoutDataBuilder, CheckoutFlow, etc.
│   │   └── orders/              OrderDataBuilder, OrdersConst
│   └── shared/
│       ├── const/               GlobalConst (timeouts, HTTP codes, env URLs)
│       ├── fixtures/            BaseFixture (UI auth), ApiFixture (API clients)
│       └── utils/               ApiClient, TestHelpers
│
├── tests/
│   ├── smoke/                   @smoke  — fast availability checks
│   ├── api/auth/                @regression — Auth API contract tests
│   ├── api/orders/              @regression — Orders API contract tests
│   ├── integration/             @integration — cross-service + DB validation
│   ├── login/                   @regression — UI login tests
│   ├── checkout/                @regression — UI checkout tests
│   └── setup/                   Auth state setup for UI tests
│
├── config/
│   ├── .env.example             All required variables documented
│   └── .env.ci                  CI-specific values
│
├── .github/workflows/
│   ├── ci.yml                   PR/push: smoke → api → integration
│   └── regression.yml           Nightly full suite
│
└── playwright.config.ts         Four Playwright projects: smoke, api, integration, chromium
```

---

## Quick Start — Run Everything

### Prerequisites

- Docker ≥ 24 and Docker Compose v2
- Node.js ≥ 20

### 1. Install test dependencies

```bash
npm install
npx playwright install --with-deps   # Download Playwright browsers
```

### 2. Configure environment variables

```bash
cp config/.env.example config/.env
```

The defaults in `.env.example` work out-of-the-box for local development. No edits needed unless you change ports.

```
# config/.env (default values)
AUTH_API_URL=http://localhost:8001
ORDERS_API_URL=http://localhost:8002
AUTH_DB_URL=postgresql://postgres:postgres@localhost:5432/authdb
ORDERS_DB_URL=postgresql://postgres:postgres@localhost:5432/ordersdb
CUSTOMER_EMAIL=customer@test.com
CUSTOMER_PASSWORD=Test@12345
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Test@12345
BASE_URL=https://practicesoftwaretesting.com
```

### 3. Start the backend services

**Option A — Development stack** (data persists between runs)

```bash
npm run backend:up
```

Starts: PostgreSQL on `:5432`, Auth Service on `:8001`, Orders Service on `:8002`.  
Data is stored in a named Docker volume — survives container restarts.

**Option B — Ephemeral test stack** (recommended for tests)

```bash
npm run backend:test
```

Starts the same services but PostgreSQL runs on `:5433` with an in-memory tmpfs volume — fully reset every time you restart. The Auth and Orders services still listen on `:8001` and `:8002`.

> For DB validation tests (`@db-validation`), use Option B and make sure `ORDERS_DB_URL` points to port `5433`:
> ```
> ORDERS_DB_URL=postgresql://postgres:postgres@localhost:5433/ordersdb
> ```

### 4. Verify services are up

```bash
curl http://localhost:8001/health
# → {"status":"healthy","service":"auth-service"}

curl http://localhost:8002/health
# → {"status":"healthy","service":"orders-service"}
```

Swagger UI is also available at:
- http://localhost:8001/docs — Auth Service
- http://localhost:8002/docs — Orders Service

### 5. Run the tests

Run all suites in the recommended order:

```bash
npm run test:smoke        # Health checks — fast fail gate (~5s)
npm run test:api          # API contract tests (auth + orders)
npm run test:integration  # Cross-service + DB validation
npm run test:e2e          # UI tests (practicesoftwaretesting.com — no backend needed)
```

Or run everything at once:

```bash
npm test
```

### 6. Teardown

```bash
# Development stack
docker compose -f backend/docker-compose.yml down

# Ephemeral test stack
docker compose -f backend/docker-compose.test.yml down
```

---

## Seeded Test Credentials

Both stacks seed the same users on first boot:

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| customer | customer@test.com     | Test@12345  |
| admin    | admin@test.com        | Test@12345  |

---

## All Available npm Scripts

| Script                   | Description                                              |
|--------------------------|----------------------------------------------------------|
| `npm test`               | Run all Playwright projects                              |
| `npm run test:smoke`     | `@smoke` — health checks, fast fail gate                 |
| `npm run test:api`       | API contract tests (auth + orders)                       |
| `npm run test:integration` | Cross-service + DB validation tests                   |
| `npm run test:e2e`       | UI tests in Chromium                                     |
| `npm run test:login`     | Login UI tests only                                      |
| `npm run test:checkout`  | Checkout UI tests only                                   |
| `npm run test:ui`        | Open Playwright interactive test runner                  |
| `npm run test:report`    | Open last HTML test report                               |
| `npm run test:ci`        | Run with GitHub CI reporter                              |
| `npm run backend:up`     | Start development backend (persistent volume)            |
| `npm run backend:test`   | Start ephemeral test backend (tmpfs, resets on restart)  |
| `npm run backend:down`   | Stop development backend                                 |
| `npm run type-check`     | Run `tsc --noEmit`                                       |
| `npm run lint`           | Run ESLint on `src/` and `tests/`                        |

### Tag-based filtering

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep @integration
npx playwright test --grep @security
npx playwright test --grep @db-validation
```

---

## API Reference

### Auth Service — `http://localhost:8001`

| Method | Endpoint           | Auth   | Description                  |
|--------|--------------------|--------|------------------------------|
| POST   | /auth/login        | —      | Returns access + refresh JWT |
| POST   | /auth/refresh      | —      | Rotates tokens               |
| GET    | /auth/me           | Bearer | Current user profile         |
| POST   | /auth/register     | —      | Creates a new user           |
| GET    | /health            | —      | Health check                 |

### Orders Service — `http://localhost:8002`

| Method | Endpoint                 | Auth   | Description                         |
|--------|--------------------------|--------|-------------------------------------|
| POST   | /orders/                 | Bearer | Create order                        |
| GET    | /orders/                 | Bearer | List orders (paginated)             |
| GET    | /orders/:id              | Bearer | Get order detail                    |
| PATCH  | /orders/:id/status       | Bearer | Advance order status                |
| DELETE | /orders/:id              | Bearer | Cancel order                        |
| GET    | /health                  | —      | Health check                        |

### Order Status Lifecycle

```
PENDING ──▶ CONFIRMED ──▶ SHIPPED ──▶ DELIVERED
   │              │            │
   └──────────────┴────────────┴──────▶ CANCELLED
```

Customers can only cancel (PENDING or CONFIRMED). Admins control all transitions.

---

## Test Strategy

### Layered Testing Approach

| Layer       | What is tested                              | Tools                             |
|-------------|---------------------------------------------|-----------------------------------|
| **Smoke**   | Service health, critical auth               | Playwright API request            |
| **API**     | HTTP contracts, status codes, response shape | Playwright + AuthApiClient        |
| **Integration** | Cross-service data flow, API→DB state   | Playwright + pg (direct SQL)      |
| **UI**      | Critical browser journeys (login, checkout) | Playwright + POM                  |

### Test Tags

| Tag              | Meaning                                           |
|------------------|---------------------------------------------------|
| `@smoke`         | Must pass before any other suite                  |
| `@regression`    | Full regression coverage                          |
| `@integration`   | Requires running services and DB access           |
| `@security`      | Validates auth boundaries and data exposure       |
| `@db-validation` | Asserts via direct database query                 |

---

## Design Decisions

### Why FastAPI over Node.js?
Python's type annotations + Pydantic provide schema validation at the model level with zero boilerplate — making the API contract the single source of truth for request/response types.

### Test data management
- Fixed seeded users with known IDs for deterministic assertions
- Orders created dynamically per test; deleted in `afterAll` via `hardDeleteById`
- No shared mutable state between specs — tests can run in any order

### Flakiness prevention
- Smoke dependency gate in CI — if services are down, no test runs wasted
- `pool_pre_ping=True` on DB connections handles stale pool connections
- CI retries set to 2 for transient network issues
- No arbitrary sleeps; Docker healthchecks gate service startup

### Separation of concerns
- **AuthApiClient / OrdersApiClient** — encapsulate all HTTP details
- **DbClient / OrderQueries** — encapsulate all SQL; tests only call typed methods
- **ApiFixture** — composes auth tokens and clients; tests stay assertion-focused
- **OrderDataBuilder** — fluent API for valid, readable test data setup

### Security in the test suite
- Separate `@security` tests: no password fields in responses, access token ≠ refresh token, cross-user 403 (not 404)
- Only required fields expected in responses — regression guard against accidental data leaks

---

## CI/CD Pipeline

### `ci.yml` — triggers on every PR / push to main and develop

```
type-check ──┐
             ├─▶ smoke ──▶ api-tests
backend-up ──┘        └──▶ integration-tests ──▶ cleanup
```

### `regression.yml` — nightly at 02:00 UTC (also manually triggerable)

Runs the full suite against a fresh ephemeral stack, uploads an HTML report with 30-day retention.

---

## Module Layer Contract (UI tests)

Each feature module follows a strict six-layer contract:

```
src/modules/[module]/
  const/        ← Selectors, URLs (no magic strings)
  pages/        ← Raw Playwright locator interactions only
  flows/        ← Multi-step journeys, compose pages
  builders/     ← Test data, chainable Builder pattern
  validations/  ← All expect() assertions live here
  utils/        ← Pure helpers, no side effects
```

| Layer         | Can use                | Must NOT use        |
|---------------|------------------------|---------------------|
| `pages`       | Locators               | `expect()`, flows   |
| `flows`       | Page classes           | `expect()` directly |
| `builders`    | Nothing external       | Page/flow classes   |
| `validations` | Page classes, expect() | Flow logic          |

## Key Design Decisions

- **`data-test` attributes** — all selectors use `[data-test="..."]`, decoupled from CSS and markup
- **Storage state auth** — `tests/setup/auth.setup.ts` runs once and saves cookies, so tests skip UI login
- **Builder pattern** — `new LoginDataBuilder().withInvalidCredentials().build()` reads like intent
- **Validation layer** — centralising `expect()` means changing an assertion updates one file, not every spec
- **No `waitForTimeout`** — all waits use Playwright's built-in auto-wait or `expect()` retries

---

## CI / CD

The Playwright config is CI-aware:

- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 on CI (set `CI=true`), auto-detected locally
- **Reporter**: GitHub reporter on CI, HTML locally
- **Artifacts**: Traces on first retry, screenshots and videos on failure

```yaml
# GitHub Actions example
- name: Run tests
  run: npx playwright test
  env:
    CI: true
    BASE_URL: ${{ secrets.BASE_URL }}
    CUSTOMER_EMAIL: ${{ secrets.CUSTOMER_EMAIL }}
    CUSTOMER_PASSWORD: ${{ secrets.CUSTOMER_PASSWORD }}
```

---

