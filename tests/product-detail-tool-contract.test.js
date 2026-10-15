const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function stripScripts(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
}

function visibleText(html) {
  return stripScripts(html)
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

test('product-detail static HTML does not impersonate a CG air-cooled product', () => {
  const html = read('en/product-detail.html');
  const body = stripScripts(html);
  assert.match(body, /<h1\b[^>]*>Motorcycle Engine Product Series<\/h1>/i);
  assert.doesNotMatch(body, /<h1\b[^>]*>CG Air-Cooled Engine Series<\/h1>/i);
  assert.match(body, /series-selector-panel/);
  assert.match(body, /href="\/en\/cg-engine"/);
  assert.match(body, /href="\/en\/cb-engine"/);
  assert.match(body, /href="\/en\/horizontal-engine"/);
  assert.match(body, /href="\/en\/engine-parts"/);
});

test('product-detail raw HTML and inline script omit banned promotional claims', () => {
  const html = read('en/product-detail.html');
  for (const banned of [
    'Euro 5',
    'Euro5',
    'Patented',
    'patented',
    'ultra-quiet',
    'Universal parts',
    'universal parts',
    "data['cg-air']",
  ]) {
    assert.ok(!html.includes(banned), `unexpected banned phrase: ${banned}`);
  }
});

test('product-detail script does not default to cg-air and handles hold/unknown series', () => {
  const html = read('en/product-detail.html');
  assert.ok(html.includes("params.get('series')"), 'series param read missing');
  assert.ok(!html.includes("params.get('series') || 'cg-air'"), 'must not default to cg-air');
  assert.ok(html.includes('holdMessages'), 'hold-series guard missing');
  assert.ok(html.includes('Invalid product selection'), 'unknown-series guard missing');
});

test('catalog pages no longer link to product-detail query URLs', () => {
  for (const file of [
    'en/products.html',
    'es/products.html',
    'pt/products.html',
    'ru/products.html',
    'ar/products.html',
  ]) {
    const html = read(file);
    assert.ok(
      !html.includes('product-detail?series='),
      `${file}: still links product-detail query URLs`
    );
    assert.ok(
      !html.includes('/en/product-detail'),
      `${file}: still links /en/product-detail`
    );
  }
});

test('catalog pages point series cards at language owner pages', () => {
  const expectations = {
    'en/products.html': ['/en/cg-engine', '/en/cb-engine', '/en/horizontal-engine', '/en/engine-parts'],
    'es/products.html': ['/es/motor-cg', '/es/motor-cb', '/es/motor-horizontal', '/es/repuestos-motor'],
    'pt/products.html': ['/pt/motor-cg', '/pt/motor-cb', '/pt/motor-horizontal', '/pt/pecas-de-motor'],
    'ru/products.html': ['/ru/dvigatel-cg', '/ru/dvigatel-cb', '/ru/gorizontalnyj-dvigatel', '/ru/zapchasti-dvigatelya'],
    'ar/products.html': ['/ar/cg-engine', '/ar/cb-engine', '/ar/horizontal-engine', '/ar/engine-parts'],
  };
  for (const [file, links] of Object.entries(expectations)) {
    const html = read(file);
    for (const href of links) {
      assert.ok(html.includes(`href="${href}"`), `${file}: missing owner link ${href}`);
    }
  }
});

test('visible no-JS text on product-detail describes a selector, not one product', () => {
  const text = visibleText(read('en/product-detail.html'));
  assert.match(text, /Choose an engine family/i);
  assert.match(text, /CG engines/i);
  assert.ok(!/^[\s\S]*CG Air-Cooled Engine Series/.test(text.split('Related Products')[0] || ''));
});
