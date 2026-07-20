/**
 * Metadata for every public component in @hieupth/reui.
 * Drives the showcase sidebar grouping and component doc pages.
 *
 * `slug` is the kebab-case name used in the URL (/components/<slug>).
 */

export type ComponentCategory =
  | 'Buttons'
  | 'Forms'
  | 'Feedback'
  | 'Navigation'
  | 'Data Display'
  | 'Layout/System'
  | 'Motion';

export interface ComponentMeta {
  name: string;
  /** Display grouping in the sidebar (author-chosen; may differ from route folder). */
  category: ComponentCategory;
  /**
   * Filesystem route segment under /components that this page lives at
   * (e.g. 'data-display'). The showcase route is `/components/<categoryFolder>/<slug>`.
   * Kept separate from `category` because the display grouping does not always
   * match the on-disk folder.
   */
  categoryFolder: string;
  slug: string;
  description: string;
}

/** Convert a PascalCase / camelCase name to kebab-case. */
export function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export const componentMeta: ComponentMeta[] = [
  // ── Buttons ──────────────────────────────────────────────────────────────
  { name: 'Button', category: 'Buttons', categoryFolder: 'buttons', slug: 'button', description: 'Versatile trigger button with variants, sizes, loading and icon support.' },
  { name: 'ButtonGroup', category: 'Buttons', categoryFolder: 'buttons', slug: 'button-group', description: 'Groups related buttons into a connected segmented control.' },
  { name: 'Toggle', category: 'Buttons', categoryFolder: 'forms', slug: 'toggle', description: 'Two-state switch button with icon and view-mode variants.' },

  // ── Forms ────────────────────────────────────────────────────────────────
  { name: 'Input', category: 'Forms', categoryFolder: 'forms', slug: 'input', description: 'Text input with variant, size and adornment slot support.' },
  { name: 'InputGroup', category: 'Forms', categoryFolder: 'forms', slug: 'input-group', description: 'Composes inputs with prepended/appended addons and icons.' },
  { name: 'InputOTP', category: 'Forms', categoryFolder: 'forms', slug: 'input-otp', description: 'One-time-password input split into discrete slots.' },
  { name: 'Textarea', category: 'Forms', categoryFolder: 'forms', slug: 'textarea', description: 'Multiline text input with auto-resize and counter variants.' },
  { name: 'Select', category: 'Forms', categoryFolder: 'forms', slug: 'select', description: 'Dropdown select with searchable, grouped and simple variants.' },
  { name: 'Checkbox', category: 'Forms', categoryFolder: 'forms', slug: 'checkbox', description: 'Checkable input with indeterminate and controlled states.' },
  { name: 'RadioGroup', category: 'Forms', categoryFolder: 'forms', slug: 'radio-group', description: 'Single-choice group of radio options with keyboard nav.' },
  { name: 'Switch', category: 'Forms', categoryFolder: 'forms', slug: 'switch', description: 'Accessible on/off toggle with labeled and simple variants.' },
  { name: 'Slider', category: 'Forms', categoryFolder: 'forms', slug: 'slider', description: 'Range input with single, range and simple variants.' },
  { name: 'Label', category: 'Forms', categoryFolder: 'forms', slug: 'label', description: 'Accessible form field label.' },
  { name: 'Field', category: 'Forms', categoryFolder: 'forms', slug: 'field', description: 'Composes label, input, help text and error message.' },
  { name: 'Form', category: 'Forms', categoryFolder: 'forms', slug: 'form', description: 'Form container with validation and submission orchestration.' },
  { name: 'FileUpload', category: 'Forms', categoryFolder: 'forms', slug: 'file-upload', description: 'Drag-and-drop file input with preview and validation.' },
  { name: 'PasswordMeter', category: 'Forms', categoryFolder: 'forms', slug: 'password-meter', description: 'Password strength indicator with scoring.' },
  { name: 'Rating', category: 'Forms', categoryFolder: 'data-display', slug: 'rating', description: 'Star-based rating input with fractional and read-only modes.' },

  // ── Feedback ─────────────────────────────────────────────────────────────
  { name: 'Alert', category: 'Feedback', categoryFolder: 'feedback', slug: 'alert', description: 'Inline status message with severity variants.' },
  { name: 'Progress', category: 'Feedback', categoryFolder: 'feedback', slug: 'progress', description: 'Linear, circular and loading progress indicators.' },
  { name: 'Spinner', category: 'Feedback', categoryFolder: 'feedback', slug: 'spinner', description: 'Loading spinner with dots and bars variants.' },
  { name: 'Skeleton', category: 'Feedback', categoryFolder: 'feedback', slug: 'skeleton', description: 'Animated placeholder for loading content.' },
  { name: 'Toast', category: 'Feedback', categoryFolder: 'feedback', slug: 'toast', description: 'Transient notification with provider and queueing.' },
  { name: 'Tooltip', category: 'Feedback', categoryFolder: 'feedback', slug: 'tooltip', description: 'Hover/focus reveal with simple and rich variants.' },
  { name: 'HoverCard', category: 'Feedback', categoryFolder: 'feedback', slug: 'hover-card', description: 'Rich preview card revealed on hover.' },
  { name: 'Popover', category: 'Feedback', categoryFolder: 'feedback', slug: 'popover', description: 'Floating content panel anchored to a trigger.' },
  { name: 'Dialog', category: 'Feedback', categoryFolder: 'feedback', slug: 'dialog', description: 'Modal dialog with overlay, focus trap and a11y.' },
  { name: 'AlertDialog', category: 'Feedback', categoryFolder: 'feedback', slug: 'alert-dialog', description: 'Confirmation modal for destructive actions.' },
  { name: 'EmptyState', category: 'Feedback', categoryFolder: 'data-display', slug: 'empty-state', description: 'Placeholder for empty data with action slot.' },

  // ── Navigation ───────────────────────────────────────────────────────────
  { name: 'Tabs', category: 'Navigation', categoryFolder: 'navigation', slug: 'tabs', description: 'Tabbed panel switcher with vertical and simple variants.' },
  { name: 'Breadcrumb', category: 'Navigation', categoryFolder: 'navigation', slug: 'breadcrumb', description: 'Trail of links showing the current page location.' },
  { name: 'Pagination', category: 'Navigation', categoryFolder: 'navigation', slug: 'pagination', description: 'Page navigation with compact and jump variants.' },
  { name: 'Menu', category: 'Navigation', categoryFolder: 'navigation', slug: 'menu', description: 'Vertical menu with groups and separators.' },
  { name: 'Menubar', category: 'Navigation', categoryFolder: 'navigation', slug: 'menubar', description: 'Horizontal top-level menu bar.' },
  { name: 'DropdownMenu', category: 'Navigation', categoryFolder: 'navigation', slug: 'dropdown-menu', description: 'Contextual menu triggered by a button.' },
  { name: 'ContextMenu', category: 'Navigation', categoryFolder: 'navigation', slug: 'context-menu', description: 'Menu shown on right-click.' },
  { name: 'NavigationMenu', category: 'Navigation', categoryFolder: 'navigation', slug: 'navigation-menu', description: 'Site navigation with dropdown panels.' },
  { name: 'MegaMenu', category: 'Navigation', categoryFolder: 'navigation', slug: 'mega-menu', description: 'Large multi-column navigation panel.' },
  { name: 'Scrollspy', category: 'Navigation', categoryFolder: 'navigation', slug: 'scrollspy', description: 'Highlights the active section while scrolling.' },
  { name: 'Stepper', category: 'Navigation', categoryFolder: 'data-display', slug: 'stepper', description: 'Multi-step workflow progress indicator.' },
  { name: 'TreeView', category: 'Navigation', categoryFolder: 'navigation', slug: 'tree-view', description: 'Collapsible hierarchical node tree.' },
  { name: 'Sidebar', category: 'Navigation', categoryFolder: 'navigation', slug: 'sidebar', description: 'App navigation rail with items and groups.' },
  { name: 'Offcanvas', category: 'Navigation', categoryFolder: 'feedback', slug: 'offcanvas', description: 'Slide-in side panel overlay.' },
  { name: 'Drawer', category: 'Navigation', categoryFolder: 'feedback', slug: 'drawer', description: 'Composable drawer with header/footer sections.' },
  { name: 'Accordion', category: 'Navigation', categoryFolder: 'navigation', slug: 'accordion', description: 'Collapsible stacked disclosure panels.' },
  { name: 'AccordionMenu', category: 'Navigation', categoryFolder: 'navigation', slug: 'accordion-menu', description: 'Nested collapsible menu with items.' },
  { name: 'Collapsible', category: 'Navigation', categoryFolder: 'navigation', slug: 'collapsible', description: 'Single expand/collapse disclosure widget.' },
  { name: 'Command', category: 'Navigation', categoryFolder: 'navigation', slug: 'command', description: 'Keyboard-driven command palette with search.' },
  { name: 'Combobox', category: 'Navigation', categoryFolder: 'navigation', slug: 'combobox', description: 'Searchable select with free-text and filtering.' },

  // ── Data Display ─────────────────────────────────────────────────────────
  { name: 'Card', category: 'Data Display', categoryFolder: 'data-display', slug: 'card', description: 'Surface container with header, body and footer sections.' },
  { name: 'Badge', category: 'Data Display', categoryFolder: 'data-display', slug: 'badge', description: 'Small status label with wrapper variant.' },
  { name: 'Avatar', category: 'Data Display', categoryFolder: 'data-display', slug: 'avatar', description: 'User image with fallback initials.' },
  { name: 'Chip', category: 'Data Display', categoryFolder: 'data-display', slug: 'chip', description: 'Compact dismissible tag.' },
  { name: 'Table', category: 'Data Display', categoryFolder: 'data-display', slug: 'table', description: 'Styled data table with sortable headers.' },
  { name: 'DataGrid', category: 'Data Display', categoryFolder: 'data-display', slug: 'data-grid', description: 'Feature-rich grid with sorting, filtering and paging.' },
  { name: 'Chart', category: 'Data Display', categoryFolder: 'data-display', slug: 'chart', description: 'Lightweight line and bar chart primitives.' },
  { name: 'List', category: 'Data Display', categoryFolder: 'data-display', slug: 'list', description: 'Vertical list with timeline and compact variants.' },
  { name: 'Item', category: 'Data Display', categoryFolder: 'data-display', slug: 'item', description: 'Row with checkbox/radio selection variants.' },
  { name: 'Kbd', category: 'Data Display', categoryFolder: 'data-display', slug: 'kbd', description: 'Keyboard key and shortcut display.' },
  { name: 'Calendar', category: 'Data Display', categoryFolder: 'data-display', slug: 'calendar', description: 'Date picker with single, multi, range variants.' },
  { name: 'Carousel', category: 'Data Display', categoryFolder: 'data-display', slug: 'carousel', description: 'Sliding content carousel with image/card variants.' },
  { name: 'Resizable', category: 'Data Display', categoryFolder: 'layout-system', slug: 'resizable', description: 'User-resizable panel group.' },
  { name: 'Sortable', category: 'Data Display', categoryFolder: 'layout-system', slug: 'sortable', description: 'Drag-to-reorder list via pointer events.' },

  // ── Layout / System ──────────────────────────────────────────────────────
  { name: 'AspectRatio', category: 'Layout/System', categoryFolder: 'data-display', slug: 'aspect-ratio', description: 'Constrains children to a fixed width/height ratio.' },
  { name: 'Separator', category: 'Layout/System', categoryFolder: 'data-display', slug: 'separator', description: 'Visual divider with orientation support.' },
  { name: 'Panel', category: 'Layout/System', categoryFolder: 'data-display', slug: 'panel', description: 'Surface panel with card and group variants.' },
  { name: 'Slot', category: 'Layout/System', categoryFolder: 'layout-system', slug: 'slot', description: 'Composition primitives for as-child rendering.' },
  { name: 'Portal', category: 'Layout/System', categoryFolder: 'layout-system', slug: 'portal', description: 'Renders children into document.body with backdrop/overlay.' },
  { name: 'VisuallyHidden', category: 'Layout/System', categoryFolder: 'data-display', slug: 'visually-hidden', description: 'Screen-reader-only content variants.' },
  { name: 'AccessibleIcon', category: 'Layout/System', categoryFolder: 'layout-system', slug: 'accessible-icon', description: 'Wraps SVG icons with an accessible label.' },
  { name: 'Toolbar', category: 'Layout/System', categoryFolder: 'layout-system', slug: 'toolbar', description: 'Horizontal grouped action container.' },
  { name: 'DirectionProvider', category: 'Layout/System', categoryFolder: 'layout-system', slug: 'direction-provider', description: 'RTL/LTR direction context with directional helpers.' },

  // ── Motion ───────────────────────────────────────────────────────────────
  { name: 'FadeInOut', category: 'Motion', categoryFolder: 'motion', slug: 'fade-in-out', description: 'Opacity fade enter/exit animation.' },
  { name: 'SlideIn', category: 'Motion', categoryFolder: 'motion', slug: 'slide-in', description: 'Directional slide enter animation.' },
  { name: 'ScaleInOut', category: 'Motion', categoryFolder: 'motion', slug: 'scale-in-out', description: 'Scale grow/shrink enter/exit animation.' },
  { name: 'RotateIn', category: 'Motion', categoryFolder: 'motion', slug: 'rotate-in', description: 'Rotation enter animation.' },
  { name: 'Bounce', category: 'Motion', categoryFolder: 'motion', slug: 'bounce', description: 'Spring bounce animation.' },
  { name: 'Shake', category: 'Motion', categoryFolder: 'motion', slug: 'shake', description: 'Horizontal shake animation for errors.' },
  { name: 'Flip', category: 'Motion', categoryFolder: 'motion', slug: 'flip', description: '3D flip enter animation.' },
  { name: 'BlurInOut', category: 'Motion', categoryFolder: 'motion', slug: 'blur-in-out', description: 'Blur focus/defocus enter/exit animation.' },
  { name: 'Pulse', category: 'Motion', categoryFolder: 'motion', slug: 'pulse', description: 'Continuous attention pulse loop.' },
  { name: 'StaggerChildren', category: 'Motion', categoryFolder: 'motion', slug: 'stagger-children', description: 'Sequences child animations with delay.' },
  { name: 'ParallaxScroll', category: 'Motion', categoryFolder: 'motion', slug: 'parallax-scroll', description: 'Scroll-driven parallax movement.' },
  { name: 'RevealOnScroll', category: 'Motion', categoryFolder: 'motion', slug: 'reveal-on-scroll', description: 'Reveals content as it enters the viewport.' },
  { name: 'HoverLift', category: 'Motion', categoryFolder: 'motion', slug: 'hover-lift', description: 'Lift/elevate element on hover.' },
  { name: 'MagneticHover', category: 'Motion', categoryFolder: 'motion', slug: 'magnetic-hover', description: 'Element follows the cursor on hover.' },
];

/** All component categories in display order. */
export const componentCategories: ComponentCategory[] = [
  'Buttons',
  'Forms',
  'Feedback',
  'Navigation',
  'Data Display',
  'Layout/System',
  'Motion',
];

/** Look up a component by its slug. */
export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return componentMeta.find((c) => c.slug === slug);
}

/** All components within a category. */
export function getComponentsByCategory(category: ComponentCategory): ComponentMeta[] {
  return componentMeta.filter((c) => c.category === category);
}
