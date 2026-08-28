const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadManifest } = require('../scripts/site-entity-manifest.js');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const GUIDE_URL = 'https://chixiangmotor.com/es/guia/que-es-un-motor-cg/';
const GUIDE_FILE = 'es/guia/que-es-un-motor-cg/index.html';
const guide = read(GUIDE_FILE);

test('guide URL is in the sitemap and its source file exists', () => {
  assert.ok(read('sitemap.xml').includes('<loc>' + GUIDE_URL + '</loc>'), 'guide missing from sitemap');
  assert.ok(fs.existsSync(path.join(root, GUIDE_FILE)), 'guide source file missing');
});

test('manifest classifies the guide as an article / WebPage in es', () => {
  const entry = loadManifest(root).find((e) => e.url === GUIDE_URL);
  assert.ok(entry, 'guide missing from manifest');
  assert.equal(entry.role, 'article');
  assert.equal(entry.schemaType, 'WebPage');
  assert.equal(entry.language, 'es');
});

test('guide self-canonicalizes with trailing slash and has exactly one H1', () => {
  assert.equal([...guide.matchAll(/<link\b[^>]*\brel=["']canonical["']/gi)].length, 1, 'canonical count');
  assert.ok(guide.includes('href="' + GUIDE_URL + '"'), 'self canonical must equal sitemap URL');
  assert.equal((guide.match(/<h1\b/gi) || []).length, 1, 'exactly one H1');
});

test('guide schema is a Spanish article with Inicio -> Noticias -> guide breadcrumb', () => {
  assert.ok(/"@type":\s*"Article"/.test(guide), 'Article schema missing');
  assert.ok(/"@type":\s*"WebPage"/.test(guide), 'WebPage schema missing');
  assert.ok(/"inLanguage":\s*"es"/.test(guide), 'inLanguage es missing');
  const graph = JSON.parse(guide.match(/<script[^>]+data-site-entity-graph[^>]*>([\s\S]*?)<\/script>/i)[1]);
  const breadcrumb = graph['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
  assert.ok(breadcrumb, 'BreadcrumbList missing');
  assert.equal(breadcrumb['@id'], GUIDE_URL + '#breadcrumb');
  assert.deepEqual(breadcrumb.itemListElement.map((i) => i.item), ['https://chixiangmotor.com/es/', 'https://chixiangmotor.com/es/news', GUIDE_URL]);
  assert.ok(guide.includes('entity-breadcrumb'), 'visible breadcrumb nav missing');
});

test('guide title and H1 avoid commercial supplier keywords', () => {
  const title = (guide.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const h1 = (guide.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  for (const t of [title, h1]) {
    assert.doesNotMatch(t, /fabricante|proveedor|mayorista|precio|wholesale|supplier|distributor/i, t);
  }
});

test('guide carries no unsupported claims and links to the owner pages', () => {
  assert.doesNotMatch(guide, /strong torque|buen torque|bom torque/i);
  assert.doesNotMatch(guide, /low vibration|baja vibraci|baixa vibra/i);
  assert.doesNotMatch(guide, /24\s*(?:horas|hours)/i);
  assert.ok(guide.includes('/es/motor-cg'), 'missing CG owner link');
  assert.ok(guide.includes('/es/motor-cb'), 'missing CB owner link');
  assert.ok(guide.includes('/es/repuestos-motor'), 'missing parts link');
  assert.ok(guide.includes('/es/contacto'), 'missing contact link');
  assert.ok(read('es/news.html').includes('/es/guia/que-es-un-motor-cg/'), 'news hub must link the guide');
});

test('exactly one Spanish guide exists (no extra CG support URLs)', () => {
  const dirs = fs.readdirSync(path.join(root, 'es', 'guia'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(dirs, ['que-es-un-motor-cg'], 'only one es/guia folder allowed');
  const guiaUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/es/guia/'));
  assert.deepEqual(guiaUrls, [GUIDE_URL], 'only one guia sitemap URL allowed');
});