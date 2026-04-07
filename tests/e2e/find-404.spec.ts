import { test } from '@playwright/test';
test('find the 404 asset', async ({ page }) => {
  const fourOhFours: string[] = [];
  page.on('response', r => { if (r.status() === 404) fourOhFours.push(r.url()); });
  await page.goto('https://www.africanfarmingunion.org/admin/suppliers', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('404s found:', fourOhFours);
});
