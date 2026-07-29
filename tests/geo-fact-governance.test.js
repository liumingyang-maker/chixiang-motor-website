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

const records = parseCsv(read('docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv'));
const promotedIds = [
  'intake-cg-balance-shaft',
  'intake-tsunami-water',
  'intake-hanwei-hw-water',
  'intake-automatic-clutch-water'
];

test('approved family claims use FAMILY scope and never invent model-level numeric specifications', () => {
  for (const id of promotedIds) {
    const record = records.find(item => item.spec_id === id);
    assert.ok(record, id);
    assert.equal(record.record_scope, 'FAMILY', id);
    assert.equal(record.approval_status, 'APPROVED_PUBLIC', id);
    assert.equal(record.visibility, 'PUBLIC', id);
    assert.equal(record.approved_by, 'Site Owner', id);
    assert.match(record.evidence_sources, /owner-confirmation:2026-07-30/, id);
    for (const field of ['actual_displacement_cc', 'bore_mm', 'stroke_mm']) {
      assert.equal(record[field], '', `${id}:${field}`);
    }
  }
});

test('HW family keeps the owner terminology and approved all-model configuration', () => {
  const hw = records.find(item => item.spec_id === 'intake-hanwei-hw-water');
  assert.match(hw.candidate_master_values, /1\.5 L/);
  assert.match(hw.candidate_master_values, /18级/);
  assert.match(hw.candidate_master_values, /20-roller/);
  assert.match(hw.reverse_configuration, /No built-in reverse/);
  assert.doesNotMatch(hw.candidate_master_values, /18-pole|18极/i);
});
