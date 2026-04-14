import { test } from '../../src/shared/fixtures/BaseFixture';
import { CheckoutFlow } from '../../src/modules/checkout/flows/CheckoutFlow';
import { CheckoutValidation } from '../../src/modules/checkout/validations/CheckoutValidation';
import { CheckoutDataBuilder } from '../../src/modules/checkout/builders/CheckoutDataBuilder';

test.describe('Checkout Module', () => {
  test.describe('Complete Purchase Flow', () => {
    test('should complete checkout with default US address', async ({ authenticatedPage }) => {
      const checkoutFlow = new CheckoutFlow(authenticatedPage);
      const checkoutValidation = new CheckoutValidation(authenticatedPage);
      const checkoutData = new CheckoutDataBuilder().withUSAddress().build();

      await checkoutFlow.completeCheckout(checkoutData);

      await checkoutValidation.assertOrderConfirmed();
    });

    test('should complete checkout with bank transfer', async ({ authenticatedPage }) => {
      const checkoutFlow = new CheckoutFlow(authenticatedPage);
      const checkoutValidation = new CheckoutValidation(authenticatedPage);
      const checkoutData = new CheckoutDataBuilder()
        .withUSAddress()
        .withBankTransfer()
        .build();

      await checkoutFlow.completeCheckout(checkoutData);

      await checkoutValidation.assertOrderConfirmed();
    });
  });

  test.describe('Cart Validation', () => {
    test('should show correct number of items in cart', async ({ authenticatedPage }) => {
      const checkoutFlow = new CheckoutFlow(authenticatedPage);
      const checkoutValidation = new CheckoutValidation(authenticatedPage);

      await checkoutFlow.openCart();

      await checkoutValidation.assertCartHasItems(1);
    });
  });
});
