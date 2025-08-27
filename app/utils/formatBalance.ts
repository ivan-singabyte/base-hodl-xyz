/**
 * Formats token balance with consistent decimal precision
 * Shows significant digits for small values, reduces precision for larger values
 * @param value - The numeric value to format
 * @returns Formatted string with appropriate precision
 */
export function formatTokenBalance(value: string | number | undefined): string {
  if (!value) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) return '0';
  
  // For very small values - show up to 9 decimal places but remove trailing zeros
  if (numValue < 0.000001) return '<0.000001';
  if (numValue < 1) {
    // Find how many decimal places we need to show all significant digits
    const formatted = numValue.toFixed(9);
    // Remove trailing zeros but keep at least 4 decimal places
    const trimmed = formatted.replace(/(\.\d{4,}?)0+$/, '$1');
    return trimmed;
  }
  
  // For values >= 1
  if (numValue < 10) return numValue.toFixed(6);
  if (numValue < 100) return numValue.toFixed(5);
  if (numValue < 1000) return numValue.toFixed(4);
  if (numValue < 10000) return numValue.toFixed(3);
  if (numValue < 100000) return numValue.toFixed(2);
  if (numValue < 1000000) return numValue.toFixed(1);
  
  // For large values, use compact notation
  return numValue.toLocaleString(undefined, { 
    maximumFractionDigits: 0,
    notation: numValue >= 1e9 ? 'compact' : 'standard'
  });
}