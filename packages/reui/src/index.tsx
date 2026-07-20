/**
 * @hieupth/reui
 *
 * Headless React UI primitives built with composition over inheritance:
 * behavior hooks, styled components, shared behavior mixins, a theme
 * provider, semantic contracts, and composition utilities — all from a
 * single package.
 */

export * from './contracts';
export * from './mixins';
export * from './utils';
export * from './hooks';
export * from './components';
export * from './providers';

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
} from './components';
