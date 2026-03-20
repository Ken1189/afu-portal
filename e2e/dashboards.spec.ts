import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@afu.org');
    await page.fill('input[type="password"], input[name="password"]', 'AFUadmin2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 15000 });
  });

  test('admin dashboard loads with stats', async ({ page }) => {
    await expect(page.locator('text=/members|users|revenue|overview/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('admin sidebar navigation works', async ({ page }) => {
    const navLinks = page.locator('aside a, aside button').filter({ hasText: /members|applications|loans/i });
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('admin can navigate to members page', async ({ page }) => {
    await page.click('a[href*="members"]');
    await page.waitForURL('**/members**', { timeout: 10000 });
    await expect(page.url()).toContain('/members');
  });
});

test.describe('Member Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'farmer@afu.org');
    await page.fill('input[type="password"], input[name="password"]', 'AFUfarmer2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  test('member dashboard loads', async ({ page }) => {
    await expect(page.locator('text=/overview|portal|dashboard/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('member can navigate to financing', async ({ page }) => {
    await page.click('a[href*="financing"]');
    await page.waitForURL('**/financing**', { timeout: 10000 });
    await expect(page.url()).toContain('/financing');
  });

  test('member can navigate to farmer portal', async ({ page }) => {
    await page.click('a[href*="/farm"]');
    await page.waitForURL('**/farm**', { timeout: 10000 });
    await expect(page.url()).toContain('/farm');
  });

  test('sign out works', async ({ page }) => {
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.url()).toContain('/login');
  });
});
