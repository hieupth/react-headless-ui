# @hieupth/react-headless-ui

A headless React UI system built on composition over inheritance: behavior
hooks, headless UI primitives, reusable behavior mixins, a theme provider, and
semantic-first accessibility — all from a single package.

Components emit semantic class names (e.g. `button`, `button-leading-icon`,
`accordion-trigger`) so consumers can style them with their own CSS. **No CSS
is shipped** — styling is entirely consumer-owned.

## Features

- **🪝 Behavior hooks** — `useButton`, `useAccordion`, `useCombobox`, `useTabs`, … headless logic with keyboard nav and ARIA wiring.
- **🧩 Headless UI primitives** — matching `<Button>`, `<Accordion>`, … rendering unstyled real DOM with semantic class names for consumer styling.
- **🔧 Behavior mixins** — `useFocusableMixin`, `usePressableMixin`, `useSemanticMixin` for reusable focus / press / a11y logic.
- **🎨 ThemeProvider** — context-based theming with a default theme; overrides merge one level per section (override a single token without bricking the rest).
- **♿ Semantic-first** — accessibility wired into the behavior layer, not bolted on.

## Installation

```bash
npm install @hieupth/react-headless-ui
```

Peer dependencies (install the ones for the features you use):

- **`framer-motion`** — **required** peer. The motion components (`SlideIn`, `Pulse`, `RevealOnScroll`, `HoverLift`, `Shake`, `ScaleInOut`, …) statically import `framer-motion`, so it must be installed.
- **`@tanstack/react-virtual`** — optional peer, only for virtualized `Command` / `Combobox` / `DataGrid` lists.

`react-hook-form` is a regular dependency (used by `Form` / `useForm`) — installed automatically, no action needed.

```bash
npm install framer-motion              # required for motion components
npm install @tanstack/react-virtual    # only for virtualized lists
```

The package ships ESM + CJS + TypeScript types, and is tree-shakeable (`sideEffects: false`).

## Quick start

```tsx
import { Button, ThemeProvider } from '@hieupth/react-headless-ui';

function App() {
  return (
    <ThemeProvider>
      <Button onPress={() => alert('clicked')}>Click me</Button>
    </ThemeProvider>
  );
}
```

## Styling

Components are **headless** — they emit semantic class names (`button`,
`button-primary`, `dialog-content`, `accordion-trigger`, …) but ship no CSS.
You style them:

```tsx
// Option A: Tailwind utilities via className
<Button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium">Click</Button>

// Option B: Plain CSS — define the semantic classes
// .button { padding: 0.5rem 1rem; border-radius: 0.375rem; }
// .button-primary { background: #2563eb; color: white; }
<Button variant="primary">Click</Button>
```

See the [showcase](https://hieupth.github.io/react-headless-ui/) for live examples of every component styled with Tailwind.

## Architecture

Every styled component wraps a `useX` behavior hook (e.g. `<Button>` →
`useButton`). Behavior is composed through mixins rather than inheritance:

```ts
export const useButton = (props: UseButtonProps) => {
  const focusable = useFocusableMixin(props);
  const pressable = usePressableMixin(props);
  const semantic = useSemanticMixin({ role: 'button', ...props });
  return { ...focusable, ...pressable, ...semantic };
};
```

- Behavior mixins: `useFocusableMixin`, `usePressableMixin`, `useSemanticMixin`.
- Selection API unified: single-select uses `value`/`onValueChange`; multi-select uses `selectedKeys`/`onSelectionChange`.
- All hooks return a flat bag: `{ ...state, ...actions, ...attributes, className, ref }`.
- Theming via `ThemeProvider` + `useTheme()` — a default theme with per-section, one-level overrides.

## Project layout

```
packages/react-headless-ui/src
  hooks/        behavior hooks (use*.tsx)
  components/   headless UI primitives (*.tsx)
  mixins/       focusable / pressable / semantic
  providers/    ThemeProvider
  contracts/    type-only contracts (ComponentContract, SemanticContract, AriaRole…)
  utils/        composition helpers
examples/        Next.js showcase app (consumer): docs + live component demos
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Build `@hieupth/react-headless-ui` → `dist/` |
| `pnpm dev` | Run the showcase app (`next dev`) |
| `pnpm test` | Run unit tests (Vitest + React Testing Library) |
| `pnpm typecheck` | Type-check all workspaces (`tsc --noEmit`) |

## Testing

- **Unit:** Vitest + React Testing Library + `jest-axe`. **2469 tests across 95 files — all green.** Run `pnpm test`. (Extended `.extra.test.*`/`.deep.test.*` stress suites are excluded from the gate; see `packages/react-headless-ui/vitest.config.ts`.)
- **Coverage:** **100%** (lines/statements/functions/branches), enforced locally by a Vitest threshold gate. Run `pnpm --filter @hieupth/react-headless-ui run coverage` (needs `NODE_OPTIONS=--max-old-space-size=6144` under v8 instrumentation).
- **Pre-release:** type-check, unit suite, coverage, and build are run locally before tagging a release.

## Status

- **Version:** `0.1.0` (pre-1.0; breaking changes may occur).
- **Build:** green — `pnpm build` ships `dist/index.{js,cjs}` and `dist/index.d.ts` (consumers get TypeScript types).
- **Types:** `pnpm typecheck` reports **0 errors**.
- **Tree-shakeable:** `sideEffects: false`; `framer-motion` is a required peer (`@tanstack/react-virtual` optional; `react-hook-form` a regular dependency).
- **Releases:** tagging `vX.Y.Z` triggers `release.yml` (publish to npm) and `showcase.yml` (deploy the showcase).

## Requirements

- Node.js 22+
- pnpm 10+

## License

This project is **dual-licensed** to suit different needs:

- **AGPL-3.0** (default, open-source) — Free for students, researchers,
  enthusiasts, and open-source projects. You may use, study, modify, and
  distribute this project under the terms of the [GNU AGPL v3.0](LICENSE).
  Distributing the project, or offering it over a network, requires
  releasing the corresponding source under the same AGPL-3.0 terms.
- **Commercial License** — For proprietary, closed-source, or production
  use that AGPL-3.0 does not permit: internal tools, commercial products,
  or deployments where you cannot meet AGPL's source-disclosure
  obligations. A commercial license grants use without the copyleft
  requirements.

To request a commercial license, contact **Hieu Pham** via
[github.com/hieupth](https://github.com/hieupth).

Copyright © 2026 [Hieu Pham](https://github.com/hieupth). All rights reserved.
