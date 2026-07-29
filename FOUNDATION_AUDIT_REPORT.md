# Chixiang Motor Foundation Audit Report

Audit date: 2026-07-29

Scope: domain, crawlability, sitemap, indexing signals, canonical metadata, on-page SEO, mobile containment, image performance, structured data, GEO readiness, and inquiry conversion foundations.

Environments:

- Production: `https://chixiangmotor.com`, currently based on `main` and not yet containing this sprint.
- Fix branch: `feature/foundation-seo-fix`, locally implemented and verified, not pushed, deployed, or merged.

This distinction is essential: the implementation task is complete in the branch, but the production website still exposes the audited P0 issues until the branch passes a Cloudflare preview review and is merged.

## Executive conclusion

### Branch status

The approved Foundation Fix Sprint is complete in the feature branch. Automated verification is green:

- 151/151 website tests passed.
- 13/13 contact Worker tests passed.
- `git diff --check origin/main...HEAD` passed.
- The worktree is clean.
- The branch is not merged.

### Production status

Production is not yet ready to declare the Foundation phase frozen. Direct checks on 2026-07-29 show:

- HTTP, HTTPS, `www`, and non-`www` root requests all return 200 rather than converging through permanent redirects.
- The root remains a 200 language/JavaScript redirect shell.
- The production sitemap still contains 69 URLs: 64 `.html` URLs, five `index.html` URLs, 17 product-detail entries, and the root URL.
- The Russian horizontal landing still emits a `www` canonical while being served from the non-`www` URL.
- Public search samples expose clean, `.html`, `www`, non-`www`, and parameterized product-detail variants.

The feature branch fixes these issues, but deployment is now the remaining P0 action.

## 1. Domain and hosting

### Production finding

| Request | Observed production response |
| --- | --- |
| `http://chixiangmotor.com/` | 200 |
| `http://www.chixiangmotor.com/` | 200 |
| `https://chixiangmotor.com/` | 200 |
| `https://www.chixiangmotor.com/` | 200 |

Current production therefore has no single enforced public origin.

### Branch result

Formal origin: `https://chixiangmotor.com`

The branch implements one-hop 301 behavior for HTTP and `www`, preserves query parameters, redirects `/` to `/en/`, and cleans `.html` and `index.html` document routes. Preview requests retain the `workers.dev` host.

Classification: production P0; branch PASS.

## 2. robots.txt

Production `/robots.txt` returns 200. Googlebot, YandexBot, and Bingbot are not specifically blocked, and the generic search policy allows `/`. The sitemap address is present and points to `https://chixiangmotor.com/sitemap.xml`.

Cloudflare currently prepends managed content signals that allow search/reference use but explicitly disallow several AI-related crawlers, including GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, Amazonbot, CCBot, and Bytespider.

Assessment:

- Traditional search crawlability: PASS.
- GEO policy: P1 policy decision. Blocking these agents does not automatically remove the site from Google/Bing search, but it narrows direct AI-crawler access. Decide deliberately whether that matches the intended GEO strategy.

The repository `robots.txt` itself is simple and does not block `/ru/`, `/es/`, `/products/`, Googlebot, YandexBot, or Bingbot.

## 3. Sitemap

### Production

| Check | Result |
| --- | ---: |
| Total locations | 69 |
| URLs containing `.html` | 64 |
| URLs containing `index.html` | 5 |
| Product-detail entries | 17 |
| Root URL entries | 1 |

The production sitemap is valid XML and returns 200, but it still advertises redirecting and duplicate utility URLs.

### Fix branch

| Check | Result |
| --- | ---: |
| Total locations | 51 |
| Missing local documents | 0 |
| `.html` or `index.html` locations | 0 |
| Product-detail entries | 0 |
| Root URL entries | 0 |
| Duplicate locations | 0 |
| Canonical mismatches | 0 |
| Noindex sitemap pages | 0 |

The 51 retained URLs cover language roots, product/category content, and country/market pages.

Classification: production P0; branch PASS.

## 4. Index foundation

Public search sampling confirms that the site is discoverable, but it also surfaces conflicting variants such as:

- clean non-`www` category URLs;
- `www` pages;
- clean and `.html` product-detail variants;
- parameterized product-detail pages.

Public search cannot provide reliable discovered/indexed/excluded totals. Exact counts require authenticated Google Search Console and Yandex Webmaster data.

Classification:

- Duplicate public entities before deployment: P0.
- GSC/Yandex coverage measurement after deployment: P1 monitoring item, not a PR blocker.

## 5. Canonical and hreflang

### Production sample

- `/en/`: correct self-canonical.
- `/es/peru/`: correct self-canonical.
- `/ru/gorizontalnyj-dvigatel`: currently canonicalizes to the `www` host.
- `/`: no canonical and no content-page H1.

### Fix branch full scan

All 51 sitemap documents have:

- a canonical URL;
- a canonical exactly matching the sitemap location;
- HTTPS and non-`www` host;
- clean document paths;
- no `noindex` directive.

Canonical, hreflang, Open Graph URL, and internal document links were normalized together. `/` no longer participates as a separate language entity; `/en/`, `/ru/`, `/es/`, `/pt/`, and `/ar/` retain their language relationships.

Classification: production P0; branch PASS.

## 6. Meta SEO

Branch scan across all 51 indexable pages:

| Check | Result |
| --- | ---: |
| Missing titles | 0 |
| Missing descriptions | 0 |
| Duplicate titles | 0 |
| Duplicate descriptions | 0 |

Thirteen titles exceed a conservative 65-character review threshold:

- `/en/about`
- `/en/air-cooled-vs-water-cooled-motorcycle-engine`
- `/en/engine-parts`
- `/en/how-to-choose-motorcycle-engine-manufacturer-china`
- `/en/`
- `/en/news`
- `/en/products`
- `/es/`
- `/es/products`
- `/es/about`
- `/ru/`
- `/ru/kontakty`
- `/ru/gorizontalnyj-dvigatel`

Seven descriptions exceed a conservative 170-character review threshold:

- `/en/about`
- `/en/contact`
- `/en/how-to-choose-motorcycle-engine-manufacturer-china`
- `/en/`
- `/es/about`
- `/es/peru/`
- `/ru/gorizontalnyj-dvigatel`

These are not indexing blockers. Search engines may rewrite them, but shortening the most commercial pages could improve snippet control.

Classification: uniqueness/completeness PASS; length refinement P1.

## 7. Heading structure

Every one of the 51 branch sitemap pages has exactly one H1. No page has zero H1 or multiple H1 elements.

The root fallback also contains a visible company/entity H1, although the server router redirects normal visitors and crawlers from `/` to `/en/`.

Classification: PASS.

## 8. Image SEO

Across indexable branch HTML:

| Check | Result |
| --- | ---: |
| Image elements | 178 |
| Missing `alt` attributes | 0 |
| Empty `alt` values | 52 |

Many empty values appear to be decorative brand/UI images, but this requires a manual content-image review. Several product assets still use non-semantic Chinese folder names, numbered files, or generic names such as `product_main_image_1.webp`. These load correctly but are weaker for asset-level SEO and maintenance than descriptive English product filenames.

Classification:

- Missing alt attributes: PASS.
- Empty-alt manual review: P1.
- Descriptive product filenames and image sitemap strategy: P2.

## 9. Mobile

The branch was checked at:

- 390x844
- 768x1024
- 1024x1366

Pages:

- `/ru/russia/`
- `/ru/gorizontalnyj-dvigatel`
- `/es/peru/`

All nine page/viewport combinations satisfy `document.documentElement.scrollWidth <= window.innerWidth`. Header, primary CTA, secondary action, hero image, and visible product content stay inside the viewport. The Peru long model list wraps instead of widening its card, and the fixes no longer depend on root-level overflow masking.

Evidence is stored under `docs/evidence/foundation-fix/`.

Classification: branch PASS; preview recheck required before merge.

## 10. Page speed

The earlier audit reported a very poor Peru mobile LCP baseline. A fresh PageSpeed Insights run was attempted on 2026-07-29, but the public API quota was exhausted, so no new production LCP, CLS, or INP value is claimed in this report.

Verified branch resource changes:

| Asset group | Before | Branch | Reduction |
| --- | ---: | ---: | ---: |
| Peru initial hero images | 2,452,171 B | 281,204 B | 88.5% |
| Shared Central Asia hero set | 5,764,257 B | 420,496 B | 92.7% |

The Peru design and three-engine composition remain unchanged. The WebP background is preloaded; engine images reserve layout space and use bounded fetch priority.

Classification:

- Asset transfer: PASS.
- Actual preview/production LCP below four seconds: P1 release measurement, not yet proven.
- Field INP requires real-user data and cannot be established from this local audit.

## 11. Structured data

Branch page-level presence across the 51 indexable documents:

| Type | Pages containing it |
| --- | ---: |
| Organization | 3 |
| FAQPage | 21 |
| Product | 0 |
| BreadcrumbList | 0 |

FAQ coverage is meaningful, but Organization coverage is inconsistent and Product/Breadcrumb entities are absent. These were explicitly excluded from the Foundation Fix Sprint to prevent scope expansion.

Classification: P1 for the next entity/GEO phase, not a Foundation deployment blocker.

## 12. GEO foundation

The current content allows an AI or search system to identify:

- the company name and manufacturer role;
- Chongqing/China factory identity;
- CG, CB, horizontal, water-cooled, cargo/tricycle, off-road, and parts categories;
- OEM/ODM and distributor/assembler purchasing context;
- Russia, Central Asia, Peru, Colombia, and broader language-market entry points;
- procurement topics including MOQ, models, applications, technical confirmation, shipping responsibility, and samples.

The strongest remaining GEO limitations are structural rather than basic-content gaps:

- no Product or Breadcrumb schema;
- shared product-detail component is intentionally noindex;
- selected high-value product entities still need genuinely independent pages and evidence;
- Cloudflare's managed AI-crawler policy needs a deliberate business decision.

Classification: foundation content PASS; entity depth and crawler policy P1.

## 13. Conversion foundation

Automated tests confirm:

- normal page visits do not fire inquiry conversions;
- front-end validation, honeypot, missing Turnstile, failed Turnstile, Worker 400/500, and network failures do not fire a successful conversion;
- a successful `/api/contact` response can fire Google Ads conversion once;
- successful Russian submissions fire the Yandex lead goal once;
- rapid double submission produces one request/goal;
- button and success/error states are restored correctly;
- form action remains `/api/contact` and router exclusions do not capture the API path;
- Google Ads, Yandex IDs, Turnstile references, and form endpoint counts are unchanged from `origin/main`.

Localhost visual testing produced Turnstile error `110200`, which is expected for an unapproved local hostname. A valid Cloudflare preview hostname is required for the final real-form smoke test.

Classification: automated PASS; preview valid-host smoke test P1 release check.

## PASS

- Feature branch implementation is complete and clean.
- 51 branch sitemap URLs are unique, clean, indexable, and self-canonical.
- Titles, descriptions, canonicals, and H1 are present on every sitemap page.
- No duplicate title or description was found.
- Product-detail utility is `noindex,follow` and absent from the branch sitemap.
- Yandex verification exceptions remain 200 responses.
- Traditional search robots are allowed.
- All nine responsive page/viewport checks pass.
- Hero transfer bytes are substantially reduced without removing the three-engine design.
- Conversion and contact Worker regression suites pass.

## P0

1. Push the branch and create a PR without merging automatically.
2. Validate redirects, cache headers, 51 sitemap URLs, Yandex verification, static/API exclusions, 390px layouts, and a valid-host form flow on the Cloudflare preview.
3. Merge only after preview approval. Until then, production still serves four 200 origins, the root shell, the 69-URL legacy sitemap, duplicate product-detail variants, and the Russian `www` canonical.

## P1

- Shorten the most important overlong titles and descriptions after the Foundation deployment.
- Review 52 empty-alt images and retain empty alt only for genuinely decorative assets.
- Add consistent Organization, Product, and Breadcrumb data in the GEO/product-entity phase.
- Decide whether Cloudflare should continue blocking the listed AI-related crawlers.
- Measure preview and post-deployment mobile LCP; inspect field INP when real-user data exists.
- Monitor Google Search Console and Yandex Webmaster for 7–28 days after deployment.
- Perform controlled successful and failed form submissions on an allowed preview hostname.

## P2

- Rename high-value product images with descriptive, language-neutral filenames during a future asset migration.
- Build selected commercial product entities as independent pages rather than re-indexing all parameter variants.
- Expand evidence-backed GEO content and citations only after URL consolidation reaches production.
- Add an image sitemap or richer image metadata if image-search traffic becomes commercially relevant.

## Readiness decision

### Can Foundation optimization stop now?

- Development scope: yes. The approved Foundation Fix Sprint is complete.
- Production scope: not yet. Preview approval and deployment are the final P0 gate.

### Can the next phases start?

1. GEO SEO: planning may start now; publishing/scaling should follow Foundation deployment.
2. Google Ads: existing controlled campaigns can continue, but do not scale budget until preview form/conversion tests pass and canonical redirects are live.
3. Yandex Direct: same decision as Google Ads; verify the Russian goal and landing route on preview first.
4. Country landing-page expansion: wait until the Foundation branch is deployed so new pages inherit the clean URL and canonical rules.

Recommended immediate action: choose “push and create a Pull Request,” inspect the Cloudflare preview, then merge only after the preview checklist passes.
