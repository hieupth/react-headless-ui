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
    sm: '',
    md: '',
    lg: ''
  };

  // Input size classes
  const inputSizeClasses = {
    sm: ' ',
    md: ' ',
    lg: ' '
  };

  // Base OTP classes
  const otpClasses = `
    input-otp
      
    ${state.disabled ? ' ' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default slot renderer
  const defaultRenderSlot = (slot: any, index: number) => {
    const slotClasses = `
      otp-slot
      ${inputSizeClasses[size]}
         
       
      ${slot.focused
        ? '   '
        : ' '
      }
      ${slot.filled
        ? ' '
        : ' '
      }
      ${slot.hasError
        ? '  '
        : ''
      }
      ${state.disabled ? ' ' : ''}
      ${sizeClasses[size]}
      
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
      <div className="complete-indicator ">
        <div className="      ">
          <svg
            className="  "
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
        className="clear-button     "
        aria-label="Clear OTP"
        data-testid="otp-clear"
      >
        <svg
          className=" "
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
      <div className="errors " id="otp-errors">
        {state.errors.map((error, index) => (
          <div key={index} className="    ">
            <svg
              className=" "
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
      <div className="attempts  ">
        <span className={`   ${isNearLimit ? '' : ''}`}>
          <svg
            className=" "
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
              <span className=""> ({remainingAttempts} remaining)</span>
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
      <div className="progress-container ">
        <div className="   ">
          <div
            className="    "
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="    ">
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
      <div className="otp-label ">
        <label className="  ">
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
      <div className="otp-controls    ">
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
    sm: ' ',
    md: ' ',
    lg: ' '
  };

  const displayValue = masked && slot.filled ? '●' : slot.value;

  const slotClasses = `
    otp-slot
    ${sizeClasses[size]}
       
     
    ${slot.focused
      ? '   '
      : ' '
    }
    ${slot.filled
      ? ' '
      : ' '
    }
    ${slot.hasError
      ? '  '
      : ''
    }
    ${slot.disabled ? ' ' : ''}
    
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