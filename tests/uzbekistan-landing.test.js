const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('publishes canonical Phase 5 Uzbekistan page', () => {
  const html=read('ru/uzbekistan/index.html');
  assert.match(html,/<html lang="ru-UZ"/); assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/150–250 см³/); assert.match(html,/водяное охлаждение/i); assert.match(html,/Один объём — не одна совместимость/i);
  assert.match(html,/Ads Launch не разрешён/); assert.match(html,/action="\/api\/contact"/); assert.match(html,/canonical" href="https:\/\/chixiangmotor\.com\/ru\/uzbekistan\//);
});

test('keeps legacy URL as noindex canonical compatibility route', () => {
  const html=read('ru/dvigateli-dlya-uzbekistana.html'); assert.match(html,/noindex,follow/); assert.match(html,/canonical" href="https:\/\/chixiangmotor\.com\/ru\/uzbekistan\//); assert.match(html,/url=\/ru\/uzbekistan\//);
});

test('registers canonical Uzbekistan URL only', () => { const sitemap=read('sitemap.xml'); assert.match(sitemap,/\/ru\/uzbekistan\//); assert.doesNotMatch(sitemap,/dvigateli-dlya-uzbekistana\.html/); });

test('references existing assets and accessible shared styles', () => {
  const html=read('ru/uzbekistan/index.html'); for(const m of html.matchAll(/(?:src|href)="\.\.\/\.\.\/([^"?#]+)(?:[?#][^"]*)?"/g)) assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
  const css=read('css/phase5-market-pages.css'); assert.match(css,/min-height:44px/); assert.match(css,/overflow-x:auto/); assert.match(css,/prefers-reduced-motion/); assert.match(css,/@media\(max-width:759px\)/);
});
