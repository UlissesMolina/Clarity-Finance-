import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_OVERVIEW_METRICS, GET_DAILY_BALANCES } from '../graphql/queries';
import type { GetOverviewMetricsQuery, GetDailyBalancesQuery } from '../graphql/types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import clsx from 'clsx';
import './OverviewCards.css';

interface OverviewCardsProps {
  year: number;
  month: number;
  className?: string;
}

export function OverviewCards({ year, month, className }: OverviewCardsProps) {
  const { data, loading, error } = useQuery<GetOverviewMetricsQuery>(GET_OVERVIEW_METRICS, {
    variables: { year, month },
  });
  const { data: balanceData } = useQuery<GetDailyBalancesQuery>(GET_DAILY_BALANCES, {
    variables: { year, month },
  });

  if (loading) return <div className={clsx('overview-cards', className)}>Loading...</div>;
  if (error) return <div className={clsx('overview-cards', className)}>Error loading metrics.</div>;

  const m = data?.overviewMetrics;
  if (!m) return null;

  const daily = balanceData?.dailyBalances ?? [];

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(m.totalIncome),
      icon: TrendingUp,
      color: 'income',
      sparkline: daily.map((d: { income: number }) => ({ value: d.income })),
    },
    {
      title: 'Total Expense',
      value: formatCurrency(m.totalExpense),
      icon: TrendingDown,
      color: 'expense',
      sparkline: daily.map((d: { expense: number }) => ({ value: d.expense })),
    },
    {
      title: 'Net',
      value: formatCurrency(m.netAmount, { sign: true }),
      icon: Wallet,
      color: m.netAmount >= 0 ? 'income' : 'expense',
      sparkline: daily.map((d: { balance: number }) => ({ value: d.balance })),
    },
    {
      title: 'Transactions',
      value: m.transactionCount.toString(),
      icon: Receipt,
      color: 'neutral',
      sparkline: null,
    },
  ];

  return (
    <div className={clsx('overview-cards', className)}>
      {cards.map((card) => (
        <div key={card.title} className={clsx('overview-card', 'card', `overview-card--${card.color}`)}>
          <div className="overview-card-header">
            <card.icon size={18} className="overview-card-icon" aria-hidden />
            <span className="overview-card-title">{card.title}</span>
          </div>
          <div className="overview-card-value">{card.value}</div>
          {card.sparkline && card.sparkline.length > 0 && (
            <div className="overview-card-sparkline">
              <ResponsiveContainer width="100%" height={36}>
                <AreaChart data={card.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`spark-${card.color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    fill={`url(#spark-${card.color})`}
                  />
                  <Tooltip content={<></>} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
