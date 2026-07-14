const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pagePath = path.join(root, 'ru', 'central-asia', 'index.html');

test('publishes an independent Central Asia landing-page route', () => {
  assert.ok(fs.existsSync(pagePath), 'ru/central-asia/index.html must exist');
  const html = fs.readFileSync(pagePath, 'utf8');

  assert.match(html, /<html lang="ru"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Центральн(?:ая|ую) Ази/);
  assert.doesNotMatch(html, /для Узбекистана/i);
  assert.match(html, /rel="canonical" href="https:\/\/chixiangmotor\.com\/ru\/central-asia\/"/);
  assert.match(html, /<form[^>]+id="centralAsiaQuoteForm"[^>]+action="\/api\/contact"/);
  assert.match(html, /class="contact-form/);
  assert.match(html, /\.\.\/\.\.\/js\/main\.js/);
  assert.match(html, /\.\.\/\.\.\/js\/central-asia-data\.js/);
  assert.match(html, /\.\.\/\.\.\/js\/central-asia-landing\.js/);
  assert.match(html, /\.\.\/\.\.\/css\/central-asia-landing\.css/);
});

test('uses stable navigation anchors in the required order', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const ids = ['series', 'compare', 'products', 'delivery', 'process', 'faq', 'quote'];
  let previous = -1;
  for (const id of ids) {
    const index = html.indexOf(`id="${id}"`);
    assert.ok(index > previous, `${id} must exist after the previous section`);
    previous = index;
  }
  assert.match(html, /href="\/ru\/">Основной сайт<\/a>/);
  assert.match(html, /href="#delivery">Поставка<\/a>/);
  assert.match(html, /href="#factory">О заводе<\/a>/);
  assert.match(html, /id="factory"/);
});

test('provides procurement-focused form fields without a default country', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  for (const name of ['name', 'contact', 'country', 'product_interest', 'quantity', 'application', 'email', 'message']) {
    assert.match(html, new RegExp(`name="${name}"`), `${name} field is required in markup`);
  }
  assert.doesNotMatch(html, /name="country"[^>]+value="Узбекистан"/);
  assert.match(html, /name="email"[^>]*autocomplete="email"/);
  assert.doesNotMatch(html, /name="email"[^>]*required/);
});

test('defines one canonical market and product data source', () => {
  const source = read('js/central-asia-data.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const data = context.window.ChixiangCentralAsiaData;

  assert.ok(data);
  assert.equal(data.market.marketName, 'Центральная Азия');
  assert.equal(data.market.defaultCountry, '');
  assert.equal(data.market.indexable, true);
  assert.deepEqual(Array.from(data.products, item => item.slug), ['cg-air', 'cg-water', 'cg-heavy']);
  assert.deepEqual(Array.from(data.products, item => item.name), ['CG Air', 'CG Water', 'CG Heavy']);
  assert.equal(data.products[1].reverse, 'Опционально, встроенный');
  assert.equal(data.products[2].reverse, 'Без встроенного реверса');
  assert.match(data.market.whatsappMessageTemplate, /\{product\}/);
  assert.match(data.market.whatsappMessageTemplate, /\{country\}/);
});

test('uses cc consistently for Central Asia displacement copy', () => {
  const html = read('ru/central-asia/index.html');
  const source = read('js/central-asia-data.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);

  assert.doesNotMatch(html + source, /см³|cm3/i);
  assert.ok(
    context.window.ChixiangCentralAsiaData.products.every(product => /^\d+–\d+ cc$/.test(product.displacement)),
    'every product displacement must use the cc unit'
  );
});

test('references only existing local product and factory assets', () => {
  const source = read('js/central-asia-data.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const data = context.window.ChixiangCentralAsiaData;
  const assets = data.products.flatMap(product => Array.from(product.gallery));
  assets.push(...Array.from(data.factoryImages, item => item.src));
  assert.ok(assets.length >= 18);
  for (const asset of assets) {
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
});

test('defines responsive, accessible and overflow-safe page styles', () => {
  const css = read('css/central-asia-landing.css');
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /@media\s*\(min-width:\s*1200px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /scroll-margin-top/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /central-asia-hero-bg-v2\.png/);
  assert.match(css, /\.ca-button-primary\s*\{[^}]*color:\s*#fff/s);
  assert.match(css, /\.ca-button-primary:active/);
  assert.match(css, /\.ca-button-primary:disabled/);
  assert.match(css, /\.ca-hero-stage::after/);
});

test('composes transparent hero engines directly on the snow scene without an outer mask', () => {
  const css = read('css/central-asia-landing.css');
  const html = read('ru/central-asia/index.html');
  const data = read('js/central-asia-data.js');
  const script = read('js/central-asia-landing.js');

  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-air\.png'/);
  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-water\.png'/);
  assert.match(data, /heroImage:\s*'images\/central-asia-hero-products\/cg-heavy\.png'/);
  assert.match(script, /loading="eager" fetchpriority="high"/);
  assert.match(css, /\.ca-hero-product-image::before\s*\{[^}]*radial-gradient\(/s);
  assert.match(css, /\.ca-hero-product-image::after\s*\{[^}]*filter:\s*blur\(/s);
  assert.doesNotMatch(css, /\.ca-hero-stage\s*\{[^}]*(?:background|border|backdrop-filter):/s);
  assert.doesNotMatch(css, /filter:\s*url\("#ca-remove-white"\)/);
  assert.doesNotMatch(html, /<filter id="ca-remove-white"/);
  assert.doesNotMatch(css, /\.ca-hero-product-image\s*\{[^}]*isolation:\s*isolate/s);
});

test('registers the production URL in the sitemap', () => {
  assert.match(read('sitemap.xml'), /https:\/\/chixiangmotor\.com\/ru\/central-asia\//);
});
