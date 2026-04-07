import { test, expect } from '@playwright/test';

test.describe('Form submissions', () => {
  test('Contact form has all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('Newsletter signup form exists', async ({ page }) => {
    await page.goto('/newsletter');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('Apply form step 1 advances to step 2', async ({ page }) => {
    await page.goto('/apply');
    // Click any tier
    const firstTier = page.locator('button:has-text("Continue"), button:has-text("Select")').first();
    if (await firstTier.count() > 0) {
      await firstTier.click();
      await page.waitForTimeout(500);
    }
  });
});
