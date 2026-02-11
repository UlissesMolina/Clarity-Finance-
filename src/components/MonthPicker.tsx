import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonth } from '../utils/formatters';
import clsx from 'clsx';
import './MonthPicker.css';

interface MonthPickerProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  className?: string;
}

export function MonthPicker({ year, month, onMonthChange, className }: MonthPickerProps) {
  const goPrev = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  return (
    <div className={clsx('month-picker', className)}>
      <button
        type="button"
        className="month-picker-btn"
        onClick={goPrev}
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <span className={clsx('month-picker-label', isCurrentMonth && 'month-picker-current')}>
        {formatMonth(year, month)}
      </span>
      <button
        type="button"
        className="month-picker-btn"
        onClick={goNext}
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
