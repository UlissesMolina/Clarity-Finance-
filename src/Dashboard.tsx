import React, { useState } from 'react';
import { MonthPicker } from './components/MonthPicker';
import { OverviewCards } from './components/OverviewCards';
import { SpendingChart } from './components/SpendingChart';
import { BalanceChart } from './components/BalanceChart';
import { TransactionsTable } from './components/TransactionsTable';
import { MonthlyComparison } from './components/MonthlyComparison';
import { ArrowLeft } from 'lucide-react';
import './components/Dashboard.css';

interface DashboardProps {
  onBack?: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          {onBack && (
            <button type="button" className="back-btn" onClick={onBack} aria-label="Back to home">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="dashboard-title">Finance Dashboard</h1>
        </div>
        <MonthPicker year={year} month={month} onMonthChange={handleMonthChange} />
      </header>

      <OverviewCards year={year} month={month} />

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <BalanceChart year={year} month={month} />
          <SpendingChart year={year} month={month} />
          <TransactionsTable year={year} month={month} />
        </div>
        <aside className="dashboard-sidebar">
          <MonthlyComparison year={year} month={month} />
        </aside>
      </div>
    </div>
  );
}

