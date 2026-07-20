/**
 * Form headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages form state with React Hook Form integration.
 */

import { useForm as useReactHookForm, UseFormProps as RHFUseFormProps, UseFormReturn, FieldValues, SubmitHandler, SubmitErrorHandler, DefaultValues } from 'react-hook-form';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Form state interface extending React Hook Form state
 */
export interface FormState<TFieldValues extends FieldValues = FieldValues> {
  /** React Hook Form return value */
  rhf: UseFormReturn<TFieldValues>;
  /** Whether form is disabled */
  disabled: boolean;
  /** Whether form is loading */
  loading: boolean;
  /** Whether form is read-only */
  readOnly: boolean;
  /** Current step (for multi-step forms) */
  currentStep: number;
  /** Total steps (for multi-step forms) */
  totalSteps: number;
  /** Form submission state */
  isSubmitting: boolean;
  /** Form submission errors */
  submissionError: string | null;
  /** Form submission success state */
  isSubmitted: boolean;
  /** Form last submission timestamp */
  lastSubmittedAt: number | null;
}

/**
 * Form actions interface
 */
export interface FormActions<TFieldValues extends FieldValues = FieldValues> {
  /** Submit form */
  submit: () => Promise<void>;
  /** Reset form */
  reset: (values?: TFieldValues) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set disabled state */
  setDisabled: (disabled: boolean) => void;
  /** Set read-only state */
  setReadOnly: (readOnly: boolean) => void;
  /** Go to next step (for multi-step forms) */
  nextStep: () => boolean;
  /** Go to previous step (for multi-step forms) */
  previousStep: () => boolean;
  /** Go to specific step (for multi-step forms) */
  goToStep: (step: number) => boolean;
  /** Validate current step (for multi-step forms) */
  validateStep: (step?: number) => Promise<boolean>;
  /** Validate entire form */
  validate: () => Promise<boolean>;
  /** Get field error */
  getFieldError: (fieldName: string) => string | undefined;
  /** Get field value */
  getFieldValue: <T>(fieldName: string) => T | undefined;
  /** Set field value */
  setFieldValue: <T>(fieldName: string, value: T) => void;
  /** Clear field error */
  clearFieldError: (fieldName: string) => void;
  /** Focus on field */
  focusField: (fieldName: string) => void;
  /** Get form data */
  getData: () => TFieldValues;
  /** Set form data */
  setData: (data: TFieldValues) => void;
}

/**
 * Form validation rule interface
 */
export interface FormValidationRule<TFieldValues extends FieldValues = FieldValues> {
  /** Field name */
  field: keyof TFieldValues;
  /** Rule name */
  name: string;
  /** Validation function */
  validate: (value: any, values: TFieldValues) => boolean | string | Promise<boolean | string>;
  /** Error message */
  message: string;
  /** When to validate */
  when?: 'onChange' | 'onBlur' | 'onSubmit';
}

/**
 * Multi-step form configuration
 */
export interface MultiStepFormConfig {
  /** Whether this is a multi-step form */
  enabled: boolean;
  /** Total number of steps */
  totalSteps: number;
  /** Validation for each step */
  stepValidation?: (step: number, data: any) => Promise<boolean>;
  /** Step change handler */
  onStepChange?: (fromStep: number, toStep: number) => void;
  /** Step submission handler */
  onStepSubmit?: (step: number, data: any) => Promise<void>;
}

/**
 * Props for useForm hook
 */
export interface UseFormProps<TFieldValues extends FieldValues = FieldValues> extends Omit<RHFUseFormProps<TFieldValues>, 'resolver' | 'defaultValues' | 'mode'> {
  /** Whether form is disabled */
  disabled?: boolean;
  /** Whether form is loading */
  loading?: boolean;
  /** Whether form is read-only */
  readOnly?: boolean;
  /** Initial values */
  defaultValues?: TFieldValues;
  /** Validation mode */
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
  /** Validation rules */
  validationRules?: FormValidationRule<TFieldValues>[];
  /** Multi-step form configuration */
  multiStep?: MultiStepFormConfig;
  /** Submit handler */
  onSubmit: SubmitHandler<TFieldValues>;
  /** Submit error handler */
  onSubmitError?: SubmitErrorHandler<TFieldValues>;
  /** Form submission handler (async) */
  onFormSubmit?: (data: TFieldValues) => Promise<void>;
  /** Form reset handler */
  onReset?: () => void;
  /** Form validation change handler */
  onValidationChange?: (isValid: boolean) => void;
  /** Form data change handler */
  onDataChange?: (data: TFieldValues, fieldName?: string) => void;
  /** Form step change handler */
  onStepChange?: (step: number) => void;
  /** Ref to the form element */
  formRef?: React.RefObject<HTMLFormElement | null>;
}

/**
 * Return type for useForm hook
 */
export interface UseFormReturns<TFieldValues extends FieldValues = FieldValues> {
  /** Current form state */
  state: FormState<TFieldValues>;
  /** Form actions */
  actions: FormActions<TFieldValues>;
  /** React Hook Form methods */
  rhf: UseFormReturn<TFieldValues>;
  /** Accessibility attributes */
  attributes: React.HTMLAttributes<HTMLElement>;
  /** Get attributes for a specific field */
  getFieldAttributes: (fieldName: string) => React.HTMLAttributes<HTMLElement>;
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Form hook implementation with React Hook Form integration
 * @param props - Form configuration props
 * @returns Form state, actions, and attributes
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  props: UseFormProps<TFieldValues>
): UseFormReturns<TFieldValues> {
  const {
    disabled: initialDisabled = false,
    loading: initialLoading = false,
    readOnly: initialReadOnly = false,
    defaultValues,
    mode = 'onSubmit',
    validationRules = [],
    multiStep,
    onSubmit,
    onSubmitError,
    onFormSubmit,
    onReset,
    onValidationChange,
    onDataChange,
    onStepChange,
    formRef
  } = props;

  // State management
  const [disabled, setDisabled] = useState(initialDisabled);
  const [loading, setLoading] = useState(initialLoading);
  const [readOnly, setReadOnly] = useState(initialReadOnly);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitted, setSubmitted] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);

  // Refs
  const internalRef = useRef<HTMLFormElement>(null);
  const formElementRef = formRef || internalRef;

  // React Hook Form instance
  const rhf = useReactHookForm<TFieldValues>({
    defaultValues: defaultValues as DefaultValues<TFieldValues> | undefined,
    mode,
    disabled,
    reValidateMode: 'onChange'
  });

  const {
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setFocus,
    getValues,
    setValue,
    trigger,
    formState: { isValid, dirtyFields, errors, isDirty }
  } = rhf;

  // Calculate total steps
  const totalSteps = multiStep?.enabled ? multiStep.totalSteps : 1;

  /**
   * Submit form handler
   */
  const submitAction = useCallback(async (): Promise<void> => {
    if (disabled || loading || readOnly || isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const submitHandler = handleSubmit(async (data) => {
        try {
          // Call form submit handler if provided
          if (onFormSubmit) {
            await onFormSubmit(data);
          }

          // Call original submit handler
          await onSubmit(data);

          // Update submission state
          setSubmitted(true);
          setLastSubmittedAt(Date.now());
          setSubmissionError(null);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Submission failed';
          setSubmissionError(errorMessage);
          throw error;
        }
      });

      await submitHandler();
    } catch (error) {
      if (onSubmitError) {
        onSubmitError(error as any);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, loading, readOnly, isSubmitting, handleSubmit, onSubmit, onFormSubmit, onSubmitError]);

  /**
   * Reset form
   */
  const resetAction = useCallback((values?: TFieldValues) => {
    reset(values || defaultValues);
    setSubmitted(false);
    setLastSubmittedAt(null);
    setSubmissionError(null);
    setCurrentStep(0);
    onReset?.();
  }, [reset, defaultValues, onReset]);

  /**
   * Validate entire form.
   * Defensive: a consumer's resolver/validation rule can throw, in which case
   * validation is treated as failed rather than rejecting the caller.
   */
  const validateAction = useCallback(async (): Promise<boolean> => {
    try {
      return await trigger();
    } catch {
      return false;
    }
  }, [trigger]);

  /**
   * Validate current step (for multi-step forms)
   */
  const validateStepAction = useCallback(async (step?: number): Promise<boolean> => {
    if (!multiStep?.enabled) return await validateAction();

    const targetStep = step !== undefined ? step : currentStep;

    if (multiStep.stepValidation) {
      const currentData = getValues();
      return await multiStep.stepValidation(targetStep, currentData);
    }

    // Validate all fields for the current step
    return await validateAction();
  }, [multiStep, currentStep, validateAction, getValues]);

  /**
   * Go to next step
   */
  const nextStepAction = useCallback((): boolean => {
    if (!multiStep?.enabled) return false;

    if (currentStep < totalSteps - 1) {
      validateStepAction().then((isValid) => {
        if (isValid) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          onStepChange?.(nextStep);
          multiStep.onStepChange?.(currentStep, nextStep);
        }
      });
      return true;
    }
    return false;
  }, [multiStep, currentStep, totalSteps, validateStepAction, onStepChange]);

  /**
   * Go to previous step
   */
  const previousStepAction = useCallback((): boolean => {
    if (!multiStep?.enabled) return false;

    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
      multiStep.onStepChange?.(currentStep, prevStep);
      return true;
    }
    return false;
  }, [multiStep, currentStep, onStepChange]);

  /**
   * Go to specific step
   */
  const goToStepAction = useCallback((step: number): boolean => {
    if (!multiStep?.enabled) return false;

    if (step >= 0 && step < totalSteps) {
      validateStepAction(currentStep).then((isValid) => {
        if (isValid) {
          setCurrentStep(step);
          onStepChange?.(step);
          multiStep.onStepChange?.(currentStep, step);
        }
      });
      return true;
    }
    return false;
  }, [multiStep, currentStep, totalSteps, validateStepAction, onStepChange]);

  /**
   * Get field error
   */
  const getFieldErrorAction = useCallback((fieldName: string): string | undefined => {
    const fieldError = errors[fieldName as keyof TFieldValues];
    const message = fieldError?.message;
    return typeof message === 'string' ? message : undefined;
  }, [errors]);

  /**
   * Get field value
   */
  const getFieldValueAction = useCallback(<T,>(fieldName: string): T | undefined => {
    return getValues(fieldName as any) as T | undefined;
  }, [getValues]);

  /**
   * Set field value
   */
  const setFieldValueAction = useCallback(<T,>(fieldName: string, value: T): void => {
    setValue(fieldName as any, value as any, { shouldValidate: true });
    const currentData = getValues();
    onDataChange?.(currentData, fieldName);
  }, [setValue, getValues, onDataChange]);

  /**
   * Clear field error
   */
  const clearFieldErrorAction = useCallback((fieldName: string): void => {
    clearErrors(fieldName as any);
  }, [clearErrors]);

  /**
   * Focus on field
   */
  const focusFieldAction = useCallback((fieldName: string): void => {
    setFocus(fieldName as any);
  }, [setFocus]);

  /**
   * Get form data
   */
  const getDataAction = useCallback((): TFieldValues => {
    return getValues();
  }, [getValues]);

  /**
   * Set form data
   */
  const setDataAction = useCallback((data: TFieldValues): void => {
    Object.entries(data as any).forEach(([fieldName, value]) => {
      setValue(fieldName as any, value as TFieldValues[keyof TFieldValues], { shouldValidate: true });
    });
    onDataChange?.(data);
  }, [setValue, onDataChange]);

  // Get attributes for a specific field
  const getFieldAttributes = useCallback((fieldName: string) => {
    const fieldError = errors[fieldName as keyof TFieldValues];
    return {
      id: `field-${fieldName}`,
      name: fieldName,
      'aria-invalid': !!fieldError,
      'aria-describedby': fieldError ? `${fieldName}-error` : undefined,
      'aria-required': !!rhf.register(fieldName as any).required,
      'aria-disabled': disabled,
      'aria-readonly': readOnly,
      'data-error': !!fieldError
    };
  }, [errors, rhf, disabled, readOnly]);

  // Watch validation changes
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Watch data changes
  useEffect(() => {
    const currentData = getValues();
    if (isDirty) {
      onDataChange?.(currentData);
    }
  }, [Object.values(dirtyFields).some(Boolean)]); // eslint-disable-line

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: formElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: formElementRef
  });

  const semantic = useSemanticMixin({
    role: 'form',
    'aria-label': 'Form',
    ref: formElementRef
  });

  return useMemo(() => {
    // Build state
    const state: FormState<TFieldValues> = {
      rhf,
      disabled,
      loading,
      readOnly,
      currentStep,
      totalSteps,
      isSubmitting,
      submissionError,
      isSubmitted,
      lastSubmittedAt
    };

    // Build actions
    const actions: FormActions<TFieldValues> = {
      submit: submitAction,
      reset: resetAction,
      setLoading,
      setDisabled,
      setReadOnly,
      nextStep: nextStepAction,
      previousStep: previousStepAction,
      goToStep: goToStepAction,
      validateStep: validateStepAction,
      validate: validateAction,
      getFieldError: getFieldErrorAction,
      getFieldValue: getFieldValueAction,
      setFieldValue: setFieldValueAction,
      clearFieldError: clearFieldErrorAction,
      focusField: focusFieldAction,
      getData: getDataAction,
      setData: setDataAction
    };

    // Build attributes
    const attributes: React.HTMLAttributes<HTMLElement> = {
      'role': 'form',
      'aria-disabled': disabled ? 'true' : undefined,
      'aria-readonly': readOnly ? 'true' : undefined,
      'aria-busy': loading || isSubmitting ? 'true' : undefined,
      'aria-live': 'polite',
      'aria-invalid': Object.keys(errors).length > 0
    };

    return {
      state,
      actions,
      rhf,
      attributes,
      getFieldAttributes,
      focusable,
      pressable,
      semantic
    };
  }, [
    rhf,
    disabled,
    loading,
    readOnly,
    currentStep,
    totalSteps,
    isSubmitting,
    submissionError,
    isSubmitted,
    lastSubmittedAt,
    submitAction,
    resetAction,
    setLoading,
    setDisabled,
    setReadOnly,
    nextStepAction,
    previousStepAction,
    goToStepAction,
    validateStepAction,
    validateAction,
    getFieldErrorAction,
    getFieldValueAction,
    setFieldValueAction,
    clearFieldErrorAction,
    focusFieldAction,
    getDataAction,
    setDataAction,
    errors,
    getFieldAttributes,
    focusable,
    pressable,
    semantic
  ]);
}