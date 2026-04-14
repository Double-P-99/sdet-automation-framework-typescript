import { APIRequestContext } from '@playwright/test';

import type {
  ApiError,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserProfile,
} from './types/auth.types';

type ApiResponse<T> = { status: number; body: T };

export class AuthApiClient {
  private readonly baseUrl: string;

  constructor(
    private readonly request: APIRequestContext,
    baseUrl?: string,
  ) {
    this.baseUrl = baseUrl ?? process.env.AUTH_API_URL ?? 'http://localhost:8001';
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await this.request.post(`${this.baseUrl}/auth/login`, {
      data: credentials,
    });
    return { status: response.status(), body: await response.json() };
  }

  async refresh(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    const response = await this.request.post(`${this.baseUrl}/auth/refresh`, {
      data: { refresh_token: refreshToken },
    });
    return { status: response.status(), body: await response.json() };
  }

  async getMe(accessToken: string): Promise<ApiResponse<UserProfile>> {
    const response = await this.request.get(`${this.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { status: response.status(), body: await response.json() };
  }

  async register(user: RegisterRequest): Promise<ApiResponse<UserProfile>> {
    const response = await this.request.post(`${this.baseUrl}/auth/register`, {
      data: user,
    });
    return { status: response.status(), body: await response.json() };
  }

  async health(): Promise<ApiResponse<Record<string, string>>> {
    const response = await this.request.get(`${this.baseUrl}/health`);
    return { status: response.status(), body: await response.json() };
  }
}
