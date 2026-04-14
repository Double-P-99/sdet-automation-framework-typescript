/**
 * Utility layer for the login module.
 * Contains helper functions specific to authentication concerns.
 */
export class LoginUtils {
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    return `test.user.${timestamp}.${random}@automation.com`;
  }

  static generateRandomPassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  static maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const masked = user[0] + '*'.repeat(user.length - 1);
    return `${masked}@${domain}`;
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
