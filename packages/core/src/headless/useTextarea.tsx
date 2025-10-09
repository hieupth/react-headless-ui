import { useState, useCallback, useRef, useEffect } from 'react';
import { useSemanticMixin, useFocusableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps } from '../mixins';

export interface UseTextareaProps extends
  SemanticMixinProps,
  FocusableMixinProps {
  /** Default value */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Called when value changes */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether textarea is disabled */
  disabled?: boolean;
  /** Whether textarea is read-only */
  readOnly?: boolean;
  /** Whether textarea is required */
  required?: boolean;
  /** Maximum number of characters */
  maxLength?: number;
  /** Whether to auto-resize height */
  autoResize?: boolean;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows */
  maxRows?: number;
}

export interface UseTextareaState {
  /** Current value */
  value: string;
  /** Current disabled state */
  disabled: boolean;
  /** Current read-only state */
  readOnly: boolean;
  /** Current required state */
  required: boolean;
  /** Character count */
  charCount: number;
  /** Whether max length is reached */
  isMaxLengthReached: boolean;
}

export interface UseTextareaActions {
  /** Set value */
  setValue: (value: string) => void;
  /** Clear value */
  clear: () => void;
  /** Focus textarea */
  focus: () => void;
  /** Blur textarea */
  blur: () => void;
}

export interface UseTextareaReturns {
  /** Component state */
  state: UseTextareaState;
  /** Component actions */
  actions: UseTextareaActions;
  /** Composed props to pass to textarea element */
  props: Record<string, any>;
  /** Ref for textarea element */
  ref: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Headless hook for textarea component functionality.
 * Provides multi-line text input with auto-resize and validation.
 *
 * @param props - Component configuration props
 * @returns Textarea state, actions, and props
 */
export const useTextarea = (props: UseTextareaProps): UseTextareaReturns => {
  const {
    defaultValue = '',
    value: controlledValue,
    onChange,
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    maxLength,
    autoResize = false,
    minRows = 1,
    maxRows = 10,
    ...mixinsProps
  } = props;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Determine if controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Ref for textarea element
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  const updateHeight = useCallback(() => {
    if (!autoResize || !ref.current) return;

    const textarea = ref.current;

    // Reset height to auto to calculate scroll height
    textarea.style.height = 'auto';

    // Calculate new height
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 0;
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom) || 0;

    const minHeight = (minRows * lineHeight) + paddingTop + paddingBottom;
    const maxHeight = (maxRows * lineHeight) + paddingTop + paddingBottom;
    const scrollHeight = textarea.scrollHeight;

    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    textarea.style.height = `${newHeight}px`;
  }, [autoResize, minRows, maxRows]);

  // Update height on mount and when value changes
  useEffect(() => {
    updateHeight();
  }, [value, updateHeight]);

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    ...mixinsProps,
  });

  // Handle value change
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;

    // Check max length constraint
    if (maxLength !== undefined && newValue.length > maxLength) {
      return;
    }

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue);
    }

    // Auto-resize if enabled
    if (autoResize) {
      setTimeout(updateHeight, 0);
    }
  }, [isControlled, onChange, maxLength, autoResize, updateHeight]);

  // Set value programmatically
  const setValue = useCallback((newValue: string) => {
    if (maxLength !== undefined && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue);
    }

    // Auto-resize if enabled
    if (autoResize) {
      setTimeout(updateHeight, 0);
    }
  }, [isControlled, onChange, maxLength, autoResize, updateHeight]);

  // Clear value
  const clear = useCallback(() => {
    setValue('');
  }, [setValue]);

  // Focus methods
  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  // Calculate character count and max length status
  const charCount = value.length;
  const isMaxLengthReached = maxLength !== undefined && charCount >= maxLength;

  // Compose state
  const state = composeState<UseTextareaState>({
    value,
    disabled,
    readOnly,
    required,
    charCount,
    isMaxLengthReached,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseTextareaActions>({
    setValue,
    clear,
    focus,
    blur,
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic attributes
    value,
    placeholder,
    disabled,
    readOnly,
    required,
    maxLength,
    'data-length': charCount,
    'data-max-length': maxLength,
    'data-max-length-reached': isMaxLengthReached,

    // Event handlers
    onChange: handleChange,

    // Auto-resize styles
    ...(autoResize && {
      style: {
        resize: 'none',
        overflow: 'hidden',
        ...semantic.props.style,
      },
    }),

    // Mixin props
    ...semantic.props,
  });

  return {
    state,
    actions,
    props: composedProps,
    ref,
  };
};