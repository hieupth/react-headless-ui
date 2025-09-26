# react-ui-forge

A headless React UI system built with advanced architectural patterns featuring composition over inheritance, behavior mixins, theme extensions, and semantic-first accessibility.

## Features

- **🏗️ Advanced Architecture**: Contract-driven development with composition over inheritance
- **🎯 Behavior Mixins**: Reusable behavior logic without inheritance hierarchy
- **🎨 Theme Extensions**: Extensible theming with copyWith pattern for both Tailwind and Bootstrap
- **♿ Semantic-First**: Accessibility as core architectural principle, not afterthought
- **🔧 Provider Pattern**: Dependency injection through context composition
- **🌳 Traversal Rendering**: Data-driven UI trees with component composition system

## Packages

- `@react-ui-forge/core` - Core contracts and mixins
- `@react-ui-forge/renderer-react` - React renderer implementation
- `@react-ui-forge/theme` - Theme system with Tailwind and Bootstrap support

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

## Architecture

### Core Principles

1. **Composition Over Inheritance**: Components compose behaviors through mixins rather than inheritance
2. **Extension-Based Theming**: ColorExtension, TypographyExtension, SemanticExtension with copyWith pattern
3. **Contract-Driven Development**: ComponentContract, SemanticContract, BehaviorContract
4. **Provider-Based Architecture**: ThemeProvider, RegistryProvider, SemanticProvider composition

### Behavior Mixin Example

```typescript
export const useButton = (props: ButtonProps) => {
  const focusable = useFocusableMixin(props);
  const pressable = usePressableMixin(props);
  const semantic = useSemanticMixin({ role: 'button', ...props });
  return { ...focusable, ...pressable, ...semantic };
};
```

### Theme Extension Pattern

```typescript
export class ColorExtension extends ThemeExtension {
  constructor(public primary: ColorPalette, public semantic: SemanticColors) {
    super('colors');
  }
  copyWith(overrides: Partial<ColorExtension>): ColorExtension {
    return new ColorExtension(overrides.primary ?? this.primary, ...);
  }
}
```

## Development

### Requirements

- Node.js 18+
- pnpm 8+
- Python 3.9+ with pytest, playwright
- Chrome browser + Playwright browsers
- TypeScript strict mode enabled

### Scripts

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm dev` - Start development server
- `pnpm test` - Run all tests
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - Run TypeScript type checking

## Testing

Every change must pass comprehensive tests including:
- Mixin composition validation
- Theme extension functionality
- Semantic contract compliance
- E2E testing with Playwright

## License

[GNU AGPL v3.0](LICENSE).<br>
Copyright &copy; 2025 [Hieu Pham](https://github.com/hieupth). All rights reserved.