const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const organizationId = 'https://chixiangmotor.com/#organization';
const googleAdsId = 'AW-16777656395';
const yandexMetricaId = '109483511';

const contracts = {
  ru: {
    label: 'Russian',
    homeH1: 'Производитель двигателей для мотоциклов и грузовых трициклов в Китае',
    aboutStatement: 'CHIXIANG MOTOR — бренд компании Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. Компания работает в отрасли мотоциклетных двигателей с 2003 года, а нынешнее юридическое лицо зарегистрировано в 2007 году.',
    futureStatus: 'В подготовке',
    futureName: 'Мотоциклы и комплекты CKD/SKD'
  },
  es: {
    label: 'Spanish',
    homeH1: 'Fabricante de motores para motocicletas y triciclos de carga en China',
    aboutStatement: 'CHIXIANG MOTOR es la marca de Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. La empresa trabaja en la industria de motores para motocicletas desde 2003 y la entidad jurídica actual se registró en 2007.',
    futureStatus: 'En preparación',
    futureName: 'Motocicletas y kits CKD/SKD'
  },
  pt: {
    label: 'Portuguese',
    homeH1: 'Fabricante de motores para motocicletas e triciclos de carga na China',
    aboutStatement: 'CHIXIANG MOTOR é a marca da Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. A empresa atua no setor de motores para motocicletas desde 2003, e a atual entidade jurídica foi registrada em 2007.',
    futureStatus: 'Em preparação',
    futureName: 'Motocicletas e kits CKD/SKD'
  },
  ar: {
    label: 'Arabic',
    homeH1: 'مصنع محركات الدراجات النارية ودراجات الشحن ثلاثية العجلات في الصين',
    aboutStatement: 'CHIXIANG MOTOR هي العلامة التجارية لشركة Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. تعمل الشركة في صناعة محركات الدراجات النارية منذ عام 2003، وتم تسجيل الكيان القانوني الحالي في عام 2007.',
    futureStatus: 'قيد الإعداد',
    futureName: 'الدراجات النارية ومجموعات CKD/SKD'
  }
};

function canonicalHref(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  assert.ok(match, 'missing canonical link');
  return match[1];
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => JSON.parse(match[1]));
}

function futureCard(html) {
  const match = html.match(/<article\b[^>]*\bproduct-card--future\b[^>]*>[\s\S]*?<\/article>/i);
  assert.ok(match, 'missing preparation-only future program card');
  return match[0];
}

function stripQueryAndHash(url) {
  return url.split(/[?#]/, 1)[0];
}

function assertInlineBackgroundsExist(file, html) {
  for (const match of html.matchAll(/background-image\s*:\s*url\((['"]?)([^)'"\s]+)\1\)/gi)) {
    const url = match[2];
    if (/^(?:data:|https?:|\/\/)/i.test(url)) continue;
    const decoded = decodeURIComponent(stripQueryAndHash(url));
    const asset = path.resolve(path.dirname(path.join(root, file)), decoded);
    assert.ok(fs.existsSync(asset), `${file}: missing background asset ${decoded}`);
  }
}

for (const [language, contract] of Object.entries(contracts)) {
  test(`${contract.label} core owner pages satisfy the localized owner contract`, async t => {
    for (const role of ['index', 'about', 'products']) {
      await t.test(role, () => {
        const file = `${language}/${role}.html`;
        const html = read(file);
        const route = role === 'index' ? `/${language}/` : `/${language}/${role}`;

        assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, `${file}: one H1`);
        assert.equal(canonicalHref(html), `https://chixiangmotor.com${route}`, `${file}: self canonical`);
        assert.match(html, new RegExp(googleAdsId), `${file}: Google Ads tag preserved`);
        assert.match(html, new RegExp(`ym\\(${yandexMetricaId}`), `${file}: Yandex Metrica tag preserved`);

        const blocks = jsonLdBlocks(html);
        assert.ok(blocks.length > 0, `${file}: JSON-LD required`);
        assert.ok(JSON.stringify(blocks).includes(organizationId), `${file}: shared Organization @id required`);
        assertInlineBackgroundsExist(file, html);
      });
    }

    await t.test('Home ownership', () => {
      const html = read(`${language}/index.html`);
      assert.match(html, new RegExp(`<h1[^>]*>${contract.homeH1}<\\/h1>`, 'i'));
      assert.match(html, new RegExp(`href=["']\/${language}\/about["']`, 'i'));
      assert.match(html, new RegExp(`href=["']\/${language}\/products["']`, 'i'));
    });

    await t.test('About ownership', () => {
      const html = read(`${language}/about.html`);
      assert.ok(html.includes(contract.aboutStatement), `${language}/about.html: approved company relationship required`);
      assert.match(html, /ISO 9001/i);
      assert.match(html, /CCC/i);
    });

    await t.test('Products current/future boundary', () => {
      const html = read(`${language}/products.html`);
      const card = futureCard(html);
      assert.ok(card.includes(contract.futureStatus));
      assert.ok(card.includes(contract.futureName));
      assert.doesNotMatch(card, /href=|\bbtn\b|price|MOQ|"@type"\s*:\s*"(?:Product|Offer|AggregateRating|Review)"/i);
      assert.doesNotMatch(html, /series=(?:motorcycles|tricycles)/i);

      const jsonLd = JSON.stringify(jsonLdBlocks(html));
      assert.doesNotMatch(jsonLd, new RegExp(contract.futureName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      assert.doesNotMatch(jsonLd, /"@type":"(?:Product|Offer|AggregateRating|Review)"/i);
    });
  });
}

test('Arabic owner pages preserve right-to-left document direction', () => {
  for (const role of ['index', 'about', 'products']) {
    assert.match(read(`ar/${role}.html`), /<html\b[^>]*lang=["']ar["'][^>]*dir=["']rtl["']/i);
  }
});

test('all twelve scoped pages are traceable in the GEO change matrix', () => {
  const matrix = read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv');
  for (const language of Object.keys(contracts)) {
    for (const role of ['', 'about', 'products']) {
      const route = role ? `/${language}/${role}` : `/${language}/`;
      const row = matrix.split(/\r?\n/).find(line => line.includes(`"${route}"`));
      assert.ok(row, `${route}: missing matrix row`);
      assert.match(row, /multilingual owner contract/i, `${route}: matrix row must identify this contract`);
    }
  }
});
