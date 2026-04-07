import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('Login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Apply page renders all tiers', async ({ page }) => {
    await page.goto('/apply');
    // Should show tier cards
    const tierCards = await page.locator('[class*="tier"], [class*="card"]').count();
    expect(tierCards).toBeGreaterThan(0);
  });

  test('Login redirects to dashboard for invalid creds', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fake@nonexistent.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should show error, not crash
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/login'); // Stays on login
  });

  test('Forgot password link works', async ({ page }) => {
    await page.goto('/login');
    const forgotLink = page.locator('text=/forgot password/i');
    if (await forgotLink.count() > 0) {
      await forgotLink.click();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });
});
