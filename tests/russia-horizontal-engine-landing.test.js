const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'ru', 'gorizontalnyj-dvigatel.html');
const cssPath = path.join(root, 'css', 'russia-horizontal-landing.css');
const scriptPath = path.join(root, 'js', 'russia-horizontal-landing.js');
const html = fs.readFileSync(pagePath, 'utf8');

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
  assert.match(html, /MOQ 50 шт\./);
  assert.match(html, /Смешанные модели/);
  assert.match(html, /Только оптовые поставки и OEM\/ODM/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.chixiangmotor\.com\/ru\/gorizontalnyj-dvigatel">/);
  assert.doesNotMatch(html, /15\s*[–-]\s*25\s*(?:дн|дней)/i);
});

test('uses a minimal landing header and qualified contact actions', () => {
  const header = html.match(/<header class="rh-header"[\s\S]*?<\/header>/);
  assert.ok(header, 'missing minimal landing header');
  assert.match(header[0], /CHIXIANG MOTOR/);
  assert.match(header[0], /wa\.me\/8619008225410/);
  assert.match(header[0], /href="#quote"/);
  assert.doesNotMatch(header[0], /Products|News|About Us|lang-switcher/);
  assert.match(header[0], /class="rh-brand-mark"/);
  assert.doesNotMatch(header[0], /images\/logo\.webp/);
  assert.doesNotMatch(html, /images\/logo\.webp/);

  const hero = html.match(/<section class="rh-hero"[\s\S]*?<\/section>/);
  assert.ok(hero, 'missing hero section');
  assert.match(hero[0], /data-whatsapp-model="Горизонтальные двигатели"/);
  assert.match(hero[0], /WeChat/);
});

test('keeps Google Ads and the current Yandex Russia tag', () => {
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js\?id=AW-16777656395/g) || []).length, 1);
  assert.match(html, /gtag\('config', 'AW-16777656395'\)/);
  assert.equal((html.match(/\.\.\/js\/yandex-metrica\.js/g) || []).length, 1);
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
  assert.doesNotMatch(html, /Доставка в Россию 15/i);
  assert.doesNotMatch(html, /Посредник/);
});

test('embeds a qualified same-page inquiry form', () => {
  assert.match(html, /class="[^"]*contact-form/);
  assert.match(html, /action="\/api\/contact"/);

  for (const field of ['name', 'company', 'contact', 'quantity', 'freight_forwarder']) {
    assert.match(getRequiredElement(field), /\brequired\b/);
  }

  const product = getRequiredElement('product');
  assert.match(product, /type="hidden"/);
  assert.match(html, /name="source_form" value="russia_horizontal_engine_landing"/);
  assert.match(html, /name="website"/);
  assert.match(html, /data-model-checkbox/);
  assert.match(html, /data-model-error/);

  const quantity = getRequiredElement('quantity');
  assert.doesNotMatch(quantity, /\bmin=/);
});

test('keeps WeChat supplementary rather than in the header or sticky bar', () => {
  const header = html.match(/<header class="rh-header"[\s\S]*?<\/header>/);
  const sticky = html.match(/<div class="rh-mobile-actions"[\s\S]*?<\/div>/);
  assert.ok(header);
  assert.ok(sticky);
  assert.doesNotMatch(header[0], /WeChat/);
  assert.doesNotMatch(sticky[0], /WeChat/);
  assert.match(sticky[0], /WhatsApp/);
  assert.match(sticky[0], /href="#quote"/);
});

test('qualifies every direct WhatsApp entry point with wholesale context', () => {
  const links = [...html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/8619008225410"[^>]*>/g)];
  assert.ok(links.length >= 4);
  for (const link of links) {
    assert.match(link[0], /data-whatsapp-model="Горизонтальные двигатели"/);
  }
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
  assert.match(css, /@media\s*\(max-width:\s*899px\)/);
  assert.match(css, /@media\s*\(max-width:\s*639px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(css, /\.rh-hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.rh-header\s*\{[^}]*color:\s*var\(--rh-white\)/);
  assert.match(css, /:focus-visible/);
});
