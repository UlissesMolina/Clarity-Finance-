export type ColorThemeVars = Record<string, string>;

export const COLOR_THEMES: { id: string; label: string; colors: ColorThemeVars }[] = [
  {
    id: 'default',
    label: 'Default',
    colors: {
      '--accent': '#10b981',
      '--accent-dark': '#059669',
      '--cat-income': '#16a34a',
      '--cat-food': '#c47d09',
      '--cat-transport': '#2d6bc9',
      '--cat-shopping': '#b93a7a',
      '--cat-entertainment': '#6d49c4',
      '--cat-bills': '#4f52c1',
      '--cat-healthcare': '#c73a3a',
      '--cat-other': '#5a5e6b',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    colors: {
      '--accent': '#0ea5e9',
      '--accent-dark': '#0284c7',
      '--cat-income': '#14b8a6',
      '--cat-food': '#06b6d4',
      '--cat-transport': '#3b82f6',
      '--cat-shopping': '#8b5cf6',
      '--cat-entertainment': '#6366f1',
      '--cat-bills': '#0ea5e9',
      '--cat-healthcare': '#ec4899',
      '--cat-other': '#64748b',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    colors: {
      '--accent': '#f59e0b',
      '--accent-dark': '#d97706',
      '--cat-income': '#22c55e',
      '--cat-food': '#eab308',
      '--cat-transport': '#f97316',
      '--cat-shopping': '#ec4899',
      '--cat-entertainment': '#a855f7',
      '--cat-bills': '#ef4444',
      '--cat-healthcare': '#f43f5e',
      '--cat-other': '#78716c',
    },
  },
  {
    id: 'slate',
    label: 'Slate',
    colors: {
      '--accent': '#64748b',
      '--accent-dark': '#475569',
      '--cat-income': '#0f766e',
      '--cat-food': '#b45309',
      '--cat-transport': '#1e40af',
      '--cat-shopping': '#9d174d',
      '--cat-entertainment': '#5b21b6',
      '--cat-bills': '#1e3a8a',
      '--cat-healthcare': '#b91c1c',
      '--cat-other': '#44403c',
    },
  },
];

export function applyColorThemeToDocument(themeId: string): void {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
