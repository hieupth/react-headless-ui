/**
 * MegaMenu renderer component using headless useMegaMenu hook.
 * Provides comprehensive mega menu functionality with dropdown panels,
 * keyboard navigation, and accessibility support.
 */

import React, { forwardRef } from 'react';
import { useMegaMenu, type UseMegaMenuProps, type MegaMenuItem } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface MegaMenuProps extends UseMegaMenuProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether to render horizontal or vertical layout */
  orientation?: 'horizontal' | 'vertical';
  /** Custom trigger component renderer */
  renderTrigger?: (item: MegaMenuItem, isActive: boolean, isOpen: boolean) => React.ReactNode;
  /** Custom panel component renderer */
  renderPanel?: (item: MegaMenuItem, isOpen: boolean) => React.ReactNode;
  /** Animation duration for panel transitions */
  panelAnimationDuration?: number;
  /** Panel position relative to trigger */
  panelPosition?: 'bottom' | 'top' | 'left' | 'right';
  /** Whether to show arrows on triggers with panels */
  showPanelArrows?: boolean;
}

/**
 * MegaMenu component with dropdown panels and rich content support.
 * Supports both horizontal and vertical layouts with comprehensive keyboard navigation.
 */
export const MegaMenu = forwardRef<HTMLElement, MegaMenuProps>(({
  className = '',
  style,
  orientation = 'horizontal',
  renderTrigger,
  renderPanel,
  panelAnimationDuration = 300,
  panelPosition = 'bottom',
  showPanelArrows = true,
  ...megaMenuProps
}: MegaMenuProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    ref: elementRef,
    eventHandlers
  } = useMegaMenu(megaMenuProps);

  // Combine refs
  const combinedRef = (node: HTMLElement) => {
    elementRef(node);
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Base classes
  const baseClasses = [
    'mega-menu',
    `mega-menu-${orientation}`,
    state.disabled ? 'mega-menu-disabled' : 'mega-menu-enabled',
    className
  ].filter(Boolean).join(' ');

  // Default trigger renderer
  const defaultRenderTrigger = (item: MegaMenuItem, isActive: boolean, isOpen: boolean) => (
    <div
      className={`mega-menu-trigger ${
        isActive ? 'mega-menu-trigger-active' : ''
      } ${isOpen ? 'mega-menu-trigger-open' : ''} ${
        item.disabled ? 'mega-menu-trigger-disabled' : ''
      }`}
      data-item-id={item.id}
    >
      <span className="mega-menu-trigger-content">
        {item.icon && <span className="mega-menu-trigger-icon">{item.icon}</span>}
        <span className="mega-menu-trigger-label">{item.label}</span>
        {item.panel && showPanelArrows && (
          <span className="mega-menu-trigger-arrow">
            {orientation === 'horizontal' ? '▼' : '▶'}
          </span>
        )}
      </span>
      {item.description && (
        <span className="mega-menu-trigger-description">{item.description}</span>
      )}
    </div>
  );

  // Default panel renderer
  const defaultRenderPanel = (item: MegaMenuItem, isOpen: boolean) => (
    <div
      className={`mega-menu-panel mega-menu-panel-${panelPosition} ${
        isOpen ? 'mega-menu-panel-open' : 'mega-menu-panel-closed'
      }`}
      style={{
        animationDuration: `${panelAnimationDuration}ms`
      }}
    >
      <div className="mega-menu-panel-content">
        {item.panel}
      </div>
    </div>
  );

  // Render menu items
  const renderItems = (items: MegaMenuItem[], level: number = 0) => {
    return items.map((item) => {
      const isActive = state.activeItemId === item.id;
      const isOpen = state.openPanelIds.has(item.id);

      return (
        <div
          key={item.id}
          className={`mega-menu-item mega-menu-item-level-${level} ${
            isActive ? 'mega-menu-item-active' : ''
          } ${isOpen ? 'mega-menu-item-open' : ''}`}
          data-item-id={item.id}
        >
          {/* Trigger */}
          <div
            className="mega-menu-trigger-wrapper"
            onKeyDown={(e) => {
              // Handle item-specific keyboard events
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                actions.handleItemClick(item);
              }
            }}
            onClick={() => actions.handleItemClick(item)}
            onMouseEnter={() => actions.handleItemHover(item)}
          >
            {renderTrigger ? renderTrigger(item, isActive, isOpen) : defaultRenderTrigger(item, isActive, isOpen)}
          </div>

          {/* Panel */}
          {item.panel && (
            <div className={`mega-menu-panel-wrapper mega-menu-panel-${panelPosition}`}>
              {renderPanel ? renderPanel(item, isOpen) : defaultRenderPanel(item, isOpen)}
            </div>
          )}

          {/* Nested items */}
          {item.children && item.children.length > 0 && (
            <div className={`mega-menu-children mega-menu-children-level-${level + 1}`}>
              {renderItems(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <nav
      ref={combinedRef}
      className={baseClasses}
      style={{
        ...style,
        ...hookStyle
      }}
      {...eventHandlers}
      data-orientation={orientation}
      data-testid="mega-menu"
    >
      <div className="mega-menu-items">
        {renderItems(state.items)}
      </div>

      {/* Global styles for mega menu */}
      <style>{`
        .mega-menu {
          position: relative;
          display: flex;
          background: ${theme.colors?.background || '#ffffff'};
          border: 1px solid ${theme.colors?.border || '#e5e7eb'};
          border-radius: ${theme.borderRadius?.md || '8px'};
          box-shadow: ${theme.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
        }

        .mega-menu-horizontal {
          flex-direction: row;
          align-items: center;
        }

        .mega-menu-vertical {
          flex-direction: column;
          align-items: stretch;
        }

        .mega-menu-items {
          display: flex;
          flex: 1;
        }

        .mega-menu-horizontal .mega-menu-items {
          flex-direction: row;
        }

        .mega-menu-vertical .mega-menu-items {
          flex-direction: column;
        }

        .mega-menu-item {
          position: relative;
        }

        .mega-menu-trigger-wrapper {
          cursor: pointer;
          user-select: none;
        }

        .mega-menu-trigger {
          display: flex;
          flex-direction: column;
          padding: ${theme.spacing?.md || '16px'};
          transition: all ${panelAnimationDuration}ms ease;
          border-radius: ${theme.borderRadius?.md || '8px'};
        }

        .mega-menu-horizontal .mega-menu-trigger {
          min-width: 120px;
        }

        .mega-menu-vertical .mega-menu-trigger {
          width: 100%;
        }

        .mega-menu-trigger:hover {
          background: ${theme.colors?.gray50 || '#f9fafb'};
        }

        .mega-menu-trigger-active {
          background: ${theme.colors?.primary100 || '#dbeafe'};
          color: ${theme.colors?.primary700 || '#1d4ed8'};
        }

        .mega-menu-trigger-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mega-menu-trigger-content {
          display: flex;
          align-items: center;
          gap: ${theme.spacing?.sm || '8px'};
        }

        .mega-menu-trigger-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mega-menu-trigger-label {
          font-weight: ${theme.fontWeights?.medium || '500'};
          font-size: ${theme.fontSizes?.md || '16px'};
        }

        .mega-menu-trigger-arrow {
          margin-left: auto;
          font-size: ${theme.fontSizes?.xs || '12px'};
          opacity: 0.7;
        }

        .mega-menu-trigger-description {
          font-size: ${theme.fontSizes?.sm || '14px'};
          color: ${theme.colors?.gray600 || '#4b5563'};
          margin-top: ${theme.spacing?.xs || '4px'};
        }

        .mega-menu-panel-wrapper {
          position: absolute;
          z-index: 50;
        }

        .mega-menu-horizontal .mega-menu-panel-bottom {
          top: 100%;
          left: 0;
          right: 0;
        }

        .mega-menu-horizontal .mega-menu-panel-top {
          bottom: 100%;
          left: 0;
          right: 0;
        }

        .mega-menu-vertical .mega-menu-panel-right {
          top: 0;
          left: 100%;
        }

        .mega-menu-vertical .mega-menu-panel-left {
          top: 0;
          right: 100%;
        }

        .mega-menu-panel {
          background: ${theme.colors?.background || '#ffffff'};
          border: 1px solid ${theme.colors?.border || '#e5e7eb'};
          border-radius: ${theme.borderRadius?.lg || '12px'};
          box-shadow: ${theme.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
          overflow: hidden;
          min-width: 300px;
          max-width: 600px;
        }

        .mega-menu-panel-closed {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          pointer-events: none;
        }

        .mega-menu-panel-open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .mega-menu-panel-content {
          padding: ${theme.spacing?.lg || '24px'};
        }

        .mega-menu-children {
          position: relative;
        }

        .mega-menu-horizontal .mega-menu-children {
          position: absolute;
          top: 100%;
          left: 0;
          background: ${theme.colors?.background || '#ffffff'};
          border: 1px solid ${theme.colors?.border || '#e5e7eb'};
          border-radius: ${theme.borderRadius?.md || '8px'};
          box-shadow: ${theme.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
          z-index: 40;
          min-width: 200px;
        }

        .mega-menu-vertical .mega-menu-children {
          margin-left: ${theme.spacing?.lg || '24px'};
          border-left: 2px solid ${theme.colors?.gray200 || '#e5e7eb'};
          padding-left: ${theme.spacing?.lg || '24px'};
        }

        .mega-menu-disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Focus styles */
        .mega-menu-trigger:focus-visible {
          outline: 2px solid ${theme.colors?.primary500 || '#3b82f6'};
          outline-offset: 2px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .mega-menu-horizontal {
            flex-direction: column;
          }

          .mega-menu-horizontal .mega-menu-items {
            flex-direction: column;
            width: 100%;
          }

          .mega-menu-panel {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            max-width: none;
          }

          .mega-menu-horizontal .mega-menu-panel-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
          }

          .mega-menu-panel-content {
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </nav>
  );
});

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;