import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb item */
  id: string;
  /** Display label for the breadcrumb item */
  label: string;
  /** URL or navigation target */
  href?: string;
  /** Whether this item is the current page */
  current?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Icon to display alongside the label */
  icon?: React.ReactNode;
  /** Custom click handler */
  onClick?: () => void;
}

export interface UseBreadcrumbProps extends
  SemanticMixinProps,
  FocusableMixinProps,
  PressableMixinProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator between items */
  separator?: React.ReactNode;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** Whether to show home icon/button */
  showHome?: boolean;
  /** Home item configuration */
  homeItem?: Partial<BreadcrumbItem>;
  /** Whether breadcrumb is disabled */
  disabled?: boolean;
}

export interface UseBreadcrumbState {
  /** Array of breadcrumb items (processed) */
  items: BreadcrumbItem[];
  /** Current active item index */
  activeIndex: number;
  /** Whether breadcrumb is disabled */
  disabled: boolean;
  /** Whether breadcrumb has more items than maxItems */
  isCollapsed: boolean;
  /** Visible items after truncation */
  visibleItems: BreadcrumbItem[];
  /** Hidden items (truncated) */
  hiddenItems: BreadcrumbItem[];
}

export interface UseBreadcrumbActions {
  /** Navigate to a specific breadcrumb item */
  navigate: (index: number) => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to home item */
  navigateHome: () => void;
}

export interface UseBreadcrumbReturns {
  /** Component state */
  state: UseBreadcrumbState;
  /** Component actions */
  actions: UseBreadcrumbActions;
  /** Composed props to pass to breadcrumb container */
  props: Record<string, any>;
}

/**
 * Headless hook for breadcrumb navigation functionality.
 * Provides navigation hierarchy with keyboard support and accessibility.
 *
 * @param props - Component configuration props
 * @returns Breadcrumb state, actions, and props
 */
export const useBreadcrumb = (props: UseBreadcrumbProps): UseBreadcrumbReturns => {
  const {
    items = [],
    separator = '/',
    maxItems = 5,
    showHome = false,
    homeItem = { label: 'Home', href: '/' },
    disabled = false,
    ...mixinsProps
  } = props;

  // Process items to ensure proper structure
  const processedItems = useMemo(() => {
    let result: BreadcrumbItem[] = [...items];

    // Add home item if requested
    if (showHome) {
      const homeBreadcrumb: BreadcrumbItem = {
        id: 'breadcrumb-home',
        current: false,
        disabled: false,
        ...homeItem,
      };
      result = [homeBreadcrumb, ...result];
    }

    // Mark last item as current if not already marked
    if (result.length > 0 && !result.some(item => item.current)) {
      result = result.map((item, index) => ({
        ...item,
        current: index === result.length - 1,
      }));
    }

    return result;
  }, [items, showHome, homeItem]);

  // Find active index
  const activeIndex = useMemo(() => {
    const currentIndex = processedItems.findIndex(item => item.current);
    return currentIndex >= 0 ? currentIndex : processedItems.length - 1;
  }, [processedItems]);

  // Handle truncation for long breadcrumb trails
  const { visibleItems, hiddenItems, isCollapsed } = useMemo(() => {
    if (processedItems.length <= maxItems) {
      return {
        visibleItems: processedItems,
        hiddenItems: [],
        isCollapsed: false,
      };
    }

    // Keep first item, last few items, and add ellipsis
    const firstItem = processedItems[0];
    const lastItems = processedItems.slice(-(maxItems - 2));
    const middleItems = processedItems.slice(1, -lastItems.length);

    return {
      visibleItems: [firstItem, ...lastItems],
      hiddenItems: middleItems,
      isCollapsed: true,
    };
  }, [processedItems, maxItems]);

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    role: 'navigation',
    'aria-label': 'Breadcrumb navigation',
    ...mixinsProps,
  });

  // Navigation actions
  const navigate = useCallback((index: number) => {
    if (disabled || index < 0 || index >= processedItems.length) return;

    const item = processedItems[index];
    if (item.disabled) return;

    // Call custom onClick if provided
    if (item.onClick) {
      item.onClick();
    }

    // Navigate using href if available
    if (item.href) {
      window.location.href = item.href;
    }
  }, [disabled, processedItems]);

  const navigatePrevious = useCallback(() => {
    if (activeIndex > 0) {
      navigate(activeIndex - 1);
    }
  }, [activeIndex, navigate]);

  const navigateNext = useCallback(() => {
    if (activeIndex < processedItems.length - 1) {
      navigate(activeIndex + 1);
    }
  }, [activeIndex, processedItems.length, navigate]);

  const navigateHome = useCallback(() => {
    navigate(0);
  }, [navigate]);

  // Compose state
  const state = composeState<UseBreadcrumbState>({
    items: processedItems,
    activeIndex,
    disabled,
    isCollapsed,
    visibleItems,
    hiddenItems,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseBreadcrumbActions>({
    navigate,
    navigatePrevious,
    navigateNext,
    navigateHome,
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic semantic attributes
    ...semantic.props,

    // Keyboard navigation
    onKeyDown: (event: React.KeyboardEvent) => {
      // Handle arrow key navigation
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateNext();
          break;
        case 'Home':
          event.preventDefault();
          navigateHome();
          break;
        case 'End':
          event.preventDefault();
          navigate(processedItems.length - 1);
          break;
      }

      // Call mixin handlers
      semantic.props.onKeyDown?.(event);
    },
  });

  return {
    state,
    actions,
    props: composedProps,
    // Additional data for rendering
    separator,
  };
};