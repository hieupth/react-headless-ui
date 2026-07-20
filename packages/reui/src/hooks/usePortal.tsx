/**
 * Portal headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages portal mounting with container management.
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Portal state interface
 */
export interface PortalState {
  /** Whether portal is open */
  open: boolean;
  /** Whether portal is mounting */
  mounting: boolean;
  /** Whether portal is unmounting */
  unmounting: boolean;
  /** Current portal container */
  container: HTMLElement | null;
  /** Portal mount point */
  mountPoint: HTMLElement | null;
  /** Portal z-index */
  zIndex: number;
  /** Whether portal is disabled */
  disabled: boolean;
  /** Portal type */
  type: 'default' | 'modal' | 'drawer' | 'tooltip' | 'dropdown';
}

/**
 * Portal actions interface
 */
export interface PortalActions {
  /** Open portal */
  open: () => void;
  /** Close portal */
  close: () => void;
  /** Toggle portal */
  toggle: () => void;
  /** Set container */
  setContainer: (container: HTMLElement | null) => void;
  /** Set z-index */
  setZIndex: (zIndex: number) => void;
  /** Mount portal to specific element */
  mountTo: (element: HTMLElement) => void;
  /** Unmount portal */
  unmount: () => void;
  /** Focus portal content */
  focus: () => void;
  /** Get portal element */
  getElement: () => HTMLElement | null;
}

/**
 * Portal mount strategy
 */
export type PortalMountStrategy = 'append' | 'prepend' | 'replace' | 'before' | 'after';

/**
 * Props for usePortal hook
 */
export interface UsePortalProps {
  /** Whether portal is initially open */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Portal container selector or element */
  container?: string | HTMLElement | null;
  /** Portal mount point selector or element */
  mountPoint?: string | HTMLElement | null;
  /** Mount strategy */
  mountStrategy?: PortalMountStrategy;
  /** Portal z-index */
  zIndex?: number;
  /** Whether portal is disabled */
  disabled?: boolean;
  /** Portal type */
  type?: 'default' | 'modal' | 'drawer' | 'tooltip' | 'dropdown';
  /** Animation duration in ms */
  animationDuration?: number;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Mount handler */
  onMount?: (container: HTMLElement) => void;
  /** Unmount handler */
  onUnmount?: () => void;
  /** Portal ref */
  portalRef?: React.RefObject<HTMLElement | null>;
  /** Create default container */
  createDefaultContainer?: () => HTMLElement;
  /** Cleanup container on unmount */
  cleanupContainer?: boolean;
}

/**
 * Return type for usePortal hook
 */
export interface UsePortalReturns {
  /** Current portal state */
  state: PortalState;
  /** Portal actions */
  actions: PortalActions;
  /** Accessibility attributes */
  attributes: {
    'role': string;
    'aria-modal'?: boolean;
    'aria-hidden': boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Create default portal container
 */
const createDefaultPortalContainer = (): HTMLElement => {
  const container = document.createElement('div');
  container.id = 'reui-portal-root';
  container.setAttribute('data-reui-portal', 'true');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '0';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.zIndex = '999999';
  return container;
};

/**
 * Portal hook implementation
 * @param props - Portal configuration props
 * @returns Portal state, actions, and attributes
 */
export function usePortal(props: UsePortalProps): UsePortalReturns {
  const {
    defaultOpen = false,
    open: controlledOpen,
    container: initialContainer = null,
    mountPoint: initialMountPoint = null,
    mountStrategy = 'append',
    zIndex = 1000,
    disabled = false,
    type = 'default',
    animationDuration = 200,
    onOpen,
    onClose,
    onMount,
    onUnmount,
    portalRef,
    createDefaultContainer = createDefaultPortalContainer,
    cleanupContainer = true
  } = props;

  // Resolve a container/mountPoint prop (element or CSS selector) into an element
  const resolveElement = (value: string | HTMLElement | null | undefined): HTMLElement | null => {
    if (!value) return null;
    if (typeof value === 'string') {
      return document.querySelector(value) as HTMLElement | null;
    }
    return value;
  };

  // State management
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const [mounting, setMounting] = useState<boolean>(false);
  const [unmounting, setUnmounting] = useState<boolean>(false);
  const [container, setContainer] = useState<HTMLElement | null>(() => resolveElement(initialContainer));
  const [mountPointElement, setMountPointElement] = useState<HTMLElement | null>(() => resolveElement(initialMountPoint));

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const portalElementRef = portalRef || internalRef;
  const defaultContainerRef = useRef<HTMLElement | null>(null);
  // Latest mount/unmount in refs so the open/close effect deps stay stable
  // (otherwise mounting/unmounting flips their identity and re-triggers the
  // effect mid-flight, defeating cleanupContainer/unmount).
  /* c8 ignore start -- reason: the ref initializer defaults below are always overwritten during render (further below) before any effect/callback can invoke them, so they are unreachable in practice */
  const mountPortalRef = useRef<(explicitContainer?: HTMLElement | null, explicitMountPoint?: HTMLElement | null) => Promise<void>>(() => Promise.resolve());
  const unmountPortalRef = useRef<() => Promise<void>>(() => Promise.resolve());
  /* c8 ignore stop */
  // Tracks an explicit container/mountPoint requested by setContainer/mountTo
  // while a remount is pending, so unmount's state wipe doesn't lose it.
  const pendingContainerRef = useRef<HTMLElement | null | undefined>(undefined);
  const pendingMountPointRef = useRef<HTMLElement | null | undefined>(undefined);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const currentOpen = isControlled ? controlledOpen : internalOpen;

  /**
   * Create default container if needed
   */
  const ensureContainer = useCallback(() => {
    if (!container && !defaultContainerRef.current) {
      const newContainer = createDefaultContainer();
      // Guard: createDefaultContainer() may return null/non-Element; fall back
      // so the caller's console.warn path runs instead of appendChild throwing.
      if (newContainer instanceof HTMLElement) {
        defaultContainerRef.current = newContainer;
        document.body.appendChild(newContainer);
        setContainer(newContainer);
        return newContainer;
      }
      return container || defaultContainerRef.current;
    }
    return container || defaultContainerRef.current;
  }, [container, createDefaultContainer]);

  /**
   * Find mount point element by selector or use provided element
   */
  const findMountPoint = useCallback((mountPointSelectorOrElement?: string | HTMLElement | null): HTMLElement | null => {
    if (!mountPointSelectorOrElement) {
      return ensureContainer();
    }

    // mountPointSelectorOrElement originates from resolveElement() (which
    // already converts string selectors to elements at init) or from
    // setMountPointElement(element), so it is always an HTMLElement here.
    return mountPointSelectorOrElement as HTMLElement;
  }, [ensureContainer]);

  /**
   * Mount portal content
   */
  const mountPortal = useCallback(async (explicitContainer?: HTMLElement | null, explicitMountPoint?: HTMLElement | null) => {
    if (disabled || mounting || !portalElementRef.current) return;

    setMounting(true);

    try {
      // Prefer an explicitly passed container/mountPoint (used by remounts from
      // setContainer/mountTo, which fire after a state wipe via setTimeout and
      // would otherwise read a stale closure).
      const targetContainer = explicitContainer !== undefined ? explicitContainer : ensureContainer();
      const targetMountPoint = explicitMountPoint !== undefined ? explicitMountPoint : findMountPoint(mountPointElement);

      if (!targetContainer || !targetMountPoint) {
        console.warn('Portal: Unable to find container or mount point');
        return;
      }

      // Apply mount strategy
      switch (mountStrategy) {
        case 'append':
          targetMountPoint.appendChild(portalElementRef.current);
          break;
        case 'prepend':
          targetMountPoint.insertBefore(portalElementRef.current, targetMountPoint.firstChild);
          break;
        case 'replace':
          targetMountPoint.innerHTML = '';
          targetMountPoint.appendChild(portalElementRef.current);
          break;
        case 'before':
          if (targetMountPoint.parentNode) {
            targetMountPoint.parentNode.insertBefore(portalElementRef.current, targetMountPoint);
          }
          break;
        case 'after':
          if (targetMountPoint.parentNode) {
            targetMountPoint.parentNode.insertBefore(portalElementRef.current, targetMountPoint.nextSibling);
          }
          break;
      }

      // Set portal attributes
      portalElementRef.current.setAttribute('data-portal', type);
      portalElementRef.current.setAttribute('data-z-index', zIndex.toString());

      // Focus management for modal portals
      if (type === 'modal') {
        // Save current focus
        const previouslyFocused = document.activeElement as HTMLElement;
        if (previouslyFocused && previouslyFocused !== document.body) {
          (portalElementRef.current as any).__previouslyFocused = previouslyFocused;
        }
      }

      setContainer(targetContainer);
      setMountPointElement(targetMountPoint);
      onMount?.(targetContainer);
    } catch (error) {
      console.error('Portal: Failed to mount', error);
    } finally {
      setMounting(false);
    }
  }, [
    disabled,
    mounting,
    mountPointElement,
    mountStrategy,
    type,
    zIndex,
    onMount,
    ensureContainer,
    findMountPoint
  ]);

  /**
   * Unmount portal content
   */
  const unmountPortal = useCallback(async () => {
    if (unmounting || !portalElementRef.current) return;

    setUnmounting(true);

    try {
      // Focus management for modal portals
      if (type === 'modal' && portalElementRef.current) {
        const previouslyFocused = (portalElementRef.current as any).__previouslyFocused;
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
          previouslyFocused.focus();
        }
      }

      if (portalElementRef.current.parentNode) {
        portalElementRef.current.parentNode.removeChild(portalElementRef.current);
      }

      // Cleanup default container if it exists and should be cleaned up
      if (cleanupContainer && defaultContainerRef.current && defaultContainerRef.current.parentNode) {
        defaultContainerRef.current.parentNode.removeChild(defaultContainerRef.current);
        defaultContainerRef.current = null;
      }

      // When an explicit target was requested while a remount is pending
      // (setContainer/mountTo), don't null it out — preserve the explicit
      // target so the subsequent mount reuses it instead of rebuilding a
      // default container.
      if (pendingContainerRef.current !== undefined) {
        setContainer(pendingContainerRef.current);
        pendingContainerRef.current = undefined;
      } else {
        setContainer(null);
      }
      if (pendingMountPointRef.current !== undefined) {
        setMountPointElement(pendingMountPointRef.current);
        pendingMountPointRef.current = undefined;
      } else {
        setMountPointElement(null);
      }
      onUnmount?.();
    } catch (error) {
      console.error('Portal: Failed to unmount', error);
    } finally {
      setUnmounting(false);
    }
  }, [unmounting, type, cleanupContainer, onUnmount]);

  /**
   * Open portal
   */
  const openAction = useCallback(() => {
    if (disabled) return;

    if (!isControlled) {
      setInternalOpen(true);
      // Mount directly from the action so mounting isn't delayed behind
      // React 19's deferred act() flush (see closeAction for details).
      mountPortalRef.current();
    }

    onOpen?.();
  }, [disabled, isControlled, onOpen]);

  /**
   * Close portal
   */
  const closeAction = useCallback(() => {
    if (disabled) return;

    if (!isControlled) {
      setInternalOpen(false);
      // Schedule the unmount directly from the action so the animation timer
      // starts at call time. (React 19's act() defers re-render/effect flush
      // until the async callback settles, which would otherwise push the
      // open/close effect's setTimeout past the caller's wait window.)
      setTimeout(() => {
        unmountPortalRef.current();
      }, animationDuration);
    }

    onClose?.();
  }, [disabled, isControlled, onClose, animationDuration]);

  /**
   * Toggle portal
   */
  const toggleAction = useCallback(() => {
    if (currentOpen) {
      closeAction();
    } else {
      openAction();
    }
  }, [currentOpen, openAction, closeAction]);

  /**
   * Set container
   */
  const setContainerAction = useCallback((newContainer: HTMLElement | null) => {
    setContainer(newContainer);
    if (newContainer && currentOpen) {
      // Remount to the new container. Pass the explicit target directly so the
      // remount (fired via setTimeout after the unmount wipe) doesn't depend on
      // a stale closure or rebuilt default container.
      pendingContainerRef.current = newContainer;
      unmountPortal().then(() => {
        setTimeout(() => mountPortalRef.current(newContainer, undefined), 0);
      });
    }
  }, [currentOpen, unmountPortal]);

  /**
   * Set z-index
   */
  const setZIndexAction = useCallback((newZIndex: number) => {
    if (portalElementRef.current) {
      portalElementRef.current.style.zIndex = newZIndex.toString();
    }
  }, []);

  /**
   * Mount to specific element
   */
  const mountToAction = useCallback((element: HTMLElement) => {
    setMountPointElement(element);
    if (currentOpen) {
      // Remount to the new element. Pass the explicit target directly so the
      // remount (fired via setTimeout after the unmount wipe) doesn't depend on
      // a stale closure or rebuilt default container.
      pendingMountPointRef.current = element;
      unmountPortal().then(() => {
        setTimeout(() => mountPortalRef.current(undefined, element), 0);
      });
    }
  }, [currentOpen, unmountPortal]);

  /**
   * Focus portal content
   */
  const focusAction = useCallback(() => {
    if (portalElementRef.current) {
      const focusableElement = portalElementRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (focusableElement) {
        focusableElement.focus();
      } else {
        portalElementRef.current.focus();
      }
    }
  }, []);

  /**
   * Get portal element
   */
  const getElementAction = useCallback(() => {
    return portalElementRef.current;
  }, []);

  // Keep the latest mount/unmount in refs so the open/close effect below can
  // call them without depending on their (volatile) identity. Assign during
  // render (not in an effect) so callers that defer mount via setTimeout see
  // the closure reflecting the most recent state.
  mountPortalRef.current = mountPortal;
  unmountPortalRef.current = unmountPortal;

  // Handle open/close state changes. Depends only on [currentOpen,
  // animationDuration] so that mounting/unmounting flips (which change
  // mountPortal/unmountPortal identity) don't re-trigger this effect mid-flight.
  useEffect(() => {
    if (currentOpen) {
      mountPortalRef.current();
    } else {
      // Delay unmount for animation
      const timer = setTimeout(() => {
        unmountPortalRef.current();
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [currentOpen, animationDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unmountPortal();
    };
  }, [unmountPortal]);

  // Build state
  const state: PortalState = {
    open: currentOpen,
    mounting,
    unmounting,
    container,
    mountPoint: mountPointElement,
    zIndex,
    disabled,
    type
  };

  // Build actions
  const actions: PortalActions = {
    open: openAction,
    close: closeAction,
    toggle: toggleAction,
    setContainer: setContainerAction,
    setZIndex: setZIndexAction,
    mountTo: mountToAction,
    unmount: unmountPortal,
    focus: focusAction,
    getElement: getElementAction
  };

  // Build attributes
  const attributes = {
    'role': type === 'modal' ? 'dialog' : 'group',
    'aria-modal': type === 'modal' ? currentOpen : undefined,
    'aria-hidden': !currentOpen,
    'aria-label': type === 'modal' ? 'Modal dialog' : undefined
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: portalElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: portalElementRef
  });

  const semantic = useSemanticMixin({
    role: type === 'modal' ? 'dialog' : 'group',
    'aria-label': type === 'modal' ? 'Modal dialog' : undefined,
    ref: portalElementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}