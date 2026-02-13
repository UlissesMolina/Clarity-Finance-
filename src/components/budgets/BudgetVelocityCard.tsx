import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_OVERVIEW_METRICS, GET_SPENDING_BY_CATEGORY } from '../../graphql/queries';
import type { GetOverviewMetricsQuery, GetSpendingByCategoryQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { useBudgets } from '../../contexts/BudgetsContext';
import { Target, ChevronRight } from 'lucide-react';
import { CATEGORY_COLORS } from '../../types';
import clsx from 'clsx';
import './BudgetVelocityCard.css';

interface BudgetVelocityCardProps {
  year: number;
  month: number;
  period?: string;
  onViewAll?: () => void;
  className?: string;
}

export function BudgetVelocityCard({ year, month, period = 'MONTH', onViewAll, className }: BudgetVelocityCardProps) {
  const formatCurrency = useFormatCurrency();
  const { totalBudget, getBudget } = useBudgets();
  const { data } = useQuery<GetOverviewMetricsQuery>(GET_OVERVIEW_METRICS, {
    variables: { year, month, period },
  });
  const { data: spendingData } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month, period },
  });
  const metrics = data?.overviewMetrics;
  if (!metrics) return null;

  const spent = metrics.totalExpense;
  const budget = totalBudget || 1500;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
  const dailyRate = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projected = Math.round(dailyRate * daysInMonth);

  const spending = spendingData?.spendingByCategory ?? [];
  const topCategories = spending
    .filter((c: { category: string; total: number }) => getBudget(c.category) > 0)
    .map((c: { category: string; total: number }) => {
      const catBudget = getBudget(c.category);
      return {
        category: c.category,
        spent: c.total,
        budget: catBudget,
        pct: catBudget > 0 ? Math.round((c.total / catBudget) * 100) : 0,
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  return (
    <div className={clsx('card', 'budget-velocity-card', className)}>
      <div className="budget-header">
        <h3 className="section-title">
          <Target size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Budget & pace
        </h3>
        {onViewAll && (
          <button type="button" className="budget-view-all-btn" onClick={onViewAll}>
            View all budgets <ChevronRight size={14} />
          </button>
        )}
      </div>
      <div className="budget-row">
        <span className="budget-label">Spent of budget</span>
        <span className="budget-value">
          {formatCurrency(spent)} of {formatCurrency(budget)}
        </span>
      </div>
      <div className="budget-bar-wrap">
        <div
          className="budget-bar-fill"
          style={{ width: `${Math.min(pct, 100)}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="budget-bar-text">{pct}%</span>
        </div>
      </div>
      {period === 'MONTH' && (
        <p className="velocity-line">
          On track to spend <strong>{formatCurrency(projected)}</strong> this month
        </p>
      )}
      {topCategories.length > 0 && (
        <div className="budget-categories">
          <h4 className="budget-categories-title">Top categories</h4>
          {topCategories.map((cat) => (
            <div key={cat.category} className="budget-category-item">
              <div className="budget-category-header">
                <span
                  className="budget-category-name"
                  style={{ color: CATEGORY_COLORS[cat.category] ?? CATEGORY_COLORS['Other'] }}
                >
                  {cat.category}
                </span>
                <span className="budget-category-amount">{formatCurrency(cat.spent)}</span>
              </div>
              <div className="budget-category-bar-wrap">
                <div
                  className="budget-category-bar"
                  style={{
                    width: `${Math.min(cat.pct, 100)}%`,
                    backgroundColor: (CATEGORY_COLORS[cat.category] ?? CATEGORY_COLORS['Other']) + '40',
                  }}
                >
                  <span className="budget-category-bar-text">{cat.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
