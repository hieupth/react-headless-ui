/**
 * Tabs renderer component using headless useTabs hook.
 * Provides styled tabs with keyboard navigation and content switching.
 */

import React, { forwardRef } from 'react';
import { useTabs } from '@react-ui-forge/core';
import type { UseTabsProps, TabItem } from '@react-ui-forge/core';

export interface TabsProps extends UseTabsProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function */
  render?: (props: TabsRenderProps) => React.ReactElement;
  /** Custom tab render function */
  renderTab?: (tab: TabItem, props: TabRenderProps) => React.ReactNode;
  /** Custom tab panel render function */
  renderTabPanel?: (tab: TabItem, props: TabPanelRenderProps) => React.ReactNode;
  /** Custom tab list render function */
  renderTabList?: (props: TabsRenderProps) => React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant */
  variant?: 'default' | 'underline' | 'pills' | 'enclosed';
  /** Whether to show tab content */
  showContent?: boolean;
  /** Animated transitions */
  animated?: boolean;
}

export interface TabsRenderProps {
  /** Computed class names */
  className: string;
  /** Tabs state */
  selectedKey: string;
  focused: boolean;
  pressed: boolean;
  highlightedIndex: number;
  /** Event handlers */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleTabClick: (key: string, index: number) => void;
  selectTab: (key: string) => void;
  highlightTab: (index: number) => void;
  activateTab: (key: string) => void;
  /** Semantic attributes */
  tablistAttributes: Record<string, any>;
  getTabAttributes: (tab: TabItem, index: number) => Record<string, any>;
  getTabPanelAttributes: (tab: TabItem) => Record<string, any>;
  /** References */
  tablistRef: React.RefObject<HTMLDivElement>;
  /** Tabs data */
  items: TabItem[];
  selectedTab: TabItem | undefined;
  selectedIndex: number;
  /** Size classes */
  sizeClasses: string;
  /** Variant classes */
  variantClasses: string;
}

export interface TabRenderProps {
  /** Tab item */
  tab: TabItem;
  /** Tab index */
  index: number;
  /** Whether tab is selected */
  selected: boolean;
  /** Whether tab is highlighted */
  highlighted: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler */
  onMouseEnter: () => void;
}

export interface TabPanelRenderProps {
  /** Tab item */
  tab: TabItem;
  /** Whether panel is selected */
  selected: boolean;
  /** Panel attributes */
  attributes: Record<string, any>;
}

/**
 * Styled tabs component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({
  className,
  style,
  render,
  renderTab,
  renderTabPanel,
  renderTabList,
  size = 'md',
  variant = 'default',
  showContent = true,
  animated = true,
  ...tabsProps
}, ref) => {
  const tabs = useTabs({
    ...tabsProps,
    // Merge external ref with internal ref
    tablistRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'border-b border-gray-200',
    underline: 'border-b-2 border-transparent',
    pills: 'bg-gray-100 rounded-lg p-1',
    enclosed: 'border border-gray-200 rounded-lg'
  }[variant];

  // Default tab render function
  const defaultTabRender = (tab: TabItem, props: TabRenderProps) => {
    const baseClasses = 'flex items-center px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
    const disabledClasses = tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    let variantSpecificClasses = '';
    if (variant === 'default' || variant === 'enclosed') {
      variantSpecificClasses = props.selected
        ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
        : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent -mb-px';
    } else if (variant === 'underline') {
      variantSpecificClasses = props.selected
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent';
    } else if (variant === 'pills') {
      variantSpecificClasses = props.selected
        ? 'bg-white text-blue-600 shadow-sm rounded'
        : 'text-gray-600 hover:text-gray-800 rounded';
    }

    return (
      <button
        key={tab.key}
        type="button"
        className={`${baseClasses} ${disabledClasses} ${variantSpecificClasses}`}
        onClick={!tab.disabled ? props.onClick : undefined}
        onMouseEnter={!tab.disabled ? props.onMouseEnter : undefined}
        disabled={tab.disabled}
        {...tabs.getTabAttributes(tab, props.index)}
      >
        {/* Icon */}
        {tab.icon && (
          <span className="mr-2 flex-shrink-0 w-4 h-4">
            {tab.icon}
          </span>
        )}

        {/* Label */}
        <span className="truncate">{tab.label}</span>

        {/* Badge */}
        {tab.badge && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
            {tab.badge}
          </span>
        )}
      </button>
    );
  };

  // Default tab panel render function
  const defaultTabPanelRender = (tab: TabItem, props: TabPanelRenderProps) => {
    if (!showContent || !tab.content) return null;

    const animationClasses = animated ? 'transition-all duration-200 ease-in-out' : '';

    return (
      <div
        key={`${tab.key}-panel`}
        className={`p-6 ${animationClasses}`}
        style={{
          display: props.selected ? 'block' : 'none',
          opacity: props.selected ? 1 : 0,
          transform: props.selected ? 'translateY(0)' : 'translateY(10px)'
        }}
        {...props.attributes}
      >
        {tab.content}
      </div>
    );
  };

  // Default tab list render function
  const defaultTabListRender = (props: TabsRenderProps) => {
    const isVertical = tabsProps.orientation === 'vertical';

    return (
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} ${variantClasses}`}>
        {props.items.map((tab, index) => {
          const isSelected = tab.key === props.selectedKey;
          const isHighlighted = index === props.highlightedIndex;

          const tabProps: TabRenderProps = {
            tab,
            index,
            selected: isSelected,
            highlighted: isHighlighted,
            onClick: () => props.handleTabClick(tab.key, index),
            onMouseEnter: () => props.highlightTab(index)
          };

          return renderTab ? renderTab(tab, tabProps) : defaultTabRender(tab, tabProps);
        })}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: TabsRenderProps) => {
    const isVertical = tabsProps.orientation === 'vertical';
    const contentPosition = tabsProps.tabPosition || 'top';

    const tabListElement = (
      <div
        ref={props.tablistRef}
        className={`tabs-list ${sizeClasses} ${variantClasses} ${className || ''}`}
        style={style}
        onKeyDown={props.handleKeyDown}
        {...props.tablistAttributes}
      >
        {renderTabList ? renderTabList(props) : defaultTabListRender(props)}
      </div>
    );

    const tabPanels = showContent && (
      <div className="tabs-content">
        {props.items.map((tab) => {
          const isSelected = tab.key === props.selectedKey;
          const panelProps: TabPanelRenderProps = {
            tab,
            selected: isSelected,
            attributes: props.getTabPanelAttributes(tab)
          };

          return renderTabPanel ? renderTabPanel(tab, panelProps) : defaultTabPanelRender(tab, panelProps);
        })}
      </div>
    );

    // Layout based on tab position
    if (contentPosition === 'bottom') {
      return (
        <div className={`tabs-container ${isVertical ? 'flex' : 'block'}`}>
          {tabPanels}
          {tabListElement}
        </div>
      );
    } else if (contentPosition === 'left') {
      return (
        <div className={`tabs-container flex ${isVertical ? 'flex-col' : ''}`}>
          <div className="flex-shrink-0 w-64">
            {tabListElement}
          </div>
          <div className="flex-1">
            {tabPanels}
          </div>
        </div>
      );
    } else if (contentPosition === 'right') {
      return (
        <div className={`tabs-container flex ${isVertical ? 'flex-col-reverse' : ''}`}>
          <div className="flex-1">
            {tabPanels}
          </div>
          <div className="flex-shrink-0 w-64">
            {tabListElement}
          </div>
        </div>
      );
    }

    // Default: top
    return (
      <div className="tabs-container">
        {tabListElement}
        {tabPanels}
      </div>
    );
  };

  // Render props
  const renderProps: TabsRenderProps = {
    className: className || '',
    selectedKey: tabs.selectedKey,
    focused: tabs.focused,
    pressed: tabs.pressed,
    highlightedIndex: tabs.highlightedIndex,
    handleKeyDown: tabs.handleKeyDown,
    handleTabClick: tabs.handleTabClick,
    selectTab: tabs.selectTab,
    highlightTab: tabs.highlightTab,
    activateTab: tabs.activateTab,
    tablistAttributes: tabs.tablistAttributes,
    getTabAttributes: tabs.getTabAttributes,
    getTabPanelAttributes: tabs.getTabPanelAttributes,
    tablistRef: tabs.tablistRef,
    items: tabs.items,
    selectedTab: tabs.selectedTab,
    selectedIndex: tabs.selectedIndex,
    sizeClasses,
    variantClasses
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Tabs.displayName = 'Tabs';

/**
 * Tab component for individual tab items.
 */
export interface TabProps {
  /** Tab key */
  key: string;
  /** Tab label */
  label: string;
  /** Tab content */
  children?: React.ReactNode;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Tab icon */
  icon?: React.ReactNode;
  /** Tab badge/count */
  badge?: number | string;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(({
  children,
  className,
  style,
  ...props
}, ref) => {
  // This is a simplified Tab component
  // In a real implementation, this would be used within a Tabs context
  return (
    <button
      ref={ref}
      className={`tab ${className || ''}`}
      style={style}
      type="button"
      role="tab"
      {...props}
    >
      {props.label}
      {children}
    </button>
  );
});

Tab.displayName = 'Tab';

/**
 * Tab panel component for tab content.
 */
export interface TabPanelProps {
  /** Tab key */
  key: string;
  /** Whether panel is selected */
  selected?: boolean;
  /** Panel content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(({
  children,
  selected = false,
  className,
  style,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`tab-panel ${className || ''}`}
      style={{
        display: selected ? 'block' : 'none',
        ...style
      }}
      role="tabpanel"
      hidden={!selected}
      {...props}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

/**
 * Simple tabs wrapper for common use cases.
 */
export interface SimpleTabsProps {
  /** Tab items */
  items: TabItem[];
  /** Selected tab key */
  selectedKey?: string;
  /** Default selected tab key */
  defaultSelectedKey?: string;
  /** Selection change handler */
  onSelectionChange?: (key: string) => void;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SimpleTabs = forwardRef<HTMLDivElement, SimpleTabsProps>(({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className,
  style
}, ref) => (
  <Tabs
    items={items}
    selectedKey={selectedKey}
    defaultSelectedKey={defaultSelectedKey}
    onSelectionChange={onSelectionChange}
    className={className}
    style={style}
    ref={ref}
    orientation="horizontal"
    activationMode="automatic"
    showContent={true}
    animated={true}
    variant="default"
  />
));

SimpleTabs.displayName = 'SimpleTabs';

/**
 * Vertical tabs wrapper.
 */
export const VerticalTabs = forwardRef<HTMLDivElement, Omit<TabsProps, 'orientation'>>((props, ref) => (
  <Tabs
    {...props}
    orientation="vertical"
    ref={ref}
  />
));

VerticalTabs.displayName = 'VerticalTabs';