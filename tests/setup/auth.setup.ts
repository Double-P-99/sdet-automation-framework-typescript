import { test as setup } from '@playwright/test';
import { LoginFlow } from '../../src/modules/login/flows/LoginFlow';
import { STORAGE_PATHS } from '../../src/shared/const/GlobalConst';

/**
 * Auth setup – runs once before the test suite.
 * Saves browser storage state (cookies + localStorage) so tests skip UI login.
 */

setup('authenticate as customer', async ({ page }) => {
  const loginFlow = new LoginFlow(page);
  await loginFlow.loginAsCustomer();
  await page.context().storageState({ path: STORAGE_PATHS.customerAuth });
});

setup('authenticate as admin', async ({ page }) => {
  const loginFlow = new LoginFlow(page);
  await loginFlow.loginAsAdmin();
  await page.context().storageState({ path: STORAGE_PATHS.adminAuth });
});
