# SDET Automation Framework — TypeScript + Playwright

A production-grade automation framework built with **Playwright** and **TypeScript**, using a layered **Page Object Model** architecture organised by feature module.

---

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install

# Copy and configure environment
cp .env.example .env

# Run all tests
npm test

# Run with UI mode (interactive)
npm run test:ui

# Run a specific module
npm run test:login
npm run test:checkout

# Open the HTML report
npm run test:report
```

---

## Architecture

Each feature module is a **self-contained vertical slice** with six layers:

```
src/modules/[module]/
  const/          ← Selectors, routes, messages (no magic strings)
  pages/          ← Page Object classes — raw UI interactions only
  flows/          ← Multi-step user journeys (compose pages)
  builders/       ← Test data builders (Builder pattern, chainable)
  validations/    ← All assertion logic (expect() calls live here)
  utils/          ← Pure helper functions scoped to the module
```

Shared infrastructure lives in `src/shared/`:

```
src/shared/
  const/          ← Global constants (timeouts, HTTP codes, storage paths)
  utils/          ← ApiClient, TestHelpers
  fixtures/       ← BaseFixture — extended Playwright test with auth
```

### Layer Contract

| Layer | Allowed to use | Must NOT use |
|---|---|---|
| `pages` | Playwright Locators | `expect()`, flow logic |
| `flows` | Page classes | `expect()` directly |
| `builders` | Nothing external | Page or flow classes |
| `validations` | Page classes, `expect()` | Flow logic |
| `utils` | Standard lib only | Page, flow, or validation classes |

---

## Modules

| Module | Layers | Tests |
|---|---|---|
| `login` | const, pages, flows, builders, validations, utils | [tests/login/login.spec.ts](tests/login/login.spec.ts) |
| `checkout` | const, pages, flows, builders, validations, utils | [tests/checkout/checkout.spec.ts](tests/checkout/checkout.spec.ts) |

---

## Adding a New Module

1. Create `src/modules/[name]/` with the six layer files
2. Add test data builder with sensible defaults
3. Add spec in `tests/[name]/[name].spec.ts`
4. Import `test` from `src/shared/fixtures/BaseFixture` for auth

---

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

## Documentation

| File | Content |
|---|---|
| [docs/day1-framework-context.md](docs/day1-framework-context.md) | Architecture, capabilities, outcomes, roadmap |
| [docs/day2-interview-answers.md](docs/day2-interview-answers.md) | Playwright, flakiness, framework design, microservices, priorities |
| [docs/day3-real-project-map.md](docs/day3-real-project-map.md) | Real project: testability improvements & developer collaboration |
| [docs/day4-technical-stories.md](docs/day4-technical-stories.md) | Three STAR-format technical stories for interviews |
| [docs/day5-7-practice-guide.md](docs/day5-7-practice-guide.md) | Speaking practice, mock interview questions, self-audit |

