import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation } from '@apollo/client/react';
import { ADD_TRANSACTION } from '../../graphql/queries';
import {
  GET_TRANSACTIONS_BY_MONTH,
  GET_OVERVIEW_METRICS,
  GET_SPENDING_BY_CATEGORY,
  GET_DAILY_BALANCES,
} from '../../graphql/queries';
import type { AddTransactionMutation } from '../../graphql/types';
import { CATEGORIES } from '../../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import './AddTransactionModal.css';

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Income');

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
}

const defaultDate = (year: number, month: number) =>
  format(new Date(year, month, 1), 'yyyy-MM-dd');

export function AddTransactionModal({
  open,
  onOpenChange,
  year,
  month,
}: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(defaultDate(year, month));
  const [submitError, setSubmitError] = useState('');

  const resetForm = useCallback(() => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(defaultDate(year, month));
    setSubmitError('');
  }, [year, month]);

  const [addTransaction, { loading }] = useMutation<AddTransactionMutation>(ADD_TRANSACTION, {
    refetchQueries: [
      { query: GET_TRANSACTIONS_BY_MONTH, variables: { year, month } },
      { query: GET_OVERVIEW_METRICS, variables: { year, month } },
      { query: GET_SPENDING_BY_CATEGORY, variables: { year, month } },
      { query: GET_DAILY_BALANCES, variables: { year, month } },
    ],
    onCompleted: () => {
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      setSubmitError(err.message || 'Failed to add transaction.');
    },
  });

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm();
      onOpenChange(next);
    },
    [onOpenChange, resetForm]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const desc = description.trim();
    const num = parseFloat(amount);
    if (!desc) {
      setSubmitError('Description is required.');
      return;
    }
    if (Number.isNaN(num) || num <= 0) {
      setSubmitError('Please enter a valid amount.');
      return;
    }
    const categoryValue = type === 'income' ? 'Income' : category;
    addTransaction({
      variables: {
        input: {
          description: desc,
          amount: num,
          type,
          category: categoryValue,
          date,
        },
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="add-transaction-overlay" />
        <Dialog.Content className="add-transaction-content" aria-describedby={undefined}>
          <div className="add-transaction-header">
            <Dialog.Title className="add-transaction-title">Add Transaction</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="add-transaction-close" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="add-transaction-form">
            <div className="form-row">
              <label htmlFor="add-tx-description">Description</label>
              <input
                id="add-tx-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Groceries, Salary"
                autoComplete="off"
                disabled={loading}
              />
            </div>
            <div className="form-row">
              <label htmlFor="add-tx-amount">Amount</label>
              <input
                id="add-tx-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div className="form-row">
              <span className="form-label">Type</span>
              <div className="type-toggle">
                <button
                  type="button"
                  className={type === 'expense' ? 'type-btn active' : 'type-btn'}
                  onClick={() => {
                    setType('expense');
                    setCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  disabled={loading}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={type === 'income' ? 'type-btn active' : 'type-btn'}
                  onClick={() => setType('income')}
                  disabled={loading}
                >
                  Income
                </button>
              </div>
            </div>
            {type === 'expense' && (
              <div className="form-row">
                <label htmlFor="add-tx-category">Category</label>
                <select
                  id="add-tx-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-row">
              <label htmlFor="add-tx-date">Date</label>
              <input
                id="add-tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
            </div>
            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            <div className="form-actions">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding…' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
