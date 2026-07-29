const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const canonicalOrigin = 'https://chixiangmotor.com';
const languageDirectories = ['ar', 'en', 'es', 'pt', 'ru'];

const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function walkHtml(directory) {
  const result = [];
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkHtml(relative));
    if (entry.isFile() && entry.name.endsWith('.html')) result.push(relative);
  }
  return result;
}

const contentFiles = languageDirectories.flatMap(walkHtml);

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match ? match[1] : null;
}

function linkTags(html, rel) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0])
    .filter(tag => (attribute(tag, 'rel') || '').toLowerCase() === rel);
}

function canonicalHref(html) {
  const tags = linkTags(html, 'canonical');
  assert.equal(tags.length, 1, 'indexable documents must publish exactly one canonical');
  return attribute(tags[0], 'href');
}

function sitemapLocations() {
  return [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

function sourceFileForUrl(rawUrl) {
  const { pathname } = new URL(rawUrl);
  if (pathname.endsWith('/')) return `${pathname.slice(1)}index.html`;
  return `${pathname.slice(1)}.html`;
}

function sourceUrlForFile(file) {
  return new URL(`/${file}`, `${canonicalOrigin}/`);
}

function isInternalHref(href) {
  if (/^(?:#|mailto:|tel:|javascript:)/i.test(href)) return false;
  if (/^https?:/i.test(href)) {
    return /^https?:\/\/(?:www\.)?chixiangmotor\.com(?:\/|$)/i.test(href);
  }
  return true;
}

test('sitemap contains only unique, clean, canonical, indexable document URLs', async () => {
  const locations = sitemapLocations();
  const { default: router } = await import(
    pathToFileURL(path.join(root, 'workers', 'site-router.mjs')).href
  );
  const env = {
    ASSETS: {
      fetch() {
        return Promise.resolve(new Response('asset', { status: 200 }));
      }
    }
  };

  assert.ok(locations.length > 0);
  assert.equal(new Set(locations).size, locations.length, 'sitemap URLs must be unique');

  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.protocol, 'https:', location);
    assert.equal(url.host, 'chixiangmotor.com', location);
    assert.notEqual(url.pathname, '/', 'root redirect cannot be a sitemap entity');
    assert.doesNotMatch(url.pathname, /(?:index\.html|\.html)$/i, location);
    assert.notEqual(url.pathname, '/en/product-detail', location);
    assert.equal(url.search, '', `query variants are not sitemap entities: ${location}`);

    const response = await router.fetch(new Request(location), env);
    assert.equal(response.status, 200, `sitemap URL must not redirect: ${location}`);

    const source = sourceFileForUrl(location);
    assert.ok(fs.existsSync(path.join(root, source)), `missing source document for ${location}`);
    const html = read(source);
    assert.doesNotMatch(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i, source);
    assert.equal(canonicalHref(html), location, `${source} must self-canonicalize`);
  }
});

test('indexable metadata uses clean non-www document URLs', () => {
  for (const file of contentFiles) {
    if (file === 'en/product-detail.html') continue;
    const html = read(file);
    const metadataUrls = [];

    for (const tag of [...linkTags(html, 'canonical'), ...linkTags(html, 'alternate')]) {
      const href = attribute(tag, 'href');
      if (href) metadataUrls.push(href);
    }
    for (const match of html.matchAll(/<meta\b[^>]*property=["']og:url["'][^>]*>/gi)) {
      const content = attribute(match[0], 'content');
      if (content) metadataUrls.push(content);
    }

    for (const value of metadataUrls) {
      const url = new URL(value, sourceUrlForFile(file));
      assert.equal(url.protocol, 'https:', `${file}: ${value}`);
      assert.equal(url.host, 'chixiangmotor.com', `${file}: ${value}`);
      assert.doesNotMatch(url.pathname, /(?:index\.html|\.html)$/i, `${file}: ${value}`);
    }
  }
});

test('customer-facing internal document links use final clean routes', () => {
  for (const file of ['index.html', ...contentFiles]) {
    const html = read(file);
    const base = sourceUrlForFile(file);
    const hrefs = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)]
      .map(match => match[1])
      .filter(isInternalHref);

    for (const href of hrefs) {
      const url = new URL(href, base);
      assert.equal(url.host, 'chixiangmotor.com', `${file}: ${href}`);
      assert.doesNotMatch(url.pathname, /(?:index\.html|\.html)$/i, `${file}: ${href}`);
    }
  }
});

test('root fallback is readable and delegates the entity to /en/ without client navigation', () => {
  const html = read('index.html');

  assert.doesNotMatch(html, /http-equiv=["']refresh["']/i);
  assert.doesNotMatch(html, /window\.location/i);
  assert.match(html, /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+/i);
  assert.match(html, /<h1\b(?![^>]*\bsr-only\b)[^>]*>[^<]+<\/h1>/i);
  assert.match(html, /<a\b[^>]*href=["']\/en\/["']/i);
  assert.equal(canonicalHref(html), `${canonicalOrigin}/en/`);
  assert.equal(linkTags(html, 'alternate').length, 0, 'root is not part of hreflang');
});

test('shared product detail is a noindex utility and is absent from the sitemap', () => {
  const html = read('en/product-detail.html');
  const robotsTag = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i);

  assert.ok(robotsTag, 'product detail must publish a robots directive');
  assert.equal(
    (attribute(robotsTag[0], 'content') || '').toLowerCase().replace(/\s+/g, ''),
    'noindex,follow'
  );
  assert.equal(linkTags(html, 'canonical').length, 0, 'query utility must not claim one canonical');
  assert.doesNotMatch(read('sitemap.xml'), /product-detail/i);
});

test('the historical HTML artifact under images cannot become a duplicate entity', () => {
  const html = read('images/factory-showcase/gorizontalnyj-dvigatel.html');
  const robotsTag = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i);

  assert.ok(robotsTag, 'the historical artifact must publish a robots directive');
  assert.equal(
    (attribute(robotsTag[0], 'content') || '').toLowerCase().replace(/\s+/g, ''),
    'noindex,follow'
  );
  assert.equal(
    canonicalHref(html),
    `${canonicalOrigin}/ru/gorizontalnyj-dvigatel`
  );
});
