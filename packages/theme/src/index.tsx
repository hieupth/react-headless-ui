/**
 * React UI Forge - Theme Package
 *
 * Flutter-inspired theme system for React components.
 * Provides comprehensive theme extensions following ThemeExtension pattern.
 *
 * Architecture Principles:
 * - Immutable theme extensions (copyWith pattern)
 * - Component-specific theming
 * - Dark/light theme support
 * - Semantic color system
 * - Typography scale system
 * - Consistent spacing system
 */

// Base theme extensions
export type {
  ColorExtension,
  ColorPalette,
  SurfaceColors,
  SemanticColors,
  TypographyExtension,
  FontFamily,
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacings,
  TextStyle,
  TextStyleMap,
  SpacingExtension,
  SpacingScale,
  ComponentSpacing,
  ButtonSpacing,
  InputSpacing,
  CardSpacing,
  DialogSpacing,
  NavigationSpacing,
  LayoutSpacing
} from './base';

export {
  defaultColorExtension,
  darkColorExtension,
  createColorExtension,
  defaultTypographyExtension,
  createTypographyExtension,
  defaultSpacingExtension,
  createSpacingExtension
} from './base';