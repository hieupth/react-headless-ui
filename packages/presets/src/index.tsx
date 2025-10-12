/**
 * React UI Forge - Presets Package
 *
 * Pre-built configurations and presets for React UI Forge.
 * Provides common themes, configurations, and component presets.
 *
 * Architecture Principles:
 * - Ready-to-use configurations
 * - Theme presets
 * - Component presets
 * - Flutter-inspired patterns
 */

// Export preset themes
export const defaultTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    neutral: '#374151',
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f3f4f6',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  }
};

// Export configuration presets
export const defaultConfig = {
  animations: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'base',
  colorScheme: 'light'
};

// Export component presets
export const buttonPresets = {
  primary: {
    variant: 'solid',
    size: 'md',
    color: 'primary'
  },
  secondary: {
    variant: 'outline',
    size: 'md',
    color: 'secondary'
  },
  ghost: {
    variant: 'ghost',
    size: 'md',
    color: 'neutral'
  }
};

export const inputPresets = {
  default: {
    size: 'md',
    variant: 'outline',
    color: 'neutral'
  },
  error: {
    size: 'md',
    variant: 'outline',
    color: 'error'
  }
};