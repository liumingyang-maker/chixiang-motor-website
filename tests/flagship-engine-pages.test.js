const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const BANNED_RE = /\b(?:18-pole|99%|Top 10|#1|Euro 5|within 24 hours|in stock now|patented|universal fit)\b/i;

test('flagship-engines.json publishes Batch 1 (CG200, HW300) and reserves CG150 & CG250SB', () => {
  const data = JSON.parse(read('data/flagship-engines.json'));
  const published = data.engines.filter(e => e.published === true).map(e => e.slug);
  const reserved = data.engines.filter(e => e.published === false).map(e => e.slug);
  assert.deepEqual(published, ['cg200-air-cooled-engine', 'hw300-water-cooled-engine']);
  assert.deepEqual(reserved, ['cg150-air-cooled-engine', 'cg250sb-water-cooled-engine']);

  for (const slug of published) {
    assert.ok(fs.existsSync(path.join(root, 'en', 'cg-engine', `${slug}.html`)), `${slug}.html must exist`);
  }
  for (const slug of reserved) {
    assert.ok(!fs.existsSync(path.join(root, 'en', 'cg-engine', `${slug}.html`)), `${slug}.html must not be published yet`);
  }
});

test('published flagship pages have clean URLs, local images, no empty cells, no banned words, and valid JSON-LD', () => {
  const data = JSON.parse(read('data/flagship-engines.json'));
  const sitemap = read('sitemap.xml');

  for (const engine of data.engines.filter(e => e.published === true)) {
    const rel = `en/cg-engine/${engine.slug}.html`;
    const html = read(rel);
    const canonical = `https://chixiangmotor.com/en/cg-engine/${engine.slug}`;

    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `${rel}: canonical missing`);
    assert.ok(!/href="[^"]*\.html(?:[?#][^"]*)?"/i.test(html), `${rel}: internal link leaks .html`);
    assert.ok(!html.includes('<td>—</td>'), `${rel}: empty <td>—</td> cell found`);
    assert.ok(!/PN:\s*·/.test(html), `${rel}: blank PN placeholder found`);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${rel}: exactly one <h1> required`);
    assert.doesNotMatch(html, BANNED_RE, `${rel}: contains banned phrase`);

    const imgMatches = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map(m => m[1]);
    assert.ok(imgMatches.length >= 5, `${rel}: expected gallery images`);
    for (const src of imgMatches) {
      assert.ok(!/^https?:\/\//i.test(src), `${rel}: external image URL forbidden: ${src}`);
      const diskRel = src.replace(/^\//, '');
      assert.ok(fs.existsSync(path.join(root, diskRel)), `${rel}: image missing on disk: ${diskRel}`);
    }

    const scripts = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(m => JSON.parse(m[1]));
    const product = scripts.find(s => s['@type'] === 'Product');
    const faq = scripts.find(s => s['@type'] === 'FAQPage');
    const entityGraph = scripts.find(s => Array.isArray(s['@graph']) && s['@graph'].some(n => n['@type'] === 'ItemPage'));

    assert.ok(product, `${rel}: Product JSON-LD required`);
    assert.ok(Array.isArray(product.additionalProperty) && product.additionalProperty.length >= 10, `${rel}: PropertyValue specs required`);
    assert.equal(product.offers, undefined, `${rel}: Product must not publish Offer/price`);
    assert.ok(faq && Array.isArray(faq.mainEntity) && faq.mainEntity.length === 5, `${rel}: 5 FAQPage entries required`);
    assert.ok(entityGraph, `${rel}: ItemPage entity graph required`);

    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `sitemap.xml missing ${canonical}`);
  }

  assert.ok(!sitemap.includes('/en/cg-engine/cg150-air-cooled-engine'), 'sitemap must not include unpublished CG150');
  assert.ok(!sitemap.includes('/en/cg-engine/cg250sb-water-cooled-engine'), 'sitemap must not include unpublished CG250SB');
});

test('bidirectional internal links connect family, products hub, HW parts hub, and flagship pages', () => {
  const cgHtml = read('en/cg-engine.html');
  const productsHtml = read('en/products.html');
  const hwPartsHtml = read('en/engine-parts/hw-series.html');
  const hw300Html = read('en/cg-engine/hw300-water-cooled-engine.html');

  assert.ok(cgHtml.includes('href="/en/cg-engine/cg200-air-cooled-engine"'));
  assert.ok(cgHtml.includes('href="/en/cg-engine/hw300-water-cooled-engine"'));
  assert.ok(productsHtml.includes('href="/en/cg-engine/cg200-air-cooled-engine"'));
  assert.ok(productsHtml.includes('href="/en/cg-engine/hw300-water-cooled-engine"'));
  assert.ok(hwPartsHtml.includes('href="/en/cg-engine/hw300-water-cooled-engine"'));
  assert.ok(hw300Html.includes('href="/en/engine-parts/hw-series"'));
  assert.ok(hw300Html.includes('Water-cooled w/ fins · 20-roller clutch'));
  assert.ok(hw300Html.includes('PN: Match by Model / BOM'));
  const cg200Html = read('en/cg-engine/cg200-air-cooled-engine.html');
  assert.ok(cg200Html.includes('Natural air-cooled · Manual wet multi-plate'));
  assert.ok(cg200Html.includes('8.5 kW @ 8,000 rpm'));
  assert.ok(cg200Html.includes('10 N·m @ 7,500 rpm'));
  assert.ok(cg200Html.includes('31.05 kg'));
});

test('render-flagship-engines.js --check reports zero drift', () => {
  const out = execFileSync(process.execPath, [path.join(root, 'scripts', 'render-flagship-engines.js'), '--check'], { encoding: 'utf8' });
  assert.match(out, /0 flagship engine files need updates\./);
});
