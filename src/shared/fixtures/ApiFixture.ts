import { test as base } from '@playwright/test';

import { AuthApiClient } from '../../api/AuthApiClient';
import { OrdersApiClient } from '../../api/OrdersApiClient';
import { AuthDataBuilder } from '../../modules/auth/builders/AuthDataBuilder';
import { AuthFlow } from '../../modules/auth/flows/AuthFlow';
import type { TokenResponse } from '../../api/types/auth.types';

export interface ApiFixtures {
  authClient: AuthApiClient;
  ordersClient: OrdersApiClient;
  customerToken: TokenResponse;
  adminToken: TokenResponse;
  authenticatedOrdersClient: OrdersApiClient;
  adminOrdersClient: OrdersApiClient;
}

/**
 * API-level fixtures.
 * Uses AuthDataBuilder + AuthFlow to obtain tokens — mirroring how the
 * UI BaseFixture uses LoginDataBuilder + LoginFlow.
 */
export const test = base.extend<ApiFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },

  ordersClient: async ({ request }, use) => {
    await use(new OrdersApiClient(request));
  },

  customerToken: async ({ request }, use) => {
    const flow = new AuthFlow(new AuthApiClient(request));
    const credentials = new AuthDataBuilder().withCustomerCredentials().build();
    const { body, status } = await flow.login(credentials);
    if (status !== 200) {
      throw new Error(`Customer login failed with status ${status}. Is the auth service running?`);
    }
    await use(body);
  },

  adminToken: async ({ request }, use) => {
    const flow = new AuthFlow(new AuthApiClient(request));
    const credentials = new AuthDataBuilder().withAdminCredentials().build();
    const { body, status } = await flow.login(credentials);
    if (status !== 200) {
      throw new Error(`Admin login failed with status ${status}. Is the auth service running?`);
    }
    await use(body);
  },

  authenticatedOrdersClient: async ({ request, customerToken }, use) => {
    await use(new OrdersApiClient(request, customerToken.access_token));
  },

  adminOrdersClient: async ({ request, adminToken }, use) => {
    await use(new OrdersApiClient(request, adminToken.access_token));
  },
});

export { expect } from '@playwright/test';
