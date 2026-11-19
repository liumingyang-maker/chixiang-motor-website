const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { routes } = require('../scripts/product-family-owner-manifest');

const root = path.join(__dirname, '..');

const corePages = [
  'en/index.html', 'en/products.html', 'en/about.html', 'en/contact.html', 'en/news.html',
  'es/index.html', 'es/products.html', 'es/about.html', 'es/contacto.html', 'es/news.html',
  'pt/index.html', 'pt/products.html', 'pt/about.html', 'pt/contato.html', 'pt/news.html',
  'ru/index.html', 'ru/products.html', 'ru/about.html', 'ru/kontakty.html', 'ru/news.html',
  'ar/index.html', 'ar/products.html', 'ar/about.html', 'ar/contact.html', 'ar/news.html'
];

const mutablePages = [
  ...corePages,
  ...routes.map(route => route.file),
  'en/product-detail.html',
  'en/how-to-choose-motorcycle-engine-manufacturer-china.html',
  'en/air-cooled-vs-water-cooled-motorcycle-engine.html',
  'en/hw250-hw300-vs-cg250-water-cooled-cargo-tricycle-engine.html',
  'en/bajaj-tvs-replacement-engine-fitment-checklist.html',
  'en/motorcycle-engine-export-packaging-moq-50-mixed-loading-guide.html',
  'en/horizontal-motorcycle-engine-110cc-150cc-selection-guide.html',
  'en/chongqing-motorcycle-engine-factory-qa-dyno-testing-warranty.html'
];

const contactPages = [
  'en/contact.html',
  'es/contacto.html',
  'pt/contato.html',
  'ru/kontakty.html',
  'ar/contact.html'
];

function readFile(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function normalized(text) {
  return text.replace(/\r\n/g, '\n');
}

function oneH1(html, file) {
  const matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(matches.length, 1, `${file}: expected exactly one H1`);
  return matches[0][1].replace(/\s+/g, ' ').trim();
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : null;
}

function jsonLdBlocks(html, file) {
  const scripts = [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.map((match, index) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${file}: invalid JSON-LD at index ${index}: ${error.message}`);
    }
  });
}

function ownerMarker(html) {
  const match = html.match(/<[a-z][\w:-]*\b[^>]*\bdata-product-family-owner=(["'])(.*?)\1[^>]*>/i);
  return match ? match[0] : null;
}

function sourceFileForUrl(rawUrl) {
  const { pathname } = new URL(rawUrl);
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

const APPROVED_ZH_CN_SITEMAP = new Set([
  'https://chixiangmotor.com/zh-cn/',
  'https://chixiangmotor.com/zh-cn/products',
  'https://chixiangmotor.com/zh-cn/horizontal-engine',
  'https://chixiangmotor.com/zh-cn/cg-engine',
  'https://chixiangmotor.com/zh-cn/cargo-tricycle-engine',
  'https://chixiangmotor.com/zh-cn/about',
  'https://chixiangmotor.com/zh-cn/factory',
  'https://chixiangmotor.com/zh-cn/evidence',
  'https://chixiangmotor.com/zh-cn/domestic-wholesale',
  'https://chixiangmotor.com/zh-cn/contact',
  'https://chixiangmotor.com/zh-cn/cb-engine',
  'https://chixiangmotor.com/zh-cn/ac320-atv-engine',
  'https://chixiangmotor.com/zh-cn/engine-parts',
  'https://chixiangmotor.com/zh-cn/guides/',
  'https://chixiangmotor.com/zh-cn/guides/cg250-water-cooled-selection',
  'https://chixiangmotor.com/zh-cn/guides/horizontal-engine-buying-checklist',
  'https://chixiangmotor.com/zh-cn/guides/how-to-verify-engine-factory',
  'https://chixiangmotor.com/zh-cn/guides/engine-fitment-checklist',
  'https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts',
  'https://chixiangmotor.com/zh-cn/bajaj-engine-parts',
  'https://chixiangmotor.com/zh-cn/tvs-engine-parts'
]);

const publicBtvProducts = (JSON.parse(readFile('data/bajaj-tvs-catalog.json')).products || []).filter(p => p && p.public === true);
for (const p of publicBtvProducts) {
  APPROVED_ZH_CN_SITEMAP.add(`https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts/${p.id}`);
}

test('v2.0 contract files, manifest exports, and Cloudflare config remain intact', () => {
  const agentsMd = readFile('AGENTS.md');
  assert.match(agentsMd, /FOUNDATION_CONTRACT:\s*v2\.0/);
  assert.match(agentsMd, /CHIXIANG MOTOR/);

  const manifestSrc = readFile('scripts/site-entity-manifest.js');
  assert.ok(manifestSrc.includes('module.exports'), 'manifest keeps exports');
  assert.ok(manifestSrc.includes('loadManifest'), 'manifest keeps loadManifest');
  for (const key of ['en:', 'es:', 'pt:', 'ru:', 'ar:', "'zh-cn':"]) {
    assert.ok(manifestSrc.includes(key), `manifest supports ${key}`);
  }

  for (const requiredFile of [
    'wrangler.toml',
    'workers/contact-api/wrangler.jsonc',
    'workers/contact-api/src/index.mjs',
    'workers/contact-api/src/contact-handler.mjs',
    'js/main.js',
    'js/yandex-metrica.js',
    'ads/algerie/index.html'
  ]) {
    assert.ok(fs.existsSync(path.join(root, requiredFile)), `missing required infrastructure file: ${requiredFile}`);
  }
});

test('sitemap preserves clean non-www canonical URLs and maps one-to-one to disk files', () => {
  const xml = readFile('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.ok(locs.length >= 78, 'sitemap must include core canonical pages');
  assert.equal(new Set(locs).size, locs.length, 'sitemap URLs must be unique');

  for (const loc of locs) {
    const parsed = new URL(loc);
    assert.equal(parsed.origin, 'https://chixiangmotor.com', loc);
    assert.doesNotMatch(parsed.pathname, /\.html$/i, `sitemap must use clean URLs: ${loc}`);
    assert.ok(!loc.includes('product-detail'), `noindex utility must never appear in sitemap: ${loc}`);
    const file = sourceFileForUrl(loc);
    assert.ok(fs.existsSync(path.join(root, file)), `sitemap target missing on disk: ${file}`);
  }

  assert.match(xml, /en\/ac320-atv-engine/);
  const zhUrls = locs.filter(u => u.startsWith('https://chixiangmotor.com/zh-cn/'));
  assert.equal(zhUrls.length, 21 + publicBtvProducts.length, 'exact approved zh-cn sitemap URLs');
  for (const url of zhUrls) {
    assert.ok(APPROVED_ZH_CN_SITEMAP.has(url), `unexpected zh-cn sitemap URL: ${url}`);
  }
});

test('site-router preserves canonical non-www redirects, P1 route redirects, and zh-cn routing', () => {
  const raw = readFile('workers/site-router.mjs');
  assert.match(raw, /CANONICAL_ORIGIN/);
  assert.match(raw, /LEGACY_PATHS/);
  assert.match(raw, /VERIFICATION_ASSETS/);
  assert.match(raw, /PRODUCT_SERIES_ROUTES/);
  assert.match(raw, /productSeriesRedirect/);
  assert.match(raw, /ALLOWED_ATTRIBUTION_PARAMS/);
  assert.match(raw, /MAX_REDIRECT_LOCATION_LENGTH/);
  assert.match(raw, /productRedirectHref/);
  assert.match(raw, /\/zh-cn/);
  assert.ok(raw.includes('async fetch(request, env)'));
});

test('managed pages retain Layer A invariants: single H1, SEO metadata, stable entity graph, and owner markers', () => {
  for (const file of mutablePages) {
    const html = readFile(file);
    const h1 = oneH1(html, file);
    if (file === 'en/product-detail.html') {
      assert.equal(h1, 'Motorcycle Engine Product Series', `${file}: tool H1 contract changed`);
    } else if (file === 'en/index.html') {
      assert.equal(h1, 'Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in Chongqing, China', `${file}: approved GEO H1 changed`);
    } else {
      assert.ok(h1.length > 0, `${file}: empty H1`);
    }

    const links = tags(html, 'link')
      .map(tag => ({ rel: attribute(tag, 'rel'), href: attribute(tag, 'href') }))
      .filter(l => l.rel === 'canonical');
    if (file !== 'en/product-detail.html') {
      assert.equal(links.length, 1, `${file}: indexable page must have exactly one canonical`);
      assert.match(links[0].href, /^https:\/\/chixiangmotor\.com\//, `${file}: canonical must use official origin`);
      assert.doesNotMatch(links[0].href, /\.html$/i, `${file}: canonical must be clean URL`);
    }

    const blocks = jsonLdBlocks(html, file);
    assert.ok(blocks.length >= 1, `${file}: expected JSON-LD structured data`);

    if (file.startsWith('en/') && file !== 'en/product-detail.html') {
      const nodes = blocks.flatMap(d => Array.isArray(d['@graph']) ? d['@graph'] : [d]);
      const orgNode = nodes.find(n => n['@id'] === 'https://chixiangmotor.com/#organization');
      assert.ok(orgNode, `${file}: missing unified #organization node`);
      assert.equal(orgNode.name, 'CHIXIANG MOTOR', `${file}: organization name must be CHIXIANG MOTOR`);
      assert.equal(orgNode.legalName, 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.', `${file}: organization legalName mismatch`);
    }
  }
});

test('every non-protected product-family owner route publishes its owner marker', () => {
  for (const route of routes) {
    if (route.protected) continue;
    assert.notEqual(ownerMarker(readFile(route.file)), null, `${route.file}: owner marker missing`);
  }
});

test('all five managed procurement forms retain their complete /api/contact and Turnstile contract', () => {
  for (const file of contactPages) {
    const html = normalized(readFile(file));
    const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map(m => m[0]);
    assert.ok(forms.length > 0, `${file}: missing procurement form`);
    const form = forms[0];
    assert.match(form, /action=["']\/api\/contact["']/i, `${file}: action must target /api/contact`);
    assert.match(form, /data-message-turnstile|cf-turnstile/i, `${file}: Turnstile verification support required`);
    assert.match(form, /name=["']name["']/i, `${file}: missing name field`);
    assert.match(form, /name=["'](?:contact|email)["']/i, `${file}: missing contact field`);
    assert.match(form, /name=["'](?:product_interest|product)["']/i, `${file}: missing product field`);
    assert.match(html, /AW-16777656395/, `${file}: Google Ads conversion script required`);
    assert.match(html, /mc\.yandex\.ru\/metrika\/tag\.js|yandex-metrica\.js/, `${file}: Yandex tracking required`);
  }
});
