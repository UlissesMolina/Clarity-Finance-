import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SPENDING_BY_CATEGORY } from '../graphql/queries';
import type { GetSpendingByCategoryQuery } from '../graphql/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLORS } from '../types';
import { formatCurrency } from '../utils/formatters';
import clsx from 'clsx';
import './SpendingChart.css';

interface SpendingChartProps {
  year: number;
  month: number;
  period?: string;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
  className?: string;
}

export function SpendingChart({
  year,
  month,
  period = 'MONTH',
  onCategoryClick,
  selectedCategory,
  className,
}: SpendingChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const { data, loading, error } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month, period },
  });
  const { data: prevData } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year: prevYear, month: prevMonth, period },
  });

  if (loading) return <div className={clsx('chart-card', 'card', className)}>Loading...</div>;
  if (error) return <div className={clsx('chart-card', 'card', className)}>Error loading chart.</div>;

  const categories = data?.spendingByCategory ?? [];
  const prevCategories = prevData?.spendingByCategory ?? [];
  const prevByCat = Object.fromEntries(prevCategories.map((c: { category: string; total: number }) => [c.category, c.total]));
  const totalSpending = categories.reduce((sum: number, c: { total: number }) => sum + c.total, 0);
  const chartData = categories.map((c: { category: string; total: number }) => {
    const value = c.total;
    const percent = totalSpending > 0 ? Math.round((value / totalSpending) * 100) : 0;
    const prevTotal = prevByCat[c.category] ?? 0;
    const trend = prevTotal > 0 ? Math.round(((value - prevTotal) / prevTotal) * 100) : null;
    return {
      name: c.category,
      value,
      percent,
      trend,
      color: CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS['Other'],
    };
  });

  if (chartData.length === 0) {
    return (
      <div className={clsx('chart-card', 'card', className)}>
        <h3 className="section-title">Spending by Category</h3>
        <p className="chart-empty">No spending data for this month.</p>
      </div>
    );
  }

  return (
    <div className={clsx('chart-card', 'card', className)}>
      <h3 className="section-title">Spending by Category</h3>
      <div className="spending-chart">
        <ResponsiveContainer width="100%" height={isMobile ? 320 : 280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy={isMobile ? "40%" : "50%"}
              innerRadius={isMobile ? 50 : 60}
              outerRadius={isMobile ? 80 : 100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              onClick={(data: { name: string } | undefined) => data && onCategoryClick?.(data.name)}
              style={{ cursor: onCategoryClick ? 'pointer' : undefined }}
            >
              {chartData.map((entry: { name: string; color: string }, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={selectedCategory == null || selectedCategory === entry.name ? 1 : 0.4}
                  stroke={selectedCategory === entry.name ? 'var(--gray-900)' : undefined}
                  strokeWidth={selectedCategory === entry.name ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined, item: { percent?: number; name?: string }) => {
                if (value == null) return '—';
                const pct = item?.percent ?? 0;
                const label = name || (item?.name ?? '');
                return [formatCurrency(value) + ` (${pct}%)`, label];
              }}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)' }}
            />
            <Legend
              layout={isMobile ? "horizontal" : "vertical"}
              align={isMobile ? "center" : "right"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              wrapperStyle={isMobile ? { paddingTop: '1rem' } : undefined}
              formatter={(value, entry: unknown) => {
                const payload = (entry as { payload?: { percent?: number; value?: number; trend?: number | null } })?.payload;
                const pct = payload?.percent ?? 0;
                const amt = payload?.value ?? 0;
                const trend = payload?.trend;
                return (
                  <span className="chart-legend-label">
                    {value} — <span className="chart-legend-amount">{formatCurrency(amt)}</span>{' '}
                    <span className="chart-legend-percent">({pct}%)</span>
                    {trend != null && !isMobile && (
                      <span className={clsx('chart-legend-trend', trend >= 0 ? 'chart-legend-trend--up' : 'chart-legend-trend--down')}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
                      </span>
                    )}
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
