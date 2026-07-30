import { chromium } from 'playwright';

const BASE = 'https://munjiz.store';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'AdminTest@2026!';
const TEST_ORDER_NUMBER = 'AM-MS5FHIPQ-CK1G';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function debugOrderModal() {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  CONSOLE ERROR:', msg.text().substring(0, 300));
  });

  // Listen for API responses
  page.on('response', response => {
    if (response.url().includes('/api/orders')) {
      console.log(`  API: ${response.status()} ${response.url().substring(0, 100)}`);
    }
  });

  try {
    // Login
    console.log('Logging in...');
    await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(1000);

    // Switch to password mode
    const switchBtn = page.getByRole('button', { name: /كلمة المرور|password/i });
    await switchBtn.click();
    await sleep(1000);

    // Fill
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASS);
    await sleep(300);

    // Submit
    const submitBtn = page.getByRole('button', { name: /تسجيل الدخول|Sign in|Login/i }).first();
    await Promise.all([
      page.waitForURL('**/services**', { timeout: 20000 }).catch(() => {}),
      submitBtn.click(),
    ]);
    await sleep(2000);
    console.log('Login URL:', page.url());

    // Go to admin orders
    await page.goto(`${BASE}/en/admin/orders`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    console.log('Orders URL:', page.url());

    // Wait for orders to load
    await sleep(2000);

    // Search for the test order
    const searchInput = page.locator('input[placeholder*="رقم الطلب"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(TEST_ORDER_NUMBER);
      await sleep(2000);
    }

    // Count rows visible
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    console.log(`Rows in table: ${rowCount}`);

    if (rowCount > 0) {
      // Get the first row's text
      const firstRow = rows.first();
      console.log('First row text:', (await firstRow.textContent())?.substring(0, 200));

      // Find the Eye button
      const eyeBtn = firstRow.locator('button').last();
      const eyeHtml = await eyeBtn.innerHTML();
      console.log(`Eye button inner HTML (first 100): ${eyeHtml.substring(0, 100)}`);

      // Click it directly via JavaScript
      console.log('Clicking Eye button...');
      await eyeBtn.click();
      await sleep(2000);

      // Check for modal
      const modals = page.locator('[role="dialog"]');
      const modalCount = await modals.count();
      console.log(`Modals found: ${modalCount}`);

      if (modalCount > 0) {
        const modalText = await modals.first().textContent();
        console.log('Modal text:', modalText?.substring(0, 500));
      } else {
        console.log('No modal found after clicking Eye button');
        // Try clicking via dispatchEvent
        console.log('Trying dispatchEvent approach...');
        await page.evaluate(() => {
          const eyes = document.querySelectorAll('svg.lucide-eye');
          if (eyes.length > 0) {
            const btn = eyes[0].closest('button');
            if (btn) {
              btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
          }
        });
        await sleep(2000);

        const modals2 = page.locator('[role="dialog"]');
        console.log(`Modals after dispatchEvent: ${await modals2.count()}`);
        if (await modals2.count() > 0) {
          console.log('Modal text:', (await modals2.first().textContent())?.substring(0, 500));
        }
      }
    }

  } finally {
    await browser.close();
  }
}

debugOrderModal().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
