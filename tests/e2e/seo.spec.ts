import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  const pages = ['/', '/about', '/services', '/apply', '/contact'];

  for (const path of pages) {
    test(`${path} has metadata`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length || 0).toBeGreaterThan(20);

      // Should have OG tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
    });
  }
});
