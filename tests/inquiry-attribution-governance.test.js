const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const invariantPath = path.join(root, 'tests', 'site-optimization-invariants.test.js');
const exceptionPath = path.join(root, 'docs', 'geo-entity', 'INQUIRY_ATTRIBUTION_FROZEN_CONTRACT_EXCEPTION.md');
const invariantSource = fs.readFileSync(invariantPath, 'utf8');
const mainSource = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
const contactSource = fs.readFileSync(path.join(root, 'workers', 'contact-api', 'src', 'contact-handler.mjs'), 'utf8');

const approvedFrozenExceptions = [
  'ads/algerie/index.html',
  'js/main.js',
  'workers/contact-api/src/contact-handler.mjs',
  'workers/contact-api/src/index.mjs',
  'workers/contact-api/wrangler.jsonc'
];

function quotedValues(block) {
  return [...block.matchAll(/'([^']+)'/g)].map(match => match[1]);
}

test('keeps the fixed Foundation baseline and complete frozen-file registry', () => {
  assert.match(invariantSource, /const frozenBaseline = '5ce9254ab1ecd84dc9268efb55b9acaad7feb13d';/);
  for (const file of approvedFrozenExceptions) {
    assert.match(invariantSource, new RegExp(`'${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
  }
});

test('limits the authorized attribution exception to five reviewed frozen files', () => {
  const match = invariantSource.match(/const authorizedFrozenChanges = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(match, 'authorizedFrozenChanges registry is missing');
  assert.deepEqual(quotedValues(match[1]).sort(), approvedFrozenExceptions);
});

test('records the approval, required safeguards and rollback outside the guard code', () => {
  assert.equal(fs.existsSync(exceptionPath), true, 'frozen-contract exception record is missing');
  const record = fs.readFileSync(exceptionPath, 'utf8');
  assert.match(record, /Owner approval/i);
  assert.match(record, /separate PR/i);
  assert.match(record, /Preview/i);
  assert.match(record, /rollback/i);
  for (const file of approvedFrozenExceptions) assert.match(record, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('retains the two Google Ads destinations and contact delivery order', () => {
  assert.match(mainSource, /AW-16777656395\/Om_nCMCV4swcEMvwmsA-/);
  assert.match(mainSource, /AW-16777656395\/bovKCKOx088cEMvwmsA-/);
  const emailIndex = contactSource.indexOf('await sendInquiryEmail');
  const successIndex = contactSource.lastIndexOf('return jsonResponse({ ok: true }');
  assert.ok(emailIndex >= 0 && successIndex > emailIndex, 'email must finish before the success response');
  assert.match(contactSource, /verifyTurnstile/);
});
