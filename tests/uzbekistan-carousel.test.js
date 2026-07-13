const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'uzbekistan-landing.js'), 'utf8');

test('exports the carousel initializer for deterministic testing', () => {
  const context = {
    window: {},
    document: {
      readyState: 'loading',
      querySelectorAll() { return []; },
      addEventListener() {}
    },
    console
  };

  vm.runInNewContext(source, context);
  assert.equal(typeof context.window.ChixiangUzLanding.initCarousels, 'function');
});

test('contains lifecycle, interaction, and accessibility guards', () => {
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /mouseenter/);
  assert.match(source, /focusin/);
  assert.match(source, /touchstart/);
  assert.match(source, /addEventListener\('error'/);
  assert.match(source, /aria-hidden/);
  assert.match(source, /6000/);
});

test('exposes no duplicate analytics or form submission code', () => {
  assert.doesNotMatch(source, /AW-16777656395/);
  assert.doesNotMatch(source, /\/api\/contact/);
  assert.doesNotMatch(source, /gtag\s*\(/);
});
