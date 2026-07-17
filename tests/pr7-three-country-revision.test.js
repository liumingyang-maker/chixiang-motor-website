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
  ordered(products, ['Motores CG refrigerados por aire de 150–250 cc','Motores refrigerados por agua para trabajo y carga','Motores HW refrigerados por agua de 200–350 cc','Motores y paquetes de repuestos']);
  assert.match(products, /images\/普通水冷\/6kjzxqqh\.webp/);
  assert.match(products, /images\/捍威\/product_main_image_1\.webp/);
  assertCommercialThresholds(html, 'es');
  assertInquiryForm(html, 'Peru');
  assert.doesNotMatch(html + data + products, internalTerms);
});

test('Uzbekistan presents air-cooled, standard water-cooled, HW and spares for motorcycles and cargo tricycles', () => {
  const html = read('ru/uzbekistan/index.html');
  assert.match(html, /<h1>Двигатели для мотоциклов и грузовых трициклов в Узбекистане<\/h1>/);
  ordered(html, ['Двигатели CG воздушного охлаждения 150–250 см³','Двигатели водяного охлаждения для работы и грузовой техники','Двигатели HW водяного охлаждения 200–350 см³','Двигатели и комплекты запасных частей']);
  assert.match(html, /\.\.\/\.\.\/images\/普通水冷\/6kjzxqqh\.webp/);
  assert.match(html, /\.\.\/\.\.\/images\/捍威\/product_main_image_1\.webp/);
  assertCommercialThresholds(html, 'ru');
  assertInquiryForm(html, 'Uzbekistan');
  assert.doesNotMatch(html, internalTerms);
});

test('Russia market page leads with local CB data, then horizontal engines and the 140 topic', () => {
  const html = read('ru/russia/index.html');
  assert.match(html, /<h1>Двигатели для внедорожных мотоциклов и горизонтальные двигатели в России<\/h1>/);
  ordered(html, ['Двигатели серии CB для внедорожных мотоциклов','Горизонтальные двигатели','Горизонтальные двигатели 140 см³','Двигатели и комплекты запасных частей']);
  assert.match(html, /CB150[\s\S]+CB200-C[\s\S]+CB250/);
  assert.match(html, /\.\.\/\.\.\/images\/CB\/1\.webp/);
  assert.match(html, /href="\/en\/product-detail\.html\?series=cb-offroad"/);
  assert.match(html, /href="\/ru\/dvigatel-140\/"/);
  assertCommercialThresholds(html, 'ru');
  assertInquiryForm(html, 'Russia');
  assert.doesNotMatch(html, internalTerms);
});

test('navigation, SEO routes and public copy remain customer-facing', () => {
  const peru = read('es/peru/index.html');
  const uzbekistan = read('ru/uzbekistan/index.html');
  const russia = read('ru/russia/index.html');
  const russianHome = read('ru/index.html');
  const sitemap = read('sitemap.xml');
  assert.match(peru, /canonical[^>]+\/es\/peru\//);
  assert.match(uzbekistan, /hreflang="ru-UZ"/);
  assert.match(russia, /canonical[^>]+\/ru\/russia\//);
  assert.match(russianHome, /href="\/ru\/russia\/"/);
  assert.match(sitemap, /https:\/\/chixiangmotor\.com\/ru\/russia\//);
  [peru,uzbekistan,russia].forEach(html => assert.doesNotMatch(html, internalTerms));
});
