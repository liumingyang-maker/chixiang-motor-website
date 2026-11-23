#!/usr/bin/env node
/**
 * Render and synchronize the 7-language full matrix core pages:
 * - Pure French (/fr/) core & shell pages (zero "(EN)" fallbacks)
 * - Localized Evidence Center & AC320 ATV Engine pages for fr, es, pt, ru, ar
 * - Full 7-language hreflang clusters & lang-dropdown / mobile-nav switcher sync
 * - Localized internal links to new matrix pages + sitemap.xml sync
 *
 * Usage:
 *   node scripts/render-matrix-core-pages.js
 *   node scripts/render-matrix-core-pages.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const { applyToHtml } = require('./apply-site-entity-schema');
const {
  ORIGIN,
  LANGS,
  HREFLANG_MAP,
  LANG_DISPLAY_NAMES,
  ROUTE_GROUPS,
  LOCALE_CHROME,
  escapeHtml,
  escapeAttr,
  rolePath,
  hreflangTagsHtml,
  langDropdownLinksHtml,
  waHref,
  renderMobileNav,
  renderNavbar,
  renderFooter
} = require('./i18n-matrix');

const root = path.join(__dirname, '..');
const locales = JSON.parse(fs.readFileSync(path.join(root, 'data', 'i18n', 'core-pages-locales.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
const TODAY = '2026-11-23';

function orgSchemaNode() {
  return {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'CHIXIANG MOTOR',
    legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
    alternateName: 'Chixiang Motor',
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/images/logo.webp`,
    foundingDate: '2007',
    sameAs: officialSameAs,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      addressLocality: 'Chongqing',
      addressCountry: 'CN'
    }
  };
}

function trackingHeadHtml(title, desc, canonical, role, ogImage, extraHead = '') {
  return `  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-16777656395');
  </script>
  <meta charset="UTF-8">
  <script type="text/javascript">(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109483511,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
  <noscript><div><img src="https://mc.yandex.ru/watch/109483511" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0d0d0d">
  <link rel="canonical" href="${canonical}">
${hreflangTagsHtml(role, '  ')}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261123-matrix">
  <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': [orgSchemaNode()] }, null, 2)}
  </script>${extraHead}`;
}

const CORE_UI = {
  fr: {
    bcHome: 'Accueil', bcProducts: 'Produits', bcAbout: "L'usine", bcNews: 'Guides',
    homeEvidenceBtn: 'Consulter le Centre de preuves & essais',
    homeGuidesBtn: "Guides d'importation Afrique", productsCtaTitle: 'Préparez votre liste de conteneur mixte dès 50 unités',
    productsCtaBody: 'Combinez moteurs complets CG, CB, horizontaux Cub/Jakarta, HW300 à eau et moteurs/pièces adaptables Bajaj & TVS sous terme FOB Guangzhou.',
    productsCtaQuote: 'Demander un devis export',
    aboutSubheading: "Un seul fabricant responsable, de l'usinage au banc d'essai",
    aboutSubbody: "CHIXIANG MOTOR (Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.) réunit une expérience moteur depuis 2003 et un site industriel dédié à Chongqing depuis 2007. Nos équipes préparent les moteurs complets et pièces de rechange pour importateurs, assembleurs et grossistes en Afrique de l'Ouest et Centrale, Amérique latine et Asie centrale.",
    aboutImgAlt: "Atelier d'assemblage CHIXIANG MOTOR à Chongqing",
    aboutEvidenceBtn: 'Voir le Centre de preuves', aboutContactBtn: "Contacter l'équipe export"
  },
  es: {
    bcHome: 'Inicio', bcProducts: 'Productos', bcAbout: 'Nosotros', bcNews: 'Guías',
    homeEvidenceBtn: 'Consultar Centro de Evidencia',
    homeGuidesBtn: 'Guías de importación Latam', productsCtaTitle: 'Configure su contenedor mixto desde 50 unidades',
    productsCtaBody: 'Combine motores completos CG varilleros, CB cadenilleros, horizontales 110–150 cc, cargueros HW300 y reemplazos Bajaj & TVS bajo término FOB Guangzhou.',
    productsCtaQuote: 'Solicitar cotización exportación',
    aboutSubheading: 'Un solo fabricante responsable, desde la fundición hasta el banco de pruebas',
    aboutSubbody: 'CHIXIANG MOTOR es la marca de Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. Con experiencia en el sector desde 2003 y empresa registrada en 2007 en Chongqing, suministramos motores completos y repuestos de precisión a importadores y ensambladoras de Perú, Colombia, Ecuador y Centroamérica.',
    aboutImgAlt: 'Línea de ensamble de CHIXIANG MOTOR en Chongqing',
    aboutEvidenceBtn: 'Ver Centro de Evidencia', aboutContactBtn: 'Contactar al equipo exportador'
  },
  pt: {
    bcHome: 'Início', bcProducts: 'Produtos', bcAbout: 'Sobre a Fábrica', bcNews: 'Guias',
    homeEvidenceBtn: 'Ver Centro de Evidências',
    homeGuidesBtn: 'Guias de importação África', productsCtaTitle: 'Monte seu contêiner misto a partir de 50 unidades',
    productsCtaBody: 'Combine motores completos CG vareta, CB OHC, horizontais 110–150 cc, triciclos HW300 a água e reposição Bajaj & TVS em condição FOB Guangzhou.',
    productsCtaQuote: 'Solicitar cotação exportação',
    aboutSubheading: 'Um único fabricante responsável, da usinagem ao teste em bancada',
    aboutSubbody: 'CHIXIANG MOTOR (Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.) reúne experiência no setor desde 2003 e unidade industrial registrada em 2007 em Chongqing para atender distribuidores em Angola, Moçambique e América Latina.',
    aboutImgAlt: 'Linha de montagem da CHIXIANG MOTOR em Chongqing',
    aboutEvidenceBtn: 'Ver Centro de Evidências', aboutContactBtn: 'Falar com a equipe de exportação'
  },
  ru: {
    bcHome: 'Главная', bcProducts: 'Продукция', bcAbout: 'О заводе', bcNews: 'Руководства',
    homeEvidenceBtn: 'Открыть Центр доказательств',
    homeGuidesBtn: 'Гиды для импортёров РФ и СНГ', productsCtaTitle: 'Сформируйте смешанный контейнер от 50 моторов',
    productsCtaBody: 'Комбинируйте штанговые CG, цепные CB OHC, горизонтальные моторы Альфа/Дельта/питбайк, водяные HW300 и аналоги Bajaj & TVS на условиях FOB Гуанчжоу.',
    productsCtaQuote: 'Запросить расчёт FOB Гуанчжоу',
    aboutSubheading: 'Единый завод-изготовитель от литья картера до 100 % обкатки',
    aboutSubbody: 'CHIXIANG MOTOR (Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.) — производство двигателей в Чунцине с опытом работы в отрасли с 2003 года (юрлицо зарегистрировано в 2007 году) для оптовых поставок в Россию, Казахстан, Узбекистан и страны СНГ.',
    aboutImgAlt: 'Сборочная линия CHIXIANG MOTOR в Чунцине',
    aboutEvidenceBtn: 'Открыть Центр доказательств', aboutContactBtn: 'Связаться с отделом экспорта'
  },
  ar: {
    bcHome: 'الرئيسية', bcProducts: 'المنتجات', bcAbout: 'عن المصنع', bcNews: 'الأدلة',
    homeEvidenceBtn: 'استعرض مركز الأدلة والداينو',
    homeGuidesBtn: 'أدلة الاستيراد للشرق الأوسط', productsCtaTitle: 'جهز حاوية مختلطة بدءاً من 50 محركاً',
    productsCtaBody: 'ادمج محركات الأسياخ CG والكاتينة CB والمحركات الأفقية وتروسيكلات HW300 بتبريد المياه وبدائل باجاج و TVS وفق شرط FOB قوانغتشو.',
    productsCtaQuote: 'اطلب عرض سعر للتصدير',
    aboutSubheading: 'مصنع واحد مسؤول من تشغيل المعادن حتى الاختبار على المنصة',
    aboutSubbody: 'CHIXIANG MOTOR (Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.) تجمع خبرة تصنيع المحركات منذ عام 2003 مع تسجيل الشركة رسمياً في تشونغتشينغ عام 2007 لتوريد المحركات وقطع الغيار إلى مصر والسودان وشمال أفريقيا والشرق الأوسط.',
    aboutImgAlt: 'خط تجميع محركات CHIXIANG MOTOR في تشونغتشينغ',
    aboutEvidenceBtn: 'استعرض مركز الأدلة', aboutContactBtn: 'تواصل مع فريق التصدير'
  }
};

function rtlHeadCss(lang) {
  return lang === 'ar'
    ? '\n  <style>\n    body { direction: rtl; }\n    .navbar .container, .nav-logo, .nav-links, .nav-right, .hero-cta, .cta-actions, .footer-bottom { direction: rtl; }\n    .lang-dropdown { left: 0; right: auto; text-align: right; }\n  </style>'
    : '';
}

function renderMatrixHome(lang) {
  const d = locales[lang].home;
  const ui = CORE_UI[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}/${lang}/`;
  const quoteHref = rolePath('contact', lang);
  const waUrl = waHref(lang, 'CG150 / CG200 / HW300 / BM150');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const align = chrome.dir === 'rtl' ? 'right' : 'left';

  const trustHtml = d.trustItems.map(([k, v]) => `        <div class="feature-item"><h3>${escapeHtml(k)}</h3><p>${escapeHtml(v)}</p></div>`).join('\n');
  const cardsHtml = d.cards.map((c) => {
    const links = c.links.map(([lbl, r], i) => `<a class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'} btn-sm" href="${rolePath(r, lang)}">${escapeHtml(lbl)}</a>`).join('\n              ');
    return `        <article class="product-card">
          <a class="product-img has-img" href="${rolePath(c.role, lang)}" style="background-image:url('..${escapeAttr(c.img)}');background-color:#f4f6f8;" role="img" aria-label="${escapeAttr(c.title)}"></a>
          <div class="product-info">
            <span class="product-badge">${escapeHtml(c.badge)}</span>
            <h3><a href="${rolePath(c.role, lang)}">${escapeHtml(c.title)}</a></h3>
            <p>${escapeHtml(c.desc)}</p>
            <div class="card-actions">
              ${links}
            </div>
          </div>
        </article>`;
  }).join('\n');

  const spotlightsHtml = d.spotlights.map((s) => `        <div class="feature-item" style="text-align:${align};">
          <h3><a href="${rolePath(s.role, lang)}">${escapeHtml(s.title)}</a></h3>
          <p>${escapeHtml(s.desc)}</p>
        </div>`).join('\n');

  const exportHtml = d.exportCards.map(([k, v]) => `        <div class="feature-item" style="text-align:${align};">
          <h3>${escapeHtml(k)}</h3>
          <p>${escapeHtml(v)}</p>
        </div>`).join('\n');

  const homePreload = '\n  <link rel="preload" href="/images/factory-showcase/factory-5.webp" as="image" fetchpriority="high">';

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'home', `${ORIGIN}/images/factory-showcase/factory-5.webp`, `${homePreload}${rtlHeadCss(lang)}`)}
</head>
<body>
${renderMobileNav(lang, 'home', quoteHref)}
${renderNavbar(lang, 'home', 'home', quoteHref)}
  <main>
    <section class="hero" id="home">
      <div class="hero-bg" style="background-image: url('../images/factory-showcase/factory-5.webp');"></div>
      <div class="hero-overlay"></div>
      <div class="hero-brand">
        <div class="hero-brand-line"></div>
        <p class="hero-brand-products">${escapeHtml(d.eyebrow)}</p>
        <h1 class="hero-brand-headline">${escapeHtml(d.h1)}</h1>
        <p class="hero-brand-trust" style="text-transform:none;letter-spacing:0;">${escapeHtml(d.lead)}</p>
        <div class="hero-cta">
          <a href="${rolePath('products', lang)}" class="btn btn-primary btn-lg">${escapeHtml(d.ctaPrimary)}</a>
          <a href="${quoteHref}" class="btn btn-accent btn-lg">${escapeHtml(d.ctaSecondary)}</a>
          <a href="${escapeAttr(waUrl)}" class="btn btn-outline-light btn-lg" target="_blank" rel="noopener">${escapeHtml(d.ctaWa)}</a>
        </div>
      </div>
      <div class="hero-scroll" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>

    <section class="section" style="padding:2.5rem 0;background:var(--bg-secondary);">
      <div class="container">
        <div class="features-grid">
${trustHtml}
        </div>
      </div>
    </section>

    <section class="section" id="product-matrix">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.matrixHeading)}</h2>
        <p class="section-subtitle">${escapeHtml(d.matrixSub)}</p>
        <div class="products-grid" style="margin-top:2rem;">
${cardsHtml}
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.spotlightHeading)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
${spotlightsHtml}
        </div>
      </div>
    </section>

    <section class="section" id="export-regional">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.exportHeading)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
${exportHtml}
        </div>
        <div class="cta-actions" style="justify-content:center;margin-top:2rem;">
          <a href="${rolePath('evidence', lang)}" class="btn btn-primary btn-lg">${escapeHtml(ui.homeEvidenceBtn)}</a>
          <a href="${rolePath('news', lang)}" class="btn btn-outline btn-lg">${escapeHtml(ui.homeGuidesBtn)}</a>
          <a href="${quoteHref}" class="btn btn-accent btn-lg">${escapeHtml(d.ctaSecondary)}</a>
        </div>${lang === 'es' ? '\n        <div class="cta-actions" style="justify-content:center;margin-top:1rem;"><a href="/es/peru/" class="btn btn-outline btn-sm">Motores en Perú (SUNAT)</a></div>' : lang === 'ru' ? '\n        <div class="cta-actions" style="justify-content:center;margin-top:1rem;"><a href="/ru/russia/" class="btn btn-outline btn-sm">Поставки в Россию</a><a href="/ru/central-asia/" class="btn btn-outline btn-sm">Казахстан и Узбекистан</a></div>' : ''}
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function renderMatrixProducts(lang) {
  const d = locales[lang].products;
  const ui = CORE_UI[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}/${lang}/products`;
  const quoteHref = rolePath('contact', lang);
  const waUrl = waHref(lang, 'CG150 / CG200 / HW300 / BM150');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';

  const sectionsHtml = d.sections.map((sec, idx) => {
    const bg = idx % 2 === 1 ? ' style="background:var(--bg-secondary);"' : '';
    const cards = sec.cards.map((c) => `        <article class="product-card">
          <a class="product-img has-img" href="${rolePath(c.role, lang)}" style="background-image:url('..${escapeAttr(c.img)}');background-color:#f4f6f8;" role="img" aria-label="${escapeAttr(c.title)}"></a>
          <div class="product-info">
            <span class="product-badge">${escapeHtml(c.badge)}</span>
            <h3><a href="${rolePath(c.role, lang)}">${escapeHtml(c.title)}</a></h3>
            <p>${escapeHtml(c.desc)}</p>
            <div class="card-actions">
              <a class="btn btn-primary btn-sm" href="${rolePath(c.role, lang)}">${escapeHtml(d.cta)}</a>
            </div>
          </div>
        </article>`).join('\n');
    return `    <section class="section" id="${escapeAttr(sec.id)}"${bg}>
      <div class="container">
        <h2 class="section-title">${escapeHtml(sec.title)}</h2>
        <div class="products-grid" style="margin-top:1.75rem;">
${cards}
        </div>
      </div>
    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'products', `${ORIGIN}/images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-01.webp`, rtlHeadCss(lang))}
</head>
<body>
${renderMobileNav(lang, 'products', quoteHref)}
${renderNavbar(lang, 'products', 'products', quoteHref)}
  <main>
    <section class="page-header products-page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.bcHome)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(ui.bcProducts)}</span></nav>
        <div class="products-hero-copy" style="max-width:760px;padding:1.15rem 1.5rem;">
          <span>CHIXIANG MOTOR</span>
          <h1>${escapeHtml(d.h1)}</h1>
          <p style="margin:0.5rem 0 0;font-size:0.95rem;">${escapeHtml(d.lead)}</p>
        </div>
      </div>
    </section>
${sectionsHtml}
    <section class="cta-section">
      <div class="container">
        <h2>${escapeHtml(ui.productsCtaTitle)}</h2>
        <p style="color:var(--text-secondary);max-width:660px;margin:0 auto 1.25rem;">${escapeHtml(ui.productsCtaBody)}</p>
        <div class="cta-actions">
          <a href="${quoteHref}" class="btn btn-accent btn-lg">${escapeHtml(ui.productsCtaQuote)}</a>
          <a href="${escapeAttr(waUrl)}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">${escapeHtml(chrome.waLabel)}</a>
        </div>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function renderMatrixAbout(lang) {
  const d = locales[lang].about;
  const ui = CORE_UI[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}/${lang}/about`;
  const quoteHref = rolePath('contact', lang);
  const waUrl = waHref(lang, 'CG150 / CG200 / HW300 / BM150');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const align = chrome.dir === 'rtl' ? 'right' : 'left';
  const cards = d.blocks.map(([k, v]) => `        <div class="feature-item" style="text-align:${align};"><h3>${escapeHtml(k)}</h3><p>${escapeHtml(v)}</p></div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'about', `${ORIGIN}/images/factory-showcase/factory-2.webp`, rtlHeadCss(lang))}
</head>
<body>
${renderMobileNav(lang, 'about', quoteHref)}
${renderNavbar(lang, 'about', 'about', quoteHref)}
  <main>
    <section class="page-header about-page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.bcHome)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(ui.bcAbout)}</span></nav>
        <div class="about-page-header-content">
          <span class="eyebrow">Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.</span>
          <h1>${escapeHtml(d.h1)}</h1>
          <p class="section-subtitle">${escapeHtml(d.lead)}</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;align-items:center;margin-bottom:2rem;">
          <img src="/images/factory-showcase/factory-2.webp" alt="${escapeAttr(ui.aboutImgAlt)}" width="640" height="420" style="width:100%;height:auto;border-radius:12px;">
          <div>
            <h2>${escapeHtml(ui.aboutSubheading)}</h2>
            <p style="color:var(--text-secondary);line-height:1.75;margin-top:0.75rem;">${escapeHtml(ui.aboutSubbody)}</p>
            <div class="cta-actions" style="justify-content:flex-start;margin-top:1.25rem;">
              <a href="${rolePath('evidence', lang)}" class="btn btn-primary">${escapeHtml(ui.aboutEvidenceBtn)}</a>
              <a href="${quoteHref}" class="btn btn-accent">${escapeHtml(ui.aboutContactBtn)}</a>
            </div>
          </div>
        </div>
        <div class="features-grid">
${cards}
        </div>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function renderMatrixNews(lang) {
  const d = locales[lang].news;
  const ui = CORE_UI[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}/${lang}/news`;
  const quoteHref = rolePath('contact', lang);
  const waUrl = waHref(lang, 'CG150 / CG200 / HW300 / BM150');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const align = chrome.dir === 'rtl' ? 'right' : 'left';
  const allCards = [
    ...d.guides.map((g) => ({ tag: g.tag, title: g.title, body: g.body, href: rolePath(g.role, lang) })),
    ...(d.extraCards || [])
  ];
  const cards = allCards.map((g) => `        <article class="feature-item" style="text-align:${align};">
          <span class="product-badge">${escapeHtml(g.tag)}</span>
          <h2 style="font-size:1.2rem;margin:0.65rem 0;"><a href="${escapeAttr(g.href)}" style="color:inherit;text-decoration:none;">${escapeHtml(g.title)}</a></h2>
          <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(g.body)}</p>
          <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
            <a class="btn btn-primary btn-sm" href="${escapeAttr(g.href)}">${escapeHtml(d.ctaCard)}</a>
          </div>
        </article>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'news', `${ORIGIN}/images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp`, rtlHeadCss(lang))}
</head>
<body>
${renderMobileNav(lang, 'news', quoteHref)}
${renderNavbar(lang, 'news', 'news', quoteHref)}
  <main>
    <section class="page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.bcHome)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(ui.bcNews)}</span></nav>
        <h1>${escapeHtml(d.h1)}</h1>
        <p class="section-subtitle">${escapeHtml(d.lead)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="features-grid">
${cards}
        </div>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function renderFrFamilyShell(role, activeKey) {
  const shell = role === 'cb' ? locales.fr.cbShell : locales.fr.partsShell;
  const canonical = `${ORIGIN}${rolePath(role, 'fr')}`;
  const quoteHref = `/fr/contact?product_interest=${role === 'cb' ? 'cb' : 'parts'}`;
  const waUrl = waHref('fr', role === 'cb' ? 'CB150 / CB200 / CB250 OHC' : 'Pièces moteur & kits HW / Bajaj');
  const existingPath = path.join(root, `fr/${role === 'cb' ? 'cb-engine' : 'engine-parts'}.html`);
  let innerOwner = '  <!-- Product Detail SEO Content -->\n  <!-- /Product Detail SEO Content -->';
  let preservedFaq = '\n  <script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}\n  </script>';
  let preservedFamilySchema = '';
  if (fs.existsSync(existingPath)) {
    const cur = fs.readFileSync(existingPath, 'utf8');
    const m = cur.match(/<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/);
    if (m) innerOwner = `  ${m[0]}`;
    const faqM = cur.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>(?:(?!<\/script>)[\s\S])*?"@type"\s*:\s*"FAQPage"(?:(?!<\/script>)[\s\S])*?<\/script>/i);
    if (faqM) preservedFaq = `\n  ${faqM[0]}`;
    const famM = cur.match(/<script\b(?=[^>]*\bdata-product-family-schema\b)[^>]*>(?:(?!<\/script>)[\s\S])*?<\/script>/i);
    if (famM) preservedFamilySchema = `\n  ${famM[0]}`;
  }
  const introSection = role === 'parts'
    ? `    <section class="section" id="parts-catalog-hubs" style="background:var(--bg-secondary);">
      <div class="container">
        <h2 class="section-title">Choisissez votre catalogue de pièces moteur</h2>
        <p class="section-subtitle">Consultez nos catalogues dédiés avec références OEM d&#39;identification, compatibilités HW200–HW350 et devis groupé en conteneur mixte.</p>
        <div class="parts-dual-hub-grid">
          <div class="parts-hub-card" id="hw-series-parts">
            <div>
              <span class="hw-fitment-badge hw-fitment-badge--shared" style="margin-bottom:0.75rem;">Kits d&#39;origine usine · ~80 % communs HW250/300</span>
              <h3>Pièces &amp; Kits de réfection HW200–HW350 (Eau)</h3>
              <p>Kit de réfection moteur refroidi par eau, ensemble cylindre-piston, culasse, embrayage 20 rouleaux, pompe à eau et pignons pour tricycles 250/300cc.</p>
            </div>
            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="/fr/engine-parts/hw-series" class="btn btn-primary btn-sm">Catalogue pièces HW200–350 &rarr;</a>
              <a href="/fr/contact?product_interest=parts&amp;source_form=hw-series-catalog" class="btn btn-accent btn-sm">Devis pièces HW</a>
            </div>
          </div>
          <div class="parts-hub-card" id="bajaj-tvs-parts">
            <div>
              <span class="btv-supply-badge btv-supply-badge--parts" style="margin-bottom:0.75rem;">Références adaptables &amp; OEM d&#39;identification</span>
              <h3>Moteurs complets &amp; Pièces adaptables Bajaj / TVS</h3>
              <p>Demi-carters moteur gauche et droit (36PF0004/36PF0005), culasse complète, kit cylindre-piston, vilebrequin et pochette de joints pour Boxer BM150, CT100, RE 4S et TVS HLX.</p>
            </div>
            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="/fr/bajaj-tvs-engines-parts" class="btn btn-primary btn-sm">Catalogue Bajaj / TVS &rarr;</a>
              <a href="/fr/contact?product_interest=parts&amp;source_form=bajaj-tvs-catalog" class="btn btn-accent btn-sm">Devis Bajaj / TVS</a>
            </div>
          </div>
        </div>
      </div>
    </section>`
    : `    <section class="section" style="background:var(--bg-secondary);">
      <div class="container">
        <div class="about-hero">
          <div>
            <h2>Architecture à arbre à cames en tête (distribution par chaîne)</h2>
            <p style="color:var(--text-secondary);line-height:1.8;margin-top:1rem;">Les moteurs CB150, CB200-C et CB250 offrent une montée en régime fluide et une distribution par chaîne silencieuse pour motos routières, utilitaires et tout-terrain, avec option arbre d&#39;équilibrage selon le châssis.</p>
            <div class="cta-actions" style="justify-content:flex-start;margin-top:1.5rem;">
              <a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">Demander un devis CB</a>
              <a href="/fr/cg-engine" class="btn btn-outline btn-lg">Comparer avec les moteurs CG</a>
            </div>
          </div>
          <div class="about-hero-img" style="background-image:url('/images/cb-offroad/chixiang-cb-offroad-engine-01.webp');background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#f4f6f8;"></div>
        </div>
      </div>
    </section>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
${trackingHeadHtml(shell.title, shell.description, canonical, role, `${ORIGIN}/images/parts.webp`, `${preservedFaq}${preservedFamilySchema}`)}
</head>
<body>
${renderMobileNav('fr', role, quoteHref)}
${renderNavbar('fr', role, activeKey, quoteHref)}
  <main>
    <section class="page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/fr/">Accueil</a><span aria-hidden="true">/</span><a href="/fr/products">Produits</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(shell.h1)}</span></nav>
        <h1>${escapeHtml(shell.h1)}</h1>
        <p class="section-subtitle">${escapeHtml(shell.description)}</p>
      </div>
    </section>
${introSection}
${innerOwner}
  </main>
${renderFooter('fr', waUrl, quoteHref)}
</body>
</html>
`;
}

function renderEvidencePage(lang) {
  const d = locales.evidence[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}${rolePath('evidence', lang)}`;
  const quoteHref = rolePath('contact', lang);
  const waUrl = waHref(lang, 'CG150 / CG200 / HW300 / BM150');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const align = chrome.dir === 'rtl' ? 'right' : 'left';

  const mfgHtml = d.mfgCards.map(([t, p], i) => {
    const ids = ['ev-capacity', 'ev-dynamometer', 'ev-material-hardness', 'ev-container-loading'];
    return `        <div class="feature-item" id="${ids[i]}" style="text-align:${align};">
          <h3>${escapeHtml(t)}</h3>
          <p>${escapeHtml(p)}</p>
        </div>`;
  }).join('\n');

  const recIds = ['ev-gxq-2024', 'ev-mopei-2023', 'ev-patent-cn221406869u', 'ev-official-channels'];
  const recHtml = d.records.map(([t, bullets, url, linkText], i) => {
    const lis = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n            ');
    const linkPart = url
      ? `<p style="margin-top:.75rem;"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a></p>`
      : `<p style="margin-top:.75rem;color:var(--text-secondary);font-size:0.92rem;">${escapeHtml(linkText)}</p>`;
    return `        <div class="feature-item" id="${recIds[i]}" style="text-align:${align};">
          <h3>${escapeHtml(t)}</h3>
          <ul style="color:var(--text-secondary);line-height:1.85;list-style:disc;padding-${align}:1.2rem;">
            ${lis}
          </ul>
          ${linkPart}
        </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'evidence', `${ORIGIN}/images/factory-showcase/factory-2.webp`, rtlHeadCss(lang))}
</head>
<body>
${renderMobileNav(lang, 'evidence', quoteHref)}
${renderNavbar(lang, 'evidence', 'evidence', quoteHref)}
  <main>
    <section class="page-header about-page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(chrome.mobile.evidence)}</span></nav>
        <div class="about-page-header-content">
          <span class="eyebrow">${escapeHtml(d.eyebrow)}</span>
          <h1>${escapeHtml(d.h1)}</h1>
          <p class="section-subtitle">${escapeHtml(d.lead)}</p>
        </div>
      </div>
    </section>

    <section class="section" id="engineering-benchmarks">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.mfgTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(d.mfgSub)}</p>
        <div class="features-grid" style="margin-top:1.5rem;">
${mfgHtml}
        </div>
      </div>
    </section>

    <section class="section" id="public-records" style="background:var(--bg-secondary);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.recTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(d.recSub)}</p>
        <div class="features-grid" style="margin-top:1.5rem;">
${recHtml}
        </div>
      </div>
    </section>

    <section class="section" id="quality-credentials">
      <div class="container">
        <h2 class="section-title">${escapeHtml(d.qualTitle)}</h2>
        <div class="features-grid x2-stack" style="margin-top:1.5rem;">
          <div class="feature-item" style="text-align:${align};">
            <h3>${escapeHtml(d.isoTitle)}</h3>
            <p>${escapeHtml(d.isoDesc)}</p>
          </div>
          <div class="feature-item" style="text-align:${align};">
            <h3>${escapeHtml(d.cccTitle)}</h3>
            <p>${escapeHtml(d.cccDesc)}</p>
          </div>
        </div>
        <div class="cta-actions" style="justify-content:flex-start;margin-top:1.5rem;">
          <a href="${quoteHref}" class="btn btn-accent">${escapeHtml(d.ctaBtn)}</a>
          <a href="${rolePath('about', lang)}" class="btn btn-outline">${escapeHtml(d.aboutBtn)}</a>
        </div>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function renderAc320Page(lang) {
  const d = locales.ac320[lang];
  const chrome = LOCALE_CHROME[lang];
  const canonical = `${ORIGIN}${rolePath('ac320', lang)}`;
  const quoteHref = `${rolePath('contact', lang)}?product_interest=multiple&model=AC320`;
  const waUrl = waHref(lang, d.waModel);
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      orgSchemaNode(),
      {
        '@type': 'Product',
        '@id': `${canonical}#product`,
        name: d.name,
        description: d.description,
        url: canonical,
        image: `${ORIGIN}/images/atv/chixiang-ac320-atv-engine-01.webp`,
        brand: { '@id': `${ORIGIN}/#organization` },
        manufacturer: { '@id': `${ORIGIN}/#organization` },
        sku: 'AC320-175MN',
        additionalProperty: d.rows.map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v }))
      }
    ]
  };
  const acFile = path.join(root, lang, 'ac320-atv-engine.html');
  let existingFamSchema = '';
  if (fs.existsSync(acFile)) {
    const cur = fs.readFileSync(acFile, 'utf8');
    const fm = cur.match(/<script\b(?=[^>]*\bdata-product-family-schema\b)[^>]*>[\s\S]*?<\/script>/i);
    if (fm) existingFamSchema = `\n  ${fm[0]}`;
  }
  const extraHead = `\n  <script type="application/ld+json">\n${JSON.stringify(productSchema, null, 2)}\n  </script>${existingFamSchema}${rtlHeadCss(lang)}`;
  const tagsHtml = d.tags.map((t, i) => `<span style="padding:0.3rem 0.85rem;background:rgba(43,123,214,${i === 0 ? '0.15' : '0.1'});border-radius:100px;font-size:0.8rem;color:${i === 0 ? 'var(--accent-blue)' : 'var(--text-secondary)'};">${escapeHtml(t)}</span>`).join('\n            ');
  const rowsHtml = d.rows.map(([k, v]) => `                <tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
${trackingHeadHtml(d.title, d.description, canonical, 'ac320', `${ORIGIN}/images/atv/chixiang-ac320-atv-engine-01.webp`, extraHead)}
</head>
<body>
${renderMobileNav(lang, 'ac320', quoteHref)}
${renderNavbar(lang, 'ac320', 'products', quoteHref)}
  <main>
    <section class="page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><a href="${rolePath('products', lang)}">${escapeHtml(chrome.nav.products)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(d.name)}</span></nav>
        <h1>${escapeHtml(d.name)}</h1>
        <p class="section-subtitle">${escapeHtml(d.lead)}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="product-detail-layout" style="margin-top:1rem;">
          <div>
            <img class="product-img" src="/images/atv/chixiang-ac320-atv-engine-01.webp" alt="${escapeAttr(d.name)}" width="640" height="480" style="width:100%;height:auto;object-fit:contain;background:#f4f6f8;border-radius:12px;">
          </div>
          <div>
            <p style="color:var(--text-secondary);margin:0 0 1rem;line-height:1.7;">${escapeHtml(d.lead)}</p>
            <div style="display:flex;gap:0.65rem;flex-wrap:wrap;margin-bottom:1.25rem;">
              ${tagsHtml}
            </div>
            <h2 style="font-size:1.25rem;margin:1.25rem 0 0.75rem;">${escapeHtml(d.specTitle)}</h2>
            <div class="responsive-table-wrap" tabindex="0">
              <table class="specs-table">
                <thead><tr><th>${escapeHtml(d.headers[0])}</th><th>${escapeHtml(d.headers[1])}</th></tr></thead>
                <tbody>
${rowsHtml}
                </tbody>
              </table>
            </div>
            <h3 style="margin:1.75rem 0 0.75rem;">${escapeHtml(d.appTitle)}</h3>
            <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(d.appBody)}</p>
            <h3 style="margin:1.5rem 0 0.75rem;">${escapeHtml(d.noteTitle)}</h3>
            <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(d.noteBody)}</p>
            <div class="cta-actions" style="justify-content:flex-start;margin-top:1.5rem;">
              <a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">${escapeHtml(d.ctaBtn)}</a>
              <a href="${escapeAttr(waUrl)}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">${escapeHtml(chrome.waLabel)}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
}

function filePathForRole(role, lang) {
  const p = ROUTE_GROUPS[role] && ROUTE_GROUPS[role][lang];
  if (!p) return null;
  if (p.endsWith('/')) return path.join(root, p.slice(1), 'index.html');
  return path.join(root, `${p.slice(1)}.html`);
}

function patchHreflangCluster(html, role) {
  if (!ROUTE_GROUPS[role]) return html;
  return setAlternateLinks(html, hreflangTagsHtml(role, '  ').split('\n'));
}

function patchLangDropdown(html, role, lang) {
  const group = ROUTE_GROUPS[role] || ROUTE_GROUPS.home;
  const links = langDropdownLinksHtml(role, lang, '            ');
  return html.replace(/(<div class="lang-dropdown">)[\s\S]*?(<\/div>)/, `$1\n${links}\n          $2`);
}

function patchMobileNavLangs(html, role) {
  const group = ROUTE_GROUPS[role] || ROUTE_GROUPS.home;
  const links = LANGS.filter((l) => group[l])
    .map((l) => `<a href="${group[l]}" hreflang="${HREFLANG_MAP[l]}">${LANG_DISPLAY_NAMES[l]}</a>`)
    .join('');
  return html.replace(/(<div class="mobile-nav-langs">)[\s\S]*?(<\/div>)/, `$1${links}$2`);
}

function patchFooterLangs(html, role) {
  const group = ROUTE_GROUPS[role] || ROUTE_GROUPS.home;
  const links = LANGS.filter((l) => group[l])
    .map((l) => `<a href="${group[l]}" hreflang="${HREFLANG_MAP[l]}">${LANG_DISPLAY_NAMES[l]}</a>`)
    .join(' · ');
  return html.replace(/(<span class="footer-langs">)[\s\S]*?(<\/span>)/, `$1${links}$2`);
}

function patchFrShellChrome(html, role, activeKey, quoteHref, waUrl) {
  let out = patchHreflangCluster(html, role);
  out = out.replace(/  <div class="mobile-nav" id="mobileNav">[\s\S]*?(?=\r?\n  <nav class="navbar">)/, renderMobileNav('fr', role, quoteHref));
  out = out.replace(/  <nav class="navbar">[\s\S]*?<\/nav>/, renderNavbar('fr', role, activeKey, quoteHref));
  let footerBlock = renderFooter('fr', waUrl, quoteHref, role === 'contact' ? ['/js/btv-inquiry-prefill.js'] : []);
  if (role === 'contact') {
    footerBlock = footerBlock.replace(
      /<div class="mobile-cta-bar">[\s\S]*?<\/div>/,
      '<div class="mobile-cta-bar">\n    <a href="#procurement-form" class="btn btn-quote">Formulaire</a>\n    <a href="mailto:chixiangmotor@163.com" class="btn btn-email">Email</a>\n  </div>'
    );
  }
  out = out.replace(/  <footer class="footer">[\s\S]*?(?=<\/body>)/, `${footerBlock}\n`);
  // Remove any "(EN)" footer heading or leftover "(EN)" suffixes inside FR shell
  out = out.replace(/\s*\(EN\)/g, '');
  return out;
}

function patchCoreInternalLinks(html, lang) {
  if (!['en', 'es', 'pt', 'ru', 'ar'].includes(lang)) return html;
  let out = html;
  const c = LOCALE_CHROME[lang];
  // Upgrade Engine Parts dropdown in navbar if it only has single link or misses btv/hw-series
  if (out.includes('<li class="nav-item-dropdown">') && !out.includes(rolePath('btv-hub', lang))) {
    out = out.replace(
      /(<ul class="nav-dropdown">)[\s\S]*?(<\/ul>)/,
      `$1<li><a href="${rolePath('parts', lang)}">${escapeHtml(c.nav.allParts)}</a></li><li><a href="${rolePath('hw-series', lang)}">${escapeHtml(c.nav.hwParts)}</a></li><li><a href="${rolePath('btv-hub', lang)}">${escapeHtml(c.nav.btv)}</a></li>$2`
    );
  }
  // Ensure footer Quick Links / Series columns link to localized Evidence, AC320, HW-Series, and Bajaj/TVS pages
  const evPath = rolePath('evidence', lang);
  const hwPath = rolePath('hw-series', lang);
  const btvPath = rolePath('btv-hub', lang);
  const acPath = rolePath('ac320', lang);
  if (out.includes('<footer class="footer">') && !out.includes(evPath)) {
    out = out.replace(
      `href="${rolePath('contact', lang)}">${escapeHtml(c.nav.contact)}</a>`,
      `href="${evPath}">${escapeHtml(c.nav.evidence)}</a><br><a href="${rolePath('contact', lang)}">${escapeHtml(c.nav.contact)}</a>`
    );
  }
  if (out.includes('<footer class="footer">') && !out.includes(btvPath)) {
    out = out.replace(
      `href="${rolePath('horizontal', lang)}"`,
      `href="${acPath}">${escapeHtml(c.footer.ac320Label)}</a><br><a href="${hwPath}">${escapeHtml(c.footer.hwLabel)}</a><br><a href="${btvPath}">${escapeHtml(c.footer.btvLabel)}</a><br><a href="${rolePath('horizontal', lang)}"`
    );
  }
  return out;
}

function syncSitemapAll(urlsToEnsure) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const rawXml = fs.readFileSync(sitemapPath, 'utf8');
  let removedZh = 0;
  let xml = rawXml.replace(/ {0,2}<url>\s*<loc>https:\/\/chixiangmotor\.com\/zh-cn\/[^<]*<\/loc>[\s\S]*?<\/url>\r?\n?/g, () => {
    removedZh += 1;
    return '';
  });
  const existing = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  let added = 0;
  for (const [url, prio] of urlsToEnsure) {
    if (existing.has(url)) continue;
    xml = xml.replace(
      '</urlset>',
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${prio}</priority>\n  </url>\n</urlset>`
    );
    existing.add(url);
    added += 1;
  }
  return { changed: removedZh > 0 || added > 0, next: xml, added, removedZh };
}

function setAlternateLinks(html, alternateLines) {
  const clean = html.replace(/[ \t]*<link\s+rel=["']alternate["'][^>]*>\r?\n?/gi, '');
  if (!alternateLines.length) return clean;
  const block = alternateLines.join('\n');
  return clean.replace(/(<link\s+rel=["']canonical["'][^>]*>\r?\n?)/i, `$1${block}\n`);
}

const STANDALONE_ALTERNATES = new Map([
  ['ru/russia/index.html', [`  <link rel="alternate" hreflang="ru-RU" href="${ORIGIN}/ru/russia/">`]],
  ['ru/central-asia/index.html', []],
  ['es/peru/index.html', [
    `  <link rel="alternate" hreflang="es-PE" href="${ORIGIN}/es/peru/">`,
    `  <link rel="alternate" hreflang="es-CO" href="${ORIGIN}/es/colombia/">`
  ]],
  ['es/colombia/index.html', [
    `  <link rel="alternate" hreflang="es-PE" href="${ORIGIN}/es/peru/">`,
    `  <link rel="alternate" hreflang="es-CO" href="${ORIGIN}/es/colombia/">`
  ]],
  ['es/guia/que-es-un-motor-cg/index.html', [
    `  <link rel="alternate" hreflang="es" href="${ORIGIN}/es/guia/que-es-un-motor-cg/">`
  ]]
]);

function writeOrCheck(filePath, nextContent, nl, changes, url = null) {
  const withEntity = url ? applyToHtml(nextContent, url) : nextContent;
  const formatted = nl === '\r\n' ? withEntity.replace(/\r?\n/g, '\r\n') : withEntity.replace(/\r\n/g, '\n');
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (current !== formatted) {
    changes.push(path.relative(root, filePath));
    if (!checkOnly) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, formatted, 'utf8');
    }
  }
}

function main() {
  const changes = [];

  // 1. Generated 5-locale core pages (fr, es, pt, ru, ar) + French family shells
  for (const lang of ['fr', 'es', 'pt', 'ru', 'ar']) {
    writeOrCheck(path.join(root, lang, 'index.html'), renderMatrixHome(lang), '\r\n', changes, `${ORIGIN}/${lang}/`);
    writeOrCheck(path.join(root, lang, 'products.html'), renderMatrixProducts(lang), '\r\n', changes, `${ORIGIN}/${lang}/products`);
    writeOrCheck(path.join(root, lang, 'about.html'), renderMatrixAbout(lang), '\r\n', changes, `${ORIGIN}/${lang}/about`);
    writeOrCheck(path.join(root, lang, 'news.html'), renderMatrixNews(lang), '\r\n', changes, `${ORIGIN}/${lang}/news`);
  }
  writeOrCheck(path.join(root, 'fr/cb-engine.html'), renderFrFamilyShell('cb', 'products'), '\r\n', changes, `${ORIGIN}/fr/cb-engine`);
  writeOrCheck(path.join(root, 'fr/engine-parts.html'), renderFrFamilyShell('parts', 'parts'), '\r\n', changes, `${ORIGIN}/fr/engine-parts`);

  // Patch existing fr/cg-engine.html, fr/horizontal-engine.html, fr/contact.html chrome cleanly
  for (const [file, role, activeKey, qHref, waModel] of [
    ['fr/cg-engine.html', 'cg', 'products', '/fr/contact?product_interest=cg', 'CG150 / CG200 / HW300'],
    ['fr/horizontal-engine.html', 'horizontal', 'products', '/fr/contact?product_interest=horizontal', 'Moteur horizontal 110/125cc (Jakarta)'],
    ['fr/contact.html', 'contact', 'contact', '/fr/contact', 'CG150 / CG200 / HW300 / BM150']
  ]) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf8');
    const nl = raw.includes('\r\n') ? '\r\n' : '\n';
    const next = patchFrShellChrome(raw, role, activeKey, qHref, waHref('fr', waModel));
    writeOrCheck(abs, next, nl, changes, `${ORIGIN}${rolePath(role, 'fr')}`);
  }

  // 2. Evidence Center & AC320 ATV Engine across fr, es, pt, ru, ar (10 pages)
  for (const lang of ['fr', 'es', 'pt', 'ru', 'ar']) {
    writeOrCheck(path.join(root, lang, 'evidence.html'), renderEvidencePage(lang), '\r\n', changes, `${ORIGIN}${rolePath('evidence', lang)}`);
    writeOrCheck(path.join(root, lang, 'ac320-atv-engine.html'), renderAc320Page(lang), '\r\n', changes, `${ORIGIN}${rolePath('ac320', lang)}`);
  }

  // 3. Synchronize hreflang clusters, lang dropdown, mobile-nav langs & safe internal links across all 6 active export languages
  const SKIP_REWRITE_CHROME = new Set([
    ...['fr', 'es', 'pt', 'ru', 'ar'].flatMap((l) => [
      `${l}/index.html`, `${l}/products.html`, `${l}/about.html`, `${l}/news.html`,
      `${l}/evidence.html`, `${l}/ac320-atv-engine.html`
    ]),
    'fr/cb-engine.html', 'fr/engine-parts.html', 'fr/cg-engine.html',
    'fr/horizontal-engine.html', 'fr/contact.html'
  ]);

  const touchedFiles = new Set();
  for (const [role, group] of Object.entries(ROUTE_GROUPS)) {
    for (const lang of LANGS) {
      if (!group[lang]) continue;
      const abs = filePathForRole(role, lang);
      if (!abs || !fs.existsSync(abs)) continue;
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      touchedFiles.add(rel);
      if (SKIP_REWRITE_CHROME.has(rel)) continue;

      const raw = fs.readFileSync(abs, 'utf8');
      const nl = raw.includes('\r\n') ? '\r\n' : '\n';
      let next = patchHreflangCluster(raw, role);
      if (['es', 'pt', 'ru', 'ar'].includes(lang) && ['cg', 'cb', 'horizontal', 'parts', 'contact'].includes(role) && next.includes('<div class="mobile-nav" id="mobileNav">') && next.includes('<nav class="navbar">')) {
        const activeKey = role === 'parts' ? 'parts' : (role === 'contact' ? 'contact' : 'products');
        const qHref = rolePath('contact', lang);
        next = next.replace(/  <div class="mobile-nav" id="mobileNav">[\s\S]*?(?=\r?\n  <nav class="navbar">)/, renderMobileNav(lang, role, qHref));
        next = next.replace(/  <nav class="navbar">[\s\S]*?<\/nav>/, renderNavbar(lang, role, activeKey, qHref));
      } else {
        next = patchLangDropdown(next, role, lang);
        next = patchMobileNavLangs(next, role);
      }
      next = patchFooterLangs(next, role);
      if (!['cg', 'cb', 'horizontal', 'parts', 'contact'].includes(role)) {
        next = patchCoreInternalLinks(next, lang);
      }
      // Keep en/index.html WebSite.inLanguage synced cleanly
      const canonical = role === 'home' ? `${ORIGIN}/${lang}/` : null;
      writeOrCheck(abs, next, nl, changes, canonical);
    }
  }

  // 4. Synchronize non-matrix regional pages (strip zh-CN / normalize alternates)
  for (const [rel, alts] of STANDALONE_ALTERNATES.entries()) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf8');
    const nl = raw.includes('\r\n') ? '\r\n' : '\n';
    const next = setAlternateLinks(raw, alts);
    writeOrCheck(abs, next, nl, changes);
  }

  // 5. Sync sitemap.xml for all active 6-language roles and remove archived zh-cn URLs
  const urlsToEnsure = [];
  for (const [role, group] of Object.entries(ROUTE_GROUPS)) {
    const prio = role === 'home' ? '1.0' : (['products', 'cg', 'cb', 'horizontal', 'parts', 'btv-hub', 'hw300-water-cooled-engine'].includes(role) ? '0.8' : '0.7');
    for (const lang of LANGS) {
      if (group[lang]) urlsToEnsure.push([`${ORIGIN}${group[lang]}`, prio]);
    }
  }
  const sm = syncSitemapAll(urlsToEnsure);
  if (sm.changed) {
    changes.push('sitemap.xml');
    if (!checkOnly) {
      fs.writeFileSync(path.join(root, 'sitemap.xml'), sm.next, 'utf8');
    }
  }

  if (checkOnly) {
    for (const c of changes) console.log(`STALE ${c}`);
    console.log(`${changes.length} matrix core files need updates.`);
    process.exit(changes.length ? 1 : 0);
  }
  console.log(`${changes.length} matrix core files updated (sitemap +${sm.added} / -${sm.removedZh} zh-cn).`);
}

main();
