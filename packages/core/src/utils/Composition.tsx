/**
 * Composition utilities following Flutter widget composition patterns.
 * Provides utilities for combining behaviors and managing component trees.
 */

import { useMemo, useCallback } from 'react';
import type { ComponentContract, TraversalNode } from '../contracts';

export interface CompositionOptions {
  /** Unique identifier for composition */
  id: string;
  /** Parent component in tree */
  parent?: ComponentContract;
  /** Child components */
  children?: ComponentContract[];
  /** Additional merge strategies */
  mergeStrategies?: MergeStrategy[];
}

export type MergeStrategy = 'deep' | 'shallow' | 'override' | 'combine';

/**
 * Composes multiple objects into single state object.
 * Follows Flutter widget composition pattern for state management.
 */
export const composeState = <T extends Record<string, any>>(
  ...states: (Partial<T> | undefined)[]
): T => {
  return states.reduce((composed: any, state) => {
    if (!state) return composed;

    const result = { ...composed };

    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined) {
        result[key] = value;
      }
    });

    return result;
  }, {} as any);
};

/**
 * Composes multiple event handlers into single handler.
 * Handles async execution and error boundaries.
 */
export const composeHandlers = <T extends (...args: any[]) => any>(
  ...handlers: (T | undefined)[]
): T => {
  return ((...args: Parameters<T>) => {
    const promises: Promise<any>[] = [];

    handlers.forEach(handler => {
      if (typeof handler === 'function') {
        try {
          const result = handler(...args);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error('Error in composed handler:', error);
        }
      }
    });

    // Return promise if any handlers are async
    if (promises.length > 0) {
      return Promise.allSettled(promises);
    }
  }) as T;
};

/**
 * Composes class names using utility-first approach.
 * Handles conditional classes and merging strategies.
 */
export const composeClasses = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
};

/**
 * Composes style objects with merge strategies.
 * Handles deep merging and conflict resolution.
 */
export const composeStyles = (
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties => {
  return styles.reduce((merged, style) => {
    if (!style) return merged;

    const result = { ...merged };

    // Handle nested objects for deep merge
    Object.entries(style).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof result[key as keyof React.CSSProperties] === 'object'
      ) {
        // Deep merge nested objects
        result[key as keyof React.CSSProperties] = {
          ...(result[key as keyof React.CSSProperties] as any),
          ...value
        };
      } else {
        result[key as keyof React.CSSProperties] = value;
      }
    });

    return result;
  }, {} as React.CSSProperties);
};

/**
 * Creates traversal tree from component hierarchy.
 * Enables Flutter-style tree traversal and manipulation.
 */
export const createTraversalTree = (
  root: ComponentContract,
  options: CompositionOptions = { id: 'root' }
): TraversalNode[] => {
  const nodes: TraversalNode[] = [];
  const visited = new Set<string>();

  const traverse = (component: ComponentContract, depth: number, path: string[]) => {
    if (visited.has(component.id)) return;
    visited.add(component.id);

    const node: TraversalNode = {
      component,
      depth,
      path: [...path, component.id],
      traversable: component.children.length > 0
    };

    nodes.push(node);

    // Traverse children
    component.children.forEach(child => {
      traverse(child, depth + 1, node.path);
    });
  };

  traverse(root, 0, []);

  return nodes;
};

/**
 * Composes component with lifecycle management.
 * Handles mounting, unmounting, and state changes.
 */
export const composeLifecycle = (
  component: ComponentContract,
  options: CompositionOptions = { id: 'lifecycle' }
): ComponentContract => {
  const { parent, children = [] } = options;

  // Create enhanced component with tree structure
  const enhanced: ComponentContract = {
    ...component,
    parent,
    children: children.map(child => ({ ...child, parent: enhanced })),
    mounted: true
  };

  // Call mount lifecycle if available
  // Note: onMount would be part of ComponentLifecycle, not ComponentContract

  return enhanced;
};

/**
 * Hook for managing component composition.
 * Provides reactive composition with cleanup.
 */
export const useComposition = (options: CompositionOptions) => {
  const { id, parent, children = [] } = options;

  // Create component instance
  const component = useMemo(() => ({
    id,
    state: 'idle' as const,
    mounted: false,
    parent,
    children: []
  }), [id, parent]);

  // Update composition when dependencies change
  const updateComposition = useCallback(() => {
    // Recreate traversal tree
    const tree = createTraversalTree(component, options);
    return tree;
  }, [component, options]);

  return {
    component,
    traversalTree: updateComposition(),
    composeState,
    composeHandlers,
    composeClasses,
    composeStyles
  };
};