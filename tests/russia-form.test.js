const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const russiaHtml = fs.readFileSync(path.join(__dirname, '..', 'ru', 'russia', 'index.html'), 'utf8');

function makeElement(tag, attrs) {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    attributes: Object.assign({}, attrs || {}),
    value: '',
    defaultValue: '',
    textContent: '',
    disabled: false,
    className: '',
    classList: {
      _classes: new Set(),
      toggle(cls, force) {
        if (force === undefined) {
          if (this._classes.has(cls)) this._classes.delete(cls);
          else this._classes.add(cls);
        } else if (force) this._classes.add(cls);
        else this._classes.delete(cls);
      },
      add(cls) { this._classes.add(cls); },
      remove(cls) { this._classes.delete(cls); },
      contains(cls) { return this._classes.has(cls); }
    },
    setAttribute(k, v) { this.attributes[k] = v; if (k === 'name') this.name = v; },
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; },
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    insertBefore(newNode, refNode) {
      const idx = this.children.indexOf(refNode);
      if (idx >= 0) this.children.splice(idx, 0, newNode);
      else this.children.push(newNode);
      newNode.parentNode = this;
      return newNode;
    },
    querySelector(sel) {
      const search = (node, pred) => {
        for (const c of node.children || []) {
          if (pred(c)) return c;
          const found = search(c, pred);
          if (found) return found;
        }
        return null;
      };
      const multiName = sel.match(/^\[name="([^"]+)"\],\s*\[name="([^"]+)"\]$/);
      if (multiName) {
        const n1 = multiName[1], n2 = multiName[2];
        return search(this, c => (c.name === n1 || c.name === n2) || (c.getAttribute && (c.getAttribute('name') === n1 || c.getAttribute('name') === n2)));
      }
      const m = sel.match(/^\[name="([^"]+)"\]$/);
      if (m) {
        const name = m[1];
        return search(this, c => (c.name === name) || (c.getAttribute && c.getAttribute('name') === name));
      }
      if (sel === 'button[type="submit"]') return search(this, c => c.tagName === 'BUTTON');
      if (sel === '.form-status') return search(this, c => c.className === 'form-status');
      if (sel === '.cf-turnstile') return search(this, c => c.className === 'cf-turnstile');
      if (sel === '.turnstile-wrap') return search(this, c => c.className === 'turnstile-wrap');
      return null;
    },
    querySelectorAll() { return []; },
    addEventListener() {},
    reset() { this.children.forEach(c => { if ('value' in c) c.value = ''; }); }
  };
  if (attrs && attrs.name) el.name = attrs.name;
  return el;
}

function createFormDom(overrides, opts) {
  const form = makeElement('form');
  const fields = Object.assign({
    name: 'Test User',
    email: 'test@example.com',
    contact: '+123456',
    product_interest: 'CB Off-Road',
    website: '',
    'cf-turnstile-response': 'token123'
  }, overrides || {});

  if (!('message' in (overrides || {})) || overrides.message !== undefined) {
    fields.message = fields.message !== undefined ? fields.message : 'Need 10 engines';
  }

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const input = makeElement('input', { name });
    input.value = value;
    form.appendChild(input);
  }
  const btn = makeElement('button', { type: 'submit' });
  btn.textContent = 'Send';
  form.appendChild(btn);

  const listeners = new Map();
  form.addEventListener = function(type, handler) {
    const arr = listeners.get(type) || [];
    arr.push(handler);
    listeners.set(type, arr);
  };
  form.getAttribute = function(k) {
    if (k === 'action') return '/api/contact';
    if (k === 'method') return 'POST';
    if (k.startsWith('data-message-')) return this.attributes[k] || null;
    return null;
  };
  form.setAttribute = function(k, v) { this.attributes[k] = v; };
  if (opts && opts.noReset) {
    form.reset = function() {};
  }
  if (opts && opts.dataMessages) {
    for (const [k, v] of Object.entries(opts.dataMessages)) {
      form.setAttribute('data-message-' + k, v);
    }
  }

  return { form, listeners };
}

function bootMain(forms, gtag, fetchImpl) {
  const docListeners = new Map();
  const opened = [];
  const document = {
    readyState: 'loading',
    body: { style: {} },
    documentElement: { lang: 'ru-RU' },
    addEventListener(type, handler) {
      const arr = docListeners.get(type) || [];
      arr.push(handler);
      docListeners.set(type, arr);
    },
    querySelector() { return null; },
    querySelectorAll(sel) {
      if (sel === '.contact-form form, form.p5-form') return forms;
      return [];
    },
    getElementById() { return null; },
    createElement(tag) { return makeElement(tag); },
    head: { appendChild() {} }
  };
  const window = {
    location: { search: '', pathname: '/ru/russia/', href: 'https://chixiangmotor.com/ru/russia/' },
    addEventListener() {},
    innerHeight: 900,
    open(url, target, features) { opened.push({ url, target, features }); }
  };
  if (gtag !== undefined) window.gtag = gtag;

  const fetchRef = { current: fetchImpl || (() => Promise.resolve({ ok: true })) };

  vm.runInNewContext(source, {
    document,
    window,
    URLSearchParams,
    FormData: function FormData(formEl) {
      const entries = new Map();
      if (formEl && formEl.children) {
        formEl.children.forEach(c => {
          if (c.name && c.value !== undefined) entries.set(c.name, c.value);
        });
      }
      this.append = (k, v) => entries.set(k, v);
      this.get = (k) => entries.has(k) ? entries.get(k) : null;
      this.has = (k) => entries.has(k);
      this.entries = () => entries.entries();
    },
    console,
    setTimeout,
    clearTimeout,
    fetch: (...args) => fetchRef.current(...args)
  });
  const readyHandlers = docListeners.get('DOMContentLoaded') || [];
  if (readyHandlers.length) readyHandlers[0]();
  return { docListeners, fetchRef, opened, window };
}

// --- Static HTML assertions ---

test('Russia page contains honeypot field', () => {
  assert.match(russiaHtml, /name="website"/);
  assert.match(russiaHtml, /p5-honeypot/);
  assert.match(russiaHtml, /aria-hidden="true"/);
});

test('Russia page contains localized status messages', () => {
  assert.match(russiaHtml, /data-message-spam="Удалите/);
  assert.match(russiaHtml, /data-message-turnstile="Подтвердите/);
  assert.match(russiaHtml, /data-message-sending="Отправка/);
  assert.match(russiaHtml, /data-message-success="Спасибо/);
  assert.match(russiaHtml, /data-message-fallback="Не удалось/);
});

// --- Initialization ---

test('shared initializer selects form.p5-form and .contact-form form', () => {
  const { form } = createFormDom();
  bootMain([form]);
  assert.equal(form.dataset.chixiangFormInitialized, '1');
});

test('initialization registers exactly one submit handler per form', () => {
  const { form, listeners } = createFormDom();
  bootMain([form, form]);
  const submitHandlers = listeners.get('submit') || [];
  assert.equal(submitHandlers.length, 1, 'duplicate form reference must not add a second submit listener');
  assert.equal(form.dataset.chixiangFormInitialized, '1');
});

test('Turnstile widget is injected into form', () => {
  const { form } = createFormDom();
  bootMain([form]);
  assert.ok(form.querySelector('.turnstile-wrap'), 'Turnstile wrapper should be present');
  assert.ok(form.querySelector('.cf-turnstile'), 'Turnstile widget should be present');
});

// --- Honeypot and Turnstile gating ---

test('honeypot non-empty blocks fetch', () => {
  const { form, listeners } = createFormDom({ website: 'spam' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'fetch should not be called when honeypot is filled');
});

test('missing Turnstile token blocks fetch', () => {
  const { form, listeners } = createFormDom({ 'cf-turnstile-response': '' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'fetch should not be called without Turnstile token');
});

// --- requirements field ---

test('requirements spam blocks submission (no message field)', () => {
  const { form, listeners } = createFormDom({ message: undefined, requirements: 'buy cheap viagra' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'spam in requirements should block submission');
});

test('normal requirements is included in WhatsApp fallback', async () => {
  const { form, listeners } = createFormDom({ message: undefined, requirements: 'Need 10 CB150 engines' });
  const { opened } = bootMain([form], undefined, () => Promise.reject(new Error('network')));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(opened.length, 1, 'WhatsApp should be opened on network failure');
  assert.match(opened[0].url, /^https:\/\/wa\.me\/8619008225410\?text=/);
  assert.match(decodeURIComponent(opened[0].url), /Need 10 CB150 engines/);
});

test('requirements content enters FormData', async () => {
  const { form, listeners } = createFormDom({ message: undefined, requirements: 'Technical specs here' });
  let capturedBody = null;
  bootMain([form], undefined, (url, opts) => {
    capturedBody = opts && opts.body;
    return Promise.resolve({ ok: true });
  });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.ok(capturedBody, 'FormData should be passed to fetch');
});

test('form works with only requirements and no message field', async () => {
  const { form, listeners } = createFormDom({ message: undefined, requirements: 'Only requirements' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(fetched, true, 'form should submit with only requirements');
});

// --- Worker success / failure ---

test('Shared form with gtag: successful response may report Google conversion once', async () => {
  const { form, listeners } = createFormDom();
  const calls = [];
  bootMain([form], (...args) => calls.push(args), () => Promise.resolve({ ok: true }));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(calls.length, 1, 'gtag conversion should fire exactly once');
  assert.equal(calls[0][1], 'conversion');
});

test('Worker 400 does not show success and does not fire conversion', async () => {
  const { form, listeners } = createFormDom();
  const calls = [];
  bootMain([form], (...args) => calls.push(args), () => Promise.resolve({ ok: false, status: 400 }));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(calls.length, 0, 'gtag conversion should not fire on 400');
});

test('Russia without gtag: submission remains fully functional', async () => {
  const { form, listeners } = createFormDom();
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(fetched, true, 'form should submit even without gtag');
});

// --- Fallback behavior ---

test('network failure opens WhatsApp fallback with correct URL and status', async () => {
  const { form, listeners } = createFormDom(
    { message: undefined, requirements: 'Fallback test' },
    { dataMessages: { fallback: 'Не удалось отправить форму. Мы открыли WhatsApp с данными запроса.' } }
  );
  const calls = [];
  const { opened } = bootMain([form], (...args) => calls.push(args), () => Promise.reject(new Error('network')));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));

  assert.equal(opened.length, 1, 'window.open should be called once');
  assert.match(opened[0].url, /^https:\/\/wa\.me\/8619008225410\?text=/);
  assert.match(decodeURIComponent(opened[0].url), /Fallback test/);

  const status = form.querySelector('.form-status');
  assert.ok(status, 'form status element should exist');
  assert.match(status.textContent, /Не удалось отправить форму/);
  assert.equal(status.classList.contains('is-error'), true, 'fallback status should be error');
  assert.equal(status.classList.contains('is-success'), false, 'fallback status should not be success');
  assert.equal(calls.length, 0, 'gtag conversion should not fire on network failure');
});

// --- Duplicate submission ---

test('double submit with pending request produces only one fetch', async () => {
  const { form, listeners } = createFormDom({}, { noReset: true });
  let fetchCount = 0;
  let resolveFetch;
  const pending = new Promise(resolve => { resolveFetch = resolve; });
  bootMain([form], undefined, () => {
    fetchCount++;
    return pending;
  });
  const submitHandlers = listeners.get('submit') || [];

  submitHandlers[0]({ preventDefault() {} });
  submitHandlers[0]({ preventDefault() {} });

  assert.equal(fetchCount, 1, 'only one fetch should be in flight');
  assert.equal(form.dataset.submitting, '1', 'lock should be active during pending request');

  resolveFetch({ ok: true });
  await new Promise(r => setTimeout(r, 10));

  assert.equal(form.dataset.submitting, '', 'lock should be released after completion');

  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(fetchCount, 2, 'after lock release, a new submit should be allowed');
});

// --- Submit lock edge cases ---

test('validation failure does not leave permanent submitting lock', () => {
  const { form, listeners } = createFormDom({ 'cf-turnstile-response': '' });
  bootMain([form]);
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.notEqual(form.dataset.submitting, '1', 'lock must not be set when validation fails');
});

test('honeypot block does not leave permanent submitting lock', () => {
  const { form, listeners } = createFormDom({ website: 'bot' });
  bootMain([form]);
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.notEqual(form.dataset.submitting, '1', 'lock must not be set when honeypot triggers');
});

test('button text and disabled state are restored after fetch', async () => {
  const { form, listeners } = createFormDom({}, { noReset: true });
  bootMain([form], undefined, () => Promise.resolve({ ok: true }));
  const submitHandlers = listeners.get('submit') || [];
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(btn.textContent, originalText, 'button text should be restored');
  assert.equal(btn.disabled, false, 'button should be re-enabled');
});

// --- Submit lock positioning ---

test('submit lock is set at fetch time and cleared after completion', async () => {
  const { form, listeners } = createFormDom({}, { noReset: true });
  let lockDuringFetch = null;
  bootMain([form], undefined, () => {
    lockDuringFetch = form.dataset.submitting;
    return Promise.resolve({ ok: true });
  });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(lockDuringFetch, '1', 'lock should be set at the moment fetch is called');
  assert.equal(form.dataset.submitting, '', 'lock should be cleared after fetch completes');
});
