export const ENVIRONMENTS = {
  dev: 'https://dev.practicesoftwaretesting.com',
  staging: 'https://staging.practicesoftwaretesting.com',
  prod: 'https://practicesoftwaretesting.com',
} as const;

export const TIMEOUTS = {
  short: 5_000,
  medium: 15_000,
  long: 30_000,
  networkIdle: 60_000,
} as const;

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  internalServerError: 500,
} as const;

export const STORAGE_PATHS = {
  customerAuth: 'storage/customer.json',
  adminAuth: 'storage/admin.json',
} as const;
