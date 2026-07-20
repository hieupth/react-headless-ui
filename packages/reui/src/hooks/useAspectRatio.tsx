import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Composed props to pass to DOM element */
  props: Record<string, any>;
}

/**
 * Headless hook for aspect ratio component functionality.
 * Maintains consistent aspect ratio for content across different viewport sizes.
 */
export const useAspectRatio = (props: UseAspectRatioProps): UseAspectRatioReturns => {
  const {
    ratio = 16 / 9,
    disabled = false,
    label,
    ...restSemantic
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  // Semantic mixin returns the composed ARIA attributes (flat record).
  const semanticAttrs = useSemanticMixin({
    role: 'img',
    label: label ?? `Content with aspect ratio ${ratio}:1`,
    ...restSemantic,
  });

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current || disabled) return;

    const containerWidth = containerRef.current.offsetWidth;
    setDimensions({
      width: containerWidth,
      height: containerWidth / ratio,
    });
  }, [ratio, disabled]);

  useEffect(() => {
    setIsClient(true);

    if (!containerRef.current || disabled) return;

    calculateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', calculateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [calculateDimensions, disabled]);

  const state = useMemo(() => composeState<UseAspectRatioState>({
    ratio,
    dimensions,
    isClient,
    disabled,
  }), [ratio, dimensions, isClient, disabled]);

  const actions = useMemo(() => composeHandlers<UseAspectRatioActions>({
    recalculate: calculateDimensions,
  }), [calculateDimensions]);

  const composedProps = useMemo(() => composeHandlers({
    ...semanticAttrs,
    // reason: useSemanticMixin is called with label ?? default above, so
    // semanticAttrs['aria-label'] is always defined — the ?? fallback was dead.
    'aria-label': semanticAttrs['aria-label'],
    style: {
      position: 'relative' as const,
      width: '100%',
      paddingBottom: `${(1 / ratio) * 100}%`,
    },
  }), [semanticAttrs, ratio]);

  return useMemo(() => ({
    state,
    actions,
    containerRef,
    props: composedProps,
  }), [state, actions, containerRef, composedProps]);
};
