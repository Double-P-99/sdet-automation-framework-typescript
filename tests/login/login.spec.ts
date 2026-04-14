import { test, expect } from '../../src/shared/fixtures/BaseFixture';
import { LoginFlow } from '../../src/modules/login/flows/LoginFlow';
import { LoginValidation } from '../../src/modules/login/validations/LoginValidation';
import { LoginDataBuilder } from '../../src/modules/login/builders/LoginDataBuilder';

test.describe('Login Module', () => {
  test.describe('Successful Authentication', () => {
    test('should login with valid customer credentials', async ({ page }) => {
      const loginFlow = new LoginFlow(page);
      const loginValidation = new LoginValidation(page);
      const credentials = new LoginDataBuilder().build();

      await loginFlow.loginWithCredentials(credentials);

      await loginValidation.assertLoginSuccess();
    });

    test('should login with admin credentials', async ({ page }) => {
      const loginFlow = new LoginFlow(page);
      const loginValidation = new LoginValidation(page);
      const credentials = new LoginDataBuilder().withAdminCredentials().build();

      await loginFlow.loginWithCredentials(credentials);

      await loginValidation.assertLoginSuccess();
    });
  });

  test.describe('Failed Authentication', () => {
    test('should show error with invalid credentials', async ({ page }) => {
      const loginFlow = new LoginFlow(page);
      const loginValidation = new LoginValidation(page);
      const credentials = new LoginDataBuilder().withInvalidCredentials().build();

      await loginFlow.loginWithCredentials(credentials);

      await loginValidation.assertLoginError();
    });

    test('should show error with wrong password for valid email', async ({ page }) => {
      const loginFlow = new LoginFlow(page);
      const loginValidation = new LoginValidation(page);
      const credentials = new LoginDataBuilder()
        .withEmail('customer@practicesoftwaretesting.com')
        .withPassword('wrongpassword')
        .build();

      await loginFlow.loginWithCredentials(credentials);

      await loginValidation.assertLoginError();
    });
  });

  test.describe('Page State Validation', () => {
    test('should display login page elements correctly', async ({ page }) => {
      const loginFlow = new LoginFlow(page);
      const loginValidation = new LoginValidation(page);

      await loginFlow.navigateToLoginPage();

      await loginValidation.assertOnLoginPage();
      await loginValidation.assertEmailFieldVisible();
      await loginValidation.assertPasswordFieldVisible();
    });
  });

  test.describe('Authenticated Session via Fixture', () => {
    test('should land on account dashboard after fixture login', async ({ authenticatedPage }) => {
      await expect(authenticatedPage).toHaveURL(/account/);
    });
  });
});
