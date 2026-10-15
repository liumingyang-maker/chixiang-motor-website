const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('CG water block states reverse is per model and order', () => {
  for (const file of ['en/cg-engine.html']) {
    const html = read(file);
    assert.ok(html.includes('id="cg-water-cooled"'));
    assert.match(html, /Reverse gear is not a universal standard feature/i);
    assert.match(html, /exact model and order/i);
    assert.ok(!/SB.*标配倒挡/i.test(html));
    assert.match(html, /No built-in reverse/); // HW Water boundary kept
  }
});

test('homepage procurement fit does not change H1 or invent supply', () => {
  const html = read('en/index.html');
  assert.match(html, /id="procurement-fit"/);
  assert.match(html, /Who We Supply/);
  assert.match(html, /Complete tricycle vehicles are not supplied/i);
  assert.match(html, /not open for wholesale vehicle orders/i);
  const h1s = html.match(/<h1\b/gi) || [];
  assert.equal(h1s.length, 1);
  assert.match(html, /<h1[^>]*>Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in China<\/h1>/i);
  assert.ok(!html.includes('file upload') && !html.includes('upload a photo'));
});

test('how-to-choose has a static selection table with disclaimer and live links', () => {
  const html = read('en/how-to-choose-motorcycle-engine-manufacturer-china.html');
  assert.ok(html.includes('id="starting-points"'));
  assert.match(html, /not a fitment or availability guarantee/i);
  assert.match(html, /<table class="specs-table">/);
  for (const href of [
    '/en/cg-engine#cg-air-cooled',
    '/en/cg-engine#cg-water-cooled',
    '/en/horizontal-engine#cx-models',
    '/en/ac320-atv-engine',
    '/en/engine-parts#parts-specifications',
  ]) {
    assert.ok(html.includes(`href="${href}"`), href);
  }
});

test('H/U content omits banned commercial claims', () => {
  for (const file of [
    'en/index.html',
    'en/cg-engine.html',
    'en/how-to-choose-motorcycle-engine-manufacturer-china.html',
  ]) {
    const html = read(file);
    for (const banned of ['Euro 5', '17kW', 'patented', 'will not overheat', 'in stock now']) {
      assert.ok(!html.includes(banned), `${file}: ${banned}`);
    }
  }
});


test('homepage product cards use owner pages, not tool detail queries', () => {
  const html = read('en/index.html');
  assert.ok(!html.includes('product-detail?series='));
  assert.ok(html.includes('href="/en/ac320-atv-engine"'));
  assert.ok(html.includes('href="/en/cg-engine#tsunami"') || html.includes('href="/en/cg-engine"'));
});

test('homepage parts card does not claim full stock', () => {
  const html = read('en/index.html');
  assert.ok(!html.includes('In Stock'));
  assert.ok(!html.includes('Full Range'));
  assert.match(html, /Confirm by model and order/i);
});
