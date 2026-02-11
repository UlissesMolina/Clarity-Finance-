import { Transaction, CategorySummary, DailyBalance } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, isWithinInterval } from 'date-fns';

/**
 * Filter transactions by month (year, month 0-11)
 */
export function filterByMonth(transactions: Transaction[], year: number, month: number): Transaction[] {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  return transactions.filter((t) => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start, end });
  });
}

/**
 * Total income for a set of transactions
 */
export function totalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Total expenses for a set of transactions
 */
export function totalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

/**
 * Net (income - expenses) for a set of transactions
 */
export function netAmount(transactions: Transaction[]): number {
  return totalIncome(transactions) - totalExpense(transactions);
}

/**
 * Spending by category (expenses only)
 */
export function spendingByCategory(transactions: Transaction[]): CategorySummary[] {
  const byCategory: Record<string, { total: number; count: number }> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
      byCategory[cat].total += Math.abs(t.amount);
      byCategory[cat].count += 1;
    });
  return Object.entries(byCategory).map(([category, { total, count }]) => ({
    category,
    total,
    count,
  }));
}

/**
 * Daily balance over time (cumulative) for a date range
 */
export function dailyBalances(
  transactions: Transaction[],
  year: number,
  month: number
): DailyBalance[] {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  const key = (d: Date) => format(d, 'yyyy-MM-dd');

  const byDay: Record<string, { income: number; expense: number }> = {};
  days.forEach((d) => {
    byDay[key(d)] = { income: 0, expense: 0 };
  });

  const monthTx = filterByMonth(transactions, year, month);
  monthTx.forEach((t) => {
    const k = t.date.slice(0, 10);
    if (!byDay[k]) return;
    if (t.type === 'income') byDay[k].income += t.amount;
    else byDay[k].expense += Math.abs(t.amount);
  });

  let running = 0;
  return days.map((d) => {
    const k = key(d);
    const { income, expense } = byDay[k];
    running += income - expense;
    return {
      date: k,
      balance: running,
      income,
      expense,
    };
  });
}
