const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const whatsappSendTo = 'AW-16777656395/bovKCKOx088cEMvwmsA-';

function boot(gtag) {
  const listeners = new Map();
  const document = {
    readyState: 'loading',
    body: { style: {} },
    documentElement: { lang: 'en' },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() { return {}; },
    head: { appendChild() {} }
  };
  const window = {
    location: { search: '', pathname: '/', href: 'https://example.com/' },
    addEventListener() {},
    innerHeight: 900
  };
  if (gtag !== undefined) window.gtag = gtag;

  vm.runInNewContext(source, {
    document,
    window,
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout
  });
  const readyHandlers = listeners.get('DOMContentLoaded') || [];
  assert.equal(readyHandlers.length, 1);
  readyHandlers[0]();
  return listeners.get('click') || [];
}

function whatsappTarget() {
  return {
    closest(selector) {
      assert.equal(selector, 'a[href*="wa.me/"]');
      return { href: 'https://wa.me/8619008225410' };
    }
  };
}

test('reports one WhatsApp conversion without blocking navigation', () => {
  const calls = [];
  const clickHandlers = boot((...args) => calls.push(args));
  assert.equal(clickHandlers.length, 1, 'expected one delegated WhatsApp click listener');
  let prevented = false;
  clickHandlers[0]({ target: whatsappTarget(), preventDefault() { prevented = true; } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'event');
  assert.equal(calls[0][1], 'conversion');
  assert.equal(calls[0][2].send_to, whatsappSendTo);
  assert.equal(prevented, false);
});

test('ignores non-WhatsApp clicks', () => {
  const calls = [];
  const clickHandlers = boot((...args) => calls.push(args));
  clickHandlers[0]({ target: { closest() { return null; } } });
  assert.equal(calls.length, 0);
});

test('preserves clicks when gtag is missing or throws', () => {
  const missingHandlers = boot(undefined);
  assert.doesNotThrow(() => missingHandlers[0]({ target: whatsappTarget() }));
  const throwingHandlers = boot(() => { throw new Error('blocked'); });
  assert.doesNotThrow(() => throwingHandlers[0]({ target: whatsappTarget() }));
});

test('keeps the existing form conversion destination', () => {
  assert.match(source, /AW-16777656395\/Om_nCMCV4swcEMvwmsA-/);
});
