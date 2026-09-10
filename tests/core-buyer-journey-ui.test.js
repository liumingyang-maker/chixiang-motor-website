const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
const contactPages = [
  { file: 'en/contact.html', lang: 'en', source: 'contact_owner_en' },
  { file: 'es/contacto.html', lang: 'es', source: 'contact_owner_es' },
  { file: 'pt/contato.html', lang: 'pt', source: 'contact_owner_pt' },
  { file: 'ru/kontakty.html', lang: 'ru', source: 'contact_owner_ru' },
  { file: 'ar/contact.html', lang: 'ar', source: 'contact_owner_ar' }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function contactOwnerRegion(html) {
  const match = html.match(/<!-- CONTACT PROCUREMENT OWNER START -->[\s\S]*?<!-- CONTACT PROCUREMENT OWNER END -->/);
  assert.ok(match, 'managed Contact owner region is required');
  return match[0];
}

function makeElement(tag, attrs) {
  const listeners = new Map();
  const element = {
    tagName: tag.toUpperCase(),
    attributes: Object.assign({}, attrs),
    children: [],
    dataset: {},
    style: {},
    value: '',
    defaultValue: '',
    disabled: false,
    className: '',
    textContent: '',
    classList: {
      values: new Set(),
      add(value) { this.values.add(value); },
      remove(value) { this.values.delete(value); },
      contains(value) { return this.values.has(value); },
      toggle(value, force) {
        if (force === undefined) force = !this.values.has(value);
        if (force) this.values.add(value);
        else this.values.delete(value);
      }
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === 'name') this.name = value;
    },
    getAttribute(name) {
      return this.attributes[name] === undefined ? null : this.attributes[name];
    },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    insertBefore(child, reference) {
      const index = this.children.indexOf(reference);
      if (index < 0) return this.appendChild(child);
      this.children.splice(index, 0, child);
      child.parentNode = this;
      return child;
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    listeners,
    querySelector(selector) {
      const find = (node, predicate) => {
        for (const child of node.children || []) {
          if (predicate(child)) return child;
          const nested = find(child, predicate);
          if (nested) return nested;
        }
        return null;
      };
      const names = [...selector.matchAll(/\[name="([^"]+)"\]/g)].map(match => match[1]);
      if (names.length) return find(this, child => names.includes(child.name));
      if (selector === 'button[type="submit"]') return find(this, child => child.tagName === 'BUTTON');
      if (selector === '.form-status') return find(this, child => child.className === 'form-status');
      if (selector === '.cf-turnstile') return find(this, child => child.className === 'cf-turnstile');
      if (selector === '.turnstile-wrap') return find(this, child => child.className === 'turnstile-wrap');
      return null;
    },
    querySelectorAll() {
      return [];
    },
    reset() {
      for (const child of this.children) {
        if (child.name && child.name !== 'source_form') child.value = '';
      }
    }
  };
  if (attrs && attrs.name) element.name = attrs.name;
  return element;
}

function createProcurementForm() {
  const form = makeElement('form', {
    action: '/api/contact',
    method: 'POST',
    'data-whatsapp-fallback': 'false'
  });
  const values = {
    name: 'Buyer Name',
    company: 'Buyer Company',
    contact: '+213 555 000 000',
    email: '',
    country: 'Algeria',
    product_interest: 'cg',
    quantity: '120',
    application: 'cargo-tricycle',
    requirements: 'Electric start and reverse configuration',
    source_form: 'contact_owner_en',
    website: '',
    'cf-turnstile-response': 'controlled-test-token'
  };
  for (const [name, value] of Object.entries(values)) {
    const input = makeElement(name === 'requirements' ? 'textarea' : 'input', { name });
    input.value = value;
    form.appendChild(input);
  }
  const submit = makeElement('button', { type: 'submit' });
  submit.textContent = 'Send procurement inquiry';
  form.appendChild(submit);
  return form;
}

function bootMainForContactForm(form, fetchImpl) {
  const documentListeners = new Map();
  const document = {
    readyState: 'loading',
    body: { style: {} },
    documentElement: { lang: 'en' },
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    querySelector() { return null; },
    querySelectorAll(selector) {
      return selector === '.contact-form form, form.p5-form' ? [form] : [];
    },
    getElementById() { return null; },
    createElement(tag) { return makeElement(tag); },
    head: { appendChild() {} }
  };
  const opened = [];
  const window = {
    location: {
      search: '',
      pathname: '/en/contact',
      href: 'https://chixiangmotor.com/en/contact'
    },
    addEventListener() {},
    open(...args) { opened.push(args); }
  };
  function FormData(formElement) {
    const entries = new Map();
    for (const child of formElement.children) {
      if (child.name && child.value !== undefined) entries.set(child.name, child.value);
    }
    this.get = name => entries.has(name) ? entries.get(name) : null;
    this.has = name => entries.has(name);
    this.entries = () => entries.entries();
  }
  vm.runInNewContext(mainSource, {
    document,
    window,
    URLSearchParams,
    FormData,
    fetch: fetchImpl,
    setTimeout,
    clearTimeout,
    console
  });
  const domReady = documentListeners.get('DOMContentLoaded') || [];
  assert.equal(domReady.length, 1, 'main.js must register one DOM-ready initializer');
  domReady[0]();
  return { opened };
}

test('T05 contact pages load only scoped refresh styles and place the editable form before supporting material', () => {
  const cssFile = path.join(root, 'css', 'core-buyer-journey.css');
  assert.ok(fs.existsSync(cssFile), 'Package C scoped stylesheet is required');
  const css = fs.readFileSync(cssFile, 'utf8');
  assert.match(css, /\.site-contact-refresh\s+\.contact-layout/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)/);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:body|\.contact-layout)\s*\{/);

  for (const page of contactPages) {
    const html = read(page.file);
    const region = contactOwnerRegion(html);
    assert.match(html, /<link rel="stylesheet" href="\.\.\/css\/core-buyer-journey\.css(?:\?[^"']*)?">/);
    assert.match(region, /<section class="section site-contact-refresh">/);
    const formAt = region.indexOf('id="procurement-form"');
    const summaryAt = region.indexOf('class="contact-owner-summary"');
    assert.ok(formAt >= 0 && summaryAt >= 0 && formAt < summaryAt, `${page.file}: form must precede summary in DOM order`);
    assert.match(region, new RegExp(`name="source_form" value="${page.source}"`));
  }
});

test('T05 procurement form uses real main.js with controlled FormData and no external fallback', async () => {
  const form = createProcurementForm();
  let request = null;
  const { opened } = bootMainForContactForm(form, (url, options) => {
    request = { url, options };
    return Promise.resolve({ ok: true });
  });
  const submitHandlers = form.listeners.get('submit') || [];
  assert.equal(submitHandlers.length, 1, 'main.js must attach one submit handler');
  submitHandlers[0]({ preventDefault() {} });
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(request.url, '/api/contact');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Accept, 'application/json');
  const body = request.options.body;
  const expected = {
    name: 'Buyer Name',
    company: 'Buyer Company',
    contact: '+213 555 000 000',
    email: '',
    country: 'Algeria',
    product_interest: 'cg',
    quantity: '120',
    application: 'cargo-tricycle',
    requirements: 'Electric start and reverse configuration',
    source_form: 'contact_owner_en'
  };
  for (const [name, value] of Object.entries(expected)) {
    assert.equal(body.get(name), value, `${name} must remain in real FormData`);
  }
  assert.equal(opened.length, 0, 'controlled successful submission must not trigger an outbound fallback');
});
