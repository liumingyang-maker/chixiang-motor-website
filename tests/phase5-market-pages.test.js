const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const publicPages = ['es/peru/index.html','es/colombia/index.html','ru/central-asia/index.html','ru/russia/index.html'];
const internalTerms = /NOT APPROVED|INPUT REQUIRED|Phase 5|Native review required|Research only|Confidence:|production form|paid search[^<]{0,40}not recommended|demanda de motores completos no está verificada/i;

test('Russia page absorbs the 140 topic with customer-facing evidence boundaries', () => {
  const html=read('ru/russia/index.html');
  assert.match(html,/110/);
  assert.match(html,/140/);
  assert.doesNotMatch(html,internalTerms);
  assert.match(html,/action="\/api\/contact"/);
  assert.doesNotMatch(read('sitemap.xml'),/\/ru\/dvigatel-140\//);
});

test('all Phase 5 country pages use customer-facing copy', () => {
  for(const file of publicPages) {
    const html=read(file);
    assert.doesNotMatch(html,internalTerms,file);
    assert.match(html,/confirm|selecci|revisi|провер|подбор|por confirmar/i,file);
    assert.doesNotMatch(html,/\$\s*\d+|MOQ\s*[:=]\s*\d+|CPC\s*[:=]\s*\d+/i,file);
  }
});

test('internal advertising decisions stay out of public Colombia copy', () => {
  const summary=read('research/phase-5/Phase_5_Executive_Summary.md');
  const colombia=read('es/colombia/index.html');
  assert.match(summary,/Ads Launch: NOT APPROVED/);
  assert.match(summary,/No ads launched/);
  assert.doesNotMatch(colombia,/SEO only|paid search|demanda de motores completos no está verificada/i);
  assert.match(colombia,/distribuidores|posventa|selección técnica/i);
});
