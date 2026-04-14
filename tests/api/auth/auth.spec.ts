import { test } from '../../../src/shared/fixtures/ApiFixture';
import { AuthDataBuilder } from '../../../src/modules/auth/builders/AuthDataBuilder';
import { AuthFlow } from '../../../src/modules/auth/flows/AuthFlow';
import { AuthValidation } from '../../../src/modules/auth/validations/AuthValidation';
import { AuthUtils } from '../../../src/modules/auth/utils/AuthUtils';

/**
 * @group api
 * @group auth
 */
test.describe('Auth API — /auth', () => {
  test.describe('POST /auth/login', () => {
    test('returns tokens for valid customer credentials @smoke @regression', async ({
      authClient,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const credentials = new AuthDataBuilder().withCustomerCredentials().build();

      const { status, body } = await flow.login(credentials);

      validation.assertLoginSuccess(status, body);
    });

    test('returns tokens for valid admin credentials @smoke @regression', async ({
      authClient,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const credentials = new AuthDataBuilder().withAdminCredentials().build();

      const { status, body } = await flow.login(credentials);

      validation.assertLoginSuccess(status, body);
    });

    test('returns 401 for wrong password @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const credentials = new AuthDataBuilder().withWrongPasswordForValidEmail().build();

      const { status } = await flow.login(credentials);

      validation.assertUnauthorized(status);
    });

    test('returns 401 for non-existent user @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const credentials = new AuthDataBuilder().withInvalidCredentials().build();

      const { status } = await flow.login(credentials);

      validation.assertUnauthorized(status);
    });

    test('response body does not expose sensitive fields @security @regression', async ({
      authClient,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const credentials = new AuthDataBuilder().withCustomerCredentials().build();

      const { body } = await flow.login(credentials);

      validation.assertNoSensitiveFields(body);
    });

    test('returns 422 for missing email @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status } = await flow.login({ email: '', password: 'Test@12345' });

      validation.assertValidationError(status);
    });
  });

  test.describe('POST /auth/refresh', () => {
    test('returns new tokens with valid refresh token @regression', async ({
      authClient,
      customerToken,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status, body } = await flow.refresh(customerToken.refresh_token);

      validation.assertTokenRefreshed(status, body);
    });

    test('returns 401 for invalid refresh token @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status } = await flow.refresh('not-a-real-token');

      validation.assertUnauthorized(status);
    });

    test('rejects an access token used as refresh token @security @regression', async ({
      authClient,
      customerToken,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status } = await flow.refresh(customerToken.access_token);

      validation.assertUnauthorized(status);
    });
  });

  test.describe('GET /auth/me', () => {
    test('returns customer profile for authenticated user @smoke', async ({
      authClient,
      customerToken,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const expectedEmail = process.env.CUSTOMER_EMAIL ?? 'customer@test.com';

      const { status, body } = await flow.getMe(customerToken.access_token);

      validation.assertUserProfile(status, body, expectedEmail, 'customer');
    });

    test('returns admin profile with correct role @regression', async ({
      authClient,
      adminToken,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status, body } = await flow.getMe(adminToken.access_token);

      validation.assertAdminProfile(status, body);
    });

    test('returns 401 without auth header @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status } = await flow.getMe('');

      validation.assertUnauthorized(status);
    });

    test('response does not contain hashed_password @security @regression', async ({
      authClient,
      customerToken,
    }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { body } = await flow.getMe(customerToken.access_token);

      validation.assertNoSensitiveFields(body);
    });
  });

  test.describe('POST /auth/register', () => {
    const uniqueEmail = AuthUtils.generateUniqueEmail();

    test('registers a new user and returns 201 @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const data = AuthDataBuilder.buildRegisterData(uniqueEmail);

      const { status, body } = await flow.register(data);

      validation.assertRegistered(status, body, uniqueEmail);
    });

    test('returns 409 for duplicate email @regression', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();
      const data = AuthDataBuilder.buildRegisterData(uniqueEmail);

      await flow.register(data);
      const { status } = await flow.register(data);

      validation.assertConflict(status);
    });
  });

  test.describe('GET /health', () => {
    test('auth-service is healthy @smoke', async ({ authClient }) => {
      const flow = new AuthFlow(authClient);
      const validation = new AuthValidation();

      const { status, body } = await flow.health();

      validation.assertHealthy(status, body);
    });
  });
});