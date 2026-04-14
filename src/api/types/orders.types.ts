export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemRequest {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  notes?: string;
  currency?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  notes: string | null;
  items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrdersResponse {
  items: OrderResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
