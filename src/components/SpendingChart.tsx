import React from 'react';
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
  className?: string;
}

export function SpendingChart({ year, month, className }: SpendingChartProps) {
  const { data, loading, error } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year, month },
  });

  if (loading) return <div className={clsx('chart-card', 'card', className)}>Loading...</div>;
  if (error) return <div className={clsx('chart-card', 'card', className)}>Error loading chart.</div>;

  const categories = data?.spendingByCategory ?? [];
  const chartData = categories.map((c: { category: string; total: number }) => ({
    name: c.category,
    value: c.total,
    color: CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS['Other'],
  }));

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
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry: { name: string; color: string }, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : '—')}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)' }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="chart-legend-label">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
