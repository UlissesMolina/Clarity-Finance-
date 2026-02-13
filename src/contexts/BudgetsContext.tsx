import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'finance-dashboard-budgets';

export const BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other',
] as const;

const DEFAULT_BUDGETS: Record<string, number> = {
  'Food & Dining': 500,
  'Transportation': 300,
  'Shopping': 400,
  'Entertainment': 200,
  'Bills & Utilities': 600,
  'Healthcare': 250,
  'Other': 200,
};

function loadBudgets(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        const out: Record<string, number> = {};
        for (const key of Object.keys(parsed)) {
          const v = parsed[key];
          if (typeof v === 'number' && v >= 0) out[key] = v;
        }
        if (Object.keys(out).length > 0) return { ...DEFAULT_BUDGETS, ...out };
      }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_BUDGETS };
}

interface BudgetsContextValue {
  budgets: Record<string, number>;
  setBudget: (category: string, amount: number) => void;
  setBudgets: (next: Record<string, number>) => void;
  getBudget: (category: string) => number;
  totalBudget: number;
}

const BudgetsContext = createContext<BudgetsContextValue | null>(null);

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgetsState] = useState<Record<string, number>>(loadBudgets);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    } catch {
      /* ignore */
    }
  }, [budgets]);

  const setBudget = useCallback((category: string, amount: number) => {
    setBudgetsState((prev) => ({ ...prev, [category]: Math.max(0, amount) }));
  }, []);

  const setBudgets = useCallback((next: Record<string, number>) => {
    setBudgetsState((prev) => {
      const out = { ...prev };
      for (const [cat, amount] of Object.entries(next)) {
        out[cat] = Math.max(0, amount);
      }
      return out;
    });
  }, []);

  const getBudget = useCallback(
    (category: string) => budgets[category] ?? DEFAULT_BUDGETS[category] ?? 0,
    [budgets]
  );

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);

  const value: BudgetsContextValue = {
    budgets,
    setBudget,
    setBudgets,
    getBudget,
    totalBudget,
  };

  return <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>;
}

export function useBudgets() {
  const ctx = useContext(BudgetsContext);
  if (!ctx) {
    throw new Error('useBudgets must be used within BudgetsProvider');
  }
  return ctx;
}
