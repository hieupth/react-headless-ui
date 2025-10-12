/**
 * React UI Forge - Gateway Package
 *
 * Public API entry point for React UI Forge.
 * Provides clean subpath exports to all packages.
 *
 * Architecture Principles:
 * - Clean public API
 * - Subpath exports for tree shaking
 * - TypeScript types included
 * - Flutter-inspired patterns
 * - Headless + styled components
 */

// Re-export everything from packages with proper subpath exports
// Note: Using selective exports to avoid naming conflicts between core types and renderer components

// Core package - Headless hooks and utilities
export * from '@react-ui-forge/core';

// Theme package - Theme extensions
export * from '@react-ui-forge/theme';

// Renderer package - Styled components (only working components for now)
export {
  Button,
  Input,
  Select,
  Tabs,
  Switch,
  Slider,
  Progress,
  Spinner,
  Dialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Menu
} from '@react-ui-forge/renderer';

// Export DropdownMenuItem component with alias to avoid conflict
export { DropdownMenuItem as DropdownMenuItemComponent } from '@react-ui-forge/renderer';

// Presets package - Pre-built configurations
export * from '@react-ui-forge/presets';