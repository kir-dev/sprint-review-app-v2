/**
 * Formats a number to a maximum of 2 decimal places, removing unnecessary trailing zeros.
 */
export const formatNumber = (
  num: number | string | undefined | null,
): string => {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return parseFloat(n.toFixed(2)).toString();
};
