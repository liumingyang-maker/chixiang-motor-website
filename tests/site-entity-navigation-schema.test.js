const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const origin = 'https://chixiangmotor.com';
const organizationId = `${origin}/#organization`;
const websiteId = `${origin}/#website`;

const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function sitemapPages() {
  return [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const url = match[1];
    const pathname = new URL(url).pathname;
    const file = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
    return { url, pathname, file, language: pathname.split('/')[1] };
  });
}

function jsonLdBlocks(html, file) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match, index) => {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        assert.fail(`${file}: JSON-LD block ${index + 1} is invalid: ${error.message}`);
      }
    });
}

function schemaNodes(html, file) {
  const nodes = [];
  const visit = value => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (value['@type']) nodes.push(value);
    if (Array.isArray(value['@graph'])) visit(value['@graph']);
  };
  for (const block of jsonLdBlocks(html, file)) visit(block);
  return nodes;
}

function schemaTypes(nodes) {
  return nodes.flatMap(node => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
}

function pageRole(page) {
  if (/^\/(?:en|es|pt|ru|ar)\/$/.test(page.pathname)) return 'home';
  if (/\/(?:about)$/.test(page.pathname)) return 'about';
  if (/\/(?:products)$/.test(page.pathname)) return 'products';
  if (/\/(?:contact|contacto|contato|kontakty)$/.test(page.pathname)) return 'contact';
  if (/\/news$/.test(page.pathname)) return 'news';
  if (/^\/en\/(?:air-cooled-vs-water-cooled-motorcycle-engine|how-to-choose-motorcycle-engine-manufacturer-china)$/.test(page.pathname)) return 'article';
  if (page.pathname === '/es/guia/que-es-un-motor-cg/') return 'article';
  if (/^\/(?:ru\/(?:russia|central-asia)|es\/(?:peru|colombia))\/$/.test(page.pathname)) return 'market';
  return 'family';
}

function expectedPageType(role) {
  return {
    home: 'WebPage',
    about: 'AboutPage',
    products: 'CollectionPage',
    contact: 'ContactPage',
    news: 'CollectionPage',
    article: 'WebPage',
    market: 'WebPage',
    family: 'CollectionPage'
  }[role];
}

function expectedTrail(page) {
  const role = pageRole(page);
  if (role === 'home') return [];
  const trail = [`${origin}/${page.language}/`];
  if (role === 'family' || role === 'market') trail.push(`${origin}/${page.language}/products`);
  if (role === 'article') trail.push(`${origin}/${page.language}/news`);
  trail.push(page.url);
  return trail;
}

function visibleBreadcrumb(html) {
  const match = html.match(/<nav\b(?=[^>]*\bclass=["'][^"']*\bentity-breadcrumb\b[^"']*["'])(?=[^>]*\baria-label=["']Breadcrumb["'])[^>]*>([\s\S]*?)<\/nav>/i);
  return match ? match[0] : null;
}

function breadcrumbUrls(node) {
  const items = node && node.itemListElement;
  assert.ok(Array.isArray(items), 'BreadcrumbList.itemListElement must be an array');
  return items.map((item, index) => {
    assert.equal(item['@type'], 'ListItem');
    assert.equal(item.position, index + 1);
    assert.equal(typeof item.name, 'string');
    assert.ok(item.name.trim());
    return item.item;
  });
}

test('sitemap manifest contains exactly 51 canonical source pages', () => {
  const pages = sitemapPages();
  assert.equal(pages.length, 52);
  assert.equal(new Set(pages.map(page => page.url)).size, 52);
  for (const page of pages) {
    assert.ok(fs.existsSync(path.join(root, page.file)), `${page.url}: missing ${page.file}`);
    assert.equal(new URL(page.url).origin, origin);
  }
});

test('maintenance manifest reproduces the canonical role and breadcrumb contract', () => {
  const modulePath = path.join(root, 'scripts', 'site-entity-manifest.js');
  assert.ok(fs.existsSync(modulePath), 'missing scripts/site-entity-manifest.js');
  const { loadManifest, organizationId: actualOrganizationId, websiteId: actualWebsiteId } = require(modulePath);
  const manifest = loadManifest(root);
  const expected = sitemapPages();

  assert.equal(actualOrganizationId, organizationId);
  assert.equal(actualWebsiteId, websiteId);
  assert.equal(manifest.length, 52);
  assert.deepEqual(manifest.map(entry => entry.url), expected.map(page => page.url));
  for (let index = 0; index < expected.length; index += 1) {
    const page = expected[index];
    const entry = manifest[index];
    assert.equal(entry.file, page.file);
    assert.equal(entry.language, page.language);
    assert.equal(entry.role, pageRole(page));
    assert.equal(entry.schemaType, expectedPageType(entry.role));
    assert.deepEqual(entry.breadcrumb.map(item => item.item), expectedTrail(page));
  }
});

test('all canonical pages publish their safe primary page type and stable entity references', () => {
  for (const page of sitemapPages()) {
    const html = read(page.file);
    const nodes = schemaNodes(html, page.file);
    const types = schemaTypes(nodes);
    const role = pageRole(page);
    assert.ok(types.includes(expectedPageType(role)), `${page.file}: missing ${expectedPageType(role)}`);
    assert.ok(html.includes(organizationId), `${page.file}: missing shared Organization @id`);
    assert.ok(html.includes(websiteId), `${page.file}: missing shared WebSite @id`);
    assert.doesNotMatch(
      JSON.stringify(jsonLdBlocks(html, page.file)),
      /"@type":"(?:Product|ProductGroup|Offer|Review|AggregateRating)"/,
      `${page.file}: ecommerce schema is outside the approved scope`
    );
  }
});

test('46 non-home pages expose a visible canonical breadcrumb trail', () => {
  const pages = sitemapPages();
  const homePages = pages.filter(page => pageRole(page) === 'home');
  const nonHomePages = pages.filter(page => pageRole(page) !== 'home');
  assert.equal(homePages.length, 5);
  assert.equal(nonHomePages.length, 47);

  for (const page of homePages) {
    assert.equal(visibleBreadcrumb(read(page.file)), null, `${page.file}: language home has no breadcrumb`);
  }

  for (const page of nonHomePages) {
    const breadcrumb = visibleBreadcrumb(read(page.file));
    assert.ok(breadcrumb, `${page.file}: missing visible breadcrumb nav`);
    assert.match(breadcrumb, /aria-current=["']page["']/i, `${page.file}: missing current-page marker`);
    const parentUrls = expectedTrail(page).slice(0, -1).map(url => new URL(url).pathname);
    for (const parentUrl of parentUrls) {
      assert.match(
        breadcrumb,
        new RegExp(`href=["']${parentUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`),
        `${page.file}: missing parent ${parentUrl}`
      );
    }
  }
});

test('46 non-home pages publish matching BreadcrumbList structured data', () => {
  for (const page of sitemapPages()) {
    const html = read(page.file);
    const nodes = schemaNodes(html, page.file);
    const breadcrumbs = nodes.filter(node => {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      return types.includes('BreadcrumbList');
    });
    const role = pageRole(page);
    if (role === 'home') {
      assert.equal(breadcrumbs.length, 0, `${page.file}: language home has no BreadcrumbList`);
      continue;
    }
    assert.equal(breadcrumbs.length, 1, `${page.file}: exactly one BreadcrumbList`);
    assert.equal(breadcrumbs[0]['@id'], `${page.url}#breadcrumb`);
    assert.deepEqual(breadcrumbUrls(breadcrumbs[0]), expectedTrail(page), `${page.file}: breadcrumb hierarchy`);
  }
});

test('generated entity graphs use one marker and responsive breadcrumb CSS', () => {
  for (const page of sitemapPages()) {
    const html = read(page.file);
    assert.equal((html.match(/data-site-entity-graph/g) || []).length, 1, `${page.file}: one generated graph`);
  }
  const css = read('css/style.css');
  const rule = css.match(/\.entity-breadcrumb\s*\{([\s\S]*?)\}/);
  assert.ok(rule, 'missing .entity-breadcrumb rule');
  assert.match(rule[1], /flex-wrap\s*:\s*wrap/);
  assert.doesNotMatch(rule[1], /white-space\s*:\s*nowrap|overflow-x\s*:\s*hidden|width\s*:\s*\d+px/);
});

test('the 51-page governance matrix records the entity link and schema contract', () => {
  const lines = read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv').trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const testsColumn = header.indexOf('tests');
  assert.notEqual(testsColumn, -1, 'matrix tests column');
  assert.equal(lines.length - 1, 52, 'matrix canonical page rows');
  for (const line of lines.slice(1)) {
    const columns = line.split(',');
    assert.match(columns[testsColumn], /(?:^|\|)site entity link\/schema contract(?:\||$)/);
  }
});
