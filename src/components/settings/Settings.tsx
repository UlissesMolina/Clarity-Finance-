import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { User, Mail, DollarSign, Calendar, Bell, Mail as MailIcon, Moon, Tags, Merge, Download, Trash2, FileText, ChevronDown, Save } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import type { CurrencyCode } from '../../contexts/SettingsContext';
import { COLOR_THEMES } from '../../constants/colorThemes';
import './Settings.css';

interface SettingsProps {
  className?: string;
}

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
];

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'MMM d, yyyy', label: 'Jan 15, 2026' },
];

const DEFAULT_VIEW_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'category', label: 'By category' },
  { value: 'timeline', label: 'Timeline' },
];

export function Settings({ className }: SettingsProps) {
  const { currency, setCurrency, colorThemeId, setColorThemeId, saveSettings } = useSettings();
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency);
  const [draftColorThemeId, setDraftColorThemeId] = useState(colorThemeId);
  const [name, setName] = useState('Account Holder');
  const [email, setEmail] = useState('user@example.com');
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy');
  const [defaultView, setDefaultView] = useState('list');
  const [budgetThreshold, setBudgetThreshold] = useState(80);
  const [weeklyEmails, setWeeklyEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [colorThemeOpen, setColorThemeOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorThemeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftCurrency(currency);
    setDraftColorThemeId(colorThemeId);
  }, [currency, colorThemeId]);

  const applyColorThemeOption = (themeId: string) => {
    setDraftColorThemeId(themeId);
    setColorThemeOpen(false);
  };

  const handleSaveSettings = () => {
    saveSettings({ currency: draftCurrency, colorThemeId: draftColorThemeId });
    setToastExiting(false);
    setSavedFeedback(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastExiting(true);
      toastTimeoutRef.current = window.setTimeout(() => {
        setSavedFeedback(false);
        setToastExiting(false);
        toastTimeoutRef.current = null;
      }, 280);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!colorThemeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (colorThemeRef.current && !colorThemeRef.current.contains(e.target as Node)) {
        setColorThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorThemeOpen]);

  const handleExportAllData = () => {
    const data = { exportedAt: new Date().toISOString(), message: 'Full export would include all transactions, budgets, and settings.' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion would be processed. This is a demo.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark-mode', !darkMode);
  };

  return (
    <div className={clsx('settings-page', className)}>
      {savedFeedback && (
        <div
          className={clsx('settings-toast', toastExiting && 'settings-toast--out')}
          role="alert"
          aria-live="polite"
          aria-hidden={toastExiting || undefined}
        >
          Settings saved
        </div>
      )}
      <div className="card settings-card">
        <h2 className="settings-title">Settings</h2>
        <div className="settings-content">
          {/* Account Settings */}
          <section className="settings-section">
            <h3 className="settings-section-title">Account Settings</h3>
            <div className="settings-fields">
              <div className="settings-profile-row">
                <div className="settings-avatar" aria-hidden>
                  <User size={28} />
                </div>
                <div className="settings-profile-fields">
                  <label className="settings-label">
                    <span className="settings-label-text">Name</span>
                    <input
                      type="text"
                      className="settings-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                </div>
              </div>
              <label className="settings-label">
                <span className="settings-label-text">Email address</span>
                <div className="settings-input-wrap">
                  <Mail size={18} className="settings-input-icon" aria-hidden />
                  <input
                    type="email"
                    className="settings-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="settings-label">
                <span className="settings-label-text">Currency</span>
                <div className="settings-input-wrap">
                  <DollarSign size={18} className="settings-input-icon" aria-hidden />
                  <select
                    className="settings-select"
                    value={draftCurrency}
                    onChange={(e) => setDraftCurrency(e.target.value as CurrencyCode)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="settings-label">
                <span className="settings-label-text">Date format</span>
                <div className="settings-input-wrap">
                  <Calendar size={18} className="settings-input-icon" aria-hidden />
                  <select
                    className="settings-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    {DATE_FORMATS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </section>

          {/* Preferences */}
          <section className="settings-section">
            <h3 className="settings-section-title">Preferences</h3>
            <div className="settings-fields">
              <label className="settings-label">
                <span className="settings-label-text">Default category view</span>
                <select
                  className="settings-select settings-select--full"
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                >
                  {DEFAULT_VIEW_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-label">
                <span className="settings-label-text">Budget notification threshold (%)</span>
                <input
                  type="number"
                  className="settings-input"
                  min={50}
                  max={100}
                  value={budgetThreshold}
                  onChange={(e) => setBudgetThreshold(Number(e.target.value) || 80)}
                />
                <span className="settings-hint">Notify when spending reaches this % of budget</span>
              </label>
              <div className="settings-toggle-row">
                <div className="settings-toggle-label">
                  <Bell size={18} className="settings-toggle-icon" aria-hidden />
                  <span>Budget notifications</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={true}
                  className="settings-toggle"
                  onClick={() => {}}
                >
                  <span className="settings-toggle-thumb" />
                </button>
              </div>
              <div className="settings-toggle-row">
                <div className="settings-toggle-label">
                  <MailIcon size={18} className="settings-toggle-icon" aria-hidden />
                  <span>Weekly summary emails</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={weeklyEmails}
                  className={clsx('settings-toggle', weeklyEmails && 'settings-toggle--on')}
                  onClick={() => setWeeklyEmails((v) => !v)}
                >
                  <span className="settings-toggle-thumb" />
                </button>
              </div>
              <div className="settings-toggle-row">
                <div className="settings-toggle-label">
                  <Moon size={18} className="settings-toggle-icon" aria-hidden />
                  <span>Dark mode</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={darkMode}
                  className={clsx('settings-toggle', darkMode && 'settings-toggle--on')}
                  onClick={toggleDarkMode}
                >
                  <span className="settings-toggle-thumb" />
                </button>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="settings-section">
            <h3 className="settings-section-title">Categories</h3>
            <div className="settings-actions">
              <button type="button" className="settings-action-btn">
                <Tags size={18} />
                Manage custom categories
              </button>
              <button type="button" className="settings-action-btn">
                <Merge size={18} />
                Merge categories
              </button>
            </div>

            {/* Color theme dropdown */}
            <div className="settings-default-colors" ref={colorThemeRef}>
              <h4 className="settings-default-colors-title">Color theme</h4>
              <p className="settings-default-colors-desc">Accent and category palette for charts and labels.</p>
              <div className="settings-theme-select-wrap">
                <button
                  type="button"
                  className={clsx('settings-theme-select', colorThemeOpen && 'settings-theme-select--open')}
                  onClick={() => setColorThemeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={colorThemeOpen}
                  aria-label="Choose color theme"
                >
                  <span className="settings-theme-select-preview">
                    {Object.entries(COLOR_THEMES.find((t) => t.id === draftColorThemeId)?.colors ?? {})
                      .filter(([k]) => k.startsWith('--cat-'))
                      .slice(0, 6)
                      .map(([, v]) => (
                        <span key={v} className="settings-theme-select-swatch" style={{ background: v }} />
                      ))}
                  </span>
                  <span className="settings-theme-select-label">
                    {COLOR_THEMES.find((t) => t.id === draftColorThemeId)?.label ?? 'Default'}
                  </span>
                  <ChevronDown size={18} className="settings-theme-select-chevron" aria-hidden />
                </button>
                <div
                  className={clsx('settings-theme-dropdown', colorThemeOpen && 'settings-theme-dropdown--open')}
                  role="listbox"
                  aria-label="Color theme options"
                >
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      role="option"
                      aria-selected={draftColorThemeId === theme.id}
                      className={clsx('settings-theme-option', draftColorThemeId === theme.id && 'settings-theme-option--selected')}
                      onClick={() => applyColorThemeOption(theme.id)}
                    >
                      <span className="settings-theme-option-swatches">
                        {Object.entries(theme.colors)
                          .filter(([k]) => k.startsWith('--cat-'))
                          .slice(0, 6)
                          .map(([, v]) => (
                            <span key={v} className="settings-theme-option-swatch" style={{ background: v }} />
                          ))}
                      </span>
                      <span className="settings-theme-option-label">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-save-row">
              <button
                type="button"
                className={clsx('settings-save-btn', savedFeedback && 'settings-save-btn--saved')}
                onClick={handleSaveSettings}
              >
                <Save size={18} />
                {savedFeedback ? 'Saved' : 'Save'}
              </button>
            </div>
          </section>

          {/* Data & Privacy */}
          <section className="settings-section">
            <h3 className="settings-section-title">Data & Privacy</h3>
            <div className="settings-actions">
              <button type="button" className="settings-action-btn settings-action-btn--primary" onClick={handleExportAllData}>
                <Download size={18} />
                Export all data
              </button>
              <a href="/privacy" className="settings-action-btn" onClick={(e) => { e.preventDefault(); alert('Privacy policy would open.'); }}>
                <FileText size={18} />
                Privacy policy
              </a>
              <button type="button" className="settings-action-btn settings-action-btn--danger" onClick={handleDeleteAccount}>
                <Trash2 size={18} />
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
