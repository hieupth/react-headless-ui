/**
 * Command renderer component.
 * Provides visual representation for command palette/components.
 */

import React, { forwardRef, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useCommand } from '../hooks';
import { useVirtualList } from '../hooks';
import type { UseCommandProps, CommandItem as CommandItemData, CommandGroup as CommandGroupData } from '../hooks';

/**
 * Default item count above which the Command list virtualizes. Below this,
 * every item renders directly (preserving the legacy DOM for small lists).
 */
const DEFAULT_VIRTUALIZE_THRESHOLD = 100;
/** Estimated row height (px) used by the virtualizer when no DOM measurement. */
const VIRTUAL_ROW_HEIGHT = 36;
/** Max list height (px) — bounds the scroll viewport for virtualization. */
const VIRTUAL_MAX_HEIGHT = 320;

/**
 * Command component props
 */
export interface CommandProps extends UseCommandProps {
  /** Command content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom item renderer */
  itemRenderer?: (item: CommandItemData, index: number, attributes: any) => React.ReactNode;
  /** Custom group renderer */
  groupRenderer?: (group: CommandGroupData) => React.ReactNode;
  /** Custom no results renderer */
  noResultsRenderer?: () => React.ReactNode;
  /** Custom search renderer */
  searchRenderer?: (attributes: any) => React.ReactNode;
  /** Force virtualization on/off regardless of item count. */
  virtualize?: boolean;
  /** Item count at/above which virtualization engages (default 100). */
  virtualizeThreshold?: number;
}

/**
 * Command Trigger component props
 */
export interface CommandTriggerProps {
  /** Trigger content */
  children: React.ReactNode;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command Input component props
 */
export interface CommandInputProps {
  /** Input attributes */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command List component props
 */
export interface CommandListProps {
  /** List content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command Item component props
 */
export interface CommandItemProps {
  /** Item content */
  children: React.ReactNode;
  /** Item value */
  value?: any;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional shortcut */
  shortcut?: string[];
  /** Optional description */
  description?: string;
  /** Select handler */
  onSelect?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command Group component props
 */
export interface CommandGroupProps {
  /** Group heading */
  heading: string;
  /** Group content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command Separator component props
 */
export interface CommandSeparatorProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command Empty component props
 */
export interface CommandEmptyProps {
  /** Empty message */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Command component
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(
  ({
    children,
    className = '',
    style,
    itemRenderer,
    groupRenderer,
    noResultsRenderer,
    searchRenderer,
    virtualize,
    virtualizeThreshold = DEFAULT_VIRTUALIZE_THRESHOLD,
    ...props
  }: CommandProps, ref) => {
    const commandRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes,
      searchInputAttributes,
      listAttributes,
      getItemAttributes
    } = useCommand(props);

    const { open, value, filteredItems, filteredGroups, selectedIndex } = state;

    // Virtualization engages only for the flat (non-grouped) list above the
    // configured threshold. Grouped lists keep their legacy render path so
    // group headings remain interleaved with their items.
    const virtualizeEnabled = useMemo(
      () => (virtualize ?? filteredItems.length >= virtualizeThreshold) && !props.groups,
      [virtualize, virtualizeThreshold, filteredItems.length, props.groups]
    );
    const { virtualItems, totalSize, scrollToIndex } = useVirtualList({
      count: filteredItems.length,
      getScrollElement: () => listRef.current,
      estimateSize: VIRTUAL_ROW_HEIGHT,
      enabled: virtualizeEnabled && open,
    });

    // Keep the active item in view while keyboard-navigating.
    useEffect(() => {
      if (virtualizeEnabled && selectedIndex >= 0) {
        scrollToIndex(selectedIndex);
      }
    }, [virtualizeEnabled, selectedIndex, scrollToIndex]);

    // Mirror the hook default so an omitted showNoResults behaves as "on".
    const showNoResults = props.showNoResults !== false;

    // Render search input
    const renderSearch = () => {
      if (props.showSearch === false) return null;

      if (searchRenderer) {
        return searchRenderer(searchInputAttributes);
      }

      return (
        <div className="command-search   ">
          <input
            {...searchInputAttributes}
            className={`           ${className}`}
            data-testid="command-input"
          />
        </div>
      );
    };

    // Render command item. `overrideAttributes` carries virtualizer positioning
    // (absolute placement) so the same renderer serves both render paths.
    const renderItem = (
      item: CommandItemData,
      index: number,
      overrideAttributes?: { style?: React.CSSProperties }
    ) => {
      const itemAttributes = getItemAttributes(item, index);

      if (itemRenderer) {
        return itemRenderer(item, index, itemAttributes);
      }

      return (
        <div
          {...itemAttributes}
          key={item.id || index}
          className={`
                 
            ${selectedIndex === index ? ' ' : ' '}
            ${item.disabled ? ' ' : ''}
            ${className}
          `}
          style={overrideAttributes?.style}
          data-testid="command-item"
        >
          <div className="  ">
            <div className="  ">
              {item.icon && (
                <span className="    ">
                  {item.icon}
                </span>
              )}
              <span className="">{item.label}</span>
            </div>
            {item.shortcut && (
              <div className=" ">
                {item.shortcut.map((key, i) => (
                  <kbd
                    key={i}
                    className="       "
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            )}
          </div>
          {item.description && (
            <p className="   ">
              {item.description}
            </p>
          )}
        </div>
      );
    };

    // Render command group
    const renderGroup = (group: CommandGroupData) => {
      if (groupRenderer) {
        return groupRenderer(group);
      }

      return (
        <div key={group.id} className="command-group" data-testid="command-group">
          <div className="       ">
            {group.heading}
          </div>
          <div className="command-group-items">
            {group.items.map((item, index) => {
              const globalIndex = filteredGroups
                .slice(0, filteredGroups.indexOf(group))
                .reduce((acc, g) => acc + g.items.length, 0) + index;
              return renderItem(item, globalIndex);
            })}
          </div>
        </div>
      );
    };

    // Render no results message
    const renderNoResults = () => {
      if (!showNoResults || filteredItems.length > 0) return null;

      if (noResultsRenderer) {
        return noResultsRenderer();
      }

      return (
        <div className="   " data-testid="command-empty">
          {props.noResultsMessage || 'No results found.'}
        </div>
      );
    };

    // Render command content
    const content = (
      <div
        ref={commandRef}
        className={`
                
          ${className}
        `}
        style={{
          ...style,
          ...attributes.style,
          zIndex: attributes['data-z-index'],
          minWidth: '300px',
          maxWidth: '500px'
        }}
        {...attributes}
        data-testid="command"
      >
        {/* Search Input */}
        {renderSearch()}

        {/* Command List */}
        <div
          ref={listRef}
          {...listAttributes}
          className="command-list "
          style={{ ...listAttributes.style, maxHeight: virtualizeEnabled ? VIRTUAL_MAX_HEIGHT : undefined }}
        >
          {props.groups && filteredGroups.length > 0 ? (
            filteredGroups.map(renderGroup)
          ) : virtualizeEnabled ? (
            <div style={{ height: totalSize, position: 'relative' }}>
              {virtualItems.map((vi) => renderItem(filteredItems[vi.index], vi.index, {
                style: { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)` },
              }))}
            </div>
          ) : (
            filteredItems.map((item, index) => renderItem(item, index))
          )}
          {renderNoResults()}
        </div>

        {/* Custom Children */}
        {children}
      </div>
    );

    // Use portal if enabled
    if (props.portal && open) {
      return createPortal(content, document.body);
    }

    return open ? content : null;
  }
);

/**
 * Command Trigger component
 */
export const CommandTrigger: React.FC<CommandTriggerProps> = ({
  children,
  onOpen,
  onClose,
  className = '',
  style
}) => {
  const handleClick = () => {
    onOpen?.();
  };

  return (
    <div
      className={className}
      style={style}
      onClick={handleClick}
      data-command-trigger
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      data-testid="command-trigger"
    >
      {children}
    </div>
  );
};

/**
 * Command Input component
 */
export const CommandInput: React.FC<CommandInputProps> = ({
  inputProps,
  className = '',
  style
}) => {
  return (
    <div className={`command-input-wrapper ${className}`} style={style}>
      <input
        {...inputProps}
        className={`           ${className}`}
        data-testid="command-input"
      />
    </div>
  );
};

/**
 * Command List component
 */
export const CommandList: React.FC<CommandListProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`command-list  ${className}`}
      style={style}
      role="listbox"
      data-testid="command-list"
    >
      {children}
    </div>
  );
};

/**
 * Command Item component
 */
export const CommandItem: React.FC<CommandItemProps> = ({
  children,
  value,
  disabled = false,
  icon,
  shortcut,
  description,
  onSelect,
  className = '',
  style
}) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect?.();
    }
  };

  return (
    <div
      className={`
             
        ${disabled ? ' ' : ' '}
        ${className}
      `}
      style={style}
      onClick={handleClick}
      role="option"
      data-value={value}
      data-disabled={disabled}
      data-testid="command-item"
    >
      <div className="  ">
        <div className="  ">
          {icon && (
            <span className="    ">
              {icon}
            </span>
          )}
          <span className="">{children}</span>
        </div>
        {shortcut && (
          <div className=" ">
            {shortcut.map((key, i) => (
              <kbd
                key={i}
                className="       "
              >
                {key}
              </kbd>
            ))}
          </div>
        )}
      </div>
      {description && (
        <p className="   ">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * Command Group component
 */
export const CommandGroup: React.FC<CommandGroupProps> = ({
  heading,
  children,
  className = '',
  style
}) => {
  return (
    <div className={`command-group ${className}`} style={style} data-testid="command-group">
      <div className="       ">
        {heading}
      </div>
      <div className="command-group-items">
        {children}
      </div>
    </div>
  );
};

/**
 * Command Separator component
 */
export const CommandSeparator: React.FC<CommandSeparatorProps> = ({
  className = '',
  style
}) => {
  return (
    <div
      className={`   ${className}`}
      style={style}
      role="separator"
      data-testid="command-separator"
    />
  );
};

/**
 * Command Empty component
 */
export const CommandEmpty: React.FC<CommandEmptyProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`    ${className}`}
      style={style}
      data-testid="command-empty"
    >
      {children || 'No results found.'}
    </div>
  );
};

Command.displayName = 'Command';

export default Command;