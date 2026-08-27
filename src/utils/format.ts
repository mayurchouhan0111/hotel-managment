/**
 * Formats a numeric currency amount with symbol.
 * Example: ₹ 4,500.00 or ₹ 4,500
 */
export function formatCurrency(amount: number = 0, currencySymbol: string = '₹'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${currencySymbol} ${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generates clean business-domain sequential-style IDs.
 */
export function generateId(prefix: 'GST' | 'STY' | 'FOL' | 'INV' | 'CHG' | 'PAY' | 'DOC' | 'LOG'): string {
  const dateStr = new Date().getFullYear().toString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

/**
 * Generates an official invoice numbering format.
 * Example: INV-2026-0842
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const serial = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${serial}`;
}

/**
 * Generates payment receipt number.
 */
export function generateReceiptNumber(): string {
  const serial = Math.floor(10000 + Math.random() * 90000);
  return `REC-${serial}`;
}
