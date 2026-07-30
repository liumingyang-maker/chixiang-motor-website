# Multilingual Core Owner Pages Design

Date: 2026-07-30  
Status: Approved design, awaiting written-spec review  
Branch: `feature/multilingual-core-owner-pages`

## 1. Purpose

Synchronize the four non-English core site groups with the approved English owner-page model so customers, search engines and AI systems receive the same company identity, current supply scope and future-program boundary in every supported language.

This phase updates twelve canonical pages in one pull request and provides one preview URL per page before merge.

## 2. Plain-language model

- An **owner page** is the official page responsible for one kind of answer.
- A language **home page** owns the localized brand introduction and routes buyers to the right product or company page.
- A language **About page** owns detailed company facts.
- A language **Products page** owns the product-family tree and separates current supply from future programs.
- **JSON-LD** is the machine-readable version of visible page facts. It must not say anything the visible page does not support.
- **Canonical** identifies the official URL for the page.
- **Hreflang** connects equivalent language versions without treating them as duplicates.

## 3. Pages in scope

| Language | Home owner | About owner | Products owner |
|---|---|---|---|
| Russian | `/ru/` | `/ru/about` | `/ru/products` |
| Spanish | `/es/` | `/es/about` | `/es/products` |
| Portuguese | `/pt/` | `/pt/about` | `/pt/products` |
| Arabic | `/ar/` | `/ar/about` | `/ar/products` |

## 4. Authoritative sources

The implementation must derive shared company and supply facts from:

1. `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`;
2. `docs/geo-entity/GEO_ENTITY_MATRIX.csv`;
3. the approved English owner pages on `main`:
   - `/en/`;
   - `/en/about`;
   - `/en/products`.

Country landing pages and uncontrolled third-party profiles are not evidence sources for global company facts.

## 5. Shared identity contract

All twelve pages must refer to one organization and one brand:

- brand: `CHIXIANG MOTOR` / `Chixiang Motor`;
- legal English name: `Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.`;
- industry timeline: active in the motorcycle-engine industry since 2003;
- registration timeline: the current company was registered in 2007;
- current location: Hangu Town, Jiulongpo District, Chongqing, China;
- current supply: motorcycle engines, cargo-tricycle engines and selected engine parts;
- current non-supply: complete tricycle vehicles;
- future program: motorcycles and CKD/SKD kits are in preparation and are not current wholesale offers.

The 2003 date must never be presented as the legal registration year of the current company.

## 6. Home-page owner contract

Each language home page must:

- retain one visible, localized H1 describing Chixiang as a motorcycle and cargo-tricycle engine manufacturer;
- introduce the current CG, CB, horizontal, water-cooled, cargo-tricycle and ATV/off-road engine programs;
- present selected engine parts only as a current supporting supply category;
- route detailed company facts to the matching About page;
- route the complete product tree to the matching Products page;
- avoid presenting complete motorcycles, CKD/SKD kits or complete tricycles as current supply;
- keep existing localized contact and navigation behavior unless a link must be corrected to a canonical route.

Future motorcycle and CKD/SKD status remains owned by Products pages and is not promoted as a home-page product offer.

## 7. About-page owner contract

Each language About page must visibly explain:

- the brand and legal-company relationship;
- industry experience since 2003;
- current-company registration in 2007;
- the current Hangu Town location;
- approved manufacturing, testing, monthly-capacity, quality-control and export-support statements;
- OEM/ODM support within the approved fact boundaries;
- generic ISO 9001 and CCC statements only.

The pages must not publish or infer certificate numbers, certificate validity, issuer, certified model coverage, patents, unapproved R&D metrics or other unverified details.

## 8. Products-page owner contract

### 8.1 Current supply

Each Products page must present the same current family tree as the English owner page:

- Horizontal Engines;
- CG Engines;
- CB Engines;
- Water-Cooled Engines;
- Cargo-Tricycle Engines;
- ATV / Off-Road Engines;
- selected Engine Parts.

Cargo-tricycle engines remain a current product. Complete cargo-tricycle vehicles do not.

### 8.2 Future program

Each Products page must contain one visibly separate localized status card for:

`Motorcycles & CKD/SKD Kits — In Preparation`

The localized copy must communicate the same meaning as:

`This product program is in preparation. Specifications and wholesale availability will be published after production approval.`

The future card must have no price, MOQ, specification table, quote button, inquiry button, Product schema, Offer schema, Review schema or AggregateRating schema.

### 8.3 Product routing

Current product cards should use canonical family or catalog routes. No primary card may route to a noindex parameter utility when a canonical family page exists.

## 9. Localization rules

- Customer-facing text must be written in the page language, not copied in English except for legal names, brand names and established technical abbreviations.
- Technical family names such as CG, CB, CKD and SKD remain unchanged.
- Translations must preserve meaning rather than mirror English word order.
- Russian, Spanish and Portuguese pages remain left-to-right.
- Arabic remains right-to-left, while model codes, email addresses, URLs and numerical specifications must remain readable.
- Existing market-specific contact labels may remain localized, but global company facts cannot vary by language.
- All core visible content must exist in raw HTML rather than being injected after page load.

## 10. Structured-data design

Structured data must use the same stable organization identity across languages:

`https://chixiangmotor.com/#organization`

### Home pages

Use a localized graph containing:

- `Organization` reference;
- `WebSite` reference where already appropriate;
- `WebPage` for the language home page.

### About pages

Use:

- `AboutPage`;
- the shared `Organization` identity;
- localized visible descriptions consistent with the page.

### Products pages

Use:

- `CollectionPage`;
- `ItemList` containing current product families only;
- the shared `Organization` identity as publisher or about reference.

Do not add Product, Offer, Review or AggregateRating markup in this phase. The future vehicle program must remain outside current product structured data.

## 11. SEO contract

Each page must retain or receive:

- one visible H1;
- one self-referencing non-www canonical;
- a unique localized title;
- a unique localized meta description;
- complete `en`, `ru`, `es`, `pt`, `ar` and `x-default` hreflang relationships where the corresponding group already exists;
- indexable robots directives consistent with the existing canonical owner-page role.

URLs, sitemap membership and redirect behavior do not change in this phase.

## 12. Visual and interaction constraints

- Preserve the existing language-page visual system and responsive breakpoints.
- Do not redesign country landing pages or introduce a new framework.
- Do not change advertising tags, analytics counters, forms, Turnstile, Worker behavior or conversion-event timing.
- Do not change the language-specific contact-channel order as part of this fact synchronization.
- Product images must resolve to existing repository assets.
- Cards, headings and actions must not overflow at 390×844, 768×1024, 1024×1366 or a representative desktop viewport.
- Arabic must retain correct RTL presentation without off-canvas content.

## 13. Automated verification

Add focused tests that verify:

1. all twelve pages exist;
2. each page has one visible H1 and a self-canonical URL;
3. every JSON-LD block parses;
4. all language variants reference the same organization identity;
5. About pages preserve the 2003 industry / 2007 registration distinction;
6. Products pages publish only approved current families;
7. complete tricycle vehicles are not current supply;
8. the future motorcycle and CKD/SKD card is visibly marked as preparation-only;
9. the future card has no quote action or commerce schema;
10. local image references exist;
11. existing Google Ads, Yandex Metrica, forms, Turnstile and Worker implementation files retain their approved behavior;
12. the five-language hreflang relationships remain complete;
13. Arabic RTL and mobile overflow guards remain effective.

Run the complete repository test suite before pushing the pull request.

## 14. Delivery and review

- One branch: `feature/multilingual-core-owner-pages`.
- One Draft pull request against `main`.
- Twelve direct branch-preview links, one for each page.
- No automatic merge.
- The site owner reviews visible translation, company facts, product boundaries and mobile layout before approving merge.

## 15. Explicit non-goals

This phase does not:

- modify `/en/`, `/en/about` or `/en/products` except for a necessary cross-language link correction discovered by tests;
- modify Russia, Peru, Colombia, Central Asia or other country advertising landing pages;
- create new country pages or model pages;
- redesign the site;
- change MOQ, price, shipping, sample or mixed-order policies;
- add Product rich-result commerce data;
- alter Google Ads, Yandex Direct, Yandex Metrica, form or email-delivery logic;
- merge or deploy without site-owner approval.

## 16. Acceptance criteria

The phase is ready for review when:

1. the twelve pages express the approved shared company identity in their own language;
2. Home, About and Products have distinct owner roles;
3. current supply and future programs cannot be confused;
4. the four Products pages no longer advertise complete motorcycles or complete tricycles as current products;
5. structured data matches visible content and contains no invented commerce evidence;
6. all required SEO, responsive, asset and integration tests pass;
7. twelve preview URLs are available;
8. no country landing page or conversion implementation appears in the production diff.
