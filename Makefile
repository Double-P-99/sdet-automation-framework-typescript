# ──────────────────────────────────────────────────────────────────────────────
# SDET Automation Framework — Makefile
# Requires: make, Docker Compose v2, Node.js ≥ 20
#
# On Windows: install make via Chocolatey → choco install make
#             or run from Git Bash / WSL
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: install up up-test down down-test logs logs-test health rebuild \
        smoke api integration e2e test test-all report debug ui \
        type-check lint setup ci \
        clean clean-test clean-all help

# ── Help ──────────────────────────────────────────────────────────────────────

## Show this help message
help:
	@echo ""
	@echo "SDET Automation Framework — available targets"
	@echo "────────────────────────────────────────────────────────────────"
	@echo ""
	@echo "  Setup"
	@echo "    install        Install Node deps and Playwright browsers"
	@echo ""
	@echo "  Backend: dev stack (persistent volume)"
	@echo "    up             Start PostgreSQL + Auth + Orders (:5432/:8001/:8002)"
	@echo "    down           Stop dev containers"
	@echo "    clean          Stop dev containers and delete volumes"
	@echo "    logs           Tail dev stack logs"
	@echo "    rebuild        Rebuild images and restart dev stack"
	@echo ""
	@echo "  Backend: test stack (ephemeral, tmpfs)"
	@echo "    up-test        Start ephemeral stack (:5433/:8001/:8002)"
	@echo "    down-test      Stop test containers"
	@echo "    clean-test     Stop test containers and delete volumes"
	@echo "    clean-all      Stop both stacks and delete all volumes"
	@echo "    logs-test      Tail test stack logs"
	@echo "    rebuild-test   Rebuild images and restart test stack"
	@echo ""
	@echo "  Health"
	@echo "    health         Ping /health on both services"
	@echo ""
	@echo "  Tests"
	@echo "    smoke          @smoke — fast availability gate (~5s)"
	@echo "    api            API contract tests (auth + orders)"
	@echo "    integration    Cross-service + DB validation tests"
	@echo "    e2e            UI tests in Chromium"
	@echo "    test           Run all Playwright projects"
	@echo "    ui             Open Playwright interactive test runner"
	@echo "    debug          Open Playwright step-by-step debugger"
	@echo "    report         Open last HTML test report"
	@echo "    setup          Run UI auth setup (saves browser state)"
	@echo ""
	@echo "  Code quality"
	@echo "    type-check     TypeScript type check (no emit)"
	@echo "    lint           ESLint on src/ and tests/"
	@echo ""
	@echo "  Compound"
	@echo "    ci             up-test → smoke → api → integration → down-test"
	@echo "    test-all       smoke → api → integration → e2e (stack must be up)"
	@echo "    all            up → smoke → api → integration → e2e → report"
	@echo ""

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

## Stop development containers and delete volumes (wipes DB data)
clean:
	docker compose -f backend/docker-compose.yml down -v

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

## Stop test containers and delete volumes
clean-test:
	docker compose -f backend/docker-compose.test.yml down -v

## Stop and delete volumes from both stacks
clean-all:
	docker compose -f backend/docker-compose.yml down -v
	docker compose -f backend/docker-compose.test.yml down -v

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

## Run all test suites in order (stack must already be up)
test-all:
	$(MAKE) smoke
	$(MAKE) api
	$(MAKE) integration
	$(MAKE) e2e

## Full local workflow against persistent dev stack
all: up smoke api integration e2e report
