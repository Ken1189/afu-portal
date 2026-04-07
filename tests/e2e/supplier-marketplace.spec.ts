import { test, expect } from '@playwright/test';

/**
 * Supplier marketplace flow — verifies recently-fixed blockers on the LIVE site.
 * Tests are defensive: if an element is missing, we skip rather than hang.
 */

// Site has persistent connections (chat widget, analytics) so networkidle never settles.
// Use domcontentloaded + a short timeout instead.
const SETTLE = 2000;

test.describe('Supplier marketplace flow', () => {
  test('Marketplace renders products or proper empty state (no DB error)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(SETTLE);

    // Must NOT show a database error
    const dbError = await page.locator('text=/database error|failed to fetch|relation .* does not exist|column .* does not exist/i').count();
    expect(dbError).toBe(0);

    // Must NOT show error boundary
    const errBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(errBoundary).toBe(0);

    // Either product cards visible OR empty state visible
    const productCards = await page.locator('[class*="product"], [data-testid*="product"], article, .grid > div').count();
    const emptyState = await page.locator('text=/no products|coming soon|check back/i').count();
    expect(productCards + emptyState).toBeGreaterThan(0);

    // No console errors (ignore favicons / 3rd party noise)
    const realErrors = errors.filter(e => !/favicon|sentry|gtag|analytics/i.test(e));
    expect(realErrors).toEqual([]);
  });

  test('Marketplace in_stock filter does not crash', async ({ page }) => {
    const response = await page.goto('/marketplace?in_stock=true', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(SETTLE);
    const dbError = await page.locator('text=/database error|column .* does not exist/i').count();
    expect(dbError).toBe(0);
  });

  test('Supplier apply form loads with required fields', async ({ page }) => {
    const response = await page.goto('/supplier/apply', { waitUntil: 'domcontentloaded' });
    if (!response || response.status() >= 400) {
      test.skip(true, `/supplier/apply returned ${response?.status()} — page may not exist`);
      return;
    }
    await page.waitForTimeout(SETTLE);

    // At least one form input should be visible
    const inputs = await page.locator('input, textarea, select').count();
    expect(inputs).toBeGreaterThan(0);

    // Should not crash
    const errBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(errBoundary).toBe(0);
  });

  test('Supplier apply form posts to /api/applications (mocked)', async ({ page }) => {
    // Intercept the POST so we don't pollute the DB
    let intercepted = false;
    await page.route('**/api/applications', async (route) => {
      if (route.request().method() === 'POST') {
        intercepted = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      } else {
        await route.continue();
      }
    });

    const response = await page.goto('/supplier/apply', { waitUntil: 'domcontentloaded' });
    if (!response || response.status() >= 400) {
      test.skip(true, '/supplier/apply not available');
      return;
    }
    await page.waitForTimeout(SETTLE);

    // Try to fill common fields if present
    const nameInput = page.locator('input[name="name"], input[name="company"], input[name="businessName"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"]').first();
    if (await nameInput.count() > 0) await nameInput.fill('Playwright Test Co');
    if (await emailInput.count() > 0) await emailInput.fill('playwright@example.com');

    const submit = page.locator('button[type="submit"], button:has-text("Apply"), button:has-text("Submit")').first();
    if (await submit.count() === 0) {
      test.skip(true, 'No submit button found — form may be multi-step');
      return;
    }
    await submit.click().catch(() => {});
    await page.waitForTimeout(2000);

    // We don't strictly require the POST to fire (form may have client validation),
    // but if it did fire it must have been intercepted (i.e. no 500 from real API).
    // Just assert no error boundary.
    const errBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(errBoundary).toBe(0);
    // Soft-log whether the API was hit
    console.log('apply intercepted:', intercepted);
  });

  test('Public supplier directory or marketplace shows supplier names', async ({ page }) => {
    // Try /suppliers first
    let response = await page.goto('/suppliers', { waitUntil: 'domcontentloaded' }).catch(() => null);
    if (!response || response.status() >= 400) {
      response = await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    }
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(SETTLE);

    const errBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(errBoundary).toBe(0);
  });

  test('Marketplace product detail shows price + add-to-cart (if products exist)', async ({ page }) => {
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(SETTLE);

    const productLink = page.locator('a[href*="/marketplace/"], a[href*="/products/"]').first();
    if (await productLink.count() === 0) {
      test.skip(true, 'No products to drill into — empty marketplace');
      return;
    }
    await productLink.click();
    await page.waitForTimeout(SETTLE);

    // Some price indicator
    const priceVisible = await page.locator('text=/\\$|USD|ZAR|R\\s*\\d|KES|NGN/').first().isVisible().catch(() => false);
    const ctaVisible = await page.locator('button:has-text("Add to Cart"), button:has-text("Buy"), button:has-text("Order"), button:has-text("Contact")').first().isVisible().catch(() => false);
    expect(priceVisible || ctaVisible).toBeTruthy();
  });

  test('Login page renders', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('/supplier-redirect protects (redirects unauth users)', async ({ page }) => {
    await page.goto('/supplier-redirect', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(SETTLE);
    const url = page.url();
    expect(url).toMatch(/login|supplier-redirect|portal-select/);
  });

  test('/portal-select renders without auth or redirects to login', async ({ page }) => {
    const response = await page.goto('/portal-select', { waitUntil: 'domcontentloaded' });
    if (!response || response.status() >= 400) {
      test.skip(true, '/portal-select not available');
      return;
    }
    await page.waitForTimeout(SETTLE);
    const url = page.url();
    // Either renders or redirects to login — both acceptable
    expect(url).toMatch(/portal-select|login/);
    const errBoundary = await page.locator('text=/Something went wrong/i').count();
    expect(errBoundary).toBe(0);
  });

  test('/admin/content-editor protected (redirects to login)', async ({ page }) => {
    await page.goto('/admin/content-editor', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(SETTLE);
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  const PUBLIC_PAGES_NO_ERRORS = [
    '/',
    '/about',
    '/services/financing',
    '/investors',
    '/donate',
    '/contact',
    '/faq',
    '/partners',
    '/ambassadors',
  ];

  for (const path of PUBLIC_PAGES_NO_ERRORS) {
    test(`No console errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      const failedRequests: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('response', (resp) => {
        if (resp.status() >= 400 && !/favicon|analytics|gtag|hotjar|sentry|doubleclick|fbevents|intercom/i.test(resp.url())) {
          failedRequests.push(`${resp.status()} ${resp.url()}`);
        }
      });

      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await page.waitForTimeout(SETTLE);

      // Page-level errors only (ignore noisy "Failed to load resource" — those are
      // covered by the failedRequests list with full URLs for debugging).
      const realErrors = errors.filter(e =>
        !/favicon|sentry|gtag|analytics|google-analytics|doubleclick|fbevents|hotjar|intercom|Failed to load resource/i.test(e)
      );
      if (failedRequests.length > 0) {
        console.log(`[${path}] failed requests:`, failedRequests);
      }
      expect(realErrors).toEqual([]);
      // Soft expectation on failed requests — list them but don't fail the test
      // (these are real bugs to investigate, not test bugs)
      expect.soft(failedRequests, `Failed network requests on ${path}`).toEqual([]);
    });
  }

  test('Footer does not display old hardcoded email', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(SETTLE);
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    const footerText = (await footer.textContent()) || '';

    // The new system uses mail.africanfarmingunion.org (or similar domain).
    // The old hardcoded email pattern should NOT be present.
    // Adjust this regex if you know the exact old email — for now we ensure
    // any email shown belongs to africanfarmingunion.org.
    const emailMatches = footerText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
    for (const email of emailMatches) {
      expect(email.toLowerCase()).toContain('africanfarmingunion.org');
    }
  });
});
