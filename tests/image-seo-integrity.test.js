const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const imgSeo = require('../scripts/lib/image-seo-helper');

const root = path.join(__dirname, '..');
const ORIGIN = 'https://chixiangmotor.com';
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function walkFiles(dirRel, extFilter) {
  const absDir = path.join(root, dirRel);
  if (!fs.existsSync(absDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...walkFiles(rel, extFilter));
    else if (!extFilter || extFilter(rel)) out.push(rel);
  }
  return out;
}

function getCanonicalEntries() {
  const sm = read('sitemap.xml');
  return [...sm.matchAll(/<loc>(https:\/\/chixiangmotor\.com\/[^<]*)<\/loc>/g)]
    .map((m) => m[1])
    .filter((url) => !url.endsWith('.pdf'))
    .map((url) => {
      const rel = url.slice(ORIGIN.length + 1);
      let file = rel;
      if (!rel) file = 'index.html';
      else if (rel.endsWith('/')) file = `${rel}index.html`;
      else if (!rel.endsWith('.html') && fs.existsSync(path.join(root, `${rel}.html`))) file = `${rel}.html`;
      const langMatch = url.match(/^https:\/\/chixiangmotor\.com\/(en|fr|es|pt|ru|ar)\//);
      return { url, file, lang: langMatch ? langMatch[1] : 'en' };
    });
}

test('all disk image assets are WebP, <= 180 KB, and match manifest entries', () => {
  const manifest = imgSeo.loadManifest();
  const diskImages = walkFiles('images', (f) => /\.(webp|png|jpg|jpeg|gif)$/i.test(f));
  assert.ok(diskImages.length >= 120, 'expected full WebP asset catalog');
  for (const rel of diskImages) {
    assert.ok(rel.endsWith('.webp'), `non-WebP image left in images/: ${rel}`);
    const sizeBytes = fs.statSync(path.join(root, rel)).size;
    assert.ok(sizeBytes <= 180 * 1024, `${rel}: ${(sizeBytes / 1024).toFixed(1)} KB exceeds 180 KB target`);
    assert.ok(manifest.assets[rel], `${rel}: missing from data/image-seo-manifest.json`);
  }
});

test('no unreferenced orphan files or old Chinese filename artifacts remain in root/images', () => {
  const forbiddenOrphans = [
    'mobile 主图.webp',
    'images/logo-hd.png',
    'images/logo-hd@2x.png',
    'images/central-asia-hero-bg-v2.png',
    'images/uzbekistan-cg-hero.png',
    'images/factory-showcase/about-factory-hero.webp',
    'images/factory-showcase/certification.webp'
  ];
  for (const rel of forbiddenOrphans) {
    assert.ok(!fs.existsSync(path.join(root, rel)), `orphan/source asset must be removed: ${rel}`);
  }
});

test('all 197 canonical HTML pages have zero broken images, zero empty alt, explicit dimensions, and valid og:image', () => {
  const canonical = getCanonicalEntries();
  assert.equal(canonical.length, 197, 'expected 197 canonical URLs across 6 active export languages');

  const genericRe = /(auto-clutch-\d|factory-\d|-photo-\d|-render-\d|prod-\d|img-\d|主图|\.(png|jpg|jpeg)$)/i;
  const enBoiler = /Complete Engine Assembly|Clutch Cover &|Cylinder Fins &|Frame Mounting Interface|High-Capacity Sump|Coolant Routing Ports|External Reverse Interface/i;

  for (const { file, lang } of canonical) {
    const html = read(file);
    assert.match(html, /<meta\b[^>]*property=["']og:image["'][^>]*content=["']https:\/\/chixiangmotor\.com\/images\/[^"']+\.webp["']/i, `${file}: missing valid WebP og:image`);

    for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
      const attrs = m[1];
      const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i);
      assert.ok(srcM && srcM[1].trim(), `${file}: <img> missing non-empty src`);
      const src = srcM[1];
      if (/^(?:https?:\/\/mc\.yandex\.ru|data:)/i.test(src)) continue;

      const clean = src.split(/[?#]/, 1)[0];
      const abs = clean.startsWith('/') ? path.resolve(root, clean.slice(1)) : path.resolve(root, path.dirname(file), clean);
      assert.ok(fs.existsSync(abs), `${file}: broken local image ${src}`);
      assert.ok(!genericRe.test(clean), `${file}: generic/non-WebP filename ${src}`);

      const altM = attrs.match(/\balt=(["'])([\s\S]*?)\1/i);
      assert.ok(altM && altM[2].trim().length > 0, `${file}: empty or missing alt on ${src}`);
      if (lang !== 'en') {
        assert.ok(!enBoiler.test(altM[2]), `${file}: English alt leakage "${altM[2]}"`);
      }
      assert.match(attrs, /\bwidth=["']\d+["']/i, `${file}: missing width on ${src}`);
      assert.match(attrs, /\bheight=["']\d+["']/i, `${file}: missing height on ${src}`);
      assert.match(attrs, /\bdecoding=["']async["']/i, `${file}: missing decoding="async" on ${src}`);
    }

    for (const m of html.matchAll(/<(?:a|div)\b[^>]*class=["'][^"']*\b(?:product-img|card-img|about-hero-img)\b[^"']*["'][^>]*background-image[^>]*>/gi)) {
      assert.fail(`${file}: product/card/hero visual must use native <img> instead of CSS background-image: ${m[0].slice(0, 120)}`);
    }
  }
});

test('CSS, JS, data JSONs, and paid landing reference only existing local WebP images', () => {
  const staticSources = [
    ...walkFiles('css', (f) => f.endsWith('.css')),
    ...walkFiles('js', (f) => f.endsWith('.js')),
    'data/flagship-engines.json',
    'data/bajaj-tvs-catalog.json',
    'data/hw-parts-catalog.json',
    'data/i18n/core-pages-locales.json',
    ...walkFiles('data/i18n/guides', (f) => f.endsWith('.json')),
    'ads/algerie/index.html'
  ];

  for (const rel of staticSources) {
    const content = read(rel);
    for (const m of content.matchAll(/(?:\.\.\/|\/)?(images\/[A-Za-z0-9_.\-\/]+\.(?:webp|png|jpg|jpeg))/gi)) {
      const imgRel = m[1];
      assert.ok(imgRel.endsWith('.webp'), `${rel}: non-WebP image reference ${imgRel}`);
      assert.ok(fs.existsSync(path.join(root, imgRel)), `${rel}: missing referenced image ${imgRel}`);
    }
  }
});

test('ImageObject JSON-LD, sitemap.xml xmlns:image, and _redirects 301 stay synchronized', () => {
  const sm = read('sitemap.xml');
  assert.ok(sm.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), 'sitemap.xml must declare xmlns:image');
  assert.ok(!sm.includes('/zh-cn/'), 'sitemap.xml must exclude /zh-cn/');
  const imageLocs = [...sm.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
  assert.ok(imageLocs.length >= 300, 'expected substantial product/factory/guide <image:image> entries');
  for (const loc of imageLocs) {
    assert.ok(loc.startsWith(`${ORIGIN}/images/`), `unexpected <image:loc> ${loc}`);
    const rel = loc.slice(ORIGIN.length + 1);
    assert.ok(fs.existsSync(path.join(root, rel)), `sitemap <image:loc> missing on disk: ${rel}`);
    assert.ok(!/logo\.webp|wechat-qr\.webp|whatsapp-qr\.webp/i.test(rel), `decorative asset must not appear in image sitemap: ${rel}`);
  }

  // Flagship engines + Buyer guides must expose ImageObject in JSON-LD across all 6 languages
  for (const lang of ['en', 'fr', 'es', 'pt', 'ru', 'ar']) {
    for (const slug of ['cg150-air-cooled-engine', 'cg200-air-cooled-engine', 'cg250sb-water-cooled-engine', 'hw300-water-cooled-engine']) {
      const html = read(`${lang}/cg-engine/${slug}.html`);
      assert.ok(html.includes('"@type": "ImageObject"'), `${lang}/cg-engine/${slug}.html missing ImageObject`);
    }
  }

  // Verify _redirects 301 rules for all manifest legacyPathMap entries
  const redirects = read('_redirects');
  const manifest = imgSeo.loadManifest();
  for (const [oldRel, newRel] of Object.entries(manifest.legacyPathMap)) {
    const rule = `/${oldRel} /${newRel} 301`;
    assert.ok(redirects.includes(rule), `_redirects missing 301 rule: ${rule}`);
    assert.ok(fs.existsSync(path.join(root, newRel)), `redirect destination missing on disk: ${newRel}`);
  }
});

test('AGENTS.md v2.0/v2.1 redlines hold across image manifest and all active alt/caption/sitemap tags', () => {
  const manifest = imgSeo.loadManifest();
  const banned = /(99%|36JZ|18-pole|18 pôles|groupage maritime|Top 10|#1|Global Leader|within 24 hours)/i;

  for (const [file, asset] of Object.entries(manifest.assets)) {
    for (const [lang, txt] of Object.entries(asset.alt || {})) {
      assert.ok(!banned.test(txt), `manifest ${file} alt.${lang} contains banned phrase: ${txt}`);
      if (asset.engineFamily !== 'HORIZONTAL') {
        assert.ok(!/Jakarta/i.test(txt), `manifest ${file} alt.${lang} leaks Jakarta outside horizontal scope`);
      }
    }
    for (const [lang, txt] of Object.entries(asset.caption || {})) {
      assert.ok(!banned.test(txt), `manifest ${file} caption.${lang} contains banned phrase: ${txt}`);
      if (asset.engineFamily !== 'HORIZONTAL') {
        assert.ok(!/Jakarta/i.test(txt), `manifest ${file} caption.${lang} leaks Jakarta outside horizontal scope`);
      }
    }
  }

  // Confirm BM150 never falsely renames CT100 borrowed photos as bm150-...
  assert.ok(!fs.existsSync(path.join(root, 'images/bajaj-tvs/bm150-clutch-side.webp')));
  assert.ok(manifest.assets['images/bajaj-tvs/bajaj-boxer-ct100-bm100-clutch-side.webp'].pendingRealPhoto === true);
  assert.ok(manifest.assets['images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp'].pendingRealPhotoSplit === true);

  // Confirm zero banned terms in rendered <img> alt & <figcaption> & <image:title>/<image:caption>
  const sm = read('sitemap.xml');
  for (const m of sm.matchAll(/<image:(?:title|caption)>([^<]+)<\/image:(?:title|caption)>/g)) {
    assert.ok(!banned.test(m[1]), `sitemap image tag contains banned phrase: ${m[1]}`);
  }
});
