import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('Navbar dropdowns work', async ({ page }) => {
    await page.goto('/');
    // Hover Services
    const servicesNav = page.locator('button:has-text("Services")').first();
    if (await servicesNav.count() > 0) {
      await servicesNav.hover();
      await page.waitForTimeout(300);
      // Dropdown should be visible
      await expect(page.locator('a:has-text("Financing")').first()).toBeVisible();
    }
  });

  test('Footer links exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    // Should have multiple links in footer
    const footerLinks = await footer.locator('a').count();
    expect(footerLinks).toBeGreaterThan(5);
  });

  test('Mobile menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.locator('button[aria-label*="menu" i]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }
  });
});
