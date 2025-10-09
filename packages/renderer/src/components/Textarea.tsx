/**
 * Textarea component using useTextarea hook.
 * Provides multi-line text input with auto-resize and validation.
 */

import React from 'react';
import { useTextarea, type UseTextareaProps } from '../../core/src/headless/useTextarea';
import { useTheme } from '../providers/ThemeProvider';

export interface TextareaProps extends UseTextareaProps {
  /** Additional CSS classes */
  className?: string;
  /** Label for the textarea */
  label?: React.ReactNode;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error message */
  error?: React.ReactNode;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Custom character count formatter */
  charCountFormatter?: (current: number, max?: number) => string;
}

/**
 * Textarea component with auto-resize, validation, and character counting.
 * Follows Flutter textarea patterns with proper accessibility.
 */
export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  label,
  helperText,
  error,
  showCharCount = false,
  charCountFormatter,
  ...props
}) => {
  const theme = useTheme();
  const {
    state,
    actions,
    props: textareaProps,
    ref
  } = useTextarea(props);

  // Combine custom classes with theme classes
  const wrapperClassName = [
    'textarea-wrapper',
    className
  ].filter(Boolean).join(' ');

  const labelClassName = [
    'textarea-label',
    state.disabled ? 'textarea-label-disabled' : '',
    state.required ? 'textarea-label-required' : '',
    theme?.extensions?.typography?.label?.fontSize,
    theme?.extensions?.spacing?.component?.margin
  ].filter(Boolean).join(' ');

  const textareaClassName = [
    'textarea-input',
    state.disabled ? 'textarea-disabled' : '',
    state.readOnly ? 'textarea-readonly' : '',
    state.required ? 'textarea-required' : '',
    error ? 'textarea-error' : '',
    state.isMaxLengthReached ? 'textarea-max-length-reached' : '',
    theme?.extensions?.spacing?.component?.padding,
    theme?.extensions?.typography?.body?.fontSize,
    theme?.extensions?.color?.input?.background,
    theme?.extensions?.color?.input?.border
  ].filter(Boolean).join(' ');

  const helperTextClassName = [
    'textarea-helper-text',
    error ? 'textarea-helper-error' : '',
    theme?.extensions?.typography?.small?.fontSize,
    theme?.extensions?.spacing?.component?.margin
  ].filter(Boolean).join(' ');

  const charCountClassName = [
    'textarea-char-count',
    state.isMaxLengthReached ? 'textarea-char-count-max' : '',
    theme?.extensions?.typography?.small?.fontSize
  ].filter(Boolean).join(' ');

  // Format character count
  const formatCharCount = (current: number, max?: number) => {
    if (charCountFormatter) {
      return charCountFormatter(current, max);
    }
    return max ? `${current}/${max}` : `${current}`;
  };

  // Handle label click to focus textarea
  const handleLabelClick = () => {
    actions.focus();
  };

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={textareaProps.id}
          className={labelClassName}
          onClick={handleLabelClick}
        >
          {label}
          {state.required && (
            <span className="textarea-required-indicator" aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>
      )}

      <div className="textarea-input-wrapper">
        <textarea
          ref={ref}
          {...textareaProps}
          className={textareaClassName}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText || showCharCount
              ? [
                  error && `${textareaProps.id}-error`,
                  helperText && `${textareaProps.id}-helper`,
                  showCharCount && `${textareaProps.id}-charcount`
                ].filter(Boolean).join(' ')
              : undefined
          }
        />

        {/* Character count */}
        {(showCharCount || props.maxLength) && (
          <div
            id={`${textareaProps.id}-charcount`}
            className={charCountClassName}
            aria-live="polite"
          >
            {formatCharCount(state.charCount, props.maxLength)}
          </div>
        )}
      </div>

      {/* Helper text and error message */}
      {(helperText || error) && (
        <div className="textarea-footer">
          {error && (
            <div
              id={`${textareaProps.id}-error`}
              className={helperTextClassName}
              role="alert"
            >
              {error}
            </div>
          )}
          {helperText && !error && (
            <div
              id={`${textareaProps.id}-helper`}
              className={helperTextClassName}
            >
              {helperText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Additional textarea variants for specific use cases
export const AutoResizeTextarea: React.FC<TextareaProps> = ({
  autoResize = true,
  ...props
}) => {
  return <Textarea {...props} autoResize={autoResize} />;
};

export const LimitedTextarea: React.FC<TextareaProps & {
  maxLength: number;
  showCharCount?: boolean;
}> = ({
  showCharCount = true,
  ...props
}) => {
  return <Textarea {...props} showCharCount={showCharCount} />;
};

export const ControlledTextarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <Textarea
      {...props}
      value={value}
      onChange={onChange}
    />
  );
};

Textarea.displayName = 'Textarea';
AutoResizeTextarea.displayName = 'AutoResizeTextarea';
LimitedTextarea.displayName = 'LimitedTextarea';
ControlledTextarea.displayName = 'ControlledTextarea';