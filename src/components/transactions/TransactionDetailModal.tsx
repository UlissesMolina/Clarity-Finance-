import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { formatDate } from '../../utils/formatters';
import { CATEGORY_COLORS } from '../../types';
import { X } from 'lucide-react';
import './TransactionDetailModal.css';

export interface TransactionDetail {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  createdAt: string;
  notes?: string | null;
}

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailModal({ transaction, open, onOpenChange }: TransactionDetailModalProps) {
  const formatCurrency = useFormatCurrency();
  if (!transaction) return null;
  const color = CATEGORY_COLORS[transaction.category] ?? CATEGORY_COLORS['Other'];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="tx-detail-overlay" />
        <Dialog.Content className="tx-detail-content" aria-describedby={undefined}>
          <div className="tx-detail-header">
            <Dialog.Title className="tx-detail-title">Transaction details</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="tx-detail-close" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className="tx-detail-body">
            <div className="tx-detail-row">
              <span className="tx-detail-label">Description</span>
              <span className="tx-detail-value">{transaction.description}</span>
            </div>
            <div className="tx-detail-row">
              <span className="tx-detail-label">Amount</span>
              <span className={`tx-detail-value tx-detail-amount tx-detail-amount--${transaction.type}`}>
                {formatCurrency(transaction.amount, { sign: true })}
              </span>
            </div>
            <div className="tx-detail-row">
              <span className="tx-detail-label">Category</span>
              <span
                className="tx-detail-value tx-detail-category"
                style={{ backgroundColor: color + '22', color }}
              >
                {transaction.category}
              </span>
            </div>
            <div className="tx-detail-row">
              <span className="tx-detail-label">Date</span>
              <span className="tx-detail-value">{formatDate(transaction.date)}</span>
            </div>
            <div className="tx-detail-row">
              <span className="tx-detail-label">Type</span>
              <span className="tx-detail-value">{transaction.type}</span>
            </div>
            {(transaction.notes ?? '').trim() !== '' && (
              <div className="tx-detail-row">
                <span className="tx-detail-label">Notes</span>
                <span className="tx-detail-value tx-detail-notes">{transaction.notes}</span>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
