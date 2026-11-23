#!/usr/bin/env node
/**
 * Render Francophone Africa (/fr/) B2B Pages (8 pages: 6 core + 2 flagship African bestsellers)
 * directly from the repository SSOT files:
 *   - docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv
 *   - data/flagship-engines.json
 *   - data/hw-parts-catalog.json
 *   - data/bajaj-tvs-catalog.json
 *
 * Usage:
 *   node scripts/render-fr-africa-pages.js
 *   node scripts/render-fr-africa-pages.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const imgSeo = require('./lib/image-seo-helper');

const root = path.join(__dirname, '..');
const checkOnly = process.argv.includes('--check');

const ORIGIN = 'https://chixiangmotor.com';
const ORG_ID = `${ORIGIN}/#organization`;
const CSS_HREF = '/css/style.css?v=20261123-matrix';
const FR_MARKER = '<!-- FR AFRICA GENERATED -->';

const FR_PAGES = [
  `${ORIGIN}/fr/`,
  `${ORIGIN}/fr/cg-engine`,
  `${ORIGIN}/fr/bajaj-tvs-engines-parts`,
  `${ORIGIN}/fr/horizontal-engine`,
  `${ORIGIN}/fr/cg-engine/hw300-water-cooled-engine`,
  `${ORIGIN}/fr/cg-engine/cg200-air-cooled-engine`,
  `${ORIGIN}/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine`,
  `${ORIGIN}/fr/contact`
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += charOr(ch);
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? ''])));
}

function charOr(ch) {
  return ch;
}

function loadCompanyFacts() {
  const rows = parseCsv(fs.readFileSync(path.join(root, 'docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv'), 'utf8'));
  const byId = new Map(rows.map(r => [r.fact_id, r]));
  const address = byId.get('address-registered')?.candidate_master_value
    || 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China';
  const capacity = byId.get('capacity-monthly-engines')?.candidate_master_value || '10,000+ units/month';
  return { address, capacity };
}

function waHref(modelLabel) {
  const text = `Bonjour, je suis importateur / grossiste en [pays]. Je souhaite un devis FOB Guangzhou pour : Modèle : ${modelLabel} | Quantité : [nombre] | Pièces détachées : [oui/non] | Port : [Abidjan / Douala / Cotonou / Dakar].`;
  return `https://wa.me/8619008225410?text=${encodeURIComponent(text)}`;
}

function orgSchemaBlock(withContactPoint = false) {
  const org = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'CHIXIANG MOTOR',
    legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
    alternateName: 'Chixiang Motor',
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/images/logo.webp`,
    foundingDate: '2007',
    description: 'Fabricant de moteurs pour motos et tricycles cargo à Chongqing, Chine, avec une expérience sectorielle depuis 2003.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      addressLocality: 'Chongqing',
      addressCountry: 'CN'
    },
    sameAs: officialSameAs
  };
  if (withContactPoint) {
    org.contactPoint = {
      '@type': 'ContactPoint',
      telephone: '+86-19008225410',
      email: 'chixiangmotor@163.com',
      contactType: 'sales',
      availableLanguage: ['en', 'fr', 'es', 'pt', 'ru', 'ar']
    };
  }
  return `  <script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': [org] }, null, 2)}\n  </script>`;
}

function renderHead({ title, description, frPath, enPath, ogImage, extraHead = '', schemas = [], preloadImage = '', withContactPoint = false }) {
  const frUrl = `${ORIGIN}${frPath}`;
  const enUrl = `${ORIGIN}${enPath}`;
  const schemaScripts = schemas
    .map(s => `  <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n  </script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
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
  <meta name="description" content="${escapeAttr(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0d0d0d">
  <link rel="canonical" href="${escapeAttr(frUrl)}">
  <link rel="alternate" hreflang="fr" href="${escapeAttr(frUrl)}">
  <link rel="alternate" hreflang="en" href="${escapeAttr(enUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeAttr(enUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(frUrl)}">
  <meta property="og:image" content="${escapeAttr(ogImage || `${ORIGIN}/images/factory-showcase/chixiang-engine-hot-cold-bench-testing.webp`)}">
  <meta name="twitter:card" content="summary_large_image">
  ${preloadImage ? `<link rel="preload" href="${escapeHtml(preloadImage)}" as="image" fetchpriority="high">\n  ` : ''}<link rel="stylesheet" href="${CSS_HREF}">
${extraHead ? `${extraHead}\n` : ''}${orgSchemaBlock(withContactPoint)}
${schemaScripts}
</head>`;
}

function renderNav({ activeHref, quoteHref = '/fr/contact', langLinks }) {
  const navItems = [
    ['/fr/', 'Accueil'],
    ['/fr/cg-engine', 'Moteurs CG & Tricycle'],
    ['/fr/cg-engine/hw300-water-cooled-engine', 'HW300 à Eau'],
    ['/fr/horizontal-engine', 'Moteurs Horizontaux'],
    ['/fr/bajaj-tvs-engines-parts', 'Bajaj & TVS'],
    ['/fr/contact', 'Devis & Export']
  ];
  const desktopLinks = navItems.map(([href, label]) => {
    const active = href === activeHref ? ' class="active" aria-current="page"' : '';
    return `        <li><a href="${href}"${active}>${escapeHtml(label)}</a></li>`;
  }).join('\n');

  const mobileLinks = [
    ['/fr/', 'Accueil'],
    ['/fr/cg-engine', 'Moteurs CG & Tricycle'],
    ['/fr/cg-engine/cg200-air-cooled-engine', 'CG200 Refroidi par Air'],
    ['/fr/cg-engine/hw300-water-cooled-engine', 'HW300 Tricycle à Eau'],
    ['/fr/horizontal-engine', 'Moteurs Horizontaux 110–150'],
    ['/fr/bajaj-tvs-engines-parts', 'Moteurs & Pièces Bajaj / TVS'],
    ['/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', 'Bajaj Boxer BM150'],
    ['/fr/contact', 'Contact & Export']
  ].map(([href, label]) => {
    const current = href === activeHref ? ' aria-current="page"' : '';
    return `      <li><a href="${href}"${current}>${escapeHtml(label)}<span class="mnav-arrow">&rsaquo;</span></a></li>`;
  }).join('\n');

  const dropdownLinks = langLinks.map(([href, label, isCurrent]) =>
    `            <a href="${escapeHtml(href)}"${isCurrent ? ' class="active"' : ''}>${escapeHtml(label)}</a>`
  ).join('\n');

  return `  <div class="mobile-nav" id="mobileNav">
    <div class="mobile-nav-header">
      <div class="mobile-nav-brand">
        <div class="mobile-nav-logo">CHIXIANG MOTOR</div>
        <div class="mobile-nav-tagline">Fabricant de moteurs moto &amp; tricycle cargo</div>
      </div>
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="Fermer le menu">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <ul class="mobile-nav-list">
${mobileLinks}
      <li><a href="${escapeHtml(quoteHref)}" class="mnav-accent">Demander un devis<span class="mnav-arrow">&rsaquo;</span></a></li>
    </ul>
  </div>

  <nav class="navbar">
    <div class="container">
      <a href="/fr/" class="nav-logo"><span class="logo-icon"><img src="/images/logo.webp" alt="CHIXIANG MOTOR" width="36" height="36" decoding="async"></span><span class="logo-text">CHIXIANG MOTOR</span></a>
      <ul class="nav-links" role="navigation" aria-label="Navigation principale">
${desktopLinks}
      </ul>
      <div class="nav-right">
        <div class="lang-switcher">
          <button class="lang-current" aria-label="Choisir la langue"><span>FR</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          <div class="lang-dropdown">
${dropdownLinks}
          </div>
        </div>
        <a href="${escapeHtml(quoteHref)}" class="btn btn-accent btn-sm">Demander un devis</a>
        <button class="menu-toggle" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>`;
}

function renderAfricaExportSection(waModel, sectionBg = '') {
  return `  <section class="section" id="export-afrique"${sectionBg ? ` style="background:${sectionBg};"` : ''}>
    <div class="container">
      <h2 class="section-title">Exportation Afrique de l'Ouest &amp; Centrale : FOB Guangzhou &amp; Dédouanement</h2>
      <p class="section-subtitle">Organisation logistique dédiée aux importateurs et grossistes vers les principaux ports francophones et les pays enclavés en transit.</p>
      <div class="features-grid" style="margin-top:1.5rem;">
        <div class="feature-item" style="text-align:left;">
          <h3>Conditions FOB Guangzhou &amp; Ports Cibles</h3>
          <p>Conditions standard <strong>FOB Guangzhou, Chine</strong> (autres grands ports chinois négociables selon commande). Le fret maritime et le dédouanement au port d'arrivée sont assurés par l'acheteur et son transitaire. Ports fréquemment desservis : <strong>Abidjan, Douala, Cotonou, Dakar</strong> (merci d'indiquer le pays de destination finale pour tout transit vers un pays enclavé).</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>Documents Commerciaux &amp; Suivi BSC / BESC</h3>
          <p>Fourniture contractuelle de la facture commerciale, de la liste de colisage et du relevé des modèles et <strong>numéros de série moteur</strong> gravés (certificat d'origine confirmé <strong>sur demande</strong>). Le bordereau de suivi de cargaison <strong>BSC / BESC</strong> est coordonné par l'importateur et son transitaire selon la réglementation locale, avec remise des documents commerciaux requis par l'usine.</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>Commande Mixte, Délais &amp; Garantie 60 Jours</h3>
          <p>MOQ de <strong>50 moteurs</strong> avec <strong>commande mixte de plusieurs modèles</strong> (moteurs complets et pièces détachées dans un même conteneur). Délai habituel ~<strong>10 jours ouvrables</strong> ; test à 100 % au banc chaud et froid avant départ et <strong>garantie de 60 jours</strong> après arrivée au port sur défaut de fabrication vérifié (numéro de série + photo/vidéo).</p>
        </div>
      </div>
      <div class="cta-actions" style="justify-content:flex-start;margin-top:1.5rem;">
        <a href="/fr/contact" class="btn btn-accent">Demander un devis FOB Guangzhou</a>
        <a href="${escapeHtml(waHref(waModel))}" class="btn btn-whatsapp" target="_blank" rel="noopener">Devis WhatsApp (+86 19008225410)</a>
      </div>
    </div>
  </section>`;
}

function renderFooter({ waModel, quoteHref = '/fr/contact', extraScripts = [], isContactPage = false }) {
  const waUrl = waHref(waModel);
  const mobileBar = isContactPage
    ? `  <div class="mobile-cta-bar">
    <a href="#procurement-form" class="btn btn-quote">Formulaire</a>
    <a href="mailto:chixiangmotor@163.com" class="btn btn-email">Email</a>
  </div>`
    : `  <div class="mobile-cta-bar">
    <a href="${escapeHtml(waUrl)}" class="btn btn-wa" target="_blank" rel="noopener">WhatsApp</a>
    <a href="${escapeHtml(quoteHref)}" class="btn btn-quote">Demander un devis</a>
  </div>`;

  const scripts = ['  <script src="/js/main.js" defer></script>', '  <script src="/js/core-menu-accessibility.js" defer></script>', ...extraScripts.map(s => `  <script src="${s}" defer></script>`)].join('\n');

  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.</h4>
          <p>CHIXIANG MOTOR &middot; Expérience dans l'industrie moteur depuis 2003. Société enregistrée en 2007.</p>
          <p style="margin-top:0.5rem;">No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, Chine</p>
        </div>
        <div class="footer-col">
          <h4>Gamme Afrique Francophone</h4>
          <a href="/fr/">Accueil</a><br>
          <a href="/fr/cg-engine">Moteurs CG125–CG250 &amp; Eau</a><br>
          <a href="/fr/cg-engine/cg200-air-cooled-engine">CG200 Air (CX163FML)</a><br>
          <a href="/fr/cg-engine/hw300-water-cooled-engine">HW300 Tricycle à Eau</a><br>
          <a href="/fr/horizontal-engine">Moteurs Horizontaux 110–150</a><br>
          <a href="/fr/bajaj-tvs-engines-parts">Bajaj / TVS &amp; Pièces</a><br>
          <a href="/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine">Bajaj Boxer BM150</a><br>
          <a href="/fr/contact">Devis &amp; Export</a>
        </div>
        <div class="footer-col">
          <h4>Ressources complémentaires (EN)</h4>
          <a href="/en/products">Catalogue complet (EN)</a><br>
          <a href="/en/cb-engine">Moteurs CB OHC (EN)</a><br>
          <a href="/en/engine-parts/hw-series">Pièces série HW200–HW350 (EN)</a><br>
          <a href="/en/evidence">Centre de preuves &amp; essais (EN)</a><br>
          <a href="/en/about">À propos de l'usine (EN)</a><br>
          <a href="/en/news">Guides techniques (EN)</a>
        </div>
        <div class="footer-col">
          <h4>Contact Export</h4>
          <p>Tél / WhatsApp : +86 19008225410</p>
          <p style="margin-top:0.35rem;">Email : chixiangmotor@163.com</p>
          <p style="margin-top:0.35rem;color:var(--text-secondary);">Ports cibles : Abidjan · Douala · Cotonou · Dakar</p>
          <div style="display:flex;gap:1rem;margin-top:0.75rem;">
            <div style="text-align:center;">
              <img src="/images/contact-channels/wechat-qr.webp" alt="Code QR WeChat CHIXIANG MOTOR" width="90" height="90" loading="lazy" decoding="async" style="width:90px;height:90px;border-radius:8px;border:1px solid var(--border-color);background:#fff;padding:3px;">
              <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.2rem;">WeChat</p>
            </div>
            <div style="text-align:center;">
              <img src="/images/contact-channels/whatsapp-qr.webp" alt="Code QR WhatsApp CHIXIANG MOTOR" width="90" height="90" loading="lazy" decoding="async" style="width:90px;height:90px;border-radius:8px;border:1px solid var(--border-color);background:#fff;padding:3px;">
              <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.2rem;">WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) &middot; Les documents d'exportation et la logistique sont assurés par la division export dédiée de Chixiang.</span>
        <span>Chongqing, Chine</span>
      </div>
    </div>
  </footer>

  <a href="${escapeHtml(waUrl)}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Discuter sur WhatsApp" title="Discuter sur WhatsApp">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
${mobileBar}
${scripts}
</body>
</html>
`;
}

function renderFrHome(facts) {
  const waModel = 'CG150 / CG200 / HW300 / BM150';
  const langLinks = [
    ['/fr/', 'Français', true],
    ['/en/', 'English', false],
    ['/es/', 'Español', false],
    ['/pt/', 'Português', false],
    ['/ru/', 'Русский', false],
    ['/ar/', 'العربية', false],
    ['/zh-cn/', '简体中文', false]
  ];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le MOQ et peut-on mixer plusieurs modèles dans un conteneur ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le MOQ standard est de 50 moteurs complets. Nous prenons en charge la commande mixte de plusieurs modèles ainsi que l\'envoi de moteurs complets et pièces détachées dans un même conteneur (CG, moteurs horizontaux, tricycle à eau HW300 et moteurs/pièces adaptables Bajaj & TVS).'
        }
      },
      {
        '@type': 'Question',
        name: 'Comment se gèrent l\'exportation FOB Guangzhou et le BSC / BESC en Afrique de l\'Ouest et Centrale ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nos ventes s\'effectuent par défaut en FOB Guangzhou, Chine (autres ports chinois sur demande) vers Abidjan, Douala, Cotonou, Dakar et les pays enclavés en transit. L\'usine remet facture commerciale, liste de colisage et numéros de série moteur ; le bordereau BSC / BESC et le dédouanement sont coordonnés par l\'importateur et son transitaire.'
        }
      },
      {
        '@type': 'Question',
        name: 'Quelle est la différence entre un moteur CG à tiges de culbuteurs et un moteur CB ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le moteur CG à tiges de culbuteurs privilégie la robustesse mécanique et le couple à bas régime pour les motos utilitaires et tricycles cargo, tandis que le moteur CB à arbre à cames en tête (distribution par chaîne) cible les motos routières et tout-terrain à plus haut régime.'
        }
      }
    ]
  };

  return `${renderHead({
    title: 'Fabricant de moteurs moto CG, CB et tricycles | CHIXIANG',
    description: 'Moteurs CG, CB, horizontaux et tricycles à eau. Vente en gros dès 50 moteurs, modèles mixtes et pièces détachées, FOB Guangzhou.',
    frPath: '/fr/',
    enPath: '/en/',
    preloadImage: '/images/factory-showcase/factory-5.webp',
    schemas: [faqSchema],
    withContactPoint: true
  })}
<body>
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/', quoteHref: '/fr/contact', langLinks })}

  <section class="hero" id="home">
    <div class="hero-bg" style="background-image: url('/images/factory-showcase/chixiang-engine-hot-cold-bench-testing.webp');"></div>
    <div class="hero-overlay"></div>
    <div class="hero-brand">
      <div class="hero-brand-line"></div>
      <h1 class="hero-brand-headline">Fabricant de moteurs pour motos et tricycles cargo en Chine</h1>
      <p class="hero-brand-trust">CHIXIANG MOTOR fabrique et exporte à Chongqing des moteurs CG125–CG250 refroidis par air, des moteurs tricycle 250/300cc à eau (CG250SB &amp; HW300), des moteurs horizontaux 110–150 cm³ (Cub / Jakarta) ainsi que des moteurs complets et pièces de rechange adaptables Bajaj Boxer BM150 &amp; TVS HLX. Vente en gros dès 50 moteurs, commande mixte de plusieurs modèles et pièces détachées dans un même conteneur, FOB Guangzhou.</p>
      <div class="hero-cta">
        <a href="/fr/contact" class="btn btn-accent btn-lg">Demander un devis</a>
        <a href="/fr/cg-engine" class="btn btn-outline-light btn-lg">Voir la gamme CG &amp; Tricycle</a>
      </div>
      <p class="hero-brand-since">Expérience depuis 2003 &nbsp;&middot;&nbsp; Capacité ${escapeHtml(facts.capacity.replace('units/month', 'moteurs/mois'))} &nbsp;&middot;&nbsp; Exporté dans 50+ pays &nbsp;&middot;&nbsp; ISO 9001</p>
    </div>
  </section>

  <section class="section" id="categories">
    <div class="container">
      <h2 class="section-title">Gammes moteurs &amp; pièces prioritaires pour l'Afrique francophone</h2>
      <p class="section-subtitle">Commande mixte de plusieurs modèles dès 50 moteurs, test à 100 % au banc chaud et froid avant expédition FOB Guangzhou.</p>
      <div class="categories-grid">

        <div class="category-card" data-animate>
          <a href="/fr/cg-engine" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'fr')}</div>
            <div class="card-info">
              <h3>Moteurs CG125–CG250 (Air &amp; Eau)</h3>
              <p class="series-list">Moteur CG à tiges de culbuteurs · Arbre d'équilibrage en option · Démarrage électrique / au kick<br>Pour motos commerciales et tricycles cargo</p>
            </div>
          </a>
          <a href="/fr/cg-engine/cg200-air-cooled-engine" class="btn btn-accent btn-sm card-quote-btn">Fiche CG200 (197 cc)</a>
        </div>

        <div class="category-card" data-animate>
          <a href="/fr/cg-engine/hw300-water-cooled-engine" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp', 'fr')}</div>
            <div class="card-info">
              <h3>HW300 Tricycle Cargo à Eau</h3>
              <p class="series-list">Classe 300cc (275,3 mL réels) · Refroidissement liquide (eau) · Carter 1,5 L · Embrayage 20 rouleaux<br>Compatible boîte de marche arrière externe</p>
            </div>
          </a>
          <a href="/fr/cg-engine/hw300-water-cooled-engine" class="btn btn-accent btn-sm card-quote-btn">Voir HW300 &amp; Kits</a>
        </div>

        <div class="category-card" data-animate>
          <a href="/fr/horizontal-engine" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/horizontal-electric-start/chixiang-cx-horizontal-110-125-electric-start-engine-02.webp', 'fr')}</div>
            <div class="card-info">
              <h3>Moteurs Horizontaux 110–150 cm³</h3>
              <p class="series-list">CX152FMH-5B (106,7 ml) à CX1P60FMJ (149,8 ml) · Boîte 4 vitesses<br>Pour motos de type Cub et applications Jakarta compatibles</p>
            </div>
          </a>
          <a href="/fr/horizontal-engine" class="btn btn-accent btn-sm card-quote-btn">Gamme Cub / Jakarta</a>
        </div>

        <div class="category-card" data-animate>
          <a href="/fr/bajaj-tvs-engines-parts" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/bajaj-tvs/bajaj-boxer-ct100-bm100-clutch-side.webp', 'fr')}</div>
            <div class="card-info">
              <h3>Moteurs &amp; Pièces Bajaj / TVS</h3>
              <p class="series-list">Bajaj Boxer BM150, CT100, RE 4S et TVS HLX 125/150 &amp; King 200 (adaptables)<br>Moteurs complets et pièces détachées à références OEM d'identification</p>
            </div>
          </a>
          <a href="/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine" class="btn btn-accent btn-sm card-quote-btn">Fiche Boxer BM150</a>
        </div>

        <div class="category-card" data-animate>
          <a href="/fr/cg-engine/cg200-air-cooled-engine" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp', 'fr')}</div>
            <div class="card-info">
              <h3>Moteur Complet CG200 (CX163FML)</h3>
              <p class="series-list">197,0 cc (63,5 × 62,2 mm) · 10 kW @ 7 500 rpm · 13,5 N·m @ 6 500 rpm<br>Moteur moto-taxi et utilitaire à fort kilométrage</p>
            </div>
          </a>
          <a href="/fr/contact?product_interest=cg&amp;engine_code=CG200" class="btn btn-accent btn-sm card-quote-btn">Devis CG200</a>
        </div>

        <div class="category-card" data-animate>
          <a href="/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine" class="card-main">
            <div class="card-img">${imgSeo.renderCardImg('images/parts/chixiang-motorcycle-tricycle-engine-spare-parts-overview.webp', 'fr')}</div>
            <div class="card-info">
              <h3>Bajaj Boxer BM150 (144,8 cc)</h3>
              <p class="series-list">Moteur de remplacement adaptable 56,0 × 58,8 mm · 4/5 vitesses<br>Demi-carters, culasse complète, kit cylindre-piston &amp; joints</p>
            </div>
          </a>
          <a href="/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine" class="btn btn-accent btn-sm card-quote-btn">Voir Specs BM150</a>
        </div>

      </div>
    </div>
  </section>

  <section class="section" id="atouts-usine" style="background:var(--bg-secondary);">
    <div class="container">
      <h2 class="section-title">Capacité industrielle à Chongqing &amp; Contrôle Qualité</h2>
      <p class="section-subtitle">CHIXIANG MOTOR (Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.) — Expérience depuis 2003, entité enregistrée en 2007.</p>
      <div class="features-grid" style="margin-top:1.5rem;">
        <div class="feature-item" style="text-align:left;">
          <h3>Test 100 % au banc chaud &amp; froid</h3>
          <p>Chaque moteur subit un essai à froid et à chaud à 100 % avant expédition, appuyé par deux laboratoires équipés de bancs dynamométriques, analyseurs de gaz et contrôle métallurgique des vilebrequins, pignons et carters.</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>CG Pushrod vs CB Chaîne (OHC)</h3>
          <p>Nos moteurs CG à tiges de culbuteurs (125–250 cc) répondent aux besoins d'entretien simple en Afrique. Nous produisons aussi la gamme <a href="/en/cb-engine">moteur CB à arbre à cames en tête (distribution par chaîne) (EN)</a> sur demande dans vos commandes mixtes.</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>Certifications &amp; Traçabilité</h3>
          <p>Système qualité ISO 9001 et dossiers CCC par modèle applicable. Chaque moteur porte un numéro de série gravé communiqué sur la liste d'expédition. <a href="/en/evidence">Consulter le Centre de preuves (EN) &rarr;</a></p>
        </div>
      </div>
    </div>
  </section>

${renderAfricaExportSection(waModel)}

  <section class="section" id="faq" style="background:var(--bg-secondary);">
    <div class="container">
      <h2 class="section-title">Questions fréquentes — Importateurs Afrique Francophone</h2>
      <div class="features-grid" style="margin-top:1.5rem;">
        <div class="feature-item" style="text-align:left;">
          <h3>Quel est le MOQ et peut-on mixer plusieurs modèles dans un conteneur ?</h3>
          <p>Le MOQ standard est de 50 moteurs complets. Nous prenons en charge la commande mixte de plusieurs modèles ainsi que l'envoi de moteurs complets et pièces détachées dans un même conteneur (CG, moteurs horizontaux 110–150, HW300 à eau et adaptables Bajaj / TVS).</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>Comment se gèrent l'exportation FOB Guangzhou et le BSC / BESC ?</h3>
          <p>Les expéditions s'effectuent en FOB Guangzhou, Chine vers Abidjan, Douala, Cotonou, Dakar et les pays enclavés en transit. L'usine fournit facture commerciale, liste de colisage et numéros de série moteur ; le BSC / BESC et le dédouanement sont coordonnés par votre transitaire.</p>
        </div>
        <div class="feature-item" style="text-align:left;">
          <h3>Les moteurs et pièces Bajaj / TVS sont-ils d'origine constructeur ?</h3>
          <p>Non : il s'agit de moteurs complets et pièces de rechange adaptables fabriqués par CHIXIANG MOTOR aux cotes d'encombrement et de montage correspondantes. Les marques Bajaj&reg;, TVS&reg; et les références OEM sont citées uniquement à titre d'identification.</p>
        </div>
      </div>
    </div>
  </section>

${renderFooter({ waModel })}
`;
}

function renderFrCgShell() {
  const waModel = 'Moteur CG125 / CG150 / CG200 / CG250 (air ou eau)';
  const langLinks = [
    ['/fr/cg-engine', 'Français', true],
    ['/en/cg-engine', 'English', false],
    ['/es/motor-cg', 'Español', false],
    ['/pt/motor-cg', 'Português', false],
    ['/ru/dvigatel-cg', 'Русский', false],
    ['/ar/cg-engine', 'العربية', false],
    ['/zh-cn/cg-engine', '简体中文', false]
  ];
  const emptyFaqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] };
  return `${renderHead({
    title: 'Moteurs complets CG125, CG150, CG200 en gros | CHIXIANG',
    description: 'Moteurs CG à tiges de culbuteurs (CG125 à CG250 air, CG150SB–CG250SB et HW200–HW350 refroidis par eau) pour motos et tricycles cargo. MOQ 50, FOB Guangzhou.',
    frPath: '/fr/cg-engine',
    enPath: '/en/cg-engine',
    ogImage: `${ORIGIN}/images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp`,
    schemas: [emptyFaqSchema]
  })}
<body>
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/cg-engine', quoteHref: '/fr/contact?product_interest=cg', langLinks })}
  <section class="page-header">
    <div class="container">
      <h1>Moteurs CG125 à CG250 : versions refroidies par air et par eau</h1>
      <p class="section-subtitle">Moteurs CG à tiges de culbuteurs refroidis par air pour motos utilitaires et architectures à refroidissement liquide (eau) pour tricycle cargo et tricycle 250/300cc à eau.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="about-hero landing-hero">
        <div>
          <h2>Gamme CG Air &amp; Eau (125–350 cc)</h2>
          <p style="color:var(--text-secondary);line-height:1.8;margin-top:1rem;">CHIXIANG MOTOR fabrique la gamme complète de moteurs CG à tiges de culbuteurs avec démarrage électrique / au kick, option arbre d'équilibrage, versions à refroidissement liquide (eau) CG150SB–CG250SB et série lourde HW200–HW350 pour tricycles cargo. Commande mixte de plusieurs modèles dès 50 moteurs, FOB Guangzhou.</p>
          <div class="cta-actions landing-actions" style="justify-content:flex-start;margin-top:2rem;">
            <a href="/fr/contact?product_interest=cg" class="btn btn-accent btn-lg">Demander un devis usine</a>
            <a href="/fr/cg-engine/cg200-air-cooled-engine" class="btn btn-primary btn-lg">Fiche CG200 Air</a>
            <a href="/fr/cg-engine/hw300-water-cooled-engine" class="btn btn-outline btn-lg">Fiche HW300 à Eau</a>
            <a href="${escapeHtml(waHref(waModel))}" class="btn btn-whatsapp btn-lg" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <div class="about-hero-img landing-product-image">${imgSeo.renderCardImg('images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'fr', { eager: true, fit: 'contain' })}</div>
      </div>
    </div>
  </section>
  <!-- Product Detail SEO Content -->
  <!-- /Product Detail SEO Content -->
${renderAfricaExportSection(waModel, 'var(--bg-surface,#f8fafc)')}
${renderFooter({ waModel, quoteHref: '/fr/contact?product_interest=cg' })}
`;
}

function renderFrHorizontalShell() {
  const waModel = 'Moteur horizontal 110/125cc (Jakarta)';
  const langLinks = [
    ['/fr/horizontal-engine', 'Français', true],
    ['/en/horizontal-engine', 'English', false],
    ['/es/motor-horizontal', 'Español', false],
    ['/pt/motor-horizontal', 'Português', false],
    ['/ru/gorizontalnyj-dvigatel', 'Русский', false],
    ['/ar/horizontal-engine', 'العربية', false],
    ['/zh-cn/horizontal-engine', '简体中文', false]
  ];
  const emptyFaqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] };
  return `${renderHead({
    title: 'Moteurs horizontaux 110 à 150 cm³ (Cub / Jakarta) | CHIXIANG',
    description: 'Moteurs horizontaux 110/125 cm³ CX152FMH-5B, CX152FMH-6 jusqu\'à 150 cm³ pour motos de type Cub et applications Jakarta compatibles. Pièces moteur Jakarta en conteneur mixte.',
    frPath: '/fr/horizontal-engine',
    enPath: '/en/horizontal-engine',
    ogImage: `${ORIGIN}/images/horizontal-electric-start/chixiang-cx-horizontal-110-125-electric-start-engine-02.webp`,
    schemas: [emptyFaqSchema]
  })}
<body>
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/horizontal-engine', quoteHref: '/fr/contact?product_interest=horizontal', langLinks })}
  <section class="page-header">
    <div class="container">
      <h1>Moteurs horizontaux 110/125 cm³ pour motos de type Cub et applications Jakarta compatibles</h1>
      <p class="section-subtitle">Moteurs horizontaux CX refroidis par air de 110 à 150 cm³ (106,7 ml à 149,8 ml) avec démarrage électrique / au kick, démarreur supérieur ou inférieur et option boîte 1+1 ou marche arrière.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="about-hero landing-hero">
        <div>
          <h2>Gamme Horizontale CX (Cub / Jakarta 110–150 cm³)</h2>
          <p style="color:var(--text-secondary);line-height:1.8;margin-top:1rem;">Conçue pour les motos de type Cub, les applications Jakarta compatibles (Jakarta 110 / 125) et les projets d'assemblage légers, notre gamme horizontale associe moteurs complets et pièces moteur Jakarta (cylindre-piston, culasse, embrayage, faisceau) en commande mixte de plusieurs modèles dès 50 unités, FOB Guangzhou.</p>
          <div class="cta-actions landing-actions" style="justify-content:flex-start;margin-top:2rem;">
            <a href="/fr/contact?product_interest=horizontal" class="btn btn-accent btn-lg">Demander un devis</a>
            <a href="#cx-models" class="btn btn-primary btn-lg">Comparer les modèles CX</a>
            <a href="${escapeHtml(waHref(waModel))}" class="btn btn-whatsapp btn-lg" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <div class="about-hero-img landing-product-image">${imgSeo.renderCardImg('images/horizontal-electric-start/chixiang-cx-horizontal-110-125-electric-start-engine-02.webp', 'fr', { eager: true, fit: 'contain' })}</div>
      </div>
    </div>
  </section>
  <!-- Product Detail SEO Content -->
  <!-- /Product Detail SEO Content -->
${renderAfricaExportSection(waModel, 'var(--bg-surface,#f8fafc)')}
${renderFooter({ waModel, quoteHref: '/fr/contact?product_interest=horizontal' })}
`;
}

function renderFrBtvHub(catalog) {
  const waModel = 'Bajaj Boxer BM150 / TVS HLX150';
  const langLinks = [
    ['/fr/bajaj-tvs-engines-parts', 'Français', true],
    ['/en/bajaj-tvs-engines-parts', 'English', false],
    ['/zh-cn/bajaj-tvs-engines-parts', '简体中文', false]
  ];
  const publicProducts = (catalog.products || []).filter(p => p && p.public === true);
  const publicProductMap = new Map(publicProducts.map(p => [p.id, p]));

  const catLabelsFr = {
    'complete-engines': 'Moteurs complets adaptables',
    crankcases: 'Demi-carters moteur gauche et droit',
    'engine-covers': 'Couvercles d\'embrayage & de magnéto',
    'cylinder-head-kits': 'Culasse complète & kit cylindre-piston',
    'crankshaft-timing': 'Ensemble vilebrequin et bielle & distribution',
    'clutch-transmission': 'Embrayage & pignons de boîte',
    'overhaul-seals': 'Pochette complète de joints moteur & spi'
  };

  const frNames = {
    'bajaj-boxer-ct100-bm100-complete-engine': 'Moteur complet adaptable Bajaj Boxer CT100 / BM100 (99,27 cc OHC)',
    'bajaj-boxer-bm150-complete-engine': 'Moteur complet adaptable Bajaj Boxer BM150 (144,8 cc)',
    'bajaj-re-4s-200-complete-engine': 'Moteur complet adaptable Bajaj RE 4S / Compact 200 (198,88 cc 4F+1R)',
    'tvs-hlx-150-complete-engine': 'Moteur complet adaptable TVS HLX 150 / HLX 125 (147,49 cc Ecothrust)',
    'tvs-king-200-complete-engine': 'Moteur complet adaptable TVS King Deluxe / GS 200 (199,26 cc 4F+1R)'
  };

  const productCards = publicProducts.map(product => {
    const isBm150 = product.id === 'bajaj-boxer-bm150-complete-engine';
    const detailHref = isBm150
      ? '/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine'
      : `/en/bajaj-tvs-engines-parts/${product.id}`;
    const detailLabel = isBm150 ? 'Voir la fiche complète' : 'Voir la fiche (EN)';
    const quoteHref = `/fr/contact?product_interest=parts&source_form=bajaj-tvs-catalog&source_cta=product-card&btv_part=${encodeURIComponent(product.id)}&btv_pn=${encodeURIComponent(product.part_number || '')}&btv_brand=${encodeURIComponent((product.vehicle_brands || []).join('+'))}&engine_code=${encodeURIComponent((product.engine_codes || []).join(', '))}`;
    const photo = (product.photos || [])[0];
    const dispSpec = product.specs && (product.specs.displacement || product.specs.engine_type);
    const badgeCode = dispSpec && dispSpec.value ? dispSpec.value.split('(')[0].trim() : (product.part_number || 'Adaptable');
    const imgHref = isBm150 ? detailHref : quoteHref;
    const imgHtml = photo && photo.src
      ? `          <a class="product-img has-img" href="${escapeHtml(imgHref)}">${imgSeo.renderCardImg(photo.src, 'fr', { alt: frNames[product.id] || imgSeo.getAlt(photo.src, 'fr', product.name_en) })}</a>`
      : `          <a class="btv-spec-banner" href="${escapeHtml(imgHref)}"><span class="btv-spec-banner__eyebrow">CHIXIANG MOTOR · Moteur de remplacement adaptable</span><span class="btv-spec-banner__code">${escapeHtml(badgeCode)}</span><span class="btv-spec-banner__note">Cotes et interfaces d'identification OEM</span></a>`;

    const titleFr = frNames[product.id] || product.name_en;
    const titleLinkLabel = isBm150 ? titleFr : `${titleFr} (EN)`;
    return `        <article class="product-card" data-btv-product="${escapeHtml(product.id)}">
${imgHtml}
          <div class="product-info">
            <h3><a href="${escapeHtml(detailHref)}">${escapeHtml(titleLinkLabel)}</a></h3>
            <div class="specs">
              <p>Réf. Chixiang : ${escapeHtml(product.part_number || '')}</p>
              <p>Références OEM (à titre d'identification) : ${escapeHtml((product.oem_part_numbers || []).join(', '))}</p>
              <p>Code moteur : ${escapeHtml((product.engine_codes || []).join(', '))}</p>
            </div>
            <div class="card-actions">
              <a class="btn btn-primary btn-sm" href="${escapeHtml(detailHref)}">${escapeHtml(detailLabel)}</a>
              <a class="btn btn-accent btn-sm" href="${escapeHtml(quoteHref)}">Demander un devis</a>
            </div>
          </div>
        </article>`;
  }).join('\n');

  const hubs = (catalog.model_hubs || []).filter(h => h && h.public === true && Array.isArray(h.core_parts) && h.core_parts.length);
  const categorySet = new Set();
  hubs.forEach(h => h.core_parts.forEach(p => { if (p && p.category) categorySet.add(p.category); }));

  const modelOptions = hubs.map(h => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.model_name_en)}</option>`).join('');
  const categoryOptions = [...categorySet].map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(catLabelsFr[cat] || cat)}</option>`).join('');

  const hubBlocks = hubs.map(hub => {
    const linked = hub.detail_product_id && publicProductMap.get(hub.detail_product_id);
    const linkedHref = linked
      ? (linked.id === 'bajaj-boxer-bm150-complete-engine'
        ? '/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine'
        : `/en/bajaj-tvs-engines-parts/${linked.id}`)
      : '';
    const linkedBtn = linked
      ? `<div class="btv-model-actions"><a class="btn btn-primary btn-sm" href="${escapeHtml(linkedHref)}">${linked.id === 'bajaj-boxer-bm150-complete-engine' ? 'Voir la fiche complète BM150 &rarr;' : 'Voir la fiche moteur (EN) &rarr;'}</a></div>`
      : '';

    const rows = hub.core_parts.map((part, idx) => {
      const qParams = new URLSearchParams({
        product_interest: 'parts',
        source_form: 'bajaj-tvs-catalog',
        source_cta: 'model-hub-row',
        btv_brand: hub.brand || '',
        btv_part: `${hub.id}:${part.chixiang_pn || part.oem_ref || part.part_name_en}`,
        vehicle: hub.model_name_en
      });
      if (part.chixiang_pn || part.oem_ref) qParams.set('btv_pn', [part.chixiang_pn, part.oem_ref].filter(Boolean).join(' / '));
      if (hub.engine_code) qParams.set('engine_code', hub.engine_code);
      const qHref = `/fr/contact?${qParams.toString()}`;
      const tokens = [hub.model_name_en, part.part_name_en, catLabelsFr[part.category] || '', part.chixiang_pn || '', part.oem_ref || '', part.material_spec || ''].join(' ').toLowerCase();
      return `<tr id="part-${escapeHtml(hub.id)}-${idx + 1}" data-btv-row-category="${escapeHtml(part.category || '')}" data-btv-search="${escapeHtml(tokens)}">
                <td class="btv-col-select"><input type="checkbox" class="btv-part-checkbox" aria-label="${escapeHtml(`Sélectionner ${part.part_name_en}`)}" data-btv-brand="${escapeHtml(hub.brand || '')}" data-btv-model="${escapeHtml(hub.model_name_en)}" data-btv-part="${escapeHtml(part.part_name_en)}" data-btv-category="${escapeHtml(part.category || '')}" data-btv-pn="${escapeHtml(part.chixiang_pn || '')}" data-btv-oem="${escapeHtml(part.oem_ref || '')}"></td>
                <th>${escapeHtml(part.part_name_en)}</th>
                <td>${escapeHtml(catLabelsFr[part.category] || part.category || 'Pièce adaptable')}</td>
                <td>${escapeHtml(part.chixiang_pn || 'Selon modèle / échantillon')}</td>
                <td>${escapeHtml(part.oem_ref || 'Réf. OEM d\'identification')}</td>
                <td>${escapeHtml(part.material_spec || 'Alliage qualité usine')}</td>
                <td><a class="btn btn-accent btn-sm" href="${escapeHtml(qHref)}">Devis</a></td>
              </tr>`;
    }).join('\n              ');

    return `        <div class="catalog-table-block" id="hub-${escapeHtml(hub.id)}" data-btv-model-hub="${escapeHtml(hub.id)}" style="margin-top:2rem;">
          <div class="btv-model-hub-head">
            <h3>${escapeHtml(hub.model_name_en)} <span style="font-size:0.9rem;font-weight:400;color:var(--text-secondary);">(Cylindrée réf. : ${escapeHtml(hub.displacement_cc || '')} · Code : ${escapeHtml(hub.engine_code || '')})</span></h3>
            <span class="btv-supply-badge btv-supply-badge--engine">Moteur adaptable + Pièces</span>
          </div>
          ${linkedBtn}
          <p class="table-scroll-hint">&larr; Glissez horizontalement pour consulter les références OEM et cocher vos pièces &rarr;</p>
          <div class="responsive-table-wrap" tabindex="0">
            <table class="specs-table catalog-spec-table btv-bom-table">
              <thead>
                <tr>
                  <th class="btv-col-select">Choix</th>
                  <th>Pièce principale</th>
                  <th>Catégorie</th>
                  <th>Réf. Chixiang</th>
                  <th>Réf. OEM (identification)</th>
                  <th>Matière / Spécification</th>
                  <th>Devis</th>
                </tr>
              </thead>
              <tbody>
              ${rows}
              </tbody>
            </table>
          </div>
        </div>`;
  }).join('\n');

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Moteurs et pièces de rechange adaptables Bajaj et TVS',
    numberOfItems: publicProducts.length,
    itemListElement: publicProducts.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: frNames[p.id] || p.name_en,
        sku: p.part_number,
        brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
        manufacturer: { '@id': ORG_ID },
        url: p.id === 'bajaj-boxer-bm150-complete-engine'
          ? `${ORIGIN}/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine`
          : `${ORIGIN}/en/bajaj-tvs-engines-parts/${p.id}`
      }
    }))
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Vos moteurs et pièces Bajaj Boxer BM150 / TVS HLX sont-ils des pièces d\'origine constructeur ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Non. CHIXIANG MOTOR fournit des moteurs complets et des pièces de rechange adaptables fabriqués aux cotes mécaniques correspondantes ; les noms Bajaj, TVS et les références OEM sont mentionnés uniquement à titre d\'identification.'
        }
      },
      {
        '@type': 'Question',
        name: 'Quelles pièces moteur de remplacement fournissez-vous pour Bajaj Boxer BM150 et TVS HLX 150 ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous fournissons les moteurs complets de remplacement ainsi que les pièces clés : culasse complète, kit cylindre-piston, ensemble vilebrequin et bielle, demi-carters moteur gauche et droit, couvercles d\'embrayage/magnéto et pochette complète de joints moteur.'
        }
      },
      {
        '@type': 'Question',
        name: 'Peut-on combiner des pièces Bajaj / TVS avec des moteurs CG ou HW300 dans un même conteneur ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui. La commande mixte de plusieurs modèles est possible dès 50 unités en regroupant moteurs complets et pièces détachées dans un même conteneur, expédié FOB Guangzhou vers Abidjan, Douala, Cotonou ou Dakar.'
        }
      }
    ]
  };

  return `${renderHead({
    title: 'Moteurs et pièces Bajaj Boxer BM150 / TVS HLX | CHIXIANG',
    description: 'Moteurs complets et pièces de rechange adaptables Bajaj Boxer BM150, CT100, RE 4S et TVS HLX 125/150 : culasse complète, kit cylindre-piston, demi-carters moteur gauche et droit, pochette de joints. Références OEM à titre d\'identification.',
    frPath: '/fr/bajaj-tvs-engines-parts',
    enPath: '/en/bajaj-tvs-engines-parts',
    ogImage: `${ORIGIN}/images/parts/chixiang-motorcycle-tricycle-engine-spare-parts-overview.webp`,
    schemas: [itemListSchema, faqSchema]
  })}
<body class="btv-page">
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/bajaj-tvs-engines-parts', quoteHref: '/fr/contact?product_interest=parts&source_form=bajaj-tvs-catalog&source_cta=nav', langLinks })}

  <main>
    <section class="page-header">
      <div class="container">
        <h1>Moteurs complets et pièces de rechange adaptables Bajaj et TVS</h1>
        <p class="section-subtitle">Moteurs de remplacement adaptables et pièces détachées (culasse complète, kit cylindre-piston, ensemble vilebrequin et bielle, demi-carters moteur gauche et droit, pochette complète de joints moteur) pour flottes Bajaj Boxer BM150 et TVS HLX 125 / 150. Références OEM citées uniquement à titre d'identification.</p>
        <div class="cta-actions" style="justify-content:center;margin-top:1.5rem;">
          <a href="#model-hubs" class="btn btn-primary btn-lg">Rechercher une référence OEM</a>
          <a href="/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine" class="btn btn-outline btn-lg">Fiche Bajaj Boxer BM150</a>
          <a href="/fr/contact?product_interest=parts&amp;source_form=bajaj-tvs-catalog&amp;source_cta=hero" class="btn btn-accent btn-lg">Demander un devis</a>
        </div>
      </div>
    </section>

    <section class="section" id="complete-engines">
      <div class="container">
        <h2 class="section-title">Moteurs complets de remplacement adaptables</h2>
        <p class="section-subtitle">Ensembles complets fabriqués selon les dimensions d'implantation correspondantes, disponibles en commande mixte de plusieurs modèles avec vos moteurs CG et tricycles à eau.</p>
        <div class="products-grid" data-btv-products="complete-engines">
${productCards}
        </div>
      </div>
    </section>

    <section class="section" id="familles-pieces" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Sous-ensembles &amp; pièces d'usure disponibles pour Bajaj Boxer &amp; TVS HLX</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          <div class="feature-item" style="text-align:left;">
            <h3>Haut moteur : culasse complète &amp; kit cylindre-piston</h3>
            <p>Culasse complète équipée ou nue, soupapes et kit cylindre-piston alésé aux cotes d'origine pour Bajaj Boxer BM150 (56,0 × 58,8 mm), CT100 (53,0 × 45,0 mm) et TVS HLX 150 (57,0 × 57,8 mm).</p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>Bas moteur : demi-carters moteur gauche et droit &amp; vilebrequin</h3>
            <p>Demi-carters moteur gauche et droit en aluminium ADC12 usinés CNC, couvercles d'embrayage/magnéto et ensemble vilebrequin et bielle forgé pour usage moto-taxi intensif.</p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>Maintenance : embrayage &amp; pochette complète de joints moteur</h3>
            <p>Disques d'embrayage, pignons de boîte 4/5 vitesses et pochette complète de joints moteur avec joints spi pour consolidation en conteneur mixte (références OEM à titre d'identification).</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="model-hubs" data-btv-section="model-hubs">
      <div class="container">
        <h2 class="section-title">Catalogue interactif par modèle &amp; références OEM d'identification</h2>
        <p class="section-subtitle">Filtrez par modèle ou recherchez une référence OEM/Chixiang, puis cochez plusieurs articles pour pré-remplir votre demande de devis sur /fr/contact.</p>
        <div class="btv-hub-toolbar" id="btv-hub-toolbar">
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterModel">Filtrer par modèle</label>
            <select id="btvFilterModel" data-btv-filter-model>
              <option value="">Tous les modèles</option>
              ${modelOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterCategory">Filtrer par catégorie</label>
            <select id="btvFilterCategory" data-btv-filter-category>
              <option value="">Toutes catégories</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field btv-hub-toolbar__search">
            <label for="btvFilterSearch">Rechercher réf. Chixiang, OEM ou pièce</label>
            <input type="search" id="btvFilterSearch" data-btv-filter-search placeholder="Ex. 36PF0004, CX-BJ-BM150, HLX...">
          </div>
          <div class="btv-hub-toolbar__count" data-btv-filter-count></div>
        </div>
${hubBlocks}
        <div class="btv-quote-basket" id="btvQuoteBasket" hidden>
          <div class="btv-quote-basket__info">
            <strong>Pièces sélectionnées pour devis (<span data-btv-basket-count>0</span>)</strong>
          </div>
          <div class="btv-quote-basket__actions">
            <button type="button" class="btn btn-outline btn-sm" data-btv-basket-clear>Effacer</button>
            <button type="button" class="btn btn-accent btn-sm" data-btv-basket-submit>Demander un devis groupé &rarr;</button>
          </div>
        </div>
      </div>
    </section>

${renderAfricaExportSection(waModel, 'var(--bg-surface,#f8fafc)')}

    <section class="section" id="faq">
      <div class="container">
        <h2 class="section-title">FAQ — Moteurs &amp; pièces adaptables Bajaj / TVS</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          <div class="feature-item" style="text-align:left;">
            <h3>S'agit-il de pièces de rechange adaptables ou d'origine ?</h3>
            <p>Il s'agit exclusivement de moteurs complets de remplacement et pièces de rechange adaptables fabriqués par CHIXIANG MOTOR. Les marques Bajaj&reg;, TVS&reg; et leurs références OEM figurent uniquement à titre d'identification technique.</p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>Puis-je commander des demi-carters et pochettes de joints avec des moteurs CG ?</h3>
            <p>Oui. Nous regroupons moteurs complets et pièces détachées dans un même conteneur (commande mixte de plusieurs modèles dès 50 moteurs ou lots de pièces associés).</p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>Quels documents accompagnent l'expédition vers Abidjan, Douala, Cotonou ou Dakar ?</h3>
            <p>Facture commerciale, liste de colisage et liste des numéros de série moteur sont fournis ; le certificat d'origine est confirmé sur demande. Le suivi BSC / BESC est coordonné par l'importateur et son transitaire.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

${renderFooter({
  waModel,
  quoteHref: '/fr/contact?product_interest=parts&source_form=bajaj-tvs-catalog&source_cta=mobile-bar',
  extraScripts: ['/js/btv-catalog-basket.js']
})}
`;
}

function renderFrHw300(enginesData, hwPartsData) {
  const engine = (enginesData.engines || []).find(e => e.slug === 'hw300-water-cooled-engine');
  if (!engine) throw new Error('hw300-water-cooled-engine missing from data/flagship-engines.json');
  const waModel = 'HW300 300cc à eau';
  const frUrl = `${ORIGIN}/fr/cg-engine/hw300-water-cooled-engine`;
  const quoteHref = `/fr/contact?product_interest=cg&source_form=flagship-engine-page&source_cta=hero-quote&engine_code=${encodeURIComponent(engine.model)}&vehicle=${encodeURIComponent('Tricycle cargo HW300 (classe 300cc, 275,3 mL) à eau')}&btv_pn=${encodeURIComponent(engine.sku)}`;

  const langLinks = [
    ['/fr/cg-engine/hw300-water-cooled-engine', 'Français', true],
    ['/en/cg-engine/hw300-water-cooled-engine', 'English', false]
  ];

  const bundledParts = [];
  for (const part of hwPartsData.parts || []) {
    const compat = (part.compatible_variants || []).find(v => v.variant_id === engine.model);
    if (!compat) continue;
    if (part.assembly_id === 'factory-matched-kits' || bundledParts.length < 8) {
      bundledParts.push({
        pn: part.sku || part.part_number || '',
        name: part.product_name_en,
        spec: part.specifications?.key_spec || '',
        oem: part.oem_ref || ''
      });
    }
  }
  const bundleSlice = bundledParts.slice(0, 8);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${frUrl}#product`,
    name: 'Moteur complet HW300 (classe 300cc, 275,3 mL) refroidi par eau pour tricycle cargo',
    sku: engine.sku,
    model: engine.model,
    category: 'Moteurs tricycle cargo refroidis par eau (Série HW Water)',
    description: `Moteur HW300 classe 300cc à cylindrée réelle ${engine.actual_displacement} (${engine.bore_stroke}) : ${engine.power}, ${engine.torque}, capacité d'huile ${engine.oil_capacity}, embrayage à 20 rouleaux et magnéto CC à haut rendement pour tricycle cargo. ~80 % de pièces communes avec le HW250.`,
    image: engine.gallery_images.map((img, idx) => imgSeo.imageObjectNode(img.src, 'fr', { representativeOfPage: idx === 0 })),
    url: frUrl,
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Classe nominale', value: 'Classe 300cc' },
      { '@type': 'PropertyValue', name: 'Cylindrée réelle', value: engine.actual_displacement },
      { '@type': 'PropertyValue', name: 'Alésage × course', value: engine.bore_stroke },
      { '@type': 'PropertyValue', name: 'Puissance maximale', value: engine.power },
      { '@type': 'PropertyValue', name: 'Couple maximal', value: engine.torque },
      { '@type': 'PropertyValue', name: 'Taux de compression', value: engine.compression },
      { '@type': 'PropertyValue', name: 'Refroidissement', value: 'Refroidissement liquide (eau) avec ailettes' },
      { '@type': 'PropertyValue', name: 'Transmission', value: 'Boîte standard 5 vitesses avant (compatible avec boîte de marche arrière externe)' },
      { '@type': 'PropertyValue', name: 'Embrayage', value: 'Embrayage à 20 rouleaux (manuel multidisque à bain d\'huile)' },
      { '@type': 'PropertyValue', name: 'Capacité d\'huile', value: engine.oil_capacity },
      { '@type': 'PropertyValue', name: 'Carburateur', value: engine.carburetor },
      { '@type': 'PropertyValue', name: 'Dimensions & Poids', value: engine.dimensions_weight }
    ]
  };

  const faqs = [
    ['Quelle est la cylindrée réelle du HW300 ?', `Le HW300 (classe commerciale 300cc) possède une cylindrée réelle mesurée de ${engine.actual_displacement} (${engine.bore_stroke}), avec ${engine.power} et ${engine.torque}.`],
    ['Le HW300 possède-t-il une marche arrière intégrée ?', 'Non. Le HW300 est équipé en standard d\'une boîte à 5 vitesses avant à prise constante et fonctionne avec une boîte de marche arrière externe montée sur le châssis du tricycle cargo.'],
    ['Quelle est la compatibilité de pièces entre HW250 et HW300 ?', 'Environ 80 % des composants principaux (demi-carters, embrayage à 20 rouleaux, arbres de boîte 5 vitesses, pompe à eau, magnéto CC à haut rendement) sont communs entre HW250 et HW300 ; seuls le cylindre, le piston et le vilebrequin diffèrent selon la cylindrée.'],
    ['Fournissez-vous des kits de réfection moteur refroidi par eau dans le même conteneur ?', 'Oui. Vous pouvez commander le moteur complet HW300 et tout kit de réfection moteur refroidi par eau (kit cylindre-piston, culasse, joints, pompe à eau, embrayage) en commande mixte de plusieurs modèles dès 50 unités.'],
    ['Quelles sont les conditions export vers Abidjan, Douala, Cotonou ou Dakar ?', 'Expédition FOB Guangzhou, Chine (~10 jours ouvrables, garantie 60 jours après arrivée au port). Facture, colisage et numéros de série moteur fournis ; BSC / BESC coordonné par l\'importateur et son transitaire.']
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  const extraHead = `  <style>
    .flagship-page section[id] { scroll-margin-top: 124px; }
    .flagship-anchor-bar { margin-top: var(--nav-height, 72px); position: sticky; top: var(--nav-height, 72px); z-index: 900; }
    @media (max-width: 900px) {
      .flagship-anchor-nav { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; scrollbar-width: none; gap: 1rem; }
      .flagship-anchor-nav::-webkit-scrollbar { display: none; }
      .flagship-anchor-nav a { flex-shrink: 0; }
    }
    @media (max-width: 768px) {
      .flagship-anchor-bar { margin-top: var(--nav-height, 64px); top: var(--nav-height, 64px); }
      .flagship-page .features-grid { grid-template-columns: 1fr; }
    }
  </style>`;

  const primaryImg = engine.gallery_images[0];
  const thumbsHtml = engine.gallery_images.map((img, idx) => {
    const thumbAlt = imgSeo.getAlt(img.src, 'fr', `Moteur tricycle HW300 refroidi par eau vue ${idx + 1}`);
    const thumbCaption = imgSeo.getCaption(img.src, 'fr', `HW300 classe 300cc (${engine.actual_displacement}) — vue ${idx + 1}`);
    return `
            <button type="button" class="flagship-thumb" data-flagship-thumb data-src="/${escapeHtml(imgSeo.resolveFile(img.src))}" data-alt="${escapeHtml(thumbAlt)}" data-caption="${escapeHtml(thumbCaption)}" aria-pressed="${idx === 0 ? 'true' : 'false'}" aria-label="Voir photo ${idx + 1}">
              <img src="/${escapeHtml(imgSeo.resolveFile(img.src))}" alt="${escapeHtml(thumbAlt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="160" height="120" decoding="async">
            </button>`;
  }).join('');

  const specRows = [
    ['Modèle moteur', `${engine.model} (Série HW Water)`],
    ['Classe nominale', 'Classe 300cc'],
    ['Cylindrée réelle', `${engine.actual_displacement} (${engine.bore_stroke})`],
    ['Puissance maximale', engine.power],
    ['Couple maximal', engine.torque],
    ['Taux de compression', engine.compression],
    ['Refroidissement', 'Refroidissement liquide (eau) avec ailettes de cylindre'],
    ['Boîte de vitesses', '5 vitesses avant à prise constante (compatible boîte de marche arrière externe)'],
    ['Démarrage', 'Démarrage électrique / au kick'],
    ['Embrayage', 'Embrayage à 20 rouleaux + manuel multidisque à bain d\'huile'],
    ['Allumage & Magnéto', 'CDI · Magnéto CC à haut rendement'],
    ['Capacité d\'huile', engine.oil_capacity],
    ['Carburateur', engine.carburetor],
    ['Dimensions & Poids', engine.dimensions_weight]
  ];

  const comparisonRows = (engine.comparison_models || []).map(row => {
    const modelCell = row.current ? `<strong>${escapeHtml(row.model.replace('(This Page)', '(Cette page)'))}</strong>` : `<a href="/fr/cg-engine#hw-water-specifications">${escapeHtml(row.model)}</a>`;
    return `<tr><th scope="row">${modelCell}</th><td>${escapeHtml(row.nominal)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.bore_stroke)}</td><td>${escapeHtml(row.power)}</td><td>${escapeHtml(row.torque)}</td><td>${escapeHtml(row.weight)}</td><td>${escapeHtml(row.dimensions)}</td></tr>`;
  }).join('\n            ');

  const bundleHtml = bundleSlice.map((part, idx) => `
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeHtml(part.name)}" data-part-pn="${escapeHtml(part.pn)}" data-part-oem="${escapeHtml(part.oem)}" ${idx < 2 ? 'checked' : ''}>
              <span><strong>${escapeHtml(part.name)}</strong>${part.pn ? `<br><span style="font-size:0.84rem;color:var(--text-secondary);">Réf. : ${escapeHtml(part.pn)}${part.spec ? ` · ${escapeHtml(part.spec)}` : ''}</span>` : ''}</span>
            </label>`).join('');

  return `${renderHead({
    title: 'Moteur tricycle cargo HW300 à eau (275,3 mL) en gros | CHIXIANG',
    description: `Moteur complet HW300 classe 300cc (cylindrée réelle ${engine.actual_displacement}, ${engine.bore_stroke}) à refroidissement liquide (eau) pour tricycle cargo : ${engine.power}, ${engine.torque}, 1,5 L d'huile, embrayage 20 rouleaux. MOQ 50, FOB Guangzhou.`,
    frPath: '/fr/cg-engine/hw300-water-cooled-engine',
    enPath: '/en/cg-engine/hw300-water-cooled-engine',
    ogImage: `${ORIGIN}/${primaryImg.src}`,
    extraHead,
    schemas: [productSchema, faqSchema]
  })}
<body class="flagship-page">
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/cg-engine/hw300-water-cooled-engine', quoteHref, langLinks })}

  <div class="flagship-anchor-bar">
    <div class="container">
      <nav class="flagship-anchor-nav" aria-label="Navigation fiche produit">
        <a href="#overview">Aperçu</a>
        <a href="#specifications">Fiche technique</a>
        <a href="#comparison">Gamme HW200–350</a>
        <a href="#bundle-quote">Devis moteur + kit de réfection</a>
        <a href="#export-afrique">Export &amp; BSC / BESC</a>
        <a href="#faq">FAQ</a>
      </nav>
    </div>
  </div>

  <main>
    <section class="section" id="overview" style="padding-top:1.75rem;">
      <div class="container">
        <div class="flagship-hero-grid">
          <div class="flagship-gallery">
            <figure class="flagship-gallery-main" style="margin:0;">
              <img id="flagshipMainImg" src="/${escapeHtml(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeHtml(imgSeo.getAlt(primaryImg.src, 'fr', 'Moteur complet HW300 refroidi par eau pour tricycle cargo'))}" width="1200" height="1200" loading="eager" fetchpriority="high" decoding="async">
              <figcaption class="flagship-gallery-caption" id="flagshipMainCaption">${escapeHtml(imgSeo.getCaption(primaryImg.src, 'fr', `HW300 (classe 300cc · ${engine.actual_displacement} réels) — Refroidissement liquide (eau)`))}</figcaption>
            </figure>
            <div class="flagship-thumbs" role="group" aria-label="Vignettes moteur HW300">${thumbsHtml}
            </div>
          </div>

          <div class="flagship-summary">
            <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary-color);margin:0 0 0.4rem;">Série lourde HW Water · SKU ${escapeHtml(engine.sku)}</p>
            <h1 style="margin-top:0;">Moteur complet HW300 (classe 300cc, 275,3 mL) refroidi par eau pour tricycle cargo</h1>

            <div class="flagship-verdict">
              <p class="flagship-verdict__label">Synthèse d'ingénierie — Tricycle 250/300cc à eau</p>
              <p style="margin:0;color:var(--text-primary);line-height:1.65;">Le CHIXIANG HW300 (classe commerciale 300cc) développe une cylindrée réelle de <strong>${escapeHtml(engine.actual_displacement)}</strong> (${escapeHtml(engine.bore_stroke)}) pour <strong>${escapeHtml(engine.power)}</strong> et <strong>${escapeHtml(engine.torque)}</strong> dans un ensemble de 39 kg (425 × 385 × 530 mm). Doté d'un carter de 1,5 L, d'un embrayage à 20 rouleaux, d'une magnéto CC à haut rendement et d'une boîte 5 vitesses avant compatible avec boîte de marche arrière externe, il partage ~80 % de ses pièces avec le HW250.</p>
            </div>

            <dl class="flagship-spec-grid">
              <div class="flagship-spec-card"><dt>Cylindrée réelle</dt><dd>${escapeHtml(engine.actual_displacement)} (Classe 300cc)</dd></div>
              <div class="flagship-spec-card"><dt>Alésage × course</dt><dd>${escapeHtml(engine.bore_stroke)}</dd></div>
              <div class="flagship-spec-card"><dt>Puissance max.</dt><dd>${escapeHtml(engine.power)}</dd></div>
              <div class="flagship-spec-card"><dt>Couple max.</dt><dd>${escapeHtml(engine.torque)}</dd></div>
              <div class="flagship-spec-card"><dt>Refroidissement &amp; Embrayage</dt><dd>Refroidissement liquide (eau) · 20 rouleaux</dd></div>
              <div class="flagship-spec-card"><dt>Dimensions &amp; Poids</dt><dd>${escapeHtml(engine.dimensions_weight)}</dd></div>
            </dl>

            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="${escapeHtml(quoteHref)}" class="btn btn-accent">Demander un devis gros</a>
              <a href="${escapeHtml(waHref(waModel))}" class="btn btn-whatsapp" target="_blank" rel="noopener">WhatsApp HW300</a>
            </div>
            <p class="flagship-moq-note"><strong>Conditions B2B :</strong> MOQ 50 moteurs (commande mixte de plusieurs modèles + kit de réfection moteur refroidi par eau dans un même conteneur) · Délai ~10 jours ouvrables · FOB Guangzhou, Chine.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="specifications" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Fiche technique vérifiée HW300</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Paramètre</th><th>Spécification vérifiée</th></tr></thead>
            <tbody>
            ${specRows.map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('\n            ')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" id="comparison">
      <div class="container">
        <h2 class="section-title">Comparaison gamme HW Water (200–350 cc)</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Modèle</th><th>Classe</th><th>Cylindrée réelle</th><th>Alésage × course</th><th>Puissance max.</th><th>Couple max.</th><th>Poids</th><th>Dimensions</th></tr></thead>
            <tbody>
            ${comparisonRows}
            </tbody>
          </table>
        </div>
        <p style="margin-top:1rem;">
          <a href="/fr/cg-engine#hw-water-specifications" class="btn btn-primary btn-sm">Voir toute la gamme CG &amp; Tricycle &rarr;</a>
          <a href="/en/engine-parts/hw-series" class="btn btn-outline btn-sm" style="margin-left:0.5rem;">Catalogue pièces HW200–HW350 (EN) &rarr;</a>
        </p>
      </div>
    </section>

    <section class="section" id="bundle-quote" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Devis combiné : Moteur HW300 + Kit de réfection moteur refroidi par eau</h2>
        <p class="section-subtitle">Cochez le moteur complet et les kits d'entretien HW250/HW300 souhaités pour pré-remplir votre demande en conteneur mixte sur /fr/contact.</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-contact-path="/fr/contact" data-model="HW300" data-engine-code="HW300 (275.3 mL)" data-vehicle="Tricycle cargo HW300 (classe 300cc, 275,3 mL) à eau" data-engine-sku="${escapeHtml(engine.sku)}" data-product-interest="cg">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">Quantité estimée (moteurs + kits)</label>
              <input type="text" id="flagshipBundleQty" placeholder="Ex. 50 moteurs + 20 kits de réfection" value="50 moteurs">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">Pays &amp; port de destination</label>
              <input type="text" id="flagshipBundleCountry" placeholder="Ex. Côte d'Ivoire (Abidjan), Cameroun (Douala), Bénin (Cotonou), Sénégal (Dakar)">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="Moteur complet HW300 refroidi par eau (275.3 mL)" data-part-pn="${escapeHtml(engine.sku)}" data-part-oem="Classe 300cc" checked>
              <span><strong>Moteur complet HW300 (275,3 mL · Refroidissement liquide (eau))</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">SKU : ${escapeHtml(engine.sku)} · ${escapeHtml(engine.bore_stroke)}</span></span>
            </label>
            ${bundleHtml}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">Continuer vers le formulaire pré-rempli &rarr;</button>
          </div>
        </form>
      </div>
    </section>

${renderAfricaExportSection(waModel)}

    <section class="section" id="faq" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">FAQ technique &amp; export HW300</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${faqs.map(([q, a]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('')}
        </div>
      </div>
    </section>
  </main>

  <div class="flagship-lightbox" id="flagshipLightbox" aria-hidden="true" role="dialog" aria-label="Zoom photo moteur">
    <button type="button" class="flagship-lightbox-close" id="flagshipLightboxClose" aria-label="Fermer">&times;</button>
    <img id="flagshipLightboxImg" src="/${escapeHtml(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeHtml(imgSeo.getAlt(primaryImg.src, 'fr', 'Moteur complet HW300 refroidi par eau pour tricycle cargo'))}" width="1200" height="1200" loading="lazy" decoding="async">
  </div>
${renderFooter({ waModel, quoteHref, extraScripts: ['/js/flagship-engine-page.js'] })}
`;
}

function renderFrCg200(enginesData) {
  const engine = (enginesData.engines || []).find(e => e.slug === 'cg200-air-cooled-engine');
  if (!engine) throw new Error('cg200-air-cooled-engine missing from data/flagship-engines.json');
  const waModel = 'CG200 refroidi par air';
  const frUrl = `${ORIGIN}/fr/cg-engine/cg200-air-cooled-engine`;
  const quoteHref = `/fr/contact?product_interest=cg&source_form=flagship-engine-page&source_cta=hero-quote&engine_code=${encodeURIComponent(engine.model)}&vehicle=${encodeURIComponent('Moteur complet CG200 (CX163FML · 197,0 cc) refroidi par air')}&btv_pn=${encodeURIComponent(engine.sku)}`;

  const langLinks = [
    ['/fr/cg-engine/cg200-air-cooled-engine', 'Français', true],
    ['/en/cg-engine/cg200-air-cooled-engine', 'English', false]
  ];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${frUrl}#product`,
    name: 'Moteur complet CG200 (CX163FML, 197,0 cc) refroidi par air',
    sku: engine.sku,
    model: engine.model,
    category: 'Moteurs CG à tiges de culbuteurs refroidis par air',
    description: `Moteur complet CG200 (CX163FML) à cylindrée réelle ${engine.actual_displacement} (${engine.bore_stroke}), ${engine.power}, ${engine.torque}, poids net ${engine.weight}. Commande mixte dès 50 unités, FOB Guangzhou.`,
    image: engine.gallery_images.map((img, idx) => imgSeo.imageObjectNode(img.src, 'fr', { representativeOfPage: idx === 0 })),
    url: frUrl,
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Classe nominale', value: '200cc' },
      { '@type': 'PropertyValue', name: 'Cylindrée réelle', value: engine.actual_displacement },
      { '@type': 'PropertyValue', name: 'Alésage × course', value: engine.bore_stroke },
      { '@type': 'PropertyValue', name: 'Puissance maximale', value: engine.power },
      { '@type': 'PropertyValue', name: 'Couple maximal', value: engine.torque },
      { '@type': 'PropertyValue', name: 'Taux de compression', value: engine.compression },
      { '@type': 'PropertyValue', name: 'Refroidissement', value: 'Refroidissement par air' },
      { '@type': 'PropertyValue', name: 'Transmission', value: '5 vitesses à prise constante' },
      { '@type': 'PropertyValue', name: 'Démarrage', value: 'Démarrage électrique / au kick' },
      { '@type': 'PropertyValue', name: 'Dimensions & Poids', value: engine.dimensions_weight }
    ]
  };

  const faqs = [
    ['Quelles sont les caractéristiques exactes du moteur complet CG200 (CX163FML) ?', `Le CG200 (CX163FML) affiche une cylindrée réelle de ${engine.actual_displacement} (${engine.bore_stroke}), ${engine.power}, ${engine.torque}, un taux de compression ${engine.compression} et un poids net de ${engine.weight} (${engine.dimensions}).`],
    ['Le CG200 est-il disponible avec arbre d\'équilibrage ?', 'Oui. La version standard utilise une architecture CG200 classique, et une configuration avec arbre d\'équilibrage est disponible sur commande pour réduire les vibrations sur moto utilitaire.'],
    ['Quelle différence entre le CG200 refroidi par air et le CG200SB refroidi par eau ?', 'Les deux partagent l\'alésage × course 63,5 × 62,2 mm (197 cc), mais le CG200 est à refroidissement par air (31,3 kg, 380 × 355 × 500 mm) pour moto commerciale, tandis que le CG200SB adopte le refroidissement liquide (eau) pour tricycle cargo lourd.'],
    ['Peut-on combiner le CG200 avec des moteurs CG150, HW300 et des pièces détachées ?', 'Oui. La commande mixte de plusieurs modèles dès 50 moteurs permet de regrouper moteurs complets et pièces détachées dans un même conteneur FOB Guangzhou.'],
    ['Comment vérifier la compatibilité électrique et le pignon de sortie ?', 'Confirmez la fiche du stator (CA ou CC), le pas de chaîne/nombre de dents du pignon de sortie et le sens de sélection (international 5 vitesses ou rotatif) avant validation de la proforma.']
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  const extraHead = `  <style>
    .flagship-page section[id] { scroll-margin-top: 124px; }
    .flagship-anchor-bar { margin-top: var(--nav-height, 72px); position: sticky; top: var(--nav-height, 72px); z-index: 900; }
    @media (max-width: 900px) {
      .flagship-anchor-nav { display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; scrollbar-width: none; gap: 1rem; }
      .flagship-anchor-nav::-webkit-scrollbar { display: none; }
      .flagship-anchor-nav a { flex-shrink: 0; }
    }
    @media (max-width: 768px) {
      .flagship-anchor-bar { margin-top: var(--nav-height, 64px); top: var(--nav-height, 64px); }
      .flagship-page .features-grid { grid-template-columns: 1fr; }
    }
  </style>`;

  const primaryImg = engine.gallery_images[0];
  const thumbsHtml = engine.gallery_images.map((img, idx) => {
    const thumbAlt = imgSeo.getAlt(img.src, 'fr', `Moteur complet CG200 refroidi par air vue ${idx + 1}`);
    const thumbCaption = imgSeo.getCaption(img.src, 'fr', `CG200 (${engine.alias}) — vue ${idx + 1}`);
    return `
            <button type="button" class="flagship-thumb" data-flagship-thumb data-src="/${escapeHtml(imgSeo.resolveFile(img.src))}" data-alt="${escapeHtml(thumbAlt)}" data-caption="${escapeHtml(thumbCaption)}" aria-pressed="${idx === 0 ? 'true' : 'false'}" aria-label="Voir photo ${idx + 1}">
              <img src="/${escapeHtml(imgSeo.resolveFile(img.src))}" alt="${escapeHtml(thumbAlt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="160" height="120" decoding="async">
            </button>`;
  }).join('');

  const specRows = [
    ['Modèle moteur', `${engine.model} (${engine.alias})`],
    ['Architecture', 'Moteur CG à tiges de culbuteurs, monocylindre 4 temps'],
    ['Classe nominale', '200cc'],
    ['Cylindrée réelle', engine.actual_displacement],
    ['Alésage × course', engine.bore_stroke],
    ['Puissance maximale', engine.power],
    ['Couple maximal', engine.torque],
    ['Taux de compression', engine.compression],
    ['Refroidissement', 'Refroidissement par air'],
    ['Boîte de vitesses', '5 vitesses à prise constante'],
    ['Démarrage', 'Démarrage électrique / au kick'],
    ['Embrayage', 'Manuel multidisque à bain d\'huile'],
    ['Allumage', engine.ignition],
    ['Dimensions & Poids', engine.dimensions_weight]
  ];

  const comparisonRows = (engine.comparison_models || []).map(row => {
    const modelCell = row.current ? `<strong>${escapeHtml(row.model.replace('(This Page)', '(Cette page)'))}</strong>` : `<a href="/fr/cg-engine#cg-air-cooled">${escapeHtml(row.model)}</a>`;
    return `<tr><th scope="row">${modelCell}</th><td>${escapeHtml(row.nominal)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.bore_stroke)}</td><td>${escapeHtml(row.power)}</td><td>${escapeHtml(row.torque)}</td><td>${escapeHtml(row.weight)}</td><td>${escapeHtml(row.dimensions)}</td></tr>`;
  }).join('\n            ');

  const bundleHtml = (engine.bundled_kits || []).map((kit, idx) => `
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeHtml(kit.name)}" data-part-pn="${escapeHtml(kit.pn)}" data-part-oem="${escapeHtml(kit.fitment)}" ${idx < 2 ? 'checked' : ''}>
              <span><strong>${escapeHtml(kit.name)}</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">Réf. : ${escapeHtml(kit.pn)} · ${escapeHtml(kit.spec)}</span></span>
            </label>`).join('');

  return `${renderHead({
    title: 'Moteur complet CG200 (CX163FML · 197,0 cc) refroidi par air | CHIXIANG',
    description: `Moteur complet CG200 (CX163FML) 197,0 cc refroidi par air : 63,5 × 62,2 mm, ${engine.power}, ${engine.torque}, 31,3 kg. Option arbre d'équilibrage, démarrage électrique / au kick, MOQ 50 FOB Guangzhou.`,
    frPath: '/fr/cg-engine/cg200-air-cooled-engine',
    enPath: '/en/cg-engine/cg200-air-cooled-engine',
    ogImage: `${ORIGIN}/${primaryImg.src}`,
    extraHead,
    schemas: [productSchema, faqSchema]
  })}
<body class="flagship-page">
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/cg-engine/cg200-air-cooled-engine', quoteHref, langLinks })}

  <div class="flagship-anchor-bar">
    <div class="container">
      <nav class="flagship-anchor-nav" aria-label="Navigation fiche produit">
        <a href="#overview">Aperçu</a>
        <a href="#specifications">Fiche technique</a>
        <a href="#comparison">Gamme CG125–250</a>
        <a href="#bundle-quote">Devis moteur + pièces</a>
        <a href="#export-afrique">Export &amp; BSC / BESC</a>
        <a href="#faq">FAQ</a>
      </nav>
    </div>
  </div>

  <main>
    <section class="section" id="overview" style="padding-top:1.75rem;">
      <div class="container">
        <div class="flagship-hero-grid">
          <div class="flagship-gallery">
            <figure class="flagship-gallery-main" style="margin:0;">
              <img id="flagshipMainImg" src="/${escapeHtml(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeHtml(imgSeo.getAlt(primaryImg.src, 'fr', 'Moteur complet CG200 refroidi par air CHIXIANG MOTOR'))}" width="1200" height="1200" loading="eager" fetchpriority="high" decoding="async">
              <figcaption class="flagship-gallery-caption" id="flagshipMainCaption">${escapeHtml(imgSeo.getCaption(primaryImg.src, 'fr', `CG200 (${engine.alias}) — Moteur CG à tiges de culbuteurs refroidi par air`))}</figcaption>
            </figure>
            <div class="flagship-thumbs" role="group" aria-label="Vignettes moteur CG200">${thumbsHtml}
            </div>
          </div>

          <div class="flagship-summary">
            <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary-color);margin:0 0 0.4rem;">Série CG Refroidie par Air · SKU ${escapeHtml(engine.sku)}</p>
            <h1 style="margin-top:0;">Moteur complet CG200 (CX163FML, 197,0 cc) refroidi par air</h1>

            <div class="flagship-verdict">
              <p class="flagship-verdict__label">Synthèse d'ingénierie — Moteur CG à tiges de culbuteurs</p>
              <p style="margin:0;color:var(--text-primary);line-height:1.65;">Le moteur complet CG200 (CX163FML) développe <strong>${escapeHtml(engine.actual_displacement)}</strong> (${escapeHtml(engine.bore_stroke)}) pour <strong>${escapeHtml(engine.power)}</strong> et <strong>${escapeHtml(engine.torque)}</strong> dans un carter compact de ${escapeHtml(engine.weight)} (${escapeHtml(engine.dimensions)}). Doté d'un démarrage électrique / au kick et disponible avec arbre d'équilibrage sur demande, il équipe motos commerciales, moto-taxis et tricycles légers.</p>
            </div>

            <dl class="flagship-spec-grid">
              <div class="flagship-spec-card"><dt>Cylindrée réelle</dt><dd>${escapeHtml(engine.actual_displacement)} (Classe 200cc)</dd></div>
              <div class="flagship-spec-card"><dt>Alésage × course</dt><dd>${escapeHtml(engine.bore_stroke)}</dd></div>
              <div class="flagship-spec-card"><dt>Puissance max.</dt><dd>${escapeHtml(engine.power)}</dd></div>
              <div class="flagship-spec-card"><dt>Couple max.</dt><dd>${escapeHtml(engine.torque)}</dd></div>
              <div class="flagship-spec-card"><dt>Refroidissement &amp; Embrayage</dt><dd>Refroidissement par air · Manuel multidisque</dd></div>
              <div class="flagship-spec-card"><dt>Dimensions &amp; Poids</dt><dd>${escapeHtml(engine.dimensions_weight)}</dd></div>
            </dl>

            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="${escapeHtml(quoteHref)}" class="btn btn-accent">Demander un devis gros</a>
              <a href="${escapeHtml(waHref(waModel))}" class="btn btn-whatsapp" target="_blank" rel="noopener">WhatsApp CG200</a>
            </div>
            <p class="flagship-moq-note"><strong>Conditions B2B :</strong> MOQ 50 moteurs (commande mixte de plusieurs modèles + pièces détachées dans un même conteneur) · Délai ~10 jours ouvrables · FOB Guangzhou, Chine.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="specifications" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Fiche technique vérifiée CG200</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Paramètre</th><th>Spécification vérifiée</th></tr></thead>
            <tbody>
            ${specRows.map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('\n            ')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" id="comparison">
      <div class="container">
        <h2 class="section-title">Comparaison gamme CG refroidie par air (150–250 cc)</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Modèle</th><th>Classe</th><th>Cylindrée réelle</th><th>Alésage × course</th><th>Puissance max.</th><th>Couple max.</th><th>Poids</th><th>Dimensions</th></tr></thead>
            <tbody>
            ${comparisonRows}
            </tbody>
          </table>
        </div>
        <p style="margin-top:1rem;"><a href="/fr/cg-engine" class="btn btn-primary btn-sm">Voir toute la matrice CG125–CG250 &amp; HW &rarr;</a></p>
      </div>
    </section>

    <section class="section" id="bundle-quote" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Devis combiné : Moteur complet CG200 + Pièces de rechange</h2>
        <p class="section-subtitle">Sélectionnez le moteur complet CG200 et ses kits d'entretien pour pré-remplir votre demande en conteneur mixte sur /fr/contact.</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-contact-path="/fr/contact" data-model="CG200" data-engine-code="CG200 (CX163FML)" data-vehicle="Moteur complet CG200 (CX163FML · 197,0 cc) refroidi par air" data-engine-sku="${escapeHtml(engine.sku)}" data-product-interest="cg">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">Quantité estimée (moteurs + kits)</label>
              <input type="text" id="flagshipBundleQty" placeholder="Ex. 50 moteurs CG200 + 30 kits joints" value="50 moteurs">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">Pays &amp; port de destination</label>
              <input type="text" id="flagshipBundleCountry" placeholder="Ex. Côte d'Ivoire (Abidjan), Cameroun (Douala), Bénin (Cotonou), Sénégal (Dakar)">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="Moteur complet CG200 (CX163FML · 197.0 cc)" data-part-pn="${escapeHtml(engine.sku)}" data-part-oem="CX163FML" checked>
              <span><strong>Moteur complet CG200 (197,0 cc · Refroidissement par air)</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">SKU : ${escapeHtml(engine.sku)} · ${escapeHtml(engine.bore_stroke)}</span></span>
            </label>
            ${bundleHtml}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">Continuer vers le formulaire pré-rempli &rarr;</button>
          </div>
        </form>
      </div>
    </section>

${renderAfricaExportSection(waModel)}

    <section class="section" id="faq" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">FAQ technique &amp; export CG200</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${faqs.map(([q, a]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('')}
        </div>
      </div>
    </section>
  </main>

  <div class="flagship-lightbox" id="flagshipLightbox" aria-hidden="true" role="dialog" aria-label="Zoom photo moteur">
    <button type="button" class="flagship-lightbox-close" id="flagshipLightboxClose" aria-label="Fermer">&times;</button>
    <img id="flagshipLightboxImg" src="/${escapeHtml(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeHtml(imgSeo.getAlt(primaryImg.src, 'fr', 'Moteur complet HW300 refroidi par eau pour tricycle cargo'))}" width="1200" height="1200" loading="lazy" decoding="async">
  </div>
${renderFooter({ waModel, quoteHref, extraScripts: ['/js/flagship-engine-page.js'] })}
`;
}

function renderFrBm150(catalog) {
  const product = (catalog.products || []).find(p => p && p.id === 'bajaj-boxer-bm150-complete-engine');
  if (!product) throw new Error('bajaj-boxer-bm150-complete-engine missing from data/bajaj-tvs-catalog.json');
  const waModel = 'Bajaj Boxer BM150 (144,8 cc)';
  const frUrl = `${ORIGIN}/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine`;
  const quoteHref = `/fr/contact?product_interest=parts&source_form=bajaj-tvs-catalog&source_cta=detail-page&btv_part=${encodeURIComponent(product.id)}&btv_pn=${encodeURIComponent(product.part_number)}&btv_brand=bajaj&engine_code=${encodeURIComponent('BM150 / 36PF Platform')}`;

  const langLinks = [
    ['/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', 'Français', true],
    ['/en/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', 'English', false],
    ['/zh-cn/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', '简体中文', false]
  ];

  const specRows = [
    ['Référence Chixiang', product.part_number],
    ['Références OEM (à titre d\'identification)', (product.oem_part_numbers || []).join(', ')],
    ['Statut du produit', 'Moteur de remplacement adaptable (aftermarket)'],
    ['Code moteur / plateforme', (product.engine_codes || []).join(', ')],
    ['Application compatible', 'Bajaj Boxer BM150 (4 vitesses / 5 vitesses, démarrage électrique / au kick, simple ou double bougie)'],
    ['Architecture', 'Monocylindre 4 temps, refroidissement par air, SOHC 2 soupapes'],
    ['Cylindrée de référence OEM', product.specs.displacement.value],
    ['Alésage × course', product.specs.bore_stroke.value],
    ['Taux de compression', product.specs.compression_ratio.value],
    ['Boîte de vitesses', '4 vitesses ou 5 vitesses à prise constante (à confirmer sur commande)'],
    ['Démarrage', 'Démarrage électrique / au kick']
  ];

  const frCrossRows = [
    ['Moteur complet de remplacement adaptable', 'CX-BJ-BM150-ENG', '144,8 cc SOHC · 56,0 × 58,8 mm · 4/5 vitesses · Électrique & Kick', '36PF0004 / 36PF0005 (réf.)'],
    ['Demi-carter moteur gauche (LH)', 'CX-BJ-BM150-LH', 'Aluminium ADC12 moulé sous pression · Alésages CNC', '36PF0004'],
    ['Demi-carter moteur droit (RH)', 'CX-BJ-BM150-RH', 'Aluminium ADC12 moulé sous pression · Plans de joint CNC', '36PF0005'],
    ['Couvercle d\'embrayage (carter droit)', 'CX-BJ-BM150-CC', 'Aluminium usiné (réf. joint : JA541212)', '36PF0008'],
    ['Kit cylindre-piston (56,0 mm)', 'CX-BJ-BM150-CY', 'Chemise résistante + piston 56,0 mm, segments & axe', '36PF0002'],
    ['Disques d\'embrayage & pignons de boîte', 'CX-BJ-BM150-TR', 'Pignons 20CrMnTi traités + disques friction (réf. joint : JA541212)', '36PF0009 (disques) / Équivalent OEM (pignons)']
  ];

  const bundleItems = [
    { pn: 'CX-BJ-BM150-LH', oem: '36PF0004', name: 'Demi-carter moteur gauche (LH)', spec: 'Aluminium ADC12 · Alésages CNC' },
    { pn: 'CX-BJ-BM150-RH', oem: '36PF0005', name: 'Demi-carter moteur droit (RH)', spec: 'Aluminium ADC12 · Plans de joint CNC' },
    { pn: 'CX-BJ-BM150-CC', oem: '36PF0008', name: 'Couvercle d\'embrayage (carter droit)', spec: 'Usiné CNC · Réf. joint JA541212' },
    { pn: 'CX-BJ-BM150-CY', oem: '36PF0002', name: 'Kit cylindre-piston (56,0 mm)', spec: '144,8 cc · Chemise + piston & segments' },
    { pn: 'CX-BJ-BM150-TR', oem: '36PF0009 (disques)', name: 'Disques d\'embrayage & pignons de boîte', spec: 'Pignons 20CrMnTi + disques friction' }
  ];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${frUrl}#product`,
    name: 'Moteur complet adaptable pour Bajaj Boxer BM150 (144,8 cc)',
    description: 'Moteur complet de remplacement adaptable pour Bajaj Boxer BM150 (144,8 cc, 56,0 × 58,8 mm), référence CX-BJ-BM150-ENG, avec demi-carters moteur gauche et droit, culasse complète, kit cylindre-piston, ensemble vilebrequin et bielle et pochette complète de joints moteur.',
    url: frUrl,
    brand: { '@id': ORG_ID },
    manufacturer: { '@id': ORG_ID },
    sku: product.part_number,
    mpn: product.part_number,
    additionalProperty: specRows.map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: String(v) }))
  };

  const faqs = [
    ['Le moteur CX-BJ-BM150-ENG est-il une pièce constructeur Bajaj ou un moteur adaptable ?', 'Il s\'agit d\'un moteur complet de remplacement adaptable fabriqué par CHIXIANG MOTOR aux cotes 144,8 cc (56,0 × 58,8 mm). La marque Bajaj® et les numéros OEM (36PF0004, 36PF0005, 36PF0008, 36PF0002, 36PF0009, JA541212) sont cités uniquement à titre d\'identification mécanique.'],
    ['Comment choisir entre la version 4 vitesses et 5 vitesses du BM150 ?', 'Vérifiez le sélecteur de boîte et le préfixe moteur de votre parc (références 36PF / JA), puis précisez 4 ou 5 vitesses ainsi que simple ou double bougie avant confirmation de la proforma.'],
    ['Fournissez-vous les pièces détachées de réfection BM150 en plus du moteur complet ?', 'Oui : demi-carters moteur gauche et droit (CX-BJ-BM150-LH / RH), kit cylindre-piston (CX-BJ-BM150-CY), culasse complète, ensemble vilebrequin et bielle, couvercle d\'embrayage (CX-BJ-BM150-CC) et pochette complète de joints moteur.'],
    ['Peut-on mixer les moteurs BM150 avec des moteurs CG150/CG200 et HW300 ?', 'Oui. Dès 50 unités en commande mixte de plusieurs modèles, moteurs complets et pièces détachées partent dans un même conteneur FOB Guangzhou vers Abidjan, Douala, Cotonou ou Dakar.']
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  return `${renderHead({
    title: 'Moteur complet adaptable Bajaj Boxer BM150 (144,8 cc) | CHIXIANG',
    description: 'Moteur complet de remplacement adaptable Bajaj Boxer BM150 (144,8 cc, 56,0 × 58,8 mm) et pièces détachées (demi-carters moteur gauche et droit, culasse complète, kit cylindre-piston, vilebrequin, pochette de joints). Références OEM à titre d\'identification.',
    frPath: '/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine',
    enPath: '/en/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine',
    ogImage: `${ORIGIN}/images/parts/chixiang-motorcycle-tricycle-engine-spare-parts-overview.webp`,
    schemas: [productSchema, faqSchema]
  })}
<body class="btv-page">
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/bajaj-tvs-engines-parts', quoteHref, langLinks })}

  <main>
    <section class="page-header">
      <div class="container">
        <h1>Moteur complet adaptable pour Bajaj Boxer BM150 (144,8 cc)</h1>
        <p class="section-subtitle">Référence Chixiang : CX-BJ-BM150-ENG · Moteur de remplacement adaptable (56,0 × 58,8 mm) et pièces d'usure principales pour flottes commerciales. Références OEM (36PF0004, 36PF0005, 36PF0008, 36PF0002, 36PF0009, JA541212) fournies uniquement à titre d'identification.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="flagship-verdict" style="margin-top:0;">
          <p class="flagship-verdict__label">Synthèse technique · Pièce de rechange adaptable</p>
          <p style="margin:0;color:var(--text-primary);line-height:1.65;">Le moteur complet <strong>CX-BJ-BM150-ENG</strong> est un ensemble de remplacement adaptable fabriqué par CHIXIANG MOTOR selon l'architecture 144,8 cc (56,0 × 58,8 mm) SOHC, disponible en boîte 4 ou 5 vitesses avec démarrage électrique / au kick. Il s'intègre en commande mixte de plusieurs modèles dès 50 unités avec vos moteurs CG, horizontaux et pièces détachées (culasse complète, kit cylindre-piston, ensemble vilebrequin et bielle, demi-carters moteur gauche et droit, pochette complète de joints moteur).</p>
        </div>

        <h2 class="section-title" style="margin-top:2rem;">Spécifications techniques BM150 (Adaptable)</h2>
        <table class="spec-table" style="width:100%;border-collapse:collapse;margin-top:1rem;">
          <tbody>
          ${specRows.map(([k, v]) => `<tr><th style="text-align:left;padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);width:32%;">${escapeHtml(k)}</th><td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);">${escapeHtml(v)}</td></tr>`).join('\n          ')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="section" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Correspondance références Chixiang &amp; références OEM d'identification</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.25rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Composant</th><th>Réf. Chixiang</th><th>Spécification fournie</th><th>Réf. OEM (identification)</th></tr></thead>
            <tbody>
            ${frCrossRows.map(r => `<tr><th scope="row">${escapeHtml(r[0])}</th><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td><td>${escapeHtml(r[3])}</td></tr>`).join('\n            ')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" id="bundle-quote">
      <div class="container">
        <h2 class="section-title">Devis groupé : Moteur BM150 + Pièces de remplacement</h2>
        <p class="section-subtitle">Cochez le moteur complet adaptable BM150 et les pièces (demi-carters moteur gauche et droit, kit cylindre-piston, disques d'embrayage) pour pré-remplir votre demande sur /fr/contact.</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-contact-path="/fr/contact" data-model="Bajaj Boxer BM150" data-engine-code="BM150 SOHC (36PF / JA Ref.)" data-vehicle="Bajaj Boxer BM150 (144.8 cc)" data-engine-sku="${escapeHtml(product.part_number)}" data-product-interest="parts" data-source-form="bajaj-tvs-catalog" data-source-cta="bm150-bundle">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">Quantité estimée (moteurs + pièces)</label>
              <input type="text" id="flagshipBundleQty" placeholder="Ex. 50 moteurs + 50 paires de carters" value="50 unités">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">Pays &amp; port de destination</label>
              <input type="text" id="flagshipBundleCountry" placeholder="Ex. Côte d'Ivoire (Abidjan), Cameroun (Douala), Bénin (Cotonou), Sénégal (Dakar)">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="Moteur complet adaptable Bajaj Boxer BM150 (144.8 cc)" data-part-pn="${escapeHtml(product.part_number)}" data-part-oem="36PF0004 / 36PF0005 Ref." checked>
              <span><strong>Moteur complet adaptable BM150 (144,8 cc · 4/5 vitesses)</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">Réf. : ${escapeHtml(product.part_number)} · Réf. OEM : 36PF0004 / 36PF0005</span></span>
            </label>
            ${bundleItems.map((b, idx) => `<label class="flagship-bundle-item"><input type="checkbox" data-bundle-item data-part-name="${escapeHtml(b.name)}" data-part-pn="${escapeHtml(b.pn)}" data-part-oem="${escapeHtml(b.oem)}" ${idx < 2 ? 'checked' : ''}><span><strong>${escapeHtml(b.name)}</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">Réf. : ${escapeHtml(b.pn)} · Réf. OEM : ${escapeHtml(b.oem)}</span></span></label>`).join('\n            ')}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">Continuer vers le formulaire pré-rempli &rarr;</button>
          </div>
        </form>
        <p style="margin-top:1.25rem;">
          <a href="/fr/bajaj-tvs-engines-parts" class="btn btn-primary btn-sm">&larr; Retour au catalogue complet Bajaj &amp; TVS</a>
          <a href="/en/bajaj-tvs-replacement-engine-fitment-checklist" class="btn btn-outline btn-sm" style="margin-left:0.5rem;">Checklist d'interface Bajaj / TVS (EN)</a>
        </p>
      </div>
    </section>

${renderAfricaExportSection(waModel, 'var(--bg-surface,#f8fafc)')}

    <section class="section" id="faq">
      <div class="container">
        <h2 class="section-title">FAQ — Bajaj Boxer BM150 adaptable</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${faqs.map(([q, a]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('')}
        </div>
      </div>
    </section>
  </main>

${renderFooter({ waModel, quoteHref, extraScripts: ['/js/flagship-engine-page.js'] })}
`;
}

function renderFrContactShell() {
  const waModel = 'CG150 / CG200 / HW300 / BM150';
  const langLinks = [
    ['/fr/contact', 'Français', true],
    ['/en/contact', 'English', false],
    ['/es/contacto', 'Español', false],
    ['/pt/contato', 'Português', false],
    ['/ru/kontakty', 'Русский', false],
    ['/ar/contact', 'العربية', false],
    ['/zh-cn/contact', '简体中文', false]
  ];
  return `${renderHead({
    title: 'Demande de devis B2B moteurs moto & tricycles | CHIXIANG MOTOR',
    description: 'Envoyez une demande de devis B2B FOB Guangzhou pour moteurs CG, tricycles à eau HW300, moteurs horizontaux et moteurs/pièces adaptables Bajaj & TVS.',
    frPath: '/fr/contact',
    enPath: '/en/contact',
    ogImage: `${ORIGIN}/images/factory-showcase/chixiang-engine-hot-cold-bench-testing.webp`
  })}
<body>
  ${FR_MARKER}
${renderNav({ activeHref: '/fr/contact', quoteHref: '/fr/contact', langLinks })}
  <section class="page-header" data-contact-procurement-owner="fr">
    <div class="container"><h1>Demander un devis B2B (Export &amp; Vente en gros)</h1></div>
  </section>
${renderFooter({
  waModel,
  isContactPage: true,
  extraScripts: ['/js/btv-inquiry-prefill.js']
})}
`;
}

function syncSitemap(urlSet) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const want = new Set(urlSet);
  const seen = new Set();
  let removed = 0;

  let out = xml.replace(
    / {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/fr\/[^<]*)<\/loc>[\s\S]*?<\/url>\r?\n/g,
    (block, url) => {
      if (want.has(url)) {
        seen.add(url);
        return block;
      }
      removed += 1;
      return '';
    }
  );

  const today = new Date().toISOString().slice(0, 10);
  const added = [];
  for (const url of want) {
    if (seen.has(url)) continue;
    added.push(url);
    const prio = url === `${ORIGIN}/fr/` ? '0.9' : '0.8';
    out = out.replace(
      '</urlset>',
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${prio}</priority>\n  </url>\n</urlset>`
    );
    seen.add(url);
  }
  return { changed: removed > 0 || added.length > 0, next: out };
}

function preserveOwnerRegions(fileRel, renderedHtml) {
  const abs = path.join(root, fileRel);
  if (!fs.existsSync(abs)) return renderedHtml;
  const current = fs.readFileSync(abs, 'utf8');

  if (fileRel === 'fr/cg-engine.html' || fileRel === 'fr/horizontal-engine.html') {
    const ownerMatch = current.match(/<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/);
    if (ownerMatch) {
      renderedHtml = renderedHtml.replace(
        /<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/,
        () => ownerMatch[0]
      );
    }
    const faqMatch = current.match(/<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":\s*"FAQPage"[\s\S]*?<\/script>/);
    if (faqMatch) {
      renderedHtml = renderedHtml.replace(
        /<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":\s*"FAQPage"[\s\S]*?<\/script>/,
        () => faqMatch[0]
      );
    }
    const familySchema = current.match(/<script type="application\/ld\+json" data-product-family-schema>[\s\S]*?<\/script>/);
    if (familySchema) {
      renderedHtml = renderedHtml.replace(/<\/head>/i, `  ${familySchema[0]}\n</head>`);
    }
  }

  if (fileRel === 'fr/contact.html') {
    const contactMatch = current.match(/<!-- CONTACT PROCUREMENT OWNER START -->[\s\S]*?<!-- CONTACT PROCUREMENT OWNER END -->/);
    if (contactMatch) {
      renderedHtml = renderedHtml.replace(
        /<section class="page-header" data-contact-procurement-owner="fr">[\s\S]*?<\/section>\s*(?=<footer class="footer")/,
        () => `${contactMatch[0]}\n\n  `
      );
    }
  }

  const entityGraph = current.match(/<script type="application\/ld\+json" data-site-entity-graph>[\s\S]*?<\/script>/);
  if (entityGraph) {
    renderedHtml = renderedHtml.replace(/\s*<\/head>/i, `\n  ${entityGraph[0]}\n</head>`);
  }
  const visibleCrumb = current.match(/<nav\b[^>]*class=["'][^"']*\bentity-breadcrumb\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
  if (visibleCrumb && fileRel !== 'fr/index.html' && fileRel !== 'fr/contact.html') {
    if (/<section class="page-header">\s*<div class="container">\s*/.test(renderedHtml)) {
      renderedHtml = renderedHtml.replace(
        /(<section class="page-header">\s*<div class="container">)\s*/,
        `$1\n      ${visibleCrumb[0]}\n      `
      );
    } else if (/<main>/.test(renderedHtml)) {
      renderedHtml = renderedHtml.replace(/<main>/, `<main>\n    ${visibleCrumb[0]}`);
    }
  }

  return renderedHtml;
}

function main() {
  const facts = loadCompanyFacts();
  const enginesData = readJson('data/flagship-engines.json');
  const hwPartsData = readJson('data/hw-parts-catalog.json');
  const btvCatalog = readJson('data/bajaj-tvs-catalog.json');

  const targets = [
    ['fr/index.html', renderFrHome(facts)],
    ['fr/cg-engine.html', renderFrCgShell()],
    ['fr/horizontal-engine.html', renderFrHorizontalShell()],
    ['fr/bajaj-tvs-engines-parts.html', renderFrBtvHub(btvCatalog)],
    ['fr/cg-engine/hw300-water-cooled-engine.html', renderFrHw300(enginesData, hwPartsData)],
    ['fr/cg-engine/cg200-air-cooled-engine.html', renderFrCg200(enginesData)],
    ['fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine.html', renderFrBm150(btvCatalog)],
    ['fr/contact.html', renderFrContactShell()]
  ];

  const changed = [];
  for (const [rel, rawHtml] of targets) {
    const abs = path.join(root, rel);
    const html = preserveOwnerRegions(rel, rawHtml).replace(/\r?\n/g, '\r\n');
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (current !== html) {
      changed.push(rel);
      if (!checkOnly) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, html, 'utf8');
      }
    }
  }

  const sitemap = syncSitemap(FR_PAGES);
  if (sitemap.changed) {
    changed.push('sitemap.xml');
    if (!checkOnly) {
      fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.next, 'utf8');
    }
  }

  if (checkOnly && changed.length) {
    console.error(`${changed.length} French Africa pages need updates.`);
    for (const file of changed) console.error(`- ${file}`);
    process.exitCode = 1;
  } else {
    console.log(`${changed.length} French Africa files ${checkOnly ? 'need updates' : 'updated'}.`);
  }
}

main();
