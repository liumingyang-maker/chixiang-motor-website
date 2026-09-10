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

test('T04 English home hero keeps the approved conversion content and uses an image-only engine-family visual', () => {
  const html = read('en/index.html');
  const hero = html.match(/<section class="hero site-home-refresh site-home-hero" id="home">[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(html, /<link rel="stylesheet" href="\.\.\/css\/core-buyer-journey\.css(?:\?[^"']*)?">/);
  assert.ok(hero, 'scoped English home hero is required');
  assert.doesNotMatch(hero, /class="hero-bg"|class="hero-overlay"/);
  assert.match(hero, /<h1 class="hero-brand-headline">Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in China<\/h1>/);
  assert.match(hero, /href="\/en\/contact" class="btn btn-accent btn-lg">Send Inquiry<\/a>/);
  assert.match(hero, /href="\/en\/products" class="btn btn-outline-light btn-lg">View Products<\/a>/);
  assert.ok(hero.indexOf('hero-brand-headline') < hero.indexOf('site-home-hero__visual'), 'mobile DOM order must be copy and CTAs before the visual');
  assert.equal((hero.match(/fetchpriority="high"/g) || []).length, 1, 'only one hero image may be high priority');
  for (const src of [
    '../images/cg%E9%93%B6%E7%99%BD%E8%89%B2/1.webp',
    '../images/CB/1.webp',
    '../images/%E8%84%9A%E5%90%AF%E5%8A%A8%E5%8F%91%E5%8A%A8%E6%9C%BA%E5%8D%A7%E5%BC%8F/1.webp'
  ]) {
    assert.match(hero, new RegExp(`src="${src}"`));
    const localAsset = path.resolve(root, 'en', decodeURIComponent(src));
    assert.ok(fs.existsSync(localAsset), `${src}: existing product asset required`);
  }
  const css = read('css/core-buyer-journey.css');
  assert.match(css, /\.site-home-hero\s+\.site-home-hero__inner/);
  assert.match(css, /\.site-home-hero\s+\.site-home-hero__visual/);
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*flex-direction:\s*column/);
});
