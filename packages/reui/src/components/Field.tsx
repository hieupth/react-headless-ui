/**
 * Field renderer component.
 * Provides visual representation for form field components with accessibility.
 */

import React, { forwardRef } from 'react';
import { useField } from '../hooks';
import type { UseFieldProps } from '../hooks';

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
  }: FieldProps, ref) => {
    // Explicit types override the `unknown` index signature inherited from
    // SemanticMixinProps / FocusableMixinProps via UseFieldProps.
    const sizeProp: 'sm' | 'md' | 'lg' = size;
    const variantProp: 'outline' | 'filled' | 'underline' = variant;
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
    }: {
      label?: string;
      placeholder?: string;
      description?: string;
      helperText?: string;
      maxLength?: number;
      minLength?: number;
      required?: boolean;
      disabled?: boolean;
      readOnly?: boolean;
    } = props;

    // Size classes
    const sizeClasses = {
      sm: '  ',
      md: '  ',
      lg: '  '
    };

    // Variant classes
    const variantClasses = {
      outline: '   ',
      filled: '   ',
      underline: '     '
    };

    // State classes
    const stateClasses = `
      ${state.focused ? '' : ''}
      ${state.invalid ? '  ' : ''}
      ${state.disabled ? '  ' : ''}
      ${state.filled ? '' : ''}
    `;

    const inputClasses = `
         
      ${sizeClasses[sizeProp]}
      ${variantClasses[variantProp]}
      ${stateClasses}
      ${prefix || startAdornment ? '' : ''}
      ${suffix || endAdornment || clearable ? '' : ''}
        
      
    `;

    return (
      <div
        className={`field-container ${orientation === 'horizontal' ? '  ' : ''} ${className}`}
        style={style}
      >
        {/* Label */}
        {label && labelPosition !== 'inside' && (
          <label
            className={`
                
              ${state.disabled ? '' : ''}
              ${orientation === 'horizontal' ? ' ' : ''}
              ${required ? '  ' : ''}
            `}
          >
            {label}
          </label>
        )}

        {/* Field Wrapper */}
        <div className=" ">
          {/* Start Adornment */}
          {(startAdornment || prefix) && (
            <div className="   transform -translate-y-1/2 ">
              {startAdornment || prefix}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            {...attributes}
          />

          {/* End Adornment */}
          <div className="   transform -translate-y-1/2   ">
            {/* Clear Button */}
            {clearable && state.filled && !disabled && !readOnly && (
              <button
                type="button"
                className="     "
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
              <span className="">
                {suffix}
              </span>
            )}

            {/* End Adornment */}
            {endAdornment}
          </div>

          {/* Inside Label */}
          {label && labelPosition === 'inside' && !state.filled && !state.focused && (
            <div className="   transform -translate-y-1/2  pointer-events-none">
              {label}
            </div>
          )}
        </div>

        {/* Helper Text, Error Message, and Character Count */}
        {(helperText || state.error || showCount) && (
          <div className="  ">
            <div className="">
              {/* Error Message */}
              {state.error && (
                <p className="  " role="alert">
                  {state.error}
                </p>
              )}

              {/* Helper Text */}
              {!state.error && helperText && (
                <p className="  ">
                  {helperText}
                </p>
              )}
            </div>

            {/* Character Count */}
            {showCount && maxLength && (
              <span className={`   ${
                state.value.length > maxLength * 0.9 ? '' : ''
              }`}>
                {state.value.length}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="  ">
            {description}
          </p>
        )}

        {/* Validation Requirements */}
        {(minLength || maxLength) && (
          <p className="  ">
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