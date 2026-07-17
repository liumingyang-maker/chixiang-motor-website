const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('publishes Russia 140 page with evidence boundaries', () => {
  const html=read('ru/dvigatel-140/index.html');
  assert.match(html,/Горизонтальный двигатель 140 см³/);
  assert.match(html,/нижний горизонтальный двигатель 140 см³/i);
  assert.match(html,/CB \/ pit-bike 140–150/);
  assert.match(html,/не означает прямую установку/i);
  assert.match(html,/Ads Launch NOT APPROVED/);
  assert.match(html,/action="\/api\/contact"/);
  assert.match(read('sitemap.xml'),/\/ru\/dvigatel-140\//);
});

test('all Phase 5 country pages prohibit unsupported commercial claims', () => {
  for(const file of ['es/peru/index.html','es/colombia/index.html','ru/uzbekistan/index.html','ru/dvigatel-140/index.html']) {
    const html=read(file);
    assert.match(html,/confirm|revisi|провер|INPUT REQUIRED|por confirmar/i,file);
    assert.doesNotMatch(html,/\$\s*\d+|MOQ\s*[:=]\s*\d+|CPC\s*[:=]\s*\d+/i,file);
  }
});

test('Phase 5 delivery is design-only and Colombia remains SEO-only', () => {
  const summary=read('research/phase-5/Phase_5_Executive_Summary.md');
  const colombia=read('es/colombia/index.html');
  assert.match(summary,/Ads Launch: NOT APPROVED/);
  assert.match(summary,/No ads launched/);
  assert.match(colombia,/SEO only/);
  assert.match(colombia,/Paid search<\/strong><span>no recomendado/i);
});
