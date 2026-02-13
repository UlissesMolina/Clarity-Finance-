import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SPENDING_BY_CATEGORY } from '../../graphql/queries';
import type { GetSpendingByCategoryQuery } from '../../graphql/types';
import { BudgetByCategoryCard } from './BudgetByCategoryCard';
import { BudgetVelocityCard } from './BudgetVelocityCard';
import { MonthPicker } from '../dashboard/MonthPicker';
import { TimePeriodTabs, type Period } from '../dashboard/TimePeriodTabs';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { useBudgets, BUDGET_CATEGORIES } from '../../contexts/BudgetsContext';
import { CATEGORY_COLORS } from '../../types';
import { Pencil, Check } from 'lucide-react';
import clsx from 'clsx';
import './Budgets.css';

const PERIOD_TO_GQL: Record<Period, string> = {
  week: 'WEEK',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
};

interface BudgetsProps {
  className?: string;
}

export function Budgets({ className }: BudgetsProps) {
  const formatCurrency = useFormatCurrency();
  const { setBudget, getBudget } = useBudgets();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [period, setPeriod] = useState<Period>('month');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const periodVar = PERIOD_TO_GQL[period];

  const { data } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month, period: periodVar },
  });

  const spending = data?.spendingByCategory ?? [];
  const byCategory = Object.fromEntries(spending.map((c: { category: string; total: number }) => [c.category, c.total]));

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(String(getBudget(category) || ''));
  };

  const saveEdit = () => {
    if (editingCategory != null) {
      const num = parseFloat(editValue.replace(/[^0-9.-]/g, '')) || 0;
      setBudget(editingCategory, Math.max(0, num));
      setEditingCategory(null);
      setEditValue('');
    }
  };

  const budgetRows = BUDGET_CATEGORIES.map((category) => {
    const spent = byCategory[category] ?? 0;
    const budget = getBudget(category);
    const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    const overBudget = budget > 0 && spent > budget;
    const remaining = budget - spent;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayOfMonth = now.getMonth() === month && now.getFullYear() === year ? now.getDate() : daysInMonth;
    const projectedSpending = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : 0;
    const projectedOver = projectedSpending > budget;

    return {
      category,
      spent,
      budget,
      remaining,
      pct: overBudget ? Math.round((spent / budget) * 100) : pct,
      overBudget,
      projectedSpending,
      projectedOver,
      color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'],
    };
  });

  const alerts = budgetRows.filter((r) => r.overBudget || r.projectedOver);

  return (
    <div className={clsx('budgets-page', className)}>
      <header className="budgets-header">
        <h1 className="budgets-title">Budgets</h1>
        <div className="budgets-header-controls">
          <TimePeriodTabs period={period} onPeriodChange={setPeriod} />
          <MonthPicker year={year} month={month} period={period} onMonthChange={handleMonthChange} />
        </div>
      </header>

      <div className="card budgets-set-card">
        <h3 className="section-title">Set your budgets</h3>
        <p className="budgets-set-desc">Set a monthly budget for each category. Changes are saved automatically.</p>
        <div className="budgets-set-grid">
          {BUDGET_CATEGORIES.map((category) => (
            <div key={category} className="budgets-set-row">
              <label className="budgets-set-label" style={{ borderLeftColor: CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'] }}>
                {category}
              </label>
              {editingCategory === category ? (
                <div className="budgets-set-input-wrap">
                  <span className="budgets-set-currency">$</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    className="budgets-set-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                    aria-label={`Budget for ${category}`}
                  />
                  <button type="button" className="budgets-set-save-btn" onClick={saveEdit} aria-label="Save">
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="budgets-set-edit-btn"
                  onClick={() => startEdit(category)}
                  aria-label={`Edit budget for ${category}`}
                >
                  <span className="budgets-set-value">{formatCurrency(getBudget(category))}</span>
                  <Pencil size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card budgets-alerts">
          <h3 className="section-title">Budget Alerts</h3>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.category} className={clsx('alert-item', alert.overBudget && 'alert-item--over')}>
                <div className="alert-item-main">
                  <span className="alert-item-category">{alert.category}</span>
                  <span className="alert-item-message">
                    {alert.overBudget
                      ? `Over budget by ${formatCurrency(alert.spent - alert.budget)}`
                      : `Projected to exceed budget by ${formatCurrency(alert.projectedSpending - alert.budget)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="budgets-content">
        <BudgetVelocityCard year={year} month={month} period={periodVar} />
        <BudgetByCategoryCard year={year} month={month} period={periodVar} />

        <div className="card budgets-summary">
          <h3 className="section-title">Budget vs Actual</h3>
          <div className="budgets-table">
            <div className="budgets-table-header">
              <div className="budgets-table-col">Category</div>
              <div className="budgets-table-col">Budget</div>
              <div className="budgets-table-col">Spent</div>
              <div className="budgets-table-col">Remaining</div>
              <div className="budgets-table-col">Progress</div>
            </div>
            <div className="budgets-table-body">
              {budgetRows.map((row) => (
                <div key={row.category} className="budgets-table-row">
                  <div className="budgets-table-col">
                    <span
                      className="budgets-table-category"
                      style={{ backgroundColor: row.color + '22', color: row.color }}
                    >
                      {row.category}
                    </span>
                  </div>
                  <div className="budgets-table-col">{formatCurrency(row.budget)}</div>
                  <div className={clsx('budgets-table-col', row.overBudget && 'budgets-table-col--over')}>
                    {formatCurrency(row.spent)}
                  </div>
                  <div className={clsx('budgets-table-col', row.remaining < 0 && 'budgets-table-col--negative')}>
                    {formatCurrency(row.remaining, { sign: true })}
                  </div>
                  <div className="budgets-table-col">
                    <div className="budgets-progress">
                      <div
                        className={clsx('budgets-progress-bar', row.overBudget && 'budgets-progress-bar--over')}
                        style={{ width: `${Math.min(100, row.pct)}%`, backgroundColor: row.color }}
                      />
                      <span className="budgets-progress-text">{row.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
