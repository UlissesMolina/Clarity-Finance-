import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { formatCurrencyWithCode } from '../utils/formatters';
import { COLOR_THEMES } from '../constants/colorThemes';

const STORAGE_KEY = 'finance-dashboard-settings';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export type ColorThemeId = 'default' | 'ocean' | 'sunset' | 'slate';

interface StoredSettings {
  currency?: CurrencyCode;
  colorThemeId?: string;
  darkMode?: boolean;
}

const LEGACY_CURRENCY_KEY = 'finance-dashboard-currency';
const VALID_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
const VALID_THEMES = ['default', 'ocean', 'sunset', 'slate'];

function loadStored(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredSettings;
      if (parsed && typeof parsed === 'object') return parsed;
    }
    const legacyCurrency = localStorage.getItem(LEGACY_CURRENCY_KEY);
    if (legacyCurrency && VALID_CURRENCIES.includes(legacyCurrency as CurrencyCode)) {
      return { currency: legacyCurrency as CurrencyCode };
    }
  } catch {
    /* ignore */
  }
  return {};
}

function getInitialCurrency(): CurrencyCode {
  const s = loadStored();
  return s.currency && VALID_CURRENCIES.includes(s.currency) ? s.currency : 'USD';
}

function getInitialColorThemeId(): string {
  const s = loadStored();
  return s.colorThemeId && VALID_THEMES.includes(s.colorThemeId) ? s.colorThemeId : 'default';
}

function getInitialDarkMode(): boolean {
  const s = loadStored();
  return s.darkMode === true;
}

interface SettingsState {
  currency: CurrencyCode;
  colorThemeId: string;
  darkMode: boolean;
}

interface SettingsContextValue extends SettingsState {
  setCurrency: (code: CurrencyCode) => void;
  setColorThemeId: (id: string) => void;
  /** Persist settings. Pass explicit values when saving from draft (e.g. on Save click) so they are written immediately. */
  saveSettings: (overrides?: { currency?: CurrencyCode; colorThemeId?: string; darkMode?: boolean }) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency);
  const [colorThemeId, setColorThemeIdState] = useState<string>(getInitialColorThemeId);
  const [darkMode, setDarkModeState] = useState<boolean>(getInitialDarkMode);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  const setColorThemeId = useCallback((id: string) => {
    if (VALID_THEMES.includes(id)) {
      setColorThemeIdState(id);
    }
  }, []);

  const saveSettings = useCallback((overrides?: { currency?: CurrencyCode; colorThemeId?: string; darkMode?: boolean }) => {
    try {
      const toSave: StoredSettings = {
        currency: overrides?.currency ?? currency,
        colorThemeId: overrides?.colorThemeId ?? colorThemeId,
        darkMode: overrides?.darkMode ?? darkMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      if (overrides?.currency != null) setCurrencyState(overrides.currency);
      if (overrides?.colorThemeId != null) setColorThemeIdState(overrides.colorThemeId);
      if (overrides?.darkMode !== undefined) setDarkModeState(overrides.darkMode);
    } catch {
      /* ignore */
    }
  }, [currency, colorThemeId, darkMode]);

  const themeStyle = useMemo(() => {
    const theme = COLOR_THEMES.find((t) => t.id === colorThemeId);
    if (!theme) return {};
    return theme.colors as React.CSSProperties;
  }, [colorThemeId]);

  const value: SettingsContextValue = {
    currency,
    colorThemeId,
    darkMode,
    setCurrency,
    setColorThemeId,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      <div className="dashboard-theme-wrapper" style={themeStyle}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export function useCurrency() {
  return useSettings().currency;
}

export type FormatCurrencyOptions = { sign?: boolean };

/** Returns a formatter that uses the current currency from settings. */
export function useFormatCurrency() {
  const currency = useCurrency();
  return useMemo(
    () => (amount: number, options?: FormatCurrencyOptions) =>
      formatCurrencyWithCode(amount, currency, options),
    [currency]
  );
}
