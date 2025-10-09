import { useState, useEffect, useRef, useCallback } from 'react';
import { useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps } from '../mixins';

export interface UseAspectRatioProps extends SemanticMixinProps {
  /** Aspect ratio (width/height). Default: 16/9 */
  ratio?: number;
  /** Whether component is disabled */
  disabled?: boolean;
}

export interface UseAspectRatioState {
  /** Current aspect ratio */
  ratio: number;
  /** Calculated dimensions { width, height } */
  dimensions: { width: number; height: number };
  /** Whether component has mounted on client */
  isClient: boolean;
  /** Current disabled state */
  disabled: boolean;
}

export interface UseAspectRatioActions {
  /** Manually recalculate dimensions */
  recalculate: () => void;
}

export interface UseAspectRatioReturns {
  /** Component state */
  state: UseAspectRatioState;
  /** Component actions */
  actions: UseAspectRatioActions;
  /** Container ref for aspect ratio element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Composed props to pass to DOM element */
  props: Record<string, any>;
}

/**
 * Headless hook for aspect ratio component functionality.
 * Maintains consistent aspect ratio for content across different viewport sizes.
 *
 * @param props - Component configuration props
 * @returns Aspect ratio state, actions, and props
 */
export const useAspectRatio = (props: UseAspectRatioProps): UseAspectRatioReturns => {
  const {
    ratio = 16 / 9,
    disabled = false,
    ...semanticProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  // Handle semantic behavior for accessibility
  const semantic = useSemanticMixin({
    role: 'img',
    ...semanticProps
  });

  /**
   * Calculate dimensions based on container width and aspect ratio
   */
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current || disabled) return;

    const containerWidth = containerRef.current.offsetWidth;
    const calculatedHeight = containerWidth / ratio;

    setDimensions({
      width: containerWidth,
      height: calculatedHeight
    });
  }, [ratio, disabled]);

  /**
   * Handle window resize events
   */
  const handleResize = useCallback(() => {
    calculateDimensions();
  }, [calculateDimensions]);

  // Set up resize observer and window resize listener
  useEffect(() => {
    setIsClient(true);

    if (!containerRef.current || disabled) return;

    // Initial calculation
    calculateDimensions();

    // Handle resize events
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateDimensions, handleResize, disabled]);

  // Compose state
  const state = composeState<UseAspectRatioState>({
    ratio,
    dimensions,
    isClient,
    disabled,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseAspectRatioActions>({
    recalculate: calculateDimensions,
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic semantic attributes
    ...semantic.props,

    // Custom aria attributes for aspect ratio
    'aria-label': semanticProps['aria-label'] || `Content with aspect ratio ${ratio}:1`,

    // Style for aspect ratio
    style: {
      position: 'relative' as const,
      width: '100%',
      paddingBottom: `${(1 / ratio) * 100}%`,
      ...semantic.props.style,
    },
  });

  return {
    state,
    actions,
    containerRef,
    props: composedProps,
  };
};