/**
 * Typography theme extension following Flutter TextTheme patterns.
 * Provides comprehensive typography system with font scales and styles.
 */

export interface TypographyExtension {
  /** Font family hierarchy */
  fontFamily: FontFamily;
  /** Font size scale */
  fontSize: FontSizes;
  /** Font weight scale */
  fontWeight: FontWeights;
  /** Line height scale */
  lineHeight: LineHeights;
  /** Letter spacing scale */
  letterSpacing: LetterSpacings;
  /** Text styles for different UI elements */
  styles: TextStyleMap;
}

export interface FontFamily {
  /** Primary font family for body text */
  sans: string[];
  /** Secondary font family for headings */
  serif: string[];
  /** Monospace font family for code */
  mono: string[];
  /** Display font family for large headings */
  display: string[];
}

export interface FontSizes {
  /** Font size scale using modular scale (1.200) */
  xs: string;    // 0.75rem
  sm: string;    // 0.875rem
  base: string;  // 1rem
  lg: string;    // 1.125rem
  xl: string;    // 1.25rem
  '2xl': string; // 1.5rem
  '3xl': string; // 1.875rem
  '4xl': string; // 2.25rem
  '5xl': string; // 3rem
  '6xl': string; // 3.75rem
  '7xl': string; // 4.5rem
  '8xl': string; // 6rem
  '9xl': string; // 8rem
}

export interface FontWeights {
  /** Hairline weight (100) */
  hairline: number;
  /** Thin weight (200) */
  thin: number;
  /** Light weight (300) */
  light: number;
  /** Regular weight (400) */
  regular: number;
  /** Medium weight (500) */
  medium: number;
  /** Semibold weight (600) */
  semibold: number;
  /** Bold weight (700) */
  bold: number;
  /** Extrabold weight (800) */
  extrabold: number;
  /** Black weight (900) */
  black: number;
}

export interface LineHeights {
  /** Tight line height (1.25) */
  tight: number;
  /** Snug line height (1.375) */
  snug: number;
  /** Normal line height (1.5) */
  normal: number;
  /** Relaxed line height (1.625) */
  relaxed: number;
  /** Loose line height (2) */
  loose: number;
  /** None (unitless) */
  none: number;
}

export interface LetterSpacings {
  /** Tightest letter spacing (-0.05em) */
  tightest: string;
  /** Tighter letter spacing (-0.025em) */
  tighter: string;
  /** Tight letter spacing (-0.015em) */
  tight: string;
  /** Normal letter spacing (0) */
  normal: string;
  /** Wide letter spacing (0.025em) */
  wide: string;
  /** Wider letter spacing (0.05em) */
  wider: string;
  /** Widest letter spacing (0.1em) */
  widest: string;
}

export interface TextStyle {
  /** Font family */
  fontFamily?: string;
  /** Font size */
  fontSize: string;
  /** Font weight */
  fontWeight: number;
  /** Line height */
  lineHeight: number;
  /** Letter spacing */
  letterSpacing?: string;
  /** Text decoration */
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  /** Text transform */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Font style */
  fontStyle?: 'normal' | 'italic' | 'oblique';
}

export interface TextStyleMap {
  /** Display text styles */
  display: TextStyle;
  /** Heading text styles */
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  /** Body text styles */
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  /** Label text styles */
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  labelSmall: TextStyle;
  /** Caption text styles */
  caption: TextStyle;
  overline: TextStyle;
  /** Code text styles */
  code: TextStyle;
  /** Button text styles */
  button: TextStyle;
  /** Link text styles */
  link: TextStyle;
}

/**
 * Default typography extension following Material Design 3 guidelines.
 * Provides comprehensive typography system for all UI components.
 */
export const defaultTypographyExtension: TypographyExtension = {
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif'
    ],
    serif: [
      'Georgia',
      'Cambria',
      'Times New Roman',
      'Times',
      'serif'
    ],
    mono: [
      'Fira Code',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Menlo',
      'Courier New',
      'monospace'
    ],
    display: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ]
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem'     // 128px
  },
  fontWeight: {
    hairline: 100,
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
    none: 1
  },
  letterSpacing: {
    tightest: '-0.05em',
    tighter: '-0.025em',
    tight: '-0.015em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },
  styles: {
    display: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '4rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.025em'
    },
    h1: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em'
    },
    h2: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em'
    },
    h3: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em'
    },
    h4: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em'
    },
    h5: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0'
    },
    h6: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0'
    },
    bodyLarge: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0'
    },
    bodyMedium: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0'
    },
    bodySmall: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0'
    },
    labelLarge: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: '0.015em'
    },
    labelMedium: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: '0.015em'
    },
    labelSmall: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.6875rem',
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: '0.025em'
    },
    caption: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: '0'
    },
    overline: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    },
    code: {
      fontFamily: 'Fira Code, monospace',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0'
    },
    button: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: '0.015em'
    },
    link: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0'
    }
  }
};

/**
 * Create a custom typography extension by merging with default styles.
 * Follows Flutter copyWith pattern for theme customization.
 */
export const createTypographyExtension = (overrides: Partial<TypographyExtension>): TypographyExtension => {
  return {
    fontFamily: { ...defaultTypographyExtension.fontFamily, ...overrides.fontFamily },
    fontSize: { ...defaultTypographyExtension.fontSize, ...overrides.fontSize },
    fontWeight: { ...defaultTypographyExtension.fontWeight, ...overrides.fontWeight },
    lineHeight: { ...defaultTypographyExtension.lineHeight, ...overrides.lineHeight },
    letterSpacing: { ...defaultTypographyExtension.letterSpacing, ...overrides.letterSpacing },
    styles: {
      display: { ...defaultTypographyExtension.styles.display, ...overrides.styles?.display },
      h1: { ...defaultTypographyExtension.styles.h1, ...overrides.styles?.h1 },
      h2: { ...defaultTypographyExtension.styles.h2, ...overrides.styles?.h2 },
      h3: { ...defaultTypographyExtension.styles.h3, ...overrides.styles?.h3 },
      h4: { ...defaultTypographyExtension.styles.h4, ...overrides.styles?.h4 },
      h5: { ...defaultTypographyExtension.styles.h5, ...overrides.styles?.h5 },
      h6: { ...defaultTypographyExtension.styles.h6, ...overrides.styles?.h6 },
      bodyLarge: { ...defaultTypographyExtension.styles.bodyLarge, ...overrides.styles?.bodyLarge },
      bodyMedium: { ...defaultTypographyExtension.styles.bodyMedium, ...overrides.styles?.bodyMedium },
      bodySmall: { ...defaultTypographyExtension.styles.bodySmall, ...overrides.styles?.bodySmall },
      labelLarge: { ...defaultTypographyExtension.styles.labelLarge, ...overrides.styles?.labelLarge },
      labelMedium: { ...defaultTypographyExtension.styles.labelMedium, ...overrides.styles?.labelMedium },
      labelSmall: { ...defaultTypographyExtension.styles.labelSmall, ...overrides.styles?.labelSmall },
      caption: { ...defaultTypographyExtension.styles.caption, ...overrides.styles?.caption },
      overline: { ...defaultTypographyExtension.styles.overline, ...overrides.styles?.overline },
      code: { ...defaultTypographyExtension.styles.code, ...overrides.styles?.code },
      button: { ...defaultTypographyExtension.styles.button, ...overrides.styles?.button },
      link: { ...defaultTypographyExtension.styles.link, ...overrides.styles?.link }
    }
  };
};