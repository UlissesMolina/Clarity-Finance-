import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SPENDING_BY_CATEGORY } from '../../graphql/queries';
import type { GetSpendingByCategoryQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { useBudgets, BUDGET_CATEGORIES } from '../../contexts/BudgetsContext';
import { CATEGORY_COLORS } from '../../types';
import { PieChart } from 'lucide-react';
import clsx from 'clsx';
import './BudgetByCategoryCard.css';

interface BudgetByCategoryCardProps {
  year: number;
  month: number;
  period?: string;
  className?: string;
}

export function BudgetByCategoryCard({ year, month, period = 'MONTH', className }: BudgetByCategoryCardProps) {
  const formatCurrency = useFormatCurrency();
  const { getBudget } = useBudgets();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const { data } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month, period },
  });
  const { data: prevData } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year: prevYear, month: prevMonth, period },
  });
  const spending = data?.spendingByCategory ?? [];
  const prevSpending = prevData?.spendingByCategory ?? [];
  const byCategory = Object.fromEntries(spending.map((c: { category: string; total: number }) => [c.category, c.total]));
  const prevByCategory = Object.fromEntries(prevSpending.map((c: { category: string; total: number }) => [c.category, c.total]));

  const rows = BUDGET_CATEGORIES.map((category) => {
    const spent = byCategory[category] ?? 0;
    const prevSpent = prevByCategory[category] ?? 0;
    const trend = prevSpent > 0 ? Math.round(((spent - prevSpent) / prevSpent) * 100) : null;
    const budget = getBudget(category);
    const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    const overBudget = budget > 0 && spent > budget;
    return {
      category,
      spent,
      budget,
      trend,
      pct: overBudget ? Math.round((spent / budget) * 100) : pct,
      overBudget,
      color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'],
    };
  });

  if (rows.length === 0) return null;

  return (
    <div className={clsx('card', 'budget-by-category-card', className)}>
      <h3 className="section-title">
        <PieChart size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
        Budget by category
      </h3>
      <ul className="budget-category-list" aria-label="Spending vs budget by category">
        {rows.map((row) => (
          <li key={row.category} className="budget-category-row">
            <div className="budget-category-header">
              <span
                className="budget-category-name"
                style={{ borderLeftColor: row.color }}
              >
                {row.category}
                {row.trend != null && (
                  <span className={clsx('budget-category-trend', row.trend >= 0 ? 'budget-category-trend--up' : 'budget-category-trend--down')}>
                    {row.trend >= 0 ? '↑' : '↓'} {Math.abs(row.trend)}% from last period
                  </span>
                )}
              </span>
              <span className="budget-category-amounts">
                {formatCurrency(row.spent)}
                <span className="budget-category-sep">/</span>
                {formatCurrency(row.budget)}
              </span>
            </div>
            <div className="budget-category-bar-wrap">
              <div
                className={clsx('budget-category-bar-fill', row.overBudget && 'budget-category-bar-fill--over')}
                style={{
                  width: `${Math.min(row.pct, 100)}%`,
                  backgroundColor: row.overBudget ? 'var(--expense)' : row.color,
                }}
                role="progressbar"
                aria-valuenow={row.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${row.category}: ${formatCurrency(row.spent)} of ${formatCurrency(row.budget)} budget`}
              />
            </div>
            <span className={clsx('budget-category-pct', row.overBudget && 'budget-category-pct--over')}>
              {row.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
