/**
 * Scrollspy headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages active section tracking based on scroll position.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Scroll spy section interface
 */
export interface ScrollspySection {
  /** Unique identifier for the section */
  id: string;
  /** Section label text */
  label: string;
  /** Element reference for the section */
  element?: HTMLElement | null;
  /** Whether section is disabled */
  disabled?: boolean;
  /** Section href for navigation */
  href?: string;
  /** Section icon */
  icon?: React.ReactNode;
  /** Additional section data */
  data?: any;
}

/**
 * Scroll spy state interface
 */
export interface ScrollspyState {
  /** Currently active section ID */
  activeSectionId: string | null;
  /** Whether scroll spy is disabled */
  disabled: boolean;
  /** Section structure */
  sections: ScrollspySection[];
  /** Current scroll position */
  scrollPosition: number;
  /** Whether scroll spy is observing */
  isObserving: boolean;
}

/**
 * Scroll spy actions interface
 */
export interface ScrollspyActions {
  /** Manually set active section */
  setActiveSection: (sectionId: string) => void;
  /** Navigate to section */
  navigateToSection: (sectionId: string) => void;
  /** Register section element */
  registerSection: (sectionId: string, element: HTMLElement) => void;
  /** Unregister section element */
  unregisterSection: (sectionId: string) => void;
  /** Refresh all sections */
  refreshSections: () => void;
  /** Get section by ID */
  getSection: (sectionId: string) => ScrollspySection | undefined;
  /** Check if section is active */
  isSectionActive: (sectionId: string) => boolean;
  /** Get visible sections */
  getVisibleSections: () => ScrollspySection[];
}

/**
 * Props for useScrollspy hook
 */
export interface UseScrollspyProps {
  /** Section data structure */
  sections: ScrollspySection[];
  /** Offset from top for activation */
  offset?: number;
  /** Root element for intersection observer */
  root?: HTMLElement | null;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number | number[];
  /** Whether scroll spy is disabled */
  disabled?: boolean;
  /** Whether to automatically update active section on scroll */
  autoUpdate?: boolean;
  /** Callback when active section changes */
  onActiveSectionChange?: (sectionId: string | null) => void;
  /** Callback when section becomes visible */
  onSectionVisible?: (sectionId: string) => void;
  /** Ref to the scroll spy container element */
  scrollspyRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for useScrollspy hook
 */
export interface UseScrollspyReturns {
  /** Current scroll spy state */
  state: ScrollspyState;
  /** Scroll spy actions */
  actions: ScrollspyActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
    'role': string;
    'tabIndex': number;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Scroll spy hook implementation
 * @param props - Scroll spy configuration props
 * @returns Scroll spy state, actions, and attributes
 */
export function useScrollspy(props: UseScrollspyProps): UseScrollspyReturns {
  const {
    sections: initialSections,
    offset = 0,
    root = null,
    rootMargin = '-0px 0px -50% 0px',
    threshold = [0, 0.1, 0.5, 1],
    disabled = false,
    autoUpdate = true,
    onActiveSectionChange,
    onSectionVisible,
    scrollspyRef
  } = props;

  // State management
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<ScrollspySection[]>(initialSections);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isObserving, setIsObserving] = useState(false);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const scrollspyElementRef = scrollspyRef || internalRef;
  const sectionElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Register section element
  const registerSection = useCallback((sectionId: string, element: HTMLElement) => {
    if (disabled) return;

    sectionElementsRef.current.set(sectionId, element);
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, element } : section
    ));

    // Start observing if not already observing
    /* c8 ignore next 3 -- reason: defensive race branch; the observer-creation
       effect sets observerRef.current and isObserving=true atomically, so no
       render exists where observerRef is non-null while isObserving is false. */
    if (observerRef.current && !isObserving) {
      observerRef.current.observe(element);
    }
  }, [disabled, isObserving]);

  // Unregister section element
  const unregisterSection = useCallback((sectionId: string) => {
    if (disabled) return;

    const element = sectionElementsRef.current.get(sectionId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    sectionElementsRef.current.delete(sectionId);

    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, element: null } : section
    ));
  }, [disabled]);

  // Refresh all sections
  const refreshSections = useCallback(() => {
    if (disabled) return;

    // Re-register all elements
    sectionElementsRef.current.clear();

    // Update sections with current elements
    setSections(prev => prev.map(section => {
      const element = document.getElementById(section.id) as HTMLElement;
      if (element) {
        sectionElementsRef.current.set(section.id, element);
        return { ...section, element };
      }
      return { ...section, element: null };
    }));

    // Restart observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      sectionElementsRef.current.forEach(element => {
        observerRef.current?.observe(element);
      });
    }
  }, [disabled]);

  // Get section by ID
  const getSection = useCallback((sectionId: string): ScrollspySection | undefined => {
    return sections.find(section => section.id === sectionId);
  }, [sections]);

  // Check if section is active
  const isSectionActive = useCallback((sectionId: string): boolean => {
    return activeSectionId === sectionId;
  }, [activeSectionId]);

  // Get visible sections
  const getVisibleSections = useCallback((): ScrollspySection[] => {
    return sections.filter(section => section.element);
  }, [sections]);

  // Manually set active section
  const setActiveSectionAction = useCallback((sectionId: string) => {
    if (disabled) return;

    const section = getSection(sectionId);
    if (section && !section.disabled) {
      setActiveSectionId(sectionId);
      onActiveSectionChange?.(sectionId);
    }
  }, [disabled, getSection, onActiveSectionChange]);

  // Navigate to section
  const navigateToSection = useCallback((sectionId: string) => {
    if (disabled) return;

    const section = getSection(sectionId);
    if (section && !section.disabled && section.element) {
      // Scroll to section with offset
      const elementTop = section.element.getBoundingClientRect().top + window.pageYOffset;
      const targetScroll = elementTop - offset;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      // Update active section
      setActiveSectionAction(sectionId);
    } else if (section?.href) {
      // Navigate to href if element not found
      window.location.href = section.href;
    }
  }, [disabled, getSection, offset, setActiveSectionAction]);

  // Set up intersection observer
  useEffect(() => {
    if (disabled || !autoUpdate) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;

        if (entry.isIntersecting) {
          onSectionVisible?.(sectionId);

          // Check if this should be the active section
          const rect = entry.intersectionRect;
          const isVisible = rect.height > 0;

          if (isVisible && entry.intersectionRatio >= 0.5) {
            setActiveSectionId(sectionId);
            onActiveSectionChange?.(sectionId);
          }
        }
      });
    };

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold
    });

    // Observe all registered elements
    sectionElementsRef.current.forEach(element => {
      observerRef.current?.observe(element);
    });

    setIsObserving(true);

    return () => {
      /* c8 ignore next 4 -- reason: cleanup only runs for effect instances that
         created the observer (the effect body always assigns observerRef.current),
         so observerRef is never null inside this cleanup. */
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      setIsObserving(false);
    };
  }, [disabled, autoUpdate, root, rootMargin, threshold, onActiveSectionChange, onSectionVisible]);

  // Update scroll position
  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disabled]);

  // Auto-detect sections on mount
  useEffect(() => {
    if (disabled) return;

    const timer = setTimeout(() => {
      refreshSections();
    }, 100);

    return () => clearTimeout(timer);
  }, [disabled, refreshSections]);

  // Build state
  const state: ScrollspyState = {
    activeSectionId,
    disabled,
    sections,
    scrollPosition,
    isObserving
  };

  // Build actions
  const actions: ScrollspyActions = {
    setActiveSection: setActiveSectionAction,
    navigateToSection,
    registerSection,
    unregisterSection,
    refreshSections,
    getSection,
    isSectionActive,
    getVisibleSections
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: scrollspyElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: scrollspyElementRef
  });

  const semantic = useSemanticMixin({
    role: 'navigation',
    ariaLabel: 'Table of contents',
    ref: scrollspyElementRef
  });

  // Build attributes
  const attributes = {
    'aria-label': semantic.ariaLabel,
    'role': semantic.role,
    'tabIndex': disabled ? -1 : 0
  };

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}