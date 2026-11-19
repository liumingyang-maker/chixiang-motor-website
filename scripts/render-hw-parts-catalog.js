#!/usr/bin/env node
/**
 * Render HW (Hanwei / 捍卫) Water-Cooled Engine Spare Parts V1 catalog pages
 * from data/hw-parts-catalog.json.
 *
 * Outputs:
 *   - en/engine-parts/hw-series.html        (/en/engine-parts/hw-series)
 *   - en/engine-parts/hw-series/{slug}.html (/en/engine-parts/hw-series/{slug}) for is_flagship_page === true
 *   - Syncs sitemap.xml cleanly without exposing .html suffixes
 *
 * Usage:
 *   node scripts/render-hw-parts-catalog.js
 *   node scripts/render-hw-parts-catalog.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');

const root = process.env.HW_ROOT
  ? path.resolve(process.env.HW_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.HW_CATALOG
  ? path.resolve(process.env.HW_CATALOG)
  : path.join(root, 'data', 'hw-parts-catalog.json');
const checkOnly = process.argv.includes('--check');

const ORIGIN = 'https://chixiangmotor.com';
const ORG_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;
const HUB_REL = path.join('en', 'engine-parts', 'hw-series.html');
const HUB_URL = `${ORIGIN}/en/engine-parts/hw-series`;
const DETAIL_DIR = path.join('en', 'engine-parts', 'hw-series');
const DETAIL_MARKER = '<!-- HW PARTS DETAIL GENERATED -->';
const HUB_MARKER = '<!-- HW PARTS HUB GENERATED -->';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;
const VALID_FITMENTS = new Set(['shared', 'displacement_specific', 'verify_by_variant']);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    if (!SLUG_RE.test(part.slug)) {
      errors.push(`${label}: slug must be kebab-case [a-z0-9-]`);
    }
    if (slugs.has(part.slug)) {
      errors.push(`${label}: duplicate slug`);
    }
    slugs.add(part.slug);

    if (!part.product_name_en || !part.assembly_id) {
      errors.push(`${label}: requires product_name_en and assembly_id`);
    } else if (!assemblyIds.has(part.assembly_id)) {
      errors.push(`${label}: unknown assembly_id "${part.assembly_id}"`);
    }
    if (!part.specifications || !part.specifications.material || !part.specifications.key_spec) {
      errors.push(`${label}: specifications.material and specifications.key_spec are required`);
    }
    for (const compat of part.compatible_variants || []) {
      if (!variantIds.has(compat.variant_id)) {
        errors.push(`${label}: unknown compatible variant "${compat.variant_id}"`);
      }
      if (!VALID_FITMENTS.has(compat.fitment_type)) {
        errors.push(`${label}: invalid fitment_type "${compat.fitment_type}"`);
      }
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

function detailRelPath(part) {
  return path.join(DETAIL_DIR, `${part.slug}.html`);
}

function detailUrl(part) {
  return `${HUB_URL}/${part.slug}`;
}

function inquiryHref(part, sourceTag) {
  const params = new URLSearchParams();
  params.set('product_interest', 'parts');
  params.set('source_form', 'hw-series-catalog');
  params.set('source_cta', sourceTag);
  if (part) {
    params.set('btv_brand', 'HW-Water');
    params.set('btv_part', `${part.assembly_id}:${part.product_name_en}`);
    params.set('btv_pn', [part.sku, part.oem_ref].filter(Boolean).join(' / '));
    const variants = (part.compatible_variants || [])
      .filter(v => v.fitment_type !== 'verify_by_variant')
      .map(v => v.variant_id);
    if (variants.length) params.set('engine_code', variants.join(', '));
    params.set('vehicle', 'HW Water-Cooled Cargo Tricycle (HW200–HW350)');
  }
  return `/en/contact?${params.toString()}`;
}

function fitmentBadgesHtml(part) {
  const shared = (part.compatible_variants || []).filter(v => v.fitment_type === 'shared').map(v => v.variant_id);
  const specific = (part.compatible_variants || []).filter(v => v.fitment_type === 'displacement_specific').map(v => v.variant_id);
  const verify = (part.compatible_variants || []).filter(v => v.fitment_type === 'verify_by_variant').map(v => v.variant_id);
  const badges = [];
  if (shared.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--shared">Shared (${escapeHtml(shared.join(' / '))})</span>`);
  }
  if (specific.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--specific">Displacement-Specific (${escapeHtml(specific.join(' / '))})</span>`);
  }
  if (verify.length) {
    badges.push(`<span class="hw-fitment-badge hw-fitment-badge--verify">Verify by Code (${escapeHtml(verify.join(' / '))})</span>`);
  }
  if (!badges.length) {
    badges.push('<span class="hw-fitment-badge hw-fitment-badge--verify">Confirm by Model / BOM</span>');
  }
  return `<div class="hw-fitment-badges">${badges.join('')}</div>`;
}

function partProductSchema(part, urlOverride) {
  const isDetail = Boolean(urlOverride || part.is_flagship_page);
  const url = urlOverride || (part.is_flagship_page ? detailUrl(part) : `${HUB_URL}#${part.slug}`);
  const id = isDetail ? `${url}#product` : `${HUB_URL}#product-${part.slug}`;
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
    name: part.product_name_en,
    description: `${part.product_name_en} for HW200–HW350 water-cooled cargo-tricycle engines — ${part.specifications.key_spec}`,
    category: 'Motorcycle & Cargo-Tricycle Engine Spare Parts',
    sku: part.sku || 'Match by Model / BOM',
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': ORG_ID },
    url,
    additionalProperty: properties
  };
}

function renderSharedHead({ title, description, canonical, ogImage, graphNodes, extraSchemas = [] }) {
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

  return `<head>
  ${gaBlock}
  <meta charset="UTF-8">
  ${ymBlock}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261119-hero">
  <script type="application/ld+json">
${JSON.stringify(organizationSchema(), null, 2)}
  </script>
${extraScripts}
  <script type="application/ld+json" data-site-entity-graph>
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphNodes }, null, 2)}
  </script>
</head>`;
}

function renderSharedNav(quoteHref, isDetail = false) {
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
      <li><a href="/en/engine-parts/hw-series"${isDetail ? '' : ' aria-current="page"'}>HW200–HW350 Parts<span class="mnav-arrow">&rsaquo;</span></a></li>
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
        <li><a href="/en/products">Products</a></li>
        <li class="nav-item-dropdown">
          <a href="/en/engine-parts" class="active">Engine Parts <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></a>
          <ul class="nav-dropdown">
            <li><a href="/en/engine-parts">All Engine Parts</a></li>
            <li><a href="/en/engine-parts/hw-series"${isDetail ? '' : ' aria-current="page"'}>HW200–HW350 Kits &amp; Parts</a></li>
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

function renderSharedFooter(quoteHref) {
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
          <a href="/en/cg-engine#hw-water-specifications">HW200–HW350 Engines</a><br>
          <a href="/en/engine-parts">Engine Parts Hub</a><br>
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
  <script src="/js/main.js" defer></script>
  <script src="/js/core-menu-accessibility.js" defer></script>
  <script src="/js/btv-catalog-basket.js" defer></script>`;
}

function hubPageHtml(catalog) {
  const { series, assemblies, parts } = catalog;
  const title = 'HW200–HW350 Water-Cooled Engine Spare Parts Catalog | CHIXIANG MOTOR';
  const description = 'HW Water (Hanwei) heavy-duty cargo-tricycle engine spare parts across 8 core assemblies. High HW250/HW300 parts commonality reduces distributor inventory cost; ship consolidated with complete engines under FOB Guangzhou.';
  const quoteHref = '/en/contact?product_interest=parts&source_form=hw-series-catalog&source_cta=hw-hub-header';

  const variantCards = (series.engine_variants || []).map(v => `
          <div class="feature-item" style="text-align:left;">
            <h3>${escapeHtml(v.id)} (${escapeHtml(v.displacement)})</h3>
            <p><strong>Bore × Stroke:</strong> ${escapeHtml(v.bore_stroke)}<br><strong>Cooling:</strong> ${escapeHtml(v.cooling)}</p>
          </div>`).join('');

  const variantOptions = (series.engine_variants || [])
    .map(v => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.id)} (${escapeHtml(v.displacement)})</option>`)
    .join('');
  const assemblyOptions = assemblies
    .map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name_en)}</option>`)
    .join('');

  const assemblyBlocks = assemblies.map(assembly => {
    const assemblyParts = parts.filter(p => p.assembly_id === assembly.id);
    const hubVariants = [...new Set(assemblyParts.flatMap(p => (p.compatible_variants || []).map(v => v.variant_id)))].join(',');
    const rows = assemblyParts.map(part => {
      const compatList = (part.compatible_variants || []).map(v => v.variant_id).join(',');
      const searchTokens = [
        part.product_name_en,
        part.sku,
        part.oem_ref,
        part.specifications.material,
        part.specifications.key_spec,
        ...(part.public_aliases || []),
        compatList
      ].join(' ').toLowerCase();
      const nameHtml = part.is_flagship_page
        ? `<a href="${escapeHtml(`/en/engine-parts/hw-series/${part.slug}`)}" style="color:var(--accent-color);font-weight:600;">${escapeHtml(part.product_name_en)}</a>`
        : escapeHtml(part.product_name_en);
      return `<tr id="${escapeHtml(part.slug)}" data-btv-row-category="${escapeHtml(assembly.id)}" data-btv-row-variants="${escapeHtml(compatList)}" data-btv-search="${escapeHtml(searchTokens)}">
                <td class="btv-col-select"><input type="checkbox" class="btv-part-checkbox" aria-label="${escapeHtml(`Select ${part.product_name_en}`)}" data-btv-brand="HW-Water" data-btv-model="${escapeHtml(assembly.name_en)}" data-btv-part="${escapeHtml(part.product_name_en)}" data-btv-category="${escapeHtml(assembly.id)}" data-btv-pn="${escapeHtml(part.sku || 'Match by Model / BOM')}" data-btv-oem="${escapeHtml(part.oem_ref || 'OEM-Spec Equivalent')}"></td>
                <th>${nameHtml}</th>
                <td>${escapeHtml(part.sku || 'Match by Model / BOM')}</td>
                <td>${escapeHtml(part.oem_ref || 'OEM-Spec Equivalent')}</td>
                <td><strong>${escapeHtml(part.specifications.material)}</strong><br><span style="color:var(--text-secondary);font-size:0.86rem;">${escapeHtml(part.specifications.key_spec)}</span></td>
                <td>${fitmentBadgesHtml(part)}</td>
                <td><a class="btn btn-accent btn-sm" href="${escapeHtml(inquiryHref(part, 'hw-part-row'))}">Quote</a></td>
              </tr>`;
    }).join('\n              ');

    const bodyContent = rows || `<tr><td colspan="7">Parts list for ${escapeHtml(assembly.name_en)} is matched by engine code and BOM upon request.</td></tr>`;

    return `        <div class="catalog-table-block" id="assembly-${escapeHtml(assembly.id)}" data-btv-model-hub="${escapeHtml(assembly.id)}" data-btv-hub-variants="${escapeHtml(hubVariants)}" style="margin-top:2rem;">
          <div class="btv-model-hub-head">
            <h3>${escapeHtml(assembly.name_en)}</h3>
            <span class="btv-supply-badge btv-supply-badge--parts">${assemblyParts.length} Core Entry Item(s)</span>
          </div>
          <p style="color:var(--text-secondary);margin:0.45rem 0 0.85rem;line-height:1.7;">${escapeHtml(assembly.description_en)}</p>
          <p class="table-scroll-hint">&larr; Swipe horizontally to view compatibility badges &amp; select parts &rarr;</p>
          <div class="responsive-table-wrap" tabindex="0">
            <table class="specs-table catalog-spec-table btv-bom-table">
              <thead>
                <tr>
                  <th class="btv-col-select">Pick</th>
                  <th>Part Name</th>
                  <th>Chixiang SKU</th>
                  <th>OEM Ref.</th>
                  <th>Material &amp; Key Specification</th>
                  <th>HW Variant Compatibility</th>
                  <th>Inquiry</th>
                </tr>
              </thead>
              <tbody>
              ${bodyContent}
              </tbody>
            </table>
          </div>
        </div>`;
  }).join('\n');

  const faqEntries = [
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
  ];

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
      name: 'HW200–HW350 Water-Cooled Engine Spare Parts',
      numberOfItems: parts.length,
      itemListElement: parts.map((part, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: partProductSchema(part)
      }))
    }
  };

  const graphNodes = [
    {
      '@type': 'CollectionPage',
      '@id': `${HUB_URL}#webpage`,
      url: HUB_URL,
      name: 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog',
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: 'en',
      description,
      breadcrumb: { '@id': `${HUB_URL}#breadcrumb` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${HUB_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/en/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${ORIGIN}/en/products` },
        { '@type': 'ListItem', position: 3, name: 'Engine Parts', item: `${ORIGIN}/en/engine-parts` },
        { '@type': 'ListItem', position: 4, name: 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog', item: HUB_URL }
      ]
    }
  ];

  const head = renderSharedHead({
    title,
    description,
    canonical: HUB_URL,
    ogImage: `${ORIGIN}/images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp`,
    graphNodes,
    extraSchemas: [itemListSchema, faqSchema]
  });

  return `<!DOCTYPE html>
<html lang="en">
${head}
<body class="btv-page">
${HUB_MARKER}
${renderSharedNav(quoteHref)}
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/en/">Home</a><span aria-hidden="true">/</span><a href="/en/products">Products</a><span aria-hidden="true">/</span><a href="/en/engine-parts">Engine Parts</a><span aria-hidden="true">/</span><span aria-current="page">HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog</span></nav>
      <h1>HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog</h1>
      <div class="hw-ai-capsule">
        <h2>Factory-Matched Service Kits &amp; ~80% HW250 / HW300 Platform Commonality</h2>
        <p>${escapeHtml(series.interchangeability_note_en)}</p>
        <p style="margin-top:0.65rem;color:var(--text-secondary);font-size:0.92rem;"><strong>Factory-Matched Service Kits &amp; Consolidated Loading:</strong> All overhaul kits and components—led by our Top-End Cylinder &amp; Piston Kit, Cylinder Head &amp; Valve Kit, Full Overhaul Gasket &amp; Seal Kit, and Heavy-Duty Clutch &amp; Transmission Kit—are <strong>factory-matched to CHIXIANG HW-series assembly specifications</strong> and available for consolidated loading alongside 50-unit+ complete-engine orders (~10 working days standard lead time, FOB Guangzhou, 60-day warranty after destination port arrival).</p>
        <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
          <a href="#assembly-factory-matched-kits" class="btn btn-accent btn-sm">Browse Factory-Matched Service Kits</a>
          <a href="${escapeHtml(quoteHref)}" class="btn btn-outline btn-sm">Request Parts Quotation</a>
          <a href="/en/cg-engine#hw-water-specifications" class="btn btn-primary btn-sm">View Complete HW200–HW350 Engines &rarr;</a>
        </div>
      </div>
    </div></section>

    <section class="section" style="padding-bottom:1.5rem;">
      <div class="container">
        <h2 class="section-title">Supported HW Engine Platforms</h2>
        <div class="features-grid" style="margin-top:1.5rem;">${variantCards}
        </div>
      </div>
    </section>

    <section class="section" id="model-hubs" data-btv-section="model-hubs" data-source-form="hw-series-catalog">
      <div class="container">
        <h2 class="section-title">Factory-Matched Service Kits &amp; Core Assembly BOM</h2>
        <p class="section-subtitle">Start with pinned Factory-Matched Service Kits or filter across all 8 core assemblies by displacement and keyword. Check items below for consolidated quotation.</p>
        <div class="btv-hub-toolbar">
          <div class="btv-hub-toolbar__field">
            <label for="hwVariantFilter">Engine Displacement</label>
            <select id="hwVariantFilter" data-btv-filter-model>
              <option value="">All Variants (HW200–HW350)</option>
              ${variantOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="hwAssemblyFilter">Kit &amp; Assembly Filter</label>
            <select id="hwAssemblyFilter" data-btv-filter-category>
              <option value="">All Categories (Factory-Matched Kits + 8 Assemblies)</option>
              ${assemblyOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="hwSearchFilter">Search Part / Keyword</label>
            <input type="search" id="hwSearchFilter" placeholder="e.g. clutch, water pump, cylinder head" data-btv-filter-search>
          </div>
          <div class="btv-hub-toolbar__count" data-btv-filter-count>Showing ${parts.length} matching part(s)</div>
        </div>
${assemblyBlocks}
        <div class="btv-quote-basket" id="btvQuoteBasket" hidden>
          <div class="btv-quote-basket__info">
            <strong>Selected HW Parts for Quote (<span data-btv-basket-count>0</span>)</strong>
          </div>
          <div class="btv-quote-basket__actions">
            <button type="button" class="btn btn-outline btn-sm" data-btv-basket-clear>Clear</button>
            <button type="button" class="btn btn-accent btn-sm" data-btv-basket-submit>Request Batch Quote &rarr;</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);" data-hw-faq>
      <div class="container">
        <h2 class="section-title">HW Parts Engineering &amp; Procurement FAQ</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${faqEntries.map(([q, a]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="cta-section"><div class="container">
      <h2>Need a verified HW parts BOM or mixed container quote?</h2>
      <p style="color:var(--text-secondary);max-width:650px;margin:0 auto;line-height:1.7;">Share your HW engine model, part list or photos, and destination port. Mixed loading with complete HW200–HW350 or CG air/water-cooled engines is supported.</p>
      <div class="cta-actions"><a href="${escapeHtml(quoteHref)}" class="btn btn-accent btn-lg">Send Parts Inquiry</a><a href="/en/engine-parts" class="btn btn-primary btn-lg">Back to All Engine Parts</a></div>
    </div></section>
  </main>
${renderSharedFooter(quoteHref)}
</body>
</html>
`;
}

function flagshipDetailHtml(part, catalog) {
  const canonical = detailUrl(part);
  const title = `${part.product_name_en} for HW200–HW350 Water-Cooled Engines | CHIXIANG MOTOR`;
  const description = `${part.product_name_en} (${part.sku || 'OEM-Spec Equivalent'}) — ${part.specifications.key_spec}. Material: ${part.specifications.material}. Export supply for HW heavy-duty cargo-tricycle fleets.`;
  const quoteHref = inquiryHref(part, 'hw-flagship-detail');
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
        { '@type': 'ListItem', position: 4, name: 'HW200–HW350 (Hanwei) Water-Cooled Engine Spare Parts Catalog', item: HUB_URL },
        { '@type': 'ListItem', position: 5, name: part.product_name_en, item: canonical }
      ]
    }
  ];

  const productSchema = {
    attr: 'data-hw-product-schema',
    data: {
      '@context': 'https://schema.org',
      ...partProductSchema(part, canonical)
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
${renderSharedNav(quoteHref, true)}
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
            <tr><th scope="row">HW Variant Compatibility</th><td>${fitmentBadgesHtml(part)}</td></tr>
          </tbody>
        </table>
      </div>
    </div></section>
    <section class="cta-section"><div class="container">
      <h2>Request quotation for ${escapeHtml(part.product_name_en)}</h2>
      <p style="color:var(--text-secondary);max-width:650px;margin:0 auto;line-height:1.7;">Consolidate with 50-unit+ complete-engine orders or quote independently per BOM. ~10 working days regular lead time, FOB Guangzhou, 60-day warranty after destination port arrival.</p>
      <div class="cta-actions"><a href="${escapeHtml(quoteHref)}" class="btn btn-accent btn-lg">Quote This Part</a><a href="/en/engine-parts/hw-series" class="btn btn-primary btn-lg">All HW Series Parts</a></div>
    </div></section>
  </main>
${renderSharedFooter(quoteHref)}
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
  const want = new Set([HUB_URL, ...flagshipParts(catalog).map(detailUrl)]);
  const seen = new Set();
  let removed = 0;

  let out = xml.replace(
    / {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/en\/engine-parts\/hw-series(?:\/[^<]+)?)<\/loc>[\s\S]*?<\/url>\r?\n/g,
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
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${url === HUB_URL ? '0.8' : '0.6'}</priority>\n  </url>\n</urlset>`
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

  const changes = [];
  const hubAbs = path.join(root, HUB_REL);
  const expectedHub = hubPageHtml(catalog).replace(/\r?\n/g, '\r\n');
  const currentHub = fs.existsSync(hubAbs) ? fs.readFileSync(hubAbs, 'utf8') : '';
  if (currentHub !== expectedHub) {
    changes.push({ file: HUB_REL, stale: true });
    if (!checkOnly) {
      fs.mkdirSync(path.dirname(hubAbs), { recursive: true });
      fs.writeFileSync(hubAbs, expectedHub, 'utf8');
    }
  }

  const expectedDetailSet = new Set();
  for (const part of flagshipParts(catalog)) {
    const rel = detailRelPath(part);
    expectedDetailSet.add(rel);
    const abs = path.join(root, rel);
    const html = flagshipDetailHtml(part, catalog).replace(/\r?\n/g, '\r\n');
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
