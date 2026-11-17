const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { routes, locales } = require('./product-family-owner-manifest');

const root = path.join(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const factFile = path.join(root, 'docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv');

const modelIds = {
  cg: [
    'model-cg125', 'model-cg150', 'model-cg175', 'model-cg200', 'model-cg250',
    'model-cg150sb', 'model-cg175sb', 'model-cg200sb', 'model-cg250sb'
  ],
  cb: ['model-cb150', 'model-cb200-c', 'model-cb250'],
  horizontal: ['model-152fmh', 'model-153fmi', 'model-154fmi', 'model-1p56fmj', 'model-1p60fmj']
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
  const body = rows.map((row, rowIndex) => {
    const idAttr = rowIds && rowIds[rowIndex] ? ` id="${escapeHtml(rowIds[rowIndex])}"` : '';
    const cells = row.map((cell, index) => index === 0
      ? (rowHeaderScope ? `<th scope="row">${escapeHtml(cell)}</th>` : `<th>${escapeHtml(cell)}</th>`)
      : `<td>${escapeHtml(cell)}</td>`
    ).join('');
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
  if (language !== 'en') return '';
  return `
        <div class="feature-item" style="text-align:left;margin-top:1.25rem;" data-cg-water-procurement>
          <h3>CG water-cooled engines: before you request a quotation</h3>
          <p>These models may be considered for motorcycle and cargo-tricycle engine projects, subject to the vehicle platform and operating requirements. <strong>Reverse gear is not a universal standard feature of the CG water-cooled family; availability and configuration must be confirmed for the exact model and order.</strong></p>
          <p>Please provide the target engine model or nominal displacement, quantity, destination market, vehicle application, required starting/clutch/transmission arrangement, and mounting or output-interface requirements. Matching service parts can be discussed after the engine specification is confirmed.</p>
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
  'model-cb250': { maxPower: '12 kW @ 7,000 rpm', maxTorque: '17.5 N·m @ 5,500 rpm', weight: '31 kg', dimensions: '385 × 355 × 452 mm' }
};

function renderCg(recordById, locale, language) {
  const l = locale.labels;
  const v = locale.values;
  const withEnglishRowAnchors = language === 'en';
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
  const airRowIds = withEnglishRowAnchors ? airSpecIds.map(id => cgModelRowAnchors[id]) : null;
  const waterRowIds = withEnglishRowAnchors ? waterSpecIds.map(id => cgModelRowAnchors[id]) : null;
  const airQuickLinks = withEnglishRowAnchors
    ? modelQuickLinks(air.map((record, index) => [airRowIds[index], record.model_code]), 'Choose CG air-cooled engine model')
    : '';
  const waterQuickLinks = withEnglishRowAnchors
    ? modelQuickLinks(water.map((record, index) => [waterRowIds[index], record.model_code]), 'Choose CG water-cooled engine model')
    : '';
  const airTableOptions = withEnglishRowAnchors ? { rowIds: airRowIds, rowHeaderScope: true } : undefined;
  const waterTableOptions = withEnglishRowAnchors ? { rowIds: waterRowIds, rowHeaderScope: true } : undefined;
  const familyCardAnchors = ['cg-balance-shaft', 'tsunami', 'hw-water', 'auto-clutch'];
  const cards = locale.familyCards.map(([heading, body], index) => `<div class="feature-item" style="text-align:left;" id="${familyCardAnchors[index] || `family-option-${index}`}"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(body)}</p></div>`).join('');
  const hwWaterModels = [
    ['HW200', '200 cc', '197 ml', '63.5 × 62.2 mm', '10.5 kW @ 7,500 rpm', '15 N·m @ 6,000 rpm', '9.2 : 1', '38 kg', '425 × 385 × 530 mm', 'PZ30'],
    ['HW250', '250 cc', '249 ml', '70 × 64 mm', '11.5 kW @ 7,000 rpm', '19.5 N·m @ 5,000 rpm', '10.1–10.5 : 1', '38.1 kg', '425 × 385 × 530 mm', 'PZ30'],
    ['HW300', '300 cc', '300 ml', '74 × 64 mm', '12.5 kW @ 6,500 rpm', '21 N·m @ 4,500 rpm', '10.4 : 1', '39 kg', '425 × 385 × 530 mm', 'PZ30'],
    ['HW350', '350 cc', '300.3 ml', '76 × 66.2 mm', '13 kW @ 6,500 rpm', '22.5 N·m @ 4,500 rpm', '10.4 : 1', '40.4 kg', '425 × 385 × 530 mm', 'PZ30']
  ];
  const hwColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.netWeight, l.dimensions, l.carburetor, l.cooling, l.start, l.clutch];
  const hwRows = hwWaterModels.map(item => [...item, v.water, v.electricKick, v.manualWet]);
  const hwRowIds = withEnglishRowAnchors ? ['hw-200', 'hw-250', 'hw-300', 'hw-350'] : undefined;
  const hwTable = table(l, hwColumns, hwRows, { rowIds: hwRowIds, rowHeaderScope: true });
  return `<div class="catalog-table-block" id="cg-air-cooled">
        <h3>CG Air-Cooled</h3>
        ${airQuickLinks}${table(l, airColumns, rows(air), airTableOptions)}
      </div>
      <div class="catalog-table-block" id="cg-water-cooled">
        <h3>CG Water-Cooled</h3>
        ${waterQuickLinks}${table(l, waterColumns, rows(water), waterTableOptions)}${cgWaterProcurementNote(language)}
      </div>
      <h3 class="section-title" style="margin-top:2.5rem;">${escapeHtml(l.familyOptions)}</h3>
      <div class="features-grid" style="margin-top:1.5rem;">${cards}</div>
      <div class="catalog-table-block" id="hw-water-specifications" style="margin-top:2rem;">
        <h3>${escapeHtml(l.hwHeading)}</h3>
        ${hwTable}
        <p style="margin-top:0.85rem;color:var(--text-secondary);line-height:1.7;">${escapeHtml(l.hwNote)}</p>
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
  const catalogModels = [
    ['CX152FMH-5B', '110 cc', '106.7 ml', '52.4 × 49.5 mm', '4.7 kW @ 8,000 rpm', '6.7 N·m @ 6,000 rpm', '9.7 : 1', '19 kg', '477 × 395 × 280 mm'],
    ['CX152FMH-6', '125 cc', '107 ml', '52.4 × 49.5 mm', '4.9 kW @ 8,000 rpm', '6.9 N·m @ 6,000 rpm', '9.7 : 1', '19 kg', '477 × 395 × 280 mm'],
    ['CX152FMH-5B (130)', '130 cc', '123.67 ml', '54 × 54 mm', '6.3 kW @ 7,500 rpm', '8.8 N·m @ 5,500 rpm', '9.0 : 1', '23 kg', '450 × 280 × 277 mm']
  ];
  const catalogColumns = [l.model, l.nominal, l.actual, l.boreStroke, l.maxPower, l.maxTorque, l.compression, l.netWeight, l.dimensions, l.cooling, l.start, l.clutch, l.gears];
  const catalogRows = catalogModels.map(item => [...item, v.air, v.electricKick, v.autoWet, v.fourConstant]);
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
      </div>`;
}

function renderFaq(locale, family) {
  const items = family === 'parts' ? locale.faq.parts : locale.faq.engine;
  return `<section class="section" style="background:var(--bg-secondary);" data-product-family-owner-faq="${family}">
    <div class="container">
      <h2 class="section-title">${escapeHtml(locale.labels.faq)}</h2>
      <div class="features-grid" style="margin-top:2rem;">
        ${items.map(([question, answer]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></div>`).join('')}
      </div>
    </div>
  </section>`;
}

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
      </div>
    </div>
  </section>
  ${renderFaq(locale, route.family)}${route.family === 'cg' && route.language === 'en' ? '\n  <script src="../js/cg-model-quick-links.js" defer></script>' : ''}
  <!-- PRODUCT FAMILY OWNER END -->
  <!-- /Product Detail SEO Content -->`;
}

function replaceFaqSchema(html, route) {
  const locale = locales[route.language];
  const faq = route.family === 'parts' ? locale.faq.parts : locale.faq.engine;
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
for (const route of routes) {
  const file = path.join(root, route.file);
  const before = fs.readFileSync(file, 'utf8');
  let after;
  if (route.protected) {
    after = before;
  } else {
    const marker = /<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/;
    if (!marker.test(before)) throw new Error(`${route.file}: product detail content markers not found`);
    after = before.replace(marker, renderOwnerBlock(recordById, route));
    after = replaceFaqSchema(after, route);
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
