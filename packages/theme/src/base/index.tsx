/**
 * Base theme extensions for React UI Forge.
 * Provides foundational theme extensions following Flutter patterns.
 */

export type {
  ColorExtension,
  ColorPalette,
  SurfaceColors,
  SemanticColors
} from './ColorExtension';

export {
  defaultColorExtension,
  darkColorExtension,
  createColorExtension
} from './ColorExtension';

export type {
  TypographyExtension,
  FontFamily,
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacings,
  TextStyle,
  TextStyleMap
} from './TypographyExtension';

export {
  defaultTypographyExtension,
  createTypographyExtension
} from './TypographyExtension';

export type {
  SpacingExtension,
  SpacingScale,
  ComponentSpacing,
  ButtonSpacing,
  InputSpacing,
  CardSpacing,
  DialogSpacing,
  NavigationSpacing,
  LayoutSpacing
} from './SpacingExtension';

export {
  defaultSpacingExtension,
  createSpacingExtension
} from './SpacingExtension';