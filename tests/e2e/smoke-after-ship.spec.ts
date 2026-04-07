import { test, expect } from '@playwright/test';

const BASE = 'https://www.africanfarmingunion.org';
test.setTimeout(180000);

test('full smoke sweep', async ({ page }) => {
  const results: string[] = [];

  async function check(path: string, label: string) {
    const errs: string[] = [];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.on('console', (m: any) => { if (m.type() === 'error') errs.push(m.text().substring(0, 150)); });
    page.on('pageerror', (e: any) => errs.push('PE: ' + e.message.substring(0, 150)));
    try {
      const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      const status = res?.status() ?? 0;
      const imgs = await page.locator('img').evaluateAll((els: any[]) => els.map(e => ({ src: e.src.substring(0, 80), alt: (e.alt || '').substring(0, 50), ok: e.complete && e.naturalWidth > 0 })));
      const broken = imgs.filter(i => !i.ok && !i.src.startsWith('data:'));
      const real = errs.filter(e => !/favicon|google|gtag|sentry|analytics|chrome-ext|gmpx|maps|chunk-|hotjar|intercom/i.test(e));
      const text = await page.locator('body').innerText().catch(() => '');
      const ethiopia = text.includes('Ethiopia');
      const goats = imgs.filter(i => /goat/i.test(i.alt + i.src)).length;
      results.push(`${label} [${status}] imgs=${imgs.length} broken=${broken.length} errs=${real.length} eth=${ethiopia} goats=${goats}`);
      if (broken.length) results.push(`   BROKEN: ${broken.slice(0, 5).map(b => b.alt + ':' + b.src).join(' | ')}`);
      if (real.length) results.push(`   ERRORS: ${real.slice(0, 3).join(' | ')}`);
    } catch (e: any) {
      results.push(`${label} FAILED: ${e.message.substring(0, 100)}`);
    }
  }

  await check('/', 'HOMEPAGE');
  await check('/countries', 'COUNTRIES');
  await check('/farming/crops', 'CROPS');
  await check('/farming/livestock', 'LIVESTOCK');
  await check('/farming/forestry', 'FORESTRY');
  await check('/farming/game-farming', 'GAME-FARMING');
  await check('/about', 'ABOUT');
  await check('/marketplace', 'MARKETPLACE');
  await check('/investors', 'INVESTORS');
  await check('/contact', 'CONTACT');
  await check('/faq', 'FAQ');
  await check('/portal-select', 'PORTAL-SELECT(should404)');

  console.log('\n========== RESULTS ==========');
  for (const r of results) console.log(r);
  console.log('=============================\n');
});
