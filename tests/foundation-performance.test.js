const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const size = file => fs.statSync(path.join(root, file)).size;

const optimizedAssets = [
  'images/central-asia-hero-bg-v2.webp',
  'images/central-asia-hero-products/cg-air.webp',
  'images/central-asia-hero-products/cg-water.webp',
  'images/central-asia-hero-products/cg-heavy.webp'
];

test('ships a bounded WebP hero set while retaining source PNG files', () => {
  for (const file of optimizedAssets) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} must exist`);
  }

  assert.ok(size(optimizedAssets[0]) <= 350_000, 'hero background must be at most 350 KB');
  for (const file of optimizedAssets.slice(1)) {
    assert.ok(size(file) <= 250_000, `${file} must be at most 250 KB`);
  }
  assert.ok(
    optimizedAssets.reduce((total, file) => total + size(file), 0) <= 1_000_000,
    'combined hero transfer must be at most 1 MB'
  );

  assert.ok(fs.existsSync(path.join(root, 'images/central-asia-hero-bg-v2.png')));
  assert.ok(fs.existsSync(path.join(root, 'images/central-asia-hero-products/cg-air.png')));
});

test('Peru preloads the optimized scene and keeps its compact WebP engine set', () => {
  const html = read('es/peru/index.html');
  const css = read('css/latam-cg-landing.css');
  const context = { window: {} };
  vm.runInNewContext(read('js/latam-cg-products.js'), context);
  vm.runInNewContext(read('js/latam-cg-peru-data.js'), context);
  const market = context.window.ChixiangLatamMarket;
  const products = context.window.ChixiangLatamProducts.products;
  const heroImages = market.productOrder.slice(0, 3).map(slug => products[slug].image);

  assert.match(html, /<link rel="preload" as="image" href="\.\.\/\.\.\/images\/central-asia-hero-bg-v2\.webp" fetchpriority="high">/);
  assert.match(css, /central-asia-hero-bg-v2\.webp/);
  assert.doesNotMatch(css, /central-asia-hero-bg-v2\.png/);
  assert.ok(heroImages.every(file => file.endsWith('.webp')));
  assert.ok(heroImages.reduce((total, file) => total + size(file), 0) <= 200_000);
});

test('hero rendering reserves dimensions and prioritizes one lead engine', () => {
  const script = read('js/latam-cg-landing.js');

  assert.match(script, /width="1254" height="1254" decoding="async"/);
  assert.match(script, /imageIndex === 1 \? 'high' : 'low'/);
  assert.match(script, /fetchpriority="' \+ priority \+ '"/);
});

test('Central Asia shares the optimized hero derivatives', () => {
  const css = read('css/central-asia-landing.css');
  const data = read('js/central-asia-data.js');

  assert.match(css, /central-asia-hero-bg-v2\.webp/);
  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-air\.webp'/);
  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-water\.webp'/);
  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-heavy\.webp'/);
});
