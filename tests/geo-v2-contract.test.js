const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { routes, schemaOnlyRoutes } = require('../scripts/product-family-owner-manifest');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function sourceFileForUrl(rawUrl) {
  const cleanUrl = rawUrl.split('#')[0];
  const { pathname } = new URL(cleanUrl);
  if (pathname === '/') return 'index.html';
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

test('v2.0 SSOT CSVs publish unified capacity, bench-testing, address, and engine specs without stale figures', () => {
  const companyRows = parseCsv(read('docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv'));
  const byId = new Map(companyRows.map(r => [r.fact_id, r]));
  assert.match(byId.get('capacity-monthly-engines').candidate_master_value, /10,000\+/);
  assert.match(byId.get('quality-first-pass-yield').candidate_master_value, /100% pre-shipment hot and cold bench testing/);
  assert.match(byId.get('capability-mixed-model-orders').candidate_master_value, /50 units|50-unit/i);
  assert.match(byId.get('capability-mixed-model-orders').candidate_master_value, /10 working days/);
  assert.match(byId.get('capability-mixed-model-orders').candidate_master_value, /FOB Guangzhou/);
  assert.match(byId.get('capability-mixed-model-orders').candidate_master_value, /60-day warranty/);
  assert.match(byId.get('contact-sales-email').candidate_master_value, /chixiangmotor@163\.com/);
  assert.equal(
    byId.get('address-registered').candidate_master_value,
    'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China'
  );
  for (const row of companyRows) {
    for (const col of ['current_website_value', 'candidate_master_value', 'approved_public_wording_en', 'approved_public_wording_zh']) {
      assert.doesNotMatch(row[col], /99% first-pass|8,000\+/i, `${row.fact_id}:${col}`);
    }
  }

  const engineRows = parseCsv(read('docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv'));
  const bySpecId = new Map(engineRows.map(r => [r.spec_id, r]));
  assert.match(bySpecId.get('model-cg200').candidate_master_values, /10 kW @ 7,500 rpm/);
  assert.match(bySpecId.get('model-cg200').candidate_master_values, /13\.5 N·m @ 6,500 rpm/);
  assert.match(bySpecId.get('model-152fmh').candidate_master_values, /CX152FMH-5B/);
  assert.match(bySpecId.get('model-152fmh').candidate_master_values, /CX152FMH-6/);
  assert.equal(bySpecId.get('model-152fmh').actual_displacement_cc, '106.7');
  assert.match(bySpecId.get('model-152fmh').candidate_master_values, /123\.67/);
  for (const row of engineRows) {
    assert.doesNotMatch(row.candidate_master_values, /10\.8\s*kW|14\.2\s*N|not public official models|remain blocked/i, row.spec_id);
  }
});

test('llms.txt and llms-full.txt stay synchronized with SSOT facts and live site URLs', () => {
  for (const file of ['llms.txt', 'llms-full.txt']) {
    const content = read(file);
    assert.match(content, /CHIXIANG MOTOR/);
    assert.match(content, /Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\./);
    assert.match(content, /10,000\+/);
    assert.match(content, /100% pre-shipment hot and cold bench testing/);
    assert.match(content, /50-unit|50 units/i);
    assert.match(content, /10 working days/i);
    assert.match(content, /FOB Guangzhou/i);
    assert.match(content, /60-day warranty|60 Days After Destination Port Arrival/i);
    assert.match(content, /chixiangmotor@163\.com/);
    assert.match(content, /10 kW @ 7,500 rpm/);
    assert.match(content, /13\.5 N·m @ 6,500 rpm/);
    assert.match(content, /CX152FMH-5B/);
    assert.match(content, /CX152FMH-6/);
    assert.doesNotMatch(content, /99%|8,000\+|10\.8\s*kW|14\.2\s*N/i);

    const urls = [...new Set(content.match(/https:\/\/chixiangmotor\.com\/[^\s)\]]*/g) || [])];
    assert.ok(urls.length >= 5, `${file}: expected live site URLs`);
    for (const url of urls) {
      const target = sourceFileForUrl(url);
      assert.ok(fs.existsSync(path.join(root, target)), `${file}: broken URL ${url} -> ${target}`);
    }
  }
});

test('all 6-locale engine family pages publish Product + PropertyValue engineering specs without banned Offer/Review markup', () => {
  const enginePages = [
    ...routes.filter(r => r.family !== 'parts'),
    ...schemaOnlyRoutes
  ];

  for (const route of enginePages) {
    const html = read(route.file);
    const match = html.match(/<script\b(?=[^>]*\bdata-product-family-schema\b)[^>]*>([\s\S]*?)<\/script>/i);
    assert.ok(match, `${route.file}: missing data-product-family-schema`);
    const schema = JSON.parse(match[1]);
    assert.equal(schema['@type'], 'ItemList', route.file);
    assert.ok(Array.isArray(schema.itemListElement) && schema.itemListElement.length >= 1, route.file);

    for (const listItem of schema.itemListElement) {
      assert.equal(listItem['@type'], 'ListItem', route.file);
      const product = listItem.item;
      assert.equal(product['@type'], 'Product', route.file);
      assert.equal(product.brand?.name, 'CHIXIANG MOTOR', `${route.file}:${product.name}`);
      assert.equal(product.manufacturer?.['@id'], 'https://chixiangmotor.com/#organization', `${route.file}:${product.name}`);
      assert.ok(Array.isArray(product.additionalProperty) && product.additionalProperty.length >= 3, `${route.file}:${product.name}: missing PropertyValue specs`);
      for (const prop of product.additionalProperty) {
        assert.equal(prop['@type'], 'PropertyValue', route.file);
        assert.ok(prop.name && prop.value, `${route.file}:${product.name}: incomplete PropertyValue`);
      }
    }

    assert.doesNotMatch(
      match[1],
      /"@type"\s*:\s*"(?:Offer|ProductGroup|Review|AggregateRating)"|InStock/i,
      `${route.file}: banned ecommerce/review schema found`
    );
  }
});

test('all six active language homepages synchronize Hero CSS cache version and full 6-locale WebSite inLanguage list', () => {
  for (const file of ['en/index.html', 'fr/index.html', 'es/index.html', 'pt/index.html', 'ru/index.html', 'ar/index.html', 'en/ac320-atv-engine.html']) {
    const html = read(file);
    assert.match(html, /href=["'](?:\.\.|)\/css\/style\.css\?v=20261119-hero["']/, `${file}: outdated style.css cache version`);
  }

  for (const file of ['en/index.html', 'fr/index.html', 'es/index.html', 'pt/index.html', 'ru/index.html', 'ar/index.html']) {
    const html = read(file);
    const graphMatch = html.match(/<script\b[^>]*data-site-entity-graph[^>]*>([\s\S]*?)<\/script>/i);
    assert.ok(graphMatch, `${file}: missing data-site-entity-graph`);
    const graph = JSON.parse(graphMatch[1])['@graph'] || [];
    const website = graph.find(n => n['@id'] === 'https://chixiangmotor.com/#website');
    assert.ok(website, `${file}: missing WebSite node`);
    assert.deepEqual([...website.inLanguage].sort(), ['ar', 'en', 'es', 'fr', 'pt', 'ru'], `${file}: WebSite.inLanguage mismatch`);
  }
});
