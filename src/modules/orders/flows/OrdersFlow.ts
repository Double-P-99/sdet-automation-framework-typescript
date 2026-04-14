import { OrdersApiClient } from '../../../api/OrdersApiClient';
import type {
  CreateOrderRequest,
  OrderResponse,
  PaginatedOrdersResponse,
  UpdateOrderStatusRequest,
} from '../../../api/types/orders.types';

type ApiResponse<T> = { status: number; body: T };
type EmptyResponse = { status: number };

interface ListOrdersParams {
  page?: number;
  page_size?: number;
  status?: string;
}

/**
 * Flow layer for the Orders API.
 * Orchestrates calls to OrdersApiClient — no assertions here.
 * Mirrors the role LoginFlow plays for the UI login module.
 */
export class OrdersFlow {
  constructor(private readonly client: OrdersApiClient) {}

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    return this.client.createOrder(data);
  }

  async getOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return this.client.getOrder(orderId);
  }

  async listOrders(params?: ListOrdersParams): Promise<ApiResponse<PaginatedOrdersResponse>> {
    return this.client.listOrders(params);
  }

  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<ApiResponse<OrderResponse>> {
    return this.client.updateOrderStatus(orderId, data);
  }

  async cancelOrder(orderId: string): Promise<EmptyResponse> {
    return this.client.cancelOrder(orderId);
  }

  async health(): Promise<ApiResponse<Record<string, string>>> {
    return this.client.health();
  }
}
