# Full-Site GEO Entity Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align approved Chixiang company and engine-family facts across all 51 canonical pages and the noindex product utility, with complete local visual previews and no deployment.

**Architecture:** Keep the fact CSV files authoritative, add an exact 51-row page-change matrix, and protect every public claim with dependency-free Node tests before editing HTML or shared data. Apply content-only changes in four risk-ordered commits, then capture local desktop and mobile screenshots for every canonical page using headless Microsoft Edge; no push, PR, Cloudflare build, or deployment is permitted.

**Tech Stack:** Static HTML/CSS/JavaScript, UTF-8 CSV, Node.js built-in test runner, PowerShell, Python static server, headless Microsoft Edge.

---

### Task 1: Establish the isolated implementation branch and baseline

**Files:**
- Reference: `docs/superpowers/specs/2026-07-30-full-site-geo-entity-alignment-design.md`
- Reference: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Reference: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Verify the linked worktree and current documentation branch**

Run:

```powershell
git rev-parse --git-dir
git rev-parse --git-common-dir
git rev-parse --show-superproject-working-tree
git branch --show-current
git status --short
```

Expected: Git dir contains `.git/worktrees/`, common dir is the main repository `.git`, no superproject is returned, branch is `docs/geo-fact-calibration`, and status is clean.

- [ ] **Step 2: Create the local implementation branch without pushing**

Run:

```powershell
git switch -c feature/geo-entity-owner-pages
git branch --show-current
```

Expected: `feature/geo-entity-owner-pages`.

- [ ] **Step 3: Run the complete baseline test suites**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$siteTests = Get-ChildItem tests -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName
& $node --test $siteTests
$workerTests = Get-ChildItem workers\contact-api\test -Filter '*.test.mjs' -File | Select-Object -ExpandProperty FullName
& $node --test $workerTests
```

Expected: all current site and Worker tests pass with zero failures. If either suite fails, stop before content changes.

### Task 2: Promote approved product-family facts without creating model specifications

**Files:**
- Create: `tests/geo-fact-governance.test.js`
- Modify: `docs/geo-entity/fact-calibration/FACT_CALIBRATION_GUIDE.md`
- Modify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`
- Modify: `docs/geo-entity/fact-calibration/FACT_CALIBRATION_WRITEBACK_REPORT.md`

- [ ] **Step 1: Write the failing family-governance test**

Create `tests/geo-fact-governance.test.js` with these behaviors:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

const records = parseCsv(read('docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv'));
const promotedIds = [
  'intake-cg-balance-shaft',
  'intake-tsunami-water',
  'intake-hanwei-hw-water',
  'intake-automatic-clutch-water'
];

test('approved family claims use FAMILY scope and never invent model-level numeric specifications', () => {
  for (const id of promotedIds) {
    const record = records.find(item => item.spec_id === id);
    assert.ok(record, id);
    assert.equal(record.record_scope, 'FAMILY', id);
    assert.equal(record.approval_status, 'APPROVED_PUBLIC', id);
    assert.equal(record.visibility, 'PUBLIC', id);
    assert.equal(record.approved_by, 'Site Owner', id);
    assert.match(record.evidence_sources, /owner-confirmation:2026-07-30/, id);
    for (const field of ['actual_displacement_cc', 'bore_mm', 'stroke_mm']) {
      assert.equal(record[field], '', `${id}:${field}`);
    }
  }
});

test('HW family keeps the owner terminology and approved all-model configuration', () => {
  const hw = records.find(item => item.spec_id === 'intake-hanwei-hw-water');
  assert.match(hw.candidate_master_values, /1\.5 L/);
  assert.match(hw.candidate_master_values, /18级/);
  assert.match(hw.candidate_master_values, /20-roller/);
  assert.match(hw.reverse_configuration, /No built-in reverse/);
  assert.doesNotMatch(hw.candidate_master_values, /18-pole|18极/i);
});
```

- [ ] **Step 2: Run the governance test and verify RED**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\geo-fact-governance.test.js
```

Expected: FAIL because the four rows still use `FAMILY_INTAKE` and `APPROVED_INTERNAL_ONLY`.

- [ ] **Step 3: Update the governance rule**

Modify `FACT_CALIBRATION_GUIDE.md` so `record_scope` accepts:

```text
MODEL
CONFIGURATION
FAMILY
FAMILY_INTAKE
```

Add this exact rule:

```text
FAMILY records may publish only owner-approved family positioning, shared configurations and explicit limits. Empty model_code is allowed. FAMILY records must not populate unknown model displacement, bore, stroke, output, mounting or fitment values. FAMILY_INTAKE remains internal-only.
```

- [ ] **Step 4: Convert the four approved family rows**

Keep the stable `spec_id` values and set:

```text
record_scope=FAMILY
approval_status=APPROVED_PUBLIC
visibility=PUBLIC
approved_by=Site Owner
approved_date=2026-07-30
last_verified=2026-07-30
```

Use these approved family boundaries:

```text
CG balance-shaft: balance shaft for motorcycle applications; helps reduce single-cylinder vibration and improve running smoothness; no quantified lifetime claim.
Tsunami water-cooled: strengthened CG water-cooled family with cooling fins, enlarged oil capacity, improved heat dissipation, durability and sustained-load stability; no unapproved oil-volume number.
HW Water: HW200/HW250/HW300/HW350; 1.5 L oil capacity, 18级磁电机, 20-roller clutch, no built-in reverse; no model-level performance values.
Automatic-clutch water-cooled: CG150 and CG175 only; automatic-clutch family parallel to the built-in-reverse family; actual displacement follows the corresponding approved CG model and is not duplicated into this family row.
```

- [ ] **Step 5: Run the governance test and verify GREEN**

Run the Step 2 command.

Expected: 2 tests pass, 0 fail.

- [ ] **Step 6: Record the governance change**

Update `FACT_CALIBRATION_WRITEBACK_REPORT.md` with the four promoted family rows, their public boundaries, and the rule that `18级` remains Chinese owner terminology while public English uses `high-output magneto`.

- [ ] **Step 7: Commit the fact-governance change**

```powershell
git add tests/geo-fact-governance.test.js docs/geo-entity/fact-calibration
git commit -m "docs: approve bounded engine family claims"
```

### Task 3: Build the exact 51-page change matrix

**Files:**
- Create: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- Create: `tests/geo-page-matrix.test.js`

- [ ] **Step 1: Write the failing page-matrix test**

Create `tests/geo-page-matrix.test.js` with the complete parser and assertion code below:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const allowedClasses = new Set(['FACT_FIX', 'OWNER_ENHANCEMENT', 'TRANSLATION_SYNC', 'VERIFY_ONLY']);

test('page matrix covers every canonical sitemap URL exactly once', () => {
  const rows = parseCsv(read('docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv'));
  assert.equal(rows.length, 51);
  assert.equal(new Set(rows.map(row => row.url)).size, 51);
  assert.deepEqual([...rows.map(row => row.url)].sort(), [...sitemapUrls].sort());
  for (const row of rows) {
    assert.ok(allowedClasses.has(row.change_class), `${row.url}:${row.change_class}`);
    assert.ok(row.source_file, row.url);
    assert.ok(row.decision, row.url);
    if (row.change_class !== 'VERIFY_ONLY') assert.ok(row.source_fact_ids, row.url);
  }
});
```

- [ ] **Step 2: Run the matrix test and verify RED**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\geo-page-matrix.test.js
```

Expected: FAIL because `PAGE_CHANGE_MATRIX.csv` does not exist.

- [ ] **Step 3: Create the matrix with the exact schema**

Use this header exactly:

```text
page_id,url,source_file,language,page_type,entity_owner,change_class,source_fact_ids,current_claims,approved_replacement,translation_status,tracking_risk,form_risk,visual_risk,tests,preview_desktop,preview_mobile,decision,notes
```

Add the 51 sitemap URLs exactly once. Use these group decisions:

```text
Home, About, Products and CG across five languages: OWNER_ENHANCEMENT
CB, Horizontal and Engine Parts across five languages: FACT_FIX when company/footer facts are present, otherwise VERIFY_ONLY
News and Contact across five languages: FACT_FIX when company/footer facts are present, otherwise VERIFY_ONLY
English procurement guide and cooling comparison: OWNER_ENHANCEMENT
Russia, Central Asia, Peru and Colombia market pages: FACT_FIX or OWNER_ENHANCEMENT according to existing claims
```

Use `HIGH` tracking risk for the five market/advertising pages and contact pages; `LOW` or `NONE` elsewhere. Use `HIGH` form risk only on pages containing a real inquiry form.

- [ ] **Step 4: Run the matrix test and verify GREEN**

Run the Step 2 command.

Expected: 1 test passes, 0 fail.

- [ ] **Step 5: Commit the matrix**

```powershell
git add docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv tests/geo-page-matrix.test.js
git commit -m "docs: map all canonical pages for GEO alignment"
```

### Task 4: Lock the required public wording with failing regression tests

**Files:**
- Create: `tests/geo-entity-alignment.test.js`

- [ ] **Step 1: Write the complete failing regression test**

Create `tests/geo-entity-alignment.test.js` with this content:

```javascript
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
```

- [ ] **Step 2: Run the content test and verify RED**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\geo-entity-alignment.test.js
```

Expected: FAIL on the current 2003 company wording, `CG150B`, `18-pole`, Hanwei naming and built-in-reverse claims.

### Task 5: Correct company identity across all languages

**Files:**
- Modify: the 45 common-language HTML pages listed in sitemap groups Home, About, Products, News, Contact, CG, CB, Horizontal and Engine Parts
- Modify: `ru/gorizontalnyj-dvigatel.html`
- Modify: `ru/central-asia/index.html`

- [ ] **Step 1: Replace false founding claims with approved language copy**

Use these meanings consistently:

```text
EN: Industry experience since 2003 · Company registered in 2007
ES: Experiencia en el sector desde 2003 · Empresa registrada en 2007
PT: Experiência no setor desde 2003 · Empresa registrada em 2007
RU: Опыт работы в отрасли с 2003 года · Компания зарегистрирована в 2007 году
AR: خبرة في القطاع منذ عام 2003 · تم تسجيل الشركة رسميًا عام 2007
```

Update Title, Description, H1, hero, stats, image alt text and footer only where the current wording means the company itself was founded in 2003. Retain truthful standalone experience wording.

- [ ] **Step 2: Keep certification wording within its approved boundary**

Replace `ISO 9001-2000` with `ISO 9001`. Keep CCC as availability or certification support language; do not write certificate numbers, validity dates or all-model coverage.

- [ ] **Step 3: Remove obsolete logo references**

Replace public `/images/logo.png` references with `/images/logo.webp`. Do not change the visual logo component or image dimensions.

- [ ] **Step 4: Run the alignment test and inspect the remaining RED failures**

Run Task 4 Step 2.

Expected: company-identity assertions pass; product-family assertions still fail.

- [ ] **Step 5: Run existing SEO tests**

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\foundation-seo.test.js tests\foundation-routing.test.js
```

Expected: all selected tests pass.

- [ ] **Step 6: Commit the company corrections**

```powershell
git add en es pt ru ar tests/geo-entity-alignment.test.js
git commit -m "fix: align company identity across languages"
```

### Task 6: Correct and strengthen product-family content

**Files:**
- Modify: `en/products.html`
- Modify: `es/products.html`
- Modify: `pt/products.html`
- Modify: `ru/products.html`
- Modify: `ar/products.html`
- Modify: `en/product-detail.html`
- Modify: `en/cg-engine.html`
- Modify: `es/motor-cg.html`
- Modify: `pt/motor-cg.html`
- Modify: `ru/dvigatel-cg.html`
- Modify: `ar/cg-engine.html`
- Modify: `en/how-to-choose-motorcycle-engine-manufacturer-china.html`

- [ ] **Step 1: Apply the approved HW Water copy in five languages**

Use `HW Water` as the heading and Hanwei/CG Heavy only as aliases. Preserve the approved meaning:

```text
EN: HW Water 200–350cc. Heavy-duty water-cooled series with a 1.5 L oil capacity, 20-roller clutch and high-output magneto. No built-in reverse.
ES: HW Water 200–350 cc. Serie refrigerada por agua para trabajo pesado, con capacidad de aceite de 1,5 L, embrague de 20 rodillos y magneto de alta salida. Sin reversa interna.
PT: HW Water 200–350 cc. Série refrigerada a água para trabalho pesado, com capacidade de óleo de 1,5 L, embreagem de 20 roletes e magneto de alta saída. Sem marcha à ré interna.
RU: HW Water 200–350 см³. Усиленная серия с водяным охлаждением, объёмом масла 1,5 л, 20-роликовой муфтой и магнето повышенной мощности. Без встроенного реверса.
AR: HW Water سعة 200–350 سم³. سلسلة مبردة بالماء للأحمال الثقيلة، بسعة زيت 1.5 لتر وقابض من 20 بكرة ومغناطيس توليد عالي الخرج، من دون ترس رجوع داخلي.
```

- [ ] **Step 2: Correct the noindex Hanwei utility block**

In `en/product-detail.html`:

```text
name = HW Water Series Heavy-Duty Water-Cooled Engine
tags include Heavy-Duty, 200–350cc, Water-Cooled, 20-Roller Clutch, High-Output Magneto, No Built-In Reverse
description includes 1.5 L oil capacity, cooling fins, heavy-duty internal components and sustained-load use
features explicitly say no built-in reverse
```

Remove `18-pole`, `Reverse Gear`, `no slipping`, `eliminates overheating risk` and other unapproved absolute or quantified claims.

- [ ] **Step 3: Correct CG water-cooled naming**

Replace `CG150B` with `CG150SB`. Describe built-in reverse as an order/configuration option, not included on every CG water-cooled engine.

- [ ] **Step 4: Bound the balance-shaft claims**

Use this English core sentence and faithful translations:

```text
A balance shaft helps reduce single-cylinder vibration and improve running smoothness for motorcycle applications.
```

Remove `2x longer engine lifespan`, `dramatically reduced vibration`, `superior smoothness` and unverified universal-parts claims.

- [ ] **Step 5: Bound the Tsunami and automatic-clutch claims**

Tsunami must describe cooling fins, enlarged oil capacity, stronger heat dissipation, durability and sustained-load stability without an unapproved oil-volume number. Automatic clutch must list CG150 and CG175 only and remain distinct from the built-in-reverse configuration family.

- [ ] **Step 6: Run the alignment test and verify product GREEN**

Run Task 4 Step 2.

Expected: company and product-family assertions pass, 0 fail.

- [ ] **Step 7: Commit the product-family changes**

```powershell
git add en es pt ru ar tests/geo-entity-alignment.test.js
git commit -m "fix: align engine family claims across languages"
```

### Task 7: Align market pages without changing conversion behavior

**Files:**
- Modify: `js/latam-cg-products.js`
- Modify: `js/central-asia-data.js` only if its HW family facts conflict
- Modify: `es/peru/index.html` only for raw HTML entity text or metadata
- Modify: `es/colombia/index.html` only for raw HTML entity text or metadata
- Modify: `ru/central-asia/index.html` only for approved factual wording
- Modify: `ru/russia/index.html` only for approved factual wording
- Modify: `ru/gorizontalnyj-dvigatel.html` only for approved company wording

- [ ] **Step 1: Correct shared LatAm HW data**

For HW200/HW250/HW300/HW350, set the family name to `HW Water`, remove any `reverse according to model` or built-in-reverse claim, and use the approved shared family configuration. Do not infer model-level power, torque, mounting or fitment.

- [ ] **Step 2: Preserve market-specific positioning**

Keep Peru, Colombia, Russia and Central Asia market statements limited to their existing supported direction. Do not copy MOQ, logistics, WhatsApp priority or country demand claims between pages.

- [ ] **Step 3: Run market and conversion tests**

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\latam-cg-landing.test.js tests\latam-cg-interactions.test.js tests\central-asia-landing.test.js tests\central-asia-interactions.test.js tests\russia-horizontal-engine-landing.test.js tests\russia-horizontal-engine-interactions.test.js tests\russia-form.test.js tests\yandex-metrica.test.js tests\whatsapp-conversion.test.js tests\geo-entity-alignment.test.js
```

Expected: all selected tests pass with zero failures.

- [ ] **Step 4: Commit market consistency changes**

```powershell
git add js/latam-cg-products.js js/central-asia-data.js es/peru/index.html es/colombia/index.html ru/central-asia/index.html ru/russia/index.html ru/gorizontalnyj-dvigatel.html tests/geo-entity-alignment.test.js
git commit -m "fix: align market page entity facts"
```

### Task 8: Complete all-page SEO, language and no-change verification

**Files:**
- Modify: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- Create: `docs/geo-entity/phase-6-1b/GEO_CONTENT_CHANGE_LOG.md`
- Modify: `tests/geo-entity-alignment.test.js`

- [ ] **Step 1: Verify every matrix row against the final diff**

Set each row decision to one of:

```text
CHANGED
VERIFIED_NO_CHANGE
UTILITY_ONLY
```

Populate `preview_desktop` and `preview_mobile` with the stable output paths defined in Task 10. Pages not changed must remain `VERIFIED_NO_CHANGE`; do not manufacture a content edit merely to avoid that label.

- [ ] **Step 2: Add final cross-language checks**

Extend `tests/geo-entity-alignment.test.js` to assert:

```text
one H1 per canonical source page
no public HW reverse or 18-pole wording
no CG150B model token
no false company-founded-in-2003 wording
all 51 pages preserve canonical and expected hreflang groups
the noindex product utility remains absent from sitemap
```

- [ ] **Step 3: Write the content change log**

`GEO_CONTENT_CHANGE_LOG.md` must list changed files grouped by company facts, product facts, market facts and verify-only pages. It must explicitly state that layout, URLs, tracking, form, Worker, schema, sitemap and robots behavior were not changed.

- [ ] **Step 4: Run the complete site and Worker suites**

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$siteTests = Get-ChildItem tests -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName
& $node --test $siteTests
$workerTests = Get-ChildItem workers\contact-api\test -Filter '*.test.mjs' -File | Select-Object -ExpandProperty FullName
& $node --test $workerTests
```

Expected: all site and Worker tests pass, zero failures.

- [ ] **Step 5: Commit the all-page verification artifacts**

```powershell
git add docs/geo-entity/phase-6-1b tests/geo-entity-alignment.test.js
git commit -m "test: verify full-site entity alignment"
```

### Task 9: Capture local previews for all 51 canonical pages

**Files:**
- Create: `scripts/capture-geo-previews.mjs`
- Create: `scripts/build-preview-contact-sheets.py`
- Create locally, do not commit: `outputs/phase-6-1b-preview/`

- [ ] **Step 1: Create a dependency-free capture script**

Create `scripts/capture-geo-previews.mjs`:

```javascript
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, '..');
const outputRoot = path.join(root, 'outputs', 'phase-6-1b-preview');
const safeParent = `${path.join(root, 'outputs')}${path.sep}`;
if (!outputRoot.startsWith(safeParent)) throw new Error(`unsafe output path: ${outputRoot}`);

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!fs.existsSync(edge)) throw new Error(`Microsoft Edge not found: ${edge}`);

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
const profile = path.join(outputRoot, '.edge-profile');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (urls.length !== 51) throw new Error(`expected 51 sitemap URLs, got ${urls.length}`);

const tabletPaths = new Set([
  '/ru/russia/',
  '/ru/central-asia/',
  '/ru/gorizontalnyj-dvigatel',
  '/es/peru/',
  '/es/colombia/'
]);
const baseViewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
];
const tabletViewports = [
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-1024', width: 1024, height: 1366 }
];

function sourceFor(pathname) {
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function slugFor(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '') || 'root';
  return clean.replaceAll('/', '__');
}

let captured = 0;
for (const rawUrl of urls) {
  const pathname = new URL(rawUrl).pathname;
  const source = sourceFor(pathname);
  if (!fs.existsSync(path.join(root, source))) throw new Error(`missing source: ${source}`);
  const language = pathname.split('/').filter(Boolean)[0];
  const targetDir = path.join(outputRoot, language);
  fs.mkdirSync(targetDir, { recursive: true });
  const viewports = tabletPaths.has(pathname) ? [...baseViewports, ...tabletViewports] : baseViewports;

  for (const viewport of viewports) {
    const target = path.join(targetDir, `${slugFor(pathname)}--${viewport.name}.png`);
    const localUrl = `http://127.0.0.1:8123/${source.replaceAll('\\', '/')}`;
    const result = spawnSync(edge, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=3000',
      `--user-data-dir=${profile}`,
      `--window-size=${viewport.width},${viewport.height}`,
      `--screenshot=${target}`,
      localUrl
    ], { encoding: 'utf8', timeout: 30000 });
    if (result.status !== 0) throw new Error(`${pathname}:${viewport.name}\n${result.stderr}`);
    const size = fs.statSync(target).size;
    if (size < 10000) throw new Error(`suspicious screenshot ${target}: ${size} bytes`);
    captured += 1;
  }
}

fs.rmSync(profile, { recursive: true, force: true });
if (captured !== 112) throw new Error(`expected 112 screenshots, got ${captured}`);
console.log(`captured ${captured} screenshots in ${outputRoot}`);
```

- [ ] **Step 2: Create the contact-sheet generator**

Create `scripts/build-preview-contact-sheets.py`:

```python
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_ROOT = ROOT / "outputs" / "phase-6-1b-preview"
CONTACT_ROOT = PREVIEW_ROOT / "contact-sheets"
CONTACT_ROOT.mkdir(parents=True, exist_ok=True)
FONT = ImageFont.load_default()

for language in ("en", "ru", "es", "pt", "ar"):
    files = sorted((PREVIEW_ROOT / language).glob("*--desktop.png"))
    if not files:
        raise RuntimeError(f"no desktop previews for {language}")
    columns = 3
    thumb_w, thumb_h, label_h, gap = 360, 250, 34, 18
    rows = (len(files) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * (thumb_w + gap) + gap, rows * (thumb_h + label_h + gap) + gap), "#111827")
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(files):
        image = Image.open(file).convert("RGB")
        image.thumbnail((thumb_w, thumb_h))
        x = gap + (index % columns) * (thumb_w + gap)
        y = gap + (index // columns) * (thumb_h + label_h + gap)
        sheet.paste(image, (x, y))
        draw.text((x, y + thumb_h + 8), file.stem.replace("--desktop", ""), fill="white", font=FONT)
    sheet.save(CONTACT_ROOT / f"{language}-desktop-contact-sheet.png", optimize=True)

print(f"created 5 contact sheets in {CONTACT_ROOT}")
```

- [ ] **Step 3: Start the local server invisibly**

Run:

```powershell
$python = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$server = Start-Process -FilePath $python -ArgumentList '-m','http.server','8123','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
```

Expected: a local process ID is returned. This is not an external deployment.

- [ ] **Step 4: Capture all screenshots and contact sheets**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node scripts\capture-geo-previews.mjs
$python = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
& $python scripts\build-preview-contact-sheets.py
```

Expected: 102 desktop/mobile PNGs, 10 additional tablet PNGs and 5 language contact sheets, with no missing-file errors.

- [ ] **Step 5: Stop the local server**

Run:

```powershell
Stop-Process -Id $server.Id
```

Expected: only the local server process is stopped.

- [ ] **Step 6: Visually inspect every language group**

Open at least the Home, About, Products, CG, Contact and market pages from each applicable language. Inspect all remaining thumbnails for blank pages, clipped copy, missing images or obvious RTL errors. Any discovered defect requires a failing regression test before correction.

- [ ] **Step 7: Commit only the reusable capture scripts**

```powershell
git add scripts/capture-geo-previews.mjs scripts/build-preview-contact-sheets.py
git commit -m "test: add local full-site preview capture"
```

Do not add `outputs/phase-6-1b-preview/` to Git.

### Task 10: Produce the local acceptance report and stop before deployment

**Files:**
- Create: `docs/geo-entity/phase-6-1b/LOCAL_ACCEPTANCE_REPORT.md`

- [ ] **Step 1: Run fresh final verification**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$siteTests = Get-ChildItem tests -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName
& $node --test $siteTests
$workerTests = Get-ChildItem workers\contact-api\test -Filter '*.test.mjs' -File | Select-Object -ExpandProperty FullName
& $node --test $workerTests
git diff --check
git status --short
git log --oneline --decorate -10
```

Expected: both suites pass, `git diff --check` exits 0, and only intended local branch changes are present.

- [ ] **Step 2: Write the acceptance report from observed evidence**

Record:

```text
branch and commit list
51-page matrix count
changed versus verified-no-change counts
site and Worker test totals
protected tracking/form files
preview image count and output directory
known unresolved 152FMH issue
explicit confirmation that no push, PR, merge or deployment occurred
```

- [ ] **Step 3: Commit the report**

```powershell
git add docs/geo-entity/phase-6-1b/LOCAL_ACCEPTANCE_REPORT.md
git commit -m "docs: report local GEO alignment acceptance"
```

- [ ] **Step 4: Stop and hand preview control to the user**

Do not run `git push`, `gh pr create`, `wrangler deploy`, Cloudflare commands or merge commands. Provide the local preview directory and representative clickable image links for user review.
