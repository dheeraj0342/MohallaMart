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
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize with default theme on server
    if (typeof window === 'undefined') return defaultTheme;
    
    // On client, sync with what the script already applied
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) return stored;
    
    const systemTheme = getSystemTheme();
    return systemTheme;
  });

  useEffect(() => {
    console.log('[ThemeProvider] Mount effect running');
    // Sync theme state with DOM on mount
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const systemTheme = getSystemTheme();
    const initialTheme = stored || systemTheme;
    
    console.log('[ThemeProvider] Initial sync:', { stored, systemTheme, initialTheme, currentTheme: theme });
    
    // Apply theme on mount to ensure consistency
    applyTheme(initialTheme);
    
    // Only update state if different from current state
    if (initialTheme !== theme) {
      setThemeState(initialTheme);
    }
  }, [storageKey]);

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
