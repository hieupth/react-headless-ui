/**
 * Core utilities for React UI Forge components.
 * Provides composition helpers and utility functions.
 */

export type {
  CompositionOptions,
  MergeStrategy
} from './Composition';

export {
  composeState,
  composeHandlers,
  composeClasses,
  composeStyles,
  createTraversalTree,
  composeLifecycle,
  useComposition
} from './Composition';