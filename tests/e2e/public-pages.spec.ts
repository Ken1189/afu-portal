import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
  '/',
  '/about',
  '/services',
  '/services/financing',
  '/services/insurance',
  '/services/training',
  '/services/veterinary',
  '/services/inputs',
  '/services/legal-assistance',
  '/services/trade-finance',
  '/memberships',
  '/apply',
  '/login',
  '/contact',
  '/blog',
  '/faq',
  '/sponsor',
  '/donate',
  '/partners',
  '/jobs',
  '/marketplace',
  '/farming',
  '/farming/crops',
  '/farming/livestock',
  '/farming/forestry',
  '/farming/game-farming',
  '/countries',
  '/investors',
  '/ambassadors',
  '/carbon',
  '/exchange',
  '/newsletter',
];

for (const path of PUBLIC_PAGES) {
  test(`Public page loads: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for key elements
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();

    // Should NOT have an error boundary fallback showing
    const hasErrorBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(hasErrorBoundary).toBe(0);

    // Should NOT have circle of death (loading spinner stuck after 5s)
    await page.waitForTimeout(5000);
    const stuckSpinners = await page.locator('[class*="animate-spin"]').count();
    expect(stuckSpinners).toBeLessThan(2); // 0 or 1 (chat widget)

    // No console errors
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  });
}
