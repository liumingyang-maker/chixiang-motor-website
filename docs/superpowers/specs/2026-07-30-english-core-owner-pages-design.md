# English Core Owner Pages — Company Entity Design

Date: 2026-07-30
Status: Implemented on feature branch; review and PR pending
Scope: `/en/`, `/en/about`, `/en/products`, and the active company-fact governance records used by those pages

## 1. Objective

Strengthen the English company entity without redesigning the website.

The three core pages will have distinct ownership:

- `/en/` owns the brand summary and international procurement entry point.
- `/en/about` owns the complete public company identity and manufacturing facts.
- `/en/products` owns the current product taxonomy and clearly separated future product programs.

The work must make the company, its current products, and its future plans easier for buyers, search engines, and AI systems to distinguish.

## 2. Approved Direction

The site owner selected the content-and-structure enhancement approach:

- retain the existing visual system, CSS, header, footer, and page framework;
- improve headings, visible copy, section order, entity ownership, internal links, and calls to action;
- do not perform a full visual redesign;
- do not create new country pages or product-model pages;
- do not change advertising, analytics, contact Worker, Turnstile, or conversion logic.

## 3. Evidence Policy

### 3.1 Allowed sources

Public company statements may use:

1. direct site-owner confirmation;
2. the approved Company Fact Pack;
3. current official website content that does not conflict with owner confirmation;
4. formal company, factory, certification, or product documents supplied later by the site owner.

### 3.2 Made-in-China exclusion

The Made-in-China profile is not controlled by the company and must not be used as:

- a factual source;
- a conflict source;
- corroboration for company history, address, capability, products, or certification;
- a source for public website copy or structured data.

Active governance files must remove Made-in-China from evidence and conflict decisions. Historical audit documents may retain the record for traceability only if they explicitly state that the profile is excluded and is not evidence.

## 4. Approved Company Entity

### 4.1 Brand and legal company relationship

`CHIXIANG MOTOR` is the public-facing brand of:

`Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.`

The website must not alternate between unrelated-sounding company entities. The brand name can lead marketing copy; the legal company name must appear on the About page, in the footer, and in Organization structured data.

### 4.2 Approved public facts

- Industry experience since 2003.
- The current company was registered in 2007.
- Current location: Hangu Town, Jiulongpo District, Chongqing, China.
- Approved detailed address: No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China.
- Factory area: 15,000 m².
- Monthly engine capacity: 8,000+ units.
- Export coverage: 50+ countries.
- First-pass yield: 99%.
- ISO 9001 quality management system certification may be stated generically.
- CCC-certified products are available.
- OEM/ODM and market-configuration support may be stated.

### 4.3 Claim boundaries

- Do not describe 2003 as the registration or incorporation year.
- Do not publish ISO version, certificate number, subject, scope, issuer, or validity without formal documentation.
- Do not imply that every product has CCC certification.
- Do not add superlatives such as “leading,” “number one,” or “largest.”
- Do not invent employee count, annual output, customer names, market share, patents, test standards, warranty terms, or delivery promises.

## 5. Page Ownership Model

| Page | Primary entity responsibility | Must not become |
| --- | --- | --- |
| `/en/` | Brand summary, main product families, buyer routing, compact trust proof | A second About page or a model specification catalogue |
| `/en/about` | Legal identity, history, current address, factory, capacity, quality workflow, certification boundaries | A generic promotional page with no visible company identity |
| `/en/products` | Current product taxonomy, application routes, links to series owner pages, future-program status | A flat list that treats future products as currently available |

## 6. English Homepage Design

### 6.1 Metadata and main heading

Approved H1:

`Motorcycle & Cargo-Tricycle Engine Manufacturer in China`

The title and description must use the same entity focus: Chixiang Motor is a Chongqing manufacturer supplying motorcycle and cargo-tricycle engines for international B2B buyers.

### 6.2 Recommended section order

1. Existing header.
2. Hero with one visible H1.
3. Short company and buyer statement.
4. Primary CTA: `Send Inquiry` → `/en/contact`.
5. Secondary CTA: `View Products` → `/en/products`.
6. Current product-family grid.
7. B2B supply capabilities.
8. Compact trust evidence.
9. Links to the About and Products owner pages.
10. Final inquiry CTA and existing footer.

### 6.3 Current product-family grid

The homepage may present only current supply:

- Horizontal Engines
- CG Engines
- CB Engines
- Water-Cooled Engines
- Cargo-Tricycle Engines
- ATV / Off-Road Engines
- Engine Parts

The current `Motorcycles` card must be removed from the homepage because complete motorcycles and CKD/SKD kits are not yet an active product line.

### 6.4 Homepage trust evidence

Keep the homepage compact:

- Industry experience since 2003
- 8,000+ engines monthly capacity
- 50+ export countries
- ISO 9001

The homepage should link to `/en/about` for registration year, full address, factory area, first-pass yield, and certification boundaries.

### 6.5 Homepage future-product rule

Do not mention the planned complete-motorcycle or CKD/SKD program on the homepage. Future-product disclosure belongs only to the Products owner page.

## 7. About Page Design

### 7.1 Metadata and main heading

Approved visible H1:

`About Chixiang Motor: Motorcycle Engine Factory in Chongqing`

The existing screen-reader-only H1 is not sufficient for the intended company-owner role. The main heading must be visibly rendered while preserving one H1.

### 7.2 Recommended section order

1. Existing header.
2. Visible H1 and approved company summary.
3. Company identity and timeline.
4. Current factory location and address.
5. Factory facts and manufacturing capability.
6. Production, testing, and quality workflow.
7. Certification and claim boundaries.
8. Product-family summary with links to `/en/products` and series owner pages.
9. Export and OEM/ODM support.
10. Primary inquiry CTA and existing footer.

### 7.3 Company identity panel

The page should clearly show:

- Brand: CHIXIANG MOTOR
- Legal company: Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.
- Industry experience: since 2003
- Company registration: 2007
- Current location and approved address

### 7.4 Factory fact presentation

The About page may publish the full approved set:

- 15,000 m² factory area
- 8,000+ engines per month
- 99% first-pass yield
- 50+ export countries

Each number must be described precisely and must not be expanded into unsupported guarantees.

### 7.5 Certification wording

Allowed:

- `ISO 9001 quality management system certified.`
- `CCC-certified products are available.`

Not allowed:

- an unverified ISO version or certificate number;
- a claim that all products are CCC certified;
- unverified certificate scope, validity, issuer, or certified model list.

## 8. Products Page Design

### 8.1 Metadata and main heading

Approved H1:

`Motorcycle Engines, Parts, Motorcycles & CKD/SKD Programs`

The introductory copy must immediately distinguish:

- products currently supplied;
- a future vehicle program that is still in preparation.

### 8.2 Current product taxonomy

Keep currently published and approved engine families, organized into understandable groups:

- Horizontal engine programs
- CG air-cooled engine programs
- CB engine programs
- Water-cooled engine programs, including approved CG Water, Tsunami, HW Water, EFI, and automatic-clutch families where existing evidence supports them
- ATV / off-road engine programs
- Cargo-tricycle engine applications
- Engine parts

Existing model and configuration wording must follow the approved engine fact records. This task must not invent or expand model specifications.

### 8.3 Complete-tricycle correction

The company currently supplies cargo-tricycle engines, not complete tricycle vehicles.

Therefore:

- remove the current `Tricycles` complete-vehicle card;
- retain cargo-tricycle engines as a current engine application;
- do not state or imply that complete tricycles are available for wholesale.

### 8.4 Future motorcycle program

Add one public combined category:

`Motorcycles & CKD/SKD Kits`

Required status label:

`In Preparation`

Required status copy:

`This product program is in preparation. Specifications and wholesale availability will be published after production approval.`

Restrictions:

- do not publish a three-month launch estimate;
- do not present the program as current production;
- do not show model specifications;
- do not show MOQ, price, delivery time, or certification;
- do not provide a quotation CTA on the future-program card;
- do not include it in homepage current-product claims;
- do not create a separate indexable product page until production and public facts are approved.

### 8.5 Product routing

Current product cards should link to the corresponding existing owner pages when available. Where no owner page exists, the card may route to the inquiry page or remain an informational category without creating a thin page.

## 9. CTA and Contact Hierarchy

For all three English owner pages:

1. On-site inquiry is the primary conversion route.
2. Email is a supporting route.
3. WeChat and WhatsApp are supporting contact options where already available.

The homepage primary CTA is `Send Inquiry`; `View Products` is secondary.

The future motorcycle program must not have a quote CTA until the program is approved for wholesale.

## 10. SEO and GEO Requirements

### 10.1 Visible entity signals

Each page must have:

- one visible H1;
- a self-referencing canonical;
- a unique title and description;
- entity-specific introductory text in raw HTML;
- meaningful internal links to the other owner pages;
- no JavaScript-only injection for the H1 or primary entity statement.

### 10.2 Entity ownership

- Company facts point to `/en/about`.
- Product-family references point to `/en/products` or the relevant existing series owner page.
- Homepage summaries must not compete with the detailed owner pages.
- Future programs must remain clearly separated from current products.

### 10.3 Structured data boundaries

- Use one stable Organization identity and legal name.
- About is the detailed company-fact owner.
- Homepage may contain a compact Organization/WebSite summary consistent with About.
- Products may use CollectionPage, ItemList, or equivalent catalogue structure.
- Do not create product offers, prices, reviews, aggregate ratings, or availability for category cards.
- Do not attempt to qualify for Google Product rich results by inventing Offer, Review, or AggregateRating data.
- The future motorcycle program must not use Product or Offer structured data.

## 11. Accessibility, Mobile, and Performance

- Preserve one logical heading hierarchy.
- Keep CTA labels explicit.
- Ensure future-program status is visible text, not color alone.
- Preserve keyboard access and focus states.
- Test at 390×844, 768×1024, and 1024×1366.
- Do not introduce horizontal overflow.
- Reuse existing optimized local assets.
- Set image dimensions and lazy-load below-the-fold images.
- Do not add large new libraries, frameworks, or third-party scripts.

## 12. Files Expected to Change During Implementation

Production files:

- `en/index.html`
- `en/about.html`
- `en/products.html`
- shared CSS only if small layout support is required

Governance files:

- active Company Fact Pack records that currently cite Made-in-China
- active entity/page matrices that treat Made-in-China as evidence

Tests:

- a focused English owner-page contract test
- existing GEO fact-governance and entity-alignment tests as needed

The implementation must not modify:

- contact Worker behavior;
- Turnstile;
- Google Ads conversion logic;
- Yandex Metrica goals;
- redirects, canonical domain, robots.txt, or sitemap routes;
- unrelated language pages in this first implementation batch.

## 13. Acceptance Criteria

1. The three English pages have distinct and non-competing owner roles.
2. All three have one visible H1 and unique metadata.
3. The homepage no longer presents complete motorcycles as a current product.
4. Products no longer presents complete tricycles as a current product.
5. Products publicly shows one truthful `Motorcycles & CKD/SKD Kits — In Preparation` category.
6. No launch date, quote CTA, price, MOQ, specification, or structured offer is attached to the future program.
7. Cargo-tricycle engines remain a current product/application.
8. Approved company facts are consistent across visible copy and structured data.
9. Made-in-China is absent from active fact and entity decisions.
10. Existing advertising, analytics, forms, and conversion behavior remain unchanged.
11. Existing automated tests pass, and new owner-page contract tests pass.
12. Mobile screenshots show no overflow or CTA obstruction at the required widths.

## 14. Delivery Process

1. Write a test-first implementation plan.
2. Implement on a dedicated feature branch.
3. Run automated and visual checks.
4. Provide preview screenshots and a preview URL.
5. Create a Pull Request without merging.
6. Deploy or merge only after owner review.
