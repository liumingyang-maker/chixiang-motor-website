const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('project instructions establish v2.0 layered GEO growth contract and hard invariants', () => {
  const instructions = read('AGENTS.md');
  assert.match(instructions, /FOUNDATION_CONTRACT:\s*v2\.0/);
  assert.match(instructions, /canonical|Sitemap|robots/i);
  assert.match(instructions, /\/api\/contact|Turnstile|Worker/i);
  assert.match(instructions, /Google Ads|Yandex/i);
  assert.match(instructions, /#organization|#website|Schema/i);
  assert.match(instructions, /COMPANY_FACT_PACK\.csv/);
  assert.match(instructions, /ENGINE_SPEC_MASTER\.csv/);
  assert.match(instructions, /10,000\+/);
  assert.match(instructions, /100% pre-shipment hot and cold bench testing/);
  assert.match(instructions, /llms\.txt/);
  assert.match(instructions, /main/);
});

test('historical closure report keeps baseline archive and points to v2.0 contract', () => {
  const closure = read('docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md');
  assert.match(closure, /FOUNDATION_STATUS:\s*FROZEN/);
  assert.match(closure, /FOUNDATION_CONTRACT:\s*v2\.0/);
  assert.match(closure, /08c446ead90db58e00a71095d5ba1f71756d1c7f/);
  assert.match(closure, /COMPANY_FACT_PACK\.csv/);
  assert.match(closure, /ENGINE_SPEC_MASTER\.csv/);
  assert.match(closure, /PAGE_CHANGE_MATRIX\.csv/);
  assert.match(closure, /visual redesign|页面外观/i);
});

test('closure report preserves unresolved and deliberately absent claims', () => {
  const closure = read('docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md');
  assert.match(closure, /152FMH/);
  assert.match(closure, /actual displacement|实际排量/i);
  assert.match(closure, /bore|缸径/i);
  assert.match(closure, /stroke|行程/i);
  assert.match(closure, /Offer/);
  assert.match(closure, /Review/);
  assert.match(closure, /AggregateRating/);
  assert.match(closure, /Lighthouse/);
  assert.match(closure, /GSC/);
  assert.match(closure, /Yandex/);
});

test('the original GEO audit is explicitly retained as a historical snapshot', () => {
  const audit = read('docs/geo-entity/GEO_ENTITY_AUDIT.md');
  assert.match(audit.slice(0, 1200), /historical snapshot|历史快照/i);
  assert.match(audit.slice(0, 1200), /FOUNDATION_CLOSURE_AND_FREEZE\.md/);
});
