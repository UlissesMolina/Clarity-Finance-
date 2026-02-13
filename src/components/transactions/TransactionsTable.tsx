import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TRANSACTIONS_BY_MONTH, UPDATE_TRANSACTION } from '../../graphql/queries';
import type { GetTransactionsByMonthQuery } from '../../graphql/types';
import { useFormatCurrency } from '../../contexts/SettingsContext';
import { formatDateShort } from '../../utils/formatters';
import { CATEGORY_COLORS, CATEGORIES } from '../../types';
import { TransactionDetailModal, type TransactionDetail } from './TransactionDetailModal';
import { Search, X, ChevronDown, ChevronRight, FileDown, FileText, Edit2, Trash2, ChevronLeft, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import clsx from 'clsx';
import './TransactionsTable.css';

const PAGE_SIZE = 20;
const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Income');

export type TransactionTypeFilter = 'all' | 'income' | 'expense';
export type SortField = 'date' | 'description' | 'category' | 'amount';
export type SortDirection = 'asc' | 'desc';

interface TransactionsTableProps {
  year: number;
  month: number;
  period?: string;
  categoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
  limit?: number;
  className?: string;
}

function downloadCSV(rows: TransactionDetail[]) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const lines = [headers.join(',')];
  rows.forEach((t) => {
    lines.push(
      [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.type,
        t.amount,
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
        `<tr><td>${t.date}</td><td>${(t.description || '').replace(/</g, '&lt;')}</td><td>${t.category}</td><td>${t.type}</td><td>${formatCurrencyFn(t.amount, { sign: true })}</td></tr>`
    )
    .join('');
  const html = `<!DOCTYPE html><html><head><title>Transactions</title><style>body{font-family:system-ui,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>Transactions</h1><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 250);
}

export function TransactionsTable({
  year,
  month,
  period = 'MONTH',
  categoryFilter,
  onClearCategoryFilter,
  limit,
  className,
}: TransactionsTableProps) {
  const formatCurrency = useFormatCurrency();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailTx, setDetailTx] = useState<TransactionDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const { data, loading, error } = useQuery<GetTransactionsByMonthQuery>(GET_TRANSACTIONS_BY_MONTH, {
    variables: { year, month, period },
  });
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: [{ query: GET_TRANSACTIONS_BY_MONTH, variables: { year, month, period } }],
  });

  const handleCategoryChange = useCallback(
    (id: string, category: string) => {
      updateTransaction({ variables: { input: { id, category } } });
    },
    [updateTransaction]
  );

  const handleNotesBlur = useCallback(
    (id: string, notes: string) => {
      updateTransaction({ variables: { input: { id, notes } } });
    },
    [updateTransaction]
  );

  if (loading) return <div className={clsx('card', 'transactions-card', className)}>Loading...</div>;
  if (error) return <div className={clsx('card', 'transactions-card', className)}>Error loading transactions.</div>;

  const transactions = data?.transactionsByMonth ?? [];
  let filtered = transactions;
  if (typeFilter !== 'all') {
    filtered = filtered.filter((t: { type: string }) => t.type === typeFilter);
  }
  if (search.trim()) {
    filtered = filtered.filter(
      (t: { description: string; category: string }) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (categoryFilter) {
    filtered = filtered.filter((t: { category: string }) => t.category === categoryFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    if (sortField === 'date') {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    } else if (sortField === 'description') {
      aVal = a.description.toLowerCase();
      bVal = b.description.toLowerCase();
    } else if (sortField === 'category') {
      aVal = a.category.toLowerCase();
      bVal = b.category.toLowerCase();
    } else if (sortField === 'amount') {
      aVal = Math.abs(a.amount);
      bVal = Math.abs(b.amount);
    }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCount = sorted.length;
  const totalPages = limit ? 1 : Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = limit ? 0 : (currentPage - 1) * PAGE_SIZE;
  const endIndex = limit ? Math.min(limit, totalCount) : Math.min(startIndex + PAGE_SIZE, totalCount);
  const displayList = sorted.slice(startIndex, endIndex) as TransactionDetail[];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleExpand = (t: TransactionDetail) => {
    setExpandedId((id) => (id === t.id ? null : t.id));
    setNotesDraft((prev) => ({ ...prev, [t.id]: t.notes ?? '' }));
  };

  const openDetail = (t: TransactionDetail) => {
    setDetailTx(t);
    setDetailOpen(true);
  };

  const handleExportCSV = () => downloadCSV(filtered as TransactionDetail[]);
  const handleExportPDF = () => downloadPDF(filtered as TransactionDetail[], formatCurrency);

  return (
    <div className={clsx('card', 'transactions-card', className)}>
      {!limit && (
        <div className="transactions-type-filters">
        <button
          type="button"
          className={clsx('transactions-type-btn', typeFilter === 'all' && 'transactions-type-btn--active')}
          onClick={() => setTypeFilter('all')}
          aria-pressed={typeFilter === 'all'}
        >
          All
        </button>
        <button
          type="button"
          className={clsx('transactions-type-btn', typeFilter === 'income' && 'transactions-type-btn--active')}
          onClick={() => setTypeFilter('income')}
          aria-pressed={typeFilter === 'income'}
        >
          Income
        </button>
        <button
          type="button"
          className={clsx('transactions-type-btn', typeFilter === 'expense' && 'transactions-type-btn--active')}
          onClick={() => setTypeFilter('expense')}
          aria-pressed={typeFilter === 'expense'}
        >
          Expenses
        </button>
      </div>
      )}
      <div className="transactions-header">
        <h3 className="section-title">Recent Transactions</h3>
        <div className="transactions-header-actions">
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
          {categoryFilter && onClearCategoryFilter && (
            <button
              type="button"
              className="transactions-filter-tag"
              onClick={onClearCategoryFilter}
              aria-label={`Clear filter: ${categoryFilter}`}
            >
              {categoryFilter} <X size={14} />
            </button>
          )}
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
      </div>
      <div className="transactions-table-wrap">
        <table className="transactions-table">
          <thead>
            <tr>
              <th className="th-expand" aria-label="Expand" />
              <th>
                <button
                  type="button"
                  className={clsx('transactions-sort-btn', sortField === 'date' && 'transactions-sort-btn--active')}
                  onClick={() => handleSort('date')}
                >
                  Date
                  {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDownIcon size={14} />)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className={clsx('transactions-sort-btn', sortField === 'description' && 'transactions-sort-btn--active')}
                  onClick={() => handleSort('description')}
                >
                  Description
                  {sortField === 'description' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDownIcon size={14} />)}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className={clsx('transactions-sort-btn', sortField === 'category' && 'transactions-sort-btn--active')}
                  onClick={() => handleSort('category')}
                >
                  Category
                  {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDownIcon size={14} />)}
                </button>
              </th>
              <th className="amount-col">
                <button
                  type="button"
                  className={clsx('transactions-sort-btn', sortField === 'amount' && 'transactions-sort-btn--active')}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDownIcon size={14} />)}
                </button>
              </th>
              <th className="th-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={6} className="transactions-empty">
                  <div className="transactions-empty-content">
                    <p className="transactions-empty-title">No transactions found</p>
                    <p className="transactions-empty-message">
                      {categoryFilter
                        ? `No transactions in ${categoryFilter}.`
                        : typeFilter !== 'all'
                        ? `No ${typeFilter} transactions this period.`
                        : search.trim()
                        ? 'No transactions match your search.'
                        : 'No transactions this period.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayList.map((t) => {
                const expanded = expandedId === t.id;
                const categoriesForType = t.type === 'income' ? ['Income'] : EXPENSE_CATEGORIES;
                return (
                  <React.Fragment key={t.id}>
                    <tr
                      className={clsx('transactions-row-clickable', expanded && 'transactions-row-expanded')}
                      onClick={() => toggleExpand(t)}
                      onMouseEnter={() => setHoveredRowId(t.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleExpand(t)}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${t.description}`}
                    >
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
                      <td className="td-actions">
                        {hoveredRowId === t.id && (
                          <div className="transactions-row-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="transactions-action-btn"
                              onClick={() => {
                                setDetailTx(t);
                                setDetailOpen(true);
                              }}
                              aria-label={`Edit ${t.description}`}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="transactions-action-btn transactions-action-btn--delete"
                              onClick={() => {
                                // TODO: Implement delete mutation
                                if (window.confirm(`Delete transaction "${t.description}"?`)) {
                                  console.log('Delete transaction', t.id);
                                }
                              }}
                              aria-label={`Delete ${t.description}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
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
                                openDetail(t);
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
      {!limit && totalPages > 1 && (
        <div className="transactions-pagination">
          <div className="transactions-pagination-info">
            Showing {startIndex + 1}-{endIndex} of {totalCount}
          </div>
          <div className="transactions-pagination-controls">
            <button
              type="button"
              className="transactions-pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={clsx('transactions-pagination-btn', currentPage === pageNum && 'transactions-pagination-btn--active')}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              className="transactions-pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      <TransactionDetailModal
        transaction={detailTx}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
