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

test('frozen files have no candidate-tree or working-tree diff from the fixed baseline', () => {
  const result = childProcess.spawnSync('git', ['diff', '--quiet', frozenBaseline, '--', ...frozenFiles], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'frozen file changed');
});

test('mutable pages retain the SEO, ownership, baseline breadcrumb state and complete JSON-LD contracts', () => {
  for (const file of mutablePages) {
    const before = baseline(file);
    const after = current(file);
    assert.equal(oneH1(after, file), oneH1(before, file), `${file}: H1 changed`);
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
