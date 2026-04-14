import type { OrderItemRequest } from '../../../api/types/orders.types';

/**
 * Utility layer for the Orders module.
 * Pure helper functions — no side effects, no API calls.
 */
export class OrdersUtils {
  static calculateExpectedTotal(items: OrderItemRequest[]): number {
    return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  }

  static calculateExpectedSubtotal(item: OrderItemRequest): number {
    return item.unit_price * item.quantity;
  }

  static generateOrderNotes(prefix = 'Test order'): string {
    return `${prefix} — ${Date.now()}`;
  }

  static isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}
