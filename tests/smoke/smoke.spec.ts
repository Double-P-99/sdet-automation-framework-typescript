import { test } from '../../src/shared/fixtures/ApiFixture';
import { AuthDataBuilder } from '../../src/modules/auth/builders/AuthDataBuilder';
import { AuthFlow } from '../../src/modules/auth/flows/AuthFlow';
import { AuthValidation } from '../../src/modules/auth/validations/AuthValidation';
import { OrdersFlow } from '../../src/modules/orders/flows/OrdersFlow';
import { OrdersValidation } from '../../src/modules/orders/validations/OrdersValidation';

/**
 * @group smoke
 *
 * Fast health-check suite. Run before any other suite in CI to determine
 * whether services are reachable. Fail fast — no sense running 200 tests
 * if the services are down.
 *
 * Target runtime: < 10 seconds total.
 */
test.describe('Smoke — Service availability', () => {
  test('auth-service health endpoint is reachable @smoke', async ({ authClient }) => {
    const flow = new AuthFlow(authClient);
    const validation = new AuthValidation();

    const { status, body } = await flow.health();

    validation.assertHealthy(status, body);
  });

  test('orders-service health endpoint is reachable @smoke', async ({ ordersClient }) => {
    const flow = new OrdersFlow(ordersClient);
    const validation = new OrdersValidation();

    const { status, body } = await flow.health();

    validation.assertHealthy(status, body);
  });

  test('auth-service accepts and validates credentials @smoke', async ({ authClient }) => {
    const flow = new AuthFlow(authClient);
    const validation = new AuthValidation();
    const credentials = new AuthDataBuilder().withCustomerCredentials().build();

    const { status, body } = await flow.login(credentials);

    validation.assertLoginSuccess(status, body);
  });

  test('orders-service accepts authenticated requests @smoke', async ({
    authenticatedOrdersClient,
  }) => {
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const validation = new OrdersValidation();

    const { status, body } = await flow.listOrders({ page: 1, page_size: 1 });

    validation.assertPaginatedShape(status, body);
  });
});
