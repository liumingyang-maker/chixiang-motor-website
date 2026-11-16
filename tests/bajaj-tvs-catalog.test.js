const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const catalog = JSON.parse(read('data/bajaj-tvs-catalog.json'));

const HUB_PAGES = [
  {
    file: 'en/bajaj-tvs-engines-parts.html',
    canonical: 'https://chixiangmotor.com/en/bajaj-tvs-engines-parts',
    h1: 'Engines & Parts for Bajaj & TVS Motorcycles',
    lang: 'en'
  },
  {
    file: 'zh-cn/bajaj-tvs-engines-parts.html',
    canonical: 'https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts',
    h1: '适用于 Bajaj / TVS 车型的发动机与配件',
    lang: 'zh'
  }
];

const BRAND_PAGES = [
  {
    file: 'en/bajaj-engine-parts.html',
    canonical: 'https://chixiangmotor.com/en/bajaj-engine-parts',
    brand: 'bajaj',
    lang: 'en'
  },
  {
    file: 'en/tvs-engine-parts.html',
    canonical: 'https://chixiangmotor.com/en/tvs-engine-parts',
    brand: 'tvs',
    lang: 'en'
  },
  {
    file: 'zh-cn/bajaj-engine-parts.html',
    canonical: 'https://chixiangmotor.com/zh-cn/bajaj-engine-parts',
    brand: 'bajaj',
    lang: 'zh'
  },
  {
    file: 'zh-cn/tvs-engine-parts.html',
    canonical: 'https://chixiangmotor.com/zh-cn/tvs-engine-parts',
    brand: 'tvs',
    lang: 'zh'
  }
];

const ALL_PAGES = [...HUB_PAGES, ...BRAND_PAGES];

function h1Text(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() : '';
}

function canonicalOf(html) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/i);
  return match ? match[1] : '';
}

test('Bajaj/TVS catalog is one shared data source with brands and categories', () => {
  assert.ok(Array.isArray(catalog.brands) && catalog.brands.length >= 2);
  assert.deepEqual(catalog.brands.map((b) => b.id).sort(), ['bajaj', 'tvs']);
  const categoryIds = catalog.categories.map((c) => c.id).sort();
  for (const id of ['complete-engines', 'crankcases', 'engine-covers']) {
    assert.ok(categoryIds.includes(id), `missing category ${id}`);
  }
  assert.ok(Array.isArray(catalog.products), 'products array required');
  for (const product of catalog.products) {
    assert.ok(product.id, 'product id required');
    assert.ok(product.name_en && product.name_zh, 'product bilingual names required');
    assert.ok(product.category, 'product category required');
    assert.ok(Array.isArray(product.vehicle_brands) && product.vehicle_brands.length, 'vehicle_brands required');
  }
});

test('every Bajaj/TVS page has unique title, self canonical and language pair', () => {
  const titles = new Set();
  for (const page of ALL_PAGES) {
    const html = read(page.file);
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    assert.ok(title.trim(), `${page.file}: title`);
    assert.ok(!titles.has(title), `${page.file}: duplicate title`);
    titles.add(title);
    assert.equal(canonicalOf(html), page.canonical, `${page.file}: canonical`);
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)];
    assert.ok(alternates.length >= 2, `${page.file}: hreflang pair`);
    const self = alternates.find((m) => m[1].toLowerCase() === (page.lang === 'zh' ? 'zh-cn' : 'en'));
    assert.ok(self, `${page.file}: self hreflang`);
    assert.equal(self[2], page.canonical, `${page.file}: self hreflang URL`);
    assert.match(html, /aria-label="Breadcrumb"/i, `${page.file}: breadcrumb`);
  }
});

test('hub and brand pages carry the approved hero copy and CTAs', () => {
  for (const page of HUB_PAGES) {
    const html = read(page.file);
    assert.equal(h1Text(html), page.h1, `${page.file}: H1`);
    if (page.lang === 'en') {
      assert.ok(html.includes('Complete engines, crankcases and engine covers.'));
      assert.ok(html.includes('View Products'));
      assert.ok(html.includes('Request a Quote'));
    } else {
      assert.ok(html.includes('发动机总成、曲轴箱与发动机盖件'));
      assert.ok(html.includes('查看产品'));
      assert.ok(html.includes('获取报价'));
    }
    assert.ok(html.includes('id="procurement"'), `${page.file}: procurement block`);
    assert.ok(html.includes('id="crankcases"'), `${page.file}: crankcases anchor`);
    assert.ok(html.includes('id="engine-covers"'), `${page.file}: engine covers anchor`);
    assert.ok(html.includes('id="complete-engines"'), `${page.file}: complete engines anchor`);
    assert.ok(html.includes('id="brands"'), `${page.file}: brand entries`);
    assert.ok(html.includes('/en/bajaj-engine-parts') || html.includes('/zh-cn/bajaj-engine-parts/'), `${page.file}: bajaj entry`);
    assert.ok(html.includes('/en/tvs-engine-parts') || html.includes('/zh-cn/tvs-engine-parts/'), `${page.file}: tvs entry`);
  }
});

test('brand pages filter from the shared catalog and link quote context', () => {
  for (const page of BRAND_PAGES) {
    const html = read(page.file);
    const otherBrand = page.brand === 'bajaj' ? 'tvs' : 'bajaj';
    assert.ok(html.includes(`btv_brand=${page.brand}`), `${page.file}: brand quote context`);
    assert.ok(
      !html.includes(`data-btv-brand="${otherBrand}"`),
      `${page.file}: must not show ${otherBrand} brand card`
    );
    assert.ok(html.includes('data-btv-category="crankcases"'), `${page.file}: crankcases section`);
    assert.ok(html.includes('data-btv-category="engine-covers"'), `${page.file}: covers section`);
    assert.ok(html.includes('data-btv-category="complete-engines"'), `${page.file}: engines section`);
    assert.ok(html.includes(`id="crankcases"`), `${page.file}: crankcases anchor`);
  }
});

test('catalog renderer is idempotent and never invents public products', () => {
  const check = spawnSync(process.execPath, ['scripts/render-bajaj-tvs-catalog.js', '--check'], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(check.status, 0, check.stdout + check.stderr);
  assert.match(check.stdout, /0 Bajaj\/TVS catalog pages need updates/);

  const publicProducts = (catalog.products || []).filter((p) => p && p.public === true);
  for (const product of publicProducts) {
    for (const file of [
      `en/bajaj-tvs-engines-parts/${product.id}.html`,
      `zh-cn/bajaj-tvs-engines-parts/${product.id}.html`
    ]) {
      assert.ok(fs.existsSync(path.join(root, file)), `${file}: public product detail missing`);
    }
  }
  for (const page of ALL_PAGES) {
    const html = read(page.file);
    assert.doesNotMatch(html, /开发中|即将上市|样件验证|coming soon|in development/i, `${page.file}: stage label`);
    assert.doesNotMatch(html, /aggregateRating|"review"|InStock/i, `${page.file}: commerce schema leak`);
  }
});

test('inquiry links reuse the existing Worker field whitelist only', () => {
  for (const page of ALL_PAGES) {
    const html = read(page.file);
    const links = [...html.matchAll(/href="([^"]*\/contact[^"]*)"/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
    const quoteLinks = links.filter((href) => href.includes('source_form=bajaj-tvs-catalog'));
    assert.ok(quoteLinks.length >= 1, `${page.file}: quote entry`);
    for (const href of quoteLinks) {
      const url = new URL(href, 'https://chixiangmotor.com');
      assert.equal(url.searchParams.get('product_interest'), 'parts');
      assert.equal(url.searchParams.get('source_form'), 'bajaj-tvs-catalog');
      for (const key of url.searchParams.keys()) {
        assert.ok(
          ['product_interest', 'source_form', 'source_cta', 'btv_part', 'btv_pn', 'btv_brand', 'engine_code', 'vehicle'].includes(key),
          `${page.file}: unexpected form field ${key}`
        );
      }
    }
  }
  const prefill = read('js/btv-inquiry-prefill.js');
  for (const field of ['source_form', 'source_cta', 'engine_code', 'vehicle', 'product_interest', 'requirements']) {
    assert.ok(prefill.includes(field), `prefill handles ${field}`);
  }
  const handler = read('workers/contact-api/src/contact-handler.mjs');
  for (const field of ['source_form', 'source_cta', 'engine_code', 'vehicle', 'requirements']) {
    assert.ok(handler.includes(`'${field}'`), `worker already whitelists ${field}`);
  }
});

test('existing engine-parts pages keep their contract and add only the new entry', () => {
  const en = read('en/engine-parts.html');
  assert.ok(en.includes('id="parts-specifications"'), 'en parts anchor preserved');
  assert.ok(en.includes('PRODUCT FAMILY OWNER START'), 'en owner region preserved');
  assert.ok(en.includes('id="bajaj-tvs-parts"'), 'en bajaj-tvs entry');
  assert.ok(en.includes('/en/bajaj-tvs-engines-parts'), 'en hub link');
  assert.equal((en.match(/<h1/g) || []).length, 1, 'en single H1');

  const zh = read('zh-cn/engine-parts.html');
  assert.ok(zh.includes('id="bajaj-tvs-parts"'), 'zh bajaj-tvs entry');
  assert.ok(zh.includes('/zh-cn/bajaj-tvs-engines-parts/'), 'zh hub link');
  assert.equal((zh.match(/<h1/g) || []).length, 1, 'zh single H1');
});

test('sitemap registers the six new canonical URLs once each', () => {
  const sitemap = read('sitemap.xml');
  for (const page of ALL_PAGES) {
    const needle = `<loc>${page.canonical}</loc>`;
    const count = sitemap.split(needle).length - 1;
    assert.equal(count, 1, `sitemap ${page.canonical} count ${count}`);
  }
});

test('home and product centers expose a minimal Bajaj/TVS entry without reordering nav', () => {
  const enHome = read('en/index.html');
  assert.ok(enHome.includes('/en/bajaj-tvs-engines-parts'), 'en home entry');
  const zhHome = read('zh-cn/index.html');
  assert.ok(zhHome.includes('/zh-cn/bajaj-tvs-engines-parts/'), 'zh home entry');
  const enProducts = read('en/products.html');
  assert.ok(enProducts.includes('/en/bajaj-tvs-engines-parts'), 'en products entry');
  const zhProducts = read('zh-cn/products.html');
  assert.ok(zhProducts.includes('/zh-cn/bajaj-tvs-engines-parts/'), 'zh products entry');
  // Existing nav labels remain the primary product families.
  assert.ok(enHome.includes('/en/cg-engine') && enHome.includes('/en/cb-engine'));
  assert.ok(zhHome.includes('/zh-cn/cg-engine/') && zhHome.includes('/zh-cn/cb-engine/'));
});

test('Bajaj/TVS pages avoid banned commercial and fabricated-fact patterns', () => {
  const banned = [
    /全国前三/, /Top\s*10/i, /24\s*小时(响应|回复)/, /within 24 hours/i, /reply within/i,
    /官方授权/, /完全兼容/, /现货批发/, /strong torque/i, /low vibration/i,
    /aggregateRating/i, /InStock/i, /Product"\s*,\s*"Offer/
  ];
  for (const page of ALL_PAGES) {
    const html = read(page.file);
    for (const pattern of banned) {
      assert.doesNotMatch(html, pattern, `${page.file}: banned ${pattern}`);
    }
  }
});

test('English Bajaj/TVS pages enforce unified CHIXIANG MOTOR entity and GEO standards', () => {
  for (const page of ALL_PAGES.filter((p) => p.lang === 'en')) {
    const html = read(page.file);
    assert.match(html, /"name":\s*"CHIXIANG MOTOR"/, `${page.file}: unified Organization name`);
    assert.match(html, /"legalName":\s*"Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\."/, `${page.file}: unified legalName`);
    assert.doesNotMatch(html, /Dexie|Chide|德谐|驰德|pending legal-name verification/i, `${page.file}: no multi-entity split copy`);
    assert.match(html, /href="\/en\/evidence"/, `${page.file}: internal link to /en/evidence`);
    assert.match(html, /Mixed Container Loading/i, `${page.file}: mixed container loading copy`);
    assert.match(html, /referenced solely for OEM fitment compatibility\. Chixiang Motor supplies independent aftermarket replacement engines and components\./, `${page.file}: international fitment note`);
    assert.match(html, /Export documentation and logistics are executed through Chixiang's designated export division\./, `${page.file}: footer export note`);
  }
});
