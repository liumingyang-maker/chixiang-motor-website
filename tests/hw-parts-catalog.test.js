const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

test('data/hw-parts-catalog.json pins Factory-Matched Service Kits first alongside all 8 core assemblies', () => {
  const catalog = JSON.parse(read('data/hw-parts-catalog.json'));
  assert.equal(catalog.assemblies[0].id, 'factory-matched-kits');
  const assemblyIds = catalog.assemblies.map(a => a.id);
  for (const required of [
    'factory-matched-kits',
    'cylinder-head',
    'cylinder-piston',
    'crankshaft-crankcase',
    'clutch',
    'transmission',
    'cooling',
    'electrical',
    'gaskets-fasteners'
  ]) {
    assert.ok(assemblyIds.includes(required), `missing assembly: ${required}`);
  }
  const pinnedKitParts = catalog.parts.filter(p => p.assembly_id === 'factory-matched-kits');
  assert.equal(pinnedKitParts.length, 4, 'expected 4 Factory-Matched Service Kits');
  assert.match(catalog.series.interchangeability_note_en, /80%/);
  assert.match(catalog.series.interchangeability_note_en, /HW250/);
  assert.match(catalog.series.interchangeability_note_en, /HW300/);
});

test('rendered /en/engine-parts/hw-series uses clean URLs, pre-rendered BOM HTML, Factory-Matched Kits positioning, and zero empty cells', () => {
  const html = read('en/engine-parts/hw-series.html');
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/chixiangmotor\.com\/en\/engine-parts\/hw-series">/);
  assert.match(html, /Factory-Matched Service Kits/);
  assert.match(html, /factory-matched to CHIXIANG HW-series assembly specifications/i);
  assert.match(html, /80%/);
  assert.match(html, /Shared \(HW250 \/ HW300\)/);
  assert.match(html, /Cylinder Head Assembly/);
  assert.match(html, /Cylinder Head Cover/);
  assert.match(html, /data-source-form="hw-series-catalog"/);
  assert.doesNotMatch(html, /<td>—<\/td>/);
  assert.doesNotMatch(html, /18[- ]pole/i);
  assert.doesNotMatch(html, /https?:\/\/(?!(?:chixiangmotor\.com|www\.googletagmanager\.com|mc\.yandex\.ru|www\.youtube\.com|www\.linkedin\.com|shop7p518ep539950\.1688\.com|wa\.me|schema\.org))[^"'\s)]+\.(?:png|jpe?g|webp|gif)/i);

  const internalHrefs = [...html.matchAll(/href=["'](\/[^"']+)["']/gi)].map(m => m[1]);
  assert.ok(internalHrefs.length > 5);
  for (const href of internalHrefs) {
    assert.doesNotMatch(href.split('?')[0], /\.html$/i, `internal href must not expose .html: ${href}`);
  }
});

test('bidirectional links connect /en/engine-parts, /en/cg-engine, llms-full.txt, and sitemap.xml cleanly', () => {
  const partsHub = read('en/engine-parts.html');
  assert.match(partsHub, /id="hw-series-parts"/);
  assert.match(partsHub, /href="\/en\/engine-parts\/hw-series"/);

  const cgPage = read('en/cg-engine.html');
  assert.match(cgPage, /href="\/en\/engine-parts\/hw-series"/);

  const llmsFull = read('llms-full.txt');
  assert.match(llmsFull, /https:\/\/chixiangmotor\.com\/en\/engine-parts\/hw-series/);
  assert.match(llmsFull, /Factory-Matched Service Kits/);

  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/chixiangmotor\.com\/en\/engine-parts\/hw-series<\/loc>/);
  assert.doesNotMatch(sitemap, /hw-series\.html/);
});

test('isolated lifecycle: flipping is_flagship_page generates flagship detail pages, syncs sitemap, and prunes orphans on removal', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-parts-lifecycle-'));
  try {
    fs.mkdirSync(path.join(tmp, 'data'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'en', 'engine-parts', 'hw-series'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'images', 'hw-water-cooled'), { recursive: true });
    fs.copyFileSync(path.join(root, 'sitemap.xml'), path.join(tmp, 'sitemap.xml'));
    fs.copyFileSync(
      path.join(root, 'images', 'hw-water-cooled', 'chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp'),
      path.join(tmp, 'images', 'hw-water-cooled', 'chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp')
    );

    const catalog = JSON.parse(read('data/hw-parts-catalog.json'));
    const flagshipSlug = 'hw-20-roller-clutch-assembly';
    const target = catalog.parts.find(p => p.slug === flagshipSlug);
    assert.ok(target);
    target.is_flagship_page = true;
    target.images = ['images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp'];

    const catalogPath = path.join(tmp, 'data', 'hw-parts-catalog.json');
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

    const unmanaged = path.join(tmp, 'en', 'engine-parts', 'hw-series', 'custom-note.html');
    fs.writeFileSync(unmanaged, '<html><body>manual file</body></html>', 'utf8');

    const env = { ...process.env, HW_ROOT: tmp, HW_CATALOG: catalogPath };
    execFileSync(process.execPath, [path.join(root, 'scripts', 'render-hw-parts-catalog.js')], { env });

    const detailFile = path.join(tmp, 'en', 'engine-parts', 'hw-series', `${flagshipSlug}.html`);
    assert.ok(fs.existsSync(detailFile), 'flagship detail file should be generated');
    const detailHtml = fs.readFileSync(detailFile, 'utf8');
    assert.match(detailHtml, /<link rel="canonical" href="https:\/\/chixiangmotor\.com\/en\/engine-parts\/hw-series\/hw-20-roller-clutch-assembly">/);
    assert.match(detailHtml, /"@type":\s*"Product"/);
    assert.match(fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8'), /\/en\/engine-parts\/hw-series\/hw-20-roller-clutch-assembly<\/loc>/);

    // Check mode clean right after run
    execFileSync(process.execPath, [path.join(root, 'scripts', 'render-hw-parts-catalog.js'), '--check'], { env });

    // Flip back to false and confirm orphan pruning preserves unmanaged files
    target.is_flagship_page = false;
    target.images = [];
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    execFileSync(process.execPath, [path.join(root, 'scripts', 'render-hw-parts-catalog.js')], { env });

    assert.ok(!fs.existsSync(detailFile), 'generated flagship page should be pruned when turned off');
    assert.ok(fs.existsSync(unmanaged), 'unmanaged files must never be deleted');
    assert.doesNotMatch(fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8'), /hw-20-roller-clutch-assembly/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
