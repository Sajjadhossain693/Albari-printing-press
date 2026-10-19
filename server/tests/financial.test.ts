import { describe, it, expect } from 'vitest';
import { calculateOrderTotals, determinePaymentStatus } from '../src/services/financialService.js';
import { toBengaliNumerals, toEnglishNumerals } from '../src/utils/formatters.js';

describe('Financial Calculation Logic', () => {
  it('calculates subtotal, discounts, delivery charge, and grand total correctly', () => {
    const input = {
      items: [
        { quantity: 1000, unitPrice: 6.5 }, // 6500
        { quantity: 2, unitPrice: 500 }     // 1000
      ],
      discount: 500,
      deliveryCharge: 150,
      additionalCharges: 50
    };

    const result = calculateOrderTotals(input);
    expect(result.subtotal).toBe(7500);
    expect(result.discount).toBe(500);
    expect(result.deliveryCharge).toBe(150);
    expect(result.additionalCharges).toBe(50);
    expect(result.totalAmount).toBe(7200); // 7500 - 500 + 150 + 50
  });

  it('never produces negative total amount even if discount exceeds subtotal', () => {
    const input = {
      items: [{ quantity: 1, unitPrice: 100 }],
      discount: 250
    };
    const result = calculateOrderTotals(input);
    expect(result.totalAmount).toBe(0);
  });

  it('determines payment status correctly based on advance and dues', () => {
    expect(determinePaymentStatus(5000, 0)).toBe('UNPAID');
    expect(determinePaymentStatus(5000, 2000)).toBe('PARTIALLY_PAID');
    expect(determinePaymentStatus(5000, 5000)).toBe('PAID');
    expect(determinePaymentStatus(5000, 6000)).toBe('PAID');
    expect(determinePaymentStatus(5000, 5000, 2000)).toBe('PARTIALLY_REFUNDED');
    expect(determinePaymentStatus(5000, 5000, 5000)).toBe('REFUNDED');
  });

  it('converts Bengali numerals to English and vice versa', () => {
    expect(toBengaliNumerals(123450)).toBe('১২৩৪৫০');
    expect(toEnglishNumerals('১২৩৪৫০')).toBe('123450');
  });
});
