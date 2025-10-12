/**
 * InputGroup renderer component using headless useInputGroup hook.
 * Provides styled input grouping with comprehensive layout support and validation.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { useInputGroup, type UseInputGroupProps } from '@react-ui-forge/core';
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
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Spacing classes
  const spacingClasses = {
    tight: state.layout === 'horizontal' || state.layout === 'inline' ? 'gap-2' : 'gap-1',
    normal: state.layout === 'horizontal' || state.layout === 'inline' ? 'gap-4' : 'gap-3',
    loose: state.layout === 'horizontal' || state.layout === 'inline' ? 'gap-6' : 'gap-4'
  };

  // Border radius classes
  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // Layout classes
  const getLayoutClasses = () => {
    switch (state.layout) {
      case 'horizontal':
        return 'flex items-center';
      case 'vertical':
        return 'flex flex-col';
      case 'stacked':
        return 'flex flex-col space-y-1';
      case 'inline':
        return 'flex items-center flex-wrap';
      default:
        return 'flex flex-col';
    }
  };

  // Base input group classes
  const inputGroupClasses = `
    input-group
    ${getLayoutClasses()}
    ${spacingClasses[spacing]}
    ${sizeClasses[state.size]}
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
            ${state.layout === 'stacked' ? 'relative' : ''}
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-1' : ''}
          `}>
            {/* Label */}
            {showLabels && item.content && (
              <label className={`
                block text-sm font-medium text-gray-700 mb-1
                ${state.disabled ? 'text-gray-400' : ''}
                ${item.required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}
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
                w-full px-3 py-2
                ${showBorders ? 'border' : 'border-0'}
                ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}
                ${borderRadiusClasses[borderRadius]}
                ${state.disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                focus:outline-none
                ${hasError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'}
                transition-colors duration-200
              `}
              placeholder={item.placeholder}
              disabled={item.disabled || state.disabled}
              required={item.required}
              {...itemAttributes}
              data-testid={`input-${item.id}`}
            />

            {/* Helper text */}
            {showHelpers && itemErrors?.length === 0 && item.placeholder && (
              <div className="helper-text text-xs text-gray-500 mt-1">
                {item.placeholder}
              </div>
            )}

            {/* Error messages */}
            {showErrors && itemErrors && itemErrors.length > 0 && (
              <div className="error-messages mt-1">
                {renderError ? (
                  renderError(item.id, itemErrors)
                ) : (
                  <div className="text-xs text-red-600">
                    {itemErrors.map((error: string, errorIndex: number) => (
                      <div key={errorIndex} className="flex items-start gap-1">
                        <span className="text-red-400">•</span>
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
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0 mr-2' : 'mb-2'}
          `}>
            <label className={`
              block text-sm font-medium text-gray-700
              ${state.disabled ? 'text-gray-400' : ''}
              ${item.required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}
            `}>
              {item.content}
            </label>
          </div>
        );

      case 'helper':
        return (
          <div key={item.id} className={`
            helper-item
            text-sm text-gray-500
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0 ml-2' : 'mt-1'}
          `}>
            {item.content}
          </div>
        );

      case 'error':
        return (
          <div key={item.id} className={`
            error-item
            text-sm text-red-600
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0 ml-2' : 'mt-1'}
          `}>
            {item.content}
          </div>
        );

      case 'prefix':
        return (
          <div key={item.id} className={`
            prefix-item
            flex items-center
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0' : 'mb-2'}
          `}>
            <span className="text-gray-500 mr-2">{item.content}</span>
          </div>
        );

      case 'suffix':
        return (
          <div key={item.id} className={`
            suffix-item
            flex items-center
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0 ml-2' : 'mb-2'}
          `}>
            <span className="text-gray-500 ml-2">{item.content}</span>
          </div>
        );

      case 'action':
        return (
          <div key={item.id} className={`
            action-item
            ${state.layout === 'horizontal' || state.layout === 'inline' ? 'flex-shrink-0 ml-2' : 'mt-2'}
          `}>
            <button
              onClick={() => {
                // Handle action button click
                if (typeof item.content === 'function') {
                  item.content(state.values, actions);
                }
              }}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
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
      <div className="group-errors mt-2" id="input-group-errors">
        {renderError ? (
          renderError('group', state.errors.group)
        ) : (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="font-medium mb-1">Form Errors:</div>
            {state.errors.group.map((error: string, index: number) => (
              <div key={index} className="flex items-start gap-1">
                <span className="text-red-400">•</span>
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
      <div className="form-actions flex gap-2 mt-4">
        <button
          onClick={actions.validate}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          disabled={state.disabled}
        >
          Validate
        </button>
        <button
          onClick={actions.reset}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          disabled={state.disabled}
        >
          Reset
        </button>
        <button
          onClick={actions.clear}
          className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
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
      <div className="status-indicator text-xs mt-2">
        {state.isValid ? (
          <div className="flex items-center gap-1 text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="empty-state flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">No form fields</p>
          <p className="text-xs text-gray-400 mt-1">Add items to create a form</p>
        </div>
      )}
    </div>
  );
});

InputGroup.displayName = 'InputGroup';

export default InputGroup;