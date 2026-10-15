const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('catalog horizontal air-cooled range matches approved 110-150 family', () => {
  const en = read('en/products.html');
  assert.ok(en.includes('110–150cc') || en.includes('110-150cc'));
  assert.ok(!en.includes('100–125cc'));
  assert.ok(!en.includes('100-125cc'));
});

test('catalog omits absolute and unapproved commercial claims', () => {
  for (const file of ['en/products.html']) {
    const html = read(file);
    for (const banned of [
      'no overheating',
      'Euro 5',
      'ultra-quiet',
      'Universal parts',
      'no stalling',
      '17kW',
      '28N·m',
      'Honda Compatible',
    ]) {
      assert.ok(!html.includes(banned), `${file}: unexpected claim ${banned}`);
    }
  }
});

test('AC320 catalog CTA does not pretend to open a specs page', () => {
  const html = read('en/products.html');
  const i = html.indexOf('AC320');
  assert.ok(i !== -1);
  const window = html.slice(i, i + 900);
  assert.ok(window.includes('Consult Specs') || window.includes('/en/contact'));
  assert.ok(!window.includes('17kW'));
});

test('family pages no longer link product-detail from detailed-specs CTAs', () => {
  for (const file of [
    'en/cg-engine.html',
    'en/cb-engine.html',
    'en/engine-parts.html',
    'en/horizontal-engine.html',
  ]) {
    const html = read(file);
    assert.ok(!html.includes('product-detail?series='), `${file}: still links product-detail`);
  }
});

test('family pages expose stable specification anchors', () => {
  const expectations = {
    'en/cg-engine.html': [
      'cg-air-cooled',
      'cg-water-cooled',
      'cg-balance-shaft',
      'tsunami',
      'hw-water',
      'auto-clutch',
    ],
    'en/cb-engine.html': ['cb-specifications'],
    'en/engine-parts.html': ['parts-specifications'],
    'en/horizontal-engine.html': ['cx-models'],
  };
  for (const [file, ids] of Object.entries(expectations)) {
    const html = read(file);
    for (const id of ids) {
      assert.ok(html.includes(`id="${id}"`), `${file}: missing #${id}`);
    }
  }
});

test('product-detail hold messages cover vehicle programs and omit legacy CX measurements', () => {
  const html = read('en/product-detail.html');
  assert.ok(html.includes("'motorcycles':"));
  assert.ok(html.includes("'tricycles':"));
  assert.ok(html.includes('Complete motorcycles and CKD/SKD'));
  assert.ok(html.includes('Complete tricycle vehicles are not currently supplied'));
  for (const banned of ['CX152FMH-5B', "'106.7'", '52.4 x 49.5', '123.67']) {
    assert.ok(!html.includes(banned), `legacy value present: ${banned}`);
  }
});
