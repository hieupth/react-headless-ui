/**
 * TreeView headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages tree structure with expandable/collapsible nodes and selection.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Tree node interface
 */
export interface TreeNode {
  /** Unique identifier for the node */
  id: string;
  /** Node label text */
  label: string;
  /** Whether node is disabled */
  disabled?: boolean;
  /** Child nodes */
  children?: TreeNode[];
  /** Whether node is initially expanded */
  defaultExpanded?: boolean;
  /** Whether node is initially selected */
  defaultSelected?: boolean;
  /** Node icon */
  icon?: React.ReactNode;
  /** Additional node data */
  data?: any;
}

/**
 * Selection mode options
 */
export type SelectionMode = 'single' | 'multiple' | 'none';

/**
 * Tree view state interface
 */
export interface TreeViewState {
  /** Currently selected node keys (standard selection API; array form) */
  selectedKeys: string[];
  /** Currently expanded node IDs */
  expandedIds: Set<string>;
  /** Whether tree view is disabled */
  disabled: boolean;
  /** Current selection mode */
  selectionMode: SelectionMode;
  /** Tree structure */
  nodes: TreeNode[];
  /** Focused node ID */
  focusedId: string | null;
}

/**
 * Tree view actions interface
 */
export interface TreeViewActions {
  /** Select a node */
  selectNode: (nodeId: string) => void;
  /** Deselect a node */
  deselectNode: (nodeId: string) => void;
  /** Toggle node selection */
  toggleNodeSelection: (nodeId: string) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Expand a node */
  expandNode: (nodeId: string) => void;
  /** Collapse a node */
  collapseNode: (nodeId: string) => void;
  /** Toggle node expansion */
  toggleNodeExpansion: (nodeId: string) => void;
  /** Expand all nodes */
  expandAll: () => void;
  /** Collapse all nodes */
  collapseAll: () => void;
  /** Set focus to a node */
  focusNode: (nodeId: string) => void;
  /** Get node by ID */
  getNode: (nodeId: string) => TreeNode | undefined;
  /** Get node path */
  getNodePath: (nodeId: string) => TreeNode[];
  /** Check if node is selected */
  isNodeSelected: (nodeId: string) => boolean;
  /** Check if node is expanded */
  isNodeExpanded: (nodeId: string) => boolean;
  /** Get selected nodes */
  getSelectedNodes: () => TreeNode[];
  /** Activate a node (e.g. on double-click or Enter) */
  handleNodeActivate: (nodeId: string) => void;
}

/**
 * Props for useTreeView hook
 */
export interface UseTreeViewProps {
  /** Tree data structure */
  nodes: TreeNode[];
  /** Selection mode */
  selectionMode?: SelectionMode;
  /** Whether tree view is disabled */
  disabled?: boolean;
  /** Initially selected node keys (standard selection API) */
  defaultSelectedKeys?: string[];
  /** Initially expanded node IDs */
  defaultExpandedIds?: string[];
  /** Whether to expand all nodes initially */
  expandAll?: boolean;
  /** Callback when selection changes (standard selection API; array form) */
  onSelectionChange?: (selectedKeys: string[]) => void;
  /**
   * @deprecated Use `defaultSelectedKeys`. Alias retained for backward compatibility.
   */
  defaultSelectedIds?: string[];
  /** Callback when expansion changes */
  onExpansionChange?: (expandedIds: Set<string>) => void;
  /** Callback when node is activated (double-click or Enter) */
  onNodeActivate?: (node: TreeNode) => void;
  /** Ref to the tree view element */
  treeRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for useTreeView hook
 */
export interface UseTreeViewReturns {
  /** Current tree view state */
  state: TreeViewState;
  /** Tree view actions */
  actions: TreeViewActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
    'aria-multiselectable': boolean;
    'role': string;
    'tabIndex': number;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Tree view hook implementation
 * @param props - Tree view configuration props
 * @returns Tree view state, actions, and attributes
 */
export function useTreeView(props: UseTreeViewProps): UseTreeViewReturns {
  const {
    nodes,
    selectionMode = 'single',
    disabled = false,
    defaultSelectedKeys,
    defaultExpandedIds = [],
    expandAll = false,
    onSelectionChange,
    onExpansionChange,
    onNodeActivate,
    // Deprecated alias.
    defaultSelectedIds: legacyDefaultSelectedIds,
    treeRef
  } = props;

  // Resolve standard vs deprecated alias (standard name takes precedence).
  const initialSelectedKeys = defaultSelectedKeys ?? legacyDefaultSelectedIds ?? [];

  // State management. Internally a Set for O(1) membership checks; the public
  // API exposes `selectedKeys` as an array and emits arrays from onSelectionChange.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(initialSelectedKeys)
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (expandAll) {
      return new Set(getAllNodeIds(nodes));
    }
    return new Set(defaultExpandedIds);
  });
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const treeElementRef = treeRef || internalRef;

  // Helper function to get all node IDs recursively
  function getAllNodeIds(nodes: TreeNode[]): string[] {
    const ids: string[] = [];
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children) {
        ids.push(...getAllNodeIds(node.children));
      }
    }
    return ids;
  }

  // Helper function to find node by ID
  function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Helper function to get node path
  function getNodePath(nodes: TreeNode[], targetId: string, currentPath: TreeNode[] = []): TreeNode[] | null {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === targetId) return newPath;
      if (node.children) {
        const found = getNodePath(node.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper function to get selected nodes
  const getSelectedNodes = useCallback((): TreeNode[] => {
    const selected: TreeNode[] = [];
    for (const id of selectedIds) {
      const node = findNodeById(nodes, id);
      if (node) selected.push(node);
    }
    return selected;
  }, [selectedIds, nodes]);

  // Emit the current selection as the standardized array form.
  const emitSelection = useCallback((next: Set<string>) => {
    onSelectionChange?.(Array.from(next));
  }, [onSelectionChange]);

  // Selection actions
  const selectNode = useCallback((nodeId: string) => {
    if (disabled) return;

    const node = findNodeById(nodes, nodeId);
    if (!node || node.disabled) return;

    let newSelectedIds: Set<string>;

    switch (selectionMode) {
      case 'single':
        newSelectedIds = new Set([nodeId]);
        break;
      case 'multiple':
        newSelectedIds = new Set(selectedIds).add(nodeId);
        break;
      case 'none':
        return;
    }

    setSelectedIds(newSelectedIds);
    emitSelection(newSelectedIds);
  }, [disabled, nodes, selectionMode, selectedIds, emitSelection]);

  const deselectNode = useCallback((nodeId: string) => {
    if (disabled || selectionMode !== 'multiple') return;

    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.delete(nodeId);
    setSelectedIds(newSelectedIds);
    emitSelection(newSelectedIds);
  }, [disabled, selectionMode, selectedIds, emitSelection]);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    if (disabled || selectionMode === 'none') return;

    if (selectedIds.has(nodeId)) {
      deselectNode(nodeId);
    } else {
      selectNode(nodeId);
    }
  }, [disabled, selectionMode, selectedIds, selectNode, deselectNode]);

  const clearSelection = useCallback(() => {
    if (disabled) return;

    const empty = new Set<string>();
    setSelectedIds(empty);
    emitSelection(empty);
  }, [disabled, emitSelection]);

  // Expansion actions
  const expandNode = useCallback((nodeId: string) => {
    if (disabled) return;

    const node = findNodeById(nodes, nodeId);
    if (!node || !node.children || node.children.length === 0) return;

    const newExpandedIds = new Set(expandedIds).add(nodeId);
    setExpandedIds(newExpandedIds);
    onExpansionChange?.(newExpandedIds);
  }, [disabled, nodes, expandedIds, onExpansionChange]);

  const collapseNode = useCallback((nodeId: string) => {
    if (disabled) return;

    const newExpandedIds = new Set(expandedIds);
    newExpandedIds.delete(nodeId);
    setExpandedIds(newExpandedIds);
    onExpansionChange?.(newExpandedIds);
  }, [disabled, expandedIds, onExpansionChange]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    if (disabled) return;

    if (expandedIds.has(nodeId)) {
      collapseNode(nodeId);
    } else {
      expandNode(nodeId);
    }
  }, [disabled, expandedIds, expandNode, collapseNode]);

  const expandAllNodes = useCallback(() => {
    if (disabled) return;

    const allNodeIds = getAllNodeIds(nodes);
    const newExpandedIds = new Set(allNodeIds);
    setExpandedIds(newExpandedIds);
    onExpansionChange?.(newExpandedIds);
  }, [disabled, nodes, onExpansionChange]);

  const collapseAllNodes = useCallback(() => {
    if (disabled) return;

    setExpandedIds(new Set());
    onExpansionChange?.(new Set());
  }, [disabled, onExpansionChange]);

  // Focus actions
  const focusNode = useCallback((nodeId: string) => {
    if (disabled) return;
    setFocusedId(nodeId);
  }, [disabled]);

  // Query functions
  const getNode = useCallback((nodeId: string): TreeNode | undefined => {
    return findNodeById(nodes, nodeId);
  }, [nodes]);

  const getNodePathById = useCallback((nodeId: string): TreeNode[] => {
    const path = getNodePath(nodes, nodeId);
    return path || [];
  }, [nodes]);

  const isNodeSelected = useCallback((nodeId: string): boolean => {
    return selectedIds.has(nodeId);
  }, [selectedIds]);

  const isNodeExpanded = useCallback((nodeId: string): boolean => {
    return expandedIds.has(nodeId);
  }, [expandedIds]);

  // Node activation handler
  const handleNodeActivate = useCallback((nodeId: string) => {
    const node = findNodeById(nodes, nodeId);
    if (node && !node.disabled && !disabled) {
      onNodeActivate?.(node);
    }
  }, [nodes, disabled, onNodeActivate]);

  // Build state. `selectedKeys` is the standardized array form of the internal
  // selection Set.
  const state: TreeViewState = {
    selectedKeys: Array.from(selectedIds),
    expandedIds,
    disabled,
    selectionMode,
    nodes,
    focusedId
  };

  // Build actions
  const actions: TreeViewActions = {
    selectNode,
    deselectNode,
    toggleNodeSelection,
    clearSelection,
    expandNode,
    collapseNode,
    toggleNodeExpansion,
    expandAll: expandAllNodes,
    collapseAll: collapseAllNodes,
    focusNode,
    getNode,
    getNodePath: getNodePathById,
    isNodeSelected,
    isNodeExpanded,
    getSelectedNodes,
    handleNodeActivate
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: treeElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: treeElementRef
  });

  const semantic = useSemanticMixin({
    role: 'tree',
    ariaLabel: 'Tree view',
    ariaMultiSelectable: selectionMode === 'multiple',
    ref: treeElementRef
  });

  // Build attributes
  const attributes = {
    'aria-label': semantic.ariaLabel,
    'aria-multiselectable': semantic.ariaMultiSelectable,
    'role': semantic.role,
    'tabIndex': disabled ? -1 : 0
  };

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}