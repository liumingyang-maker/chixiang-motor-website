const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'yandex-metrica.js'), 'utf8');

function bootYandex(fetchImpl) {
  const ymCalls = [];
  const listeners = new Map();
  let fetchWrapper = null;

  const window = {
    ym: function(...args) { ymCalls.push(args); },
    location: { href: 'https://chixiangmotor.com/ru/russia/' },
    addEventListener() {},
    fetch: fetchImpl || (() => Promise.resolve({ ok: true }))
  };
  window.fetch.__chixiangMetricaWrapped = false;

  const document = {
    body: { getAttribute: () => 'Russia' },
    head: { appendChild() {} },
    querySelector() { return null; },
    createElement() { return { async: false, src: '', setAttribute() {} }; },
    addEventListener(type, handler) {
      const arr = listeners.get(type) || [];
      arr.push(handler);
      listeners.set(type, arr);
    }
  };

  vm.runInNewContext(source, { window, document, console, Date });

  return { ymCalls, listeners, window };
}

test('Yandex counter ID is 110874170', () => {
  const { ymCalls } = bootYandex();
  const initCall = ymCalls.find(c => c[1] === 'init');
  assert.ok(initCall, 'ym init should be called');
  assert.equal(initCall[0], 110874170);
});

test('Yandex initialization happens only once per boot', () => {
  const { ymCalls } = bootYandex();
  const initCalls = ymCalls.filter(c => c[1] === 'init');
  assert.equal(initCalls.length, 1, 'init should be called exactly once');
});

test('ym-submit-leadform fires once on /api/contact POST 2xx', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.resolve({ ok: true }));
  await window.fetch('/api/contact', { method: 'POST' });
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 1, 'ym-submit-leadform should fire exactly once');
});

test('ym-submit-leadform fires zero times on /api/contact POST 400', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.resolve({ ok: false, status: 400 }));
  await window.fetch('/api/contact', { method: 'POST' });
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 0, 'ym-submit-leadform should not fire on 400');
});

test('ym-submit-leadform fires zero times on /api/contact POST 500', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.resolve({ ok: false, status: 500 }));
  await window.fetch('/api/contact', { method: 'POST' });
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 0, 'ym-submit-leadform should not fire on 500');
});

test('ym-submit-leadform fires zero times on network failure', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.reject(new Error('network')));
  try { await window.fetch('/api/contact', { method: 'POST' }); } catch (_) {}
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 0, 'ym-submit-leadform should not fire on network error');
});

test('ym-submit-leadform fires zero times for non-/api/contact fetch', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.resolve({ ok: true }));
  await window.fetch('/api/other', { method: 'POST' });
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 0, 'ym-submit-leadform should not fire for other endpoints');
});

test('ym-submit-leadform fires zero times for GET /api/contact', async () => {
  const { ymCalls, window } = bootYandex(() => Promise.resolve({ ok: true }));
  await window.fetch('/api/contact', { method: 'GET' });
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 0, 'ym-submit-leadform should not fire for GET');
});

test('ym-open-chat fires once on WhatsApp click', () => {
  const { ymCalls, listeners } = bootYandex();
  const clickHandlers = listeners.get('click') || [];
  assert.equal(clickHandlers.length, 1, 'one delegated click listener expected');
  clickHandlers[0]({
    target: {
      closest(sel) {
        assert.equal(sel, 'a[href*="wa.me/"]');
        return { href: 'https://wa.me/8619008225410' };
      }
    }
  });
  const chatCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-open-chat');
  assert.equal(chatCalls.length, 1, 'ym-open-chat should fire exactly once');
});

test('rapid double fetch produces only one lead goal', async () => {
  let resolveFirst;
  const first = new Promise(r => { resolveFirst = r; });
  let count = 0;
  const { ymCalls, window } = bootYandex(() => {
    count++;
    return count === 1 ? first : Promise.resolve({ ok: true });
  });
  const p1 = window.fetch('/api/contact', { method: 'POST' });
  const p2 = window.fetch('/api/contact', { method: 'POST' });
  resolveFirst({ ok: true });
  await Promise.all([p1, p2]);
  await new Promise(r => setTimeout(r, 10));
  const leadCalls = ymCalls.filter(c => c[1] === 'reachGoal' && c[2] === 'ym-submit-leadform');
  assert.equal(leadCalls.length, 2, 'each successful POST should fire once; wrapper does not dedupe fetch calls');
});

test('repeated script initialization does not duplicate fetch wrapper', () => {
  const { window } = bootYandex();
  const wrappedFetch = window.fetch;
  assert.equal(wrappedFetch.__chixiangMetricaWrapped, true, 'fetch should be wrapped');

  // Simulate loading the script again in the same context
  const ymCalls2 = [];
  window.ym = function(...args) { ymCalls2.push(args); };
  const document2 = {
    body: { getAttribute: () => 'Russia' },
    head: { appendChild() {} },
    querySelector() { return null; },
    createElement() { return { async: false, src: '', setAttribute() {} }; },
    addEventListener() {}
  };
  vm.runInNewContext(source, { window, document: document2, console, Date });

  assert.equal(window.fetch, wrappedFetch, 'fetch wrapper should not be replaced on re-init');
  const initCalls = ymCalls2.filter(c => c[1] === 'init');
  assert.equal(initCalls.length, 1, 'init may be called again but fetch must not be double-wrapped');
});
