// Ad-hoc interaction checks for the shared navbar.
import { chromium } from 'playwright';

const BASE = 'file:///C:/Users/santhosh/Downloads/Startup%20Incubator%20%26%20Accelerator/';
const browser = await chromium.launch();
const errors = [];

async function page(width, height) {
  const p = await browser.newPage({ viewport: { width, height } });
  p.on('console', (m) => m.type() === 'error' && errors.push('[console] ' + m.text()));
  p.on('pageerror', (e) => errors.push('[pageerror] ' + String(e)));
  await p.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  return p;
}

// 1. Tablet (820px): only logo + hamburger visible
const tablet = await page(820, 900);
const visible = await tablet.evaluate(() => {
  const vis = (el) => !!el && el.offsetParent !== null && getComputedStyle(el).display !== 'none';
  const nav = document.querySelector('nav[aria-label="Primary navigation"]');
  const actions = nav ? nav.nextElementSibling : null;
  const burger = document.querySelector('#lf-drawer-open');
  return {
    desktopNavVisible: vis(nav),
    desktopActionsVisible: vis(actions),
    burgerVisible: vis(burger),
    brandVisible: vis(document.querySelector('#navbar a')),
  };
});
console.log('TABLET 820px visible:', JSON.stringify(visible));

// 2. Mobile (375px): open drawer, screenshot
const mobile = await page(375, 780);
await mobile.click('#lf-drawer-open');
await mobile.waitForTimeout(500);
const drawerState = await mobile.evaluate(() => ({
  open: document.querySelector('#lf-drawer').classList.contains('is-open'),
  bodyLocked: document.body.classList.contains('no-scroll'),
  burgerLabel: document.querySelector('#lf-drawer-open').getAttribute('aria-label'),
  links: document.querySelectorAll('#lf-drawer a[href]').length,
}));
console.log('MOBILE drawer:', JSON.stringify(drawerState));
await mobile.screenshot({ path: process.env.TEMP + '\\lf-drawer.png' });

// expand Home submenu
await mobile.click('#lf-drawer [aria-controls="lf-mobile-home"]');
await mobile.waitForTimeout(400);
const subOpen = await mobile.evaluate(() =>
  document.querySelector('#lf-mobile-home').classList.contains('is-open'));
console.log('MOBILE home submenu open:', subOpen);
await mobile.screenshot({ path: process.env.TEMP + '\\lf-drawer-sub.png' });

// Escape closes
await mobile.keyboard.press('Escape');
await mobile.waitForTimeout(400);
console.log('MOBILE after Escape open:', await mobile.evaluate(() =>
  document.querySelector('#lf-drawer').classList.contains('is-open')));

// 3. Desktop dropdown works + theme toggle
const desk = await page(1440, 900);
await desk.click('[data-dropdown-trigger]');
await desk.waitForTimeout(300);
console.log('DESKTOP dropdown open:', await desk.evaluate(() =>
  document.querySelector('[data-dropdown-menu]').classList.contains('is-open')));
await desk.click('body', { position: { x: 700, y: 600 } });
await desk.waitForTimeout(250);
console.log('DESKTOP dropdown after outside click:', await desk.evaluate(() =>
  document.querySelector('[data-dropdown-menu]').classList.contains('is-open')));

await desk.click('.icon-btn[data-theme-toggle]');
await desk.waitForTimeout(600);
const theme = await desk.evaluate(() => ({
  dark: document.documentElement.classList.contains('dark'),
  stored: localStorage.getItem('lf-theme'),
}));
console.log('THEME toggle:', JSON.stringify(theme));
await desk.screenshot({ path: process.env.TEMP + '\\lf-dark.png' });

await desk.click('[data-rtl-toggle]');
await desk.waitForTimeout(500);
console.log('RTL dir:', await desk.evaluate(() => document.documentElement.dir),
  'stored:', await desk.evaluate(() => localStorage.getItem('lf-rtl')));
await desk.screenshot({ path: process.env.TEMP + '\\lf-rtl.png' });

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
