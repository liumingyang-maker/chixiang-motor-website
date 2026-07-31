# Multilingual Product Family Owner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all 20 multilingual CG, CB, horizontal-engine and engine-parts owner pages to the approved public fact base without redesigning layouts or changing conversion behavior.

**Architecture:** A small content manifest defines the 20 route/language/family assignments and localized page vocabulary. A deterministic generator reads approved public records from `ENGINE_SPEC_MASTER.csv`, renders a managed raw-HTML owner block into the 19 standard family pages, and treats the bespoke Russian horizontal landing page as a protected verify-only implementation. Contract tests validate facts, language, links, Schema boundaries and conversion preservation.

**Tech Stack:** Static HTML5, Node.js CommonJS, Node built-in test runner, CSV fact governance, existing CSS classes and Cloudflare Workers preview.

---

## File map

| File | Responsibility |
| --- | --- |
| `scripts/product-family-owner-manifest.js` | Route, language, family and localized vocabulary contract for all 20 pages. |
| `scripts/apply-product-family-owner-content.js` | Load approved facts, render managed HTML and provide idempotent `--check`. |
| `tests/multilingual-product-family-owner-pages.test.js` | Protect page coverage, fact boundaries, language, internal links, Schema and the Russian conversion page. |
| `en/*.html`, `es/*.html`, `pt/*.html`, `ru/*.html`, `ar/*.html` | The 20 canonical product-family pages; 19 receive generated owner blocks and one Russian page is protected/verified. |
| `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv` | Record final product-family owner implementation state. |
| `docs/geo-entity/MULTILINGUAL_PRODUCT_FAMILY_REPORT.md` | Final scope, test, browser, preview and remaining-unknown report. |

### Task 1: Lock the 20-page contract with failing tests

**Files:**
- Create: `tests/multilingual-product-family-owner-pages.test.js`
- Read: `scripts/site-entity-manifest.js`
- Read: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Create the route and raw-HTML coverage test**

Define the expected routes exactly:

```js
const expected = {
  en: ['en/cg-engine.html', 'en/cb-engine.html', 'en/horizontal-engine.html', 'en/engine-parts.html'],
  es: ['es/motor-cg.html', 'es/motor-cb.html', 'es/motor-horizontal.html', 'es/repuestos-motor.html'],
  pt: ['pt/motor-cg.html', 'pt/motor-cb.html', 'pt/motor-horizontal.html', 'pt/pecas-de-motor.html'],
  ru: ['ru/dvigatel-cg.html', 'ru/dvigatel-cb.html', 'ru/gorizontalnyj-dvigatel.html', 'ru/zapchasti-dvigatelya.html'],
  ar: ['ar/cg-engine.html', 'ar/cb-engine.html', 'ar/horizontal-engine.html', 'ar/engine-parts.html']
};
```

Assert each file exists, occurs in `sitemap.xml`, has one H1, contains `data-product-family-owner`, and retains `data-site-entity-graph`.

- [ ] **Step 2: Add the approved-fact boundary assertions**

Parse `ENGINE_SPEC_MASTER.csv` with a local RFC-4180-capable helper and require every published model used by the generated contracts to have `approval_status=APPROVED_PUBLIC` and `visibility=PUBLIC`. Assert the managed block does not contain these unapproved legacy rows:

```js
const forbiddenLegacyRows = [
  'Peak Power', 'Maximum Horsepower', 'Max Power', 'Max Torque',
  'Net Weight', 'Gross Weight', 'Overall Dimensions', 'Package Dimensions',
  'Fuel Consumption', 'Min. Fuel Consumption'
];
```

Also reject `Product`, `ProductGroup`, `Offer`, `Review` and `AggregateRating` inside `data-site-entity-graph`.

- [ ] **Step 3: Add family-specific assertions**

Require:

```js
const horizontalModels = ['CX152FMH', 'CX153FMI', 'CX154FMI', 'CX1P56FMJ', 'CX1P60FMJ'];
const cbModels = ['CB150', 'CB200-C', 'CB250'];
const cgAirModels = ['CG125', 'CG150', 'CG175', 'CG200', 'CG250'];
const cgWaterModels = ['CG150SB', 'CG175SB', 'CG200SB', 'CG250SB'];
```

For every non-English horizontal page, require the CX codes and the label that YX is a market/search reference rather than the product brand. For all parts pages, require model/application confirmation language and forbid universal compatibility claims.

- [ ] **Step 4: Protect the bespoke Russian landing page**

Require `ru/gorizontalnyj-dvigatel.html` to retain these existing, verified contracts:

```js
[
  'class="rh-inquiry-form"',
  'action="/api/contact"',
  'name="source_form" value="russia_horizontal_engine_landing"',
  'data-whatsapp-fallback="false"',
  'AW-16777656395'
]
```

- [ ] **Step 5: Run the contract test and confirm it fails**

Run:

```powershell
node --test tests/multilingual-product-family-owner-pages.test.js
```

Expected: FAIL because the standard pages do not yet contain the managed owner marker and still publish unapproved legacy parameter rows.

- [ ] **Step 6: Commit the red test**

```powershell
git add tests/multilingual-product-family-owner-pages.test.js
git commit -m "test: define multilingual product family owner contract"
```

### Task 2: Add the deterministic manifest and generator

**Files:**
- Create: `scripts/product-family-owner-manifest.js`
- Create: `scripts/apply-product-family-owner-content.js`
- Test: `tests/multilingual-product-family-owner-pages.test.js`

- [ ] **Step 1: Define the 20 route assignments**

Export this stable shape from `scripts/product-family-owner-manifest.js`:

```js
const routes = [
  { file: 'en/cg-engine.html', language: 'en', family: 'cg' },
  { file: 'en/cb-engine.html', language: 'en', family: 'cb' },
  { file: 'en/horizontal-engine.html', language: 'en', family: 'horizontal' },
  { file: 'en/engine-parts.html', language: 'en', family: 'parts' },
  { file: 'es/motor-cg.html', language: 'es', family: 'cg' },
  { file: 'es/motor-cb.html', language: 'es', family: 'cb' },
  { file: 'es/motor-horizontal.html', language: 'es', family: 'horizontal' },
  { file: 'es/repuestos-motor.html', language: 'es', family: 'parts' },
  { file: 'pt/motor-cg.html', language: 'pt', family: 'cg' },
  { file: 'pt/motor-cb.html', language: 'pt', family: 'cb' },
  { file: 'pt/motor-horizontal.html', language: 'pt', family: 'horizontal' },
  { file: 'pt/pecas-de-motor.html', language: 'pt', family: 'parts' },
  { file: 'ru/dvigatel-cg.html', language: 'ru', family: 'cg' },
  { file: 'ru/dvigatel-cb.html', language: 'ru', family: 'cb' },
  { file: 'ru/gorizontalnyj-dvigatel.html', language: 'ru', family: 'horizontal', protected: true },
  { file: 'ru/zapchasti-dvigatelya.html', language: 'ru', family: 'parts' },
  { file: 'ar/cg-engine.html', language: 'ar', family: 'cg', dir: 'rtl' },
  { file: 'ar/cb-engine.html', language: 'ar', family: 'cb', dir: 'rtl' },
  { file: 'ar/horizontal-engine.html', language: 'ar', family: 'horizontal', dir: 'rtl' },
  { file: 'ar/engine-parts.html', language: 'ar', family: 'parts', dir: 'rtl' }
];
```

- [ ] **Step 2: Define localized vocabulary as data**

For every language provide actual localized strings for `approvedHeading`, `approvedIntro`, `model`, `nominalClass`, `actualDisplacement`, `boreStroke`, `cooling`, `start`, `clutch`, `gears`, `applications`, `orderChecklist`, `marketReference`, `relatedProducts`, `faqHeading`, three FAQ questions/answers, and the localized About/Products/Contact labels. Do not use English placeholders in non-English pages.

- [ ] **Step 3: Load and validate approved facts**

In `scripts/apply-product-family-owner-content.js`, implement:

```js
function approvedPublic(records, specId) {
  const record = records.find(row => row.spec_id === specId);
  if (!record) throw new Error(`Missing fact ${specId}`);
  if (record.approval_status !== 'APPROVED_PUBLIC' || record.visibility !== 'PUBLIC') {
    throw new Error(`Fact ${specId} is not approved for publication`);
  }
  return record;
}
```

Use the existing repository CSV parser pattern or implement a focused parser that preserves quoted commas and line breaks. Never split CSV records with `line.split(',')`.

- [ ] **Step 4: Render the managed raw-HTML owner block**

Render between stable comments:

```html
<!-- PRODUCT FAMILY OWNER START -->
<section class="section product-seo-detail" data-product-family-owner="cg" data-owner-language="en">
  ...approved visible content...
</section>
<section class="section" data-product-family-owner-faq="cg" style="background: var(--bg-secondary);">
  ...localized visible FAQ...
</section>
<!-- PRODUCT FAMILY OWNER END -->
```

Replace the existing content between `<!-- Product Detail SEO Content -->` and `<!-- /Product Detail SEO Content -->` on the 19 standard pages. Do not rewrite the bespoke Russian horizontal page; add or retain one non-visual `data-product-family-owner="horizontal"` attribute on an existing semantic container.

- [ ] **Step 5: Add idempotent CLI behavior**

Support:

```powershell
node scripts/apply-product-family-owner-content.js
node scripts/apply-product-family-owner-content.js --check
```

Normal mode writes changed files. `--check` prints the count of pages needing updates and exits non-zero when the count is non-zero.

- [ ] **Step 6: Run the generator twice**

Run:

```powershell
node scripts/apply-product-family-owner-content.js
node scripts/apply-product-family-owner-content.js --check
```

Expected: first run updates 20 page contracts; second run reports `0 product family pages need updates`.

- [ ] **Step 7: Run the focused tests**

```powershell
node --test tests/multilingual-product-family-owner-pages.test.js tests/site-entity-navigation-schema.test.js
```

Expected: the route/generator tests pass; any remaining family-specific assertion identifies the next task rather than being weakened.

- [ ] **Step 8: Commit the generator and generated baseline**

```powershell
git add scripts/product-family-owner-manifest.js scripts/apply-product-family-owner-content.js tests/multilingual-product-family-owner-pages.test.js en es pt ru ar
git commit -m "feat: generate multilingual product family owner content"
```

### Task 3: Verify and refine the CG and CB family contracts

**Files:**
- Modify: `scripts/product-family-owner-manifest.js`
- Modify: `scripts/apply-product-family-owner-content.js`
- Modify: `tests/multilingual-product-family-owner-pages.test.js`
- Regenerate: the ten CG/CB pages listed in Task 1

- [ ] **Step 1: Assert the CG approved model and family boundaries**

Require the CG air-cooled and water-cooled model sets from Task 1, plus localized family-level explanations for balance shaft, Tsunami, HW Water and automatic-clutch water-cooled. Assert that those family records do not make their configuration universal across every CG model.

- [ ] **Step 2: Assert the CB safe public fields**

For CB150, CB200-C and CB250, publish only model, nominal/actual displacement, cooling, start, clutch, gears and supported application wording. Explicitly omit bore, stroke, power, torque, dimensions and ignition because they are not approved in the master.

- [ ] **Step 3: Regenerate and run tests**

```powershell
node scripts/apply-product-family-owner-content.js
node scripts/apply-product-family-owner-content.js --check
node --test tests/multilingual-product-family-owner-pages.test.js
```

Expected: PASS and zero generator drift.

- [ ] **Step 4: Commit the CG/CB refinement**

```powershell
git add scripts tests en es pt ru ar
git commit -m "feat: align multilingual CG and CB owner facts"
```

### Task 4: Verify horizontal engines and engine parts

**Files:**
- Modify: `scripts/product-family-owner-manifest.js`
- Modify: `scripts/apply-product-family-owner-content.js`
- Modify: `tests/multilingual-product-family-owner-pages.test.js`
- Regenerate: the ten horizontal/parts pages listed in Task 1

- [ ] **Step 1: Publish the governed CX/YX relationship**

Across the four standard horizontal pages, publish the five CX official codes and localized wording equivalent to: “YX names are market/search references; the engines are manufactured by CHIXIANG MOTOR.” Retain actual displacement, bore and stroke as unpublished where the master is blank.

- [ ] **Step 2: Protect Russian page behavior**

Add only the owner marker and any missing family-level internal links to `ru/gorizontalnyj-dvigatel.html`. Do not replace its Hero, model cards, MOQ/sample policy, contact order, form or conversion scripts.

- [ ] **Step 3: Publish the approved parts categories and selection boundary**

Use the current visible catalog categories as the parts-family inventory: cylinder kits, cylinder heads/valve train, clutch parts, magneto/stator parts, valves, oil pumps, reverse components, crankshafts/connecting rods, starter/shift/main shafts, starter motors, gears, spark plugs, bearings, filters, ignition coils, CDI and related electrical parts. Require buyers to provide engine code, part name/photo, quantity and destination market. Do not promise universal compatibility, material grade, service life or stock.

- [ ] **Step 4: Regenerate and run focused plus conversion tests**

```powershell
node scripts/apply-product-family-owner-content.js
node scripts/apply-product-family-owner-content.js --check
node --test tests/multilingual-product-family-owner-pages.test.js tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js tests/russia-form.test.js tests/whatsapp-conversion.test.js tests/yandex-metrica.test.js tests/geo-entity-alignment.test.js
```

Expected: PASS, zero generator drift and no Russian conversion regression.

- [ ] **Step 5: Commit the horizontal/parts refinement**

```powershell
git add scripts tests en es pt ru ar
git commit -m "feat: align multilingual horizontal and parts owners"
```

### Task 5: Reconcile site-entity output and governance records

**Files:**
- Modify: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- Create: `docs/geo-entity/MULTILINGUAL_PRODUCT_FAMILY_REPORT.md`
- Potentially regenerate: the 20 page files through `scripts/apply-site-entity-schema.js`

- [ ] **Step 1: Check safe entity graph drift**

```powershell
node scripts/apply-site-entity-schema.js --check
```

If drift is reported because a visible page name or description changed, run the generator once and re-run `--check`. Do not hand-edit `data-site-entity-graph`.

- [ ] **Step 2: Update the 20 matrix rows**

Append the exact implementation marker `multilingual product family owner contract` to the `tests` or `notes` field for all 20 family rows. Set the decision to `CHANGED` for generated pages and `VERIFIED_NO_CHANGE` only when the protected Russian page requires no visible edit beyond its contract marker.

- [ ] **Step 3: Write the implementation report**

Record:

- all 20 routes;
- which pages were generated and which page was protected;
- published fact groups and intentionally unpublished fields;
- exact tests and results;
- browser sizes and pages checked;
- preview URL table to be filled from the actual Cloudflare deployment, not guessed;
- rollback instructions.

- [ ] **Step 4: Run governance tests**

```powershell
node --test tests/multilingual-product-family-owner-pages.test.js tests/site-entity-navigation-schema.test.js tests/geo-fact-governance.test.js tests/geo-page-matrix.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit governance and report changes**

```powershell
git add docs/geo-entity scripts tests en es pt ru ar
git commit -m "docs: record multilingual product family alignment"
```

### Task 6: Full verification, browser acceptance and Draft PR

**Files:**
- Verify: all modified files
- Update: `docs/geo-entity/MULTILINGUAL_PRODUCT_FAMILY_REPORT.md`

- [ ] **Step 1: Run deterministic checks**

```powershell
node scripts/apply-product-family-owner-content.js --check
node scripts/apply-site-entity-schema.js --check
git diff --check origin/main...HEAD
```

Expected: both generators report zero drift and Git reports no whitespace errors.

- [ ] **Step 2: Run the full repository test suite**

```powershell
node --test tests/*.test.js workers/contact-api/test/*.test.mjs
```

Expected: all tests pass. Record the actual pass count; do not reuse a previous count.

- [ ] **Step 3: Perform local browser acceptance**

Serve the worktree locally and inspect all 20 routes at 390×844. Inspect at least one CG, CB, horizontal and parts page per language at 1440×900. Verify:

- `scrollWidth === clientWidth`;
- one visible H1;
- owner section, tables, related links and CTA are visible;
- Arabic remains `dir="rtl"`;
- Russian horizontal form remains present and usable.

- [ ] **Step 4: Update the report with measured evidence**

Write the actual viewport results and any intentionally unresolved facts. Do not claim Lighthouse, Search Console or advertising-platform ingestion unless separately measured.

- [ ] **Step 5: Commit final acceptance evidence**

```powershell
git add docs/geo-entity/MULTILINGUAL_PRODUCT_FAMILY_REPORT.md
git commit -m "test: verify multilingual product family pages"
```

- [ ] **Step 6: Push and create an unmerged Draft PR**

```powershell
git push -u origin feature/multilingual-product-family-owner-pages
```

Create a Draft PR targeting `main`. State that it must not be auto-merged.

- [ ] **Step 7: Wait for Cloudflare and verify actual Preview URLs**

Wait for the Workers build check to pass. Read the Cloudflare bot comment to obtain the actual Branch Preview URL. Verify all 20 preview routes return HTTP 200 and contain both `data-product-family-owner` and `data-site-entity-graph`.

- [ ] **Step 8: Deliver one consolidated review package**

Provide the user:

- Draft PR URL;
- Cloudflare build result;
- 20 clickable preview URLs grouped by language;
- full test count;
- concise list of published and withheld facts;
- explicit statement that the PR remains unmerged.
