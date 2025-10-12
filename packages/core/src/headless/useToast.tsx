/**
 * Toast headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages toast notifications with auto-dismiss and stacking.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Toast variant options
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position options
 */
export type ToastPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

/**
 * Toast item interface
 */
export interface ToastItem {
  /** Unique identifier */
  id: string;
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Toast variant */
  variant?: ToastVariant;
  /** Auto-dismiss duration in milliseconds */
  duration?: number;
  /** Whether toast can be dismissed manually */
  dismissible?: boolean;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional data */
  data?: any;
  /** Creation timestamp */
  createdAt: number;
}

/**
 * Toast state interface
 */
export interface ToastState {
  /** Array of active toasts */
  toasts: ToastItem[];
  /** Whether toast system is paused */
  isPaused: boolean;
  /** Current position */
  position: ToastPosition;
  /** Maximum number of toasts to show */
  maxToasts: number;
}

/**
 * Toast actions interface
 */
export interface ToastActions {
  /** Add a new toast */
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Clear all toasts */
  clearAll: () => void;
  /** Pause auto-dismiss timers */
  pause: () => void;
  /** Resume auto-dismiss timers */
  resume: () => void;
  /** Dismiss a toast manually */
  dismiss: (id: string) => void;
  /** Update toast properties */
  updateToast: (id: string, updates: Partial<ToastItem>) => void;
}

/**
 * Props for useToast hook
 */
export interface UseToastProps {
  /** Default position for toasts */
  position?: ToastPosition;
  /** Maximum number of toasts to display */
  maxToasts?: number;
  /** Default auto-dismiss duration */
  defaultDuration?: number;
  /** Whether to pause on hover */
  pauseOnHover?: boolean;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Callback when toast is added */
  onToastAdd?: (toast: ToastItem) => void;
  /** Callback when toast is removed */
  onToastRemove?: (toast: ToastItem) => void;
}

/**
 * Return type for useToast hook
 */
export interface UseToastReturns {
  /** Current toast state */
  state: ToastState;
  /** Toast actions */
  actions: ToastActions;
  /** Convenience methods for different toast types */
  success: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'createdAt' | 'variant'>>) => string;
  error: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'createdAt' | 'variant'>>) => string;
  warning: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'createdAt' | 'variant'>>) => string;
  info: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'createdAt' | 'variant'>>) => string;
  /** Toast container attributes */
  containerAttributes: {
    'role': string;
    'aria-live': string;
    'aria-label': string;
  };
}

/**
 * Toast hook implementation
 * @param props - Toast configuration props
 * @returns Toast state, actions, and convenience methods
 */
export function useToast(props: UseToastProps = {}): UseToastReturns {
  const {
    position = 'top-right',
    maxToasts = 5,
    defaultDuration = 5000,
    pauseOnHover = true,
    showProgress = false,
    onToastAdd,
    onToastRemove
  } = props;

  // State management
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for managing timers
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate unique ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Clear timer for a specific toast
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  // Set auto-dismiss timer for a toast
  const setTimer = useCallback((toast: ToastItem) => {
    if (toast.duration === 0) return; // Don't auto-dismiss if duration is 0

    clearTimer(toast.id);
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);
    timersRef.current.set(toast.id, timer);
  }, [clearTimer]);

  // Add a new toast
  const addToast = useCallback((toastOptions: Omit<ToastItem, 'id' | 'createdAt'>) => {
    const toast: ToastItem = {
      ...toastOptions,
      id: generateId(),
      variant: toastOptions.variant || 'default',
      duration: toastOptions.duration ?? defaultDuration,
      dismissible: toastOptions.dismissible ?? true,
      createdAt: Date.now()
    };

    setToasts(prev => {
      const newToasts = [...prev, toast];
      // Remove oldest toasts if we exceed maxToasts
      if (newToasts.length > maxToasts) {
        const oldest = newToasts.shift();
        if (oldest) {
          clearTimer(oldest.id);
        }
      }
      return newToasts;
    });

    // Set auto-dismiss timer
    setTimer(toast);

    // Notify about addition
    onToastAdd?.(toast);

    return toast.id;
  }, [generateId, maxToasts, defaultDuration, setTimer, clearTimer, onToastAdd]);

  // Remove a toast
  const removeToast = useCallback((id: string) => {
    clearTimer(id);
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast) {
        onToastRemove?.(toast);
      }
      return prev.filter(t => t.id !== id);
    });
  }, [clearTimer, onToastRemove]);

  // Clear all toasts
  const clearAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    setToasts([]);
  }, []);

  // Pause auto-dismiss timers
  const pause = useCallback(() => {
    if (isPaused) return;

    setIsPaused(true);

    // Clear all active timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
  }, [isPaused]);

  // Resume auto-dismiss timers
  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsPaused(false);

    // Restart timers for all active toasts
    setToasts(currentToasts => {
      currentToasts.forEach(toast => {
        if (toast.duration > 0) {
          const elapsed = Date.now() - toast.createdAt;
          const remaining = toast.duration - elapsed;

          if (remaining > 0) {
            const timer = setTimeout(() => {
              removeToast(toast.id);
            }, remaining);
            timersRef.current.set(toast.id, timer);
          } else {
            // Already expired, remove immediately
            removeToast(toast.id);
          }
        }
      });
      return currentToasts;
    });
  }, [isPaused, removeToast]);

  // Dismiss a toast manually
  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  // Update toast properties
  const updateToast = useCallback((id: string, updates: Partial<ToastItem>) => {
    setToasts(prev => prev.map(toast => {
      if (toast.id === id) {
        const updated = { ...toast, ...updates };

        // If duration changed, reset the timer
        if (updates.duration !== undefined && updates.duration !== toast.duration) {
          clearTimer(id);
          setTimer(updated);
        }

        return updated;
      }
      return toast;
    }));
  }, [clearTimer, setTimer]);

  // Convenience methods
  const success = useCallback((message: string, options = {}) => {
    return addToast({ message, variant: 'success', ...options });
  }, [addToast]);

  const error = useCallback((message: string, options = {}) => {
    return addToast({ message, variant: 'error', ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options = {}) => {
    return addToast({ message, variant: 'warning', ...options });
  }, [addToast]);

  const info = useCallback((message: string, options = {}) => {
    return addToast({ message, variant: 'info', ...options });
  }, [addToast]);

  // Build state
  const state: ToastState = {
    toasts,
    isPaused,
    position,
    maxToasts
  };

  // Build actions
  const actions: ToastActions = {
    addToast,
    removeToast,
    clearAll,
    pause,
    resume,
    dismiss,
    updateToast
  };

  // Build container attributes
  const containerAttributes = {
    'role': 'status',
    'aria-live': 'polite',
    'aria-label': 'Notifications'
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    actions,
    success,
    error,
    warning,
    info,
    containerAttributes
  };
}