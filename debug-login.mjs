import { chromium } from 'playwright';

const BASE = 'https://munjiz.store';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function debugLogin() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);

    // Get the full page HTML to understand structure
    const html = await page.content();
    console.log('=== PAGE TITLE ===');
    console.log(await page.title());
    console.log('\n=== VISIBLE TEXT (first 1000 chars) ===');
    console.log((await page.locator('body').textContent())?.substring(0, 1000));

    // List all buttons
    const buttons = page.locator('button, a[role="button"]');
    const btnCount = await buttons.count();
    console.log(`\n=== BUTTONS (${btnCount}) ===`);
    for (let i = 0; i < btnCount; i++) {
      const text = await buttons.nth(i).textContent();
      const isVisible = await buttons.nth(i).isVisible();
      const tag = await buttons.nth(i).evaluate(el => el.tagName);
      console.log(`  [${i}] <${tag}> visible=${isVisible} text="${text?.trim()}"`);
    }

    // List all inputs
    const inputs = page.locator('input');
    const inpCount = await inputs.count();
    console.log(`\n=== INPUTS (${inpCount}) ===`);
    for (let i = 0; i < inpCount; i++) {
      const type = await inputs.nth(i).getAttribute('type');
      const placeholder = await inputs.nth(i).getAttribute('placeholder');
      const name = await inputs.nth(i).getAttribute('name');
      const isVisible = await inputs.nth(i).isVisible();
      console.log(`  [${i}] type="${type}" name="${name}" placeholder="${placeholder}" visible=${isVisible}`);
    }

    // Try to find forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    console.log(`\n=== FORMS (${formCount}) ===`);
    for (let i = 0; i < formCount; i++) {
      const action = await forms.nth(i).getAttribute('action');
      const method = await forms.nth(i).getAttribute('method');
      const formHtml = await forms.nth(i).innerHTML();
      console.log(`  [${i}] action="${action}" method="${method}"`);
      console.log(`  innerHTML preview: ${formHtml.substring(0, 300)}`);
    }

  } finally {
    await browser.close();
  }
}

debugLogin().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
