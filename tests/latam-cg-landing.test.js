const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function loadMarket(file) { const context = { window: { ChixiangLatamProducts: { products: {}, factoryImages: [], referencedAssets: [] } } }; vm.runInNewContext(read(file), context); return context.window.ChixiangLatamMarket; }

test('publishes independent SEO shells for Peru and Colombia', () => {
  const expectations = [
    ['peru','es-PE','https://chixiangmotor.com/es/peru/','Motores CG 150 y CG 200 para distribuidores en Perú | Chixiang Motor'],
    ['colombia','es-CO','https://chixiangmotor.com/es/colombia/','Repuestos y calificación de motores para Colombia | Chixiang Motor']
  ];
  for (const [market,lang,canonical,title] of expectations) {
    const html=read(`es/${market}/index.html`);
    assert.match(html,new RegExp(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
    assert.match(html,new RegExp(`<title>${title.replace(/[|]/g,'\\|')}</title>`));
    assert.match(html,new RegExp(`rel="canonical" href="${canonical.replace(/[/.]/g,'\\$&')}"`));
    assert.match(html,/<meta name="robots" content="index,follow">/);
    assert.match(html,/\.\.\/\.\.\/css\/latam-cg-landing\.css/);
    assert.match(html,/<form[^>]+id="latamQuoteForm"[^>]+action="\/api\/contact"/);
    if(market==='peru') assert.match(html,/googletagmanager/);
    else { assert.doesNotMatch(html,/googletagmanager/); assert.match(html,/data-ads-priority="seo-only"/); assert.match(html,/demanda de motores completos no está verificada/i); }
  }
});

test('keeps corrected country product order in data modules', () => {
  const peru=loadMarket('js/latam-cg-peru-data.js'); const colombia=loadMarket('js/latam-cg-colombia-data.js');
  assert.equal(peru.market.defaultCountry,'Perú');
  assert.deepEqual(Array.from(peru.productOrder),['cg200','cg150','spares','cargo']);
  assert.equal(colombia.market.defaultCountry,'Colombia');
  assert.deepEqual(Array.from(colombia.productOrder),['spares','replacement']);
  assert.deepEqual(Array.from(colombia.comparisonFields).map(f=>f.key),['name','displacement','cooling','bestFor','reverse']);
});

test('uses existing local assets and no cm3 copy in shared products', () => {
  const context={window:{}}; vm.runInNewContext(read('js/latam-cg-products.js'),context); const shared=context.window.ChixiangLatamProducts;
  assert.ok(shared.referencedAssets.length>=12);
  for(const asset of shared.referencedAssets) assert.ok(fs.existsSync(path.join(root,asset)),asset);
  assert.doesNotMatch(JSON.stringify(shared),/cm3/i);
});

test('keeps wholesale qualification fields and sitemap routes', () => {
  for(const market of ['peru','colombia']) { const html=read(`es/${market}/index.html`); for(const field of ['name','contact','country','application','displacement','quantity','vehicle','engine_code','email','requirements','market','source_form']) assert.match(html,new RegExp(`name="${field}"`),`${market}: ${field}`); }
  const sitemap=read('sitemap.xml'); assert.match(sitemap,/\/es\/peru\//); assert.match(sitemap,/\/es\/colombia\//);
});

test('limits sticky quote CTA to mobile breakpoint', () => {
  const css=read('css/latam-cg-landing.css'); assert.match(css,/\.latam-mobile-cta\s*\{[^}]*display:none;/); assert.match(css,/@media \(max-width:767px\)[\s\S]*\.latam-mobile-cta\s*\{[^}]*display:inline-flex;/); assert.match(css,/has-latam-mobile-cta/);
});
