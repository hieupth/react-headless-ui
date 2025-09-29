Mission & Flutter‑Inspired Architecture

Mission: Build a headless React UI system using Flutter’s proven architectural patterns — composition over inheritance, behavior mixins, theme extensions, and semantic‑first accessibility.

⸻

Flutter‑Inspired Core Principles
	•	Composition over Inheritance: Like Flutter widgets, compose simple contracts into complex UI.
	•	Behavior Mixins: Reusable behavior logic without inheritance hierarchy (inspired by Flutter mixins).
	•	Theme Extensions: Extensible theming like Flutter’s ThemeExtension pattern.
	•	Semantic‑First: Accessibility as a core architectural principle, not an afterthought.
	•	Provider Pattern: Dependency injection inspired by Flutter’s Provider ecosystem.
	•	Traversal Rendering: Data‑driven UI trees like Flutter’s widget composition system.

⸻

Repository Layout

Project root: react-ui-forge. This map is authoritative — keep it updated.

react-ui-forge/
├─ package.json                  # Workspace scripts, repo metadata
├─ pnpm-workspace.yaml           # pnpm workspaces config
├─ tsconfig.base.json            # TS strict base shared across packages
├─ .eslintrc.cjs                 # Lint rules (TS/React)
├─ .prettierrc                   # Formatting config
├─ .gitignore
├─ .changeset/                   # Versioning and changelogs
│
├─ packages/
│  ├─ core/                      # ❖ HEADLESS CORE (Flutter-style contracts)
│  │  ├─ src/
│  │  │  ├─ contracts/           # Component contracts (Flutter-inspired)
│  │  │  │  ├─ component.ts      # ComponentContract, VariantMap, SlotClasses
│  │  │  │  ├─ traversal.ts      # TraversalNode + traverser (Flutter tree rendering)
│  │  │  │  ├─ behavior.ts       # BehaviorMixin interfaces (Flutter mixin pattern)
│  │  │  │  └─ semantic.ts       # SemanticContract for a11y (Flutter Semantics)
│  │  │  ├─ mixins/              # Behavior mixins (Flutter-inspired reusability)
│  │  │  │  ├─ focusable.ts      # FocusableMixin - focus behavior
│  │  │  │  ├─ pressable.ts      # PressableMixin - press interactions
│  │  │  │  ├─ semantic.ts       # SemanticMixin - a11y behavior
│  │  │  │  └─ stateful.ts       # StatefulMixin - state management
│  │  │  ├─ utils/               # Behavior utilities (ids, keyboard, a11y, composition, provider)
│  │  │  ├─ headless/            # Headless hooks with mixin composition
│  │  │  │  ├─ button.ts         # useButton with PressableMixin + SemanticMixin
│  │  │  │  ├─ input.ts          # useInput with FocusableMixin + StatefulMixin
│  │  │  │  ├─ menu.ts           # useMenu with TraversalMixin + SemanticMixin
│  │  │  │  ├─ navbar.ts         # ❖ useNavbar (registry extension demo)
│  │  │  │  └─ table.ts          # useTable with TraversalMixin + SemanticMixin
│  │
│  ├─ renderer/            # ❖ REACT RENDERER (composition-based)
│  │  ├─ src/
│  │  │  ├─ providers/           # ThemeProvider, SemanticProvider, RegistryProvider
│  │  │  ├─ primitives/          # Slot, Compose, Portal utilities
│  │  │  ├─ components/          # Composed components (Flutter widget pattern)
│  │  │  │  ├─ Button.tsx        # Composed with mixins + semantic contracts
│  │  │  │  ├─ Menu.tsx          # Traversal-based + semantic composition
│  │  │  │  ├─ Navbar.tsx        # ❖ Provider + registry + traversal composition
│  │  │  │  └─ [other components] # Input, Dialog, Dropdown, Table
│  │  │  ├─ extensions/          # Component extensions (Flutter mixin-style)
│  │  │  ├─ registry/
│  │  │  │  ├─ navbar.builtin.ts # ❖ Built-in: bar/logo/link/spacer (NO search)
│  │  │  │  └─ menu.builtin.ts   # Built-in menu item renderers
│  │
│  ├─ theme/                     # ❖ THEME EXTENSIONS (Flutter ThemeExtension pattern)
│  │  ├─ src/
│  │  │  ├─ base/                # Base theme system (contracts, extensions, provider)
│  │  │  ├─ tailwind/            # Tailwind theme extensions
│  │  │  │  ├─ extensions/       # ColorExtension, TypographyExtension, SpacingExtension, SemanticExtension
│  │  │  │  └─ recipes/          # Component recipes with extensions
│  │  │  └─ bootstrap/           # Bootstrap theme extensions (same structure)
│  │
│  ├─ gateway/                   # ❖ PUBLIC ENTRY (subpath imports)
│  └─ presets/                   # (Optional) Prebundled components
│
├─ example/                      # NextJS demo apps (static apps for E2E testing)
│  ├─ tailwind/                  # NextJS static app - Tailwind theme, NO search in navbar
│  └─ bootstrap/                 # NextJS static app - Bootstrap theme, WITH search extension
│
├─ docs/                         # Storybook
│
└─ tests/
   ├─ playwright/                # Python E2E test suite
   │  ├─ conftest.py             # Pytest config, browser setup
   │  ├─ test_health_check.py    # App startup and curl health checks
   │  ├─ test_build_integrity.py # Build success, no build errors
   │  ├─ test_mixin_composition.py # Mixin behavior testing
   │  ├─ test_theme_extensions.py # Theme extension functionality
   │  ├─ test_semantic_contracts.py # Accessibility compliance
   │  ├─ test_navbar.py          # ❖ Registry extension: TW=no search, BS=with search
   │  ├─ test_navigation.py      # Complete navigation flow
   │  ├─ test_responsive.py      # Responsive behavior + UI integrity
   │  ├─ utils/                  # Testing utilities (browser, mixin_helpers, semantic_helpers, assertions)
   │  └─ requirements.txt        # pytest, playwright
   └─ README.md

Public imports: react-ui-forge/theme/tailwind, react-ui-forge/theme/bootstrap

⸻

Development Patterns

1. Behavior Mixin Pattern (Flutter-Inspired)

Concept: Components compose behaviors through mixins rather than inheritance.

// useButton example - composes multiple mixins
export const useButton = (props: ButtonProps) => {
  const focusable = useFocusableMixin(props);
  const pressable = usePressableMixin(props); 
  const semantic = useSemanticMixin({ role: 'button', ...props });
  return { ...focusable, ...pressable, ...semantic };
};

2. Theme Extension Pattern (Flutter ThemeExtension)

Concept: Extend theme with typed, copyable extensions.

export class ColorExtension extends ThemeExtension {
  constructor(public primary: ColorPalette, public semantic: SemanticColors) {
    super('colors');
  }
  copyWith(overrides: Partial<ColorExtension>): ColorExtension {
    return new ColorExtension(overrides.primary ?? this.primary, ...);
  }
}

3. Registry Pattern (Navbar Extension Example)

// Tailwind demo: NO search (uses builtin only)
const tailwindRegistry = new ComponentRegistry({
  'navbar-bar': BuiltinNavbarBar,
  'navbar-logo': BuiltinNavbarLogo,
  'navbar-link': BuiltinNavbarLink,
  // NO search component registered
});

// Bootstrap demo: WITH search extension  
const bootstrapRegistry = new ComponentRegistry({
  ...tailwindRegistry,
  'navbar-search': CustomSearchComponent, // Extension added
});

4. Semantic Contract Architecture (Flutter Semantics)

export interface ComponentContract<T> {
  variants: VariantMap;
  slots: SlotMap; 
  semantics: SemanticContract;  // Mandatory
  behavior: BehaviorMixins[];
}


⸻

Development Workflow
	1.	Define Contracts: Semantic, behavior, and theme contracts.
	2.	Compose Mixins: Combine behavior mixins for functionality.
	3.	Implement Extensions: Add theme extensions for Tailwind and Bootstrap.
	4.	Test Composition: Verify mixin composition and semantic contracts.
	5.	Validate Accessibility: Ensure semantic contracts are fulfilled.
	6.	Registry Extensions: Add registry extensions where needed (e.g., navbar search demo).

⸻

Architecture Summary
	•	Composition Over Inheritance: Behaviors via mixins.
	•	Extension-Based Theming: ColorExtension, TypographyExtension, SemanticExtension.
	•	Contract-Driven Development: ComponentContract, SemanticContract, BehaviorContract.
	•	Provider-Based Architecture: ThemeProvider, RegistryProvider, SemanticProvider composition.

⸻

Code Standards
	•	Composition First: Always prefer composition.
	•	Semantic Mandatory: Every component must implement semantic contracts.
	•	Extension Architecture: Use theme extensions, not overrides.
	•	Contract Compliance: Contracts must be fully implemented.

⸻

Anti‑Patterns
	•	Inheritance over composition.
	•	Theme mutations (must use extensions).
	•	Accessibility as an afterthought.
	•	Partial contract implementations.

⸻

Testing Policy

Mandatory for every source change.
	•	test_mixin_composition.py — Verify mixin interactions and conflicts.
	•	test_theme_extensions.py — Verify theme extensions compose without conflicts.
	•	test_semantic_contracts.py — Verify all components fulfill semantic contracts.
	•	test_navbar.py — Registry extension demo (TW=no search, BS=with search).

Zero tolerance for: Contract violations, semantic gaps, mixin failures, theme conflicts.

⸻

Accessibility Architecture
	•	Semantic Contracts (mandatory): role, label, description, state, actions, relationships.
	•	Mixin‑based a11y behavior: SemanticMixin, FocusableMixin, DescribableMixin.
	•	Theme extension a11y: SemanticExtension tokens, high contrast support, focus indicator styling.

⸻

Security & Extension Guidelines
	•	Validate mixin compositions for conflicts.
	•	Sanitize theme extension data (prevent XSS).
	•	Validate semantic contracts (prevent a11y violations).
	•	Provider scope validation and registry extension type safety.

⸻

Commit Guidelines
	•	Follow conventional commits with changeset for contract changes.
	•	All tests must pass in CI (including Playwright E2E).
	•	Provide mixin composition evidence.
	•	Provide semantic compliance proof.
	•	Provide registry extension demo proof (e.g., navbar search).

⸻

This AGENTS.md specifies Flutter‑inspired architecture for component composition, accessibility, and extensibility. Every change requires comprehensive testing validation across all layers.