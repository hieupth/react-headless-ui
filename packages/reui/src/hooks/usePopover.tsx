/**
 * Popover headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages floating panel appearing relative to trigger element.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Popover position options
 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/**
 * Popover trigger options
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

/**
 * Popover state interface
 */
export interface PopoverState {
  /** Whether popover is currently open */
  open: boolean;
  /** Current position of the popover */
  position: PopoverPosition;
  /** Whether popover is disabled */
  disabled: boolean;
  /** Whether trigger element is focused */
  isTriggerFocused: boolean;
  /** Whether trigger element is hovered */
  isTriggerHovered: boolean;
}

/**
 * Popover actions interface
 */
export interface PopoverActions {
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle popover open state */
  toggle: () => void;
  /** Set position */
  setPosition: (position: PopoverPosition) => void;
  /** Handle trigger click */
  handleTriggerClick: () => void;
  /** Handle trigger mouse enter */
  handleTriggerMouseEnter: () => void;
  /** Handle trigger mouse leave */
  handleTriggerMouseLeave: () => void;
  /** Handle trigger focus */
  handleTriggerFocus: () => void;
  /** Handle trigger blur */
  handleTriggerBlur: () => void;
}

/**
 * Props for usePopover hook
 */
export interface UsePopoverProps {
  /** Whether popover is initially open */
  defaultOpen?: boolean;
  /** Whether popover is disabled */
  disabled?: boolean;
  /** Position of the popover relative to trigger */
  position?: PopoverPosition;
  /** What triggers the popover */
  trigger?: PopoverTrigger;
  /** Delay in milliseconds before opening on hover */
  openDelay?: number;
  /** Delay in milliseconds before closing on leave */
  closeDelay?: number;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Whether to close when trigger loses focus */
  closeOnTriggerBlur?: boolean;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
  /** Controlled open state */
  open?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Ref to the trigger element */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Ref to the content element */
  contentRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for usePopover hook
 */
export interface UsePopoverReturns {
  /** Current popover state */
  state: PopoverState;
  /** Popover actions */
  actions: PopoverActions;
  /** Trigger element attributes */
  triggerAttributes: React.HTMLAttributes<HTMLElement>;
  /** Content element attributes */
  contentAttributes: React.HTMLAttributes<HTMLElement>;
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Popover hook implementation
 * @param props - Popover configuration props
 * @returns Popover state, actions, and attributes
 */
export function usePopover(props: UsePopoverProps = {}): UsePopoverReturns {
  const {
    defaultOpen = false,
    disabled = false,
    position = 'bottom',
    trigger = 'click',
    openDelay = 300,
    closeDelay = 150,
    closeOnClickOutside = true,
    closeOnEscape = true,
    closeOnTriggerBlur = true,
    onOpen,
    onClose,
    open: controlledOpen,
    onOpenChange,
    triggerRef,
    contentRef
  } = props;

  // State management
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isTriggerFocused, setIsTriggerFocused] = useState(false);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);

  // Refs
  const internalTriggerRef = useRef<HTMLElement>(null);
  const internalContentRef = useRef<HTMLElement>(null);
  const triggerElementRef = triggerRef || internalTriggerRef;
  const contentElementRef = contentRef || internalContentRef;

  // Timer refs
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Clear any pending timers
  const clearTimers = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Update internal open state
  const updateOpenState = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);

    if (newOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isControlled, onOpenChange, onOpen, onClose]);

  // Open popover
  const openPopover = useCallback(() => {
    if (disabled) return;

    clearTimers();
    updateOpenState(true);
  }, [disabled, clearTimers, updateOpenState]);

  // Close popover
  const closePopover = useCallback(() => {
    if (disabled) return;

    clearTimers();
    updateOpenState(false);
  }, [disabled, clearTimers, updateOpenState]);

  // Toggle popover
  const togglePopover = useCallback(() => {
    if (open) {
      closePopover();
    } else {
      openPopover();
    }
  }, [open, openPopover, closePopover]);

  // Set position
  const setPosition = useCallback((newPosition: PopoverPosition) => {
    setCurrentPosition(newPosition);
  }, []);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled || trigger !== 'click') return;

    // reason: the guard above already returned when trigger !== 'click',
    // so we can toggle unconditionally here.
    togglePopover();
  }, [disabled, trigger, togglePopover]);

  // Handle trigger mouse enter
  const handleTriggerMouseEnter = useCallback(() => {
    if (disabled || !(trigger === 'hover' || trigger === 'focus')) return;

    setIsTriggerHovered(true);
    if (trigger === 'hover') {
      clearTimers();
      openTimeoutRef.current = setTimeout(() => {
        openPopover();
      }, openDelay);
    }
  }, [disabled, trigger, openDelay, clearTimers, openPopover]);

  // Handle trigger mouse leave
  const handleTriggerMouseLeave = useCallback(() => {
    if (disabled || !(trigger === 'hover' || trigger === 'focus')) return;

    setIsTriggerHovered(false);
    if (trigger === 'hover') {
      clearTimers();
      closeTimeoutRef.current = setTimeout(() => {
        closePopover();
      }, closeDelay);
    }
  }, [disabled, trigger, closeDelay, clearTimers, closePopover]);

  // Handle trigger focus
  const handleTriggerFocus = useCallback(() => {
    if (disabled || !(trigger === 'focus' || trigger === 'hover')) return;

    setIsTriggerFocused(true);
    if (trigger === 'focus') {
      openPopover();
    }
  }, [disabled, trigger, openPopover]);

  // Handle trigger blur
  const handleTriggerBlur = useCallback(() => {
    if (disabled || !(trigger === 'focus' || trigger === 'hover')) return;

    setIsTriggerFocused(false);
    if (trigger === 'focus' && closeOnTriggerBlur) {
      closePopover();
    }
  }, [disabled, trigger, closeOnTriggerBlur, closePopover]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && closeOnEscape) {
        event.preventDefault();
        closePopover();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, closePopover]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        closeOnClickOutside &&
        triggerElementRef.current &&
        contentElementRef.current &&
        !triggerElementRef.current.contains(event.target as Node) &&
        !contentElementRef.current.contains(event.target as Node)
      ) {
        closePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnClickOutside, triggerElementRef, contentElementRef, closePopover]);

  // Sync controlled state
  useEffect(() => {
    if (isControlled && controlledOpen !== internalOpen) {
      updateOpenState(controlledOpen);
    }
  }, [isControlled, controlledOpen, internalOpen, updateOpenState]);

  // Build state
  const state: PopoverState = {
    open,
    position: currentPosition,
    disabled,
    isTriggerFocused,
    isTriggerHovered
  };

  // Build actions
  const actions: PopoverActions = {
    open: openPopover,
    close: closePopover,
    toggle: togglePopover,
    setPosition,
    handleTriggerClick,
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
    handleTriggerFocus,
    handleTriggerBlur
  };

  // Build trigger attributes
  const triggerAttributes = {
    'aria-expanded': open,
    'aria-haspopup': 'dialog' as const,
    'role': 'button',
    'tabIndex': disabled ? -1 : 0
  };

  // Build content attributes
  const contentAttributes: React.HTMLAttributes<HTMLElement> = {
    'role': 'dialog',
    'aria-labelledby': triggerElementRef.current?.id,
    'aria-modal': 'false'
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: triggerElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: triggerElementRef
  });

  const semantic = useSemanticMixin({
    role: 'button',
    'aria-label': 'Popover trigger',
    ref: triggerElementRef
  });

  return useMemo(() => ({
    state,
    actions,
    triggerAttributes,
    contentAttributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, triggerAttributes, contentAttributes, focusable, pressable, semantic]);
}