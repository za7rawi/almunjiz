import { chromium } from 'playwright';
const BASE = 'https://munjiz.store';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test Google redirect no longer shows "deleted client" error
  console.log('Testing Google OAuth redirect...');
  await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  const googleBtn = page.locator('button:has-text("Google")');
  await googleBtn.click();
  await new Promise(r => setTimeout(r, 3000));

  const url = page.url();
  console.log('Redirected to:', url.substring(0, 200));

  if (url.includes('deleted_client')) {
    console.log('❌ Still getting deleted_client error');
  } else if (url.includes('accounts.google.com')) {
    console.log('✅ Google OAuth is now at the sign-in page (not deleted_client error)');
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
