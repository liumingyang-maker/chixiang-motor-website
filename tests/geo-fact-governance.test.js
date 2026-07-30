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

test('horizontal models use approved CX codes and YX market-reference aliases', () => {
  const expected = {
    'model-152fmh': ['CX152FMH', /YX152FMH/, /YX110-class/, '110'],
    'model-153fmi': ['CX153FMI', /YX153FMI/, /YX125-class/, '125'],
    'model-154fmi': ['CX154FMI', /YX154FMI/, /YX125-class/, '125'],
    'model-1p56fmj': ['CX1P56FMJ', /YX1P56FMJ/, /YX140-class/, '140'],
    'model-1p60fmj': ['CX1P60FMJ', /YX1P60FMJ/, /YX150-class.*W150-2/, '150']
  };

  for (const [id, [modelCode, aliasCode, aliasClass, nominal]] of Object.entries(expected)) {
    const record = records.find(item => item.spec_id === id);
    assert.ok(record, id);
    assert.equal(record.model_code, modelCode, id);
    assert.match(record.aliases, aliasCode, id);
    assert.match(record.aliases, aliasClass, id);
    assert.equal(record.nominal_displacement_cc, nominal, id);
    assert.equal(record.approval_status, 'APPROVED_PUBLIC', id);
    assert.equal(record.visibility, 'PUBLIC', id);
    assert.match(record.evidence_sources, /owner-confirmation:2026-07-30/, id);
    for (const field of ['actual_displacement_cc', 'bore_mm', 'stroke_mm']) {
      assert.equal(record[field], '', `${id}:${field}`);
    }
  }
});

test('horizontal model configurations separate start method from electric-starter position', () => {
  const ids = ['model-152fmh', 'model-153fmi', 'model-154fmi', 'model-1p56fmj', 'model-1p60fmj'];
  for (const id of ids) {
    const record = records.find(item => item.spec_id === id);
    assert.match(record.start_method, /Kick and electric start/);
    assert.match(record.configuration, /Electric starter position: upper or lower/);
    assert.match(record.gear_pattern, /4 gears/);
    assert.match(record.reverse_configuration, /Built-in reverse.*1\+1 gearbox/);
  }

  assert.match(records.find(item => item.spec_id === 'model-152fmh').clutch, /Manual or semi-automatic/);
  assert.match(records.find(item => item.spec_id === 'model-153fmi').clutch, /Manual or semi-automatic/);
  assert.equal(records.find(item => item.spec_id === 'model-154fmi').clutch, 'Manual clutch');
  assert.match(records.find(item => item.spec_id === 'model-1p56fmj').clutch, /Manual or semi-automatic/);
  assert.match(records.find(item => item.spec_id === 'model-1p60fmj').clutch, /Manual or semi-automatic/);
  assert.notEqual(records.find(item => item.spec_id === 'model-152fmh').clutch, 'Automatic clutch');
});

test('CX1P60FMJ publishes only the approved internal oil-circuit cooling fact', () => {
  const model = records.find(item => item.spec_id === 'model-1p60fmj');
  assert.match(model.cooling, /internal cylinder-head oil circuit/i);
  assert.match(model.cooling, /no external oil radiator/i);
  assert.doesNotMatch(model.cooling, /external oil cooler/i);
});
