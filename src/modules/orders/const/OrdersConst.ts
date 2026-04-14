export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_MESSAGES = {
  notFound: 'Order not found',
  accessDenied: 'Access denied',
  invalidTransition: 'Cannot transition from',
  adminOnlyAdvance: 'Only admins can advance order status',
  cannotCancelShipped: 'Cannot cancel an order with status',
} as const;

export const ORDER_CURRENCY = {
  usd: 'USD',
  eur: 'EUR',
} as const;

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export const SAMPLE_PRODUCTS = [
  { product_id: 'PROD-001', product_name: 'Wireless Mouse', unit_price: 29.99 },
  { product_id: 'PROD-002', product_name: 'Mechanical Keyboard', unit_price: 89.99 },
  { product_id: 'PROD-003', product_name: 'USB-C Hub', unit_price: 49.99 },
  { product_id: 'PROD-004', product_name: 'Monitor Stand', unit_price: 39.99 },
] as const;
