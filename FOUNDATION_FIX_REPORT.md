# Chixiang Motor Foundation Fix Report

Date: 2026-07-29

Branch: `feature/foundation-seo-fix`

Base: `origin/main` at `5346b1430092ef699d055179075844866bf41c69`

Status: implemented and locally verified; not merged and not deployed

## Outcome

The sprint converges public documents on `https://chixiangmotor.com`, changes `/` into a server-side 301 entry to `/en/`, cleans the sitemap and canonical signals, removes the shared product-detail utility from indexing, fixes real 390px containment problems on the three approved landing pages, and reduces Peru's initial hero image transfer without changing its design or three-engine composition.

No advertising ID, conversion destination, form action, Turnstile integration, country-page copy, or URL language structure was intentionally changed.

## Before and after

| Area | Before | After |
| --- | --- | --- |
| Formal origin | Mixed `www` and non-`www` signals | `https://chixiangmotor.com` |
| `/` | 200 client-side language redirect shell | 301 to `/en/`; readable HTML remains as a static fallback |
| Legacy document paths | `.html`, `index.html`, and mixed hosts | One 301 hop to clean non-`www` URLs |
| Sitemap | 69 locations | 51 unique, indexable, clean locations |
| Product-detail template | Base plus 16 query variants in sitemap; shared canonical | `noindex,follow`, no canonical, absent from sitemap |
| Indexable canonicals | Audit baseline reported conflicts and mixed hosts | Sitemap pages use self-referencing non-`www` clean canonicals |
| 390px containment | Long Peru model text could widen a card; two pages masked root overflow | Actual children can shrink; no page-level overflow mask on Peru or the horizontal-engine page |
| Peru initial hero images | 2,452,171 bytes | 281,204 bytes, an 88.5% reduction |
| Shared Central Asia hero set | 5,764,257 bytes | 420,496 bytes, a 92.7% reduction |

## Routing contract

The document router runs before static assets only for document paths. `/images/*`, `/css/*`, `/js/*`, `/pdf/*`, and `/api/*` are excluded in `wrangler.toml`; `/api/contact` therefore keeps its existing Worker path.

Representative verified cases:

| Request | Result |
| --- | --- |
| `http://chixiangmotor.com/en/about?utm_source=test` | 301 to `https://chixiangmotor.com/en/about?utm_source=test` |
| `http://www.chixiangmotor.com/en/about` | 301 to `https://chixiangmotor.com/en/about` |
| `https://www.chixiangmotor.com/en/about` | 301 to `https://chixiangmotor.com/en/about` |
| `https://chixiangmotor.com/` | 301 to `https://chixiangmotor.com/en/` |
| `https://chixiangmotor.com/en/index.html` | 301 to `https://chixiangmotor.com/en/` |
| `https://chixiangmotor.com/en/about.html` | 301 to `https://chixiangmotor.com/en/about` |
| `https://chixiangmotor.com/ru/uzbekistan/` | 301 to `/ru/central-asia/` |
| `https://chixiangmotor.com/ru/dvigatel-140/` | 301 to `/ru/russia/#horizontal-engines` |
| both Yandex verification HTML paths | 200 verification response, not redirected |
| clean `*.workers.dev` preview path | preview host retained |

Redirect responses use `Cache-Control: public, max-age=300`. A global Cloudflare cache purge is not part of this branch; cache headers and `CF-Cache-Status` should be inspected on the preview first.

## Sitemap and metadata

- `/`, redirect sources, `.html` paths, `index.html` paths, the base product-detail utility, and all 16 product-detail query variants were removed from `sitemap.xml`.
- The remaining 51 sitemap locations resolve to local indexable documents and match their canonical URLs.
- Canonical, hreflang, Open Graph URL, and customer-facing document links were mechanically normalized to clean non-`www` routes.
- The root fallback contains a Description, visible H1, canonical delegation to `/en/`, and a normal `/en/` link. It no longer uses meta refresh or `window.location`.
- `en/product-detail.html` remains functional for catalog navigation but now declares `noindex,follow` and no canonical.
- The historical HTML artifact under `images/factory-showcase/` is explicitly non-indexable and delegates its canonical to the formal Russian landing page.

## Mobile verification

Pages checked:

- `/ru/russia/`
- `/ru/gorizontalnyj-dvigatel`
- `/es/peru/`

Viewports checked: 390x844, 768x1024, and 1024x1366.

All nine combinations met `document.documentElement.scrollWidth <= window.innerWidth`; CTA rectangles remained inside the viewport and hero/product images loaded. At 390px the measured browser viewport was 390px and the document width was 382px after the scrollbar gutter, with no horizontal overflow.

The fixes use page-scoped shrink constraints, wrapping actions, and bounded images. Intentionally wide comparison tables and factory strips retain their local scroll containers.

Screenshot evidence:

- `docs/evidence/foundation-fix/after-ru-russia-390x844.png`
- `docs/evidence/foundation-fix/after-ru-russia-768x1024.png`
- `docs/evidence/foundation-fix/after-ru-russia-1024x1366.png`
- `docs/evidence/foundation-fix/after-ru-horizontal-390x844.png`
- `docs/evidence/foundation-fix/after-ru-horizontal-768x1024.png`
- `docs/evidence/foundation-fix/after-ru-horizontal-1024x1366.png`
- `docs/evidence/foundation-fix/after-es-peru-390x844.png`
- `docs/evidence/foundation-fix/after-es-peru-768x1024.png`
- `docs/evidence/foundation-fix/after-es-peru-1024x1366.png`

## Image performance

| Asset group | Original | Optimized | Reduction |
| --- | ---: | ---: | ---: |
| Peru background plus its three existing hero engines | 2,452,171 B | 281,204 B | 88.5% |
| Shared background | 2,324,623 B | 153,656 B | 93.4% |
| Shared background plus three transparent engine cutouts | 5,764,257 B | 420,496 B | 92.7% |

The original PNG files remain in the repository. The WebP derivatives preserve dimensions and transparency. Peru preloads the WebP background; all three visible engines remain eager, reserve a square intrinsic ratio, decode asynchronously, and only the center lead engine receives high fetch priority.

The browser confirmed the WebP background and all three engine images completed at 390px. A production LCP below four seconds is the target, but no production LCP is claimed before a Cloudflare preview or production deployment is available. The measured byte reduction is the local acceptance signal for this branch.

## Advertising, analytics, and forms

Repository identifier counts were unchanged from `origin/main` to this branch:

| Identifier or path | Base | Branch |
| --- | ---: | ---: |
| Google Ads `AW-16777656395` | 117 | 117 |
| Yandex Metrica `110874170` | 8 | 8 |
| existing legacy Yandex ID `109483511` | 99 | 99 |
| `/api/contact` references | 38 | 38 |
| Turnstile references | 49 | 49 |

Automated regression coverage confirms:

- an ordinary visit does not report an inquiry conversion;
- validation, honeypot, missing Turnstile, Worker 400/500, and network failures do not report a successful conversion;
- a successful `/api/contact` response may report the Google conversion once;
- a successful Russian inquiry reports the Yandex lead goal once;
- rapid double submission produces one request/goal;
- Russia remains Yandex-tagged as before, and the approved horizontal landing retains its existing advertising policy;
- form success, error, WhatsApp fallback policy, and button-state restoration remain intact.

Localhost produced Turnstile error `110200`, which is expected because `127.0.0.1` is not an allowed production hostname. No real inquiry was submitted during visual testing.

## Automated verification

| Command | Result |
| --- | --- |
| `node --test tests/*.test.js` | 151 passed, 0 failed |
| `node --test workers/contact-api/test/*.test.mjs` | 13 passed, 0 failed |
| `git diff --check origin/main...HEAD` | passed |

The contact Worker suite deliberately exercises an email-delivery failure case and logs `Sender domain is not enabled.`; the test itself passes because the stable failure response is the expected behavior.

## Commits

- `f19b1b3` `fix: canonicalize public document routes`
- `c000ce5` `fix: unify indexable page URLs`
- `73d20b6` `fix: contain landing pages on mobile`
- `89ff84e` `perf: reduce hero image transfer`

The design and execution plan are isolated in commits `823afce` and `99a2335`.

## Exact changed-file scope

Routing and configuration:

- `_redirects`
- `workers/site-router.mjs`
- `wrangler.toml`
- `sitemap.xml`
- `index.html`

Page metadata and clean internal URLs:

- `ar/about.html`, `ar/cb-engine.html`, `ar/cg-engine.html`, `ar/contact.html`, `ar/engine-parts.html`, `ar/horizontal-engine.html`, `ar/index.html`, `ar/news.html`, `ar/products.html`
- `en/about.html`, `en/air-cooled-vs-water-cooled-motorcycle-engine.html`, `en/cb-engine.html`, `en/cg-engine.html`, `en/contact.html`, `en/engine-parts.html`, `en/horizontal-engine.html`, `en/how-to-choose-motorcycle-engine-manufacturer-china.html`, `en/index.html`, `en/news.html`, `en/product-detail.html`, `en/products.html`
- `es/about.html`, `es/colombia/index.html`, `es/contacto.html`, `es/index.html`, `es/motor-cb.html`, `es/motor-cg.html`, `es/motor-horizontal.html`, `es/news.html`, `es/peru/index.html`, `es/products.html`, `es/repuestos-motor.html`
- `pt/about.html`, `pt/contato.html`, `pt/index.html`, `pt/motor-cb.html`, `pt/motor-cg.html`, `pt/motor-horizontal.html`, `pt/news.html`, `pt/pecas-de-motor.html`, `pt/products.html`
- `ru/about.html`, `ru/central-asia/index.html`, `ru/dvigatel-cb.html`, `ru/dvigatel-cg.html`, `ru/gorizontalnyj-dvigatel.html`, `ru/index.html`, `ru/kontakty.html`, `ru/news.html`, `ru/products.html`, `ru/russia/index.html`, `ru/zapchasti-dvigatelya.html`
- `images/factory-showcase/gorizontalnyj-dvigatel.html`

Responsive and performance implementation:

- `css/central-asia-landing.css`
- `css/latam-cg-landing.css`
- `css/phase5-market-pages.css`
- `css/russia-horizontal-landing.css`
- `js/central-asia-data.js`
- `js/latam-cg-landing.js`
- `js/latam-cg-products.js`
- `images/central-asia-hero-bg-v2.webp`
- `images/central-asia-hero-products/cg-air.webp`
- `images/central-asia-hero-products/cg-water.webp`
- `images/central-asia-hero-products/cg-heavy.webp`

Tests, specification, plan, and evidence:

- `tests/central-asia-landing.test.js`
- `tests/foundation-mobile.test.js`
- `tests/foundation-performance.test.js`
- `tests/foundation-routing.test.js`
- `tests/foundation-seo.test.js`
- `tests/market-consolidation.test.js`
- `tests/pr7-three-country-revision.test.js`
- `tests/russia-horizontal-engine-landing.test.js`
- `tests/yandex-webmaster-verification.test.js`
- `docs/superpowers/specs/2026-07-29-foundation-seo-fix-design.md`
- `docs/superpowers/plans/2026-07-29-foundation-seo-fix.md`
- the nine PNG files under `docs/evidence/foundation-fix/`
- `FOUNDATION_FIX_REPORT.md`

## Preview deployment checklist

1. Confirm the Cloudflare preview uses this branch and keeps its `workers.dev` hostname on clean preview navigation.
2. Request the redirect matrix above and record status, `Location`, `Cache-Control`, and `CF-Cache-Status`.
3. Fetch all 51 sitemap URLs through the preview-equivalent routing path; confirm no unexpected second hop.
4. Fetch both Yandex verification files and compare their verification bodies.
5. Confirm CSS, JavaScript, WebP, PDF, and `/api/contact` paths bypass the site router as configured.
6. Re-run 390px visual checks on the preview.
7. Measure Peru mobile LCP on the preview and record the actual result.
8. Run controlled form success and failure tests with a valid preview Turnstile hostname; do not treat localhost `110200` as a product failure.
9. Inspect cache behavior first. Purge only affected URLs if stale responses are demonstrated; do not purge everything by default.

## Rollback

Before merge, the branch can be closed without affecting production. After merge, revert the four implementation commits in reverse order: `89ff84e`, `73d20b6`, `c000ce5`, and `f19b1b3`. This restores the previous image references, CSS, sitemap/metadata, and routing without deleting source images or changing the contact Worker.

## Post-deployment monitoring: days 7–28

- Google Search Console: submitted versus indexed pages, duplicate/canonical exclusions, redirect errors, and crawl anomalies.
- Yandex Webmaster: discovered versus searchable pages, canonical changes, and verification status.
- Cloudflare: redirect/cache behavior by hostname and any unexpected Worker invocation on static/API paths.
- Ads analytics: successful form conversion count, duplicate-goal rate, and landing-page error rate.
- Peru: field LCP and mobile engagement after the optimized assets have reached normal cache state.

## Remaining risks and non-goals

- Search-engine recrawl and canonical consolidation are asynchronous and are not a merge blocker.
- Production/preview LCP and valid-host Turnstile behavior require a deployed URL.
- Product Schema, Breadcrumb schema, new product entity pages, GEO copy expansion, new countries, and advertising-strategy changes were intentionally excluded.
- The product-detail component remains useful but non-indexable until selected products receive genuinely independent content and URLs in a later GEO/product-entity phase.
