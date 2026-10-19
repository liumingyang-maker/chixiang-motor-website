const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('homepage keeps procurement-fit and adds business presence entry', () => {
  const html = read('en/index.html');
  assert.match(html, /id="procurement-fit"/);
  assert.match(html, /id="business-presence"/);
  assert.match(html, /Manufacturing, Quality/);
  assert.match(html, /href="\/en\/about#business-operations"/);
  assert.match(html, /href="\/en\/about#quality-credentials"/);
  assert.match(html, /href="\/en\/about#industry-exhibitions"/);
  const h1s = html.match(/<h1\b/gi) || [];
  assert.equal(h1s.length, 1);
});

test('about exposes four X2 anchors with three-entity and evidence copy', () => {
  const html = read('en/about.html');
  for (const id of [
    'business-operations',
    'quality-credentials',
    'industry-exhibitions',
    'public-records',
  ]) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  assert.match(html, /重庆驰翔摩托车制造有限公司/);
  assert.match(html, /重庆德谐科技有限公司/);
  assert.match(html, /重庆驰德贸易有限公司/);
  assert.ok(!/wholly-owned/i.test(html));
  assert.ok(!/renamed Dexie/i.test(html));
  assert.match(html, /2T85/);
  assert.match(html, /CN221406869U/);
  assert.match(html, /mopei8\.com/);
});

test('X2 does not invent future exhibitions or blanket certification', () => {
  const html = read('en/about.html');
  assert.ok(!html.includes('92nd') || !/history|participated/i.test(html.split('92nd')[1] || ''));
  assert.ok(!/all models CCC/i.test(html));
  assert.ok(!/Euro 5 certified/i.test(html));
  assert.match(html, /applicable engine models/i);
});



test('X2 cards use uniform container and single-column mobile stack class', () => {
  const about = read('en/about.html');
  assert.match(about, /data-credential-cards/);
  assert.match(about, /features-grid x2-stack/);
  assert.match(about, /reference translation pending legal-name verification/);
  const home = read('en/index.html');
  assert.match(home, /id="business-presence"[\s\S]*features-grid x2-stack/);
  const css = read('css/style.css');
  assert.match(css, /\.x2-stack/);
  assert.match(css, /grid-template-columns:\s*1fr/);
});
