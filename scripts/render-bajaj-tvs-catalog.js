#!/usr/bin/env node
/**
 * Render Bajaj / TVS catalog sections from data/bajaj-tvs-catalog.json.
 * Single product-data source for hub / brand pages / detail pages.
 *
 * Usage:
 *   node scripts/render-bajaj-tvs-catalog.js          # write updates
 *   node scripts/render-bajaj-tvs-catalog.js --check   # report drift, exit 1 if stale
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');

const root = process.env.BTV_ROOT
  ? path.resolve(process.env.BTV_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.BTV_CATALOG
  ? path.resolve(process.env.BTV_CATALOG)
  : path.join(root, 'data', 'bajaj-tvs-catalog.json');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');

const CATALOG_START = '<!-- BAJAJ-TVS CATALOG START -->';
const CATALOG_END = '<!-- BAJAJ-TVS CATALOG END -->';
const DETAIL_MARKER = '<!-- BAJAJ-TVS DETAIL GENERATED -->';
const DETAIL_DIRS = [
  path.join('en', 'bajaj-tvs-engines-parts'),
  path.join('zh-cn', 'bajaj-tvs-engines-parts')
];
const PRODUCT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;

const PAGES = [
  { file: 'en/bajaj-tvs-engines-parts.html', lang: 'en', mode: 'hub' },
  { file: 'en/bajaj-engine-parts.html', lang: 'en', mode: 'brand', brand: 'bajaj' },
  { file: 'en/tvs-engine-parts.html', lang: 'en', mode: 'brand', brand: 'tvs' },
  { file: 'zh-cn/bajaj-tvs-engines-parts.html', lang: 'zh', mode: 'hub' },
  { file: 'zh-cn/bajaj-engine-parts.html', lang: 'zh', mode: 'brand', brand: 'bajaj' },
  { file: 'zh-cn/tvs-engine-parts.html', lang: 'zh', mode: 'brand', brand: 'tvs' }
];

const DELIVERY_LABELS = {
  casting: { en: 'Casting', zh: '毛坯' },
  machined: { en: 'Machined', zh: '机加工' },
  assembly: { en: 'Assembly', zh: '组件' }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readCatalog() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function publicProducts(catalog) {
  return (catalog.products || []).filter((p) => p && p.public === true);
}

function inquiryHref(lang, product, sourceTag) {
  const contact = lang === 'zh' ? '/zh-cn/contact/' : '/en/contact';
  const params = new URLSearchParams();
  params.set('product_interest', 'parts');
  params.set('source_form', 'bajaj-tvs-catalog');
  params.set('source_cta', sourceTag);
  if (product) {
    params.set('btv_part', product.id);
    if (product.part_number) params.set('btv_pn', product.part_number);
    const brands = (product.vehicle_brands || []).join('+');
    if (brands) params.set('btv_brand', brands);
    if (product.engine_codes && product.engine_codes.length) {
      params.set('engine_code', product.engine_codes.join(', '));
    }
  }
  return `${contact}?${params.toString()}`;
}

function renderBrandCards(catalog, lang) {
  const cards = (catalog.brands || [])
    .map((brand) => {
      const name = lang === 'zh' ? brand.name_zh : brand.name_en;
      const href = lang === 'zh' ? brand.path_zh : brand.path_en;
      const label = lang === 'zh' ? '查看产品' : 'View Products';
      return `        <div class="feature-item" data-btv-brand="${escapeHtml(brand.id)}">
          <h3>${escapeHtml(name)}</h3>
          <p>${lang === 'zh'
            ? `适用于 ${escapeHtml(name)} 车型的发动机与配件。按车型或配件类别浏览，提交料号与采购数量获取报价。`
            : `Engines and parts for ${escapeHtml(name)} motorcycles. Browse by model or part category, then send part numbers and quantities for a quote.`}</p>
          <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
            <a class="btn btn-primary btn-sm" href="${escapeHtml(href)}">${label}</a>
          </div>
        </div>`;
    })
    .join('\n');
  return `      <div class="features-grid" data-btv-brands>
${cards}
      </div>`;
}

function detailHref(product, lang) {
  return lang === 'zh'
    ? `/zh-cn/bajaj-tvs-engines-parts/${product.id}`
    : `/en/bajaj-tvs-engines-parts/${product.id}`;
}

function productCard(product, lang, detailSet) {
  const name = lang === 'zh' ? product.name_zh : product.name_en;
  const photo = (product.photos || [])[0];
  const specs = [];
  if (product.part_number) {
    specs.push(lang === 'zh' ? `料号：${escapeHtml(product.part_number)}` : `Part no.: ${escapeHtml(product.part_number)}`);
  }
  if (product.oem_part_numbers && product.oem_part_numbers.length) {
    specs.push(lang === 'zh'
      ? `OEM 参考：${escapeHtml(product.oem_part_numbers.join(', '))}`
      : `OEM ref.: ${escapeHtml(product.oem_part_numbers.join(', '))}`);
  }
  if (product.delivery_form && DELIVERY_LABELS[product.delivery_form]) {
    const d = DELIVERY_LABELS[product.delivery_form];
    specs.push(lang === 'zh' ? `交付形态：${d.zh}` : `Delivery: ${d.en}`);
  }
  if (product.engine_codes && product.engine_codes.length) {
    specs.push(`${lang === 'zh' ? '发动机代码' : 'Engine code'}: ${escapeHtml(product.engine_codes.join(', '))}`);
  }
  const hasDetailPage = product.public === true && detailSet && detailSet.has(detailRelPath(product, lang));
  const href = hasDetailPage ? escapeHtml(detailHref(product, lang)) : escapeHtml(inquiryHref(lang, product, 'product-card-info'));
  const dispSpec = product.specs && (product.specs.displacement || product.specs.engine_type);
  const specBadgeText = dispSpec && dispSpec.value ? dispSpec.value.split('(')[0].trim() : (product.part_number || 'OEM Spec');
  const imgHtml = photo && photo.src
    ? `          <a class="product-img has-img" href="${href}" style="background-image:url('/${escapeHtml(photo.src)}')" role="img" aria-label="${escapeHtml(lang === 'zh' ? (photo.alt_zh || name) : (photo.alt_en || name))}"></a>`
    : `          <a class="btv-spec-banner" href="${href}"><span class="btv-spec-banner__eyebrow">${lang === 'zh' ? 'CHIXIANG MOTOR · 整机规格卡' : 'CHIXIANG MOTOR · Complete Engine'}</span><span class="btv-spec-banner__code">${escapeHtml(specBadgeText)}</span><span class="btv-spec-banner__note">${lang === 'zh' ? '支持按原厂接口配置定制与混装发运' : 'Built to OEM mounting & shaft specs'}</span></a>`;
  const quoteLabel = lang === 'zh' ? '询价' : 'Request a Quote';
  const detailLabel = lang === 'zh' ? '查看详情' : 'View Details';
  return `        <article class="product-card" data-btv-product="${escapeHtml(product.id)}">
${imgHtml}
          <div class="product-info">
            <h3>${hasDetailPage ? `<a href="${href}">${escapeHtml(name)}</a>` : escapeHtml(name)}</h3>
${specs.length ? `            <div class="specs">${specs.map((s) => `<p>${s}</p>`).join('')}</div>\n` : ''}            <div class="card-actions">
              ${hasDetailPage ? `<a class="btn btn-primary btn-sm" href="${href}">${detailLabel}</a>\n              ` : ''}<a class="btn btn-accent btn-sm" href="${escapeHtml(inquiryHref(lang, product, 'product-card'))}">${quoteLabel}</a>
            </div>
          </div>
        </article>`;
}

function renderCategorySection(catalog, category, lang, brandFilter, detailSet) {
  const title = lang === 'zh' ? category.name_zh : category.name_en;
  const desc = lang === 'zh' ? category.description_zh : category.description_en;
  const products = publicProducts(catalog).filter((p) => {
    if (p.category !== category.id) return false;
    if (brandFilter && !(p.vehicle_brands || []).includes(brandFilter)) return false;
    return true;
  });
  const grid = products.length
    ? `        <div class="products-grid" data-btv-products="${escapeHtml(category.id)}">
${products.map((p) => productCard(p, lang, detailSet)).join('\n')}
        </div>`
    : '';
  const sub = (category.subcategories || []).length
    ? `        <p style="margin-top:0.75rem;color:var(--text-muted);font-size:0.92rem;">${lang === 'zh' ? '子类别：' : 'Subcategories: '}${escapeHtml((category.subcategories || []).map((s) => (lang === 'zh' ? s.name_zh : s.name_en)).join(' · '))}</p>`
    : '';
  return `      <section class="section" id="${escapeHtml(category.anchor)}" data-btv-category="${escapeHtml(category.id)}">
        <div class="container">
          <h2 class="section-title">${escapeHtml(title)}</h2>
          <p class="section-subtitle">${escapeHtml(desc)}</p>
${sub}
${grid}
        </div>
      </section>`;
}

function renderModelHubsSection(catalog, lang, brandFilter) {
  const hubs = (catalog.model_hubs || []).filter((h) => {
    if (!h || h.public !== true) return false;
    if (brandFilter && h.brand !== brandFilter) return false;
    return Array.isArray(h.core_parts) && h.core_parts.length > 0;
  });
  if (!hubs.length) return '';

  const isZh = lang === 'zh';
  const catLabelMap = new Map();
  for (const c of catalog.categories || []) {
    if (c && c.id) catLabelMap.set(c.id, isZh ? c.name_zh : c.name_en);
  }
  const publicProductMap = new Map(publicProducts(catalog).map((p) => [p.id, p]));
  const categorySet = new Set();
  hubs.forEach((hub) => {
    hub.core_parts.forEach((p) => { if (p && p.category) categorySet.add(p.category); });
  });
  const modelOptions = hubs.map((h) => `<option value="${escapeHtml(h.id)}">${escapeHtml(isZh ? h.model_name_zh : h.model_name_en)}</option>`).join('');
  const categoryOptions = [...categorySet].map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(catLabelMap.get(cat) || cat)}</option>`).join('');
  const toolbarHtml = `        <div class="btv-hub-toolbar" id="btv-hub-toolbar">
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterModel">${isZh ? '按车型筛选' : 'Filter by Model'}</label>
            <select id="btvFilterModel" data-btv-filter-model>
              <option value="">${isZh ? '全部车型' : 'All Models'}</option>
              ${modelOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterCategory">${isZh ? '按配件分类' : 'Filter by Category'}</label>
            <select id="btvFilterCategory" data-btv-filter-category>
              <option value="">${isZh ? '全部分类' : 'All Categories'}</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field btv-hub-toolbar__search">
            <label for="btvFilterSearch">${isZh ? '搜索料号 / OEM 参考号 / 名称' : 'Search Chixiang PN, OEM Ref, or Part'}</label>
            <input type="search" id="btvFilterSearch" data-btv-filter-search placeholder="${isZh ? '输入驰翔料号、OEM 料号或配件名…' : 'e.g. DH101234, CX-BJ, Clutch Cover...'}">
          </div>
          <div class="btv-hub-toolbar__count" data-btv-filter-count></div>
        </div>`;

  const blocks = hubs.map((hub) => {
    const title = isZh ? hub.model_name_zh : hub.model_name_en;
    const summary = isZh ? (hub.summary_zh || '') : (hub.summary_en || '');
    const meta = [];
    if (hub.displacement_cc) meta.push(isZh ? `排量：${hub.displacement_cc}` : `Displacement: ${hub.displacement_cc}`);
    if (hub.engine_code) meta.push(isZh ? `发动机代码：${hub.engine_code}` : `Engine code: ${hub.engine_code}`);

    const rows = hub.core_parts.map((part, idx) => {
      const partName = isZh ? part.part_name_zh : part.part_name_en;
      const partNotes = isZh ? (part.notes_zh || '') : (part.notes_en || '');
      const rowAnchor = `part-${hub.id}-${idx + 1}`;
      const qParams = new URLSearchParams({
        product_interest: 'parts',
        source_form: 'bajaj-tvs-catalog',
        source_cta: 'model-hub-row',
        btv_brand: hub.brand || '',
        btv_part: `${hub.id}:${part.chixiang_pn || part.oem_ref || partName}`,
        vehicle: title
      });
      if (part.chixiang_pn || part.oem_ref) {
        qParams.set('btv_pn', [part.chixiang_pn, part.oem_ref].filter(Boolean).join(' / '));
      }
      if (hub.engine_code) qParams.set('engine_code', hub.engine_code);
      const qHref = `${isZh ? '/zh-cn/contact' : '/en/contact'}?${qParams.toString()}`;
      const searchTokens = [title, partName, part.category || '', part.chixiang_pn || '', part.oem_ref || '', part.material_spec || '', partNotes].join(' ').toLowerCase();
      return `<tr id="${escapeHtml(rowAnchor)}" data-btv-row-category="${escapeHtml(part.category || '')}" data-btv-search="${escapeHtml(searchTokens)}">
                <td class="btv-col-select"><input type="checkbox" class="btv-part-checkbox" aria-label="${escapeHtml((isZh ? '选择 ' : 'Select ') + partName)}" data-btv-brand="${escapeHtml(hub.brand || '')}" data-btv-model="${escapeHtml(title)}" data-btv-part="${escapeHtml(partName)}" data-btv-category="${escapeHtml(part.category || '')}" data-btv-pn="${escapeHtml(part.chixiang_pn || '')}" data-btv-oem="${escapeHtml(part.oem_ref || '')}"></td>
                <th>${escapeHtml(partName)}</th>
                <td>${escapeHtml(catLabelMap.get(part.category) || part.category || '—')}</td>
                <td>${escapeHtml(part.chixiang_pn || '—')}</td>
                <td>${escapeHtml(part.oem_ref || '—')}</td>
                <td>${escapeHtml(part.material_spec || partNotes || '—')}</td>
                <td><a class="btn btn-accent btn-sm" href="${escapeHtml(qHref)}">${isZh ? '询价' : 'Quote'}</a></td>
              </tr>`;
    }).join('\n              ');

    const scopeBadge = hub.supply_scope === 'engines-and-parts'
      ? `<span class="btv-supply-badge btv-supply-badge--engine">${isZh ? '整机总成 + 核心配件供应' : 'Complete Engine + Core Parts'}</span>`
      : (hub.supply_scope === 'parts-only'
        ? `<span class="btv-supply-badge btv-supply-badge--parts">${isZh ? '专供售后核心配件' : 'Core Replacement Parts Supply'}</span>`
        : '');
    const linkedEngine = hub.detail_product_id && publicProductMap.get(hub.detail_product_id);
    const engineLinkHtml = linkedEngine
      ? `<div class="btv-model-actions"><a class="btn btn-primary btn-sm" href="${escapeHtml(detailHref(linkedEngine, lang))}">${isZh ? '查看整机实拍与原厂对标参数 →' : 'View Complete Engine Photos &amp; OEM Specs →'}</a></div>`
      : '';

    return `        <div class="catalog-table-block" id="hub-${escapeHtml(hub.id)}" data-btv-model-hub="${escapeHtml(hub.id)}" style="margin-top:2rem;">
          <div class="btv-model-hub-head">
            <h3>${escapeHtml(title)}${meta.length ? ` <span style="font-size:0.9rem;font-weight:400;color:var(--text-secondary);">(${escapeHtml(meta.join(' · '))})</span>` : ''}</h3>
            ${scopeBadge}
          </div>
          ${summary ? `<p style="color:var(--text-secondary);margin:0.5rem 0 0.75rem;line-height:1.7;">${escapeHtml(summary)}</p>` : ''}
          ${engineLinkHtml}
          <p class="table-scroll-hint">${isZh ? '← 左右滑动查看完整料号并勾选批量询价 →' : '← Swipe horizontally to view OEM numbers &amp; select parts →'}</p>
          <div class="responsive-table-wrap" tabindex="0">
            <table class="specs-table catalog-spec-table btv-bom-table">
              <thead>
                <tr>
                  <th class="btv-col-select">${isZh ? '选' : 'Pick'}</th>
                  <th>${isZh ? '核心配件' : 'Core Part'}</th>
                  <th>${isZh ? '分类' : 'Category'}</th>
                  <th>${isZh ? '驰翔料号' : 'Chixiang PN'}</th>
                  <th>${isZh ? 'OEM 参考料号' : 'OEM Ref. PN'}</th>
                  <th>${isZh ? '材质 / 硬度 / 备注' : 'Material / Hardness / Spec'}</th>
                  <th>${isZh ? '采购' : 'Inquiry'}</th>
                </tr>
              </thead>
              <tbody>
              ${rows}
              </tbody>
            </table>
          </div>
        </div>`;
  }).join('\n');

  const basketHtml = `        <div class="btv-quote-basket" id="btvQuoteBasket" hidden>
          <div class="btv-quote-basket__info">
            <strong>${isZh ? '已选询价配件 (<span data-btv-basket-count>0</span>)' : 'Selected Parts for Quote (<span data-btv-basket-count>0</span>)'}</strong>
          </div>
          <div class="btv-quote-basket__actions">
            <button type="button" class="btn btn-outline btn-sm" data-btv-basket-clear>${isZh ? '清空' : 'Clear'}</button>
            <button type="button" class="btn btn-accent btn-sm" data-btv-basket-submit>${isZh ? '批量打包询价 →' : 'Request Batch Quote →'}</button>
          </div>
        </div>`;

  return `      <section class="section" id="model-hubs" data-btv-section="model-hubs">
        <div class="container">
          <h2 class="section-title">${isZh ? '按车型聚合配件与 OEM 料号表' : 'Model-Aggregated Parts & OEM Cross-Reference'}</h2>
          <p class="section-subtitle">${isZh
            ? '同一车型对应的核心配件与原厂参考料号集中展示，支持勾选多个料号打包询价及与整机同柜混装订购。'
            : 'Filter by vehicle model or search by OEM reference number. Check multiple parts below for batch quotation and mixed container loading.'}</p>
${toolbarHtml}
${blocks}
${basketHtml}
        </div>
      </section>`;
}

function renderCatalogBody(catalog, page, detailSet) {
  const lang = page.lang;
  const parts = [];
  if (page.mode === 'hub') {
    parts.push(`      <section class="section" id="brands" data-btv-section="brands">
        <div class="container">
          <h2 class="section-title">${lang === 'zh' ? '按车型品牌浏览' : 'Browse by motorcycle brand'}</h2>
${renderBrandCards(catalog, lang)}
        </div>
      </section>`);
  }
  const CORE_CATEGORY_IDS = new Set(['crankcases', 'engine-covers', 'complete-engines']);
  const order = [
    'complete-engines',
    'crankcases',
    'engine-covers',
    'cylinder-head-kits',
    'crankshaft-timing',
    'clutch-transmission',
    'overhaul-seals'
  ];
  const categories = (catalog.categories || [])
    .slice()
    .sort((a, b) => {
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  for (const category of categories) {
    const hasProducts = publicProducts(catalog).some((p) => {
      if (p.category !== category.id) return false;
      if (page.brand && !(p.vehicle_brands || []).includes(page.brand)) return false;
      return true;
    });
    if (!CORE_CATEGORY_IDS.has(category.id) && !hasProducts) continue;
    parts.push(renderCategorySection(catalog, category, lang, page.brand, detailSet));
  }
  const modelHubsHtml = renderModelHubsSection(catalog, lang, page.brand);
  if (modelHubsHtml) parts.push(modelHubsHtml);
  return `${CATALOG_START}\n${parts.join('\n')}\n${CATALOG_END}`;
}

function replaceRegion(html, replacement) {
  const start = html.indexOf(CATALOG_START);
  const end = html.indexOf(CATALOG_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('catalog markers missing');
  }
  return html.slice(0, start) + replacement + html.slice(end + CATALOG_END.length);
}

function newlineOf(html) {
  return html.includes('\r\n') ? '\r\n' : '\n';
}

function toNewlines(text, nl) {
  return nl === '\r\n' ? text.replace(/\r?\n/g, '\r\n') : text.replace(/\r\n/g, '\n');
}

function detailPageHtml(catalog, product, lang) {
  const name = lang === 'zh' ? product.name_zh : product.name_en;
  const isZh = lang === 'zh';
  const home = isZh ? '/zh-cn/' : '/en/';
  const hub = isZh ? '/zh-cn/bajaj-tvs-engines-parts' : '/en/bajaj-tvs-engines-parts';
  const productsCrumb = isZh ? '/zh-cn/products' : '/en/products';
  const productsCrumbLabel = isZh ? '发动机产品' : 'Products';
  const hubLabel = isZh ? 'Bajaj / TVS 发动机与配件' : 'Bajaj / TVS Engines & Parts';
  const contact = isZh ? '/zh-cn/contact/' : '/en/contact';
  const canonical = isZh
    ? `https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts/${product.id}`
    : `https://chixiangmotor.com/en/bajaj-tvs-engines-parts/${product.id}`;
  const desc = isZh
    ? `${name}${product.part_number ? `（料号 ${product.part_number}）` : ''}。按车型与订单确认供货，请提交料号与采购数量获取报价。`
    : `${name}${product.part_number ? ` (part no. ${product.part_number})` : ''}. Supply is confirmed per model and order; send part numbers and quantities for a quote.`;

  const specRows = [];
  if (product.part_number) {
    specRows.push([isZh ? '驰翔料号' : 'Chixiang part number', product.part_number]);
  }
  if (product.oem_part_numbers && product.oem_part_numbers.length) {
    specRows.push([isZh ? 'OEM 参考料号' : 'OEM reference number(s)', product.oem_part_numbers.join(', ')]);
  }
  if (product.delivery_form && DELIVERY_LABELS[product.delivery_form]) {
    specRows.push([isZh ? '交付形态' : 'Delivery form', isZh ? DELIVERY_LABELS[product.delivery_form].zh : DELIVERY_LABELS[product.delivery_form].en]);
  }
  for (const code of product.engine_codes || []) {
    specRows.push([isZh ? '发动机代码' : 'Engine code', code]);
  }
  for (const model of product.models || []) {
    const versions = (model.versions || []).join(', ');
    specRows.push([isZh ? '适配车型' : 'Fitment model', versions ? `${model.name} (${versions})` : model.name]);
  }
  for (const [key, spec] of Object.entries(product.specs || {})) {
    if (!spec || spec.value == null || spec.value === '') continue;
    specRows.push([isZh ? (spec.label_zh || key) : (spec.label_en || key), spec.value]);
  }
  const specsHtml = specRows.length
    ? `<section class="section"><div class="container"><h2 class="section-title">${isZh ? '产品参数' : 'Product specifications'}</h2>
      <table class="spec-table" style="width:100%;border-collapse:collapse;margin-top:1rem;">
        <tbody>${specRows.map(([k, v]) => `<tr><th style="text-align:left;padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);width:32%;">${escapeHtml(k)}</th><td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);">${escapeHtml(v)}</td></tr>`).join('')}</tbody>
      </table></div></section>`
    : '';

  const photosHtml = (product.photos || []).length
    ? `<section class="section" style="background:var(--bg-secondary);"><div class="container"><h2 class="section-title">${isZh ? '产品照片' : 'Product photos'}</h2>
      <div class="products-grid">${(product.photos || []).map((photo) => `<div class="product-card"><div class="product-img has-img" style="background-image:url('/${escapeHtml(photo.src)}')" role="img" aria-label="${escapeHtml(isZh ? (photo.alt_zh || name) : (photo.alt_en || name))}"></div><div class="product-info"><p>${escapeHtml(isZh ? (photo.alt_zh || '') : (photo.alt_en || ''))}</p></div></div>`).join('')}</div></div></section>`
    : '';

  const accessoriesHtml = (product.included_accessories || []).length
    ? `<p style="margin-top:1rem;color:var(--text-secondary);">${isZh ? '随附配件：' : 'Included accessories: '}${escapeHtml((product.included_accessories || []).map((a) => (isZh ? a.name_zh : a.name_en)).join(' · '))}</p>`
    : '';

  const otherLangUrl = isZh
    ? `https://chixiangmotor.com/en/bajaj-tvs-engines-parts/${product.id}`
    : `https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts/${product.id}`;
  const langSwitchHref = isZh ? detailHref(product, 'en') : detailHref(product, 'zh');
  const langSwitchLabel = isZh ? 'English' : '简体中文';
  const homeLabel = isZh ? '首页' : 'Home';
  const contactLabel = isZh ? '联系我们' : 'Contact';
  const quoteLabel = isZh ? '获取报价' : 'Get a Quote';

  const evidenceHref = isZh ? '/zh-cn/evidence/' : '/en/evidence';
  const photoUrls = (product.photos || [])
    .filter((ph) => ph && ph.src)
    .map((ph) => `https://chixiangmotor.com/${ph.src}`);
  const productNode = {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name,
    description: desc,
    url: canonical,
    brand: { '@id': 'https://chixiangmotor.com/#organization' },
    manufacturer: { '@id': 'https://chixiangmotor.com/#organization' },
    ...(product.part_number ? { sku: product.part_number, mpn: product.part_number } : {}),
    ...(photoUrls.length ? { image: photoUrls } : {}),
    ...(specRows.length ? {
      additionalProperty: specRows.map(([k, v]) => ({
        '@type': 'PropertyValue',
        name: k,
        value: String(v)
      }))
    } : {})
  };
  const productGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://chixiangmotor.com/#organization',
        name: 'CHIXIANG MOTOR',
        legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
        alternateName: 'Chixiang Motor',
        url: 'https://chixiangmotor.com/',
        logo: 'https://chixiangmotor.com/images/logo.webp',
        sameAs: officialSameAs,
        foundingDate: '2007',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'No.1-2, Building 7, No.1000 Gaoteng Avenue, Hangu Town, Jiulongpo District',
          addressLocality: 'Chongqing',
          addressCountry: 'CN'
        }
      },
      productNode
    ]
  };
  const entityGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name,
        isPartOf: { '@id': 'https://chixiangmotor.com/#website' },
        publisher: { '@id': 'https://chixiangmotor.com/#organization' },
        inLanguage: isZh ? 'zh-cn' : 'en',
        description: desc,
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        mainEntity: { '@id': `${canonical}#product` }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeLabel, item: `https://chixiangmotor.com${home}` },
          { '@type': 'ListItem', position: 2, name: productsCrumbLabel, item: `https://chixiangmotor.com${isZh ? '/zh-cn/products' : '/en/products'}` },
          { '@type': 'ListItem', position: 3, name: hubLabel, item: `https://chixiangmotor.com${isZh ? '/zh-cn/bajaj-tvs-engines-parts' : '/en/bajaj-tvs-engines-parts'}` },
          { '@type': 'ListItem', position: 4, name, item: canonical }
        ]
      }
    ]
  };

  const ogImage = (product.photos || [])[0] && (product.photos || [])[0].src
    ? `https://chixiangmotor.com/${product.photos[0].src}`
    : 'https://chixiangmotor.com/images/parts.webp';
  const detailTitle = `${escapeHtml(name)}${isZh ? '｜Bajaj / TVS 发动机与配件｜CHIXIANG MOTOR' : ' | Bajaj & TVS Engine Parts | CHIXIANG MOTOR'}`;

  return `<!DOCTYPE html>
${DETAIL_MARKER}
<html lang="${isZh ? 'zh-CN' : 'en'}">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-16777656395');
</script>
  <meta charset="UTF-8">
  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109483511,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
  <noscript><div><img src="https://mc.yandex.ru/watch/109483511" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika counter -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${detailTitle}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="${isZh ? 'zh-CN' : 'en'}" href="${canonical}">
  <link rel="alternate" hreflang="${isZh ? 'en' : 'zh-CN'}" href="${otherLangUrl}">
  <link rel="alternate" hreflang="x-default" href="https://chixiangmotor.com/en/bajaj-tvs-engines-parts/${product.id}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${detailTitle}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">
${JSON.stringify(productGraph, null, 2)}
  </script>
  <script type="application/ld+json" data-site-entity-graph>
${JSON.stringify(entityGraph, null, 2)}
  </script>
</head>
<body class="${isZh ? 'zh-cn-page ' : ''}btv-page">
  <div class="mobile-nav" id="mobileNav"${isZh ? ' hidden' : ''}>
    <div class="mobile-nav-header">
      <div class="mobile-nav-brand">
        <div class="mobile-nav-logo">CHIXIANG MOTOR</div>
        <div class="mobile-nav-tagline">${isZh ? '重庆摩托车发动机制造与供应' : 'Professional Motorcycle Engine Manufacturer'}</div>
      </div>
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="${isZh ? '关闭菜单' : 'Close menu'}">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <ul class="mobile-nav-list">
      <li><a href="${home}">${homeLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="${productsCrumb}">${productsCrumbLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="${hub}" aria-current="page">${hubLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="${contact}">${contactLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
      <li><a href="${escapeHtml(inquiryHref(lang, product, 'detail-nav'))}" class="mnav-accent">${quoteLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
    </ul>
    <div class="mobile-nav-langs"><a href="${home}" hreflang="${isZh ? 'zh-CN' : 'en'}">${isZh ? '简体中文' : 'English'}</a><a href="${langSwitchHref}" hreflang="${isZh ? 'en' : 'zh-CN'}">${langSwitchLabel}</a></div>
  </div>
  <nav class="navbar">
    <div class="container">
      <a href="${home}" class="nav-logo"><span class="logo-icon"><img src="/images/logo.webp" alt="CHIXIANG MOTOR" width="36" height="36" decoding="async"></span><span class="logo-text">CHIXIANG MOTOR</span></a>
      <ul class="nav-links" role="navigation" aria-label="Main navigation">${isZh
        ? `<li><a href="/zh-cn/">首页</a></li><li><a href="/zh-cn/products">发动机产品</a></li><li><a href="/zh-cn/bajaj-tvs-engines-parts" class="active" aria-current="page">Bajaj / TVS 配件</a></li><li><a href="/zh-cn/evidence">证据中心</a></li><li><a href="/zh-cn/contact/">联系询价</a></li>`
        : `<li><a href="/en/">Home</a></li><li><a href="/en/products">Products</a></li><li><a href="/en/bajaj-tvs-engines-parts" class="active" aria-current="page">Bajaj / TVS Parts</a></li><li><a href="/en/evidence">Evidence</a></li><li><a href="/en/about">About Us</a></li><li><a href="/en/news">News</a></li><li><a href="/en/contact">Contact</a></li>`}</ul>
      <div class="nav-right"><a href="${escapeHtml(inquiryHref(lang, product, 'detail-page'))}" class="btn btn-accent btn-sm">${quoteLabel}</a><button class="menu-toggle" aria-label="${isZh ? '打开菜单' : 'Toggle menu'}"><span></span><span></span><span></span></button></div>
    </div>
  </nav>
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="${home}">${homeLabel}</a><span aria-hidden="true">/</span><a href="${productsCrumb}">${productsCrumbLabel}</a><span aria-hidden="true">/</span><a href="${hub}">${escapeHtml(hubLabel)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(name)}</span></nav>
      <h1>${escapeHtml(name)}</h1>
      <p class="section-subtitle">${escapeHtml(desc)}</p>
    </div></section>
${photosHtml}
${specsHtml}
    <section class="cta-section"><div class="container">
      <h2>${isZh ? '提交料号与采购数量，获取报价' : 'Send part numbers and quantities for a quote'}</h2>
      <p style="color:var(--text-secondary);max-width:680px;margin:0 auto 1rem;line-height:1.7;">${isZh
        ? '支持与 CG / CB / 卧式 / 三轮水冷发动机同柜混装出货。材质、硬度及实验室测功机验证标准详见证据中心。'
        : 'Available for mixed container loading alongside CG, CB, horizontal, and water-cooled engines. Material, hardness, and dynamometer standards are documented in our Evidence Center.'} <a href="${evidenceHref}">${isZh ? '查看证据中心' : 'View Evidence Center'}</a></p>
      ${accessoriesHtml}
      <div class="cta-actions"><a class="btn btn-accent btn-lg" href="${escapeHtml(inquiryHref(lang, product, 'detail-cta'))}">${isZh ? '联系采购' : 'Contact Procurement'}</a><a class="btn btn-primary btn-lg" href="${langSwitchHref}">${langSwitchLabel}</a></div>
      <p style="margin-top:1.25rem;font-size:0.85rem;color:var(--text-muted);">${isZh
        ? '说明：Bajaj®、TVS® 品牌与车型名称仅用于原厂适配参考。Chixiang Motor 供应独立售后替换发动机与核心零部件。'
        : 'Note: Brand and model names (Bajaj&reg;, TVS&reg;) are referenced solely for OEM fitment compatibility. Chixiang Motor supplies independent aftermarket replacement engines and components.'}</p>
    </div></section>
  </main>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col"><h4>${isZh ? '关于' : 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.'}</h4><p>${isZh ? '重庆驰翔摩托车制造有限公司<br>CHIXIANG MOTOR<br>重庆高新区含谷片区' : 'CHIXIANG MOTOR &middot; Motorcycle engine industry experience since 2003. Company registered in 2007.'}</p></div>
        <div class="footer-col"><h4>${isZh ? '产品' : 'Quick Links'}</h4><a href="${home}">${homeLabel}</a><br><a href="${productsCrumb}">${productsCrumbLabel}</a><br><a href="${hub}">${hubLabel}</a><br><a href="${contact}">${contactLabel}</a></div>
        <div class="footer-col"><h4>${isZh ? '联系' : 'Contact'}</h4><p>${isZh ? '电话/微信: +86 19008225410<br>邮箱: chixiangmotor@163.com' : 'Tel/WhatsApp: +86 19008225410<br>Email: chixiangmotor@163.com'}</p></div>
      </div>
      <div class="footer-bottom"><span>&copy; 2026 ${isZh ? '重庆驰翔摩托车制造有限公司 (CHIXIANG MOTOR)' : 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) &middot; Export documentation and logistics are executed through Chixiang\'s designated export division.'}</span>
        <span class="footer-langs"><a href="${home}" hreflang="${isZh ? 'zh-CN' : 'en'}">${isZh ? '简体中文' : 'English'}</a> · <a href="${langSwitchHref}" hreflang="${isZh ? 'en' : 'zh-CN'}">${langSwitchLabel}</a></span>
      </div>
    </div>
  </footer>
  <script src="/js/main.js" defer></script>
  <script src="/js/core-menu-accessibility.js" defer></script>
</body>
</html>
`;
}
function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function validateCatalog(catalog) {
  const errors = [];
  const brandIds = new Set((catalog.brands || []).map((b) => b && b.id));
  const categoryIds = new Set((catalog.categories || []).map((c) => c && c.id));
  const productIds = new Set();
  for (const product of catalog.products || []) {
    const label = (product && product.id) || '(missing id)';
    if (!product || !product.id) {
      errors.push(`product missing id: ${JSON.stringify(product && product.name_en)}`);
      continue;
    }
    if (!PRODUCT_ID_RE.test(product.id)) {
      errors.push(`${label}: id must be kebab-case [a-z0-9-]`);
    }
    if (productIds.has(product.id)) {
      errors.push(`${label}: duplicate product id`);
    }
    productIds.add(product.id);
    for (const brand of product.vehicle_brands || []) {
      if (!brandIds.has(brand)) errors.push(`${label}: unknown vehicle brand "${brand}"`);
    }
    if (product.category && !categoryIds.has(product.category)) {
      errors.push(`${label}: unknown category "${product.category}"`);
    }
    for (const photo of product.photos || []) {
      if (!photo || !photo.src || !SAFE_IMAGE_RE.test(photo.src) || photo.src.includes('..')) {
        errors.push(`${label}: illegal photo path ${photo && photo.src}`);
      }
    }
    for (const related of product.related_products || []) {
      const target = (catalog.products || []).find((p) => p && p.id === related);
      if (!target) errors.push(`${label}: related product "${related}" does not exist`);
      else if (target.public !== true) errors.push(`${label}: related product "${related}" is not public`);
    }
    if (product.public === true && (!product.name_en || !product.name_zh || !product.category)) {
      errors.push(`${label}: public product requires name_en, name_zh, category`);
    }
  }
  const hubIds = new Set();
  for (const hub of catalog.model_hubs || []) {
    const label = (hub && hub.id) || '(missing model_hub id)';
    if (!hub || !hub.id) {
      errors.push('model_hub missing id');
      continue;
    }
    if (!PRODUCT_ID_RE.test(hub.id)) {
      errors.push(`model_hub ${label}: id must be kebab-case [a-z0-9-]`);
    }
    if (hubIds.has(hub.id)) {
      errors.push(`model_hub ${label}: duplicate id`);
    }
    hubIds.add(hub.id);
    if (hub.brand && !brandIds.has(hub.brand)) {
      errors.push(`model_hub ${label}: unknown brand "${hub.brand}"`);
    }
  }
  return errors;
}

function detailRelPath(product, lang) {
  return path.join(lang === 'zh' ? 'zh-cn' : 'en', 'bajaj-tvs-engines-parts', `${product.id}.html`);
}

function expectedDetailPaths(catalog) {
  const out = [];
  for (const product of publicProducts(catalog)) {
    out.push(detailRelPath(product, 'en'));
    out.push(detailRelPath(product, 'zh'));
  }
  return new Set(out);
}

function listOwnedDetailFiles() {
  const found = [];
  for (const dir of DETAIL_DIRS) {
    const absDir = path.join(root, dir);
    if (!fs.existsSync(absDir)) continue;
    const resolvedDir = path.resolve(absDir);
    for (const name of fs.readdirSync(absDir)) {
      if (!name.endsWith('.html')) continue;
      const abs = path.join(absDir, name);
      const resolved = path.resolve(abs);
      if (!resolved.startsWith(resolvedDir + path.sep)) continue;
      const html = fs.readFileSync(abs, 'utf8');
      found.push({
        rel: path.join(dir, name),
        abs,
        managed: html.includes(DETAIL_MARKER)
      });
    }
  }
  return found;
}

function syncSitemapDetails(catalog, checkMode) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const want = new Set();
  for (const product of publicProducts(catalog)) {
    for (const lang of ['en', 'zh']) {
      const prefix = lang === 'zh'
        ? 'https://chixiangmotor.com/zh-cn/bajaj-tvs-engines-parts/'
        : 'https://chixiangmotor.com/en/bajaj-tvs-engines-parts/';
      want.add(prefix + product.id);
    }
  }
  const seen = new Set();
  let removed = 0;
  let out = xml.replace(/ {0,2}<url>\s*<loc>(https:\/\/chixiangmotor\.com\/(?:en|zh-cn)\/bajaj-tvs-engines-parts\/[^<]+)<\/loc>[\s\S]*?<\/url>\r?\n/g, (block, url) => {
    if (want.has(url)) {
      seen.add(url);
      return block;
    }
    removed += 1;
    return '';
  });
  const today = new Date().toISOString().slice(0, 10);
  const added = [];
  for (const url of want) {
    if (seen.has(url)) continue;
    added.push(url);
    out = out.replace('</urlset>', `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>`);
    seen.add(url);
  }
  const changed = removed > 0 || added.length > 0;
  return { changed, next: out };
}

function main() {
  const catalog = readCatalog();
  const errors = validateCatalog(catalog);
  if (errors.length) {
    console.error('Bajaj/TVS catalog validation failed:');
    for (const error of errors) console.error('  - ' + error);
    process.exit(2);
  }

  const expected = expectedDetailPaths(catalog);
  const changes = [];

  for (const page of PAGES) {
    const abs = path.join(root, page.file);
    if (!fs.existsSync(abs)) {
      changes.push({ file: page.file, missing: true });
      continue;
    }
    const html = fs.readFileSync(abs, 'utf8');
    const nl = newlineOf(html);
    const replacement = toNewlines(renderCatalogBody(catalog, page, expected), nl);
    let next;
    try {
      next = replaceRegion(html, replacement);
    } catch (error) {
      changes.push({ file: page.file, error: error.message });
      continue;
    }
    if (next !== html) {
      changes.push({ file: page.file, stale: true });
      if (!checkOnly) {
        fs.writeFileSync(abs, next, 'utf8');
      }
    }
  }

  for (const product of publicProducts(catalog)) {
    for (const lang of ['en', 'zh']) {
      const rel = detailRelPath(product, lang);
      const abs = path.join(root, rel);
      const html = detailPageHtml(catalog, product, lang).replace(/\r?\n/g, '\r\n');
      const exists = fs.existsSync(abs);
      const current = exists ? fs.readFileSync(abs, 'utf8') : '';
      if (current !== html) {
        changes.push({ file: rel, stale: true });
        if (!checkOnly) {
          ensureDir(abs);
          fs.writeFileSync(abs, html, 'utf8');
        }
      }
    }
  }

  const orphans = [];
  for (const file of listOwnedDetailFiles()) {
    if (expected.has(file.rel)) continue;
    if (file.managed) {
      orphans.push(file.rel);
      if (!checkOnly) {
        fs.unlinkSync(file.abs);
      }
    } else {
      changes.push({ file: file.rel, error: 'unmanaged file in generated detail directory (not deleted)' });
    }
  }

  const sitemap = syncSitemapDetails(catalog, checkOnly);
  if (sitemap.changed) {
    changes.push({ file: 'sitemap.xml', stale: true });
    if (!checkOnly) {
      fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap.next, 'utf8');
    }
  }

  for (const orphan of orphans) {
    changes.push({ file: orphan, stale: true, removed: !checkOnly });
  }

  if (checkOnly) {
    const stale = changes.filter((c) => c.stale || c.missing || c.error);
    for (const item of stale) {
      if (item.error) console.log(`ERROR ${item.file}: ${item.error}`);
      else if (item.missing) console.log(`MISSING ${item.file}`);
      else console.log(`STALE ${item.file}`);
    }
    console.log(`${stale.length} Bajaj/TVS catalog pages need updates.`);
    process.exit(stale.length ? 1 : 0);
  }

  const removed = changes.filter((c) => c.removed).length;
  console.log(`${changes.length} Bajaj/TVS catalog files updated (${removed} orphan detail pages removed).`);
}

main();
