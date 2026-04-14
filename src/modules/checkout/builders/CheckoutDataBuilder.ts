export interface ShippingAddress {
  line1: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export interface PaymentDetails {
  method: 'Credit Card' | 'Bank Transfer' | 'Cash on Delivery';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface CheckoutData {
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
}

/**
 * Builder for checkout test data.
 * Provides sensible defaults and named presets to keep tests expressive.
 */
export class CheckoutDataBuilder {
  private data: CheckoutData = {
    shippingAddress: {
      line1: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'US',
      postcode: '12345',
    },
    payment: {
      method: 'Credit Card',
    },
  };

  withShippingAddress(address: Partial<ShippingAddress>): this {
    this.data.shippingAddress = { ...this.data.shippingAddress, ...address };
    return this;
  }

  withPayment(payment: Partial<PaymentDetails>): this {
    this.data.payment = { ...this.data.payment, ...payment } as PaymentDetails;
    return this;
  }

  withUSAddress(): this {
    this.data.shippingAddress = {
      line1: '456 Main Ave',
      city: 'New York',
      state: 'NY',
      country: 'US',
      postcode: '10001',
    };
    return this;
  }

  withBankTransfer(): this {
    this.data.payment = { method: 'Bank Transfer' };
    return this;
  }

  build(): CheckoutData {
    return {
      shippingAddress: { ...this.data.shippingAddress },
      payment: { ...this.data.payment },
    };
  }
}
