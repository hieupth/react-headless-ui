/**
 * Tabs renderer component using headless useTabs hook.
 * Provides styled tabs with keyboard navigation and content switching.
 */

import React, { forwardRef } from 'react';
import { useTabs } from '../hooks';
import type { UseTabsProps, TabItem } from '../hooks';

export interface TabsProps extends UseTabsProps, React.AriaAttributes {
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
  /**
   * Compound children API: <Tabs.List><Tabs.Trigger/></Tabs.List> plus
   * <Tabs.Content/>. When provided, items are derived from the children
   * instead of the `items` prop.
   */
  children?: React.ReactNode;
}

/**
 * Compound tab list container holding <Tabs.Trigger> children. Renders nothing
 * itself; collected by the parent <Tabs>.
 */
export interface TabsListProps {
  children: React.ReactNode;
}

/** Compound tab trigger. Its children become the tab's accessible name. */
export interface TabsTriggerProps {
  /** Tab value (used as the tab key) */
  value: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
  children: React.ReactNode;
}

/** Compound tab panel. Matched to a trigger by `value`. */
export interface TabsContentProps {
  /** Tab value this panel corresponds to */
  value: string;
  children: React.ReactNode;
}

const TabsList = (_props: TabsListProps): null => null;
TabsList.displayName = 'Tabs.List';
const TabsTrigger = (_props: TabsTriggerProps): null => null;
TabsTrigger.displayName = 'Tabs.Trigger';
const TabsContent = (_props: TabsContentProps): null => null;
TabsContent.displayName = 'Tabs.Content';

const isCompound = (child: unknown, name: string): child is React.ReactElement =>
  React.isValidElement(child) &&
  (child.type as { displayName?: string }).displayName === name;

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
  tablistRef: React.RefObject<HTMLDivElement | null>;
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
  children,
  ...tabsProps
}: TabsProps, ref) => {
  // Compound children API: derive items from <Tabs.List><Tabs.Trigger/></Tabs.List>
  // and content from <Tabs.Content/>, matched to triggers by value.
  const childItems: TabItem[] = [];
  const contentByKey: Record<string, React.ReactNode> = {};
  let hasCompoundChildren = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const dn = (child.type as { displayName?: string }).displayName;
    if (dn === 'Tabs.List') {
      hasCompoundChildren = true;
      React.Children.forEach((child.props as { children?: React.ReactNode }).children, (listChild) => {
        if (isCompound(listChild, 'Tabs.Trigger')) {
          const p = (listChild as React.ReactElement<TabsTriggerProps>).props;
          childItems.push({ key: p.value, label: p.children, disabled: p.disabled });
        }
      });
    } else if (dn === 'Tabs.Content') {
      hasCompoundChildren = true;
      const p = child.props as TabsContentProps;
      contentByKey[p.value] = p.children;
    }
  });
  if (hasCompoundChildren) {
    childItems.forEach((it) => {
      if (contentByKey[it.key] !== undefined) it.content = contentByKey[it.key];
    });
  }
  const items = hasCompoundChildren ? childItems : tabsProps.items;

  const tabs = useTabs({
    ...tabsProps,
    items
  });

  // Size classes
  const sizeClasses = {
    sm: '',
    md: '',
    lg: ''
  }[size];

  // Variant classes
  const variantClasses = {
    default: ' ',
    underline: ' ',
    pills: '  ',
    enclosed: '  '
  }[variant];

  // Default tab render function
  const defaultTabRender = (tab: TabItem, props: TabRenderProps) => {
    const baseClasses = '         ';
    const disabledClasses = tab.disabled ? ' ' : '';

    let variantSpecificClasses = '';
    if (variant === 'default' || variant === 'enclosed') {
      variantSpecificClasses = props.selected
        ? '   -mb-px'
        : '    -mb-px';
    } else if (variant === 'underline') {
      variantSpecificClasses = props.selected
        ? '  '
        : '   ';
    } else if (variant === 'pills') {
      variantSpecificClasses = props.selected
        ? '   '
        : '  ';
    }

    return (
      <button
        key={tab.key}
        id={`${tab.key}-tab`}
        type="button"
        className={`${baseClasses} ${disabledClasses} ${variantSpecificClasses}`}
        onClick={!tab.disabled ? props.onClick : undefined}
        onMouseEnter={!tab.disabled ? props.onMouseEnter : undefined}
        disabled={tab.disabled}
        {...tabs.getTabAttributes(tab, props.index)}
      >
        {/* Icon */}
        {tab.icon && (
          <span className="   ">
            {tab.icon}
          </span>
        )}

        {/* Label */}
        <span className="">{tab.label}</span>

        {/* Badge */}
        {tab.badge && (
          <span className="      ">
            {tab.badge}
          </span>
        )}
      </button>
    );
  };

  // Default tab panel render function
  const defaultTabPanelRender = (tab: TabItem, props: TabPanelRenderProps) => {
    if (!showContent || !tab.content) return null;

    const animationClasses = animated ? '  ' : '';

    return (
      <div
        key={`${tab.key}-panel`}
        id={`${tab.key}-panel`}
        className={` ${animationClasses}`}
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
      <div className={` ${isVertical ? '' : ''} ${variantClasses}`}>
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
        <div className={`tabs-container ${isVertical ? '' : ''}`}>
          {tabPanels}
          {tabListElement}
        </div>
      );
    } else if (contentPosition === 'left') {
      return (
        <div className={`tabs-container  ${isVertical ? '' : ''}`}>
          <div className=" ">
            {tabListElement}
          </div>
          <div className="">
            {tabPanels}
          </div>
        </div>
      );
    } else if (contentPosition === 'right') {
      return (
        <div className={`tabs-container  ${isVertical ? '' : ''}`}>
          <div className="">
            {tabPanels}
          </div>
          <div className=" ">
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

// Attach compound sub-components: <Tabs.List/Trigger/Content>.
(Tabs as unknown as {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
}).List = TabsList;
(Tabs as unknown as { Trigger: typeof TabsTrigger }).Trigger = TabsTrigger;
(Tabs as unknown as { Content: typeof TabsContent }).Content = TabsContent;

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
  /** Selected tab value */
  value?: string;
  /** Default selected tab value */
  defaultValue?: string;
  /** Value change handler (standard selection API) */
  onValueChange?: (value: string) => void;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SimpleTabs = forwardRef<HTMLDivElement, SimpleTabsProps>(({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  style
}, ref) => (
  <Tabs
    items={items}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
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