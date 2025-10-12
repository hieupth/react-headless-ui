/**
 * Scrollspy renderer component using headless useScrollspy hook.
 * Provides styled scrollspy with comprehensive accessibility support and active section tracking.
 */

import React, { forwardRef, useEffect } from 'react';
import { useScrollspy, type UseScrollspyProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ScrollspyProps extends Omit<UseScrollspyProps, 'scrollspyRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom section item renderer */
  renderSection?: (section: any, isActive: boolean) => React.ReactNode;
  /** Height of the scrollspy container */
  height?: number | string;
  /** Whether to show indicators for active section */
  showIndicators?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Position of the scrollspy */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Orientation of the scrollspy */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Scrollspy component with active section tracking.
 * Supports intersection observer, smooth scrolling, and proper accessibility.
 */
export const Scrollspy = forwardRef<HTMLDivElement, ScrollspyProps>(({
  className = '',
  style,
  renderSection,
  height,
  showIndicators = true,
  showIcons = true,
  showProgress = false,
  position = 'left',
  orientation = 'vertical',
  ...scrollspyProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useScrollspy({
    ...scrollspyProps,
    scrollspyRef: ref as React.RefObject<HTMLDivElement>
  });

  // Position classes
  const positionClasses = {
    left: 'left-0 top-0',
    right: 'right-0 top-0',
    top: 'top-0 left-0',
    bottom: 'bottom-0 left-0'
  };

  // Orientation classes
  const orientationClasses = {
    vertical: 'flex-col space-y-2',
    horizontal: 'flex-row space-x-4'
  };

  // Base scrollspy classes
  const scrollspyClasses = `
    scrollspy
    fixed ${positionClasses[position]} ${orientationClasses[orientation]}
    bg-white border border-gray-200 rounded-lg shadow-sm p-4
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${orientation === 'vertical' ? 'w-64' : 'h-auto'}
    ${orientation === 'horizontal' ? 'h-16 w-auto' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default section renderer
  const defaultRenderSection = (section: any, isActive: boolean) => {
    const sectionClasses = `
      scrollspy-section
      flex items-center gap-3 px-3 py-2 rounded-md
      transition-all duration-200 cursor-pointer
      ${section.disabled
        ? 'text-gray-400 cursor-not-allowed'
        : isActive
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `.trim().replace(/\s+/g, ' ');

    return (
      <div
        className={sectionClasses}
        onClick={() => !section.disabled && actions.navigateToSection(section.id)}
        role="link"
        aria-disabled={section.disabled}
        aria-current={isActive ? 'true' : undefined}
        tabIndex={isActive ? 0 : -1}
        data-testid={`scrollspy-section-${section.id}`}
      >
        {/* Indicator */}
        {showIndicators && (
          <div className={`
            flex-shrink-0 w-2 h-2 rounded-full
            ${isActive
              ? 'bg-blue-600'
              : 'bg-gray-300'
            }
          `} />
        )}

        {/* Section Icon */}
        {showIcons && section.icon && (
          <span className="flex-shrink-0">
            {section.icon}
          </span>
        )}

        {/* Section Label */}
        <span className="flex-1 truncate">
          {section.label}
        </span>

        {/* Active indicator arrow */}
        {isActive && orientation === 'vertical' && (
          <span className="flex-shrink-0">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>
    );
  };

  // Progress indicator
  const renderProgress = () => {
    if (!showProgress || orientation !== 'vertical') return null;

    const activeIndex = state.sections.findIndex(section => section.id === state.activeSectionId);
    const progress = state.sections.length > 0 ? ((activeIndex + 1) / state.sections.length) * 100 : 0;

    return (
      <div className="progress-container absolute bottom-0 left-0 right-0 p-4">
        <div className="progress-bar bg-gray-200 rounded-full h-1">
          <div
            className="progress-fill bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text text-xs text-gray-500 mt-1 text-center">
          {activeIndex + 1} / {state.sections.length}
        </div>
      </div>
    );
  };

  // Register sections when component mounts
  useEffect(() => {
    const registerSections = () => {
      state.sections.forEach(section => {
        if (section.id) {
          const element = document.getElementById(section.id) as HTMLElement;
          if (element) {
            actions.registerSection(section.id, element);
          }
        }
      });
    };

    // Initial registration
    registerSections();

    // Refresh sections periodically to catch newly added elements
    const interval = setInterval(registerSections, 1000);

    return () => {
      clearInterval(interval);
      // Clean up all section registrations
      state.sections.forEach(section => {
        if (section.id) {
          actions.unregisterSection(section.id);
        }
      });
    };
  }, [state.sections, actions]);

  return (
    <div
      ref={ref}
      className={scrollspyClasses}
      style={{
        ...style,
        height: height || (orientation === 'vertical' ? 'auto' : 'auto'),
        maxHeight: height || (orientation === 'vertical' ? '80vh' : 'auto'),
        overflow: orientation === 'vertical' ? 'auto' : 'hidden'
      }}
      {...attributes}
      data-testid="scrollspy"
    >
      {/* Header */}
      <div className="scrollspy-header mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Table of Contents
        </h3>
      </div>

      {/* Sections */}
      <div className="scrollspy-sections space-y-1">
        {state.sections.map((section) => {
          const isActive = actions.isSectionActive(section.id);
          return (
            <div key={section.id} className="scrollspy-section-wrapper">
              {renderSection
                ? renderSection(section, isActive)
                : defaultRenderSection(section, isActive)
              }
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      {renderProgress()}

      {/* Empty State */}
      {state.sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">No sections available</p>
        </div>
      )}

      {/* Scroll Position Indicator */}
      {showProgress && orientation === 'horizontal' && (
        <div className="scroll-position-indicator mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Position:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-200"
                style={{ width: `${Math.min((state.scrollPosition / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%` }}
              />
            </div>
            <span>{Math.round((state.scrollPosition / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
});

Scrollspy.displayName = 'Scrollspy';

/**
 * ScrollspySection - Individual section component (for advanced usage)
 */
export interface ScrollspySectionProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Section data */
  section: any;
  /** Whether section is active */
  isActive: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether to show indicators */
  showIndicators?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
}

export const ScrollspySection = forwardRef<HTMLDivElement, ScrollspySectionProps>(({
  className = '',
  style,
  section,
  isActive,
  onClick,
  showIndicators = true,
  showIcons = true,
  ...props
}, ref) => {
  const sectionClasses = `
    flex items-center gap-3 px-3 py-2 rounded-md
    transition-all duration-200 cursor-pointer
    ${section.disabled
      ? 'text-gray-400 cursor-not-allowed'
      : isActive
        ? 'bg-blue-100 text-blue-700 font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={sectionClasses}
      style={style}
      onClick={onClick}
      role="link"
      aria-disabled={section.disabled}
      aria-current={isActive ? 'true' : undefined}
      tabIndex={isActive ? 0 : -1}
      data-testid={`scrollspy-section-${section.id}`}
      {...props}
    >
      {/* Indicator */}
      {showIndicators && (
        <div className={`
          flex-shrink-0 w-2 h-2 rounded-full
          ${isActive
            ? 'bg-blue-600'
            : 'bg-gray-300'
          }
        `} />
      )}

      {/* Section Icon */}
      {showIcons && section.icon && (
        <span className="flex-shrink-0">
          {section.icon}
        </span>
      )}

      {/* Section Label */}
      <span className="flex-1 truncate">
        {section.label}
      </span>

      {/* Active indicator arrow */}
      {isActive && (
        <span className="flex-shrink-0">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  );
});

ScrollspySection.displayName = 'ScrollspySection';

export default Scrollspy;