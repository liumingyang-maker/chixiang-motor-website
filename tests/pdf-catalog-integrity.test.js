const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const ORIGIN = 'https://chixiangmotor.com';
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const PDF_CATALOGS = [
  { lang: 'en', file: 'pdf/chixiang-motorcycle-engine-catalog-en.pdf' },
  { lang: 'fr', file: 'pdf/chixiang-catalogue-moteurs-moto-fr.pdf' },
  { lang: 'es', file: 'pdf/chixiang-catalogo-motores-moto-es.pdf' },
  { lang: 'pt', file: 'pdf/chixiang-catalogo-motores-moto-pt.pdf' },
  { lang: 'ru', file: 'pdf/chixiang-katalog-dvigatelej-moto-ru.pdf' },
  { lang: 'ar', file: 'pdf/chixiang-motorcycle-engine-catalog-ar.pdf' }
];

function walkFiles(dirRel) {
  const abs = path.join(root, dirRel);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...walkFiles(rel));
    else out.push(rel);
  }
  return out;
}

test('all 6 multilingual PDF catalogs exist in pdf/, are valid PDF binaries, and remain publishable', () => {
  const assetsIgnoreRules = read('.assetsignore')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  assert.ok(!assetsIgnoreRules.includes('pdf/'), '.assetsignore must not exclude pdf/');
  assert.ok(!assetsIgnoreRules.includes('pdf/**'), '.assetsignore must not exclude pdf/**');
  assert.ok(assetsIgnoreRules.includes('pdf/extracted.txt'), '.assetsignore must continue withholding pdf/extracted.txt');

  for (const { file } of PDF_CATALOGS) {
    const abs = path.join(root, file);
    assert.ok(fs.existsSync(abs), `missing PDF catalog: ${file}`);
    const buf = fs.readFileSync(abs);
    assert.equal(buf.subarray(0, 5).toString('ascii'), '%PDF-', `${file} must start with %PDF- header`);
    assert.ok(buf.length >= 200 * 1024 && buf.length <= 2 * 1024 * 1024, `${file} unexpected size: ${buf.length} bytes`);
    assert.ok(!assetsIgnoreRules.includes(file), `.assetsignore must not exclude ${file}`);
  }
});

test('all 6 public languages mount their localized /pdf/*.pdf download entry on home and products pages', () => {
  for (const { lang, file } of PDF_CATALOGS) {
    const href = `/${file}`;
    const homeHtml = read(`${lang}/index.html`);
    const productsHtml = read(`${lang}/products.html`);
    assert.ok(homeHtml.includes(`href="${href}"`), `${lang}/index.html must link to ${href}`);
    assert.ok(productsHtml.includes(`href="${href}"`), `${lang}/products.html must link to ${href}`);
  }
});

test('sitemap.xml, llms.txt, and llms-full.txt expose all 6 official /pdf/*.pdf URLs', () => {
  const sitemap = read('sitemap.xml');
  const llms = read('llms.txt');
  const llmsFull = read('llms-full.txt');

  for (const { file } of PDF_CATALOGS) {
    const url = `${ORIGIN}/${file}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml missing ${url}`);
    assert.ok(llms.includes(url), `llms.txt missing ${url}`);
    assert.ok(llmsFull.includes(url), `llms-full.txt missing ${url}`);
  }
});

test('no temporary preview or proof HTML files are exposed in public directories', () => {
  const publicDirs = ['pdf', 'en', 'fr', 'es', 'pt', 'ru', 'ar'];
  for (const dir of publicDirs) {
    for (const rel of walkFiles(dir)) {
      assert.doesNotMatch(
        path.basename(rel),
        /(?:preview|proof|draft).*\.html$/i,
        `temporary preview HTML must not exist in public directory: ${rel}`
      );
      assert.doesNotMatch(
        path.basename(rel),
        /design-proof.*\.pdf$/i,
        `design proof PDF must not exist in public directory: ${rel}`
      );
    }
  }
});
