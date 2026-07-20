import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  // Mark the bundle client-only: every export uses React hooks, so this is a
  // client component for Next.js App Router consumers (who then don't need to
  // wrap each import in their own "use client" boundary).
  banner: {
    js: '"use client"',
  },
  // Type debt cleared (tsc --noEmit reports 0 errors); ship .d.ts to consumers.
  dts: true,
  // Enable ESM code-splitting (tsup only splits ESM; CJS stays a single chunk).
  // NOTE: with a single synchronous entry point and no dynamic imports this is
  // currently a no-op — esbuild only splits across multiple entries / dynamic
  // imports. Reliable consumer tree-shaking today comes from ESM + sideEffects:
  // false. To make unused exports drop from the dist bundle itself, switch to
  // `bundle: false` (preserve per-module output).
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'framer-motion', 'react-hook-form'],
});
