const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { routes, schemaOnlyRoutes, locales } = require('./product-family-owner-manifest');

const root = path.join(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const factFile = path.join(root, 'docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv');

const modelIds = {
  cg: [
    'model-cg125', 'model-cg150', 'model-cg175', 'model-cg200', 'model-cg250',
    'model-cg150sb', 'model-cg175sb', 'model-cg200sb', 'model-cg250sb'
  ],
  cb: ['model-cb150', 'model-cb200-c', 'model-cb250'],
  horizontal: ['model-152fmh', 'model-153fmi', 'model-154fmi', 'model-1p56fmj', 'model-1p60fmj'],
  ac320: ['model-ac320-175mn']
};

const familyFactIds = [
  'intake-cg-balance-shaft',
  'intake-tsunami-water',
  'intake-hanwei-hw-water',
  'intake-automatic-clutch-water'
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function approvedPublic(recordById, specId) {
  const record = recordById.get(specId);
  if (!record) throw new Error(`Missing governed fact record: ${specId}`);
  if (record.approval_status !== 'APPROVED_PUBLIC' || record.visibility !== 'PUBLIC') {
    throw new Error(`${specId} is not approved for public use`);
  }
  return record;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unit(value, suffix) {
  return value ? `${escapeHtml(value)} ${suffix}` : '—';
}

function list(items) {
  return `<ul style="color:var(--text-secondary);line-height:1.9;list-style:disc;padding-left:1.2rem;">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function table(labels, columns, rows, options = {}) {
  const rowIds = Array.isArray(options.rowIds) ? options.rowIds : null;
  const rowHeaderScope = options.rowHeaderScope === true;
  const rowDetailLinks = options.rowDetailLinks || null;
  const detailLinkText = options.detailLinkText || 'View Details';
  const body = rows.map((row, rowIndex) => {
    const idAttr = rowIds && rowIds[rowIndex] ? ` id="${escapeHtml(rowIds[rowIndex])}"` : '';
    const cells = row.map((cell, index) => {
      if (index === 0) {
        const detailHref = rowDetailLinks && rowDetailLinks[cell];
        const inner = detailHref
          ? `${escapeHtml(cell)}<br><a href="${escapeHtml(detailHref)}" style="font-size:0.82rem;font-weight:600;color:var(--accent-color);white-space:nowrap;">${escapeHtml(detailLinkText)} &rarr;</a>`
          : escapeHtml(cell);
        return rowHeaderScope ? `<th scope="row">${inner}</th>` : `<th>${inner}</th>`;
      }
      return `<td>${escapeHtml(cell)}</td>`;
    }).join('');
    return `<tr${idAttr}>${cells}</tr>`;
  }).join('');
  return `<div class="responsive-table-wrap" tabindex="0">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>`;
}

const cgModelRowAnchors = {
  'model-cg125': 'cg-air-125',
  'model-cg150': 'cg-air-150',
  'model-cg175': 'cg-air-175',
  'model-cg200': 'cg-air-200',
  'model-cg250': 'cg-air-250',
  'model-cg150sb': 'cg-water-150sb',
  'model-cg175sb': 'cg-water-175sb',
  'model-cg200sb': 'cg-water-200sb',
  'model-cg250sb': 'cg-water-250sb'
};

function modelQuickLinks(entries, ariaLabel) {
  return `<nav class="model-quick-links" aria-label="${escapeHtml(ariaLabel)}">${entries.map(([anchor, code]) => `<a href="#${escapeHtml(anchor)}">${escapeHtml(code)}</a>`).join('')}</nav>`;
}

function model(recordById, specId) {
  return approvedPublic(recordById, specId);
}

function cgWaterProcurementNote(language) {
  if (language === 'fr') {
    return `
        <div class="feature-item" style="text-align:left;margin-top:1.25rem;" data-cg-water-procurement>
          <h3>Moteurs CG refroidis par eau pour tricycle cargo : avant votre demande de devis</h3>
          <p>Conçus pour le tricycle cargo et le tricycle 250/300cc à eau à forte charge, avec sélection adaptée au châssis et au refroidissement. <strong>Des versions à marche arrière intégrée ou compatibles boîte de marche arrière externe sont disponibles selon le modèle ; précisez votre transmission lors du devis.</strong></p>
          <p>Indiquez la cylindrée souhaitée, l'entraxe de fixation, le nombre de cannelures de l'arbre de sortie et les besoins en kit de réfection moteur refroidi par eau afin d'intégrer moteurs complets et pièces détachées dans un même conteneur.</p>
        </div>`;
  }
  if (language !== 'en') return '';
  return `
        <div class="feature-item" style="text-align:left;margin-top:1.25rem;" data-cg-water-procurement>
          <h3>CG water-cooled engines: before you request a quotation</h3>
          <p>Engineered for heavy-duty cargo tricycles and commercial motorcycles, matched to your vehicle payload, cooling setup, and mounting interface. <strong>Built-in or external reverse-gear configurations are available across designated CG water-cooled models; specify your drive setup when requesting a quote.</strong></p>
          <p>Specify your target displacement, mounting lug spacing, output-shaft spline count, and cooling setup so we can match matching service parts and export packing in one quotation.</p>
        </div>`;
}

const brochureModelMetrics = {
  'model-cg125': { maxPower: '7.5 kW @ 8,000 rpm', maxTorque: '8.6 N·m @ 7,000 rpm', compression: '9.2 : 1', weight: '31 kg', dimensions: '380 × 355 × 500 mm' },
  'model-cg150': { maxPower: '8.5 kW @ 8,000 rpm', maxTorque: '10 N·m @ 7,500 rpm', compression: '9.2 : 1', weight: '31.05 kg', dimensions: '380 × 355 × 500 mm' },
  'model-cg175': { maxPower: '9.5 kW @ 8,000 rpm', maxTorque: '11.5 N·m @ 6,500 rpm', compression: '8.6–9.3 : 1', weight: '31 kg', dimensions: '380 × 355 × 500 mm' },
  'model-cg200': { maxPower: '10 kW @ 7,500 rpm', maxTorque: '13.5 N·m @ 6,500 rpm', compression: '8.5–9.3 : 1', weight: '31.3 kg', dimensions: '380 × 355 × 500 mm' },
  'model-cg250': { maxPower: '10.5 kW @ 7,000 rpm', maxTorque: '16.5 N·m @ 5,000 rpm', compression: '8.7 : 1', weight: '32 kg', dimensions: '380 × 355 × 500 mm' },
  'model-cg150sb': { maxPower: '8.5 kW @ 8,500 rpm (±5%)', maxTorque: '10.0 N·m @ 7,500 rpm (±5%)', compression: '10.0 : 1', weight: '31.2 kg', dimensions: '425 × 385 × 530 mm', gearsKey: 'fiveRotaryReverse' },
  'model-cg175sb': { maxPower: '9.5 kW @ 8,000 rpm (±5%)', maxTorque: '11.5 N·m @ 6,500 rpm (±5%)', compression: '8.6–9.3 : 1', weight: '31.6 kg', dimensions: '425 × 385 × 530 mm', gearsKey: 'fiveRotaryReverse' },
  'model-cg200sb': { maxPower: '10.5 kW @ 7,500 rpm (±5%)', maxTorque: '15.0 N·m @ 6,000 rpm (±5%)', compression: '9.2 : 1', weight: '33 kg', dimensions: '425 × 385 × 530 mm', gearsConfirmed: true },
  'model-cg250sb': { maxPower: '11.5 kW @ 7,000 rpm (±5%)', maxTorque: '19.5 N·m @ 5,000 rpm (±5%)', compression: '10.0–10.5 : 1', weight: '32.9 kg', dimensions: '425 × 385 × 530 mm', gearsConfirmed: true },
  'model-cb150': { maxPower: '8.2 kW @ 8,500 rpm', maxTorque: '10.5 N·m @ 7,000 rpm', weight: '29 kg', dimensions: '385 × 355 × 452 mm' },
  'model-cb200-c': { maxPower: '10.2 kW @ 7,000 rpm', maxTorque: '13.5 N·m @ 6,000 rpm', weight: '31 kg', dimensions: '385 × 355 × 452 mm' },
  'model-cb250': { maxPower: '12 kW @ 7,000 rpm', maxTorque: '17.5 N·m @ 5,500 rpm', weight: '31 kg', dimensions: '385 × 355 × 452 mm' },
  'model-152fmh': { maxPower: '4.7 kW @ 8,000 rpm', maxTorque: '6.7 N·m @ 6,000 rpm', compression: '9.7 : 1', weight: '19 kg', dimensions: '477 × 395 × 280 mm' },
  'model-1p56fmj': { maxPower: '8.2 kW @ 8,000 rpm', maxTorque: '10.2 N·m @ 7,500 rpm', compression: '9.8 : 1', weight: '21 kg', dimensions: '460 × 300 × 260 mm' },
  'model-1p60fmj': { maxPower: '10.2 kW @ 9,500 rpm', maxTorque: '11.2 N·m @ 8,000 rpm', compression: '9.9 : 1', weight: '22 kg', dimensions: '435 × 285 × 235 mm' }
};

const hwWaterModels = [
  ['HW200', '200cc Class', '197.0 mL', '63.5 × 62.2 mm', '10.5 kW @ 7,500 rpm', '15 N·m @ 6,000 rpm', '9.2 : 1', '38 kg', '425 × 385 × 530 mm', 'PZ30'],
  ['HW250', '250cc Class', '246.3 mL', '70 × 64 mm', '11.5 kW @ 7,000 rpm', '19.5 N·m @ 5,000 rpm', '10.1–10.5 : 1', '38.1 kg', '425 × 385 × 530 mm', 'PZ30'],
  ['HW300', '300cc Class', '275.3 mL', '74 × 64 mm', '12.5 kW @ 6,500 rpm', '21 N·m @ 4,500 rpm', '10.4 : 1', '39 kg', '425 × 385 × 530 mm', 'PZ30'],
  ['HW350', '350cc Class', '300.3 mL', '76 × 66.2 mm', '13 kW @ 6,500 rpm', '22.5 N·m @ 4,500 rpm', '10.4 : 1', '40.4 kg', '425 × 385 × 530 mm', 'PZ30']
];

const horizontalCatalogModels = [
  { code: 'CX152FMH-5B', nominal: '110 cc', actual: '106.7 ml', boreStroke: '52.4 × 49.5 mm', maxPower: '4.7 kW @ 8,000 rpm', maxTorque: '6.7 N·m @ 6,000 rpm', compression: '9.7 : 1', weight: '19 kg', dimensions: '477 × 395 × 280 mm', coolingKey: 'air', clutchKey: 'autoWet' },
  { code: 'CX152FMH-6', nominal: '125 cc', actual: '107 ml', boreStroke: '52.4 × 49.5 mm', maxPower: '4.9 kW @ 8,000 rpm', maxTorque: '6.9 N·m @ 6,000 rpm', compression: '9.7 : 1', weight: '19 kg', dimensions: '477 × 395 × 280 mm', coolingKey: 'air', clutchKey: 'autoWet' },
  { code: 'CX152FMH-5B (130)', nominal: '130 cc', actual: '123.67 ml', boreStroke: '54 × 54 mm', maxPower: '6.3 kW @ 7,500 rpm', maxTorque: '8.8 N·m @ 5,500 rpm', compression: '9.0 : 1', weight: '23 kg', dimensions: '450 × 280 × 277 mm', coolingKey: 'air', clutchKey: 'autoWet' },
  { code: 'CX1P56FMJ', nominal: '140 cc', actual: '140 ml', boreStroke: '56 × 57 mm', maxPower: '8.2 kW @ 8,000 rpm', maxTorque: '10.2 N·m @ 7,500 rpm', compression: '9.8 : 1', weight: '21 kg', dimensions: '460 × 300 × 260 mm', coolingKey: 'air', clutchKey: 'manualSemi' },
  { code: 'CX1P60FMJ', nominal: '150 cc', actual: '149.8 ml', boreStroke: '60 × 53 mm', maxPower: '10.2 kW @ 9,500 rpm', maxTorque: '11.2 N·m @ 8,000 rpm', compression: '9.9 : 1', weight: '22 kg', dimensions: '435 × 285 × 235 mm', coolingKey: 'internalOil', clutchKey: 'manualSemi' }
];

function renderCg(recordById, locale, language) {
  const l = locale.labels;
  const v = locale.values;
  const withRowAnchors = language === 'en' || language === 'fr';
  const airSpecIds = modelIds.cg.slice(0, 5);
  const waterSpecIds = modelIds.cg.slice(5);
  const air = airSpecIds.map(id => model(recordById, id));
  const water = waterSpecIds.map(id => model(recordById, id));
  const airColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.netWeight, l.dimensions, l.cooling, l.start, l.clutch, l.gears];
  const waterColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.grossWeight, l.packageDimensions, l.cooling, l.start, l.clutch, l.gears];
  const rows = records => records.map(record => {
    const metrics = brochureModelMetrics[record.spec_id] || {};
    const gearText = record.gear_pattern || (metrics.gearsKey ? v[metrics.gearsKey] : (metrics.gearsConfirmed ? v.five : '—'));
    return [
      record.model_code,
      unit(record.nominal_displacement_cc, 'cc'),
      unit(record.actual_displacement_cc, 'cc'),
      record.bore_mm && record.stroke_mm ? `${record.bore_mm} × ${record.stroke_mm} mm` : '—',
      metrics.maxPower || '—',
      metrics.maxTorque || '—',
      metrics.compression || '—',
      metrics.weight || '—',
      metrics.dimensions || '—',
      record.cooling === 'Water-cooled' ? v.water : v.air,
      v.electricKick,
      v.manualWet,
      gearText
    ];
  });
  const airRowIds = withRowAnchors ? airSpecIds.map(id => cgModelRowAnchors[id]) : null;
  const waterRowIds = withRowAnchors ? waterSpecIds.map(id => cgModelRowAnchors[id]) : null;
  const airQuickLinks = withRowAnchors
    ? modelQuickLinks(air.map((record, index) => [airRowIds[index], record.model_code]), language === 'fr' ? 'Choisir un modèle CG refroidi par air' : 'Choose CG air-cooled engine model')
    : '';
  const waterQuickLinks = withRowAnchors
    ? modelQuickLinks(water.map((record, index) => [waterRowIds[index], record.model_code]), language === 'fr' ? 'Choisir un modèle CG refroidi par eau' : 'Choose CG water-cooled engine model')
    : '';
  const airDetailLinks = {
    CG150: `/${language}/cg-engine/cg150-air-cooled-engine`,
    CG200: `/${language}/cg-engine/cg200-air-cooled-engine`
  };
  const waterDetailLinks = {
    CG250SB: `/${language}/cg-engine/cg250sb-water-cooled-engine`
  };
  const hwDetailLinks = {
    HW300: `/${language}/cg-engine/hw300-water-cooled-engine`
  };
  const detailLinkLabels = {
    en: 'View Details',
    fr: 'Voir la fiche',
    es: 'Ver ficha técnica',
    pt: 'Ver ficha técnica',
    ru: 'Подробнее',
    ar: 'عرض التفاصيل'
  };
  const detailLinkText = detailLinkLabels[language] || 'View Details';
  const airTableOptions = withRowAnchors ? { rowIds: airRowIds, rowHeaderScope: true, rowDetailLinks: airDetailLinks, detailLinkText } : { rowDetailLinks: airDetailLinks, detailLinkText };
  const waterTableOptions = withRowAnchors ? { rowIds: waterRowIds, rowHeaderScope: true, rowDetailLinks: waterDetailLinks, detailLinkText } : { rowDetailLinks: waterDetailLinks, detailLinkText };
  const familyCardAnchors = ['cg-balance-shaft', 'tsunami', 'hw-water', 'auto-clutch'];
  const cards = locale.familyCards.map(([heading, body], index) => `<div class="feature-item" style="text-align:left;" id="${familyCardAnchors[index] || `family-option-${index}`}"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(body)}</p></div>`).join('');
  const hwColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.netWeight, l.dimensions, l.carburetor, l.cooling, l.start, l.clutch];
  const hwRows = hwWaterModels.map(item => [...item, v.water, v.electricKick, v.manualWet]);
  const hwRowIds = withRowAnchors ? ['hw-200', 'hw-250', 'hw-300', 'hw-350'] : undefined;
  const hwTable = table(l, hwColumns, hwRows, { rowIds: hwRowIds, rowHeaderScope: true, rowDetailLinks: hwDetailLinks, detailLinkText });
  const cgAirHeading = language === 'fr' ? 'Série CG refroidie par air (125–250 cc)' : 'CG Air-Cooled';
  const cgWaterHeading = language === 'fr' ? 'Série CG refroidie par eau (150–250 cc)' : 'CG Water-Cooled';
  const hwCatalogLabels = {
    en: 'Need spare parts for HW200–HW350 engines? <a href="/en/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">Browse the HW Series Parts Catalog &rarr;</a>',
    fr: 'Besoin d\'un kit de réfection moteur refroidi par eau ou de pièces HW200–HW350 ? <a href="/fr/cg-engine/hw300-water-cooled-engine" style="color:var(--accent-color);font-weight:600;">Voir la fiche HW300 &rarr;</a> · <a href="/fr/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">Catalogue complet pièces HW &rarr;</a>',
    es: '¿Necesita repuestos para cargueros HW200–HW350? <a href="/es/cg-engine/hw300-water-cooled-engine" style="color:var(--accent-color);font-weight:600;">Ver ficha HW300 &rarr;</a> · <a href="/es/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">Catálogo de repuestos HW &rarr;</a>',
    pt: 'Precisa de peças para triciclos HW200–HW350? <a href="/pt/cg-engine/hw300-water-cooled-engine" style="color:var(--accent-color);font-weight:600;">Ver ficha HW300 &rarr;</a> · <a href="/pt/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">Catálogo de peças HW &rarr;</a>',
    ru: 'Нужны запчасти для водяных HW200–HW350? <a href="/ru/cg-engine/hw300-water-cooled-engine" style="color:var(--accent-color);font-weight:600;">Страница HW300 &rarr;</a> · <a href="/ru/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">Каталог запчастей HW &rarr;</a>',
    ar: 'هل تحتاج قطع غيار لمحركات HW200–HW350؟ <a href="/ar/cg-engine/hw300-water-cooled-engine" style="color:var(--accent-color);font-weight:600;">عرض HW300 &larr;</a> · <a href="/ar/engine-parts/hw-series" style="color:var(--accent-color);font-weight:600;">كتالوج قطع HW &larr;</a>'
  };
  const hwCatalogLink = hwCatalogLabels[language]
    ? `\n        <p style="margin-top:0.75rem;color:var(--text-secondary);">${hwCatalogLabels[language]}</p>`
    : '';
  return `<div class="catalog-table-block" id="cg-air-cooled">
        <h3>${escapeHtml(cgAirHeading)}</h3>
        ${airQuickLinks}${table(l, airColumns, rows(air), airTableOptions)}
      </div>
      <div class="catalog-table-block" id="cg-water-cooled">
        <h3>${escapeHtml(cgWaterHeading)}</h3>
        ${waterQuickLinks}${table(l, waterColumns, rows(water), waterTableOptions)}${cgWaterProcurementNote(language)}
      </div>
      <h3 class="section-title" style="margin-top:2.5rem;">${escapeHtml(l.familyOptions)}</h3>
      <div class="features-grid" style="margin-top:1.5rem;">${cards}</div>
      <div class="catalog-table-block" id="hw-water-specifications" style="margin-top:2rem;">
        <h3>${escapeHtml(l.hwHeading)}</h3>
        ${hwTable}
        <p style="margin-top:0.85rem;color:var(--text-secondary);line-height:1.7;">${escapeHtml(l.hwNote)}</p>${hwCatalogLink}
      </div>`;
}

function renderCb(recordById, locale) {
  const l = locale.labels;
  const v = locale.values;
  const records = modelIds.cb.map(id => model(recordById, id));
  const rows = records.map(record => {
    const metrics = brochureModelMetrics[record.spec_id] || {};
    return [
      record.model_code,
      unit(record.nominal_displacement_cc, 'cc'),
      unit(record.actual_displacement_cc, 'cc'),
      metrics.maxPower || '—',
      metrics.maxTorque || '—',
      metrics.weight || '—',
      metrics.dimensions || '—',
      v.air,
      v.kickElectric,
      v.manualWet,
      v.five
    ];
  });
  return `<div class="catalog-table-block" id="cb-specifications">
        ${table(l, [l.model, l.nominal, l.actual, l.maxPower, l.maxTorque, l.netWeight, l.dimensions, l.cooling, l.start, l.clutch, l.gears], rows)}
      </div>`;
}

function renderHorizontal(recordById, locale) {
  const l = locale.labels;
  const v = locale.values;
  const records = modelIds.horizontal.map(id => model(recordById, id));
  const rows = records.map(record => [
    record.model_code,
    unit(record.nominal_displacement_cc, 'cc'),
    record.aliases,
    record.spec_id === 'model-1p60fmj' ? v.internalOil : v.air,
    v.kickElectric,
    v.upperLower,
    record.clutch.includes('or semi-automatic') ? v.manualSemi : v.manual,
    v.four,
    v.reverse
  ]);
  const catalogColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.netWeight, l.dimensions, l.cooling, l.start, l.clutch, l.gears];
  const catalogRows = horizontalCatalogModels.map(item => [
    item.code, item.nominal, item.actual, item.boreStroke, item.maxPower, item.maxTorque,
    item.compression, item.weight, item.dimensions, v[item.coolingKey], v.electricKick, v[item.clutchKey], v.fourConstant
  ]);
  return `<div class="catalog-table-block" id="cx-models">
        ${table(l, [l.model, l.nominal, l.marketReference, l.cooling, l.start, l.starterPosition, l.clutch, l.gears, l.options], rows)}
      </div>
      <div class="catalog-table-block" id="horizontal-catalog-specs" style="margin-top:2rem;">
        <h3>${escapeHtml(l.horizontalCatalogHeading)}</h3>
        ${table(l, catalogColumns, catalogRows, { rowHeaderScope: true })}
        <p style="margin-top:0.85rem;color:var(--text-secondary);line-height:1.7;">${escapeHtml(l.horizontalCatalogNote)}</p>
      </div>
      <div class="feature-item" style="text-align:left;margin-top:1.5rem;"><h3>${escapeHtml(l.marketReference)}</h3><p>${escapeHtml(locale.marketNote)}</p></div>`;
}

function renderParts(locale) {
  const l = locale.labels;
  return `<div class="catalog-table-block" id="parts-specifications">
        ${table(l, [l.category, l.examples], locale.partsCategories)}
      </div>
      <div class="catalog-table-block" id="parts-compatibility-matrix" style="margin-top:2rem;">
        <h3>${escapeHtml(locale.partsMatrixHeading)}</h3>
        ${table(l, locale.partsMatrixColumns, locale.partsMatrixRows, { rowHeaderScope: true })}
        <p style="margin-top:0.85rem;color:var(--text-secondary);line-height:1.7;">${escapeHtml(locale.partsMatrixNote)}</p>
      </div>`;
}

function renderFaq(locale, family) {
  const items = locale.faq[family] || (family === 'parts' ? locale.faq.parts : locale.faq.engine);
  return `<section class="section" style="background:var(--bg-secondary);" data-product-family-owner-faq="${family}">
    <div class="container">
      <h2 class="section-title">${escapeHtml(locale.labels.faq)}</h2>
      <div class="features-grid" style="margin-top:2rem;">
        ${items.map(([question, answer]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></div>`).join('')}
      </div>
    </div>
  </section>`;
}

const commercialBenchmarkLabels = {
  en: 'Standard MOQ: 50 Units (Mixed Models Supported) · Lead Time: ~10 Working Days · Export Term: FOB Guangzhou (Other Major Chinese Ports Available) · Warranty: 60 Days After Destination Port Arrival',
  es: 'MOQ Estándar: 50 Unidades (Modelos Mixtos) · Plazo: ~10 Días Hábiles · Término: FOB Guangzhou (Otros Puertos Disponibles) · Garantía: 60 Días Tras Llegada a Puerto de Destino',
  pt: 'MOQ Padrão: 50 Unidades (Modelos Mistos) · Prazo: ~10 Dias Úteis · Termo: FOB Guangzhou (Outros Portos Disponíveis) · Garantia: 60 Dias Após Chegada ao Porto de Destino',
  ru: 'Стандартный MOQ: 50 шт. (Смешанный заказ) · Срок: ~10 рабочих дней · Условия: FOB Гуанчжоу (другие порты КНР по согласованию) · Гарантия: 60 дней после прибытия в порт назначения',
  ar: 'الحد الأدنى القياسي: 50 وحدة (نماذج مختلطة) · مدة التجهيز: ~10 أيام عمل · الشروط: FOB قوانغتشو (موانئ صينية أخرى متاحة) · الضمان: 60 يوماً بعد الوصول لميناء الوجهة',
  fr: 'MOQ standard : 50 moteurs (commande mixte de plusieurs modèles et moteurs complets et pièces détachées dans un même conteneur) · Délai : ~10 jours ouvrables · Conditions : FOB Guangzhou, Chine (autres ports chinois sur demande) · Ports cibles : Abidjan, Douala, Cotonou, Dakar (transit pays enclavé à préciser) · Documents : facture, colisage, numéros de série moteur, certificat d\'origine sur demande (BSC / BESC coordonné par l\'importateur et son transitaire) · Garantie : 60 jours après arrivée au port'
};

function renderOwnerBlock(recordById, route) {
  const locale = locales[route.language];
  const l = locale.labels;
  const applications = locale.applications[route.family];
  const checklist = route.family === 'parts' ? locale.checklist.parts : locale.checklist.engine;
  let familyContent;
  if (route.family === 'cg') familyContent = renderCg(recordById, locale, route.language);
  else if (route.family === 'cb') familyContent = renderCb(recordById, locale);
  else if (route.family === 'horizontal') familyContent = renderHorizontal(recordById, locale);
  else familyContent = renderParts(locale);

  return `<!-- Product Detail SEO Content -->
  <!-- PRODUCT FAMILY OWNER START -->
  <section class="section product-seo-detail" data-product-family-owner="${route.family}" data-owner-language="${route.language}">
    <div class="container">
      <h2 class="section-title">${escapeHtml(l.approvedHeading)}</h2>
      <p class="section-subtitle">${escapeHtml(locale.intro[route.family])}</p>
      ${familyContent}
      ${route.family !== 'parts' ? `<div class="feature-item" style="text-align:left;margin-top:1.5rem;" data-packing-scope><h3>${escapeHtml(l.packingScopeHeading)}</h3><p>${escapeHtml(l.packingScopeBody)}</p></div>` : ''}
      <div class="features-grid" style="margin-top:2rem;">
        <div class="feature-item" style="text-align:left;"><h3>${escapeHtml(l.applications)}</h3>${list(applications)}</div>
        <div class="feature-item" style="text-align:left;"><h3>${escapeHtml(l.checklist)}</h3>${list(checklist)}</div>
      </div>
      <div class="catalog-table-block" style="margin-top:2rem;">
        <h3>${escapeHtml(l.related)}</h3>
        <div class="cta-actions" style="justify-content:flex-start;margin-top:1rem;">
          <a href="${escapeHtml(locale.paths.contact)}" class="btn btn-accent btn-sm">${escapeHtml(l.contact)}</a>
          <a href="${escapeHtml(locale.paths.products)}" class="btn btn-primary btn-sm">${escapeHtml(l.products)}</a>
          <a href="${escapeHtml(locale.paths.about)}" class="btn btn-outline btn-sm">${escapeHtml(l.about)}</a>
          <a href="${escapeHtml(locale.paths.email)}" class="btn btn-outline btn-sm">${escapeHtml(l.email)}</a>
        </div>
        <p data-commercial-benchmark style="margin-top:1.25rem;padding:0.85rem 1rem;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border-color);color:var(--text-secondary);font-size:0.9rem;line-height:1.6;">${escapeHtml(commercialBenchmarkLabels[route.language] || commercialBenchmarkLabels.en)}</p>
      </div>
    </div>
  </section>
  ${renderFaq(locale, route.family)}${route.family === 'cg' && (route.language === 'en' || route.language === 'fr') ? '\n  <script src="../js/cg-model-quick-links.js" defer></script>' : ''}
  <!-- PRODUCT FAMILY OWNER END -->
  <!-- /Product Detail SEO Content -->`;
}

function buildPropertyValues(pairs) {
  return pairs
    .filter(([, value]) => value && value !== '—')
    .map(([name, value]) => ({ '@type': 'PropertyValue', name, value: String(value) }));
}

function buildProductNode({ name, description, category, pageUrl, modelNumber, properties }) {
  const node = {
    '@type': 'Product',
    name,
    description,
    category,
    brand: { '@type': 'Brand', name: 'CHIXIANG MOTOR' },
    manufacturer: { '@id': 'https://chixiangmotor.com/#organization' },
    url: pageUrl
  };
  if (modelNumber) node.model = modelNumber;
  if (properties && properties.length) node.additionalProperty = properties;
  return node;
}

function replaceProductFamilySchema(html, recordById, route) {
  if (route.family === 'parts') return html;
  const specIds = modelIds[route.family] || [];
  if (!specIds.length) return html;
  const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const pageUrl = canonicalMatch ? canonicalMatch[1] : `https://chixiangmotor.com/${route.language}/`;
  const categoryName = route.family === 'cg'
    ? 'CG Motorcycle & Cargo-Tricycle Engines'
    : (route.family === 'cb'
      ? 'CB Motorcycle Engines'
      : (route.family === 'ac320' ? 'AC320 ATV / UTV Liquid-Cooled Engines' : 'Horizontal Motorcycle Engines'));

  const productNodes = specIds.map(id => {
    const rec = model(recordById, id);
    const metrics = brochureModelMetrics[id] || {};
    const disp = rec.actual_displacement_cc ? `${rec.actual_displacement_cc} cc` : `${rec.nominal_displacement_cc} cc`;
    const boreStroke = rec.bore_mm && rec.stroke_mm ? `${rec.bore_mm} × ${rec.stroke_mm} mm` : '';
    return buildProductNode({
      name: `${rec.model_code} (${disp})`,
      description: `${rec.marketing_name || rec.model_code} — ${rec.configuration || rec.family}`,
      category: categoryName,
      pageUrl,
      modelNumber: rec.model_code,
      properties: buildPropertyValues([
        ['Nominal Displacement', rec.nominal_displacement_cc ? `${rec.nominal_displacement_cc} cc` : ''],
        ['Actual Displacement', rec.actual_displacement_cc ? `${rec.actual_displacement_cc} cc` : ''],
        ['Bore × Stroke', boreStroke],
        ['Max Power', metrics.maxPower],
        ['Max Torque', metrics.maxTorque],
        ['Compression Ratio', metrics.compression],
        ['Cooling System', rec.cooling],
        ['Starting Method', rec.start_method],
        ['Clutch Type', rec.clutch],
        ['Transmission', rec.gear_pattern],
        ['Net / Package Weight', metrics.weight],
        ['Dimensions', metrics.dimensions],
        ['Reverse Configuration', rec.reverse_configuration]
      ])
    });
  });

  if (route.family === 'cg') {
    for (const [code, nominal, actual, boreStroke, maxPower, maxTorque, compression, weight, dimensions, carb] of hwWaterModels) {
      productNodes.push(buildProductNode({
        name: `${code} (${nominal} HW Heavy-Duty Water-Cooled)`,
        description: `${code} — Heavy-duty CG water-cooled engine with cooling fins, 1.5 L oil capacity, 20-roller clutch, and high-output DC magneto`,
        category: categoryName,
        pageUrl: `${pageUrl}#hw-water-specifications`,
        modelNumber: code,
        properties: buildPropertyValues([
          ['Nominal Displacement', nominal],
          ['Actual Displacement', actual],
          ['Bore × Stroke', boreStroke],
          ['Max Power', maxPower],
          ['Max Torque', maxTorque],
          ['Compression Ratio', compression],
          ['Cooling System', 'Water-cooled with cooling fins'],
          ['Oil Capacity', '1.5 L'],
          ['Clutch Type', '20-roller clutch (manual wet multi-plate)'],
          ['Transmission', 'Standard 5-speed forward transmission (external reverse compatible)'],
          ['Carburetor', carb],
          ['Net Weight', weight],
          ['Dimensions', dimensions]
        ])
      }));
    }
  }

  if (route.family === 'horizontal') {
    for (const variant of horizontalCatalogModels.slice(0, 3)) {
      productNodes.push(buildProductNode({
        name: `${variant.code} (${variant.nominal} Horizontal Engine)`,
        description: `${variant.code} — Horizontal 10° inclined OHC 4-stroke engine (${variant.actual})`,
        category: categoryName,
        pageUrl: `${pageUrl}#horizontal-catalog-specs`,
        modelNumber: variant.code,
        properties: buildPropertyValues([
          ['Nominal Class', variant.nominal],
          ['Actual Displacement', variant.actual],
          ['Bore × Stroke', variant.boreStroke],
          ['Max Power', variant.maxPower],
          ['Max Torque', variant.maxTorque],
          ['Compression Ratio', variant.compression],
          ['Cooling System', 'Air-cooled'],
          ['Clutch Type', 'Automatic wet multi-plate'],
          ['Transmission', '4-speed constant mesh'],
          ['Net Weight', variant.weight],
          ['Dimensions', variant.dimensions]
        ])
      }));
    }
  }

  const items = productNodes.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName,
    numberOfItems: items.length,
    itemListElement: items
  };
  const scriptBlock = `<script type="application/ld+json" data-product-family-schema>\n${JSON.stringify(schema, null, 2)}\n</script>`;
  const existingRe = /<script\b(?=[^>]*\bdata-product-family-schema\b)[^>]*>[\s\S]*?<\/script>/i;
  if (existingRe.test(html)) {
    return html.replace(existingRe, scriptBlock);
  }
  const graphAnchor = /([ \t]*<script\b(?=[^>]*\bdata-site-entity-graph\b)[^>]*>)/i;
  if (graphAnchor.test(html)) {
    return html.replace(graphAnchor, `  ${scriptBlock}\n$1`);
  }
  return html.replace(/<\/head>/i, `  ${scriptBlock}\n</head>`);
}

function replaceFaqSchema(html, route) {
  const locale = locales[route.language];
  const faq = locale.faq[route.family] || (route.family === 'parts' ? locale.faq.parts : locale.faq.engine);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  };
  let replaced = false;
  const updated = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, block => {
    if (/data-site-entity-graph/i.test(block)) return block;
    const source = block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try {
      const data = JSON.parse(source);
      if (data['@type'] !== 'FAQPage') return block;
    } catch {
      return block;
    }
    replaced = true;
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  });
  if (!replaced) throw new Error(`${route.file}: FAQPage schema not found`);
  return updated;
}

function preservePageNewlines(before, after, file) {
  const hasCrlf = before.includes('\r\n');
  const hasBareLf = /(?<!\r)\n/.test(before);
  const hasLoneCr = /\r(?!\n)/.test(before);
  if ((hasCrlf && hasBareLf) || hasLoneCr) {
    throw new Error(`Unsupported mixed page newlines: ${file}`);
  }
  return after.replace(/\r?\n/g, hasCrlf ? '\r\n' : '\n');
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const records = parseCsv(fs.readFileSync(factFile, 'utf8'));
const recordById = new Map(records.map(record => [record.spec_id, record]));
for (const id of [...Object.values(modelIds).flat(), ...familyFactIds]) approvedPublic(recordById, id);

const changed = [];
for (const route of [...routes, ...schemaOnlyRoutes.map(item => ({ ...item, schemaOnly: true }))]) {
  const file = path.join(root, route.file);
  const before = fs.readFileSync(file, 'utf8');
  let after;
  if (route.protected || route.schemaOnly) {
    after = replaceProductFamilySchema(before, recordById, route);
    after = preservePageNewlines(before, after, route.file);
  } else {
    const marker = /<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/;
    if (!marker.test(before)) throw new Error(`${route.file}: product detail content markers not found`);
    after = before.replace(marker, renderOwnerBlock(recordById, route));
    after = replaceFaqSchema(after, route);
    after = replaceProductFamilySchema(after, recordById, route);
    after = preservePageNewlines(before, after, route.file);
  }
  if (hash(before) !== hash(after)) {
    changed.push(route.file);
    if (!checkOnly) fs.writeFileSync(file, after, 'utf8');
  }
}

if (checkOnly && changed.length) {
  console.error(`${changed.length} product family pages are not synchronized.`);
  for (const file of changed) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`${changed.length} product family pages ${checkOnly ? 'need updates' : 'updated'}.`);
}
