/**
 * Field renderer component.
 * Provides visual representation for form field components with accessibility.
 */

import React, { forwardRef } from 'react';
import { useField } from '@react-ui-forge/core';
import type { UseFieldProps } from '@react-ui-forge/core';

/**
 * Field component props
 */
export interface FieldProps extends UseFieldProps {
  /** Field size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Field variant */
  variant?: 'outline' | 'filled' | 'underline';
  /** Field orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Label position */
  labelPosition?: 'top' | 'left' | 'inside';
  /** Show clear button */
  clearable?: boolean;
  /** Show character count */
  showCount?: boolean;
  /** Prefix element */
  prefix?: React.ReactNode;
  /** Suffix element */
  suffix?: React.ReactNode;
  /** Start adornment */
  startAdornment?: React.ReactNode;
  /** End adornment */
  endAdornment?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Field component
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({
    size = 'md',
    variant = 'outline',
    orientation = 'vertical',
    labelPosition = 'top',
    clearable = false,
    showCount = false,
    prefix,
    suffix,
    startAdornment,
    endAdornment,
    className = '',
    style,
    ...props
  }, ref) => {
    const {
      state,
      handlers,
      attributes
    } = useField(props);

    const {
      label,
      placeholder,
      description,
      helperText,
      maxLength,
      minLength,
      required,
      disabled,
      readOnly
    } = props;

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg'
    };

    // Variant classes
    const variantClasses = {
      outline: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-blue-500',
      underline: 'border-0 border-b-2 border-gray-300 rounded-none focus:border-blue-500 focus:ring-0'
    };

    // State classes
    const stateClasses = `
      ${state.focused ? 'ring-2' : ''}
      ${state.invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${state.disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}
      ${state.filled ? 'bg-gray-50' : ''}
    `;

    const inputClasses = `
      w-full rounded-md transition-colors duration-200
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${stateClasses}
      ${prefix || startAdornment ? 'pl-10' : ''}
      ${suffix || endAdornment || clearable ? 'pr-10' : ''}
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:cursor-not-allowed
    `;

    return (
      <div
        className={`field-container ${orientation === 'horizontal' ? 'flex items-start gap-4' : 'space-y-2'} ${className}`}
        style={style}
      >
        {/* Label */}
        {label && labelPosition !== 'inside' && (
          <label
            className={`
              block text-sm font-medium
              ${state.disabled ? 'text-gray-400' : 'text-gray-700'}
              ${orientation === 'horizontal' ? 'mt-2.5 flex-shrink-0' : ''}
              ${required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}
            `}
          >
            {label}
          </label>
        )}

        {/* Field Wrapper */}
        <div className="relative flex-1">
          {/* Start Adornment */}
          {(startAdornment || prefix) && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {startAdornment || prefix}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            placeholder={labelPosition === 'inside' && !state.filled ? label : placeholder}
            {...attributes}
          />

          {/* End Adornment */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Clear Button */}
            {clearable && state.filled && !disabled && !readOnly && (
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 rounded"
                onClick={handlers.handleClear}
                aria-label="Clear input"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Suffix */}
            {suffix && (
              <span className="text-gray-500">
                {suffix}
              </span>
            )}

            {/* End Adornment */}
            {endAdornment}
          </div>

          {/* Inside Label */}
          {label && labelPosition === 'inside' && !state.filled && !state.focused && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              {label}
            </div>
          )}
        </div>

        {/* Helper Text, Error Message, and Character Count */}
        {(helperText || state.error || showCount) && (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Error Message */}
              {state.error && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {state.error}
                </p>
              )}

              {/* Helper Text */}
              {!state.error && helperText && (
                <p className="text-sm text-gray-500 mt-1">
                  {helperText}
                </p>
              )}
            </div>

            {/* Character Count */}
            {showCount && maxLength && (
              <span className={`text-sm mt-1 ml-2 ${
                state.value.length > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
              }`}>
                {state.value.length}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        )}

        {/* Validation Requirements */}
        {(minLength || maxLength) && (
          <p className="text-xs text-gray-500 mt-1">
            {minLength && `Minimum ${minLength} characters`}
            {minLength && maxLength && ' • '}
            {maxLength && `Maximum ${maxLength} characters`}
          </p>
        )}
      </div>
    );
  }
);

Field.displayName = 'Field';

export default Field;