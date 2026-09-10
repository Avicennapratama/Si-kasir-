/**
 * Currency utility functions
 */

export const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
});

/**
 * Format amount to Rupiah string
 */
export const formatIDR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'Rp0';
  return IDR_FORMATTER.format(amount);
};

/**
 * Parse amount from Rupiah string (e.g. "Rp125.000" or "125000")
 */
export const parseIDR = (amountText: string): number => {
  // Remove Rp and spaces, handle "125.000" format
  const cleaned = amountText.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};

/**
 * Convert to integer (Rupiah)
 */
export const toRupiahInt = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Math.round(val);
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
};