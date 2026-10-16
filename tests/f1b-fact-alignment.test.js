const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

test('AR and RU horizontal ranges match approved 110-150', () => {
  const ar = decodeEntities(read('ar/index.html'));
  const ru = decodeEntities(read('ru/index.html'));
  assert.match(ar, /110cc إلى 150cc/);
  assert.ok(!/50cc إلى 125cc/.test(ar));
  assert.match(ru, /110cc-150cc/);
  assert.ok(!/50cc-125cc/.test(ru));
  // CG range must stay 125-250
  assert.match(ar, /125cc إلى 250cc/);
});

test('language homepages qualify CCC and avoid 24-hour SLA', () => {
  for (const file of [
    'ar/index.html',
    'ru/index.html',
    'es/index.html',
    'pt/index.html',
    'en/index.html',
  ]) {
    const html = decodeEntities(read(file));
    assert.ok(!html.includes('CCC Certified'), file);
    assert.ok(!/24\s*(?:hour|hora|ساعة)/i.test(html) || !/reply|respond|يرد/i.test(html), file);
  }
});
