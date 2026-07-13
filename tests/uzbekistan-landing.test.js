const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'ru', 'dvigateli-dlya-uzbekistana.html');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('publishes the Uzbekistan landing-page contract', () => {
  assert.ok(fs.existsSync(pagePath), 'the landing page must exist');
  const html = fs.readFileSync(pagePath, 'utf8');

  assert.match(html, /<html lang="ru"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="cg-engines"/);
  assert.match(html, /id="cg-heavy-duty"/);
  assert.match(html, /CG 150[–-]250/);
  assert.match(html, /CG 200[–-]350/);
  assert.match(html, /Опционально со встроенным реверсом/);
  assert.match(html, /Без встроенного реверса/);
  assert.doesNotMatch(html, /HW Heavy-Duty/i);
  assert.match(html, /href="https:\/\/wa\.me\/8619008225410\?text=/);
  assert.match(html, /<form[^>]+id="contactForm"[^>]+action="\/api\/contact"/);
  assert.match(html, /\.\.\/js\/main\.js/);
  assert.match(html, /\.\.\/js\/uzbekistan-landing\.js/);
  assert.match(html, /\.\.\/css\/uzbekistan-landing\.css/);
  assert.match(html, /FAQPage/);
  assert.match(html, /rel="canonical" href="https:\/\/chixiangmotor\.com\/ru\/dvigateli-dlya-uzbekistana\.html"/);
});

test('registers the production URL in the sitemap', () => {
  assert.match(read('sitemap.xml'), /https:\/\/chixiangmotor\.com\/ru\/dvigateli-dlya-uzbekistana\.html/);
});

test('references only existing local product assets', () => {
  assert.ok(fs.existsSync(pagePath), 'the landing page must exist');
  const html = fs.readFileSync(pagePath, 'utf8');
  const sources = [...html.matchAll(/<img[^>]+src="\.\.\/images\/([^"]+)"/g)]
    .map(match => decodeURIComponent(match[1]));

  assert.ok(sources.length >= 15, 'all three five-image product galleries are required');
  for (const source of sources) {
    assert.ok(fs.existsSync(path.join(root, 'images', source)), source);
  }
});

test('defines responsive and accessible page-scoped styles', () => {
  const css = read('css/uzbekistan-landing.css');
  assert.match(css, /\.uz-product-row/);
  assert.match(css, /@media\s*\(max-width:\s*680px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /scroll-margin-top/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /background:\s*#fff/);
});
