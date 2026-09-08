const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const scriptFile = path.join(root, 'js', 'core-menu-accessibility.js');
const pages = [
  'en/cg-engine.html',
  'en/cb-engine.html',
  'en/horizontal-engine.html',
  'en/engine-parts.html'
];

const expectedMenuLinks = [
  '/en/',
  '/en/products',
  '/en/cg-engine',
  '/en/cb-engine',
  '/en/horizontal-engine',
  '/en/engine-parts',
  '/en/about',
  '/en/news',
  '/en/contact',
  '/en/contact'
];

const currentPageLinks = new Map([
  ['en/cg-engine.html', '/en/cg-engine'],
  ['en/cb-engine.html', '/en/cb-engine'],
  ['en/horizontal-engine.html', '/en/horizontal-engine'],
  ['en/engine-parts.html', '/en/engine-parts']
]);

function source() {
  assert.ok(fs.existsSync(scriptFile), 'missing js/core-menu-accessibility.js');
  return fs.readFileSync(scriptFile, 'utf8');
}

function createHarness({ includeNav = true } = {}) {
  const observers = [];
  const documentListeners = new Map();
  const windowListeners = new Map();

  class Element {
    constructor(document, { id = '', className = '', tagName = 'div' } = {}) {
      this.document = document;
      this.id = id;
      this.className = className;
      this.tagName = tagName;
      this.attributes = new Map();
      this.listeners = new Map();
      this.style = {};
      this.isConnected = true;
      this.onclick = null;
      this.classList = {
        values: new Set(className.split(/\s+/).filter(Boolean)),
        add: value => {
          this.classList.values.add(value);
          observers.forEach(observer => observer.callback());
        },
        remove: value => {
          this.classList.values.delete(value);
          observers.forEach(observer => observer.callback());
        },
        contains: value => this.classList.values.has(value)
      };
    }

    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }

    click() {
      const event = { type: 'click', preventDefault() {}, stopPropagation() {} };
      if (typeof this.onclick === 'function') this.onclick(event);
      for (const listener of this.listeners.get('click') || []) listener(event);
    }

    focus() {
      this.document.activeElement = this;
    }

    getAttribute(name) {
      return this.attributes.has(name) ? this.attributes.get(name) : null;
    }

    hasAttribute(name) {
      return this.attributes.has(name);
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }

    removeAttribute(name) {
      this.attributes.delete(name);
    }

    querySelectorAll(selector) {
      if (selector === '.mobile-nav-list a') return this.mobileLinks || [];
      return [];
    }
  }

  const document = {
    readyState: 'complete',
    activeElement: null,
    body: { style: {} },
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) || [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    },
    dispatchKey(key, shiftKey = false) {
      let prevented = false;
      const event = {
        key,
        shiftKey,
        preventDefault() { prevented = true; }
      };
      for (const listener of documentListeners.get('keydown') || []) listener(event);
      return prevented;
    }
  };

  const toggle = new Element(document, { className: 'menu-toggle', tagName: 'button' });
  const close = new Element(document, { id: 'mobileNavClose', className: 'mobile-nav-close', tagName: 'button' });
  const nav = includeNav ? new Element(document, { id: 'mobileNav', className: 'mobile-nav' }) : null;
  const links = nav
    ? expectedMenuLinks.map(() => new Element(document, { tagName: 'a' }))
    : [];
  if (nav) nav.mobileLinks = links;

  let closeClicks = 0;
  toggle.onclick = () => nav && nav.classList.add('active');
  close.onclick = () => {
    closeClicks += 1;
    if (nav) nav.classList.remove('active');
  };

  document.querySelector = selector => selector === '.menu-toggle' ? toggle : null;
  document.getElementById = id => {
    if (id === 'mobileNav') return nav;
    if (id === 'mobileNavClose') return close;
    return null;
  };

  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {
      observers.push(this);
    }
  }

  const window = {
    innerWidth: 390,
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    dispatchResize() {
      for (const listener of windowListeners.get('resize') || []) listener();
    },
    setTimeout(callback) {
      callback();
    }
  };

  return { document, window, MutationObserver, toggle, close, nav, links, closeClicks: () => closeClicks };
}

function boot(options) {
  const harness = createHarness(options);
  vm.runInNewContext(source(), {
    document: harness.document,
    window: harness.window,
    MutationObserver: harness.MutationObserver,
    console
  });
  return harness;
}

test('four English family pages contain the approved overlay structure and page-scoped script', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /<div class="mobile-nav" id="mobileNav">/, `${file}: missing overlay`);
    assert.match(html, /id="mobileNavClose"/, `${file}: missing close control`);
    assert.match(
      html,
      /<line x1="6" y1="6" x2="18" y2="18"\/>/,
      `${file}: close icon must retain its second diagonal`
    );
    assert.match(html, /<ul class="mobile-nav-list">/, `${file}: missing menu list`);
    assert.match(html, /<script src="\.\.\/js\/core-menu-accessibility\.js" defer><\/script>/, `${file}: missing scoped script`);
    const links = [...html.matchAll(/<ul class="mobile-nav-list">([\s\S]*?)<\/ul>/g)][0][1]
      .match(/href="([^"]+)"/g)
      .map(match => match.slice(6, -1));
    assert.deepEqual(links, expectedMenuLinks, `${file}: unexpected mobile routes`);
  }
});

test('each mobile menu exposes exactly one current product-family page', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const menu = [...html.matchAll(/<ul class="mobile-nav-list">([\s\S]*?)<\/ul>/g)][0][1];
    const currentLinks = [...menu.matchAll(/<a\b(?=[^>]*\bhref="([^"]+)")(?=[^>]*\baria-current="page")[^>]*>/g)]
      .map(match => match[1]);
    assert.deepEqual(currentLinks, [currentPageLinks.get(file)], `${file}: missing or incorrect current-page state`);
  }
});

test('synchronizes ARIA, moves focus, restores focus and removes closed menu controls from tab order', () => {
  const harness = boot();
  assert.equal(harness.toggle.getAttribute('aria-controls'), 'mobileNav');
  assert.equal(harness.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(harness.nav.getAttribute('aria-hidden'), 'true');
  assert.equal(harness.close.getAttribute('tabindex'), '-1');
  assert.ok(harness.links.every(link => link.getAttribute('tabindex') === '-1'));

  harness.toggle.click();
  assert.equal(harness.nav.classList.contains('active'), true);
  assert.equal(harness.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(harness.nav.getAttribute('aria-hidden'), 'false');
  assert.equal(harness.document.activeElement, harness.links[0]);
  assert.equal(harness.close.getAttribute('tabindex'), null);
  assert.ok(harness.links.every(link => link.getAttribute('tabindex') === null));

  assert.equal(harness.document.dispatchKey('Escape'), true);
  assert.equal(harness.closeClicks(), 1);
  assert.equal(harness.nav.classList.contains('active'), false);
  assert.equal(harness.document.activeElement, harness.toggle);
  assert.equal(harness.close.getAttribute('tabindex'), '-1');
});

test('cycles Tab and Shift+Tab within an open mobile menu', () => {
  const harness = boot();
  harness.toggle.click();

  harness.links.at(-1).focus();
  assert.equal(harness.document.dispatchKey('Tab'), true);
  assert.equal(harness.document.activeElement, harness.close);

  harness.close.focus();
  assert.equal(harness.document.dispatchKey('Tab', true), true);
  assert.equal(harness.document.activeElement, harness.links.at(-1));
});

test('uses the existing close control to release an open menu at the desktop boundary', () => {
  const harness = boot();
  harness.toggle.click();
  harness.window.innerWidth = 901;
  harness.window.dispatchResize();

  assert.equal(harness.closeClicks(), 1);
  assert.equal(harness.nav.classList.contains('active'), false);
  assert.equal(harness.document.activeElement, harness.toggle);
});

test('does nothing when a page does not have the required mobile navigation nodes', () => {
  assert.doesNotThrow(() => boot({ includeNav: false }));
});
