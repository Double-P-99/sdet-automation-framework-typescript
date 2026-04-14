import { expect } from '@playwright/test';

import { HTTP_STATUS } from '../../../shared/const/GlobalConst';
import { AUTH_MESSAGES, AUTH_ROLES, AUTH_TOKEN_TYPE } from '../const/AuthConst';
import type { TokenResponse, UserProfile } from '../../../api/types/auth.types';

/**
 * Validation layer for the Auth API.
 * All expect() assertions for auth live here — no assertions in flows or specs.
 */
export class AuthValidation {
  assertLoginSuccess(status: number, body: TokenResponse): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.access_token).toBeTruthy();
    expect(body.refresh_token).toBeTruthy();
    expect(body.token_type).toBe(AUTH_TOKEN_TYPE);
    expect(body.expires_in).toBeGreaterThan(0);
  }

  assertTokenRefreshed(status: number, body: TokenResponse): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.access_token).toBeTruthy();
    expect(body.refresh_token).toBeTruthy();
  }

  assertUnauthorized(status: number): void {
    expect(status).toBe(HTTP_STATUS.unauthorized);
  }

  assertValidationError(status: number): void {
    expect(status).toBe(422);
  }

  assertUserProfile(status: number, body: UserProfile, expectedEmail: string, expectedRole: 'customer' | 'admin'): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.email).toBe(expectedEmail);
    expect(body.role).toBe(expectedRole);
    expect(body.is_active).toBe(true);
    expect(body.id).toBeTruthy();
  }

  assertCustomerProfile(status: number, body: UserProfile): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.role).toBe(AUTH_ROLES.customer);
    expect(body.is_active).toBe(true);
  }

  assertAdminProfile(status: number, body: UserProfile): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body.role).toBe(AUTH_ROLES.admin);
  }

  assertRegistered(status: number, body: UserProfile, expectedEmail: string): void {
    expect(status).toBe(HTTP_STATUS.created);
    expect(body.email).toBe(expectedEmail);
    expect(body.role).toBe(AUTH_ROLES.customer);
  }

  assertConflict(status: number): void {
    expect(status).toBe(HTTP_STATUS.conflict);
  }

  assertNoSensitiveFields(body: unknown): void {
    const serialised = JSON.stringify(body);
    expect(serialised).not.toContain('password');
    expect(serialised).not.toContain('hashed');
  }

  assertHealthy(status: number, body: Record<string, string>): void {
    expect(status).toBe(HTTP_STATUS.ok);
    expect(body['status']).toBe('healthy');
    expect(body['service']).toBe('auth-service');
  }
}
