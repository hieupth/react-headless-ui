/**
 * Color theme extension following Flutter ColorScheme patterns.
 * Provides comprehensive color system with semantic naming.
 */

export interface ColorExtension {
  /** Primary brand colors */
  primary: ColorPalette;
  /** Secondary brand colors */
  secondary: ColorPalette;
  /** Tertiary accent colors */
  tertiary: ColorPalette;
  /** Surface colors for backgrounds and containers */
  surface: SurfaceColors;
  /** Error colors for validation and alerts */
  error: ColorPalette;
  /** Warning colors for cautions */
  warning: ColorPalette;
  /** Success colors for positive feedback */
  success: ColorPalette;
  /** Info colors for neutral information */
  info: ColorPalette;
  /** Neutral grayscale colors */
  neutral: ColorPalette;
  /** Semantic colors for common UI states */
  semantic: SemanticColors;
}

export interface ColorPalette {
  /** Main color variant */
  main: string;
  /** Lighter variants */
  light: string;
  lighter: string;
  /** Darker variants */
  dark: string;
  darker: string;
  /** Contrast color for text */
  contrast: string;
  /** Additional opacity variants */
  alpha10: string;
  alpha20: string;
  alpha50: string;
  alpha80: string;
}

export interface SurfaceColors {
  /** Main surface background */
  main: string;
  /** Elevated surface (cards, dialogs) */
  elevated: string;
  /** Interactive surface (buttons, inputs) */
  interactive: string;
  /** Disabled surface */
  disabled: string;
  /** Overlay/overlay background */
  overlay: string;
  /** Border and divider colors */
  border: string;
  borderLight: string;
  borderDark: string;
}

export interface SemanticColors {
  /** Background colors */
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  /** Text colors */
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  /** Interactive states */
  interactive: {
    hover: string;
    active: string;
    focus: string;
    selected: string;
  };
  /** Status colors */
  status: {
    online: string;
    offline: string;
    busy: string;
    away: string;
  };
}

/**
 * Default color extension following Material Design 3 guidelines.
 * Provides comprehensive color palette for all UI components.
 */
export const defaultColorExtension: ColorExtension = {
  primary: {
    main: '#6366f1',      // Indigo 500
    light: '#818cf8',     // Indigo 400
    lighter: '#a5b4fc',   // Indigo 300
    dark: '#4f46e5',      // Indigo 600
    darker: '#4338ca',    // Indigo 700
    contrast: '#ffffff',
    alpha10: 'rgba(99, 102, 241, 0.1)',
    alpha20: 'rgba(99, 102, 241, 0.2)',
    alpha50: 'rgba(99, 102, 241, 0.5)',
    alpha80: 'rgba(99, 102, 241, 0.8)'
  },
  secondary: {
    main: '#64748b',      // Slate 500
    light: '#94a3b8',     // Slate 400
    lighter: '#cbd5e1',   // Slate 300
    dark: '#475569',      // Slate 600
    darker: '#334155',    // Slate 700
    contrast: '#ffffff',
    alpha10: 'rgba(100, 116, 139, 0.1)',
    alpha20: 'rgba(100, 116, 139, 0.2)',
    alpha50: 'rgba(100, 116, 139, 0.5)',
    alpha80: 'rgba(100, 116, 139, 0.8)'
  },
  tertiary: {
    main: '#f97316',      // Orange 500
    light: '#fb923c',     // Orange 400
    lighter: '#fdba74',   // Orange 300
    dark: '#ea580c',      // Orange 600
    darker: '#c2410c',    // Orange 700
    contrast: '#ffffff',
    alpha10: 'rgba(249, 115, 22, 0.1)',
    alpha20: 'rgba(249, 115, 22, 0.2)',
    alpha50: 'rgba(249, 115, 22, 0.5)',
    alpha80: 'rgba(249, 115, 22, 0.8)'
  },
  surface: {
    main: '#ffffff',
    elevated: '#ffffff',
    interactive: '#ffffff',
    disabled: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1'
  },
  error: {
    main: '#ef4444',      // Red 500
    light: '#f87171',     // Red 400
    lighter: '#fca5a5',   // Red 300
    dark: '#dc2626',      // Red 600
    darker: '#b91c1c',    // Red 700
    contrast: '#ffffff',
    alpha10: 'rgba(239, 68, 68, 0.1)',
    alpha20: 'rgba(239, 68, 68, 0.2)',
    alpha50: 'rgba(239, 68, 68, 0.5)',
    alpha80: 'rgba(239, 68, 68, 0.8)'
  },
  warning: {
    main: '#f59e0b',      // Amber 500
    light: '#fbbf24',     // Amber 400
    lighter: '#fcd34d',   // Amber 300
    dark: '#d97706',      // Amber 600
    darker: '#b45309',    // Amber 700
    contrast: '#000000',
    alpha10: 'rgba(245, 158, 11, 0.1)',
    alpha20: 'rgba(245, 158, 11, 0.2)',
    alpha50: 'rgba(245, 158, 11, 0.5)',
    alpha80: 'rgba(245, 158, 11, 0.8)'
  },
  success: {
    main: '#10b981',      // Emerald 500
    light: '#34d399',     // Emerald 400
    lighter: '#6ee7b7',   // Emerald 300
    dark: '#059669',      // Emerald 600
    darker: '#047857',    // Emerald 700
    contrast: '#ffffff',
    alpha10: 'rgba(16, 185, 129, 0.1)',
    alpha20: 'rgba(16, 185, 129, 0.2)',
    alpha50: 'rgba(16, 185, 129, 0.5)',
    alpha80: 'rgba(16, 185, 129, 0.8)'
  },
  info: {
    main: '#06b6d4',      // Cyan 500
    light: '#22d3ee',     // Cyan 400
    lighter: '#67e8f9',   // Cyan 300
    dark: '#0891b2',      // Cyan 600
    darker: '#0e7490',    // Cyan 700
    contrast: '#ffffff',
    alpha10: 'rgba(6, 182, 212, 0.1)',
    alpha20: 'rgba(6, 182, 212, 0.2)',
    alpha50: 'rgba(6, 182, 212, 0.5)',
    alpha80: 'rgba(6, 182, 212, 0.8)'
  },
  neutral: {
    main: '#6b7280',      // Gray 500
    light: '#9ca3af',     // Gray 400
    lighter: '#d1d5db',   // Gray 300
    dark: '#4b5563',      // Gray 600
    darker: '#374151',    // Gray 700
    contrast: '#ffffff',
    alpha10: 'rgba(107, 114, 128, 0.1)',
    alpha20: 'rgba(107, 114, 128, 0.2)',
    alpha50: 'rgba(107, 114, 128, 0.5)',
    alpha80: 'rgba(107, 114, 128, 0.8)'
  },
  semantic: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    text: {
      primary: '#1e293b',    // Slate 800
      secondary: '#475569',  // Slate 600
      tertiary: '#64748b',   // Slate 500
      inverse: '#ffffff',
      disabled: '#cbd5e1'    // Slate 300
    },
    interactive: {
      hover: 'rgba(0, 0, 0, 0.05)',
      active: 'rgba(0, 0, 0, 0.1)',
      focus: 'rgba(99, 102, 241, 0.2)',
      selected: 'rgba(99, 102, 241, 0.1)'
    },
    status: {
      online: '#10b981',     // Green
      offline: '#6b7280',    // Gray
      busy: '#ef4444',       // Red
      away: '#f59e0b'        // Amber
    }
  }
};

/**
 * Dark color extension following Material Design 3 dark theme guidelines.
 */
export const darkColorExtension: ColorExtension = {
  ...defaultColorExtension,
  surface: {
    main: '#0f172a',        // Slate 900
    elevated: '#1e293b',    // Slate 800
    interactive: '#334155', // Slate 700
    disabled: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.7)',
    border: '#334155',
    borderLight: '#475569',
    borderDark: '#1e293b'
  },
  semantic: {
    background: {
      primary: '#0f172a',    // Slate 900
      secondary: '#1e293b',  // Slate 800
      tertiary: '#334155'    // Slate 700
    },
    text: {
      primary: '#f8fafc',    // Slate 50
      secondary: '#e2e8f0',  // Slate 200
      tertiary: '#cbd5e1',   // Slate 300
      inverse: '#0f172a',    // Slate 900
      disabled: '#475569'    // Slate 600
    },
    interactive: {
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.1)',
      focus: 'rgba(99, 102, 241, 0.3)',
      selected: 'rgba(99, 102, 241, 0.2)'
    },
    status: {
      online: '#10b981',
      offline: '#6b7280',
      busy: '#ef4444',
      away: '#f59e0b'
    }
  }
};

/**
 * Create a custom color extension by merging with default colors.
 * Follows Flutter copyWith pattern for theme customization.
 */
export const createColorExtension = (overrides: Partial<ColorExtension>): ColorExtension => {
  return {
    primary: { ...defaultColorExtension.primary, ...overrides.primary },
    secondary: { ...defaultColorExtension.secondary, ...overrides.secondary },
    tertiary: { ...defaultColorExtension.tertiary, ...overrides.tertiary },
    surface: { ...defaultColorExtension.surface, ...overrides.surface },
    error: { ...defaultColorExtension.error, ...overrides.error },
    warning: { ...defaultColorExtension.warning, ...overrides.warning },
    success: { ...defaultColorExtension.success, ...overrides.success },
    info: { ...defaultColorExtension.info, ...overrides.info },
    neutral: { ...defaultColorExtension.neutral, ...overrides.neutral },
    semantic: {
      background: { ...defaultColorExtension.semantic.background, ...overrides.semantic?.background },
      text: { ...defaultColorExtension.semantic.text, ...overrides.semantic?.text },
      interactive: { ...defaultColorExtension.semantic.interactive, ...overrides.semantic?.interactive },
      status: { ...defaultColorExtension.semantic.status, ...overrides.semantic?.status }
    }
  };
};