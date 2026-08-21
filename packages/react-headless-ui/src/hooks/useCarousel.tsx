"use client";
/**
 * Carousel headless hook following Flutter carousel patterns.
 * Provides sliding content navigation with proper accessibility.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/index.js';
import { composeState } from '../utils/index.js';
import type { SemanticMixinProps, FocusableMixinProps } from '../mixins/index.js';

/**
 * Screen-reader label surface of the carousel. All fields are functions or
 * strings so consumers can fully localize the announcements; numbered fields
 * receive 1-based positions. Consumers pass a Partial via
 * `carouselAriaLabels` — every omitted field falls back to the English
 * default in DEFAULT_CAROUSEL_ARIA_LABELS.
 */
export interface CarouselAriaLabels {
  /** Region announcement for the whole carousel. */
  region: (totalItems: number, currentItem: number) => string;
  /** Label of one slide (1-based slide number). */
  slide: (slideNumber: number, totalItems: number) => string;
  /** Label of one dot button (1-based slide number). */
  goToSlide: (slideNumber: number) => string;
  /** Label of the previous-slide arrow button. */
  previousSlide: string;
  /** Label of the next-slide arrow button. */
  nextSlide: string;
  /** Label of the dot-navigation group. */
  navigation: string;
  /** Auto-play status announcement (1-based slide number). */
  status: (isPlaying: boolean, slideNumber: number, totalSlides: number) => string;
}

/**
 * Built-in English screen-reader labels. Exported so the Carousel component
 * (and consumers) can compose overrides over the defaults.
 */
export const DEFAULT_CAROUSEL_ARIA_LABELS: CarouselAriaLabels = {
  region: (totalItems, currentItem) => `${totalItems} items. Current item ${currentItem} of ${totalItems}.`,
  slide: (slideNumber, totalItems) => `Slide ${slideNumber} of ${totalItems}`,
  goToSlide: (slideNumber) => `Go to slide ${slideNumber}`,
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',
  navigation: 'Carousel navigation',
  status: (isPlaying, slideNumber, totalSlides) => `${isPlaying ? 'Playing' : 'Paused'} • Slide ${slideNumber} of ${totalSlides}`,
};

export interface UseCarouselProps extends
  SemanticMixinProps,
  FocusableMixinProps {
  /** Overrides for the carousel's screen-reader labels (English defaults). */
  carouselAriaLabels?: Partial<CarouselAriaLabels>;
  /** Number of items to show per view */
  itemsPerView?: number;
  /** Spacing between items */
  spacing?: number;
  /** Whether to loop infinitely */
  loop?: boolean;
  /** Auto-play interval in milliseconds */
  autoPlay?: number;
  /** Whether to show navigation dots */
  showDots?: boolean;
  /** Whether to show navigation arrows */
  showArrows?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Animation easing function */
  animationEasing?: string;
  /** Called when current slide changes */
  onSlideChange?: (index: number) => void;
  /** Called when carousel reaches end */
  onEnd?: () => void;
  /** Called when carousel reaches start */
  onStart?: () => void;
}

export interface UseCarouselState {
  /** Current slide index */
  currentSlide: number;
  /** Total number of slides */
  totalSlides: number;
  /** Whether carousel is at start */
  isAtStart: boolean;
  /** Whether carousel is at end */
  isAtEnd: boolean;
  /** Whether carousel is animating */
  isAnimating: boolean;
  /** Whether carousel is playing (auto-play) */
  isPlaying: boolean;
}

export interface UseCarouselActions {
  /** Go to specific slide */
  goToSlide: (index: number) => void;
  /** Go to next slide */
  next: () => void;
  /** Go to previous slide */
  previous: () => void;
  /** Start auto-play */
  play: () => void;
  /** Stop auto-play */
  pause: () => void;
  /** Toggle auto-play */
  togglePlay: () => void;
  /** Check if slide is visible */
  isSlideVisible: (index: number) => boolean;
}

export interface UseCarouselReturns {
  /** Component state */
  state: UseCarouselState;
  /** Component actions */
  actions: UseCarouselActions;
  /** Semantic attributes for carousel */
  semanticAttributes: Record<string, unknown>;
  /** Track props for sliding container */
  trackProps: Record<string, unknown>;
  /** Slide props for individual slides */
  getSlideProps: (index: number) => Record<string, unknown>;
  /** Dot navigation props */
  getDotProps: (index: number) => Record<string, unknown>;
  /** Arrow navigation props */
  arrowProps: {
    previous: Record<string, unknown>;
    next: Record<string, unknown>;
  };
  /** Ref for track container */
  trackRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Headless carousel hook providing sliding content navigation.
 * Supports auto-play, infinite loop, and keyboard navigation.
 */
export const useCarousel = (props: UseCarouselProps & { totalItems: number }) => {
  const {
    totalItems,
    itemsPerView = 1,
    spacing = 0,
    loop = false,
    autoPlay = 0,
    showDots = true,
    showArrows = true,
    animationDuration = 300,
    animationEasing = 'ease-in-out',
    onSlideChange,
    onEnd,
    onStart,
    carouselAriaLabels,
    ...semanticProps
  } = props;

  // Internal state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay > 0);

  // Refs
  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Holds the latest `next` so the auto-play interval always advances from the
  // current slide. The interval effect (below) intentionally does NOT list
  // `next`/`currentSlide` as deps — re-subscribing on every slide change would
  // reset the timer cadence. Instead it reads through this ref, which is
  // refreshed every render, so each tick invokes the freshest navigation logic
  // instead of the stale closure captured when the effect first ran.
  const nextRef = useRef<() => void>(() => {});

  // Calculate total slides based on items per view
  const totalSlides = Math.max(1, Math.ceil(totalItems / itemsPerView));

  // Merged screen-reader labels: consumer overrides on top of the English
  // defaults. Memoized so the prop-bag generators below keep referential
  // stability when no override (or a stable override) is passed.
  const ariaLabels = useMemo(() => ({
    ...DEFAULT_CAROUSEL_ARIA_LABELS,
    ...carouselAriaLabels
  }), [carouselAriaLabels]);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role: 'region',
    ...semanticProps
  });

  // Check if at start/end
  const isAtStart = currentSlide === 0;
  const isAtEnd = currentSlide >= totalSlides - 1;

  // Auto-play functionality. Reads through nextRef so each tick advances from
  // the current slide rather than the stale `next` captured at first run.
  useEffect(() => {
    if (isPlaying && autoPlay > 0) {
      autoPlayIntervalRef.current = setInterval(() => {
        nextRef.current();
      }, autoPlay);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isPlaying, autoPlay]);

  // Go to specific slide
  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;

    let targetIndex = index;

    // Handle looping
    if (loop) {
      if (index < 0) {
        targetIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        targetIndex = 0;
      }
    } else {
      // Clamp to valid range
      targetIndex = Math.max(0, Math.min(index, totalSlides - 1));
    }

    if (targetIndex !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(targetIndex);
      onSlideChange?.(targetIndex);

      // Check start/end triggers
      if (targetIndex === 0) {
        onStart?.();
      } else if (targetIndex >= totalSlides - 1) {
        onEnd?.();
      }

      // Reset animation state
      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
    }
  }, [currentSlide, isAnimating, loop, totalSlides, onSlideChange, onEnd, onStart, animationDuration]);

  // Navigation functions
  const next = useCallback(() => {
    if (loop && currentSlide >= totalSlides - 1) {
      goToSlide(0);
    } else {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, loop, goToSlide]);

  // Keep the auto-play ref pointing at the freshest navigation logic so the
  // interval (subscribed once per isPlaying/autoPlay change) always advances.
  nextRef.current = next;

  const previous = useCallback(() => {
    if (loop && currentSlide <= 0) {
      goToSlide(totalSlides - 1);
    } else {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, totalSlides, loop, goToSlide]);

  // Auto-play controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Check if slide is visible
  const isSlideVisible = useCallback((index: number) => {
    const startSlide = currentSlide * itemsPerView;
    const endSlide = Math.min(startSlide + itemsPerView - 1, totalItems - 1);
    return index >= startSlide && index <= endSlide;
  }, [currentSlide, itemsPerView, totalItems]);

  // Track props
  const trackProps = useMemo(() => ({
    ref: trackRef,
    role: 'presentation',
    style: {
      display: 'flex',
      transition: isAnimating ? `transform ${animationDuration}ms ${animationEasing}` : 'none',
      transform: `translateX(-${currentSlide * 100}%)`,
      gap: `${spacing}px`,
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    }
  }), [currentSlide, isAnimating, animationDuration, animationEasing, spacing, previous, next]);

  // Slide props generator
  const getSlideProps = useCallback((index: number) => {
    const isVisible = isSlideVisible(index);
    const slideIndex = Math.floor(index / itemsPerView);
    const isActive = slideIndex === currentSlide;

    return {
      role: 'group',
      'aria-roledescription': 'slide',
      'aria-label': ariaLabels.slide(index + 1, totalItems),
      'aria-hidden': !isVisible,
      'data-active': isActive,
      'data-visible': isVisible,
      style: {
        flex: `0 0 ${100 / itemsPerView}%`,
        minWidth: 0,
      },
    };
  }, [currentSlide, itemsPerView, totalItems, isSlideVisible, ariaLabels]);

  // Dot navigation props generator
  const getDotProps = useCallback((index: number) => {
    const isActive = index === currentSlide;

    return {
      role: 'button',
      'aria-label': ariaLabels.goToSlide(index + 1),
      'aria-selected': isActive,
      'data-active': isActive,
      onClick: () => goToSlide(index),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goToSlide(index);
        }
      },
    };
  }, [currentSlide, goToSlide, ariaLabels]);

  // Arrow navigation props
  const arrowProps = useMemo(() => ({
    previous: {
      'aria-label': ariaLabels.previousSlide,
      onClick: previous,
      disabled: !loop && isAtStart,
      'data-disabled': !loop && isAtStart,
    },
    next: {
      'aria-label': ariaLabels.nextSlide,
      onClick: next,
      disabled: !loop && isAtEnd,
      'data-disabled': !loop && isAtEnd,
    },
  }), [previous, next, loop, isAtStart, isAtEnd, ariaLabels]);

  // Composed state
  const state = useMemo(() => composeState<UseCarouselState>({
    currentSlide,
    totalSlides,
    isAtStart,
    isAtEnd,
    isAnimating,
    isPlaying
  }), [currentSlide, totalSlides, isAtStart, isAtEnd, isAnimating, isPlaying]);

  // Composed actions
  const actions = useMemo(() => ({
    goToSlide,
    next,
    previous,
    play,
    pause,
    togglePlay,
    isSlideVisible
  }), [goToSlide, next, previous, play, pause, togglePlay, isSlideVisible]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    role: 'region',
    'aria-roledescription': 'carousel',
    'aria-label': ariaLabels.region(totalItems, Math.min(currentSlide * itemsPerView + 1, totalItems)),
  }), [semantic, totalItems, currentSlide, itemsPerView, ariaLabels]);

  return useMemo(() => ({
    state,
    actions,
    semanticAttributes,
    trackProps,
    getSlideProps,
    getDotProps,
    arrowProps,
    trackRef
  }), [state, actions, semanticAttributes, trackProps, getSlideProps, getDotProps, arrowProps, trackRef]);
};