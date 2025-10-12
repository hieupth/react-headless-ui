/**
 * Rating renderer component using headless useRating hook.
 * Provides styled rating with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useRating, type UseRatingProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface RatingProps extends UseRatingProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether to show rating value */
  showValue?: boolean;
  /** Rating label */
  label?: string;
  /** Custom star renderer */
  renderStar?: (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => React.ReactNode;
  /** Custom heart renderer */
  renderHeart?: (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => React.ReactNode;
  /** Custom thumbs renderer */
  renderThumbs?: (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => React.ReactNode;
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Whether rating items are spaced far apart */
  spaced?: boolean;
}

/**
 * Rating component with star, heart, and thumbs variants.
 * Supports half ratings, hover states, and custom rendering.
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(({
  className = '',
  style,
  showValue = false,
  label,
  renderStar,
  renderHeart,
  renderThumbs,
  color = 'primary',
  spaced = false,
  ...ratingProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    ratingAttributes,
    getItemAttributes,
    getHalfItemAttributes
  } = useRating(ratingProps);

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'rating-sm',
      md: 'rating-md',
      lg: 'rating-lg'
    };
    return sizes[state.size];
  };

  // Color classes
  const getColorClasses = () => {
    const colors = {
      primary: 'rating-primary',
      secondary: 'rating-secondary',
      success: 'rating-success',
      warning: 'rating-warning',
      error: 'rating-error'
    };
    return colors[color];
  };

  // Base rating classes
  const ratingClasses = `
    rating
    ${getSizeClasses()}
    ${getColorClasses()}
    ${spaced ? 'rating-spaced' : ''}
    ${state.disabled ? 'rating-disabled' : ''}
    ${state.readonly ? 'rating-readonly' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default star renderer
  const defaultRenderStar = (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => {
    const { filled, half, hover, focused, size } = props;

    return (
      <svg
        className={`
          rating-star
          ${filled ? 'rating-star-filled' : 'rating-star-empty'}
          ${half ? 'rating-star-half' : ''}
          ${hover ? 'rating-star-hover' : ''}
          ${focused ? 'rating-star-focused' : ''}
        `}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {half ? (
          <defs>
            <linearGradient id={`half-gradient-${size}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        ) : null}
        <path
          fill={half ? `url(#half-gradient-${size})` : filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  };

  // Default heart renderer
  const defaultRenderHeart = (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => {
    const { filled, half, hover, focused, size } = props;

    return (
      <svg
        className={`
          rating-heart
          ${filled ? 'rating-heart-filled' : 'rating-heart-empty'}
          ${half ? 'rating-heart-half' : ''}
          ${hover ? 'rating-heart-hover' : ''}
          ${focused ? 'rating-heart-focused' : ''}
        `}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {half ? (
          <defs>
            <linearGradient id={`heart-half-gradient-${size}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        ) : null}
        <path
          fill={half ? `url(#heart-half-gradient-${size})` : filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    );
  };

  // Default thumbs renderer
  const defaultRenderThumbs = (props: {
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
    size: string;
  }) => {
    const { filled, hover, focused } = props;

    return (
      <svg
        className={`
          rating-thumbs
          ${filled ? 'rating-thumbs-up' : 'rating-thumbs-down'}
          ${hover ? 'rating-thumbs-hover' : ''}
          ${focused ? 'rating-thumbs-focused' : ''}
        `}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 2}
          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
        />
      </svg>
    );
  };

  // Get appropriate renderer
  const getRenderer = () => {
    switch (state.variant) {
      case 'star':
        return renderStar || defaultRenderStar;
      case 'heart':
        return renderHeart || defaultRenderHeart;
      case 'thumbs':
        return renderThumbs || defaultRenderThumbs;
      default:
        return renderStar || defaultRenderStar;
    }
  };

  const renderer = getRenderer();

  return (
    <div
      ref={ref}
      className={ratingClasses}
      style={style}
      data-testid="rating"
    >
      {/* Label */}
      {label && (
        <div className="rating-label">
          <span className="rating-label-text">{label}</span>
          {showValue && (
            <span className="rating-value">
              {computed.displayValue}/{state.max}
            </span>
          )}
        </div>
      )}

      {/* Rating Items */}
      <div
        className="rating-items"
        {...ratingAttributes}
        data-testid="rating-items"
      >
        {computed.items.map((item) => {
          const attributes = getItemAttributes(item.value);

          return (
            <button
              key={item.value}
              className={`
                rating-item
                ${item.filled ? 'rating-item-filled' : 'rating-item-empty'}
                ${item.half ? 'rating-item-half' : ''}
                ${item.hover ? 'rating-item-hover' : ''}
                ${item.focused ? 'rating-item-focused' : ''}
                ${state.disabled ? 'rating-item-disabled' : ''}
                ${state.readonly ? 'rating-item-readonly' : ''}
              `}
              {...attributes}
              data-testid={`rating-item-${item.value}`}
            >
              <span className="rating-item-content">
                {renderer({
                  filled: item.filled,
                  half: item.half,
                  hover: item.hover,
                  focused: item.focused,
                  size: state.size
                })}
              </span>

              {/* Half rating support */}
              {state.allowHalf && (
                <div className="rating-half-container">
                  <button
                    className="rating-half-item rating-half-first"
                    {...getHalfItemAttributes(item.value, 'first')}
                    data-testid={`rating-half-${item.value}-first`}
                  >
                    <span className="rating-half-content">
                      {renderer({
                        filled: true,
                        half: true,
                        hover: computed.displayValue >= item.value - 0.5,
                        focused: false,
                        size: state.size
                      })}
                    </span>
                  </button>
                  <button
                    className="rating-half-item rating-half-second"
                    {...getHalfItemAttributes(item.value, 'second')}
                    data-testid={`rating-half-${item.value}-second`}
                  >
                    <span className="rating-half-content">
                      {renderer({
                        filled: true,
                        half: true,
                        hover: computed.displayValue >= item.value,
                        focused: false,
                        size: state.size
                      })}
                    </span>
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Value display */}
      {showValue && !label && (
        <div className="rating-value-display">
          <span className="rating-value-text">
            {computed.displayValue}/{state.max}
          </span>
        </div>
      )}

      {/* Keyboard instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        Current rating: {computed.displayValue} out of {state.max}
        {computed.isEmpty && ' - No rating'}
        {computed.isFull && ' - Maximum rating'}
      </div>
    </div>
  );
});

Rating.displayName = 'Rating';

export default Rating;