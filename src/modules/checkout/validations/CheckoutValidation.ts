import { expect, Page } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CHECKOUT_MESSAGES } from '../const/CheckoutConst';

/**
 * Validation layer for the checkout module.
 * Decouples assertions from test logic, improving readability and reuse.
 */
export class CheckoutValidation {
  private readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.checkoutPage = new CheckoutPage(page);
  }

  async assertOrderConfirmed(): Promise<void> {
    await expect(this.checkoutPage.orderConfirmation).toBeVisible();
    await expect(this.checkoutPage.orderConfirmation).toContainText(
      CHECKOUT_MESSAGES.orderPlaced,
    );
  }

  async assertCartIsEmpty(): Promise<void> {
    await expect(this.checkoutPage.orderConfirmation).toContainText(
      CHECKOUT_MESSAGES.cartEmpty,
    );
  }

  async assertCartHasItems(expectedCount: number): Promise<void> {
    const count = await this.checkoutPage.getCartItemCount();
    expect(count).toBe(expectedCount);
  }

  async assertCartTotalContains(expectedText: string): Promise<void> {
    await expect(this.checkoutPage.cartTotal).toContainText(expectedText);
  }
}
