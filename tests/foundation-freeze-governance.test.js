const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('project instructions freeze the Foundation and protect its contracts', () => {
  const instructions = read('AGENTS.md');
  assert.match(instructions, /FOUNDATION_STATUS:\s*FROZEN/);
  assert.match(instructions, /canonical|Sitemap|robots/i);
  assert.match(instructions, /\/api\/contact|Turnstile|Worker/i);
  assert.match(instructions, /Google Ads|Yandex/i);
  assert.match(instructions, /stable Schema IDs|稳定的 Schema ID/i);
  assert.match(instructions, /explicit user approval|用户明确批准/i);
  assert.match(instructions, /separate PR|独立 PR/i);
});

test('closure report defines the current source of truth and visual handoff', () => {
  const closure = read('docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md');
  assert.match(closure, /FOUNDATION_STATUS:\s*FROZEN/);
  assert.match(closure, /08c446ead90db58e00a71095d5ba1f71756d1c7f/);
  assert.match(closure, /51\s+(?:个|canonical)/i);
  assert.match(closure, /COMPANY_FACT_PACK\.csv/);
  assert.match(closure, /ENGINE_SPEC_MASTER\.csv/);
  assert.match(closure, /PAGE_CHANGE_MATRIX\.csv/);
  assert.match(closure, /B2B.*landing|落地页规范/i);
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
