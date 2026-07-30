# English Core Owner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the English homepage, About page, and Products page into distinct company, brand, and product owner pages while correcting future motorcycle and complete-tricycle claims.

**Architecture:** Keep the existing static HTML/CSS/JavaScript architecture. Add one focused Node test contract, update active fact-governance records, then make bounded raw-HTML changes to the three pages. Use one stable Organization `@id`, truthful current-versus-future product status, and existing contact routes without touching conversion code.

**Tech Stack:** Static HTML5, existing `css/style.css`, Schema.org JSON-LD, Node.js built-in test runner, CSV/Markdown governance files.

---

## File Map

| File | Responsibility |
| --- | --- |
| `tests/english-core-owner-pages.test.js` | Enforces headings, page ownership, product-status truthfulness, structured-data boundaries, and Made-in-China exclusion. |
| `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv` | Active approved company fact source. |
| `docs/geo-entity/GEO_ENTITY_MATRIX.csv` | Active entity ownership and status matrix. |
| `docs/geo-entity/GEO_ENTITY_AUDIT.md` | Historical audit with an explicit exclusion note. |
| `en/index.html` | Brand summary, current product-family entry point, compact trust evidence, primary inquiry path. |
| `en/about.html` | Detailed legal company, history, factory, quality, and certification owner. |
| `en/products.html` | Current product taxonomy plus one clearly separated future motorcycle/CKD/SKD program. |
| `css/style.css` | Small status-card styling only; no redesign. |

## Task 1: Add the English Owner-Page Contract

**Files:**
- Create: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Write the failing contract test**

Create `tests/english-core-owner-pages.test.js`:

```js
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
});

test('About is the detailed company fact owner', () => {
  const html = read('en/about.html');
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
});

test('Products separates current supply from the future vehicle program', () => {
  const html = read('en/products.html');
  assert.match(html, /Motorcycles &amp; CKD\/SKD Kits/);
  const future = futureCard(html);
  assert.match(future, /In Preparation/);
  assert.match(future, /Specifications and wholesale availability will be published after production approval\./);
  assert.doesNotMatch(future, /Get Quote|Request Quote|MOQ|US\$|\$\d|three months|3 months/i);
  assert.doesNotMatch(html, /<h3>Tricycles<\/h3>/);
  assert.doesNotMatch(html, /Complete Tricycle|complete-vehicle/i);
  assert.match(html, /cargo-tricycle engine/i);
});

test('structured data uses one stable company identity and no invented product commerce data', () => {
  const home = read('en/index.html');
  const about = read('en/about.html');
  const products = read('en/products.html');

  assert.equal((home.match(/"@type"\s*:\s*"Organization"/g) || []).length, 1);
  assert.match(home, /"@id"\s*:\s*"https:\/\/chixiangmotor\.com\/#organization"/);
  assert.match(about, /"@id"\s*:\s*"https:\/\/chixiangmotor\.com\/#organization"/);
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
  assert.doesNotMatch(
    read('docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv'),
    /made-in-china/i
  );
  assert.doesNotMatch(
    read('docs/geo-entity/GEO_ENTITY_MATRIX.csv'),
    /made-in-china/i
  );
  assert.match(
    read('docs/geo-entity/GEO_ENTITY_AUDIT.md'),
    /Made-in-China profile is excluded and is not evidence/i
  );
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js
```

Expected: FAIL on the old H1 values, homepage motorcycle card, complete-tricycle card, missing future status, duplicate Organization JSON-LD, and active Made-in-China references.

- [ ] **Step 3: Commit the failing test**

```powershell
git add tests/english-core-owner-pages.test.js
git commit -m "test: define English owner page contract"
```

## Task 2: Remove Made-in-China From Active Fact Governance

**Files:**
- Modify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Modify: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md:100-115`
- Test: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Update the active Company Fact Pack**

For these record IDs:

```text
identity-legal-name-en
history-founded-year
address-registered
address-factory
capability-research-development
profile-approved-short
profile-approved-long
```

Apply these exact governance rules:

```text
external_values:
  Remove every Made-in-China-derived value.

evidence_sources:
  Remove every made-in-china.com URL.
  Retain official-site, repo, and owner-confirmation sources.

conflict_notes:
  Remove supplier-profile comparisons.
  Keep only owner-approved distinctions, such as:
  "2003 is industry experience; the current company was registered in 2007."
  "Gaoteng Avenue / Hangu Town is the approved current location."
```

Do not change the approved public value, visibility, approver, or approval date.

- [ ] **Step 2: Update the active entity matrix**

Change the `org-chongqing-chixiang` row to:

```text
evidence_status: VERIFIED
evidence_visibility: PUBLIC
evidence_sources: https://chixiangmotor.com/en/about | https://chixiangmotor.com/en/ | owner-confirmation:2026-07-30
last_verified: 2026-07-30
owner_url: https://chixiangmotor.com/en/about
current_index_status: INDEXABLE_OWNER
entity_readiness: READY
content_gaps: Keep legal name, timeline, current address, and capability wording synchronized through the approved Company Fact Pack.
conflicts:
recommended_action: ENHANCE_EXISTING
decision_reason: Owner-approved company timeline and current location govern the public entity; the uncontrolled supplier profile is excluded.
```

Remove the Made-in-China URL and every claim that it creates an active conflict.

- [ ] **Step 3: Preserve historical traceability without treating it as evidence**

Replace the historical audit comparison at `docs/geo-entity/GEO_ENTITY_AUDIT.md:108` with:

```markdown
> Governance update (2026-07-30): The Made-in-China profile is excluded and is not evidence because it is not controlled by the company. Current company facts are governed by site-owner confirmation and the active Company Fact Pack.
```

- [ ] **Step 4: Run governance tests**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js tests/geo-fact-governance.test.js
```

Expected: the Made-in-China test passes; page tests remain failing until Tasks 3–6.

- [ ] **Step 5: Commit governance changes**

```powershell
git add docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv docs/geo-entity/GEO_ENTITY_MATRIX.csv docs/geo-entity/GEO_ENTITY_AUDIT.md
git commit -m "docs: exclude uncontrolled supplier profile"
```

## Task 3: Strengthen the English Homepage Owner Role

**Files:**
- Modify: `en/index.html:16-90`
- Modify: `en/index.html:150-340`
- Test: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Replace homepage metadata and hero copy**

Use:

```html
<title>Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in China | Chixiang Motor</title>
<meta name="description" content="Chixiang Motor manufactures CG, CB, horizontal, water-cooled, cargo-tricycle and ATV engines in Chongqing for distributors, importers and vehicle assemblers.">
```

Replace the visible hero content with:

```html
<h1 class="hero-brand-headline">Motorcycle &amp; Cargo-Tricycle Engine Manufacturer in China</h1>
<p class="hero-brand-trust">CG, CB, horizontal, water-cooled and ATV engine programs for distributors, importers and vehicle assemblers.</p>
<div class="hero-cta">
  <a href="/en/contact" class="btn btn-accent btn-lg">Send Inquiry</a>
  <a href="/en/products" class="btn btn-outline-light btn-lg">View Products</a>
</div>
<p class="hero-brand-since">Industry experience since 2003 &nbsp;·&nbsp; 8,000+ engines monthly &nbsp;·&nbsp; Exported to 50+ countries &nbsp;·&nbsp; ISO 9001</p>
```

- [ ] **Step 2: Correct the current product-family grid**

Keep the current engine and parts cards. Remove the complete-motorcycle card containing:

```html
<h3>Motorcycles</h3>
```

Keep the cargo-tricycle engine card, rename it exactly:

```html
<h3>Cargo-Tricycle Engines</h3>
```

Use current-product-only section copy:

```html
<p class="section-subtitle">Current engine and parts programs for international wholesale, assembly and replacement markets.</p>
```

Do not add the future motorcycle program to this page.

- [ ] **Step 3: Make the compact trust section point to the detailed owners**

Keep the four approved homepage trust concepts:

```text
Industry experience since 2003
8,000+ engines monthly capacity
OEM / ODM support
Exported to 50+ countries
```

Add owner links:

```html
<a href="/en/about" class="btn btn-outline">About Our Factory</a>
<a href="/en/products" class="btn btn-outline">Explore Engine Programs</a>
```

- [ ] **Step 4: Run the homepage contract**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js
```

Expected: homepage test passes; About, Products, schema, and any remaining governance assertions may still fail.

- [ ] **Step 5: Commit the homepage**

```powershell
git add en/index.html
git commit -m "feat: strengthen English homepage entity"
```

## Task 4: Make About the Visible Company Fact Owner

**Files:**
- Modify: `en/about.html:15-270`
- Test: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Replace metadata and make the H1 visible**

Use:

```html
<title>About Chixiang Motor | Motorcycle Engine Factory in Chongqing</title>
<meta name="description" content="Learn about Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.: industry experience since 2003, company registration in 2007, a 15,000 m² Chongqing factory, engine production, testing and export support.">
```

Replace the screen-reader-only H1 with:

```html
<h1>About Chixiang Motor: Motorcycle Engine Factory in Chongqing</h1>
```

- [ ] **Step 2: Publish the approved company identity panel**

Add visible raw-HTML facts:

```html
<dl class="company-facts">
  <div><dt>Brand</dt><dd>CHIXIANG MOTOR</dd></div>
  <div><dt>Legal Company</dt><dd>Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.</dd></div>
  <div><dt>Industry Experience</dt><dd>Since 2003</dd></div>
  <div><dt>Company Registration</dt><dd>2007</dd></div>
  <div><dt>Current Location</dt><dd>Hangu Town, Jiulongpo District, Chongqing, China</dd></div>
</dl>
```

Use this approved summary:

```html
<p>Chixiang Motor is the public-facing brand of Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. We have worked in the motorcycle engine industry since 2003, and the current company was registered in 2007.</p>
```

- [ ] **Step 3: Publish the complete approved factory facts**

Present:

```text
15,000 m² factory area
8,000+ engines per month
99% first-pass yield
Exported to 50+ countries
```

Add the approved address exactly:

```text
No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China
```

- [ ] **Step 4: Narrow certification copy**

Use exactly:

```html
<p>ISO 9001 quality management system certified.</p>
<p>CCC-certified products are available. Certification scope and applicable models are confirmed for each order.</p>
```

Remove any ISO version, certificate number, all-products CCC implication, or unsupported certification details.

- [ ] **Step 5: Make the inquiry path primary**

Use:

```html
<a href="/en/contact" class="btn btn-accent btn-lg">Send Inquiry</a>
<a href="/en/products" class="btn btn-outline btn-lg">View Products</a>
```

- [ ] **Step 6: Run the About contract**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js
```

Expected: About test passes; Products and schema tests may still fail.

- [ ] **Step 7: Commit the About page**

```powershell
git add en/about.html
git commit -m "feat: make About the company fact owner"
```

## Task 5: Separate Current Products From Future Vehicle Programs

**Files:**
- Modify: `en/products.html:15-340`
- Modify: `css/style.css`
- Test: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Replace Products metadata and introduction**

Use:

```html
<title>Motorcycle Engines, Parts &amp; Vehicle Programs | Chixiang Motor</title>
<meta name="description" content="Explore Chixiang Motor horizontal, CG, CB, water-cooled, ATV and cargo-tricycle engine programs, engine parts, and the future motorcycle and CKD/SKD program.">
```

Use the approved H1 and status explanation:

```html
<h1>Motorcycle Engines, Parts, Motorcycles &amp; CKD/SKD Programs</h1>
<p>Current wholesale supply covers motorcycle engines, cargo-tricycle engines and engine parts. Complete motorcycles and CKD/SKD kits are a separate product program in preparation.</p>
```

- [ ] **Step 2: Remove the unsupported complete-tricycle card**

Delete the card containing:

```html
<h3>Tricycles</h3>
```

Do not delete or weaken cargo-tricycle engine applications in CG or water-cooled engine copy.

- [ ] **Step 3: Replace the current motorcycle card with one future-program card**

Use:

```html
<article class="product-card product-card--future" data-category="future-vehicle">
  <div class="product-img" role="img" aria-label="Motorcycles and CKD/SKD kits product program in preparation" style="background-image:url('../images/%E6%91%A9%E6%89%98%E8%BD%A6/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240327163851.webp');background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#f4f6f8;">
    <span class="product-badge">In Preparation</span>
  </div>
  <div class="product-info">
    <h3>Motorcycles &amp; CKD/SKD Kits</h3>
    <p>This product program is in preparation. Specifications and wholesale availability will be published after production approval.</p>
  </div>
</article>
```

Do not add a link, quotation button, price, MOQ, launch estimate, model, specification, or availability claim to this card.

- [ ] **Step 4: Add bounded future-card styling**

Append to the existing product-card area in `css/style.css`:

```css
.product-card--future {
  border-style: dashed;
}

.product-card--future .product-badge {
  background: #5f6b7a;
}

.product-card--future .product-info p {
  color: var(--text-secondary);
}
```

Do not alter global card dimensions or desktop grid behavior.

- [ ] **Step 5: Run Products and mobile contract tests**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js tests/foundation-mobile.test.js
```

Expected: Products status tests and existing mobile tests pass; structured-data test may remain failing until Task 6.

- [ ] **Step 6: Commit Products changes**

```powershell
git add en/products.html css/style.css
git commit -m "feat: separate current and future product programs"
```

## Task 6: Align Structured Data With Page Ownership

**Files:**
- Modify: `en/index.html:35-90`
- Modify: `en/about.html` head
- Modify: `en/products.html` head
- Test: `tests/english-core-owner-pages.test.js`

- [ ] **Step 1: Replace duplicate homepage Organization scripts with one graph**

Use one JSON-LD block:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://chixiangmotor.com/#organization",
      "name": "CHIXIANG MOTOR",
      "alternateName": "Chixiang Motor",
      "legalName": "Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.",
      "url": "https://chixiangmotor.com/",
      "logo": "https://chixiangmotor.com/images/logo.webp",
      "foundingDate": "2007",
      "description": "Motorcycle and cargo-tricycle engine manufacturer in Chongqing with industry experience since 2003.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District",
        "addressLocality": "Chongqing",
        "addressCountry": "CN"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://chixiangmotor.com/#website",
      "url": "https://chixiangmotor.com/",
      "name": "CHIXIANG MOTOR",
      "publisher": {"@id": "https://chixiangmotor.com/#organization"},
      "inLanguage": "en"
    },
    {
      "@type": "WebPage",
      "@id": "https://chixiangmotor.com/en/#webpage",
      "url": "https://chixiangmotor.com/en/",
      "name": "Motorcycle & Cargo-Tricycle Engine Manufacturer in China",
      "isPartOf": {"@id": "https://chixiangmotor.com/#website"},
      "about": {"@id": "https://chixiangmotor.com/#organization"},
      "inLanguage": "en"
    }
  ]
}
</script>
```

Preserve existing visible phone and sales contact paths; do not add social profiles that are not approved.

- [ ] **Step 2: Add AboutPage ownership using the same Organization ID**

Use:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://chixiangmotor.com/#organization",
      "name": "CHIXIANG MOTOR",
      "legalName": "Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.",
      "url": "https://chixiangmotor.com/",
      "foundingDate": "2007"
    },
    {
      "@type": "AboutPage",
      "@id": "https://chixiangmotor.com/en/about#webpage",
      "url": "https://chixiangmotor.com/en/about",
      "name": "About Chixiang Motor: Motorcycle Engine Factory in Chongqing",
      "about": {"@id": "https://chixiangmotor.com/#organization"},
      "inLanguage": "en"
    }
  ]
}
</script>
```

- [ ] **Step 3: Add a current-category CollectionPage to Products**

Use only canonical current owner URLs:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://chixiangmotor.com/en/products#webpage",
  "url": "https://chixiangmotor.com/en/products",
  "name": "Motorcycle Engines, Parts, Motorcycles & CKD/SKD Programs",
  "inLanguage": "en",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "CG Engines", "url": "https://chixiangmotor.com/en/cg-engine"},
      {"@type": "ListItem", "position": 2, "name": "CB Engines", "url": "https://chixiangmotor.com/en/cb-engine"},
      {"@type": "ListItem", "position": 3, "name": "Horizontal Engines", "url": "https://chixiangmotor.com/en/horizontal-engine"},
      {"@type": "ListItem", "position": 4, "name": "Engine Parts", "url": "https://chixiangmotor.com/en/engine-parts"}
    ]
  }
}
</script>
```

Do not include the future motorcycle/CKD/SKD program in `ItemList`. Do not add `Product`, `Offer`, `Review`, or `AggregateRating`.

- [ ] **Step 4: Run the focused and full test suites**

Run:

```powershell
node --test tests/english-core-owner-pages.test.js
node --test tests/*.test.js workers/contact-api/test/contact-handler.test.mjs
```

Expected:

```text
Focused owner-page tests: all pass
Full suite: 189 existing tests plus the new tests, 0 failures
```

- [ ] **Step 5: Commit structured data**

```powershell
git add en/index.html en/about.html en/products.html
git commit -m "feat: align English owner page schema"
```

## Task 7: Visual and Regression Verification

**Files:**
- Verify: `en/index.html`
- Verify: `en/about.html`
- Verify: `en/products.html`
- Verify unchanged: `js/main.js`
- Verify unchanged: `js/yandex-metrica.js`
- Verify unchanged: `workers/contact-api/src/index.mjs`
- Verify preserved in `en/index.html`, `en/about.html`, and `en/products.html`: Google Ads tag `AW-16777656395` and Yandex Metrica counter `109483511`

- [ ] **Step 1: Start the static preview server**

Run:

```powershell
python -m http.server 8123
```

Expected: local server listens on `http://127.0.0.1:8123`.

- [ ] **Step 2: Capture required viewport checks**

Inspect each page at:

```text
390×844
768×1024
1024×1366
1440×900
```

Pages:

```text
http://127.0.0.1:8123/en/
http://127.0.0.1:8123/en/about.html
http://127.0.0.1:8123/en/products.html
```

Verify:

```text
one visible H1
no horizontal overflow
no CTA clipping
future status visible without relying on color
future card has no quote action
current product cards remain usable
header and footer remain visually consistent
```

- [ ] **Step 3: Validate final URLs and raw HTML**

Run:

```powershell
Select-String -Path en/index.html,en/about.html,en/products.html -Pattern '<h1','rel="canonical"','application/ld+json'
rg -n -i "made-in-china|three months|3 months|<h3>Tricycles</h3>|series=motorcycles" en docs/geo-entity
```

Expected:

```text
Each page: one approved visible H1 and self-canonical
Active governance: no Made-in-China references
Historical audit: one explicit exclusion note only
No launch estimate
No current complete-tricycle or complete-motorcycle route
```

- [ ] **Step 4: Confirm conversion-sensitive files are unchanged**

Run:

```powershell
git diff origin/main -- js/main.js js/yandex-metrica.js workers/contact-api/src/index.mjs
```

Expected: no output.

- [ ] **Step 5: Run final tests**

Run:

```powershell
node --test tests/*.test.js workers/contact-api/test/contact-handler.test.mjs
git diff --check
```

Expected: all tests pass and `git diff --check` reports no errors.

- [ ] **Step 6: Commit verification evidence if stored**

If screenshots or a Markdown verification report are intentionally added under `outputs/english-core-owner-pages-preview/`, commit only that bounded directory:

```powershell
git add outputs/english-core-owner-pages-preview
git commit -m "test: verify English owner pages"
```

Do not add unrelated existing files under `outputs/` or `PRODUCTION_ACCEPTANCE_FINAL_REPORT.md`.

## Task 8: Pull Request Handoff

**Files:**
- Verify all committed files from Tasks 1–7

- [ ] **Step 1: Review the final branch scope**

Run:

```powershell
git status --short
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: only the design, plan, focused tests, three English pages, bounded CSS, and active governance changes are in scope.

- [ ] **Step 2: Push and create a draft Pull Request**

Use title:

```text
English core owner pages and company entity alignment
```

The PR body must explain:

```text
- Home, About, and Products owner roles
- Made-in-China exclusion
- current cargo-tricycle engine status
- future motorcycle and CKD/SKD status
- structured-data boundaries
- automated and viewport test evidence
- no changes to forms, analytics, conversion logic, redirects, or country landing pages
```

- [ ] **Step 3: Stop before merge or production deployment**

Provide the preview URL and screenshots to the site owner. Do not merge or deploy until the owner explicitly approves the preview.
