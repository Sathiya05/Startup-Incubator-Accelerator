// One-time helper: downloads Google Fonts (latin subset) locally as woff2.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const cssPath = process.env.TEMP + '\\gf.css';
const css = readFileSync(cssPath, 'utf8');

const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)];
const out = [];
const seen = new Set();
for (const [, subset, block] of blocks) {
  if (subset !== 'latin') continue;
  const fam = block.match(/font-family:\s*'([^']+)'/)[1];
  const wght = block.match(/font-weight:\s*(\d+)/)[1];
  const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)[1];
  const slug = `${fam.replace(/ /g, '')}-${wght}.woff2`;
  if (seen.has(slug)) continue;
  seen.add(slug);
  execFileSync('curl.exe', ['-s', '-m', '30', '-A', UA, url, '-o', `assets/fonts/${slug}`], {
    stdio: 'ignore',
  });
  const size = existsSync(`assets/fonts/${slug}`) ? readFileSync(`assets/fonts/${slug}`).length : 0;
  console.log(`downloaded ${slug} (${Math.round(size / 1024)}KB)`);
  out.push(block.replace(url, `../assets/fonts/${slug}`));
}
mkdirSync('assets/fonts', { recursive: true });
writeFileSync('assets/fonts/fonts.css', out.join('\n'));
console.log(`wrote assets/fonts/fonts.css with ${out.length} faces`);
