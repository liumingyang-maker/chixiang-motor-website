# Foundation SEO Fix Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Converge Chixiang Motor on one indexable URL per page, repair the three approved responsive landing pages, and reduce Peru hero transfer cost without changing design, advertising, analytics, or form behavior.

**Architecture:** A small Cloudflare site router owns document-only canonical redirects while static assets and `/api/contact` bypass it. Static HTML remains the source of page content; tests enforce sitemap/canonical/internal-link contracts. Page-scoped CSS repairs responsive overflow, and WebP derivatives replace only the four approved Peru hero image references.

**Tech Stack:** Static HTML/CSS/JavaScript, Cloudflare Workers static assets, Node.js built-in test runner, browser viewport checks, WebP image encoding.

---

## File map

- `workers/site-router.mjs`: canonical origin, clean-path, root, legacy-route, and Yandex verification behavior.
- `wrangler.toml`: document-first Worker routing with asset/API exclusions.
- `_redirects`: clean fallback destinations for legacy paths.
- `tests/foundation-routing.test.js`: executable redirect and bypass contract.
- `tests/foundation-seo.test.js`: sitemap, canonical, hreflang, root fallback, product-detail, and internal-link contract.
- `tests/foundation-mobile.test.js`: static guards for page-scoped responsive rules and unmasked overflow fixes.
- `tests/foundation-performance.test.js`: optimized asset size/reference/loading contract.
- `index.html`: non-JavaScript root fallback only.
- `sitemap.xml`: direct-200 indexable clean URLs only.
- `en/product-detail.html`: functional `noindex,follow` utility component.
- `ar/**/*.html`, `en/**/*.html`, `es/**/*.html`, `pt/**/*.html`, `ru/**/*.html`: clean canonical, hreflang, Open Graph, and internal document links.
- `css/phase5-market-pages.css`: `/ru/russia/` responsive corrections.
- `css/russia-horizontal-landing.css`: `/ru/gorizontalnyj-dvigatel` responsive corrections.
- `css/latam-cg-landing.css`: `/es/peru/` responsive corrections and optimized hero background reference.
- `js/latam-cg-landing.js`: intrinsic hero image dimensions and resource priority.
- `js/latam-cg-products.js`: optimized hero image data references.
- `images/central-asia-hero-bg-v2.webp`: optimized background derivative.
- `images/central-asia-hero-products/cg-air.webp`: optimized transparent engine derivative.
- `images/central-asia-hero-products/cg-water.webp`: optimized transparent engine derivative.
- `images/central-asia-hero-products/cg-heavy.webp`: optimized transparent engine derivative.
- `FOUNDATION_FIX_REPORT.md`: changed files, before/after evidence, tests, screenshots, performance, rollback, and monitoring.
- `docs/evidence/foundation-fix/*.png`: responsive screenshots.

### Task 1: Canonical document router

**Files:**
- Create: `tests/foundation-routing.test.js`
- Modify: `tests/yandex-webmaster-verification.test.js`
- Modify: `workers/site-router.mjs`
- Modify: `wrangler.toml`
- Modify: `_redirects`

- [ ] **Step 1: Write the failing router tests**

Create table-driven tests that import the real Worker and assert:

```js
const redirectCases = [
  ['http://chixiangmotor.com/en/about?utm_source=test', 'https://chixiangmotor.com/en/about?utm_source=test'],
  ['http://www.chixiangmotor.com/en/about', 'https://chixiangmotor.com/en/about'],
  ['https://www.chixiangmotor.com/en/about', 'https://chixiangmotor.com/en/about'],
  ['https://chixiangmotor.com/', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en/index.html', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en/about.html', 'https://chixiangmotor.com/en/about'],
  ['https://chixiangmotor.com/ru/uzbekistan/', 'https://chixiangmotor.com/ru/central-asia/'],
  ['https://chixiangmotor.com/ru/dvigatel-140/', 'https://chixiangmotor.com/ru/russia/#horizontal-engines']
];
```

Also assert `*.workers.dev` keeps its host, both Yandex verification paths return 200/no redirect, normal clean documents reach `env.ASSETS`, and `wrangler.toml` contains document inclusion plus `/images/*`, `/css/*`, `/js/*`, `/pdf/*`, and `/api/*` exclusions.

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```powershell
node --test tests/foundation-routing.test.js tests/yandex-webmaster-verification.test.js
```

Expected: FAIL because root/domain/legacy redirect behavior and the expanded `run_worker_first` contract do not exist.

- [ ] **Step 3: Implement the minimal router**

Use explicit verification and legacy maps, then deterministic path normalization:

```js
const CANONICAL_ORIGIN = 'https://chixiangmotor.com';
const CUSTOM_HOSTS = new Set(['chixiangmotor.com', 'www.chixiangmotor.com']);
const VERIFICATION_ASSETS = new Map([
  ['/yandex_68b52fccf05e4a88.html', '/yandex_68b52fccf05e4a88'],
  ['/yandex_8a3590afcb928a95.html', '/yandex_8a3590afcb928a95']
]);
const LEGACY_PATHS = new Map([
  ['/ru/uzbekistan/', '/ru/central-asia/'],
  ['/ru/dvigateli-dlya-uzbekistana.html', '/ru/central-asia/'],
  ['/ru/dvigatel-140/', '/ru/russia/#horizontal-engines']
]);
```

Verification handling runs before host normalization. Other custom-host document requests use `CANONICAL_ORIGIN`; preview requests retain `requestUrl.origin`. Redirects return 301 with `Location` and `Cache-Control: public, max-age=300`. Queries survive unless the destination intentionally adds only a fragment.

Set:

```toml
run_worker_first = ["/*", "!/images/*", "!/css/*", "!/js/*", "!/pdf/*", "!/api/*"]
```

Keep `_redirects` destinations clean: language roots point to slash directories, and consolidated legacy routes keep their approved destinations.

- [ ] **Step 4: Run router and existing verification tests and verify GREEN**

Run:

```powershell
node --test tests/foundation-routing.test.js tests/yandex-webmaster-verification.test.js
```

Expected: all router and both verification cases PASS.

- [ ] **Step 5: Commit routing changes**

```powershell
git add workers/site-router.mjs wrangler.toml _redirects tests/foundation-routing.test.js tests/yandex-webmaster-verification.test.js
git commit -m "fix: canonicalize public document routes"
```

### Task 2: Sitemap, canonical, root, and product-detail policy

**Files:**
- Create: `tests/foundation-seo.test.js`
- Modify: `index.html`
- Modify: `sitemap.xml`
- Modify: `en/product-detail.html`
- Modify: all indexable HTML documents under `ar/`, `en/`, `es/`, `pt/`, and `ru/`
- Modify: `tests/market-consolidation.test.js`
- Modify: `tests/pr7-three-country-revision.test.js`

- [ ] **Step 1: Write the failing SEO contract tests**

The test reads XML/HTML with built-in `fs` and rejects:

```js
assert.notEqual(url.pathname, '/');
assert.equal(url.protocol, 'https:');
assert.equal(url.host, 'chixiangmotor.com');
assert.doesNotMatch(url.pathname, /(?:index\.html|\.html)$/);
assert.notEqual(url.pathname, '/en/product-detail');
assert.equal(new Set(locations).size, locations.length);
```

For every sitemap location, map `/xx/` to `xx/index.html` and extensionless `/xx/name` to `xx/name.html`; require a 200-equivalent router result, no `noindex`, and a canonical exactly equal to the location. Scan canonical/hreflang/`og:url` and internal `<a href>` values to reject www, `index.html`, and content `.html` URLs. Explicitly allow the two Yandex verification filenames and legacy redirect sources outside indexable page markup.

Assert root fallback has no `http-equiv="refresh"` or `window.location`, and contains a Description, visible H1, `/en/` link, and canonical `/en/`. Assert product detail has `noindex,follow`, no canonical, and no sitemap entry.

- [ ] **Step 2: Run the SEO test and verify RED**

Run:

```powershell
node --test tests/foundation-seo.test.js
```

Expected: FAIL on the 69-entry legacy sitemap, root client redirect, indexable product-detail component, `.html` canonicals/hreflang/internal links, and the one www canonical.

- [ ] **Step 3: Normalize document metadata and links**

Perform a bounded mechanical rewrite only inside HTML document URL attributes:

```text
https://chixiangmotor.com/<language>/index.html -> https://chixiangmotor.com/<language>/
https://chixiangmotor.com/<path>.html -> https://chixiangmotor.com/<path>
https://www.chixiangmotor.com/<path> -> https://chixiangmotor.com/<path>
relative index.html -> ./ or the matching language root
relative/absolute content-name.html -> content-name
product-detail.html?series=... -> product-detail?series=...
```

Do not alter `.html` verification filenames, Worker legacy-map keys, script/style/image URLs, ad identifiers, form actions, or page copy.

Replace root navigation scripts with readable fallback markup:

```html
<meta name="description" content="Chixiang Motor manufactures motorcycle engines, engine parts and OEM solutions for international distributors and assemblers.">
<link rel="canonical" href="https://chixiangmotor.com/en/">
<h1>Chixiang Motor — Motorcycle Engine Manufacturer</h1>
<p><a href="/en/">Visit the English website</a></p>
```

Remove the root document's alternate/hreflang set because `/` is not a language entity; `/en/` retains the language relationships and `x-default`.

Change product detail to:

```html
<meta name="robots" content="noindex,follow">
```

and remove its canonical element while retaining product data, UI, analytics, and quote paths.

- [ ] **Step 4: Rebuild the sitemap from indexable documents**

Keep language roots, clean standalone content routes, and the four country/market directory pages. Remove `/`, all product-detail entries, query variants, `.html`, `index.html`, redirect sources, duplicates, and noindex pages. Each `<loc>` must match its local document canonical exactly.

- [ ] **Step 5: Update legacy tests to the newly approved clean-link policy**

Change only assertions that previously treated `.html` links as required. For example:

```js
assert.ok(html.includes('/en/product-detail?series=cb-offroad'));
assert.ok(!html.includes('/en/product-detail.html?series=cb-offroad'));
```

Keep every product, content, analytics, form, and market assertion unchanged.

- [ ] **Step 6: Run SEO and full site tests and verify GREEN**

Run:

```powershell
node --test tests/foundation-seo.test.js
node --test tests/*.test.js
```

Expected: SEO contract passes and the site suite returns zero failures.

- [ ] **Step 7: Commit URL/entity changes**

```powershell
git add index.html sitemap.xml ar en es pt ru tests/foundation-seo.test.js tests/market-consolidation.test.js tests/pr7-three-country-revision.test.js
git commit -m "fix: unify indexable page URLs"
```

### Task 3: Responsive landing-page fixes

**Files:**
- Create: `tests/foundation-mobile.test.js`
- Modify: `css/phase5-market-pages.css`
- Modify: `css/russia-horizontal-landing.css`
- Modify: `css/latam-cg-landing.css`

- [ ] **Step 1: Add failing static responsive guards**

Assert all three page roots and relevant grid children can shrink, buttons wrap without a fixed minimum wider than their container, images use `max-width:100%`, and the Peru page no longer relies on `.latam-page { overflow-x:hidden; }`. Preserve intentionally scrollable comparison tables rather than forcing wide tables into the viewport.

- [ ] **Step 2: Run static mobile tests and verify RED**

Run:

```powershell
node --test tests/foundation-mobile.test.js
```

Expected: FAIL on at least the Peru page-level overflow mask and missing shrink constraints identified by browser measurements.

- [ ] **Step 3: Capture before measurements**

Serve the worktree locally and record at 390x844, 768x1024, and 1024x1366:

```js
({
  viewport: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth - innerWidth,
  actions: [...document.querySelectorAll('a,button')]
    .filter(node => /запрос|предлож|precio|cotiz/i.test(node.textContent))
    .map(node => ({ text: node.textContent.trim(), ...node.getBoundingClientRect().toJSON() }))
})
```

Save the actual offenders and before screenshots for each target page.

- [ ] **Step 4: Apply minimal page-scoped CSS corrections**

Use shrink-safe rules such as:

```css
.p5-hero-grid > *, .p5-cards > *,
.rh-hero-inner > *, .rh-product-grid > *,
.latam-hero-grid > *, .latam-products > * { min-width:0; }

.p5-button, .rh-button, .latam-button {
  max-width:100%;
  white-space:normal;
  overflow-wrap:anywhere;
}

.p5-hero-art img, .rh-product-image img, .latam-hero-engine img {
  max-width:100%;
}
```

Limit any 390px action stacking or padding adjustments to the target page classes. Remove the Peru page-level `overflow-x:hidden` mask after the actual overflowing child is fixed. Do not alter desktop order, colors, copy, CTA hierarchy, or product count.

- [ ] **Step 5: Run static and browser checks and verify GREEN**

Run:

```powershell
node --test tests/foundation-mobile.test.js
```

In the browser, require `document.documentElement.scrollWidth <= window.innerWidth` and CTA rectangles within `[0, innerWidth]` at all nine page/viewport combinations. Capture after screenshots of header, hero/actions, product content, and form.

- [ ] **Step 6: Commit responsive fixes**

```powershell
git add css/phase5-market-pages.css css/russia-horizontal-landing.css css/latam-cg-landing.css tests/foundation-mobile.test.js docs/evidence/foundation-fix
git commit -m "fix: contain landing pages on mobile"
```

### Task 4: Peru hero transfer and loading performance

**Files:**
- Create: `tests/foundation-performance.test.js`
- Create: `images/central-asia-hero-bg-v2.webp`
- Create: `images/central-asia-hero-products/cg-air.webp`
- Create: `images/central-asia-hero-products/cg-water.webp`
- Create: `images/central-asia-hero-products/cg-heavy.webp`
- Modify: `css/latam-cg-landing.css`
- Modify: `js/latam-cg-products.js`
- Modify: `js/latam-cg-landing.js`
- Modify: `es/peru/index.html`
- Modify: `tests/central-asia-landing.test.js`

- [ ] **Step 1: Add failing asset-budget and loading tests**

Assert the four WebP derivatives exist, background is at most 350 KB, each engine is at most 250 KB, combined size is at most 1 MB, CSS/data use the WebP paths, all three engines remain in the hero, generated hero images have numeric width/height, visible engines are not lazy-loaded, and the Peru document preloads the optimized background.

- [ ] **Step 2: Run the performance test and verify RED**

Run:

```powershell
node --test tests/foundation-performance.test.js
```

Expected: FAIL because the WebP derivatives and optimized references do not yet exist.

- [ ] **Step 3: Encode WebP derivatives**

Use the bundled workspace image runtime located by dependency discovery. Preserve source dimensions and engine alpha. Adjust WebP quality until all four budgets pass; keep the PNG originals untouched.

- [ ] **Step 4: Switch only hero references and add loading metadata**

Update the LATAM hero background and the three shared hero data references to `.webp`. `renderHero()` emits intrinsic dimensions and `decoding="async"`; the primary critical image gets `fetchpriority="high"`, and no initially visible hero image gets `loading="lazy"`. Add the background preload to Peru without changing analytics or content.

- [ ] **Step 5: Run asset, page, and visual checks and verify GREEN**

Run:

```powershell
node --test tests/foundation-performance.test.js tests/central-asia-landing.test.js tests/latam-cg-landing.test.js
```

Inspect the original and derivative images for transparency, edges, logos, colors, and composition. Record local/preview mobile performance with environment labels; target LCP below 4 seconds, but report the measured value rather than claiming an unobserved production result.

- [ ] **Step 6: Commit performance changes**

```powershell
git add images/central-asia-hero-bg-v2.webp images/central-asia-hero-products/*.webp css/latam-cg-landing.css js/latam-cg-products.js js/latam-cg-landing.js es/peru/index.html tests/foundation-performance.test.js tests/central-asia-landing.test.js
git commit -m "perf: reduce Peru hero transfer cost"
```

### Task 5: Full verification and delivery report

**Files:**
- Create: `FOUNDATION_FIX_REPORT.md`
- Modify: `docs/evidence/foundation-fix/*.png` if final screenshots need correction

- [ ] **Step 1: Run all automated suites**

```powershell
node --test tests/*.test.js
node --test workers/contact-api/test/*.test.mjs
git diff --check origin/main...HEAD
```

Expected: zero failures and no whitespace errors.

- [ ] **Step 2: Re-run router and live-preview acceptance**

Check `status`, `Location`, path/query preservation, sitemap content, canonical values, Yandex verification bodies, static image/CSS/JS delivery, and `/api/contact` exclusion. Record `CF-Cache-Status` and `Cache-Control`; do not purge unless stale behavior is proven.

- [ ] **Step 3: Re-test conversion invariants**

Verify ordinary visits do not fire inquiry conversion; invalid/Turnstile/Worker failure submissions do not convert; successful Worker submission fires once; duplicate click protection remains; Russia Yandex-only and existing Google/Yandex IDs remain unchanged.

- [ ] **Step 4: Write the report**

Include:

- exact changed files and commit groups;
- before/after redirect, sitemap count, canonical, mobile widths, and image-byte tables;
- test commands and observed results;
- screenshot paths and performance environment;
- preserved advertising/form invariants;
- rollback by reverting the sprint commits;
- preview deployment checklist;
- 7-28 day GSC/Yandex monitoring items;
- remaining risks and non-goals.

- [ ] **Step 5: Verify the report and commit**

```powershell
rg -n "T[B]D|T[O]DO|F[I]XME|placehold(er)" FOUNDATION_FIX_REPORT.md
git diff --check
git status --short
git add FOUNDATION_FIX_REPORT.md docs/evidence/foundation-fix
git commit -m "docs: report foundation SEO fix results"
```

Expected: no unfinished markers, only intended report/evidence changes, and the branch remains unmerged.
