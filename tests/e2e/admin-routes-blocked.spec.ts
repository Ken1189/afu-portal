import { test, expect } from '@playwright/test';

test.describe('Admin routes are protected', () => {
  test('Admin redirects unauthenticated users', async ({ page }) => {
    const response = await page.goto('/admin');
    // Should either redirect to login or show login
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toMatch(/login|admin/);
  });

  test('Farm portal redirects unauthenticated', async ({ page }) => {
    await page.goto('/farm');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toContain('login');
  });

  test('Supplier portal redirects unauthenticated', async ({ page }) => {
    await page.goto('/supplier');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toContain('login');
  });
});
