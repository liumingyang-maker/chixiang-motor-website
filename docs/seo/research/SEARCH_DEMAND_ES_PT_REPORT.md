# Search Demand & Content Expansion — ES / PT-BR (Phase 2 Discovery)

Phase: PHASE 2 — ES / PT-BR Search Demand & Content Expansion **DISCOVERY** (research only).
Role: B2B SEO Research + SERP + Information Architecture.
Authoritative repo: C:\Users\97020\ZCodeProject\chixiang-motor-website (GitHub liumingyang-maker/chixiang-motor-website).
Branch: seo/es-pt-growth-discovery-phase-2. Base HEAD: ea63342721401d78ea87864b131026f80fe51379 (main after Batch 1).

**No production HTML/CSS/JS/Worker/API/tracking/test/Foundation file was changed. Only files under docs/seo/research/ were created.**

## Label discipline
- **GSC_OBSERVED (SUPPLIED)** — owner-supplied Search Console figures; not reproducible from the repo.
- **SERP_OBSERVED** — result sets from live web searches run during this task. Caveat: these were **non-geo-located** web searches, NOT country-targeted Google captures; treat ranking/demand as directional only.
- **OBSERVED** — present in the repository / approved fact packs / governance files.
- **INFERENCE** — reasoned interpretation, not a proven fact.
- **NEEDS_EVIDENCE** — must be confirmed before any build action.

## 1. Executive summary
- **Spanish is where the demand already is; Portuguese/Brazil is under-developed and partly a trap.** Chixiang already ranks on page 1 for ES CG (`/es/motor-cg` ≈ pos 8–10). ES CG and the CG/CB comparison are the highest-confidence near-term upside. (GSC_OBSERVED SUPPLIED + SERP_OBSERVED)
- **The single biggest Spanish gap is localized support content.** EN has two full guide pages (`air-cooled-vs-water-cooled...`, `how-to-choose-motorcycle-engine-manufacturer-china`, page_type=guide/article) but ES and PT have **none** — `es/news` ("Noticias y guias") currently links readers out to the **English** articles. (OBSERVED)
- **Brazil "CG" is a brand-entangled, consumer-intent market.** In Brazil `motor CG 150` overwhelmingly resolves to the **Honda CG / Titan 150** replacement/used-engine aftermarket (Mercado Livre, OLX, Magazine Luiza, Casas Bahia), i.e. consumer + domestic retail + trademark adjacency — not B2B importer intent. Do **not** build the Brazil bet on "CG". (SERP_OBSERVED)
- **Brazil's more plausible B2B angle is Chinese horizontal / cargo-tricycle engines and "comprar motor de moto / importar da China" wholesale.** Horizontal motorcycle engines (Loncin-type, moto + triciclo de carga) appear via Alibaba/AliExpress/made-in-china, closer to Chixiang's actual product than a Honda-CG-replacement query. (SERP_OBSERVED + INFERENCE)
- **Dominican Republic is the strongest LATAM market-page signal**, but it overlaps the existing Peru/Colombia CG pages — a DR page is only justified with a distinct importer/distributor angle and the Foundation exception flow. (SERP_OBSERVED + OBSERVED)
- **Every new page (guide, market, or support) requires coordinated changes to sitemap.xml, scripts/site-entity-manifest.js (classify + breadcrumb + marketTitles), the page schema, and the entity/schema tests** — all frozen contracts. Therefore this phase produces **plans, not pages**. (OBSERVED)

## 2. Spanish demand (ES)
- **CG cluster — commercial.** `/es/motor-cg` is the proven asset (≈120 impressions, pos 9.6; `motor cg` 8.1, `motores cg` 8.0). Commercial queries (`motor cg 150/200/250 mayorista / proveedor / fabricante china`) are dominated by **marketplaces** (Alibaba Spanish, Made-in-China, Global Sources) and Chinese competitor directories — hard to outrank head-to-head, but a strong owner page can hold positions. **Action: OPTIMIZE_EXISTING, not new pages.** (GSC + SERP_OBSERVED)
- **CG/CB informational — the real gap.** `que es un motor cg` historically reached ~Top 10 for Chixiang, and `motor cg vs motor cb` / `qué es un motor cg` SERPs are filled by **YouTube, consumer forums and one competitor blog (AJ1moto)** — no authoritative manufacturer guide ranks. A concise, correctly-scoped ES guide ("¿Qué es un motor CG? Diferencias CG vs CB") targeting informational intent and funnelling to `/es/motor-cg` + `/es/motor-cb` is the highest-confidence support content. (SERP_OBSERVED)
- **Horizontal cluster — ambiguous.** `/es/motor-horizontal` ≈47 imp / pos 38.1; `motores horizontales` ≈58 imp / pos 40.1 is **intent-mixed** (industrial / agricultural / general-purpose gasoline + motorcycle). Keep the `para motocicleta` qualifier; do not chase the generic term. (GSC + last-audit SERP + INFERENCE)
- **Parts cluster — commercial, competitive.** `repuestos motor cg / piezas de motor moto mayorista` shows marketplaces + LATAM national distributors (intercap AR, kimpartsbolivia BO) + a top-10 wholesale competitor (JALYN/mrmotorcycleparts). `/es/repuestos-motor` exists; the win is sharper supplier positioning + internal links, not a new page. (SERP_OBSERVED + OBSERVED)

## 3. Portuguese / Brazil demand (PT-BR)
- `/pt/` ≈11 imp / pos 7.7 and `/pt/motor-horizontal` ≈7 imp / pos 9.6 — small, but the locale is **untreated**, not disproven. (GSC_OBSERVED SUPPLIED)
- **CG = Honda entanglement** (see §1). Recommended PT commercial focus shifts to **fornecedor chinês**, **motor de moto no atacado**, **importar motor da China**, and **motor horizontal para moto / pit bike / ATV leve**, while explicitly de-prioritizing generic "motor CG" Brazil bets. (SERP_OBSERVED + INFERENCE)
- **Parts (peças) intent is largely local distributor demand** (MTO, Works, Emtecorp) — retail/wholesale supply of many brands, not "buy from a Chinese engine factory". PT parts content must address the **importer who sources from China**, a narrower but real segment. (SERP_OBSERVED + INFERENCE)

## 4. Cluster-by-cluster opportunity read (see registry CSV for full rows)
| Cluster | ES verdict | PT-BR verdict |
| --- | --- | --- |
| CG | OPTIMIZE `/es/motor-cg` + CREATE informational guide (Qué es / CG vs CB) | WATCH / NO_ACTION on "CG" (Honda trap); route to generic moto/fabricante angle |
| CB | OPTIMIZE `/es/motor-cb`; share the CG-vs-CB guide | OPTIMIZE `/pt/motor-cb`; low demand evidence — WATCH |
| Horizontal | OPTIMIZE `/es/motor-horizontal`; keep motorcycle qualifier; small support angle | OPTIMIZE `/pt/motor-horizontal`; strongest B2B PT angle (moto/triciclo) |
| Parts | OPTIMIZE `/es/repuestos-motor` (supplier/importer angle) | OPTIMIZE `/pt/pecas-de-motor` for China-sourcing importers |
| Market | Peru/Colombia exist; DR is the strongest candidate | Brazil page NOT yet — see §5 |

## 5. Market-landing & Brazil-page decision (summary; full detail in LATAM_LANDING_PAGE_PLAN.md)
- Existing `/es/peru/`, `/es/colombia/`: substantial (12.5 KB / 10.1 KB, 8–10 H2), differentiated titles, already link to `/es/motor-cg` and `/es/repuestos-motor`. **But both have an empty visible `<h1></h1>`** — a real quality defect (flagged for a future approved batch; H1 is frozen now). Verdict: **OPTIMIZE_EXISTING**, not multiply clones. (OBSERVED)
- **Brazil `/pt/brasil/`: NO_ACTION for now.** No Brazil-specific GSC or distinct commercial-intent evidence yet; the current `/pt/*` owners can absorb Brazil traffic. Build only if a later Brazil GSC pull shows distinct country intent. (NEEDS_EVIDENCE + INFERENCE)
- **Dominican Republic: strongest CREATE_MARKET_PAGE candidate** (active Chinese-CG distribution chain: Loncin RD, Yang Zu, EJPM Motors, "moto cg china Dominicana"), **conditional** on a distinct importer/distributor angle + the frozen-contract exception flow; cannibalization risk vs `/es/motor-cg` and Peru/Colombia is real. (SERP_OBSERVED + INFERENCE)

## 6. Commercial vs informational split
- Commercial owner pages already exist per locale per family (CG, CB, horizontal, parts) + catalog + contact + market landings. **The missing layer is informational**, and only for ES/PT (EN already has it). Support content should be **few, high-quality, owner-linked** — the brief's 2–3/month ceiling applies; if only 1–2 ES guides are truly warranted, build only those.

## 7. SERP expectation & competitor observations (patterns, not copied)
- Recurring competitor archetypes: (1) Chinese manufacturer/directory sites (Sonlink, Shineray, Loncin, AJ1moto); (2) B2B marketplaces (Alibaba, Made-in-China, Global Sources); (3) LATAM national distributors (intercap AR, kimpartsbolivia BO, Works/MTO/Emtecorp BR); (4) informational publishers (YouTube, forums, TikTok); (5) industrial-engine pages accidentally ranking for ambiguous horizontal terms.
- **SERP expectation gap for Chixiang:** buyers see video/forum explanations (informational) and marketplace catalogs (commercial). Chixiang's edge would be **first-party factory evidence + a clear manufacturer/supplier authority** that neither a marketplace nor a TikTok explains — see §9.

## 8. Opportunity ceiling & risks
- Realistic ES ceiling: consolidate page-1 CG position, capture the CG/CB informational queries, deepen horizontal & parts owner pages, and evaluate DR. Meaningful but bounded by a niche B2B category (low absolute volume, high qualification).
- PT-BR ceiling: currently low visibility because untreated; but the strongest terms are intent-mismatched (Honda CG) or local-distributor-controlled. Ceiling is moderate and depends on picking the manufacturer/import/horizontal angle.
- **Risks:** (a) keyword-per-page sprawl; (b) ES CG family cannibalization if market/guide pages are not intent-scoped; (c) Honda "CG" trademark adjacency in Brazil; (d) horizontal industrial-intent dilution; (e) shipping thin country pages the freeze doc forbids.

## 9. First-party evidence needs (the moat) — mark EVIDENCE_NEEDED per page
Real assets to gather before publishing support/market pages: engine photos per family, factory/assembly-line and test-bench photos, packaging/shipping containers, CG-vs-CB cutaway or spec comparison, model plate close-ups, application photos (moto + triciclo de carga), and engineer explanations for "qué es". Do **not** use AI-generated imagery as factory proof. (OBSERVED principle + INFERENCE)

## 10. NEXT 90 DAYS (planning only — not executed here)
Framed as Search opportunity → Page owner → Evidence → Publish → Measure. NOT a content-factory cadence.
- **Wave 1 (highest confidence, nearest commercial value):**
  - ES support guide #1 "¿Qué es un motor CG? CG vs CB" → funnel `/es/motor-cg` + `/es/motor-cb` (after evidence + Foundation exception for new URL).
  - Consolidate `/es/motor-cg` optimization brief (buyer-decision content, internal links; only if WHY_CHANGE/EXPECTED_GAIN/RANKING_RISK/ROLLBACK justify touching a pos 8–10 page — default NO_ACTION).
- **Wave 2 (supporting content):** ES horizontal "para motocicleta: qué es y dónde se usa" guide; PT-BR "como escolher motor para moto / importar da China" guide (manufacturer angle, not CG).
- **Wave 3 (market localization):** fix empty H1 on existing Peru/Colombia (approved batch); evaluate + optionally build DR market page with a distinct importer angle.
- **Wave 4 (authority / evidence):** publish real factory/testing evidence blocks; expand About/manufacturer trust; build inbound relevance for the ES owner cluster.

## 11. Protected pages (do not edit this or a careless future batch)
`/es/motor-cg` (pos 8–10), `/en/horizontal-engine`, `/en/cb-engine`, `/es/motor-horizontal` already have signal. Any change must state WHY_CHANGE / EXPECTED_GAIN / RANKING_RISK / ROLLBACK_PLAN, else NO_ACTION. Batch 1 (just merged) must not be re-modified. (OBSERVED + policy)

## 12. Top opportunities (condensed)
ES: 1) CG/CB informational guide (CREATE_SUPPORT_CONTENT, P1). 2) Optimize `/es/motor-cg` (P2, guarded). 3) Optimize `/es/repuestos-motor` (P2). 4) DR market page (P2, conditional). 5) Horizontal support angle (P2).
PT-BR: 1) manufacturer/import guide (P1). 2) Optimize `/pt/motor-horizontal` (P2). 3) Optimize `/pt/pecas-de-motor` (P2, importer angle). 4) CG in Brazil (NO_ACTION/WATCH — Honda trap). 5) `/pt/brasil/` (NO_ACTION until evidence).

## 13. NEEDS_EVIDENCE register
- Brazil-specific / DR-specific commercial intent: pull GSC by country × query (90 d) before any market page.
- Post-Batch-1 GSC re-pull (SERP still shows the old "50cc-125cc" PT title in cache — reindex lags).
- Real search volumes: this task used qualitative SERP observation, not a keyword-volume tool.
- Whether CG-vs-CB guide should be one page or two (decision after SERP + intent mapping).
- Trademark/compliance review before using "CG/CB" heavily in PT-BR copy (Honda association).

Full machine-readable rows: docs/seo/research/SEO_OPPORTUNITY_REGISTRY_ES_PT.csv
Plans: SPANISH_SUPPORT_CONTENT_PLAN.md, PORTUGUESE_BRAZIL_CONTENT_PLAN.md, LATAM_LANDING_PAGE_PLAN.md