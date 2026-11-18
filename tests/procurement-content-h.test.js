const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('CG water block states reverse options positively', () => {
  for (const file of ['en/cg-engine.html']) {
    const html = read(file);
    assert.ok(html.includes('id="cg-water-cooled"'));
    assert.match(html, /Engineered for heavy-duty cargo tricycles/i);
    assert.match(html, /Built-in or external reverse-gear configurations/i);
    assert.ok(!/SB.*标配倒挡/i.test(html));
    assert.match(html, /Standard 5-speed forward transmission/i);
  }
});

test('homepage procurement fit publishes positive B2B GEO assertions', () => {
  const html = read('en/index.html');
  assert.match(html, /id="procurement-fit"/);
  assert.match(html, /Engine Supply for Global Importers, Distributors &amp; Assemblers/);
  assert.match(html, /Wholesale Orders &amp; Export Services/i);
  assert.match(html, /Standard complete-engine MOQ starts at 50 units/i);
  const h1s = html.match(/<h1\b/gi) || [];
  assert.equal(h1s.length, 1);
  assert.match(html, /<h1[^>]*>Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in Chongqing, China<\/h1>/i);
  assert.ok(!html.includes('file upload') && !html.includes('upload a photo'));
});

test('how-to-choose has a static selection table with disclaimer and live links', () => {
  const html = read('en/how-to-choose-motorcycle-engine-manufacturer-china.html');
  assert.ok(html.includes('id="starting-points"'));
  assert.match(html, /engineering selection matrix/i);
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
  assert.match(html, /OEM-Grade Parts/i);
});
