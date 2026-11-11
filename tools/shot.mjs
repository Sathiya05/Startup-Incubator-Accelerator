// Screenshot + console-error helper.
// Usage: node tools/shot.mjs <url> <out.png> [width] [height] [full|clip] [dark] [rtl]
import { chromium } from 'playwright';

const [url, out, w = '1440', h = '900', mode = 'clip', theme = 'light', dir = 'ltr'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: parseInt(w, 10), height: parseInt(h, 10) },
  colorScheme: theme === 'dark' ? 'dark' : 'light',
});
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('[console] ' + m.text());
});
page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e)));
page.on('requestfailed', (r) => errors.push('[requestfailed] ' + r.url() + ' :: ' + (r.failure()?.errorText || '')));

if (theme === 'dark' || dir === 'rtl') {
  await page.addInitScript(
    ([t, d]) => {
      localStorage.setItem('lf-theme', JSON.stringify(t));
      localStorage.setItem('lf-rtl', JSON.stringify(d));
    },
    [theme, dir]
  );
}

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(700);

// Horizontal overflow check
const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));

await page.screenshot({ path: out, fullPage: mode === 'full' });
console.log(`saved ${out} | overflow: ${overflow.scrollW} > ${overflow.clientW} ? ${overflow.scrollW > overflow.clientW + 1}`);
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
else console.log('no console errors');
await browser.close();
