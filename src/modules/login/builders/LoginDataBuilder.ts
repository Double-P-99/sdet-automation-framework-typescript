export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Builder for login test data.
 * Uses the Builder pattern to allow flexible, readable test data setup.
 */
export class LoginDataBuilder {
  private data: LoginCredentials = {
    email: process.env.UI_CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    password: process.env.UI_CUSTOMER_PASSWORD ?? 'welcome01',
  };

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.data.password = password;
    return this;
  }

  withInvalidCredentials(): this {
    this.data.email = 'invalid@test.com';
    this.data.password = 'wrongpassword';
    return this;
  }

  withAdminCredentials(): this {
    this.data.email = process.env.UI_ADMIN_EMAIL ?? 'admin@practicesoftwaretesting.com';
    this.data.password = process.env.UI_ADMIN_PASSWORD ?? 'welcome01';
    return this;
  }

  withEmptyCredentials(): this {
    this.data.email = '';
    this.data.password = '';
    return this;
  }

  build(): LoginCredentials {
    return { ...this.data };
  }
}
