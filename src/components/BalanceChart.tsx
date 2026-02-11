import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DAILY_BALANCES } from '../graphql/queries';
import type { GetDailyBalancesQuery } from '../graphql/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { formatDateShort } from '../utils/formatters';
import clsx from 'clsx';
import './BalanceChart.css';

interface BalanceChartProps {
  year: number;
  month: number;
  className?: string;
}

export function BalanceChart({ year, month, className }: BalanceChartProps) {
  const { data, loading, error } = useQuery<GetDailyBalancesQuery>(GET_DAILY_BALANCES, {
    variables: { year, month },
  });

  if (loading) return <div className={clsx('chart-card', 'card', className)}>Loading...</div>;
  if (error) return <div className={clsx('chart-card', 'card', className)}>Error loading chart.</div>;

  const daily = data?.dailyBalances ?? [];

  if (daily.length === 0) {
    return (
      <div className={clsx('chart-card', 'card', className)}>
        <h3 className="section-title">Balance Over Time</h3>
        <p className="chart-empty">No data for this month.</p>
      </div>
    );
  }

  const chartData = daily.map((d: { date: string; balance: number }) => ({
    ...d,
    displayDate: formatDateShort(d.date),
  }));

  return (
    <div className={clsx('chart-card', 'card', className)}>
      <h3 className="section-title">Balance Over Time</h3>
      <div className="balance-chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: 'var(--gray-500)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--gray-200)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              tick={{ fontSize: 11, fill: 'var(--gray-500)' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              formatter={(value: number | undefined) => [value != null ? formatCurrency(value) : '—', 'Balance']}
              labelFormatter={(label, payload) => (payload?.[0]?.payload?.date ? formatDateShort(payload[0].payload.date) : label)}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
