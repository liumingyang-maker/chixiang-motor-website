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
  'en/how-to-choose-motorcycle-engine-manufacturer-china.html'
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

    const navMatch = html.match(/<ul class="nav-links"[\s\S]*?<\/ul>/);
    assert.ok(navMatch, `${rel}: missing .nav-links`);
    assert.ok(navMatch[0].includes('href="/en/bajaj-tvs-engines-parts"'), `${rel}: nav-links missing Bajaj / TVS`);
    assert.ok(navMatch[0].includes('href="/en/evidence"'), `${rel}: nav-links missing Evidence`);

    const mnavMatch = html.match(/<ul class="mobile-nav-list"[\s\S]*?<\/ul>/);
    assert.ok(mnavMatch, `${rel}: missing .mobile-nav-list`);
    assert.ok(mnavMatch[0].includes('href="/en/bajaj-tvs-engines-parts"'), `${rel}: mobile-nav missing Bajaj / TVS`);
    assert.ok(mnavMatch[0].includes('href="/en/evidence"'), `${rel}: mobile-nav missing Evidence`);
    assert.ok(!mnavMatch[0].includes('/en/product-detail?series='), `${rel}: mobile-nav still links legacy product-detail`);

    assert.ok(html.includes('<footer class="footer">'), `${rel}: missing footer`);
    assert.ok(html.includes("designated export division"), `${rel}: missing footer export division note`);
    assert.ok(!html.includes('13140229441'), `${rel}: outdated phone number present`);
    assert.ok(!html.includes('8,000+'), `${rel}: stale 8,000+ capacity claim present`);
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
