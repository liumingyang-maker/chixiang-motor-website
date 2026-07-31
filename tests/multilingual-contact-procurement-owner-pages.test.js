const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = [
  { file: 'en/contact.html', path: '/en/contact', lang: 'en', source: 'contact_owner_en', channels: ['email', 'wechat', 'whatsapp', 'phone'] },
  { file: 'es/contacto.html', path: '/es/contacto', lang: 'es', source: 'contact_owner_es', channels: ['email', 'whatsapp', 'wechat', 'phone'] },
  { file: 'pt/contato.html', path: '/pt/contato', lang: 'pt', source: 'contact_owner_pt', channels: ['email', 'whatsapp', 'wechat', 'phone'] },
  { file: 'ru/kontakty.html', path: '/ru/kontakty', lang: 'ru', source: 'contact_owner_ru', channels: ['email', 'wechat', 'whatsapp', 'phone'] },
  { file: 'ar/contact.html', path: '/ar/contact', lang: 'ar', source: 'contact_owner_ar', channels: ['email', 'whatsapp', 'wechat', 'phone'] }
];
const requiredFields = ['name', 'company', 'contact', 'country', 'product_interest', 'quantity', 'application'];
const allowedProducts = ['horizontal', 'cg', 'cb', 'parts', 'multiple'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function openingTag(html, name) {
  return html.match(new RegExp(`<(?:input|select|textarea)\\b[^>]*\\bname=["']${escapeRegExp(name)}["'][^>]*>`, 'i'))?.[0] || '';
}

function between(html, start, end) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) return '';
  return html.slice(startIndex, endIndex + end.length);
}

test('five canonical Contact pages expose the managed procurement owner contract', () => {
  const sitemap = read('sitemap.xml');
  for (const page of pages) {
    const html = read(page.file);
    assert.match(sitemap, new RegExp(`<loc>https://chixiangmotor\\.com${escapeRegExp(page.path)}</loc>`));
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page.file}: H1`);
    assert.match(html, /CONTACT PROCUREMENT OWNER START/);
    assert.match(html, new RegExp(`data-contact-procurement-owner=["']${page.lang}["']`));
    assert.match(html, /action=["']\/api\/contact["']/i);
    assert.match(html, /data-whatsapp-fallback=["']false["']/i);
    assert.match(html, new RegExp(`name=["']source_form["'][^>]*value=["']${page.source}["']`, 'i'));
  }
});

test('B2B fields and current product choices are explicit in raw HTML', () => {
  for (const page of pages) {
    const html = read(page.file);
    for (const name of requiredFields) {
      assert.match(openingTag(html, name), /\brequired\b/i, `${page.file}:${name}`);
    }
    assert.ok(openingTag(html, 'email'), `${page.file}: optional email`);
    assert.doesNotMatch(openingTag(html, 'email'), /\brequired\b/i, `${page.file}: email remains optional`);
    assert.ok(openingTag(html, 'requirements'), `${page.file}: requirements`);
    for (const value of allowedProducts) {
      assert.match(html, new RegExp(`<option\\b[^>]*value=["']${value}["']`, 'i'), `${page.file}:${value}`);
    }
  }
});

test('Contact product choices do not present complete vehicles as current supply', () => {
  for (const page of pages) {
    const select = between(read(page.file), '<select', '</select>');
    assert.doesNotMatch(select, /value=["'][^"']*(?:motorcycles?|tricycles?)|>\s*(?:Motorcycles?|Tricycles?)\s*</i, page.file);
  }
});

test('Contact pages do not publish universal commercial or unsupported vehicle claims', () => {
  const forbidden = /MOQ\s*\d|minimum order\s*\d|sample(?:s)?\s+from\s+\d|US\$|USD\s*\d|delivery\s+in\s+\d|complete motorcycles?|complete (?:cargo )?tricycles?/i;
  for (const page of pages) assert.doesNotMatch(read(page.file), forbidden, page.file);
});

test('localized supplemental contact channels use the approved order', () => {
  for (const page of pages) {
    const region = between(
      read(page.file),
      '<!-- CONTACT CHANNEL LIST START -->',
      '<!-- CONTACT CHANNEL LIST END -->'
    );
    let previous = -1;
    for (const channel of page.channels) {
      const current = region.indexOf(`data-contact-channel="${channel}"`);
      assert.ok(current > previous, `${page.file}:${channel}`);
      previous = current;
    }
  }
});

test('mobile Contact actions are form first and Email second', () => {
  for (const page of pages) {
    const bar = read(page.file).match(/<div class=["'][^"']*mobile-cta-bar[^"']*["'][\s\S]*?<\/div>/i)?.[0] || '';
    assert.match(bar, /href=["']#procurement-form["']/i, `${page.file}:form`);
    assert.match(bar, /href=["']mailto:chixiangmotor@163\.com["']/i, `${page.file}:email`);
    assert.ok(bar.indexOf('#procurement-form') < bar.indexOf('mailto:'), `${page.file}:order`);
    assert.doesNotMatch(bar, /wa\.me/i, `${page.file}:no WhatsApp-first mobile action`);
  }
});

test('safe ContactPage graph remains and prohibited commerce Schema is absent', () => {
  for (const page of pages) {
    const html = read(page.file);
    assert.match(html, /"@type"\s*:\s*"ContactPage"/);
    assert.match(html, /"@type"\s*:\s*"BreadcrumbList"/);
    assert.doesNotMatch(html, /"@type"\s*:\s*"(?:Product|ProductGroup|Offer|Review|AggregateRating)"/);
  }
});

test('Arabic Contact remains RTL and every honeypot is viewport safe', () => {
  assert.match(read('ar/contact.html'), /<html\b[^>]*\bdir=["']rtl["']/i);
  for (const page of pages) {
    const html = read(page.file);
    assert.match(html, /class=["']contact-honeypot["']/i, `${page.file}:honeypot`);
    assert.doesNotMatch(html, /<div\b[^>]*style=["'][^"']*left\s*:\s*-9999px/i, `${page.file}:off-canvas`);
  }
});

test('conversion and delivery implementation files retain their approved baseline', () => {
  const expected = {
    'js/main.js': 'd685fefc94ae57b27e470335b315d8cfacf8b8f6de56e3db8eebfbc391227ba8',
    'js/yandex-metrica.js': '7ff3c32d95e7672476cb33f4b3b3ee90880a5dceeb6ca1c9af342ca3d59f9608',
    'workers/contact-api/src/contact-handler.mjs': 'c1315daccefc0f8543398ccf393d0eb916e5c4d6093aae1ecc875f3d82d115f5',
    'workers/contact-api/src/index.mjs': 'd24cf2d2dc596265d57c9011909e2a0cf567fc8a2d1eee816f4c97f46c151c42'
  };
  for (const [file, hash] of Object.entries(expected)) {
    assert.equal(sha256(file), hash, file);
  }
});
