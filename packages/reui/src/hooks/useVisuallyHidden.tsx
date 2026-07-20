/**
 * VisuallyHidden headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages screen reader-only content with proper accessibility.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, useSemanticMixin } from '../mixins';

/**
 * VisuallyHidden state interface
 */
export interface VisuallyHiddenState {
  /** Whether content is currently visible to screen readers */
  visible: boolean;
  /** Whether content is focusable */
  focusable: boolean;
  /** Whether content should be announced immediately */
  announce: boolean;
  /** Current announcement message */
  announcement: string;
  /** Announcement priority */
  priority: 'polite' | 'assertive' | 'off';
  /** Whether element is currently focused */
  focused: boolean;
  /** Current element */
  element: HTMLElement | null;
}

/**
 * VisuallyHidden actions interface
 */
export interface VisuallyHiddenActions {
  /** Show content to screen readers */
  show: () => void;
  /** Hide content from screen readers */
  hide: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Set focusable state */
  setFocusable: (focusable: boolean) => void;
  /** Focus the element */
  focus: () => void;
  /** Blur the element */
  blur: () => void;
  /** Announce message to screen readers */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  /** Clear current announcement */
  clearAnnouncement: () => void;
  /** Set announcement priority */
  setPriority: (priority: 'polite' | 'assertive' | 'off') => void;
  /** Get element */
  getElement: () => HTMLElement | null;
  /** Update content */
  updateContent: (content: string) => void;
}

/**
 * Props for useVisuallyHidden hook
 */
export interface UseVisuallyHiddenProps {
  /** Whether content is initially visible */
  defaultVisible?: boolean;
  /** Controlled visible state */
  visible?: boolean;
  /** Whether content is focusable */
  focusable?: boolean;
  /** Initial announcement message */
  announcement?: string;
  /** Announcement priority */
  priority?: 'polite' | 'assertive' | 'off';
  /** Whether to auto-hide after announcement */
  autoHide?: boolean;
  /** Auto-hide delay in ms */
  autoHideDelay?: number;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Element ref */
  elementRef?: React.RefObject<HTMLElement | null>;
  /** Whether to use live region */
  useLiveRegion?: boolean;
  /** Live region type */
  liveRegion?: 'polite' | 'assertive' | 'off';
  /** Whether content should be atomic */
  atomic?: boolean;
  /** Whether content should be relevant */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

/**
 * Return type for useVisuallyHidden hook
 */
export interface UseVisuallyHiddenReturns {
  /** Current visually hidden state */
  state: VisuallyHiddenState;
  /** Visually hidden actions */
  actions: VisuallyHiddenActions;
  /** Accessibility attributes */
  attributes: React.HTMLAttributes<HTMLElement>;
  /** CSS styles for visually hidden */
  styles: React.CSSProperties;
  /** Focusable mixin returns */
  focusable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * CSS for visually hidden content (screen reader only)
 */
const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
  outline: '0'
};

/**
 * VisuallyHidden hook implementation
 * @param props - VisuallyHidden configuration props
 * @returns VisuallyHidden state, actions, attributes, and styles
 */
export function useVisuallyHidden(props: UseVisuallyHiddenProps): UseVisuallyHiddenReturns {
  const {
    defaultVisible = true,
    visible: controlledVisible,
    focusable: initialFocusable = false,
    announcement: initialAnnouncement = '',
    priority: initialPriority = 'polite',
    autoHide = false,
    autoHideDelay = 1000,
    onFocus,
    onBlur,
    onKeyDown,
    elementRef,
    useLiveRegion = true,
    liveRegion = 'polite',
    atomic = false,
    relevant = 'additions text'
  } = props;

  // State management
  const [internalVisible, setInternalVisible] = useState<boolean>(defaultVisible);
  const [focusable, setFocusableState] = useState<boolean>(initialFocusable);
  const [announcement, setAnnouncement] = useState<string>(initialAnnouncement);
  const [currentPriority, setCurrentPriority] = useState<'polite' | 'assertive' | 'off'>(initialPriority);
  const [focused, setFocused] = useState<boolean>(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRefProp = elementRef || internalRef;
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if component is controlled
  const isControlled = controlledVisible !== undefined;
  const currentVisible = isControlled ? controlledVisible : internalVisible;

  /**
   * Show content to screen readers
   */
  const showAction = useCallback(() => {
    if (!isControlled) {
      setInternalVisible(true);
    }
  }, [isControlled]);

  /**
   * Hide content from screen readers
   */
  const hideAction = useCallback(() => {
    if (!isControlled) {
      setInternalVisible(false);
    }
  }, [isControlled]);

  /**
   * Toggle visibility
   */
  const toggleAction = useCallback(() => {
    if (currentVisible) {
      hideAction();
    } else {
      showAction();
    }
  }, [currentVisible, hideAction, showAction]);

  /**
   * Set focusable state
   */
  const setFocusableAction = useCallback((newFocusable: boolean) => {
    setFocusableState(newFocusable);
  }, []);

  /**
   * Focus the element
   */
  const focusAction = useCallback(() => {
    elementRefProp.current?.focus();
  }, []);

  /**
   * Blur the element
   */
  const blurAction = useCallback(() => {
    elementRefProp.current?.blur();
  }, []);

  /**
   * Announce message to screen readers
   */
  const announceAction = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    setAnnouncement(message);
    if (priority) {
      setCurrentPriority(priority);
    }

    // Auto-hide after announcement if enabled
    if (autoHide && message) {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
      autoHideTimerRef.current = setTimeout(() => {
        setAnnouncement('');
      }, autoHideDelay);
    }
  }, [autoHide, autoHideDelay]);

  /**
   * Clear current announcement
   */
  const clearAnnouncementAction = useCallback(() => {
    setAnnouncement('');
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, [autoHide]);

  /**
   * Set announcement priority
   */
  const setPriorityAction = useCallback((priority: 'polite' | 'assertive' | 'off') => {
    setCurrentPriority(priority);
  }, []);

  /**
   * Get element
   */
  const getElementAction = useCallback(() => {
    return elementRefProp.current;
  }, []);

  /**
   * Update content
   */
  const updateContentAction = useCallback((content: string) => {
    if (elementRefProp.current) {
      elementRefProp.current.textContent = content;
    }
  }, []);

  // Event handlers
  // NOTE: handleFocus/handleBlur/handleKeyDown previously lived here but were
  // never returned from the hook nor wired to the DOM, making them dead code
  // (the onFocus/onBlur/onKeyDown props were accepted but never invoked). They
  // have been removed. The setFocused state is still driven by the focusable
  // mixin's own focus handling where applicable.

  // Track element reference
  useEffect(() => {
    if (elementRefProp.current !== element) {
      setElement(elementRefProp.current);
    }
  }, [elementRefProp, element]);

  // Update element content when announcement changes
  useEffect(() => {
    if (elementRefProp.current && useLiveRegion) {
      elementRefProp.current.textContent = announcement;
    }
  }, [announcement, elementRefProp, useLiveRegion]);

  // Cleanup auto-hide timer
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, []);

  // Build state
  const state: VisuallyHiddenState = {
    visible: currentVisible,
    focusable,
    announce: !!announcement,
    announcement,
    priority: currentPriority,
    focused,
    element
  };

  // Build actions
  const actions: VisuallyHiddenActions = {
    show: showAction,
    hide: hideAction,
    toggle: toggleAction,
    setFocusable: setFocusableAction,
    focus: focusAction,
    blur: blurAction,
    announce: announceAction,
    clearAnnouncement: clearAnnouncementAction,
    setPriority: setPriorityAction,
    getElement: getElementAction,
    updateContent: updateContentAction
  };

  // Build accessibility attributes
  const attributes: React.HTMLAttributes<HTMLElement> = {
    'aria-hidden': !currentVisible || undefined,
    'aria-live': useLiveRegion && currentVisible ? liveRegion : undefined,
    'aria-atomic': useLiveRegion && atomic ? true : undefined,
    'aria-relevant': useLiveRegion && relevant ? relevant : undefined,
    'tabIndex': focusable && currentVisible ? 0 : undefined,
    'role': useLiveRegion ? 'status' : undefined
  };

  // Build CSS styles
  const styles: React.CSSProperties = {
    ...visuallyHiddenStyles,
    ...(currentVisible ? {} : { display: 'none' })
  };

  // Mixins
  const focusableMixin = useFocusableMixin({
    disabled: !focusable || !currentVisible,
    ref: elementRefProp
  });

  const semantic = useSemanticMixin({
    role: useLiveRegion ? 'status' : 'presentation',
    ref: elementRefProp
  });

  return useMemo(() => ({
    state,
    actions,
    attributes,
    styles,
    focusable: focusableMixin,
    semantic
  }), [state, actions, attributes, styles, focusableMixin, semantic]);
}