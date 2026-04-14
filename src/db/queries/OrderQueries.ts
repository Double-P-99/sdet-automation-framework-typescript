import { DbClient } from '../DbClient';

export interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export class OrderQueries {
  constructor(private readonly db: DbClient) {}

  async findById(orderId: string): Promise<OrderRow | null> {
    return this.db.findOne<OrderRow>(
      `SELECT id, user_id, status,
              total_amount::numeric::float8 AS total_amount,
              currency, notes, created_at, updated_at
       FROM orders
       WHERE id = $1`,
      [orderId],
    );
  }

  async findByUserId(userId: string): Promise<OrderRow[]> {
    return this.db.findAll<OrderRow>(
      `SELECT id, user_id, status,
              total_amount::numeric::float8 AS total_amount,
              currency, notes, created_at, updated_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  async findItemsByOrderId(orderId: string): Promise<OrderItemRow[]> {
    return this.db.findAll<OrderItemRow>(
      `SELECT id, order_id, product_id, product_name, quantity,
              unit_price::numeric::float8 AS unit_price,
              subtotal::numeric::float8 AS subtotal
       FROM order_items
       WHERE order_id = $1`,
      [orderId],
    );
  }

  async countByUserId(userId: string): Promise<number> {
    const row = await this.db.findOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM orders WHERE user_id = $1',
      [userId],
    );
    return parseInt(row?.count ?? '0', 10);
  }

  async hardDeleteById(orderId: string): Promise<void> {
    await this.db.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    await this.db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  }
}
