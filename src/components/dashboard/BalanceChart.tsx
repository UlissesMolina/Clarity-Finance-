import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DAILY_BALANCES } from '../../graphql/queries';
import type { GetDailyBalancesQuery } from '../../graphql/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { formatDateShort } from '../../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import './BalanceChart.css';

interface BalanceChartProps {
  year: number;
  month: number;
  period?: string;
  showTrend?: boolean;
  className?: string;
}

export function BalanceChart({ year, month, period = 'MONTH', showTrend = false, className }: BalanceChartProps) {
  const formatCurrency = useFormatCurrency();
  const { data, loading, error } = useQuery<GetDailyBalancesQuery>(GET_DAILY_BALANCES, {
    variables: { year, month, period },
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

  const firstBalance = daily[0]?.balance ?? 0;
  const lastBalance = daily[daily.length - 1]?.balance ?? 0;
  const trendPct =
    firstBalance !== 0 ? Math.round(((lastBalance - firstBalance) / Math.abs(firstBalance)) * 100) : (lastBalance >= 0 ? 100 : -100);
  const trendUp = lastBalance >= firstBalance;

  return (
    <div className={clsx('chart-card', 'card', 'balance-chart-card', className)}>
      <div className="balance-chart-header">
        <h3 className="section-title">Balance Over Time</h3>
        {showTrend && (
          <span
            className={clsx('balance-chart-trend', trendUp ? 'balance-chart-trend--up' : 'balance-chart-trend--down')}
            title={trendUp ? `Balance up ${trendPct}% this period` : `Balance down ${Math.abs(trendPct)}% this period`}
          >
            {trendUp ? <TrendingUp size={14} className="balance-chart-trend-icon" aria-hidden /> : <TrendingDown size={14} className="balance-chart-trend-icon" aria-hidden />}
            <span>{trendUp ? trendPct : Math.abs(trendPct)}% this period</span>
          </span>
        )}
      </div>
      <div className="balance-chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" vertical={false} />
            <ReferenceLine y={0} stroke="var(--gray-400)" strokeDasharray="4 4" strokeOpacity={0.8} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: 'var(--gray-500)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--gray-200)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => {
                const isNegative = v < 0;
                const absV = Math.abs(v);
                const formatted = absV >= 1000 ? `${(absV / 1000).toFixed(0)}k` : String(absV);
                return `${isNegative ? '-' : ''}$${formatted}`;
              }}
              tick={{ fontSize: 11, fill: 'var(--gray-500)' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              formatter={(value: number | undefined) => [value != null ? formatCurrency(value, { sign: true }) : '—', 'Balance']}
              labelFormatter={(_, payload) => (payload?.[0]?.payload?.date ? formatDateShort(payload[0].payload.date) : '')}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
