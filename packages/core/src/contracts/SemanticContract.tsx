/**
 * Semantic accessibility contract following WAI-ARIA guidelines.
 * Enforces mandatory accessibility for all components.
 */

export interface SemanticContract {
  /** Screen reader accessible label */
  readonly 'aria-label'?: string;
  /** Element identifier for label association */
  readonly 'aria-labelledby'?: string;
  /** Descriptive element identifier */
  readonly 'aria-describedby'?: string;
  /** Current semantic role */
  readonly role: AriaRole;
  /** Accessibility properties */
  readonly 'aria-atomic'?: boolean;
  readonly 'aria-busy'?: boolean;
  readonly 'aria-controls'?: string;
  readonly 'aria-current'?: boolean | string;
  readonly 'aria-disabled'?: boolean;
  readonly 'aria-expanded'?: boolean;
  readonly 'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  readonly 'aria-hidden'?: boolean;
  readonly 'aria-invalid'?: boolean | 'grammar' | 'spelling';
  readonly 'aria-live'?: 'off' | 'polite' | 'assertive';
  readonly 'aria-readonly'?: boolean;
  readonly 'aria-required'?: boolean;
  readonly 'aria-selected'?: boolean;
  /** Keyboard navigation support */
  readonly tabIndex?: number;
}

export type AriaRole =
  | 'generic'
  | 'button'
  | 'link'
  | 'menu'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'radio'
  | 'checkbox'
  | 'textbox'
  | 'combobox'
  | 'listbox'
  | 'tree'
  | 'treeitem'
  | 'grid'
  | 'gridcell'
  | 'row'
  | 'rowgroup'
  | 'columnheader'
  | 'rowheader'
  | 'tab'
  | 'tabpanel'
  | 'dialog'
  | 'alert'
  | 'status'
  | 'tooltip'
  | 'navigation'
  | 'main'
  | 'search'
  | 'banner'
  | 'contentinfo'
  | 'region'
  | 'form'
  | 'application'
  | 'article'
  | 'complementary'
  | 'none'
  | 'presentation';

export interface KeyboardNavigation {
  /** Element can receive keyboard focus */
  focusable: boolean;
  /** Navigation keys supported */
  navigationKeys: NavigationKey[];
  /** Custom keyboard handlers */
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
}

export type NavigationKey =
  | 'Enter'
  | 'Space'
  | 'Escape'
  | 'Tab'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';