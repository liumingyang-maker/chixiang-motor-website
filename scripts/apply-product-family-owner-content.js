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

function table(labels, columns, rows) {
  return `<div class="responsive-table-wrap" tabindex="0">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th>${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`;
}

function model(recordById, specId) {
  return approvedPublic(recordById, specId);
}

function renderCg(recordById, locale) {
  const l = locale.labels;
  const v = locale.values;
  const air = modelIds.cg.slice(0, 5).map(id => model(recordById, id));
  const water = modelIds.cg.slice(5).map(id => model(recordById, id));
  const columns = [l.model, l.nominal, l.actual, l.boreStroke, l.cooling, l.start, l.clutch, l.gears];
  const rows = records => records.map(record => [
    record.model_code,
    unit(record.nominal_displacement_cc, 'cc'),
    unit(record.actual_displacement_cc, 'cc'),
    record.bore_mm && record.stroke_mm ? `${record.bore_mm} × ${record.stroke_mm} mm` : '—',
    record.cooling === 'Water-cooled' ? v.water : v.air,
    v.electricKick,
    v.manualWet,
    record.gear_pattern ? v.five : '—'
  ]);
  const cards = locale.familyCards.map(([heading, body]) => `<div class="feature-item" style="text-align:left;"><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(body)}</p></div>`).join('');
  return `<div class="catalog-table-block">
        <h3>CG Air-Cooled</h3>
        ${table(l, columns, rows(air))}
      </div>
      <div class="catalog-table-block">
        <h3>CG Water-Cooled</h3>
        ${table(l, columns, rows(water))}
      </div>
      <h3 class="section-title" style="margin-top:2.5rem;">${escapeHtml(l.familyOptions)}</h3>
      <div class="features-grid" style="margin-top:1.5rem;">${cards}</div>`;
}

function renderCb(recordById, locale) {
  const l = locale.labels;
  const v = locale.values;
  const records = modelIds.cb.map(id => model(recordById, id));
  const rows = records.map(record => [
    record.model_code,
    unit(record.nominal_displacement_cc, 'cc'),
    unit(record.actual_displacement_cc, 'cc'),
    v.air,
    v.kickElectric,
    v.manualWet,
    v.five
  ]);
  return `<div class="catalog-table-block">
        ${table(l, [l.model, l.nominal, l.actual, l.cooling, l.start, l.clutch, l.gears], rows)}
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
  return `<div class="catalog-table-block" id="cx-models">
        ${table(l, [l.model, l.nominal, l.marketReference, l.cooling, l.start, l.starterPosition, l.clutch, l.gears, l.options], rows)}
      </div>
      <div class="feature-item" style="text-align:left;margin-top:1.5rem;"><h3>${escapeHtml(l.marketReference)}</h3><p>${escapeHtml(locale.marketNote)}</p></div>`;
}

function renderParts(locale) {
  const l = locale.labels;
  return `<div class="catalog-table-block">
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
  if (route.family === 'cg') familyContent = renderCg(recordById, locale);
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
  ${renderFaq(locale, route.family)}
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

function updateProtectedOwner(html, route) {
  const mainPattern = /<main\b([^>]*\bid=["']main-content["'][^>]*)>/i;
  if (!mainPattern.test(html)) throw new Error(`${route.file}: main-content not found`);
  return html.replace(mainPattern, (full, attributes) => {
    if (/data-product-family-owner=/i.test(full)) return full;
    return `<main${attributes} data-product-family-owner="${route.family}" data-owner-language="${route.language}">`;
  });
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
    after = updateProtectedOwner(before, route);
  } else {
    const marker = /<!-- Product Detail SEO Content -->[\s\S]*?<!-- \/Product Detail SEO Content -->/;
    if (!marker.test(before)) throw new Error(`${route.file}: product detail content markers not found`);
    after = before.replace(marker, renderOwnerBlock(recordById, route));
    after = replaceFaqSchema(after, route);
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
