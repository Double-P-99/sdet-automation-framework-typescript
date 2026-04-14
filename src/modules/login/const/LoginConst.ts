export const LOGIN_SELECTORS = {
  emailInput: '[data-test="email"]',
  passwordInput: '[data-test="password"]',
  loginButton: '[data-test="login-submit"]',
  errorMessage: '[data-test="login-error"]',
  userMenuButton: '[data-test="nav-menu"]',
  logoutButton: '[data-test="nav-sign-out"]',
} as const;

export const LOGIN_ROUTES = {
  login: '/auth/login',
  dashboard: '/account',
} as const;

export const LOGIN_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  emailRequired: 'Email is required',
  passwordRequired: 'Password is required',
} as const;
