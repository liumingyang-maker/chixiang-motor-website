const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  canonicalOrigin,
  organizationId,
  websiteId,
  loadManifest
} = require('./site-entity-manifest');

const root = path.join(__dirname, '..');
const checkOnly = process.argv.includes('--check');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function relativeUrl(url) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function renderVisibleBreadcrumb(entry, standalone = false) {
  const className = `breadcrumb entity-breadcrumb${standalone ? ' entity-breadcrumb--standalone' : ''}`;
  const parts = entry.breadcrumb.map((item, index) => {
    const label = escapeHtml(item.name);
    if (index === entry.breadcrumb.length - 1) return `<span aria-current="page">${label}</span>`;
    return `<a href="${relativeUrl(item.item)}">${label}</a><span aria-hidden="true">/</span>`;
  });
  return `<nav class="${className}" aria-label="Breadcrumb">${parts.join('')}</nav>`;
}

function removeGeneratedBreadcrumb(html) {
  return html.replace(
    /<nav\b(?=[^>]*\bclass=["'][^"']*\bentity-breadcrumb\b[^"']*["'])[^>]*>[\s\S]*?<\/nav>/gi,
    ''
  );
}

function insertVisibleBreadcrumb(html, entry) {
  if (entry.role === 'home') return removeGeneratedBreadcrumb(html);
  const clean = removeGeneratedBreadcrumb(html);
  const rendered = renderVisibleBreadcrumb(entry);
  const legacy = /<p\b(?=[^>]*\bclass=["'][^"']*\bbreadcrumb\b[^"']*["'])[^>]*>[\s\S]*?<\/p>/i;
  if (legacy.test(clean)) return clean.replace(legacy, rendered);

  const pageHeader = /(<section\b(?=[^>]*\bclass=["'][^"']*\bpage-header\b[^"']*["'])[^>]*>\s*<div\b(?=[^>]*\bclass=["'][^"']*\bcontainer\b[^"']*["'])[^>]*>)[\s]*/i;
  if (pageHeader.test(clean)) return clean.replace(pageHeader, `$1\n      ${rendered}\n      `);

  const aboutIntro = /(<section\b(?=[^>]*\bclass=["'][^"']*\babout-intro-section\b[^"']*["'])[^>]*>\s*<div\b(?=[^>]*\bclass=["'][^"']*\bcontainer\b[^"']*["'])[^>]*>)[\s]*/i;
  if (aboutIntro.test(clean)) return clean.replace(aboutIntro, `$1\n      ${rendered}\n      `);

  const main = /<main\b[^>]*>[\s]*/i;
  if (main.test(clean)) {
    const standalone = renderVisibleBreadcrumb(entry, true);
    return clean.replace(main, match => `${match.trimEnd()}\n    ${standalone}\n    `);
  }
  throw new Error(`${entry.file}: no safe breadcrumb insertion point`);
}

function removeGeneratedGraph(html) {
  return html.replace(
    /\s*<script\b(?=[^>]*\bdata-site-entity-graph\b)[^>]*>[\s\S]*?<\/script>\s*/gi,
    '\n'
  );
}

function typesOf(node) {
  if (!node || !node['@type']) return [];
  return Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
}

function cleanLegacyJsonLd(html, entry) {
  const script = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;
  return html.replace(script, (full, open, source, close) => {
    if (/data-site-entity-graph/i.test(open)) return full;
    let data;
    try {
      data = JSON.parse(source);
    } catch (error) {
      throw new Error(`${entry.file}: cannot update invalid JSON-LD: ${error.message}`);
    }
    let changed = false;
    if (Array.isArray(data['@graph'])) {
      const before = data['@graph'].length;
      data['@graph'] = data['@graph'].filter(node => {
        const pageNode = node && node['@id'] === `${entry.url}#webpage`;
        const websiteNode = node && node['@id'] === websiteId;
        const breadcrumbNode = typesOf(node).includes('BreadcrumbList');
        return !pageNode && !websiteNode && !breadcrumbNode;
      });
      changed = before !== data['@graph'].length;
    }
    if (entry.role === 'article' && typesOf(data).includes('Article')) {
      data['@id'] = `${entry.url}#article`;
      data.publisher = { '@id': organizationId };
      data.mainEntityOfPage = { '@id': `${entry.url}#webpage` };
      changed = true;
    }
    if (!changed) return full;
    return `${open}\n${JSON.stringify(data, null, 2)}\n${close}`;
  });
}

function pageNode(entry) {
  const node = {
    '@type': entry.schemaType,
    '@id': `${entry.url}#webpage`,
    url: entry.url,
    name: entry.name,
    isPartOf: { '@id': websiteId },
    publisher: { '@id': organizationId },
    inLanguage: entry.language
  };
  // Product catalogue meta descriptions may mention a clearly separated future
  // vehicle programme. Keep that visible context out of the current-supply graph.
  if (entry.description && entry.role !== 'products') node.description = entry.description;
  if (entry.role !== 'home') node.breadcrumb = { '@id': `${entry.url}#breadcrumb` };
  if (entry.role === 'home' || entry.role === 'about' || entry.role === 'contact') {
    node.about = { '@id': organizationId };
  }
  if (entry.role === 'about') node.mainEntity = { '@id': organizationId };
  if (entry.role === 'article') node.mainEntity = { '@id': `${entry.url}#article` };
  return node;
}

function breadcrumbNode(entry) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${entry.url}#breadcrumb`,
    itemListElement: entry.breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}

function entityGraph(entry) {
  const graph = [];
  if (entry.role === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${canonicalOrigin}/`,
      name: 'CHIXIANG MOTOR',
      publisher: { '@id': organizationId },
      inLanguage: ['en', 'es', 'pt', 'ru', 'ar']
    });
  }
  graph.push(pageNode(entry));
  if (entry.role !== 'home') graph.push(breadcrumbNode(entry));
  return { '@context': 'https://schema.org', '@graph': graph };
}

function insertEntityGraph(html, entry) {
  const cleaned = cleanLegacyJsonLd(removeGeneratedGraph(html), entry);
  const block = `  <script type="application/ld+json" data-site-entity-graph>\n${JSON.stringify(entityGraph(entry), null, 2)}\n  </script>\n`;
  if (!/<\/head>/i.test(cleaned)) throw new Error(`${entry.file}: missing </head>`);
  return cleaned.replace(/<\/head>/i, `${block}</head>`);
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function updatePage(entry) {
  const file = path.join(root, entry.file);
  const before = fs.readFileSync(file, 'utf8');
  const afterBreadcrumb = insertVisibleBreadcrumb(before, entry);
  const after = insertEntityGraph(afterBreadcrumb, entry);
  if (hash(before) === hash(after)) return false;
  if (!checkOnly) fs.writeFileSync(file, after, 'utf8');
  return true;
}

const changed = loadManifest(root).filter(updatePage);
if (checkOnly && changed.length) {
  console.error(`${changed.length} canonical pages are not synchronized.`);
  for (const entry of changed) console.error(`- ${entry.file}`);
  process.exitCode = 1;
} else {
  console.log(`${changed.length} canonical pages ${checkOnly ? 'need updates' : 'updated'}.`);
}
