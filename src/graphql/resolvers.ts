import { generateMockTransactions } from '../utils/mockData';
import {
  filterByMonth,
  totalIncome,
  totalExpense,
  netAmount,
  spendingByCategory,
  dailyBalances,
} from '../utils/calculations';

const transactions = generateMockTransactions(200);

export const resolvers = {
  Query: {
    transactions(_: unknown, { limit }: { limit?: number }) {
      const list = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return limit ? list.slice(0, limit) : list;
    },
    transactionsByMonth(_: unknown, { year, month }: { year: number; month: number }) {
      return filterByMonth(transactions, year, month);
    },
    overviewMetrics(_: unknown, { year, month }: { year: number; month: number }) {
      const monthTx = filterByMonth(transactions, year, month);
      return {
        totalIncome: totalIncome(monthTx),
        totalExpense: totalExpense(monthTx),
        netAmount: netAmount(monthTx),
        transactionCount: monthTx.length,
      };
    },
    spendingByCategory(_: unknown, { year, month }: { year: number; month: number }) {
      const monthTx = filterByMonth(transactions, year, month);
      return spendingByCategory(monthTx);
    },
    dailyBalances(_: unknown, { year, month }: { year: number; month: number }) {
      return dailyBalances(transactions, year, month);
    },
  },
};
