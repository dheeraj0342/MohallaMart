'use client';

import { useEffect, useState } from 'react';
import { Theme, applyTheme, getSystemTheme } from '@/lib/theme-system';

type UseThemeReturn = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoaded: boolean;
};

/**
 * Hook for managing theme in React components
 * Handles localStorage persistence and system preference detection
 * 
 * Usage:
 * const { theme, toggleTheme, setTheme } = useTheme();
 * 
 * JSX: <button onClick={toggleTheme}>Toggle Theme</button>
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or system preference
    const stored = localStorage.getItem('theme-preference') as Theme | null;
    const systemTheme = getSystemTheme();
    const initialTheme = stored || systemTheme;

    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme, setTheme, isLoaded };
};
