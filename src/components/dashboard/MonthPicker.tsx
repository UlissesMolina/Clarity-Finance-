import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth, formatPeriodLabel } from '../../utils/formatters';
import type { Period } from './TimePeriodTabs';
import { addWeeks, subWeeks, addMonths, subMonths, addQuarters, subQuarters, addYears, subYears } from 'date-fns';
import clsx from 'clsx';
import './MonthPicker.css';

interface MonthPickerProps {
  year: number;
  month: number;
  period: Period;
  onMonthChange: (year: number, month: number) => void;
  className?: string;
}

export function MonthPicker({ year, month, period, onMonthChange, className }: MonthPickerProps) {
  const ref = new Date(year, month, 15);

  const goPrev = () => {
    let next: Date;
    switch (period) {
      case 'week':
        next = subWeeks(ref, 1);
        break;
      case 'quarter':
        next = subQuarters(ref, 1);
        break;
      case 'year':
        next = subYears(ref, 1);
        break;
      default:
        next = subMonths(ref, 1);
        break;
    }
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  const goNext = () => {
    let next: Date;
    switch (period) {
      case 'week':
        next = addWeeks(ref, 1);
        break;
      case 'quarter':
        next = addQuarters(ref, 1);
        break;
      case 'year':
        next = addYears(ref, 1);
        break;
      default:
        next = addMonths(ref, 1);
        break;
    }
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  const now = new Date();
  const isCurrent = now.getFullYear() === year && now.getMonth() === month;

  const label = period === 'month' ? formatMonth(year, month) : formatPeriodLabel(year, month, period);

  return (
    <div className={clsx('month-picker', className)}>
      <button
        type="button"
        className="month-picker-btn"
        onClick={goPrev}
        aria-label={`Previous ${period}`}
      >
        <ChevronLeft size={20} />
      </button>
      <span className={clsx('month-picker-label', isCurrent && 'month-picker-current')}>
        {label}
      </span>
      <button
        type="button"
        className="month-picker-btn"
        onClick={goNext}
        aria-label={`Next ${period}`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
