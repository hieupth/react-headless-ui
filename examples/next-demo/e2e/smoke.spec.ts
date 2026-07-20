import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * Smoke tests for the example app.
 *
 * Per .guide/TESTING.md (LAW-TEST-002/003): deterministic, and fail on
 * uncaught JavaScript exceptions. Next.js dev-mode React warnings are
 * filtered; only genuine runtime errors fail the suite.
 */

const DEV_NOISE = [
  'Download the React DevTools',
  'does not support',
  '[Fast Refresh]',
  'hydrat',
];

function isRealError(text: string): boolean {
  return !DEV_NOISE.some((noise) => text.toLowerCase().includes(noise.toLowerCase()));
}

async function captureErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (isRealError(text)) errors.push(`console.error: ${text}`);
    }
  });

  return errors;
}

test.afterEach(async ({ page }, testInfo) => {
  // surface any captured errors for failing assertions
  void testInfo;
  void page;
});

test('home page lists component categories', async ({ page }) => {
  const errors = await captureErrors(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buttons' }).first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('buttons page renders interactive buttons', async ({ page }) => {
  const errors = await captureErrors(page);
  await page.goto('/buttons');
  await expect(page.getByRole('button').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('navigation from home to a category page works', async ({ page }) => {
  const errors = await captureErrors(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Buttons' }).first().click();
  await expect(page).toHaveURL(/\/buttons/);
  await expect(page.getByRole('button').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
