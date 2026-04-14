import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env file: prefer config/.env, fall back to root .env
dotenv.config({ path: path.resolve(__dirname, 'config', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(isCI ? [['github'] as ['github']] : []),
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // ── Smoke ──────────────────────────────────────────────────────
    // Fast service-availability check. Run first in CI pipelines.
    {
      name: 'smoke',
      testDir: './tests/smoke',
      use: {},
    },

    // ── API ────────────────────────────────────────────────────────
    // Pure HTTP tests against Auth and Orders microservices.
    // No browser required.
    {
      name: 'api',
      testDir: './tests/api',
      use: {},
      dependencies: ['smoke'],
    },

    // ── Integration ────────────────────────────────────────────────
    // Cross-service and API→DB validation tests.
    {
      name: 'integration',
      testDir: './tests/integration',
      use: {},
      dependencies: ['smoke'],
    },

    // ── UI Auth setup ──────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: '**/setup/*.setup.ts',
    },

    // ── UI (Chromium) ──────────────────────────────────────────────
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: ['**/api/**', '**/integration/**', '**/smoke/**'],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // ── UI (Firefox) — CI only ─────────────────────────────────────
    ...(isCI
      ? [
          {
            name: 'firefox',
            testDir: './tests',
            testIgnore: ['**/api/**', '**/integration/**', '**/smoke/**'],
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
  outputDir: 'test-results',
});
