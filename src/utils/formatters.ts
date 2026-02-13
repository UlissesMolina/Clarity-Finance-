import { startOfWeek, endOfWeek } from 'date-fns';

const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
};

/** Format currency with a given code (for use with useFormatCurrency / context) */
export function formatCurrencyWithCode(
  amount: number,
  currencyCode: string,
  options?: { sign?: boolean }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US';
  const noDecimals = currencyCode === 'JPY';
  const formatted = absAmount.toLocaleString(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  });
  const prefix = options?.sign && amount !== 0 ? (amount > 0 ? '+' : '-') : (isNegative ? '-' : '');
  return prefix ? `${prefix}${formatted}` : formatted;
}

/**
 * Format currency for display (default USD, use useFormatCurrency for app setting)
 */
export function formatCurrency(amount: number, options?: { sign?: boolean }): string {
  return formatCurrencyWithCode(amount, 'USD', options);
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

/**
 * Format period for display (week range, "Q1 2025", "2025", or month)
 */
export function formatPeriodLabel(
  year: number,
  month: number,
  period: 'week' | 'month' | 'quarter' | 'year'
): string {
  const ref = new Date(year, month, 15);
  if (period === 'week') {
    const start = startOfWeek(ref, { weekStartsOn: 0 });
    const end = endOfWeek(ref, { weekStartsOn: 0 });
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();
    if (sameMonth && sameYear) {
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  if (period === 'quarter') {
    const q = Math.floor(month / 3) + 1;
    return `Q${q} ${ref.getFullYear()}`;
  }
  if (period === 'year') {
    return String(ref.getFullYear());
  }
  return formatMonth(year, month);
}
