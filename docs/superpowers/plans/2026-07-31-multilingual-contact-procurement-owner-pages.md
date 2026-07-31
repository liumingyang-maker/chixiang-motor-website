# Multilingual Contact Procurement Owner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the five canonical Contact pages into localized, form-first B2B procurement owners while preserving the existing contact Worker, Turnstile, email delivery, Google Ads and Yandex success-only conversion behavior.

**Architecture:** A localized manifest owns the five route contracts, field labels, product/application choices, channel order and status messages. A deterministic Node.js generator writes the complete procurement section into raw HTML between stable markers, while `js/main.js`, Yandex tracking and `workers/contact-api/**` remain protected. Contract tests inspect the resulting HTML, fact boundaries, form behavior, Schema and mobile channel hierarchy.

**Tech Stack:** Static HTML5, CSS, Node.js CommonJS, Node built-in test runner, existing Cloudflare Worker contact API, Turnstile, Google Ads and Yandex Metrica.

---

## File map

| File | Responsibility |
| --- | --- |
| `scripts/contact-procurement-owner-manifest.js` | Five routes, localized vocabulary, channel order, product/application options and source-form values. |
| `scripts/apply-contact-procurement-owner-content.js` | Deterministically render and replace the raw-HTML Contact owner region; support `--check`. |
| `tests/multilingual-contact-procurement-owner-pages.test.js` | Enforce route, fact, field, B2B, channel, conversion-protection and generator contracts. |
| `en/contact.html` | English Contact owner generated content. |
| `es/contacto.html` | Spanish Contact owner generated content. |
| `pt/contato.html` | Portuguese Contact owner generated content. |
| `ru/kontakty.html` | Russian Contact owner generated content. |
| `ar/contact.html` | Arabic RTL Contact owner generated content. |
| `css/style.css` | Minimal reusable procurement checklist, channel and mobile CTA rules. |
| `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv` | Record the five pages' final governance contract. |
| `docs/geo-entity/MULTILINGUAL_CONTACT_PROCUREMENT_REPORT.md` | Scope, tests, browser evidence, preview URLs, remaining boundaries and rollback. |

## Protected files

The implementation must not modify:

```text
js/main.js
js/yandex-metrica.js
workers/contact-api/src/contact-handler.mjs
workers/contact-api/src/index.mjs
```

Their pre-change SHA-256 hashes must be captured by the focused test and verified after generation.

### Task 1: Establish the clean baseline and RED contract

**Files:**
- Create: `tests/multilingual-contact-procurement-owner-pages.test.js`
- Read: `en/contact.html`
- Read: `es/contacto.html`
- Read: `pt/contato.html`
- Read: `ru/kontakty.html`
- Read: `ar/contact.html`
- Read: `js/main.js`
- Read: `workers/contact-api/src/contact-handler.mjs`

- [ ] **Step 1: Run the current full baseline**

Run:

```powershell
node --test
node --test workers/contact-api/test/*.test.mjs
```

Expected: all current site tests and all 13 Worker tests pass before the new RED test exists.

- [ ] **Step 2: Create the focused contract test**

Create `tests/multilingual-contact-procurement-owner-pages.test.js` with these exact page and field contracts:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = [
  { file: 'en/contact.html', path: '/en/contact', lang: 'en', source: 'contact_owner_en', channels: ['Email', 'WeChat', 'WhatsApp', 'Phone'] },
  { file: 'es/contacto.html', path: '/es/contacto', lang: 'es', source: 'contact_owner_es', channels: ['Email', 'WhatsApp', 'WeChat', 'Phone'] },
  { file: 'pt/contato.html', path: '/pt/contato', lang: 'pt', source: 'contact_owner_pt', channels: ['Email', 'WhatsApp', 'WeChat', 'Phone'] },
  { file: 'ru/kontakty.html', path: '/ru/kontakty', lang: 'ru', source: 'contact_owner_ru', channels: ['Email', 'WeChat', 'WhatsApp', 'Phone'] },
  { file: 'ar/contact.html', path: '/ar/contact', lang: 'ar', source: 'contact_owner_ar', channels: ['Email', 'WhatsApp', 'WeChat', 'Phone'] }
];
const requiredFields = ['name', 'company', 'contact', 'country', 'product_interest', 'quantity', 'application'];
const allowedProducts = ['horizontal', 'cg', 'cb', 'parts', 'multiple'];
const forbiddenProducts = ['motorcycles', 'tricycles', 'complete motorcycle', 'complete tricycle'];

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function fieldTag(html, name) {
  return html.match(new RegExp(`<(?:input|select|textarea)\\b[^>]*\\bname=["']${name}["'][^>]*>`, 'i'))?.[0] || '';
}

test('five canonical Contact pages expose the managed procurement owner contract', () => {
  const sitemap = read('sitemap.xml');
  for (const page of pages) {
    const html = read(page.file);
    assert.match(sitemap, new RegExp(`<loc>https://chixiangmotor\\.com${page.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`));
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page.file}: H1`);
    assert.match(html, /CONTACT PROCUREMENT OWNER START/);
    assert.match(html, /data-contact-procurement-owner/);
    assert.match(html, /action=["']\/api\/contact["']/i);
    assert.match(html, /data-whatsapp-fallback=["']false["']/i);
    assert.match(html, new RegExp(`name=["']source_form["'][^>]*value=["']${page.source}["']`, 'i'));
  }
});

test('B2B fields and current product choices are explicit in raw HTML', () => {
  for (const page of pages) {
    const html = read(page.file);
    for (const name of requiredFields) {
      assert.match(fieldTag(html, name), /\brequired\b/i, `${page.file}:${name}`);
    }
    assert.ok(fieldTag(html, 'email'), `${page.file}: optional email`);
    assert.ok(fieldTag(html, 'requirements'), `${page.file}: requirements`);
    for (const value of allowedProducts) {
      assert.match(html, new RegExp(`<option\\b[^>]*value=["']${value}["']`, 'i'), `${page.file}:${value}`);
    }
    for (const value of forbiddenProducts) {
      assert.doesNotMatch(html, new RegExp(`value=["'][^"']*${value}|>${value}`, 'i'), `${page.file}:${value}`);
    }
  }
});

test('Contact pages do not publish universal commercial or unsupported vehicle claims', () => {
  const forbidden = /MOQ\s*\d|minimum order\s*\d|sample(?:s)?\s+from\s+\d|US\$|USD\s*\d|delivery\s+in\s+\d|complete motorcycles?|complete (?:cargo )?tricycles?/i;
  for (const page of pages) assert.doesNotMatch(read(page.file), forbidden, page.file);
});

test('localized supplemental contact channels use the approved order', () => {
  for (const page of pages) {
    const region = read(page.file).match(/data-contact-channel-list[\s\S]*?<\/(?:div|section)>/)?.[0] || '';
    let previous = -1;
    for (const channel of page.channels) {
      const current = region.indexOf(`data-contact-channel="${channel.toLowerCase()}"`);
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

test('conversion and delivery implementation files retain their approved baseline', () => {
  const expected = {
    'js/main.js': 'd685fefc94ae57b27e470335b315d8cfacf8b8f6de56e3db8eebfbc391227ba8',
    'js/yandex-metrica.js': '7ff3c32d95e7672476cb33f4b3b3ee90880a5dceeb6ca1c9af342ca3d59f9608',
    'workers/contact-api/src/contact-handler.mjs': 'c1315daccefc0f8543398ccf393d0eb916e5c4d6093aae1ecc875f3d82d115f5',
    'workers/contact-api/src/index.mjs': 'd24cf2d2dc596265d57c9011909e2a0cf567fc8a2d1eee816f4c97f46c151c42'
  };
  for (const [file, hash] of Object.entries(expected)) assert.equal(sha256(file), hash, file);
});
```

The values above are the captured lowercase SHA-256 baseline from the approved branch. Recompute them with:

```powershell
Get-FileHash -Algorithm SHA256 js/main.js,js/yandex-metrica.js,workers/contact-api/src/contact-handler.mjs,workers/contact-api/src/index.mjs |
  ForEach-Object { "$($_.Path) $($_.Hash.ToLowerInvariant())" }
```

- [ ] **Step 3: Run the focused test and confirm RED**

Run:

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js
```

Expected: failures for missing managed owner markers, `contact`, `quantity`, `application`, source-form fields, fallback opt-out, channel order and the form-first mobile CTA. The protected-file hash test passes.

- [ ] **Step 4: Commit the RED test**

```powershell
git add tests/multilingual-contact-procurement-owner-pages.test.js
git commit -m "test: define multilingual procurement contact contract"
```

### Task 2: Create the localized manifest and deterministic generator

**Files:**
- Create: `scripts/contact-procurement-owner-manifest.js`
- Create: `scripts/apply-contact-procurement-owner-content.js`
- Test: `tests/multilingual-contact-procurement-owner-pages.test.js`

- [ ] **Step 1: Define the five route records**

Export this stable route shape from `scripts/contact-procurement-owner-manifest.js`:

```js
const routes = [
  { file: 'en/contact.html', language: 'en', path: '/en/contact', sourceForm: 'contact_owner_en', dir: 'ltr' },
  { file: 'es/contacto.html', language: 'es', path: '/es/contacto', sourceForm: 'contact_owner_es', dir: 'ltr' },
  { file: 'pt/contato.html', language: 'pt', path: '/pt/contato', sourceForm: 'contact_owner_pt', dir: 'ltr' },
  { file: 'ru/kontakty.html', language: 'ru', path: '/ru/kontakty', sourceForm: 'contact_owner_ru', dir: 'ltr' },
  { file: 'ar/contact.html', language: 'ar', path: '/ar/contact', sourceForm: 'contact_owner_ar', dir: 'rtl' }
];

const products = [
  { value: 'horizontal', owner: { en: '/en/horizontal-engine', es: '/es/motor-horizontal', pt: '/pt/motor-horizontal', ru: '/ru/gorizontalnyj-dvigatel', ar: '/ar/horizontal-engine' } },
  { value: 'cg', owner: { en: '/en/cg-engine', es: '/es/motor-cg', pt: '/pt/motor-cg', ru: '/ru/dvigatel-cg', ar: '/ar/cg-engine' } },
  { value: 'cb', owner: { en: '/en/cb-engine', es: '/es/motor-cb', pt: '/pt/motor-cb', ru: '/ru/dvigatel-cb', ar: '/ar/cb-engine' } },
  { value: 'parts', owner: { en: '/en/engine-parts', es: '/es/repuestos-motor', pt: '/pt/pecas-de-motor', ru: '/ru/zapchasti-dvigatelya', ar: '/ar/engine-parts' } },
  { value: 'multiple', owner: null }
];

module.exports = { routes, products, locales };
```

- [ ] **Step 2: Add complete localized vocabulary**

Each locale must define actual localized values for:

```js
{
  pageLead,
  procurementHeading,
  procurementIntro,
  checklistHeading,
  channelHeading,
  formHeading,
  formLead,
  fields: { name, company, contact, email, country, product, quantity, application, requirements },
  placeholders: { name, company, contact, email, country, quantity, requirements },
  products: { horizontal, cg, cb, parts, multiple },
  applications: { motorcycle, cargoTricycle, atvOffroad, replacement, assembly, other },
  channels: { email, wechat, whatsapp, phone },
  actions: { submit, form, email },
  messages: { sending, success, validation, turnstile, spam, fallback }
}
```

The Russian `fallback` value must contain `chixiangmotor@163.com` and no automatic-WhatsApp wording. Spanish, Portuguese, Arabic and English must use equivalent local-language Email fallback text.

- [ ] **Step 3: Implement the renderer**

`scripts/apply-contact-procurement-owner-content.js` must:

```js
const START = '<!-- CONTACT PROCUREMENT OWNER START -->';
const END = '<!-- CONTACT PROCUREMENT OWNER END -->';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceOwnerRegion(html, rendered) {
  const existing = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`);
  if (existing.test(html)) return html.replace(existing, rendered);

  const firstSection = html.indexOf('<section class="page-header"');
  const footer = html.indexOf('<footer class="footer"');
  if (firstSection < 0 || footer < 0 || footer <= firstSection) {
    throw new Error('Contact owner boundaries not found');
  }
  return html.slice(0, firstSection) + rendered + '\n\n  ' + html.slice(footer);
}
```

The renderer must emit this exact semantic shape using manifest values rather than English literals:

```js
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInput(route, l, name, required, type = 'text') {
  const requiredLabel = required ? ' <span class="required">*</span>' : '';
  const requiredAttribute = required ? ' required' : '';
  return `<div class="form-group">
    <label for="${route.language}-${name}">${escapeHtml(l.fields[name])}${requiredLabel}</label>
    <input type="${type}" id="${route.language}-${name}" name="${name}"
      placeholder="${escapeHtml(l.placeholders[name])}"${requiredAttribute}>
  </div>`;
}

function renderOwnerLinks(language, l) {
  return `<nav class="contact-owner-links" aria-label="${escapeHtml(l.productLinksLabel)}">
    ${products.filter(product => product.owner).map(product =>
      `<a href="${product.owner[language]}">${escapeHtml(l.products[product.value])}</a>`
    ).join('')}
  </nav>`;
}

function renderChannels(language, l) {
  const channelHtml = {
    email: `<a data-contact-channel="email" href="mailto:chixiangmotor@163.com"><strong>${escapeHtml(l.channels.email)}</strong><span>chixiangmotor@163.com</span></a>`,
    wechat: `<div class="contact-channel" data-contact-channel="wechat"><strong>${escapeHtml(l.channels.wechat)}</strong><img src="../images/%E8%81%94%E7%B3%BB%E6%96%B9%E5%BC%8F/wechat.webp" alt="${escapeHtml(l.wechatQrAlt)}" width="90" height="90" loading="lazy" decoding="async"></div>`,
    whatsapp: `<a data-contact-channel="whatsapp" href="https://wa.me/8619008225410" target="_blank" rel="noopener"><strong>${escapeHtml(l.channels.whatsapp)}</strong><span>+86 19008225410</span></a>`,
    phone: `<a data-contact-channel="phone" href="tel:+8619008225410"><strong>${escapeHtml(l.channels.phone)}</strong><span>+86 19008225410</span></a>`
  };
  return l.channelOrder.map(channel => channelHtml[channel]).join('');
}

function renderOwner(route, l) {
  const option = (value, label) => `<option value="${value}">${escapeHtml(label)}</option>`;
  return `${START}
<section class="page-header" data-contact-procurement-owner="${route.language}">
  <div class="container">
    <nav class="breadcrumb entity-breadcrumb" aria-label="${escapeHtml(l.breadcrumbLabel)}">
      <a href="/${route.language}/">${escapeHtml(l.home)}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(l.h1)}</span>
    </nav>
    <h1>${escapeHtml(l.h1)}</h1>
    <p class="section-subtitle">${escapeHtml(l.pageLead)}</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="contact-layout">
      <div class="contact-owner-summary">
        <h2>${escapeHtml(l.procurementHeading)}</h2>
        <p>${escapeHtml(l.procurementIntro)}</p>
        <h3>${escapeHtml(l.checklistHeading)}</h3>
        <ul class="procurement-checklist">
          ${l.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        ${renderOwnerLinks(route.language, l)}
        <h3>${escapeHtml(l.channelHeading)}</h3>
        <div class="contact-channel-list" data-contact-channel-list>
          ${renderChannels(route.language, l)}
        </div>
      </div>
      <div class="contact-form" id="procurement-form">
        <h2>${escapeHtml(l.formHeading)}</h2>
        <p>${escapeHtml(l.formLead)}</p>
        <form method="POST" action="/api/contact"
          data-whatsapp-fallback="false"
          data-message-sending="${escapeHtml(l.messages.sending)}"
          data-message-success="${escapeHtml(l.messages.success)}"
          data-message-validation="${escapeHtml(l.messages.validation)}"
          data-message-turnstile="${escapeHtml(l.messages.turnstile)}"
          data-message-spam="${escapeHtml(l.messages.spam)}"
          data-message-fallback="${escapeHtml(l.messages.fallback)}">
          <div class="contact-honeypot" aria-hidden="true">
            <label for="${route.language}-website">Website</label>
            <input type="text" id="${route.language}-website" name="website" tabindex="-1" autocomplete="off">
          </div>
          ${renderInput(route, l, 'name', true)}
          ${renderInput(route, l, 'company', true)}
          ${renderInput(route, l, 'contact', true)}
          ${renderInput(route, l, 'email', false, 'email')}
          ${renderInput(route, l, 'country', true)}
          <div class="form-group">
            <label for="${route.language}-product">${escapeHtml(l.fields.product)} <span class="required">*</span></label>
            <select id="${route.language}-product" name="product_interest" required>
              <option value="">${escapeHtml(l.selectProduct)}</option>
              ${option('horizontal', l.products.horizontal)}
              ${option('cg', l.products.cg)}
              ${option('cb', l.products.cb)}
              ${option('parts', l.products.parts)}
              ${option('multiple', l.products.multiple)}
            </select>
          </div>
          ${renderInput(route, l, 'quantity', true)}
          <div class="form-group">
            <label for="${route.language}-application">${escapeHtml(l.fields.application)} <span class="required">*</span></label>
            <select id="${route.language}-application" name="application" required>
              <option value="">${escapeHtml(l.selectApplication)}</option>
              ${option('motorcycle', l.applications.motorcycle)}
              ${option('cargo-tricycle', l.applications.cargoTricycle)}
              ${option('atv-offroad', l.applications.atvOffroad)}
              ${option('replacement', l.applications.replacement)}
              ${option('assembly', l.applications.assembly)}
              ${option('other', l.applications.other)}
            </select>
          </div>
          <div class="form-group">
            <label for="${route.language}-requirements">${escapeHtml(l.fields.requirements)}</label>
            <textarea id="${route.language}-requirements" name="requirements" rows="5"
              placeholder="${escapeHtml(l.placeholders.requirements)}"></textarea>
          </div>
          <input type="hidden" name="source_form" value="${route.sourceForm}">
          <button type="submit" class="btn btn-accent btn-lg">${escapeHtml(l.actions.submit)}</button>
        </form>
      </div>
    </div>
  </div>
</section>
${END}`;
}
```

`renderChannels()` must render each configured channel with a stable `data-contact-channel` value. Email uses `mailto:chixiangmotor@163.com`, WhatsApp uses `https://wa.me/8619008225410`, Phone uses `tel:+8619008225410`, and WeChat uses the approved QR image plus its localized label.

The script must also replace the existing page-specific mobile CTA element with this generated shape:

```js
function renderMobileBar(route, l) {
  return `<div class="mobile-cta-bar">
    <a href="#procurement-form" class="btn btn-quote">${escapeHtml(l.actions.form)}</a>
    <a href="mailto:chixiangmotor@163.com" class="btn btn-email">${escapeHtml(l.actions.email)}</a>
  </div>`;
}
```

The command interface is:

```powershell
node scripts/apply-contact-procurement-owner-content.js
node scripts/apply-contact-procurement-owner-content.js --check
```

Normal mode writes only the five Contact pages. `--check` exits non-zero when any generated page differs and prints the exact count.

- [ ] **Step 4: Add generator determinism assertions**

Extend the focused test:

```js
test('Contact owner generator is idempotent', () => {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/apply-contact-procurement-owner-content.js', '--check'], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /0 contact owner pages need updates/);
});
```

- [ ] **Step 5: Run the focused test**

Run:

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js
```

Expected: page-content assertions remain RED until Task 3; manifest module loads and the protected hashes stay green.

- [ ] **Step 6: Commit manifest and generator**

```powershell
git add scripts/contact-procurement-owner-manifest.js scripts/apply-contact-procurement-owner-content.js tests/multilingual-contact-procurement-owner-pages.test.js
git commit -m "feat: add multilingual contact owner generator"
```

### Task 3: Generate the five procurement Contact pages and minimal CSS

**Files:**
- Modify: `en/contact.html`
- Modify: `es/contacto.html`
- Modify: `pt/contato.html`
- Modify: `ru/kontakty.html`
- Modify: `ar/contact.html`
- Modify: `css/style.css`
- Test: `tests/multilingual-contact-procurement-owner-pages.test.js`

- [ ] **Step 1: Add reusable CSS without redesigning the page**

Append focused rules to `css/style.css`:

```css
.contact-owner-summary {
  min-width: 0;
}

.procurement-checklist {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
}

.procurement-checklist li {
  position: relative;
  padding-inline-start: 1.5rem;
  color: var(--text-secondary);
}

.procurement-checklist li::before {
  content: "✓";
  position: absolute;
  inset-inline-start: 0;
  color: var(--accent-red);
  font-weight: 700;
}

.contact-channel-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.contact-channel-list a,
.contact-channel-list .contact-channel {
  overflow-wrap: anywhere;
}

#procurement-form {
  scroll-margin-top: 7rem;
}
```

Do not change the existing `.contact-layout`, `.contact-form`, global button colors, Header, Footer or breakpoint definitions.

- [ ] **Step 2: Run the generator**

```powershell
node scripts/apply-contact-procurement-owner-content.js
node scripts/apply-contact-procurement-owner-content.js --check
```

Expected: first run updates exactly five pages; the second reports `0 contact owner pages need updates`.

- [ ] **Step 3: Verify generated content manually in source**

Run:

```powershell
rg -n "CONTACT PROCUREMENT OWNER|name=\"(company|contact|quantity|application|source_form)\"|data-contact-channel|data-whatsapp-fallback|mobile-cta-bar" en/contact.html es/contacto.html pt/contato.html ru/kontakty.html ar/contact.html
```

Expected: all five files contain the managed marker, required fields, ordered channel markers, fallback opt-out and form-first mobile CTA.

- [ ] **Step 4: Run focused and existing form tests**

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js tests/russia-form.test.js tests/whatsapp-conversion.test.js tests/yandex-metrica.test.js tests/geo-entity-alignment.test.js
node --test workers/contact-api/test/*.test.mjs
```

Expected: all focused, form, Google/Yandex/WhatsApp and 13 Worker tests pass. The expected Worker email-negative fixture may log its intentional delivery error while remaining green.

- [ ] **Step 5: Commit generated pages and CSS**

```powershell
git add en/contact.html es/contacto.html pt/contato.html ru/kontakty.html ar/contact.html css/style.css scripts tests
git commit -m "feat: make multilingual Contact pages procurement first"
```

### Task 4: Reconcile Schema, governance matrix and final report

**Files:**
- Modify through generator: `en/contact.html`
- Modify through generator: `es/contacto.html`
- Modify through generator: `pt/contato.html`
- Modify through generator: `ru/kontakty.html`
- Modify through generator: `ar/contact.html`
- Modify: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- Create: `docs/geo-entity/MULTILINGUAL_CONTACT_PROCUREMENT_REPORT.md`

- [ ] **Step 1: Reconcile generated entity graphs**

Run:

```powershell
node scripts/apply-site-entity-schema.js --check
```

If it reports five description/name drifts, run:

```powershell
node scripts/apply-site-entity-schema.js
node scripts/apply-site-entity-schema.js --check
```

Expected: zero entity-graph drift. The five pages contain one `data-site-entity-graph`, one ContactPage and one BreadcrumbList, with no Product or Offer records.

- [ ] **Step 2: Update the five governance rows**

In `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`, update only:

```text
en-contact
es-contact
pt-contact
ru-contact
ar-contact
```

Append `multilingual procurement contact owner contract` to the `tests` column and update notes to state:

```text
Form-first B2B intake; no universal MOQ; current engine/parts scope only; automatic WhatsApp fallback disabled.
```

- [ ] **Step 3: Write the implementation report**

`docs/geo-entity/MULTILINGUAL_CONTACT_PROCUREMENT_REPORT.md` must record:

- the five canonical URLs and files;
- exact current product and application choices;
- required and optional form fields;
- channel order per language;
- public policy exclusions;
- protected file hashes;
- focused, full-suite and Worker test totals;
- browser viewport results;
- five actual Cloudflare Preview URLs after deployment;
- explicit statement that no real production inquiry was submitted;
- rollback with `git revert <merge-commit>`;
- PR remains unmerged.

- [ ] **Step 4: Run Schema and governance tests**

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js tests/site-entity-navigation-schema.test.js tests/geo-page-matrix.test.js tests/geo-fact-governance.test.js
```

Expected: all tests pass and the 51-row matrix remains complete.

- [ ] **Step 5: Commit governance output**

```powershell
git add en/contact.html es/contacto.html pt/contato.html ru/kontakty.html ar/contact.html docs/geo-entity scripts tests
git commit -m "docs: record multilingual procurement Contact governance"
```

### Task 5: Full verification, browser acceptance and Preview PR

**Files:**
- Verify: all changed files
- Modify final evidence only: `docs/geo-entity/MULTILINGUAL_CONTACT_PROCUREMENT_REPORT.md`

- [ ] **Step 1: Run deterministic generators**

```powershell
node scripts/apply-contact-procurement-owner-content.js --check
node scripts/apply-site-entity-schema.js --check
```

Expected: both report zero drift.

- [ ] **Step 2: Run all repository tests**

```powershell
node --test
node --test workers/contact-api/test/*.test.mjs
```

Expected: all site tests and all 13 Worker tests pass with zero failures.

- [ ] **Step 3: Run source and whitespace checks**

```powershell
git diff --check
git status --short
git diff --name-only HEAD~4..HEAD
```

Expected: no whitespace errors; only the design, plan, focused generator/test, five Contact pages, CSS, five matrix rows and final report are changed. Protected runtime files are absent.

- [ ] **Step 4: Start a local static server**

```powershell
python -m http.server 4173
```

Open these exact local routes:

```text
http://127.0.0.1:4173/en/contact
http://127.0.0.1:4173/es/contacto
http://127.0.0.1:4173/pt/contato
http://127.0.0.1:4173/ru/kontakty
http://127.0.0.1:4173/ar/contact
```

- [ ] **Step 5: Check three viewports on all five pages**

Use browser automation at:

```text
390×844
768×1024
1440×1000
```

For every page assert:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
document.querySelectorAll('h1').length === 1
document.querySelector('#procurement-form form').action.endsWith('/api/contact')
document.querySelector('[name="company"]').required === true
document.querySelector('[name="quantity"]').required === true
document.querySelector('[name="application"]').required === true
document.querySelector('.mobile-cta-bar a').getAttribute('href') === '#procurement-form'
```

Also verify visible channel order, native language labels, Arabic RTL, no blank placeholder map, no missing images and no console errors.

- [ ] **Step 6: Do not submit a real production inquiry**

Local/Preview verification may exercise HTML validation only. Do not complete Turnstile or send a real request to the production Worker in this stage; production email receipt and conversion ingestion were already separately verified.

- [ ] **Step 7: Push and open one Draft PR**

Push:

```powershell
git push -u origin feature/multilingual-contact-procurement-owner-pages
```

Create a Draft PR targeting `main`. The PR body must list:

- five modified Contact pages;
- form-first hierarchy;
- current engine/parts scope correction;
- B2B fields;
- no universal MOQ;
- automatic WhatsApp fallback opt-out;
- protected Worker/tracking files;
- exact tests and totals;
- browser sizes;
- five Cloudflare Preview URLs;
- rollback by reverting the PR.

Do not merge.

- [ ] **Step 8: Verify Cloudflare Preview**

Wait for the PR deployment to finish. For each route, open:

```text
https://<actual-preview-host>/en/contact
https://<actual-preview-host>/es/contacto
https://<actual-preview-host>/pt/contato
https://<actual-preview-host>/ru/kontakty
https://<actual-preview-host>/ar/contact
```

Record only the real deployed host in the report. Re-run the 390px overflow and form-contract checks against Preview, then hand all five links to the site owner for one-pass review.
