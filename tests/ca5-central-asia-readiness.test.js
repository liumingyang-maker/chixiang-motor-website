const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'ru', 'central-asia', 'index.html'), 'utf8');

test('Central Asia page exists and has correct canonical', () => {
  assert.ok(html.includes('<!doctype html>'), 'page exists');
  assert.ok(html.includes('<link rel="canonical" href="https://chixiangmotor.com/ru/central-asia/">'), 'canonical correct');
});

test('Google Tag loads exactly once', () => {
  const gtagScript = html.match(/googletagmanager\.com\/gtag\/js\?id=AW-16777656395/g);
  assert.strictEqual(gtagScript.length, 1, 'gtag.js script appears exactly once');
  const gtagConfig = html.match(/gtag\('config',\s*'AW-16777656395'\)/g);
  assert.strictEqual(gtagConfig.length, 1, 'gtag config appears exactly once');
});

test('form action is /api/contact with honeypot', () => {
  assert.ok(html.includes('action="/api/contact"'), 'form action correct');
  assert.ok(html.includes('name="website"'), 'honeypot field exists');
});

test('market and source_form hidden fields present', () => {
  assert.ok(html.includes('name="market" value="Central Asia 5"'), 'market field');
  assert.ok(html.includes('name="source_form" value="ca5_central_asia_landing"'), 'source_form field');
});

test('all five countries present including Turkmenistan in Russian', () => {
  assert.ok(html.includes('Казахстан'), 'Kazakhstan');
  assert.ok(html.includes('Узбекистан'), 'Uzbekistan');
  assert.ok(html.includes('Кыргызстан'), 'Kyrgyzstan');
  assert.ok(html.includes('Таджикистан'), 'Tajikistan');
  assert.ok(html.includes('Туркменистан'), 'Turkmenistan');
  const selectMatch = html.match(/<select[^>]*name="country"[^>]*>[\s\S]*?<\/select>/);
  assert.ok(selectMatch, 'country select exists');
  assert.ok(selectMatch[0].includes('Туркменистан'), 'Turkmenistan inside select element');
});

test('order thresholds 2/50/100/100 with combined-order explanation', () => {
  assert.ok(html.includes('от 2 двигателей'), 'sample threshold 2');
  assert.ok(html.includes('от 50 двигателей'), 'wholesale threshold 50');
  assert.ok(html.includes('от 100 двигателей суммарно'), 'mixed threshold 100');
  assert.ok(html.includes('OEM — от 100 двигателей'), 'OEM threshold 100');
  assert.ok(html.includes('по общему объёму заказа'), 'combined order explanation');
  assert.ok(html.includes('Разные модели можно объединять'), 'models can be combined');
});

test('sitelink anchors #series #compare #delivery #quote exist', () => {
  assert.ok(html.includes('id="series"'), '#series anchor');
  assert.ok(html.includes('id="compare"'), '#compare anchor');
  assert.ok(html.includes('id="delivery"'), '#delivery anchor');
  assert.ok(html.includes('id="quote"'), '#quote anchor');
});

test('page loads main.js and central-asia-landing.js', () => {
  assert.ok(html.includes('js/main.js'), 'main.js loaded');
  assert.ok(html.includes('central-asia-landing.js'), 'central-asia-landing.js loaded');
});

test('no unsupported claims or internal language', () => {
  const forbidden = ['самая низкая', 'лучшая цена', 'гарантия совместимости', 'немедленная доставка', 'первый в', 'NOT APPROVED', 'INPUT REQUIRED', 'Phase 5', 'Research only', 'Confidence', 'Native review'];
  const lower = html.toLowerCase();
  for (const term of forbidden) {
    assert.ok(!lower.includes(term.toLowerCase()), `forbidden term not found: ${term}`);
  }
});
