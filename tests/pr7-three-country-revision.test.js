const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const internalTerms = /NOT APPROVED|INPUT REQUIRED|Phase 5|Research only|Confidence|Native review required/i;

function ordered(source, values) {
  let cursor = -1;
  for (const value of values) {
    const next = source.indexOf(value);
    assert.ok(next > cursor, `${value} is missing or out of order`);
    cursor = next;
  }
}

function assertCommercialThresholds(html, language) {
  const phrases = language === 'es' ? [
    'Muestras desde 2 motores en total',
    'Pedidos mayoristas desde 50 motores en total',
    'Pedidos mixtos desde 100 motores en total',
    'OEM desde 100 motores en total',
    'Las cantidades se calculan sobre el total del pedido'
  ] : [
    'Образцы — от 2 двигателей в одном заказе',
    'Оптовые заказы — от 50 двигателей суммарно',
    'Смешанные заказы — от 100 двигателей суммарно',
    'OEM — от 100 двигателей суммарно',
    'Количество рассчитывается по общему объёму заказа'
  ];
  phrases.forEach(phrase => assert.match(html, new RegExp(phrase)));
}

function assertInquiryForm(html, market) {
  assert.match(html, /action="\/api\/contact"/);
  ['name','company','contact','country','application','product_interest','engine_code','vehicle','quantity','requirements']
    .forEach(name => assert.match(html, new RegExp(`name="${name}"`), `${market}: ${name}`));
}

test('Peru sells the approved four product groups with confirmed order totals', () => {
  const html = read('es/peru/index.html');
  const data = read('js/latam-cg-peru-data.js');
  const products = read('js/latam-cg-products.js');
  assert.match(data, /Motores para motocicletas y trimotos de carga en Perú/);
  assert.match(html, /Motores para motos y trimotos de carga en Perú \| Chixiang Motor/);
  ordered(data, ["'cg-air-range'", "'standard-water'", "'hw-water'", "'engine-spares'"]);
  ordered(products, ['Motores CG refrigerados por aire de 150–250 cc','Motores refrigerados por agua para trabajo y carga','HW Water 200–350 cc','Motores y paquetes de repuestos']);
  assert.match(products, /CG150SB \/ CG175SB \/ CG200SB \/ CG250SB/);
  assert.match(products, /Sin reversa interna/);
  assert.match(products, /magneto de alta salida/);
  assert.match(products, /images\/普通水冷\/6kjzxqqh\.webp/);
  assert.match(products, /images\/捍威\/product_main_image_1\.webp/);
  assertCommercialThresholds(html, 'es');
  assertInquiryForm(html, 'Peru');
  assert.doesNotMatch(html + data + products, internalTerms);
});

test('Central Asia consolidates the five markets including Uzbekistan', () => {
  const html = read('ru/central-asia/index.html');
  ['Казахстан','Узбекистан','Кыргызстан','Таджикистан','Туркменистан'].forEach(country => {
    assert.ok(html.includes(country), `country selector contains ${country}`);
  });
  assertCommercialThresholds(html, 'ru');
  assert.match(html, /action="\/api\/contact"/);
  ['name','contact','country','product_interest','quantity','application','market','source_form'].forEach(name => assert.match(html, new RegExp(`name="${name}"`), `Central Asia: ${name}`));
  assert.match(html, /name="website"/);
  assert.doesNotMatch(html, internalTerms);
});

test('Russia market page leads with CB off-road then horizontal 110-150 and spares', () => {
  const html = read('ru/russia/index.html');
  assert.match(html, /<h1>Двигатели CB для внедорожных мотоциклов и горизонтальные серии в России<\/h1>/);
  ordered(html, ['Двигатели серии CB для внедорожных мотоциклов','Горизонтальные двигатели 110–150 см³','Двигатели и комплекты запасных частей']);
  assert.match(html, /CB150[\s\S]+CB200-C[\s\S]+CB250/);
  ['110','125','140','150'].forEach(cc => assert.ok(html.includes(cc), `displacement ${cc} present`));
  assert.match(html, /id="cb-offroad"/);
  assert.match(html, /id="horizontal-engines"/);
  assert.match(html, /\.\.\/\.\.\/images\/CB\/1\.webp/);
  assert.match(html, /href="\/en\/product-detail\?series=cb-offroad"/);
  assert.doesNotMatch(html, /href="\/ru\/dvigatel-140\/"/);
  assertCommercialThresholds(html, 'ru');
  assertInquiryForm(html, 'Russia');
  assert.doesNotMatch(html, internalTerms);
});

test('navigation, SEO routes and public copy remain customer-facing', () => {
  const peru = read('es/peru/index.html');
  const centralAsia = read('ru/central-asia/index.html');
  const russia = read('ru/russia/index.html');
  const russianHome = read('ru/index.html');
  const sitemap = read('sitemap.xml');
  assert.match(peru, /canonical[^>]+\/es\/peru\//);
  assert.match(russia, /canonical[^>]+\/ru\/russia\//);
  assert.match(russianHome, /href="\/ru\/russia\/"/);
  assert.match(russianHome, /href="\/ru\/central-asia\/"/);
  assert.doesNotMatch(russianHome, /href="\/ru\/uzbekistan\/"|href="\/ru\/dvigatel-140\/"/);
  assert.match(sitemap, /https:\/\/chixiangmotor\.com\/ru\/russia\//);
  assert.match(sitemap, /https:\/\/chixiangmotor\.com\/ru\/central-asia\//);
  assert.doesNotMatch(sitemap, /\/ru\/uzbekistan\//);
  assert.doesNotMatch(sitemap, /\/ru\/dvigatel-140\//);
  [peru,centralAsia,russia].forEach(html => assert.doesNotMatch(html, internalTerms));
});

test('Peru hero uses short labels and a safe customer-facing mobile CTA', () => {
  const products = read('js/latam-cg-products.js');
  const renderer = read('js/latam-cg-landing.js');
  const html = read('es/peru/index.html');
  const css = read('css/latam-cg-landing.css');
  ['CG Air-Cooled 150–250 cc', 'Standard Water-Cooled', 'HW Water 200–350 cc']
    .forEach(label => assert.match(products, new RegExp(label)));
  assert.match(renderer, /item\.heroLabel \|\| item\.name/);
  assert.match(html, />Cotizar por WhatsApp<\/a>/);
  assert.doesNotMatch(html, /Solicitar revisión/);
  assert.match(css, /has-latam-mobile-cta[^}]+padding-bottom:\s*(?:9[6-9]|[1-9]\d{2,})px/);
  assert.match(css, /\.latam-mobile-cta\[hidden\]\s*\{[^}]*display:\s*none/);
});

test('Russia hero contract enforces a desktop two-column layout', () => {
  const css = read('css/phase5-market-pages.css');
  const html = read('ru/russia/index.html');
  assert.equal((html.match(/class="p5-hero-art p5-hero-collage"/g) || []).length, 1);
  assert.equal((html.match(/class="p5-hero-art p5-hero-collage"[\s\S]*?<\/div><\/div><\/section>/) || [''])[0].match(/<img /g)?.length, 3);
  assert.match(css, /@media\(min-width:960px\)[^{]*\{[\s\S]*?\.p5-hero-grid\{[^}]*grid-template-columns:/);
  assert.match(css, /@media\(min-width:960px\)[\s\S]*?\.p5-hero h1\{[^}]*font-size:[^;}]*60px/);
  assert.match(css, /@media\(max-width:959px\)[\s\S]*?\.p5-nav\{[^}]*display:none/);
});

test('Russia uses the approved H1 and canonical CB product route', () => {
  const html = read('ru/russia/index.html');
  assert.match(html, /<h1>Двигатели CB для внедорожных мотоциклов и горизонтальные серии в России<\/h1>/);
  assert.match(html, /href="\/en\/product-detail\?series=cb-offroad"/);
  assert.doesNotMatch(html, /href="\/en\/product-detail\.html\?series=cb-offroad"/);
});

test('Colombia production files are restored to the main-site version', () => {
  const colombia = read('es/colombia/index.html');
  const data = read('js/latam-cg-colombia-data.js');
  const index = read('es/index.html');
  assert.match(colombia, /Motores CG 125\/150 cc de reemplazo en Colombia/);
  assert.match(data, /productOrder:\s*\['cg125', 'cg150', 'replacement'\]/);
  assert.doesNotMatch(index, /\/es\/colombia\/|Colombia: repuestos y calificación/);
});
