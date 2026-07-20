/**
 * Tooltip headless hook following Flutter patterns.
 * Provides tooltip behavior with advanced positioning and timing.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, SemanticMixinProps } from '../mixins';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

export interface UseTooltipProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Whether tooltip is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Tooltip position relative to trigger */
  position?: TooltipPosition;
  /** Tooltip trigger method */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** Show delay in milliseconds */
  delayShow?: number;
  /** Hide delay in milliseconds */
  delayHide?: number;
  /** Whether tooltip should have arrow */
  arrow?: boolean;
  /** Whether tooltip should disable pointer events */
  disablePointerEvents?: boolean;
  /** Whether tooltip should be interactive */
  interactive?: boolean;
  /** Tooltip offset from trigger */
  offset?: number;
  /** Maximum width of tooltip */
  maxWidth?: number;
  /** Whether tooltip should flip if insufficient space */
  flip?: boolean;
  /** Whether tooltip should shift to stay in viewport */
  shift?: boolean;
}

export interface UseTooltipState {
  /** Current open state */
  open: boolean;
  /** Current focus state */
  focused: boolean;
  /** Whether tooltip is being shown (delayed) */
  showing: boolean;
  /** Whether tooltip is being hidden (delayed) */
  hiding: boolean;
}

export interface UseTooltipActions {
  /** Show tooltip */
  show: () => void;
  /** Hide tooltip */
  hide: () => void;
  /** Toggle tooltip */
  toggle: () => void;
  /** Handle trigger events */
  handleTriggerEnter: () => void;
  handleTriggerLeave: () => void;
  handleTriggerFocus: () => void;
  handleTriggerBlur: () => void;
  handleTriggerClick: () => void;
  /** Handle tooltip events */
  handleTooltipEnter: () => void;
  handleTooltipLeave: () => void;
  /** Calculate tooltip position */
  calculatePosition: () => { x: number; y: number; position: TooltipPosition };
}

export interface UseTooltipReturns extends UseTooltipState, UseTooltipActions {
  /** Semantic attributes for trigger element */
  triggerAttributes: Record<string, any>;
  /** Semantic attributes for tooltip element */
  tooltipAttributes: Record<string, any>;
  /** Reference to trigger element */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Reference to tooltip element */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  /** Computed position */
  position: TooltipPosition;
  /** Computed styles for tooltip */
  tooltipStyles: React.CSSProperties;
  /** Arrow styles */
  arrowStyles: React.CSSProperties;
}

/**
 * Calculate tooltip position based on trigger and available space.
 */
const calculateTooltipPosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
  offset: number,
  flip: boolean
): { x: number; y: number; position: TooltipPosition } => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  };

  let x = 0;
  let y = 0;
  let finalPosition = position;

  // Calculate positions
  const positions = {
    'top': {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.top - tooltipRect.height - offset
    },
    'bottom': {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.bottom + offset
    },
    'left': {
      x: triggerRect.left - tooltipRect.width - offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
    },
    'right': {
      x: triggerRect.right + offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
    },
    'top-start': {
      x: triggerRect.left,
      y: triggerRect.top - tooltipRect.height - offset
    },
    'top-end': {
      x: triggerRect.right - tooltipRect.width,
      y: triggerRect.top - tooltipRect.height - offset
    },
    'bottom-start': {
      x: triggerRect.left,
      y: triggerRect.bottom + offset
    },
    'bottom-end': {
      x: triggerRect.right - tooltipRect.width,
      y: triggerRect.bottom + offset
    },
    'left-start': {
      x: triggerRect.left - tooltipRect.width - offset,
      y: triggerRect.top
    },
    'left-end': {
      x: triggerRect.left - tooltipRect.width - offset,
      y: triggerRect.bottom - tooltipRect.height
    },
    'right-start': {
      x: triggerRect.right + offset,
      y: triggerRect.top
    },
    'right-end': {
      x: triggerRect.right + offset,
      y: triggerRect.bottom - tooltipRect.height
    }
  };

  // Defensive: `position` is typed TooltipPosition, but fall back to 'top' for
  // any out-of-union value at runtime rather than crashing.
  const pos = positions[position] ?? positions['top'];
  x = pos.x;
  y = pos.y;

  // Flip if insufficient space and flip is enabled
  if (flip) {
    const flipMap: Record<string, TooltipPosition> = {
      'top': 'bottom',
      'bottom': 'top',
      'left': 'right',
      'right': 'left',
      'top-start': 'bottom-start',
      'top-end': 'bottom-end',
      'bottom-start': 'top-start',
      'bottom-end': 'top-end',
      'left-start': 'right-start',
      'left-end': 'right-end',
      'right-start': 'left-start',
      'right-end': 'left-end'
    };

    // Check vertical space
    if ((position === 'top' || position.startsWith('top-')) &&
        y < viewport.scrollY) {
      const flipPos = flipMap[position];
      const flipPosCoords = positions[flipPos];
      /* c8 ignore start -- reason: requires real viewport geometry (jsdom reports innerHeight=0 so the flip-confirmation condition is always false in the test environment). */
      if (flipPosCoords.y + tooltipRect.height <= viewport.height + viewport.scrollY) {
        finalPosition = flipPos;
        y = flipPosCoords.y;
      }
      /* c8 ignore end */
    }

    // Check horizontal space
    if ((position === 'left' || position.startsWith('left-')) &&
        x < viewport.scrollX) {
      const flipPos = flipMap[position];
      const flipPosCoords = positions[flipPos];
      /* c8 ignore start -- reason: requires real viewport geometry (jsdom reports innerWidth=0 so the flip-confirmation condition is always false in the test environment). */
      if (flipPosCoords.x + tooltipRect.width <= viewport.width + viewport.scrollX) {
        finalPosition = flipPos;
        x = flipPosCoords.x;
      }
      /* c8 ignore end */
    }
  }

  return { x, y, position: finalPosition };
};

/**
 * Headless tooltip hook providing tooltip behavior.
 * Includes advanced positioning, timing, and accessibility.
 */
export const useTooltip = (props: UseTooltipProps): UseTooltipReturns => {
  const {
    content,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    position = 'top',
    trigger = 'hover',
    delayShow = 0,
    delayHide = 0,
    arrow = true,
    disablePointerEvents = false,
    interactive = false,
    offset = 8,
    maxWidth = 300,
    flip = true,
    shift = true,
    defaultFocused = false,
    focusable = false,
    focusStrategy = 'auto',
    disabled = false,
    role = 'tooltip',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [showing, setShowing] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<{ x: number; y: number; position: TooltipPosition }>({ x: 0, y: 0, position });

  // References
  const triggerRef = React.useRef<HTMLElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy
  });

  // Determine if open is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Convert trigger to array for easier handling (memoized so handler deps stay stable)
  const triggers = useMemo(
    () => Array.isArray(trigger) ? trigger : [trigger],
    [trigger]
  );

  // Show tooltip
  const show = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (delayShow > 0) {
      setShowing(true);
      showTimeoutRef.current = setTimeout(() => {
        setShowing(false);
        if (!isControlled) {
          setInternalOpen(true);
        }
        onOpenChange?.(true);
      }, delayShow);
    } else {
      setShowing(false);
      if (!isControlled) {
        setInternalOpen(true);
      }
      onOpenChange?.(true);
    }
  }, [disabled, delayShow, isControlled, onOpenChange]);

  // Hide tooltip
  const hide = useCallback(() => {
    if (disabled) return;

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    setShowing(false);

    if (delayHide > 0) {
      setHiding(true);
      hideTimeoutRef.current = setTimeout(() => {
        setHiding(false);
        if (!isControlled) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      }, delayHide);
    } else {
      setHiding(false);
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }
  }, [disabled, delayHide, isControlled, onOpenChange]);

  // Toggle tooltip
  const toggle = useCallback(() => {
    if (open) {
      hide();
    } else {
      show();
    }
  }, [open, show, hide]);

  // Handle trigger enter
  const handleTriggerEnter = useCallback(() => {
    if (triggers.includes('hover')) {
      show();
    }
  }, [triggers, show]);

  // Handle trigger leave
  const handleTriggerLeave = useCallback(() => {
    if (triggers.includes('hover') && !interactive) {
      hide();
    }
  }, [triggers, interactive, hide]);

  // Handle trigger focus
  const handleTriggerFocus = useCallback(() => {
    if (triggers.includes('focus')) {
      show();
    }
  }, [triggers, show]);

  // Handle trigger blur
  const handleTriggerBlur = useCallback(() => {
    if (triggers.includes('focus') && !interactive) {
      hide();
    }
  }, [triggers, interactive, hide]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (triggers.includes('click')) {
      toggle();
    }
  }, [triggers, toggle]);

  // Handle tooltip enter (for interactive tooltips)
  const handleTooltipEnter = useCallback(() => {
    if (interactive) {
      show();
    }
  }, [interactive, show]);

  // Handle tooltip leave (for interactive tooltips)
  const handleTooltipLeave = useCallback(() => {
    if (interactive) {
      hide();
    }
  }, [interactive, hide]);

  // Calculate tooltip position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { x: 0, y: 0, position };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const pos = calculateTooltipPosition(triggerRect, tooltipRect, position, offset, flip);
    setCalculatedPosition(pos);

    return pos;
  }, [position, offset, flip]);

  // Update position when open changes
  useEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Semantic attributes for trigger
  const triggerAttributes = useSemanticMixin({
    'aria-describedby': open ? `${role}-description` : undefined,
    'data-tooltip': content,
    'data-state': open ? 'open' : 'closed',
    'data-position': position,
    'data-trigger': triggers.join(' '),
    ...semanticProps
  });

  // Tooltip body styles (memoized so the inline object doesn't defeat the
  // semantic mixin's referential stability — see useSemanticMixin's rest-bag logic)
  const tooltipBodyStyle = useMemo<React.CSSProperties>(() => ({
    position: 'fixed',
    left: calculatedPosition.x,
    top: calculatedPosition.y,
    maxWidth,
    pointerEvents: disablePointerEvents ? 'none' : interactive ? 'auto' : 'none',
    zIndex: 9999
  }), [calculatedPosition.x, calculatedPosition.y, maxWidth, disablePointerEvents, interactive]);

  // Semantic attributes for tooltip
  const tooltipAttributes = useSemanticMixin({
    id: `${role}-description`,
    role,
    'data-state': open ? 'open' : 'closed',
    'data-position': calculatedPosition.position,
    'data-interactive': interactive,
    style: tooltipBodyStyle
  });

  // Computed state
  const state = useMemo(() => composeState<UseTooltipState>({
    open,
    focused: focusableMixin.focused,
    showing,
    hiding
  }), [open, focusableMixin.focused, showing, hiding]);

  // Arrow styles
  const arrowStyles = useMemo(() => {
    if (!arrow) return {};

    const arrowSize = 8;
    const baseStyles = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const
    };

    const pos = calculatedPosition.position;
    if (pos === 'top') {
      return {
        ...baseStyles,
        bottom: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${arrowSize} ${arrowSize} 0 ${arrowSize}`,
        borderColor: 'currentColor transparent transparent transparent'
      };
    } else if (pos === 'bottom') {
      return {
        ...baseStyles,
        top: -arrowSize,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${arrowSize} ${arrowSize} ${arrowSize}`,
        borderColor: 'transparent transparent currentColor transparent'
      };
    } else if (pos === 'left') {
      return {
        ...baseStyles,
        right: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize} 0 ${arrowSize} ${arrowSize}`,
        borderColor: 'transparent currentColor transparent transparent'
      };
    } else if (pos === 'right') {
      return {
        ...baseStyles,
        left: -arrowSize,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${arrowSize} ${arrowSize} ${arrowSize} 0`,
        borderColor: 'transparent transparent transparent currentColor'
      };
    }

    return baseStyles;
  }, [arrow, calculatedPosition.position]);

  return useMemo(() => ({
    // State
    ...state,

    // Actions
    show,
    hide,
    toggle,
    handleTriggerEnter,
    handleTriggerLeave,
    handleTriggerFocus,
    handleTriggerBlur,
    handleTriggerClick,
    handleTooltipEnter,
    handleTooltipLeave,
    calculatePosition: updatePosition,

    // Computed properties
    triggerAttributes,
    tooltipAttributes,
    triggerRef,
    tooltipRef,
    position: calculatedPosition.position,
    tooltipStyles: tooltipAttributes.style as React.CSSProperties,
    arrowStyles
  }), [state, show, hide, toggle, handleTriggerEnter, handleTriggerLeave, handleTriggerFocus, handleTriggerBlur, handleTriggerClick, handleTooltipEnter, handleTooltipLeave, updatePosition, triggerAttributes, tooltipAttributes, triggerRef, tooltipRef, calculatedPosition, arrowStyles]);
};