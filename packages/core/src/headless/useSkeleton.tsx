import { useMemo } from 'react';
import { useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps } from '../mixins';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface UseSkeletonProps extends SemanticMixinProps {
  /** Visual variant of skeleton */
  variant?: SkeletonVariant;
  /** Size of skeleton */
  size?: SkeletonSize;
  /** Whether skeleton is animating */
  animated?: boolean;
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
  /** Number of lines to show (for text variant) */
  lines?: number;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

export interface UseSkeletonState {
  /** Current variant */
  variant: SkeletonVariant;
  /** Current size */
  size: SkeletonSize;
  /** Whether skeleton is animating */
  animated: boolean;
  /** Whether skeleton has shimmer effect */
  shimmer: boolean;
  /** Number of lines */
  lines: number;
  /** Calculated dimensions */
  dimensions: { width: string | number; height: string | number };
}

export interface UseSkeletonActions {
  // No actions for skeleton component
}

export interface UseSkeletonReturns {
  /** Component state */
  state: UseSkeletonState;
  /** Component actions */
  actions: UseSkeletonActions;
  /** Composed props to pass to skeleton element */
  props: Record<string, any>;
}

/**
 * Headless hook for skeleton component functionality.
 * Provides loading placeholder with various shapes and animations.
 *
 * @param props - Component configuration props
 * @returns Skeleton state, actions, and props
 */
export const useSkeleton = (props: UseSkeletonProps): UseSkeletonReturns => {
  const {
    variant = 'text',
    size = 'md',
    animated = true,
    width,
    height,
    lines = 1,
    shimmer = true,
    ...semanticProps
  } = props;

  // Calculate dimensions based on variant and size
  const dimensions = useMemo(() => {
    const defaultDimensions = {
      text: {
        sm: { width: '60%', height: '0.75rem' },
        md: { width: '80%', height: '1rem' },
        lg: { width: '100%', height: '1.25rem' },
        xl: { width: '100%', height: '1.5rem' },
      },
      circular: {
        sm: { width: '2rem', height: '2rem' },
        md: { width: '3rem', height: '3rem' },
        lg: { width: '4rem', height: '4rem' },
        xl: { width: '5rem', height: '5rem' },
      },
      rectangular: {
        sm: { width: '4rem', height: '2rem' },
        md: { width: '6rem', height: '3rem' },
        lg: { width: '8rem', height: '4rem' },
        xl: { width: '10rem', height: '5rem' },
      },
      rounded: {
        sm: { width: '4rem', height: '2rem' },
        md: { width: '6rem', height: '3rem' },
        lg: { width: '8rem', height: '4rem' },
        xl: { width: '10rem', height: '5rem' },
      },
    };

    const defaultDim = defaultDimensions[variant]?.[size] || defaultDimensions.text.md;

    return {
      width: width || defaultDim.width,
      height: height || defaultDim.height,
    };
  }, [variant, size, width, height]);

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    role: 'presentation',
    'aria-hidden': true,
    'aria-label': 'Loading content',
    ...semanticProps,
  });

  // Compose state
  const state = composeState<UseSkeletonState>({
    variant,
    size,
    animated,
    shimmer,
    lines,
    dimensions,
    ...semantic.state,
  });

  // Compose actions (none for skeleton)
  const actions = composeHandlers<UseSkeletonActions>({
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic attributes
    'data-variant': variant,
    'data-size': size,
    'data-animated': animated,
    'data-shimmer': shimmer,
    'data-lines': lines,

    // Semantic props
    ...semantic.props,
  });

  return {
    state,
    actions,
    props: composedProps,
  };
};