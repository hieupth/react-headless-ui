/**
 * Hover Card headless hook following Flutter card patterns.
 * Provides hover-triggered card behavior with proper positioning and accessibility.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { SemanticMixinProps } from '../mixins';

export interface UseHoverCardProps extends
  SemanticMixinProps {
  /** Whether card is open */
  open?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Hover delay in milliseconds */
  hoverDelay?: number;
  /** Leave delay in milliseconds */
  leaveDelay?: number;
  /** Placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** Offset from trigger */
  offset?: number;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
}

export interface UseHoverCardState {
  /** Whether card is open */
  open: boolean;
  /** Current placement */
  placement: string;
  /** Whether mouse is over trigger */
  isOverTrigger: boolean;
  /** Whether mouse is over card */
  isOverCard: boolean;
}

export interface UseHoverCardActions {
  /** Open the card */
  open: () => void;
  /** Close the card */
  close: () => void;
  /** Toggle the card */
  toggle: () => void;
}

export interface UseHoverCardReturns {
  /** Component state */
  state: UseHoverCardState;
  /** Component actions */
  actions: UseHoverCardActions;
  /** Semantic attributes for the trigger */
  triggerAttributes: Record<string, any>;
  /** Semantic attributes for the card */
  cardAttributes: Record<string, any>;
  /** Props for the trigger element */
  triggerProps: Record<string, any>;
  /** Props for the card element */
  cardProps: Record<string, any>;
  /** Props for the arrow element */
  arrowProps: Record<string, any>;
  /** Ref for the trigger element */
  triggerRef: React.RefObject<HTMLElement>;
  /** Ref for the card element */
  cardRef: React.RefObject<HTMLDivElement>;
}

/**
 * Headless hover card hook providing hover-triggered popup behavior.
 * Supports delays, positioning, and proper accessibility.
 */
export const useHoverCard = (props: UseHoverCardProps = {}) => {
  const {
    open: controlledOpen,
    onOpenChange,
    hoverDelay = 300,
    leaveDelay = 150,
    placement = 'bottom',
    offset = 8,
    closeOnClickOutside = true,
    closeOnEscape = true,
    ...semanticProps
  } = props;

  // Internal state
  const [internalOpen, setInternalOpen] = useState(false);
  const [isOverTrigger, setIsOverTrigger] = useState(false);
  const [isOverCard, setIsOverCard] = useState(false);

  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Semantic attributes
  const semantic = useSemanticMixin({
    ...semanticProps
  });

  // Clear timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle opening
  const handleOpen = useCallback(() => {
    clearTimeout();
    timeoutRef.current = setTimeout(() => {
      if (!isControlled) {
        setInternalOpen(true);
      }
      onOpenChange?.(true);
    }, hoverDelay);
  }, [clearTimeout, hoverDelay, isControlled, onOpenChange]);

  // Handle closing
  const handleClose = useCallback(() => {
    clearTimeout();
    timeoutRef.current = setTimeout(() => {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }, leaveDelay);
  }, [clearTimeout, leaveDelay, isControlled, onOpenChange]);

  // Immediate open/close
  const openImmediate = useCallback(() => {
    clearTimeout();
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  }, [clearTimeout, isControlled, onOpenChange]);

  const closeImmediate = useCallback(() => {
    clearTimeout();
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  }, [clearTimeout, isControlled, onOpenChange]);

  // Toggle
  const toggle = useCallback(() => {
    if (open) {
      closeImmediate();
    } else {
      openImmediate();
    }
  }, [open, openImmediate, closeImmediate]);

  // Handle trigger mouse events
  const handleTriggerMouseEnter = useCallback(() => {
    setIsOverTrigger(true);
    if (!open) {
      handleOpen();
    }
  }, [open, handleOpen]);

  const handleTriggerMouseLeave = useCallback(() => {
    setIsOverTrigger(false);
    if (!isOverCard) {
      handleClose();
    }
  }, [isOverCard, handleClose]);

  // Handle card mouse events
  const handleCardMouseEnter = useCallback(() => {
    setIsOverCard(true);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setIsOverCard(false);
    if (!isOverTrigger) {
      handleClose();
    }
  }, [isOverTrigger, handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && closeOnEscape) {
        event.preventDefault();
        closeImmediate();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, closeImmediate]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        closeOnClickOutside &&
        triggerRef.current &&
        cardRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !cardRef.current.contains(event.target as Node)
      ) {
        closeImmediate();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, closeOnClickOutside, closeImmediate]);

  // Trigger props
  const triggerProps = useMemo(() => ({
    ref: triggerRef,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'data-state': open ? 'open' : 'closed',
    onMouseEnter: handleTriggerMouseEnter,
    onMouseLeave: handleTriggerMouseLeave,
    onClick: (event: React.MouseEvent) => {
      // Prevent default to avoid interfering with hover behavior
      event.preventDefault();
    },
    onFocus: () => {
      if (!open) {
        openImmediate();
      }
    },
    onBlur: () => {
      if (!isOverCard) {
        handleClose();
      }
    }
  }), [open, handleTriggerMouseEnter, handleTriggerMouseLeave, openImmediate, isOverCard, handleClose]);

  // Card props
  const cardProps = useMemo(() => ({
    ref: cardRef,
    role: 'dialog',
    'aria-modal': false,
    'data-state': open ? 'open' : 'closed',
    'data-placement': placement,
    onMouseEnter: handleCardMouseEnter,
    onMouseLeave: handleCardMouseLeave,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        closeImmediate();
      }
    }
  }), [open, placement, handleCardMouseEnter, handleCardMouseLeave, closeOnEscape, closeImmediate]);

  // Arrow props
  const arrowProps = useMemo(() => ({
    'data-arrow': true,
    'data-placement': placement
  }), [placement]);

  // Composed state
  const state = useMemo(() => composeState<UseHoverCardState>({
    open,
    placement,
    isOverTrigger,
    isOverCard
  }), [open, placement, isOverTrigger, isOverCard]);

  // Composed actions
  const actions = useMemo(() => ({
    open: openImmediate,
    close: closeImmediate,
    toggle
  }), [openImmediate, closeImmediate, toggle]);

  // Semantic attributes for trigger
  const triggerAttributes = useMemo(() => ({
    ...semantic,
    role: 'button',
    'aria-label': semantic['aria-label'] || 'Hover card trigger',
    tabIndex: 0
  }), [semantic]);

  // Semantic attributes for card
  const cardAttributes = useMemo(() => ({
    role: 'tooltip',
    'aria-label': semantic['aria-label'] || 'Hover card content'
  }), [semantic]);

  return {
    state,
    actions,
    triggerAttributes,
    cardAttributes,
    triggerProps,
    cardProps,
    arrowProps,
    triggerRef,
    cardRef
  };
};