import { test, expect } from '@playwright/test';

test.setTimeout(600000);

const BASE = 'https://www.africanfarmingunion.org';

const ADMIN_PATHS = [
  '/admin',
  '/admin/analytics',
  '/admin/reports',
  '/admin/map',
  '/admin/members',
  '/admin/applications',
  '/admin/farmers',
  '/admin/suppliers',
  '/admin/ambassadors',
  '/admin/investor-relations',
  '/admin/partners',
  '/admin/cooperatives',
  '/admin/kyc',
  '/admin/countries',
  '/admin/financial',
  '/admin/loans',
  '/admin/payments',
  '/admin/payouts',
  '/admin/subscriptions',
  '/admin/disputes',
  '/admin/trade-finance',
  '/admin/contracts',
  '/admin/wallet',
  '/admin/credit-scores',
  '/admin/sponsor-tiers',
  '/admin/farm-overview',
  '/admin/insurance',
  '/admin/carbon',
  '/admin/trading',
  '/admin/exchange',
  '/admin/exports',
  '/admin/warehouse',
  '/admin/programs',
  '/admin/crops',
  '/admin/livestock',
  '/admin/equipment',
  '/admin/training/catalog',
  '/admin/legal-services',
  '/admin/veterinary',
  '/admin/content-editor',
  '/admin/blog',
  '/admin/faq',
  '/admin/media',
  '/admin/testimonials',
  '/admin/announcements',
  '/admin/training',
  '/admin/legal',
  '/admin/research',
  '/admin/inbox',
  '/admin/messaging',
  '/admin/messaging/templates',
  '/admin/messaging/campaigns',
  '/admin/automations',
  '/admin/advertising',
  '/admin/advertising/review',
  '/admin/sponsor',
  '/admin/jobs',
  '/admin/settings',
  '/admin/users',
  '/admin/audit',
  '/admin/system',
  '/admin/compliance',
  '/admin/events',
  '/admin/blockchain',
  '/admin/run-migration',
  // Portal entry points
  '/investor',
  '/ambassador',
  '/supplier',
  '/warehouse',
  '/farm',
  // Farmer pages
  '/farm/profile',
  '/farm/carbon',
  '/farm/loans',
  '/farm/financing',
  '/farm/farms',
  '/farm/crops',
  '/farm/livestock',
  '/farm/journal',
  '/farm/orders',
  '/farm/training',
  // Marketplace
  '/marketplace',
  '/marketplace/dummy-product-id-12345',
  // Supplier pages
  '/supplier/billing',
  '/supplier/products',
  '/supplier/orders',
  '/supplier/sponsorship',
  '/supplier/profile',
];

const IGNORE_PATTERNS = [
  'favicon',
  'google',
  'gtag',
  'sentry',
  'analytics',
  'chrome-extension',
  'gmpx',
  'maps',
  'hotjar',
  'intercom',
  'doubleclick',
];

function shouldIgnore(text: string): boolean {
  const lower = text.toLowerCase();
  return IGNORE_PATTERNS.some((p) => lower.includes(p));
}

interface Result {
  path: string;
  status: number | null;
  finalUrl: string;
  redirectedToLogin: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  navError?: string;
}

test('admin sweep — all links resolve without crashing', async ({ browser }) => {
  const context = await browser.newContext();
  // Block heavy 3rd parties to speed up
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (
      url.includes('google-analytics') ||
      url.includes('googletagmanager') ||
      url.includes('gtag') ||
      url.includes('doubleclick') ||
      url.includes('hotjar') ||
      url.includes('intercom') ||
      url.includes('sentry.io')
    ) {
      return route.abort();
    }
    return route.continue();
  });

  const results: Result[] = [];

  for (const path of ADMIN_PATHS) {
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!shouldIgnore(text)) consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => {
      const text = err.message;
      if (!shouldIgnore(text)) pageErrors.push(text);
    });

    let status: number | null = null;
    let finalUrl = '';
    let navError: string | undefined;

    try {
      const response = await page.goto(BASE + path, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      status = response?.status() ?? null;
      finalUrl = page.url();
      // brief settle for client errors
      await page.waitForTimeout(300);
    } catch (e: any) {
      navError = e?.message || String(e);
      finalUrl = page.url();
    }

    const redirectedToLogin = /\/login/i.test(finalUrl);

    results.push({
      path,
      status,
      finalUrl,
      redirectedToLogin,
      consoleErrors,
      pageErrors,
      navError,
    });

    console.log(
      `[${status ?? 'ERR'}] ${path}${redirectedToLogin ? ' -> login' : ''}  ` +
        `console:${consoleErrors.length} page:${pageErrors.length}` +
        (navError ? ` NAV_ERR:${navError.slice(0, 60)}` : '')
    );

    await page.close();
  }

  // Summary
  const total = results.length;
  const okClean = results.filter(
    (r) => r.status === 200 && !r.redirectedToLogin && r.consoleErrors.length === 0 && r.pageErrors.length === 0 && !r.navError
  ).length;
  const redirected = results.filter((r) => r.redirectedToLogin).length;
  const notFound = results.filter((r) => r.status === 404).length;
  const crashed = results.filter((r) => (r.status != null && r.status >= 500) || r.navError).length;
  const withConsoleErrors = results.filter((r) => r.consoleErrors.length > 0);
  const withPageErrors = results.filter((r) => r.pageErrors.length > 0);

  // Top errors
  const allConsoleErrors: { path: string; error: string }[] = [];
  for (const r of results) {
    for (const e of r.consoleErrors) allConsoleErrors.push({ path: r.path, error: e });
  }
  const allPageErrors: { path: string; error: string }[] = [];
  for (const r of results) {
    for (const e of r.pageErrors) allPageErrors.push({ path: r.path, error: e });
  }

  console.log('\n================= RESULTS =================');
  console.log(`Total links tested:       ${total}`);
  console.log(`Fully OK (200, no err):   ${okClean}`);
  console.log(`Redirected to login:      ${redirected}`);
  console.log(`404:                      ${notFound}`);
  console.log(`500 or crashed:           ${crashed}`);
  console.log(`Pages w/ console errors:  ${withConsoleErrors.length}`);
  console.log(`Pages w/ page errors:     ${withPageErrors.length}`);
  console.log('');
  console.log('--- Top 10 console errors ---');
  allConsoleErrors.slice(0, 10).forEach((e, i) => {
    console.log(`${i + 1}. [${e.path}] ${e.error.slice(0, 200)}`);
  });
  console.log('');
  console.log('--- Top 10 page errors (JS crashes) ---');
  allPageErrors.slice(0, 10).forEach((e, i) => {
    console.log(`${i + 1}. [${e.path}] ${e.error.slice(0, 200)}`);
  });
  console.log('');
  console.log('--- 404 paths ---');
  results.filter((r) => r.status === 404).forEach((r) => console.log(`  ${r.path}`));
  console.log('');
  console.log('--- 500 / nav error paths ---');
  results
    .filter((r) => (r.status != null && r.status >= 500) || r.navError)
    .forEach((r) => console.log(`  [${r.status ?? 'NAV_ERR'}] ${r.path} ${r.navError ?? ''}`));
  console.log('===========================================\n');

  await context.close();
});
