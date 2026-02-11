import { faker } from '@faker-js/faker';
import { Transaction } from '../types';
import { subMonths, format } from 'date-fns';

const CATEGORIES = [
  'Income',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other',
];

const INCOME_MERCHANTS = ['Salary', 'Freelance', 'Dividends', 'Refund', 'Side gig', 'Bonus'];
const EXPENSE_MERCHANTS: Record<string, string[]> = {
  'Food & Dining': ['Restaurant', 'Grocery', 'Coffee', 'Uber Eats', 'Supermarket'],
  'Transportation': ['Gas', 'Uber', 'Parking', 'Transit', 'Car maintenance'],
  'Shopping': ['Amazon', 'Target', 'Online', 'Mall'],
  'Entertainment': ['Netflix', 'Spotify', 'Games', 'Concert', 'Movies'],
  'Bills & Utilities': ['Electric', 'Internet', 'Rent', 'Phone', 'Insurance'],
  'Healthcare': ['Pharmacy', 'Doctor', 'Gym', 'Dental'],
  'Other': ['ATM', 'Transfer', 'Misc'],
};

function randomAmount(min: number, max: number): number {
  return Math.round((faker.number.float() * (max - min) + min) * 100) / 100;
}

export function generateMockTransactions(count: number = 200): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate income (roughly 2–4 per month)
  const monthsBack = 6;
  for (let m = 0; m <= monthsBack; m++) {
    const baseDate = subMonths(now, m);
    const numIncome = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numIncome; i++) {
      const date = faker.date.between({
        from: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
        to: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0),
      });
      const desc = INCOME_MERCHANTS[faker.number.int({ min: 0, max: INCOME_MERCHANTS.length - 1 })];
      const amount = randomAmount(800, 4500);
      transactions.push({
        id: faker.string.uuid(),
        description: desc,
        amount,
        type: 'income',
        category: 'Income',
        date: format(date, 'yyyy-MM-dd'),
        createdAt: date.toISOString(),
      });
    }
  }

  // Generate expenses
  const expenseCategories = CATEGORIES.filter((c) => c !== 'Income');
  let remaining = count - transactions.length;
  while (remaining > 0) {
    const baseDate = subMonths(now, faker.number.int({ min: 0, max: monthsBack }));
    const date = faker.date.between({
      from: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
      to: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0),
    });
    const category = expenseCategories[faker.number.int({ min: 0, max: expenseCategories.length - 1 })];
    const merchants = EXPENSE_MERCHANTS[category] || ['Other'];
    const description = merchants[faker.number.int({ min: 0, max: merchants.length - 1 })];
    const amount = -Math.abs(randomAmount(5, 350));
    transactions.push({
      id: faker.string.uuid(),
      description,
      amount,
      type: 'expense',
      category,
      date: format(date, 'yyyy-MM-dd'),
      createdAt: date.toISOString(),
    });
    remaining--;
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
