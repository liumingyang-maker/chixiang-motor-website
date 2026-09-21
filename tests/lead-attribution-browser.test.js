const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const modulePath = path.join(__dirname, '..', 'js', 'lead-attribution.js');
const {
  createClient,
  classifySource,
  createLeadId,
  sanitizeHostname,
  sanitizePath
} = require(modulePath);

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    value(key) { return values.get(key); }
  };
}

function throwingStorage() {
  return {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); }
  };
}

function browser(options = {}) {
  const listeners = new Map();
  const href = options.href || 'https://chixiangmotor.com/en/';
  const win = {
    location: new URL(href),
    localStorage: options.localStorage || memoryStorage(),
    sessionStorage: options.sessionStorage || memoryStorage(),
    crypto: {
      getRandomValues(bytes) {
        const seed = options.randomBytes || [7, 18, 3, 21, 2, 19, 9, 23, 4, 13, 11, 6];
        bytes.forEach((_, index) => { bytes[index] = seed[index % seed.length]; });
        return bytes;
      }
    },
    navigator: {},
    fetch: async () => new Response('{}', { status: 202 })
  };
  const doc = {
    referrer: options.referrer || '',
    readyState: 'complete',
    documentElement: { lang: options.language || 'en' },
    currentScript: { dataset: {} },
    addEventListener(type, handler, capture) {
      listeners.set(type + ':' + Boolean(capture), handler);
    },
    querySelectorAll() { return []; },
    createElement() { return {}; }
  };
  return { win, doc, listeners };
}

const now = () => new Date('2026-09-21T00:00:00.000Z');

test('creates a short anonymous Lead ID with Crockford Base32 characters', () => {
  const id = createLeadId(bytes => bytes.fill(31));
  assert.match(id, /^CX-[0-9A-HJKMNP-TV-Z]{10}$/);
  assert.equal(id, 'CX-ZZZZZZZZZZ');
});

test('classifies advertising identifiers before UTM and referrer evidence', () => {
  assert.equal(classifySource({ gclid: 'g', utm_source: 'facebook' }, 'https://bing.com/'), 'Google Ads');
  assert.equal(classifySource({ gbraid: 'g' }, ''), 'Google Ads');
  assert.equal(classifySource({ wbraid: 'g' }, ''), 'Google Ads');
  assert.equal(classifySource({ msclkid: 'm' }, ''), 'Microsoft Ads');
  assert.equal(classifySource({ yclid: 'y' }, ''), 'Yandex Ads');
  assert.equal(classifySource({ ttclid: 't' }, ''), 'TikTok Ads');
  assert.equal(classifySource({ fbclid: 'f' }, ''), 'Meta click, paid status unknown');
});

test('classifies UTM, search, social, AI, direct and referral sources', () => {
  assert.equal(classifySource({ utm_source: 'facebook', utm_medium: 'social' }, ''), 'Facebook');
  assert.equal(classifySource({ utm_source: 'instagram' }, ''), 'Instagram');
  assert.equal(classifySource({ utm_source: 'newsletter' }, ''), 'UTM: newsletter');
  assert.equal(classifySource({}, 'https://www.google.com/search?q=cg'), 'Google Organic');
  assert.equal(classifySource({}, 'https://www.bing.com/search?q=cg'), 'Bing Organic');
  assert.equal(classifySource({}, 'https://chatgpt.com/c/123'), 'ChatGPT');
  assert.equal(classifySource({}, 'https://openai.com/'), 'ChatGPT');
  assert.equal(classifySource({}, 'https://www.perplexity.ai/search/x'), 'Perplexity');
  assert.equal(classifySource({}, 'https://claude.ai/chat/x'), 'Claude');
  assert.equal(classifySource({}, 'https://gemini.google.com/app/x'), 'Gemini');
  assert.equal(classifySource({}, 'https://www.instagram.com/p/x'), 'Meta Social');
  assert.equal(classifySource({}, 'https://www.tiktok.com/x'), 'TikTok Social');
  assert.equal(classifySource({}, 'https://example.org/article'), 'Referral');
  assert.equal(classifySource({}, ''), 'Direct');
});

test('sanitizes hostnames and paths without query strings or fragments', () => {
  assert.equal(sanitizeHostname('HTTPS://WWW.Google.COM./search?q=x'), 'www.google.com');
  assert.equal(sanitizePath('/en/cg-engine?email=a@b.com#details'), '/en/cg-engine');
  assert.equal(sanitizePath('https://chixiangmotor.com/es/motor-cg?utm_source=x'), '/es/motor-cg');
  assert.equal(sanitizePath('javascript:alert(1)'), '');
});

test('keeps first touch immutable while updating inquiry-session attribution', () => {
  const local = memoryStorage();
  const firstSession = memoryStorage();
  const firstBrowser = browser({
    href: 'https://chixiangmotor.com/en/?gclid=abc123&utm_campaign=cg-search',
    referrer: 'https://www.google.com/search?q=cg+engine',
    localStorage: local,
    sessionStorage: firstSession
  });
  const first = createClient(firstBrowser.win, firstBrowser.doc, { now });
  first.init();

  assert.equal(first.getDiagnostics().first_source, 'Google Ads');
  assert.equal(first.getDiagnostics().session_source, 'Google Ads');
  assert.equal(first.getDiagnostics().landing_page, '/en/');

  const secondBrowser = browser({
    href: 'https://chixiangmotor.com/es/motor-cg?utm_source=facebook&utm_campaign=retarget',
    referrer: 'https://facebook.com/ad',
    localStorage: local,
    sessionStorage: memoryStorage(),
    language: 'es'
  });
  const second = createClient(secondBrowser.win, secondBrowser.doc, { now });
  second.init();

  assert.equal(second.getDiagnostics().lead_id, first.getDiagnostics().lead_id);
  assert.equal(second.getDiagnostics().first_source, 'Google Ads');
  assert.equal(second.getDiagnostics().session_source, 'Facebook');
  assert.equal(second.getDiagnostics().session_landing_page, '/es/motor-cg');
});

test('retains session entry source across same-origin navigation', () => {
  const local = memoryStorage();
  const session = memoryStorage();
  const landingBrowser = browser({
    href: 'https://chixiangmotor.com/en/?utm_source=facebook',
    localStorage: local,
    sessionStorage: session
  });
  createClient(landingBrowser.win, landingBrowser.doc, { now }).init();

  const productBrowser = browser({
    href: 'https://chixiangmotor.com/en/cg-engine',
    referrer: 'https://chixiangmotor.com/en/',
    localStorage: local,
    sessionStorage: session
  });
  const product = createClient(productBrowser.win, productBrowser.doc, { now });
  product.init();
  const diagnostics = product.getDiagnostics();
  assert.equal(diagnostics.session_source, 'Facebook');
  assert.equal(diagnostics.previous_page, '/en/');
  assert.equal(diagnostics.current_page, '/en/cg-engine');
});

test('replaces expired or invalid persistent records', () => {
  const local = memoryStorage({
    cx_attribution_v1: JSON.stringify({
      schema_version: 1,
      lead_id: 'CX-0000000000',
      first_source: 'Direct',
      landing_page: '/old',
      expires_at: '2026-01-01T00:00:00.000Z'
    })
  });
  const b = browser({ href: 'https://chixiangmotor.com/pt/?yclid=123', localStorage: local, language: 'pt' });
  const client = createClient(b.win, b.doc, { now });
  client.init();
  assert.equal(client.getDiagnostics().first_source, 'Yandex Ads');
  assert.notEqual(client.getDiagnostics().lead_id, 'CX-0000000000');
});

test('falls back to document memory when Web Storage is unavailable', () => {
  const b = browser({ localStorage: throwingStorage(), sessionStorage: throwingStorage() });
  const client = createClient(b.win, b.doc, { now });
  assert.doesNotThrow(() => client.init());
  const diagnostics = client.getDiagnostics();
  assert.equal(diagnostics.storage_available, false);
  assert.match(diagnostics.lead_id, /^CX-/);
});
