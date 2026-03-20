import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/AFU|African Farming Union/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 10000 });
  });

  test('admin login redirects to admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@afu.org');
    await page.fill('input[type="password"], input[name="password"]', 'AFUadmin2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 15000 });
    await expect(page.url()).toContain('/admin');
  });

  test('farmer login redirects to member dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'farmer@afu.org');
    await page.fill('input[type="password"], input[name="password"]', 'AFUfarmer2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await expect(page.url()).toContain('/dashboard');
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.url()).toContain('/login');
  });
});
