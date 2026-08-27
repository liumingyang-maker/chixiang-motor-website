# Portuguese / Brazil Content Plan (PT-BR) — Phase 2 Discovery

Research only. **No production file changed.** Copy must be genuine Brazilian Portuguese learned from Brazil SERP, NOT a translation of English/Spanish.

## Key discovery that reshapes the Brazil bet (SERP_OBSERVED, non-geo caveat)
- In Brazil, **"CG" is a Honda model name** (CG 150 / Titan / Fan). Queries like `motor cg 150 preço/comprar` return **consumer** replacement and **used engines** on Mercado Livre, OLX, Magazine Luiza, Casas Bahia — retail intent, not B2B importer intent, plus **Honda trademark adjacency**. → Do **not** make Brazil "motor CG" a commercial target. (Registry: PT CG row = NO_ACTION.)
- Brazil B2B/parts intent that IS real (`... por mayor / atacado / importar da China`) is dominated by **B2B marketplaces** (Alibaba PT, Made-in-China PT, Global Sources PT) and **national distributors** (MTO, Works, Emtecorp) that stock many brands. Chixiang's differentiated role is **Chinese factory / exportador supplying importers and assemblers**, which is a narrower but valid segment.
- **The most promising Brazil product angle is the horizontal / cargo-tricycle motorcycle engine** (`motor horizontal`, moto + triciclo de carga, Loncin-type supply seen on Alibaba/AliExpress), which matches Chixiang's actual CX horizontal family better than a Honda-CG-replacement query. `/pt/motor-horizontal` is already ~pos 9.6 (GSC_supplied).

## Architecture constraints (OBSERVED — same as ES)
- PT has zero guide pages; EN has two. `pt/news.html` ("Notícias e guias" pattern) is the natural PT article hub.
- New PT URL = Foundation change: `sitemap.xml` + `scripts/site-entity-manifest.js` `classify()` (PT article slugs are not whitelisted) + page schema/breadcrumb + entity/schema tests, via the AGENTS.md exception flow. Nothing built this round.

## Recommended PT-BR pages (few, owner-linked, Brazilian Portuguese)

### PT-G1 — "O que é um motor CG e qual a diferença para o motor CB" (P2)
- Intent: informational. Keywords (BR phrasing): o que é motor cg, diferença entre motor cg e cb, motor cg ou cb.
- Owners: `/pt/motor-cg`, `/pt/motor-cb`.
- Why separate: captures informational CG/CB demand and hands buyers to owners; must explicitly distinguish the **engine type** from the **Honda CG motorcycle** to avoid consumer/Honda mismatch.
- Cannibalization + brand risk: MEDIUM; avoid Honda-model positioning; no commercial/price claims here.
- Evidence: real CG & CB engine photos + valve-train comparison. (EVIDENCE_NEEDED)

### PT-G2 — "Importar motor de moto da China: guia para importadores" (P1 — best PT head page)
- Intent: informational-commercial, importer-facing. Keywords (BR): importar motor de moto da China, comprar motor de moto por maior, fornecedor de motor de moto china, motor de moto no atacado.
- Owners: `/pt/` home + `/pt/products` + `/pt/contato` (and cross-links to family owners).
- Why separate: this is the angle with genuine B2B value in Brazil and mirrors the existing EN procurement guide; it targets the **importer/wholesaler** not the retail mechanic.
- Cannibalization: LOW (informational, distinct from family owners' transactional terms).
- Evidence (EVIDENCE_NEEDED): factory, assembly line, test bench, container/packaging, export/OEM documentation boundaries consistent with approved facts (no invented certifications, MOQ, price).

### PT-G3 — "Motor horizontal para moto: aplicações e versões 110–150cc" (P2)
- Intent: commercial-informational, strongest product fit for Brazil.
- Owner: `/pt/motor-horizontal`.
- Why separate: Brazil uses "motor horizontal" for moto + triciclo de carga; a Brazil-language explainer of the CX horizontal family application funnel strengthens the already-top-10 `/pt/motor-horizontal`.
- Cannibalization: keep informational; owner keeps supplier terms.
- Evidence: horizontal engine + moto/triciclo application photos.

## NOT recommended
- `/pt/brasil/` country page — **NO_ACTION/WATCH** (see LATAM plan); insufficient distinct-intent evidence.
- Any "motor CG 150 preço"-style consumer page — NO_ACTION (Honda + consumer mismatch + trademark).
- Mechanically translated ES/EN pages — forbidden; language must be Brazil-native.

## Cadence
Given the intent traps, evidence supports **1 first (PT-G2, the importer guide)** then PT-G3; PT-G1 only if Brazil SERP confirms CG/CB informational demand worth separating from the Honda confusion. PT may start at **one** page — that is acceptable (NO_ACTION is a valid outcome for the rest).

## Guardrails
- Do not touch existing `/pt/*` owners this round (and note Batch 1 already corrected PT horizontal title and CB claims — do not re-modify).
- Reuse existing schema/breadcrumb conventions; no new Schema IDs; PT must remain pt-BR under the same hreflang cluster (hreflang is frozen).