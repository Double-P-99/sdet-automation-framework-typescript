import { test } from '../../src/shared/fixtures/ApiFixture';
import { OrderDataBuilder } from '../../src/modules/orders/builders/OrderDataBuilder';
import { AuthDataBuilder } from '../../src/modules/auth/builders/AuthDataBuilder';
import { AuthFlow } from '../../src/modules/auth/flows/AuthFlow';
import { AuthValidation } from '../../src/modules/auth/validations/AuthValidation';
import { OrdersFlow } from '../../src/modules/orders/flows/OrdersFlow';
import { OrdersValidation } from '../../src/modules/orders/validations/OrdersValidation';

/**
 * @group integration
 *
 * End-to-end integration tests spanning Auth → Orders services.
 * These tests exercise complete user journeys across service boundaries
 * and validate consistent data propagation.
 */
test.describe('Integration — Auth → Orders flow', () => {
  test('full journey: login → create order → retrieve order @integration @regression', async ({
    authClient,
    request,
  }) => {
    const authFlow = new AuthFlow(authClient);
    const authValidation = new AuthValidation();
    const credentials = new AuthDataBuilder().withCustomerCredentials().build();

    const { status: loginStatus, body: tokens } = await authFlow.login(credentials);
    authValidation.assertLoginSuccess(loginStatus, tokens);

    const { OrdersApiClient } = await import('../../src/api/OrdersApiClient');
    const flow = new OrdersFlow(new OrdersApiClient(request, tokens.access_token));
    const validation = new OrdersValidation();
    const data = new OrderDataBuilder()
      .withItem({ product_id: 'PROD-ITG-001', product_name: 'Integration Widget', quantity: 3, unit_price: 20.0 })
      .withNotes('Integration test order')
      .build();

    const { status: createStatus, body: order } = await flow.createOrder(data);
    validation.assertOrderCreated(createStatus, order, 1);
    validation.assertTotalAmount(order, 60.0);

    const { status: getStatus, body: retrieved } = await flow.getOrder(order.id);
    validation.assertOrderRetrieved(getStatus, retrieved, order.id);
    validation.assertNotes(retrieved, 'Integration test order');
  });

  test('token from auth service is accepted by orders service @integration @smoke', async ({
    authenticatedOrdersClient,
  }) => {
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const validation = new OrdersValidation();
    const data = new OrderDataBuilder().withSingleItem().build();

    const { status, body } = await flow.createOrder(data);

    validation.assertOrderCreated(status, body);
  });

  test('expired or tampered token is rejected by orders service @integration @security', async ({
    request,
  }) => {
    const { OrdersApiClient } = await import('../../src/api/OrdersApiClient');
    const flow = new OrdersFlow(new OrdersApiClient(request, 'invalid.tampered.token'));
    const validation = new OrdersValidation();
    const data = new OrderDataBuilder().withSingleItem().build();

    const { status } = await flow.createOrder(data);

    validation.assertUnauthorized(status);
  });

  test('refreshed token works seamlessly with orders service @integration @regression', async ({
    authClient,
    request,
    customerToken,
  }) => {
    const authFlow = new AuthFlow(authClient);
    const authValidation = new AuthValidation();

    const { status: refreshStatus, body: freshTokens } = await authFlow.refresh(
      customerToken.refresh_token,
    );
    authValidation.assertTokenRefreshed(refreshStatus, freshTokens);

    const { OrdersApiClient } = await import('../../src/api/OrdersApiClient');
    const flow = new OrdersFlow(new OrdersApiClient(request, freshTokens.access_token));
    const validation = new OrdersValidation();

    const { status, body } = await flow.createOrder(
      new OrderDataBuilder().withSingleItem().build(),
    );

    validation.assertOrderCreated(status, body);
  });

  test('order user_id matches the authenticated user id @integration @regression', async ({
    authClient,
    authenticatedOrdersClient,
    customerToken,
  }) => {
    const authFlow = new AuthFlow(authClient);
    const ordersFlow = new OrdersFlow(authenticatedOrdersClient);
    const validation = new OrdersValidation();

    const { body: profile } = await authFlow.getMe(customerToken.access_token);
    const { body: order } = await ordersFlow.createOrder(
      new OrderDataBuilder().withSingleItem().build(),
    );

    validation.assertUserOwnership(order, profile.id);
  });

  test('admin can manage any customer order @integration @regression', async ({
    authenticatedOrdersClient,
    adminOrdersClient,
  }) => {
    const customerFlow = new OrdersFlow(authenticatedOrdersClient);
    const adminFlow = new OrdersFlow(adminOrdersClient);
    const validation = new OrdersValidation();

    const { body: order } = await customerFlow.createOrder(
      new OrderDataBuilder().withSingleItem().build(),
    );
    const { status, body: updated } = await adminFlow.updateStatus(order.id, {
      status: 'CONFIRMED',
    });
    validation.assertOrderRetrieved(status, updated, order.id);
    validation.assertOrderStatus(updated, 'CONFIRMED');

    const { body: customerView } = await customerFlow.getOrder(order.id);
    validation.assertOrderStatus(customerView, 'CONFIRMED');
  });
});
