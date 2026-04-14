import { Page } from '@playwright/test';

export class TestHelpers {
  static async waitForNetworkIdle(page: Page, timeout = 30_000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  static async clearAndFill(page: Page, selector: string, value: string): Promise<void> {
    const locator = page.locator(selector);
    await locator.clear();
    await locator.fill(value);
  }

  static formatDate(date: Date, format = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  static async retryAction(
    action: () => Promise<void>,
    retries = 3,
    delayMs = 1000,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await action();
        return;
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  static async takeNamedScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png` });
  }
}
