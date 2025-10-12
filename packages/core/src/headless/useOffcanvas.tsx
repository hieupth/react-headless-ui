/**
 * Offcanvas headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages slide-in panel state and interactions.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Offcanvas position types
 */
export type OffcanvasPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Offcanvas size presets
 */
export type OffcanvasSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Offcanvas state interface
 */
export interface OffcanvasState {
  /** Whether offcanvas is open */
  open: boolean;
  /** Whether offcanvas is opening/closing (animating) */
  transitioning: boolean;
  /** Whether offcanvas is disabled */
  disabled: boolean;
  /** Current position */
  position: OffcanvasPosition;
  /** Current size */
  size: OffcanvasSize;
  /** Whether backdrop is shown */
  showBackdrop: boolean;
  /** Whether to close on backdrop click */
  closeOnBackdropClick: boolean;
  /** Whether to close on escape key */
  closeOnEscape: boolean;
  /** Whether to trap focus inside */
  trapFocus: boolean;
  /** Whether to restore focus on close */
  restoreFocus: boolean;
  /** Animation duration */
  animationDuration: number;
  /** Whether to prevent body scroll when open */
  preventBodyScroll: boolean;
  /** Whether offcanvas is persistent (doesn't close on outside click) */
  persistent: boolean;
}

/**
 * Offcanvas actions interface
 */
export interface OffcanvasActions {
  /** Open offcanvas */
  open: () => void;
  /** Close offcanvas */
  close: () => void;
  /** Toggle offcanvas */
  toggle: () => void;
  /** Set position */
  setPosition: (position: OffcanvasPosition) => void;
  /** Set size */
  setSize: (size: OffcanvasSize) => void;
  /** Set backdrop visibility */
  setShowBackdrop: (show: boolean) => void;
  /** Set animation duration */
  setAnimationDuration: (duration: number) => void;
  /** Set persistent mode */
  setPersistent: (persistent: boolean) => void;
  /** Get offcanvas element */
  getOffcanvasElement: () => HTMLElement | null;
  /** Get trigger element */
  getTriggerElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    'aria-modal': boolean;
    'aria-hidden': boolean;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    role: string;
  };
  /** Focus first focusable element */
  focusFirstElement: () => void;
  /** Focus last focusable element */
  focusLastElement: () => void;
  /** Get focusable elements */
  getFocusableElements: () => HTMLElement[];
}

/**
 * Props for useOffcanvas hook
 */
export interface UseOffcanvasProps {
  /** Whether offcanvas is initially open */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Offcanvas position */
  position?: OffcanvasPosition;
  /** Offcanvas size */
  size?: OffcanvasSize;
  /** Whether offcanvas is disabled */
  disabled?: boolean;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Whether to trap focus */
  trapFocus?: boolean;
  /** Whether to restore focus on close */
  restoreFocus?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether to prevent body scroll */
  preventBodyScroll?: boolean;
  /** Whether offcanvas is persistent */
  persistent?: boolean;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Toggle handler */
  onToggle?: (open: boolean) => void;
  /** Position change handler */
  onPositionChange?: (position: OffcanvasPosition) => void;
  /** Size change handler */
  onSizeChange?: (size: OffcanvasSize) => void;
  /** Offcanvas element ref */
  offcanvasRef?: React.RefObject<HTMLElement>;
  /** Trigger element ref */
  triggerRef?: React.RefObject<HTMLElement>;
  /** Custom close button selector */
  closeButtonSelector?: string;
  /** Container for portal */
  container?: HTMLElement | null;
  /** Z-index for offcanvas */
  zIndex?: number;
  /** Custom body class when open */
  bodyOpenClass?: string;
  /** Custom backdrop class */
  backdropClass?: string;
}

/**
 * Return type for useOffcanvas hook
 */
export interface UseOffcanvasReturns {
  /** Current offcanvas state */
  state: OffcanvasState;
  /** Offcanvas actions */
  actions: OffcanvasActions;
  /** Accessibility attributes */
  attributes: {
    'aria-modal': boolean;
    'aria-hidden': boolean;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    role: string;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    open: string;
    closed: string;
    transitioning: string;
    disabled: string;
    backdrop: string;
    [key: string]: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Default animation duration
 */
const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Focusable elements selector
 */
const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

/**
 * Offcanvas hook implementation
 * @param props - Offcanvas configuration props
 * @returns Offcanvas state, actions, and attributes
 */
export function useOffcanvas(props: UseOffcanvasProps): UseOffcanvasReturns {
  const {
    defaultOpen = false,
    open: controlledOpen,
    position = 'right',
    size = 'md',
    disabled = false,
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    trapFocus = true,
    restoreFocus = true,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    preventBodyScroll = true,
    persistent = false,
    onOpen,
    onClose,
    onToggle,
    onPositionChange,
    onSizeChange,
    offcanvasRef,
    triggerRef,
    closeButtonSelector = '[data-offcanvas-close]',
    container,
    zIndex = 1050,
    bodyOpenClass = 'offcanvas-open',
    backdropClass = 'offcanvas-backdrop'
  } = props;

  // State management
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<OffcanvasPosition>(position);
  const [currentSize, setCurrentSize] = useState<OffcanvasSize>(size);
  const [internalShowBackdrop, setInternalShowBackdrop] = useState<boolean>(showBackdrop);
  const [internalAnimationDuration, setInternalAnimationDuration] = useState<number>(animationDuration);
  const [internalPersistent, setInternalPersistent] = useState<boolean>(persistent);
  const [bodyScrollLocked, setBodyScrollLocked] = useState<boolean>(false);

  // Refs
  const internalOffcanvasRef = useRef<HTMLElement>(null);
  const internalTriggerRef = useRef<HTMLElement>(null);
  const offcanvasElement = offcanvasRef || internalOffcanvasRef;
  const triggerElement = triggerRef || internalTriggerRef;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Determine if component is controlled
  const isOpenControlled = controlledOpen !== undefined;
  const currentOpen = isOpenControlled ? controlledOpen : internalOpen;

  /**
   * Handle body scroll lock
   */
  const lockBodyScroll = useCallback(() => {
    if (!preventBodyScroll || bodyScrollLocked) return;

    document.body.style.overflow = 'hidden';
    document.body.classList.add(bodyOpenClass);
    setBodyScrollLocked(true);
  }, [preventBodyScroll, bodyScrollLocked, bodyOpenClass]);

  /**
   * Unlock body scroll
   */
  const unlockBodyScroll = useCallback(() => {
    if (!bodyScrollLocked) return;

    document.body.style.overflow = '';
    document.body.classList.remove(bodyOpenClass);
    setBodyScrollLocked(false);
  }, [bodyScrollLocked, bodyOpenClass]);

  /**
   * Handle escape key
   */
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape && currentOpen && !internalPersistent) {
      actions.closeAction();
    }
  }, [closeOnEscape, currentOpen, internalPersistent]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback((event: MouseEvent) => {
    if (closeOnBackdropClick && !internalPersistent && event.target === event.currentTarget) {
      actions.closeAction();
    }
  }, [closeOnBackdropClick, internalPersistent]);

  /**
   * Handle close button clicks
   */
  const handleCloseButtonClick = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const closeButton = target.closest(closeButtonSelector);
    if (closeButton && offcanvasElement.current?.contains(closeButton)) {
      actions.closeAction();
    }
  }, [closeButtonSelector, offcanvasElement]);

  /**
   * Get focusable elements inside offcanvas
   */
  const getFocusableElementsAction = useCallback((): HTMLElement[] => {
    if (!offcanvasElement.current) return [];

    return Array.from(
      offcanvasElement.current.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR)
    ) as HTMLElement[];
  }, [offcanvasElement]);

  /**
   * Focus first focusable element
   */
  const focusFirstElementAction = useCallback(() => {
    if (!trapFocus) return;

    const elements = getFocusableElementsAction();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [trapFocus, getFocusableElementsAction]);

  /**
   * Focus last focusable element
   */
  const focusLastElementAction = useCallback(() => {
    if (!trapFocus) return;

    const elements = getFocusableElementsAction();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [trapFocus, getFocusableElementsAction]);

  /**
   * Handle focus trap
   */
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !currentOpen) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElementsAction();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [trapFocus, currentOpen, getFocusableElementsAction]);

  /**
   * Open offcanvas
   */
  const openAction = useCallback(() => {
    if (disabled) return;

    // Store current active element for focus restoration
    previousActiveElement.current = document.activeElement as HTMLElement;

    if (!isOpenControlled) {
      setInternalOpen(true);
    }

    setTransitioning(true);
    lockBodyScroll();

    // Focus trap setup
    setTimeout(() => {
      focusFirstElementAction();
      setTransitioning(false);
    }, 10);

    onOpen?.();
    onToggle?.(true);
  }, [disabled, isOpenControlled, lockBodyScroll, focusFirstElementAction, onOpen, onToggle]);

  /**
   * Close offcanvas
   */
  const closeAction = useCallback(() => {
    if (disabled) return;

    setTransitioning(true);

    setTimeout(() => {
      if (!isOpenControlled) {
        setInternalOpen(false);
      }

      unlockBodyScroll();
      setTransitioning(false);

      // Restore focus
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }, internalAnimationDuration);

    onClose?.();
    onToggle?.(false);
  }, [disabled, isOpenControlled, unlockBodyScroll, internalAnimationDuration, restoreFocus, onClose, onToggle]);

  /**
   * Toggle offcanvas
   */
  const toggleAction = useCallback(() => {
    if (currentOpen) {
      closeAction();
    } else {
      openAction();
    }
  }, [currentOpen, closeAction, openAction]);

  /**
   * Set position
   */
  const setPositionAction = useCallback((newPosition: OffcanvasPosition) => {
    setCurrentPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [onPositionChange]);

  /**
   * Set size
   */
  const setSizeAction = useCallback((newSize: OffcanvasSize) => {
    setCurrentSize(newSize);
    onSizeChange?.(newSize);
  }, [onSizeChange]);

  /**
   * Set backdrop visibility
   */
  const setShowBackdropAction = useCallback((show: boolean) => {
    setInternalShowBackdrop(show);
  }, []);

  /**
   * Set animation duration
   */
  const setAnimationDurationAction = useCallback((duration: number) => {
    setInternalAnimationDuration(duration);
  }, []);

  /**
   * Set persistent mode
   */
  const setPersistentAction = useCallback((persistentValue: boolean) => {
    setInternalPersistent(persistentValue);
  }, []);

  /**
   * Get offcanvas element
   */
  const getOffcanvasElementAction = useCallback(() => {
    return offcanvasElement.current;
  }, [offcanvasElement]);

  /**
   * Get trigger element
   */
  const getTriggerElementAction = useCallback(() => {
    return triggerElement.current;
  }, [triggerElement]);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    return {
      'aria-modal': currentOpen,
      'aria-hidden': !currentOpen,
      role: 'dialog'
    };
  }, [currentOpen]);

  // Global event listeners
  useEffect(() => {
    if (currentOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('click', handleCloseButtonClick);
      document.addEventListener('keydown', handleFocusTrap);

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('click', handleCloseButtonClick);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [currentOpen, handleEscapeKey, handleCloseButtonClick, handleFocusTrap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unlockBodyScroll();
    };
  }, [unlockBodyScroll]);

  // Build state
  const state: OffcanvasState = {
    open: currentOpen,
    transitioning,
    disabled,
    position: currentPosition,
    size: currentSize,
    showBackdrop: internalShowBackdrop,
    closeOnBackdropClick,
    closeOnEscape,
    trapFocus,
    restoreFocus,
    animationDuration: internalAnimationDuration,
    preventBodyScroll,
    persistent: internalPersistent
  };

  // Build actions
  const actions: OffcanvasActions = {
    open: openAction,
    close: closeAction,
    toggle: toggleAction,
    setPosition: setPositionAction,
    setSize: setSizeAction,
    setShowBackdrop: setShowBackdropAction,
    setAnimationDuration: setAnimationDurationAction,
    setPersistent: setPersistentAction,
    getOffcanvasElement: getOffcanvasElementAction,
    getTriggerElement: getTriggerElementAction,
    getAccessibilityProps: getAccessibilityPropsAction,
    focusFirstElement: focusFirstElementAction,
    focusLastElement: focusLastElementAction,
    getFocusableElements: getFocusableElementsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS classes
  const classes = {
    base: 'offcanvas',
    open: currentOpen ? 'offcanvas-open' : 'offcanvas-closed',
    closed: !currentOpen ? 'offcanvas-closed' : 'offcanvas-open',
    transitioning: transitioning ? 'offcanvas-transitioning' : '',
    disabled: disabled ? 'offcanvas-disabled' : '',
    backdrop: internalShowBackdrop ? backdropClass : '',
    [`offcanvas-${currentPosition}`]: true,
    [`offcanvas-${currentSize}`]: true,
    'offcanvas-backdrop': internalShowBackdrop
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: offcanvasElement
  });

  const pressable = usePressableMixin({
    disabled,
    ref: offcanvasElement
  });

  const semantic = useSemanticMixin({
    role: 'dialog',
    ref: offcanvasElement
  });

  return {
    state,
    actions,
    attributes: accessibilityProps,
    classes,
    focusable,
    pressable,
    semantic
  };
}