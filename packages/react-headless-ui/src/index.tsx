"use client";
/**
 * @hieupth/react-headless-ui
 *
 * Headless React UI primitives built with composition over inheritance:
 * behavior hooks, styled components, shared behavior mixins, a theme
 * provider, semantic contracts, and composition utilities — all from a
 * single package.
 */

export * from './contracts/index.js';
export * from './mixins/index.js';
export * from './utils/index.js';
export * from './hooks/index.js';
export * from './components/index.js';
export * from './providers/index.js';

// Resolve name collisions between the hooks barrel (which re-exports internal
// data-shape interfaces) and the components barrel (which exports the matching
// React components). Explicit re-exports disambiguate the wildcards above in
// favor of the public component.
export {
  AccordionMenuItem,
  DropdownMenuItem,
  CommandItem,
  CommandGroup,
  ComboboxOption,
  ComboboxGroup,
  ScrollspySection
} from './components/index.js';
