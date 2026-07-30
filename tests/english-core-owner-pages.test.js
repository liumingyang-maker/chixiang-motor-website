const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function h1Tags(html) {
  return [...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi)]
    .map(match => ({
      attrs: match[1],
      text: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }));
}

function futureCard(html) {
  const match = html.match(/<article\b[^>]*\bproduct-card--future\b[^>]*>[\s\S]*?<\/article>/i);
  assert.ok(match, 'missing future program card');
  return match[0];
}

test('Products page inline background images resolve to existing local assets', () => {
  const html = read('en/products.html');
  const imageUrls = [...html.matchAll(/background-image\s*:\s*url\((['"]?)([^)'"]+)\1\)/gi)]
    .map(match => match[2])
    .filter(url => !/^(?:data:|https?:)/i.test(url));

  assert.ok(imageUrls.length > 0, 'expected inline product background images');

  for (const imageUrl of imageUrls) {
    const cleanPath = decodeURIComponent(imageUrl.split(/[?#]/, 1)[0]);
    const assetPath = path.resolve(root, 'en', cleanPath);
    assert.ok(fs.existsSync(assetPath), `${imageUrl}: local image asset is missing`);
  }
});

test('English owner pages publish their approved visible H1', () => {
  const expected = {
    'en/index.html': 'Motorcycle & Cargo-Tricycle Engine Manufacturer in China',
    'en/about.html': 'About Chixiang Motor: Motorcycle Engine Factory in Chongqing',
    'en/products.html': 'Motorcycle Engines, Parts, Motorcycles & CKD/SKD Programs'
  };

  for (const [file, heading] of Object.entries(expected)) {
    const tags = h1Tags(read(file));
    assert.equal(tags.length, 1, `${file}: one H1`);
    assert.equal(tags[0].text.replace(/&amp;/g, '&'), heading, `${file}: H1 text`);
    assert.doesNotMatch(tags[0].attrs, /\bsr-only\b|\bhidden\b/i, `${file}: visible H1`);
  }
});

test('homepage is a current engine-supply gateway with form-first actions', () => {
  const html = read('en/index.html');
  assert.match(html, />Send Inquiry<\/a>/);
  assert.match(html, /href="\/en\/contact"[^>]*>Send Inquiry<\/a>/);
  assert.match(html, /href="\/en\/products"[^>]*>View Products<\/a>/);
  assert.match(html, /Cargo-Tricycle Engines/);
  assert.match(html, /ATV \/ Off-Road Engines/);
  assert.doesNotMatch(html, /<h3>Motorcycles<\/h3>/);
  assert.doesNotMatch(html, /series=motorcycles/i);
  assert.doesNotMatch(html, /CKD\/SKD|In Preparation/i);
  assert.match(html, /Industry experience since 2003[\s\S]*8,000\+ engines monthly[\s\S]*50\+ countries[\s\S]*ISO 9001/i);
  assert.match(html, /href="\/en\/about"[^>]*>About Our Factory<\/a>/);
  assert.match(html, /href="\/en\/products"[^>]*>Explore Engine Programs<\/a>/);
});

test('About is the detailed company fact owner', () => {
  const html = read('en/about.html');
  const body = html.slice(html.indexOf('<body'));
  for (const pattern of [
    /Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\./,
    /industry experience since 2003/i,
    /registered in 2007/i,
    /Hangu Town/i,
    /15,000 m/i,
    /8,000\+/,
    /99% first-pass yield/i,
    /50\+ (?:export )?countries/i,
    /ISO 9001 quality management system certified/i,
    /CCC-certified products are available/i
  ]) assert.match(html, pattern, String(pattern));
  assert.match(body.replace(/\s+/g, ' '), /No\. 1-2, Building 7, No\. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China/);
  assert.doesNotMatch(body, /product-detail\?series=tricycles/i);
});

test('Products separates current supply from the future vehicle program', () => {
  const html = read('en/products.html');
  assert.match(html, /Motorcycles &amp; CKD\/SKD Kits/);
  const future = futureCard(html);
  assert.match(future, /In Preparation/);
  assert.match(future, /This product program is in preparation\. Specifications and wholesale availability will be published after production approval\./);
  assert.doesNotMatch(future, /Get Quote|Request Quote|MOQ|US\$|\$\d|three months|3 months/i);
  assert.doesNotMatch(html, /<h3>Tricycles<\/h3>/);
  assert.doesNotMatch(html, /Complete Tricycle|complete-vehicle/i);
  assert.match(html, /cargo-tricycle engine/i);
  assert.doesNotMatch(html, /product-detail\?series=(?:horizontal|cg-air|cb-offroad|parts|tricycles)(?=["&#])/i);
  for (const owner of ['horizontal-engine', 'cg-engine', 'cb-engine', 'engine-parts']) {
    assert.match(html, new RegExp(`href="/en/${owner}"`), owner);
  }
});

test('structured data uses one stable company identity and no invented product commerce data', () => {
  const home = read('en/index.html');
  const about = read('en/about.html');
  const products = read('en/products.html');

  assert.equal((home.match(/"@type"\s*:\s*"Organization"/g) || []).length, 1);
  assert.match(home, /"@id"\s*:\s*"https:\/\/chixiangmotor\.com\/#organization"/);
  assert.match(home, /"name"\s*:\s*"CHIXIANG MOTOR"/);
  assert.match(home, /"legalName"\s*:\s*"Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\."/);
  assert.match(about, /"@id"\s*:\s*"https:\/\/chixiangmotor\.com\/#organization"/);
  assert.match(about, /"name"\s*:\s*"CHIXIANG MOTOR"/);
  assert.match(products, /"@type"\s*:\s*"CollectionPage"/);
  assert.match(products, /"@type"\s*:\s*"ItemList"/);

  for (const file of ['en/index.html', 'en/about.html', 'en/products.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /"@type"\s*:\s*"(?:Offer|Review|AggregateRating)"/, file);
  }

  const future = futureCard(products);
  assert.doesNotMatch(future, /application\/ld\+json|schema\.org|itemprop/i);
});

test('English owner pages retain the existing analytics tags', () => {
  for (const file of ['en/index.html', 'en/about.html', 'en/products.html']) {
    const html = read(file);
    assert.match(html, /AW-16777656395/, `${file}: Google Ads`);
    assert.match(html, /mc\.yandex\.ru\/metrika\/tag\.js/, `${file}: Yandex Metrica`);
    assert.match(html, /ym\(109483511,\s*"init"/, `${file}: Yandex counter`);
  }
});

test('active company governance excludes Made-in-China as evidence', () => {
  for (const file of [
    'docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv',
    'docs/geo-entity/GEO_ENTITY_MATRIX.csv'
  ]) {
    assert.doesNotMatch(
      read(file),
      /made-in-china|excluded third-party profile|supplier profile|third-party profile/i,
      `${file}: excluded third-party values must not remain in active governance`
    );
  }
  assert.match(
    read('docs/geo-entity/GEO_ENTITY_AUDIT.md'),
    /Made-in-China profile is excluded and is not evidence/i
  );

  const facts = read('docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv');
  assert.match(facts, /"product-current-supply-scope"[\s\S]*"APPROVED_PUBLIC"/);
  assert.match(facts, /"roadmap-motorcycle-ckd-skd"[\s\S]*"APPROVED_PUBLIC"/);

  const matrix = read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv');
  for (const page of ['en-home', 'en-about', 'en-products']) {
    assert.match(matrix, new RegExp(`^${page},.*english owner contract`, 'm'), `${page}: traceable change row`);
  }
});
