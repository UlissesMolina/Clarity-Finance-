import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { CATEGORY_COLORS } from '../../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { TransactionDetail } from './TransactionDetailModal';
import './DayTransactionsDialog.css';

interface DayTransactionsDialogProps {
  date: Date | null;
  transactions: TransactionDetail[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionClick?: (transaction: TransactionDetail) => void;
}

export function DayTransactionsDialog({
  date,
  transactions,
  open,
  onOpenChange,
  onTransactionClick,
}: DayTransactionsDialogProps) {
  const formatCurrency = useFormatCurrency();
  if (!date) return null;

  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="day-tx-overlay" />
        <Dialog.Content className="day-tx-content" aria-describedby={undefined}>
          <div className="day-tx-header">
            <Dialog.Title className="day-tx-title">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="day-tx-close" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {transactions.length === 0 ? (
            <div className="day-tx-empty">
              <p>No transactions on this day.</p>
            </div>
          ) : (
            <>
              <div className="day-tx-summary">
                <div className="day-tx-summary-item">
                  <span className="day-tx-summary-label">Income</span>
                  <span className="day-tx-summary-value day-tx-summary-value--income">
                    {formatCurrency(income)}
                  </span>
                </div>
                <div className="day-tx-summary-item">
                  <span className="day-tx-summary-label">Expenses</span>
                  <span className="day-tx-summary-value day-tx-summary-value--expense">
                    {formatCurrency(expense)}
                  </span>
                </div>
                <div className="day-tx-summary-item day-tx-summary-item--net">
                  <span className="day-tx-summary-label">Net</span>
                  <span
                    className={`day-tx-summary-value day-tx-summary-value--${net >= 0 ? 'income' : 'expense'}`}
                  >
                    {formatCurrency(net, { sign: true })}
                  </span>
                </div>
              </div>

              <div className="day-tx-list">
                <h3 className="day-tx-list-title">Transactions ({transactions.length})</h3>
                <div className="day-tx-items">
                  {transactions.map((tx) => {
                    const color = CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS['Other'];
                    return (
                      <button
                        key={tx.id}
                        type="button"
                        className="day-tx-item"
                        onClick={() => {
                          onTransactionClick?.(tx);
                          onOpenChange(false);
                        }}
                      >
                        <div className="day-tx-item-main">
                          <div className="day-tx-item-description">{tx.description}</div>
                          <div className="day-tx-item-meta">
                            <span
                              className="day-tx-item-category"
                              style={{ backgroundColor: color + '22', color }}
                            >
                              {tx.category}
                            </span>
                            <span className="day-tx-item-time">
                              {format(new Date(tx.date), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`day-tx-item-amount day-tx-item-amount--${tx.type}`}
                        >
                          {formatCurrency(tx.amount, { sign: true })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
