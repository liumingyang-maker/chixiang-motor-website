const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { routes } = require('../scripts/product-family-owner-manifest');

const root = path.join(__dirname, '..');
const frozenBaseline = '5ce9254ab1ecd84dc9268efb55b9acaad7feb13d';

const frozenFiles = [
  'AGENTS.md',
  'js/main.js',
  'js/yandex-metrica.js',
  'workers/contact-api/src/contact-handler.mjs',
  'workers/contact-api/src/index.mjs',
  'workers/site-router.mjs',
  'wrangler.toml',
  'workers/contact-api/wrangler.jsonc',
  'sitemap.xml',
  'robots.txt',
  'scripts/site-entity-manifest.js',
  'scripts/apply-site-entity-schema.js',
  'ads/algerie/index.html',
  'css/algeria-landing.css',
  'js/algeria-landing.js'
];

const corePages = [
  'en/index.html', 'en/products.html', 'en/about.html', 'en/contact.html', 'en/news.html',
  'es/index.html', 'es/products.html', 'es/about.html', 'es/contacto.html', 'es/news.html',
  'pt/index.html', 'pt/products.html', 'pt/about.html', 'pt/contato.html', 'pt/news.html',
  'ru/index.html', 'ru/products.html', 'ru/about.html', 'ru/kontakty.html', 'ru/news.html',
  'ar/index.html', 'ar/products.html', 'ar/about.html', 'ar/contact.html', 'ar/news.html'
];

const mutablePages = [
  ...corePages,
  ...routes.map(route => route.file),
  'en/product-detail.html',
  'en/how-to-choose-motorcycle-engine-manufacturer-china.html',
  'en/air-cooled-vs-water-cooled-motorcycle-engine.html'
];

const contactPages = [
  'en/contact.html',
  'es/contacto.html',
  'pt/contato.html',
  'ru/kontakty.html',
  'ar/contact.html'
];

const a2MenuPages = new Set([
  'en/cg-engine.html',
  'en/cb-engine.html',
  'en/horizontal-engine.html',
  'en/engine-parts.html'
]);

function git(args, options = {}) {
  return childProcess.execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    ...options
  });
}

function current(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function baseline(file) {
  return git(['show', `${frozenBaseline}:${file}`]);
}

function normalized(text) {
  return text.replace(/\r\n/g, '\n');
}

function oneH1(html, file) {
  const matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(matches.length, 1, `${file}: expected one H1`);
  return matches[0][1].replace(/\s+/g, ' ').trim();
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : null;
}

function seoContract(html) {
  const links = tags(html, 'link').map(tag => ({
    rel: attribute(tag, 'rel'),
    href: attribute(tag, 'href'),
    hreflang: attribute(tag, 'hreflang')
  })).filter(link => link.rel === 'canonical' || link.rel === 'alternate');
  const robots = tags(html, 'meta').map(tag => ({
    name: attribute(tag, 'name'),
    content: attribute(tag, 'content')
  })).filter(meta => meta.name && meta.name.toLowerCase() === 'robots');
  return { links, robots };
}

function breadcrumb(html) {
  const match = html.match(/<nav\b(?=[^>]*\bclass=["'][^"']*\bbreadcrumb\b[^"']*["'])[^>]*>[\s\S]*?<\/nav>/i);
  return match ? normalized(match[0]) : null;
}

function ownerMarker(html) {
  const match = html.match(/<[a-z][\w:-]*\b[^>]*\bdata-product-family-owner=(["'])(.*?)\1[^>]*>/i);
  return match ? match[0] : null;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort()
      .map(key => [key, canonicalJson(value[key])]));
  }
  return value;
}

function jsonLd(html, file) {
  const scripts = [...html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.map((match, index) => {
    try {
      return canonicalJson(JSON.parse(match[1]));
    } catch (error) {
      throw new Error(`${file}: invalid JSON-LD at index ${index}: ${error.message}`);
    }
  });
}

function scriptSources(html) {
  return tags(html, 'script').map(tag => attribute(tag, 'src') || '[inline]');
}

function procurementForms(html, file) {
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)];
  assert.ok(forms.length > 0, `${file}: missing procurement form`);
  return forms.map(match => normalized(match[0]));
}

function frozenDiffArgs(candidate) {
  return [
    'diff',
    '--quiet',
    frozenBaseline,
    ...(candidate ? [candidate] : []),
    '--',
    ...frozenFiles
  ];
}

function frozenDiff(candidate) {
  return childProcess.spawnSync('git', frozenDiffArgs(candidate), {
    cwd: root,
    encoding: 'utf8'
  });
}

test('frozen-file guard uses distinct candidate and working-tree comparisons', () => {
  assert.deepEqual(
    frozenDiffArgs('HEAD'),
    ['diff', '--quiet', frozenBaseline, 'HEAD', '--', ...frozenFiles]
  );
  assert.deepEqual(
    frozenDiffArgs(),
    ['diff', '--quiet', frozenBaseline, '--', ...frozenFiles]
  );
});

function stripP1RouterPayload(content) {
  let out = content.replace(/\/\* P1-SERIES-301 START \*\/[\s\S]*?\/\* P1-SERIES-301 END \*\/\r?\n?/, '');
  out = out.replace('function redirectLocation(requestUrl, method) {', 'function redirectLocation(requestUrl) {');
  out = out.replace(
    /\r?\n  const productTarget = productSeriesRedirect\(requestUrl, method \|\| 'GET'\);\r?\n  if \(productTarget\) return productTarget;\r?\n/,
    '\n'
  );
  out = out.replace('const location = redirectLocation(requestUrl, request.method);', 'const location = redirectLocation(requestUrl);');
  // collapse only the seam left by fence removal
  out = out.replace(/\n{3,}(?=function normalizedDocumentPath)/, '\n\n');
  return out;
}

function gitShow(rev, file) {
  return git(['show', `${rev}:${file}`]);
}

function readFile(file) {
  return require('node:fs').readFileSync(require('node:path').join(root, file), 'utf8');
}

function stripA1SitemapEntry(xml) {
  return xml
    .replace(
      /\s*<url>\s*<loc>https:\/\/chixiangmotor\.com\/en\/ac320-atv-engine<\/loc>[\s\S]*?<\/url>/,
      ''
    )
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

test('frozen files have no candidate-tree or working-tree diff from the fixed baseline', () => {
  const others = frozenFiles.filter(
    (file) => file !== 'workers/site-router.mjs' && file !== 'sitemap.xml'
  );
  for (const revArgs of [['HEAD'], []]) {
    const result = childProcess.spawnSync(
      'git',
      ['diff', '--quiet', frozenBaseline, ...revArgs, '--', ...others],
      { cwd: root, encoding: 'utf8' }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout || 'frozen file changed');
  }
});

test('sitemap matches baseline after removing only the approved AC320 entry', () => {
  const baseline = gitShow(frozenBaseline, 'sitemap.xml').replace(/\r\n/g, '\n');
  const candidate = stripA1SitemapEntry(gitShow('HEAD', 'sitemap.xml'));
  const working = stripA1SitemapEntry(readFile('sitemap.xml'));
  assert.equal(candidate, baseline, 'sitemap candidate has unapproved changes');
  assert.equal(working, baseline, 'sitemap working tree has unapproved changes');
  assert.match(readFile('sitemap.xml'), /en\/ac320-atv-engine/);
});

test('site-router matches baseline after reverting only the approved P1 payload', () => {
  const baseline = gitShow(frozenBaseline, 'workers/site-router.mjs').replace(/\r\n/g, '\n');
  const candidate = stripP1RouterPayload(gitShow('HEAD', 'workers/site-router.mjs').replace(/\r\n/g, '\n'));
  const working = stripP1RouterPayload(readFile('workers/site-router.mjs').replace(/\r\n/g, '\n'));
  assert.equal(candidate, baseline, 'site-router candidate differs outside approved P1 payload');
  assert.equal(working, baseline, 'site-router working tree differs outside approved P1 payload');

  // Reverse guard: approved payload must exist and stay fenced.
  const raw = readFile('workers/site-router.mjs');
  assert.match(raw, /\/\* P1-SERIES-301 START \*\//);
  assert.match(raw, /\/\* P1-SERIES-301 END \*\//);
  assert.match(raw, /PRODUCT_SERIES_ROUTES/);
  assert.match(raw, /productSeriesRedirect/);

  // Unapproved legacy logic must survive stripping (not silently deleted).
  assert.match(stripP1RouterPayload(raw), /LEGACY_PATHS/);
  assert.match(stripP1RouterPayload(raw), /VERIFICATION_ASSETS/);
  assert.match(stripP1RouterPayload(raw), /CANONICAL_ORIGIN/);
});

test('P1 fenced payload content is pinned and rejects unapproved additions', () => {
  const raw = readFile('workers/site-router.mjs');
  const match = raw.match(/\/\* P1-SERIES-301 START \*\/([\s\S]*?)\/\* P1-SERIES-301 END \*\//);
  assert.ok(match, 'P1 fence missing');
  const payload = match[1].replace(/\r\n/g, '\n').trim();
  const hash = require('node:crypto').createHash('sha256').update(payload).digest('hex');
  // Pinned approved payload for PR P1 rework (attribution retention + length fallback).
  const approved = new Set([
    // filled below by test run helper if needed — keep explicit value:
    hash
  ]);
  // Strong pin: exact expected hash constant
  const expected = 'd538065efdf7c8e349a67ef9c96f300eafbf53e439e738056a58a18b99a7c6f1';
  assert.equal(hash, expected, 'fenced P1 payload changed; update pin only with Owner/GPT approval');

  // Negative: fence must not swallow legacy routing markers
  assert.ok(payload.indexOf('LEGACY_PATHS') === -1);
  assert.ok(payload.indexOf('VERIFICATION_ASSETS') === -1);
  // Positive structure
  assert.match(payload, /PRODUCT_SERIES_ROUTES/);
  assert.match(payload, /ALLOWED_ATTRIBUTION_PARAMS/);
  assert.match(payload, /MAX_REDIRECT_LOCATION_LENGTH/);
  assert.match(payload, /productRedirectHref/);
});

test('frozen strip is local to product redirects, not a global whitespace rewrite', () => {
  const raw = readFile('workers/site-router.mjs');
  const stripped = stripP1RouterPayload(raw);
  // stripping must not collapse blank lines across the whole file inappropriately:
  // LEGACY_PATHS block spacing must match baseline (already asserted) and remain present.
  assert.match(stripped.replace(/\r\n/g, '\n'), /const LEGACY_PATHS = new Map\(\[\n  \['\/ru\/uzbekistan\/'/);
  assert.ok(stripped.includes('async fetch(request, env)'));
});

// Freeze-exception contract (product-detail tool page): neutral H1 instead of a
// fixed CG air-cooled shell. SEO/JSON-LD/owner/scripts still match the baseline.
const productDetailToolH1 = 'Motorcycle Engine Product Series';

test('mutable pages retain the SEO, ownership, baseline breadcrumb state and complete JSON-LD contracts', () => {
  for (const file of mutablePages) {
    const before = baseline(file);
    const after = current(file);
    if (file === 'en/product-detail.html') {
      assert.equal(oneH1(after, file), productDetailToolH1, `${file}: tool H1 contract changed`);
    } else {
      assert.equal(oneH1(after, file), oneH1(before, file), `${file}: H1 changed`);
    }
    assert.deepEqual(seoContract(after), seoContract(before), `${file}: SEO metadata changed`);
    assert.equal(breadcrumb(after), breadcrumb(before), `${file}: breadcrumb state changed`);
    assert.deepEqual(jsonLd(after, file), jsonLd(before, file), `${file}: JSON-LD changed`);
    assert.equal(ownerMarker(after), ownerMarker(before), `${file}: owner marker changed`);

    const beforeScripts = scriptSources(before);
    const afterScripts = scriptSources(after);
    if (a2MenuPages.has(file)) {
      const withoutAllowedA2Script = afterScripts.filter(source => source !== '../js/core-menu-accessibility.js');
      assert.equal(
        afterScripts.length - withoutAllowedA2Script.length,
        1,
        `${file}: expected exactly one approved A2 script`
      );
      assert.deepEqual(withoutAllowedA2Script, beforeScripts, `${file}: script set changed`);
    } else {
      assert.deepEqual(afterScripts, beforeScripts, `${file}: script set changed`);
    }
  }
});

test('every baseline product-family owner marker is observable by the invariant', () => {
  for (const route of routes) {
    if (route.protected) continue;
    assert.notEqual(ownerMarker(baseline(route.file)), null, `${route.file}: baseline owner marker was not found`);
  }
});

test('all five managed procurement forms retain their complete source contract', () => {
  for (const file of contactPages) {
    assert.deepEqual(
      procurementForms(current(file), file),
      procurementForms(baseline(file), file),
      `${file}: procurement form contract changed`
    );
  }
});
