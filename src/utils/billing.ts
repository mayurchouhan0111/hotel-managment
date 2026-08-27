import { FolioCharge, FolioPayment, Folio } from '../types/hotel';

/**
 * Calculates a single charge item's tax and total amounts.
 * All monetary calculations avoid floating-point inaccuracies by rounding to 2 decimal places.
 */
export function calculateChargeItem(
  quantity: number,
  unitPrice: number,
  discountAmount: number = 0,
  taxRate: number = 12
): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const qty = Math.max(0, quantity);
  const price = Math.max(0, unitPrice);
  const discount = Math.min(qty * price, Math.max(0, discountAmount));
  
  const taxableBase = (qty * price) - discount;
  const taxAmount = Math.round((taxableBase * (taxRate / 100)) * 100) / 100;
  const total = Math.round((taxableBase + taxAmount) * 100) / 100;

  return {
    subtotal: qty * price,
    taxAmount,
    total,
  };
}

/**
 * Centralized calculation of an entire Folio's financial status.
 * Ignores voided charges and refunded payments.
 */
export function calculateFolioTotals(
  charges: FolioCharge[],
  payments: FolioPayment[]
): {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalPaid: number;
  balanceDue: number;
} {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let grandTotal = 0;

  for (const charge of charges) {
    if (charge.voided) continue;

    const baseAmount = charge.quantity * charge.unitPrice;
    const discount = charge.discountAmount || 0;
    const tax = charge.taxAmount || 0;
    const itemTotal = charge.total || (baseAmount - discount + tax);

    subtotal += baseAmount;
    totalDiscount += discount;
    totalTax += tax;
    grandTotal += itemTotal;
  }

  let totalPaid = 0;
  for (const payment of payments) {
    if (payment.refunded) continue;
    totalPaid += payment.amount || 0;
  }

  // Round all totals to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100;
  totalDiscount = Math.round(totalDiscount * 100) / 100;
  totalTax = Math.round(totalTax * 100) / 100;
  grandTotal = Math.round(grandTotal * 100) / 100;
  totalPaid = Math.round(totalPaid * 100) / 100;
  const balanceDue = Math.round((grandTotal - totalPaid) * 100) / 100;

  return {
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal,
    totalPaid,
    balanceDue,
  };
}
