export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

export interface DailyBalance {
  date: string;
  balance: number;
  income: number;
  expense: number;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Income': '#10b981',
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Bills & Utilities': '#6366f1',
  'Healthcare': '#ef4444',
  'Other': '#6b7280',
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
