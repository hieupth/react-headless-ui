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
  category: ComponentCategory;
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
  { name: 'Button', category: 'Buttons', slug: 'button', description: 'Versatile trigger button with variants, sizes, loading and icon support.' },
  { name: 'ButtonGroup', category: 'Buttons', slug: 'button-group', description: 'Groups related buttons into a connected segmented control.' },
  { name: 'Toggle', category: 'Buttons', slug: 'toggle', description: 'Two-state switch button with icon and view-mode variants.' },

  // ── Forms ────────────────────────────────────────────────────────────────
  { name: 'Input', category: 'Forms', slug: 'input', description: 'Text input with variant, size and adornment slot support.' },
  { name: 'InputGroup', category: 'Forms', slug: 'input-group', description: 'Composes inputs with prepended/appended addons and icons.' },
  { name: 'InputOTP', category: 'Forms', slug: 'input-otp', description: 'One-time-password input split into discrete slots.' },
  { name: 'Textarea', category: 'Forms', slug: 'textarea', description: 'Multiline text input with auto-resize and counter variants.' },
  { name: 'Select', category: 'Forms', slug: 'select', description: 'Dropdown select with searchable, grouped and simple variants.' },
  { name: 'Checkbox', category: 'Forms', slug: 'checkbox', description: 'Checkable input with indeterminate and controlled states.' },
  { name: 'RadioGroup', category: 'Forms', slug: 'radio-group', description: 'Single-choice group of radio options with keyboard nav.' },
  { name: 'Switch', category: 'Forms', slug: 'switch', description: 'Accessible on/off toggle with labeled and simple variants.' },
  { name: 'Slider', category: 'Forms', slug: 'slider', description: 'Range input with single, range and simple variants.' },
  { name: 'Label', category: 'Forms', slug: 'label', description: 'Accessible form field label.' },
  { name: 'Field', category: 'Forms', slug: 'field', description: 'Composes label, input, help text and error message.' },
  { name: 'Form', category: 'Forms', slug: 'form', description: 'Form container with validation and submission orchestration.' },
  { name: 'FileUpload', category: 'Forms', slug: 'file-upload', description: 'Drag-and-drop file input with preview and validation.' },
  { name: 'PasswordMeter', category: 'Forms', slug: 'password-meter', description: 'Password strength indicator with scoring.' },
  { name: 'Rating', category: 'Forms', slug: 'rating', description: 'Star-based rating input with fractional and read-only modes.' },

  // ── Feedback ─────────────────────────────────────────────────────────────
  { name: 'Alert', category: 'Feedback', slug: 'alert', description: 'Inline status message with severity variants.' },
  { name: 'Progress', category: 'Feedback', slug: 'progress', description: 'Linear, circular and loading progress indicators.' },
  { name: 'Spinner', category: 'Feedback', slug: 'spinner', description: 'Loading spinner with dots and bars variants.' },
  { name: 'Skeleton', category: 'Feedback', slug: 'skeleton', description: 'Animated placeholder for loading content.' },
  { name: 'Toast', category: 'Feedback', slug: 'toast', description: 'Transient notification with provider and queueing.' },
  { name: 'Tooltip', category: 'Feedback', slug: 'tooltip', description: 'Hover/focus reveal with simple and rich variants.' },
  { name: 'HoverCard', category: 'Feedback', slug: 'hover-card', description: 'Rich preview card revealed on hover.' },
  { name: 'Popover', category: 'Feedback', slug: 'popover', description: 'Floating content panel anchored to a trigger.' },
  { name: 'Dialog', category: 'Feedback', slug: 'dialog', description: 'Modal dialog with overlay, focus trap and a11y.' },
  { name: 'AlertDialog', category: 'Feedback', slug: 'alert-dialog', description: 'Confirmation modal for destructive actions.' },
  { name: 'EmptyState', category: 'Feedback', slug: 'empty-state', description: 'Placeholder for empty data with action slot.' },

  // ── Navigation ───────────────────────────────────────────────────────────
  { name: 'Tabs', category: 'Navigation', slug: 'tabs', description: 'Tabbed panel switcher with vertical and simple variants.' },
  { name: 'Breadcrumb', category: 'Navigation', slug: 'breadcrumb', description: 'Trail of links showing the current page location.' },
  { name: 'Pagination', category: 'Navigation', slug: 'pagination', description: 'Page navigation with compact and jump variants.' },
  { name: 'Menu', category: 'Navigation', slug: 'menu', description: 'Vertical menu with groups and separators.' },
  { name: 'Menubar', category: 'Navigation', slug: 'menubar', description: 'Horizontal top-level menu bar.' },
  { name: 'DropdownMenu', category: 'Navigation', slug: 'dropdown-menu', description: 'Contextual menu triggered by a button.' },
  { name: 'ContextMenu', category: 'Navigation', slug: 'context-menu', description: 'Menu shown on right-click.' },
  { name: 'NavigationMenu', category: 'Navigation', slug: 'navigation-menu', description: 'Site navigation with dropdown panels.' },
  { name: 'MegaMenu', category: 'Navigation', slug: 'mega-menu', description: 'Large multi-column navigation panel.' },
  { name: 'Scrollspy', category: 'Navigation', slug: 'scrollspy', description: 'Highlights the active section while scrolling.' },
  { name: 'Stepper', category: 'Navigation', slug: 'stepper', description: 'Multi-step workflow progress indicator.' },
  { name: 'TreeView', category: 'Navigation', slug: 'tree-view', description: 'Collapsible hierarchical node tree.' },
  { name: 'Sidebar', category: 'Navigation', slug: 'sidebar', description: 'App navigation rail with items and groups.' },
  { name: 'Offcanvas', category: 'Navigation', slug: 'offcanvas', description: 'Slide-in side panel overlay.' },
  { name: 'Drawer', category: 'Navigation', slug: 'drawer', description: 'Composable drawer with header/footer sections.' },
  { name: 'Accordion', category: 'Navigation', slug: 'accordion', description: 'Collapsible stacked disclosure panels.' },
  { name: 'AccordionMenu', category: 'Navigation', slug: 'accordion-menu', description: 'Nested collapsible menu with items.' },
  { name: 'Collapsible', category: 'Navigation', slug: 'collapsible', description: 'Single expand/collapse disclosure widget.' },
  { name: 'Command', category: 'Navigation', slug: 'command', description: 'Keyboard-driven command palette with search.' },
  { name: 'Combobox', category: 'Navigation', slug: 'combobox', description: 'Searchable select with free-text and filtering.' },

  // ── Data Display ─────────────────────────────────────────────────────────
  { name: 'Card', category: 'Data Display', slug: 'card', description: 'Surface container with header, body and footer sections.' },
  { name: 'Badge', category: 'Data Display', slug: 'badge', description: 'Small status label with wrapper variant.' },
  { name: 'Avatar', category: 'Data Display', slug: 'avatar', description: 'User image with fallback initials.' },
  { name: 'Chip', category: 'Data Display', slug: 'chip', description: 'Compact dismissible tag.' },
  { name: 'Table', category: 'Data Display', slug: 'table', description: 'Styled data table with sortable headers.' },
  { name: 'DataGrid', category: 'Data Display', slug: 'data-grid', description: 'Feature-rich grid with sorting, filtering and paging.' },
  { name: 'Chart', category: 'Data Display', slug: 'chart', description: 'Lightweight line and bar chart primitives.' },
  { name: 'List', category: 'Data Display', slug: 'list', description: 'Vertical list with timeline and compact variants.' },
  { name: 'Item', category: 'Data Display', slug: 'item', description: 'Row with checkbox/radio selection variants.' },
  { name: 'Kbd', category: 'Data Display', slug: 'kbd', description: 'Keyboard key and shortcut display.' },
  { name: 'Calendar', category: 'Data Display', slug: 'calendar', description: 'Date picker with single, multi, range variants.' },
  { name: 'Carousel', category: 'Data Display', slug: 'carousel', description: 'Sliding content carousel with image/card variants.' },
  { name: 'Resizable', category: 'Data Display', slug: 'resizable', description: 'User-resizable panel group.' },
  { name: 'Sortable', category: 'Data Display', slug: 'sortable', description: 'Drag-to-reorder list via pointer events.' },

  // ── Layout / System ──────────────────────────────────────────────────────
  { name: 'AspectRatio', category: 'Layout/System', slug: 'aspect-ratio', description: 'Constrains children to a fixed width/height ratio.' },
  { name: 'Separator', category: 'Layout/System', slug: 'separator', description: 'Visual divider with orientation support.' },
  { name: 'Panel', category: 'Layout/System', slug: 'panel', description: 'Surface panel with card and group variants.' },
  { name: 'Slot', category: 'Layout/System', slug: 'slot', description: 'Composition primitives for as-child rendering.' },
  { name: 'Portal', category: 'Layout/System', slug: 'portal', description: 'Renders children into document.body with backdrop/overlay.' },
  { name: 'VisuallyHidden', category: 'Layout/System', slug: 'visually-hidden', description: 'Screen-reader-only content variants.' },
  { name: 'AccessibleIcon', category: 'Layout/System', slug: 'accessible-icon', description: 'Wraps SVG icons with an accessible label.' },
  { name: 'Toolbar', category: 'Layout/System', slug: 'toolbar', description: 'Horizontal grouped action container.' },
  { name: 'DirectionProvider', category: 'Layout/System', slug: 'direction-provider', description: 'RTL/LTR direction context with directional helpers.' },

  // ── Motion ───────────────────────────────────────────────────────────────
  { name: 'FadeInOut', category: 'Motion', slug: 'fade-in-out', description: 'Opacity fade enter/exit animation.' },
  { name: 'SlideIn', category: 'Motion', slug: 'slide-in', description: 'Directional slide enter animation.' },
  { name: 'ScaleInOut', category: 'Motion', slug: 'scale-in-out', description: 'Scale grow/shrink enter/exit animation.' },
  { name: 'RotateIn', category: 'Motion', slug: 'rotate-in', description: 'Rotation enter animation.' },
  { name: 'Bounce', category: 'Motion', slug: 'bounce', description: 'Spring bounce animation.' },
  { name: 'Shake', category: 'Motion', slug: 'shake', description: 'Horizontal shake animation for errors.' },
  { name: 'Flip', category: 'Motion', slug: 'flip', description: '3D flip enter animation.' },
  { name: 'BlurInOut', category: 'Motion', slug: 'blur-in-out', description: 'Blur focus/defocus enter/exit animation.' },
  { name: 'Pulse', category: 'Motion', slug: 'pulse', description: 'Continuous attention pulse loop.' },
  { name: 'StaggerChildren', category: 'Motion', slug: 'stagger-children', description: 'Sequences child animations with delay.' },
  { name: 'ParallaxScroll', category: 'Motion', slug: 'parallax-scroll', description: 'Scroll-driven parallax movement.' },
  { name: 'RevealOnScroll', category: 'Motion', slug: 'reveal-on-scroll', description: 'Reveals content as it enters the viewport.' },
  { name: 'HoverLift', category: 'Motion', slug: 'hover-lift', description: 'Lift/elevate element on hover.' },
  { name: 'MagneticHover', category: 'Motion', slug: 'magnetic-hover', description: 'Element follows the cursor on hover.' },
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
