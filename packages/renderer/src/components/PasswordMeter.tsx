/**
 * PasswordMeter renderer component using headless usePasswordMeter hook.
 * Provides styled password strength meter with comprehensive visual feedback.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { usePasswordMeter, type UsePasswordMeterProps } from '@react-ui-forge/core';
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
  const defaultStrengthColors = {
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
      bar: 'h-1',
      circle: 'w-16 h-16',
      dots: 'gap-1',
      text: 'text-sm'
    },
    md: {
      bar: 'h-2',
      circle: 'w-20 h-20',
      dots: 'gap-2',
      text: 'text-base'
    },
    lg: {
      bar: 'h-3',
      circle: 'w-24 h-24',
      dots: 'gap-3',
      text: 'text-lg'
    }
  };

  // Base meter classes
  const meterClasses = `
    password-meter
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  /**
   * Get strength color
   */
  const getStrengthColor = (strength?: string): string => {
    if (!strength || !state.analysis) return colors.none;
    return colors[strength] || colors.none;
  };

  /**
   * Render bar variant
   */
  const renderBarVariant = () => {
    const percentage = actions.getStrengthPercentage();
    const strengthColor = getStrengthColor(state.analysis?.strength);

    return (
      <div className="strength-bar-container">
        <div
          className={`
            strength-bar ${sizeClasses[size].bar}
            bg-gray-200 rounded-full overflow-hidden
            ${animated ? 'transition-all duration-300 ease-out' : ''}
          `}
        >
          <div
            className={`
              strength-bar-fill h-full
              ${animated ? 'transition-all duration-300 ease-out' : ''}
            `}
            style={{
              width: `${percentage}%`,
              backgroundColor: strengthColor
            }}
          />
        </div>
        {showScore && (
          <div className="strength-score mt-1 text-sm font-medium" style={{ color: strengthColor }}>
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
    const strengthColor = getStrengthColor(state.analysis?.strength);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="strength-circle-container flex items-center">
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
            className={animated ? 'transition-all duration-300 ease-out' : ''}
          />
          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-semibold"
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
    const strengthLevel = state.analysis?.strength;
    const dotCount = 5;
    const dots = Array.from({ length: dotCount }, (_, i) => i);

    const getDotColor = (index: number): string => {
      if (!strengthLevel) return '#e5e7eb';

      switch (strengthLevel) {
        case 'very-weak': return index === 0 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'weak': return index < 2 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'fair': return index < 3 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'good': return index < 4 ? getStrengthColor(strengthLevel) : '#e5e7eb';
        case 'strong':
        case 'very-strong': return getStrengthColor(strengthLevel);
        default: return '#e5e7eb';
      }
    };

    return (
      <div className={`strength-dots flex ${sizeClasses[size].dots}`}>
        {dots.map((index) => (
          <div
            key={index}
            className={`
              strength-dot rounded-full
              ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}
              ${animated ? 'transition-all duration-300 ease-out' : ''}
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
    const strengthText = state.analysis?.strength?.replace('-', ' ') || 'enter password';
    const strengthColor = getStrengthColor(state.analysis?.strength);

    return (
      <div className="strength-text">
        <span
          className={`
            font-medium capitalize
            ${sizeClasses[size].text}
            ${animated ? 'transition-colors duration-300 ease-out' : ''}
          `}
          style={{ color: strengthColor }}
        >
          {strengthText}
        </span>
        {showScore && (
          <span className="ml-2 text-gray-500">
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
        <div className="strength-empty text-gray-400 text-sm">
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
      <div className="criteria-list space-y-2">
        {state.analysis.criteria.map((criterion: any, index: number) => (
          <div
            key={index}
            className={`
              criteria-item flex items-center gap-2 text-sm
              ${criterion.met ? 'text-green-600' : 'text-gray-500'}
              ${animated ? 'transition-colors duration-200' : ''}
            `}
          >
            <div
              className={`
                criteria-icon w-4 h-4 rounded-full flex items-center justify-center
                ${criterion.met ? 'bg-green-100' : 'bg-gray-100'}
              `}
            >
              {criterion.met ? (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4.586 4.586a1 1 0 001.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
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
      <div className="suggestions mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h4>
        <ul className="space-y-1">
          {state.analysis.suggestions.map((suggestion: string, index: number) => (
            <li key={index} className="text-sm text-blue-600 flex items-start gap-1">
              <span className="text-blue-400">•</span>
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
      <div className="warnings mt-3">
        {state.analysis.warnings.map((warning: string, index: number) => (
          <div key={index} className="text-sm text-amber-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="additional-info mt-3 space-y-1">
        {showEntropy && (
          <div className="text-sm text-gray-600">
            Entropy: {state.analysis.entropy} bits
          </div>
        )}
        {showCrackTime && state.analysis.estimatedCrackTime && (
          <div className="text-sm text-gray-600">
            Crack time: {state.analysis.estimatedCrackTime}
          </div>
        )}
        {state.analyzing && (
          <div className="text-sm text-blue-600">
            Analyzing...
          </div>
        )}
        {state.error && (
          <div className="text-sm text-red-600" id="password-meter-error">
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
        className="visibility-toggle p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={state.visible ? 'Hide password' : 'Show password'}
        disabled={state.disabled}
      >
        {state.visible ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="password-input-container flex items-center gap-2">
        <input
          ref={passwordInputRef}
          type={state.visible ? 'text' : 'password'}
          value={state.password}
          onChange={(e) => actions.setPassword(e.target.value)}
          className={`
            password-input flex-1 px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${state.disabled ? 'bg-gray-50 text-gray-400' : ''}
          `}
          placeholder="Enter password"
          disabled={state.disabled}
          aria-label="Password input"
          data-testid="password-input"
        />
        {renderVisibilityToggle()}
      </div>

      {/* Strength Indicator */}
      <div className="strength-indicator mt-3">
        {showStrengthText && state.analysis && (
          <div className="strength-label mb-2">
            <span className="text-sm font-medium text-gray-700">Password Strength</span>
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
      <div className="meter-actions mt-4 flex gap-2">
        <button
          onClick={actions.clear}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          disabled={state.disabled || !state.password}
        >
          Clear
        </button>
        <button
          onClick={() => actions.analyze(state.password)}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          disabled={state.disabled || !state.password || state.analyzing}
        >
          {state.analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
});

PasswordMeter.displayName = 'PasswordMeter';

export default PasswordMeter;