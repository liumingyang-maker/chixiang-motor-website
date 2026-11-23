const fs = require('node:fs');
const path = require('node:path');

const canonicalOrigin = 'https://chixiangmotor.com';
const organizationId = `${canonicalOrigin}/#organization`;
const websiteId = `${canonicalOrigin}/#website`;
const officialSameAs = [
  'https://www.youtube.com/@chixiangmotor',
  'https://www.linkedin.com/company/chixiang-motor/',
  'https://shop7p518ep539950.1688.com/'
];

const labels = {
  en: {
    home: 'Home',
    products: 'Products',
    news: 'News',
    partsHub: 'Engine Parts',
    hwHub: 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog',
    btvHub: 'Bajaj / TVS Engines & Parts',
    cgSeries: 'CG Engine Series',
    partsPath: '/en/engine-parts',
    cgPath: '/en/cg-engine'
  },
  es: {
    home: 'Inicio',
    products: 'Productos',
    news: 'Noticias',
    partsHub: 'Repuestos de Motor',
    hwHub: 'Catálogo de Repuestos HW200–HW350',
    btvHub: 'Motores y Repuestos Bajaj / TVS',
    cgSeries: 'Motores CG',
    partsPath: '/es/repuestos-motor',
    cgPath: '/es/motor-cg'
  },
  pt: {
    home: 'Início',
    products: 'Produtos',
    news: 'Notícias',
    partsHub: 'Peças de Motor',
    hwHub: 'Catálogo de Peças HW200–HW350',
    btvHub: 'Motores e Peças Bajaj / TVS',
    cgSeries: 'Motores CG',
    partsPath: '/pt/pecas-de-motor',
    cgPath: '/pt/motor-cg'
  },
  ru: {
    home: 'Главная',
    products: 'Продукты',
    news: 'Новости',
    partsHub: 'Запчасти для двигателей',
    hwHub: 'Каталог запчастей HW200–HW350',
    btvHub: 'Двигатели и запчасти Bajaj / TVS',
    cgSeries: 'Двигатели CG',
    partsPath: '/ru/zapchasti-dvigatelya',
    cgPath: '/ru/dvigatel-cg'
  },
  ar: {
    home: 'الرئيسية',
    products: 'المنتجات',
    news: 'الأخبار',
    partsHub: 'قطع غيار المحركات',
    hwHub: 'كتالوج قطع HW200–HW350',
    btvHub: 'محركات وقطع Bajaj / TVS',
    cgSeries: 'محركات CG',
    partsPath: '/ar/engine-parts',
    cgPath: '/ar/cg-engine'
  },
  'zh-cn': {
    home: '首页',
    products: '发动机产品',
    news: '采购指南',
    partsHub: '发动机配件',
    hwHub: 'HW200–HW350 水冷配件目录',
    btvHub: 'Bajaj / TVS 发动机与配件',
    cgSeries: 'CG 发动机系列',
    partsPath: '/zh-cn/engine-parts',
    cgPath: '/zh-cn/cg-engine'
  },
  fr: {
    home: 'Accueil',
    products: 'Produits',
    news: 'Guides',
    partsHub: 'Pièces moteur',
    hwHub: 'Kits & Pièces HW200–HW350',
    btvHub: 'Moteurs & Pièces Bajaj / TVS',
    cgSeries: 'Série moteur CG',
    partsPath: '/fr/engine-parts',
    cgPath: '/fr/cg-engine'
  }
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
  if (/^\/(?:en|fr|es|pt|ru|ar)\/$/.test(pathname)) return { role: 'home', schemaType: 'WebPage' };
  if (/\/about$/.test(pathname)) return { role: 'about', schemaType: 'AboutPage' };
  if (/^\/(?:en|fr|es|pt|ru|ar)\/evidence$/.test(pathname)) return { role: 'about', schemaType: 'AboutPage' };
  if (/\/products$/.test(pathname)) return { role: 'products', schemaType: 'CollectionPage' };
  if (/\/(?:contact|contacto|contato|kontakty)$/.test(pathname)) return { role: 'contact', schemaType: 'ContactPage' };
  if (/\/news$/.test(pathname)) return { role: 'news', schemaType: 'CollectionPage' };
  if (/^\/(?:en|fr|es|pt|ru|ar)\/(?:air-cooled-vs-water-cooled-motorcycle-engine|bajaj-tvs-replacement-engine-fitment-checklist|cg-pushrod-vs-cb-ohc-motorcycle-engine-comparison|chongqing-motorcycle-engine-factory-qa-dyno-testing-warranty|horizontal-motorcycle-engine-110cc-150cc-selection-guide|how-to-choose-motorcycle-engine-manufacturer-china|hw250-hw300-vs-cg250-water-cooled-cargo-tricycle-engine|motorcycle-engine-export-packaging-moq-50-mixed-loading-guide)$/.test(pathname)) {
    return { role: 'article', schemaType: 'WebPage' };
  }
  if (pathname === '/es/guia/que-es-un-motor-cg/') {
    return { role: 'article', schemaType: 'WebPage' };
  }
  if (/^\/(?:ru\/(?:russia|central-asia)|es\/(?:peru|colombia))\/$/.test(pathname)) {
    return { role: 'market', schemaType: 'WebPage' };
  }
  if (/^\/(?:en|fr|es|pt|ru|ar)\/engine-parts\/hw-series$/.test(pathname)) {
    return { role: 'hw-hub', schemaType: 'CollectionPage' };
  }
  if (/^\/en\/engine-parts\/hw-series\/.+/.test(pathname)) {
    return { role: 'hw-detail', schemaType: 'ItemPage' };
  }
  if (/^\/(?:en|fr|es|pt|ru|ar)\/bajaj-tvs-engines-parts\/.+/.test(pathname)) {
    return { role: 'btv-detail', schemaType: 'ItemPage' };
  }
  if (/^\/(?:en|fr|es|pt|ru|ar)\/cg-engine\/.+/.test(pathname)) {
    return { role: 'flagship-engine', schemaType: 'ItemPage' };
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
  if (entry.role === 'family' || entry.role === 'market' || entry.role === 'btv-detail' || entry.role === 'hw-hub' || entry.role === 'hw-detail') {
    trail.push({ name: languageLabels.products, item: `${canonicalOrigin}/${entry.language}/products` });
  }
  if (entry.role === 'hw-hub' || entry.role === 'hw-detail') {
    trail.push({ name: languageLabels.partsHub, item: `${canonicalOrigin}${languageLabels.partsPath}` });
  }
  if (entry.role === 'hw-detail') {
    trail.push({ name: languageLabels.hwHub, item: `${canonicalOrigin}/${entry.language}/engine-parts/hw-series` });
  }
  if (entry.role === 'btv-detail') {
    trail.push({ name: languageLabels.btvHub, item: `${canonicalOrigin}/${entry.language}/bajaj-tvs-engines-parts` });
  }
  if (entry.role === 'flagship-engine') {
    trail.push({ name: languageLabels.cgSeries, item: `${canonicalOrigin}${languageLabels.cgPath}` });
  }
  if (entry.role === 'article') {
    trail.push({ name: languageLabels.news, item: entry.language === 'zh-cn' ? `${canonicalOrigin}/zh-cn/guides/` : `${canonicalOrigin}/${entry.language}/news` });
  }
  trail.push({ name: entry.name, item: entry.url });
  return trail;
}

function entryForHtml(html, url) {
  const pathname = new URL(url).pathname;
  const file = sourceFileForUrl(url);
  const language = pathname.split('/')[1];
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
}

function loadManifest(root) {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const url = match[1];
    const file = sourceFileForUrl(url);
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    return entryForHtml(html, url);
  });
}

module.exports = {
  canonicalOrigin,
  organizationId,
  websiteId,
  officialSameAs,
  labels,
  entryForHtml,
  loadManifest
};
