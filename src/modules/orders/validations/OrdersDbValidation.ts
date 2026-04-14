import { expect } from '@playwright/test';
import { OrderRow, OrderItemRow } from '../../../db/queries/OrderQueries';

/**
 * Validation class for database-layer assertions on orders data.
 * Use after direct DB queries to verify data integrity.
 */
export class OrdersDbValidation {
  assertPersistedOrder(
    dbOrder: OrderRow | null,
    expectedId: string,
    expectedUserId: string,
    expectedStatus = 'PENDING',
  ): void {
    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.id).toBe(expectedId);
    expect(dbOrder!.user_id).toBe(expectedUserId);
    expect(dbOrder!.status).toBe(expectedStatus);
    expect(dbOrder!.currency).toBe('USD');
  }

  assertTotalAmount(dbOrder: OrderRow | null, expectedTotal: number): void {
    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.total_amount).toBeCloseTo(expectedTotal, 2);
  }

  assertNotes(dbOrder: OrderRow | null, expectedNotes: string): void {
    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.notes).toBe(expectedNotes);
  }

  assertItemCount(dbItems: OrderItemRow[], expectedCount: number): void {
    expect(dbItems).toHaveLength(expectedCount);
  }

  assertItemSubtotal(
    dbItems: OrderItemRow[],
    productId: string,
    expectedSubtotal: number,
    expectedQuantity?: number,
  ): void {
    const item = dbItems.find(i => i.product_id === productId);
    expect(item).toBeDefined();
    expect(item!.subtotal).toBeCloseTo(expectedSubtotal, 2);
    if (expectedQuantity !== undefined) {
      expect(item!.quantity).toBe(expectedQuantity);
    }
  }

  assertTotalMatchesItemsSum(dbOrder: OrderRow | null, dbItems: OrderItemRow[]): void {
    expect(dbOrder).not.toBeNull();
    const computedTotal = dbItems.reduce((sum, item) => sum + item.subtotal, 0);
    expect(dbOrder!.total_amount).toBeCloseTo(computedTotal, 2);
  }

  assertStatus(dbOrder: OrderRow | null, expectedStatus: string): void {
    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.status).toBe(expectedStatus);
  }

  assertCountIncremented(countBefore: number, countAfter: number, increment: number): void {
    expect(countAfter).toBe(countBefore + increment);
  }
}
