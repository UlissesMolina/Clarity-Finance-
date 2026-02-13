import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TRANSACTIONS_BY_MONTH } from '../../graphql/queries';
import type { GetTransactionsByMonthQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { CATEGORY_COLORS } from '../../types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, BellPlus } from 'lucide-react';
import clsx from 'clsx';
import { DayTransactionsDialog } from '../transactions/DayTransactionsDialog';
import type { TransactionDetail } from '../transactions/TransactionDetailModal';
import { TransactionDetailModal } from '../transactions/TransactionDetailModal';
import './Calendar.css';

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const formatCurrency = useFormatCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, loading, error } = useQuery<GetTransactionsByMonthQuery>(GET_TRANSACTIONS_BY_MONTH, {
    variables: { year, month, period: 'MONTH' },
  });

  const transactions = data?.transactionsByMonth ?? [];
  const transactionsByDate: Record<string, typeof transactions> = {};
  transactions.forEach((tx) => {
    const dateKey = tx.date.includes('T')
      ? format(parseISO(tx.date), 'yyyy-MM-dd')
      : tx.date.slice(0, 10);
    if (!transactionsByDate[dateKey]) {
      transactionsByDate[dateKey] = [];
    }
    transactionsByDate[dateKey].push(tx);
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setDayDialogOpen(true);
  };

  const handleTransactionClick = (tx: TransactionDetail) => {
    setSelectedTransaction(tx);
    setTransactionDetailOpen(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const monthTransactionCount = transactions.length;
  const monthSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <div className={clsx('calendar-page', className)}>Loading...</div>;
  if (error) return <div className={clsx('calendar-page', className)}>Error loading calendar.</div>;

  return (
    <div className={clsx('calendar-page', className)}>
      <div className="card calendar-card">
        <div className="calendar-summary">
          <span className="calendar-summary-text">
            {monthTransactionCount} transaction{monthTransactionCount !== 1 ? 's' : ''} this month • {formatCurrency(monthSpent)} spent
          </span>
          <button
            type="button"
            className="calendar-add-reminder-btn"
            onClick={() => alert('Add bill reminder would open.')}
            aria-label="Add bill reminder"
          >
            <BellPlus size={16} />
            Add bill reminder
          </button>
        </div>
        <div className="calendar-legend">
          <span className="calendar-legend-title">Colors:</span>
          {Object.entries(CATEGORY_COLORS).filter(([c]) => c !== 'Income').map(([category, color]) => (
            <span key={category} className="calendar-legend-item" style={{ color }}>
              <span className="calendar-legend-dot" style={{ backgroundColor: color }} aria-hidden />
              {category}
            </span>
          ))}
        </div>
        <div className="calendar-header">
          <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-title">{format(currentDate, 'MMMM yyyy')}</h2>
          <button type="button" className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTransactions = transactionsByDate[dateKey] ?? [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);
            const income = dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const primaryCategoryColor =
              dayTransactions.length > 0
                ? CATEGORY_COLORS[dayTransactions[0].category] ?? CATEGORY_COLORS['Other']
                : null;

            return (
              <div
                key={idx}
                className={clsx(
                  'calendar-day',
                  !isCurrentMonth && 'calendar-day--other-month',
                  isToday && 'calendar-day--today',
                  dayTransactions.length > 0 && 'calendar-day--has-transactions'
                )}
                style={
                  primaryCategoryColor
                    ? {
                        ['--day-glow' as string]: primaryCategoryColor + '25',
                        boxShadow: `inset 0 0 0 1px ${primaryCategoryColor}15, 0 1px 4px ${primaryCategoryColor}20`,
                      }
                    : undefined
                }
                onClick={() => handleDayClick(day)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
                aria-label={`${format(day, 'MMMM d')} - ${dayTransactions.length} transaction${dayTransactions.length !== 1 ? 's' : ''}`}
              >
                <div className="calendar-day-number">{format(day, 'd')}</div>
                {dayTransactions.length > 0 && (
                  <div className="calendar-day-transactions">
                    {income > 0 && (
                      <div className="calendar-day-income" title={`Income: ${formatCurrency(income)}`}>
                        +{formatCurrency(income, { sign: false }).replace('.00', '')}
                      </div>
                    )}
                    {expense > 0 && (
                      <div className="calendar-day-expense" title={`Expense: ${formatCurrency(expense)}`}>
                        -{formatCurrency(expense, { sign: false }).replace('.00', '')}
                      </div>
                    )}
                    {dayTransactions.slice(0, 2).map((tx) => {
                      const color = CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS['Other'];
                      return (
                        <div
                          key={tx.id}
                          className="calendar-day-tx-desc calendar-day-tx-desc--glow"
                          title={`${tx.description} (${tx.category})`}
                          style={{
                            color,
                            backgroundColor: color + '18',
                            borderLeftColor: color,
                            boxShadow: `0 0 0 1px ${color}22, 0 1px 3px ${color}30`,
                          }}
                        >
                          {tx.description}
                        </div>
                      );
                    })}
                    {dayTransactions.length > 2 && (
                      <div className="calendar-day-count">+{dayTransactions.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DayTransactionsDialog
          date={selectedDay}
          transactions={(transactionsByDate[format(selectedDay, 'yyyy-MM-dd')] ?? []) as TransactionDetail[]}
          open={dayDialogOpen}
          onOpenChange={setDayDialogOpen}
          onTransactionClick={handleTransactionClick}
        />
      )}

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={transactionDetailOpen}
        onOpenChange={setTransactionDetailOpen}
      />
    </div>
  );
}
