import { chromium } from 'playwright';

const BASE = 'https://munjiz.store';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'Admin@Munjiz2026!';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function debugLoginFlow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', msg => console.log('  BROWSER:', msg.type(), msg.text().substring(0, 200)));

  try {
    console.log('Step 1: Navigate to login...');
    await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: '/tmp/s1-initial.png', fullPage: true });

    console.log('\nStep 2: Click "تسجيل الدخول بكلمة المرور"...');
    const switchBtn = page.locator('button:has-text("كلمة المرور")');
    console.log('  Switch button found:', await switchBtn.count());
    if (await switchBtn.count() > 0) {
      await switchBtn.click();
      await sleep(1500);
      console.log('  After click URL:', page.url());
      await page.screenshot({ path: '/tmp/s2-after-switch.png', fullPage: true });

      // Check what's visible now
      const inputs = page.locator('input');
      const inpCount = await inputs.count();
      console.log(`\n  Inputs after switch (${inpCount}):`);
      for (let i = 0; i < inpCount; i++) {
        const type = await inputs.nth(i).getAttribute('type');
        const placeholder = await inputs.nth(i).getAttribute('placeholder');
        const isVisible = await inputs.nth(i).isVisible();
        console.log(`    [${i}] type="${type}" placeholder="${placeholder}" visible=${isVisible}`);
      }

      const buttons = page.locator('button');
      const btnCount = await buttons.count();
      console.log(`\n  Buttons after switch (${btnCount}):`);
      for (let i = 0; i < btnCount; i++) {
        const text = await buttons.nth(i).textContent();
        const isVisible = await buttons.nth(i).isVisible();
        if (isVisible) console.log(`    [${i}] "${text?.trim()}"`);
      }
    }

    console.log('\nStep 3: Fill login form...');
    // Fill email
    const emailInput = page.locator('input[type="email"]').first();
    const emailVisible = await emailInput.isVisible();
    console.log('  Email input visible:', emailVisible);
    if (emailVisible) {
      await emailInput.fill(ADMIN_EMAIL);
      console.log('  Filled email');
    }

    await sleep(300);

    // Fill password
    const passInput = page.locator('input[type="password"]').first();
    const passVisible = await passInput.isVisible();
    console.log('  Password input visible:', passVisible);
    if (passVisible) {
      await passInput.fill(ADMIN_PASS);
      console.log('  Filled password');
    }

    await sleep(300);

    // Find submit button
    const submitBtn = page.locator('button[type="submit"]').first();
    const submitVisible = await submitBtn.isVisible();
    console.log('  Submit button visible:', submitVisible);
    console.log('  Submit button text:', await submitBtn.textContent());

    // Check the form action
    const forms = page.locator('form');
    const formCount = await forms.count();
    console.log(`\n  Forms (${formCount}):`);
    for (let i = 0; i < formCount; i++) {
      const action = await forms.nth(i).getAttribute('action');
      const method = await forms.nth(i).getAttribute('method');
      console.log(`    [${i}] action="${action}" method="${method}"`);
    }

    console.log('\nStep 4: Submit login...');
    if (await submitBtn.count() > 0) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
        submitBtn.click(),
      ]);
      await sleep(2000);
      console.log('  After submit URL:', page.url());
      await page.screenshot({ path: '/tmp/s3-after-submit.png', fullPage: true });

      // Check for error messages
      const body = await page.locator('body').textContent();
      if (body.includes('خطأ') || body.includes('error') || body.includes('فشل')) {
        const errorTexts = [];
        const errEls = page.locator('[class*="error"], [class*="alert"], [role="alert"]');
        const errCount = await errEls.count();
        for (let i = 0; i < errCount; i++) {
          errorTexts.push(await errEls.nth(i).textContent());
        }
        console.log('  Error elements:', errorTexts);
      }
    }

  } finally {
    await browser.close();
  }
}

debugLoginFlow().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
