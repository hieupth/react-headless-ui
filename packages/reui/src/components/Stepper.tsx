/**
 * Stepper renderer component using headless useStepper hook.
 * Provides styled multi-step process with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useStepper, type UseStepperProps, type StepperStep } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface StepperProps extends UseStepperProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether to show step numbers */
  showStepNumbers?: boolean;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Whether to show navigation buttons */
  showNavigation?: boolean;
  /** Custom step renderer */
  renderStep?: (step: StepperStep, index: number, isActive: boolean, isCompleted: boolean, hasError: boolean) => React.ReactNode;
  /** Custom content renderer */
  renderContent?: (step: StepperStep, index: number) => React.ReactNode;
  /** Custom navigation renderer */
  renderNavigation?: () => React.ReactNode;
  /** Custom progress renderer */
  renderProgress?: () => React.ReactNode;
  /** Next button text */
  nextButtonText?: string;
  /** Previous button text */
  previousButtonText?: string;
  /** Complete button text */
  completeButtonText?: string;
  /** Skip button text */
  skipButtonText?: string;
}

/**
 * Stepper component with multi-step process support.
 * Supports validation, navigation, and custom rendering.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(({
  className = '',
  style,
  showStepNumbers: showStepNumbersProp = true,
  showProgress = true,
  showNavigation = true,
  renderStep,
  renderContent,
  renderNavigation,
  renderProgress,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  completeButtonText = 'Complete',
  skipButtonText = 'Skip',
  ...stepperProps
}: StepperProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    stepperAttributes,
    getStepAttributes,
    getStepButtonAttributes
  } = useStepper({
    ...stepperProps,
    showStepNumbers: showStepNumbersProp
  });

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'stepper-sm',
      md: 'stepper-md',
      lg: 'stepper-lg'
    };
    return sizes[state.size];
  };

  // Variant classes
  const getVariantClasses = () => {
    const variants = {
      default: 'stepper-default',
      dots: 'stepper-dots',
      progress: 'stepper-progress'
    };
    return variants[state.variant];
  };

  // Orientation classes
  const getOrientationClasses = () => {
    const orientations = {
      horizontal: 'stepper-horizontal',
      vertical: 'stepper-vertical'
    };
    return orientations[state.orientation];
  };

  // Base stepper classes
  const stepperClasses = `
    stepper
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${getOrientationClasses()}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default step renderer
  const defaultRenderStep = (step: StepperStep, index: number) => {
    const isActive = index === state.currentStep;
    const isCompleted = state.completedSteps.has(index);
    const hasError = state.invalidSteps.has(index);

    const stepAttributes = getStepAttributes(step, index);
    const buttonAttributes = getStepButtonAttributes(step, index);

    if (state.variant === 'dots') {
      return (
        <div
          {...stepAttributes}
          className={`
            step-dot
            ${isActive ? 'step-dot-active' : ''}
            ${isCompleted ? 'step-dot-completed' : ''}
            ${hasError ? 'step-dot-error' : ''}
          `}
        >
          <button
            {...buttonAttributes}
            className={`
              step-dot-button
              ${isActive ? 'step-dot-button-active' : ''}
              ${isCompleted ? 'step-dot-button-completed' : ''}
              ${hasError ? 'step-dot-button-error' : ''}
            `}
          >
            {step.icon || (
              <span className="step-dot-number">{index + 1}</span>
            )}
          </button>
          <div className="step-dot-info">
            <div className="step-dot-title">{step.title}</div>
            {step.description && (
              <div className="step-dot-description">{step.description}</div>
            )}
          </div>
        </div>
      );
    }

    if (state.variant === 'progress') {
      return (
        <div
          {...stepAttributes}
          className={`
            step-progress
            ${isActive ? 'step-progress-active' : ''}
            ${isCompleted ? 'step-progress-completed' : ''}
            ${hasError ? 'step-progress-error' : ''}
          `}
        >
          <div className="step-progress-header">
            <button
              {...buttonAttributes}
              className={`
                step-progress-button
                ${isActive ? 'step-progress-button-active' : ''}
                ${isCompleted ? 'step-progress-button-completed' : ''}
                ${hasError ? 'step-progress-button-error' : ''}
              `}
            >
              {step.icon || (
                <span className="step-progress-number">{index + 1}</span>
              )}
            </button>
            <div className="step-progress-info">
              <div className="step-progress-title">
                {step.title}
                {step.optional && (
                  <span className="step-progress-optional">Optional</span>
                )}
              </div>
              {step.description && (
                <div className="step-progress-description">{step.description}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div
        {...stepAttributes}
        className={`
          step-default
          ${isActive ? 'step-default-active' : ''}
          ${isCompleted ? 'step-default-completed' : ''}
          ${hasError ? 'step-default-error' : ''}
        `}
      >
        <button
          {...buttonAttributes}
          className={`
            step-default-button
            ${isActive ? 'step-default-button-active' : ''}
            ${isCompleted ? 'step-default-button-completed' : ''}
            ${hasError ? 'step-default-button-error' : ''}
          `}
        >
          <div className="step-default-indicator">
            {isCompleted ? (
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : hasError ? (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : step.icon ? (
              step.icon
            ) : (
              <span className="step-default-number">{index + 1}</span>
            )}
          </div>
          <div className="step-default-content">
            <div className="step-default-title">
              {step.title}
              {step.optional && (
                <span className="step-default-optional">Optional</span>
              )}
            </div>
            {step.subtitle && (
              <div className="step-default-subtitle">{step.subtitle}</div>
            )}
            {step.description && (
              <div className="step-default-description">{step.description}</div>
            )}
          </div>
        </button>
      </div>
    );
  };

  // Default content renderer
  const defaultRenderContent = (step: StepperStep, index: number) => {
    if (step.content) {
      return step.content;
    }

    return (
      <div className="step-content">
        <h3 className="step-content-title">{step.title}</h3>
        {step.description && (
          <p className="step-content-description">{step.description}</p>
        )}
        <div className="step-content-placeholder">
          <p>Content for step: {step.title}</p>
          {state.invalidSteps.has(index) && (
            <div className="step-content-error">
              {step.error || 'This step has validation errors'}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Default progress renderer
  const defaultRenderProgress = () => {
    if (state.variant === 'progress') {
      return (
        <div className="stepper-progress-bar">
          <div
            className="stepper-progress-fill"
            style={{ width: `${computed.progress}%` }}
          />
          <div className="stepper-progress-text">
            {Math.round(computed.progress)}% Complete
          </div>
        </div>
      );
    }

    return null;
  };

  // Default navigation renderer
  const defaultRenderNavigation = () => {
    return (
      <div className="stepper-navigation">
        <div className="stepper-navigation-left">
          {!computed.isFirstStep && (
            <button
              onClick={actions.previousStep}
              disabled={state.loading}
              className="stepper-button stepper-button-secondary"
            >
              {previousButtonText}
            </button>
          )}
        </div>
        <div className="stepper-navigation-center">
          {computed.currentStepObj?.canSkip && stepperProps.allowSkip && (
            <button
              onClick={actions.skipStep}
              disabled={state.loading}
              className="stepper-button stepper-button-ghost"
            >
              {skipButtonText}
            </button>
          )}
        </div>
        <div className="stepper-navigation-right">
          {computed.isLastStep ? (
            <button
              onClick={actions.completeStep}
              disabled={state.loading}
              className="stepper-button stepper-button-primary"
            >
              {completeButtonText}
            </button>
          ) : (
            <button
              onClick={actions.nextStep}
              disabled={state.loading || !computed.canGoNext}
              className="stepper-button stepper-button-primary"
            >
              {nextButtonText}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={stepperClasses}
      style={style}
      {...stepperAttributes}
      data-testid="stepper"
    >
      {/* Progress Bar */}
      {showProgress && (renderProgress ? renderProgress() : defaultRenderProgress())}

      {/* Steps */}
      <div className="stepper-steps" data-testid="stepper-steps">
        {stepperProps.steps.map((step, index) => {
          const isActive = index === state.currentStep;
          const isCompleted = state.completedSteps.has(index);
          const hasError = state.invalidSteps.has(index);

          return (
            <div key={step.key} className="step-wrapper">
              {renderStep
                ? renderStep(step, index, isActive, isCompleted, hasError)
                : defaultRenderStep(step, index)}

              {/* Connector line */}
              {state.orientation === 'horizontal' && index < stepperProps.steps.length - 1 && (
                <div
                  className={`
                    step-connector
                    ${isCompleted ? 'step-connector-completed' : ''}
                    ${state.variant === 'dots' ? 'step-connector-dots' : ''}
                    ${state.variant === 'progress' ? 'step-connector-progress' : ''}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="stepper-content" data-testid="stepper-content">
        {computed.currentStepObj && (
          renderContent
            ? renderContent(computed.currentStepObj, state.currentStep)
            : defaultRenderContent(computed.currentStepObj, state.currentStep)
        )}
      </div>

      {/* Navigation */}
      {showNavigation && (renderNavigation ? renderNavigation() : defaultRenderNavigation())}

      {/* Loading overlay */}
      {state.loading && (
        <div className="stepper-loading">
          <div className="stepper-loading-spinner"></div>
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
});

Stepper.displayName = 'Stepper';

export default Stepper;