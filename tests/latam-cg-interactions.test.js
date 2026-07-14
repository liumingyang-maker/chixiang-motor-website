const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'latam-cg-landing.js'), 'utf8');

function apiFor(market) {
  const context = {
    window: { ChixiangLatamProducts: { products: {}, factoryImages: [] }, ChixiangLatamMarket: { market, productOrder: [], applications: [], faq: [] } },
    document: { readyState: 'loading', addEventListener() {} }
  };
  vm.runInNewContext(source, context);
  return context.window.ChixiangLatam;
}

test('exports deterministic landing interaction helpers', () => {
  const api = apiFor({ key: 'peru', defaultCountry: 'Perú', whatsappNumber: '8619008225410' });
  for (const name of ['init', 'buildWhatsAppUrl', 'pickActiveSection', 'getProductDisclosureState', 'shouldShowMobileCta']) {
    assert.equal(typeof api[name], 'function', name);
  }
});

test('uses one active section and one open product disclosure', () => {
  const api = apiFor({ key: 'peru', defaultCountry: 'Perú', whatsappNumber: '8619008225410' });
  assert.equal(api.pickActiveSection([{ id: 'compare', top: -80, bottom: 140 }, { id: 'products', top: 140, bottom: 900 }], 110), 'products');
  assert.deepEqual(JSON.parse(JSON.stringify(api.getProductDisclosureState(['cg125', 'cg150', 'replacement'], 'cg150'))), { cg125: false, cg150: true, replacement: false });
});

test('builds contextual WhatsApp URLs and hides CTA for blocking states', () => {
  const api = apiFor({ key: 'colombia', defaultCountry: 'Colombia', whatsappNumber: '8619008225410', whatsappMessageTemplate: 'Mercado: {market}; producto: {product}; uso: {application}; fuente: {source}' });
  const url = api.buildWhatsAppUrl({ product: 'CG150', application: 'Reparto', source: 'hero', utm_source: 'google' });
  assert.match(url, /^https:\/\/wa\.me\/8619008225410\?text=/);
  const decoded = decodeURIComponent(url);
  assert.match(decoded, /Colombia/);
  assert.match(decoded, /CG150/);
  assert.match(decoded, /Reparto/);
  assert.equal(api.shouldShowMobileCta({ passedHero: true }), true);
  for (const key of ['quoteVisible', 'footerVisible', 'faqOpen', 'fieldFocused', 'keyboardOpen', 'nearPageBottom']) {
    assert.equal(api.shouldShowMobileCta({ passedHero: true, [key]: true }), false, key);
  }
});

test('binds the country-specific replacement template to the photo CTA', () => {
  assert.match(source, /\[data-replacement-link\]/);
  assert.match(source, /replacementMessage/);
});

test('serializes purchase context into the existing form message before submission', () => {
  assert.match(source, /formValue\(form, 'requirements'\)/);
  assert.match(source, /formValue\(form, 'vehicle'\)/);
  assert.match(source, /formValue\(form, 'engine_code'\)/);
  assert.match(source, /serializeFormMessage/);
  assert.match(source, /name="message"/);
});
