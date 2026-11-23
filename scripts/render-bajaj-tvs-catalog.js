#!/usr/bin/env node
/**
 * Render Bajaj / TVS catalog sections and detail pages from data/bajaj-tvs-catalog.json.
 * Supports isolated test mode (BTV_ROOT -> en/zh only) and full 7-language matrix mode.
 *
 * Usage:
 *   node scripts/render-bajaj-tvs-catalog.js          # write updates
 *   node scripts/render-bajaj-tvs-catalog.js --check   # report drift, exit 1 if stale
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const { applyToHtml } = require('./apply-site-entity-schema');
const {
  ORIGIN,
  LANGS,
  HREFLANG_MAP,
  ROUTE_GROUPS,
  LOCALE_CHROME,
  escapeHtml,
  escapeAttr,
  rolePath,
  hreflangTagsHtml,
  waHref,
  renderMobileNav,
  renderNavbar,
  renderFooter
} = require('./i18n-matrix');

const root = process.env.BTV_ROOT
  ? path.resolve(process.env.BTV_ROOT)
  : path.join(__dirname, '..');
const dataFile = process.env.BTV_CATALOG
  ? path.resolve(process.env.BTV_CATALOG)
  : path.join(root, 'data', 'bajaj-tvs-catalog.json');
const localesFile = path.join(__dirname, '..', 'data', 'i18n', 'btv-locales.json');
const IS_ISOLATED = Boolean(process.env.BTV_ROOT);
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');

const CATALOG_START = '<!-- BAJAJ-TVS CATALOG START -->';
const CATALOG_END = '<!-- BAJAJ-TVS CATALOG END -->';
const DETAIL_MARKER = '<!-- BAJAJ-TVS DETAIL GENERATED -->';
const PRODUCT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_IMAGE_RE = /^images\/[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:webp|png|jpg|jpeg)$/i;

const ACTIVE_LANGS = IS_ISOLATED ? ['en', 'zh'] : ['en', 'fr', 'es', 'pt', 'ru', 'ar'];
const MATRIX_LANGS = ['fr', 'es', 'pt', 'ru', 'ar'];

function mLang(lang) {
  return lang === 'zh' ? 'zh-cn' : lang;
}

const DETAIL_DIRS = ACTIVE_LANGS.map((l) => path.join(mLang(l), 'bajaj-tvs-engines-parts'));

const PATCH_PAGES = IS_ISOLATED
  ? [
      { file: 'en/bajaj-tvs-engines-parts.html', lang: 'en', mode: 'hub', role: 'btv-hub' },
      { file: 'en/bajaj-engine-parts.html', lang: 'en', mode: 'brand', brand: 'bajaj', role: 'btv-bajaj' },
      { file: 'en/tvs-engine-parts.html', lang: 'en', mode: 'brand', brand: 'tvs', role: 'btv-tvs' },
      { file: 'zh-cn/bajaj-tvs-engines-parts.html', lang: 'zh', mode: 'hub', role: 'btv-hub' },
      { file: 'zh-cn/bajaj-engine-parts.html', lang: 'zh', mode: 'brand', brand: 'bajaj', role: 'btv-bajaj' },
      { file: 'zh-cn/tvs-engine-parts.html', lang: 'zh', mode: 'brand', brand: 'tvs', role: 'btv-tvs' }
    ]
  : [
      { file: 'en/bajaj-tvs-engines-parts.html', lang: 'en', mode: 'hub', role: 'btv-hub' },
      { file: 'en/bajaj-engine-parts.html', lang: 'en', mode: 'brand', brand: 'bajaj', role: 'btv-bajaj' },
      { file: 'en/tvs-engine-parts.html', lang: 'en', mode: 'brand', brand: 'tvs', role: 'btv-tvs' }
    ];

const FULL_PAGES = IS_ISOLATED ? [] : MATRIX_LANGS.flatMap((lang) => ([
  { file: `${lang}/bajaj-tvs-engines-parts.html`, lang, mode: 'hub', role: 'btv-hub' },
  { file: `${lang}/bajaj-engine-parts.html`, lang, mode: 'brand', brand: 'bajaj', role: 'btv-bajaj' },
  { file: `${lang}/tvs-engine-parts.html`, lang, mode: 'brand', brand: 'tvs', role: 'btv-tvs' }
]));

const DELIVERY_LABELS = {
  casting: { en: 'Casting', zh: '毛坯' },
  machined: { en: 'Machined', zh: '机加工' },
  assembly: { en: 'Assembly', zh: '组件' }
};

const SPEC_LABELS = {
  fr: {
    engine_type: 'Architecture moteur',
    displacement: 'Cylindrée de référence OEM',
    bore_stroke: 'Alésage × Course',
    compression_ratio: 'Rapport volumétrique',
    max_power: 'Puissance nette max. (réf. OEM)',
    max_torque: 'Couple max. (réf. OEM)',
    transmission: 'Boîte de vitesses',
    start_method: 'Système de démarrage',
    oil_capacity: "Capacité d'huile moteur",
    output_interface: 'Pignon de sortie & faisceau',
    packaging: 'Emballage & conteneur',
    oem_alignment: 'Conformité cotes OEM',
    target_markets: 'Marchés de flotte principaux',
    clutch_transmission: 'Embrayage & boîte de vitesses',
    clutch_lubrication: 'Embrayage & lubrification'
  },
  es: {
    engine_type: 'Tipo de motor',
    displacement: 'Cilindrada de referencia OEM',
    bore_stroke: 'Diámetro × Carrera',
    compression_ratio: 'Relación de compresión',
    max_power: 'Potencia neta máx. (ref. OEM)',
    max_torque: 'Torque máx. (ref. OEM)',
    transmission: 'Transmisión / Caja',
    start_method: 'Sistema de arranque',
    oil_capacity: 'Capacidad de aceite',
    output_interface: 'Piñón de salida y ramal eléctrico',
    packaging: 'Embalaje y contenedor',
    oem_alignment: 'Alineación dimensional OEM',
    target_markets: 'Mercados principales de flota',
    clutch_transmission: 'Embrague y transmisión',
    clutch_lubrication: 'Embrague y lubricación'
  },
  pt: {
    engine_type: 'Tipo de motor',
    displacement: 'Cilindrada de referência OEM',
    bore_stroke: 'Diâmetro × Curso',
    compression_ratio: 'Taxa de compressão',
    max_power: 'Potência líquida máx. (ref. OEM)',
    max_torque: 'Torque máx. (ref. OEM)',
    transmission: 'Transmissão / Câmbio',
    start_method: 'Sistema de partida',
    oil_capacity: 'Capacidade de óleo',
    output_interface: 'Pinhão de saída e chicote',
    packaging: 'Embalagem e contêiner',
    oem_alignment: 'Alinhamento dimensional OEM',
    target_markets: 'Principais mercados de frota',
    clutch_transmission: 'Embreagem e transmissão',
    clutch_lubrication: 'Embreagem e lubrificação'
  },
  ru: {
    engine_type: 'Тип двигателя',
    displacement: 'Эталонный рабочий объём (OEM)',
    bore_stroke: 'Диаметр × Ход поршня',
    compression_ratio: 'Степень сжатия',
    max_power: 'Макс. полезная мощность (OEM)',
    max_torque: 'Макс. крутящий момент (OEM)',
    transmission: 'Трансмиссия / КПП',
    start_method: 'Система запуска',
    oil_capacity: 'Заправочный объём масла',
    output_interface: 'Выходной вал и электроразъёмы',
    packaging: 'Упаковка и погрузка',
    oem_alignment: 'Соответствие посадке OEM',
    target_markets: 'Целевые рынки эксплуатации',
    clutch_transmission: 'Сцепление и КПП',
    clutch_lubrication: 'Сцепление и смазка'
  },
  ar: {
    engine_type: 'نوع المحرك',
    displacement: 'السعة المرجعية (OEM)',
    bore_stroke: 'القطر × الشوط',
    compression_ratio: 'نسبة الانضغاط',
    max_power: 'أقصى قدرة صافية (مرجع OEM)',
    max_torque: 'أقصى عزم دوران (مرجع OEM)',
    transmission: 'ناقل الحركة (الجير)',
    start_method: 'نظام التشغيل',
    oil_capacity: 'سعة زيت المحرك',
    output_interface: 'ترس الخرج وضفيرة التوصيل',
    packaging: 'التغليف والشحن بالحاويات',
    oem_alignment: 'التطابق الهندسي مع أبعاد OEM',
    target_markets: 'أسواق الأساطيل المستهدفة',
    clutch_transmission: 'الدبرياج ونقل الحركة',
    clutch_lubrication: 'الدبرياج والتزييت'
  }
};

const SUBCAT_TRANSLATIONS = {
  fr: {
    'left-crankcase': 'Demi-carter moteur gauche (LH)',
    'right-crankcase': 'Demi-carter moteur droit (RH)',
    'clutch-cover': "Couvercle d'embrayage",
    'magneto-cover': 'Couvercle de magnéto'
  },
  es: {
    'left-crankcase': 'Cárter izquierdo (LH)',
    'right-crankcase': 'Cárter derecho (RH)',
    'clutch-cover': 'Tapa de embrague',
    'magneto-cover': 'Tapa de magneto'
  },
  pt: {
    'left-crankcase': 'Carcaça esquerda (LH)',
    'right-crankcase': 'Carcaça direita (RH)',
    'clutch-cover': 'Tampa de embreagem',
    'magneto-cover': 'Tampa de magneto'
  },
  ru: {
    'left-crankcase': 'Левая половинка картера',
    'right-crankcase': 'Правая половинка картера',
    'clutch-cover': 'Крышка сцепления',
    'magneto-cover': 'Крышка магнето'
  },
  ar: {
    'left-crankcase': 'فخذة كارتيرة شمال',
    'right-crankcase': 'فخذة كارتيرة يمين',
    'clutch-cover': 'غطاء الدبرياج',
    'magneto-cover': 'غطاء المغناطيس'
  }
};

const RELATED_LINK_MAP = {
  '/en/bajaj-tvs-engines-parts': 'btv-hub',
  '/en/bajaj-engine-parts': 'btv-bajaj',
  '/en/cg-engine/cg150-air-cooled-engine': 'cg150-air-cooled-engine',
  '/en/evidence': 'evidence'
};

const EXTRA_RELATED_TITLE = {
  fr: {
    'btv-hub': 'Catalogue complet Bajaj & TVS + tableaux OEM',
    'btv-bajaj': 'Pièces de rechange Bajaj Boxer & RE 4S',
    'cg150-air-cooled-engine': 'Moteur CG150 à refroidissement par air',
    evidence: 'Centre de preuves · Contrôle 100 % au banc'
  },
  es: {
    'btv-hub': 'Catálogo completo Bajaj & TVS y cruce OEM',
    'btv-bajaj': 'Repuestos Bajaj Boxer y Torito RE 4S',
    'cg150-air-cooled-engine': 'Motor varillero CG150 enfriado por aire',
    evidence: 'Centro de Evidencia · Pruebas 100 % en banco'
  },
  pt: {
    'btv-hub': 'Catálogo completo Bajaj & TVS e tabela OEM',
    'btv-bajaj': 'Peças de reposição Bajaj Boxer e RE 4S',
    'cg150-air-cooled-engine': 'Motor vareta CG150 refrigerado a ar',
    evidence: 'Centro de Evidências · Teste 100 % em bancada'
  },
  ru: {
    'btv-hub': 'Полный каталог Bajaj и TVS и сверка OEM',
    'btv-bajaj': 'Запчасти для Bajaj Boxer и RE 4S',
    'cg150-air-cooled-engine': 'Штанговый двигатель CG150 (воздушное)',
    evidence: 'Центр доказательств · 100 % обкатка на стенде'
  },
  ar: {
    'btv-hub': 'الكتالوج الكامل لـ Bajaj و TVS وجدول OEM',
    'btv-bajaj': 'قطع غيار باجاج بوكسر وتوك توك RE 4S',
    'cg150-air-cooled-engine': 'محرك CG150 أسياخ تبريد هواء',
    evidence: 'مركز الأدلة · اختبار بارد وساخن 100%'
  }
};

function loadLocales() {
  if (!fs.existsSync(localesFile)) return {};
  return JSON.parse(fs.readFileSync(localesFile, 'utf8'));
}

const LOCALES = loadLocales();

function readCatalog() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function publicProducts(catalog) {
  return (catalog.products || []).filter((p) => p && p.public === true);
}

function contactPath(lang) {
  if (lang === 'zh') return '/zh-cn/contact';
  return rolePath('contact', mLang(lang));
}

function inquiryHref(lang, product, sourceTag) {
  const contact = contactPath(lang);
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

function uiOf(lang) {
  return (LOCALES[lang] && LOCALES[lang].ui) || null;
}

function productName(product, lang) {
  if (lang === 'zh') return product.name_zh;
  if (lang === 'en') return product.name_en;
  const loc = LOCALES[lang] && LOCALES[lang].products && LOCALES[lang].products[product.id];
  return loc || product.name_en;
}

function categoryMeta(category, lang) {
  if (lang === 'zh') return [category.name_zh, category.description_zh];
  if (lang === 'en') return [category.name_en, category.description_en];
  const loc = LOCALES[lang] && LOCALES[lang].categories && LOCALES[lang].categories[category.id];
  return loc || [category.name_en, category.description_en];
}

function brandHref(brand, lang) {
  if (lang === 'zh') return IS_ISOLATED ? brand.path_zh : brand.path_zh.replace(/\/$/, '');
  if (lang === 'en') return brand.path_en;
  return brand.id === 'bajaj' ? rolePath('btv-bajaj', mLang(lang)) : rolePath('btv-tvs', mLang(lang));
}

function detailHref(product, lang) {
  return `/${mLang(lang)}/bajaj-tvs-engines-parts/${product.id}`;
}

function detailRelPath(product, lang) {
  return path.join(mLang(lang), 'bajaj-tvs-engines-parts', `${product.id}.html`);
}

function deliveryText(form, lang) {
  const ui = uiOf(lang);
  if (ui && ui.delivery && ui.delivery[form]) return ui.delivery[form];
  const d = DELIVERY_LABELS[form];
  return d ? (lang === 'zh' ? d.zh : d.en) : form;
}

function renderBrandCards(catalog, lang) {
  const loc = LOCALES[lang];
  const cards = (catalog.brands || [])
    .map((brand) => {
      const name = lang === 'zh' ? brand.name_zh : brand.name_en;
      const href = brandHref(brand, lang);
      let desc;
      let label;
      if (lang === 'zh') {
        desc = `适用于 ${name} 车型的发动机与配件。按车型或配件类别浏览，提交料号与采购数量获取报价。`;
        label = '查看产品';
      } else if (loc && loc.hub) {
        desc = loc.hub.brandDescTpl.replace('{brand}', name);
        label = loc.hub.viewBrandCta;
      } else {
        desc = `Engines and parts for ${name} motorcycles. Browse by model or part category, then send part numbers and quantities for a quote.`;
        label = 'View Products';
      }
      return `        <div class="feature-item" data-btv-brand="${escapeAttr(brand.id)}">
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
            <a class="btn btn-primary btn-sm" href="${escapeAttr(href)}">${escapeHtml(label)}</a>
          </div>
        </div>`;
    })
    .join('\n');
  return `      <div class="features-grid" data-btv-brands>
${cards}
      </div>`;
}

function productCard(product, lang, detailSet) {
  const name = productName(product, lang);
  const photo = (product.photos || [])[0];
  const ui = uiOf(lang);
  const isZh = lang === 'zh';
  const specs = [];
  if (product.part_number) {
    specs.push(isZh
      ? `料号：${escapeHtml(product.part_number)}`
      : `${escapeHtml(ui ? ui.partNo : 'Part no.')}: ${escapeHtml(product.part_number)}`);
  }
  if (product.oem_part_numbers && product.oem_part_numbers.length) {
    specs.push(isZh
      ? `OEM 参考：${escapeHtml(product.oem_part_numbers.join(', '))}`
      : `${escapeHtml(ui ? ui.oemRef : 'OEM ref.')}: ${escapeHtml(product.oem_part_numbers.join(', '))}`);
  }
  if (product.delivery_form && DELIVERY_LABELS[product.delivery_form]) {
    specs.push(isZh
      ? `交付形态：${deliveryText(product.delivery_form, lang)}`
      : `${escapeHtml(ui ? ui.deliveryLabel : 'Delivery')}: ${escapeHtml(deliveryText(product.delivery_form, lang))}`);
  }
  if (product.engine_codes && product.engine_codes.length) {
    specs.push(`${isZh ? '发动机代码' : escapeHtml(ui ? ui.engineCode : 'Engine code')}: ${escapeHtml(product.engine_codes.join(', '))}`);
  }
  const hasDetailPage = product.public === true && detailSet && detailSet.has(detailRelPath(product, lang));
  const href = hasDetailPage ? escapeAttr(detailHref(product, lang)) : escapeAttr(inquiryHref(lang, product, 'product-card-info'));
  const dispSpec = product.specs && (product.specs.displacement || product.specs.engine_type);
  const specBadgeText = dispSpec && dispSpec.value ? dispSpec.value.split('(')[0].trim() : (product.part_number || 'OEM Spec');
  const eyebrow = isZh ? 'CHIXIANG MOTOR · 整机规格卡' : (ui ? ui.specEyebrow : 'CHIXIANG MOTOR · Complete Engine');
  const note = isZh ? '支持按原厂接口配置定制与混装发运' : (ui ? ui.specNote : 'Built to OEM mounting & shaft specs');
  const imgHtml = photo && photo.src
    ? `          <a class="product-img has-img" href="${href}" style="background-image:url('/${escapeAttr(photo.src)}')" role="img" aria-label="${escapeAttr(isZh ? (photo.alt_zh || name) : name)}"></a>`
    : `          <a class="btv-spec-banner" href="${href}"><span class="btv-spec-banner__eyebrow">${escapeHtml(eyebrow)}</span><span class="btv-spec-banner__code">${escapeHtml(specBadgeText)}</span><span class="btv-spec-banner__note">${escapeHtml(note)}</span></a>`;
  const quoteLabel = isZh ? '询价' : (ui ? ui.quote : 'Request a Quote');
  const detailLabel = isZh ? '查看详情' : (ui ? ui.viewDetails : 'View Details');
  return `        <article class="product-card" data-btv-product="${escapeAttr(product.id)}">
${imgHtml}
          <div class="product-info">
            <h3>${hasDetailPage ? `<a href="${href}">${escapeHtml(name)}</a>` : escapeHtml(name)}</h3>
${specs.length ? `            <div class="specs">${specs.map((s) => `<p>${s}</p>`).join('')}</div>\n` : ''}            <div class="card-actions">
              ${hasDetailPage ? `<a class="btn btn-primary btn-sm" href="${href}">${escapeHtml(detailLabel)}</a>\n              ` : ''}<a class="btn btn-accent btn-sm" href="${escapeAttr(inquiryHref(lang, product, 'product-card'))}">${escapeHtml(quoteLabel)}</a>
            </div>
          </div>
        </article>`;
}

function renderCategorySection(catalog, category, lang, brandFilter, detailSet) {
  const [title, desc] = categoryMeta(category, lang);
  const ui = uiOf(lang);
  const isZh = lang === 'zh';
  const products = publicProducts(catalog).filter((p) => {
    if (p.category !== category.id) return false;
    if (brandFilter && !(p.vehicle_brands || []).includes(brandFilter)) return false;
    return true;
  });
  const grid = products.length
    ? `        <div class="products-grid" data-btv-products="${escapeAttr(category.id)}">
${products.map((p) => productCard(p, lang, detailSet)).join('\n')}
        </div>`
    : '';
  const subLabels = (category.subcategories || []).map((s) => {
    if (isZh) return s.name_zh;
    if (SUBCAT_TRANSLATIONS[lang] && SUBCAT_TRANSLATIONS[lang][s.id]) return SUBCAT_TRANSLATIONS[lang][s.id];
    return s.name_en;
  });
  const sub = subLabels.length
    ? `        <p style="margin-top:0.75rem;color:var(--text-muted);font-size:0.92rem;">${isZh ? '子类别：' : escapeHtml((ui ? ui.subcats : 'Subcategories:') + ' ')}${escapeHtml(subLabels.join(' · '))}</p>`
    : '';
  return `      <section class="section" id="${escapeAttr(category.anchor)}" data-btv-category="${escapeAttr(category.id)}">
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
  const ui = uiOf(lang);
  const catLabelMap = new Map();
  for (const c of catalog.categories || []) {
    if (c && c.id) catLabelMap.set(c.id, categoryMeta(c, lang)[0]);
  }
  const publicProductMap = new Map(publicProducts(catalog).map((p) => [p.id, p]));
  const categorySet = new Set();
  hubs.forEach((hub) => {
    hub.core_parts.forEach((p) => { if (p && p.category) categorySet.add(p.category); });
  });
  const modelOptions = hubs.map((h) => `<option value="${escapeAttr(h.id)}">${escapeHtml(isZh ? h.model_name_zh : h.model_name_en)}</option>`).join('');
  const categoryOptions = [...categorySet].map((cat) => `<option value="${escapeAttr(cat)}">${escapeHtml(catLabelMap.get(cat) || cat)}</option>`).join('');
  const toolbarHtml = `        <div class="btv-hub-toolbar" id="btv-hub-toolbar">
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterModel">${escapeHtml(isZh ? '按车型筛选' : (ui ? ui.filterModel : 'Filter by Model'))}</label>
            <select id="btvFilterModel" data-btv-filter-model>
              <option value="">${escapeHtml(isZh ? '全部车型' : (ui ? ui.allModels : 'All Models'))}</option>
              ${modelOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field">
            <label for="btvFilterCategory">${escapeHtml(isZh ? '按配件分类' : (ui ? ui.filterCat : 'Filter by Category'))}</label>
            <select id="btvFilterCategory" data-btv-filter-category>
              <option value="">${escapeHtml(isZh ? '全部分类' : (ui ? ui.allCats : 'All Categories'))}</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="btv-hub-toolbar__field btv-hub-toolbar__search">
            <label for="btvFilterSearch">${escapeHtml(isZh ? '搜索料号 / OEM 参考号 / 名称' : (ui ? ui.filterSearch : 'Search Chixiang PN, OEM Ref, or Part'))}</label>
            <input type="search" id="btvFilterSearch" data-btv-filter-search placeholder="${escapeAttr(isZh ? '输入驰翔料号、OEM 料号或配件名…' : (ui ? ui.searchPh : 'e.g. DH101234, CX-BJ, Clutch Cover...'))}">
          </div>
          <div class="btv-hub-toolbar__count" data-btv-filter-count></div>
        </div>`;

  const contactBase = contactPath(lang);
  const blocks = hubs.map((hub) => {
    const title = isZh ? hub.model_name_zh : hub.model_name_en;
    const summary = isZh ? (hub.summary_zh || '') : (hub.summary_en || '');
    const meta = [];
    if (hub.displacement_cc) meta.push(isZh ? `排量：${hub.displacement_cc}` : `${ui ? ui.displacementLbl : 'Displacement:'} ${hub.displacement_cc}`);
    if (hub.engine_code) meta.push(isZh ? `发动机代码：${hub.engine_code}` : `${ui ? ui.engineCode : 'Engine code'}: ${hub.engine_code}`);

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
      const qHref = `${contactBase}?${qParams.toString()}`;
      const searchTokens = [title, partName, part.category || '', part.chixiang_pn || '', part.oem_ref || '', part.material_spec || '', partNotes].join(' ').toLowerCase();
      return `<tr id="${escapeAttr(rowAnchor)}" data-btv-row-category="${escapeAttr(part.category || '')}" data-btv-search="${escapeAttr(searchTokens)}">
                <td class="btv-col-select"><input type="checkbox" class="btv-part-checkbox" aria-label="${escapeAttr((isZh ? '选择 ' : (ui ? `${ui.pickRow} ` : 'Select ')) + partName)}" data-btv-brand="${escapeAttr(hub.brand || '')}" data-btv-model="${escapeAttr(title)}" data-btv-part="${escapeAttr(partName)}" data-btv-category="${escapeAttr(part.category || '')}" data-btv-pn="${escapeAttr(part.chixiang_pn || '')}" data-btv-oem="${escapeAttr(part.oem_ref || '')}"></td>
                <th>${escapeHtml(partName)}</th>
                <td>${escapeHtml(catLabelMap.get(part.category) || part.category || 'OEM-Spec Component')}</td>
                <td>${escapeHtml(part.chixiang_pn || 'Match by Model / Sample')}</td>
                <td>${escapeHtml(part.oem_ref || 'OEM-Spec Equivalent')}</td>
                <td>${escapeHtml(part.material_spec || partNotes || 'OEM-Grade Alloy')}</td>
                <td><a class="btn btn-accent btn-sm" href="${escapeAttr(qHref)}">${escapeHtml(isZh ? '询价' : (ui ? ui.quote : 'Quote'))}</a></td>
              </tr>`;
    }).join('\n              ');

    const scopeBadge = hub.supply_scope === 'engines-and-parts'
      ? `<span class="btv-supply-badge btv-supply-badge--engine">${escapeHtml(isZh ? '整机总成 + 核心配件供应' : (ui ? ui.scopeEngine : 'Complete Engine + Core Parts'))}</span>`
      : (hub.supply_scope === 'parts-only'
        ? `<span class="btv-supply-badge btv-supply-badge--parts">${escapeHtml(isZh ? '专供售后核心配件' : (ui ? ui.scopeParts : 'Core Replacement Parts Supply'))}</span>`
        : '');
    const linkedEngine = hub.detail_product_id && publicProductMap.get(hub.detail_product_id);
    const engineLinkHtml = linkedEngine
      ? `<div class="btv-model-actions"><a class="btn btn-primary btn-sm" href="${escapeAttr(detailHref(linkedEngine, lang))}">${escapeHtml(isZh ? '查看整机实拍与原厂对标参数 →' : (ui ? ui.viewCompleteBtn : 'View Complete Engine Photos & OEM Specs →'))}</a></div>`
      : '';

    return `        <div class="catalog-table-block" id="hub-${escapeAttr(hub.id)}" data-btv-model-hub="${escapeAttr(hub.id)}" style="margin-top:2rem;">
          <div class="btv-model-hub-head">
            <h3>${escapeHtml(title)}${meta.length ? ` <span style="font-size:0.9rem;font-weight:400;color:var(--text-secondary);">(${escapeHtml(meta.join(' · '))})</span>` : ''}</h3>
            ${scopeBadge}
          </div>
          ${summary ? `<p style="color:var(--text-secondary);margin:0.5rem 0 0.75rem;line-height:1.7;">${escapeHtml(summary)}</p>` : ''}
          ${engineLinkHtml}
          <p class="table-scroll-hint">${escapeHtml(isZh ? '← 左右滑动查看完整料号并勾选批量询价 →' : (ui ? ui.swipeHint : '← Swipe horizontally to view OEM numbers & select parts →'))}</p>
          <div class="responsive-table-wrap" tabindex="0">
            <table class="specs-table catalog-spec-table btv-bom-table">
              <thead>
                <tr>
                  <th class="btv-col-select">${escapeHtml(isZh ? '选' : (ui ? ui.thPick : 'Pick'))}</th>
                  <th>${escapeHtml(isZh ? '核心配件' : (ui ? ui.thPart : 'Core Part'))}</th>
                  <th>${escapeHtml(isZh ? '分类' : (ui ? ui.thCat : 'Category'))}</th>
                  <th>${escapeHtml(isZh ? '驰翔料号' : (ui ? ui.thPn : 'Chixiang PN'))}</th>
                  <th>${escapeHtml(isZh ? 'OEM 参考料号' : (ui ? ui.thOem : 'OEM Ref. PN'))}</th>
                  <th>${escapeHtml(isZh ? '材质 / 硬度 / 备注' : (ui ? ui.thSpec : 'Material / Hardness / Spec'))}</th>
                  <th>${escapeHtml(isZh ? '采购' : (ui ? ui.thAction : 'Inquiry'))}</th>
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
            <strong>${escapeHtml(isZh ? '已选询价配件' : (ui ? ui.selectedLabel : 'Selected Parts for Quote'))} (<span data-btv-basket-count>0</span>)</strong>
          </div>
          <div class="btv-quote-basket__actions">
            <button type="button" class="btn btn-outline btn-sm" data-btv-basket-clear>${escapeHtml(isZh ? '清空' : (ui ? ui.clearBtn : 'Clear'))}</button>
            <button type="button" class="btn btn-accent btn-sm" data-btv-basket-submit>${escapeHtml(isZh ? '批量打包询价 →' : (ui ? ui.batchBtn : 'Request Batch Quote →'))}</button>
          </div>
        </div>`;

  return `      <section class="section" id="model-hubs" data-btv-section="model-hubs">
        <div class="container">
          <h2 class="section-title">${escapeHtml(isZh ? '按车型聚合配件与 OEM 料号表' : (ui ? ui.hubSectionTitle : 'Model-Aggregated Parts & OEM Cross-Reference'))}</h2>
          <p class="section-subtitle">${escapeHtml(isZh
            ? '同一车型对应的核心配件与原厂参考料号集中展示，支持勾选多个料号打包询价及与整机同柜混装订购。'
            : (ui ? ui.hubSectionSub : 'Filter by vehicle model or search by OEM reference number. Check multiple parts below for batch quotation and mixed container loading.'))}</p>
${toolbarHtml}
${blocks}
${basketHtml}
        </div>
      </section>`;
}

function renderCatalogBody(catalog, page, detailSet) {
  const lang = page.lang;
  const loc = LOCALES[lang];
  const parts = [];
  if (page.mode === 'hub') {
    const brandHeading = lang === 'zh'
      ? '按车型品牌浏览'
      : (loc && loc.hub ? loc.hub.brandHeading : 'Browse by motorcycle brand');
    parts.push(`      <section class="section" id="brands" data-btv-section="brands">
        <div class="container">
          <h2 class="section-title">${escapeHtml(brandHeading)}</h2>
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

function patchHeadHreflangs(html, role) {
  if (IS_ISOLATED || !role || !ROUTE_GROUPS[role]) return html;
  const hrefBlock = hreflangTagsHtml(role, '  ');
  return html.replace(/([ \t]*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*\/?>\r?\n?)+/i, `${hrefBlock}\n`);
}

function fullHubBrandHtml(catalog, page, detailSet) {
  const lang = page.lang;
  const loc = LOCALES[lang];
  const ui = loc.ui;
  const chrome = LOCALE_CHROME[lang];
  const metaBlock = page.mode === 'hub'
    ? loc.hub
    : (page.brand === 'bajaj' ? loc.bajajBrand : loc.tvsBrand);
  const canonical = `${ORIGIN}${rolePath(page.role, lang)}`;
  const quoteHref = `${contactPath(lang)}?product_interest=parts&source_form=bajaj-tvs-catalog&source_cta=hero`;
  const waModel = page.brand === 'bajaj'
    ? 'Bajaj Boxer BM150 / CT100 / RE 4S'
    : (page.brand === 'tvs' ? 'TVS HLX150 / 125 & TVS King 200' : 'Bajaj Boxer BM150 / TVS HLX150');
  const waUrl = waHref(lang, waModel);
  const catalogBody = renderCatalogBody(catalog, page, detailSet);

  const visibleProducts = publicProducts(catalog).filter((p) => !page.brand || (p.vehicle_brands || []).includes(page.brand));
  const itemListGraph = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: metaBlock.h1,
    numberOfItems: visibleProducts.length,
    itemListElement: visibleProducts.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: productName(p, lang),
        sku: p.part_number || p.id,
        brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
        manufacturer: { '@id': `${ORIGIN}/#organization` },
        url: `${ORIGIN}${detailHref(p, lang)}`
      }
    }))
  };
  const orgGraph = {
    '@context': 'https://schema.org',
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
  const procCards = (loc.hub.procItems || [])
    .map((itemHtml, idx) => `        <div class="feature-item"><h3>0${idx + 1}</h3><p>${itemHtml}</p></div>`)
    .join('\n');
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const breadcrumb = page.mode === 'hub'
    ? `<a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><a href="${rolePath('products', lang)}">${escapeHtml(chrome.nav.products)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(metaBlock.h1)}</span>`
    : `<a href="${rolePath('home', lang)}">${escapeHtml(chrome.nav.home)}</a><span aria-hidden="true">/</span><a href="${rolePath('products', lang)}">${escapeHtml(chrome.nav.products)}</a><span aria-hidden="true">/</span><a href="${rolePath('btv-hub', lang)}">${escapeHtml(ui.backHub)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(metaBlock.h1)}</span>`;

  return `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
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
  <title>${escapeHtml(metaBlock.title)}</title>
  <meta name="description" content="${escapeAttr(metaBlock.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0d0d0d">
  <link rel="canonical" href="${canonical}">
${hreflangTagsHtml(page.role, '  ')}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(metaBlock.title)}">
  <meta property="og:description" content="${escapeAttr(metaBlock.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ORIGIN}/images/parts.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261123-matrix">
  <script type="application/ld+json">
${JSON.stringify(orgGraph, null, 2)}
  </script>
  <script type="application/ld+json" data-product-family-schema>
${JSON.stringify(itemListGraph, null, 2)}
  </script>
</head>
<body class="btv-page">
${renderMobileNav(lang, page.role, quoteHref)}
${renderNavbar(lang, page.role, 'parts', quoteHref)}
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb">${breadcrumb}</nav>
      <h1>${escapeHtml(metaBlock.h1)}</h1>
      <p class="section-subtitle">${escapeHtml(loc.hub.lead)}</p>
      <div class="cta-actions" style="justify-content:center;margin-top:1.5rem;">
        <a href="#model-hubs" class="btn btn-primary btn-lg">${escapeHtml(ui.hubSectionTitle)}</a>
        <a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">${escapeHtml(chrome.nav.quote)}</a>
      </div>
    </div></section>
${catalogBody}
    <section class="section" id="procurement" style="background:var(--bg-secondary);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(loc.hub.procHeading)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
${procCards}
        </div>
      </div>
    </section>
    <section class="cta-section"><div class="container">
      <h2>${escapeHtml(ui.detailCtaTitle)}</h2>
      <p style="color:var(--text-secondary);max-width:680px;margin:0 auto 1rem;line-height:1.7;">${escapeHtml(ui.detailCtaDesc)} <a href="${rolePath('evidence', lang)}">${escapeHtml(ui.evidenceLink)}</a></p>
      <div class="cta-actions">
        <a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-lg">${escapeHtml(ui.contactProc)}</a>
        <a href="${escapeAttr(waUrl)}" class="btn btn-primary btn-lg" target="_blank" rel="noopener">${escapeHtml(chrome.waLabel)}</a>
      </div>
      <p data-commercial-benchmark style="margin-top:1.5rem;padding:0.9rem 1.15rem;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border-color);color:var(--text-secondary);font-size:0.9rem;line-height:1.6;">${escapeHtml(ui.termsLine)}</p>
      <p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted);max-width:760px;margin-left:auto;margin-right:auto;">${escapeHtml(ui.disclaimer)}</p>
    </div></section>
  </main>
${renderFooter(lang, waUrl, quoteHref, ['/js/btv-catalog-basket.js'])}
</body>
</html>
`;
}

function newlineOf(html) {
  return html.includes('\r\n') ? '\r\n' : '\n';
}

function toNewlines(text, nl) {
  return nl === '\r\n' ? text.replace(/\r?\n/g, '\r\n') : text.replace(/\r\n/g, '\n');
}

function localizeSpecLabel(key, spec, lang) {
  if (lang === 'zh') return spec.label_zh || key;
  if (lang === 'en') return spec.label_en || key;
  return (SPEC_LABELS[lang] && SPEC_LABELS[lang][key]) || spec.label_en || key;
}

function detailDesc(product, name, lang) {
  const pn = product.part_number;
  if (lang === 'zh') {
    return `${name}${pn ? `（料号 ${pn}）` : ''}。按原厂同等排量、缸径×行程及车架安装尺寸制造，支持标准 50 台混装批发与同柜发运。`;
  }
  if (lang === 'fr') {
    return `${name}${pn ? ` (réf. ${pn})` : ''}. Moteur de remplacement adaptable fabriqué aux cotes de fixation OEM pour flottes africaines ; commande mixte dès 50 unités FOB Guangzhou.`;
  }
  if (lang === 'es') {
    return `${name}${pn ? ` (SKU ${pn})` : ''}. Motor de reemplazo tipo original fabricado con medidas y anclajes OEM para flotas y mototaxis ; contenedor mixto desde 50 unidades FOB Guangzhou.`;
  }
  if (lang === 'pt') {
    return `${name}${pn ? ` (ref. ${pn})` : ''}. Motor de reposição paralelo padrão OEM construído nas medidas de fixação originais ; contêiner misto a partir de 50 unidades FOB Guangzhou.`;
  }
  if (lang === 'ru') {
    return `${name}${pn ? ` (арт. ${pn})` : ''}. Независимый сменный двигатель, изготовленный по посадочным размерам OEM ; смешанный контейнер от 50 штук FOB Гуанчжоу.`;
  }
  if (lang === 'ar') {
    return `${name}${pn ? ` (مرجع ${pn})` : ''}. محرك بديل مستقل مصمم وفق أبعاد التثبيت القياسية لأساطيل العمل الشاق، شحن في حاوية مختلطة من 50 محركاً FOB قوانغتشو.`;
  }
  return `${name}${pn ? ` (part no. ${pn})` : ''}. Built to OEM-equivalent displacement, bore × stroke, and mounting dimensions for wholesale supply; send part numbers and quantities for a quote.`;
}

function buildSpecRows(product, lang) {
  const isZh = lang === 'zh';
  const ui = uiOf(lang);
  const specRows = [];
  if (product.part_number) {
    specRows.push([isZh ? '驰翔料号' : (ui ? ui.partNo : 'Chixiang part number'), product.part_number]);
  }
  if (product.oem_part_numbers && product.oem_part_numbers.length) {
    specRows.push([isZh ? 'OEM 参考料号' : (ui ? ui.oemRef : 'OEM reference number(s)'), product.oem_part_numbers.join(', ')]);
  }
  if (product.delivery_form && DELIVERY_LABELS[product.delivery_form]) {
    specRows.push([isZh ? '交付形态' : (ui ? ui.deliveryLabel : 'Delivery form'), deliveryText(product.delivery_form, lang)]);
  }
  for (const code of product.engine_codes || []) {
    specRows.push([isZh ? '发动机代码' : (ui ? ui.engineCode : 'Engine code'), code]);
  }
  for (const model of product.models || []) {
    const versions = (model.versions || []).join(', ');
    specRows.push([
      isZh ? '适配车型' : (lang === 'en' ? 'Fitment model' : model.name),
      versions ? `${model.name} (${versions})` : model.name
    ]);
  }
  for (const [key, spec] of Object.entries(product.specs || {})) {
    if (!spec || spec.value == null || spec.value === '') continue;
    specRows.push([localizeSpecLabel(key, spec, lang), spec.value]);
  }
  return specRows;
}

function detailPageHtml(catalog, product, lang) {
  const isZh = lang === 'zh';
  const matrixCode = mLang(lang);
  const chrome = LOCALE_CHROME[matrixCode] || LOCALE_CHROME.en;
  const ui = uiOf(lang);
  const name = productName(product, lang);
  const home = isZh ? '/zh-cn/' : (IS_ISOLATED ? '/en/' : rolePath('home', matrixCode));
  const hub = isZh ? '/zh-cn/bajaj-tvs-engines-parts' : (IS_ISOLATED ? '/en/bajaj-tvs-engines-parts' : rolePath('btv-hub', matrixCode));
  const productsCrumb = isZh ? '/zh-cn/products' : (IS_ISOLATED ? '/en/products' : rolePath('products', matrixCode));
  const productsCrumbLabel = isZh ? '发动机产品' : (IS_ISOLATED ? 'Products' : chrome.nav.products);
  const hubLabel = isZh ? 'Bajaj / TVS 发动机与配件' : (ui ? ui.backHub : 'Bajaj / TVS Engines & Parts');
  const contact = contactPath(lang);
  const canonical = `${ORIGIN}${detailHref(product, lang)}`;
  const desc = detailDesc(product, name, lang);
  const specRows = buildSpecRows(product, lang);

  const specsTitle = isZh ? '产品参数' : (ui ? ui.detailSpecsTitle : 'Product specifications');
  const specsHtml = specRows.length
    ? `<section class="section"><div class="container"><h2 class="section-title">${escapeHtml(specsTitle)}</h2>
      <table class="spec-table" style="width:100%;border-collapse:collapse;margin-top:1rem;">
        <tbody>${specRows.map(([k, v]) => `<tr><th style="text-align:${chrome.dir === 'rtl' ? 'right' : 'left'};padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);width:32%;">${escapeHtml(k)}</th><td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border-color,#e5e5e5);">${escapeHtml(v)}</td></tr>`).join('')}</tbody>
      </table></div></section>`
    : '';

  const photosTitle = isZh ? '产品照片' : (ui ? ui.detailPhotosTitle : 'Product photos');
  const photosHtml = (product.photos || []).length
    ? `<section class="section" style="background:var(--bg-secondary);"><div class="container"><h2 class="section-title">${escapeHtml(photosTitle)}</h2>
      <div class="products-grid">${(product.photos || []).map((photo) => `<div class="product-card"><div class="product-img has-img" style="background-image:url('/${escapeAttr(photo.src)}')" role="img" aria-label="${escapeAttr(isZh ? (photo.alt_zh || name) : name)}"></div><div class="product-info"><p>${escapeHtml(isZh ? (photo.alt_zh || '') : (lang === 'en' ? (photo.alt_en || '') : name))}</p></div></div>`).join('')}</div></div></section>`
    : '';

  const accessoriesHtml = (product.included_accessories || []).length
    ? `<p style="margin-top:1rem;color:var(--text-secondary);">${isZh ? '随附配件：' : escapeHtml((ui ? ui.includedAcc : 'Included accessories:') + ' ')}${escapeHtml((product.included_accessories || []).map((a) => (isZh ? a.name_zh : a.name_en)).join(' · '))}</p>`
    : '';

  const bm150Loc = product.id === 'bajaj-boxer-bm150-complete-engine'
    ? (lang === 'en' ? product.flagship : (LOCALES[lang] && LOCALES[lang].bm150 ? { ...product.flagship, ...LOCALES[lang].bm150 } : null))
    : null;
  const faqSchema = bm150Loc && Array.isArray(bm150Loc.faqs) && bm150Loc.faqs.length
    ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: bm150Loc.faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
    : null;

  const photoUrls = (product.photos || [])
    .filter((ph) => ph && ph.src)
    .map((ph) => `${ORIGIN}/${ph.src}`);
  const productNode = {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name,
    description: desc,
    url: canonical,
    brand: { '@id': `${ORIGIN}/#organization` },
    manufacturer: { '@id': `${ORIGIN}/#organization` },
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
        '@id': `${ORIGIN}/#organization`,
        name: 'CHIXIANG MOTOR',
        legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
        alternateName: 'Chixiang Motor',
        url: `${ORIGIN}/`,
        logo: `${ORIGIN}/images/logo.webp`,
        sameAs: officialSameAs,
        foundingDate: '2007',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
          addressLocality: 'Chongqing',
          addressCountry: 'CN'
        }
      },
      productNode
    ]
  };
  const homeLabel = isZh ? '首页' : chrome.nav.home;
  const entityGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name,
        isPartOf: { '@id': `${ORIGIN}/#website` },
        publisher: { '@id': `${ORIGIN}/#organization` },
        inLanguage: matrixCode,
        description: desc,
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        mainEntity: { '@id': `${canonical}#product` }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeLabel, item: `${ORIGIN}${home}` },
          { '@type': 'ListItem', position: 2, name: productsCrumbLabel, item: `${ORIGIN}${productsCrumb}` },
          { '@type': 'ListItem', position: 3, name: hubLabel, item: `${ORIGIN}${hub}` },
          { '@type': 'ListItem', position: 4, name, item: canonical }
        ]
      }
    ]
  };

  let flagshipHtml = '';
  if (bm150Loc) {
    const verdictLabel = ui ? ui.verdictLabel : 'Quick Engineering Verdict · Aftermarket Compatibility Reference';
    const versionTitle = ui ? ui.versionTitle : '4-Speed vs. 5-Speed Version Differences & 5-Point Interface Checklist';
    const vHdrs = ui ? ui.versionHeaders : ['BM150 Configuration', 'Fleet Application', 'Pre-Order Verification'];
    const specVsOemTitle = ui ? ui.specVsOemTitle : 'CHIXIANG Actual Supply Spec vs. Calibrated OEM Reference';
    const sHdrs = ui ? ui.specVsOemHeaders : ['Component', 'Chixiang PN', 'Actual Supply Specification', 'OEM Reference Number'];
    const bundleTitle = ui ? ui.bundleTitle : 'BM150 Replacement Engine + Core Spares Consolidation Quote';
    const bundleSub = ui ? ui.bundleSub : 'Select the complete BM150 replacement engine and matching crankcases, covers, cylinder kit, or clutch kit to prefill a consolidated inquiry.';
    const bundleQty = ui ? ui.bundleQty : 'Estimated Quantity (Engines / Spares Lot)';
    const bundleCountry = ui ? ui.bundleCountry : 'Destination Country / Market';
    const bundleCountryPh = ui ? ui.bundleCountryPh : 'e.g. Nigeria, Kenya, Uganda, Peru';
    const bundleBtn = ui ? ui.bundleBtn : 'Proceed to Prefilled Quote Form →';
    const faqTitle = ui ? ui.faqTitle : 'Bajaj Boxer BM150 Replacement FAQ';
    const baseEngineLabel = lang === 'en'
      ? 'Complete Replacement Engine (144.8 cc, 4/5-Speed)'
      : productName(product, lang);
    const relLinks = lang === 'en'
      ? (product.flagship.related_links || [])
      : Object.entries(RELATED_LINK_MAP).map(([enHref, role]) => ({
        url: rolePath(role, matrixCode),
        title: EXTRA_RELATED_TITLE[lang][role] || role,
        description: ''
      }));

    flagshipHtml = `
    <section class="section" style="padding-top:1.5rem;padding-bottom:1.5rem;">
      <div class="container">
        <div class="flagship-verdict" style="margin-top:0;">
          <p class="flagship-verdict__label">${escapeHtml(verdictLabel)}</p>
          <p style="margin:0;color:var(--text-primary);line-height:1.65;">${escapeHtml(bm150Loc.quick_verdict)}</p>
        </div>
        <h2 class="section-title" style="margin-top:2rem;">${escapeHtml(versionTitle)}</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${vHdrs.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${(bm150Loc.version_differences || []).map((v) => `<tr><th scope="row">${escapeHtml(v.variant)}</th><td>${escapeHtml(v.application)}</td><td>${escapeHtml(v.key_check)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${(bm150Loc.fitment_checklist || []).map((c) => `<div class="feature-item" style="text-align:${chrome.dir === 'rtl' ? 'right' : 'left'};"><h3>${escapeHtml(c.step)}</h3><p>${escapeHtml(c.detail)}</p></div>`).join('')}
        </div>
      </div>
    </section>
    <section class="section" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(specVsOemTitle)}</h2>
        <div class="responsive-table-wrap" tabindex="0" style="margin-top:1.25rem;">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${sHdrs.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${(bm150Loc.spec_vs_oem_rows || []).map((r) => `<tr><th scope="row">${escapeHtml(r.component)}</th><td>${escapeHtml(r.chixiang_pn)}</td><td>${escapeHtml(r.chixiang_spec)}</td><td>${escapeHtml(r.oem_ref)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section" id="bundle-quote">
      <div class="container">
        <h2 class="section-title">${escapeHtml(bundleTitle)}</h2>
        <p class="section-subtitle">${escapeHtml(bundleSub)}</p>
        <form id="flagshipBundleForm" class="flagship-bundle-card" data-model="Bajaj Boxer BM150" data-engine-code="BM150 SOHC (36PF / JA Ref.)" data-vehicle="Bajaj Boxer BM150 (144.8 cc)" data-engine-sku="${escapeAttr(product.part_number)}" data-product-interest="parts" data-source-form="bajaj-tvs-catalog" data-source-cta="bm150-bundle" data-contact-path="${escapeAttr(contact)}">
          <div class="flagship-bundle-grid">
            <div class="flagship-bundle-field">
              <label for="flagshipBundleQty">${escapeHtml(bundleQty)}</label>
              <input type="text" id="flagshipBundleQty" placeholder="e.g. 50 engines + 50 crankcase pairs" value="50 units">
            </div>
            <div class="flagship-bundle-field">
              <label for="flagshipBundleCountry">${escapeHtml(bundleCountry)}</label>
              <input type="text" id="flagshipBundleCountry" placeholder="${escapeAttr(bundleCountryPh)}">
            </div>
          </div>
          <div class="flagship-bundle-list">
            <label class="flagship-bundle-item">
              <input type="checkbox" data-bundle-item data-part-name="${escapeAttr(baseEngineLabel)}" data-part-pn="${escapeAttr(product.part_number)}" data-part-oem="36PF0004 / 36PF0005 Ref." checked>
              <span><strong>${escapeHtml(baseEngineLabel)}</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">PN: ${escapeHtml(product.part_number)} · OEM Ref: 36PF0004 / 36PF0005 Ref.</span></span>
            </label>
            ${(bm150Loc.bundle_items || []).map((b, idx) => `<label class="flagship-bundle-item"><input type="checkbox" data-bundle-item data-part-name="${escapeAttr(b.name)}" data-part-pn="${escapeAttr(b.pn)}" data-part-oem="${escapeAttr(b.oem)}" ${idx < 2 ? 'checked' : ''}><span><strong>${escapeHtml(b.name)}</strong><br><span style="font-size:0.84rem;color:var(--text-secondary);">PN: ${escapeHtml(b.pn)} · OEM Ref: ${escapeHtml(b.oem)}</span></span></label>`).join('')}
          </div>
          <div class="cta-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn btn-accent">${escapeHtml(bundleBtn)}</button>
          </div>
        </form>
        <div class="features-grid" style="margin-top:2rem;">
          ${relLinks.map((l) => `<div class="feature-item" style="text-align:${chrome.dir === 'rtl' ? 'right' : 'left'};"><h3><a href="${escapeAttr(l.url)}">${escapeHtml(l.title)}</a></h3>${l.description ? `<p>${escapeHtml(l.description)}</p>` : ''}</div>`).join('')}
        </div>
      </div>
    </section>
    <section class="section" style="background:var(--bg-surface,#f8fafc);">
      <div class="container">
        <h2 class="section-title">${escapeHtml(faqTitle)}</h2>
        <div class="features-grid" style="margin-top:1.5rem;">
          ${(bm150Loc.faqs || []).map((f) => `<div class="feature-item" style="text-align:${chrome.dir === 'rtl' ? 'right' : 'left'};"><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  const ogImage = (product.photos || [])[0] && (product.photos || [])[0].src
    ? `${ORIGIN}/${product.photos[0].src}`
    : `${ORIGIN}/images/parts.webp`;
  const detailTitle = `${escapeHtml(name)}${isZh ? '｜Bajaj / TVS 发动机与配件｜CHIXIANG MOTOR' : ` | ${escapeHtml(hubLabel)} | CHIXIANG MOTOR`}`;
  const evidenceHref = isZh ? '/zh-cn/evidence' : (IS_ISOLATED ? '/en/evidence' : rolePath('evidence', matrixCode));
  const otherLangUrl = isZh
    ? `${ORIGIN}/en/bajaj-tvs-engines-parts/${product.id}`
    : `${ORIGIN}/zh-cn/bajaj-tvs-engines-parts/${product.id}`;

  const hreflangsHtml = !IS_ISOLATED && ROUTE_GROUPS[product.id]
    ? hreflangTagsHtml(product.id, '  ')
    : `  <link rel="alternate" hreflang="${isZh ? 'zh-CN' : 'en'}" href="${canonical}">
  <link rel="alternate" hreflang="${isZh ? 'en' : 'zh-CN'}" href="${otherLangUrl}">
  <link rel="alternate" hreflang="x-default" href="${ORIGIN}/en/bajaj-tvs-engines-parts/${product.id}">`;

  const ctaTitle = isZh ? '提交料号与采购数量，获取报价' : (ui ? ui.detailCtaTitle : 'Send part numbers and quantities for a quote');
  const ctaDesc = isZh
    ? '支持与 CG / CB / 卧式 / 三轮水冷发动机同柜混装出货。材质、硬度及实验室测功机验证标准详见证据中心。'
    : (ui ? ui.detailCtaDesc : 'Available for mixed container loading alongside CG, CB, horizontal, and water-cooled engines. Material, hardness, and dynamometer standards are documented in our Evidence Center.');
  const evLabel = isZh ? '查看证据中心' : (ui ? ui.evidenceLink : 'View Evidence Center');
  const contactProc = isZh ? '联系采购' : (ui ? ui.contactProc : 'Contact Procurement');
  const termsLine = isZh
    ? '标准 MOQ：50 台（支持跨平台混批） · 标准交期：约 10 个工作日 · 贸易条款：FOB 广州（可协调中国其他主要港口） · 质保：到港后 60 天'
    : (ui ? ui.termsLine : 'Standard MOQ: 50 Units (Mixed Models Supported) · Lead Time: ~10 Working Days · Export Term: FOB Guangzhou (Other Major Chinese Ports Available) · Warranty: 60 Days After Destination Port Arrival');
  const disclaimerLine = isZh
    ? '说明：Bajaj®、TVS® 品牌与车型名称仅用于原厂适配参考。Chixiang Motor 供应独立售后替换发动机与核心零部件。'
    : (ui ? ui.disclaimer : 'Note: Brand and model names (Bajaj®, TVS®) are referenced solely for OEM fitment compatibility. Chixiang Motor supplies independent aftermarket replacement engines and components.');

  const quoteHref = inquiryHref(lang, product, 'detail-page');
  const waUrl = waHref(matrixCode, name);
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';

  const navShell = !IS_ISOLATED
    ? `${renderMobileNav(matrixCode, product.id, quoteHref)}\n${renderNavbar(matrixCode, product.id, 'parts', quoteHref)}`
    : (() => {
      const langSwitchHref = isZh ? detailHref(product, 'en') : detailHref(product, 'zh');
      const langSwitchLabel = isZh ? 'English' : '简体中文';
      const contactLabel = isZh ? '联系我们' : 'Contact';
      const quoteLabel = isZh ? '获取报价' : 'Get a Quote';
      return `  <div class="mobile-nav" id="mobileNav"${isZh ? ' hidden' : ''}>
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
      <li><a href="${escapeAttr(inquiryHref(lang, product, 'detail-nav'))}" class="mnav-accent">${quoteLabel}<span class="mnav-arrow">&rsaquo;</span></a></li>
    </ul>
    <div class="mobile-nav-langs"><a href="${home}" hreflang="${isZh ? 'zh-CN' : 'en'}">${isZh ? '简体中文' : 'English'}</a><a href="${langSwitchHref}" hreflang="${isZh ? 'en' : 'zh-CN'}">${langSwitchLabel}</a></div>
  </div>
  <nav class="navbar">
    <div class="container">
      <a href="${home}" class="nav-logo"><span class="logo-icon"><img src="/images/logo.webp" alt="CHIXIANG MOTOR" width="36" height="36" decoding="async"></span><span class="logo-text">CHIXIANG MOTOR</span></a>
      <ul class="nav-links" role="navigation" aria-label="Main navigation">${isZh
        ? `<li><a href="/zh-cn/">首页</a></li><li><a href="/zh-cn/products">发动机产品</a></li><li><a href="/zh-cn/bajaj-tvs-engines-parts" class="active" aria-current="page">Bajaj / TVS 配件</a></li><li><a href="/zh-cn/evidence">证据中心</a></li><li><a href="/zh-cn/contact">联系询价</a></li>`
        : `<li><a href="/en/">Home</a></li><li><a href="/en/products">Products</a></li><li class="nav-item-dropdown"><a href="/en/engine-parts" class="active">Engine Parts <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></a><ul class="nav-dropdown"><li><a href="/en/engine-parts">All Engine Parts</a></li><li><a href="/en/engine-parts/hw-series">HW200–HW350 Kits &amp; Parts</a></li><li><a href="/en/bajaj-tvs-engines-parts" aria-current="page">Bajaj / TVS Engines &amp; Parts</a></li></ul></li><li><a href="/en/evidence">Evidence</a></li><li><a href="/en/about">About Us</a></li><li><a href="/en/news">News</a></li><li><a href="/en/contact">Contact</a></li>`}</ul>
      <div class="nav-right"><a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-sm">${quoteLabel}</a><button class="menu-toggle" aria-label="${isZh ? '打开菜单' : 'Toggle menu'}"><span></span><span></span><span></span></button></div>
    </div>
  </nav>`;
    })();

  const footerShell = !IS_ISOLATED
    ? renderFooter(matrixCode, waUrl, quoteHref, bm150Loc ? ['/js/flagship-engine-page.js'] : [])
    : `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col"><h4>${isZh ? '关于' : 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.'}</h4><p>${isZh ? '重庆驰翔摩托车制造有限公司<br>CHIXIANG MOTOR<br>重庆高新区含谷片区' : 'CHIXIANG MOTOR &middot; Motorcycle engine industry experience since 2003. Company registered in 2007.'}</p></div>
        <div class="footer-col"><h4>${isZh ? '产品' : 'Quick Links'}</h4><a href="${home}">${homeLabel}</a><br><a href="${productsCrumb}">${productsCrumbLabel}</a><br><a href="${hub}">${hubLabel}</a><br><a href="${contact}">${isZh ? '联系我们' : 'Contact'}</a></div>
        <div class="footer-col"><h4>${isZh ? '联系' : 'Contact'}</h4><p>${isZh ? '电话/微信: +86 19008225410<br>邮箱: chixiangmotor@163.com' : 'Tel/WhatsApp: +86 19008225410<br>Email: chixiangmotor@163.com'}</p></div>
      </div>
      <div class="footer-bottom"><span>&copy; 2026 ${isZh ? '重庆驰翔摩托车制造有限公司 (CHIXIANG MOTOR)' : 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) &middot; Export documentation and logistics are executed through Chixiang\'s designated export division.'}</span></div>
    </div>
  </footer>
  <script src="/js/main.js" defer></script>
  <script src="/js/core-menu-accessibility.js" defer></script>${bm150Loc ? '\n  <script src="/js/flagship-engine-page.js" defer></script>' : ''}`;

  return `<!DOCTYPE html>
${DETAIL_MARKER}
<html lang="${isZh ? 'zh-CN' : matrixCode}"${dirAttr}>
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
  <meta name="description" content="${escapeAttr(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
${hreflangsHtml}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(detailTitle)}">
  <meta property="og:description" content="${escapeAttr(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261123-matrix">
  <script type="application/ld+json">
${JSON.stringify(productGraph, null, 2)}
  </script>${faqSchema ? `\n  <script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n  </script>` : ''}
  <script type="application/ld+json" data-site-entity-graph>
${JSON.stringify(entityGraph, null, 2)}
  </script>
</head>
<body class="${isZh ? 'zh-cn-page ' : ''}btv-page">
${navShell}
  <main>
    <section class="page-header"><div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="${home}">${escapeHtml(homeLabel)}</a><span aria-hidden="true">/</span><a href="${productsCrumb}">${escapeHtml(productsCrumbLabel)}</a><span aria-hidden="true">/</span><a href="${hub}">${escapeHtml(hubLabel)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(name)}</span></nav>
      <h1>${escapeHtml(name)}</h1>
      <p class="section-subtitle">${escapeHtml(desc)}</p>
    </div></section>
${photosHtml}
${specsHtml}
${flagshipHtml}
    <section class="cta-section"><div class="container">
      <h2>${escapeHtml(ctaTitle)}</h2>
      <p style="color:var(--text-secondary);max-width:680px;margin:0 auto 1rem;line-height:1.7;">${escapeHtml(ctaDesc)} <a href="${evidenceHref}">${escapeHtml(evLabel)}</a></p>
      ${accessoriesHtml}
      <div class="cta-actions"><a class="btn btn-accent btn-lg" href="${escapeAttr(inquiryHref(lang, product, 'detail-cta'))}">${escapeHtml(contactProc)}</a><a class="btn btn-primary btn-lg" href="${hub}">${escapeHtml(hubLabel)}</a></div>
      <p data-commercial-benchmark style="margin-top:1.25rem;font-size:0.9rem;color:var(--text-secondary);font-weight:500;">${escapeHtml(termsLine)}</p>
      <p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted);">${escapeHtml(disclaimerLine)}</p>
    </div></section>
  </main>
${footerShell}
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

function expectedDetailPaths(catalog) {
  const out = [];
  for (const product of publicProducts(catalog)) {
    for (const lang of ACTIVE_LANGS) {
      out.push(detailRelPath(product, lang));
    }
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

function syncSitemapDetails(catalog) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const wantDetail = new Set();
  for (const product of publicProducts(catalog)) {
    for (const lang of ACTIVE_LANGS) {
      wantDetail.add(`${ORIGIN}${detailHref(product, lang)}`);
    }
  }
  const wantHub = new Set();
  if (!IS_ISOLATED) {
    for (const p of FULL_PAGES) {
      wantHub.add(`${ORIGIN}${rolePath(p.role, p.lang)}`);
    }
  }

  const seen = new Set();
  let removed = 0;
  const langGroup = [...new Set([...ACTIVE_LANGS.map(mLang), 'zh-cn'])].join('|');
  const detailRe = new RegExp(` {0,2}<url>\\s*<loc>(${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(?:${langGroup})/bajaj-tvs-engines-parts/[^<]+)</loc>[\\s\\S]*?</url>\\r?\\n`, 'g');
  let out = xml.replace(detailRe, (block, url) => {
    if (wantDetail.has(url)) {
      seen.add(url);
      return block;
    }
    removed += 1;
    return '';
  });

  const existingLocs = new Set([...out.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const today = new Date().toISOString().slice(0, 10);
  const added = [];
  for (const url of wantHub) {
    if (existingLocs.has(url)) continue;
    added.push(url);
    out = out.replace('</urlset>', `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);
    existingLocs.add(url);
  }
  for (const url of wantDetail) {
    if (seen.has(url) || existingLocs.has(url)) continue;
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

  for (const page of PATCH_PAGES) {
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
      next = patchHeadHreflangs(next, page.role);
      next = toNewlines(next, nl);
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

  for (const page of FULL_PAGES) {
    const abs = path.join(root, page.file);
    const rawFull = fullHubBrandHtml(catalog, page, expected);
    const html = applyToHtml(rawFull, `${ORIGIN}${rolePath(page.role, page.lang)}`).replace(/\r?\n/g, '\r\n');
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (current !== html) {
      changes.push({ file: page.file, stale: true });
      if (!checkOnly) {
        ensureDir(abs);
        fs.writeFileSync(abs, html, 'utf8');
      }
    }
  }

  for (const product of publicProducts(catalog)) {
    for (const lang of ACTIVE_LANGS) {
      const rel = detailRelPath(product, lang);
      const abs = path.join(root, rel);
      const rawDetail = detailPageHtml(catalog, product, lang);
      const html = (IS_ISOLATED ? rawDetail : applyToHtml(rawDetail, `${ORIGIN}${detailHref(product, lang)}`)).replace(/\r?\n/g, '\r\n');
      const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
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

  const sitemap = syncSitemapDetails(catalog);
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
