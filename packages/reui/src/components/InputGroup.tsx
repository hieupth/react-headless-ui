/**
 * InputGroup renderer component using headless useInputGroup hook.
 * Provides styled input grouping with comprehensive layout support and validation.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { useInputGroup, type UseInputGroupProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface InputGroupProps extends Omit<UseInputGroupProps, 'groupRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom item renderer */
  renderItem?: (item: any, index: number, attributes: any) => React.ReactNode;
  /** Whether to show validation errors */
  showErrors?: boolean;
  /** Whether to show field borders */
  showBorders?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show helper text */
  showHelpers?: boolean;
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Spacing between items */
  spacing?: 'tight' | 'normal' | 'loose';
  /** Custom error renderer */
  renderError?: (itemId: string, errors: string[]) => React.ReactNode;
}

/**
 * InputGroup component with flexible layout and validation support.
 * Supports horizontal, vertical, stacked, and inline layouts.
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(({
  className = '',
  style,
  renderItem,
  showErrors = true,
  showBorders = true,
  showLabels = true,
  showHelpers = true,
  borderRadius = 'md',
  spacing = 'normal',
  renderError,
  ...inputGroupProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    getItemAttributes
  } = useInputGroup({
    ...inputGroupProps,
    groupRef: ref as React.RefObject<HTMLDivElement>
  });

  // Input refs for programmatic focus
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Size classes
  const sizeClasses = {
    sm: '',
    md: '',
    lg: ''
  };

  // Spacing classes
  const spacingClasses = {
    tight: state.layout === 'horizontal' || state.layout === 'inline' ? '' : '',
    normal: state.layout === 'horizontal' || state.layout === 'inline' ? '' : '',
    loose: state.layout === 'horizontal' || state.layout === 'inline' ? '' : ''
  };

  // Border radius classes
  const borderRadiusClasses = {
    none: '',
    sm: '',
    md: '',
    lg: '',
    full: ''
  };

  // Layout classes
  const getLayoutClasses = () => {
    switch (state.layout) {
      case 'horizontal':
        return '';
      case 'vertical':
        return '';
      case 'stacked':
        return '';
      case 'inline':
        return '';
      default:
        return '';
    }
  };

  // Base input group classes
  const inputGroupClasses = `
    input-group
    ${getLayoutClasses()}
    ${spacingClasses[spacing]}
    ${sizeClasses[state.size]}
    ${state.disabled ? ' ' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default item renderer
  const defaultRenderItem = (item: any, index: number, itemAttributes: any) => {
    const itemErrors = state.errors[item.id];
    const hasError = !!itemErrors;
    const value = state.values[item.id] || '';

    switch (item.type) {
      case 'input':
        return (
          <div key={item.id} className={`
            input-item
            ${state.layout === 'stacked' ? '' : ''}
            ${state.layout === 'horizontal' || state.layout === 'inline' ? '' : ''}
          `}>
            {/* Label */}
            {showLabels && item.content && (
              <label className={`
                    
                ${state.disabled ? '' : ''}
                ${item.required ? '  ' : ''}
              `}>
                {item.content}
              </label>
            )}

            {/* Input field */}
            <input
              ref={(el) => {
                inputRefs.current[item.id] = el;
              }}
              type={item.inputType || 'text'}
              value={value}
              onChange={(e) => actions.setValue(item.id, e.target.value)}
              onFocus={() => actions.focusItem(item.id)}
              onBlur={() => actions.blurItem(item.id)}
              className={`
                input-field
                  
                ${showBorders ? '' : ''}
                ${hasError ? '  ' : ''}
                ${borderRadiusClasses[borderRadius]}
                ${state.disabled ? ' ' : ' '}
                
                ${hasError ? ' ' : ' '}
                 
              `}
              placeholder={item.placeholder}
              disabled={item.disabled || state.disabled}
              required={item.required}
              {...itemAttributes}
              data-testid={`input-${item.id}`}
            />

            {/* Helper text */}
            {/* reason: the condition `itemErrors?.length === 0` required state.errors[item.id]
                to be an empty array, but useInputGroup only ever stores non-empty error arrays
                (valid items are omitted entirely from the errors map), so this block was
                unreachable dead code and has been removed. */}

            {/* Error messages */}
            {showErrors && itemErrors && itemErrors.length > 0 && (
              <div className="error-messages ">
                {renderError ? (
                  renderError(item.id, itemErrors)
                ) : (
                  <div className=" ">
                    {itemErrors.map((error: string, errorIndex: number) => (
                      <div key={errorIndex} className="  ">
                        <span className="">•</span>
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'label':
        return (
          <div key={item.id} className={`
            label-item
            ${state.layout === 'horizontal' || state.layout === 'inline' ? ' ' : ''}
          `}>
            <label className={`
                 
              ${state.disabled ? '' : ''}
              ${item.required ? '  ' : ''}
            `}>
              {item.content}
            </label>
          </div>
        );

      case 'helper':
        return (
          <div key={item.id} className={`
            helper-item
             
            ${state.layout === 'horizontal' || state.layout === 'inline' ? ' ' : ''}
          `}>
            {item.content}
          </div>
        );

      case 'error':
        return (
          <div key={item.id} className={`
            error-item
             
            ${state.layout === 'horizontal' || state.layout === 'inline' ? ' ' : ''}
          `}>
            {item.content}
          </div>
        );

      case 'prefix':
        return (
          <div key={item.id} className={`
            prefix-item
             
            ${state.layout === 'horizontal' || state.layout === 'inline' ? '' : ''}
          `}>
            <span className=" ">{item.content}</span>
          </div>
        );

      case 'suffix':
        return (
          <div key={item.id} className={`
            suffix-item
             
            ${state.layout === 'horizontal' || state.layout === 'inline' ? ' ' : ''}
          `}>
            <span className=" ">{item.content}</span>
          </div>
        );

      case 'action':
        return (
          <div key={item.id} className={`
            action-item
            ${state.layout === 'horizontal' || state.layout === 'inline' ? ' ' : ''}
          `}>
            <button
              onClick={() => {
                // Handle action button click
                if (typeof item.content === 'function') {
                  item.content(state.values, actions);
                }
              }}
              className="       "
              disabled={state.disabled}
              data-testid={`action-${item.id}`}
            >
              {typeof item.content === 'string' ? item.content : 'Action'}
            </button>
          </div>
        );

      default:
        return (
          <div key={item.id} className="custom-item">
            {item.content}
          </div>
        );
    }
  };

  // Group-level error display
  const renderGroupErrors = () => {
    if (!showErrors || !state.errors.group || state.errors.group.length === 0) return null;

    return (
      <div className="group-errors " id="input-group-errors">
        {renderError ? (
          renderError('group', state.errors.group)
        ) : (
          <div className="      ">
            <div className=" ">Form Errors:</div>
            {state.errors.group.map((error: string, index: number) => (
              <div key={index} className="  ">
                <span className="">•</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Form actions
  const renderFormActions = () => {
    return (
      <div className="form-actions   ">
        <button
          onClick={actions.validate}
          className="       "
          disabled={state.disabled}
        >
          Validate
        </button>
        <button
          onClick={actions.reset}
          className="       "
          disabled={state.disabled}
        >
          Reset
        </button>
        <button
          onClick={actions.clear}
          className="       "
          disabled={state.disabled}
        >
          Clear
        </button>
      </div>
    );
  };

  // Status indicator
  const renderStatusIndicator = () => {
    if (!state.isDirty) return null;

    return (
      <div className="status-indicator  ">
        {state.isValid ? (
          <div className="   ">
            <svg className=" " fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Valid</span>
          </div>
        ) : (
          <div className="   ">
            <svg className=" " fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Has errors</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={inputGroupClasses}
      style={style}
      {...attributes}
      data-testid="input-group"
    >
      {/* Render items */}
      {state.items.map((item, index) => {
        const itemAttributes = getItemAttributes(item.id);
        return renderItem
          ? renderItem(item, index, itemAttributes)
          : defaultRenderItem(item, index, itemAttributes);
      })}

      {/* Group-level errors */}
      {renderGroupErrors()}

      {/* Form actions */}
      {renderFormActions()}

      {/* Status indicator */}
      {renderStatusIndicator()}

      {/* Empty state */}
      {state.items.length === 0 && (
        <div className="empty-state      ">
          <div className="       ">
            <svg className="  " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className=" ">No form fields</p>
          <p className="  ">Add items to create a form</p>
        </div>
      )}
    </div>
  );
});

InputGroup.displayName = 'InputGroup';

export default InputGroup;