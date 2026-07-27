const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const scriptPath = path.join(
  __dirname,
  '..',
  'js',
  'russia-horizontal-landing.js'
);

test('exports deterministic horizontal-engine interaction helpers', () => {
  assert.ok(fs.existsSync(scriptPath), 'interaction module must exist');
  const api = require(scriptPath);
  assert.equal(typeof api.normalizeModels, 'function');
  assert.equal(typeof api.syncModels, 'function');
  assert.equal(typeof api.selectModel, 'function');
  assert.equal(typeof api.buildWhatsAppUrl, 'function');
  assert.equal(typeof api.init, 'function');
});

test('normalizes unique mixed-model selections', () => {
  const { normalizeModels } = require(scriptPath);
  assert.equal(
    normalizeModels(['152FMH', '154FMI', '152FMH', '', ' 153FMI ']),
    '152FMH, 154FMI, 153FMI'
  );
});

test('builds a qualified Russian wholesale WhatsApp URL', () => {
  const { buildWhatsAppUrl } = require(scriptPath);
  const url = buildWhatsAppUrl('154FMI');
  assert.match(url, /^https:\/\/wa\.me\/8619008225410\?text=/);

  const message = decodeURIComponent(url.split('?text=')[1]);
  assert.match(message, /оптов/i);
  assert.match(message, /154FMI/);
  assert.match(message, /MOQ 50/i);
  assert.match(message, /компани/i);
  assert.match(message, /количеств/i);
});

test('selectModel checks the requested model and serializes the form value', () => {
  const { selectModel } = require(scriptPath);
  const first = { value: '152FMH', checked: true };
  const second = { value: '154FMI', checked: false };
  const hidden = { value: '' };
  const form = {
    querySelector: selector => selector === '[name="product"]' ? hidden : null,
    querySelectorAll: selector => selector === '[data-model-checkbox]' ? [first, second] : []
  };

  assert.equal(selectModel(form, '154FMI'), true);
  assert.equal(second.checked, true);
  assert.equal(hidden.value, '152FMH, 154FMI');
});

test('selectModel leaves form unchanged for an unknown model', () => {
  const { selectModel } = require(scriptPath);
  const checkbox = { value: '152FMH', checked: false };
  const hidden = { value: '' };
  const form = {
    querySelector: selector => selector === '[name="product"]' ? hidden : null,
    querySelectorAll: () => [checkbox]
  };

  assert.equal(selectModel(form, 'UNKNOWN'), false);
  assert.equal(checkbox.checked, false);
  assert.equal(hidden.value, '');
});

test('page interaction module does not submit or report conversions itself', () => {
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /\bgtag\s*\(/);
  assert.doesNotMatch(source, /\bym\s*\(/);
});

test('page loads interaction validation before shared form and analytics handlers', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'ru', 'gorizontalnyj-dvigatel.html'),
    'utf8'
  );
  const pageScript = html.indexOf('../js/russia-horizontal-landing.js');
  const yandexScript = html.indexOf('../js/yandex-metrica.js');
  const mainScript = html.indexOf('../js/main.js');

  assert.ok(pageScript > -1);
  assert.ok(yandexScript > pageScript);
  assert.ok(mainScript > yandexScript);
});
