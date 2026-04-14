import { Page } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutData } from '../builders/CheckoutDataBuilder';

/**
 * Flow layer for checkout.
 * Composes page actions into meaningful end-to-end purchase scenarios.
 */
export class CheckoutFlow {
  private readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.checkoutPage = new CheckoutPage(page);
  }

  async openCart(): Promise<void> {
    await this.checkoutPage.gotoCart();
  }

  async completeCheckout(checkoutData: CheckoutData): Promise<void> {
    await this.checkoutPage.clickProceedToCheckout();
    await this.checkoutPage.fillShippingAddress(checkoutData.shippingAddress);
    await this.checkoutPage.clickProceedToPayment();
    await this.checkoutPage.clickConfirmOrder();
  }

  async proceedFromCartToAddress(): Promise<void> {
    await this.checkoutPage.gotoCart();
    await this.checkoutPage.clickProceedToCheckout();
  }
}
