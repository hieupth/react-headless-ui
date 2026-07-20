/**
 * TreeView renderer component using headless useTreeView hook.
 * Provides styled tree view with comprehensive accessibility support and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useTreeView, type UseTreeViewProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface TreeViewProps extends Omit<UseTreeViewProps, 'treeRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom node renderer */
  renderNode?: (node: any, level: number, isExpanded: boolean, isSelected: boolean) => React.ReactNode;
  /** Custom icon for expand/collapse */
  expandIcon?: React.ReactNode;
  /** Custom icon for collapse */
  collapseIcon?: React.ReactNode;
  /** Whether to show lines connecting nodes */
  showLines?: boolean;
  /** Default node icon */
  defaultNodeIcon?: React.ReactNode;
  /** Height of the tree container */
  height?: number | string;
}

/**
 * TreeView component with hierarchical data display.
 * Supports selection, expansion, and keyboard navigation with proper accessibility.
 */
export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(({
  className = '',
  style,
  renderNode,
  expandIcon,
  collapseIcon,
  showLines = false,
  defaultNodeIcon,
  height,
  ...treeViewProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useTreeView({
    ...treeViewProps,
    treeRef: ref as React.RefObject<HTMLDivElement>
  });

  // Default icons
  const defaultExpandIcon = (
    <svg
      className="w-4 h-4 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const defaultCollapseIcon = (
    <svg
      className="w-4 h-4 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const defaultIcon = (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Default node renderer
  const defaultRenderNode = (node: any, level: number, isExpanded: boolean, isSelected: boolean) => (
    <div
      className={`
        flex items-center gap-2 px-2 py-1 rounded cursor-pointer
        transition-colors duration-150
        ${isSelected
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100 text-gray-700'
        }
        ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{ paddingLeft: `${level * 20 + 8}px` }}
    >
      {/* Expand/Collapse Icon */}
      {node.children && node.children.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); actions.toggleNodeExpansion(node.id); }}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            {isExpanded ? (collapseIcon || defaultExpandIcon) : (expandIcon || defaultCollapseIcon)}
          </span>
        </button>
      )}

      {/* Spacer for nodes without children */}
      {(!node.children || node.children.length === 0) && (
        <span className="w-6 h-6 flex-shrink-0" />
      )}

      {/* Node Icon */}
      <span className="flex-shrink-0">
        {node.icon || defaultNodeIcon || defaultIcon}
      </span>

      {/* Node Label */}
      <span className="flex-1 truncate select-none">
        {node.label}
      </span>
    </div>
  );

  // Recursively render tree nodes
  const renderNodes = (nodes: any[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = actions.isNodeExpanded(node.id);
      const isSelected = actions.isNodeSelected(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.id} className="tree-node">
          {/* Node Content */}
          <div
            onClick={() => {
              if (!node.disabled) {
                actions.focusNode(node.id);
                actions.toggleNodeSelection(node.id);
                if (hasChildren) {
                  actions.toggleNodeExpansion(node.id);
                }
              }
            }}
            onDoubleClick={() => {
              if (!node.disabled) {
                actions.handleNodeActivate?.(node.id);
              }
            }}
            onKeyDown={(e) => {
              if (node.disabled) return;

              switch (e.key) {
                case 'Enter':
                case ' ':
                  e.preventDefault();
                  actions.toggleNodeSelection(node.id);
                  if (hasChildren) {
                    actions.toggleNodeExpansion(node.id);
                  }
                  break;
                case 'ArrowRight':
                  e.preventDefault();
                  if (!isExpanded && hasChildren) {
                    actions.expandNode(node.id);
                  }
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  if (isExpanded) {
                    actions.collapseNode(node.id);
                  }
                  break;
                case 'ArrowUp':
                case 'ArrowDown':
                  // Handle arrow navigation
                  e.preventDefault();
                  break;
              }
            }}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-level={level + 1}
            aria-disabled={node.disabled}
            tabIndex={state.focusedId === node.id ? 0 : -1}
            data-testid={`tree-node-${node.id}`}
          >
            {renderNode
              ? renderNode(node, level, isExpanded, isSelected)
              : defaultRenderNode(node, level, isExpanded, isSelected)
            }
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div
              role="group"
              className={showLines ? 'ml-4 border-l border-gray-300' : ''}
            >
              {renderNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Base tree classes
  const treeClasses = `
    tree-view
    ${className || ''}
    ${height ? 'overflow-hidden' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={treeClasses}
      style={{
        ...style,
        height: height || 'auto'
      }}
      {...attributes}
      data-testid="tree-view"
    >
      <div role="tree" className="tree-container">
        {renderNodes(state.nodes)}
      </div>

      {/* Empty State */}
      {state.nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <p className="text-sm">No items to display</p>
        </div>
      )}
    </div>
  );
});

TreeView.displayName = 'TreeView';

/**
 * TreeViewNode - Individual node component (for advanced usage)
 */
export interface TreeViewNodeProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Node data */
  node: any;
  /** Current level in tree */
  level: number;
  /** Whether node is expanded */
  isExpanded: boolean;
  /** Whether node is selected */
  isSelected: boolean;
  /** Whether to show expand icon */
  showExpandIcon: boolean;
  /** Expand icon */
  expandIcon?: React.ReactNode;
  /** Collapse icon */
  collapseIcon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Double click handler */
  onDoubleClick?: () => void;
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const TreeViewNode = forwardRef<HTMLDivElement, TreeViewNodeProps>(({
  className = '',
  style,
  node,
  level,
  isExpanded,
  isSelected,
  showExpandIcon,
  expandIcon,
  collapseIcon,
  onClick,
  onDoubleClick,
  onKeyDown,
  ...props
}, ref) => {
  const nodeClasses = `
    flex items-center gap-2 px-2 py-1 rounded cursor-pointer
    transition-colors duration-150
    ${isSelected
      ? 'bg-blue-100 text-blue-700'
      : 'hover:bg-gray-100 text-gray-700'
    }
    ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={nodeClasses}
      style={{
        ...style,
        paddingLeft: `${level * 20 + 8}px`
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={node.children && node.children.length > 0 ? isExpanded : undefined}
      aria-level={level + 1}
      aria-disabled={node.disabled}
      data-testid={`tree-node-${node.id}`}
      {...props}
    >
      {/* Expand/Collapse Icon */}
      {showExpandIcon && node.children && node.children.length > 0 && (
        <button
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            {isExpanded ? collapseIcon : expandIcon}
          </span>
        </button>
      )}

      {/* Node Icon */}
      {node.icon && (
        <span className="flex-shrink-0">
          {node.icon}
        </span>
      )}

      {/* Node Label */}
      <span className="flex-1 truncate select-none">
        {node.label}
      </span>
    </div>
  );
});

TreeViewNode.displayName = 'TreeViewNode';

export default TreeView;