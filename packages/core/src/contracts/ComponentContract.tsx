/**
 * Base component contract following Flutter widget patterns.
 * Defines the fundamental interface that all components must implement.
 */

export interface ComponentContract {
  /** Unique identifier for the component instance */
  readonly id: string;
  /** Current state of the component */
  readonly state: ComponentState;
  /** Whether component is mounted and active */
  readonly mounted: boolean;
  /** Parent component in widget tree */
  readonly parent?: ComponentContract;
  /** Child components in traversal tree */
  readonly children: readonly ComponentContract[];
}

export type ComponentState = 'idle' | 'loading' | 'active' | 'disabled' | 'error';

export interface ComponentLifecycle {
  /** Called when component is first created */
  onMount?(): void | Promise<void>;
  /** Called when component is about to be destroyed */
  onUnmount?(): void | Promise<void>;
  /** Called when component state changes */
  onStateChange?(previousState: ComponentState, newState: ComponentState): void;
}

export interface TraversalNode {
  /** Component at this node */
  component: ComponentContract;
  /** Depth in traversal tree */
  depth: number;
  /** Path from root to this node */
  path: string[];
  /** Whether this node can be traversed further */
  traversable: boolean;
}