export interface OrderCalculationInput {
  items: { quantity: number; unitPrice: number }[];
  discount?: number;
  deliveryCharge?: number;
  additionalCharges?: number;
}

export function calculateOrderTotals(input: OrderCalculationInput) {
  const subtotal = input.items.reduce((acc, item) => {
    const qty = Math.max(0, item.quantity || 0);
    const price = Math.max(0, item.unitPrice || 0);
    return acc + qty * price;
  }, 0);

  const discount = Math.max(0, input.discount || 0);
  const deliveryCharge = Math.max(0, input.deliveryCharge || 0);
  const additionalCharges = Math.max(0, input.additionalCharges || 0);

  // Total cannot be less than 0
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge + additionalCharges);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deliveryCharge: Math.round(deliveryCharge * 100) / 100,
    additionalCharges: Math.round(additionalCharges * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

export function determinePaymentStatus(totalAmount: number, amountPaid: number, refundAmount: number = 0): string {
  const netPaid = Math.max(0, amountPaid - refundAmount);

  if (refundAmount > 0 && netPaid <= 0) {
    return 'REFUNDED';
  }
  if (refundAmount > 0 && netPaid < totalAmount) {
    return 'PARTIALLY_REFUNDED';
  }
  if (netPaid >= totalAmount && totalAmount > 0) {
    return 'PAID';
  }
  if (netPaid > 0 && netPaid < totalAmount) {
    return 'PARTIALLY_PAID';
  }
  return 'UNPAID';
}
