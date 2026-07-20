/**
 * Panel headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages panel container state and interactions.
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Panel variant types
 */
export type PanelVariant = 'default' | 'bordered' | 'elevated' | 'outlined' | 'ghost';

/**
 * Panel size types
 */
export type PanelSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Panel state interface
 */
export interface PanelState {
  /** Whether panel is expanded */
  expanded: boolean;
  /** Whether panel is collapsed */
  collapsed: boolean;
  /** Whether panel is disabled */
  disabled: boolean;
  /** Whether panel is loading */
  loading: boolean;
  /** Whether panel is focused */
  focused: boolean;
  /** Whether panel is hovered */
  hovered: boolean;
  /** Whether panel can be collapsed */
  collapsible: boolean;
  /** Whether panel can be expanded */
  expandable: boolean;
  /** Current variant */
  variant: PanelVariant;
  /** Current size */
  size: PanelSize;
  /** Whether to show header */
  showHeader: boolean;
  /** Whether to show footer */
  showFooter: boolean;
  /** Whether to show actions */
  showActions: boolean;
  /** Whether panel is interactive */
  interactive: boolean;
  /** Whether panel is selected */
  selected: boolean;
  /** Whether panel is highlighted */
  highlighted: boolean;
}

/**
 * Panel actions interface
 */
export interface PanelActions {
  /** Expand panel */
  expand: () => void;
  /** Collapse panel */
  collapse: () => void;
  /** Toggle expanded state */
  toggle: () => void;
  /** Focus panel */
  focus: () => void;
  /** Blur panel */
  blur: () => void;
  /** Hover panel */
  hover: () => void;
  /** Unhover panel */
  unhover: () => void;
  /** Set variant */
  setVariant: (variant: PanelVariant) => void;
  /** Set size */
  setSize: (size: PanelSize) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set selected state */
  setSelected: (selected: boolean) => void;
  /** Set highlighted state */
  setHighlighted: (highlighted: boolean) => void;
  /** Show header */
  showHeader: () => void;
  /** Hide header */
  hideHeader: () => void;
  /** Show footer */
  showFooter: () => void;
  /** Hide footer */
  hideFooter: () => void;
  /** Show actions */
  showActions: () => void;
  /** Hide actions */
  hideActions: () => void;
  /** Get panel element */
  getPanelElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    'aria-expanded'?: boolean;
    'aria-disabled'?: boolean;
    'aria-selected'?: boolean;
    'aria-busy'?: boolean;
    role?: string;
    tabIndex?: number;
  };
}

/**
 * Props for usePanel hook
 */
export interface UsePanelProps {
  /** Whether panel is initially expanded */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Whether panel is collapsible */
  collapsible?: boolean;
  /** Whether panel is expandable */
  expandable?: boolean;
  /** Panel variant */
  variant?: PanelVariant;
  /** Panel size */
  size?: PanelSize;
  /** Whether panel is disabled */
  disabled?: boolean;
  /** Whether panel is loading */
  loading?: boolean;
  /** Whether panel is interactive */
  interactive?: boolean;
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show footer */
  showFooter?: boolean;
  /** Whether to show actions */
  showActions?: boolean;
  /** Expand handler */
  onExpand?: () => void;
  /** Collapse handler */
  onCollapse?: () => void;
  /** Toggle handler */
  onToggle?: (expanded: boolean) => void;
  /** Click handler */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Hover handler */
  onHover?: (hovered: boolean) => void;
  /** Panel element ref */
  panelRef?: React.RefObject<HTMLElement | null>;
  /** Initial selected state */
  defaultSelected?: boolean;
  /** Controlled selected state */
  selected?: boolean;
  /** Selection handler */
  onSelectionChange?: (selected: boolean) => void;
  /** Whether to remember collapsed state */
  rememberCollapsed?: boolean;
  /** Storage key for remembering state */
  storageKey?: string;
}

/**
 * Return type for usePanel hook
 */
export interface UsePanelReturns {
  /** Current panel state */
  state: PanelState;
  /** Panel actions */
  actions: PanelActions;
  /** Accessibility attributes */
  attributes: {
    'aria-expanded'?: boolean;
    'aria-disabled'?: boolean;
    'aria-selected'?: boolean;
    'aria-busy'?: boolean;
    role?: string;
    tabIndex?: number;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    expanded: string;
    collapsed: string;
    disabled: string;
    loading: string;
    focused: string;
    hovered: string;
    interactive: string;
    selected: string;
    highlighted: string;
    [key: string]: string | boolean;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Panel hook implementation
 * @param props - Panel configuration props
 * @returns Panel state, actions, and attributes
 */
export function usePanel(props: UsePanelProps): UsePanelReturns {
  const {
    defaultExpanded = false,
    expanded: controlledExpanded,
    collapsible = false,
    expandable = false,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    interactive = true,
    showHeader = true,
    showFooter = false,
    showActions = false,
    onExpand,
    onCollapse,
    onToggle,
    onClick,
    onFocus,
    onBlur,
    onHover,
    panelRef,
    defaultSelected = false,
    selected: controlledSelected,
    onSelectionChange,
    rememberCollapsed = false,
    storageKey
  } = props;

  // State management
  const [internalExpanded, setInternalExpanded] = useState<boolean>(() => {
    if (rememberCollapsed && storageKey) {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultExpanded;
    }
    return defaultExpanded;
  });
  const [hovered, setHovered] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [internalSelected, setInternalSelected] = useState<boolean>(defaultSelected);
  const [highlighted, setHighlighted] = useState<boolean>(false);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = panelRef || internalRef;

  // Determine if component is controlled
  const isExpandedControlled = controlledExpanded !== undefined;
  const isSelectedControlled = controlledSelected !== undefined;
  const currentExpanded = isExpandedControlled ? controlledExpanded : internalExpanded;
  const currentSelected = isSelectedControlled ? controlledSelected : internalSelected;

  /**
   * Save collapsed state to localStorage
   */
  const saveCollapsedState = useCallback((expanded: boolean) => {
    if (rememberCollapsed && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(expanded));
    }
  }, [rememberCollapsed, storageKey]);

  /**
   * Expand panel
   */
  const expandAction = useCallback(() => {
    if (disabled || !expandable) return;

    if (!isExpandedControlled) {
      setInternalExpanded(true);
      saveCollapsedState(true);
    }

    onExpand?.();
    onToggle?.(true);
  }, [disabled, expandable, isExpandedControlled, onExpand, onToggle, saveCollapsedState]);

  /**
   * Collapse panel
   */
  const collapseAction = useCallback(() => {
    if (disabled || !collapsible) return;

    if (!isExpandedControlled) {
      setInternalExpanded(false);
      saveCollapsedState(false);
    }

    onCollapse?.();
    onToggle?.(false);
  }, [disabled, collapsible, isExpandedControlled, onCollapse, onToggle, saveCollapsedState]);

  /**
   * Toggle expanded state
   */
  const toggleAction = useCallback(() => {
    if (currentExpanded) {
      collapseAction();
    } else {
      expandAction();
    }
  }, [currentExpanded, collapseAction, expandAction]);

  /**
   * Focus panel
   */
  const focusAction = useCallback(() => {
    if (!interactive || disabled) return;
    setFocused(true);
    elementRef.current?.focus();
  }, [interactive, disabled]);

  /**
   * Blur panel
   */
  const blurAction = useCallback(() => {
    setFocused(false);
    elementRef.current?.blur();
  }, []);

  /**
   * Hover panel
   */
  const hoverAction = useCallback(() => {
    if (!interactive || disabled) return;
    setHovered(true);
    onHover?.(true);
  }, [interactive, disabled, onHover]);

  /**
   * Unhover panel
   */
  const unhoverAction = useCallback(() => {
    setHovered(false);
    onHover?.(false);
  }, [onHover]);

  /**
   * Set variant
   */
  const setVariantAction = useCallback((newVariant: PanelVariant) => {
    // Variant is managed externally via props
  }, []);

  /**
   * Set size
   */
  const setSizeAction = useCallback((newSize: PanelSize) => {
    // Size is managed externally via props
  }, []);

  /**
   * Set loading state
   */
  const setLoadingAction = useCallback((newLoading: boolean) => {
    // Loading state is managed externally via props
  }, []);

  /**
   * Set selected state
   */
  const setSelectedAction = useCallback((selected: boolean) => {
    if (!isSelectedControlled) {
      setInternalSelected(selected);
    }
    onSelectionChange?.(selected);
  }, [isSelectedControlled, onSelectionChange]);

  /**
   * Set highlighted state
   */
  const setHighlightedAction = useCallback((highlightedValue: boolean) => {
    setHighlighted(highlightedValue);
  }, []);

  /**
   * Show header
   */
  const showHeaderAction = useCallback(() => {
    // Header visibility is managed externally via props
  }, []);

  /**
   * Hide header
   */
  const hideHeaderAction = useCallback(() => {
    // Header visibility is managed externally via props
  }, []);

  /**
   * Show footer
   */
  const showFooterAction = useCallback(() => {
    // Footer visibility is managed externally via props
  }, []);

  /**
   * Hide footer
   */
  const hideFooterAction = useCallback(() => {
    // Footer visibility is managed externally via props
  }, []);

  /**
   * Show actions
   */
  const showActionsAction = useCallback(() => {
    // Actions visibility is managed externally via props
  }, []);

  /**
   * Hide actions
   */
  const hideActionsAction = useCallback(() => {
    // Actions visibility is managed externally via props
  }, []);

  /**
   * Get panel element
   */
  const getPanelElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    const props: any = {};

    if (collapsible || expandable) {
      props['aria-expanded'] = currentExpanded;
    }

    if (disabled) {
      props['aria-disabled'] = true;
    }

    if (currentSelected) {
      props['aria-selected'] = true;
    }

    if (loading) {
      props['aria-busy'] = true;
    }

    if (interactive && !disabled) {
      props.tabIndex = 0;
    }

    // Role based on variant and usage
    if (collapsible || expandable) {
      props.role = 'button';
    } else {
      props.role = 'region';
    }

    return props;
  }, [collapsible, expandable, currentExpanded, disabled, currentSelected, loading, interactive]);

  // Build state
  const state: PanelState = {
    expanded: currentExpanded,
    collapsed: !currentExpanded && (collapsible || expandable),
    disabled,
    loading,
    focused,
    hovered,
    collapsible,
    expandable,
    variant,
    size,
    showHeader,
    showFooter,
    showActions,
    interactive,
    selected: currentSelected,
    highlighted
  };

  // Build actions
  const actions: PanelActions = {
    expand: expandAction,
    collapse: collapseAction,
    toggle: toggleAction,
    focus: focusAction,
    blur: blurAction,
    hover: hoverAction,
    unhover: unhoverAction,
    setVariant: setVariantAction,
    setSize: setSizeAction,
    setLoading: setLoadingAction,
    setSelected: setSelectedAction,
    setHighlighted: setHighlightedAction,
    showHeader: showHeaderAction,
    hideHeader: hideHeaderAction,
    showFooter: showFooterAction,
    hideFooter: hideFooterAction,
    showActions: showActionsAction,
    hideActions: hideActionsAction,
    getPanelElement: getPanelElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS classes
  const classes = {
    base: 'panel',
    expanded: currentExpanded ? 'panel-expanded' : '',
    collapsed: !currentExpanded && (collapsible || expandable) ? 'panel-collapsed' : '',
    disabled: disabled ? 'panel-disabled' : '',
    loading: loading ? 'panel-loading' : '',
    focused: focused ? 'panel-focused' : '',
    hovered: hovered ? 'panel-hovered' : '',
    interactive: interactive ? 'panel-interactive' : 'panel-static',
    selected: currentSelected ? 'panel-selected' : '',
    highlighted: highlighted ? 'panel-highlighted' : '',
    [`panel-${variant}`]: true,
    [`panel-${size}`]: true,
    'panel-collapsible': collapsible,
    'panel-expandable': expandable
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const pressable = usePressableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const semantic = useSemanticMixin({
    role: collapsible || expandable ? 'button' : 'region',
    ref: elementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes: accessibilityProps,
    classes,
    focusable,
    pressable,
    semantic
  }), [state, actions, accessibilityProps, classes, focusable, pressable, semantic]);
}