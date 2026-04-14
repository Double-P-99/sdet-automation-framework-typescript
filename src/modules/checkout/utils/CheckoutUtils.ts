/**
 * Utility layer for the checkout module.
 * Pure functions for pricing, formatting, and reference generation.
 */
export class CheckoutUtils {
  static calculateTotalWithTax(subtotal: number, taxRate = 0.1): number {
    return parseFloat((subtotal * (1 + taxRate)).toFixed(2));
  }

  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  static generateOrderReference(): string {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${Date.now()}-${random}`;
  }

  static calculateDiscount(originalPrice: number, discountPercent: number): number {
    return parseFloat((originalPrice * (1 - discountPercent / 100)).toFixed(2));
  }
}
