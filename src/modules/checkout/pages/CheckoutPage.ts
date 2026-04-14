import { Page, Locator } from '@playwright/test';
import { CHECKOUT_SELECTORS, CHECKOUT_ROUTES } from '../const/CheckoutConst';
import { ShippingAddress } from '../builders/CheckoutDataBuilder';

/**
 * Page Object for the Checkout flow.
 * Covers cart, address, payment, and confirmation steps.
 */
export class CheckoutPage {
  private readonly page: Page;

  readonly cartIcon: Locator;
  readonly cartQuantity: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly addressLine1Input: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly postcodeInput: Locator;
  readonly proceedToPaymentButton: Locator;
  readonly confirmOrderButton: Locator;
  readonly orderConfirmation: Locator;
  readonly cartItems: Locator;
  readonly cartTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartIcon = page.locator(CHECKOUT_SELECTORS.cartIcon);
    this.cartQuantity = page.locator(CHECKOUT_SELECTORS.cartQuantity);
    this.proceedToCheckoutButton = page.locator(CHECKOUT_SELECTORS.proceedToCheckout);
    this.addressLine1Input = page.locator(CHECKOUT_SELECTORS.addressLine1);
    this.cityInput = page.locator(CHECKOUT_SELECTORS.city);
    this.stateInput = page.locator(CHECKOUT_SELECTORS.state);
    this.countrySelect = page.locator(CHECKOUT_SELECTORS.country);
    this.postcodeInput = page.locator(CHECKOUT_SELECTORS.postcode);
    this.proceedToPaymentButton = page.locator(CHECKOUT_SELECTORS.proceedToPayment);
    this.confirmOrderButton = page.locator(CHECKOUT_SELECTORS.confirmOrder);
    this.orderConfirmation = page.locator(CHECKOUT_SELECTORS.orderConfirmation);
    this.cartItems = page.locator(CHECKOUT_SELECTORS.cartItem);
    this.cartTotal = page.locator(CHECKOUT_SELECTORS.cartTotal);
  }

  async gotoCart(): Promise<void> {
    await this.page.goto(CHECKOUT_ROUTES.cart);
  }

  async clickProceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    await this.addressLine1Input.fill(address.line1);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
    await this.countrySelect.selectOption(address.country);
    await this.postcodeInput.fill(address.postcode);
  }

  async clickProceedToPayment(): Promise<void> {
    await this.proceedToPaymentButton.click();
  }

  async clickConfirmOrder(): Promise<void> {
    await this.confirmOrderButton.click();
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartTotalText(): Promise<string> {
    return this.cartTotal.innerText();
  }

  async getOrderConfirmationText(): Promise<string> {
    return this.orderConfirmation.innerText();
  }
}
