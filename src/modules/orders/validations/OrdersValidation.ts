import { expect } from '@playwright/test';

import { HTTP_STATUS } from '../../../shared/const/GlobalConst';
import { ORDER_STATUS } from '../const/OrdersConst';
import type { OrderResponse, PaginatedOrdersResponse } from '../../../api/types/orders.types';

/**
 * Validation layer for the Orders API.
 * All expect() assertions for orders live here — no assertions in flows or specs.
 */
export class OrdersValidation {
  assertOrderCreated(status: number, body: OrderResponse, expectedItemCount?: number): void {
    expect(status).toBe(HTTP_STATUS.created);
    expect(body.id).toBeTruthy();
    expect(body.user_id).toBeTruthy();
    expect(body.status).toBe(ORDER_STATUS.PENDING);
    expect(body.total_amount).toBeGreaterThan(0);
    if (expectedItemCount !== undefined) {
      expect(body.items).toHaveLength(expectedItemCount);
    }
  }

  assertOrderRetrieved(status: number, body: OrderResponse, expectedId: string): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.id).toBe(expectedId);
  }

  assertOrderStatus(body: OrderResponse, expectedStatus: string): void {
    expect(body.status).toBe(expectedStatus);
  }

  assertTotalAmount(body: OrderResponse, expectedTotal: number): void {
    expect(body.total_amount).toBeCloseTo(expectedTotal, 2);
  }

  assertItemSubtotal(body: OrderResponse, itemIndex: number, expectedSubtotal: number): void {
    expect(body.items[itemIndex].subtotal).toBeCloseTo(expectedSubtotal, 2);
  }

  assertNotes(body: OrderResponse, expectedNotes: string): void {
    expect(body.notes).toBe(expectedNotes);
  }

  assertCurrency(body: OrderResponse, expectedCurrency: string): void {
    expect(body.currency).toBe(expectedCurrency);
  }

  assertUserOwnership(body: OrderResponse, expectedUserId: string): void {
    expect(body.user_id).toBe(expectedUserId);
  }

  assertPaginated(status: number, body: PaginatedOrdersResponse, expectedPage = 1): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.page).toBe(expectedPage);
    expect(body.total).toBeGreaterThanOrEqual(1);
  }

  assertPaginatedShape(status: number, body: PaginatedOrdersResponse, expectedPage = 1): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.page).toBe(expectedPage);
    expect(typeof body.total).toBe('number');
  }

  assertOrderCancelled(cancelStatus: number, retrievedBody: OrderResponse): void {
    expect(cancelStatus).toBe(HTTP_STATUS.noContent);
    expect(retrievedBody.status).toBe(ORDER_STATUS.CANCELLED);
  }

  assertNotFound(status: number): void {
    expect(status).toBe(HTTP_STATUS.notFound);
  }

  assertUnauthorized(status: number): void {
    expect(status).toBe(HTTP_STATUS.unauthorized);
  }

  assertForbidden(status: number): void {
    expect(status).toBe(HTTP_STATUS.forbidden);
  }

  assertValidationError(status: number): void {
    expect(status).toBe(422);
  }

  assertHealthy(status: number, body: Record<string, string>): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body['status']).toBe('healthy');
    expect(body['service']).toBe('orders-service');
  }
}
