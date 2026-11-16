const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.join(__dirname, '..');
const generator = path.join(repoRoot, 'scripts', 'render-bajaj-tvs-catalog.js');

function runGenerator({ root, catalog, check = false }) {
  const env = {
    ...process.env,
    BTV_ROOT: root,
    BTV_CATALOG: catalog
  };
  const args = check ? [generator, '--check'] : [generator];
  return spawnSync(process.execPath, args, {
    cwd: repoRoot,
    env,
    encoding: 'utf8'
  });
}

function writeCatalog(catalogPath, products, extra = {}) {
  const data = {
    version: 1,
    updated: '2026-01-01',
    brands: [
      { id: 'bajaj', name_en: 'Bajaj', name_zh: 'Bajaj', path_en: '/en/bajaj-engine-parts', path_zh: '/zh-cn/bajaj-engine-parts/' },
      { id: 'tvs', name_en: 'TVS', name_zh: 'TVS', path_en: '/en/tvs-engine-parts', path_zh: '/zh-cn/tvs-engine-parts/' }
    ],
    categories: [
      { id: 'crankcases', name_en: 'Crankcases', name_zh: '箱体、曲轴箱', anchor: 'crankcases', description_en: 'Crankcases.', description_zh: '曲轴箱。', subcategories: [] },
      { id: 'engine-covers', name_en: 'Engine Covers', name_zh: '发动机盖件', anchor: 'engine-covers', description_en: 'Covers.', description_zh: '盖件。', subcategories: [] },
      { id: 'complete-engines', name_en: 'Complete Engines', name_zh: '发动机总成', anchor: 'complete-engines', description_en: 'Engines.', description_zh: '总成。', subcategories: [] }
    ],
    products,
    ...extra
  };
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2), 'utf8');
}

function makeWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'btv-lifecycle-'));
  for (const rel of [
    'en/bajaj-tvs-engines-parts.html',
    'en/bajaj-engine-parts.html',
    'en/tvs-engine-parts.html',
    'zh-cn/bajaj-tvs-engines-parts.html',
    'zh-cn/bajaj-engine-parts.html',
    'zh-cn/tvs-engine-parts.html'
  ]) {
    const dest = path.join(root, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, rel), dest);
  }
  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
    'utf8');
  return root;
}

function detailFiles(root) {
  const out = [];
  for (const dir of ['en/bajaj-tvs-engines-parts', 'zh-cn/bajaj-tvs-engines-parts']) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (name.endsWith('.html')) out.push(path.join(dir, name).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}

test('lifecycle: publish generates EN/ZH details, links, images and inquiry context', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [{
    id: 'test-cover-01',
    name_en: 'Test Cover',
    name_zh: '测试盖件',
    part_number: 'T-001',
    category: 'engine-covers',
    vehicle_brands: ['bajaj'],
    photos: [{ src: 'images/parts.webp', alt_en: 'Cover', alt_zh: '盖件' }],
    public: true
  }]);
  const result = runGenerator({ root, catalog });
  assert.equal(result.status, 0, result.stdout + result.stderr);

  const enDetail = path.join(root, 'en/bajaj-tvs-engines-parts/test-cover-01.html');
  const zhDetail = path.join(root, 'zh-cn/bajaj-tvs-engines-parts/test-cover-01.html');
  assert.ok(fs.existsSync(enDetail), 'EN detail generated');
  assert.ok(fs.existsSync(zhDetail), 'ZH detail generated');

  const enHub = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts.html'), 'utf8');
  assert.ok(enHub.includes('/en/bajaj-tvs-engines-parts/test-cover-01'), 'hub card links to detail');
  assert.ok(enHub.includes('View Details'), 'detail entry label');
  assert.ok(enHub.includes('/en/contact?product_interest=parts'), 'quote link kept separate');
  assert.ok(enHub.includes("url('/images/parts.webp')"), 'root-relative product image');

  const detail = fs.readFileSync(enDetail, 'utf8');
  assert.ok(detail.includes('mobileNav'), 'mobile menu');
  assert.ok(detail.includes('<footer'), 'footer');
  assert.equal((detail.match(/<h1/g) || []).length, 1, 'single H1');
  assert.ok(detail.includes('/zh-cn/bajaj-tvs-engines-parts/test-cover-01'), 'language switch to ZH');
  assert.ok(detail.includes('source_form=bajaj-tvs-catalog'), 'inquiry context');

  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes('/en/bajaj-tvs-engines-parts/test-cover-01'), 'sitemap EN detail');
  assert.ok(sitemap.includes('/zh-cn/bajaj-tvs-engines-parts/test-cover-01'), 'sitemap ZH detail');

  const check = runGenerator({ root, catalog, check: true });
  assert.equal(check.status, 0, check.stdout + check.stderr);
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: brand filter keeps only matching products on brand pages', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [
    { id: 'bajaj-part', name_en: 'Bajaj Part', name_zh: 'Bajaj 件', category: 'crankcases', vehicle_brands: ['bajaj'], public: true },
    { id: 'tvs-part', name_en: 'TVS Part', name_zh: 'TVS 件', category: 'crankcases', vehicle_brands: ['tvs'], public: true }
  ]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  const bajajPage = fs.readFileSync(path.join(root, 'en/bajaj-engine-parts.html'), 'utf8');
  const tvsPage = fs.readFileSync(path.join(root, 'en/tvs-engine-parts.html'), 'utf8');
  assert.ok(bajajPage.includes('data-btv-product="bajaj-part"'), 'bajaj page shows bajaj part');
  assert.ok(!bajajPage.includes('data-btv-product="tvs-part"'), 'bajaj page hides tvs part');
  assert.ok(tvsPage.includes('data-btv-product="tvs-part"'), 'tvs page shows tvs part');
  assert.ok(!tvsPage.includes('data-btv-product="bajaj-part"'), 'tvs page hides bajaj part');
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: category filter groups the shared product set', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [
    { id: 'part-crank', name_en: 'Crank', name_zh: '箱体', category: 'crankcases', vehicle_brands: ['bajaj'], public: true },
    { id: 'part-cover', name_en: 'Cover', name_zh: '盖件', category: 'engine-covers', vehicle_brands: ['tvs'], public: true }
  ]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  const hub = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts.html'), 'utf8');
  const crankSection = hub.split('id="crankcases"')[1].split('id="engine-covers"')[0];
  const coverSection = hub.split('id="engine-covers"')[1].split('id="complete-engines"')[0];
  assert.ok(crankSection.includes('data-btv-product="part-crank"'), 'crankcases owns crank part');
  assert.ok(!crankSection.includes('data-btv-product="part-cover"'), 'crankcases hides cover part');
  assert.ok(coverSection.includes('data-btv-product="part-cover"'), 'covers owns cover part');
  assert.ok(!coverSection.includes('data-btv-product="part-crank"'), 'covers hides crank part');
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: public:false removes details and check reports clean', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  const product = { id: 'temp-part', name_en: 'Temp', name_zh: '临', category: 'crankcases', vehicle_brands: ['bajaj'], public: true };
  writeCatalog(catalog, [product]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.equal(detailFiles(root).length, 2, 'two detail files');

  product.public = false;
  writeCatalog(catalog, [product]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.equal(detailFiles(root).length, 0, 'details removed on unpublish');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.ok(!sitemap.includes('bajaj-tvs-engines-parts/temp-part'), 'sitemap entry removed');
  const check = runGenerator({ root, catalog, check: true });
  assert.equal(check.status, 0, check.stdout + check.stderr);
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: deleting a product removes generated details', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [{ id: 'gone-part', name_en: 'Gone', name_zh: '删', category: 'engine-covers', vehicle_brands: ['tvs'], public: true }]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.equal(detailFiles(root).length, 2);
  writeCatalog(catalog, []);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.equal(detailFiles(root).length, 0, 'details removed after JSON delete');
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: --check detects orphan managed detail pages', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [{ id: 'live-part', name_en: 'Live', name_zh: '在', category: 'crankcases', vehicle_brands: ['bajaj'], public: true }]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  const orphan = path.join(root, 'en/bajaj-tvs-engines-parts/orphan-part.html');
  fs.writeFileSync(orphan, '<!DOCTYPE html>\n<!-- BAJAJ-TVS DETAIL GENERATED -->\n<html></html>\n', 'utf8');
  const check = runGenerator({ root, catalog, check: true });
  assert.equal(check.status, 1, 'check must fail on orphan');
  assert.match(check.stdout, /orphan-part\.html/);
  writeCatalog(catalog, [{ id: 'live-part', name_en: 'Live', name_zh: '在', category: 'crankcases', vehicle_brands: ['bajaj'], public: true }]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.ok(!fs.existsSync(orphan), 'orphan removed on apply');
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: unmanaged files in detail dirs are never deleted', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, []);
  const keep = path.join(root, 'en/bajaj-tvs-engines-parts/hand-made.html');
  fs.mkdirSync(path.dirname(keep), { recursive: true });
  fs.writeFileSync(keep, '<!DOCTYPE html><html>hand made</html>\n', 'utf8');
  assert.equal(runGenerator({ root, catalog }).status, 0);
  assert.ok(fs.existsSync(keep), 'unmanaged file preserved');
  const check = runGenerator({ root, catalog, check: true });
  assert.equal(check.status, 1, 'check reports unmanaged file');
  assert.match(check.stdout, /hand-made\.html/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('validation rejects duplicate and illegal product ids', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [
    { id: 'dup-part', name_en: 'A', name_zh: '甲', category: 'crankcases', vehicle_brands: ['bajaj'], public: true },
    { id: 'dup-part', name_en: 'B', name_zh: '乙', category: 'crankcases', vehicle_brands: ['bajaj'], public: true }
  ]);
  const dup = runGenerator({ root, catalog });
  assert.equal(dup.status, 2, 'duplicate id rejected');
  assert.match(dup.stderr, /duplicate product id/);

  writeCatalog(catalog, [
    { id: '../evil', name_en: 'E', name_zh: '坏', category: 'crankcases', vehicle_brands: ['bajaj'], public: true }
  ]);
  const evil = runGenerator({ root, catalog });
  assert.equal(evil.status, 2, 'illegal id rejected');
  assert.match(evil.stderr, /kebab-case/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('validation rejects illegal image paths and unknown references', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [
    { id: 'img-part', name_en: 'I', name_zh: '图', category: 'crankcases', vehicle_brands: ['bajaj'], photos: [{ src: '../secret.png' }], public: true }
  ]);
  const traversal = runGenerator({ root, catalog });
  assert.equal(traversal.status, 2);
  assert.match(traversal.stderr, /illegal photo path/);

  writeCatalog(catalog, [
    { id: 'rel-part', name_en: 'R', name_zh: '关', category: 'crankcases', vehicle_brands: ['bajaj'], related_products: ['missing-part'], public: true }
  ]);
  const missing = runGenerator({ root, catalog });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /related product "missing-part" does not exist/);

  writeCatalog(catalog, [
    { id: 'bad-brand', name_en: 'X', name_zh: '品', category: 'crankcases', vehicle_brands: ['honda'], public: true }
  ]);
  const badBrand = runGenerator({ root, catalog });
  assert.equal(badBrand.status, 2);
  assert.match(badBrand.stderr, /unknown vehicle brand/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('generator is idempotent across repeated runs', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [{
    id: 'idem-part', name_en: 'Idem', name_zh: '幂等', category: 'complete-engines', vehicle_brands: ['tvs'], public: true
  }]);
  assert.equal(runGenerator({ root, catalog }).status, 0);
  const before = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts.html'), 'utf8');
  const firstDetail = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts/idem-part.html'), 'utf8');
  assert.equal(runGenerator({ root, catalog }).status, 0);
  const after = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts.html'), 'utf8');
  const secondDetail = fs.readFileSync(path.join(root, 'en/bajaj-tvs-engines-parts/idem-part.html'), 'utf8');
  assert.equal(after, before, 'hub page unchanged on second run');
  assert.equal(secondDetail, firstDetail, 'detail page unchanged on second run');
  fs.rmSync(root, { recursive: true, force: true });
});

test('lifecycle: model_hubs renders aggregated OEM cross-reference table without thin detail pages', () => {
  const root = makeWorkspace();
  const catalog = path.join(root, 'data', 'bajaj-tvs-catalog.json');
  writeCatalog(catalog, [], {
    model_hubs: [
      {
        id: 'bajaj-pulsar-150',
        brand: 'bajaj',
        model_name_en: 'Bajaj Pulsar 150 (DTS-i)',
        model_name_zh: 'Bajaj Pulsar 150 (DTS-i)',
        displacement_cc: '149cc',
        engine_code: 'DTS-i',
        summary_en: 'Core crankcases and covers aggregated for mixed container loading.',
        summary_zh: '核心箱体与盖件按车型聚合展示，支持同柜混装出货。',
        core_parts: [
          {
            part_name_en: 'Left Crankcase',
            part_name_zh: '左曲轴箱',
            category: 'crankcases',
            chixiang_pn: 'CX-BJ-150-L',
            oem_ref: 'DH101234',
            material_spec: 'ADC12 die-cast aluminum'
          },
          {
            part_name_en: 'Clutch Cover',
            part_name_zh: '离合器盖',
            category: 'engine-covers',
            chixiang_pn: 'CX-BJ-150-CC',
            oem_ref: 'DH101567',
            material_spec: 'ADC12 aluminum'
          }
        ],
        public: true
      }
    ]
  });
  const res = runGenerator({ root, catalog });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.equal(detailFiles(root).length, 0, 'no thin one-part-one-page detail files created');

  const enBajaj = fs.readFileSync(path.join(root, 'en/bajaj-engine-parts.html'), 'utf8');
  assert.ok(enBajaj.includes('data-btv-model-hub="bajaj-pulsar-150"'), 'bajaj page renders model hub');
  assert.ok(enBajaj.includes('DH101234') && enBajaj.includes('DH101567'), 'OEM ref numbers rendered in table');
  assert.ok(enBajaj.includes('CX-BJ-150-L') && enBajaj.includes('CX-BJ-150-CC'), 'Chixiang part numbers rendered in table');

  const enTvs = fs.readFileSync(path.join(root, 'en/tvs-engine-parts.html'), 'utf8');
  assert.ok(!enTvs.includes('bajaj-pulsar-150'), 'TVS page filters out Bajaj model hub');

  assert.equal(runGenerator({ root, catalog, check: true }).status, 0);
  fs.rmSync(root, { recursive: true, force: true });
});
