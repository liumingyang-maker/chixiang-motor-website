const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function loadMarket(file) {
  const context = { window: { ChixiangLatamProducts: { products: {}, factoryImages: [], referencedAssets: [] } } };
  vm.runInNewContext(read(file), context);
  return context.window.ChixiangLatamMarket;
}

test('publishes independent SEO shells for Peru and Colombia', () => {
  const expectations = [
    ['peru', 'es-PE', 'https://chixiangmotor.com/es/peru/', 'Motores CG 150/200 cc para motos y trimotos en Perú | Chixiang Motor'],
    ['colombia', 'es-CO', 'https://chixiangmotor.com/es/colombia/', 'Motores CG 125/150 cc de reemplazo en Colombia | Chixiang Motor']
  ];

  for (const [market, lang, canonical, title] of expectations) {
    const page = `es/${market}/index.html`;
    assert.ok(fs.existsSync(path.join(root, page)), `${page} must exist`);
    const html = read(page);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, new RegExp(`<title>${title.replace(/[|]/g, '\\|')}</title>`));
    assert.match(html, new RegExp(`rel="canonical" href="${canonical.replace(/[/.]/g, '\\$&')}"`));
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(html, /\.\.\/\.\.\/css\/latam-cg-landing\.css/);
    assert.match(html, /\.\.\/\.\.\/js\/latam-cg-products\.js/);
    assert.match(html, /\.\.\/\.\.\/js\/latam-cg-landing\.js/);
    assert.match(html, /<form[^>]+id="latamQuoteForm"[^>]+action="\/api\/contact"/);
  }
});

test('keeps market selection and verified product order in data modules', () => {
  const peru = loadMarket('js/latam-cg-peru-data.js');
  const colombia = loadMarket('js/latam-cg-colombia-data.js');

  assert.equal(peru.market.key, 'peru');
  assert.equal(peru.market.defaultCountry, 'Perú');
  assert.equal(peru.market.sourceForm, 'es_peru_cg_landing');
  assert.deepEqual(Array.from(peru.productOrder), ['cg150', 'cg200', 'cargo']);
  assert.equal(colombia.market.key, 'colombia');
  assert.equal(colombia.market.defaultCountry, 'Colombia');
  assert.equal(colombia.market.sourceForm, 'es_colombia_cg_landing');
  assert.deepEqual(Array.from(colombia.productOrder), ['cg125', 'cg150', 'replacement']);
});

test('uses only cc copy and existing local engine and factory assets', () => {
  const context = { window: {} };
  vm.runInNewContext(read('js/latam-cg-products.js'), context);
  const shared = context.window.ChixiangLatamProducts;
  assert.ok(shared.referencedAssets.length >= 12);
  for (const asset of shared.referencedAssets) {
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
  assert.doesNotMatch(JSON.stringify(shared), /cm3|cm³/i);
});

test('keeps required wholesale fields and deferred sitemap behavior', () => {
  for (const market of ['peru', 'colombia']) {
    const html = read(`es/${market}/index.html`);
    for (const field of ['name', 'contact', 'country', 'application', 'displacement', 'quantity', 'vehicle', 'engine_code', 'email', 'requirements', 'market', 'source_form']) {
      assert.match(html, new RegExp(`name="${field}"`), `${market}: ${field}`);
    }
  }
  assert.doesNotMatch(read('sitemap.xml'), /https:\/\/chixiangmotor\.com\/es\/(peru|colombia)\//);
});

test('limits the sticky quote CTA to the mobile breakpoint', () => {
  const css = read('css/latam-cg-landing.css');
  assert.match(css, /\.latam-mobile-cta\s*\{[^}]*display:none;/);
  assert.match(css, /@media \(max-width:767px\)[\s\S]*\.latam-mobile-cta\s*\{[^}]*display:inline-flex;/);
});
