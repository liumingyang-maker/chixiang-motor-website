const fs = require('node:fs');
const path = require('node:path');

const canonicalOrigin = 'https://chixiangmotor.com';
const organizationId = `${canonicalOrigin}/#organization`;
const websiteId = `${canonicalOrigin}/#website`;

const labels = {
  en: { home: 'Home', products: 'Products', news: 'News' },
  es: { home: 'Inicio', products: 'Productos', news: 'Noticias' },
  pt: { home: 'Início', products: 'Produtos', news: 'Notícias' },
  ru: { home: 'Главная', products: 'Продукты', news: 'Новости' },
  ar: { home: 'الرئيسية', products: 'المنتجات', news: 'الأخبار' }
};

const marketTitles = {
  '/ru/russia/': 'Двигатели для России',
  '/ru/central-asia/': 'Двигатели для Центральной Азии',
  '/es/peru/': 'Motores para motocicletas y trimotos de carga en Perú',
  '/es/colombia/': 'Motores CG 125/150 cc para motos de trabajo y reemplazo'
};

function decodeEntities(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function textContent(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function sourceFileForUrl(url) {
  const pathname = new URL(url).pathname;
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function classify(pathname) {
  if (/^\/(?:en|es|pt|ru|ar)\/$/.test(pathname)) return { role: 'home', schemaType: 'WebPage' };
  if (/\/about$/.test(pathname)) return { role: 'about', schemaType: 'AboutPage' };
  if (/\/products$/.test(pathname)) return { role: 'products', schemaType: 'CollectionPage' };
  if (/\/(?:contact|contacto|contato|kontakty)$/.test(pathname)) return { role: 'contact', schemaType: 'ContactPage' };
  if (/\/news$/.test(pathname)) return { role: 'news', schemaType: 'CollectionPage' };
  if (/^\/en\/(?:air-cooled-vs-water-cooled-motorcycle-engine|how-to-choose-motorcycle-engine-manufacturer-china)$/.test(pathname)) {
    return { role: 'article', schemaType: 'WebPage' };
  }
  if (pathname === '/es/guia/que-es-un-motor-cg/') {
    return { role: 'article', schemaType: 'WebPage' };
  }
  if (/^\/(?:ru\/(?:russia|central-asia)|es\/(?:peru|colombia))\/$/.test(pathname)) {
    return { role: 'market', schemaType: 'WebPage' };
  }
  return { role: 'family', schemaType: 'CollectionPage' };
}

function pageName(html, pathname, role, language) {
  if (marketTitles[pathname]) return marketTitles[pathname];
  if (role === 'products') return labels[language].products;
  if (role === 'news') return labels[language].news;
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const heading = match ? textContent(match[1]) : '';
  if (!heading) throw new Error(`${pathname}: visible H1 text is required for the entity manifest`);
  return heading;
}

function pageDescription(html) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]);
  const description = tags.find(tag => attribute(tag, 'name').toLowerCase() === 'description');
  if (!description) return '';
  return attribute(description, 'content');
}

function breadcrumbFor(entry) {
  if (entry.role === 'home') return [];
  const languageLabels = labels[entry.language];
  const trail = [{ name: languageLabels.home, item: `${canonicalOrigin}/${entry.language}/` }];
  if (entry.role === 'family' || entry.role === 'market') {
    trail.push({ name: languageLabels.products, item: `${canonicalOrigin}/${entry.language}/products` });
  }
  if (entry.role === 'article') {
    trail.push({ name: languageLabels.news, item: `${canonicalOrigin}/${entry.language}/news` });
  }
  trail.push({ name: entry.name, item: entry.url });
  return trail;
}

function loadManifest(root) {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const url = match[1];
    const pathname = new URL(url).pathname;
    const file = sourceFileForUrl(url);
    const language = pathname.split('/')[1];
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const classification = classify(pathname);
    const entry = {
      url,
      pathname,
      file,
      language,
      ...classification,
      name: pageName(html, pathname, classification.role, language),
      description: pageDescription(html)
    };
    entry.breadcrumb = breadcrumbFor(entry);
    return entry;
  });
}

module.exports = {
  canonicalOrigin,
  organizationId,
  websiteId,
  labels,
  loadManifest
};
