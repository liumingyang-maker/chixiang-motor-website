const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const rowAnchors = [
  'cg-air-125', 'cg-air-150', 'cg-air-175', 'cg-air-200', 'cg-air-250',
  'cg-water-150sb', 'cg-water-175sb', 'cg-water-200sb', 'cg-water-250sb'
];

const legacyAnchors = [
  'cg-air-cooled', 'cg-water-cooled', 'cg-balance-shaft', 'tsunami', 'hw-water', 'auto-clutch'
];

const approvedSpecs = [
  ['CG125', '124 cc', '56.5 × 49.5 mm'],
  ['CG150', '149 cc', '62 × 49.5 mm'],
  ['CG175', '174 cc', '62 × 57.5 mm'],
  ['CG200', '197 cc', '63.5 × 62.2 mm'],
  ['CG250', '229.5 cc', '67 × 65 mm'],
  ['CG150SB', '149.5 cc', '62 × 49.5 mm'],
  ['CG175SB', '173.6 cc', '62 × 57.5 mm'],
  ['CG200SB', '197 cc', '63.5 × 62.2 mm'],
  ['CG250SB', '246.3 cc', '70 × 64 mm']
];

test('nine model row anchors exist exactly once with matching quick links', () => {
  const html = read('en/cg-engine.html');
  for (const id of rowAnchors) {
    const idCount = (html.match(new RegExp(`id="${id}"`, 'g')) || []).length;
    const hrefCount = (html.match(new RegExp(`href="#${id}"`, 'g')) || []).length;
    assert.equal(idCount, 1, `id ${id}`);
    assert.equal(hrefCount, 1, `href ${id}`);
    assert.match(html, new RegExp(`<tr id="${id}"><th scope="row">`));
  }
});

test('CG150 and CG150SB stay on separate series anchors', () => {
  const html = read('en/cg-engine.html');
  assert.ok(html.includes('id="cg-air-150"'));
  assert.ok(html.includes('id="cg-water-150sb"'));
  assert.ok(!html.includes('id="cg150"'));
  assert.ok(html.indexOf('id="cg-air-150"') < html.indexOf('id="cg-water-150sb"'));
});

test('legacy anchors and water procurement note remain', () => {
  const html = read('en/cg-engine.html');
  for (const id of legacyAnchors) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  assert.ok(html.includes('data-cg-water-procurement'));
  assert.match(html, /Reverse gear is not a universal standard feature/i);
  assert.match(html, /exact model and order/i);
  assert.match(html, /No built-in reverse/);
});

test('approved parameter cells are unchanged and water gears stay blank', () => {
  const html = read('en/cg-engine.html');
  for (const [code, actual, bore] of approvedSpecs) {
    assert.ok(html.includes(`>${code}</th>`), code);
    assert.ok(html.includes(`>${actual}</td>`), `${code} actual`);
    assert.ok(html.includes(bore), `${code} bore`);
  }
  const waterRows = (html.match(/<tr id="cg-water-[^"]+">[\s\S]*?<\/tr>/g) || []);
  assert.equal(waterRows.length, 4);
  for (const row of waterRows) {
    assert.match(row, /<td>—<\/td><\/tr>$/);
  }
});

test('model quick links use real anchors without aria-current', () => {
  const html = read('en/cg-engine.html');
  assert.ok(html.includes('aria-label="Choose CG air-cooled engine model"'));
  assert.ok(html.includes('aria-label="Choose CG water-cooled engine model"'));
  assert.ok(html.includes('class="model-quick-links"'));
  const navBlocks = html.match(/<nav class="model-quick-links"[\s\S]*?<\/nav>/g) || [];
  assert.equal(navBlocks.length, 2);
  for (const block of navBlocks) {
    assert.ok(!block.includes('aria-current'));
    assert.ok(!/href="[^"]*javascript:/i.test(block));
    const hrefs = block.match(/href="#([^"]+)"/g) || [];
    assert.ok(hrefs.length >= 4);
  }
});

test('non-English CG family pages keep zero model row anchors', () => {
  for (const file of [
    'es/motor-cg.html',
    'pt/motor-cg.html',
    'ru/dvigatel-cg.html',
    'ar/cg-engine.html'
  ]) {
    const html = read(file);
    for (const id of rowAnchors) {
      assert.ok(!html.includes(`id="${id}"`), `${file} should not include ${id}`);
    }
    assert.ok(!html.includes('model-quick-links'), file);
    assert.ok(html.includes('id="cg-air-cooled"'), file);
  }
});

test('CB and horizontal owner tables have no row anchors from CG feature', () => {
  for (const file of [
    'en/cb-engine.html',
    'en/horizontal-engine.html',
    'en/engine-parts.html'
  ]) {
    const html = read(file);
    assert.ok(!html.includes('model-quick-links'), file);
    for (const id of rowAnchors) {
      assert.ok(!html.includes(`id="${id}"`), file);
    }
  }
});
