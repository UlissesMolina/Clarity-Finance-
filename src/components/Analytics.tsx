import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SPENDING_BY_CATEGORY } from '../graphql/queries';
import type { GetSpendingByCategoryQuery } from '../graphql/types';
import { SpendingChart } from './SpendingChart';
import { MonthlyComparison } from './MonthlyComparison';
import { MonthPicker } from './MonthPicker';
import { TimePeriodTabs, type Period } from './TimePeriodTabs';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../types';
import clsx from 'clsx';
import './Analytics.css';

const PERIOD_TO_GQL: Record<Period, string> = {
  week: 'WEEK',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
};

interface AnalyticsProps {
  className?: string;
}

export function Analytics({ className }: AnalyticsProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [period, setPeriod] = useState<Period>('month');

  const periodVar = PERIOD_TO_GQL[period];
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const { data } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month, period: periodVar },
  });
  const { data: prevData } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year: prevYear, month: prevMonth, period: periodVar },
  });

  const categories = data?.spendingByCategory ?? [];
  const prevCategories = prevData?.spendingByCategory ?? [];
  const prevByCat = Object.fromEntries(prevCategories.map((c: { category: string; total: number }) => [c.category, c.total]));

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  return (
    <div className={clsx('analytics-page', className)}>
      <header className="analytics-header">
        <div className="analytics-header-heading">
          <h1 className="analytics-title">Spending Analytics</h1>
          <p className="analytics-subtitle">Financial Insights</p>
          <p className="analytics-description">Analyze your spending patterns and trends.</p>
        </div>
        <div className="analytics-header-controls">
          <TimePeriodTabs period={period} onPeriodChange={setPeriod} />
          <MonthPicker year={year} month={month} period={period} onMonthChange={handleMonthChange} />
        </div>
      </header>

      <div className="analytics-content">
        <div className="analytics-main">
          <SpendingChart year={year} month={month} period={periodVar} className="analytics-chart" />

          <div className="card analytics-breakdown">
            <h3 className="section-title">Detailed Breakdown</h3>
            <p className="breakdown-intro">Your top spending categories this month</p>
            <div className="breakdown-list">
              {categories.length === 0 ? (
                <p className="breakdown-empty">No spending data for this period.</p>
              ) : (
                categories.map((cat: { category: string; total: number; count: number }) => {
                  const prevTotal = prevByCat[cat.category] ?? 0;
                  const trend = prevTotal > 0 ? Math.round(((cat.total - prevTotal) / prevTotal) * 100) : null;
                  const totalSpending = categories.reduce((sum: number, c: { total: number }) => sum + c.total, 0);
                  const percent = totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0;
                  const avgPerTx = cat.count > 0 ? cat.total / cat.count : 0;
                  return (
                    <div key={cat.category} className="breakdown-item">
                      <div className="breakdown-item-main">
                        <div className="breakdown-item-header">
                          <span
                            className="breakdown-item-category"
                            style={{ backgroundColor: (CATEGORY_COLORS[cat.category] ?? CATEGORY_COLORS['Other']) + '22', color: CATEGORY_COLORS[cat.category] ?? CATEGORY_COLORS['Other'] }}
                          >
                            {cat.category}
                          </span>
                          {trend !== null && (
                            <span className={clsx('breakdown-item-trend', trend > 0 && 'breakdown-item-trend--up', trend < 0 && 'breakdown-item-trend--down')}>
                              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                          )}
                        </div>
                        <div className="breakdown-item-details">
                          <span className="breakdown-item-amount">{formatCurrency(cat.total)}</span>
                          <span className="breakdown-item-meta">
                            {percent}% • {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                            {cat.count > 0 && (
                              <> • {formatCurrency(avgPerTx)} avg/tx</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card analytics-trends">
            <h3 className="section-title">Trends & Patterns</h3>
            <MonthlyComparison year={year} month={month} period={periodVar} />
          </div>
        </div>
      </div>
    </div>
  );
}
