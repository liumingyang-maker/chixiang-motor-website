# Chixiang Motor GEO Entity Audit

> **Status notice (2026-08-01): Historical snapshot.** This v1.0 audit is retained as
> the original discovery record. Its conflict counts and proposed actions do not
> override facts later approved by the owner or pages already implemented. For the
> current phase status, source hierarchy and freeze rules, use
> [`FOUNDATION_CLOSURE_AND_FREEZE.md`](FOUNDATION_CLOSURE_AND_FREEZE.md).

**Version:** 1.0

**Audit date:** 2026-07-29

**Mode:** Read-only strategic audit; no production code or tracking changes

**Canonical domain:** `https://chixiangmotor.com`

## Executive decision

Foundation development can remain frozen while GEO planning begins. This audit does not authorize bulk page production, Schema changes, advertising expansion, or a claim that the complete commercial measurement loop has been verified. The immediate objective is to establish which Chixiang entities are already supportable, which URL owns each entity, and which proposed relationships must remain hypotheses.

## Scope

Included evidence:

- the 51 canonical URLs in `sitemap.xml`;
- current repository HTML, JavaScript data files, Foundation reports, and Phase 5 research artifacts;
- publicly accessible production pages and decision-critical public sources;
- previously approved technical facts that are recorded in repository evidence.

Excluded evidence:

- customer chat originals, names, phone numbers, and other personal data;
- raw sales records and raw advertising-account exports;
- claims supplied only by an AI summary without a traceable source;
- unverified compatibility, market-share, demand, price, profit, CPC, lead-time, or certification claims.

## Evidence model

### Evidence status

| Status | Meaning |
|---|---|
| `VERIFIED` | Direct, traceable evidence supports the entity or relationship within the stated scope. |
| `SUPPORTED` | Multiple relevant signals support the conclusion, but independent or commercial validation is incomplete. |
| `HYPOTHESIS` | Plausible direction that must not be presented as an established market fact. |
| `UNKNOWN` | Available evidence is insufficient for a conclusion. |
| `CONFLICTING` | Current sources disagree or contain an unresolved data-quality issue. |

### Evidence visibility

| Visibility | Meaning |
|---|---|
| `PUBLIC` | Published website or citeable public source. |
| `INTERNAL_REFERENCE` | Repository research, tests, or controlled project evidence. |
| `PRIVATE` | User-supplied commercial summary with personal data removed. No such evidence is included in v1.0. |
| `ASSUMPTION` | An explicit working assumption; never treated as a public fact. |

## Source hierarchy

1. Current canonical production page and its matching repository source.
2. Product tables, page data files, and recorded Foundation evidence.
3. Frozen Phase 4 / Phase 5 research with its original gate and data-gap labels preserved.
4. Decision-critical public sources with a recorded access date.
5. Inference, always labelled `HYPOTHESIS` or `UNKNOWN`.

## Production baseline

- `sitemap.xml` contains 51 unique canonical URLs across English, Russian, Spanish, Portuguese, and Arabic.
- A live production fetch on 2026-07-29 returned HTTP 200 for all 51 Sitemap URLs; every response ended at the listed URL and exposed the same self-canonical.
- The indexed family owners currently include English CG, CB, horizontal-engine, engine-parts, product-catalog, company, and home pages, with localized supporting pages.
- Market owners currently include Russia, Central Asia, Peru, and Colombia pages.
- The query-driven `/en/product-detail?series=...` page is a `noindex,follow` utility and is not eligible to own a search entity.
- Phase 5 explicitly leaves search volume, CPC, pricing, profit, buyer validation, technical compatibility, and named-customer evidence incomplete; this audit does not upgrade those gaps by inference.

The 56 normalized entities in `GEO_ENTITY_MATRIX.csv` break down as follows:

| Entity type | Count |
|---|---:|
| Organization | 1 |
| Brand | 1 |
| Product family | 15 |
| Product model | 17 |
| Application | 5 |
| Market | 5 |
| Capability | 7 |
| Commercial policy | 5 |

Evidence disposition:

| Status | Count | Interpretation |
|---|---:|---|
| `VERIFIED` | 13 | Entity, page, or scoped policy is directly present in traceable current evidence. |
| `SUPPORTED` | 39 | The entity is credible, but claims, demand, or commercial readiness remain partly unverified. |
| `CONFLICTING` | 4 | Organization, horizontal-family, 152FMH, and certification facts require reconciliation. |

Recommended-action disposition:

| Action | Count |
|---|---:|
| `ENHANCE_EXISTING` | 26 |
| `KEEP` | 5 |
| `DO_NOT_BUILD_YET` | 17 |
| `NEEDS_EVIDENCE` | 8 |
| `BUILD_NEW` | 0 |

No row is approved as `BUILD_NEW`. Seventeen rows are explicitly `DO_NOT_BUILD_YET`, and eight require `NEEDS_EVIDENCE` before content or Schema amplification.

## Organization and brand findings

The site consistently presents the brand as **Chixiang Motor** and the legal English name as **Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.** The Chinese name `重庆驰翔摩托车制造有限公司` also appears in a public 2025 high-technology-enterprise list. This supports that a corresponding legal entity exists, but it does not resolve the site's detailed corporate claims.

The organization record was reconciled by the site owner on 2026-07-30. The approved public timeline distinguishes industry experience since 2003 from registration of the current company in 2007, and Hangu Town / Gaoteng Avenue is the approved current location. Capacity, quality, export and certification claims remain governed individually by the Company Fact Pack.

> Governance update (2026-07-30): The Made-in-China profile is excluded and is not evidence because it is not controlled by the company. Current company facts are governed by site-owner confirmation and the active Company Fact Pack.

The English home page also contains two Organization JSON-LD blocks. They use different organization naming and URLs, and one references `/images/logo.png`, which is absent from the repository; the available logo asset is `/images/logo.webp`. `sameAs` contains a WhatsApp contact link rather than an authoritative organization profile. These are Phase 6.1 entity-cleanup issues, not reasons to create more company pages.

**Decision:** keep `/en/about` as the organization owner and `/en/` as the brand owner. Reconcile legal facts and then reduce Organization markup to one authoritative record that matches visible content.

## Product hierarchy findings

The current indexed hierarchy already provides usable owners:

| Entity | Owner | Decision |
|---|---|---|
| Broad engine and product catalog | `/en/products` | Enhance hierarchy; do not add another generic products page. |
| CG family | `/en/cg-engine` | Enhance existing owner. |
| CB family | `/en/cb-engine` | Enhance existing owner. |
| Horizontal family | `/en/horizontal-engine` | Reconcile specifications before Schema or model expansion. |
| Engine parts | `/en/engine-parts` | Enhance part/code and after-sales evidence. |
| Russia horizontal models | `/ru/gorizontalnyj-dvigatel` | Keep as a narrow market conversion owner. |

The CG page is already capable of owning the air-cooled, balance-shaft, and water-cooled subfamilies plus CG125, CG150, CG175, CG200, CG250 and the SB water-cooled variants. Creating one URL for every table column would fragment authority and duplicate technical content. CG150 and CG200 should receive stronger selection and application sections on existing owners first.

The CB page can own CB150, CB200-C, and CB250. No current evidence justifies three separate indexable model pages.

The horizontal family has the highest product-data risk. Its English page title says 50–125 cc, the Russia page covers 110–150 cc, and the English table:

- repeats `CX152FMH-5B` for nominal 110 and 130 entries;
- pairs a nominal 125 entry with 107 ml displacement;
- does not explain its relationship to the Russia-page identifiers `152FMH`, `153FMI`, `154FMI`, and `1P56FMJ`.

The water-cooled horizontal, Tsunami, Hanwei/HW, automatic-clutch, AC320, complete-motorcycle, and complete-tricycle entities do not yet have sufficient differentiated evidence for new pages. They remain catalog sections or candidates.

**Decision:** no new model pages in Phase 6.1. First approve a factory specification master and make existing family owners visibly complete.

## Application findings

Five application entities are supportable: work/commuter motorcycles, cargo tricycles, off-road/pit-bike/enduro, ATV/UTV, and replacement/aftermarket supply.

The strongest cross-family opportunity is **cargo-tricycle engine selection**, because Peru and Uzbekistan research contains vehicle-ecosystem and visible-supply evidence. That evidence does not prove that a Chixiang engine fits a named vehicle. Future content must lead with load, duty cycle, cooling, reverse, shaft, mounting, electrical system, and transmission—not broad compatibility claims.

Russia off-road intent is supported by multiple public listings and a technical manual that associate `1P56FMJ` / YX140 terminology with pit bikes. This supports terminology and product-market relevance, not national demand or compatibility with every KAYO, BSE, ATV, or enduro platform.

Colombia has credible parts and motorcycle-ecosystem evidence. Complete-engine demand remains unverified. The current replacement and photo/code qualification path is appropriate; it should not be converted into a paid-demand claim.

## Market findings

Market ownership and product-market evidence are deliberately separated:

| Market | Owner | Supported direction | Explicit limit |
|---|---|---|---|
| Russia | `/ru/russia/` | Horizontal 140 and selected CB/off-road qualification; `1P56FMJ` is the best-supported named horizontal model. | Retail listings and terminology do not establish national B2B demand or universal fit. |
| Central Asia | `/ru/central-asia/` | CG air, CG water, and heavy water-cooled families for motorcycles/cargo contexts. | The region is not one homogeneous market. |
| Uzbekistan | `/ru/central-asia/` | 150–250 cc water-cooled cargo direction is supported by vehicle and channel signals. | Engine-only demand, Chixiang fit, buyers, and keyword metrics remain unverified. |
| Peru | `/es/peru/` | CG200 air-cooled first, CG150 air-cooled second, plus water-cooled and spares qualification. | Public listings are supply/parts signals, not Chixiang wholesale-volume proof. |
| Colombia | `/es/colombia/` | SEO, replacement qualification, parts, and distributor development. | Frozen research did not verify complete-engine demand; paid complete-engine search is not approved by this audit. |

The relationship labels above preserve the Phase 4/5 gates. A market page's existence does not make every model-market relation `VERIFIED`.

## Entity ownership rules

- One canonical owner URL is assigned per entity.
- Localized equivalents are supporting URLs unless a market page owns a distinct market-specific entity.
- Mentions provide context but must not compete with the owner page for the same intent.
- Noindex utility pages may display specifications but cannot be owner URLs.
- Missing evidence results in `NEEDS_EVIDENCE` or `DO_NOT_BUILD_YET`, not speculative page creation.

The recommended owner map is:

| Owner page | Primary ownership | Supporting role |
|---|---|---|
| `/en/` | Chixiang Motor brand and international entry | Organization, products, capabilities |
| `/en/about` | Legal organization and factory-capability narrative | Brand, testing, OEM, export supply |
| `/en/products` | Broad catalog and engine/application hierarchy | Emerging subfamilies without enough evidence for standalone pages |
| `/en/cg-engine` | CG family and current CG model set | Peru, Central Asia, Colombia market pages |
| `/en/cb-engine` | CB family and current CB model set | Russia market hub |
| `/en/horizontal-engine` | Global horizontal family | Russia horizontal landing |
| `/en/engine-parts` | Parts and aftermarket family | Colombia, Peru, Russia qualification content |
| `/ru/russia/` | Russia market hub and off-road/horizontal overview | Russia horizontal conversion landing |
| `/ru/gorizontalnyj-dvigatel` | Russia horizontal model/offer entity | Global horizontal family and Russia hub |
| `/ru/central-asia/` | Central Asia market; current Uzbekistan route | Global CG family |
| `/es/peru/` | Peru market entity | Global CG and parts owners |
| `/es/colombia/` | Colombia SEO/distributor-development entity | Global CG and parts owners |

Localized home, About, product, and family pages remain supporting language equivalents. They do not require separate English-alternative entity records.

## Conflicts and prohibited claims

| ID | Severity | Conflict | Required evidence/action |
|---|---|---|---|
| C1 | Resolved 2026-07-30 | 2003 industry-experience date and 2007 registration date were previously presented as a founding-date conflict; an uncontrolled third-party profile also introduced an address conflict. | The site owner approved the two dates as different facts, confirmed the current Hangu Town address, and excluded the uncontrolled third-party profile from evidence governance. |
| C2 | P0 for product trust | Horizontal code, displacement, and range mismatches across English and Russia pages. | Approve a factory specification master before model Schema or new pages. |
| C3 | Governed; evidence follow-up | ISO/CCC details and operating statistics do not yet have a complete document register. | The site owner approved narrowly scoped public wording in the Company Fact Pack. Do not add certificate versions, numbers, scope, validity, audit claims, or broader statistical interpretations until supporting records are registered. |
| C4 | Resolved 2026-07-30 | Duplicate Organization JSON-LD on `/en/`; different names/URLs and a missing `logo.png`. | Consolidated to one stable Organization node with the approved logo URL and entity identifier. |
| C5 | Resolved 2026-07-30 | `/en/` contained a stray `h` after the Portuguese hreflang element. | Removed in the English core owner-page implementation. |
| C6 | P1 | `CG150B` versus `CG150SB` naming. | Confirm preferred model identifier. |
| C7 | P1 | Hanwei, HW Water, and CG Heavy naming is not explicitly reconciled; reverse wording varies. | Define family aliases and model-specific reverse options. |
| C8 | P1 | Russia hub uses sample/wholesale/mixed/OEM thresholds 2/50/100/100; the horizontal landing uses samples 3 and formal orders 40. | Keep both scoped or approve one dated global policy; never merge them implicitly. |
| C9 | P1 | Peru and Colombia have an empty H1 in raw HTML and populate it with JavaScript. | Put meaningful H1 text in source HTML so non-rendering crawlers receive the entity. |
| C10 | Monitor | Search results still expose legacy `www` / `.html` product-detail URLs even though production now uses `noindex,follow` and excludes the utility from Sitemap. | Request recrawl and monitor 7–28 days; do not re-index the utility. |

Do not publish the following as established facts until evidence is added:

- exact market demand, search volume, CPC, profit, market share, or buyer volume;
- universal compatibility with a named motorcycle, tricycle, ATV, frame, or brand;
- door-to-door Russia delivery or a Russia transit-time promise;
- a universal MOQ derived from one campaign landing page;
- any ISO/CCC version, certificate number, certified scope, issuing body, validity date, or all-model claim beyond the approved generic wording;
- 2003, 8,000 per month, 99%, 15,000 m², or 50+ countries as independently audited or third-party-verified statistics.

## Page decisions

| URL or page group | Decision | Phase 6.1 treatment |
|---|---|---|
| `/en/` | `ENHANCE_EXISTING` | Core owner signals were reconciled on 2026-07-30; continue strengthening current product-family relationships without duplicating the company owner content. |
| `/en/about` plus localized About pages | `ENHANCE_EXISTING` | English company-owner facts were reconciled on 2026-07-30; localized pages should adopt only the same approved Fact Pack wording. |
| `/en/products` plus localized catalogs | `ENHANCE_EXISTING` | Make family/application hierarchy explicit; keep emerging families as catalog sections. |
| `/en/cg-engine` plus localized CG pages | `ENHANCE_EXISTING` | Expose subfamilies, strengthen CG150/CG200 selection, no model-page expansion. |
| `/en/cb-engine` plus localized CB pages | `ENHANCE_EXISTING` | Clarify applications and keep models under the family owner. |
| `/en/horizontal-engine` plus localized horizontal pages | `NEEDS_EVIDENCE` | Reconcile factory specifications first. |
| `/en/engine-parts` plus localized parts pages | `ENHANCE_EXISTING` | Add code mapping and after-sales process. |
| `/ru/russia/` | `ENHANCE_EXISTING` | Retain as broad market hub; clarify its role and policy scope. |
| `/ru/gorizontalnyj-dvigatel` | `ENHANCE_EXISTING` | Retain as narrower B2B conversion owner; strengthen verified specs and fit qualification. |
| `/ru/central-asia/` | `ENHANCE_EXISTING` | Add country-specific evidence labels; retain as the Uzbekistan route. |
| `/es/peru/` | `ENHANCE_EXISTING` | Put H1 in raw HTML; strengthen CG150/CG200 and technical-selection evidence. |
| `/es/colombia/` | `KEEP` | Put H1 in raw HTML; retain SEO/distributor qualification and no paid-demand claim. |
| `/en/product-detail?series=*` | `NOINDEX_UTILITY` | Keep out of Sitemap and entity ownership; monitor legacy search results. |
| News, contact, and two English guide pages | `KEEP` | Supporting evidence/education only; not primary product owners. |

### Do not build yet

Do not create standalone pages in the next sprint for CG125, CG175, CG250, CG150SB/CG175SB/CG200SB/CG250SB, CB150/CB200-C/CB250, 152FMH/153FMI/154FMI/1P56FMJ, Tsunami, Hanwei/HW, automatic-clutch, AC320, complete motorcycles, complete cargo tricycles, ATV/UTV, or generic country clones. This is a content-governance decision, not a judgment that the products lack value.

## Phase 6.1 gate

Phase 6.1 should be a controlled **Entity Reconciliation and Owner Enhancement Sprint**, not a page-production sprint.

Recommended execution order:

1. **Company fact pack:** legal name, Chinese name, founding date, registered/factory address, factory metrics, certification metadata, approved logo, and approved aliases.
2. **Factory specification master:** CG, CB, horizontal, water-cooled, HW, and AC320 model identifiers with approved technical fields and revision dates.
3. **Owner cleanup:** `/en/`, `/en/about`, `/en/horizontal-engine`, then `/en/cg-engine`.
4. **Market ownership:** Russia hub versus horizontal landing, Central Asia versus Uzbekistan, and Peru/Colombia raw-HTML entity signals.
5. **Visible content before Schema:** only after facts and owner copy agree should Organization, Product, and Breadcrumb markup be revised.
6. **Measurement gates:** production Lighthouse medians, sales-email receipt, Yandex goal ingestion, and Google conversion ingestion remain prerequisites for advertising expansion, not for starting GEO content planning.

Phase 6.1 acceptance criteria:

- one approved organization fact record and one Organization JSON-LD identity;
- no unresolved model-code/displacement conflict in content selected for enhancement;
- each enhanced entity has one owner and explicit supporting pages;
- raw HTML contains meaningful entity headings and summaries;
- no new compatibility, demand, certification, logistics, or MOQ claim lacks evidence and scope;
- no new indexable URL is created unless a later decision record explicitly approves it.

## Methodology and limitations

This is an entity and ownership audit, not a market-demand study, legal due-diligence review, certification audit, or engineering compatibility approval. The CSV matrix is the normalized source of truth; this narrative summarizes its decisions and risks.

Primary internal references:

- `FOUNDATION_AUDIT_REPORT.md`
- `FOUNDATION_FIX_REPORT.md`
- `research/phase-5/Phase_5_Executive_Summary.md`
- `research/phase-5/Phase_5_Data_Gaps.md`
- Phase 4 freeze `phase-4-v6-final-freeze-2026-07-16`
- `research/phase-4/deliveries/2026-07-16_phase-4-v6-final/phase4_evidence_log.csv` from that freeze

Decision-critical public references include the current Chixiang production pages, Peru PRODUCE record `P4-PE-01`, Peru product/channel evidence `P4-PE-04` through `P4-PE-07`, Uzbekistan evidence `P4-UZ-01` through `P4-UZ-05`, Russia evidence `P4-RU-01` through `P4-RU-08`, and Colombia evidence `P4-CO-01` through `P4-CO-14`. The matrix records source IDs beside each affected entity so claims can be traced without copying personal or raw commercial data.
