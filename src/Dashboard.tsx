import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { NavigationSidebar, type NavTab } from './components/NavigationSidebar';
import { Settings } from './components/Settings';
import { Calendar } from './components/Calendar';
import { Analytics } from './components/Analytics';
import { Budgets } from './components/Budgets';
import { Transactions } from './components/Transactions';
import { MonthPicker } from './components/MonthPicker';
import { TimePeriodTabs, type Period } from './components/TimePeriodTabs';
import { OverviewCards } from './components/OverviewCards';
import { BalanceChart } from './components/BalanceChart';
import { TransactionsTable } from './components/TransactionsTable';
import { BudgetVelocityCard } from './components/BudgetVelocityCard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { GET_SPENDING_BY_CATEGORY } from './graphql/queries';
import type { GetSpendingByCategoryQuery } from './graphql/types';
import { formatCurrency } from './utils/formatters';
import { Plus, Target, FileText, Bell, RefreshCw, TrendingUp, ChevronRight, MoreVertical } from 'lucide-react';
import { useApolloClient } from '@apollo/client/react';
import clsx from 'clsx';
import './components/Dashboard.css';

const PERIOD_TO_GQL: Record<Period, string> = {
  week: 'WEEK',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
};

interface DashboardProps {
  onBack?: () => void;
}

const UPCOMING_BILLS_COUNT = 3; // placeholder for notification badge

export default function Dashboard({ onBack }: DashboardProps) {
  const now = new Date();
  const client = useApolloClient();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [period, setPeriod] = useState<Period>('month');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleRefresh = () => {
    client.refetchQueries({ include: 'active' });
    setHeaderMenuOpen(false);
  };

  const periodVar = PERIOD_TO_GQL[period];

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-row">
        <NavigationSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogoClick={onBack} />
        <div className="dashboard-content">
        <div key={activeTab} className="tab-content-wrapper">
          {activeTab === 'analytics' ? (
            <Analytics />
          ) : activeTab === 'budgets' ? (
            <Budgets />
          ) : activeTab === 'transactions' ? (
            <Transactions />
          ) : activeTab === 'settings' ? (
            <Settings />
          ) : activeTab === 'calendar' ? (
            <Calendar />
          ) : (
            <>
              <header className="dashboard-header">
                <div className="dashboard-header-left">
                  <h1 className="dashboard-title">Dashboard</h1>
                  <div className="dashboard-header-center">
                    <TimePeriodTabs period={period} onPeriodChange={setPeriod} className="dashboard-period-pills" />
                    <MonthPicker year={year} month={month} period={period} onMonthChange={handleMonthChange} className="dashboard-month-picker" />
                  </div>
                </div>
                <div className="dashboard-header-right">
                  <button
                    type="button"
                    className="add-transaction-btn"
                    onClick={() => setAddModalOpen(true)}
                    aria-label="Add transaction"
                  >
                    <Plus size={18} />
                    Add transaction
                  </button>
                  <button
                    type="button"
                    className="dashboard-notification-btn"
                    onClick={() => setActiveTab('calendar')}
                    aria-label="Upcoming bills"
                    title="Upcoming bills"
                  >
                    <Bell size={20} />
                    {UPCOMING_BILLS_COUNT > 0 && (
                      <span className="dashboard-notification-badge" aria-label={`${UPCOMING_BILLS_COUNT} upcoming`}>
                        {UPCOMING_BILLS_COUNT}
                      </span>
                    )}
                  </button>
                  <div className="dashboard-header-menu-wrap">
                    <button
                      type="button"
                      className="dashboard-header-menu-btn"
                      onClick={() => setHeaderMenuOpen((o) => !o)}
                      aria-expanded={headerMenuOpen}
                      aria-haspopup="true"
                      aria-label="More actions"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {headerMenuOpen && (
                      <>
                        <div className="dashboard-header-menu-backdrop" aria-hidden onClick={() => setHeaderMenuOpen(false)} />
                        <div className="dashboard-header-menu" role="menu">
                          <button type="button" role="menuitem" className="dashboard-header-menu-item" onClick={() => { setActiveTab('budgets'); setHeaderMenuOpen(false); }}>
                            <Target size={16} />
                            Set budget
                          </button>
                          <button type="button" role="menuitem" className="dashboard-header-menu-item" onClick={() => { setActiveTab('analytics'); setHeaderMenuOpen(false); }}>
                            <FileText size={16} />
                            View report
                          </button>
                          <button type="button" role="menuitem" className="dashboard-header-menu-item" onClick={handleRefresh}>
                            <RefreshCw size={16} />
                            Refresh data
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              <AddTransactionModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                year={year}
                month={month}
              />

              <div className="dashboard">
                <OverviewCards year={year} month={month} period={periodVar} />
                <SpendingInsight
                  year={year}
                  month={month}
                  period={periodVar}
                  onCategoryClick={(cat) => {
                    setActiveTab('analytics');
                    // Could pass category filter via state/context if needed
                  }}
                />

                <div className="dashboard-main-simple">
                  <BalanceChart year={year} month={month} period={periodVar} showTrend />
                  <TransactionsTable
                    year={year}
                    month={month}
                    period={periodVar}
                    limit={10}
                  />
                  <BudgetVelocityCard
                    year={year}
                    month={month}
                    period={periodVar}
                    onViewAll={() => setActiveTab('budgets')}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
      <footer className="dashboard-footer">© 2026 Clarity</footer>
    </div>
  );
}

/** Actionable insights: e.g. "You spent 23% more on Food & Dining this period." */
function SpendingInsight({
  year,
  month,
  period,
  onCategoryClick,
}: {
  year: number;
  month: number;
  period: string;
  onCategoryClick?: (category: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const { data: curr } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, { variables: { year, month, period } });
  const { data: prev } = useQuery<GetSpendingByCategoryQuery>(GET_SPENDING_BY_CATEGORY, {
    variables: { year: prevYear, month: prevMonth, period },
  });
  const currCat = curr?.spendingByCategory ?? [];
  const prevCat = prev?.spendingByCategory ?? [];
  const byPrev: Record<string, number> = {};
  prevCat.forEach((c: { category: string; total: number }) => {
    byPrev[c.category] = c.total;
  });
  const insights: Array<{ category: string; pct: number; diff: number }> = [];
  currCat.forEach((c: { category: string; total: number }) => {
    const prevTotal = byPrev[c.category] ?? 0;
    if (prevTotal <= 0) return;
    const diff = c.total - prevTotal;
    const pct = Math.round((diff / prevTotal) * 100);
    if (pct > 0) insights.push({ category: c.category, pct, diff });
  });
  insights.sort((a, b) => b.pct - a.pct);
  const topInsights = insights.slice(0, 3);

  useEffect(() => {
    if (topInsights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % topInsights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [topInsights.length]);

  if (topInsights.length === 0) return null;

  return (
    <div className="dashboard-insights">
      {topInsights.map((insight, idx) => (
        <div
          key={insight.category}
          className={clsx('dashboard-insight-card', idx === currentIndex && 'dashboard-insight-card--active')}
          style={{ display: idx === currentIndex ? 'flex' : 'none' }}
        >
          <div className="dashboard-insight-icon">
            <TrendingUp size={20} />
          </div>
          <div className="dashboard-insight-content">
            <p className="dashboard-insight-text">
              You spent <strong>{insight.pct}%</strong> more on <strong>{insight.category}</strong> this period ({formatCurrency(insight.diff)}).
            </p>
            {onCategoryClick && (
              <button
                type="button"
                className="dashboard-insight-link"
                onClick={() => onCategoryClick(insight.category)}
              >
                View details <ChevronRight size={14} />
              </button>
            )}
          </div>
          {topInsights.length > 1 && (
            <div className="dashboard-insight-dots">
              {topInsights.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  className={clsx('dashboard-insight-dot', dotIdx === currentIndex && 'dashboard-insight-dot--active')}
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`View insight ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

