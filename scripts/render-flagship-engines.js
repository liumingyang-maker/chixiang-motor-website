#!/usr/bin/env node
/**
 * Render CHIXIANG MOTOR Flagship Engine Product Pages V1
 * from data/flagship-engines.json.
 *
 * Outputs:
 *   - en/cg-engine/{slug}.html (/en/cg-engine/{slug}) for published === true
 *   - Syncs sitemap.xml cleanly without exposing .html suffixes
 *
 * Usage:
 *   node scripts/render-flagship-engines.js
 *   node scripts/render-flagship-engines.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');

const root = process.env.FLAGSHIP_ROOT
  ? path.resolve(process.env.FLAGSHIP_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.FLAGSHIP_DATA
  ? path.resolve(process.env.FLAGSHIP_DATA)
  : path.join(root, 'data', 'flagship-engines.json');
const checkOnly = process.argv.includes('--check');

const ORIGIN = 'https://chixiangmotor.com';
const ORG_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;
const DETAIL_DIR = path.join('en', 'cg-engine');
const GENERATED_MARKER = '<!-- FLAGSHIP ENGINE GENERATED -->';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function detailRelPath(engine) {
  return path.join(DETAIL_DIR, `${engine.slug}.html`);
}

function canonicalUrl(engine) {
  return `${ORIGIN}/en/cg-engine/${engine.slug}`;
}

function resolveBundledParts(engine) {
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
      items.push({
        pn: part.sku || part.part_number || '',
        name: part.product_name_en,
        spec: part.specifications && part.specifications.key_spec ? part.specifications.key_spec : '',
        oem: part.oem_ref || ''
      });
    }
  }
  return items.slice(0, 8);
}

function renderSharedHead(engine) {
  const url = canonicalUrl(engine);
  const pageName = engine.seo.h1;
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
        description: 'Motorcycle and cargo-tricycle engine manufacturer in Chongqing, China, with industry experience since 2003.',
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

  const additionalProperty = [
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
  if (engine.oil_capacity) {
    additionalProperty.push({ '@type': 'PropertyValue', name: 'Oil Capacity', value: engine.oil_capacity });
  }
  if (engine.carburetor) {
    additionalProperty.push({ '@type': 'PropertyValue', name: 'Carburetor', value: engine.carburetor });
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: engine.seo.h1,
    sku: engine.sku,
    model: engine.model,
    category: engine.family,
    description: engine.quick_verdict,
    image: engine.gallery_images.map(img => `${ORIGIN}/${img.src}`),
    url,
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    additionalProperty
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (engine.faqs || []).map(item => ({
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
        inLanguage: 'en',
        description: engine.seo.description,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#product` }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/en/` },
          { '@type': 'ListItem', position: 2, name: 'CG Engine Series', item: `${ORIGIN}/en/cg-engine` },
          { '@type': 'ListItem', position: 3, name: pageName, item: url }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-16777656395');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(engine.seo.title)}</title>
  <meta name="description" content="${escapeHtml(engine.seo.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(url)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(url)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}">
  <link rel="stylesheet" href="/css/style.css?v=20261119-flagship">
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

function renderNav(quoteHref) {
  return `  <div class="mobile-nav" id="mobileNav">
    <div class="mobile-nav-header">
      <div class="mobile-nav-brand">
        <div class="mobile-nav-logo">CHIXIANG MOTOR</div>
        <div class="mobile-nav-tagline">Professional Motorcycle Engine Manufacturer</div>
      </div>
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <ul class="mobile-nav-list">
      <li><a href="/en/">Home<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/products">Products<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/cg-engine">CG Engine Series<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/cb-engine">CB Engine Series<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/horizontal-engine">Horizontal Engine Series<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/engine-parts">Engine Parts Series<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/engine-parts/hw-series">HW200–HW350 Parts<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/bajaj-tvs-engines-parts">Bajaj / TVS Engines &amp; Parts<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/evidence">Evidence Center<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/about">About Us<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/news">News<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="/en/contact">Contact Us<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="${escapeHtml(quoteHref)}" class="mnav-accent">Get a Quote<span class="mnav-arrow">&rsaquo;</span></a></li>
    </ul>
  </div>
  <nav class="navbar">
    <div class="container">
      <a href="/en/" class="nav-logo"><span class="logo-icon"><img src="/images/logo.webp" alt="CHIXIANG MOTOR" width="36" height="36" decoding="async"></span><span class="logo-text">CHIXIANG MOTOR</span></a>
      <ul class="nav-links" role="navigation" aria-label="Main navigation">
        <li><a href="/en/">Home</a></li>
        <li><a href="/en/products" class="active">Products</a></li>
        <li class="nav-item-dropdown">
          <a href="/en/engine-parts">Engine Parts <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></a>
          <ul class="nav-dropdown">
            <li><a href="/en/engine-parts">All Engine Parts</a></li>
            <li><a href="/en/engine-parts/hw-series">HW200–HW350 Kits &amp; Parts</a></li>
            <li><a href="/en/bajaj-tvs-engines-parts">Bajaj / TVS Engines &amp; Parts</a></li>
          </ul>
        </li>
        <li><a href="/en/evidence">Evidence</a></li>
        <li><a href="/en/about">About Us</a></li>
        <li><a href="/en/news">News</a></li>
        <li><a href="/en/contact">Contact</a></li>
      </ul>
      <div class="nav-right">
        <a href="${escapeHtml(quoteHref)}" class="btn btn-accent btn-sm">Get a Quote</a>
        <button class="menu-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>`;
}

function renderFooter(quoteHref) {
  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.</h4>
          <p>CHIXIANG MOTOR &middot; Motorcycle engine industry experience since 2003. Company registered in 2007.</p>
          <p style="margin-top:0.5rem;">No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="/en/products">Products</a><br>
          <a href="/en/cg-engine">CG Engine Series</a><br>
          <a href="/en/cg-engine/cg150-air-cooled-engine">CG150 Flagship Engine</a><br>
          <a href="/en/cg-engine/cg200-air-cooled-engine">CG200 Flagship Engine</a><br>
          <a href="/en/cg-engine/cg250sb-water-cooled-engine">CG250SB Flagship Engine</a><br>
          <a href="/en/cg-engine/hw300-water-cooled-engine">HW300 Flagship Engine</a><br>
          <a href="/en/engine-parts/hw-series">HW Series Parts Catalog</a><br>
          <a href="/en/contact">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <p>Tel: +86 19008225410</p>
          <p>WhatsApp: +86 19008225410</p>
          <p style="margin-top:0.5rem;">Email: chixiangmotor@163.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) &middot; Export documentation and logistics are executed through Chixiang's designated export division.</span>
        <span>Chongqing, China</span>
      </div>
    </div>
  </footer>
  <a href="https://wa.me/8619008225410" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 10.65 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
  </a>
  <div class="mobile-cta-bar">
    <a href="https://wa.me/8619008225410" class="btn btn-wa" target="_blank" rel="noopener">WhatsApp</a>
    <a href="${escapeHtml(quoteHref)}" class="btn btn-quote">Get a Quote</a>
  </div>
  <div class="flagship-lightbox" id="flagshipLightbox" aria-hidden="true" role="dialog" aria-label="Engine photo zoom">
    <button type="button" class="flagship-lightbox-close" id="flagshipLightboxClose" aria-label="Close image preview">&times;</button>
    <img id="flagshipLightboxImg" src="" alt="">
  </div>
  <script src="/js/main.js" defer></script>
  <script src="/js/core-menu-accessibility.js" defer></script>
  <script src="/js/flagship-engine-page.js" defer></script>`;
}

function renderEnginePage(engine) {
  const quoteHref = `/en/contact?product_interest=cg&source_form=flagship-engine-page&source_cta=hero-quote&engine_code=${encodeURIComponent(engine.model)}&vehicle=${encodeURIComponent(engine.vehicle_context)}&btv_pn=${encodeURIComponent(engine.sku)}`;
  const primaryImg = engine.gallery_images[0];
  const bundledParts = resolveBundledParts(engine);

  const thumbsHtml = engine.gallery_images.map((img, idx) => `
            <button type="button" class="flagship-thumb" data-flagship-thumb data-src="/${escapeHtml(img.src)}" data-alt="${escapeHtml(img.alt)}" data-caption="${escapeHtml(img.caption)}" aria-pressed="${idx === 0 ? 'true' : 'false'}" aria-label="View photo ${idx + 1}: ${escapeHtml(img.caption)}">
              <img src="/${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" width="160" height="120">
            </button>`).join('');

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
    const modelCell = row.current
      ? `<strong>${escapeHtml(row.model)}</strong>`
      : `<a href="${escapeHtml(row.url)}">${escapeHtml(row.model)}</a>`;
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

  return `${renderSharedHead(engine)}
<body class="flagship-page">
  ${GENERATED_MARKER}
${renderNav(quoteHref)}

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
            <div class="flagship-gallery-main">
              <img id="flagshipMainImg" src="/${escapeHtml(primaryImg.src)}" alt="${escapeHtml(primaryImg.alt)}" width="800" height="600" loading="eager">
              <div class="flagship-gallery-caption" id="flagshipMainCaption">${escapeHtml(primaryImg.caption)}</div>
            </div>
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
              <a href="https://wa.me/8619008225410?text=${encodeURIComponent(`Hello CHIXIANG MOTOR, I would like a wholesale quote for ${engine.model} (${engine.sku}).`)}" class="btn btn-outline" target="_blank" rel="noopener">WhatsApp</a>
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
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-model="${escapeHtml(engine.model)}" data-engine-code="${escapeHtml(engine.model)}" data-vehicle="${escapeHtml(engine.vehicle_context)}" data-engine-sku="${escapeHtml(engine.sku)}" data-product-interest="cg">
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

${renderFooter(quoteHref)}
</body>
</html>
`;
}

function listOwnedFiles() {
  const dir = path.join(root, DETAIL_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.html'))
    .map(d => {
      const abs = path.join(dir, d.name);
      const content = fs.readFileSync(abs, 'utf8');
      return {
        rel: path.join(DETAIL_DIR, d.name),
        abs,
        managed: content.includes(GENERATED_MARKER)
      };
    });
}

function syncSitemap(engines) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const want = new Set(engines.map(canonicalUrl));
  const seen = new Set();
  let removed = 0;

  let out = xml.replace(
    / {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/en\/cg-engine\/[^<]+)<\/loc>[\s\S]*?<\/url>\r?\n/g,
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

  const active = publishedEngines(data);
  const expectedSet = new Set();
  const changes = [];

  for (const engine of active) {
    const rel = detailRelPath(engine);
    expectedSet.add(rel);
    const abs = path.join(root, rel);
    const html = renderEnginePage(engine).replace(/\r?\n/g, '\r\n');
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (current !== html) {
      changes.push({ file: rel, stale: true });
      if (!checkOnly) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, html, 'utf8');
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
