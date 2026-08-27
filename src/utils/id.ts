/**
 * Unique identifier generator for Hotel PMS entities.
 */
export function generateId(prefix: string): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomDigits}`;
}
