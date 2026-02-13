import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TRANSACTIONS_BY_MONTH, UPDATE_TRANSACTION } from '../../graphql/queries';
import type { GetTransactionsByMonthQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { formatDateShort } from '../../utils/formatters';
import { CATEGORY_COLORS, CATEGORIES } from '../../types';
import { TransactionDetailModal, type TransactionDetail } from './TransactionDetailModal';
import { Search, X, ChevronDown, ChevronRight, FileDown, FileText, Filter, CheckSquare, Square } from 'lucide-react';
import clsx from 'clsx';
import './Transactions.css';

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Income');

export type TransactionTypeFilter = 'all' | 'income' | 'expense';

interface TransactionsProps {
  className?: string;
}

function downloadCSV(rows: TransactionDetail[]) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes'];
  const lines = [headers.join(',')];
  rows.forEach((t) => {
    lines.push(
      [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.type,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    );
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows: TransactionDetail[], formatCurrencyFn: (amount: number, opts?: { sign?: boolean }) => string) {
  const rowsHtml = rows
    .map(
      (t) =>
        `<tr><td>${t.date}</td><td>${(t.description || '').replace(/</g, '&lt;')}</td><td>${t.category}</td><td>${t.type}</td><td>${formatCurrencyFn(t.amount, { sign: true })}</td><td>${(t.notes || '').replace(/</g, '&lt;')}</td></tr>`
    )
    .join('');
  const html = `<!DOCTYPE html><html><head><title>Transactions</title><style>body{font-family:system-ui,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>Transactions</h1><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th><th>Notes</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 250);
}

export function Transactions({ className }: TransactionsProps) {
  const formatCurrency = useFormatCurrency();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailTx, setDetailTx] = useState<TransactionDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data, loading, error } = useQuery<GetTransactionsByMonthQuery>(GET_TRANSACTIONS_BY_MONTH, {
    variables: { year: new Date().getFullYear(), month: new Date().getMonth(), period: 'MONTH' },
  });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: [{ query: GET_TRANSACTIONS_BY_MONTH, variables: { year: new Date().getFullYear(), month: new Date().getMonth(), period: 'MONTH' } }],
  });

  const handleCategoryChange = React.useCallback(
    (id: string, category: string) => {
      updateTransaction({ variables: { input: { id, category } } });
    },
    [updateTransaction]
  );

  const handleNotesBlur = React.useCallback(
    (id: string, notes: string) => {
      updateTransaction({ variables: { input: { id, notes } } });
    },
    [updateTransaction]
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t: TransactionDetail) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkCategoryChange = (category: string) => {
    selectedIds.forEach((id) => {
      updateTransaction({ variables: { input: { id, category } } });
    });
    setSelectedIds(new Set());
  };

  if (loading) return <div className={clsx('transactions-page', className)}>Loading...</div>;
  if (error) return <div className={clsx('transactions-page', className)}>Error loading transactions.</div>;

  const transactions = data?.transactionsByMonth ?? [];
  let filtered = transactions;
  if (typeFilter !== 'all') {
    filtered = filtered.filter((t: { type: string }) => t.type === typeFilter);
  }
  if (search.trim()) {
    filtered = filtered.filter(
      (t: { description: string; category: string; notes?: string | null }) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (categoryFilter) {
    filtered = filtered.filter((t: { category: string }) => t.category === categoryFilter);
  }

  const filteredList = filtered as TransactionDetail[];

  const handleExportCSV = () => downloadCSV(selectedIds.size > 0 ? filteredList.filter((t) => selectedIds.has(t.id)) : filteredList);
  const handleExportPDF = () => downloadPDF(selectedIds.size > 0 ? filteredList.filter((t) => selectedIds.has(t.id)) : filteredList, formatCurrency);

  return (
    <div className={clsx('transactions-page', className)}>
      <header className="transactions-page-header">
        <div className="transactions-page-heading">
          <h1 className="transactions-page-title">Transaction History</h1>
          <p className="transactions-page-subtitle">All Transactions • {filteredList.length} total</p>
          <p className="transactions-page-context">View, search, and manage all your transactions.</p>
        </div>
        <div className="transactions-page-actions">
          <button
            type="button"
            className="transactions-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <Filter size={16} />
            Filters
          </button>
          <div className="transactions-export">
            <button type="button" className="transactions-export-btn" onClick={handleExportCSV} title="Download CSV">
              <FileDown size={16} />
              CSV
            </button>
            <button type="button" className="transactions-export-btn" onClick={handleExportPDF} title="Download PDF">
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </header>

      {showFilters && (
        <div className="card transactions-filters-panel">
          <div className="transactions-filters">
            <div className="transactions-filter-group">
              <label className="transactions-filter-label">Type</label>
              <div className="transactions-type-filters">
                <button
                  type="button"
                  className={clsx('transactions-type-btn', typeFilter === 'all' && 'transactions-type-btn--active')}
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={clsx('transactions-type-btn', typeFilter === 'income' && 'transactions-type-btn--active')}
                  onClick={() => setTypeFilter('income')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={clsx('transactions-type-btn', typeFilter === 'expense' && 'transactions-type-btn--active')}
                  onClick={() => setTypeFilter('expense')}
                >
                  Expenses
                </button>
              </div>
            </div>
            <div className="transactions-filter-group">
              <label className="transactions-filter-label">Category</label>
              <select
                className="transactions-category-select"
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {categoryFilter && (
              <button
                type="button"
                className="transactions-filter-clear"
                onClick={() => setCategoryFilter(null)}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="transactions-search-wrapper">
        <div className="transactions-search">
          <Search size={16} className="search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search transactions"
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="card transactions-bulk-actions">
          <div className="bulk-actions-info">
            {selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="bulk-actions-controls">
            <label className="bulk-actions-label">Change category:</label>
            <select
              className="bulk-actions-select"
              onChange={(e) => e.target.value && handleBulkCategoryChange(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Select category...</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="bulk-actions-clear"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      <div className="card transactions-card">
        <div className="transactions-table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th className="th-select">
                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={toggleSelectAll}
                    aria-label="Select all"
                  >
                    {selectedIds.size === filteredList.length && filteredList.length > 0 ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="th-expand" aria-label="Expand" />
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="transactions-empty">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredList.map((t) => {
                  const expanded = expandedId === t.id;
                  const selected = selectedIds.has(t.id);
                  const categoriesForType = t.type === 'income' ? ['Income'] : EXPENSE_CATEGORIES;
                  return (
                    <React.Fragment key={t.id}>
                      <tr
                        className={clsx('transactions-row-clickable', expanded && 'transactions-row-expanded', selected && 'transactions-row-selected')}
                        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setExpandedId(expandedId === t.id ? null : t.id)}
                        aria-expanded={expanded}
                      >
                        <td className="td-select" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="select-btn"
                            onClick={() => toggleSelect(t.id)}
                            aria-label={`Select ${t.description}`}
                          >
                            {selected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="td-expand">
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </td>
                        <td className="date-cell">{formatDateShort(t.date)}</td>
                        <td className="desc-cell">{t.description}</td>
                        <td>
                          <span
                            className="category-badge"
                            style={{
                              backgroundColor: (CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS['Other']) + '22',
                              color: CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS['Other'],
                            }}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className={clsx('amount-cell', t.type === 'income' ? 'amount-income' : 'amount-expense')}>
                          {formatCurrency(t.amount, { sign: true })}
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="transactions-expanded-row">
                          <td colSpan={6} className="transactions-expanded-cell" onClick={(e) => e.stopPropagation()}>
                            <div className="transactions-expanded-content">
                              <div className="transactions-expanded-section">
                                <label className="transactions-expanded-label">Notes</label>
                                <textarea
                                  className="transactions-expanded-notes"
                                  value={notesDraft[t.id] ?? t.notes ?? ''}
                                  onChange={(e) => setNotesDraft((prev) => ({ ...prev, [t.id]: e.target.value }))}
                                  onBlur={(e) => handleNotesBlur(t.id, e.target.value)}
                                  placeholder="Add notes..."
                                  rows={2}
                                />
                              </div>
                              <div className="transactions-expanded-section">
                                <span className="transactions-expanded-label">Attachments</span>
                                <span className="transactions-expanded-placeholder">No attachments</span>
                              </div>
                              <div className="transactions-expanded-section">
                                <label className="transactions-expanded-label">Category</label>
                                <select
                                  className="transactions-expanded-select"
                                  value={t.category}
                                  onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {categoriesForType.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                className="transactions-expanded-details-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailTx(t);
                                  setDetailOpen(true);
                                }}
                              >
                                View full details
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailModal
        transaction={detailTx}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
