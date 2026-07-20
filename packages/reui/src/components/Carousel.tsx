/**
 * Carousel component using useCarousel hook.
 * Provides sliding content navigation with auto-play and controls.
 */

import React from 'react';
import { useCarousel, type UseCarouselProps } from '../hooks';

export interface CarouselProps extends UseCarouselProps {
  /** Carousel items */
  children: React.ReactNode[];
  /** Additional CSS classes */
  className?: string;
  /** Custom previous arrow component */
  PreviousArrow?: React.FC<{ onClick: () => void; disabled: boolean }>;
  /** Custom next arrow component */
  NextArrow?: React.FC<{ onClick: () => void; disabled: boolean }>;
  /** Custom dot indicator component */
  DotIndicator?: React.FC<{ index: number; isActive: boolean; onClick: () => void }>;
  /** Show/hide navigation arrows */
  showArrows?: boolean;
  /** Show/hide dot indicators */
  showDots?: boolean;
  /** Pause on hover */
  pauseOnHover?: boolean;
}

/**
 * Carousel component with sliding content navigation.
 * Supports auto-play, infinite loop, and keyboard navigation.
 */
export const Carousel: React.FC<CarouselProps> = ({
  children,
  className = '',
  PreviousArrow,
  NextArrow,
  DotIndicator,
  showArrows = true,
  showDots = true,
  pauseOnHover = false,
  // Destructure the scalar UseCarouselProps fields into typed locals so the
  // hook call and runtime reads below use concrete types. CarouselProps extends
  // UseCarouselProps, which in turn extends the Semantic/Focusable mixins; both
  // mixins declare `[key: string]: unknown`, so reading these off the rest
  // `props` bag would resolve to `unknown`. The remaining semantic/focusable
  // pass-through keys stay in `semanticProps` and are forwarded to the hook.
  itemsPerView,
  spacing,
  loop,
  autoPlay,
  animationDuration,
  animationEasing,
  onSlideChange,
  onEnd,
  onStart,
  ...semanticProps
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const {
    state,
    actions,
    semanticAttributes,
    trackProps,
    getSlideProps,
    getDotProps,
    arrowProps
  } = useCarousel({
    ...semanticProps,
    itemsPerView,
    spacing,
    loop,
    autoPlay,
    animationDuration,
    animationEasing,
    onSlideChange,
    onEnd,
    onStart,
    totalItems: children.length,
    showArrows,
    showDots
  });

  // Pause on hover
  React.useEffect(() => {
    if (pauseOnHover && state.isPlaying) {
      if (isHovered) {
        actions.pause();
      } else {
        actions.play();
      }
    }
  }, [isHovered, pauseOnHover, state.isPlaying, actions]);

  // NOTE: the `Theme` contract (src/providers/ThemeProvider.tsx) does not yet
  // expose an `extensions` field, so `theme.extensions.*` lookups previously
  // here always resolved to `undefined` and contributed no class. They have
  // been removed until the shared contract adds an optional `extensions` bag;
  // see the report for the needed shared change.
  // Combine custom classes with theme classes
  const wrapperClassName = [
    'carousel-wrapper',
    className
  ].filter(Boolean).join(' ');

  const trackClassName = [
    'carousel-track',
    state.isAnimating ? 'carousel-track-animating' : ''
  ].filter(Boolean).join(' ');

  const arrowsClassName = [
    'carousel-arrows'
  ].filter(Boolean).join(' ');

  const dotsClassName = [
    'carousel-dots'
  ].filter(Boolean).join(' ');

  // Default arrow components
  const DefaultPreviousArrow = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
      {...arrowProps.previous}
      onClick={onClick}
      disabled={disabled}
      className="carousel-arrow carousel-arrow-previous"
      type="button"
    >
      <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const DefaultNextArrow = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
      {...arrowProps.next}
      onClick={onClick}
      disabled={disabled}
      className="carousel-arrow carousel-arrow-next"
      type="button"
    >
      <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  // Default dot indicator
  const DefaultDotIndicator = ({ index, isActive, onClick }: { index: number; isActive: boolean; onClick: () => void }) => (
    <button
      {...getDotProps(index)}
      onClick={onClick}
      className={`carousel-dot ${isActive ? 'carousel-dot-active' : ''}`}
      type="button"
    />
  );

  const Previous = PreviousArrow || DefaultPreviousArrow;
  const Next = NextArrow || DefaultNextArrow;
  const Dot = DotIndicator || DefaultDotIndicator;

  return (
    <div
      {...semanticAttributes}
      className={wrapperClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main carousel track */}
      <div className="carousel-viewport" role="presentation">
        <div {...trackProps} className={trackClassName}>
          {children.map((child, index) => (
            <div key={index} {...getSlideProps(index)} className="carousel-slide">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <div className={arrowsClassName}>
          <Previous
            onClick={actions.previous}
            disabled={!loop && state.isAtStart}
          />
          <Next
            onClick={actions.next}
            disabled={!loop && state.isAtEnd}
          />
        </div>
      )}

      {/* Dot indicators */}
      {showDots && (
        <div className={dotsClassName} role="tablist" aria-label="Carousel navigation">
          {Array.from({ length: state.totalSlides }, (_, index) => (
            <Dot
              key={index}
              index={index}
              isActive={index === state.currentSlide}
              onClick={() => actions.goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Auto-play status indicator */}
      {autoPlay && (
        <div className="carousel-status" aria-live="polite">
          {state.isPlaying ? 'Playing' : 'Paused'} • Slide {state.currentSlide + 1} of {state.totalSlides}
        </div>
      )}
    </div>
  );
};

// Carousel variants for specific use cases
interface ImageCarouselProps extends Omit<CarouselProps, 'children'> {
  images: React.ReactNode[];
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, ...props }) => (
  <Carousel {...props}>
    {images.map((image, index) => (
      <div key={index} className="carousel-slide-image">
        {image}
      </div>
    ))}
  </Carousel>
);

export const CardCarousel: React.FC<Omit<CarouselProps, 'children' | 'itemsPerView'> & {
  cards: React.ReactNode[];
  itemsPerView?: number;
}> = ({ cards, itemsPerView = 3, ...props }) => (
  <Carousel {...props} itemsPerView={itemsPerView}>
    {cards.map((card, index) => (
      <div key={index} className="carousel-slide-card">
        {card}
      </div>
    ))}
  </Carousel>
);

export const TestimonialCarousel: React.FC<Omit<CarouselProps, 'children' | 'autoPlay'> & {
  children: React.ReactNode[];
  autoPlay?: number;
}> = ({
  children,
  autoPlay = 5000,
  ...props
}) => (
  <Carousel {...props} autoPlay={autoPlay} showDots={true} showArrows={true}>
    {...children}
  </Carousel>
);

export const HeroCarousel: React.FC<Omit<CarouselProps, 'children' | 'itemsPerView' | 'showArrows'> & {
  children: React.ReactNode[];
  itemsPerView?: number;
  showArrows?: boolean;
}> = ({
  children,
  itemsPerView = 1,
  showArrows = true,
  ...props
}) => (
  <Carousel
    {...props}
    itemsPerView={itemsPerView}
    showArrows={showArrows}
    showDots={true}
    autoPlay={5000}
    pauseOnHover={true}
  >
    {children.map((child, index) => (
      <div key={index} className="carousel-slide-hero">
        {child}
      </div>
    ))}
  </Carousel>
);

Carousel.displayName = 'Carousel';
ImageCarousel.displayName = 'ImageCarousel';
CardCarousel.displayName = 'CardCarousel';
TestimonialCarousel.displayName = 'TestimonialCarousel';
HeroCarousel.displayName = 'HeroCarousel';