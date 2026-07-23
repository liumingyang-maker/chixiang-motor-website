const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const internalTerms = /NOT APPROVED|INPUT REQUIRED|Phase 5|Research only|Confidence|Native review required/i;

test('homepage Horizontal Engines card uses an existing local image (not the broken png)', () => {
  const html = read('en/index.html');
  const encodedDir = '%E5%8D%A7%E5%BC%8F%E7%94%B5%E5%90%AF%E5%8A%A8';
  assert.ok(html.includes(encodedDir + '/3504ab0b-70d8-42bd-ab24-cddc34045a26.webp'), 'horizontal card references the webp image');
  assert.ok(!html.includes(encodedDir + '/3504ab0b-70d8-42bd-ab24-cddc34045a26.png'), 'broken png reference removed');
  assert.ok(exists('images/卧式电启动/3504ab0b-70d8-42bd-ab24-cddc34045a26.webp'), 'webp image file exists on disk');
});

test('homepage Horizontal Engines copy uses the 110-150cc range', () => {
  const html = read('en/index.html');
  assert.ok(html.includes('110–150cc'), 'copy contains 110–150cc');
  assert.ok(html.includes('Horizontal Engines'), 'card title present');
  assert.ok(!html.includes('50–125cc / Single Cylinder'), 'old 50–125cc copy removed');
});

test('consolidated market pages: central-asia and russia remain, uzbekistan and 140 removed from sitemap', () => {
  assert.ok(exists('ru/central-asia/index.html'), '/ru/central-asia/ page exists');
  assert.ok(exists('ru/russia/index.html'), '/ru/russia/ page exists');
  const sitemap = read('sitemap.xml');
  assert.ok(sitemap.includes('https://chixiangmotor.com/ru/central-asia/'), 'central-asia in sitemap');
  assert.ok(sitemap.includes('https://chixiangmotor.com/ru/russia/'), 'russia in sitemap');
  assert.ok(!sitemap.includes('/ru/uzbekistan/'), 'uzbekistan removed from sitemap');
  assert.ok(!sitemap.includes('/ru/dvigatel-140/'), 'dvigatel-140 removed from sitemap');
});

test('central-asia page still covers all five countries including Uzbekistan and Turkmenistan', () => {
  const html = read('ru/central-asia/index.html');
  ['Казахстан', 'Узбекистан', 'Кыргызстан', 'Таджикистан', 'Туркменистан'].forEach(country => {
    assert.ok(html.includes(country), `country selector contains ${country}`);
  });
  assert.ok(html.includes('action="/api/contact"'), 'form action preserved');
  assert.doesNotMatch(html, internalTerms);
});

test('russia page restructured into CB off-road and horizontal 110/125/140/150', () => {
  const html = read('ru/russia/index.html');
  assert.ok(html.includes('CB150'), 'CB150 present');
  assert.ok(html.includes('CB200-C'), 'CB200-C present');
  assert.ok(html.includes('CB250'), 'CB250 present');
  ['110', '125', '140', '150'].forEach(cc => {
    assert.ok(html.includes(cc), `displacement ${cc} present`);
  });
  assert.ok(html.includes('id="horizontal-engines"'), '#horizontal-engines anchor present');
  assert.ok(html.includes('id="cb-offroad"'), '#cb-offroad anchor present');
  assert.ok(!html.includes('/ru/dvigatel-140/'), 'no internal link to removed 140 page');
  assert.ok(html.includes('/en/product-detail.html?series=cb-offroad'), 'CB link uses .html route');
  assert.ok(!html.includes('/en/product-detail?series=cb-offroad'), 'no broken CB link without .html');
  assert.ok(html.includes('yandex-metrica.js'), 'Yandex Metrica preserved');
  assert.ok(html.includes('action="/api/contact"'), 'form action preserved');
  assert.ok(html.includes('name="market" value="Russia"'), 'market field preserved');
  assert.ok(html.includes('name="source_form"'), 'source_form field preserved');
  assert.doesNotMatch(html, internalTerms);
});

test('redirects consolidate old routes without loops', () => {
  const redirects = read('_redirects');
  assert.ok(redirects.includes('/ru/uzbekistan/ /ru/central-asia/ 301'), 'uzbekistan redirects to central-asia');
  assert.ok(redirects.includes('/ru/dvigateli-dlya-uzbekistana.html /ru/central-asia/ 301'), 'legacy uzbekistan url redirects to central-asia');
  assert.ok(redirects.includes('/ru/dvigatel-140/ /ru/russia/#horizontal-engines 301'), 'dvigatel-140 redirects to russia horizontal');
  const sources = redirects.split(/\r?\n/).filter(Boolean).map(line => line.split(/\s+/)[0]);
  assert.ok(!sources.includes('/ru/central-asia/'), 'central-asia is not a redirect source (no loop)');
  assert.ok(!sources.includes('/ru/russia/'), 'russia is not a redirect source (no loop)');
});

test('peru and colombia pages remain intact and customer-facing', () => {
  const peru = read('es/peru/index.html');
  const colombia = read('es/colombia/index.html');
  assert.ok(peru.includes('canonical'), 'peru canonical present');
  assert.ok(peru.includes('action="/api/contact"'), 'peru form preserved');
  assert.ok(colombia.includes('action="/api/contact"'), 'colombia form preserved');
  assert.doesNotMatch(peru, internalTerms);
  assert.doesNotMatch(colombia, internalTerms);
});
