import { test } from '../../src/shared/fixtures/ApiFixture';
import { OrderDataBuilder } from '../../src/modules/orders/builders/OrderDataBuilder';
import { AuthFlow } from '../../src/modules/auth/flows/AuthFlow';
import { OrdersFlow } from '../../src/modules/orders/flows/OrdersFlow';
import { OrdersValidation } from '../../src/modules/orders/validations/OrdersValidation';
import { OrdersDbValidation } from '../../src/modules/orders/validations/OrdersDbValidation';
import { DbClient } from '../../src/db/DbClient';
import { OrderQueries } from '../../src/db/queries/OrderQueries';

/**
 * @group integration
 * @group db-validation
 *
 * Database-layer validation tests.
 * These tests create data through the API and then directly query PostgreSQL
 * to verify that data is stored correctly.
 *
 * Requires environment variables:
 *   ORDERS_DB_URL — connection string for the orders database
 */
test.describe('Integration — Orders API → Database Validation', () => {
  let db: DbClient;
  let orderQueries: OrderQueries;
  const createdOrderIds: string[] = [];

  test.beforeAll(async () => {
    db = new DbClient(
      process.env.ORDERS_DB_URL ??
        'postgresql://postgres:postgres@localhost:5433/ordersdb',
    );
    orderQueries = new OrderQueries(db);
  });

  test.afterAll(async () => {
    // Clean up test orders from the database
    for (const id of createdOrderIds) {
      await orderQueries.hardDeleteById(id).catch(() => {/* ignore if already gone */});
    }
    await db.close();
  });

  test('order is persisted to DB with correct fields after API creation @integration @db-validation', async ({
    authenticatedOrdersClient,
    customerToken,
    authClient,
  }) => {
    const authFlow = new AuthFlow(authClient);
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const apiValidation = new OrdersValidation();
    const dbValidation = new OrdersDbValidation();

    const { body: profile } = await authFlow.getMe(customerToken.access_token);
    const data = new OrderDataBuilder()
      .withItem({ product_id: 'DB-P001', product_name: 'DB Widget', quantity: 2, unit_price: 15.0 })
      .withNotes('DB validation test')
      .build();

    const { status, body: order } = await flow.createOrder(data);
    apiValidation.assertOrderCreated(status, order);
    createdOrderIds.push(order.id);

    const dbOrder = await orderQueries.findById(order.id);
    dbValidation.assertPersistedOrder(dbOrder, order.id, profile.id);
    dbValidation.assertTotalAmount(dbOrder, 30.0);
    dbValidation.assertNotes(dbOrder, 'DB validation test');
  });

  test('order items are persisted to DB with correct subtotals @integration @db-validation', async ({
    authenticatedOrdersClient,
  }) => {
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const dbValidation = new OrdersDbValidation();
    const data = new OrderDataBuilder()
      .withItem({ product_id: 'DB-P002', product_name: 'Keyboard', quantity: 1, unit_price: 89.99 })
      .withItem({ product_id: 'DB-P003', product_name: 'Mouse', quantity: 2, unit_price: 29.99 })
      .build();

    const { body: order } = await flow.createOrder(data);
    createdOrderIds.push(order.id);

    const dbItems = await orderQueries.findItemsByOrderId(order.id);
    dbValidation.assertItemCount(dbItems, 2);
    dbValidation.assertItemSubtotal(dbItems, 'DB-P002', 89.99);
    dbValidation.assertItemSubtotal(dbItems, 'DB-P003', 59.98, 2);
  });

  test('DB total_amount matches the sum of item subtotals @integration @db-validation', async ({
    authenticatedOrdersClient,
  }) => {
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const dbValidation = new OrdersDbValidation();
    const data = new OrderDataBuilder()
      .withItem({ product_id: 'DB-P004', product_name: 'Monitor', quantity: 1, unit_price: 299.0 })
      .withItem({ product_id: 'DB-P005', product_name: 'Desk Lamp', quantity: 3, unit_price: 19.99 })
      .build();

    const { body: order } = await flow.createOrder(data);
    createdOrderIds.push(order.id);

    const dbOrder = await orderQueries.findById(order.id);
    const dbItems = await orderQueries.findItemsByOrderId(order.id);
    dbValidation.assertTotalMatchesItemsSum(dbOrder, dbItems);
  });

  test('DB status reflects status update after API PATCH @integration @db-validation', async ({
    authenticatedOrdersClient,
    adminOrdersClient,
  }) => {
    const customerFlow = new OrdersFlow(authenticatedOrdersClient);
    const adminFlow = new OrdersFlow(adminOrdersClient);
    const dbValidation = new OrdersDbValidation();

    const { body: order } = await customerFlow.createOrder(
      new OrderDataBuilder().withSingleItem().build(),
    );
    createdOrderIds.push(order.id);

    await adminFlow.updateStatus(order.id, { status: 'CONFIRMED' });

    const dbOrder = await orderQueries.findById(order.id);
    dbValidation.assertStatus(dbOrder, 'CONFIRMED');
  });

  test('DB status is CANCELLED after API DELETE @integration @db-validation', async ({
    authenticatedOrdersClient,
  }) => {
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const dbValidation = new OrdersDbValidation();

    const { body: order } = await flow.createOrder(
      new OrderDataBuilder().withSingleItem().build(),
    );
    createdOrderIds.push(order.id);

    await flow.cancelOrder(order.id);

    const dbOrder = await orderQueries.findById(order.id);
    dbValidation.assertStatus(dbOrder, 'CANCELLED');
  });

  test('creating multiple orders increments user order count in DB @integration @db-validation', async ({
    authenticatedOrdersClient,
    customerToken,
    authClient,
  }) => {
    const authFlow = new AuthFlow(authClient);
    const flow = new OrdersFlow(authenticatedOrdersClient);
    const dbValidation = new OrdersDbValidation();

    const { body: profile } = await authFlow.getMe(customerToken.access_token);
    const countBefore = await orderQueries.countByUserId(profile.id);

    const { body: o1 } = await flow.createOrder(new OrderDataBuilder().withSingleItem().build());
    const { body: o2 } = await flow.createOrder(new OrderDataBuilder().withSingleItem().build());
    createdOrderIds.push(o1.id, o2.id);

    const countAfter = await orderQueries.countByUserId(profile.id);
    dbValidation.assertCountIncremented(countBefore, countAfter, 2);
  });
});
