import { APIRequestContext } from '@playwright/test';

import type {
  CreateOrderRequest,
  OrderResponse,
  PaginatedOrdersResponse,
  UpdateOrderStatusRequest,
} from './types/orders.types';

type ApiResponse<T> = { status: number; body: T };
type EmptyResponse = { status: number };

interface ListOrdersParams {
  page?: number;
  page_size?: number;
  status?: string;
}

export class OrdersApiClient {
  private readonly baseUrl: string;

  constructor(
    private readonly request: APIRequestContext,
    private readonly accessToken?: string,
    baseUrl?: string,
  ) {
    this.baseUrl = baseUrl ?? process.env.ORDERS_API_URL ?? 'http://localhost:8002';
  }

  /** Return a new client instance bound to a specific access token. */
  withToken(token: string): OrdersApiClient {
    return new OrdersApiClient(this.request, token, this.baseUrl);
  }

  private authHeaders(): Record<string, string> {
    if (!this.accessToken) {
      throw new Error('Access token is required. Use withToken() or provide token in constructor.');
    }
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    const response = await this.request.post(`${this.baseUrl}/orders/`, {
      data,
      headers: this.accessToken ? this.authHeaders() : undefined,
    });
    return { status: response.status(), body: await response.json() };
  }

  async listOrders(params?: ListOrdersParams): Promise<ApiResponse<PaginatedOrdersResponse>> {
    const response = await this.request.get(`${this.baseUrl}/orders/`, {
      headers: this.accessToken ? this.authHeaders() : undefined,
      params: params as Record<string, string | number>,
    });
    return { status: response.status(), body: await response.json() };
  }

  async getOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response = await this.request.get(`${this.baseUrl}/orders/${orderId}`, {
      headers: this.accessToken ? this.authHeaders() : undefined,
    });
    return { status: response.status(), body: await response.json() };
  }

  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest,
  ): Promise<ApiResponse<OrderResponse>> {
    const response = await this.request.patch(`${this.baseUrl}/orders/${orderId}/status`, {
      data,
      headers: this.accessToken ? this.authHeaders() : undefined,
    });
    return { status: response.status(), body: await response.json() };
  }

  async cancelOrder(orderId: string): Promise<EmptyResponse> {
    const response = await this.request.delete(`${this.baseUrl}/orders/${orderId}`, {
      headers: this.accessToken ? this.authHeaders() : undefined,
    });
    return { status: response.status() };
  }

  async health(): Promise<ApiResponse<Record<string, string>>> {
    const response = await this.request.get(`${this.baseUrl}/health`);
    return { status: response.status(), body: await response.json() };
  }
}
