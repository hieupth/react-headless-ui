/**
 * Sidebar headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages sidebar state including open/close, collapse/expand, and responsive behavior.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Sidebar positioning options
 */
export type SidebarPosition = 'left' | 'right';

/**
 * Sidebar variant options
 */
export type SidebarVariant = 'permanent' | 'persistent' | 'temporary';

/**
 * Sidebar size options
 */
export type SidebarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Sidebar collapse state
 */
export type SidebarCollapseState = 'expanded' | 'collapsed';

/**
 * Props for useSidebar hook
 */
export interface UseSidebarProps {
  /** Whether sidebar is initially open */
  defaultOpen?: boolean;
  /** Whether sidebar is initially collapsed */
  defaultCollapsed?: boolean;
  /** Sidebar position */
  position?: SidebarPosition;
  /** Sidebar variant (permanent, persistent, or temporary) */
  variant?: SidebarVariant;
  /** Sidebar size */
  size?: SidebarSize;
  /** Whether sidebar is disabled */
  disabled?: boolean;
  /** Overlay backdrop behavior for temporary variant */
  showOverlay?: boolean;
  /** Close sidebar when overlay is clicked */
  closeOnOverlayClick?: boolean;
  /** Responsive breakpoint for mobile behavior */
  responsive?: boolean;
  /** Breakpoint width for responsive behavior */
  breakpoint?: number;
  /** Callback when sidebar state changes */
  onOpenChange?: (open: boolean) => void;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Ref to the sidebar element */
  sidebarRef?: React.RefObject<HTMLElement>;
}

/**
 * Sidebar state interface
 */
export interface SidebarState {
  /** Whether sidebar is open */
  open: boolean;
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Whether sidebar is disabled */
  disabled: boolean;
  /** Whether sidebar is in mobile mode (responsive) */
  isMobile: boolean;
  /** Current position */
  position: SidebarPosition;
  /** Current variant */
  variant: SidebarVariant;
  /** Current size */
  size: SidebarSize;
  /** Whether to show overlay */
  showOverlay: boolean;
}

/**
 * Sidebar actions interface
 */
export interface SidebarActions {
  /** Open sidebar */
  openSidebar: () => void;
  /** Close sidebar */
  closeSidebar: () => void;
  /** Toggle sidebar open state */
  toggleSidebar: () => void;
  /** Collapse sidebar */
  collapseSidebar: () => void;
  /** Expand sidebar */
  expandSidebar: () => void;
  /** Toggle collapse state */
  toggleCollapse: () => void;
  /** Handle overlay click */
  handleOverlayClick: () => void;
  /** Handle escape key */
  handleEscapeKey: () => void;
}

/**
 * Return type for useSidebar hook
 */
export interface UseSidebarReturns {
  /** Current sidebar state */
  state: SidebarState;
  /** Sidebar actions */
  actions: SidebarActions;
  /** Accessibility attributes */
  attributes: {
    'aria-hidden'?: boolean;
    'aria-label': string;
    'aria-modal'?: boolean;
    'role': string;
    'data-state': 'open' | 'closed';
    'data-position': SidebarPosition;
    'data-variant': SidebarVariant;
    'data-size': SidebarSize;
    'data-collapsed': SidebarCollapseState;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Sidebar hook implementation
 * @param props - Sidebar configuration props
 * @returns Sidebar state, actions, and attributes
 */
export function useSidebar(props: UseSidebarProps = {}): UseSidebarReturns {
  const {
    defaultOpen = false,
    defaultCollapsed = false,
    position = 'left',
    variant = 'permanent',
    size = 'md',
    disabled = false,
    showOverlay: propShowOverlay = true,
    closeOnOverlayClick = true,
    responsive = true,
    breakpoint = 768,
    onOpenChange,
    onCollapseChange,
    sidebarRef
  } = props;

  // State management
  const [open, setOpen] = useState(defaultOpen);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const sidebarElementRef = sidebarRef || internalRef;

  // Check if we're in mobile mode based on breakpoint
  useEffect(() => {
    if (!responsive) return;

    const checkMobile = () => {
      const mobile = window.innerWidth < breakpoint;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile if variant is persistent
      if (mobile && variant === 'persistent' && open) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [responsive, breakpoint, variant, open, onOpenChange]);

  // Determine if overlay should be shown
  const showOverlay = propShowOverlay && (
    (variant === 'temporary' && open) ||
    (variant === 'persistent' && open && isMobile)
  );

  // Actions
  const openSidebar = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  const closeSidebar = useCallback(() => {
    if (disabled) return;
    setOpen(false);
    onOpenChange?.(false);
  }, [disabled, onOpenChange]);

  const toggleSidebar = useCallback(() => {
    if (disabled) return;
    setOpen(prev => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  }, [disabled, onOpenChange]);

  const collapseSidebar = useCallback(() => {
    if (disabled) return;
    setCollapsed(true);
    onCollapseChange?.(true);
  }, [disabled, onCollapseChange]);

  const expandSidebar = useCallback(() => {
    if (disabled) return;
    setCollapsed(false);
    onCollapseChange?.(false);
  }, [disabled, onCollapseChange]);

  const toggleCollapse = useCallback(() => {
    if (disabled) return;
    setCollapsed(prev => {
      const newState = !prev;
      onCollapseChange?.(newState);
      return newState;
    });
  }, [disabled, onCollapseChange]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      closeSidebar();
    }
  }, [closeOnOverlayClick, closeSidebar]);

  const handleEscapeKey = useCallback(() => {
    if (open) {
      closeSidebar();
    }
  }, [open, closeSidebar]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleEscapeKey();
      }
    };

    if (showOverlay) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showOverlay, open, handleEscapeKey]);

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: sidebarElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    onPress: toggleSidebar,
    ref: sidebarElementRef
  });

  const semantic = useSemanticMixin({
    role: 'complementary',
    ariaLabel: `${position} sidebar`,
    ariaHidden: !open,
    ariaModal: showOverlay,
    ref: sidebarElementRef
  });

  // Build state
  const state: SidebarState = {
    open,
    collapsed,
    disabled,
    isMobile,
    position,
    variant,
    size,
    showOverlay
  };

  // Build actions
  const actions: SidebarActions = {
    openSidebar,
    closeSidebar,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    toggleCollapse,
    handleOverlayClick,
    handleEscapeKey
  };

  // Build attributes
  const attributes = {
    'aria-hidden': !open,
    'aria-label': semantic.ariaLabel,
    'aria-modal': showOverlay,
    'role': semantic.role,
    'data-state': open ? 'open' : 'closed',
    'data-position': position,
    'data-variant': variant,
    'data-size': size,
    'data-collapsed': collapsed ? 'collapsed' : 'expanded'
  };

  return {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  };
}