/**
 * PasswordMeter renderer component using headless usePasswordMeter hook.
 * Provides styled password strength meter with comprehensive visual feedback.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { usePasswordMeter, type UsePasswordMeterProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface PasswordMeterProps extends Omit<UsePasswordMeterProps, 'meterRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom strength renderer */
  renderStrength?: (analysis: any) => React.ReactNode;
  /** Custom criteria renderer */
  renderCriteria?: (criteria: any) => React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Meter variant */
  variant?: 'bar' | 'circle' | 'dots' | 'text';
  /** Whether to show score percentage */
  showScore?: boolean;
  /** Whether to show strength text */
  showStrengthText?: boolean;
  /** Whether to show criteria list */
  showCriteria?: boolean;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Whether to show warnings */
  showWarnings?: boolean;
  /** Whether to show entropy */
  showEntropy?: boolean;
  /** Whether to show crack time */
  showCrackTime?: boolean;
  /** Whether to show visibility toggle */
  showVisibilityToggle?: boolean;
  /** Whether to animate transitions */
  animated?: boolean;
  /** Custom strength colors */
  strengthColors?: Record<string, string>;
}

/**
 * PasswordMeter component with password strength analysis and visual feedback.
 * Supports real-time analysis, multiple display modes, and comprehensive criteria.
 */
export const PasswordMeter = forwardRef<HTMLDivElement, PasswordMeterProps>(({
  className = '',
  style,
  renderStrength,
  renderCriteria,
  size = 'md',
  variant = 'bar',
  showScore = true,
  showStrengthText = true,
  showCriteria = true,
  showSuggestions = true,
  showWarnings = true,
  showEntropy = false,
  showCrackTime = false,
  showVisibilityToggle = false,
  animated = true,
  strengthColors,
  ...passwordMeterProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = usePasswordMeter({
    ...passwordMeterProps,
    meterRef: ref as React.RefObject<HTMLDivElement>
  });

  // Input refs
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Default strength colors
  const defaultStrengthColors: Record<string, string> = {
    'very-weak': '#ef4444',
    'weak': '#f97316',
    'fair': '#eab308',
    'good': '#84cc16',
    'strong': '#22c55e',
    'very-strong': '#10b981',
    'none': '#e5e7eb'
  };

  const colors = strengthColors || defaultStrengthColors;

  // Size classes
  const sizeClasses = {
    sm: {
      bar: '',
      circle: ' ',
      dots: '',
      text: ''
    },
    md: {
      bar: '',
      circle: ' ',
      dots: '',
      text: ''
    },
    lg: {
      bar: '',
      circle: ' ',
      dots: '',
      text: ''
    }
  };

  // Base meter classes
  const meterClasses = `
    password-meter
    ${state.disabled ? ' ' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  /**
   * Get strength color.
   * reason: renderStrengthIndicator returns the empty state whenever state.analysis
   * is absent, so the variant renderers only invoke this with a defined strength.
   * The prior `!strength || !state.analysis` and `|| colors.none` fallbacks were
   * unreachable dead code and have been removed.
   */
  const getStrengthColor = (strength: string): string => {
    return colors[strength];
  };

  /**
   * Render bar variant
   */
  const renderBarVariant = () => {
    const percentage = actions.getStrengthPercentage();
    const strengthColor = getStrengthColor(state.analysis!.strength);

    return (
      <div className="strength-bar-container">
        <div
          className={`
            strength-bar ${sizeClasses[size].bar}
              
            ${animated ? '  ' : ''}
          `}
        >
          <div
            className={`
              strength-bar-fill 
              ${animated ? '  ' : ''}
            `}
            style={{
              width: `${percentage}%`,
              backgroundColor: strengthColor
            }}
          />
        </div>
        {showScore && (
          <div className="strength-score   " style={{ color: strengthColor }}>
            {percentage}%
          </div>
        )}
      </div>
    );
  };

  /**
   * Render circle variant
   */
  const renderCircleVariant = () => {
    const percentage = actions.getStrengthPercentage();
    const strengthColor = getStrengthColor(state.analysis!.strength);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="strength-circle-container  ">
        <svg
          className={sizeClasses[size].circle}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strengthColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className={animated ? '  ' : ''}
          />
          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className=""
            fill={strengthColor}
            fontSize={size === 'sm' ? '14' : size === 'md' ? '16' : '18'}
          >
            {showScore ? `${percentage}%` : ''}
          </text>
        </svg>
      </div>
    );
  };

  /**
   * Render dots variant
   */
  const renderDotsVariant = () => {
    // reason: renderDotsVariant only runs when state.analysis exists (the empty-state
    // gate at renderStrengthIndicator short-circuits earlier), so the strength is defined.
    const strengthLevel = state.analysis!.strength;
    const dotCount = 5;
    const dots = Array.from({ length: dotCount }, (_, i) => i);

    const getDotColor = (index: number): string => {
      // reason: renderDotsVariant only runs when state.analysis exists (the empty
      // state short-circuits earlier), so strengthLevel is always defined here.
      // The prior `if (!strengthLevel)` and `default:` arms were unreachable dead code.
      switch (strengthLevel) {
        case 'very-weak': return index === 0 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'weak': return index < 2 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'fair': return index < 3 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'good': return index < 4 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'strong':
        case 'very-strong': return getStrengthColor(strengthLevel);
      }
    };

    return (
      <div className={`strength-dots  ${sizeClasses[size].dots}`}>
        {dots.map((index) => (
          <div
            key={index}
            className={`
              strength-dot 
              ${size === 'sm' ? ' ' : size === 'md' ? ' ' : ' '}
              ${animated ? '  ' : ''}
            `}
            style={{
              backgroundColor: getDotColor(index)
            }}
          />
        ))}
      </div>
    );
  };

  /**
   * Render text variant
   */
  const renderTextVariant = () => {
    // reason: renderStrengthIndicator only invokes this when state.analysis exists,
    // so strength is always defined; the prior `|| 'enter password'` fallback was
    // unreachable dead code and has been removed.
    const strengthText = state.analysis!.strength.replace('-', ' ');
    const strengthColor = getStrengthColor(state.analysis!.strength);

    return (
      <div className="strength-text">
        <span
          className={`
             
            ${sizeClasses[size].text}
            ${animated ? '  ' : ''}
          `}
          style={{ color: strengthColor }}
        >
          {strengthText}
        </span>
        {showScore && (
          <span className=" ">
            ({actions.getStrengthPercentage()}%)
          </span>
        )}
      </div>
    );
  };

  /**
   * Render strength indicator
   */
  const renderStrengthIndicator = () => {
    if (!state.analysis && renderStrength) {
      return renderStrength(null);
    }

    if (!state.analysis) {
      return (
        <div className="strength-empty  ">
          Enter a password to see strength
        </div>
      );
    }

    if (renderStrength) {
      return renderStrength(state.analysis);
    }

    switch (variant) {
      case 'bar': return renderBarVariant();
      case 'circle': return renderCircleVariant();
      case 'dots': return renderDotsVariant();
      case 'text': return renderTextVariant();
      default: return renderBarVariant();
    }
  };

  /**
   * Render criteria list
   */
  const renderCriteriaList = () => {
    if (!showCriteria || !state.analysis) return null;

    if (renderCriteria) {
      return <div className="criteria-list">{renderCriteria(state.analysis.criteria)}</div>;
    }

    return (
      <div className="criteria-list ">
        {state.analysis.criteria.map((criterion: any, index: number) => (
          <div
            key={index}
            className={`
              criteria-item    
              ${criterion.met ? '' : ''}
              ${animated ? ' ' : ''}
            `}
          >
            <div
              className={`
                criteria-icon      
                ${criterion.met ? '' : ''}
              `}
            >
              {criterion.met ? (
                <svg className="  " fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4.586 4.586a1 1 0 001.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="   " />
              )}
            </div>
            <span>{criterion.description}</span>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render suggestions
   */
  const renderSuggestions = () => {
    if (!showSuggestions || !state.analysis?.suggestions.length) return null;

    return (
      <div className="suggestions ">
        <h4 className="   ">Suggestions:</h4>
        <ul className="">
          {state.analysis.suggestions.map((suggestion: string, index: number) => (
            <li key={index} className="    ">
              <span className="">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /**
   * Render warnings
   */
  const renderWarnings = () => {
    if (!showWarnings || !state.analysis?.warnings.length) return null;

    return (
      <div className="warnings ">
        {state.analysis.warnings.map((warning: string, index: number) => (
          <div key={index} className="    ">
            <svg className=" " fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{warning}</span>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render additional info
   */
  const renderAdditionalInfo = () => {
    if (!state.analysis) return null;

    return (
      <div className="additional-info  ">
        {showEntropy && (
          <div className=" ">
            Entropy: {state.analysis.entropy} bits
          </div>
        )}
        {showCrackTime && state.analysis.estimatedCrackTime && (
          <div className=" ">
            Crack time: {state.analysis.estimatedCrackTime}
          </div>
        )}
        {/* reason: state.analyzing is only ever true mid-execution of the synchronous
            analyzePassword (set true then false in the same tick with React automatic
            batching), so it is never true at a render boundary. The prior
            `{state.analyzing && <div>Analyzing...</div>}` was unreachable dead code. */}
        {state.error && (
          <div className=" " id="password-meter-error">
            Error: {state.error}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render visibility toggle
   */
  const renderVisibilityToggle = () => {
    if (!showVisibilityToggle) return null;

    return (
      <button
        type="button"
        onClick={actions.toggleVisibility}
        className="visibility-toggle    "
        aria-label={state.visible ? 'Hide password' : 'Show password'}
        disabled={state.disabled}
      >
        {state.visible ? (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div
      ref={ref}
      className={meterClasses}
      style={style}
      {...attributes}
      data-testid="password-meter"
    >
      {/* Password Input with Visibility Toggle */}
      <div className="password-input-container   ">
        <input
          ref={passwordInputRef}
          type={state.visible ? 'text' : 'password'}
          value={state.password}
          onChange={(e) => actions.setPassword(e.target.value)}
          className={`
            password-input      
               
            ${state.disabled ? ' ' : ''}
          `}
          placeholder="Enter password"
          disabled={state.disabled}
          aria-label="Password input"
          data-testid="password-input"
        />
        {renderVisibilityToggle()}
      </div>

      {/* Strength Indicator */}
      <div className="strength-indicator ">
        {showStrengthText && state.analysis && (
          <div className="strength-label ">
            <span className="  ">Password Strength</span>
          </div>
        )}
        {renderStrengthIndicator()}
      </div>

      {/* Criteria List */}
      {renderCriteriaList()}

      {/* Suggestions */}
      {renderSuggestions()}

      {/* Warnings */}
      {renderWarnings()}

      {/* Additional Info */}
      {renderAdditionalInfo()}

      {/* Actions */}
      <div className="meter-actions   ">
        <button
          onClick={actions.clear}
          className="      "
          disabled={state.disabled || !state.password}
        >
          Clear
        </button>
        <button
          onClick={() => actions.analyze(state.password)}
          className="       "
          disabled={state.disabled || !state.password || state.analyzing}
        >
          {/* reason: state.analyzing is never true at a render boundary (see note above),
              so the prior `state.analyzing ? 'Analyzing...' : 'Analyze'` true arm was dead. */}
          Analyze
        </button>
      </div>
    </div>
  );
});

PasswordMeter.displayName = 'PasswordMeter';

export default PasswordMeter;