#!/usr/bin/env node
/**
 * Render HW (Hanwei / 捍卫) Water-Cooled Engine Spare Parts catalog pages
 * across all 7 languages (en, fr, es, pt, ru, ar, zh-cn)
 * from data/hw-parts-catalog.json + data/i18n/hw-parts-locales.json.
 *
 * Usage:
 *   node scripts/render-hw-parts-catalog.js
 *   node scripts/render-hw-parts-catalog.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const { applyToHtml } = require('./apply-site-entity-schema');
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

const root = process.env.HW_ROOT
  ? path.resolve(process.env.HW_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.HW_CATALOG
  ? path.resolve(process.env.HW_CATALOG)
  : path.join(root, 'data', 'hw-parts-catalog.json');
const hwLocalesFile = path.join(__dirname, '..', 'data', 'i18n', 'hw-parts-locales.json');
const checkOnly = process.argv.includes('--check');

const TARGET_LANGS = process.env.HW_ROOT ? ['en'] : LANGS;
const DETAIL_DIR = path.join('en', 'engine-parts', 'hw-series');
const DETAIL_MARKER = '<!-- HW PARTS DETAIL GENERATED -->';
const HUB_MARKER = '<!-- HW PARTS HUB GENERATED -->';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;
const VALID_FITMENTS = new Set(['shared', 'displacement_specific', 'verify_by_variant']);

function readCatalog() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function organizationSchema() {
  return {
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
}

function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || !catalog.series || !Array.isArray(catalog.assemblies) || !Array.isArray(catalog.parts)) {
    return ['Catalog must include series, assemblies[], and parts[]'];
  }
  const variantIds = new Set((catalog.series.engine_variants || []).map(v => v && v.id));
  const assemblyIds = new Set((catalog.assemblies || []).map(a => a && a.id));
  const slugs = new Set();

  for (const part of catalog.parts) {
    const label = (part && part.slug) || '(missing slug)';
    if (!part || !part.slug) {
      errors.push('Part entry missing slug');
      continue;
    }
    if (!SLUG_RE.test(part.slug)) errors.push(`${label}: slug must be kebab-case [a-z0-9-]`);
    if (slugs.has(part.slug)) errors.push(`${label}: duplicate slug`);
    slugs.add(part.slug);

    if (!part.product_name_en || !part.assembly_id) errors.push(`${label}: requires product_name_en and assembly_id`);
    else if (!assemblyIds.has(part.assembly_id)) errors.push(`${label}: unknown assembly_id "${part.assembly_id}"`);
    if (!part.specifications || !part.specifications.material || !part.specifications.key_spec) {
      errors.push(`${label}: specifications.material and specifications.key_spec are required`);
    }
    for (const compat of part.compatible_variants || []) {
      if (!variantIds.has(compat.variant_id)) errors.push(`${label}: unknown compatible variant "${compat.variant_id}"`);
      if (!VALID_FITMENTS.has(compat.fitment_type)) errors.push(`${label}: invalid fitment_type "${compat.fitment_type}"`);
    }
    for (const img of part.images || []) {
      const src = typeof img === 'string' ? img : img && img.src;
      if (!src || !SAFE_IMAGE_RE.test(src) || src.includes('..')) {
        errors.push(`${label}: illegal local image path "${src}"`);
      } else if (!fs.existsSync(path.join(root, src))) {
        errors.push(`${label}: local image missing on disk "${src}"`);
      }
    }
  }
  return errors;
}

function flagshipParts(catalog) {
  return (catalog.parts || []).filter(p => p && p.is_flagship_page === true);
}

function hubRelPath(lang) {
  return path.join(lang, 'engine-parts', 'hw-series.html');
}

function hubUrl(lang) {
  return `${ORIGIN}/${lang}/engine-parts/hw-series`;
}

function detailRelPath(part) {
  return path.join(DETAIL_DIR, `${part.slug}.html`);
}

function detailUrl(part) {
  return `${hubUrl('en')}/${part.slug}`;
}

function inquiryHref(lang, part, sourceTag, loc) {
  const params = new URLSearchParams();
  params.set('product_interest', 'parts');
  params.set('source_form', 'hw-series-catalog');
  params.set('source_cta', sourceTag);
  if (part) {
    const partName = (loc && loc.parts && loc.parts[part.slug]) || (lang === 'zh-cn' && part.product_name_zh) || part.product_name_en;
    params.set('btv_brand', 'HW-Water');
    params.set('btv_part', `${part.assembly_id}:${partName}`);
    params.set('btv_pn', [part.sku, part.oem_ref].filter(Boolean).join(' / '));
    const variants = (part.compatible_variants || [])
      .filter(v => v.fitment_type !== 'verify_by_variant')
      .map(v => v.variant_id);
    if (variants.length) params.set('engine_code', variants.join(', '));
    params.set('vehicle', 'HW Water-Cooled Cargo Tricycle (HW200–HW350)');
  }
  return `${rolePath('contact', lang)}?${params.toString()}`;
}

function fitmentBadgesHtml(part, loc) {
  const shared = (part.compatible_variants || []).filter(v => v.fitment_type === 'shared').map(v => v.variant_id);
  const specific = (part.compatible_variants || []).filter(v => v.fitment_type === 'displacement_specific').map(v => v.variant_id);
  const verify = (part.compatible_variants || []).filter(v => v.fitment_type === 'verify_by_variant').map(v => v.variant_id);
  const lblShared = loc ? loc.badgeShared : 'Shared';
  const lblSpecific = loc ? loc.badgeSpecific : 'Displacement-Specific';
  const lblVerify = loc ? loc.badgeVerify : 'Verify by Code';
  const badges = [];
  if (shared.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--shared">${escapeHtml(lblShared)} (${escapeHtml(shared.join(' / '))})</span>`);
  }
  if (specific.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--specific">${escapeHtml(lblSpecific)} (${escapeHtml(specific.join(' / '))})</span>`);
  }
  if (verify.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--verify">${escapeHtml(lblVerify)} (${escapeHtml(verify.join(' / '))})</span>`);
  }
  if (!badges.length) {
    badges.push('<span class="hw-fitment-badge hw-fitment-badge--verify">Confirm by Model / BOM</span>');
  }
  return `<div class="hw-fitment-badges">${badges.join('')}</div>`;
}

function partProductSchema(part, lang = 'en', loc = null, urlOverride = null) {
  const baseHub = hubUrl(lang);
  const isDetail = Boolean(urlOverride || (lang === 'en' && part.is_flagship_page));
  const url = urlOverride || (lang === 'en' && part.is_flagship_page ? detailUrl(part) : `${baseHub}#${part.slug}`);
  const id = isDetail ? `${url}#product` : `${baseHub}#product-${part.slug}`;
  const name = (loc && loc.parts && loc.parts[part.slug]) || (lang === 'zh-cn' && part.product_name_zh) || part.product_name_en;
  const variants = (part.compatible_variants || []).map(v => `${v.variant_id} (${v.fitment_type})`).join(', ');
  const properties = [
    { '@type': 'PropertyValue', name: 'Engine Series', value: 'HW Water-Cooled Series (HW200–HW350 / Hanwei)' },
    { '@type': 'PropertyValue', name: 'Material', value: part.specifications.material },
    { '@type': 'PropertyValue', name: 'Engineering Specification', value: part.specifications.key_spec },
    { '@type': 'PropertyValue', name: 'Unit', value: part.specifications.unit || 'Piece / Set' },
    { '@type': 'PropertyValue', name: 'Chixiang SKU Reference', value: part.sku || 'Match by Model / BOM' },
    { '@type': 'PropertyValue', name: 'OEM Cross-Reference', value: part.oem_ref || 'OEM-Spec Equivalent' }
  ];
  if (variants) properties.push({ '@type': 'PropertyValue', name: 'Variant Compatibility', value: variants });
  return {
    '@type': 'Product',
    '@id': id,
    name,
    description: `${name} for HW200–HW350 water-cooled cargo-tricycle engines — ${part.specifications.key_spec}`,
    category: 'Motorcycle & Cargo-Tricycle Engine Spare Parts',
    sku: part.sku || 'Match by Model / BOM',
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    url,
    additionalProperty: properties
  };
}

function renderSharedHead({ lang, title, description, canonical, ogImage, graphNodes, extraSchemas = [], hreflangBlock }) {
  const gaBlock = `<!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-16777656395');
  </script>`;
  const ymBlock = `<!-- Yandex.Metrika counter -->
  <script type="text/javascript">(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109483511,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
  <!-- /Yandex.Metrika counter -->`;

  const extraScripts = extraSchemas
    .map(s => `  <script type="application/ld+json"${s.attr ? ` ${s.attr}` : ''}>\n${JSON.stringify(s.data, null, 2)}\n  </script>`)
    .join('\n');

  const altHtml = hreflangBlock || `  <link rel="alternate" hreflang="en" href="${escapeAttr(canonical)}">\n  <link rel="alternate" hreflang="x-default" href="${escapeAttr(canonical)}">`;

  return `<head>
  ${gaBlock}
  <meta charset="UTF-8">
  ${ymBlock}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeAttr(canonical)}">
${altHtml}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261123-matrix">
  <script type="application/ld+json">
${JSON.stringify(organizationSchema(), null, 2)}
  </script>
${extraScripts}
  <script type="application/ld+json" data-site-entity-graph>
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphNodes }, null, 2)}
  </script>
</head>`;
}

function hubPageHtml(catalog, lang, hwLocales) {
  const { series, assemblies, parts } = catalog;
  const isEn = lang === 'en';
  const loc = isEn ? null : hwLocales[lang];
  const chrome = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  const canonical = hubUrl(lang);
  const title = isEn ? 'HW200–HW350 Water-Cooled Engine Spare Parts Catalog | CHIXIANG MOTOR' : loc.title;
  const description = isEn
    ? 'HW Water (Hanwei) heavy-duty cargo-tricycle engine spare parts across 8 core assemblies. High HW250/HW300 parts commonality reduces distributor inventory cost; ship consolidated with complete engines under FOB Guangzhou.'
    : loc.description;
  const h1 = isEn ? 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog' : loc.h1;
  const quoteHref = `${rolePath('contact', lang)}?product_interest=parts&source_form=hw-series-catalog&source_cta=hw-hub-header`;
  const waUrl = waHref(lang, 'HW250 / HW300 Spare Parts & Overhaul Kits');

  const variantCards = (series.engine_variants || []).map(v => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(v.id)} (${escapeHtml(v.displacement)})</h3>
            <p><strong>${escapeHtml(loc ? loc.boreStrokeLabel : 'Bore × Stroke:')}</strong> ${escapeHtml(v.bore_stroke)}<br><strong>${escapeHtml(loc ? loc.coolingLabel : 'Cooling:')}</strong> ${escapeHtml(loc ? loc.coolingValue : v.cooling)}</p>
          </div>`).join('');

  const variantOptions = (series.engine_variants || [])
    .map(v => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.id)} (${escapeHtml(v.displacement)})</option>`)
    .join('');
  const assemblyOptions = assemblies
    .map(a => {
      const aName = (loc && loc.assemblies && loc.assemblies[a.id]?.[0]) || (lang === 'zh-cn' && a.name_zh) || a.name_en;
      return `<option value="${escapeHtml(a.id)}">${escapeHtml(aName)}</option>`;
    })
    .join('');

  const assemblyBlocks = assemblies.map(assembly => {
    const assemblyParts = parts.filter(p => p.assembly_id === assembly.id);
    const hubVariants = [...new Set(assemblyParts.flatMap(p => (p.compatible_variants || []).map(v => v.variant_id)))].join(',');
    const aName = (loc && loc.assemblies && loc.assemblies[assembly.id]?.[0]) || (lang === 'zh-cn' && assembly.name_zh) || assembly.name_en;
    const aDesc = (loc && loc.assemblies && loc.assemblies[assembly.id]?.[1]) || assembly.description_en;

    const rows = assemblyParts.map(part => {
      const compatList = (part.compatible_variants || []).map(v => v.variant_id).join(',');
      const pName = (loc && loc.parts && loc.parts[part.slug]) || (lang === 'zh-cn' && part.product_name_zh) || part.product_name_en;
      const searchTokens = [
        pName,
        part.product_name_en,
        part.sku,
        part.oem_ref,
        part.specifications.material,
        part.specifications.key_spec,
        ...(part.public_aliases || []),
        compatList
      ].join(' ').toLowerCase();
      const nameHtml = (isEn && part.is_flagship_page)
        ? `<a href="${escapeAttr(`/en/engine-parts/hw-series/${part.slug}`)}" style="color:var(--accent-color);font-weight:600;">${escapeHtml(pName)}</a>`
        : escapeHtml(pName);
      return `<tr id="${escapeHtml(part.slug)}" data-btv-row-category="${escapeHtml(assembly.id)}" data-btv-row-variants="${escapeHtml(compatList)}" data-btv-search="${escapeAttr(searchTokens)}">
                <td class="btv-col-select"><input type="checkbox" class="btv-part-checkbox" aria-label="${escapeAttr(`Select ${pName}`)}" data-btv-brand="HW-Water" data-btv-model="${escapeAttr(aName)}" data-btv-part="${escapeAttr(pName)}" data-btv-category="${escapeAttr(assembly.id)}" data-btv-pn="${escapeAttr(part.sku || 'Match by Model / BOM')}" data-btv-oem="${escapeAttr(part.oem_ref || 'OEM-Spec Equivalent')}"></td>
                <th>${nameHtml}</th>
                <td>${escapeHtml(part.sku || 'Match by Model / BOM')}</td>
                <td>${escapeHtml(part.oem_ref || 'OEM-Spec Equivalent')}</td>
                <td><strong>${escapeHtml(part.specifications.material)}</strong><br><span style="color:var(--text-secondary);font-size:0.86rem;">${escapeHtml(part.specifications.key_spec)}</span></td>
                <td>${fitmentBadgesHtml(part, loc)}</td>
                <td><a class="btn btn-accent btn-sm" href="${escapeAttr(inquiryHref(lang, part, 'hw-part-row', loc))}">${escapeHtml(loc ? loc.quoteBtn : 'Quote')}</a></td>
              </tr>`;
    }).join('\n              ');

    const bodyContent = rows || `<tr><td colspan="7">Parts list for ${escapeHtml(aName)} is matched by engine code and BOM upon request.</td></tr>`;

    return `        <div class="catalog-table-block" id="assembly-${escapeHtml(assembly.id)}" data-btv-model-hub="${escapeHtml(assembly.id)}" data-btv-hub-variants="${escapeHtml(hubVariants)}" style="margin-top:2rem;">
          <div class="btv-model-hub-head">
            <h3>${escapeHtml(aName)}</h3>
            <span class="btv-supply-badge btv-supply-badge--parts">${assemblyParts.length} ${escapeHtml(loc ? loc.entryUnit : 'Core Entry Item(s)')}</span>
          </div>
          <p style="color:var(--text-secondary);margin:0.45rem 0 0.85rem;line-height:1.7;">${escapeHtml(aDesc)}</p>
          <p class="table-scroll-hint">${loc ? escapeHtml(loc.swipeHint) : '&larr; Swipe horizontally to view compatibility badges &amp; select parts &rarr;'}</p>
          <div class="responsive-table-wrap" tabindex="0">
            <table class="specs-table catalog-spec-table btv-bom-table">
              <thead>
                <tr>
                  <th class="btv-col-select">${escapeHtml(loc ? loc.thPick : 'Pick')}</th>
                  <th>${escapeHtml(loc ? loc.thName : 'Part Name')}</th>
                  <th>${escapeHtml(loc ? loc.thSku : 'Chixiang SKU')}</th>
                  <th>${escapeHtml(loc ? loc.thOem : 'OEM Ref.')}</th>
                  <th>${escapeHtml(loc ? loc.thSpec : 'Material & Key Specification')}</th>
                  <th>${escapeHtml(loc ? loc.thCompat : 'HW Variant Compatibility')}</th>
                  <th>${escapeHtml(loc ? loc.thInquiry : 'Inquiry')}</th>
                </tr>
              </thead>
              <tbody>
              ${bodyContent}
              </tbody>
            </table>
          </div>
        </div>`;
  }).join('\n');

  const faqEntries = isEn
    ? [
      [
        'Which HW250 and HW300 components are interchangeable?',
        'Crankcases, 20-roller one-way clutches, 5-speed transmission shafts, water pumps, high-output DC magnetos, and fastener kits share high commonality across HW250 and HW300 platforms, while cylinder blocks, piston kits, and crankshafts are matched by displacement.'
      ],
      [
        'What is the difference between a Cylinder Head Assembly and a Cylinder Head Cover?',
        'The Cylinder Head Assembly is the water-jacketed main casting housing intake/exhaust ports, valve seats, and rocker arms, whereas the Cylinder Head Cover is the upper valve/rocker cover bolted above the head. Both are supplied as separate SKUs.'
      ],
      [
        'Can HW spare parts ship without meeting the 50-unit complete engine MOQ?',
        'Complete-engine wholesale orders start at 50 units (mixed models supported). HW replacement spare parts can ship consolidated inside 50-unit+ complete-engine containers or be quoted independently per part BOM (~10 working days regular lead time, FOB Guangzhou, 60-day warranty after destination port arrival).'
      ]
    ]
    : loc.faqs;

  const faqSchema = {
    attr: 'data-hw-faq-schema',
    data: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntries.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    }
  };

  const itemListSchema = {
    attr: 'data-product-family-schema',
    data: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isEn ? 'HW200–HW350 Water-Cooled Engine Spare Parts' : loc.itemListName,
      numberOfItems: parts.length,
      itemListElement: parts.map((part, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: partProductSchema(part, lang, loc)
      }))
    }
  };

  const graphNodes = [
    {
      '@type': 'CollectionPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: h1,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: lang,
      description,
      breadcrumb: { '@id': `${canonical}#breadcrumb` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: chrome.nav.home, item: roleUrl('home', lang) },
        { '@type': 'ListItem', position: 2, name: chrome.nav.products, item: roleUrl('products', lang) },
        { '@type': 'ListItem', position: 3, name: chrome.nav.parts, item: roleUrl('parts', lang) },
        { '@type': 'ListItem', position: 4, name: h1, item: canonical }
      ]
    }
  ];

  const hreflangBlock = TARGET_LANGS.length === 1 ? '' : hreflangTagsHtml('hw-series');
  const head = renderSharedHead({
    lang,
    title,
    description,
    canonical,
    ogImage: `${ORIGIN}/images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp`,
    graphNodes,
    extraSchemas: [itemListSchema, faqSchema],
    hreflangBlock
  });

  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const capsuleTitle = isEn ? 'Factory-Matched Service Kits & ~80% HW250 / HW300 Platform Commonality' : loc.capsuleTitle;
  const interchangeability = isEn ? series.interchangeability_note_en : loc.interchangeability;
  const consolidatedHtml = isEn
    ? '<strong>Factory-Matched Service Kits &amp; Consolidated Loading:</strong> All overhaul kits and components—led by our Top-End Cylinder &amp; Piston Kit, Cylinder Head &amp; Valve Kit, Full Overhaul Gasket &amp; Seal Kit, and Heavy-Duty Clutch &amp; Transmission Kit—are <strong>factory-matched to CHIXIANG HW-series assembly specifications</strong> and available for consolidated loading alongside 50-unit+ complete-engine orders (~10 working days standard lead time, FOB Guangzhou, 60-day warranty after destination port arrival).'
    : escapeHtml(loc.consolidatedNote);

  return `<!DOCTYPE html>
<html lang="${HREFLANG_MAP[lang]}"${dirAttr}>
${head}
<body class="${lang === 'zh-cn' ? 'zh-cn-page ' : ''}btv-page">
${HUB_MARKER}
${renderMobileNav(lang, 'hw-series', quoteHref)}
${renderNavbar(lang, 'hw-series', 'parts', quoteHref)}
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><a href="${rolePath('products', lang)}">${escapeHtml(chrome.nav.products)}</a><span aria-hidden="true">/</span><a href="${rolePath('parts', lang)}">${escapeHtml(chrome.nav.parts)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(h1)}</span></nav>
      <h1>${escapeHtml(h1)}</h1>
      <div class="hw-ai-capsule">
        <h2>${escapeHtml(capsuleTitle)}</h2>
        <p>${escapeHtml(interchangeability)}</p>
        <p style="margin-top:0.65rem;color:var(--text-secondary);font-size:0.92rem;">${consolidatedHtml}</p>
        <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
          <a href="#assembly-factory-matched-kits" class="btn btn-accent btn-sm">${escapeHtml(isEn ? 'Browse Factory-Matched Service Kits' : loc.ctaBrowseKits)}</a>
          <a href="${escapeAttr(quoteHref)}" class="btn btn-outline btn-sm">${escapeHtml(isEn ? 'Request Parts Quotation' : loc.ctaQuote)}</a>
          <a href="${rolePath('cg', lang)}#hw-water-specifications" class="btn btn-primary btn-sm">${escapeHtml(isEn ? 'View Complete HW200–HW350 Engines →' : loc.ctaEngines)}</a>
          <a href="${rolePath('hw300-water-cooled-engine', lang)}" class="btn btn-outline btn-sm">${escapeHtml(isEn ? 'HW300 Flagship Engine Specs →' : loc.ctaHw300)}</a>
        </div>
      </div>
    </div></section>

    <section class="section" style="padding-bottom:1.5rem;">
      <div class="container">
        <h2 class="section-title">${escapeHtml(isEn ? 'Supported HW Engine Platforms' : loc.platformsTitle)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">${variantCards}
        </div>
      </div>
    </section>

    <section class="section" id="model-hubs" data-btv-section="model-hubs" data-source-form="hw-series-catalog">
      <div class="container">
        <h2 class="section-title">${escapeHtml(isEn ? 'Factory-Matched Service Kits & Core Assembly BOM' : loc.bomTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(isEn ? 'Start with pinned Factory-Matched Service Kits or filter across all 8 core assemblies by displacement and keyword. Check items below for consolidated quotation.' : loc.bomSub)}</p>
        <div class="btv-hub-toolbar">
          <div class="btv-hub-toolbar__field">
            <label for="hwVariantFilter">${escapeHtml(isEn ? 'Engine Displacement' : loc.filterDisp)}</label>
            <select id="hwVariantFilter" data-btv-filter-model>
              <option value="">${escapeHtml(isEn ? 'All Variants (HW200–HW350)' : loc.filterAllDisp)}</option>
              ${variantOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="hwAssemblyFilter">${escapeHtml(isEn ? 'Kit & Assembly Filter' : loc.filterCat)}</label>
            <select id="hwAssemblyFilter" data-btv-filter-category>
              <option value="">${escapeHtml(isEn ? 'All Categories (Factory-Matched Kits + 8 Assemblies)' : loc.filterAllCat)}</option>
              ${assemblyOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="hwSearchFilter">${escapeHtml(isEn ? 'Search Part / Keyword' : loc.filterSearch)}</label>
            <input type="search" id="hwSearchFilter" placeholder="${escapeAttr(isEn ? 'e.g. clutch, water pump, cylinder head' : loc.filterPlaceholder)}" data-btv-filter-search>
          </div>
          <div class="btv-hub-toolbar__count" data-btv-filter-count>${isEn ? `Showing ${parts.length} matching part(s)` : `${parts.length} ${loc.showingText}`}</div>
        </div>
${assemblyBlocks}
        <div class="btv-quote-basket" id="btvQuoteBasket" hidden>
          <div class="btv-quote-basket__info">
            <strong>${escapeHtml(isEn ? 'Selected HW Parts for Quote' : loc.basketLabel)} (<span data-btv-basket-count>0</span>)</strong>
          </div>
          <div class="btv-quote-basket__actions">
            <button type="button" class="btn btn-outline btn-sm" data-btv-basket-clear>${escapeHtml(isEn ? 'Clear' : loc.basketClear)}</button>
            <button type="button" class="btn btn-accent btn-sm" data-btv-basket-submit>${escapeHtml(isEn ? 'Request Batch Quote →' : loc.basketSubmit)}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);" data-hw-faq>
      <div class="container">
        <h2 class="section-title">${escapeHtml(isEn ? 'HW Parts Engineering & Procurement FAQ' : loc.faqTitle)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${faqEntries.map(([q, a]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="cta-section"><div class="container">
      <h2>${escapeHtml(isEn ? 'Need a verified HW parts BOM or mixed container quote?' : loc.ctaBottomTitle)}</h2>
      <p style="color:var(--text-secondary);max-width:650px;margin:0 auto;line-height:1.7;">${escapeHtml(isEn ? 'Share your HW engine model, part list or photos, and destination port. Mixed loading with complete HW200–HW350 or CG air/water-cooled engines is supported.' : loc.ctaBottomDesc)}</p>
      <div class="cta-actions"><a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">${escapeHtml(isEn ? 'Send Parts Inquiry' : loc.ctaSend)}</a><a href="${rolePath('parts', lang)}" class="btn btn-primary btn-lg">${escapeHtml(isEn ? 'Back to All Engine Parts' : loc.ctaBack)}</a></div>
    </div></section>
  </main>
${renderFooter(lang, waUrl, quoteHref, ['/js/btv-catalog-basket.js'])}
</body>
</html>
`;
}

function flagshipDetailHtml(part, catalog) {
  const canonical = detailUrl(part);
  const title = `${part.product_name_en} for HW200–HW350 Water-Cooled Engines | CHIXIANG MOTOR`;
  const description = `${part.product_name_en} (${part.sku || 'OEM-Spec Equivalent'}) — ${part.specifications.key_spec}. Material: ${part.specifications.material}. Export supply for HW heavy-duty cargo-tricycle fleets.`;
  const quoteHref = inquiryHref('en', part, 'hw-flagship-detail', null);
  const waUrl = waHref('en', part.product_name_en);
  const assembly = (catalog.assemblies || []).find(a => a.id === part.assembly_id);
  const firstImg = (part.images || [])[0];
  const imgSrc = typeof firstImg === 'string' ? firstImg : firstImg && firstImg.src;
  const ogImage = imgSrc ? `${ORIGIN}/${imgSrc}` : `${ORIGIN}/images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp`;

  const graphNodes = [
    {
      '@type': 'ItemPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: part.product_name_en,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      mainEntity: { '@id': `${canonical}#product` },
      inLanguage: 'en',
      description,
      breadcrumb: { '@id': `${canonical}#breadcrumb` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/en/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${ORIGIN}/en/products` },
        { '@type': 'ListItem', position: 3, name: 'Engine Parts', item: `${ORIGIN}/en/engine-parts` },
        { '@type': 'ListItem', position: 4, name: 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog', item: hubUrl('en') },
        { '@type': 'ListItem', position: 5, name: part.product_name_en, item: canonical }
      ]
    }
  ];

  const productSchema = {
    attr: 'data-hw-product-schema',
    data: {
      '@context': 'https://schema.org',
      ...partProductSchema(part, 'en', null, canonical)
    }
  };

  const photosHtml = (part.images || []).length
    ? `<section class="section" style="background:var(--bg-secondary);"><div class="container"><h2 class="section-title">Component Photos</h2>
      <div class="products-grid">${part.images.map(img => {
        const src = typeof img === 'string' ? img : img.src;
        const alt = (typeof img === 'object' && img.alt) || part.product_name_en;
        return `<div class="product-card"><div class="product-img has-img" style="background-image:url('/${escapeHtml(src)}')" role="img" aria-label="${escapeHtml(alt)}"></div><div class="product-info"><p>${escapeHtml(alt)}</p></div></div>`;
      }).join('')}</div></div></section>`
    : '';

  const head = renderSharedHead({
    lang: 'en',
    title,
    description,
    canonical,
    ogImage,
    graphNodes,
    extraSchemas: [productSchema]
  });

  return `<!DOCTYPE html>
<html lang="en">
${head}
<body class="btv-page">
${DETAIL_MARKER}
${renderMobileNav('en', 'hw-series', quoteHref)}
${renderNavbar('en', 'hw-series', 'parts', quoteHref)}
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/en/">Home</a><span aria-hidden="true">/</span><a href="/en/products">Products</a><span aria-hidden="true">/</span><a href="/en/engine-parts">Engine Parts</a><span aria-hidden="true">/</span><a href="/en/engine-parts/hw-series">HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(part.product_name_en)}</span></nav>
      <h1>${escapeHtml(part.product_name_en)}</h1>
      <p class="section-subtitle">${escapeHtml(description)}</p>
    </div></section>
${photosHtml}
    <section class="section"><div class="container">
      <h2 class="section-title">Engineering Specifications &amp; Fitment</h2>
      <div class="responsive-table-wrap" tabindex="0">
        <table class="specs-table catalog-spec-table">
          <tbody>
            <tr><th scope="row">Assembly System</th><td>${escapeHtml(assembly ? assembly.name_en : part.assembly_id)}</td></tr>
            <tr><th scope="row">Chixiang SKU Reference</th><td>${escapeHtml(part.sku || 'Match by Model / BOM')}</td></tr>
            <tr><th scope="row">OEM Cross-Reference</th><td>${escapeHtml(part.oem_ref || 'OEM-Spec Equivalent')}</td></tr>
            <tr><th scope="row">Material Standard</th><td>${escapeHtml(part.specifications.material)}</td></tr>
            <tr><th scope="row">Engineering Specification</th><td>${escapeHtml(part.specifications.key_spec)}</td></tr>
            <tr><th scope="row">Packaging Unit</th><td>${escapeHtml(part.specifications.unit || 'Set / Piece')}</td></tr>
            <tr><th scope="row">HW Variant Compatibility</th><td>${fitmentBadgesHtml(part, null)}</td></tr>
          </tbody>
        </table>
      </div>
    </div></section>
    <section class="cta-section"><div class="container">
      <h2>Request quotation for ${escapeHtml(part.product_name_en)}</h2>
      <p style="color:var(--text-secondary);max-width:650px;margin:0 auto;line-height:1.7;">Consolidate with 50-unit+ complete-engine orders or quote independently per BOM. ~10 working days regular lead time, FOB Guangzhou, 60-day warranty after destination port arrival.</p>
      <div class="cta-actions"><a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">Quote This Part</a><a href="/en/engine-parts/hw-series" class="btn btn-primary btn-lg">All HW Series Parts</a></div>
    </div></section>
  </main>
${renderFooter('en', waUrl, quoteHref, ['/js/btv-catalog-basket.js'])}
</body>
</html>
`;
}

function listOwnedDetailFiles() {
  const absDir = path.join(root, DETAIL_DIR);
  if (!fs.existsSync(absDir)) return [];
  const resolvedDir = path.resolve(absDir);
  const found = [];
  for (const name of fs.readdirSync(absDir)) {
    if (!name.endsWith('.html')) continue;
    const abs = path.join(absDir, name);
    const resolved = path.resolve(abs);
    if (!resolved.startsWith(resolvedDir + path.sep)) continue;
    const html = fs.readFileSync(abs, 'utf8');
    found.push({
      rel: path.join(DETAIL_DIR, name),
      abs,
      managed: html.includes(DETAIL_MARKER)
    });
  }
  return found;
}

function syncSitemap(catalog) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const want = new Set([
    ...TARGET_LANGS.map(l => hubUrl(l)),
    ...flagshipParts(catalog).map(detailUrl)
  ]);
  const seen = new Set();
  let removed = 0;

  let out = xml.replace(
    / {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/(?:en|fr|es|pt|ru|ar|zh-cn)\/engine-parts\/hw-series(?:\/[^<]+)?)<\/loc>[\s\S]*?<\/url>\r?\n/g,
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
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${url.endsWith('/hw-series') ? '0.8' : '0.6'}</priority>\n  </url>\n</urlset>`
    );
    seen.add(url);
  }
  return { changed: removed > 0 || added.length > 0, next: out };
}

function main() {
  const catalog = readCatalog();
  const errors = validateCatalog(catalog);
  if (errors.length) {
    console.error('HW parts catalog validation failed:');
    for (const err of errors) console.error('  - ' + err);
    process.exit(2);
  }

  const hwLocales = fs.existsSync(hwLocalesFile) ? JSON.parse(fs.readFileSync(hwLocalesFile, 'utf8')) : {};
  const changes = [];

  for (const lang of TARGET_LANGS) {
    const rel = hubRelPath(lang);
    const hubAbs = path.join(root, rel);
    const rawHub = hubPageHtml(catalog, lang, hwLocales);
    const expectedHub = (process.env.HW_ROOT ? rawHub : applyToHtml(rawHub, hubUrl(lang))).replace(/\r?\n/g, '\r\n');
    const currentHub = fs.existsSync(hubAbs) ? fs.readFileSync(hubAbs, 'utf8') : '';
    if (currentHub !== expectedHub) {
      changes.push({ file: rel, stale: true });
      if (!checkOnly) {
        fs.mkdirSync(path.dirname(hubAbs), { recursive: true });
        fs.writeFileSync(hubAbs, expectedHub, 'utf8');
      }
    }
  }

  const expectedDetailSet = new Set();
  for (const part of flagshipParts(catalog)) {
    const rel = detailRelPath(part);
    expectedDetailSet.add(rel);
    const abs = path.join(root, rel);
    const rawDetail = flagshipDetailHtml(part, catalog);
    const html = (process.env.HW_ROOT ? rawDetail : applyToHtml(rawDetail, detailUrl(part))).replace(/\r?\n/g, '\r\n');
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (current !== html) {
      changes.push({ file: rel, stale: true });
      if (!checkOnly) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, html, 'utf8');
      }
    }
  }

  for (const file of listOwnedDetailFiles()) {
    if (expectedDetailSet.has(file.rel)) continue;
    if (file.managed) {
      changes.push({ file: file.rel, stale: true, removed: !checkOnly });
      if (!checkOnly) fs.unlinkSync(file.abs);
    }
  }

  const sitemap = syncSitemap(catalog);
  if (sitemap.changed) {
    changes.push({ file: 'sitemap.xml', stale: true });
    if (!checkOnly) fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.next, 'utf8');
  }

  if (checkOnly) {
    const stale = changes.filter(c => c.stale || c.error);
    for (const item of stale) {
      if (item.error) console.log(`ERROR ${item.file}: ${item.error}`);
      else console.log(`STALE ${item.file}`);
    }
    console.log(`${stale.length} HW parts catalog files need updates.`);
    process.exit(stale.length ? 1 : 0);
  }

  console.log(`${changes.length} HW parts catalog files updated.`);
}

main();
