import { chromium } from 'playwright';

const BASE = 'https://munjiz.store';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'AdminTest@2026!';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verifyGateways() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Check gateways API (no auth needed for admin gateways list? Let me check)
    console.log('=== Fetching gateways from API ===');
    const resp = await page.request.get(`${BASE}/api/admin/gateways`);
    console.log(`GET /api/admin/gateways -> ${resp.status()}`);
    if (resp.ok()) {
      const data = await resp.json();
      console.log(`Gateways count: ${data.data?.length || data.length || '?'}`);
      const gateways = data.data || data;
      if (Array.isArray(gateways)) {
        for (const gw of gateways) {
          console.log(`  ${gw.slug}: active=${gw.isActive}, env=${gw.environment}, name=${gw.displayNameEn}`);
        }
      }
    }

    // 2. Login as admin and check gateways admin page
    console.log('\n=== Admin Login & Gateways Page ===');
    await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(1000);
    await page.getByRole('button', { name: /كلمة المرور|password/i }).click();
    await sleep(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASS);
    await sleep(300);
    const submitBtn = page.getByRole('button', { name: /تسجيل الدخول|Sign in|Login/i }).first();
    await Promise.all([
      page.waitForURL('**/services**', { timeout: 20000 }).catch(() => {}),
      submitBtn.click(),
    ]);
    await sleep(2000);
    console.log('Login URL:', page.url());

    // 3. Go to admin gateways page
    await page.goto(`${BASE}/en/admin/gateways`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    console.log('Gateways page URL:', page.url());
    await page.screenshot({ path: '/tmp/gateways-page.png', fullPage: true });

    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('tabby') || bodyText.includes('تابي') || bodyText.includes('Tabby')) {
      console.log('✅ Tabby found on gateways page');
    } else {
      console.log('❌ Tabby NOT found on gateways page');
    }
    if (bodyText.includes('tamara') || bodyText.includes('تمارا') || bodyText.includes('Tamara')) {
      console.log('✅ Tamara found on gateways page');
    } else {
      console.log('❌ Tamara NOT found on gateways page');
    }

    // 4. Check checkout page
    console.log('\n=== Checkout Page ===');
    await page.goto(`${BASE}/en/checkout`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: '/tmp/checkout-page.png', fullPage: true });

    const checkoutText = await page.locator('body').textContent();
    if (checkoutText.toLowerCase().includes('tabby') || checkoutText.includes('تابي')) {
      console.log('✅ Tabby found on checkout page');
    } else {
      console.log('❌ Tabby NOT found on checkout page');
    }
    if (checkoutText.toLowerCase().includes('tamara') || checkoutText.includes('تمارا')) {
      console.log('✅ Tamara found on checkout page');
    } else {
      console.log('❌ Tamara NOT found on checkout page');
    }

  } finally {
    await browser.close();
  }
}

verifyGateways().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
