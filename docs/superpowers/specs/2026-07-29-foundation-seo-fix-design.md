# Foundation SEO Fix Sprint Design

**Date:** 2026-07-29

**Branch:** `feature/foundation-seo-fix`

**Status:** Approved design pending written-spec review

## Objective

Remove the P0 URL, canonical, mobile-layout, and Peru performance defects that make SEO, GEO, Google Ads, and Yandex Direct data unreliable. This sprint stabilizes the existing static multilingual site without redesigning pages, changing advertising/form behavior, adding country pages, or introducing a framework or build system.

## Approved decisions

1. The only production origin is `https://chixiangmotor.com`.
2. `/` is not a content entity and permanently redirects to `/en/`.
3. `/en/` is the global English homepage.
4. Sitemap entries are direct-200, indexable, self-canonical URLs only.
5. The shared product-detail component uses option B: `noindex,follow` and no sitemap entries.
6. Mobile fixes cover `/ru/russia/`, `/ru/gorizontalnyj-dvigatel`, and `/es/peru/`.
7. Peru keeps the current three-engine hero. Performance work changes encoding, transfer size, intrinsic dimensions, and resource priority only.
8. Google Ads, Yandex Metrica, Turnstile, contact forms, and `/api/contact` remain unchanged.
9. GSC/Yandex index changes are monitored for 7-28 days after deployment and do not block the development PR.

## Non-goals

- Product or Breadcrumb structured data
- New GEO articles, FAQs, country pages, advertising pages, or product entity pages
- Framework, bundler, CMS, or runtime architecture migration
- Copy, pricing, MOQ, product, form, contact-priority, or visual redesign changes
- Google Ads or Yandex goal changes
- Cloudflare-wide cache purge by default
- Redirecting every binary asset URL between www and non-www

## 1. Canonical origin and document routing

The canonical origin is `https://chixiangmotor.com`.

For HTML/document requests on the two custom hosts, the site router produces one-hop 301 redirects while preserving path and query:

```text
http://chixiangmotor.com/path?query
  -> https://chixiangmotor.com/path?query
http://www.chixiangmotor.com/path?query
  -> https://chixiangmotor.com/path?query
https://www.chixiangmotor.com/path?query
  -> https://chixiangmotor.com/path?query
```

The host rule applies only to `chixiangmotor.com` and `www.chixiangmotor.com`. A `*.workers.dev` preview stays on its preview host.

`workers/site-router.mjs` owns production document redirects. `wrangler.toml` invokes it first for document routes but excludes `/images/*`, `/css/*`, `/js/*`, `/pdf/*`, and `/api/*`. This keeps static assets on their current fast path and prevents the site router from intercepting the dedicated contact API.

Direct www requests for binary assets do not create indexable document duplicates and are outside this sprint. A future requirement to redirect all binary resources belongs in Cloudflare Bulk Redirects.

The router returns 301 for:

- language roots without a slash, such as `/en` -> `/en/`;
- `/index.html` -> `/en/`;
- language index paths, such as `/ru/index.html` -> `/ru/`;
- content `.html` paths, such as `/en/cg-engine.html` -> `/en/cg-engine`;
- consolidated legacy routes currently declared in `_redirects`.

The two Yandex verification documents are explicit exceptions and continue returning their exact verification body with status 200:

- `/yandex_68b52fccf05e4a88.html`
- `/yandex_8a3590afcb928a95.html`

`_redirects` remains as an asset-only fallback and points to clean destinations. The Worker contains the equivalent production behavior because Cloudflare does not apply `_redirects` after Worker code handles a request.

Redirects use a bounded cache policy so an incorrect rollout remains recoverable. No global cache purge is performed unless deployed responses demonstrate stale behavior.

## 2. Root and language homes

Production behavior is `/` -> 301 -> `/en/`. The root URL is removed from the sitemap and hreflang relationships. `/en/` is both the English and `x-default` destination.

The root `index.html` remains only as a non-JavaScript fallback asset:

- remove `meta refresh`;
- remove `window.location` navigation;
- include a readable H1, Description, canonical pointing to `/en/`, and a normal `/en/` link.

Because the Worker redirects `/` before serving the asset, SEO authority belongs to `/en/`. The English homepage retains one visible H1, a complete Description, and the self-canonical `https://chixiangmotor.com/en/`.

## 3. Canonical URLs and internal links

All indexable documents use final clean non-www canonical URLs:

- language and country directory pages end in `/`;
- standalone static pages use extensionless URLs;
- no indexable canonical uses www, `.html`, or `index.html`.

The same URL choice is applied to canonical elements, hreflang, Open Graph URL fields, sitemap locations, and production navigation/content links.

Internal links may still open the noindex product-detail component, but use its clean runtime URL, for example `/en/product-detail?series=cg-water`. Legacy `.html` strings remain only as incoming redirect definitions or verification filenames.

## 4. Sitemap contract

The sitemap is reduced from 69 entries to the actual indexable entity set. Approximately 51 entries are expected, but acceptance is based on correctness rather than a hard-coded count.

Remove:

- `/`;
- all `index.html` locations;
- all `.html` locations in favor of their clean route;
- the base product-detail component;
- all 16 `?series=` product-detail variants;
- any redirecting, noindex, duplicate, or non-canonical URL found by tests.

Every retained location must:

1. return 200 without a redirect in the production-equivalent router;
2. be indexable;
3. have a canonical exactly equal to the sitemap URL;
4. use HTTPS non-www;
5. appear once.

## 5. Product-detail component policy

`en/product-detail.html` remains a functional client-side component but stops claiming to be 17 indexable product entities. Its source uses `<meta name="robots" content="noindex,follow">`, and the base component plus all 16 query variants are absent from the sitemap.

The component does not publish a canonical element. One static canonical cannot self-reference every query variant, and combining `noindex` with a contradictory canonical adds no value. The self-canonical requirement applies to indexable sitemap pages.

This is temporary entity policy, not a permanent rejection of product SEO. A later GEO/product-entity phase may replace selected series with independent static pages containing unique copy, metadata, H1, specifications, canonical URL, and structured data.

The sprint does not change product data, images, interactions, quote paths, or forms inside the component.

## 6. Mobile overflow fixes

Target viewports are 390x844, 768x1024, and 1024x1366. Target pages are `/ru/russia/`, `/ru/gorizontalnyj-dvigatel`, and `/es/peru/`.

The implementation fixes the element establishing excess width rather than masking the symptom with a page-level `overflow-x:hidden` rule. Page-scoped corrections are limited to grid/flex minimum sizing, action wrapping/stacking, image/media width, product-card constraints, long Russian/Spanish wrapping, and safe 390px container padding.

Desktop breakpoints, content order, colors, typography, CTA hierarchy, product count, and page copy remain unchanged.

Runtime acceptance for every target page and viewport is:

```text
document.documentElement.scrollWidth <= window.innerWidth
```

Primary and secondary CTA rectangles must stay within the viewport. Screenshots cover header, hero/actions, a representative product section, and the form region without clipping or fixed-control obstruction.

## 7. Peru image and LCP optimization

Optimize these existing Peru hero assets:

- `images/central-asia-hero-bg-v2.png`
- `images/central-asia-hero-products/cg-air.png`
- `images/central-asia-hero-products/cg-water.png`
- `images/central-asia-hero-products/cg-heavy.png`

Create WebP derivatives with the same aspect ratio and alpha behavior. Keep original source files for recovery; production references use the optimized derivatives.

Transfer budgets are at most 350 KB for the background, 250 KB for each engine, and 1 MB combined. Visual QA checks engine transparency, edges, brand marks, color, and the unchanged desktop/mobile composition.

Loading rules:

- keep all three hero engines;
- preload the optimized background when it is the LCP candidate;
- give high fetch priority only to the primary critical image;
- do not lazy-load an initially visible hero engine;
- add intrinsic width and height to generated hero images;
- keep below-fold images lazy-loaded.

Shared optimized assets may also reduce Central Asia and Colombia transfer cost without changing their content or composition.

The preview target is mobile LCP below 4 seconds. The report records the actual local/preview result and remaining bottleneck if the target is not met. Final production PageSpeed is a post-deployment check.

## 8. Advertising, analytics, and form invariants

The implementation preserves exactly:

- Google Ads ID `AW-16777656395`;
- form conversion `AW-16777656395/Om_nCMCV4swcEMvwmsA-`;
- WhatsApp conversion `AW-16777656395/bovKCKOx088cEMvwmsA-`;
- Yandex counter `110874170` on the two dedicated Russia landing pages;
- legacy counter `109483511` where currently installed;
- `ym-submit-leadform` and `ym-open-chat`;
- Turnstile wiring and success requirement;
- `/api/contact`, its payload, status messages, and duplicate-submit protection;
- the Russia Yandex-only page policy.

No advertising or form implementation changes are expected. Tests protect these invariants where SEO/internal-link edits touch surrounding HTML.

## 9. Test strategy

Implementation follows red-green-refactor.

Router tests cover custom-host/protocol convergence, one-hop path/query preservation, root and legacy paths, workers.dev preview behavior, both Yandex verification responses, canonical asset pass-through, and the `/api/contact` routing exclusion.

Foundation SEO tests parse the sitemap and documents to reject `/`, `.html`, `index.html`, product-detail, duplicates, www URLs, redirecting entries, noindex entries, and canonical mismatches. They verify clean hreflang and `x-default`, the product-detail `noindex,follow` policy, outgoing internal-link hygiene, and advertising/form invariants.

Browser checks collect document width, viewport width, CTA rectangles, missing-image/console errors, and before/after screenshots at all target sizes.

All existing regressions run. The clean baseline is 120 site/page tests and 13 Contact Worker tests, with zero failures.

## 10. Delivery and rollout

The unmerged branch includes `FOUNDATION_FIX_REPORT.md`, a changed-file inventory, before/after URL/sitemap/canonical/mobile/asset tables, redirect and regression results, all target screenshots, local/preview performance measurements with environment labels, remaining risks, and post-deployment checks.

Commits are grouped by responsibility:

1. approved design and implementation plan;
2. routing, sitemap, canonical, links, and product-detail policy;
3. mobile overflow fixes;
4. image/performance optimization;
5. final report and evidence.

After preview deployment, validation checks status, `Location`, `CF-Cache-Status`, `Cache-Control`, sitemap content, canonical output, image delivery, forms, and analytics. Cache purge occurs only if stale responses are demonstrated. GSC and Yandex Webmaster are monitored for 7-28 days; asynchronous index results do not block the PR.

## Exit criteria

Foundation development may freeze when:

1. Tested document variants converge to HTTPS non-www with one 301.
2. `/` redirects to `/en/` without client navigation.
3. Every sitemap URL is direct-200, indexable, unique, and self-canonical.
4. Product-detail variants are `noindex,follow` and absent from the sitemap.
5. All three landing pages have no horizontal overflow or clipped CTA at 390px, 768px, or 1024px.
6. Peru critical hero assets meet the transfer budget and preview performance is recorded.
7. Advertising, analytics, Turnstile, form, and Worker regressions pass unchanged.
8. The branch contains the report/screenshots and remains unmerged for review.
