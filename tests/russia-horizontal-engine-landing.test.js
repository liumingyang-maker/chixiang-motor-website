const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'ru', 'gorizontalnyj-dvigatel.html');
const cssPath = path.join(root, 'css', 'russia-horizontal-landing.css');
const scriptPath = path.join(root, 'js', 'russia-horizontal-landing.js');
const html = fs.readFileSync(pagePath, 'utf8');
const visibleText = html
  .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/&(?:ndash|mdash|minus|#0*(?:8211|8212|8722)|#x0*(?:2013|2014|2212));/gi, '–')
  .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, ' ')
  .replace(/<\/(?:p|li|h[1-6]|div|section|article|ul|ol|header|footer|main|nav|aside|form|fieldset|legend|table|thead|tbody|tfoot|tr|td|th|dl|dt|dd|figure|figcaption)>/gi, '. ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ');
const trialOrderTier =
  /(?:пробн[а-яё-]*|заказ[а-яё-]*|парт[а-яё-]*|шт\.?|двигател[а-яё-]*|единиц[а-яё-]*)\s*[^.]{0,80}10\s*[–—-]\s*30|10\s*[–—-]\s*30\s*[^.]{0,80}(?:пробн[а-яё-]*|заказ[а-яё-]*|парт[а-яё-]*|шт\.?|двигател[а-яё-]*|единиц[а-яё-]*)/i;

function getAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`\\s${escapedName}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(expression);
  return match ? match[2] : null;
}

function getRequiredElement(name) {
  const expression = new RegExp(`<[^>]+name="${name}"[^>]*>`, 'i');
  const match = html.match(expression);
  assert.ok(match, `missing ${name} field`);
  return match[0];
}

test('publishes the approved Russian B2B hero and SEO contract', () => {
  assert.match(html, /<html lang="ru">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Горизонтальные двигатели оптом с завода/);
  assert.match(html, /От \$99 за единицу/);
  assert.match(html, /MOQ 40 шт\./);
  assert.match(html, /Смешанные модели/);
  assert.match(html, /Только оптовые поставки и OEM\/ODM/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.chixiangmotor\.com\/ru\/gorizontalnyj-dvigatel">/);
  assert.doesNotMatch(html, /MOQ 50 шт\./);
  assert.doesNotMatch(html, /15\s*[–-]\s*25\s*(?:дн|дней)/i);
});

test('uses a brand-and-form-only header and form-first hero actions', () => {
  const header = html.match(/<header class="rh-header"[\s\S]*?<\/header>/);
  assert.ok(header, 'missing minimal landing header');
  assert.match(header[0], /CHIXIANG MOTOR/);
  const headerLinks = [...header[0].matchAll(/<a\b[\s\S]*?<\/a>/g)];
  assert.equal(headerLinks.length, 2);
  assert.equal(getAttribute(headerLinks[0][0], 'href'), '/ru/');
  assert.equal(getAttribute(headerLinks[1][0], 'href'), '#quote');
  assert.doesNotMatch(header[0], /wa\.me|WhatsApp|WeChat|mailto:|Email/i);
  assert.doesNotMatch(header[0], /Products|News|About Us|lang-switcher/);
  assert.match(header[0], /class="rh-brand-mark"/);
  assert.doesNotMatch(header[0], /images\/logo\.webp/);
  assert.doesNotMatch(html, /images\/logo\.webp/);

  const hero = html.match(/<section class="rh-hero"[\s\S]*?<\/section>/);
  assert.ok(hero, 'missing hero section');
  const heroActions = hero[0].match(/<div class="rh-hero-actions"[\s\S]*?<\/div>/);
  assert.ok(heroActions, 'missing hero actions');
  const heroLinks = [...heroActions[0].matchAll(/<a\b[\s\S]*?<\/a>/g)];
  assert.equal(heroLinks.length, 2);
  assert.match(heroLinks[0][0], /class="[^"]*\brh-button-primary\b[^"]*"/);
  assert.equal(getAttribute(heroLinks[0][0], 'href'), '#quote');
  assert.match(heroLinks[0][0], /data-source-cta="hero_inquiry"/);
  assert.equal(
    getAttribute(heroLinks[1][0], 'href'),
    'mailto:chixiangmotor@163.com'
  );
  assert.doesNotMatch(hero[0], /wa\.me|WhatsApp|WeChat|data-whatsapp-model/i);
  assert.doesNotMatch(hero[0], /Образц|от 3 двигател/i);
});

test('publishes the standard-order and qualified sample policies in their approved locations', () => {
  const hero = html.match(/<section class="rh-hero"[\s\S]*?<\/section>/);
  const procurement = html.match(/<section class="rh-procurement"[\s\S]*?<\/section>/);
  const quote = html.match(/<section class="rh-section rh-quote"[\s\S]*?<\/section>/);
  assert.ok(hero, 'missing hero section');
  assert.ok(procurement, 'missing procurement strip');
  assert.ok(quote, 'missing inquiry section');

  assert.match(hero[0], /MOQ 40 шт\./);
  assert.match(hero[0], /Смешанные модели/);
  assert.match(procurement[0], /MOQ 40 шт\./);
  assert.match(procurement[0], /Смешанные модели/);
  assert.doesNotMatch(hero[0], /Образц|от 3 двигател/i);
  assert.match(
    quote[0],
    /Образцы\s*[—–-]\s*от 3 двигателей,\s*только для компаний и профессиональных закупщиков\./i
  );
  assert.match(
    quote[0],
    /Серийный заказ\s*[—–-]\s*от 40 двигателей в общей партии;\s*можно смешивать модели\./i
  );
  assert.doesNotMatch(visibleText, trialOrderTier);
});

test('keeps Google Ads and the current Yandex Russia tag', () => {
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js\?id=AW-16777656395/g) || []).length, 1);
  assert.match(html, /gtag\('config', 'AW-16777656395'\)/);
  assert.equal((html.match(/\.\.\/js\/yandex-metrica\.js/g) || []).length, 1);
  assert.match(html, /<body class="rh-page" data-market="Russia">/);
  assert.doesNotMatch(html, /109483511/);
});

test('keeps the product range without presenting 99 dollars as every model price', () => {
  for (const value of ['152FMH', '153FMI', '154FMI', '1P56FMJ']) {
    assert.match(html, new RegExp(value));
  }

  const cards = [...html.matchAll(/<article class="rh-product-card"[\s\S]*?<\/article>/g)];
  assert.equal(cards.length, 4);
  for (const card of cards) {
    assert.doesNotMatch(card[0], /\$99/);
    assert.match(card[0], /data-quote-model=/);
  }

  const card154 = cards.find(card => card[0].includes('data-product-card="154FMI"'));
  assert.ok(card154);
  assert.match(card154[0], /%E5%8D%A7%E5%BC%8F%E7%94%B5%E5%90%AF%E5%8A%A8/);
  assert.doesNotMatch(card154[0], /ChatGPT%20Image%202026%E5%B9%B45%E6%9C%8830%E6%97%A5%2010_02_56/);
});

test('retains kick-start, reverse and distinct starter configurations', () => {
  assert.match(html, /class="rh-variant-grid"/);
  assert.match(html, /125 cc с кикстартером/);
  assert.match(html, /140 cc с кикстартером/);
  assert.match(html, /110 \/ 125 \/ 140 cc с реверсом/);
  assert.match(html, /Верхний стартер/);
  assert.match(html, /Нижний стартер/);
  assert.match(html, /%E8%84%9A%E5%90%AF%E5%8A%A8%E5%8F%91%E5%8A%A8%E6%9C%BA\/125\.webp/);
  assert.match(html, /%E8%84%9A%E5%90%AF%E5%8A%A8%E5%8F%91%E5%8A%A8%E6%9C%BA\/140\.webp/);
  assert.match(html, /%E5%86%85%E7%BD%AE%E5%80%92%E6%8C%A1/);
});

test('publishes desktop and mobile comparison formats', () => {
  assert.match(html, /class="rh-compare-table"/);
  assert.match(html, /class="rh-mobile-compare"/);
  for (const value of ['110 cc', '125 cc', '140 cc']) {
    assert.match(html, new RegExp(value));
  }
});

test('uses the approved public factory and delivery facts', () => {
  for (const value of ['2003', '15 000', '8 000', '50\\+', 'ISO 9001']) {
    assert.match(html, new RegExp(value));
  }
  assert.match(html, /перевозчик|экспедитор/i);
  assert.match(html, /склад|адрес/i);
  assert.match(html, /factory-showcase\/certification-2\.webp/);
  assert.doesNotMatch(html, /factory-showcase\/certification\.webp/);
  assert.doesNotMatch(html, /Доставка в Россию 15/i);
  assert.doesNotMatch(html, /Посредник/);
});

test('embeds a qualified same-page inquiry form', () => {
  assert.match(html, /class="[^"]*contact-form/);
  assert.match(html, /action="\/api\/contact"/);
  const form = html.match(/<form\b[^>]*class="rh-inquiry-form"[^>]*>/);
  assert.ok(form, 'missing inquiry form');
  assert.match(form[0], /data-whatsapp-fallback="false"/);
  assert.match(
    form[0],
    /data-message-fallback="[^"]*chixiangmotor@163\.com[^"]*"/
  );

  for (const field of ['name', 'company', 'contact', 'quantity', 'freight_forwarder']) {
    assert.match(getRequiredElement(field), /\brequired\b/);
  }

  const product = getRequiredElement('product');
  assert.match(product, /type="hidden"/);
  assert.match(html, /name="source_form" value="russia_horizontal_engine_landing"/);
  assert.match(html, /name="application" value=""/);
  for (const field of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid']) {
    assert.match(html, new RegExp(`name="${field}" value=""`));
  }
  for (const source of ['header_inquiry', 'hero_inquiry', 'logistics_inquiry', 'sticky_inquiry']) {
    assert.match(html, new RegExp(`data-source-cta="${source}"`));
  }
  assert.match(html, /name="website"/);
  assert.match(html, /data-model-checkbox/);
  assert.match(html, /data-model-error/);

  const quantity = getRequiredElement('quantity');
  assert.doesNotMatch(quantity, /\bmin=/);
  const quantityLabel = html.match(
    /<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?\bname="quantity"(?:(?!<\/label>)[\s\S])*?<\/label>/i
  );
  assert.ok(quantityLabel, 'missing quantity label');
  const quantityHelper = quantityLabel[0].match(/<small\b[^>]*>([\s\S]*?)<\/small>/i);
  assert.ok(quantityHelper, 'missing quantity helper');
  assert.equal(
    quantityHelper[1].trim(),
    'Серийный заказ — от 40 шт.; поле используется для оценки запроса.'
  );
  assert.doesNotMatch(quantityHelper[1], /\bMOQ\s*40\b/i);
});

test('orders the mobile actions as inquiry then Email without messenger links', () => {
  const sticky = html.match(/<div class="rh-mobile-actions"[\s\S]*?<\/div>/);
  assert.ok(sticky, 'missing mobile action bar');
  const links = [...sticky[0].matchAll(/<a\b[\s\S]*?<\/a>/g)];
  assert.equal(links.length, 2);
  assert.equal(getAttribute(links[0][0], 'href'), '#quote');
  assert.match(links[0][0], /data-source-cta="sticky_inquiry"/);
  assert.equal(
    getAttribute(links[1][0], 'href'),
    'mailto:chixiangmotor@163.com'
  );
  assert.doesNotMatch(sticky[0], /wa\.me|WhatsApp|WeChat/i);
});

test('orders direct contacts as Email, WeChat, then one supplemental WhatsApp link', () => {
  const contacts = html.match(
    /<div class="rh-direct-contacts"[\s\S]*?(?=<div class="rh-form-card)/
  );
  assert.ok(contacts, 'missing direct contacts');
  const emailIndex = contacts[0].indexOf('<span>Email</span>');
  const wechatIndex = contacts[0].indexOf('<span>WeChat</span>');
  const whatsappIndex = contacts[0].indexOf('<span>WhatsApp</span>');
  assert.ok(emailIndex > -1, 'missing direct Email contact');
  assert.ok(wechatIndex > emailIndex, 'WeChat must follow Email');
  assert.ok(whatsappIndex > wechatIndex, 'WhatsApp must follow WeChat');

  const contactLinks = [...contacts[0].matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
    .map(match => match[0]);
  const emailLink = contactLinks.find(link => /<span>Email<\/span>/i.test(link));
  assert.ok(emailLink, 'missing direct Email link');
  assert.equal(getAttribute(emailLink, 'href'), 'mailto:chixiangmotor@163.com');
  assert.match(
    contacts[0],
    /<span>WeChat<\/span>[\s\S]*?<strong>19008225410<\/strong>/i
  );

  const contactWhatsAppLinks = contactLinks.filter(link => {
    const href = getAttribute(link, 'href');
    return href && /wa\.me|WhatsApp/i.test(href);
  });
  assert.equal(contactWhatsAppLinks.length, 1);
  const supplementalWhatsApp = contactWhatsAppLinks[0];
  const supplementalWhatsAppHref = getAttribute(supplementalWhatsApp, 'href');
  assert.match(
    supplementalWhatsAppHref,
    /^https:\/\/wa\.me\/8619008225410(?:\?[^\s]*)?$/i
  );
  assert.match(supplementalWhatsApp, /class="[^"]*\brh-contact-supplemental\b[^"]*"/);
  assert.match(supplementalWhatsApp, /data-whatsapp-model="Горизонтальные двигатели"/);

  const pageLinks = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
    .map(match => match[0]);
  const pageWhatsAppLinks = pageLinks.filter(link => {
    const href = getAttribute(link, 'href');
    return href && /wa\.me|WhatsApp/i.test(href);
  });
  assert.equal(pageWhatsAppLinks.length, 1);
  assert.equal(pageWhatsAppLinks[0], supplementalWhatsApp);
});

test('references only existing local assets', () => {
  for (const match of html.matchAll(/(?:src|href)="(\.\.\/(?:images|css|js)\/[^"]+)"/g)) {
    const relative = decodeURIComponent(
      match[1].replace(/^\.\.\//, '').replace(/[?#].*$/, '')
    );
    assert.ok(fs.existsSync(path.join(root, relative)), `missing ${relative}`);
  }
});

test('defines page-scoped responsive and accessible presentation', () => {
  assert.ok(fs.existsSync(cssPath), 'missing page stylesheet');
  assert.ok(fs.existsSync(scriptPath), 'missing page interaction script');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.rh-page/);
  assert.match(css, /russia-horizontal-hero-desktop\.webp/);
  assert.match(css, /russia-horizontal-hero-mobile\.webp/);
  assert.match(css, /@media\s*\(orientation:\s*portrait\)/);
  assert.match(css, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-width:\s*899px\)/);
  assert.match(css, /@media\s*\(max-width:\s*899px\)/);
  assert.match(css, /@media\s*\(max-width:\s*639px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(css, /\.rh-hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.rh-header\s*\{[^}]*color:\s*var\(--rh-white\)/);
  assert.match(css, /\.rh-procurement-grid span\s*\{[^}]*color:\s*var\(--rh-white\)/);
  assert.match(css, /\.rh-logistics \.rh-kicker\s*\{[^}]*color:\s*var\(--rh-white\)/);
  assert.match(css, /\.rh-logistics p:last-child\s*\{[^}]*color:\s*var\(--rh-white\)/);
  assert.match(css, /::placeholder\s*\{[^}]*color:\s*var\(--rh-muted\)/);
  assert.match(css, /padding-bottom:\s*calc\(68px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.rh-header-quote\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.rh-button-primary\s*\{/);
  assert.match(css, /\.rh-contact-supplemental\s*\{/);
  assert.doesNotMatch(css, /\.rh-header-whatsapp\b/);
  assert.doesNotMatch(css, /\.rh-button-whatsapp\b/);
  assert.match(css, /:focus-visible/);
});
