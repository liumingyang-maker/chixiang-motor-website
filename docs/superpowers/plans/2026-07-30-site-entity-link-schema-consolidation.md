# Site Entity Link and Safe Schema Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 51 canonical pages a tested user-visible hierarchy and matching safe Schema.org graph without introducing ecommerce claims or changing conversion behavior.

**Architecture:** A small Node.js manifest classifies sitemap pages by language and role, and a deterministic maintenance script writes visible breadcrumbs plus one `data-site-entity-graph` block into static HTML. Existing FAQ, Article, Organization and ItemList data remain; tests inspect the rendered source files rather than trusting the generator.

**Tech Stack:** Static HTML5/CSS, JSON-LD/Schema.org, Node.js built-in test runner, existing Cloudflare Workers deployment.

---

## File map

**Create**

- `tests/site-entity-navigation-schema.test.js` — 51-page rendered contract.
- `scripts/site-entity-manifest.js` — localized page-role and breadcrumb mapping.
- `scripts/apply-site-entity-schema.js` — deterministic static HTML updater.
- `docs/geo-entity/SITE_ENTITY_SCHEMA_REPORT.md` — scope, results and rollback record.

**Modify**

- The 51 HTML source files represented in `sitemap.xml` — visible breadcrumbs and safe page graph.
- `css/style.css` — shared visible breadcrumb and standalone landing-page spacing.
- `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv` — record the 51-page relationship/schema contract.

**Do not modify**

- `sitemap.xml`, `robots.txt`, `_redirects`, canonical URLs or hreflang;
- `js/form-handler.js`, `js/google-ads-conversion.js`, `js/yandex-metrica.js`, `js/main.js`;
- `workers/contact-api/**`, Turnstile, form fields or advertising logic;
- product facts, prices, MOQ, shipping statements, H1, Title or Description.

### Task 1: Define the failing 51-page contract

**Files:**

- Create: `tests/site-entity-navigation-schema.test.js`

- [ ] **Step 1: Add sitemap, source-file and JSON-LD helpers**

The test reads `<loc>` values from `sitemap.xml`, maps trailing-slash routes to `index.html`, parses all `application/ld+json` blocks and recursively flattens `@graph` nodes.

- [ ] **Step 2: Add exact behavioral assertions**

Require:

```js
assert.equal(pages.length, 51);
assert.equal(homePages.length, 5);
assert.equal(nonHomePages.length, 46);
assert.equal(visibleBreadcrumbs.length, nonHomePages.length);
assert.equal(schemaBreadcrumbs.length, nonHomePages.length);
```

For every non-home page, assert the visible breadcrumb is a `<nav>` with `aria-label="Breadcrumb"`, parent links use clean internal canonical routes, and the last item uses `aria-current="page"`. Require the role mapping from the design: AboutPage, CollectionPage, ContactPage, Article or WebPage. Ban `Product`, `ProductGroup`, `Offer`, `Review` and `AggregateRating` across all canonical pages.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
node --test tests/site-entity-navigation-schema.test.js
```

Expected: FAIL because 19 non-home pages lack visible breadcrumbs, no page has `BreadcrumbList`, and contacts/news/landings lack their safe page types.

- [ ] **Step 4: Commit the failing contract**

```powershell
git add tests/site-entity-navigation-schema.test.js
git commit -m "test: define site entity navigation and schema contract"
```

### Task 2: Implement the deterministic page manifest

**Files:**

- Create: `scripts/site-entity-manifest.js`
- Test: `tests/site-entity-navigation-schema.test.js`

- [ ] **Step 1: Export canonical helpers and localized labels**

The module exports:

```js
module.exports = {
  canonicalOrigin: 'https://chixiangmotor.com',
  organizationId: 'https://chixiangmotor.com/#organization',
  websiteId: 'https://chixiangmotor.com/#website',
  loadManifest
};
```

`loadManifest(root)` returns 51 entries containing `file`, `url`, `language`, `role`, `schemaType` and `breadcrumb`. Language labels are fixed to:

```js
const labels = {
  en: { home: 'Home', products: 'Products', news: 'News' },
  es: { home: 'Inicio', products: 'Productos', news: 'Noticias' },
  pt: { home: 'Início', products: 'Produtos', news: 'Notícias' },
  ru: { home: 'Главная', products: 'Продукты', news: 'Новости' },
  ar: { home: 'الرئيسية', products: 'المنتجات', news: 'الأخبار' }
};
```

- [ ] **Step 2: Add role classification**

Classification is deterministic:

- trailing language root: `home` / `WebPage`;
- `about`: `about` / `AboutPage`;
- `products`: `products` / `CollectionPage`;
- localized contacts: `contact` / `ContactPage`;
- localized news: `news` / `CollectionPage`;
- two English article slugs: `article` / `WebPage` while retaining existing `Article`;
- four market folders: `market` / `WebPage`;
- all remaining family routes, including Russian horizontal: `family` / `CollectionPage`.

- [ ] **Step 3: Run the manifest test and verify GREEN for classification only**

```powershell
node --test --test-name-pattern="manifest" tests/site-entity-navigation-schema.test.js
```

- [ ] **Step 4: Commit the manifest**

```powershell
git add scripts/site-entity-manifest.js tests/site-entity-navigation-schema.test.js
git commit -m "feat: map canonical pages to entity owners"
```

### Task 3: Generate visible breadcrumbs and safe page graphs

**Files:**

- Create: `scripts/apply-site-entity-schema.js`
- Modify: the 51 sitemap HTML files
- Test: `tests/site-entity-navigation-schema.test.js`

- [ ] **Step 1: Add visible breadcrumb rendering**

Render this semantic shape for every non-home page:

```html
<nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb">
  <a href="/en/">Home</a><span aria-hidden="true">/</span>
  <a href="/en/products">Products</a><span aria-hidden="true">/</span>
  <span aria-current="page">CG Motorcycle Engine</span>
</nav>
```

The generator replaces an existing `.breadcrumb` element or inserts the breadcrumb before the page H1. Landing pages receive `entity-breadcrumb--standalone` as the first element inside `<main>`. Home pages receive no breadcrumb.

- [ ] **Step 2: Add the safe page graph**

Insert one marked block before `</head>`:

```html
<script type="application/ld+json" data-site-entity-graph>
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://chixiangmotor.com/en/cg-engine#webpage",
      "url": "https://chixiangmotor.com/en/cg-engine",
      "name": "CG Motorcycle Engine",
      "description": "...existing meta description...",
      "isPartOf": { "@id": "https://chixiangmotor.com/#website" },
      "publisher": { "@id": "https://chixiangmotor.com/#organization" },
      "breadcrumb": { "@id": "https://chixiangmotor.com/en/cg-engine#breadcrumb" },
      "inLanguage": "en"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://chixiangmotor.com/en/cg-engine#breadcrumb",
      "itemListElement": []
    }
  ]
}
</script>
```

Before insertion, remove an older marked block and remove prior page nodes with the same `#webpage` ID from existing owner-page graphs. Preserve Organization, ItemList, FAQPage and Article nodes. Home graphs contain WebSite plus WebPage and no BreadcrumbList.

- [ ] **Step 3: Run the generator twice and prove idempotence**

```powershell
node scripts/apply-site-entity-schema.js
git diff --exit-code -- . ':!docs'  # expected non-zero after first generation
node scripts/apply-site-entity-schema.js
git diff --check
```

Capture the HTML hash list after the first run and require the second run to produce identical hashes.

- [ ] **Step 4: Run the focused suite and verify GREEN**

```powershell
node --test tests/site-entity-navigation-schema.test.js
```

Expected: all 51-page navigation and schema assertions PASS.

- [ ] **Step 5: Commit generated HTML and generator**

```powershell
git add scripts/apply-site-entity-schema.js en es pt ru ar
git commit -m "feat: connect canonical pages with safe entity schema"
```

### Task 4: Add breadcrumb presentation without redesign

**Files:**

- Modify: `css/style.css`
- Test: `tests/site-entity-navigation-schema.test.js`

- [ ] **Step 1: Add scoped styles**

Add `.entity-breadcrumb` flex wrapping, spacing, link focus and `aria-current` rules. Add `.entity-breadcrumb--standalone` with the existing site content width, responsive horizontal padding, and no fixed height. Do not modify Header, Hero, CTA, form or product-card rules.

- [ ] **Step 2: Add CSS safety assertions**

Require wrapping at narrow widths and ban `white-space: nowrap`, fixed width and overflow masking inside the new rule.

- [ ] **Step 3: Run focused tests**

```powershell
node --test tests/site-entity-navigation-schema.test.js tests/foundation-mobile.test.js
```

- [ ] **Step 4: Commit the scoped CSS**

```powershell
git add css/style.css tests/site-entity-navigation-schema.test.js
git commit -m "style: present entity breadcrumbs responsively"
```

### Task 5: Record governance and full verification

**Files:**

- Create: `docs/geo-entity/SITE_ENTITY_SCHEMA_REPORT.md`
- Modify: `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`

- [ ] **Step 1: Update all 51 matrix rows**

Append the validation marker `site entity link/schema contract` to each row without changing approved facts or owner decisions.

- [ ] **Step 2: Write the report**

Record the 51-page scope, page-type counts, 46 breadcrumb paths, stable IDs, prohibited types, modified files, test commands, preview instructions and rollback command (`git revert <merge-commit>` after merge).

- [ ] **Step 3: Run full verification**

```powershell
node --test tests/*.test.js workers/contact-api/test/*.test.mjs
node scripts/apply-site-entity-schema.js
git diff --check origin/main...HEAD
git status --short
```

Expected: all tests pass; a second generator run creates no tracked differences; no unexpected files are modified.

- [ ] **Step 4: Commit governance**

```powershell
git add docs/geo-entity/SITE_ENTITY_SCHEMA_REPORT.md docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv
git commit -m "docs: record site entity schema consolidation"
```

### Task 6: Preview, push and create one Draft PR

**Files:** No new production files.

- [ ] **Step 1: Serve and inspect representative pages**

Inspect at 390×844 and 1440×900:

- `/en/about`
- `/en/cg-engine`
- `/ru/gorizontalnyj-dvigatel`
- `/ru/russia/`
- `/ru/central-asia/`
- `/es/peru/`
- `/es/colombia/`
- `/ar/products`

Verify no horizontal overflow, no clipped breadcrumb, correct RTL and unchanged CTA/form layout.

- [ ] **Step 2: Push the branch**

```powershell
git push -u origin feature/site-entity-link-schema-consolidation
```

- [ ] **Step 3: Create a Draft PR**

Title: `Connect canonical pages with breadcrumbs and safe entity schema`

The body lists page counts, allowed/forbidden schema types, preserved integrations, automated results, preview links and rollback steps. Do not merge.

- [ ] **Step 4: Wait for Cloudflare Preview**

Confirm the Workers build succeeds and deliver representative preview URLs for user acceptance.
