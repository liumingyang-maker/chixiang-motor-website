const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROUTE_GROUPS, LANGS, HREFLANG_MAP, ORIGIN } = require('../scripts/i18n-matrix');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function toDiskPath(pathname, fromRel = '') {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch {}
  const normalized = decoded.startsWith('/')
    ? decoded
    : path.posix.resolve('/', path.posix.dirname(fromRel), decoded);
  if (normalized === '/') return 'index.html';
  const clean = normalized.replace(/^\//, '');
  if (clean.endsWith('/')) {
    const dirIdx = path.posix.join(clean, 'index.html');
    if (fs.existsSync(path.join(root, dirIdx))) return dirIdx;
    const htmlAlt = `${clean.slice(0, -1)}.html`;
    if (fs.existsSync(path.join(root, htmlAlt))) return htmlAlt;
    return null;
  }
  if (/\.[a-z0-9]+$/i.test(clean)) return clean;
  if (fs.existsSync(path.join(root, `${clean}.html`))) return `${clean}.html`;
  if (fs.existsSync(path.join(root, clean, 'index.html'))) return path.posix.join(clean, 'index.html');
  return null;
}

test('all 32 standard roles x 6 languages = 192 matrix pages exist on disk and in sitemap.xml', () => {
  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 197, 'total sitemap.xml canonical URLs');
  assert.ok(!locs.some((u) => u.includes('/zh-cn')), 'sitemap.xml must exclude hidden /zh-cn routes');

  let checked = 0;
  for (const [role, group] of Object.entries(ROUTE_GROUPS)) {
    for (const lang of LANGS) {
      const p = group[lang];
      assert.ok(p, `Missing path for role=${role}, lang=${lang}`);
      const rel = p.endsWith('/') ? `${p.slice(1)}index.html` : `${p.slice(1)}.html`;
      assert.ok(fs.existsSync(path.join(root, rel)), `Missing disk file ${rel}`);
      assert.ok(sitemap.includes(`<loc>${ORIGIN}${p}</loc>`), `Missing sitemap entry ${ORIGIN}${p}`);
      checked += 1;
    }
  }
  assert.equal(checked, 192);
});

test('all 192 matrix pages publish complete 6-way bidirectional hreflang + x-default and clean Arabic RTL', () => {
  for (const [role, group] of Object.entries(ROUTE_GROUPS)) {
    for (const lang of LANGS) {
      const p = group[lang];
      const rel = p.endsWith('/') ? `${p.slice(1)}index.html` : `${p.slice(1)}.html`;
      const html = read(rel);

      assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${rel}: must have exactly 1 visible <h1>`);
      assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}${p}"`) || html.includes(`<link rel="canonical" href="${ORIGIN}${p}/"`), `${rel}: missing self canonical`);

      if (lang === 'ar') {
        assert.match(html, /<html\b[^>]*lang="ar"[^>]*dir="rtl"/i, `${rel}: Arabic page must set dir="rtl"`);
      }

      for (const altLang of LANGS) {
        const altUrl = `${ORIGIN}${group[altLang]}`;
        assert.match(
          html,
          new RegExp(`<link\\s+rel="alternate"\\s+hreflang="${HREFLANG_MAP[altLang]}"\\s+href="${altUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
          `${rel}: missing alternate hreflang=${HREFLANG_MAP[altLang]}`
        );
      }
      assert.match(
        html,
        new RegExp(`<link\\s+rel="alternate"\\s+hreflang="x-default"\\s+href="${`${ORIGIN}${group.en}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
        `${rel}: missing x-default hreflang`
      );
    }
  }
});

test('all new localized flagship, BTV, Evidence, AC320, and HW pages enforce SSOT facts and zero broken links', () => {
  const bannedPatterns = [/\b99\s*%(?![0-9A-Fa-f]{2})/i, /Top\s+10/i, /within\s+24\s+hours/i, /\b36JZ\b/i, /"Offer"|"InStock"|"AggregateRating"|"Review"/];

  for (const lang of ['fr', 'es', 'pt', 'ru', 'ar']) {
    const hw300 = read(`${lang}/cg-engine/hw300-water-cooled-engine.html`);
    assert.ok(hw300.includes('275.3') || hw300.includes('275,3'), `${lang}/hw300 must state 275.3 mL actual displacement`);

    const cg200 = read(`${lang}/cg-engine/cg200-air-cooled-engine.html`);
    assert.ok(cg200.includes('10 kW') || cg200.includes('10 кВт') || cg200.includes('10 كيلوواط'), `${lang}/cg200 must include 10 kW power`);
    assert.ok(cg200.includes('13.5') || cg200.includes('13,5'), `${lang}/cg200 must include 13.5 N·m torque`);

    const hwParts = read(`${lang}/engine-parts/hw-series.html`);
    assert.ok(hwParts.includes('80%') || hwParts.includes('80 %'), `${lang}/hw-series must state ~80% HW250/HW300 parts commonality`);
  }

  for (const [role, group] of Object.entries(ROUTE_GROUPS)) {
    for (const lang of LANGS) {
      const p = group[lang];
      const rel = p.endsWith('/') ? `${p.slice(1)}index.html` : `${p.slice(1)}.html`;
      const html = read(rel);

      for (const re of bannedPatterns) {
        assert.doesNotMatch(html, re, `${rel}: contains banned pattern ${re}`);
      }

      const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((m) => m[1]);
      for (const href of hrefs) {
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('/ads/')) continue;
        const pathname = href.split(/[?#]/)[0];
        if (!pathname) continue;
        const disk = toDiskPath(pathname, rel);
        assert.ok(disk && fs.existsSync(path.join(root, disk)), `${rel}: broken internal href ${href}`);
      }
    }
  }
});

test('all 6 contact pages wire prefill/main.js form handlers, _redirects excludes /zh-cn, and all 197 pages keep symmetric hreflangs', () => {
  assert.doesNotMatch(read('_redirects'), /^\/zh-cn\b/m, '_redirects must not expose hidden /zh-cn route');
  assert.match(read('js/main.js'), /querySelectorAll\(['"]form\.contact-form['"]\)/, 'main.js must initialize form.contact-form');

  for (const f of ['en/contact.html', 'fr/contact.html', 'es/contacto.html', 'pt/contato.html', 'ru/kontakty.html', 'ar/contact.html']) {
    const html = read(f);
    assert.ok(html.includes('btv-inquiry-prefill.js'), `${f}: must load btv-inquiry-prefill.js`);
    assert.match(html, /class="contact-form"/, `${f}: must match contact form selector`);
  }

  // Full 197-page bidirectional hreflang return-tag verification
  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const altsByUrl = new Map();
  for (const url of locs) {
    const pathname = new URL(url).pathname;
    const rel = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
    const html = read(rel);
    const links = [...html.matchAll(/<link\s+rel=["']alternate["'][^>]*\bhreflang=["']([^"']+)["'][^>]*\bhref=["']([^"']+)["']/gi)];
    altsByUrl.set(url, links.map((m) => ({ hreflang: m[1], href: m[2] })));
  }
  for (const [url, links] of altsByUrl.entries()) {
    for (const { hreflang, href } of links) {
      if (hreflang === 'x-default') {
        assert.ok(altsByUrl.has(href), `${url}: x-default target missing from sitemap: ${href}`);
        continue;
      }
      assert.ok(altsByUrl.has(href), `${url}: hreflang=${hreflang} target missing from sitemap: ${href}`);
      const targetLinks = altsByUrl.get(href);
      assert.ok(
        targetLinks.some((t) => t.href === url),
        `${url}: asymmetric hreflang=${hreflang} -> ${href} has no return link`
      );
    }
  }

  // Every flagshipBundleForm carries data-contact-path and data-engine-sku
  for (const lang of LANGS) {
    for (const slug of ['cg150-air-cooled-engine', 'cg200-air-cooled-engine', 'cg250sb-water-cooled-engine', 'hw300-water-cooled-engine']) {
      const html = read(`${lang}/cg-engine/${slug}.html`);
      assert.match(html, /id="flagshipBundleForm"[^>]*data-contact-path="/, `${lang}/${slug}: missing data-contact-path`);
      assert.match(html, /id="flagshipBundleForm"[^>]*data-engine-sku="[^"]+/, `${lang}/${slug}: missing data-engine-sku`);
    }
    if (lang !== 'zh-cn') {
      const bmHtml = read(`${lang}/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine.html`);
      assert.match(bmHtml, /id="flagshipBundleForm"[^>]*data-contact-path="/, `${lang}/bm150: missing data-contact-path`);
      assert.match(bmHtml, /id="flagshipBundleForm"[^>]*data-engine-sku="[^"]+/, `${lang}/bm150: missing data-engine-sku`);
    }
  }
});
