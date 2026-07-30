const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').toUpperCase();

function sourceFileForUrl(rawUrl) {
  const pathname = new URL(rawUrl).pathname;
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function decodeNumericEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function between(value, start, end) {
  const from = value.indexOf(start);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  const to = value.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return value.slice(from, to);
}

function around(value, marker, length = 2200) {
  const from = value.indexOf(marker);
  assert.notEqual(from, -1, `missing marker: ${marker}`);
  return value.slice(from, from + length);
}

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const publicFiles = sitemapUrls.map(sourceFileForUrl);
const publicSource = decodeNumericEntities([
  ...publicFiles.map(read),
  read('js/latam-cg-products.js'),
  read('js/central-asia-data.js')
].join('\n'));

test('tracking, form and Worker implementation files remain byte-identical', () => {
  const expected = {
    'workers/contact-api/src/index.mjs': 'D24CF2D2DC596265D57C9011909E2A0CF567FC8A2D1EEE816F4C97F46C151C42',
    'js/main.js': 'D685FEFC94AE57B27E470335B315D8CFACF8B8F6DE56E3DB8EEBFBC391227BA8',
    'js/yandex-metrica.js': '7FF3C32D95E7672476CB33F4B3B3EE90880A5DCEEB6CA1C9AF342CA3D59F9608',
    'js/yandex-metrika.js': '14F540301683170BA4BA807FEAF033791E74F68603A2394845E01C29BD107CCB'
  };
  for (const [file, hash] of Object.entries(expected)) assert.equal(sha256(file), hash, file);
});

test('About pages distinguish industry experience from company registration', () => {
  const required = {
    'en/about.html': [/industry experience since 2003/i, /company registered in 2007/i],
    'es/about.html': [/experiencia en el sector desde 2003/i, /empresa registrada en 2007/i],
    'pt/about.html': [/experiência no setor desde 2003/i, /empresa registrada em 2007/i],
    'ru/about.html': [/опыт работы в отрасли с 2003 года/i, /компания зарегистрирована в 2007 году/i],
    'ar/about.html': [/خبرة في القطاع منذ عام 2003/i, /تم تسجيل الشركة رسميًا عام 2007/i]
  };
  for (const [file, patterns] of Object.entries(required)) {
    const html = decodeNumericEntities(read(file));
    for (const pattern of patterns) assert.match(html, pattern, file);
  }
  for (const pattern of [
    /founded in 2003/i,
    /established in 2003/i,
    /fundada en 2003/i,
    /fundada em 2003/i,
    /основан[а-я]*\s+(?:в\s+)?2003/i,
    /تأسست[^<]{0,60}2003/i
  ]) assert.doesNotMatch(publicSource, pattern, String(pattern));
});

test('all translated catalogues publish the approved HW Water family facts', () => {
  const catalogues = {
    'en/products.html': [/HW Water/, /1\.5 L/, /20-roller/i, /high-output magneto/i, /No built-in reverse/i],
    'es/products.html': [/HW Water/, /1,5 L/, /20 rodillos/i, /magneto de alta salida/i, /Sin reversa interna/i],
    'pt/products.html': [/HW Water/, /1,5 L/, /20 roletes/i, /magneto de alta saída/i, /Sem marcha à ré interna/i],
    'ru/products.html': [/HW Water/, /1,5 л/i, /20-роликовой/i, /магнето повышенной мощности/i, /Без встроенного реверса/i],
    'ar/products.html': [/HW Water/, /1\.5 لتر/i, /20 بكرة/i, /عالي الخرج/i, /من دون ترس رجوع داخلي/i]
  };
  for (const [file, patterns] of Object.entries(catalogues)) {
    const html = decodeNumericEntities(read(file));
    const section = around(html, 'HW Water');
    for (const pattern of patterns) assert.match(section, pattern, `${file}:${pattern}`);
    assert.doesNotMatch(section, /all gears plus built-in reverse|with built-in reverse|reverse gear included/i, file);
  }
});

test('public content removes rejected model and magneto wording', () => {
  assert.doesNotMatch(publicSource, /\bCG150B\b/);
  assert.doesNotMatch(publicSource, /18[- ]pole magneto/i);
  assert.doesNotMatch(publicSource, /18极磁电机/i);
});

test('noindex product utility keeps family claims within approved boundaries', () => {
  const utility = decodeNumericEntities(read('en/product-detail.html'));
  const hw = between(utility, "'hanwei': {", "'efi-water': {");
  assert.match(hw, /HW Water Series Heavy-Duty Water-Cooled Engine/);
  assert.match(hw, /1\.5 L/);
  assert.match(hw, /20-roller clutch/i);
  assert.match(hw, /high-output magneto/i);
  assert.match(hw, /no built-in reverse/i);
  assert.doesNotMatch(hw, /18[- ]pole|no slipping|eliminates overheating|reverse gear included/i);

  const balancer = between(utility, "'cg-balancer': {", "'cg-water': {");
  assert.match(balancer, /helps reduce single-cylinder vibration/i);
  assert.doesNotMatch(balancer, /2x longer|dramatically reduced|superior smoothness/i);

  const automatic = between(utility, "'auto-clutch': {", "'parts': {");
  assert.match(automatic, /CG150/);
  assert.match(automatic, /CG175/);
  assert.doesNotMatch(automatic, /CG200|CG250/);
});

test('market pages retain their existing conversion integrations', () => {
  const required = {
    'ru/gorizontalnyj-dvigatel.html': [/action="\/api\/contact"/i, /yandex-metrica\.js/i, /AW-16777656395/],
    'ru/russia/index.html': [/action="\/api\/contact"/i, /yandex-metrica\.js/i, /data-message-turnstile/i],
    'ru/central-asia/index.html': [/id="centralAsiaQuoteForm"/i, /action="\/api\/contact"/i, /data-message-turnstile/i],
    'es/peru/index.html': [/id="latamQuoteForm"/i, /action="\/api\/contact"/i, /AW-16777656395/],
    'es/colombia/index.html': [/id="latamQuoteForm"/i, /action="\/api\/contact"/i, /AW-16777656395/]
  };
  for (const [file, patterns] of Object.entries(required)) {
    const html = read(file);
    for (const pattern of patterns) assert.match(html, pattern, `${file}:${pattern}`);
  }
});

test('every canonical source page has one H1 and a self-referencing canonical', () => {
  for (const url of sitemapUrls) {
    const file = sourceFileForUrl(url);
    const html = read(file);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${file}:H1`);
    const canonicalTags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)].map(match => match[0]);
    assert.equal(canonicalTags.length, 1, `${file}:canonical-count`);
    assert.match(canonicalTags[0], new RegExp(`href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i'), `${file}:canonical-url`);
  }
});

test('the nine shared page groups retain complete five-language hreflang sets', () => {
  const groups = [
    ['/en/', '/es/', '/pt/', '/ru/', '/ar/'],
    ['/en/about', '/es/about', '/pt/about', '/ru/about', '/ar/about'],
    ['/en/products', '/es/products', '/pt/products', '/ru/products', '/ar/products'],
    ['/en/news', '/es/news', '/pt/news', '/ru/news', '/ar/news'],
    ['/en/contact', '/es/contacto', '/pt/contato', '/ru/kontakty', '/ar/contact'],
    ['/en/cg-engine', '/es/motor-cg', '/pt/motor-cg', '/ru/dvigatel-cg', '/ar/cg-engine'],
    ['/en/cb-engine', '/es/motor-cb', '/pt/motor-cb', '/ru/dvigatel-cb', '/ar/cb-engine'],
    ['/en/horizontal-engine', '/es/motor-horizontal', '/pt/motor-horizontal', '/ru/gorizontalnyj-dvigatel', '/ar/horizontal-engine'],
    ['/en/engine-parts', '/es/repuestos-motor', '/pt/pecas-de-motor', '/ru/zapchasti-dvigatelya', '/ar/engine-parts']
  ];
  const languages = ['en', 'es', 'pt', 'ru', 'ar'];
  for (const paths of groups) {
    for (const pagePath of paths) {
      const file = sourceFileForUrl(`https://chixiangmotor.com${pagePath}`);
      const html = read(file);
      languages.forEach((language, index) => {
        const href = `https://chixiangmotor.com${paths[index]}`;
        const tag = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).find(value => new RegExp(`hreflang=["']${language}["']`, 'i').test(value));
        assert.ok(tag, `${file}:${language}:missing`);
        assert.match(tag, new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i'), `${file}:${language}:href`);
      });
      const defaultTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]).find(value => /hreflang=["']x-default["']/i.test(value));
      assert.ok(defaultTag, `${file}:x-default:missing`);
      assert.match(defaultTag, new RegExp(`href=["']https://chixiangmotor\\.com${paths[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i'), `${file}:x-default:href`);
    }
  }
});

test('HW market records never claim reverse or 18-pole magnetos', () => {
  const latam = between(read('js/latam-cg-products.js'), "'hw-water': {", "'engine-spares': {");
  assert.match(latam, /HW Water/);
  assert.match(latam, /Sin reversa interna/i);
  assert.match(latam, /magneto de alta salida/i);
  assert.doesNotMatch(latam, /18[- ]pole|18 polos|según el modelo.*reverse|reversa incorporada/i);

  const centralAsia = between(read('js/central-asia-data.js'), "slug: 'cg-heavy'", '    applications: [');
  assert.match(centralAsia, /name: 'HW Water'/);
  assert.match(centralAsia, /Без встроенного реверса/i);
  assert.match(centralAsia, /магнето повышенной мощности/i);
  assert.doesNotMatch(centralAsia, /18[- ]pole|18-?полюс|CG Heavy/i);
});

test('the noindex product utility remains outside the canonical sitemap', () => {
  assert.doesNotMatch(read('sitemap.xml'), /product-detail/i);
  assert.match(read('en/product-detail.html'), /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*["']/i);
});

test('translated contact honeypots do not create an RTL off-canvas viewport', () => {
  const contactPages = ['ar/contact.html', 'es/contacto.html', 'pt/contato.html', 'ru/kontakty.html'];
  for (const file of contactPages) {
    const html = read(file);
    assert.match(html, /class=["']contact-honeypot["']/i, `${file}:honeypot-class`);
    assert.doesNotMatch(html, /<div\b[^>]*style=["'][^"']*left\s*:\s*-9999px/i, `${file}:off-canvas-honeypot`);
  }

  const css = read('css/style.css');
  assert.match(css, /\.contact-honeypot\s*\{[^}]*clip-path\s*:\s*inset\(50%\)/is);
  assert.doesNotMatch(css, /\.contact-honeypot\s*\{[^}]*left\s*:\s*-9999px/is);
});
