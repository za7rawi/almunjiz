import { chromium } from 'playwright';

const BASE = 'https://munjiz.store';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test the public gateways endpoint
  console.log('=== Testing /api/gateways endpoint ===');
  const resp = await page.request.get(`${BASE}/api/gateways`);
  console.log(`Status: ${resp.status()}`);
  const text = await resp.text();
  console.log(`Body (first 500): ${text.substring(0, 500)}`);

  // Test on checkout page - check what URL it actually calls
  console.log('\n=== Checking checkout page network requests ===');
  const page2 = await browser.newPage();
  const requests = [];
  page2.on('request', req => {
    if (req.url().includes('gateways') || req.url().includes('checkout')) {
      console.log(`  REQUEST: ${req.method()} ${req.url().substring(0, 120)}`);
    }
  });
  page2.on('response', resp2 => {
    if (resp2.url().includes('gateways')) {
      console.log(`  RESPONSE: ${resp2.status()} ${resp2.url().substring(0, 120)}`);
    }
  });

  await page2.goto(`${BASE}/en/checkout?service=demo`, { waitUntil: 'networkidle', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

  // Check the page content
  const body = await page2.locator('body').textContent();
  console.log(`\nPage contains "tabby": ${body.toLowerCase().includes('tabby')}`);
  console.log(`Page contains "tamara": ${body.toLowerCase().includes('tamara')}`);
  console.log(`Page contains "تابي": ${body.includes('تابي')}`);
  console.log(`Page contains "تمارا": ${body.includes('تمارا')}`);

  // Check for any payment method section
  if (body.includes('طريقة الدفع') || body.includes('Payment Method')) {
    console.log('✅ Payment Method section found');
  } else {
    console.log('❌ No Payment Method section');
  }

  // Screenshot
  await page2.screenshot({ path: '/tmp/checkout2.png', fullPage: true });

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
