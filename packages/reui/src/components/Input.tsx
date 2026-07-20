/**
 * Input renderer component using headless useInput hook.
 * Provides styled input with validation and accessibility.
 */

import React, { forwardRef } from 'react';
import { useInput } from '../hooks';
import type { UseInputProps } from '../hooks';

export interface InputProps extends UseInputProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Input placeholder text */
  placeholder?: string;
  /** Leading icon or element */
  leadingElement?: React.ReactNode;
  /** Trailing icon or element */
  trailingElement?: React.ReactNode;
  /** Error message display */
  error?: string;
  /** Helper text display */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Custom render function */
  render?: (props: InputRenderProps) => React.ReactElement;
}

export interface InputRenderProps {
  /** Computed class names */
  className: string;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Event handlers */
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleInput: (event: React.FormEvent<HTMLInputElement>) => void;
  handleFocus: (event: FocusEvent) => void;
  handleBlur: (event: FocusEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleKeyUp: (event: React.KeyboardEvent) => void;
  /** Input state */
  value: string;
  focused: boolean;
  disabled: boolean;
  readOnly: boolean;
  valid: boolean;
  error?: string;
  characterCount: number;
  touched: boolean;
  dirty: boolean;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLInputElement | null>;
  /** Validation message */
  validationMessage: string;
}

/**
 * Styled input component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  style,
  placeholder,
  leadingElement,
  trailingElement,
  error: externalError,
  helperText,
  label,
  showCharacterCount = false,
  render,
  ...inputProps
}: InputProps, ref) => {
  // The `InputProps` interface inherits `[key: string]: unknown` index signatures
  // from FocusableMixinProps/SemanticMixinProps. Without explicit annotations the
  // destructured locals above are widened to `unknown`/`{}`, poisoning every use
  // site. Re-bind them to their declared types so downstream JSX stays typed.
  const classNames: string | undefined = className;
  const styleProps: React.CSSProperties | undefined = style;
  const placeholderText: string | undefined = placeholder;
  const leading: React.ReactNode = leadingElement;
  const trailing: React.ReactNode = trailingElement;
  const externalErrorMsg: string | undefined = externalError;
  const helper: string | undefined = helperText;
  const labelText: string | undefined = label;
  const showCount: boolean = showCharacterCount;
  const renderFn: ((props: InputRenderProps) => React.ReactElement) | undefined = render;
  const input = useInput({
    ...inputProps
  });

  // Use external error if provided, otherwise use internal error
  const displayError: string | undefined = externalErrorMsg || input.error;

  // Default render function
  const defaultRender = (props: InputRenderProps) => {
    return (
      <div className={`input-container ${props.className}`} style={styleProps}>
        {labelText && (
          <label
            htmlFor={props.semanticAttributes.id}
            className="input-label"
          >
            {labelText}
            {inputProps.required && (
              <span className="input-required-indicator" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="input-wrapper">
          {leading && (
            <div className="input-leading-element">
              {leading}
            </div>
          )}

          <input
            ref={props.ref}
            className="input-element"
            placeholder={placeholderText}
            {...props.semanticAttributes}
            onChange={props.handleChange}
            onInput={props.handleInput}
            onFocus={(event) => props.handleFocus(event.nativeEvent)}
            onBlur={(event) => props.handleBlur(event.nativeEvent)}
            onKeyDown={props.handleKeyDown}
            onKeyUp={props.handleKeyUp}
          />

          {trailing && (
            <div className="input-trailing-element">
              {trailing}
            </div>
          )}
        </div>

        {(displayError || helper || showCount) && (
          <div className="input-support-text">
            {displayError && (
              <div className="input-error" role="alert">
                {displayError}
              </div>
            )}

            {helper && !displayError && (
              <div className="input-helper-text">
                {helper}
              </div>
            )}

            {showCount && (
              <div className="input-character-count">
                {props.characterCount}
                {inputProps.maxLength && `/${inputProps.maxLength}`}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render props
  const renderProps: InputRenderProps = {
    className: `${input.className}${classNames ? ` ${classNames}` : ''}`,
    semanticAttributes: {
      ...input.semanticAttributes,
      id: input.semanticAttributes.id || `input-${Math.random().toString(36).substr(2, 9)}`
    },
    handleChange: input.handleChange,
    handleInput: input.handleInput,
    handleFocus: input.handleFocus,
    handleBlur: input.handleBlur,
    handleKeyDown: input.handleKeyDown,
    handleKeyUp: input.handleKeyUp,
    value: input.value,
    focused: input.focused,
    disabled: input.disabled,
    readOnly: input.readOnly,
    valid: input.valid,
    error: displayError,
    characterCount: input.characterCount,
    touched: input.touched,
    dirty: input.dirty,
    ref: input.ref,
    validationMessage: input.validationMessage
  };

  // Use custom render if provided, otherwise use default render
  if (renderFn) {
    return renderFn(renderProps);
  }

  return defaultRender(renderProps);
});

Input.displayName = 'Input';