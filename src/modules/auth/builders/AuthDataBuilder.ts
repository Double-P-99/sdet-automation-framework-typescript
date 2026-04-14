export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: 'customer' | 'admin';
}

/**
 * Builder for authentication test data.
 * Mirrors LoginDataBuilder pattern for API-level auth flows.
 */
export class AuthDataBuilder {
  private data: AuthCredentials = {
    email: process.env.CUSTOMER_EMAIL ?? 'customer@test.com',
    password: process.env.CUSTOMER_PASSWORD ?? 'Test@12345',
  };

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.data.password = password;
    return this;
  }

  withCustomerCredentials(): this {
    this.data.email = process.env.CUSTOMER_EMAIL ?? 'customer@test.com';
    this.data.password = process.env.CUSTOMER_PASSWORD ?? 'Test@12345';
    return this;
  }

  withAdminCredentials(): this {
    this.data.email = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    this.data.password = process.env.ADMIN_PASSWORD ?? 'Test@12345';
    return this;
  }

  withInvalidCredentials(): this {
    this.data.email = 'ghost@nowhere.invalid';
    this.data.password = 'WrongPass!999';
    return this;
  }

  withWrongPasswordForValidEmail(): this {
    this.data.email = process.env.CUSTOMER_EMAIL ?? 'customer@test.com';
    this.data.password = 'WrongPass!999';
    return this;
  }

  build(): AuthCredentials {
    return { ...this.data };
  }

  static buildRegisterData(email: string): RegisterData {
    return {
      email,
      password: 'NewUser@12345',
      full_name: 'SDET Test User',
      role: 'customer',
    };
  }
}
