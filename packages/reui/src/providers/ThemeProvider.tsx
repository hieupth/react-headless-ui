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
    /** Foreground text color alias */
    text?: string;
    /** White surface color */
    white?: string;
    /** Muted foreground (subdued text) color */
    mutedForeground?: string;
    /** Error/destructive alias */
    error?: string;
    /** Neutral gray scale */
    gray?: string;
    gray50?: string;
    gray200?: string;
    gray600?: string;
    /** Primary color scale */
    primary100?: string;
    primary500?: string;
    primary700?: string;
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
  /** Font family stacks */
  fonts?: {
    mono?: string;
  };
  /** Elevation shadows */
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  /** Optional design-token extensions consumed by some components */
  extensions?: {
    color?: {
      primary?: { background?: string };
      input?: { background?: string; border?: string };
    };
    spacing?: {
      component?: { padding?: string; margin?: string; gap?: string };
    };
    typography?: {
      body?: { fontSize?: string };
      label?: { fontSize?: string };
      small?: { fontSize?: string };
    };
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
    text: '#111827',
    white: '#ffffff',
    mutedForeground: '#6b7280',
    error: '#ef4444',
    gray: '#6b7280',
    gray50: '#f9fafb',
    gray200: '#e5e7eb',
    gray600: '#4b5563',
    primary100: '#dbeafe',
    primary500: '#3b82f6',
    primary700: '#1d4ed8',
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
  fonts: {
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

/**
 * Deep-merge two theme objects, section by section.
 *
 * reason: a shallow merge (`{...defaultTheme, ...theme}`) replaces an entire
 * section (e.g. `colors`) when a consumer overrides only part of it, leaving
 * sibling keys (background, foreground, border) undefined. Each theme section
 * is a plain object of token → value, so we recurse into object-valued keys
 * rather than cloning them wholesale. Non-object values fall back to the
 * default, exactly as before.
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeTheme = (base: Theme, override: Partial<Theme>): Theme => {
  const out: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) };
  for (const key of Object.keys(override)) {
    const baseValue = out[key];
    const overrideValue = (override as Record<string, unknown>)[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      // Recurse one level: token key → value within the section.
      out[key] = { ...baseValue, ...overrideValue };
    } else if (overrideValue !== undefined) {
      out[key] = overrideValue;
    }
  }
  return out as unknown as Theme;
};

/**
 * Theme provider for component tree.
 * @param props - Provider configuration
 * @returns Theme context provider
 */
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  theme?: Partial<Theme>;
}> = ({ children, theme }) => {
  const mergedTheme = theme ? mergeTheme(defaultTheme, theme) : defaultTheme;

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
  // reason: ThemeContext is created with defaultTheme as its fallback value, so
  // useContext never returns null/undefined — the !context guard was dead code.
  return useContext(ThemeContext);
};