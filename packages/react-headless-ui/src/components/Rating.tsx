"use client";
/**
 * Rating renderer component using headless useRating hook.
 * Provides styled rating with comprehensive accessibility support.
 */

import React, { forwardRef, useId } from 'react';
import { useRating, type UseRatingProps } from '../hooks/index.js';
import { useTheme } from '../providers/ThemeProvider.js';

// Intrinsic svg size (px) for the default icon renderers per rating size.
// The lib ships no CSS, so default icons need explicit width/height or they
// collapse to 0x0; lg matches the icons' 24x24 viewBox.
const defaultIconSizes: Record<string, number> = { sm: 16, md: 20, lg: 24 };

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
  // Per-instance id so same-size Ratings on one page don't emit colliding
  // SVG gradient ids (url(#) resolves to the first match in the document).
  const gradientId = useId();
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
        className={`rating-star
          ${filled ? 'rating-star-filled' : 'rating-star-empty'}
          ${half ? 'rating-star-half' : ''}
          ${hover ? 'rating-star-hover' : ''}
          ${focused ? 'rating-star-focused' : ''}
        `}
        width={defaultIconSizes[size] ?? 24}
        height={defaultIconSizes[size] ?? 24}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fill={half ? `url(#half-gradient-${gradientId})` : filled ? 'currentColor' : 'none'}
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
        className={`rating-heart
          ${filled ? 'rating-heart-filled' : 'rating-heart-empty'}
          ${half ? 'rating-heart-half' : ''}
          ${hover ? 'rating-heart-hover' : ''}
          ${focused ? 'rating-heart-focused' : ''}
        `}
        width={defaultIconSizes[size] ?? 24}
        height={defaultIconSizes[size] ?? 24}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fill={half ? `url(#heart-half-gradient-${gradientId})` : filled ? 'currentColor' : 'none'}
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
    const { filled, hover, focused, size } = props;

    return (
      <svg
        className={`rating-thumbs
          ${filled ? 'rating-thumbs-up' : 'rating-thumbs-down'}
          ${hover ? 'rating-thumbs-hover' : ''}
          ${focused ? 'rating-thumbs-focused' : ''}
        `}
        width={defaultIconSizes[size] ?? 24}
        height={defaultIconSizes[size] ?? 24}
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

  // reason: the hook clamps with Math.min/Math.max, which lets NaN through
  // (e.g. a value derived from parseFloat('')). Announcing "NaN" in the live
  // region or value displays is never useful, so render it as "no rating".
  const displayValue = Number.isNaN(computed.displayValue) ? 0 : computed.displayValue;

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
              {displayValue}/{state.max}
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
          const itemClassName = `
            rating-item
            ${item.filled ? 'rating-item-filled' : 'rating-item-empty'}
            ${item.half ? 'rating-item-half' : ''}
            ${item.hover ? 'rating-item-hover' : ''}
            ${item.focused ? 'rating-item-focused' : ''}
            ${state.disabled ? 'rating-item-disabled' : ''}
            ${state.readonly ? 'rating-item-readonly' : ''}
          `;

          // When allowHalf is enabled, the half-rating buttons must be siblings
          // of the item button (nesting a <button> inside another <button> is
          // invalid HTML and causes clicks on the half button to bubble up and
          // overwrite the half selection with the whole-number value).
          if (state.allowHalf) {
            return (
              <div
                key={item.value}
                className="rating-item-wrapper"
                data-testid={`rating-item-${item.value}`}
              >
                <button
                  className={itemClassName}
                  {...attributes}
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
                </button>

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
              </div>
            );
          }

          return (
            <button
              key={item.value}
              className={itemClassName}
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
            </button>
          );
        })}
      </div>

      {/* Value display */}
      {showValue && !label && (
        <div className="rating-value-display">
          <span className="rating-value-text">
            {displayValue}/{state.max}
          </span>
        </div>
      )}

      {/* Half-fill gradients, defined once per instance: default renderers
          reference them via fill url(#...), and defining them per rendered
          item would emit duplicate ids for every half star (url(#) resolves
          document-wide, so only the first def would ever be used). */}
      <svg
        className="rating-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute' }}
      >
        <defs>
          <linearGradient id={`half-gradient-${gradientId}`}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`heart-half-gradient-${gradientId}`}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Keyboard instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        Current rating: {displayValue} out of {state.max}
        {computed.isEmpty && ' - No rating'}
        {computed.isFull && ' - Maximum rating'}
      </div>
    </div>
  );
});

Rating.displayName = 'Rating';

export default Rating;