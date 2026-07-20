/**
 * Stepper headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages multi-step processes with navigation and validation.
 */

import { useState, useCallback, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Stepper step configuration
 */
export interface StepperStep {
  /** Unique step identifier */
  key: string;
  /** Step title */
  title: string;
  /** Optional step description */
  description?: string;
  /** Step icon */
  icon?: React.ReactNode;
  /** Whether step is optional */
  optional?: boolean;
  /** Whether step can be skipped */
  canSkip?: boolean;
  /** Custom step validation function */
  validate?: () => boolean | Promise<boolean>;
  /** Custom step content */
  content?: React.ReactNode;
  /** Step subtitle */
  subtitle?: string;
  /** Step error message */
  error?: string;
}

/**
 * Stepper orientation options
 */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Stepper size options
 */
export type StepperSize = 'sm' | 'md' | 'lg';

/**
 * Stepper variant options
 */
export type StepperVariant = 'default' | 'dots' | 'progress';

/**
 * Stepper state interface
 */
export interface StepperState {
  /** Current step index */
  currentStep: number;
  /** Completed steps */
  completedSteps: Set<number>;
  /** Invalid steps */
  invalidSteps: Set<number>;
  /** Loading state */
  loading: boolean;
  /** Stepper orientation */
  orientation: StepperOrientation;
  /** Stepper size */
  size: StepperSize;
  /** Stepper variant */
  variant: StepperVariant;
}

/**
 * Stepper actions interface
 */
export interface StepperActions {
  /** Go to next step */
  nextStep: () => Promise<boolean>;
  /** Go to previous step */
  previousStep: () => void;
  /** Go to specific step */
  goToStep: (step: number) => Promise<boolean>;
  /** Complete current step */
  completeStep: () => void;
  /** Mark step as incomplete */
  incompleteStep: (step: number) => void;
  /** Validate current step */
  validateStep: (step: number) => Promise<boolean>;
  /** Validate all steps */
  validateAll: () => Promise<boolean>;
  /** Reset stepper */
  reset: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Skip current step */
  skipStep: () => void;
}

/**
 * Props for useStepper hook
 */
export interface UseStepperProps {
  /** Stepper steps configuration */
  steps: StepperStep[];
  /** Initial step index */
  initialStep?: number;
  /** Stepper orientation */
  orientation?: StepperOrientation;
  /** Stepper size */
  size?: StepperSize;
  /** Stepper variant */
  variant?: StepperVariant;
  /** Whether stepper is linear (must complete steps in order) */
  linear?: boolean;
  /** Whether to show step numbers */
  showStepNumbers?: boolean;
  /** Allow skipping optional steps */
  allowSkip?: boolean;
  /** Callback when step changes */
  onStepChange?: (step: number, previousStep: number) => void;
  /** Callback when step is completed */
  onStepComplete?: (step: number) => void;
  /** Callback when stepper is completed */
  onComplete?: () => void;
  /** Callback when validation fails */
  onValidationError?: (step: number, error: string) => void;
}

/**
 * Return type for useStepper hook
 */
export interface UseStepperReturns {
  /** Current stepper state */
  state: StepperState;
  /** Stepper actions */
  actions: StepperActions;
  /** Computed properties */
  computed: {
    /** Current step object */
    currentStepObj: StepperStep | undefined;
    /** Whether stepper is at first step */
    isFirstStep: boolean;
    /** Whether stepper is at last step */
    isLastStep: boolean;
    /** Whether all steps are completed */
    isComplete: boolean;
    /** Progress percentage */
    progress: number;
    /** Can go to next step */
    canGoNext: boolean;
    /** Can go to previous step */
    canGoPrevious: boolean;
  };
  /** Stepper attributes */
  stepperAttributes: React.HTMLAttributes<HTMLElement>;
  /** Get step attributes */
  getStepAttributes: (step: StepperStep, index: number) => React.HTMLAttributes<HTMLElement> & { key?: React.Key };
  /** Get step button attributes */
  getStepButtonAttributes: (step: StepperStep, index: number) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Stepper hook implementation
 * @param props - Stepper configuration props
 * @returns Stepper state, actions, computed properties, and attributes
 */
export function useStepper(props: UseStepperProps): UseStepperReturns {
  const {
    steps,
    initialStep = 0,
    orientation = 'horizontal',
    size = 'md',
    variant = 'default',
    linear = false,
    showStepNumbers = true,
    allowSkip = false,
    onStepChange,
    onStepComplete,
    onComplete,
    onValidationError
  } = props;

  // State management
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [invalidSteps, setInvalidSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Computed properties
  const computed = useMemo(() => {
    const currentStepObj = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const isComplete = steps.length > 0 && completedSteps.size === steps.length;
    const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

    // Can go next if not last step and not linear or previous steps are completed
    const canGoNext = !isLastStep && (
      !linear ||
      Array.from({ length: currentStep }, (_, i) => completedSteps.has(i)).every(Boolean)
    );

    // Can go previous if not first step and not linear or previous steps are completed
    const canGoPrevious = !isFirstStep && (
      !linear ||
      Array.from({ length: currentStep }, (_, i) => completedSteps.has(i)).every(Boolean)
    );

    return {
      currentStepObj,
      isFirstStep,
      isLastStep,
      isComplete,
      progress,
      canGoNext,
      canGoPrevious
    };
  }, [steps, currentStep, completedSteps, linear]);

  // Actions
  const actions = useMemo(() => {
    const validateStep = async (step: number): Promise<boolean> => {
      const stepObj = steps[step];
      if (!stepObj?.validate) return true;

      try {
        setLoading(true);
        const isValid = await stepObj.validate();

        if (!isValid) {
          setInvalidSteps(prev => new Set([...prev, step]));
          onValidationError?.(step, stepObj.error || 'Step validation failed');
        } else {
          setInvalidSteps(prev => {
            const newSet = new Set(prev);
            newSet.delete(step);
            return newSet;
          });
        }

        return isValid;
      } catch (error) {
        setInvalidSteps(prev => new Set([...prev, step]));
        onValidationError?.(step, `Validation error: ${error}`);
        return false;
      } finally {
        setLoading(false);
      }
    };

    const validateAll = async (): Promise<boolean> => {
      const results = await Promise.all(
        steps.map((_, index) => validateStep(index))
      );
      return results.every(Boolean);
    };

    const goToStep = async (step: number): Promise<boolean> => {
      if (step < 0 || step >= steps.length) return false;

      // Validate current step if linear
      if (linear && step > currentStep) {
        const isValid = await validateStep(currentStep);
        if (!isValid) return false;
      }

      const previousStep = currentStep;
      setCurrentStep(step);
      onStepChange?.(step, previousStep);
      return true;
    };

    const nextStep = async (): Promise<boolean> => {
      if (computed.isLastStep) return false;

      // Validate current step if linear
      if (linear) {
        const isValid = await validateStep(currentStep);
        if (!isValid) return false;
      }

      // Mark current step as completed
      completeStep();

      // Go to next step
      return await goToStep(currentStep + 1);
    };

    const previousStep = (): void => {
      if (!computed.canGoPrevious) return;
      goToStep(currentStep - 1);
    };

    const completeStep = (): void => {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onStepComplete?.(currentStep);

      // Check if all steps are completed
      if (currentStep === steps.length - 1) {
        onStepComplete?.(currentStep);
        if (completedSteps.size + 1 === steps.length) {
          onComplete?.();
        }
      }
    };

    const incompleteStep = (step: number): void => {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(step);
        return newSet;
      });
    };

    const skipStep = (): void => {
      if (!allowSkip || !computed.currentStepObj?.canSkip) return;

      // Mark current step as completed (skipped steps are considered completed)
      completeStep();

      // Go to next step
      if (!computed.isLastStep) {
        goToStep(currentStep + 1);
      }
    };

    const reset = (): void => {
      setCurrentStep(initialStep);
      setCompletedSteps(new Set());
      setInvalidSteps(new Set());
      setLoading(false);
    };

    return {
      nextStep,
      previousStep,
      goToStep,
      completeStep,
      incompleteStep,
      validateStep,
      validateAll,
      reset,
      setLoading,
      skipStep
    };
  }, [steps, currentStep, computed, linear, allowSkip, initialStep, onStepChange, onStepComplete, onComplete, onValidationError]);

  // Build state
  const state: StepperState = {
    currentStep,
    completedSteps,
    invalidSteps,
    loading,
    orientation,
    size,
    variant
  };

  // Build stepper attributes
  const stepperAttributes = {
    role: 'navigation',
    'aria-label': 'Step progress',
    'aria-orientation': orientation
  };

  // Build step attributes
  const getStepAttributes = (step: StepperStep, index: number): React.HTMLAttributes<HTMLElement> & { key?: React.Key } => ({
    key: step.key,
    'aria-current': index === currentStep ? 'step' : undefined,
    'aria-disabled': linear && index > currentStep ? true : undefined,
    'aria-invalid': invalidSteps.has(index) ? true : undefined,
    'aria-label': `${step.title}${step.optional ? ' (optional)' : ''}${index === currentStep ? ', current' : ''}${completedSteps.has(index) ? ', completed' : ''}`,
    tabIndex: linear && index > currentStep ? -1 : 0
  });

  // Build step button attributes
  const getStepButtonAttributes = (step: StepperStep, index: number): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
    'aria-label': `Go to step ${index + 1}: ${step.title}`,
    onClick: async () => {
      if (!linear || index <= currentStep || completedSteps.has(index)) {
        await actions.goToStep(index);
      }
    },
    disabled: linear && index > currentStep && !completedSteps.has(index),
    tabIndex: linear && index > currentStep && !completedSteps.has(index) ? -1 : 0
  });

  return useMemo(() => ({
    state,
    actions,
    computed,
    stepperAttributes,
    getStepAttributes,
    getStepButtonAttributes
  }), [state, actions, computed, stepperAttributes, getStepAttributes, getStepButtonAttributes]);
}