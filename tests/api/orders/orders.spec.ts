import { test } from '../../../src/shared/fixtures/ApiFixture';
import { OrderDataBuilder } from '../../../src/modules/orders/builders/OrderDataBuilder';
import { OrdersFlow } from '../../../src/modules/orders/flows/OrdersFlow';
import { OrdersValidation } from '../../../src/modules/orders/validations/OrdersValidation';
import { OrdersUtils } from '../../../src/modules/orders/utils/OrdersUtils';

/**
 * @group api
 * @group orders
 */
test.describe('Orders API — /orders', () => {
  test.describe('POST /orders — Create Order', () => {
    test('creates an order with PENDING status @smoke @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();
      const data = new OrderDataBuilder().withStandardItems().build();

      const { status, body } = await flow.createOrder(data);

      validation.assertOrderCreated(status, body, data.items.length);
    });

    test('correctly calculates total_amount and item subtotals @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();
      const data = new OrderDataBuilder()
        .withItem({ product_id: 'P1', product_name: 'Alpha', quantity: 2, unit_price: 10.0 })
        .withItem({ product_id: 'P2', product_name: 'Beta', quantity: 1, unit_price: 25.0 })
        .build();

      const { status, body } = await flow.createOrder(data);

      validation.assertOrderCreated(status, body);
      validation.assertTotalAmount(body, OrdersUtils.calculateExpectedTotal(data.items));
      validation.assertItemSubtotal(body, 0, 20.0);
      validation.assertItemSubtotal(body, 1, 25.0);
    });

    test('persists notes field @regression', async ({ authenticatedOrdersClient }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();
      const notes = OrdersUtils.generateOrderNotes('Priority delivery');
      const data = new OrderDataBuilder().withSingleItem().withNotes(notes).build();

      const { status, body } = await flow.createOrder(data);

      validation.assertOrderCreated(status, body);
      validation.assertNotes(body, notes);
    });

    test('returns 401 without auth token @regression', async ({ ordersClient }) => {
      const flow = new OrdersFlow(ordersClient);
      const validation = new OrdersValidation();
      const data = new OrderDataBuilder().withStandardItems().build();

      const { status } = await flow.createOrder(data);

      validation.assertUnauthorized(status);
    });

    test('returns 422 for empty items array @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();
      const data = new OrderDataBuilder().withEmptyItems().build();

      const { status } = await flow.createOrder(data);

      validation.assertValidationError(status);
    });

    test('returns 422 for zero quantity @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      const { status } = await flow.createOrder({
        items: [{ product_id: 'P1', product_name: 'Bad Item', quantity: 0, unit_price: 10 }],
      });

      validation.assertValidationError(status);
    });
  });

  test.describe('GET /orders/:id — Get Order', () => {
    test('returns the created order by ID @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();
      const data = new OrderDataBuilder().withSingleItem(2, 15.0).build();

      const { body: created } = await flow.createOrder(data);
      const { status, body } = await flow.getOrder(created.id);

      validation.assertOrderRetrieved(status, body, created.id);
      validation.assertOrderStatus(body, 'PENDING');
      validation.assertTotalAmount(body, 30.0);
    });

    test('returns 404 for non-existent order ID @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      const { status } = await flow.getOrder('00000000-0000-0000-0000-000000000000');

      validation.assertNotFound(status);
    });

    test('returns 403 when accessing another user order @security @regression', async ({
      authenticatedOrdersClient,
      adminOrdersClient,
    }) => {
      const adminFlow = new OrdersFlow(adminOrdersClient);
      const customerFlow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      const { body: adminOrder } = await adminFlow.createOrder(
        new OrderDataBuilder().withSingleItem().build(),
      );
      const { status } = await customerFlow.getOrder(adminOrder.id);

      validation.assertForbidden(status);
    });
  });

  test.describe('GET /orders — List Orders', () => {
    test('returns paginated order list @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      await flow.createOrder(new OrderDataBuilder().withSingleItem().build());
      const { status, body } = await flow.listOrders({ page: 1, page_size: 10 });

      validation.assertPaginated(status, body, 1);
    });

    test('admin can list all orders @regression', async ({
      adminOrdersClient,
      authenticatedOrdersClient,
    }) => {
      const customerFlow = new OrdersFlow(authenticatedOrdersClient);
      const adminFlow = new OrdersFlow(adminOrdersClient);
      const validation = new OrdersValidation();

      await customerFlow.createOrder(new OrderDataBuilder().withSingleItem().build());
      const { status, body } = await adminFlow.listOrders();

      validation.assertPaginated(status, body);
    });
  });

  test.describe('PATCH /orders/:id/status — Update Status', () => {
    test('admin can advance order from PENDING to CONFIRMED @regression', async ({
      authenticatedOrdersClient,
      adminOrdersClient,
    }) => {
      const customerFlow = new OrdersFlow(authenticatedOrdersClient);
      const adminFlow = new OrdersFlow(adminOrdersClient);
      const validation = new OrdersValidation();

      const { body: order } = await customerFlow.createOrder(
        new OrderDataBuilder().withSingleItem().build(),
      );
      const { status, body } = await adminFlow.updateStatus(order.id, { status: 'CONFIRMED' });

      validation.assertOrderRetrieved(status, body, order.id);
      validation.assertOrderStatus(body, 'CONFIRMED');
    });

    test('customer cannot advance order beyond cancel @security @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      const { body: order } = await flow.createOrder(
        new OrderDataBuilder().withSingleItem().build(),
      );
      const { status } = await flow.updateStatus(order.id, { status: 'CONFIRMED' });

      validation.assertForbidden(status);
    });

    test('returns 422 for invalid status transition @regression', async ({
      authenticatedOrdersClient,
      adminOrdersClient,
    }) => {
      const customerFlow = new OrdersFlow(authenticatedOrdersClient);
      const adminFlow = new OrdersFlow(adminOrdersClient);
      const validation = new OrdersValidation();

      const { body: order } = await customerFlow.createOrder(
        new OrderDataBuilder().withSingleItem().build(),
      );
      const { status } = await adminFlow.updateStatus(order.id, { status: 'DELIVERED' });

      validation.assertValidationError(status);
    });
  });

  test.describe('DELETE /orders/:id — Cancel Order', () => {
    test('customer can cancel a PENDING order and status becomes CANCELLED @regression', async ({
      authenticatedOrdersClient,
    }) => {
      const flow = new OrdersFlow(authenticatedOrdersClient);
      const validation = new OrdersValidation();

      const { body: order } = await flow.createOrder(
        new OrderDataBuilder().withSingleItem().build(),
      );
      const { status: cancelStatus } = await flow.cancelOrder(order.id);
      const { body: updated } = await flow.getOrder(order.id);

      validation.assertOrderCancelled(cancelStatus, updated);
    });
  });

  test.describe('GET /health', () => {
    test('orders-service is healthy @smoke', async ({ ordersClient }) => {
      const flow = new OrdersFlow(ordersClient);
      const validation = new OrdersValidation();

      const { status, body } = await flow.health();

      validation.assertHealthy(status, body);
    });
  });
});