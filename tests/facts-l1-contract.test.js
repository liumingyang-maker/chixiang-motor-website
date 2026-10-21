const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const os = require('node:os');

const root = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function inlineProductScript() {
  const html = read('en/product-detail.html');
  const scripts = [...html.matchAll(/<script>\s*([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const s = scripts.find(code => code.includes('holdMessages') || code.includes("const data"));
  assert.ok(s, 'product-detail inline script missing');
  return s;
}

test('product-detail inline script parses', () => {
  const code = inlineProductScript();
  const file = path.join(os.tmpdir(), `pd-syntax-${process.pid}.js`);
  fs.writeFileSync(file, code);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  fs.unlinkSync(file);
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test('horizontal specs have no orphan rows after array close', () => {
  const code = inlineProductScript();
  const i = code.indexOf("'horizontal'");
  assert.ok(i !== -1);
  const region = code.slice(i, code.indexOf('advantages:', i));
  // exactly one specs: [ ... ], before advantages in this object
  const opens = (region.match(/specs:\s*\[/g) || []).length;
  assert.equal(opens, 1);
  // orphan tail previously looked like `],\\n          ['Type'`
  assert.ok(!/\],\s*\n\s*\['Type'/.test(region), 'orphan rows after specs array');
});

test('CX154FMI clutch matches ENGINE_SPEC_MASTER (Manual)', () => {
  const csv = read('docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv');
  const line = csv.split(/\r?\n/).find(l => l.includes('model-154fmi'));
  assert.ok(line && /Manual/i.test(line) && !/semi-automatic/i.test(line.split('candidate_master_values').pop() || line), 'master says Manual for 154');
  const code = inlineProductScript();
  const row = code.match(/\['Clutch',[^\]]+\]/);
  assert.ok(row, 'clutch row missing');
  assert.match(row[0], /'Manual'[^]*'Manual or semi-automatic'/);
  // third model column is CX154FMI
  const models = code.match(/\['Model',\s*'CX152FMH',\s*'CX153FMI',\s*'CX154FMI'/);
  assert.ok(models);
});

test('AC320 tool data omits unapproved output figures', () => {
  const html = read('en/product-detail.html');
  assert.ok(!html.includes('17kW'));
  assert.ok(!html.includes('28N·m'));
  assert.ok(!html.includes('±1.5%'));
});

test('hold branch neutralizes quote CTA and related cards', () => {
  const code = inlineProductScript();
  assert.match(code, /holdCta/);
  assert.match(code, /related-products'\)\.innerHTML = ''/);
  assert.match(code, /!holdMessages\[r\] && r !== 'motorcycles' && r !== 'tricycles'/);
});

test('non-EN catalogs drop Honda-compat and universal reverse on CG water', () => {
  for (const file of ['es/products.html', 'pt/products.html', 'ru/products.html', 'ar/products.html']) {
    const html = read(file);
    assert.ok(!/compatible Honda|compativel Honda|Honda Compatible/i.test(html), file);
    assert.ok(!/compat[ií]vel Honda/i.test(html), file);
  }
  const es = read('es/products.html');
  assert.ok(es.includes('depende del modelo y del pedido'));
  const pt = read('pt/products.html');
  assert.ok(pt.includes('depende do modelo e do pedido'));
});


test('catalog horizontal air-cooled range matches approved 110-150 family', () => {
  const en = read('en/products.html');
  assert.ok(en.includes('110–150cc') || en.includes('110-150cc'));
  assert.ok(!en.includes('100–125cc'));
  assert.ok(!en.includes('100-125cc'));
  const tool = read('en/product-detail.html');
  assert.ok(!tool.includes('100–125cc'), 'product-detail tool tag must not use old 100–125 range');
  assert.ok(!tool.includes('100-125cc'), 'product-detail tool tag must not use old 100-125 range');
});

test('catalog omits absolute and unapproved commercial claims', () => {
  const html = read('en/products.html');
  for (const banned of [
    'no overheating',
    'Euro 5',
    'ultra-quiet',
    'Universal parts',
    'no stalling',
    '17kW',
    '28N·m',
    'Honda Compatible',
  ]) {
    assert.ok(!html.includes(banned), 'unexpected claim ' + banned);
  }
});

test('AC320 catalog CTA label matches contact destination', () => {
  const html = read('en/products.html');
  const i = html.indexOf('AC320');
  assert.ok(i !== -1);
  const window = html.slice(i, i + 900);
  assert.ok(window.includes('View Specs'), 'CTA should say View Specs');
  assert.ok(window.includes('href="/en/ac320-atv-engine"'), 'CTA should link AC320 page');
  assert.ok(!window.includes('17kW'));
});

test('family pages no longer link product-detail from detailed-specs CTAs', () => {
  for (const file of [
    'en/cg-engine.html',
    'en/cb-engine.html',
    'en/engine-parts.html',
    'en/horizontal-engine.html',
  ]) {
    const html = read(file);
    assert.ok(!html.includes('product-detail?series='), file + ': still links product-detail');
  }
});

test('family pages expose stable specification anchors', () => {
  const expectations = {
    'en/cg-engine.html': [
      'cg-air-cooled',
      'cg-water-cooled',
      'cg-balance-shaft',
      'tsunami',
      'hw-water',
      'auto-clutch',
    ],
    'en/cb-engine.html': ['cb-specifications'],
    'en/engine-parts.html': ['parts-specifications'],
    'en/horizontal-engine.html': ['cx-models'],
  };
  for (const [file, ids] of Object.entries(expectations)) {
    const html = read(file);
    for (const id of ids) {
      assert.ok(html.includes('id="' + id + '"'), file + ': missing #' + id);
    }
  }
});

test('product-detail hold messages cover vehicle programs and omit legacy CX measurements', () => {
  const html = read('en/product-detail.html');
  assert.ok(html.includes("'motorcycles':"));
  assert.ok(html.includes("'tricycles':"));
  assert.ok(html.includes('Complete motorcycles and CKD/SKD'));
  assert.ok(html.includes('Complete tricycle vehicles are not currently supplied'));
  for (const banned of ['CX152FMH-5B', "'106.7'", '52.4 x 49.5', '123.67']) {
    assert.ok(!html.includes(banned), 'legacy value present: ' + banned);
  }
});


test('AC320 page keeps SEO metadata in head without JS-hostile noscript', () => {
  const html = read('en/ac320-atv-engine.html');
  const headEnd = html.search(/<\/head>/i);
  assert.ok(headEnd > 0);
  const head = html.slice(0, headEnd);
  const body = html.slice(headEnd);
  assert.match(head, /<title>/i);
  assert.match(head, /rel=["']canonical["']/i);
  assert.match(head, /rel=["']alternate["']/i);
  assert.ok(!/<noscript>[\s\S]*?<\/noscript>/i.test(head), 'noscript must not live in head');
  assert.match(body, /<noscript>[\s\S]*mc\.yandex\.ru\/watch\//i);
});

test('AC320 page exposes one breadcrumb and a real img hero', () => {
  const html = read('en/ac320-atv-engine.html');
  const navs = html.match(/<nav\b[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>/gi) || [];
  assert.equal(navs.length, 1, 'exactly one breadcrumb nav');
  assert.match(navs[0], /entity-breadcrumb/);
  assert.match(html, /<img\b[^>]*src=["']\.\.\/images\/atv\/tb_image_share_1773217554909\.webp["'][^>]*alt=["'][^"']+["']/i);
  assert.ok(!/background-image:url\(['"]\.\.\/images\/atv\//i.test(html), 'hero must not be CSS background only');
});

test('AC320 hero image asset exists', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const asset = path.join(root, 'images/atv/tb_image_share_1773217554909.webp');
  assert.ok(fs.existsSync(asset), asset);
});
