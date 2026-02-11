import type { Transaction, CategorySummary, DailyBalance } from '../types';

export interface OverviewMetrics {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}

export interface GetOverviewMetricsQuery {
  overviewMetrics: OverviewMetrics;
}

export interface GetDailyBalancesQuery {
  dailyBalances: DailyBalance[];
}

export interface GetSpendingByCategoryQuery {
  spendingByCategory: CategorySummary[];
}

export interface GetTransactionsByMonthQuery {
  transactionsByMonth: Transaction[];
}
