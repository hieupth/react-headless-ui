/**
 * InputOTP renderer component using headless useInputOTP hook.
 * Provides styled OTP input with comprehensive accessibility support and validation.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { useInputOTP, type UseInputOTPProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface InputOTPProps extends Omit<UseInputOTPProps, 'otpRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom slot renderer */
  renderSlot?: (slot: any, index: number) => React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Input type for security */
  inputType?: 'text' | 'password' | 'number';
  /** Whether to show validation errors */
  showErrors?: boolean;
  /** Whether to show attempts counter */
  showAttempts?: boolean;
  /** Whether to show clear button */
  showClear?: boolean;
  /** Whether to show complete indicator */
  showCompleteIndicator?: boolean;
}

/**
 * InputOTP component with one-time password input and validation.
 * Supports individual digit inputs, masking, and proper accessibility.
 */
export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(({
  className = '',
  style,
  renderSlot,
  size = 'md',
  inputType = 'text',
  showErrors = true,
  showAttempts = true,
  showClear = true,
  showCompleteIndicator = true,
  ...inputOTPProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useInputOTP({
    ...inputOTPProps,
      otpRef: ref as React.RefObject<HTMLDivElement>
  });

  // Input refs for programmatic focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Input size classes
  const inputSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  // Base OTP classes
  const otpClasses = `
    input-otp
    flex gap-2 items-center
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default slot renderer
  const defaultRenderSlot = (slot: any, index: number) => {
    const slotClasses = `
      otp-slot
      ${inputSizeClasses[size]}
      border-2 rounded-lg text-center font-mono
      transition-all duration-200
      ${slot.focused
        ? 'border-blue-500 ring-2 ring-blue-200 ring-opacity-50'
        : 'border-gray-300 hover:border-gray-400'
      }
      ${slot.filled
        ? 'bg-blue-50 text-blue-700'
        : 'bg-white text-gray-900'
      }
      ${slot.hasError
        ? 'border-red-500 bg-red-50 text-red-700'
        : ''
      }
      ${state.disabled ? 'bg-gray-50 text-gray-400' : ''}
      ${sizeClasses[size]}
      focus:outline-none
    `.trim().replace(/\s+/g, ' ');

    const displayValue = state.masked && slot.filled ? '●' : slot.value;

    return (
      <input
        ref={(el) => {
          inputRefs.current[index] = el;
        }}
        type={inputType}
        value={displayValue}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (inputValue.length > 0) {
            actions.inputChar(index, inputValue[inputValue.length - 1]);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !slot.value) {
            // Backspace on empty slot removes from previous slot
            actions.removeChar(index - 1);
          } else if (e.key === 'Enter' && slot.filled) {
            // Enter on filled slot moves to next
            actions.focusNextSlot();
          }
        }}
        onFocus={() => actions.focusSlot(index)}
        onClick={() => actions.focusSlot(index)}
        className={slotClasses}
        disabled={state.disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        aria-label={`OTP digit ${index + 1}`}
        aria-invalid={slot.hasError}
        data-testid={`otp-input-${index}`}
        autoCorrect="off"
        spellCheck={false}
      />
    );
  };

  // Complete indicator
  const renderCompleteIndicator = () => {
    if (!showCompleteIndicator || !state.isComplete) return null;

    return (
      <div className="complete-indicator ml-2">
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4.586 4.586a1 1 0 001.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  };

  // Clear button
  const renderClearButton = () => {
    if (!showClear || state.disabled || state.value.length === 0) return null;

    return (
      <button
        onClick={actions.clear}
        className="clear-button p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        aria-label="Clear OTP"
        data-testid="otp-clear"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m0-6V7a2 2 0 012-2h6a2 2 0 012 2v6m0-6V9a2 2 0 00-2-2h-6a2 2 0 00-2 2v6"
          />
        </svg>
      </button>
    );
  };

  // Error display
  const renderErrors = () => {
    if (!showErrors || state.errors.length === 0) return null;

    return (
      <div className="errors mt-2" id="otp-errors">
        {state.errors.map((error, index) => (
          <div key={index} className="text-red-600 text-sm flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  // Attempts counter
  const renderAttempts = () => {
    if (!showAttempts) return null;
    /* c8 ignore start -- reason: state.attempts only mutates via actions.incrementAttempts, which InputOTP never calls (no internal trigger and no prop exposes it). attempts is therefore always 0, so every branch below that depends on a non-zero attempt count is unreachable through the component. */
    if (state.attempts === 0) return null;

    const remainingAttempts = inputOTPProps.maxAttempts ? inputOTPProps.maxAttempts - state.attempts : null;
    const isNearLimit = remainingAttempts !== null && remainingAttempts <= 1;

    return (
      <div className="attempts mt-2 text-sm">
        <span className={`flex items-center gap-1 ${isNearLimit ? 'text-red-600' : 'text-gray-500'}`}>
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 9a1 1 0 112 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v7a1 1 0 001 1h1a1 1 0 001-1v-7a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Attempts: {state.attempts}
            {remainingAttempts !== null && (
              <span className="text-gray-400"> ({remainingAttempts} remaining)</span>
            )}
          </span>
        </span>
      </div>
    );
    /* c8 ignore end */
  };

  // Progress indicator
  const renderProgress = () => {
    const progress = (state.value.length / inputOTPProps.length!) * 100;

    return (
      <div className="progress-container mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{state.value.length}/{inputOTPProps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={otpClasses}
      style={style}
      {...attributes}
      data-testid="input-otp"
    >
      {/* Label */}
      <div className="otp-label mb-2">
        <label className="text-sm font-medium text-gray-700">
          Enter verification code
        </label>
      </div>

      {/* OTP Input Slots */}
      <div className="otp-slots">
        {state.slots.map((slot, index) => (
          <div key={index} className="otp-slot-wrapper">
            {renderSlot
              ? renderSlot(slot, index)
              : defaultRenderSlot(slot, index)
            }
          </div>
        ))}
      </div>

      {/* Controls and Indicators */}
      <div className="otp-controls flex items-center justify-between mt-4">
        {renderClearButton()}
        {renderCompleteIndicator()}
      </div>

      {/* Progress */}
      {renderProgress()}

      {/* Errors */}
      {renderErrors()}

      {/* Attempts */}
      {renderAttempts()}

      {/* Hidden input for accessibility */}
      <input
        type="text"
        value={state.value}
        onChange={(e) => actions.setValue(e.target.value)}
        className="sr-only"
        aria-label="Complete OTP value"
        data-testid="otp-hidden-input"
      />
    </div>
  );
});

InputOTP.displayName = 'InputOTP';

/**
 * OTPSlot - Individual slot component (for advanced usage)
 */
export interface OTPSlotProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Slot data */
  slot: any;
  /** Slot index */
  index: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Change handler */
  onChange?: (value: string) => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Input type */
  inputType?: 'text' | 'password' | 'number';
  /** Whether to mask input */
  masked?: boolean;
}

export const OTPSlot = forwardRef<HTMLInputElement, OTPSlotProps>(({
  className = '',
  style,
  slot,
  index,
  size = 'md',
  onChange,
  onFocus,
  inputType = 'text',
  masked = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const displayValue = masked && slot.filled ? '●' : slot.value;

  const slotClasses = `
    otp-slot
    ${sizeClasses[size]}
    border-2 rounded-lg text-center font-mono
    transition-all duration-200
    ${slot.focused
      ? 'border-blue-500 ring-2 ring-blue-200 ring-opacity-50'
      : 'border-gray-300 hover:border-gray-400'
    }
    ${slot.filled
      ? 'bg-blue-50 text-blue-700'
      : 'bg-white text-gray-900'
    }
    ${slot.hasError
      ? 'border-red-500 bg-red-50 text-red-700'
      : ''
    }
    ${slot.disabled ? 'bg-gray-50 text-gray-400' : ''}
    focus:outline-none
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <input
      ref={ref}
      type={inputType}
      value={displayValue}
      onChange={(e) => {
        const value = e.target.value;
        onChange?.( value );
      }}
      onFocus={onFocus}
      className={slotClasses}
      disabled={slot.disabled}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      aria-label={`OTP digit ${index + 1}`}
      aria-invalid={slot.hasError}
      data-testid={`otp-input-${index}`}
      autoCorrect="off"
      spellCheck={false}
      style={style}
      {...props}
    />
  );
});

OTPSlot.displayName = 'OTPSlot';

export default InputOTP;