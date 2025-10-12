import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS generation temporarily
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@react-ui-forge/core', '@react-ui-forge/theme'],
});