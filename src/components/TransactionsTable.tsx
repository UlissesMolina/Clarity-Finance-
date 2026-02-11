import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TRANSACTIONS_BY_MONTH } from '../graphql/queries';
import type { GetTransactionsByMonthQuery } from '../graphql/types';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import { CATEGORY_COLORS } from '../types';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import './TransactionsTable.css';

interface TransactionsTableProps {
  year: number;
  month: number;
  className?: string;
}

export function TransactionsTable({ year, month, className }: TransactionsTableProps) {
  const [search, setSearch] = useState('');
  const { data, loading, error } = useQuery<GetTransactionsByMonthQuery>(GET_TRANSACTIONS_BY_MONTH, {
    variables: { year, month },
  });

  if (loading) return <div className={clsx('card', 'transactions-card', className)}>Loading...</div>;
  if (error) return <div className={clsx('card', 'transactions-card', className)}>Error loading transactions.</div>;

  const transactions = data?.transactionsByMonth ?? [];
  const filtered = search.trim()
    ? transactions.filter(
        (t: { description: string; category: string }) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;
  const displayList = filtered.slice(0, 50);

  return (
    <div className={clsx('card', 'transactions-card', className)}>
      <div className="transactions-header">
        <h3 className="section-title">Recent Transactions</h3>
        <div className="transactions-search">
          <Search size={16} className="search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search transactions"
          />
        </div>
      </div>
      <div className="transactions-table-wrap">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={4} className="transactions-empty">
                  {search.trim() ? 'No transactions match your search.' : 'No transactions this month.'}
                </td>
              </tr>
            ) : (
              displayList.map((t: { id: string; date: string; description: string; category: string; amount: number; type: string }) => (
                <tr key={t.id}>
                  <td className="date-cell">{formatDateShort(t.date)}</td>
                  <td className="desc-cell">{t.description}</td>
                  <td>
                    <span
                      className="category-badge"
                      style={{ backgroundColor: (CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS['Other']) + '22', color: CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS['Other'] }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className={clsx('amount-cell', t.type === 'income' ? 'amount-income' : 'amount-expense')}>
                    {formatCurrency(t.amount, { sign: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
