# ──────────────────────────────────────────────────────────────────────────────
# SDET Automation Framework — Makefile
# Requires: make, Docker Compose v2, Node.js ≥ 20
#
# On Windows: install make via Chocolatey → choco install make
#             or run from Git Bash / WSL
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: install up up-test down down-test logs logs-test health rebuild \
        smoke api integration e2e test report debug ui \
        type-check lint setup ci

# ── Setup ─────────────────────────────────────────────────────────────────────

## Install Node deps and download Playwright browsers
install:
	npm install
	npx playwright install --with-deps

# ── Backend: development stack (persistent volume) ────────────────────────────

## Start Auth + Orders services + PostgreSQL on :5432 (data persists)
up:
	docker compose -f backend/docker-compose.yml up -d

## Stop and remove development containers
down:
	docker compose -f backend/docker-compose.yml down

## Tail logs from the development stack
logs:
	docker compose -f backend/docker-compose.yml logs -f

## Rebuild images and restart the development stack
rebuild:
	docker compose -f backend/docker-compose.yml up -d --build

# ── Backend: ephemeral test stack (tmpfs, resets on restart) ──────────────────

## Start test stack — PostgreSQL on :5433, services on :8001 and :8002 (in-memory DB)
up-test:
	docker compose -f backend/docker-compose.test.yml up -d

## Stop and remove ephemeral test containers
down-test:
	docker compose -f backend/docker-compose.test.yml down

## Tail logs from the test stack
logs-test:
	docker compose -f backend/docker-compose.test.yml logs -f

## Rebuild images and restart the ephemeral test stack
rebuild-test:
	docker compose -f backend/docker-compose.test.yml up -d --build

# ── Service health ────────────────────────────────────────────────────────────

## Ping both service health endpoints
health:
	@echo "Auth Service:"
	@curl -s http://localhost:8001/health
	@echo ""
	@echo "Orders Service:"
	@curl -s http://localhost:8002/health
	@echo ""

# ── Tests ─────────────────────────────────────────────────────────────────────

## Run @smoke tests only (fast gate, ~5s)
smoke:
	npx playwright test --project=smoke

## Run API contract tests (auth + orders)
api:
	npx playwright test --project=api

## Run cross-service + DB validation tests
integration:
	npx playwright test --project=integration

## Run UI tests in Chromium
e2e:
	npx playwright test --project=chromium

## Run all Playwright projects
test:
	npx playwright test

## Open Playwright interactive test runner (UI mode)
ui:
	npx playwright test --ui

## Open Playwright step-by-step debugger
debug:
	npx playwright test --debug

## Open the last HTML test report
report:
	npx playwright show-report

## Run UI auth setup script (saves browser storage state)
setup:
	npx playwright test tests/setup/auth.setup.ts

# ── Code quality ──────────────────────────────────────────────────────────────

## Run TypeScript type checking (no emit)
type-check:
	npx tsc --noEmit

## Run ESLint on src/ and tests/
lint:
	npx eslint src tests --ext .ts

# ── Compound targets ──────────────────────────────────────────────────────────

## Full CI workflow: start ephemeral stack → smoke → api → integration → teardown
ci: up-test
	sleep 5
	$(MAKE) smoke
	$(MAKE) api
	$(MAKE) integration
	$(MAKE) down-test

## Full local workflow against persistent dev stack
all: up smoke api integration e2e report
