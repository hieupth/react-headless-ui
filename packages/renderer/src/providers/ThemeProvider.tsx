/**
 * Basic theme provider for renderer components.
 * Following CLAUDE.md patterns with immutable theme extensions.
 */

import React, { createContext, useContext } from 'react';

export interface Theme {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    muted: string;
    border: string;
    destructive: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontWeights: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

const defaultTheme: Theme = {
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#3b82f6',
    secondary: '#6b7280',
    muted: '#f3f4f6',
    border: '#e5e7eb',
    destructive: '#ef4444',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

/**
 * Theme provider for component tree.
 * @param props - Provider configuration
 * @returns Theme context provider
 */
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  theme?: Partial<Theme>;
}> = ({ children, theme }) => {
  const mergedTheme = theme ? { ...defaultTheme, ...theme } : defaultTheme;

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access current theme.
 * @returns Current theme object
 */
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultTheme;
  }
  return context;
};