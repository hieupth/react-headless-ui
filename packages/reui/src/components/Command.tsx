/**
 * Command renderer component.
 * Provides visual representation for command palette/components.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCommand } from '../hooks';
import type { UseCommandProps, CommandItem as CommandItemData, CommandGroup as CommandGroupData } from '../hooks';

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
    ...props
  }: CommandProps, ref) => {
    const commandRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes,
      searchInputAttributes,
      listAttributes,
      getItemAttributes
    } = useCommand(props);

    const { open, value, filteredItems, filteredGroups, selectedIndex } = state;

    // Mirror the hook default so an omitted showNoResults behaves as "on".
    const showNoResults = props.showNoResults !== false;

    // Render search input
    const renderSearch = () => {
      if (props.showSearch === false) return null;

      if (searchRenderer) {
        return searchRenderer(searchInputAttributes);
      }

      return (
        <div className="command-search p-3 border-b border-gray-200">
          <input
            {...searchInputAttributes}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            data-testid="command-input"
          />
        </div>
      );
    };

    // Render command item
    const renderItem = (item: CommandItemData, index: number) => {
      const itemAttributes = getItemAttributes(item, index);

      if (itemRenderer) {
        return itemRenderer(item, index, itemAttributes);
      }

      return (
        <div
          {...itemAttributes}
          key={item.id || index}
          className={`
            px-3 py-2 text-sm cursor-pointer transition-colors duration-150
            ${selectedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          data-testid="command-item"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {item.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.shortcut && (
              <div className="flex space-x-1">
                {item.shortcut.map((key, i) => (
                  <kbd
                    key={i}
                    className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 ml-6">
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
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
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
        <div className="p-4 text-center text-gray-500 text-sm" data-testid="command-empty">
          {props.noResultsMessage || 'No results found.'}
        </div>
      );
    };

    // Render command content
    const content = (
      <div
        ref={commandRef}
        className={`
          fixed bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden
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
        <div {...listAttributes} className="command-list overflow-y-auto">
          {props.groups && filteredGroups.length > 0 ? (
            filteredGroups.map(renderGroup)
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
        className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
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
      className={`command-list overflow-y-auto ${className}`}
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
        px-3 py-2 text-sm cursor-pointer transition-colors duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}
        ${className}
      `}
      style={style}
      onClick={handleClick}
      role="option"
      data-value={value}
      data-disabled={disabled}
      data-testid="command-item"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && (
            <span className="w-4 h-4 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span className="font-medium">{children}</span>
        </div>
        {shortcut && (
          <div className="flex space-x-1">
            {shortcut.map((key, i) => (
              <kbd
                key={i}
                className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded"
              >
                {key}
              </kbd>
            ))}
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 ml-6">
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
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
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
      className={`border-t border-gray-200 my-1 ${className}`}
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
      className={`p-4 text-center text-gray-500 text-sm ${className}`}
      style={style}
      data-testid="command-empty"
    >
      {children || 'No results found.'}
    </div>
  );
};

Command.displayName = 'Command';

export default Command;