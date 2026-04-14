/**
 * Utility layer for the Auth module.
 * Pure helper functions — no side effects, no API calls.
 */
export class AuthUtils {
  static generateUniqueEmail(prefix = 'sdet-test'): string {
    return `${prefix}-${Date.now()}@example.com`;
  }

  static decodeTokenPayload(token: string): Record<string, unknown> {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) throw new Error('Invalid JWT structure');
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  }

  static isExpired(token: string): boolean {
    const payload = AuthUtils.decodeTokenPayload(token);
    const exp = payload['exp'];
    if (typeof exp !== 'number') return true;
    return Date.now() / 1000 > exp;
  }

  static extractRole(token: string): string {
    const payload = AuthUtils.decodeTokenPayload(token);
    return (payload['role'] as string) ?? '';
  }

  static extractUserId(token: string): string {
    const payload = AuthUtils.decodeTokenPayload(token);
    return (payload['sub'] as string) ?? '';
  }
}
