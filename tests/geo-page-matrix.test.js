const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
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

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const allowedClasses = new Set(['FACT_FIX', 'OWNER_ENHANCEMENT', 'TRANSLATION_SYNC', 'VERIFY_ONLY']);

test('page matrix covers every canonical sitemap URL exactly once', () => {
  const rows = parseCsv(read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv'));
  assert.equal(rows.length, 51);
  assert.equal(new Set(rows.map(row => row.url)).size, 51);
  assert.deepEqual([...rows.map(row => row.url)].sort(), [...sitemapUrls].sort());
  for (const row of rows) {
    assert.ok(allowedClasses.has(row.change_class), `${row.url}:${row.change_class}`);
    assert.ok(row.source_file, row.url);
    assert.ok(row.decision, row.url);
    if (row.change_class !== 'VERIFY_ONLY') assert.ok(row.source_fact_ids, row.url);
  }
});
