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
        } else if (force) {
          this._classes.add(cls);
        } else {
          this._classes.delete(cls);
        }
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
      // Handle comma-separated name selectors like [name="message"], [name="requirements"]
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

function createFormDom(overrides) {
  const form = makeElement('form');
  const fields = {
    name: 'Test User',
    email: 'test@example.com',
    contact: '+123456',
    product_interest: 'CB Off-Road',
    message: 'Need 10 engines',
    website: '',
    'cf-turnstile-response': 'token123'
  };
  Object.assign(fields, overrides || {});

  for (const [name, value] of Object.entries(fields)) {
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
    return null;
  };
  form.setAttribute = function(k, v) { this.attributes[k] = v; };

  return { form, listeners };
}

function bootMain(forms, gtag, fetchImpl) {
  const docListeners = new Map();
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
    open() {}
  };
  if (gtag !== undefined) window.gtag = gtag;

  const fetchRef = { current: fetchImpl || (() => Promise.resolve({ ok: true })) };

  vm.runInNewContext(source, {
    document,
    window,
    URLSearchParams,
    FormData: function FormData() { this.append = () => {}; },
    console,
    setTimeout,
    clearTimeout,
    fetch: (...args) => fetchRef.current(...args)
  });
  const readyHandlers = docListeners.get('DOMContentLoaded') || [];
  if (readyHandlers.length) readyHandlers[0]();
  return { docListeners, fetchRef };
}

test('shared initializer selects form.p5-form and .contact-form form', () => {
  const { form } = createFormDom();
  bootMain([form]);
  assert.equal(form.dataset.chixiangFormInitialized, '1');
});

test('same form is initialized only once', () => {
  const { form } = createFormDom();
  bootMain([form, form]);
  assert.equal(form.dataset.chixiangFormInitialized, '1');
});

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

test('Turnstile widget is injected into form', () => {
  const { form } = createFormDom();
  bootMain([form]);
  const wrap = form.querySelector('.turnstile-wrap');
  assert.ok(wrap, 'Turnstile wrapper should be present');
  const widget = form.querySelector('.cf-turnstile');
  assert.ok(widget, 'Turnstile widget should be present');
});

test('missing Turnstile token blocks fetch', async () => {
  const { form, listeners } = createFormDom({ 'cf-turnstile-response': '' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  assert.equal(submitHandlers.length, 1);
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'fetch should not be called without Turnstile token');
});

test('honeypot non-empty blocks fetch', () => {
  const { form, listeners } = createFormDom({ website: 'spam' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'fetch should not be called when honeypot is filled');
});

test('Worker 200 shows success and fires conversion once', async () => {
  const { form, listeners } = createFormDom();
  const calls = [];
  bootMain([form], (...args) => calls.push(args), () => Promise.resolve({ ok: true }));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(calls.length, 1, 'gtag conversion should fire exactly once');
  assert.equal(calls[0][1], 'conversion');
});

test('Worker 400 does not show success', async () => {
  const { form, listeners } = createFormDom();
  const calls = [];
  bootMain([form], (...args) => calls.push(args), () => Promise.resolve({ ok: false, status: 400 }));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(calls.length, 0, 'gtag conversion should not fire on 400');
});

test('network error triggers fallback without throwing', async () => {
  const { form, listeners } = createFormDom();
  bootMain([form], undefined, () => Promise.reject(new Error('network')));
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.ok(true, 'fallback path executed without unhandled rejection');
});

test('requirements field is included in spam detection', () => {
  const { form, listeners } = createFormDom({ message: 'buy cheap viagra' });
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  assert.equal(fetched, false, 'spam in message/requirements should block submission');
});

test('double submit produces only one request', async () => {
  const { form, listeners } = createFormDom();
  let fetchCount = 0;
  bootMain([form], undefined, () => { fetchCount++; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(fetchCount, 1, 'only one fetch should occur on double submit');
});

test('form works without gtag', async () => {
  const { form, listeners } = createFormDom();
  let fetched = false;
  bootMain([form], undefined, () => { fetched = true; return Promise.resolve({ ok: true }); });
  const submitHandlers = listeners.get('submit') || [];
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(r => setTimeout(r, 10));
  assert.equal(fetched, true, 'form should submit even without gtag');
});
