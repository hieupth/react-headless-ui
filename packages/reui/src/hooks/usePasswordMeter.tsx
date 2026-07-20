/**
 * PasswordMeter headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages password strength analysis and feedback.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Password strength levels
 */
export type PasswordStrength = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

/**
 * Password criteria interface
 */
export interface PasswordCriteria {
  /** Criteria name */
  name: string;
  /** Whether criteria is met */
  met: boolean;
  /** Criteria description */
  description: string;
  /** Criteria weight in scoring */
  weight: number;
  /** Minimum requirement level, or a boolean required-flag for custom rules */
  requiredLevel?: 'weak' | 'fair' | 'good' | 'strong' | boolean;
}

/**
 * Password analysis result interface
 */
export interface PasswordAnalysis {
  /** Current password */
  password: string;
  /** Overall strength level */
  strength: PasswordStrength;
  /** Strength score (0-100) */
  score: number;
  /** Individual criteria results */
  criteria: PasswordCriteria[];
  /** Estimated crack time */
  estimatedCrackTime: string;
  /** Entropy bits */
  entropy: number;
  /** Suggestion for improvement */
  suggestions: string[];
  /** Is password acceptable */
  isAcceptable: boolean;
  /** Warning messages */
  warnings: string[];
}

/**
 * Password meter state interface
 */
export interface PasswordMeterState {
  /** Current password value */
  password: string;
  /** Password analysis */
  analysis: PasswordAnalysis | null;
  /** Whether meter is disabled */
  disabled: boolean;
  /** Whether password is visible */
  visible: boolean;
  /** Whether analysis is in progress */
  analyzing: boolean;
  /** Last analysis timestamp */
  lastAnalyzed: number | null;
  /** Analysis error */
  error: string | null;
}

/**
 * Password meter actions interface
 */
export interface PasswordMeterActions {
  /** Set password value */
  setPassword: (password: string) => void;
  /** Clear password */
  clear: () => void;
  /** Toggle password visibility */
  toggleVisibility: () => void;
  /** Set password visibility */
  setVisibility: (visible: boolean) => void;
  /** Analyze password manually */
  analyze: (password: string) => PasswordAnalysis;
  /** Get strength percentage */
  getStrengthPercentage: () => number;
  /** Get strength color */
  getStrengthColor: () => string;
  /** Reset meter */
  reset: () => void;
}

/**
 * Password validation rule interface
 */
export interface PasswordValidationRule {
  /** Rule name */
  name: string;
  /** Validation function */
  validate: (password: string) => boolean;
  /** Error message */
  message: string;
  /** Required for acceptance */
  required?: boolean;
  /** Weight in scoring */
  weight?: number;
}

/**
 * Props for usePasswordMeter hook
 */
export interface UsePasswordMeterProps {
  /** Whether meter is disabled */
  disabled?: boolean;
  /** Whether password is visible by default */
  defaultVisible?: boolean;
  /** Minimum password length */
  minLength?: number;
  /** Maximum password length */
  maxLength?: number;
  /** Whether to include common password checking */
  checkCommonPasswords?: boolean;
  /** Whether to calculate entropy */
  calculateEntropy?: boolean;
  /** Whether to estimate crack time */
  estimateCrackTime?: boolean;
  /** Custom validation rules */
  validationRules?: PasswordValidationRule[];
  /** Minimum acceptable strength */
  minStrength?: PasswordStrength;
  /** Analysis debounce time in ms */
  analysisDelay?: number;
  /** Whether to auto-analyze on change */
  autoAnalyze?: boolean;
  /** Callback when password changes */
  onPasswordChange?: (password: string, analysis: PasswordAnalysis | null) => void;
  /** Callback when strength changes */
  onStrengthChange?: (strength: PasswordStrength, score: number) => void;
  /** Callback when password meets minimum requirements */
  onPasswordAcceptable?: (password: string, analysis: PasswordAnalysis) => void;
  /** Callback when password fails requirements */
  onPasswordUnacceptable?: (password: string, analysis: PasswordAnalysis) => void;
  /** Callback when analysis completes */
  onAnalysisComplete?: (analysis: PasswordAnalysis) => void;
  /** Callback when analysis error occurs */
  onAnalysisError?: (error: string) => void;
  /** Ref to the meter container element */
  meterRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for usePasswordMeter hook
 */
export interface UsePasswordMeterReturns {
  /** Current password meter state */
  state: PasswordMeterState;
  /** Password meter actions */
  actions: PasswordMeterActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
    'role': string;
    'tabIndex': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-valuenow': number;
    'aria-valuetext': string;
    'aria-describedby'?: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Common weak passwords list (subset for demo)
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  '123123', 'qwerty123', 'password!', '1234', '111111', '12345',
  'dragon', 'master', 'hello', 'freedom', 'whatever', 'qazwsx'
];

/**
 * PasswordMeter hook implementation
 * @param props - Password meter configuration props
 * @returns Password meter state, actions, and attributes
 */
export function usePasswordMeter(props: UsePasswordMeterProps): UsePasswordMeterReturns {
  const {
    disabled = false,
    defaultVisible = false,
    minLength = 8,
    maxLength = 128,
    checkCommonPasswords = true,
    calculateEntropy = true,
    estimateCrackTime = true,
    validationRules = [],
    minStrength = 'fair',
    analysisDelay = 300,
    autoAnalyze = true,
    onPasswordChange,
    onStrengthChange,
    onPasswordAcceptable,
    onPasswordUnacceptable,
    onAnalysisComplete,
    onAnalysisError,
    meterRef
  } = props;

  // State management
  const [password, setPasswordState] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(defaultVisible);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const meterElementRef = meterRef || internalRef;
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate password entropy
   * @param pwd - Password to analyze
   * @returns Entropy bits
   */
  const calculateEntropyBits = useCallback((pwd: string): number => {
    if (!pwd) return 0;

    let charsetSize = 0;

    // Check character types
    if (/[a-z]/.test(pwd)) charsetSize += 26; // lowercase
    if (/[A-Z]/.test(pwd)) charsetSize += 26; // uppercase
    if (/[0-9]/.test(pwd)) charsetSize += 10; // digits
    if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 32; // special chars (approximate)

    // If no recognized character types, use basic ASCII
    /* c8 ignore start */ // reason: charsetSize is dead here — every non-empty password matches at least one of the lowercase/uppercase/digit/special regexes (the special regex matches any non-alphanumeric), so charsetSize is never 0
    if (charsetSize === 0) charsetSize = 128;
    /* c8 ignore end */

    return Math.floor(pwd.length * Math.log2(charsetSize));
  }, []);

  /**
   * Estimate crack time
   * @param entropy - Password entropy in bits
   * @returns Human-readable crack time estimate
   */
  const estimateCrackTimeFromEntropy = useCallback((entropy: number): string => {
    // Assuming 100 billion guesses per second (modern hardware)
    const guessesPerSecond = 1e11;
    const possibleCombinations = Math.pow(2, entropy);
    const secondsToCrack = possibleCombinations / (2 * guessesPerSecond);

    if (secondsToCrack < 1) return 'instantly';
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 2592000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 2592000)} months`;
    if (secondsToCrack < 3153600000) return `${Math.round(secondsToCrack / 31536000)} years`;
    return 'centuries';
  }, []);

  /**
   * Get strength level from score
   * @param score - Password score (0-100)
   * @returns Strength level
   */
  const getStrengthFromScore = useCallback((score: number): PasswordStrength => {
    if (score < 20) return 'very-weak';
    if (score < 40) return 'weak';
    if (score < 60) return 'fair';
    if (score < 80) return 'good';
    if (score < 95) return 'strong';
    return 'very-strong';
  }, []);

  /**
   * Check default password criteria
   * @param pwd - Password to check
   * @returns Array of criteria results
   */
  const checkDefaultCriteria = useCallback((pwd: string): PasswordCriteria[] => {
    const criteria: PasswordCriteria[] = [
      {
        name: 'length',
        met: pwd.length >= minLength,
        description: `At least ${minLength} characters`,
        weight: 25
      },
      {
        name: 'lowercase',
        met: /[a-z]/.test(pwd),
        description: 'Contains lowercase letters',
        weight: 15
      },
      {
        name: 'uppercase',
        met: /[A-Z]/.test(pwd),
        description: 'Contains uppercase letters',
        weight: 15
      },
      {
        name: 'numbers',
        met: /[0-9]/.test(pwd),
        description: 'Contains numbers',
        weight: 15
      },
      {
        name: 'special',
        met: /[^a-zA-Z0-9]/.test(pwd),
        description: 'Contains special characters',
        weight: 20
      },
      {
        name: 'no-common',
        met: !checkCommonPasswords || !COMMON_PASSWORDS.includes(pwd.toLowerCase()),
        description: 'Not a common password',
        weight: 10
      }
    ];

    return criteria;
  }, [minLength, checkCommonPasswords]);

  /**
   * Analyze password strength
   * @param pwd - Password to analyze
   * @returns Password analysis result
   */
  const analyzePassword = useCallback((pwd: string): PasswordAnalysis => {
    try {
      setAnalyzing(true);
      setError(null);

      // Check default criteria
      const defaultCriteria = checkDefaultCriteria(pwd);

      // Check custom validation rules
      const customCriteria: PasswordCriteria[] = validationRules.map(rule => ({
        name: rule.name,
        met: rule.validate(pwd),
        description: rule.message,
        weight: rule.weight || 10,
        requiredLevel: rule.required
      }));

      const allCriteria = [...defaultCriteria, ...customCriteria];

      // Calculate score
      const totalWeight = allCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      const metWeight = allCriteria.reduce((sum, criterion) => sum + (criterion.met ? criterion.weight : 0), 0);
      /* c8 ignore next */ // reason: totalWeight is always > 0 — the default criteria always carry positive weights, so the zero-total fallback is unreachable
      let score = totalWeight > 0 ? Math.round((metWeight / totalWeight) * 100) : 0;

      // Apply length bonus/penalty
      if (pwd.length > 12) score = Math.min(100, score + 10);
      if (pwd.length < minLength) score = Math.max(0, score - 20);

      // Determine strength
      const strength = getStrengthFromScore(score);

      // Calculate entropy
      const entropy = calculateEntropy ? calculateEntropyBits(pwd) : 0;

      // Estimate crack time
      const estimatedCrackTime = estimateCrackTime ? estimateCrackTimeFromEntropy(entropy) : '';

      // Generate suggestions
      const suggestions: string[] = [];
      if (pwd.length < minLength) suggestions.push(`Use at least ${minLength} characters`);
      if (!/[a-z]/.test(pwd)) suggestions.push('Add lowercase letters');
      if (!/[A-Z]/.test(pwd)) suggestions.push('Add uppercase letters');
      if (!/[0-9]/.test(pwd)) suggestions.push('Add numbers');
      if (!/[^a-zA-Z0-9]/.test(pwd)) suggestions.push('Add special characters');
      if (checkCommonPasswords && COMMON_PASSWORDS.includes(pwd.toLowerCase())) {
        suggestions.push('Choose a less common password');
      }

      // Generate warnings
      const warnings: string[] = [];
      if (pwd.length > 50) warnings.push('Very long passwords may be hard to remember');
      if (checkCommonPasswords && COMMON_PASSWORDS.includes(pwd.toLowerCase())) {
        warnings.push('This is a very common password');
      }
      if (pwd.length === minLength && score < 60) {
        warnings.push('Consider using a longer password');
      }

      // Check if acceptable. Custom rules marked `required: true` are mapped
      // onto the criterion's `requiredLevel` field; any such required criterion
      // that is unmet renders the password unacceptable.
      const isAcceptable = score >= 60 && allCriteria.filter(c => c.requiredLevel).every(c => c.met);

      const analysis: PasswordAnalysis = {
        password: pwd,
        strength,
        score,
        criteria: allCriteria,
        estimatedCrackTime,
        entropy,
        suggestions,
        isAcceptable,
        warnings
      };

      setAnalysis(analysis);
      setLastAnalyzed(Date.now());
      onAnalysisComplete?.(analysis);

      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze password';
      setError(errorMessage);
      onAnalysisError?.(errorMessage);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [
    checkDefaultCriteria,
    validationRules,
    getStrengthFromScore,
    calculateEntropy,
    estimateCrackTime,
    calculateEntropyBits,
    estimateCrackTimeFromEntropy,
    onAnalysisComplete,
    onAnalysisError
  ]);

  /**
   * Set password with auto-analysis
   */
  const setPasswordAction = useCallback((newPassword: string) => {
    if (disabled) return;

    setPasswordState(newPassword);

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (autoAnalyze) {
      if (analysisDelay > 0) {
        analysisTimeoutRef.current = setTimeout(() => {
          try {
            const newAnalysis = analyzePassword(newPassword);
            onPasswordChange?.(newPassword, newAnalysis);
          } catch (err) {
            // Error already handled in analyzePassword
          }
        }, analysisDelay);
      } else {
        try {
          const newAnalysis = analyzePassword(newPassword);
          onPasswordChange?.(newPassword, newAnalysis);
        } catch (err) {
          // Error already handled in analyzePassword
        }
      }
    } else {
      onPasswordChange?.(newPassword, null);
    }
  }, [disabled, autoAnalyze, analysisDelay, analyzePassword, onPasswordChange]);

  /**
   * Clear password
   */
  const clear = useCallback(() => {
    if (disabled) return;
    setPasswordAction('');
    setAnalysis(null);
    setError(null);
    setLastAnalyzed(null);
  }, [disabled, setPasswordAction]);

  /**
   * Toggle password visibility
   */
  const toggleVisibility = useCallback(() => {
    if (disabled) return;
    setVisible(prev => !prev);
  }, [disabled]);

  /**
   * Set password visibility
   */
  const setVisibilityAction = useCallback((newVisible: boolean) => {
    if (disabled) return;
    setVisible(newVisible);
  }, [disabled]);

  /**
   * Get strength percentage
   */
  const getStrengthPercentage = useCallback((): number => {
    return analysis?.score || 0;
  }, [analysis]);

  /**
   * Get strength color
   */
  const getStrengthColor = useCallback((): string => {
    if (!analysis) return '#e5e7eb';

    switch (analysis.strength) {
      case 'very-weak': return '#ef4444';
      case 'weak': return '#f97316';
      case 'fair': return '#eab308';
      case 'good': return '#84cc16';
      case 'strong': return '#22c55e';
      case 'very-strong': return '#10b981';
      default: return '#e5e7eb';
    }
  }, [analysis]);

  /**
   * Reset meter
   */
  const reset = useCallback(() => {
    setPasswordState('');
    setAnalysis(null);
    setVisible(defaultVisible);
    setError(null);
    setLastAnalyzed(null);
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
  }, [defaultVisible]);

  // Handle strength changes
  useEffect(() => {
    if (analysis) {
      onStrengthChange?.(analysis.strength, analysis.score);

      if (analysis.isAcceptable) {
        onPasswordAcceptable?.(password, analysis);
      } else {
        onPasswordUnacceptable?.(password, analysis);
      }
    }
  }, [analysis, password, onStrengthChange, onPasswordAcceptable, onPasswordUnacceptable]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  // Build state
  const state: PasswordMeterState = {
    password,
    analysis,
    disabled,
    visible,
    analyzing,
    lastAnalyzed,
    error
  };

  // Build actions
  const actions: PasswordMeterActions = {
    setPassword: setPasswordAction,
    clear,
    toggleVisibility,
    setVisibility: setVisibilityAction,
    analyze: analyzePassword,
    getStrengthPercentage,
    getStrengthColor,
    reset
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: meterElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: meterElementRef
  });

  const semantic = useSemanticMixin({
    role: 'progressbar',
    ariaLabel: 'Password strength meter',
    ref: meterElementRef
  });

  // Build attributes
  const percentage = getStrengthPercentage();
  const attributes = {
    'aria-label': semantic.ariaLabel,
    'role': semantic.role,
    'tabIndex': disabled ? -1 : 0,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': percentage,
    'aria-valuetext': `${percentage}% ${analysis?.strength || 'no password'}`,
    ...(error && { 'aria-describedby': 'password-meter-error' })
  };

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}