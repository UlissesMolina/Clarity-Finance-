import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_OVERVIEW_METRICS } from '../../graphql/queries';
import type { GetOverviewMetricsQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { formatMonth } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import './MonthlyComparison.css';

interface MonthlyComparisonProps {
  year: number;
  month: number;
  period?: string;
  className?: string;
}

export function MonthlyComparison({ year, month, period = 'MONTH', className }: MonthlyComparisonProps) {
  const formatCurrency = useFormatCurrency();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const { data: current } = useQuery<GetOverviewMetricsQuery>(GET_OVERVIEW_METRICS, { variables: { year, month, period } });
  const { data: previous } = useQuery<GetOverviewMetricsQuery>(GET_OVERVIEW_METRICS, {
    variables: { year: prevYear, month: prevMonth, period },
  });

  const cur = current?.overviewMetrics;
  const prev = previous?.overviewMetrics;
  if (!cur || !prev) return null;

  const incomeDiff = cur.totalIncome - prev.totalIncome;
  const expenseDiff = cur.totalExpense - prev.totalExpense;
  const netDiff = cur.netAmount - prev.netAmount;

  const rows = [
    { label: 'Income', current: cur.totalIncome, diff: incomeDiff },
    { label: 'Expenses', current: cur.totalExpense, diff: expenseDiff },
    { label: 'Net', current: cur.netAmount, diff: netDiff },
  ];

  return (
    <div className={clsx('card', 'monthly-comparison', className)}>
      <h3 className="section-title">vs {formatMonth(prevYear, prevMonth)}</h3>
      <ul className="comparison-list">
        {rows.map((row) => {
          const isPositive = row.diff >= 0;
          const isNet = row.label === 'Net';
          const goodPositive = isNet ? isPositive : !isPositive;
          return (
            <li key={row.label} className="comparison-row">
              <span className="comparison-label">{row.label}</span>
              <span className="comparison-current">{formatCurrency(row.current, row.label === 'Net' ? { sign: true } : undefined)}</span>
              <span
                className={clsx(
                  'comparison-diff',
                  row.diff === 0 ? 'comparison-diff--neutral' : goodPositive ? 'comparison-diff--up' : 'comparison-diff--down'
                )}
              >
                {row.diff === 0 ? (
                  '—'
                ) : (
                  <>
                    {row.diff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {formatCurrency(Math.abs(row.diff), { sign: false })}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
