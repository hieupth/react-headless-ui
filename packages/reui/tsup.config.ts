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
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'framer-motion', 'react-hook-form'],
});
