const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const expected = {
  en: ['en/cg-engine.html', 'en/cb-engine.html', 'en/horizontal-engine.html', 'en/engine-parts.html'],
  es: ['es/motor-cg.html', 'es/motor-cb.html', 'es/motor-horizontal.html', 'es/repuestos-motor.html'],
  pt: ['pt/motor-cg.html', 'pt/motor-cb.html', 'pt/motor-horizontal.html', 'pt/pecas-de-motor.html'],
  ru: ['ru/dvigatel-cg.html', 'ru/dvigatel-cb.html', 'ru/gorizontalnyj-dvigatel.html', 'ru/zapchasti-dvigatelya.html'],
  ar: ['ar/cg-engine.html', 'ar/cb-engine.html', 'ar/horizontal-engine.html', 'ar/engine-parts.html']
};

const files = Object.values(expected).flat();
const horizontalFiles = [
  'en/horizontal-engine.html',
  'es/motor-horizontal.html',
  'pt/motor-horizontal.html',
  'ru/gorizontalnyj-dvigatel.html',
  'ar/horizontal-engine.html'
];
const partsFiles = [
  'en/engine-parts.html',
  'es/repuestos-motor.html',
  'pt/pecas-de-motor.html',
  'ru/zapchasti-dvigatelya.html',
  'ar/engine-parts.html'
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

function canonicalToFile(url) {
  const pathname = new URL(url).pathname;
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function ownerBlock(html) {
  const match = html.match(/<!-- PRODUCT FAMILY OWNER START -->([\s\S]*?)<!-- PRODUCT FAMILY OWNER END -->/);
  return match ? match[1] : '';
}

function siteEntityGraph(html, file) {
  const match = html.match(/<script\b(?=[^>]*\bdata-site-entity-graph\b)[^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match, `${file}: missing safe site entity graph`);
  return JSON.parse(match[1]);
}

test('the canonical product-family contract covers exactly four families in five languages', () => {
  const sitemapFiles = new Set([...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => canonicalToFile(match[1])));
  assert.equal(files.length, 20);
  assert.equal(new Set(files).size, 20);

  for (const [language, languageFiles] of Object.entries(expected)) {
    assert.equal(languageFiles.length, 4, language);
    for (const file of languageFiles) {
      assert.ok(fs.existsSync(path.join(root, file)), file);
      assert.ok(sitemapFiles.has(file), `${file}: missing from sitemap`);
      const html = read(file);
      assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${file}: exactly one H1`);
      assert.match(html, /data-product-family-owner=/, `${file}: missing owner marker`);
      assert.match(html, /data-site-entity-graph/, `${file}: missing safe site entity graph`);
      if (language === 'ar') assert.match(html, /<html\b[^>]*\bdir=["']rtl["']/i, file);
    }
  }
});

test('managed family content removes unapproved legacy commercial specifications', () => {
  const forbiddenLegacyRows = [
    'Peak Power', 'Maximum Horsepower', 'Max Power', 'Max Torque',
    'Net Weight', 'Gross Weight', 'Overall Dimensions', 'Package Dimensions',
    'Fuel Consumption', 'Min. Fuel Consumption'
  ];

  for (const file of files.filter(file => file !== 'ru/gorizontalnyj-dvigatel.html')) {
    const block = ownerBlock(read(file));
    assert.ok(block, `${file}: managed owner block missing`);
    for (const claim of forbiddenLegacyRows) {
      assert.doesNotMatch(block, new RegExp(claim, 'i'), `${file}: ${claim}`);
    }
  }
});

test('every model published by the generated contracts is approved public', () => {
  const facts = parseCsv(read('docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv'));
  const requiredIds = [
    'model-cg125', 'model-cg150', 'model-cg175', 'model-cg200', 'model-cg250',
    'model-cg150sb', 'model-cg175sb', 'model-cg200sb', 'model-cg250sb',
    'model-cb150', 'model-cb200-c', 'model-cb250',
    'model-152fmh', 'model-153fmi', 'model-154fmi', 'model-1p56fmj', 'model-1p60fmj',
    'intake-cg-balance-shaft', 'intake-tsunami-water',
    'intake-hanwei-hw-water', 'intake-automatic-clutch-water'
  ];

  for (const specId of requiredIds) {
    const record = facts.find(item => item.spec_id === specId);
    assert.ok(record, specId);
    assert.equal(record.approval_status, 'APPROVED_PUBLIC', specId);
    assert.equal(record.visibility, 'PUBLIC', specId);
  }
});

test('CG and CB owner pages publish the governed model sets', () => {
  const cgModels = ['CG125', 'CG150', 'CG175', 'CG200', 'CG250', 'CG150SB', 'CG175SB', 'CG200SB', 'CG250SB'];
  const cbModels = ['CB150', 'CB200-C', 'CB250'];

  for (const file of files.filter(file => /(?:cg-engine|motor-cg|dvigatel-cg)/.test(file))) {
    const html = read(file);
    for (const model of cgModels) assert.match(html, new RegExp(`\\b${model}\\b`), `${file}: ${model}`);
  }
  for (const file of files.filter(file => /(?:cb-engine|motor-cb|dvigatel-cb)/.test(file))) {
    const html = read(file);
    for (const model of cbModels) assert.match(html, new RegExp(`\\b${model}\\b`), `${file}: ${model}`);
  }
});

test('horizontal owners use CX identity and keep YX as a market reference', () => {
  const models = ['CX152FMH', 'CX153FMI', 'CX154FMI', 'CX1P56FMJ', 'CX1P60FMJ'];
  for (const file of horizontalFiles) {
    const html = read(file);
    for (const model of models) assert.match(html, new RegExp(model), `${file}: ${model}`);
    assert.match(html, /YX(?:152FMH|153FMI|154FMI|1P56FMJ|1P60FMJ)/, `${file}: YX reference`);
    assert.match(html, /CHIXIANG MOTOR/i, `${file}: manufacturer identity`);
  }
});

test('parts owners publish selection inputs without universal-fit promises', () => {
  const compatibilityPromises = /universal(?:ly)? compatible|fits all|compatible con todos|compatível com todos|совместим(?:о|ы) со всеми|متوافق مع جميع/i;
  for (const file of partsFiles) {
    const html = read(file);
    assert.match(html, /data-product-family-owner=["']parts["']/, file);
    assert.match(html, /(?:engine code|código del motor|código do motor|код двигателя|رمز المحرك)/i, `${file}: engine code input`);
    assert.match(html, /(?:quantity|cantidad|quantidade|количество|الكمية)/i, `${file}: quantity input`);
    assert.doesNotMatch(ownerBlock(html), compatibilityPromises, file);
  }
  assert.doesNotMatch(
    read('en/engine-parts.html'),
    /\bgenuine\b/i,
    'parts page must not make an unapproved authenticity promise'
  );
});

test('safe entity graphs never invent product commerce or review data', () => {
  const forbidden = new Set(['Product', 'ProductGroup', 'Offer', 'Review', 'AggregateRating']);
  for (const file of files) {
    const graph = siteEntityGraph(read(file), file);
    const nodes = Array.isArray(graph['@graph']) ? graph['@graph'] : [graph];
    const types = nodes.flatMap(node => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
    for (const type of types) assert.ok(!forbidden.has(type), `${file}: forbidden ${type}`);
  }
});

test('the Russian horizontal owner retains its working inquiry and tracking contract', () => {
  const html = read('ru/gorizontalnyj-dvigatel.html');
  for (const contract of [
    'class="rh-inquiry-form"',
    'action="/api/contact"',
    'name="source_form" value="russia_horizontal_engine_landing"',
    'data-whatsapp-fallback="false"',
    'AW-16777656395'
  ]) {
    assert.match(html, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), contract);
  }
});
