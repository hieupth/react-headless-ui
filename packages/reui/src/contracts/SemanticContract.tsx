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
  // Abstract roles (not used directly, kept for completeness)
  | 'generic'
  | 'none'
  | 'presentation'
  // Widget roles
  | 'button'
  | 'link'
  | 'checkbox'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'radio'
  | 'option'
  | 'switch'
  | 'tab'
  | 'tabpanel'
  | 'slider'
  | 'spinbutton'
  | 'textbox'
  | 'searchbox'
  | 'combobox'
  | 'menu'
  | 'menuitem'
  | 'menubar'
  | 'menubaritem'
  | 'listbox'
  | 'tree'
  | 'treeitem'
  | 'treegrid'
  | 'grid'
  | 'gridcell'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'columnheader'
  | 'cell'
  | 'separator'
  // Document structure
  | 'application'
  | 'article'
  | 'blockquote'
  | 'caption'
  | 'definition'
  | 'directory'
  | 'document'
  | 'figure'
  | 'group'
  | 'heading'
  | 'img'
  | 'label'
  | 'list'
  | 'listitem'
  | 'math'
  | 'note'
  | 'paragraph'
  | 'table'
  | 'term'
  | 'toolbar'
  // Landmark roles
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'search'
  | 'alert'
  | 'alertdialog'
  | 'dialog'
  | 'log'
  | 'marquee'
  | 'status'
  | 'timer'
  | 'tooltip'
  | 'progressbar'
  | 'radiogroup'
  | 'scrollbar'
  | 'tablist';

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

/**
 * Alias for the semantic behavior props. Hooks that compose semantics
 * extend this interface (kept here for backward-compatible imports).
 */
export type { SemanticMixinProps as SemanticProps } from '../mixins/SemanticMixin';