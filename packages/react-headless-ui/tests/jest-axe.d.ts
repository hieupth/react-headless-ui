// jest-axe ships no bundled TypeScript declarations. Tests import it for the
// `axe` accessibility checker; declare the module so the test type-gate
// (tsconfig.tests.json) resolves it instead of erroring with TS7016.
declare module 'jest-axe' {
  import type { Result, axe as axeFunction } from 'axe-core';

  export interface AxeResults extends Result {}
  export const axe: typeof axeFunction;
  export default axe;
  export function toHaveNoViolations(): {
    pass: boolean;
    message: () => string;
  };
}
