/**
 * DirectionProvider headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages text direction (LTR/RTL) and layout direction for internationalization.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Text direction type
 */
export type TextDirection = 'ltr' | 'rtl' | 'auto';

/**
 * Layout direction type
 */
export type LayoutDirection = 'ltr' | 'rtl';

/**
 * Direction state interface
 */
export interface DirectionProviderState {
  /** Current text direction */
  textDirection: TextDirection;
  /** Current layout direction */
  layoutDirection: LayoutDirection;
  /** Whether direction is currently RTL */
  isRTL: boolean;
  /** Whether direction is currently LTR */
  isLTR: boolean;
  /** Whether direction is auto-detected */
  isAuto: boolean;
  /** Current locale */
  locale: string;
  /** Whether direction is currently changing */
  changing: boolean;
  /** Detected direction for auto mode */
  detectedDirection: LayoutDirection;
}

/**
 * DirectionProvider actions interface
 */
export interface DirectionProviderActions {
  /** Set text direction */
  setTextDirection: (direction: TextDirection) => void;
  /** Set layout direction */
  setLayoutDirection: (direction: LayoutDirection) => void;
  /** Toggle between LTR and RTL */
  toggle: () => void;
  /** Auto-detect direction from text */
  autoDetect: (text: string) => void;
  /** Set locale */
  setLocale: (locale: string) => void;
  /** Get direction for CSS */
  getDirection: () => LayoutDirection;
  /** Get text align value */
  getTextAlign: () => 'left' | 'right' | 'start' | 'end';
  /** Get flex direction */
  getFlexDirection: () => string;
  /** Get margin start */
  getMarginStart: (value: string) => string;
  /** Get margin end */
  getMarginEnd: (value: string) => string;
  /** Get padding start */
  getPaddingStart: (value: string) => string;
  /** Get padding end */
  getPaddingEnd: (value: string) => string;
  /** Get border start */
  getBorderStart: (value: string) => string;
  /** Get border end */
  getBorderEnd: (value: string) => string;
  /** Get text align value based on direction */
  getAlignForDirection: (ltrValue: string, rtlValue: string) => string;
  /** Get transform for mirroring */
  getMirrorTransform: () => string;
}

/**
 * Props for useDirectionProvider hook
 */
export interface UseDirectionProviderProps {
  /** Initial text direction */
  defaultTextDirection?: TextDirection;
  /** Controlled text direction */
  textDirection?: TextDirection;
  /** Initial layout direction */
  defaultLayoutDirection?: LayoutDirection;
  /** Controlled layout direction */
  layoutDirection?: LayoutDirection;
  /** Initial locale */
  defaultLocale?: string;
  /** Controlled locale */
  locale?: string;
  /** Whether to auto-detect direction from locale */
  autoDetectFromLocale?: boolean;
  /** Whether to sync text and layout direction */
  syncDirections?: boolean;
  /** Direction change handler */
  onDirectionChange?: (textDirection: TextDirection, layoutDirection: LayoutDirection) => void;
  /** Locale change handler */
  onLocaleChange?: (locale: string, detectedDirection: LayoutDirection) => void;
  /** RTL locales list */
  rtlLocales?: string[];
  /** Custom direction detection function */
  customDetector?: (text: string, locale: string) => LayoutDirection;
  /** Whether to update HTML dir attribute */
  updateHTMLDir?: boolean;
  /** Whether to update HTML lang attribute */
  updateHTMLLang?: boolean;
}

/**
 * Return type for useDirectionProvider hook
 */
export interface UseDirectionProviderReturns {
  /** Current direction provider state */
  state: DirectionProviderState;
  /** Direction provider actions */
  actions: DirectionProviderActions;
  /** CSS properties for direction */
  cssProperties: {
    direction: LayoutDirection;
    textAlign?: 'left' | 'right' | 'start' | 'end';
  };
  /** ARIA attributes */
  ariaAttributes: {
    'dir'?: LayoutDirection;
    'lang'?: string;
  };
}

/**
 * Default RTL locales
 */
const DEFAULT_RTL_LOCALES = [
  'ar', 'he', 'fa', 'ur', 'ps', 'ku', 'sd',
  'yi', 'dv', 'ckb', 'az-Arab', 'zh-Hant',
  'ja', 'ko', 'th', 'vi', 'bn', 'ta', 'te',
  'ml', 'gu', 'kn', 'or', 'pa', 'as', 'mr'
];

/**
 * Detect direction from text content
 */
const detectDirectionFromText = (text: string): LayoutDirection => {
  // Remove whitespace and check for RTL characters
  const cleanText = text.trim();
  if (!cleanText) return 'ltr';

  // Check for RTL characters (Unicode ranges)
  const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hasRTLChars = rtlChars.test(cleanText);

  // Check for LTR characters (Latin, Cyrillic, etc.)
  const ltrChars = /[A-Za-z\u0400-\u04FF\u0370-\u03FF]/;
  const hasLTRChars = ltrChars.test(cleanText);

  if (hasRTLChars && !hasLTRChars) return 'rtl';
  if (hasLTRChars && !hasRTLChars) return 'ltr';

  // If mixed or no strong characters, check first strong character
  const firstStrongChar = cleanText.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFA-Za-z\u0400-\u04FF\u0370-\u03FF]/);
  if (firstStrongChar) {
    return rtlChars.test(firstStrongChar[0]) ? 'rtl' : 'ltr';
  }

  return 'ltr';
};

/**
 * Detect direction from locale
 */
const detectDirectionFromLocale = (locale: string, rtlLocales: string[]): LayoutDirection => {
  const langCode = locale.split('-')[0].toLowerCase();
  return rtlLocales.includes(langCode) ? 'rtl' : 'ltr';
};

/**
 * DirectionProvider hook implementation
 * @param props - DirectionProvider configuration props
 * @returns DirectionProvider state, actions, and utilities
 */
export function useDirectionProvider(props: UseDirectionProviderProps): UseDirectionProviderReturns {
  const {
    defaultTextDirection = 'ltr',
    textDirection: controlledTextDirection,
    defaultLayoutDirection = 'ltr',
    layoutDirection: controlledLayoutDirection,
    defaultLocale = 'en',
    locale: controlledLocale,
    autoDetectFromLocale = true,
    syncDirections = true,
    onDirectionChange,
    onLocaleChange,
    rtlLocales = DEFAULT_RTL_LOCALES,
    customDetector,
    updateHTMLDir = true,
    updateHTMLLang = true
  } = props;

  // State management
  const [textDirection, setTextDirectionState] = useState<TextDirection>(defaultTextDirection);
  const [layoutDirection, setLayoutDirectionState] = useState<LayoutDirection>(defaultLayoutDirection);
  const [locale, setLocaleState] = useState<string>(defaultLocale);
  const [changing, setChanging] = useState<boolean>(false);
  const [detectedDirection, setDetectedDirection] = useState<LayoutDirection>('ltr');

  // Refs
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if components are controlled
  const isTextDirectionControlled = controlledTextDirection !== undefined;
  const isLayoutDirectionControlled = controlledLayoutDirection !== undefined;
  const isLocaleControlled = controlledLocale !== undefined;

  const currentTextDirection = isTextDirectionControlled ? controlledTextDirection : textDirection;
  const currentLayoutDirection = isLayoutDirectionControlled ? controlledLayoutDirection : layoutDirection;
  const currentLocale = isLocaleControlled ? controlledLocale : locale;

  // Determine actual layout direction based on text direction
  const actualLayoutDirection = currentTextDirection === 'auto'
    ? detectedDirection
    : currentTextDirection as LayoutDirection;

  const isRTL = actualLayoutDirection === 'rtl';
  const isLTR = actualLayoutDirection === 'ltr';
  const isAuto = currentTextDirection === 'auto';

  /**
   * Set text direction
   */
  const setTextDirectionAction = useCallback((newDirection: TextDirection) => {
    if (!isTextDirectionControlled) {
      setTextDirectionState(newDirection);
    }

    if (newDirection !== 'auto') {
      setDetectedDirection(newDirection as LayoutDirection);
    }

    // Update layout direction if sync is enabled
    if (syncDirections && newDirection !== 'auto' && !isLayoutDirectionControlled) {
      setLayoutDirectionState(newDirection as LayoutDirection);
    }

    onDirectionChange?.(newDirection, actualLayoutDirection);
  }, [isTextDirectionControlled, isLayoutDirectionControlled, syncDirections, actualLayoutDirection, onDirectionChange]);

  /**
   * Set layout direction
   */
  const setLayoutDirectionAction = useCallback((newDirection: LayoutDirection) => {
    if (!isLayoutDirectionControlled) {
      setLayoutDirectionState(newDirection);
    }

    onDirectionChange?.(currentTextDirection, newDirection);
  }, [isLayoutDirectionControlled, currentTextDirection, onDirectionChange]);

  /**
   * Toggle between LTR and RTL
   */
  const toggleAction = useCallback(() => {
    const newDirection = actualLayoutDirection === 'rtl' ? 'ltr' : 'rtl';
    setTextDirectionAction(newDirection);
  }, [actualLayoutDirection, setTextDirectionAction]);

  /**
   * Auto-detect direction from text
   */
  const autoDetectAction = useCallback((text: string) => {
    let detected: LayoutDirection;

    if (customDetector) {
      detected = customDetector(text, currentLocale);
    } else {
      detected = detectDirectionFromText(text);
    }

    setDetectedDirection(detected);

    if (currentTextDirection === 'auto' && syncDirections && !isLayoutDirectionControlled) {
      setLayoutDirectionState(detected);
    }
  }, [customDetector, currentLocale, currentTextDirection, syncDirections, isLayoutDirectionControlled]);

  /**
   * Set locale
   */
  const setLocaleAction = useCallback((newLocale: string) => {
    if (!isLocaleControlled) {
      setLocaleState(newLocale);
    }

    if (autoDetectFromLocale) {
      const detected = detectDirectionFromLocale(newLocale, rtlLocales);
      setDetectedDirection(detected);

      if (currentTextDirection === 'auto' && syncDirections && !isLayoutDirectionControlled) {
        setLayoutDirectionState(detected);
      }
    }

    onLocaleChange?.(newLocale, detectedDirection);
  }, [isLocaleControlled, autoDetectFromLocale, rtlLocales, currentTextDirection, syncDirections, isLayoutDirectionControlled, detectedDirection, onLocaleChange]);

  /**
   * Get direction for CSS
   */
  const getDirectionAction = useCallback((): LayoutDirection => {
    return actualLayoutDirection;
  }, [actualLayoutDirection]);

  /**
   * Get text align value
   */
  const getTextAlignAction = useCallback((): 'left' | 'right' | 'start' | 'end' => {
    return isRTL ? 'right' : 'left';
  }, [isRTL]);

  /**
   * Get flex direction
   */
  const getFlexDirectionAction = useCallback((): string => {
    return isRTL ? 'row-reverse' : 'row';
  }, [isRTL]);

  /**
   * Get margin start
   */
  const getMarginStartAction = useCallback((value: string): string => {
    return isRTL ? `margin-right: ${value}` : `margin-left: ${value}`;
  }, [isRTL]);

  /**
   * Get margin end
   */
  const getMarginEndAction = useCallback((value: string): string => {
    return isRTL ? `margin-left: ${value}` : `margin-right: ${value}`;
  }, [isRTL]);

  /**
   * Get padding start
   */
  const getPaddingStartAction = useCallback((value: string): string => {
    return isRTL ? `padding-right: ${value}` : `padding-left: ${value}`;
  }, [isRTL]);

  /**
   * Get padding end
   */
  const getPaddingEndAction = useCallback((value: string): string => {
    return isRTL ? `padding-left: ${value}` : `padding-right: ${value}`;
  }, [isRTL]);

  /**
   * Get border start
   */
  const getBorderStartAction = useCallback((value: string): string => {
    return isRTL ? `border-right: ${value}` : `border-left: ${value}`;
  }, [isRTL]);

  /**
   * Get border end
   */
  const getBorderEndAction = useCallback((value: string): string => {
    return isRTL ? `border-left: ${value}` : `border-right: ${value}`;
  }, [isRTL]);

  /**
   * Get align for direction
   */
  const getAlignForDirectionAction = useCallback((ltrValue: string, rtlValue: string): string => {
    return isRTL ? rtlValue : ltrValue;
  }, [isRTL]);

  /**
   * Get transform for mirroring
   */
  const getMirrorTransformAction = useCallback((): string => {
    return isRTL ? 'scaleX(-1)' : 'scaleX(1)';
  }, [isRTL]);

  // Handle direction changes with animation state
  useEffect(() => {
    setChanging(true);

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    changeTimeoutRef.current = setTimeout(() => {
      setChanging(false);
    }, 100);

    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [actualLayoutDirection]);

  // Update HTML attributes
  useEffect(() => {
    if (updateHTMLDir && typeof document !== 'undefined') {
      document.documentElement.dir = actualLayoutDirection;
    }
  }, [actualLayoutDirection, updateHTMLDir]);

  useEffect(() => {
    if (updateHTMLLang && typeof document !== 'undefined') {
      document.documentElement.lang = currentLocale;
    }
  }, [currentLocale, updateHTMLLang]);

  // Auto-detect from locale on mount
  useEffect(() => {
    if (autoDetectFromLocale && currentTextDirection === 'auto') {
      const detected = detectDirectionFromLocale(currentLocale, rtlLocales);
      setDetectedDirection(detected);

      if (syncDirections && !isLayoutDirectionControlled) {
        setLayoutDirectionState(detected);
      }
    }
  }, []);

  // Build state
  const state: DirectionProviderState = {
    textDirection: currentTextDirection,
    layoutDirection: currentLayoutDirection,
    isRTL,
    isLTR,
    isAuto,
    locale: currentLocale,
    changing,
    detectedDirection
  };

  // Build actions
  const actions: DirectionProviderActions = {
    setTextDirection: setTextDirectionAction,
    setLayoutDirection: setLayoutDirectionAction,
    toggle: toggleAction,
    autoDetect: autoDetectAction,
    setLocale: setLocaleAction,
    getDirection: getDirectionAction,
    getTextAlign: getTextAlignAction,
    getFlexDirection: getFlexDirectionAction,
    getMarginStart: getMarginStartAction,
    getMarginEnd: getMarginEndAction,
    getPaddingStart: getPaddingStartAction,
    getPaddingEnd: getPaddingEndAction,
    getBorderStart: getBorderStartAction,
    getBorderEnd: getBorderEndAction,
    getAlignForDirection: getAlignForDirectionAction,
    getMirrorTransform: getMirrorTransformAction
  };

  // Build CSS properties
  const cssProperties = {
    direction: actualLayoutDirection,
    textAlign: getTextAlignAction()
  };

  // Build ARIA attributes
  const ariaAttributes = {
    'dir': actualLayoutDirection,
    'lang': currentLocale
  };

  return {
    state,
    actions,
    cssProperties,
    ariaAttributes
  };
}