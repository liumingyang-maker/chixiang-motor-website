const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadManifest } = require('../scripts/site-entity-manifest.js');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const PAGE = 'ads/algerie/index.html';
const CSS = 'css/algeria-landing.css';
const SCRIPT = 'js/algeria-landing.js';
const page = read(PAGE);
const css = read(CSS);
const script = read(SCRIPT);

// Field names accepted by workers/contact-api/src/contact-handler.mjs normalizeInquiry().
const BACKEND_FIELDS = [
  'name', 'contact', 'email', 'country', 'company', 'product_interest', 'product', 'message',
  'page_url', 'site_language', 'market', 'source_form', 'application', 'displacement',
  'quantity', 'vehicle', 'engine_code', 'requirements', 'source_cta', 'utm_source',
  'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid',
  'website', 'cf-turnstile-response', 'turnstile_token', '_subject'
];

function formBlock() {
  const match = page.match(/<form\b[\s\S]*?<\/form>/i);
  assert.ok(match, 'the landing page must contain a form');
  return match[0];
}

// Boot the landing script with a minimal DOM so its helpers can be executed.
function boot(search, form) {
  const listeners = new Map();
  const document = {
    readyState: 'loading',
    body: { classList: { toggle() {} } },
    documentElement: { lang: 'fr', scrollHeight: 4000 },
    addEventListener(type, handler) {
      const list = listeners.get(type) || [];
      list.push(handler);
      listeners.set(type, list);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById(id) { return form && form.ids[id] ? form.ids[id] : null; },
    createElement() { return { type: '', name: '', value: '' }; },
    head: { appendChild() {} }
  };
  const window = {
    location: { search: search || '', href: 'https://chixiangmotor.com/ads/algerie/' + (search || '') },
    addEventListener() {},
    innerHeight: 844,
    URLSearchParams,
    IntersectionObserver: undefined,
    matchMedia() { return { matches: false }; }
  };
  vm.runInNewContext(script, { window, document, URLSearchParams, console, Date, RegExp, Array, Object, String, Number, encodeURIComponent, decodeURIComponent });
  return window.ChixiangAlgeria;
}

test('the Algeria landing page exists at the paid-path document root', () => {
  assert.ok(fs.existsSync(path.join(root, PAGE)), 'ads/algerie/index.html must exist');
  assert.ok(fs.existsSync(path.join(root, CSS)), 'the page needs its own stylesheet');
  assert.ok(fs.existsSync(path.join(root, SCRIPT)), 'the page needs its own behaviour script');
});

test('page language is French and the document is a noindex follow test page', () => {
  assert.match(page, /<html lang="fr">/);
  assert.match(page, /<meta name="robots" content="noindex,follow">/);
  assert.equal((page.match(/name="robots"/g) || []).length, 1, 'exactly one robots directive');
  assert.ok(!/hreflang/.test(page), 'a single-language paid page must not publish hreflang');
});

test('the paid page stays outside the SEO Foundation contract', () => {
  assert.ok(!/ads\/algerie/.test(read('sitemap.xml')), 'sitemap.xml must not list the paid page');
  assert.ok(!/algerie/i.test(read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv')), 'matrix must not gain a paid-page row');
  assert.ok(!/ads/.test(read('robots.txt')), 'robots.txt must stay open so noindex can be read');
  const manifest = loadManifest(root);
  assert.ok(manifest.every((entry) => !/ads/.test(entry.pathname)), 'manifest must not classify the paid page');
  assert.equal(manifest.length, 52, 'the governed 52-page sitemap set is unchanged');
});

test('no organic page links to the paid page yet', () => {
  const offenders = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name.startsWith('_gpt_review_bundle')) continue;
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) { walk(rel); continue; }
      if (!entry.name.endsWith('.html') || rel === PAGE) continue;
      if (read(rel).includes('/ads/algerie')) offenders.push(rel);
    }
  })('.');
  assert.deepEqual(offenders, [], 'the paid page is entered from ads only, not from the organic site');
});

test('one H1 and the frozen hero copy carry real French accents', () => {
  assert.equal((page.match(/<h1\b/gi) || []).length, 1, 'exactly one visible H1');
  const h1 = (page.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const h1Text = h1.trim().replace(/\u2019/g, String.fromCharCode(39));
  assert.equal(h1Text, 'Moteurs CG et CB en gros pour l' + String.fromCharCode(39) + 'Alg\u00e9rie');
  assert.ok(page.includes('s\u00e9ries CG, CB, moteurs horizontaux et pi\u00e8ces de moteur.'));
  assert.ok(page.includes('Confirmez le mod\u00e8le, la cylindr\u00e9e et la quantit\u00e9 pour recevoir une offre adapt\u00e9e au projet.'));
  assert.ok(page.includes('La quantit\u00e9, la configuration et les conditions sont confirm\u00e9es selon le mod\u00e8le et le projet.'));
  assert.ok(page.includes('Demander un devis'));
  assert.ok(page.includes('Wilaya / Ville'));
  assert.ok(page.includes('Cylindr\u00e9e nominale'));
  assert.ok(page.includes('Quelles marques ou familles de moteurs vendez-vous actuellement ?'));
  assert.ok(!page.includes('\uFFFD'), 'no replacement characters');
  assert.ok(!/Qu\?|r\?pond|soci\?t\?|cylindr\?e/i.test(page), 'accents were not flattened into question marks');
});

test('the approved commercial boundary is stated instead of MOQ or SLA', () => {
  assert.ok(page.includes('La quantit\u00e9, la configuration et les conditions sont confirm\u00e9es selon le mod\u00e8le et le projet.'));
  assert.doesNotMatch(page, /24\s*(heures|hours|horas)/i, 'no 24-hour reply promise');
  assert.doesNotMatch(page, /r\u00e9ponse en \d+\s*(heures|jours)/i, 'no response-time promise');
  assert.doesNotMatch(page, /MOQ|quantit\u00e9 minimum de \d+|\u00e0 partir de \d+ moteurs|devis gratuit/i, 'no MOQ or sample threshold');
  assert.doesNotMatch(page, /livraison en \d+|exp\u00e9di\u00e9 en \d+|\d+\s*jours de livraison/i, 'no lead time');
  assert.doesNotMatch(page, /en stock|stock disponible|disponibilit\u00e9 imm\u00e9diate/i, 'no stock claim');
  assert.doesNotMatch(page, /meilleur prix|prix le plus bas|lowest price|USD|\u20ac|1 ?\u20ac/i, 'no price promise');
});

test('approved product facts are published and unapproved ones are absent', () => {
  for (const fact of ['CG125', 'CG150', 'CG175', 'CG200', 'CG250', 'CG150SB', 'CG175SB', 'CG200SB', 'CG250SB',
    'CB150', 'CB200-C', 'CB250', 'CX152FMH', 'CX153FMI', 'CX154FMI', 'CX1P56FMJ', 'CX1P60FMJ']) {
    assert.ok(page.includes(fact), 'missing approved model: ' + fact);
  }
  assert.ok(!/CG150B\b/.test(page), 'CG150B is a rejected data-entry error');
  assert.match(page, /110 \/ 125 \/ 125 \/ 140 \/ 150/, 'horizontal nominal classes are published as nominal only');
  assert.doesNotMatch(page, /50\s?cc|50\u2013125|50 \u00e0 125/i, 'no 50cc horizontal range');
  assert.doesNotMatch(page, /couple (fort|\u00e9lev\u00e9)|vibration (faible|riduite)|strong torque|low vibration|puissance maximale|vitesse maximale|\d+\s*(kW|ch|Nm)\b/i, 'no unapproved performance claim');
  assert.doesNotMatch(page, /OHV|OHC|varillas|pushrod|arbre \u00e0 cames/i, 'no valve-train comparison');
  assert.doesNotMatch(page, /chevaux|d\u00e9bit maximal/i, 'no invented performance numbers');
});

test('no universal-fit and no Indian-platform compatibility claim', () => {
  assert.match(page, /Sans ces \u00e9l\u00e9ments, aucune compatibilit\u00e9 ne peut \u00eatre annonc\u00e9e\./,
    'the page must keep an explicit no-compatibility-without-evidence statement');
  assert.doesNotMatch(page, /compatibilit\u00e9 universelle (?:est|garantie)|convient \u00e0 tous|compatible avec tous|fit universel/i,
    'no affirmative universal-fit claim');
  assert.doesNotMatch(page, /Bajaj|TVS|Boxer|Apache|Keeway|Piaggio/i, 'no Indian-platform compatibility framing');
  assert.ok(page.includes('Indiquez la plateforme, le code moteur et les photos de fixation'),
    'platform buyers are asked for details instead of being excluded');
});

test('certification stays text-only and inside approved wording', () => {
  assert.ok(page.includes('Syst\u00e8me de management de la qualit\u00e9 certifi\u00e9 ISO 9001.'));
  assert.ok(page.includes('Des produits certifi\u00e9s CCC sont disponibles.'));
  assert.doesNotMatch(page, /certificat[ -]?\d|num\u00e9ro de certificat|ISO 9001[ :\-]?\d{3,4}/i, 'no certificate number or version');
  assert.doesNotMatch(page, /tous les mod\u00e8les sont certifi|entirement certifi/i, 'CCC is not generalised to all models');
  assert.doesNotMatch(page, /images\/[^"]*certification/i, 'no certificate image on this page');
  assert.doesNotMatch(page, /produit fini|scooter \u00e9lectrique/i, 'no unapproved supply scope');
});

test('every local asset referenced by the page exists on disk', () => {
  const refs = [...new Set([...page.matchAll(/(?:src|href)="(\/(?:images|css|js)\/[^"?]+)/g)].map((m) => m[1]))];
  assert.ok(refs.length >= 12, 'expected the page to reference its local assets');
  for (const ref of refs) {
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(ref))), 'missing asset: ' + ref);
  }
  assert.ok(!page.includes('CB/3.webp') && !page.includes('CB/4.webp') && !page.includes('CB/5.webp'),
    'the known-missing CB gallery files must not be referenced');
  assert.doesNotMatch(page, /ChatGPT|russia-horizontal-hero|uzbekistan-cg-hero|\/\u843d\u5730\u9875/i,
    'AI-generated Russia landing artwork must not be reused as proof');
});

test('hero images respect the documented performance budget', () => {
  const heroStage = page.match(/data-hero-stage[\s\S]*?(?=<\/section>)/) || [];
  const heroRefs = [...new Set([...(heroStage[0] || '').matchAll(/src="([^"]+)"/g)].map((m) => m[1]))].map(decodeURIComponent);
  assert.equal(heroRefs.length, 3, 'three engine tiles above the fold');
  let total = 0;
  for (const ref of heroRefs) {
    const size = fs.statSync(path.join(root, '.' + ref)).size;
    assert.ok(size <= 250000, ref + ' must stay within the 250 KB single-image budget');
    total += size;
  }
  assert.ok(total <= 300000, 'above-the-fold product images must stay within 300 KB, got ' + total);
  assert.equal((page.match(/fetchpriority="high"/g) || []).length, 1, 'exactly one prioritised hero resource');
  assert.equal((page.match(/<img\b[^>]*>/g) || []).filter((tag) => !/width="/.test(tag) || !/height="/.test(tag)).length, 0,
    'every image reserves its dimensions');
  assert.equal((page.match(/<img\b[^>]*alt=""/g) || []).length, 0, 'content images are described, not empty');
});

test('the form reuses the existing Worker contract without new field names', () => {
  assert.match(page, /<div class="contact-form[^"]*">/, 'main.js binds .contact-form form');
  const block = formBlock();
  assert.match(block, /method="POST"/);
  assert.match(block, /action="\/api\/contact"/);
  assert.match(block, /data-whatsapp-fallback="false"/, 'WhatsApp must never open automatically on failure');
  assert.match(block, /name="website"/, 'honeypot');
  assert.match(block, /name="market" value="Algeria"/);
  assert.match(block, /<input type="hidden" name="country" value="Algeria">/,
    'country must stay the stable segmentation value');
  assert.doesNotMatch(block, /name="country"[^>]*type="text"/,
    'country must never be a visitor-editable field');
  assert.match(block, /<label for="wilaya">Wilaya \/ Ville/,
    'the wilaya stays visible to the buyer');
  assert.match(block, /<input id="wilaya" type="text"[^>]*aria-required="true"[^>]*>/,
    'the wilaya control is identified by id only');
  assert.match(block, /name="source_form" value="ads_algerie_fr"/);
  const names = [...block.matchAll(/<(?:input|select|textarea)\b[^>]*name="([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(names)];
  for (const name of unique) {
    assert.ok(BACKEND_FIELDS.includes(name), 'field "' + name + '" is not stored by the Worker');
  }
  for (const required of ['name', 'company', 'contact', 'country', 'product_interest', 'quantity']) {
    assert.ok(unique.includes(required), 'expected submitted field: ' + required);
  }
  assert.ok(!/name="(wilaya|ville|buyer_type|city|platform)"/i.test(block), 'unsupported names must never be submitted');
  assert.match(block, /<select id="dz-buyer-type"[^>]*aria-required="true"/, 'buyer type is collected without a fake field name');
  assert.ok(/<select id="dz-buyer-type"[\s\S]*Importateur[\s\S]*Distributeur[\s\S]*Grossiste[\s\S]*Assembleur[\s\S]*Revendeur/.test(block));
});

test('the optional email is mirrored because contact shadows email in the Worker', () => {
  const api = read('workers/contact-api/src/contact-handler.mjs');
  assert.match(api, /contact: pick\(fields, \['contact', 'email'\]\)/, 'confirmed Worker behaviour');
  const block = formBlock();
  assert.match(block, /name="email"/);
  assert.match(block, /<input type="hidden" name="requirements" value="">/, 'requirements carries the compact mirror line');
  assert.match(script, /push\('Email', value\(form, 'email'\)\)/);
  assert.match(script, /push\('Type acheteur'/);
  assert.match(script, /document\.getElementById\('wilaya'\)/, 'the wilaya is read from the visible control');
  assert.match(script, /push\('Wilaya', wilaya \? wilaya\.value\.trim\(\) : ''\)/, 'and serialised into requirements');
  assert.doesNotMatch(script, /value\(form, 'country'\)/, 'the script never reads or writes country from the visitor');
});

test('ad parameters are captured at page load and re-applied at submit', () => {
  for (const param of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid']) {
    assert.ok(script.includes("'" + param + "'"), 'capture list must include ' + param);
  }
  assert.match(script, /var captured = readParams\(window\.location && window\.location\.search/, 'capture happens at load');
  assert.match(script, /form\.addEventListener\('submit'[\s\S]*applyAdParams\(form\)/, 'and is re-applied at submit');
  assert.match(script, /setHidden\(form, 'source_cta'/);
  assert.ok(!/localStorage|sessionStorage/.test(script), 'no storage layer is introduced');
  const api = boot('?utm_source=google&utm_medium=cpc&utm_campaign=dz_cg&utm_term=moteur+cg&utm_content=asset1&gclid=GCLID123&gbraid=GB1&wbraid=WB1');
  const got = Object.assign({}, api.readParams('?utm_source=google&gclid=X'));
  assert.deepEqual(got, { utm_source: 'google', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '', gclid: 'X', gbraid: '', wbraid: '' });
  assert.equal(api.captured.gclid, 'GCLID123', 'gclid survives into the module state');
  assert.equal(api.captured.utm_term, 'moteur cg', 'plus signs are decoded as spaces');
});

test('WhatsApp keeps the approved number and adds French context', () => {
  const api = boot('');
  const url = api.buildWhatsAppUrl({ product: 'CB', quantity: '50', wilaya: '16 - Alger' });
  assert.ok(url.startsWith('https://wa.me/8619008225410?text='), 'number must stay 8619008225410');
  const message = decodeURIComponent(url.split('?text=')[1]);
  assert.ok(message.includes('Alg\u00e9rie'), 'French prefill with correct accents');
  assert.ok(message.includes('CB'), 'product context is included');
  assert.ok(message.includes('Quantit\u00e9 envisag\u00e9e : 50'));
  assert.ok(message.includes('16 - Alger'));
  assert.doesNotMatch(message, /prix|garantie|livraison en \d/i, 'the prefilled message promises nothing');
  assert.equal((page.match(/https:\/\/wa\.me\/8619008225410/g) || []).length, (page.match(/data-whatsapp-link/g) || []).length,
    'every WhatsApp element uses the approved number');
  const shared = read('js/main.js');
  assert.match(shared, /AW-16777656395\/bovKCKOx088cEMvwmsA-/, 'the shared WhatsApp conversion stays untouched');
});

test('Google Ads behaviour is inherited from main.js only', () => {
  assert.equal((page.match(/googletagmanager\.com\/gtag\/js\?id=AW-16777656395/g) || []).length, 1, 'one base tag');
  assert.equal((page.match(/gtag\('config', 'AW-16777656395'\)/g) || []).length, 1, 'one config call');
  assert.doesNotMatch(page, /send_to|gtag\('event'/, 'the page itself never fires a conversion');
  const shared = read('js/main.js');
  assert.match(shared, /AW-16777656395\/Om_nCMCV4swcEMvwmsA-/, 'form conversion label stays in main.js');
  assert.ok(page.includes('<script src="/js/main.js"></script>'), 'the shared form handler is loaded');
  assert.ok(page.indexOf('/js/main.js') < page.indexOf('/js/algeria-landing.js'), 'the page script runs after main.js');
});

test('the sticky mobile CTA hides over the form and footer', () => {
  const api = boot('');
  const clear = { passedHero: true };
  assert.equal(api.shouldShowMobileCta(clear), true);
  for (const blocked of ['offerVisible', 'footerVisible', 'fieldFocused', 'keyboardOpen', 'nearPageBottom']) {
    assert.equal(api.shouldShowMobileCta(Object.assign({ passedHero: true }, { [blocked]: true })), false, blocked + ' must hide the CTA');
  }
  assert.equal(api.shouldShowMobileCta({ passedHero: false }), false, 'the CTA waits until the hero is passed');
  assert.match(page, /data-mobile-cta[^>]*href="#offre"/, 'the sticky CTA targets the form');
});

test('the stylesheet is self-contained and hides no horizontal overflow', () => {
  assert.match(css, /\.al-page\s*\{/, 'the page ships its own root class');
  assert.doesNotMatch(css.slice(0, css.indexOf('.al-shell')), /overflow-x:\s*hidden/, 'no root overflow mask');
  assert.match(css, /min-height:\s*46px/, 'touch targets are at least 44 px');
  for (const width of ['600px', '900px', '1120px']) assert.ok(css.includes('(min-width: ' + width + ')'), 'missing breakpoint ' + width);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/, 'keyboard focus is visible');
  assert.doesNotMatch(css, /url\([^)]*(?:chatgpt|ChatGPT)/i);
});

test('the page answers the procurement questions in raw HTML', () => {
  for (const id of ['familles', 'comparaison', 'usine', 'offre', 'questions']) {
    assert.ok(page.includes('id="' + id + '"'), 'missing section: ' + id);
  }
  for (const gone of ['acheteurs', 'demarche', 'pieces']) {
    assert.ok(!page.includes('id="' + gone + '"'), 'V2 must drop the section: ' + gone);
  }
  assert.ok((page.match(/<section\b/g) || []).length <= 7, 'V2 must stay short, found ' + (page.match(/<section\b/g) || []).length + ' sections');
  assert.ok(page.includes('Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.'));
  assert.match(page, /[Ee]xp\u00e9rience dans le secteur depuis 2003/, 'industry experience since 2003');
  assert.ok(/soci\u00e9t\u00e9 enregistr\u00e9e en 2007/i.test(page), 'registration year is distinguished from 2003');
  assert.doesNotMatch(page, /fond\u00e9e? en 2003|depuis 2003, notre entreprise a \u00e9t\u00e9 fond\u00e9e/i, 'never claim founded in 2003');
  assert.ok(page.includes('Hangu Town, Jiulongpo District, Chongqing'));
  assert.ok(page.includes('8 000+'));
  assert.ok(page.includes('99 %'));
  assert.ok(page.includes('15 000 m\u00b2'));
  assert.ok(page.includes('100</strong><span>collaborateurs'));
  assert.ok(page.includes('chixiangmotor@163.com'));
  assert.ok((page.match(/<details/g) || []).length >= 5, 'a real FAQ of at least five answers');
  assert.ok(!page.includes('class="al-faq"><div'), 'FAQ answers live in HTML, not in generated markup');
});

test('the wilaya is serialised into requirements while country stays Algeria', () => {
  const named = {
    country: { value: 'Algeria' },
    email: { value: 'buyer@example.com' },
    vehicle: { value: 'CG 200' },
    product_interest: { value: 'CB' },
    quantity: { value: '50' },
    displacement: { value: '150' },
    application: { value: 'Route et tout-chemin' },
    engine_code: { value: 'CX162FMJ' }
  };
  const form = {
    ids: { wilaya: { value: '16 - Alger' }, 'dz-buyer-type': { value: 'Importateur' } },
    querySelector(sel) {
      const m = /\[name="([^"]+)"\]/.exec(sel);
      return m && named[m[1]] ? named[m[1]] : null;
    },
    appendChild() {}
  };
  const line = boot('', form).qualificationLine(form);
  assert.ok(line.startsWith('Wilaya: 16 - Alger'), line);
  assert.ok(line.includes('Type acheteur: Importateur'), line);
  assert.ok(line.includes('Email: buyer@example.com'), line);
  assert.ok(line.includes('Familles vendues: CG 200'), line);
  assert.ok(line.includes('Pays: Algeria'), line);
  assert.equal(named.country.value, 'Algeria', 'the country slot is never repurposed for the wilaya');
});
test('V2 keeps internal prioritisation and fact-governance vocabulary out of customer copy', () => {
  assert.doesNotMatch(page, /Priorit[e\u00e9] [123]/, 'internal priority labels must not be visible to buyers');
  assert.doesNotMatch(page, /donn\u00e9es approuv\u00e9es/, 'fact-governance vocabulary must not be customer copy');
  assert.doesNotMatch(page, /al\u00e9sage et course non publi\u00e9s/, 'unpublished-dimension wording must not be customer copy');
  assert.doesNotMatch(page, /pr\u00e9sent\u00e9e comme sup\u00e9rieure/, 'the comparative-superiority governance sentence is gone');
  assert.doesNotMatch(page, /Aucun d\u00e9lai de livraison, prix ou disponibilit\u00e9/, 'the compliance-memo disclaimer is removed');
  assert.ok(page.includes('\u00c0 confirmer selon le mod\u00e8le'), 'unknowns now use customer language');
  assert.match(page, /aria-label="Comparaison en cartes"/, 'the aria-label typo is corrected');
  assert.doesNotMatch(page, /Comparation/, 'no French typo remains');
});

test('V2 moves technical fields into one optional disclosure without dropping any', () => {
  const block = formBlock();
  const cut = block.indexOf('<details class="al-form-more">');
  assert.ok(cut > 0, 'the optional technical disclosure must exist inside the form');
  const more = block.slice(cut);
  const first = block.slice(0, cut);
  for (const name of ['displacement', 'application', 'vehicle', 'engine_code', 'email', 'message']) {
    assert.ok(more.includes('name="' + name + '"'), 'optional disclosure must still carry ' + name);
  }
  for (const name of ['name', 'company', 'contact', 'product_interest', 'quantity']) {
    assert.ok(first.includes('name="' + name + '"'), 'field must stay in the first visible block: ' + name);
  }
  assert.ok(first.includes('id="wilaya"') && first.includes('id="dz-buyer-type"'),
    'wilaya and buyer type stay in the first visible block');
  assert.doesNotMatch(more, /\brequired\b/, 'a control inside a closed disclosure must never be required');
});

test('V2 product card CTAs still prefill the form using existing option values', () => {
  const block = formBlock();
  const productValues = [...block.matchAll(/<select id="dz-product"[\s\S]*?<\/select>/g)][0][0]
    .split(/\r?\n/).filter((l) => /<option>/.test(l)).map((l) => /<option>([^<]+)<\/option>/.exec(l)[1]);
  const appValues = [...block.matchAll(/<select id="dz-application"[\s\S]*?<\/select>/g)][0][0]
    .split(/\r?\n/).filter((l) => /<option>/.test(l)).map((l) => /<option>([^<]+)<\/option>/.exec(l)[1]);
  const products = [...page.matchAll(/data-select-product="([^"]+)"/g)].map((m) => m[1]);
  const apps = [...page.matchAll(/data-select-application="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(products.length, 5, 'every family card must offer a quote action');
  assert.equal(apps.length, 5, 'every family card must suggest an application');
  for (const value of products) assert.ok(productValues.includes(value), 'unknown product option targeted: ' + value);
  for (const value of apps) assert.ok(appValues.includes(value), 'unknown application option targeted: ' + value);
  assert.ok(products.includes('CG \u00e0 refroidissement par air'), 'CG air must stay selectable from its card');
});

test('V2 header stays one compact row and keeps WhatsApp plus the quote action only', () => {
  assert.match(css, /\.al-header-inner\s*\{[\s\S]*?flex-wrap:\s*nowrap/, 'the header must never wrap into a second row');
  const header = (page.match(/<header[\s\S]*?<\/header>/) || [''])[0];
  assert.ok(header.includes('data-whatsapp-link'), 'WhatsApp must stay in the header');
  assert.ok(header.includes('>Devis<'), 'the header quote CTA uses the short label');
  assert.equal((header.match(/class="al-button/g) || []).length, 2, 'the header holds exactly two actions');
  assert.doesNotMatch(header, /href="#(familles|comparaison|usine|questions)"/, 'no site-like navigation in a paid header');
});

test('V2 removes the nested narrow card layout and keeps the sticky CTA hideable', () => {
  assert.doesNotMatch(css, /minmax\(0,\s*320px\)/, 'no fixed 320px image column may sit inside a card column');
  assert.doesNotMatch(css, /\.al-families/, 'the old two-up card grid is gone');
  assert.match(css, /\.al-mobile-cta\[hidden\]\s*\{\s*display:\s*none/, 'the sticky CTA must still honour its hidden state');
  assert.doesNotMatch(css, /box-shadow:[^;]*\d{2,3}px\s+\d{2,3}px/, 'shadows stay restrained, no heavy elevation stack');
});

test('V2 adds no external dependency and keeps one prioritised hero resource', () => {
  const hosts = [...new Set([...page.matchAll(/(?:src|href)="https?:\/\/([^/"]+)/g)].map((m) => m[1]))];
  const unexpected = hosts.filter((h) => !/googletagmanager\.com|analytics\.google\.com|^wa\.me$|doubleclick\.net/.test(h));
  assert.deepEqual(unexpected, [], 'only the existing Google Ads hosts may be loaded externally: ' + unexpected.join(','));
  assert.doesNotMatch(page, /fonts\.(googleapis|gstatic)|cdn\.jsdelivr|unpkg\.com|bootstrap|tailwind|recaptcha/i,
    'no new font, icon or UI library CDN may be introduced');
  assert.equal((page.match(/fetchpriority="high"/g) || []).length, 1);
  assert.equal((page.match(/<video\b|<iframe\b/g) || []).length, 0, 'no video or iframe player above the fold');
});

test('V2 keeps the FAQ short and puts the platform guidance next to the field', () => {
  const faqBlock = (page.split('<div class="al-faq">')[1] || '').split('</section>')[0];
  assert.ok(faqBlock, 'the FAQ list must exist');
  assert.equal((faqBlock.match(/<details\b/g) || []).length, 5, 'V2 keeps five high-value questions');
  const vehicleField = (page.split('<label for="dz-vehicle">')[1] || '').split('</div>')[0];
  assert.ok(vehicleField.includes('Indiquez la plateforme'), 'the platform guidance sits under the platform field');
  const visibleText = page.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ');
  for (const brand of ['Haojiang', 'Sanya', 'Lifan', 'Touareg']) {
    assert.ok(!visibleText.includes(brand), brand + ' may only appear as a form example, never as page copy');
    assert.ok(new RegExp('placeholder="[^"]*' + brand).test(page), brand + ' should sit inside the qualification placeholder');
  }
  assert.doesNotMatch(page, /compatible[s]? avec (Haojiang|Sanya|Lifan|Touareg)/i, 'no compatibility claim against local platforms');
});
test('the paid page never points at the quarantined Arabic locale', () => {
  assert.doesNotMatch(page, /href="[^"]*\/ar\//, 'no link into the blocked /ar/ pages');
  assert.doesNotMatch(page, /lang="ar"|dir="rtl"/, 'the page stays French and left-to-right');
  assert.ok(page.includes('href="/en/"'), 'the only cross-site link is the approved English home');
});
// Page-scoped guard only. export-country-count stays a governed Fact Pack row; it is simply
// not cleared for customer-facing wording until approved_public_wording is frozen for it.
test('the Algeria page publishes no export-country scale claim', () => {
  const visible = page.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const flat = visible.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const phrase of ["50+ pays", "50 pays", "plus de 50 pays", "exporte dans plus de 50",
    "present dans plus de 50", "50+ marches", "50 marches", "couvre 50"]) {
    assert.ok(!flat.includes(phrase), "customer copy must not claim: " + phrase);
  }
  assert.equal((visible.match(/pays/gi) || []).length, 0, "the word pays must not appear in customer copy at all");
  assert.equal((visible.match(/exportation/gi) || []).length, 0, "no exportation scale wording");
});

test('the four factory metrics are the governed set', () => {
  const stats = (page.match(/<div class="al-stats">[\s\S]*?<\/div>\s*<\/div>/) || [""])[0];
  const visible = stats.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal((stats.match(/<div><strong>/g) || []).length, 4, "exactly four factory metrics");
  for (const fact of ["99 %", "15 000 m\u00b2", "100", "8 000+"]) {
    assert.ok(visible.includes(fact), "missing governed metric: " + fact);
  }
  assert.ok(visible.includes("conformit\u00e9 au premier contr\u00f4le"), "yield label");
  assert.ok(visible.includes("superficie d\u2019usine") || visible.includes("superficie d'usine"), "area label");
  assert.ok(visible.includes("collaborateurs"), "employee label");
  assert.ok(visible.includes("moteurs / mois"), "capacity label");
  assert.ok(!/50/.test(visible), "no country count in the metric block");
});