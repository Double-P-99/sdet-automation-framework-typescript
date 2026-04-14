import { APIRequestContext } from '@playwright/test';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl ?? process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<{ status: number; body: T }> {
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
      params: options?.params,
    });
    const body = (await response.json()) as T;
    return { status: response.status(), body };
  }

  async post<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<{ status: number; body: T }> {
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });
    const body = (await response.json()) as T;
    return { status: response.status(), body };
  }

  async put<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<{ status: number; body: T }> {
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });
    const body = (await response.json()) as T;
    return { status: response.status(), body };
  }

  async patch<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<{ status: number; body: T }> {
    const response = await this.request.patch(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });
    const body = (await response.json()) as T;
    return { status: response.status(), body };
  }

  async delete(endpoint: string, options?: RequestOptions): Promise<{ status: number }> {
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
    });
    return { status: response.status() };
  }
}
