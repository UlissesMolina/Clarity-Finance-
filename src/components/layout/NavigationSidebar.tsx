import React from 'react';
import { LayoutDashboard, Settings, Calendar as CalendarIcon, BarChart3, Target, Receipt } from 'lucide-react';
import clsx from 'clsx';
import './NavigationSidebar.css';

export type NavTab = 'dashboard' | 'analytics' | 'budgets' | 'transactions' | 'calendar' | 'settings';

interface NavigationSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogoClick?: () => void;
  className?: string;
}

const NAV_TABS: { value: NavTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'budgets', label: 'Budgets', icon: Target },
  { value: 'transactions', label: 'Transactions', icon: Receipt },
  { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { value: 'settings', label: 'Settings', icon: Settings },
];

export function NavigationSidebar({ activeTab, onTabChange, onLogoClick, className }: NavigationSidebarProps) {
  const brandContent = (
    <>
      <img src="/pie-chart.png" alt="" className="navigation-logo-img" aria-hidden />
      <div className="navigation-brand-text">
        <div className="navigation-logo">Clarity Finance</div>
        <p className="navigation-tagline">See your money clearly</p>
      </div>
    </>
  );

  return (
    <aside className={clsx('navigation-sidebar', className)}>
      <div className="navigation-brand">
        {onLogoClick ? (
          <button type="button" className="navigation-brand-btn" onClick={onLogoClick} aria-label="Back to home">
            {brandContent}
          </button>
        ) : (
          brandContent
        )}
      </div>
      <nav className="navigation-nav" aria-label="Main navigation">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              className={clsx('navigation-tab', activeTab === tab.value && 'navigation-tab--active')}
              onClick={() => onTabChange(tab.value)}
              aria-current={activeTab === tab.value ? 'page' : undefined}
            >
              <span className="navigation-tab-icon">
                <Icon size={18} aria-hidden />
              </span>
              <span className="navigation-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
