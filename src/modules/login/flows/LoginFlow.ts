import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginCredentials } from '../builders/LoginDataBuilder';

/**
 * Flow layer for login.
 * Orchestrates multiple page actions to represent complete user journeys.
 * Tests should interact with flows, not pages, for multi-step scenarios.
 */
export class LoginFlow {
  private readonly loginPage: LoginPage;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  async navigateToLoginPage(): Promise<void> {
    await this.loginPage.goto();
  }

  async loginWithCredentials(credentials: LoginCredentials): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.fillEmail(credentials.email);
    await this.loginPage.fillPassword(credentials.password);
    await this.loginPage.clickLogin();
  }

  async loginAsCustomer(): Promise<void> {
    await this.loginWithCredentials({
      email: process.env.UI_CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
      password: process.env.UI_CUSTOMER_PASSWORD ?? 'welcome01',
    });
  }

  async loginAsAdmin(): Promise<void> {
    await this.loginWithCredentials({
      email: process.env.UI_ADMIN_EMAIL ?? 'admin@practicesoftwaretesting.com',
      password: process.env.UI_ADMIN_PASSWORD ?? 'welcome01',
    });
  }

  async logout(): Promise<void> {
    await this.loginPage.clickUserMenu();
    await this.loginPage.clickLogout();
  }
}
