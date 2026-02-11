/**
 * Format currency for display
 */
export function formatCurrency(amount: number, options?: { sign?: boolean }): string {
  const sign = options?.sign && amount !== 0 ? (amount > 0 ? '+' : '') : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for short display (e.g. in tables)
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format month for picker (e.g. "January 2025")
 */
export function formatMonth(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
