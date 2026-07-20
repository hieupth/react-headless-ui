# @hieupth/reui

A headless React UI system built with composition over inheritance: behavior
hooks, headless UI primitives, reusable behavior mixins, a theme provider, and
semantic-first accessibility — all from a single package.

Components emit semantic class names (e.g. `button`, `button-leading-icon`,
`accordion-trigger`) so consumers can style them with their own CSS. No CSS is
shipped — styling is entirely consumer-owned.

## Features

- **🪝 Behavior hooks** — `useButton`, `useAccordion`, `useCombobox`, `useTabs`, … headless logic with keyboard nav and ARIA wiring.
- **🧩 Headless UI primitives** — matching `<Button>`, `<Accordion>`, … rendering unstyled real DOM with semantic class names for consumer styling (no shipped CSS).
- **🔧 Behavior mixins** — `useFocusableMixin`, `usePressableMixin`, `useSemanticMixin` for reusable focus / press / a11y logic.
- **🎨 ThemeProvider** — context-based theming with a default theme and shallow overrides.
- **♿ Semantic-first** — accessibility wired into the behavior layer, not bolted on.

## Package

This is a single-package workspace:

- `@hieupth/reui` (`packages/reui`) — hooks, components, mixins, theme provider, contracts, utilities.

## Installation

```bash
npm install @hieupth/reui
```

Install the optional peer dependencies only for the features you use:

- **`framer-motion`** — motion components (`SlideIn`, `Pulse`, `RevealOnScroll`, `HoverLift`, `Shake`, `ScaleInOut`, …).
- **`react-hook-form`** — `Form` / `useForm`.

```bash
npm install framer-motion      # if you use motion components
npm install react-hook-form    # if you use Form / useForm
```

The package ships ESM + CJS + TypeScript types, and is tree-shakeable (`sideEffects: false`).

## Quick start

```bash
pnpm install
pnpm build          # build the library (tsup/esbuild)
pnpm dev            # run the example Next.js app
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Build `@hieupth/reui` → `dist/` |
| `pnpm dev` | Run the example app (`next dev`) |
| `pnpm test` | Run unit tests (Vitest + React Testing Library) |
| `pnpm test:e2e` | Run E2E smoke tests (Playwright) against the example |
| `pnpm typecheck` | Type-check all workspaces (`tsc --noEmit`) |
| `pnpm lint` | Lint workspaces that define a `lint` script |

## Architecture

Components compose behavior through mixins rather than inheritance:

```ts
export const useButton = (props: UseButtonProps) => {
  const focusable = useFocusableMixin(props);
  const pressable = usePressableMixin(props);
  const semantic = useSemanticMixin({ role: 'button', ...props });
  return { ...focusable, ...pressable, ...semantic };
};
```

Themability is provided through `ThemeProvider` + `useTheme()` (a context with
a default theme and shallow top-level overrides).

## Project layout

```
packages/reui/src
  hooks/        behavior hooks (use*.tsx)
  components/   headless UI primitives (*.tsx)
  mixins/       focusable / pressable / semantic
  providers/    ThemeProvider
  contracts/    type-only contracts (ComponentContract, SemanticContract, AriaRole…)
  utils/        composition helpers
examples/next-demo/   Next.js demo app (consumer) + e2e/ Playwright smoke tests
```

## Testing

- **Unit:** Vitest + React Testing Library + `jest-axe`. **5237 tests across 219 files — all green.** Run `pnpm test`.
- **Coverage:** **100%** (lines/statements/functions/branches), enforced by a threshold gate. Run `pnpm --filter @hieupth/reui run coverage` (needs `NODE_OPTIONS=--max-old-space-size=6144` under v8 instrumentation).
- **E2E:** Playwright smoke tests in `examples/next-demo/e2e/` against the example app. `pnpm test:e2e`.
- **CI:** `.github/workflows/ci.yml` gates every PR on `typecheck` + unit tests + package build (with `.d.ts`), the example Next build, and E2E.

## Status

- **Version:** `0.1.0` (pre-1.0; breaking changes may occur).
- **Build:** green — `pnpm build` ships `dist/index.{js,cjs}` **and `dist/index.d.ts`** (consumers get TypeScript types).
- **Types:** `pnpm typecheck` reports **0 errors**.
- **Tree-shakeable:** `sideEffects: false`; `framer-motion` / `react-hook-form` are optional peer deps.
- **Unit suite:** 5237/5237 green across 219 files; coverage **100%** on all four metrics.

## Requirements

- Node.js 20+
- pnpm 10+

## License

[GNU AGPL v3.0](LICENSE).<br>
Copyright © 2025–2026 [Hieu Pham](https://github.com/hieupth). All rights reserved.
