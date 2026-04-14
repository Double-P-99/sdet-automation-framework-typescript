import { AuthApiClient } from '../../../api/AuthApiClient';
import type { AuthCredentials, RegisterData } from '../builders/AuthDataBuilder';
import type { TokenResponse, UserProfile } from '../../../api/types/auth.types';

type ApiResponse<T> = { status: number; body: T };

/**
 * Flow layer for the Auth API.
 * Orchestrates calls to AuthApiClient — no assertions here.
 * Mirrors the role LoginFlow plays for the UI login module.
 */
export class AuthFlow {
  constructor(private readonly client: AuthApiClient) {}

  async login(credentials: AuthCredentials): Promise<ApiResponse<TokenResponse>> {
    return this.client.login(credentials);
  }

  async refresh(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    return this.client.refresh(refreshToken);
  }

  async getMe(accessToken: string): Promise<ApiResponse<UserProfile>> {
    return this.client.getMe(accessToken);
  }

  async register(data: RegisterData): Promise<ApiResponse<UserProfile>> {
    return this.client.register(data);
  }

  async health(): Promise<ApiResponse<Record<string, string>>> {
    return this.client.health();
  }
}
