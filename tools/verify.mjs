// Full-site verification: console errors, overflow, shared components,
// broken internal links, missing local images.
// Usage: node tools/verify.mjs   (run after `npm run build:css`)
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = [
  'index.html', 'home2.html', 'about.html', 'program.html',
  'portfolio.html', 'mentors.html', 'apply.html', 'login.html', 'contact.html',
  'dashboard/founder-dashboard.html', 'dashboard/admin-dashboard.html',
];

const toFileUrl = (rel) =>
  'file:///' + join(ROOT, rel).replace(/\\/g, '/').replace(/ /g, '%20').replace(/&/g, '%26');

const browser = await chromium.launch();
const problems = [];

async function checkPage(rel) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push('pageerror: ' + String(e)));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (u.startsWith('file://')) errs.push('missing file: ' + decodeURIComponent(u));
  });

  await page.goto(toFileUrl(rel), { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const isDash = location.pathname.includes('/dashboard/');
    const nav = document.getElementById('navbar');
    const foot = document.getElementById('footer');
    const anchors = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const imgs = [...document.querySelectorAll('img[src]')].map((i) => i.getAttribute('src'));
    return {
      hasNavbar: isDash ? 'n/a' : !!(nav && nav.innerHTML.trim().length > 50),
      hasFooter: !!(foot && foot.innerHTML.trim().length > 50),
      overflow1440: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      anchors, imgs,
      title: document.title,
      h1s: document.querySelectorAll('h1').length,
    };
  });

  // mobile overflow
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(400);
  const overflow375 = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );

  // resolve links + images against the file system
  const pageDir = dirname(join(ROOT, rel));
  const brokenLinks = [];
  const badAnchors = [];
  for (const href of info.anchors) {
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href === '#') continue;
    const [pathPart, hash] = href.split('#');
    if (pathPart === '') {
      if (hash && !/^(\/|section-)/.test(hash) && hash !== 'main-content') {
        // same-page element anchor
        const exists = await page.evaluate((h) => !!document.getElementById(h), hash);
        if (!exists) badAnchors.push(rel + ' → #' + hash);
      }
      continue;
    }
    const target = resolve(pageDir, decodeURIComponent(pathPart.split('?')[0]));
    if (!existsSync(target)) brokenLinks.push(`${rel} → ${href}`);
    else if (hash && target.endsWith('.html')) {
      const t = readFileSync(target, 'utf8');
      if (!t.includes(`id="${hash}"`)) badAnchors.push(`${rel} → ${href}`);
    }
  }
  const brokenImgs = [];
  for (const src of info.imgs) {
    if (!src || src.startsWith('http') || src.startsWith('data:')) {
      if (src && src.startsWith('http')) brokenImgs.push(`${rel} → remote ${src}`);
      continue;
    }
    const target = resolve(pageDir, decodeURIComponent(src));
    if (!existsSync(target)) brokenImgs.push(`${rel} → ${src}`);
  }

  const realErrs = errs.filter((e) => !e.includes('favicon'));
  if (realErrs.length) problems.push(`\n[${rel}] console/network errors:\n  - ` + [...new Set(realErrs)].join('\n  - '));
  if (info.hasNavbar === false) problems.push(`[${rel}] navbar not injected`);
  if (info.hasFooter === false) problems.push(`[${rel}] footer not injected`);
  if (info.overflow1440) problems.push(`[${rel}] horizontal overflow at 1440px`);
  if (overflow375) problems.push(`[${rel}] horizontal overflow at 375px`);
  if (brokenLinks.length) problems.push(`[${rel}] broken links:\n  - ` + brokenLinks.join('\n  - '));
  if (badAnchors.length) problems.push(`[${rel}] anchors without targets:\n  - ` + [...new Set(badAnchors)].join('\n  - '));
  if (brokenImgs.length) problems.push(`[${rel}] broken images:\n  - ` + brokenImgs.join('\n  - '));
  if (info.h1s !== 1) problems.push(`[${rel}] expected exactly 1 <h1>, found ${info.h1s}`);

  await page.close();
  console.log(
    `checked ${rel.padEnd(36)} nav:${info.hasNavbar} foot:${info.hasFooter} ` +
    `ovf:${info.overflow1440 || overflow375 ? 'YES' : 'no'} errs:${realErrs.length} ` +
    `links:${brokenLinks.length} imgs:${brokenImgs.length} h1:${info.h1s}`
  );
}

for (const p of PAGES) {
  if (!existsSync(join(ROOT, p))) {
    problems.push(`[${p}] FILE MISSING`);
    console.log(`MISSING ${p}`);
    continue;
  }
  await checkPage(p);
}

await browser.close();
if (problems.length) {
  console.log('\n================ PROBLEMS ================');
  console.log(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('\nALL CHECKS PASSED');
}
