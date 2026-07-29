# Chixiang Motor GEO Entity Audit

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
- The indexed family owners currently include English CG, CB, horizontal-engine, engine-parts, product-catalog, company, and home pages, with localized supporting pages.
- Market owners currently include Russia, Central Asia, Peru, and Colombia pages.
- The query-driven `/en/product-detail?series=...` page is a `noindex,follow` utility and is not eligible to own a search entity.
- Phase 5 explicitly leaves search volume, CPC, pricing, profit, buyer validation, technical compatibility, and named-customer evidence incomplete; this audit does not upgrade those gaps by inference.

## Organization and brand findings

The organization, brand, factual claims, and structured-data consistency are evaluated in the entity matrix. Company claims published across languages are treated as first-party public evidence; claims requiring certificates, registry records, or production records are not upgraded to independently verified facts without those documents.

## Product hierarchy findings

The matrix separates product families, model codes, cooling variants, and utility configurations. A model mentioned in a catalog or market landing page does not automatically justify a separate indexable page.

## Application findings

Applications are mapped only where the current content explicitly relates an engine family or model to a vehicle or operating context. Compatibility with a named vehicle platform remains unverified unless technical interfaces are confirmed.

## Market findings

Market pages can own a geographic entity while individual product-market relationships remain `SUPPORTED`, `HYPOTHESIS`, or `UNKNOWN`. Page existence and advertising preparation are not evidence of market demand.

## Entity ownership rules

- One canonical owner URL is assigned per entity.
- Localized equivalents are supporting URLs unless a market page owns a distinct market-specific entity.
- Mentions provide context but must not compete with the owner page for the same intent.
- Noindex utility pages may display specifications but cannot be owner URLs.
- Missing evidence results in `NEEDS_EVIDENCE` or `DO_NOT_BUILD_YET`, not speculative page creation.

## Conflicts and prohibited claims

The final conflict register records inconsistent model codes, corporate proof gaps, overlapping order policies, duplicate organization markup, and market statements whose available evidence does not support a definitive claim.

## Page decisions

Page decisions use only these actions: `KEEP`, `ENHANCE_EXISTING`, `BUILD_NEW`, `MERGE`, `NOINDEX_UTILITY`, `DO_NOT_BUILD_YET`, and `NEEDS_EVIDENCE`. `BUILD_NEW` requires both a defensible entity and sufficient commercial/content readiness; keyword intuition alone is insufficient.

## Phase 6.1 gate

Phase 6.1 may enhance approved owner pages after this audit is reviewed. Schema must follow visible, reconciled content. Advertising expansion remains separately gated by production performance measurement, sales-email delivery confirmation, and platform-side conversion ingestion.

## Methodology and limitations

This is an entity and ownership audit, not a market-demand study, legal due-diligence review, certification audit, or engineering compatibility approval. The CSV matrix is the normalized source of truth; this narrative summarizes its decisions and risks.
