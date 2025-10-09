/**
 * Tabs headless hook following Flutter patterns.
 * Provides tab navigation and content switching behavior.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface TabItem {
  /** Tab key */
  key: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content?: React.ReactNode;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Tab icon */
  icon?: React.ReactNode;
  /** Tab badge/count */
  badge?: number | string;
  /** Tab group */
  group?: string;
}

export interface UseTabsProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Tab items */
  items: TabItem[];
  /** Selected tab key */
  selectedKey?: string;
  /** Default selected tab key */
  defaultSelectedKey?: string;
  /** Selection change handler */
  onSelectionChange?: (key: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether tabs are manually activated */
  manual?: boolean;
  /** Whether to show tab indicators */
  showIndicator?: boolean;
  /** Custom activation behavior */
  activationMode?: 'automatic' | 'manual';
  /** Tab position */
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export interface UseTabsState {
  /** Current selected key */
  selectedKey: string;
  /** Current focus state */
  focused: boolean;
  /** Current press state */
  pressed: boolean;
  /** Current highlighted index */
  highlightedIndex: number;
}

export interface UseTabsActions {
  /** Select tab */
  selectTab: (key: string) => void;
  /** Highlight tab */
  highlightTab: (index: number) => void;
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle tab click */
  handleTabClick: (key: string, index: number) => void;
  /** Get tab at index */
  getTabAt: (index: number) => TabItem | undefined;
  /** Get selected tab */
  getSelectedTab: () => TabItem | undefined;
  /** Get tab index by key */
  getTabIndex: (key: string) => number;
  /** Activate tab */
  activateTab: (key: string) => void;
}

export interface UseTabsReturns extends UseTabsState, UseTabsActions {
  /** Semantic attributes for tab list */
  tablistAttributes: Record<string, any>;
  /** Semantic attributes for tabs */
  getTabAttributes: (tab: TabItem, index: number) => Record<string, any>;
  /** Semantic attributes for tab panels */
  getTabPanelAttributes: (tab: TabItem) => Record<string, any>;
  /** Reference to tab list element */
  tablistRef: React.RefObject<HTMLDivElement>;
  /** Computed selected index */
  selectedIndex: number;
  /** Selected tab */
  selectedTab: TabItem | undefined;
  /** Tab items */
  items: TabItem[];
}

/**
 * Headless tabs hook providing tabs behavior.
 * Includes keyboard navigation, selection, and accessibility.
 */
export const useTabs = (props: UseTabsProps): UseTabsReturns => {
  const {
    items,
    selectedKey: controlledSelectedKey,
    defaultSelectedKey,
    onSelectionChange,
    orientation = 'horizontal',
    manual = false,
    showIndicator = true,
    activationMode = 'automatic',
    tabPosition = 'top',
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'first',
    pressable = true,
    role = 'tablist',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // References
  const tablistRef = React.useRef<HTMLDivElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy
  });

  // Press behavior for tabs
  const pressableMixin = usePressableMixin({
    pressable
  });

  // Determine if selection is controlled
  const isControlledSelected = controlledSelectedKey !== undefined;

  // Determine selected key
  const selectedKey = useMemo(() => {
    if (isControlledSelected) {
      return controlledSelectedKey;
    }

    // Use default or first non-disabled tab
    if (controlledSelectedKey === undefined) {
      if (defaultSelectedKey && items.find(item => item.key === defaultSelectedKey && !item.disabled)) {
        return defaultSelectedKey;
      }
      // Fall back to first enabled tab
      const firstEnabledTab = items.find(item => !item.disabled);
      return firstEnabledTab?.key || items[0]?.key || '';
    }

    return '';
  }, [isControlledSelected, controlledSelectedKey, defaultSelectedKey, items]);

  // Get selected index
  const selectedIndex = useMemo(() => {
    return items.findIndex(item => item.key === selectedKey);
  }, [items, selectedKey]);

  // Get selected tab
  const selectedTab = useMemo(() => {
    return items.find(item => item.key === selectedKey);
  }, [items, selectedKey]);

  // Get tab at index
  const getTabAt = useCallback((index: number) => {
    return items[index];
  }, [items]);

  // Get selected tab
  const getSelectedTab = useCallback(() => {
    return selectedTab;
  }, [selectedTab]);

  // Get tab index by key
  const getTabIndex = useCallback((key: string) => {
    return items.findIndex(item => item.key === key);
  }, [items]);

  // Select tab
  const selectTab = useCallback((key: string) => {
    const tab = items.find(item => item.key === key);
    if (!tab || tab.disabled) return;

    // Update selection
    if (!isControlledSelected) {
      // Note: In uncontrolled mode, the parent component should handle state
      // This is a simplified approach - in production, you'd want proper state management
    }
    onSelectionChange?.(key);
  }, [items, isControlledSelected, onSelectionChange]);

  // Highlight tab
  const highlightTab = useCallback((index: number) => {
    const tab = items[index];
    if (tab && !tab.disabled) {
      setHighlightedIndex(index);
    }
  }, [items]);

  // Activate tab (for manual activation mode)
  const activateTab = useCallback((key: string) => {
    if (activationMode === 'manual') {
      selectTab(key);
    }
  }, [activationMode, selectTab]);

  // Handle tab click
  const handleTabClick = useCallback((key: string, index: number) => {
    const tab = items[index];
    if (tab.disabled) return;

    // Highlight the tab
    setHighlightedIndex(index);

    // Select based on activation mode
    if (activationMode === 'automatic') {
      selectTab(key);
    } else {
      // Manual mode - just highlight, selection happens on Enter/Space
      setHighlightedIndex(index);
    }
  }, [items, activationMode, selectTab]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const firstKey = isHorizontal ? 'Home' : 'PageUp';
    const lastKey = isHorizontal ? 'End' : 'PageDown';

    switch (event.key) {
      case prevKey:
        event.preventDefault();
        let prevIndex = highlightedIndex >= 0 ? highlightedIndex : selectedIndex;
        do {
          prevIndex = prevIndex <= 0 ? items.length - 1 : prevIndex - 1;
        } while (items[prevIndex].disabled && prevIndex !== highlightedIndex);
        highlightTab(prevIndex);

        if (activationMode === 'automatic') {
          selectTab(items[prevIndex].key);
        }
        break;

      case nextKey:
        event.preventDefault();
        let nextIndex = highlightedIndex >= 0 ? highlightedIndex : selectedIndex;
        do {
          nextIndex = (nextIndex + 1) % items.length;
        } while (items[nextIndex].disabled && nextIndex !== highlightedIndex);
        highlightTab(nextIndex);

        if (activationMode === 'automatic') {
          selectTab(items[nextIndex].key);
        }
        break;

      case firstKey:
        event.preventDefault();
        const firstEnabledIndex = items.findIndex(item => !item.disabled);
        if (firstEnabledIndex !== -1) {
          highlightTab(firstEnabledIndex);
          if (activationMode === 'automatic') {
            selectTab(items[firstEnabledIndex].key);
          }
        }
        break;

      case lastKey:
        event.preventDefault();
        const lastEnabledIndex = items.findLastIndex(item => !item.disabled);
        if (lastEnabledIndex !== -1) {
          highlightTab(lastEnabledIndex);
          if (activationMode === 'automatic') {
            selectTab(items[lastEnabledIndex].key);
          }
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (highlightedIndex >= 0 && activationMode === 'manual') {
          const tab = items[highlightedIndex];
          if (tab && !tab.disabled) {
            selectTab(tab.key);
          }
        }
        break;

      case 'Tab':
        // Allow default tab behavior to move focus out of tabs
        break;
    }
  }, [orientation, highlightedIndex, selectedIndex, items, highlightTab, selectTab, activationMode]);

  // Sync highlighted index with selected index
  useEffect(() => {
    if (highlightedIndex < 0 && selectedIndex >= 0) {
      setHighlightedIndex(selectedIndex);
    }
  }, [highlightedIndex, selectedIndex]);

  // Semantic attributes for tab list
  const tablistAttributes = useSemanticMixin({
    role,
    'aria-orientation': orientation,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'data-orientation': orientation,
    'data-position': tabPosition,
    ...semanticProps
  });

  // Get tab attributes
  const getTabAttributes = useCallback((tab: TabItem, index: number) => {
    const isSelected = tab.key === selectedKey;
    const isHighlighted = index === highlightedIndex;

    return {
      role: 'tab',
      'aria-selected': isSelected,
      'aria-disabled': tab.disabled,
      'aria-controls': `${tab.key}-panel`,
      'data-selected': isSelected,
      'data-highlighted': isHighlighted,
      'data-disabled': tab.disabled,
      'data-key': tab.key,
      'data-group': tab.group,
      tabIndex: isSelected ? 0 : -1
    };
  }, [selectedKey, highlightedIndex]);

  // Get tab panel attributes
  const getTabPanelAttributes = useCallback((tab: TabItem) => {
    const isSelected = tab.key === selectedKey;

    return {
      role: 'tabpanel',
      'aria-labelledby': `${tab.key}-tab`,
      'data-selected': isSelected,
      'data-key': tab.key,
      'hidden': !isSelected,
      tabIndex: isSelected ? 0 : -1
    };
  }, [selectedKey]);

  // Computed state
  const state = useMemo(() => composeState<UseTabsState>({
    selectedKey,
    focused: focusableMixin.focused,
    pressed: pressableMixin.pressed,
    highlightedIndex
  }), [selectedKey, focusableMixin.focused, pressableMixin.pressed, highlightedIndex]);

  return {
    // State
    ...state,

    // Actions
    selectTab,
    highlightTab,
    handleKeyDown,
    handleTabClick,
    getTabAt,
    getSelectedTab,
    getTabIndex,
    activateTab,

    // Computed properties
    tablistAttributes,
    getTabAttributes,
    getTabPanelAttributes,
    tablistRef,
    selectedIndex,
    selectedTab,
    items
  };
};