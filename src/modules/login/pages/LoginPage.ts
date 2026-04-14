import { Page, Locator } from '@playwright/test';
import { LOGIN_SELECTORS, LOGIN_ROUTES } from '../const/LoginConst';

/**
 * Page Object for the Login page.
 * Responsible only for encapsulating UI interactions — no assertions here.
 */
export class LoginPage {
  private readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator(LOGIN_SELECTORS.emailInput);
    this.passwordInput = page.locator(LOGIN_SELECTORS.passwordInput);
    this.loginButton = page.locator(LOGIN_SELECTORS.loginButton);
    this.errorMessage = page.locator(LOGIN_SELECTORS.errorMessage);
    this.userMenuButton = page.locator(LOGIN_SELECTORS.userMenuButton);
    this.logoutButton = page.locator(LOGIN_SELECTORS.logoutButton);
  }

  async goto(): Promise<void> {
    await this.page.goto(LOGIN_ROUTES.login);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }
}
