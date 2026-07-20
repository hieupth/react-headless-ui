import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config.
 *
 * Smoke-tests the example Next.js app (the consumer of @hieupth/reui).
 * The webServer boots the example dev app; tests live in ./e2e (co-located).
 *
 * Requires the package to be built (dist/) so Next can resolve the workspace
 * dependency: run `pnpm build` first, or `pnpm test:e2e` after a build.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Boots the example Next.js app (the consumer of @hieupth/reui).
    // In a standard environment `next dev` works directly. In restricted
    // sandboxes where `next dev` cannot enumerate network interfaces, build
    // the static export (`pnpm --filter example build`) and serve `example/out`
    // with any static server pointed at port 3000 instead.
    command: 'pnpm --filter example dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
