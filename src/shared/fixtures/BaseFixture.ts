import { test as base, Page } from '@playwright/test';
import { LoginFlow } from '../../modules/login/flows/LoginFlow';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

/**
 * Extended test fixtures that provide pre-authenticated browser pages.
 * Prefer these fixtures over inline login flows in test specs.
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginFlow = new LoginFlow(page);
    await loginFlow.loginAsCustomer();
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    const loginFlow = new LoginFlow(page);
    await loginFlow.loginAsAdmin();
    await use(page);
  },
});

export { expect } from '@playwright/test';
