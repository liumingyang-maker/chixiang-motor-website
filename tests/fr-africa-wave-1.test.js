const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROUTE_GROUPS, LANGS, HREFLANG_MAP } = require('../scripts/i18n-matrix');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function toDiskPath(pathname) {
  if (pathname === '/') return 'index.html';
  const clean = pathname.replace(/^\//, '');
  if (clean.endsWith('/')) return path.posix.join(clean, 'index.html');
  if (/\.[a-z0-9]+$/i.test(clean)) return clean;
  if (fs.existsSync(path.join(root, `${clean}.html`))) return `${clean}.html`;
  if (fs.existsSync(path.join(root, clean, 'index.html'))) return path.posix.join(clean, 'index.html');
  return null;
}

const FR_PAGES = Object.entries(ROUTE_GROUPS).map(([role, group]) => ({
  role,
  urlPath: group.fr,
  file: group.fr.endsWith('/') ? `${group.fr.slice(1)}index.html` : `${group.fr.slice(1)}.html`
}));

test('all 24 pure-French matrix pages exist with lang="fr", single H1, self canonical, 7-way hreflang, and sitemap registration', () => {
  const sitemap = read('sitemap.xml');

  for (const p of FR_PAGES) {
    assert.ok(fs.existsSync(path.join(root, p.file)), `${p.file} must exist`);
    const html = read(p.file);
    assert.match(html, /<html lang="fr">/, `${p.file}: <html lang="fr"> required`);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${p.file}: exactly one H1`);

    const canonicalUrl = `https://chixiangmotor.com${p.urlPath}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl}">`), `${p.file}: self canonical missing`);
    for (const l of LANGS) {
      const targetUrl = `https://chixiangmotor.com${ROUTE_GROUPS[p.role][l]}`;
      assert.ok(
        html.includes(`<link rel="alternate" hreflang="${HREFLANG_MAP[l]}" href="${targetUrl}">`),
        `${p.file}: missing hreflang=${HREFLANG_MAP[l]}`
      );
    }
    assert.ok(
      html.includes(`<link rel="alternate" hreflang="x-default" href="https://chixiangmotor.com${ROUTE_GROUPS[p.role].en}">`),
      `${p.file}: missing x-default hreflang`
    );
    assert.ok(sitemap.includes(`<loc>${canonicalUrl}</loc>`), `sitemap.xml missing ${canonicalUrl}`);
  }
});

test('all 24 /fr/ pages are 100% pure French with zero (EN) fallbacks and zero 404 internal links', () => {
  for (const p of FR_PAGES) {
    const html = read(p.file);
    assert.ok(!/\(EN\)/.test(html), `${p.file}: must not contain (EN) fallback labels`);
    assert.ok(!/href="\/en\//i.test(html.replace(/<link\s+rel="alternate"[^>]*>/gi, '').replace(/<div class="lang-dropdown">[\s\S]*?<\/div>/i, '').replace(/<div class="mobile-nav-langs">[\s\S]*?<\/div>/i, '')), `${p.file}: body/nav must link inside /fr/, not /en/`);

    const hrefs = [...html.matchAll(/\bhref="([^"]+)"/gi)].map(m => m[1]);
    for (const href of hrefs) {
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
      if (href.startsWith('/ads/')) continue;
      const pathname = href.split(/[?#]/)[0];
      if (!pathname) continue;
      const resolved = toDiskPath(pathname);
      assert.ok(resolved && fs.existsSync(path.join(root, resolved)), `${p.file}: broken internal link ${href}`);
    }
  }
});

test('African French terminology boundaries, banned phrases, SSOT specs, and dynamic WhatsApp CTAs hold', () => {
  const banned = [
    /groupage\s+maritime/i,
    /d['’]origine\s+(?:Bajaj|TVS)/i,
    /300\s*cm[³3]/i,
    /\b99\s*%(?![0-9A-Fa-f]{2})/,
    /within\s+24\s+hours/i,
    /\b36JZ\b/i,
    /Top\s+10/i
  ];

  for (const p of FR_PAGES) {
    const html = read(p.file);
    for (const re of banned) {
      assert.doesNotMatch(html, re, `${p.file}: contains banned term ${re}`);
    }
    assert.ok(
      html.includes('href="https://wa.me/8619008225410?text='),
      `${p.file}: missing dynamic pre-filled French WhatsApp CTA`
    );
  }

  for (const p of FR_PAGES) {
    if (p.role === 'home' || p.role === 'horizontal' || p.role === 'products' || p.role === 'news' || p.role === 'parts' || p.role === 'horizontal-motorcycle-engine-110cc-150cc-selection-guide') continue;
    const html = read(p.file);
    assert.ok(!/Jakarta/i.test(html), `${p.file}: Jakarta terminology must stay scoped to horizontal / overview pages only`);
  }

  const hwHtml = read('fr/cg-engine/hw300-water-cooled-engine.html');
  assert.ok(hwHtml.includes('275.3 mL') || hwHtml.includes('275,3 mL'));
  assert.match(hwHtml, /Refroidissement liquide \(eau\)/);
  assert.match(hwHtml, /marche arrière/i);

  const btvHtml = read('fr/bajaj-tvs-engines-parts.html');
  assert.match(btvHtml, /adaptable/i);
  assert.match(btvHtml, /à titre d(?:&#39;|')identification/i);
  assert.ok(btvHtml.includes(encodeURIComponent('Bajaj Boxer BM150 / TVS HLX150')));

  const contactHtml = read('fr/contact.html');
  assert.match(contactHtml, /Abidjan/);
  assert.match(contactHtml, /Douala/);
  assert.match(contactHtml, /Cotonou/);
  assert.match(contactHtml, /Dakar/);
  assert.match(contactHtml, /BSC\s*\/\s*BESC/);
});

test('render-matrix-core-pages.js --check reports zero drift', () => {
  const out = execFileSync(process.execPath, [path.join(root, 'scripts', 'render-matrix-core-pages.js'), '--check'], { encoding: 'utf8' });
  assert.match(out, /0 matrix core files need updates/);
});
