#!/usr/bin/env node
/**
 * Render CHIXIANG MOTOR Flagship Engine Product Pages across all 7 languages
 * (en, fr, es, pt, ru, ar, zh-cn) from data/flagship-engines.json + data/i18n/flagship-locales.json.
 *
 * Outputs:
 *   - {lang}/cg-engine/{slug}.html (/{lang}/cg-engine/{slug}) for published === true
 *   - Syncs sitemap.xml cleanly without exposing .html suffixes
 *
 * Usage:
 *   node scripts/render-flagship-engines.js
 *   node scripts/render-flagship-engines.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const { applyToHtml } = require('./apply-site-entity-schema');
const imgSeo = require('./lib/image-seo-helper');
const {
  ORIGIN,
  ORG_ID,
  WEBSITE_ID,
  LANGS,
  HREFLANG_MAP,
  LOCALE_CHROME,
  escapeHtml,
  escapeAttr,
  rolePath,
  roleUrl,
  hreflangTagsHtml,
  waHref,
  renderMobileNav,
  renderNavbar,
  renderFooter
} = require('./i18n-matrix');

const root = process.env.FLAGSHIP_ROOT
  ? path.resolve(process.env.FLAGSHIP_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.FLAGSHIP_DATA
  ? path.resolve(process.env.FLAGSHIP_DATA)
  : path.join(root, 'data', 'flagship-engines.json');
const localesFile = path.join(__dirname, '..', 'data', 'i18n', 'flagship-locales.json');
const checkOnly = process.argv.includes('--check');

const TARGET_LANGS = process.env.FLAGSHIP_ROOT ? ['en'] : LANGS;
const GENERATED_MARKER = '<!-- FLAGSHIP ENGINE GENERATED -->';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateData(data) {
  const errors = [];
  if (!data || !Array.isArray(data.engines)) {
    return ['flagship-engines.json must contain engines[]'];
  }
  const slugs = new Set();
  for (const engine of data.engines) {
    const label = (engine && engine.slug) || '(missing slug)';
    if (!engine || !engine.slug) {
      errors.push('Engine entry missing slug');
      continue;
    }
    if (!SLUG_RE.test(engine.slug)) {
      errors.push(`${label}: slug must be kebab-case [a-z0-9-]`);
    }
    if (slugs.has(engine.slug)) {
      errors.push(`${label}: duplicate slug`);
    }
    slugs.add(engine.slug);

    if (!engine.model || !engine.seo || !engine.seo.title || !engine.seo.description || !engine.seo.h1) {
      errors.push(`${label}: requires model and seo.{title,description,h1}`);
    }
    if (!Array.isArray(engine.gallery_images) || !engine.gallery_images.length) {
      errors.push(`${label}: requires at least 1 local gallery_images entry`);
    } else {
      for (const img of engine.gallery_images) {
        const src = img && img.src;
        if (!src || !SAFE_IMAGE_RE.test(src) || src.includes('..')) {
          errors.push(`${label}: illegal local image path "${src}"`);
        } else if (!fs.existsSync(path.join(root, src))) {
          errors.push(`${label}: image file does not exist on disk "${src}"`);
        }
      }
    }
    if (engine.linked_parts_source) {
      const linkedPath = path.join(root, engine.linked_parts_source);
      if (!fs.existsSync(linkedPath)) {
        errors.push(`${label}: linked_parts_source not found "${engine.linked_parts_source}"`);
      }
    }
  }
  return errors;
}

function publishedEngines(data) {
  return (data.engines || []).filter(e => e && e.published === true);
}

function detailRelPath(engine, lang = 'en') {
  return path.join(lang, 'cg-engine', `${engine.slug}.html`);
}

function canonicalUrl(engine, lang = 'en') {
  return `${ORIGIN}/${lang}/cg-engine/${engine.slug}`;
}

function resolveBundledParts(engine, lang, hwLocales) {
  const loc = lang !== 'en' && hwLocales && hwLocales[lang];
  if (!engine.linked_parts_source) {
    return (engine.bundled_kits || []).map(item => ({
      pn: item.pn,
      name: item.name,
      spec: item.spec,
      oem: item.fitment || ''
    }));
  }
  const catalog = readJson(path.join(root, engine.linked_parts_source));
  const items = [];
  for (const part of catalog.parts || []) {
    const compat = (part.compatible_variants || []).find(v => v.variant_id === engine.model);
    if (!compat) continue;
    const isKit = part.assembly_id === 'factory-matched-kits';
    if (isKit || items.length < 8) {
      const localName = (loc && loc.parts && loc.parts[part.slug]) || (lang === 'zh-cn' && part.product_name_zh) || part.product_name_en;
      items.push({
        pn: part.sku || part.part_number || '',
        name: localName,
        spec: part.specifications && part.specifications.key_spec ? part.specifications.key_spec : '',
        oem: part.oem_ref || ''
      });
    }
  }
  return items.slice(0, 8);
}

function localizeCompUrl(url, lang) {
  if (lang === 'en') return url;
  if (url === '/en/cg-engine') return rolePath('cg', lang);
  if (url.startsWith('/en/cg-engine#')) return `${rolePath('cg', lang)}#${url.split('#')[1]}`;
  if (url.startsWith('/en/cg-engine/')) return `/${lang}/cg-engine/${url.slice('/en/cg-engine/'.length)}`;
  return url;
}

function localizedEngineData(engine, lang, flagshipLocales) {
  if (lang === 'en') return null;
  const ui = flagshipLocales.ui[lang];
  const ov = (flagshipLocales.engines[engine.slug] && flagshipLocales.engines[engine.slug][lang]) || {};
  return { ui, ov };
}

function renderSharedHead(engine, lang, seo, quickVerdict, familyName, faqs, specProps) {
  const url = canonicalUrl(engine, lang);
  const pageName = seo.h1;
  const chrome = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  const homeName = chrome.nav.home;
  const cgSeriesName = (lang === 'en') ? 'CG Engine Series' : (flagshipUiCache[lang]?.breadcrumbCg || 'CG Engine Series');

  const orgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'CHIXIANG MOTOR',
        legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
        alternateName: 'Chixiang Motor',
        url: `${ORIGIN}/`,
        logo: `${ORIGIN}/images/logo.webp`,
        foundingDate: '2007',
        description: lang === 'zh-cn'
          ? '重庆驰翔摩托车制造有限公司，始于2003年摩托车及三轮车发动机制造经验。'
          : 'Motorcycle and cargo-tricycle engine manufacturer in Chongqing, China, with industry experience since 2003.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
          addressLocality: 'Chongqing',
          addressCountry: 'CN'
        },
        sameAs: officialSameAs
      }
    ]
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: pageName,
    sku: engine.sku,
    model: engine.model,
    category: familyName,
    description: quickVerdict,
    image: engine.gallery_images.map((img, idx) => {
      const alt = lang === 'en' ? imgSeo.getAlt(img.src, 'en', img.alt) : imgSeo.getAlt(img.src, lang, `${engine.model} - ${img.caption}`);
      const caption = lang === 'en' ? imgSeo.getCaption(img.src, 'en', img.caption) : imgSeo.getCaption(img.src, lang, img.caption);
      return imgSeo.imageObjectNode(img.src, lang, { representativeOfPage: idx === 0, name: alt, alt, caption });
    }),
    url,
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    additionalProperty: specProps
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  const entityGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemPage',
        '@id': `${url}#webpage`,
        url,
        name: pageName,
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
        inLanguage: lang,
        description: seo.description,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#product` }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeName, item: roleUrl('home', lang) },
          { '@type': 'ListItem', position: 2, name: cgSeriesName, item: roleUrl('cg', lang) },
          { '@type': 'ListItem', position: 3, name: pageName, item: url }
        ]
      }
    ]
  };

  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const hreflangs = TARGET_LANGS.length === 1
    ? `  <link rel="alternate" hreflang="en" href="${escapeAttr(url)}">\n  <link rel="alternate" hreflang="x-default" href="${escapeAttr(url)}">`
    : hreflangTagsHtml(engine.slug);

  return `<!DOCTYPE html>
<html lang="${HREFLANG_MAP[lang]}"${dirAttr}>
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
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeAttr(seo.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeAttr(url)}">
${hreflangs}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(seo.title)}">
  <meta property="og:description" content="${escapeAttr(seo.description)}">
  <meta property="og:url" content="${escapeAttr(url)}">
  <meta property="og:image" content="${escapeAttr(`${ORIGIN}/${engine.gallery_images[0].src}`)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261123-matrix">
  <style>
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
  </style>
  <script type="application/ld+json">
${JSON.stringify(orgSchema, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(productSchema, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
  </script>
  <script type="application/ld+json" data-site-entity-graph>
${JSON.stringify(entityGraph, null, 2)}
  </script>
</head>`;
}

let flagshipUiCache = {};

function renderEnEnginePage(engine, hwLocales) {
  const seo = engine.seo;
  const specProps = [
    { '@type': 'PropertyValue', name: 'Nominal Class', value: engine.nominal_class },
    { '@type': 'PropertyValue', name: 'Actual Displacement', value: engine.actual_displacement },
    { '@type': 'PropertyValue', name: 'Bore × Stroke', value: engine.bore_stroke },
    { '@type': 'PropertyValue', name: 'Max Power', value: engine.power },
    { '@type': 'PropertyValue', name: 'Max Torque', value: engine.torque },
    { '@type': 'PropertyValue', name: 'Compression Ratio', value: engine.compression },
    { '@type': 'PropertyValue', name: 'Cooling System', value: engine.cooling },
    { '@type': 'PropertyValue', name: 'Transmission', value: engine.transmission },
    { '@type': 'PropertyValue', name: 'Starting Method', value: engine.starting },
    { '@type': 'PropertyValue', name: 'Clutch Type', value: engine.clutch },
    { '@type': 'PropertyValue', name: 'Dimensions & Weight', value: engine.dimensions_weight }
  ];
  if (engine.oil_capacity) specProps.push({ '@type': 'PropertyValue', name: 'Oil Capacity', value: engine.oil_capacity });
  if (engine.carburetor) specProps.push({ '@type': 'PropertyValue', name: 'Carburetor', value: engine.carburetor });

  const quoteHref = `/en/contact?product_interest=cg&source_form=flagship-engine-page&source_cta=hero-quote&engine_code=${encodeURIComponent(engine.model)}&vehicle=${encodeURIComponent(engine.vehicle_context)}&btv_pn=${encodeURIComponent(engine.sku)}`;
  const primaryImg = engine.gallery_images[0];
  const bundledParts = resolveBundledParts(engine, 'en', hwLocales);

  const thumbsHtml = engine.gallery_images.map((img, idx) => {
    const thumbAlt = imgSeo.getAlt(img.src, 'en', img.alt);
    const thumbCaption = imgSeo.getCaption(img.src, 'en', img.caption);
    return `
            <button type="button" class="flagship-thumb" data-flagship-thumb data-src="/${escapeHtml(imgSeo.resolveFile(img.src))}" data-alt="${escapeHtml(thumbAlt)}" data-caption="${escapeHtml(thumbCaption)}" aria-pressed="${idx === 0 ? 'true' : 'false'}" aria-label="View photo ${idx + 1}: ${escapeHtml(thumbCaption)}">
              <img src="/${escapeHtml(imgSeo.resolveFile(img.src))}" alt="${escapeHtml(thumbAlt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="160" height="120" decoding="async">
            </button>`;
  }).join('');

  const specRows = [
    ['Engine Model', engine.alias ? `${engine.model} (${engine.alias})` : engine.model],
    ['Nominal Class', engine.nominal_class],
    ['Actual Displacement', engine.actual_displacement],
    ['Bore × Stroke', engine.bore_stroke],
    ['Max Power', engine.power],
    ['Max Torque', engine.torque],
    ['Compression Ratio', engine.compression],
    ['Cooling System', engine.cooling],
    ['Transmission', engine.transmission],
    ['Starting Method', engine.starting],
    ['Clutch Type', engine.clutch],
    ['Ignition System', engine.ignition],
    ['Dimensions & Weight', engine.dimensions_weight]
  ];
  if (engine.oil_capacity) specRows.push(['Oil Capacity', engine.oil_capacity]);
  if (engine.carburetor) specRows.push(['Carburetor Specification', engine.carburetor]);

  const specTableRowsHtml = specRows.map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('\n            ');
  const configRowsHtml = (engine.standard_vs_optional_configs || []).map(row => `<tr><th scope="row">${escapeHtml(row.item)}</th><td>${escapeHtml(row.standard)}</td><td>${escapeHtml(row.optional)}</td></tr>`).join('\n            ');
  const mountingHtml = (engine.mounting_interface_notes || []).map(item => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>`).join('');
  const comparisonRowsHtml = (engine.comparison_models || []).map(row => {
    const modelCell = row.current ? `<strong>${escapeHtml(row.model)}</strong>` : `<a href="${escapeHtml(row.url)}">${escapeHtml(row.model)}</a>`;
    return `<tr><th scope="row">${modelCell}</th><td>${escapeHtml(row.nominal)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.bore_stroke)}</td><td>${escapeHtml(row.power)}</td><td>${escapeHtml(row.torque)}</td><td>${escapeHtml(row.weight)}</td><td>${escapeHtml(row.dimensions)}</td></tr>`;
  }).join('\n            ');
  const bundleItemsHtml = bundledParts.map((part, idx) => {
    const meta = [part.pn ? `PN: ${part.pn}` : '', part.spec || ''].filter(Boolean).join(' · ');
    return `
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeHtml(part.name)}" data-part-pn="${escapeHtml(part.pn)}" data-part-oem="${escapeHtml(part.oem)}" ${idx < 2 ? 'checked' : ''}>
              <span><strong>${escapeHtml(part.name)}</strong>${meta ? `<br><span style="font-size:0.84rem;color:var(--text-secondary);">${escapeHtml(meta)}</span>` : ''}</span>
            </label>`;
  }).join('');
  const relatedGuidesHtml = (engine.related_guides || []).map(g => `
          <div class="feature-item" style="text-align:left;">
            <h3><a href="${escapeHtml(g.url)}">${escapeHtml(g.title)}</a></h3>
            <p>${escapeHtml(g.description)}</p>
          </div>`).join('');
  const faqsHtml = (engine.faqs || []).map(f => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(f.q)}</h3>
            <p>${escapeHtml(f.a)}</p>
          </div>`).join('');
  const hwPartsLinkBlock = engine.linked_parts_source
    ? `<p style="margin-top:1rem;"><a href="/en/engine-parts/hw-series" class="btn btn-primary btn-sm">Browse Full HW200–HW350 Spare Parts Catalog &rarr;</a></p>`
    : '';
  const waUrl = `https://wa.me/8619008225410?text=${encodeURIComponent(`Hello CHIXIANG MOTOR, I would like a wholesale quote for ${engine.model} (${engine.sku}).`)}`;

  return `${renderSharedHead(engine, 'en', seo, engine.quick_verdict, engine.family, engine.faqs || [], specProps)}
<body class="flagship-page">
  ${GENERATED_MARKER}
${renderMobileNav('en', engine.slug, quoteHref)}
${renderNavbar('en', engine.slug, 'products', quoteHref)}

  <div class="flagship-anchor-bar">
    <div class="container">
      <nav class="flagship-anchor-nav" aria-label="Section navigation">
        <a href="#overview">Overview</a>
        <a href="#specifications">Specs &amp; Configs</a>
        <a href="#mounting">Mounting &amp; Interface</a>
        <a href="#comparison">Series Comparison</a>
        <a href="#bundle-quote">Engine + Kits Quote</a>
        <a href="#quality-export">QA &amp; Export Terms</a>
        <a href="#faq">FAQ</a>
      </nav>
    </div>
  </div>

  <main>
    <nav class="breadcrumb entity-breadcrumb entity-breadcrumb--standalone" aria-label="Breadcrumb"><a href="/en/">Home</a><span aria-hidden="true">/</span><a href="/en/cg-engine">CG Engine Series</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(engine.seo.h1)}</span></nav>
    <section class="section" id="overview" style="padding-top:1.75rem;">
      <div class="container">
        <div class="flagship-hero-grid">
          <div class="flagship-gallery">
            <figure class="flagship-gallery-main" style="margin:0;">
              <img id="flagshipMainImg" src="/${escapeHtml(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeHtml(imgSeo.getAlt(primaryImg.src, 'en', primaryImg.alt))}" width="1200" height="1200" loading="eager" fetchpriority="high" decoding="async">
              <figcaption class="flagship-gallery-caption" id="flagshipMainCaption">${escapeHtml(imgSeo.getCaption(primaryImg.src, 'en', primaryImg.caption))}</figcaption>
            </figure>
            <div class="flagship-thumbs" role="group" aria-label="Engine gallery thumbnails">${thumbsHtml}
            </div>
          </div>

          <div class="flagship-summary">
            <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary-color);margin:0 0 0.4rem;">${escapeHtml(engine.family)} · SKU ${escapeHtml(engine.sku)}</p>
            <h1 style="margin-top:0;">${escapeHtml(engine.seo.h1)}</h1>

            <div class="flagship-verdict">
              <p class="flagship-verdict__label">Quick Engineering Verdict</p>
              <p style="margin:0;color:var(--text-primary);line-height:1.65;">${escapeHtml(engine.quick_verdict)}</p>
            </div>

            <dl class="flagship-spec-grid">
              <div class="flagship-spec-card"><dt>Actual Displacement</dt><dd>${escapeHtml(engine.actual_displacement)} (${escapeHtml(engine.nominal_class)})</dd></div>
              <div class="flagship-spec-card"><dt>Bore × Stroke</dt><dd>${escapeHtml(engine.bore_stroke)}</dd></div>
              <div class="flagship-spec-card"><dt>Max Power</dt><dd>${escapeHtml(engine.power)}</dd></div>
              <div class="flagship-spec-card"><dt>Max Torque</dt><dd>${escapeHtml(engine.torque)}</dd></div>
              <div class="flagship-spec-card"><dt>Cooling &amp; Clutch</dt><dd>${escapeHtml(engine.cooling_clutch || `${engine.cooling} · ${engine.clutch}`)}</dd></div>
              <div class="flagship-spec-card"><dt>Dimensions &amp; Weight</dt><dd>${escapeHtml(engine.dimensions_weight)}</dd></div>
            </dl>

            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="${escapeHtml(quoteHref)}" class="btn btn-accent">Request Wholesale Quote</a>
              <a href="${escapeAttr(waUrl)}" class="btn btn-outline" target="_blank" rel="noopener">WhatsApp</a>
            </div>
            <p class="flagship-moq-note"><strong>Wholesale Terms:</strong> 50-unit standard MOQ (mixed models and matching spare parts supported) · ~10 working days regular lead time · FOB Guangzhou (other major Chinese ports by arrangement).</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="specifications" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Technical Specifications &amp; Standard vs. Optional Scope</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Parameter</th><th>Verified Specification</th></tr></thead>
            <tbody>
            ${specTableRowsHtml}
            </tbody>
          </table>
        </div>

        <h3 style="margin-top:2.25rem;">Standard Delivery Scope vs. Optional Configurations</h3>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Configuration Item</th><th>Standard Factory Scope</th><th>Optional / Order-Confirmed</th></tr></thead>
            <tbody>
            ${configRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" id="mounting">
      <div class="container">
        <h2 class="section-title">External Mounting &amp; Interface Verification Checklist</h2>
        <p class="section-subtitle">Verify physical mounting points and electrical connectors against your vehicle chassis before batch production. Factory installation dimension drawings are supplied with quotation.</p>
        <div class="features-grid" style="margin-top:1.5rem;">${mountingHtml}
        </div>
      </div>
    </section>

    <section class="section" id="comparison" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Same-Series Model Comparison</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>Model</th><th>Nominal Class</th><th>Actual Displacement</th><th>Bore × Stroke</th><th>Max Power</th><th>Max Torque</th><th>Weight</th><th>Dimensions</th></tr></thead>
            <tbody>
            ${comparisonRowsHtml}
            </tbody>
          </table>
        </div>
        <p style="margin-top:1rem;"><a href="${escapeHtml(engine.family_url)}" class="btn btn-primary btn-sm">View Full ${escapeHtml(engine.family)} Matrix &rarr;</a></p>
      </div>
    </section>

    <section class="section" id="bundle-quote">
      <div class="container">
        <h2 class="section-title">Complete Engine + Service Kit Consolidation Quote</h2>
        <p class="section-subtitle">Select the complete ${escapeHtml(engine.model)} engine and matching spare-parts kits to prefill a consolidated mixed-container inquiry.</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-model="${escapeHtml(engine.model)}" data-engine-code="${escapeHtml(engine.model)}" data-vehicle="${escapeHtml(engine.vehicle_context)}" data-engine-sku="${escapeHtml(engine.sku)}" data-product-interest="cg" data-contact-path="/en/contact">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">Estimated Quantity (Units / Mixed Lot)</label>
              <input type="text" id="flagshipBundleQty" placeholder="e.g. 50 units + 10 service kits" value="50 units">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">Destination Country / Market</label>
              <input type="text" id="flagshipBundleCountry" placeholder="e.g. Peru, Nigeria, Kenya, Russia">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeHtml(engine.model)} Complete Engine Assembly (${escapeHtml(engine.actual_displacement)})" data-part-pn="${escapeHtml(engine.sku)}" data-part-oem="${escapeHtml(engine.alias || engine.model)}" checked>
              <span><strong>${escapeHtml(engine.model)} Complete Engine Assembly</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">SKU: ${escapeHtml(engine.sku)} · ${escapeHtml(engine.bore_stroke)}</span></span>
            </label>
            ${bundleItemsHtml}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">Proceed to Prefilled Quote Form &rarr;</button>
          </div>
        </form>
        ${hwPartsLinkBlock}
      </div>
    </section>

    <section class="section" id="quality-export" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">Factory Quality Verification &amp; Export Delivery Terms</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          <div class="feature-item" style="text-align:left;">
            <h3>100% Hot &amp; Cold Bench Testing</h3>
            <p>Every engine undergoes 100% pre-shipment cold and hot bench testing backed by dual factory dynamometer, emission, and metallurgical inspection laboratories in Hangu Town, Chongqing. <a href="/en/evidence">Inspect Evidence Center &rarr;</a></p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>Export Packaging &amp; 50-Unit Mixed Loading</h3>
            <p>Standard 50-unit MOQ supports mixed engine models and service kits in one container (~10 working days regular lead time, FOB Guangzhou). <a href="/en/motorcycle-engine-export-packaging-moq-50-mixed-loading-guide">Packaging &amp; MOQ Guide &rarr;</a></p>
          </div>
          <div class="feature-item" style="text-align:left;">
            <h3>60-Day Post-Arrival Warranty</h3>
            <p>Verified manufacturing or assembly defects within 60 days after destination port arrival receive free replacement parts shipped with your next scheduled container upon serial number and photo/video verification.</p>
          </div>
        </div>
        <h3 style="margin-top:2rem;">Related Engineering &amp; Procurement Guides</h3>
        <div class="features-grid" style="margin-top:1rem;">${relatedGuidesHtml}
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container">
        <h2 class="section-title">${escapeHtml(engine.model)} Engineering &amp; Procurement FAQ</h2>
        <div class="features-grid" style="margin-top:1.5rem;">${faqsHtml}
        </div>
      </div>
    </section>
  </main>

${renderFooter('en', waUrl, quoteHref, ['/js/flagship-engine-page.js'])}
  <div class="flagship-lightbox" id="flagshipLightbox" aria-hidden="true" role="dialog" aria-label="Engine photo zoom">
    <button type="button" class="flagship-lightbox-close" id="flagshipLightboxClose" aria-label="Close image preview">&times;</button>
    <img id="flagshipLightboxImg" src="/${escapeAttr(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeAttr(imgSeo.getAlt(primaryImg.src, 'en', primaryImg.alt))}" width="1200" height="1200" loading="lazy" decoding="async">
  </div>
</body>
</html>
`;
}

function renderLocalizedEnginePage(engine, lang, flagshipLocales, hwLocales) {
  const { ui, ov } = localizedEngineData(engine, lang, flagshipLocales);
  const chrome = LOCALE_CHROME[lang];
  const seo = ov.seo || engine.seo;
  const familyName = ov.family || engine.family;
  const quickVerdict = ov.quick_verdict || engine.quick_verdict;
  const vehicleCtx = ov.vehicle_context || engine.vehicle_context;
  const cooling = ov.cooling || engine.cooling;
  const coolingClutch = ov.cooling_clutch || engine.cooling_clutch || `${cooling} · ${ov.clutch || engine.clutch}`;
  const transmission = ov.transmission || engine.transmission;
  const starting = ov.starting || engine.starting;
  const clutch = ov.clutch || engine.clutch;
  const ignition = ov.ignition || engine.ignition;
  const configs = ov.standard_vs_optional_configs || engine.standard_vs_optional_configs || [];
  const mountingNotes = ov.mounting_interface_notes || engine.mounting_interface_notes || [];
  const faqs = ov.faqs || engine.faqs || [];
  const relatedGuides = ov.related_guides || (engine.related_guides || []).map(g => ({ ...g, url: localizeCompUrl(g.url, lang) }));
  const bundledParts = ov.bundled_kits
    ? ov.bundled_kits.map(k => ({ pn: k.pn, name: k.name, spec: k.spec, oem: k.fitment || '' }))
    : resolveBundledParts(engine, lang, hwLocales);

  const sl = ui.specLabels;
  const specProps = [
    { '@type': 'PropertyValue', name: sl.nominal, value: engine.nominal_class },
    { '@type': 'PropertyValue', name: sl.actual, value: engine.actual_displacement },
    { '@type': 'PropertyValue', name: sl.boreStroke, value: engine.bore_stroke },
    { '@type': 'PropertyValue', name: sl.power, value: engine.power },
    { '@type': 'PropertyValue', name: sl.torque, value: engine.torque },
    { '@type': 'PropertyValue', name: sl.compression, value: engine.compression },
    { '@type': 'PropertyValue', name: sl.cooling, value: cooling },
    { '@type': 'PropertyValue', name: sl.transmission, value: transmission },
    { '@type': 'PropertyValue', name: sl.starting, value: starting },
    { '@type': 'PropertyValue', name: sl.clutch, value: clutch },
    { '@type': 'PropertyValue', name: sl.dimWeight, value: engine.dimensions_weight }
  ];
  if (engine.oil_capacity) specProps.push({ '@type': 'PropertyValue', name: sl.oil, value: engine.oil_capacity });
  if (engine.carburetor) specProps.push({ '@type': 'PropertyValue', name: sl.carb, value: engine.carburetor });

  const contactPath = rolePath('contact', lang);
  const quoteHref = `${contactPath}?product_interest=cg&source_form=flagship-engine-page&source_cta=hero-quote&engine_code=${encodeURIComponent(engine.model)}&vehicle=${encodeURIComponent(vehicleCtx)}&btv_pn=${encodeURIComponent(engine.sku)}`;
  const waModelLabel = lang === 'fr' && engine.model === 'HW300'
    ? 'HW300 300cc à eau'
    : (lang === 'fr' && engine.model === 'CG200' ? 'CG200 refroidi par air' : `${engine.model} (${engine.actual_displacement})`);
  const waUrl = waHref(lang, waModelLabel);

  const primaryImg = engine.gallery_images[0];
  const thumbsHtml = engine.gallery_images.map((img, idx) => {
    const thumbAlt = imgSeo.getAlt(img.src, lang, `${engine.model} - ${img.caption}`);
    const thumbCaption = imgSeo.getCaption(img.src, lang, img.caption);
    return `
            <button type="button" class="flagship-thumb" data-flagship-thumb data-src="/${escapeAttr(imgSeo.resolveFile(img.src))}" data-alt="${escapeAttr(thumbAlt)}" data-caption="${escapeAttr(thumbCaption)}" aria-pressed="${idx === 0 ? 'true' : 'false'}" aria-label="${escapeAttr(`${engine.model} #${idx + 1}`)}">
              <img src="/${escapeAttr(imgSeo.resolveFile(img.src))}" alt="${escapeAttr(thumbAlt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="160" height="120" decoding="async">
            </button>`;
  }).join('');

  const specRows = [
    [sl.model, engine.alias ? `${engine.model} (${engine.alias})` : engine.model],
    [sl.nominal, engine.nominal_class],
    [sl.actual, engine.actual_displacement],
    [sl.boreStroke, engine.bore_stroke],
    [sl.power, engine.power],
    [sl.torque, engine.torque],
    [sl.compression, engine.compression],
    [sl.cooling, cooling],
    [sl.transmission, transmission],
    [sl.starting, starting],
    [sl.clutch, clutch],
    [sl.ignition, ignition],
    [sl.dimWeight, engine.dimensions_weight]
  ];
  if (engine.oil_capacity) specRows.push([sl.oil, engine.oil_capacity]);
  if (engine.carburetor) specRows.push([sl.carb, engine.carburetor]);

  const specTableRowsHtml = specRows.map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('\n            ');
  const configRowsHtml = configs.map(row => `<tr><th scope="row">${escapeHtml(row.item)}</th><td>${escapeHtml(row.standard)}</td><td>${escapeHtml(row.optional)}</td></tr>`).join('\n            ');
  const mountingHtml = mountingNotes.map(item => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>`).join('');

  const comparisonRowsHtml = (engine.comparison_models || []).map(row => {
    const cleanModel = row.model.replace(' (This Page)', ` ${ui.currentSuffix}`);
    const modelCell = row.current
      ? `<strong>${escapeHtml(cleanModel)}</strong>`
      : `<a href="${escapeAttr(localizeCompUrl(row.url, lang))}">${escapeHtml(cleanModel)}</a>`;
    return `<tr><th scope="row">${modelCell}</th><td>${escapeHtml(row.nominal)}</td><td>${escapeHtml(row.actual)}</td><td>${escapeHtml(row.bore_stroke)}</td><td>${escapeHtml(row.power)}</td><td>${escapeHtml(row.torque)}</td><td>${escapeHtml(row.weight)}</td><td>${escapeHtml(row.dimensions)}</td></tr>`;
  }).join('\n            ');

  const bundleItemsHtml = bundledParts.map((part, idx) => {
    const meta = [part.pn ? `${ui.pnPrefix}: ${part.pn}` : '', part.spec || ''].filter(Boolean).join(' · ');
    return `
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeAttr(part.name)}" data-part-pn="${escapeAttr(part.pn)}" data-part-oem="${escapeAttr(part.oem)}" ${idx < 2 ? 'checked' : ''}>
              <span><strong>${escapeHtml(part.name)}</strong>${meta ? `<br><span style="font-size:0.84rem;color:var(--text-secondary);">${escapeHtml(meta)}</span>` : ''}</span>
            </label>`;
  }).join('');

  const relatedGuidesHtml = relatedGuides.map(g => `
          <div class="feature-item" style="text-align:left;">
            <h3><a href="${escapeAttr(g.url)}">${escapeHtml(g.title)}</a></h3>
            <p>${escapeHtml(g.description)}</p>
          </div>`).join('');

  const faqsHtml = faqs.map(f => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(f.q)}</h3>
            <p>${escapeHtml(f.a)}</p>
          </div>`).join('');

  const hwPartsLinkBlock = engine.linked_parts_source
    ? `<p style="margin-top:1rem;"><a href="${rolePath('hw-series', lang)}" class="btn btn-primary btn-sm">${escapeHtml(ui.hwPartsBtn)}</a></p>`
    : '';

  const qaCardsHtml = ui.qaCards.map(card => {
    const [heading, text, linkLabel, linkHref] = card;
    const linkPart = linkHref ? ` <a href="${escapeAttr(linkHref)}">${escapeHtml(linkLabel)}</a>` : '';
    return `          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(heading)}</h3>
            <p>${escapeHtml(text)}${linkPart}</p>
          </div>`;
  }).join('\n');

  const familyHref = localizeCompUrl(engine.family_url, lang);

  return `${renderSharedHead(engine, lang, seo, quickVerdict, familyName, faqs, specProps)}
<body class="flagship-page${lang === 'zh-cn' ? ' zh-cn-page' : ''}">
  ${GENERATED_MARKER}
${renderMobileNav(lang, engine.slug, quoteHref)}
${renderNavbar(lang, engine.slug, 'products', quoteHref)}

  <div class="flagship-anchor-bar">
    <div class="container">
      <nav class="flagship-anchor-nav" aria-label="Section navigation">
        <a href="#overview">${escapeHtml(ui.anchors.overview)}</a>
        <a href="#specifications">${escapeHtml(ui.anchors.specifications)}</a>
        <a href="#mounting">${escapeHtml(ui.anchors.mounting)}</a>
        <a href="#comparison">${escapeHtml(ui.anchors.comparison)}</a>
        <a href="#bundle-quote">${escapeHtml(ui.anchors.bundle)}</a>
        <a href="#quality-export">${escapeHtml(ui.anchors.quality)}</a>
        <a href="#faq">${escapeHtml(ui.anchors.faq)}</a>
      </nav>
    </div>
  </div>

  <main>
    <nav class="breadcrumb entity-breadcrumb entity-breadcrumb--standalone" aria-label="Breadcrumb"><a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><a href="${rolePath('cg', lang)}">${escapeHtml(ui.breadcrumbCg)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(seo.h1)}</span></nav>
    <section class="section" id="overview" style="padding-top:1.75rem;">
      <div class="container">
        <div class="flagship-hero-grid">
          <div class="flagship-gallery">
            <figure class="flagship-gallery-main" style="margin:0;">
              <img id="flagshipMainImg" src="/${escapeAttr(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeAttr(imgSeo.getAlt(primaryImg.src, lang, `${engine.model} - ${primaryImg.caption}`))}" width="1200" height="1200" loading="eager" fetchpriority="high" decoding="async">
              <figcaption class="flagship-gallery-caption" id="flagshipMainCaption">${escapeHtml(imgSeo.getCaption(primaryImg.src, lang, primaryImg.caption))}</figcaption>
            </figure>
            <div class="flagship-thumbs" role="group" aria-label="Gallery">${thumbsHtml}
            </div>
          </div>

          <div class="flagship-summary">
            <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary-color);margin:0 0 0.4rem;">${escapeHtml(familyName)} · SKU ${escapeHtml(engine.sku)}</p>
            <h1 style="margin-top:0;">${escapeHtml(seo.h1)}</h1>

            <div class="flagship-verdict">
              <p class="flagship-verdict__label">${escapeHtml(ui.verdictLabel)}</p>
              <p style="margin:0;color:var(--text-primary);line-height:1.65;">${escapeHtml(quickVerdict)}</p>
            </div>

            <dl class="flagship-spec-grid">
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.actual)}</dt><dd>${escapeHtml(engine.actual_displacement)} (${escapeHtml(engine.nominal_class)})</dd></div>
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.boreStroke)}</dt><dd>${escapeHtml(engine.bore_stroke)}</dd></div>
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.power)}</dt><dd>${escapeHtml(engine.power)}</dd></div>
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.torque)}</dt><dd>${escapeHtml(engine.torque)}</dd></div>
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.coolingClutch)}</dt><dd>${escapeHtml(coolingClutch)}</dd></div>
              <div class="flagship-spec-card"><dt>${escapeHtml(sl.dimWeight)}</dt><dd>${escapeHtml(engine.dimensions_weight)}</dd></div>
            </dl>

            <div class="cta-actions" style="justify-content:flex-start;">
              <a href="${escapeAttr(quoteHref)}" class="btn btn-accent">${escapeHtml(ui.ctaQuote)}</a>
              <a href="${escapeAttr(waUrl)}" class="btn btn-outline" target="_blank" rel="noopener">${escapeHtml(chrome.waLabel)}</a>
            </div>
            <p class="flagship-moq-note">${escapeHtml(ui.moqNote)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="specifications" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.specsTitle)}</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>${escapeHtml(ui.paramHeader)}</th><th>${escapeHtml(ui.valueHeader)}</th></tr></thead>
            <tbody>
            ${specTableRowsHtml}
            </tbody>
          </table>
        </div>

        <h3 style="margin-top:2.25rem;">${escapeHtml(ui.scopeTitle)}</h3>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr><th>${escapeHtml(ui.scopeHeaders[0])}</th><th>${escapeHtml(ui.scopeHeaders[1])}</th><th>${escapeHtml(ui.scopeHeaders[2])}</th></tr></thead>
            <tbody>
            ${configRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section" id="mounting">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.mountingTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(ui.mountingSub)}</p>
        <div class="features-grid" style="margin-top:1.5rem;">${mountingHtml}
        </div>
      </div>
    </section>

    <section class="section" id="comparison" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.compTitle)}</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.5rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${ui.compHeaders.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>
            ${comparisonRowsHtml}
            </tbody>
          </table>
        </div>
        <p style="margin-top:1rem;"><a href="${escapeAttr(familyHref)}" class="btn btn-primary btn-sm">${escapeHtml(ui.compBtn)} (${escapeHtml(familyName)}) &rarr;</a></p>
      </div>
    </section>

    <section class="section" id="bundle-quote">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.bundleTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(ui.bundleSub)}</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-contact-path="${contactPath}" data-model="${escapeAttr(engine.model)}" data-engine-code="${escapeAttr(engine.model)}" data-vehicle="${escapeAttr(vehicleCtx)}" data-engine-sku="${escapeAttr(engine.sku)}" data-product-interest="cg">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">${escapeHtml(ui.bundleQtyLabel)}</label>
              <input type="text" id="flagshipBundleQty" placeholder="${escapeAttr(ui.bundleQtyPh)}" value="${escapeAttr(ui.bundleQtyVal)}">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">${escapeHtml(ui.bundleCountryLabel)}</label>
              <input type="text" id="flagshipBundleCountry" placeholder="${escapeAttr(ui.bundleCountryPh)}">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeAttr(`${engine.model} ${ui.completeSuffix} (${engine.actual_displacement})`)}" data-part-pn="${escapeAttr(engine.sku)}" data-part-oem="${escapeAttr(engine.alias || engine.model)}" checked>
              <span><strong>${escapeHtml(`${engine.model} ${ui.completeSuffix}`)}</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">SKU: ${escapeHtml(engine.sku)} · ${escapeHtml(engine.bore_stroke)}</span></span>
            </label>
            ${bundleItemsHtml}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">${escapeHtml(ui.bundleBtn)}</button>
          </div>
        </form>
        ${hwPartsLinkBlock}
      </div>
    </section>

    <section class="section" id="quality-export" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.qaTitle)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
${qaCardsHtml}
        </div>
        <h3 style="margin-top:2rem;">${escapeHtml(ui.guidesTitle)}</h3>
        <div class="features-grid" style="margin-top:1rem;">${relatedGuidesHtml}
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container">
        <h2 class="section-title">${escapeHtml(ui.faqTitle)} ${escapeHtml(engine.model)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">${faqsHtml}
        </div>
      </div>
    </section>
  </main>

${renderFooter(lang, waUrl, quoteHref, ['/js/flagship-engine-page.js'])}
  <div class="flagship-lightbox" id="flagshipLightbox" aria-hidden="true" role="dialog" aria-label="Image preview">
    <button type="button" class="flagship-lightbox-close" id="flagshipLightboxClose" aria-label="Close">&times;</button>
    <img id="flagshipLightboxImg" src="/${escapeAttr(imgSeo.resolveFile(primaryImg.src))}" alt="${escapeAttr(imgSeo.getAlt(primaryImg.src, lang, `${engine.model} - ${primaryImg.caption}`))}" width="1200" height="1200" loading="lazy" decoding="async">
  </div>
</body>
</html>
`;
}

function listOwnedFiles() {
  const results = [];
  for (const lang of TARGET_LANGS) {
    const dir = path.join(root, lang, 'cg-engine');
    if (!fs.existsSync(dir)) continue;
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!d.isFile() || !d.name.endsWith('.html')) continue;
      const abs = path.join(dir, d.name);
      const content = fs.readFileSync(abs, 'utf8');
      results.push({
        rel: path.join(lang, 'cg-engine', d.name),
        abs,
        managed: content.includes(GENERATED_MARKER)
      });
    }
  }
  return results;
}

function syncSitemap(engines) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const want = new Set();
  for (const lang of TARGET_LANGS) {
    for (const engine of engines) {
      want.add(canonicalUrl(engine, lang));
    }
  }
  const seen = new Set();
  let removed = 0;

  let out = xml.replace(
    / {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/(?:en|fr|es|pt|ru|ar|zh-cn)\/cg-engine\/[^<]+)<\/loc>[\s\S]*?<\/url>\r?\n/g,
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
    out = out.replace(
      '</urlset>',
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`
    );
    seen.add(url);
  }
  return { changed: removed > 0 || added.length > 0, next: out };
}

function main() {
  const data = readJson(dataFile);
  const errors = validateData(data);
  if (errors.length) {
    console.error('Flagship engines validation failed:');
    for (const err of errors) console.error('  - ' + err);
    process.exit(2);
  }

  const flagshipLocales = fs.existsSync(localesFile) ? readJson(localesFile) : { ui: {}, engines: {} };
  flagshipUiCache = flagshipLocales.ui || {};
  const hwLocalesPath = path.join(__dirname, '..', 'data', 'i18n', 'hw-parts-locales.json');
  const hwLocales = fs.existsSync(hwLocalesPath) ? readJson(hwLocalesPath) : {};

  const active = publishedEngines(data);
  const expectedSet = new Set();
  const changes = [];

  for (const lang of TARGET_LANGS) {
    for (const engine of active) {
      const rel = detailRelPath(engine, lang);
      expectedSet.add(rel);
      const abs = path.join(root, rel);
      const rawHtml = lang === 'en'
        ? renderEnEnginePage(engine, hwLocales)
        : renderLocalizedEnginePage(engine, lang, flagshipLocales, hwLocales);
      const alignedHtml = process.env.FLAGSHIP_ROOT
        ? rawHtml
        : applyToHtml(rawHtml, canonicalUrl(engine, lang));
      const html = alignedHtml.replace(/\r?\n/g, '\r\n');
      const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
      if (current !== html) {
        changes.push({ file: rel, stale: true });
        if (!checkOnly) {
          fs.mkdirSync(path.dirname(abs), { recursive: true });
          fs.writeFileSync(abs, html, 'utf8');
        }
      }
    }
  }

  for (const file of listOwnedFiles()) {
    if (expectedSet.has(file.rel)) continue;
    if (file.managed) {
      changes.push({ file: file.rel, stale: true, removed: !checkOnly });
      if (!checkOnly) fs.unlinkSync(file.abs);
    }
  }

  const sitemap = syncSitemap(active);
  if (sitemap.changed) {
    changes.push({ file: 'sitemap.xml', stale: true });
    if (!checkOnly) fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.next, 'utf8');
  }

  if (checkOnly) {
    const stale = changes.filter(c => c.stale);
    for (const item of stale) console.log(`STALE ${item.file}`);
    console.log(`${stale.length} flagship engine files need updates.`);
    process.exit(stale.length ? 1 : 0);
  }

  console.log(`${changes.length} flagship engine files updated.`);
}

main();
