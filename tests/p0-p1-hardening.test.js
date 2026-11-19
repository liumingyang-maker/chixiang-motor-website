const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const PUBLIC_EN_PAGES = [
  'en/index.html',
  'en/products.html',
  'en/about.html',
  'en/contact.html',
  'en/evidence.html',
  'en/news.html',
  'en/cg-engine.html',
  'en/cb-engine.html',
  'en/horizontal-engine.html',
  'en/engine-parts.html',
  'en/ac320-atv-engine.html',
  'en/bajaj-tvs-engines-parts.html',
  'en/bajaj-engine-parts.html',
  'en/tvs-engine-parts.html',
  'en/air-cooled-vs-water-cooled-motorcycle-engine.html',
  'en/how-to-choose-motorcycle-engine-manufacturer-china.html',
  'en/hw250-hw300-vs-cg250-water-cooled-cargo-tricycle-engine.html',
  'en/bajaj-tvs-replacement-engine-fitment-checklist.html'
];

test('llms.txt exists with unified entity and 10,000+ capacity', () => {
  const llms = read('llms.txt');
  assert.match(llms, /CHIXIANG MOTOR/);
  assert.match(llms, /Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\./);
  assert.match(llms, /10,000\+/);
  assert.match(llms, /https:\/\/chixiangmotor\.com\/en\/evidence/);
  assert.match(llms, /https:\/\/chixiangmotor\.com\/en\/bajaj-tvs-engines-parts/);
});

test('robots.txt explicitly allows approved AI crawlers and declares sitemap', () => {
  const robots = read('robots.txt');
  for (const bot of ['OAI-SearchBot', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended']) {
    assert.match(robots, new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Allow:\\s*/`, 'i'), `Missing Allow for ${bot}`);
  }
  assert.match(robots, /Sitemap:\s*https:\/\/chixiangmotor\.com\/sitemap\.xml/i);
});

test('zh-cn/evidence.html publishes reciprocal EN/zh-CN hreflangs only', () => {
  const html = read('zh-cn/evidence.html');
  assert.match(html, /hreflang="en"\s+href="https:\/\/chixiangmotor\.com\/en\/evidence"/);
  assert.match(html, /hreflang="zh-CN"\s+href="https:\/\/chixiangmotor\.com\/zh-cn\/evidence"/);
  assert.match(html, /hreflang="x-default"\s+href="https:\/\/chixiangmotor\.com\/en\/evidence"/);
  assert.doesNotMatch(html, /<link\s+rel="alternate"[^>]*hreflang="(?:ru|es|pt|ar)"/);
});

test('site-router normalizes /zh-cn root and trailing slashes on zh-cn sub-routes', async () => {
  const mod = await import(pathToFileURL(path.join(root, 'workers/site-router.mjs')).href);
  const env = { ASSETS: { fetch: async (req) => new Response(`asset:${new URL(req.url).pathname}`, { status: 200 }) } };

  const resRoot = await mod.default.fetch(new Request('https://chixiangmotor.com/zh-cn'), env);
  assert.equal(resRoot.status, 301);
  assert.equal(resRoot.headers.get('Location'), 'https://chixiangmotor.com/zh-cn/');

  const resSubSlash = await mod.default.fetch(new Request('https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts/'), env);
  assert.equal(resSubSlash.status, 301);
  assert.equal(resSubSlash.headers.get('Location'), 'https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts');

  const resGuides = await mod.default.fetch(new Request('https://chixiangmotor.com/zh-cn/guides/'), env);
  assert.equal(resGuides.status, 200);
});

test('all 16 public English pages enforce unified nav, footer, entity schema, and clean copy', () => {
  for (const rel of PUBLIC_EN_PAGES) {
    const html = read(rel);

    const navMatch = html.match(/<nav class="navbar">[\s\S]*?<\/nav>/);
    assert.ok(navMatch, `${rel}: missing .navbar`);
    assert.ok(navMatch[0].includes('href="/en/engine-parts"'), `${rel}: navbar missing Engine Parts`);
    assert.ok(navMatch[0].includes('href="/en/engine-parts/hw-series"'), `${rel}: navbar missing HW200-HW350 Parts`);
    assert.ok(navMatch[0].includes('href="/en/bajaj-tvs-engines-parts"'), `${rel}: navbar missing Bajaj / TVS`);
    assert.ok(navMatch[0].includes('href="/en/evidence"'), `${rel}: navbar missing Evidence`);

    const mnavMatch = html.match(/<ul class="mobile-nav-list"[\s\S]*?<\/ul>/);
    assert.ok(mnavMatch, `${rel}: missing .mobile-nav-list`);
    assert.ok(mnavMatch[0].includes('href="/en/bajaj-tvs-engines-parts"'), `${rel}: mobile-nav missing Bajaj / TVS`);
    assert.ok(mnavMatch[0].includes('href="/en/evidence"'), `${rel}: mobile-nav missing Evidence`);
    assert.ok(!mnavMatch[0].includes('/en/product-detail?series='), `${rel}: mobile-nav still links legacy product-detail`);

    assert.ok(html.includes('<footer class="footer">'), `${rel}: missing footer`);
    assert.ok(html.includes("designated export division"), `${rel}: missing footer export division note`);
    assert.ok(!html.includes('13140229441'), `${rel}: outdated phone number present`);
    assert.ok(!html.includes('8,000+'), `${rel}: stale 8,000+ capacity claim present`);
    assert.ok(!html.includes('>8K<'), `${rel}: stale 8K capacity badge present`);
    assert.ok(!/confirm per order|subject to configuration/i.test(html), `${rel}: defensive copy present`);
    assert.doesNotMatch(html, /href="(?:https:\/\/chixiangmotor\.com)?\/zh-cn\/[^"]+\/"/, `${rel}: trailing slash on non-root /zh-cn/ link`);

    const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    const allNodes = jsonLdMatches.flatMap((m) => {
      const parsed = JSON.parse(m[1]);
      return Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
    });
    const org = allNodes.find((n) => n['@id'] === 'https://chixiangmotor.com/#organization');
    assert.ok(org, `${rel}: missing unified #organization schema node`);
    assert.equal(org.name, 'CHIXIANG MOTOR');
    assert.equal(org.legalName, 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.');
    assert.ok(org.address && org.address['@type'] === 'PostalAddress', `${rel}: missing PostalAddress`);
  }

  const productsHtml = read('en/products.html');
  assert.doesNotMatch(productsHtml, /卧机系列|CG风冷系列|CG平衡轴|海啸系列|电喷水冷|发动机零件/);
});

test('English Bajaj/TVS pages carry differentiated titles, H1s, tracking, OG, robots, and basket script', () => {
  const btvPages = [
    'en/bajaj-tvs-engines-parts.html',
    'en/bajaj-engine-parts.html',
    'en/tvs-engine-parts.html'
  ];
  const titles = new Set();
  const h1s = new Set();
  const descs = new Set();

  for (const rel of btvPages) {
    const html = read(rel);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const h1 = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
    const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && h1 && desc, `${rel}: missing title/h1/desc`);
    titles.add(title);
    h1s.add(h1);
    descs.add(desc);

    assert.ok(html.includes('AW-16777656395'), `${rel}: missing Google Ads gtag`);
    assert.ok(html.includes('109483511'), `${rel}: missing Yandex Metrica`);
    assert.match(html, /<meta name="robots" content="index,\s*follow,\s*max-image-preview:large">/);
    assert.ok(html.includes('property="og:title"'), `${rel}: missing og:title`);
    assert.ok(html.includes('property="og:description"'), `${rel}: missing og:description`);
    assert.ok(html.includes('property="og:url"'), `${rel}: missing og:url`);
    assert.ok(html.includes('property="og:image"'), `${rel}: missing og:image`);
    assert.ok(html.includes('/js/btv-catalog-basket.js'), `${rel}: missing batch basket script`);
  }

  assert.equal(titles.size, 3);
  assert.equal(h1s.size, 3);
  assert.equal(descs.size, 3);
});

test('batch OEM quote basket and contact prefill scripts expose BOM contracts', () => {
  const basketJs = read('js/btv-catalog-basket.js');
  assert.match(basketJs, /btvQuoteBasket/);
  assert.match(basketJs, /btv-part-checkbox/);
  assert.match(basketJs, /btv_items/);

  const prefillJs = read('js/btv-inquiry-prefill.js');
  assert.match(prefillJs, /btvSelectedPartsSummary/);
  assert.match(prefillJs, /btv_items/);
});

test('Bajaj Boxer CT100 / BM100 live product page and model hub publish OEM specs and real photos', () => {
  const detailEn = read('en/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine.html');
  for (const needle of [
    '99.27 cc',
    '53.0 × 45.0 mm',
    '6.03 kW (8.2 PS) @ 7,500 rpm',
    '8.05 N·m @ 4,500 rpm',
    '9.5 : 1',
    '4-speed constant mesh',
    '1.0 L',
    '428-14T',
    '"@type": "Product"',
    'AW-16777656395',
    '109483511'
  ]) {
    assert.ok(detailEn.includes(needle), `Missing CT100 detail spec/tag: ${needle}`);
  }

  for (const imgRel of [
    'images/bajaj-tvs/bajaj-boxer-ct100-bm100-clutch-side.webp',
    'images/bajaj-tvs/bajaj-boxer-ct100-bm100-magneto-side.webp',
    'images/bajaj-tvs/bajaj-boxer-ct100-bm100-sprocket-interface.webp'
  ]) {
    assert.ok(fs.existsSync(path.join(root, imgRel)), `Missing image: ${imgRel}`);
    assert.ok(detailEn.includes(imgRel), `Detail page missing photo: ${imgRel}`);
  }

  const bajajBrand = read('en/bajaj-engine-parts.html');
  assert.ok(bajajBrand.includes('bajaj-boxer-ct100-bm100-complete-engine'), 'Bajaj brand page must link CT100 engine');
  assert.ok(bajajBrand.includes('bajaj-boxer-bm150-complete-engine'), 'Bajaj brand page must link BM150 engine');
  assert.ok(bajajBrand.includes('bajaj-re-4s-200-complete-engine'), 'Bajaj brand page must link RE 4S engine');
  assert.ok(bajajBrand.includes('36DU4079'), 'Bajaj brand page must include verified OEM cover PN');
  assert.ok(bajajBrand.includes('36PF0004'), 'Bajaj brand page must include verified BM150 OEM crankcase PN');

  const tvsBrand = read('en/tvs-engine-parts.html');
  assert.ok(tvsBrand.includes('tvs-hlx-150-complete-engine'), 'TVS brand page must link HLX 150 engine');
  assert.ok(tvsBrand.includes('tvs-king-200-complete-engine'), 'TVS brand page must link TVS King engine');
  assert.ok(tvsBrand.includes('147.49 cc'), 'TVS brand page must publish HLX 150 displacement');
  assert.ok(tvsBrand.includes('199.26 cc'), 'TVS brand page must publish TVS King displacement');

  const modelChecks = [
    ['en/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine.html', ['144.8 cc', '56.0 × 58.8 mm', '36PF0004', '"@type": "Product"']],
    ['en/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine.html', ['198.88 cc', '63.5 × 62.8 mm', '4 Forward + 1 Reverse', 'bajaj-re-4s-200-starter-side.webp', 'bajaj-re-4s-200-clutch-interface.webp', '"@type": "Product"']],
    ['en/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine.html', ['147.49 cc', '57.0 × 57.8 mm', '8.9 kW (11.93 HP) @ 7,500 rpm', '12.3 N·m @ 5,000 rpm', '"@type": "Product"']],
    ['en/bajaj-tvs-engines-parts/tvs-king-200-complete-engine.html', ['199.26 cc', '62.0 × 66.0 mm', '4 Forward + 1 Reverse', '9.6 ± 0.3 : 1', '"@type": "Product"']]
  ];
  for (const [rel, needles] of modelChecks) {
    const html = read(rel);
    for (const needle of needles) {
      assert.ok(html.includes(needle), `${rel}: missing expected spec/asset "${needle}"`);
    }
  }
  for (const imgRel of [
    'images/bajaj-tvs/bajaj-re-4s-200-starter-side.webp',
    'images/bajaj-tvs/bajaj-re-4s-200-clutch-interface.webp'
  ]) {
    assert.ok(fs.existsSync(path.join(root, imgRel)), `Missing image: ${imgRel}`);
  }
});

test('localized homepages avoid untranslated English trust-wall strings and publish unified commercial terms', () => {
  for (const file of ['es/index.html', 'pt/index.html', 'ru/index.html', 'ar/index.html']) {
    const html = read(file);
    assert.ok(!html.includes('Monthly Engine Capacity'), `${file}: untranslated trust-wall label`);
    assert.ok(!html.includes('First-Pass Yield Rate'), `${file}: untranslated trust-wall label`);
    assert.ok(!html.includes('CCC by approved model'), `${file}: untranslated trust-wall label`);
  }
  assert.ok(read('es/index.html').includes('años de fabricación'), 'es/index.html must use proper Spanish accents');
  assert.ok(read('es/about.html').includes('fábrica'), 'es/about.html must use proper Spanish accents');
  const { officialSameAs } = require('../scripts/site-entity-manifest');
  for (const file of ['en/about.html', 'en/evidence.html', 'llms.txt']) {
    const text = read(file);
    assert.ok(text.includes('50'), `${file}: missing 50-unit MOQ`);
    assert.ok(text.includes('10 working days'), `${file}: missing 10 working days lead time`);
    assert.ok(text.includes('FOB Guangzhou'), `${file}: missing FOB Guangzhou default`);
    assert.ok(text.includes('60-day'), `${file}: missing 60-day warranty`);
  }
  for (const file of ['en/index.html', 'en/about.html', 'en/evidence.html', 'zh-cn/evidence.html', 'llms.txt']) {
    const text = read(file);
    for (const url of officialSameAs) {
      assert.ok(text.includes(url), `${file}: missing verified sameAs channel ${url}`);
    }
  }
});
