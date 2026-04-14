import type { CreateOrderRequest, OrderItemRequest } from '../../../api/types/orders.types';
import { SAMPLE_PRODUCTS } from '../const/OrdersConst';

/**
 * Builder for order test data.
 * Follows the same pattern as LoginDataBuilder for consistency.
 */
export class OrderDataBuilder {
  private data: CreateOrderRequest = {
    items: [],
    currency: 'USD',
  };

  withItem(item: OrderItemRequest): this {
    this.data.items = [...this.data.items, item];
    return this;
  }

  withStandardItems(): this {
    this.data.items = [
      { ...SAMPLE_PRODUCTS[0], quantity: 1 },
      { ...SAMPLE_PRODUCTS[1], quantity: 1 },
    ];
    return this;
  }

  withSingleItem(quantity = 1, unitPrice = 10.0): this {
    this.data.items = [
      {
        product_id: 'PROD-TEST-001',
        product_name: 'Test Product',
        quantity,
        unit_price: unitPrice,
      },
    ];
    return this;
  }

  withNotes(notes: string): this {
    this.data.notes = notes;
    return this;
  }

  withCurrency(currency: string): this {
    this.data.currency = currency.toUpperCase();
    return this;
  }

  withEmptyItems(): this {
    this.data.items = [];
    return this;
  }

  build(): CreateOrderRequest {
    return structuredClone(this.data);
  }
}
