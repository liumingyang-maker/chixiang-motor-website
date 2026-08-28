# LATAM Landing-Page Plan (ES) + Brazil (PT) — Phase 2 Discovery

Research only. **No production file changed.** Decision vocabulary: CREATE | OPTIMIZE_EXISTING | WATCH | NO_ACTION.

## Governing rules (OBSERVED / policy)
- The freeze doc explicitly forbids bulk weak country pages. A country page is justified ONLY by distinct, quantified country intent — not by "the market is big".
- Peru & Colombia already exist as `page_type=market_landing`; both carry **an empty visible `<h1></h1>`** (OBSERVED: `es/peru/index.html`, `es/colombia/index.html`) — a quality defect. Their page names come from the hardcoded `marketTitles` in the manifest, which is why the empty H1 did not break the build. Fixing H1 is a **frozen** action → future approved batch only.
- Creating ANY new country URL is a Foundation change (sitemap + manifest `classify()`/`marketTitles` + schema + breadcrumb + tests) → exception flow. Nothing is built this round.

## Existing-page audit
- `/es/peru/` — title "Motores para motos y trimotos de carga en Perú", 12.5 KB, 10 H2; links to `/es/motor-cg`, `/es/repuestos-motor`, `/es/contacto`. Substantive, not thin. Angle = CG + cargo tricycle. Decision: OPTIMIZE_EXISTING (fix H1, add localization proof / first-party evidence).
- `/es/colombia/` — title "Motores CG 125/150 cc de reemplazo en Colombia", 10.1 KB, 8 H2; shares LATAM CG/HW records with Peru (matrix note: "Do not claim verified national demand"). Decision: OPTIMIZE_EXISTING (differentiate + H1 fix); do NOT clone.

## Per-country decision table
| Country | SEARCH_DEMAND | COMMERCIAL_INTENT | CURRENT_GSC_SIGNAL | SERP_LOCALIZATION_NEED | B2B_VALUE | CANNIBALIZATION_RISK | DECISION |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Peru | medium (CG/cargo) | commercial-localized | has page; unquantified | high (needs PE evidence) | medium | vs /es/motor-cg medium | **OPTIMIZE_EXISTING** |
| Colombia | medium (CG replacement) | commercial-localized | has page; unquantified | high | medium | vs /es/motor-cg + vs Peru medium-high | **OPTIMIZE_EXISTING** |
| Dominican Republic | **high** (Chinese-CG market: Loncin RD, Yang Zu, EJPM) | commercial-B2B importer | country appears in GSC list (unquantified) | high (distinct importer angle) | **high** | **HIGH** vs motor-cg/Peru/Colombia | **CREATE (Wave 3, conditional)** |
| Mexico | high generic but marketplace-controlled | unclear for Chixiang | appears in GSC list | high | medium | medium | **WATCH** |
| Bolivia | parts/import signal (national importers seen) | B2B parts importer | appears in GSC list | medium | medium | medium | **WATCH** |
| Ecuador | unknown | unknown | appears in GSC list | medium | unknown | — | **WATCH** |
| Chile | unknown (strong local brands/regulation) | unknown | appears in GSC list | medium | unknown | — | **WATCH** |
| Nicaragua | unknown | unknown | appears in GSC list | low | unknown | — | **WATCH** |
| Brazil (PT) | high volume but intent-trapped (Honda CG; local distributors) | mixed | `/pt/` ~7.7, no BR country data | n/a yet | medium (via owners) | vs /pt/* owners | **NO_ACTION** for `/pt/brasil/`; OPTIMIZE_EXISTING owners instead |

## Rationale highlights
- **Dominican Republic = the one genuine CREATE candidate.** SERP shows a deep Chinese-CG motorcycle distribution ecosystem (assemblers/distributors), matching Chixiang's model. But it overlaps the existing ES CG pages, so a DR page must carry a **distinct importer/distributor + application** angle and only be built after a GSC-by-country pull confirms intent, and only via the Foundation exception PR. Until then it is CREATE-conditional, not a green light to publish.
- **Mexico/Bolivia/Ecuador/Chile/Nicaragua = WATCH.** They appear in the GSC country list but with no quantified, intent-matched demand captured here; default is NOT to build. Re-evaluate only with GSC country×query data.
- **Brazil = do not create a `/pt/brasil/` country page.** Brazil intent is either consumer/Honda-CG or local-distributor parts; the correct move is to strengthen the existing `/pt/*` owners and add the importer-facing PT guide (see Portuguese plan), not a country clone.

## Next-evidence (NEEDS_EVIDENCE, gates every CREATE/WATCH flip)
- GSC by **country × query**, 90 days, for ES (DO, MX, BO, EC, CL, NI, PE, CO) and PT-BR.
- Real search volumes + competitor depth per country (keyword tool).
- Whether Peru/Colombia currently earn any country-specific clicks (justify OPTIMIZE) or are near-zero (question their weight).

## Sequence (no implementation this round)
1. OPTIMIZE_EXISTING on Peru & Colombia (fix empty H1, add first-party evidence) — needs frozen-H1 exception batch.
2. Confirm DR intent with GSC-by-country, then CREATE a DR importer page via exception PR.
3. WATCH the rest; revisit only on data.