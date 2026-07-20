/**
 * Composition utilities following Flutter widget composition patterns.
 * Provides utilities for combining behaviors and managing component state.
 */

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
 * Composes handlers. Two call styles:
 *  - A single handler-map object (e.g. `{ onClick, onKeyDown }`): returned as-is
 *    so callers can build a prop bag of handlers.
 *  - Multiple function arguments: merged into one function that invokes each.
 */
export const composeHandlers = <T = any>(
  ...handlers: (T | undefined)[]
): T => {
  // Single handler-map object: pass through unchanged.
  if (handlers.length === 1 && typeof handlers[0] === 'object' && handlers[0] !== null) {
    return handlers[0] as T;
  }

  return ((...args: any[]) => {
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
  return styles.reduce<React.CSSProperties>((merged, style) => {
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
