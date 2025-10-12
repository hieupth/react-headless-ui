/**
 * Form renderer component using headless useForm hook.
 * Provides styled form with React Hook Form integration and comprehensive accessibility support.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { useForm, type UseFormProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface FormProps<TFieldValues extends Record<string, any> = Record<string, any>>
  extends Omit<UseFormProps<TFieldValues>, 'formRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Form layout */
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  /** Form size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show validation errors */
  showErrors?: boolean;
  /** Whether to show form actions */
  showActions?: boolean;
  /** Custom submit button text */
  submitText?: string;
  /** Custom reset button text */
  resetText?: string;
  /** Custom field renderer */
  renderField?: (fieldName: string, fieldProps: any) => React.ReactNode;
  /** Custom actions renderer */
  renderActions?: (actions: any) => React.ReactNode;
  /** Custom error renderer */
  renderError?: (error: string, fieldName?: string) => React.ReactNode;
  /** Custom success renderer */
  renderSuccess?: () => React.ReactNode;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Loading overlay text */
  loadingText?: string;
  /** Field spacing */
  fieldSpacing?: 'tight' | 'normal' | 'loose';
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Form component with React Hook Form integration.
 * Supports multi-step forms, validation, loading states, and comprehensive accessibility.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(({
  className = '',
  style,
  layout = 'vertical',
  size = 'md',
  showErrors = true,
  showActions = true,
  submitText = 'Submit',
  resetText = 'Reset',
  renderField,
  renderActions,
  renderError,
  renderSuccess,
  showLoading = true,
  loadingText = 'Submitting...',
  fieldSpacing = 'normal',
  borderRadius = 'md',
  children,
  ...formProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    rhf,
    attributes,
    getFieldAttributes
  } = useForm({
    ...formProps,
    formRef: ref as React.RefObject<HTMLFormElement>
  });

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields }
  } = rhf;

  // Form refs
  const formRef = useRef<HTMLFormElement>(null);

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-sm',
      input: 'px-2 py-1 text-sm',
      button: 'px-3 py-1 text-sm',
      spacing: 'gap-2'
    },
    md: {
      container: 'text-base',
      input: 'px-3 py-2 text-base',
      button: 'px-4 py-2 text-base',
      spacing: 'gap-4'
    },
    lg: {
      container: 'text-lg',
      input: 'px-4 py-3 text-lg',
      button: 'px-6 py-3 text-lg',
      spacing: 'gap-6'
    }
  };

  // Layout classes
  const getLayoutClasses = () => {
    const spacing = sizeClasses[size].spacing;
    switch (layout) {
      case 'horizontal':
        return `flex items-center ${spacing}`;
      case 'inline':
        return `flex items-center flex-wrap ${spacing}`;
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-2 gap-4`;
      case 'vertical':
      default:
        return `flex flex-col ${spacing}`;
    }
  };

  // Border radius classes
  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // Field spacing classes
  const fieldSpacingClasses = {
    tight: 'mb-2',
    normal: 'mb-4',
    loose: 'mb-6'
  };

  // Base form classes
  const formClasses = `
    form
    ${getLayoutClasses()}
    ${sizeClasses[size].container}
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${state.loading ? 'pointer-events-none' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default field renderer
  const defaultRenderField = (fieldName: string, fieldProps: any) => {
    const fieldError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const fieldId = `field-${fieldName}`;
    const errorId = fieldError ? `${fieldName}-error` : undefined;

    return (
      <div key={fieldName} className={`
        form-field
        ${fieldSpacingClasses[fieldSpacing]}
        ${layout === 'horizontal' || layout === 'inline' ? 'flex-shrink-0' : ''}
      `}>
        {/* Field label */}
        <label
          htmlFor={fieldId}
          className={`
            block text-sm font-medium text-gray-700 mb-1
            ${state.disabled ? 'text-gray-400' : ''}
            ${fieldError ? 'text-red-600' : ''}
          `}
        >
          {fieldProps.label || fieldName}
          {fieldProps.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Field input */}
        {fieldProps.type === 'select' ? (
          <select
            id={fieldId}
            {...register(fieldName)}
            disabled={state.disabled || fieldProps.disabled}
            className={`
              w-full px-3 py-2 border border-gray-300
              ${borderRadiusClasses[borderRadius]}
              ${fieldError ? 'border-red-500 ring-1 ring-red-500' : ''}
              ${state.disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${sizeClasses[size].input}
              transition-colors duration-200
            `}
            {...getFieldAttributes(fieldName)}
          >
            {fieldProps.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : fieldProps.type === 'textarea' ? (
          <textarea
            id={fieldId}
            {...register(fieldName)}
            placeholder={fieldProps.placeholder}
            rows={fieldProps.rows || 3}
            disabled={state.disabled || fieldProps.disabled}
            className={`
              w-full px-3 py-2 border border-gray-300 resize-none
              ${borderRadiusClasses[borderRadius]}
              ${fieldError ? 'border-red-500 ring-1 ring-red-500' : ''}
              ${state.disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${sizeClasses[size].input}
              transition-colors duration-200
            `}
            {...getFieldAttributes(fieldName)}
          />
        ) : fieldProps.type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              id={fieldId}
              type="checkbox"
              {...register(fieldName)}
              disabled={state.disabled || fieldProps.disabled}
              className={`
                w-4 h-4 text-blue-600 border-gray-300 rounded
                focus:ring-blue-500
                ${fieldError ? 'border-red-500' : ''}
                ${state.disabled ? 'opacity-50' : ''}
              `}
              {...getFieldAttributes(fieldName)}
            />
            <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
              {fieldProps.checkboxLabel}
            </label>
          </div>
        ) : fieldProps.type === 'radio' ? (
          <div className="space-y-2">
            {fieldProps.options?.map((option: any) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${fieldId}-${option.value}`}
                  type="radio"
                  value={option.value}
                  {...register(fieldName)}
                  disabled={state.disabled || fieldProps.disabled}
                  className={`
                    w-4 h-4 text-blue-600 border-gray-300
                    focus:ring-blue-500
                    ${fieldError ? 'border-red-500' : ''}
                    ${state.disabled ? 'opacity-50' : ''}
                  `}
                  {...getFieldAttributes(fieldName)}
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <input
            id={fieldId}
            type={fieldProps.type || 'text'}
            {...register(fieldName)}
            placeholder={fieldProps.placeholder}
            disabled={state.disabled || fieldProps.disabled}
            className={`
              w-full px-3 py-2 border border-gray-300
              ${borderRadiusClasses[borderRadius]}
              ${fieldError ? 'border-red-500 ring-1 ring-red-500' : ''}
              ${state.disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${sizeClasses[size].input}
              transition-colors duration-200
            `}
            {...getFieldAttributes(fieldName)}
          />
        )}

        {/* Field helper text */}
        {fieldProps.helper && !fieldError && (
          <div className="text-xs text-gray-500 mt-1">
            {fieldProps.helper}
          </div>
        )}

        {/* Field error */}
        {showErrors && fieldError && isTouched && (
          <div className="text-xs text-red-600 mt-1" id={errorId}>
            {renderError ? (
              renderError(fieldError.message, fieldName)
            ) : (
              <div className="flex items-start gap-1">
                <span className="text-red-400">•</span>
                <span>{fieldError.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Default actions renderer
  const defaultRenderActions = () => {
    return (
      <div className={`
        form-actions
        ${layout === 'horizontal' || layout === 'inline' ? 'flex gap-2' : 'flex gap-2'}
        ${layout === 'vertical' ? 'mt-6' : ''}
      `}>
        <button
          type="submit"
          disabled={state.disabled || state.loading || state.isSubmitting}
          className={`
            ${sizeClasses[size].button}
            bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
            text-white font-medium
            ${borderRadiusClasses[borderRadius]}
            transition-colors duration-200
            disabled:cursor-not-allowed
          `}
        >
          {state.isSubmitting ? 'Submitting...' : submitText}
        </button>

        <button
          type="button"
          onClick={() => actions.reset()}
          disabled={state.disabled || state.loading || state.isSubmitting}
          className={`
            ${sizeClasses[size].button}
            bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50
            text-gray-700 font-medium
            ${borderRadiusClasses[borderRadius]}
            transition-colors duration-200
            disabled:cursor-not-allowed
          `}
        >
          {resetText}
        </button>

        {/* Multi-step form actions */}
        {state.multiStep?.enabled && (
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={actions.previousStep}
              disabled={state.currentStep === 0 || state.isSubmitting}
              className={`
                ${sizeClasses[size].button}
                bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50
                text-gray-700 font-medium
                ${borderRadiusClasses[borderRadius]}
                transition-colors duration-200
                disabled:cursor-not-allowed
              `}
            >
              Previous
            </button>

            {state.currentStep < state.totalSteps - 1 ? (
              <button
                type="button"
                onClick={actions.nextStep}
                disabled={state.isSubmitting}
                className={`
                  ${sizeClasses[size].button}
                  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                  text-white font-medium
                  ${borderRadiusClasses[borderRadius]}
                  transition-colors duration-200
                  disabled:cursor-not-allowed
                `}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={state.isSubmitting}
                className={`
                  ${sizeClasses[size].button}
                  bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                  text-white font-medium
                  ${borderRadiusClasses[borderRadius]}
                  transition-colors duration-200
                  disabled:cursor-not-allowed
                `}
              >
                Finish
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading overlay
  const renderLoadingOverlay = () => {
    if (!showLoading || !state.loading) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700">{loadingText}</p>
        </div>
      </div>
    );
  };

  // Success message
  const renderSuccessMessage = () => {
    if (!state.isSubmitted || !renderSuccess) return null;

    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Form submitted successfully!</h3>
          </div>
        </div>
      </div>
    );
  };

  // Step indicator for multi-step forms
  const renderStepIndicator = () => {
    if (!state.multiStep?.enabled) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {Array.from({ length: state.totalSteps }, (_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index < state.currentStep
                    ? 'bg-blue-600 text-white'
                    : index === state.currentStep
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  }
                `}
              >
                {index < state.currentStep ? '✓' : index + 1}
              </div>
              {index < state.totalSteps - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2
                    ${index < state.currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <form
        ref={formRef}
        className={formClasses}
        style={style}
        onSubmit={handleSubmit(actions.submit)}
        noValidate
        {...attributes}
        data-testid="form"
      >
        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Success message */}
        {renderSuccessMessage()}

        {/* Form submission error */}
        {showErrors && state.submissionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {state.submissionError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render children or default fields */}
        {children ? (
          <div className="form-children">
            {typeof children === 'function' ? children(rhf, state, actions) : children}
          </div>
        ) : (
          <div className="form-fields">
            {/* Render default fields based on defaultValues */}
            {Object.keys(formProps.defaultValues || {}).map(fieldName => {
              const fieldProps = {
                label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
                type: 'text',
                required: false,
                placeholder: `Enter ${fieldName}`
              };
              return renderField
                ? renderField(fieldName, fieldProps)
                : defaultRenderField(fieldName, fieldProps);
            })}
          </div>
        )}

        {/* Form actions */}
        {showActions && (
          renderActions ? renderActions(actions) : defaultRenderActions()
        )}
      </form>

      {/* Loading overlay */}
      {renderLoadingOverlay()}
    </>
  );
});

Form.displayName = 'Form';

export default Form;