# Multilingual Core Owner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize the Russian, Spanish, Portuguese and Arabic Home, About and Products owner pages with the approved company facts, current-supply boundary and future-program disclosure.

**Architecture:** Keep the existing static HTML/CSS/JavaScript architecture and localized page layouts. Each language retains three independent raw-HTML owner pages, while all JSON-LD graphs reference the same global organization `@id`; regression tests enforce shared facts, localized ownership, asset validity and conversion-tag preservation.

**Tech Stack:** Static HTML5, existing `css/style.css`, JSON-LD/Schema.org, Node.js built-in test runner, Cloudflare Workers preview deployment.

---

## File map

**Create**

- `tests/multilingual-core-owner-pages.test.js` — contract tests for all twelve localized owner pages.

**Modify**

- `ru/index.html`, `ru/about.html`, `ru/products.html` — Russian brand, company and product owners.
- `es/index.html`, `es/about.html`, `es/products.html` — Spanish brand, company and product owners.
- `pt/index.html`, `pt/about.html`, `pt/products.html` — Portuguese brand, company and product owners.
- `ar/index.html`, `ar/about.html`, `ar/products.html` — Arabic brand, company and product owners with RTL preservation.
- `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv` — traceability for the twelve canonical owner pages.

**Do not modify**

- country landing pages;
- `js/form-handler.js`, `js/google-ads-conversion.js`, `js/yandex-metrica.js`;
- `workers/contact-api/**`;
- sitemap, redirects or canonical routes;
- English owner pages unless an automated cross-language relationship test proves a broken link.

---

### Task 1: Define the twelve-page regression contract

**Files:**

- Create: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Write the failing owner-page test file**

Create helpers and page contracts using the real repository files:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const languages = ['ru', 'es', 'pt', 'ar'];
const roles = ['index', 'about', 'products'];
const organizationId = 'https://chixiangmotor.com/#organization';

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => JSON.parse(match[1]));
}

function canonicalHref(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  assert.ok(match, 'missing canonical link');
  return match[1];
}

function futureCard(html) {
  const match = html.match(/<article\b[^>]*\bproduct-card--future\b[^>]*>[\s\S]*?<\/article>/i);
  assert.ok(match, 'missing preparation-only future program card');
  return match[0];
}
```

Add tests with these exact contracts:

```js
test('all twelve localized owner pages have one H1, a self canonical and valid JSON-LD', () => {
  for (const language of languages) {
    for (const role of roles) {
      const file = `${language}/${role}.html`;
      const html = read(file);
      assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, `${file}: one H1`);
      const route = role === 'index' ? `/${language}/` : `/${language}/${role}`;
      assert.equal(canonicalHref(html), `https://chixiangmotor.com${route}`, `${file}: self canonical`);
      const blocks = jsonLdBlocks(html);
      assert.ok(blocks.length > 0, `${file}: JSON-LD required`);
      assert.ok(JSON.stringify(blocks).includes(organizationId), `${file}: shared organization ID`);
    }
  }
});

test('localized About owners distinguish industry experience from registration', () => {
  for (const language of languages) {
    const html = read(`${language}/about.html`);
    assert.match(html, /2003/);
    assert.match(html, /2007/);
    assert.match(html, /Chongqing Chixiang Motorcycle Manufacturing Co\., Ltd\./);
  }
});

test('localized Products owners separate current supply from the future program', () => {
  const labels = {
    ru: ['В подготовке', 'Мотоциклы и комплекты CKD/SKD'],
    es: ['En preparación', 'Motocicletas y kits CKD/SKD'],
    pt: ['Em preparação', 'Motocicletas e kits CKD/SKD'],
    ar: ['قيد الإعداد', 'الدراجات النارية ومجموعات CKD/SKD']
  };
  for (const language of languages) {
    const html = read(`${language}/products.html`);
    const card = futureCard(html);
    assert.ok(card.includes(labels[language][0]));
    assert.ok(card.includes(labels[language][1]));
    assert.doesNotMatch(card, /href=|btn|price|MOQ|Offer|AggregateRating/i);
    assert.doesNotMatch(html, /series=(?:motorcycles|tricycles)/i);
  }
});
```

Also test that every local inline `background-image` resolves to a real asset, Arabic retains `dir="rtl"`, and all twelve pages keep their existing Google Ads and Yandex Metrica identifiers.

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node --test tests/multilingual-core-owner-pages.test.js
```

Expected: FAIL because the twelve pages have no JSON-LD and the four Products pages still expose current motorcycle/tricycle vehicle cards.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/multilingual-core-owner-pages.test.js
git commit -m "test: define multilingual owner page contract"
```

---

### Task 2: Align the Russian owner pages

**Files:**

- Modify: `ru/index.html`
- Modify: `ru/about.html`
- Modify: `ru/products.html`
- Test: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Update Russian Home ownership**

Use one visible H1 equivalent to:

`Производитель двигателей для мотоциклов и грузовых трициклов в Китае`

Keep current engine-family cards and selected parts. Remove any implication that complete motorcycles, CKD/SKD kits or complete tricycles are currently supplied. Add raw-HTML links to `/ru/about` and `/ru/products` where the page delegates detailed company and product facts.

Add a localized `WebPage` graph referencing `https://chixiangmotor.com/#organization`; keep the canonical `https://chixiangmotor.com/ru/`.

- [ ] **Step 2: Update Russian About ownership**

Publish the approved relationship explicitly:

`CHIXIANG MOTOR — бренд компании Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. Компания работает в отрасли мотоциклетных двигателей с 2003 года, а нынешнее юридическое лицо зарегистрировано в 2007 году.`

Keep the current Hangu Town location and approved factory statements. Limit ISO 9001 and CCC wording to generic certification statements. Add `AboutPage` plus the shared Organization `@id`.

- [ ] **Step 3: Replace current vehicle cards on Russian Products**

Remove both `series=motorcycles` and `series=tricycles` cards. Preserve the cargo-tricycle engine family as current supply. Add:

```html
<article class="product-card product-card--future" data-category="vehicle">
  <div class="product-img" style="background-image:url('../images/%E6%91%A9%E6%89%98%E8%BD%A6/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240327163851.webp');background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#f4f6f8;">
    <span class="product-badge">В подготовке</span>
  </div>
  <div class="product-info">
    <h3>Мотоциклы и комплекты CKD/SKD</h3>
    <p class="specs">Эта продуктовая программа находится в стадии подготовки. Технические характеристики и возможность оптовых поставок будут опубликованы после утверждения производства.</p>
    <p class="future-program-note">Это уведомление о статусе не является товарным предложением и не входит в структурированные данные текущего каталога.</p>
  </div>
</article>
```

Add a localized `CollectionPage` and current-only `ItemList`.

- [ ] **Step 4: Run Russian-focused tests**

```powershell
node --test --test-name-pattern="Russian|twelve|Products owners|About owners" tests/multilingual-core-owner-pages.test.js
```

Expected: Russian assertions PASS; the overall test file may still report Spanish, Portuguese and Arabic failures until their tasks are complete.

- [ ] **Step 5: Commit Russian pages**

```powershell
git add ru/index.html ru/about.html ru/products.html
git commit -m "feat: align Russian core owner pages"
```

---

### Task 3: Align the Spanish owner pages

**Files:**

- Modify: `es/index.html`
- Modify: `es/about.html`
- Modify: `es/products.html`
- Test: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Update Spanish Home ownership**

Use the localized H1:

`Fabricante de motores para motocicletas y triciclos de carga en China`

Describe current engines and selected parts only, and delegate detailed facts to `/es/about` and `/es/products`. Add localized `WebPage` JSON-LD referencing the shared Organization identity.

- [ ] **Step 2: Update Spanish About ownership**

Publish:

`CHIXIANG MOTOR es la marca de Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. La empresa trabaja en el sector de motores para motocicletas desde 2003 y la entidad legal actual fue registrada en 2007.`

Keep approved address, manufacturing, testing, capacity, OEM/ODM, ISO 9001 and CCC boundaries. Add localized `AboutPage` JSON-LD.

- [ ] **Step 3: Replace current vehicle cards on Spanish Products**

Remove the complete `Motocicletas` and `Triciclos` cards. Add a separate future card with:

- badge: `En preparación`;
- heading: `Motocicletas y kits CKD/SKD`;
- status: `Este programa de productos se encuentra en preparación. Las especificaciones y la disponibilidad mayorista se publicarán después de la aprobación de producción.`;
- note: `Este aviso de estado no constituye una oferta de producto y queda fuera de los datos estructurados del catálogo actual.`

Add localized `CollectionPage` and current-only `ItemList` JSON-LD.

- [ ] **Step 4: Run Spanish-focused tests**

```powershell
node --test --test-name-pattern="Spanish|twelve|Products owners|About owners" tests/multilingual-core-owner-pages.test.js
```

Expected: Spanish and previously completed Russian assertions PASS.

- [ ] **Step 5: Commit Spanish pages**

```powershell
git add es/index.html es/about.html es/products.html
git commit -m "feat: align Spanish core owner pages"
```

---

### Task 4: Align the Portuguese owner pages

**Files:**

- Modify: `pt/index.html`
- Modify: `pt/about.html`
- Modify: `pt/products.html`
- Test: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Update Portuguese Home ownership**

Use:

`Fabricante de motores para motos e triciclos de carga na China`

Keep current engine families and selected parts, route detail ownership to `/pt/about` and `/pt/products`, and add localized `WebPage` JSON-LD.

- [ ] **Step 2: Update Portuguese About ownership**

Publish:

`CHIXIANG MOTOR é a marca da Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. A empresa atua no setor de motores para motocicletas desde 2003, e a entidade jurídica atual foi registrada em 2007.`

Keep approved public factory and certification boundaries. Add localized `AboutPage` JSON-LD.

- [ ] **Step 3: Replace current vehicle cards on Portuguese Products**

Remove the complete `Motocicletas` and `Triciclos` cards. Add:

- badge: `Em preparação`;
- heading: `Motocicletas e kits CKD/SKD`;
- status: `Este programa de produtos está em preparação. As especificações e a disponibilidade para vendas no atacado serão publicadas após a aprovação da produção.`;
- note: `Este aviso de status não constitui uma oferta de produto e não faz parte dos dados estruturados do catálogo atual.`

Add localized `CollectionPage` and current-only `ItemList` JSON-LD.

- [ ] **Step 4: Run Portuguese-focused tests**

```powershell
node --test --test-name-pattern="Portuguese|twelve|Products owners|About owners" tests/multilingual-core-owner-pages.test.js
```

Expected: Portuguese, Spanish and Russian assertions PASS.

- [ ] **Step 5: Commit Portuguese pages**

```powershell
git add pt/index.html pt/about.html pt/products.html
git commit -m "feat: align Portuguese core owner pages"
```

---

### Task 5: Align the Arabic owner pages and preserve RTL

**Files:**

- Modify: `ar/index.html`
- Modify: `ar/about.html`
- Modify: `ar/products.html`
- Test: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Update Arabic Home ownership**

Use:

`مصنع محركات الدراجات النارية ومحركات دراجات الشحن ثلاثية العجلات في الصين`

Keep `dir="rtl"`, current engine families and selected parts. Route detailed ownership to `/ar/about` and `/ar/products`. Add localized `WebPage` JSON-LD referencing the shared Organization identity.

- [ ] **Step 2: Update Arabic About ownership**

Publish:

`CHIXIANG MOTOR هي العلامة التجارية لشركة Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. تعمل الشركة في قطاع محركات الدراجات النارية منذ عام 2003، وتم تسجيل الكيان القانوني الحالي في عام 2007.`

Keep approved address, capacity, testing, OEM/ODM and generic certification claims. Add localized `AboutPage` JSON-LD.

- [ ] **Step 3: Replace current vehicle cards on Arabic Products**

Remove complete motorcycle and complete tricycle cards. Add:

- badge: `قيد الإعداد`;
- heading: `الدراجات النارية ومجموعات CKD/SKD`;
- status: `برنامج المنتجات هذا قيد الإعداد. سيتم نشر المواصفات وإمكانية التوريد بالجملة بعد اعتماد الإنتاج.`;
- note: `إشعار الحالة هذا ليس عرضًا لمنتج، ولا يدخل ضمن البيانات المنظمة لكتالوج المنتجات الحالية.`

Add localized `CollectionPage` and current-only `ItemList` JSON-LD.

- [ ] **Step 4: Run Arabic and RTL tests**

```powershell
node --test --test-name-pattern="Arabic|RTL|twelve|Products owners|About owners" tests/multilingual-core-owner-pages.test.js
```

Expected: all language assertions PASS.

- [ ] **Step 5: Commit Arabic pages**

```powershell
git add ar/index.html ar/about.html ar/products.html
git commit -m "feat: align Arabic core owner pages"
```

---

### Task 6: Update governance traceability

**Files:**

- Modify: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- Test: `tests/multilingual-core-owner-pages.test.js`

- [ ] **Step 1: Update the twelve matrix rows**

For each localized Home, About and Products row, record:

- owner role: brand gateway, company fact owner or product taxonomy owner;
- approved fact sources: Company Fact Pack and shared organization identity;
- implementation action: localized visible facts plus matching JSON-LD;
- preserved boundaries: no current complete-tricycle supply and future motorcycle/CKD/SKD preparation-only;
- validation: one H1, self canonical, hreflang, JSON-LD parse, mobile/RTL and integration preservation.

- [ ] **Step 2: Add matrix coverage assertions**

Extend the test so every scoped canonical URL has a traceable matrix row containing `multilingual owner contract`.

- [ ] **Step 3: Run the focused suite**

```powershell
node --test tests/multilingual-core-owner-pages.test.js
```

Expected: all multilingual owner tests PASS.

- [ ] **Step 4: Commit governance records**

```powershell
git add docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv tests/multilingual-core-owner-pages.test.js
git commit -m "docs: trace multilingual owner page changes"
```

---

### Task 7: Full verification and visual acceptance preparation

**Files:**

- Verify all files changed since `origin/main`.

- [ ] **Step 1: Parse every JSON-LD block and validate local image paths**

```powershell
node --test tests/multilingual-core-owner-pages.test.js
```

Expected: all focused tests PASS with zero failures.

- [ ] **Step 2: Run the complete repository suite**

```powershell
node --test tests/*.test.js workers/contact-api/test/contact-handler.test.mjs
```

Expected: all repository tests PASS; the Worker negative-delivery fixture may print its expected sender-domain error while the test remains green.

- [ ] **Step 3: Run static diff checks**

```powershell
git diff --check origin/main...HEAD
git status --short
git diff --name-only origin/main...HEAD
```

Expected: no whitespace errors; only the approved design/plan, twelve pages, one test file and page matrix are tracked changes. `PRODUCTION_ACCEPTANCE_FINAL_REPORT.md` and `outputs/` remain untracked and untouched.

- [ ] **Step 4: Run responsive preview QA**

Serve the branch locally and verify all twelve pages at:

- 390×844;
- 768×1024;
- 1024×1366;
- 1440×1000.

For each page verify one visible H1, no horizontal overflow, no clipped buttons, readable product cards and correct Arabic RTL behavior.

- [ ] **Step 5: Commit any test-only corrections**

If verification requires a scoped test or CSS correction, add only the affected approved files and commit with:

```powershell
git commit -m "test: verify multilingual owner pages"
```

Do not create an empty commit when no correction is required.

---

### Task 8: Push one Draft PR and provide twelve previews

**Files:**

- No new production files.

- [ ] **Step 1: Push the feature branch**

```powershell
git push -u origin feature/multilingual-core-owner-pages
```

- [ ] **Step 2: Create one Draft PR**

Create a Draft PR against `main` titled:

`Align multilingual core owner pages with approved company facts`

The body must list the twelve pages, current/future supply boundary, shared Organization `@id`, preserved integrations, full test result, responsive result and rollback instructions.

- [ ] **Step 3: Wait for Cloudflare preview success**

Confirm the latest PR commit has a successful Workers build. Do not merge.

- [ ] **Step 4: Deliver twelve review links**

Using the branch preview host, provide:

- `/ru/`, `/ru/about`, `/ru/products`;
- `/es/`, `/es/about`, `/es/products`;
- `/pt/`, `/pt/about`, `/pt/products`;
- `/ar/`, `/ar/about`, `/ar/products`.

The site owner performs final visible-language and mobile acceptance before authorizing merge.
