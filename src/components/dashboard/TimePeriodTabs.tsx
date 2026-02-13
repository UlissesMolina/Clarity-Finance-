import React from 'react';
import clsx from 'clsx';
import './TimePeriodTabs.css';

export type Period = 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

interface TimePeriodTabsProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

export function TimePeriodTabs({ period, onPeriodChange, className }: TimePeriodTabsProps) {
  return (
    <div className={clsx('time-period-tabs', className)} role="tablist" aria-label="Time period">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          role="tab"
          aria-selected={period === p.value}
          className={clsx('period-tab', period === p.value && 'period-tab--active')}
          onClick={() => onPeriodChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
