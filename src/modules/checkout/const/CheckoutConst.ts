export const CHECKOUT_SELECTORS = {
  cartIcon: '[data-test="nav-cart"]',
  cartQuantity: '[data-test="cart-quantity"]',
  proceedToCheckout: '[data-test="proceed-1"]',
  addressLine1: '[data-test="address"]',
  city: '[data-test="city"]',
  state: '[data-test="state"]',
  country: '[data-test="country"]',
  postcode: '[data-test="postcode"]',
  proceedToPayment: '[data-test="proceed-2"]',
  paymentMethod: '[data-test="payment-method"]',
  confirmOrder: '[data-test="finish"]',
  orderConfirmation: '[data-test="order-confirmation"]',
  cartItem: '[data-test="cart-item"]',
  cartItemName: '[data-test="product-title"]',
  cartTotal: '[data-test="cart-total"]',
} as const;

export const CHECKOUT_ROUTES = {
  cart: '/checkout',
  address: '/checkout/address',
  payment: '/checkout/payment',
  confirmation: '/checkout/confirmation',
} as const;

export const CHECKOUT_MESSAGES = {
  orderPlaced: 'Payment was successful',
  cartEmpty: 'Your cart is empty',
} as const;
