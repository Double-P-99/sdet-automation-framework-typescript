import { expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LOGIN_ROUTES, LOGIN_MESSAGES } from '../const/LoginConst';

/**
 * Validation layer for the login module.
 * Encapsulates all assertions so test specs stay readable and assertion logic is reusable.
 */
export class LoginValidation {
  private readonly loginPage: LoginPage;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(LOGIN_ROUTES.dashboard));
  }

  async assertLoginError(expectedMessage: string = LOGIN_MESSAGES.invalidCredentials): Promise<void> {
    await expect(this.loginPage.errorMessage).toBeVisible();
    await expect(this.loginPage.errorMessage).toContainText(expectedMessage);
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(LOGIN_ROUTES.login));
    await expect(this.loginPage.loginButton).toBeVisible();
  }

  async assertEmailFieldVisible(): Promise<void> {
    await expect(this.loginPage.emailInput).toBeVisible();
  }

  async assertPasswordFieldVisible(): Promise<void> {
    await expect(this.loginPage.passwordInput).toBeVisible();
  }

  async assertUserIsLoggedOut(): Promise<void> {
    await expect(this.loginPage.loginButton).toBeVisible();
  }
}
