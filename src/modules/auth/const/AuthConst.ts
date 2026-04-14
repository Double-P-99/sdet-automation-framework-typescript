export const AUTH_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  emailAlreadyRegistered: 'Email already registered',
  couldNotValidate: 'Could not validate credentials',
  insufficientPermissions: 'Insufficient permissions',
} as const;

export const AUTH_ROLES = {
  customer: 'customer',
  admin: 'admin',
} as const;

export const AUTH_TOKEN_TYPE = 'bearer';
