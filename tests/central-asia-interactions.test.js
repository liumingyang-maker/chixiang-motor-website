const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'central-asia-landing.js'), 'utf8');

test('exports deterministic Central Asia interaction helpers', () => {
  const context = {
    window: { ChixiangCentralAsiaData: { market: {}, products: [], applications: [], factoryImages: [] } },
    document: { readyState: 'loading', addEventListener() {} },
    console
  };
  vm.runInNewContext(source, context);
  assert.equal(typeof context.window.ChixiangCentralAsia.init, 'function');
  assert.equal(typeof context.window.ChixiangCentralAsia.buildWhatsAppUrl, 'function');
  assert.equal(typeof context.window.ChixiangCentralAsia.selectProduct, 'function');
  assert.equal(typeof context.window.ChixiangCentralAsia.pickActiveSection, 'function');
  assert.equal(typeof context.window.ChixiangCentralAsia.getProductDisclosureState, 'function');
  assert.equal(typeof context.window.ChixiangCentralAsia.shouldShowMobileCta, 'function');
});

test('chooses exactly one active navigation section', () => {
  const context = {
    window: { ChixiangCentralAsiaData: { market: {}, products: [], applications: [], factoryImages: [] } },
    document: { readyState: 'loading', addEventListener() {} },
    console
  };
  vm.runInNewContext(source, context);
  const active = context.window.ChixiangCentralAsia.pickActiveSection([
    { id: 'compare', top: -80, bottom: 180 },
    { id: 'products', top: 180, bottom: 900 }
  ], 120);
  assert.equal(active, 'products');
});

test('keeps only one mobile product disclosure open', () => {
  const context = {
    window: { ChixiangCentralAsiaData: { market: {}, products: [], applications: [], factoryImages: [] } },
    document: { readyState: 'loading', addEventListener() {} },
    console
  };
  vm.runInNewContext(source, context);
  const state = context.window.ChixiangCentralAsia.getProductDisclosureState(
    ['cg-air', 'cg-water', 'cg-heavy'],
    'cg-water'
  );
  assert.deepEqual(JSON.parse(JSON.stringify(state)), {
    'cg-air': false,
    'cg-water': true,
    'cg-heavy': false
  });
});

test('shows the mobile CTA only when every blocking state is clear', () => {
  const context = {
    window: { ChixiangCentralAsiaData: { market: {}, products: [], applications: [], factoryImages: [] } },
    document: { readyState: 'loading', addEventListener() {} },
    console
  };
  vm.runInNewContext(source, context);
  const show = context.window.ChixiangCentralAsia.shouldShowMobileCta;
  assert.equal(show({ passedHero: true }), true);
  for (const blocker of ['quoteVisible', 'footerVisible', 'faqOpen', 'fieldFocused', 'keyboardOpen', 'nearPageBottom']) {
    assert.equal(show({ passedHero: true, [blocker]: true }), false, blocker);
  }
});

test('builds contextual WhatsApp URLs from product and country', () => {
  const context = {
    window: {
      ChixiangCentralAsiaData: {
        market: { whatsappMessageTemplate: 'Рынок: {country}; серия: {product}' },
        products: [], applications: [], factoryImages: []
      }
    },
    document: { readyState: 'loading', addEventListener() {} },
    console
  };
  vm.runInNewContext(source, context);
  const url = context.window.ChixiangCentralAsia.buildWhatsAppUrl('CG Water', 'Казахстан');
  assert.match(url, /^https:\/\/wa\.me\/8619008225410\?text=/);
  assert.match(decodeURIComponent(url), /Казахстан/);
  assert.match(decodeURIComponent(url), /CG Water/);
});

test('contains mobile sticky CTA, gallery and accessibility guards', () => {
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /visualViewport/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /aria-current/);
  assert.match(source, /touchstart/);
  assert.match(source, /visibilitychange/);
  assert.doesNotMatch(source, /AW-16777656395/);
  assert.doesNotMatch(source, /\/api\/contact/);
});
