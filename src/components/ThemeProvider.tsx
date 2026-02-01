'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Theme, applyTheme, getSystemTheme } from '@/lib/theme-system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme-preference',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    applyTheme('light');
  }, []);

  const setTheme = (newTheme: Theme) => {
    console.log('[ThemeProvider] setTheme called:', { from: theme, to: newTheme });
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('[ThemeProvider] toggleTheme called:', { from: theme, to: newTheme });
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useThemeContext must be used within a ThemeProvider');

  return context;
};
