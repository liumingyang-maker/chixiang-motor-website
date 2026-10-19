const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('About keeps one quality-credentials section with three cards', () => {
  const html = read('en/about.html');
  assert.equal(html.split('id="quality-credentials"').length - 1, 1);
  assert.match(html, /data-credential-cards/);
  assert.equal(html.split('data-credential-cards').length - 1, 1);
  assert.match(html, /ISO 9001 — Quality Management/);
  assert.match(html, /High-Tech Enterprise/);
  assert.match(html, /CCC — Applicable Engine Models/);
  assert.ok(!html.includes('cert-grid-compact'), 'old four-item overview removed');
  assert.ok(!html.includes('certification-2.webp'), 'unverified collage removed');
  assert.match(html, /Request Certification or Inspection Documents/);
  assert.match(html, /href="\/en\/contact"/);
});

test('X4 copy states real credentials with holder/model limits', () => {
  const html = read('en/about.html');
  assert.match(html, /ISO 9001 quality-management certification documentation is available/);
  assert.match(html, /named legal entity/);
  assert.match(html, /exact engine model and destination market/);
  assert.ok(!/100% tested/i.test(html));
  assert.ok(!/all engines CCC/i.test(html));
  assert.ok(!/certificate verified/i.test(html));
  assert.ok(!/ISO 9001 quality management system certified\.?\s*</i.test(html));
});

test('quality workflow remains four-stage with sampling qualifier', () => {
  const html = read('en/about.html');
  assert.match(html, /Incoming/);
  assert.match(html, /Export Packing/);
  assert.match(html, /sampling arrangements/);
});

test('quality notes span full grid width', () => {
  const html = read('en/about.html');
  assert.match(html, /grid-column:1\s*\/\s*-1;[^>]*>Specific test items/);
});
