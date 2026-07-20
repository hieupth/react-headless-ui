/**
 * InputGroup headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages input field grouping with layout and accessibility.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Input group item interface
 */
export interface InputGroupItem {
  /** Unique item identifier */
  id: string;
  /** Item type */
  type: 'input' | 'label' | 'helper' | 'error' | 'action' | 'prefix' | 'suffix';
  /** Item content */
  content: React.ReactNode;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is required */
  required?: boolean;
  /** Whether item has error */
  hasError?: boolean;
  /** Item value (for inputs) */
  value?: string;
  /** Item placeholder (for inputs) */
  placeholder?: string;
  /** Item input type (for inputs) */
  inputType?: string;
}

/**
 * Input group layout options
 */
export type InputGroupLayout = 'horizontal' | 'vertical' | 'stacked' | 'inline';

/**
 * Input group size options
 */
export type InputGroupSize = 'sm' | 'md' | 'lg';

/**
 * Input group state interface
 */
export interface InputGroupState {
  /** Current group value (object with item values) */
  values: Record<string, string>;
  /** Whether group is disabled */
  disabled: boolean;
  /** Current layout */
  layout: InputGroupLayout;
  /** Current size */
  size: InputGroupSize;
  /** Group items */
  items: InputGroupItem[];
  /** Currently focused item */
  focusedItem: string | null;
  /** Whether group has errors */
  hasErrors: boolean;
  /** Error messages */
  errors: Record<string, string[]>;
  /** Whether group is valid */
  isValid: boolean;
  /** Whether group is dirty (has been modified) */
  isDirty: boolean;
}

/**
 * Input group actions interface
 */
export interface InputGroupActions {
  /** Set value for an item */
  setValue: (itemId: string, value: string) => void;
  /** Get value for an item */
  getValue: (itemId: string) => string;
  /** Set multiple values */
  setValues: (values: Record<string, string>) => void;
  /** Clear all values */
  clear: () => void;
  /** Clear specific item */
  clearItem: (itemId: string) => void;
  /** Focus on an item */
  focusItem: (itemId: string) => void;
  /** Blur an item */
  blurItem: (itemId: string) => void;
  /** Add item to group */
  addItem: (item: InputGroupItem) => void;
  /** Remove item from group */
  removeItem: (itemId: string) => void;
  /** Update item */
  updateItem: (itemId: string, updates: Partial<InputGroupItem>) => void;
  /** Set error for an item */
  setError: (itemId: string, error: string) => void;
  /** Clear error for an item */
  clearError: (itemId: string) => void;
  /** Validate all items */
  validate: () => boolean;
  /** Reset group */
  reset: () => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
}

/**
 * Input group validation rule interface
 */
export interface InputGroupValidationRule {
  /** Rule name */
  name: string;
  /** Item identifier this rule applies to (or 'group' for group-level) */
  itemId: string;
  /** Validation function */
  validate: (value: string, allValues: Record<string, string>) => boolean;
  /** Error message */
  message: string;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
}

/**
 * Props for useInputGroup hook
 */
export interface UseInputGroupProps {
  /** Initial values for items */
  defaultValues?: Record<string, string>;
  /** Whether group is disabled */
  disabled?: boolean;
  /** Layout orientation */
  layout?: InputGroupLayout;
  /** Size variant */
  size?: InputGroupSize;
  /** Group items */
  items: InputGroupItem[];
  /** Validation rules */
  validationRules?: InputGroupValidationRule[];
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to auto-focus first input */
  autoFocus?: boolean;
  /** Callback when values change */
  onValuesChange?: (values: Record<string, string>, itemId: string) => void;
  /** Callback when item is focused */
  onItemFocus?: (itemId: string) => void;
  /** Callback when item is blurred */
  onItemBlur?: (itemId: string) => void;
  /** Callback when validation fails */
  onValidationError?: (errors: Record<string, string[]>) => void;
  /** Callback when group becomes valid */
  onValid?: () => void;
  /** Callback when group becomes invalid */
  onInvalid?: () => void;
  /** Ref to the group container element */
  groupRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for useInputGroup hook
 */
export interface UseInputGroupReturns {
  /** Current input group state */
  state: InputGroupState;
  /** Input group actions */
  actions: InputGroupActions;
  /** Accessibility attributes */
  attributes: React.HTMLAttributes<HTMLElement>;
  /** Get attributes for a specific item */
  getItemAttributes: (itemId: string) => React.HTMLAttributes<HTMLElement>;
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * InputGroup hook implementation
 * @param props - Input group configuration props
 * @returns Input group state, actions, and attributes
 */
export function useInputGroup(props: UseInputGroupProps): UseInputGroupReturns {
  const {
    defaultValues = {},
    disabled = false,
    layout = 'vertical',
    size = 'md',
    items: initialItems,
    validationRules = [],
    validateOnChange = true,
    validateOnBlur = true,
    autoFocus = false,
    onValuesChange,
    onItemFocus,
    onItemBlur,
    onValidationError,
    onValid,
    onInvalid,
    groupRef
  } = props;

  // State management
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [focusedItem, setFocusedItem] = useState<string | null>(autoFocus && initialItems.length > 0 ? initialItems.find(item => item.type === 'input')?.id || null : null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [items, setItems] = useState<InputGroupItem[]>(initialItems);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const groupElementRef = groupRef || internalRef;
  const itemRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Computed state
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors;

  /**
   * Validate a single item
   */
  const validateItem = useCallback((itemId: string, value: string): string[] => {
    const itemErrors: string[] = [];

    for (const rule of validationRules) {
      if (rule.itemId === itemId || rule.itemId === 'group') {
        try {
          if (!rule.validate(value, values)) {
            itemErrors.push(rule.message);
          }
        } catch (err) {
          // Validation function threw an error
          itemErrors.push('Validation error');
        }
      }
    }

    return itemErrors;
  }, [validationRules, values]);

  /**
   * Validate all items
   */
  const validateAll = useCallback((): boolean => {
    const allErrors: Record<string, string[]> = {};
    let hasValidationErrors = false;

    // Validate each input item
    items.filter(item => item.type === 'input').forEach(item => {
      const itemErrors = validateItem(item.id, values[item.id] || '');
      if (itemErrors.length > 0) {
        allErrors[item.id] = itemErrors;
        hasValidationErrors = true;
      }
    });

    // Validate group-level rules
    const groupErrors = validateItem('group', JSON.stringify(values));
    if (groupErrors.length > 0) {
      allErrors.group = groupErrors;
      hasValidationErrors = true;
    }

    setErrors(allErrors);

    if (hasValidationErrors) {
      onValidationError?.(allErrors);
      onInvalid?.();
    } else {
      onValid?.();
    }

    return !hasValidationErrors;
  }, [items, values, validateItem, onValidationError, onValid, onInvalid]);

  /**
   * Set value for an item
   */
  const setValueAction = useCallback((itemId: string, value: string) => {
    if (disabled) return;

    const newValues = { ...values, [itemId]: value };
    setValues(newValues);
    setIsDirty(true);

    // Clear existing errors for this item
    if (errors[itemId]) {
      const newErrors = { ...errors };
      delete newErrors[itemId];
      setErrors(newErrors);
    }

    // Validate on change if enabled
    if (validateOnChange) {
      const itemErrors = validateItem(itemId, value);
      if (itemErrors.length > 0) {
        setErrors(prev => ({ ...prev, [itemId]: itemErrors }));
      } else {
        // Re-validate all to ensure group-level rules are checked
        setTimeout(() => validateAll(), 0);
      }
    }

    onValuesChange?.(newValues, itemId);
  }, [disabled, values, errors, validateOnChange, validateItem, validateAll, onValuesChange]);

  /**
   * Get value for an item
   */
  const getValueAction = useCallback((itemId: string): string => {
    return values[itemId] || '';
  }, [values]);

  /**
   * Set multiple values
   */
  const setValuesAction = useCallback((newValues: Record<string, string>) => {
    if (disabled) return;

    setValues(newValues);
    setIsDirty(true);

    // Clear all errors
    setErrors({});

    // Validate all values if enabled
    if (validateOnChange) {
      setTimeout(() => validateAll(), 0);
    }

    onValuesChange?.(newValues, 'multiple');
  }, [disabled, validateOnChange, validateAll, onValuesChange]);

  /**
   * Clear all values
   */
  const clear = useCallback(() => {
    if (disabled) return;

    setValues({});
    setErrors({});
    setIsDirty(false);
    onValuesChange?.({}, 'clear');
  }, [disabled, onValuesChange]);

  /**
   * Clear specific item
   */
  const clearItem = useCallback((itemId: string) => {
    if (disabled) return;

    const newValues = { ...values };
    delete newValues[itemId];
    setValues(newValues);

    const newErrors = { ...errors };
    delete newErrors[itemId];
    setErrors(newErrors);

    onValuesChange?.(newValues, itemId);
  }, [disabled, values, errors, onValuesChange]);

  /**
   * Focus on an item
   */
  const focusItem = useCallback((itemId: string) => {
    if (disabled) return;

    setFocusedItem(itemId);
    itemRefs.current[itemId]?.focus();
    onItemFocus?.(itemId);
  }, [disabled, onItemFocus]);

  /**
   * Blur an item
   */
  const blurItem = useCallback((itemId: string) => {
    if (disabled) return;

    if (focusedItem === itemId) {
      setFocusedItem(null);
    }

    // Validate on blur if enabled
    if (validateOnBlur) {
      const itemErrors = validateItem(itemId, values[itemId] || '');
      if (itemErrors.length > 0) {
        setErrors(prev => ({ ...prev, [itemId]: itemErrors }));
      } else {
        // Re-validate all to ensure group-level rules are checked
        setTimeout(() => validateAll(), 0);
      }
    }

    onItemBlur?.(itemId);
  }, [disabled, focusedItem, validateOnBlur, validateItem, values, validateAll, onItemBlur]);

  /**
   * Add item to group
   */
  const addItem = useCallback((item: InputGroupItem) => {
    if (disabled) return;

    setItems(prev => [...prev, item]);
  }, [disabled]);

  /**
   * Remove item from group
   */
  const removeItem = useCallback((itemId: string) => {
    if (disabled) return;

    setItems(prev => prev.filter(item => item.id !== itemId));

    // Clean up value and errors
    const newValues = { ...values };
    delete newValues[itemId];
    setValues(newValues);

    const newErrors = { ...errors };
    delete newErrors[itemId];
    setErrors(newErrors);

    if (focusedItem === itemId) {
      setFocusedItem(null);
    }
  }, [disabled, values, errors, focusedItem]);

  /**
   * Update item
   */
  const updateItem = useCallback((itemId: string, updates: Partial<InputGroupItem>) => {
    if (disabled) return;

    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, [disabled]);

  /**
   * Set error for an item
   */
  const setError = useCallback((itemId: string, error: string) => {
    setErrors(prev => ({ ...prev, [itemId]: [error] }));
  }, []);

  /**
   * Clear error for an item
   */
  const clearError = useCallback((itemId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  }, []);

  /**
   * Reset group
   */
  const reset = useCallback(() => {
    if (disabled) return;

    setValues(defaultValues);
    setErrors({});
    setIsDirty(false);
    setFocusedItem(null);
    onValuesChange?.(defaultValues, 'reset');
  }, [disabled, defaultValues, onValuesChange]);

  /**
   * Navigate to next item
   */
  const navigateNext = useCallback(() => {
    if (disabled || !focusedItem) return;

    const inputItems = items.filter(item => item.type === 'input');
    const currentIndex = inputItems.findIndex(item => item.id === focusedItem);

    if (currentIndex < inputItems.length - 1) {
      focusItem(inputItems[currentIndex + 1].id);
    }
  }, [disabled, focusedItem, items, focusItem]);

  /**
   * Navigate to previous item
   */
  const navigatePrevious = useCallback(() => {
    if (disabled || !focusedItem) return;

    const inputItems = items.filter(item => item.type === 'input');
    const currentIndex = inputItems.findIndex(item => item.id === focusedItem);

    if (currentIndex > 0) {
      focusItem(inputItems[currentIndex - 1].id);
    }
  }, [disabled, focusedItem, items, focusItem]);

  /**
   * Get attributes for a specific item
   */
  const getItemAttributes = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return {};

    return {
      id: itemId,
      'aria-label': item.type === 'input' ? `Input field ${itemId}` : undefined,
      'aria-required': item.required,
      'aria-invalid': !!errors[item.id],
      'aria-describedby': errors[item.id] ? `${itemId}-error` : undefined,
      'data-type': item.type,
      'data-error': !!errors[item.id]
    };
  }, [items, errors]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || !focusedItem) return;

      switch (event.key) {
        case 'Tab':
          // Allow default tab behavior
          break;
        case 'Enter':
          if (layout === 'horizontal' || layout === 'inline') {
            event.preventDefault();
            navigateNext();
          }
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          if (layout !== 'vertical' || event.key === 'ArrowRight') {
            event.preventDefault();
            navigateNext();
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          if (layout !== 'vertical' || event.key === 'ArrowLeft') {
            event.preventDefault();
            navigatePrevious();
          }
          break;
      }
    };

    const element = groupElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [disabled, focusedItem, layout, navigateNext, navigatePrevious, groupElementRef]);

  // Build state
  const state: InputGroupState = useMemo(() => ({
    values,
    disabled,
    layout,
    size,
    items,
    focusedItem,
    hasErrors,
    errors,
    isValid,
    isDirty
  }), [values, disabled, layout, size, items, focusedItem, hasErrors, errors, isValid, isDirty]);

  // Build actions
  const actions: InputGroupActions = useMemo(() => ({
    setValue: setValueAction,
    getValue: getValueAction,
    setValues: setValuesAction,
    clear,
    clearItem,
    focusItem,
    blurItem,
    addItem,
    removeItem,
    updateItem,
    setError,
    clearError,
    validate: validateAll,
    reset,
    navigateNext,
    navigatePrevious
  }), [setValueAction, getValueAction, setValuesAction, clear, clearItem, focusItem, blurItem, addItem, removeItem, updateItem, setError, clearError, validateAll, reset, navigateNext, navigatePrevious]);

  // Build attributes
  const attributes: React.HTMLAttributes<HTMLElement> = useMemo(() => ({
    'role': 'group',
    'aria-orientation': layout === 'horizontal' || layout === 'inline' ? 'horizontal' : 'vertical',
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-invalid': hasErrors,
    ...(hasErrors && { 'aria-describedby': 'input-group-errors' })
  }), [layout, disabled, hasErrors]);

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: groupElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: groupElementRef
  });

  const semantic = useSemanticMixin({
    role: 'group',
    'aria-label': 'Input group',
    ref: groupElementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes,
    getItemAttributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, getItemAttributes, focusable, pressable, semantic]);
}