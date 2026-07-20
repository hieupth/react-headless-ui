/**
 * Slot headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages flexible content composition with element forwarding.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Slot state interface
 */
export interface SlotState {
  /** Whether slot is currently active */
  active: boolean;
  /** Whether slot is disabled */
  disabled: boolean;
  /** Whether slot is currently focused */
  focused: boolean;
  /** Current slot element */
  element: HTMLElement | null;
  /** Slot children content */
  children: React.ReactNode;
  /** Slot merge strategy */
  mergeStrategy: 'replace' | 'merge' | 'append' | 'prepend';
  /** Whether slot should clone children */
  clone: boolean;
  /** Slot forward ref */
  forwardedRef: React.Ref<HTMLElement> | null;
}

/**
 * Slot actions interface
 */
export interface SlotActions {
  /** Set slot active state */
  setActive: (active: boolean) => void;
  /** Set slot disabled state */
  setDisabled: (disabled: boolean) => void;
  /** Focus slot */
  focus: () => void;
  /** Blur slot */
  blur: () => void;
  /** Get slot element */
  getElement: () => HTMLElement | null;
  /** Set merge strategy */
  setMergeStrategy: (strategy: 'replace' | 'merge' | 'append' | 'prepend') => void;
  /** Set clone behavior */
  setClone: (clone: boolean) => void;
  /** Merge props with children */
  mergeProps: (childProps: any, slotProps: any) => any;
  /** Forward ref to child */
  forwardRef: (ref: React.RefObject<HTMLElement | null>) => void;
  /** Update children */
  updateChildren: (children: React.ReactNode) => void;
}

/**
 * Props for useSlot hook
 */
export interface UseSlotProps {
  /** Initial active state */
  defaultActive?: boolean;
  /** Controlled active state */
  active?: boolean;
  /** Whether slot is disabled */
  disabled?: boolean;
  /** Initial children content */
  children?: React.ReactNode;
  /** Merge strategy for props */
  mergeStrategy?: 'replace' | 'merge' | 'append' | 'prepend';
  /** Whether to clone children */
  clone?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Key up handler */
  onKeyUp?: (event: React.KeyboardEvent) => void;
  /** Mouse enter handler */
  onMouseEnter?: (event: React.MouseEvent) => void;
  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent) => void;
  /** Slot ref */
  slotRef?: React.RefObject<HTMLElement | null>;
  /** Forward ref from parent */
  forwardedRef?: React.RefObject<HTMLElement | null>;
  /** Whether to allow ref forwarding */
  allowRefForward?: boolean;
  /** Props to merge with children */
  mergeProps?: Record<string, any>;
  /** Exclude these props from merging */
  excludeProps?: string[];
  /** Priority props (override children props) */
  priorityProps?: string[];
}

/**
 * Return type for useSlot hook
 */
export interface UseSlotReturns {
  /** Current slot state */
  state: SlotState;
  /** Slot actions */
  actions: SlotActions;
  /** Slot attributes */
  attributes: {
    'data-slot'?: string;
    'data-active'?: boolean;
    'data-disabled'?: boolean;
    'data-focused'?: boolean;
    'data-merge-strategy'?: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Default prop exclusions for merging
 */
const DEFAULT_EXCLUDE_PROPS = [
  'children',
  'key',
  'ref',
  'className',
  'style'
];

/**
 * Default priority props
 */
const DEFAULT_PRIORITY_PROPS = [
  'aria-',
  'data-',
  'role',
  'tabIndex'
];

/**
 * Check if prop should be prioritized
 */
const isPriorityProp = (prop: string, priorityProps: string[]): boolean => {
  return priorityProps.some(priority => {
    if (priority.endsWith('-')) {
      return prop.startsWith(priority);
    }
    return prop === priority;
  });
};

/**
 * Merge props according to strategy
 */
const mergePropsByStrategy = (
  childProps: any,
  slotProps: any,
  strategy: 'replace' | 'merge' | 'append' | 'prepend',
  excludeProps: string[],
  priorityProps: string[]
): any => {
  const merged = { ...childProps };

  // Remove excluded props from slot props
  const filteredSlotProps = { ...slotProps };
  excludeProps.forEach(prop => delete filteredSlotProps[prop]);

  switch (strategy) {
    case 'replace':
      // Slot props completely replace child props (except excluded)
      Object.keys(filteredSlotProps).forEach(key => {
        if (isPriorityProp(key, priorityProps)) {
          // Priority props always override
          merged[key] = filteredSlotProps[key];
        } else {
          merged[key] = filteredSlotProps[key];
        }
      });
      break;

    case 'merge':
      // Merge props, slot props take priority
      Object.keys(filteredSlotProps).forEach(key => {
        if (isPriorityProp(key, priorityProps)) {
          merged[key] = filteredSlotProps[key];
        } else if (childProps[key] === undefined) {
          merged[key] = filteredSlotProps[key];
        }
      });
      break;

    case 'append':
      // Append slot props to child props
      Object.keys(filteredSlotProps).forEach(key => {
        const suffix = 'data-slot-append';
        merged[`${key}-${suffix}`] = filteredSlotProps[key];
      });
      break;

    case 'prepend':
      // Prepend slot props to child props
      Object.keys(filteredSlotProps).forEach(key => {
        const suffix = 'data-slot-prepend';
        merged[`${key}-${suffix}`] = filteredSlotProps[key];
      });
      break;
  }

  return merged;
};

/**
 * Slot hook implementation
 * @param props - Slot configuration props
 * @returns Slot state, actions, and attributes
 */
export function useSlot(props: UseSlotProps): UseSlotReturns {
  const {
    defaultActive = false,
    active: controlledActive,
    disabled = false,
    children: initialChildren = null,
    mergeStrategy = 'merge',
    clone = false,
    slotRef,
    forwardedRef,
    allowRefForward = true,
    mergeProps: additionalMergeProps = {},
    excludeProps = DEFAULT_EXCLUDE_PROPS,
    priorityProps = DEFAULT_PRIORITY_PROPS,
    onFocus,
    onBlur
  } = props;

  // State management
  const [internalActive, setInternalActive] = useState<boolean>(defaultActive);
  const [focused, setFocused] = useState<boolean>(false);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [children, setChildrenState] = useState<React.ReactNode>(initialChildren);
  const [currentMergeStrategy, setCurrentMergeStrategy] = useState<'replace' | 'merge' | 'append' | 'prepend'>(mergeStrategy);
  const [shouldClone, setShouldClone] = useState<boolean>(clone);
  const [currentForwardedRef, setCurrentForwardedRef] = useState<React.RefObject<HTMLElement | null> | null>(forwardedRef || null);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const slotElementRef = slotRef || internalRef;

  // Determine if component is controlled
  const isControlled = controlledActive !== undefined;
  const currentActive = isControlled ? controlledActive : internalActive;

  /**
   * Set active state
   */
  const setActiveAction = useCallback((newActive: boolean) => {
    if (!isControlled) {
      setInternalActive(newActive);
    }
  }, [isControlled]);

  /**
   * Set disabled state
   */
  const setDisabledAction = useCallback((newDisabled: boolean) => {
    // Disabled state is managed externally via props
    // This action is for consistency with other hooks
  }, []);

  /**
   * Focus slot
   */
  const focusAction = useCallback(() => {
    slotElementRef.current?.focus();
  }, []);

  /**
   * Blur slot
   */
  const blurAction = useCallback(() => {
    slotElementRef.current?.blur();
  }, []);

  /**
   * Focus/blur handlers that track the focused state and forward to the
   * consumer's onFocus/onBlur callbacks. Wired onto the slot element so
   * state.focused / data-focused reflect actual focus.
   */
  const handleFocus = useCallback((event: React.FocusEvent) => {
    setFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  /**
   * Get slot element
   */
  const getElementAction = useCallback(() => {
    return slotElementRef.current;
  }, []);

  /**
   * Set merge strategy
   */
  const setMergeStrategyAction = useCallback((strategy: 'replace' | 'merge' | 'append' | 'prepend') => {
    setCurrentMergeStrategy(strategy);
  }, []);

  /**
   * Set clone behavior
   */
  const setCloneAction = useCallback((newClone: boolean) => {
    setShouldClone(newClone);
  }, []);

  /**
   * Merge props with children
   */
  const mergePropsAction = useCallback((childProps: any, slotProps: any) => {
    return mergePropsByStrategy(
      childProps,
      { ...slotProps, ...additionalMergeProps },
      currentMergeStrategy,
      excludeProps,
      priorityProps
    );
  }, [currentMergeStrategy, excludeProps, priorityProps, additionalMergeProps]);

  /**
   * Forward ref to child
   */
  const forwardRefAction = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    if (allowRefForward) {
      setCurrentForwardedRef(ref);
    }
  }, [allowRefForward]);

  /**
   * Update children
   */
  const updateChildrenAction = useCallback((newChildren: React.ReactNode) => {
    setChildrenState(newChildren);
  }, []);

  // Track element reference
  useEffect(() => {
    if (slotElementRef.current !== element) {
      setElement(slotElementRef.current);
    }
  }, [slotElementRef, element]);

  // Handle ref forwarding. currentForwardedRef is stored via setState, so it can
  // only ever hold an object ref (function refs would be invoked as state updaters);
  // only the object-ref assignment path is reachable.
  useEffect(() => {
    if (allowRefForward && currentForwardedRef && slotElementRef.current) {
      if (currentForwardedRef.current) {
        currentForwardedRef.current = slotElementRef.current;
      }
    }
  }, [allowRefForward, currentForwardedRef, slotElementRef]);

  // Build state
  const state: SlotState = {
    active: currentActive,
    disabled,
    focused,
    element,
    children,
    mergeStrategy: currentMergeStrategy,
    clone: shouldClone,
    forwardedRef: currentForwardedRef
  };

  // Build actions
  const actions: SlotActions = {
    setActive: setActiveAction,
    setDisabled: setDisabledAction,
    focus: focusAction,
    blur: blurAction,
    getElement: getElementAction,
    setMergeStrategy: setMergeStrategyAction,
    setClone: setCloneAction,
    mergeProps: mergePropsAction,
    forwardRef: forwardRefAction,
    updateChildren: updateChildrenAction
  };

  // Build attributes
  const attributes = {
    'data-slot': 'true',
    'data-active': currentActive || undefined,
    'data-disabled': disabled || undefined,
    'data-focused': focused || undefined,
    'data-merge-strategy': currentMergeStrategy,
    onFocus: handleFocus,
    onBlur: handleBlur
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: slotElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: slotElementRef
  });

  const semantic = useSemanticMixin({
    role: 'group',
    ref: slotElementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}