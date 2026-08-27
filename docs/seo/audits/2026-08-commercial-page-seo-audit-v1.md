# Commercial Page SEO Audit v1 — August 2026

**Role:** B2B SEO audit + repository execution. Evidence-only. No production page was modified.

**Repository audited:** `chixiang-motor-website`, branch `main`, HEAD `94250424618bd130126fcb759e817bb6805a7dcd`
(`docs: close and freeze website foundation (#27)`).

**Pages in the primary audit scope**

1. `es/motor-cg.html`
2. `en/horizontal-engine.html`
3. `en/cb-engine.html`
4. `es/motor-horizontal.html`
5. `pt/motor-horizontal.html` (secondary)

**Controlling evidence read first**

- `AGENTS.md`
- `docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md`
- `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`
- `docs/geo-entity/GEO_ENTITY_MATRIX.csv`, `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`
- `tests/horizontal-engine-owner-page.test.js`, `tests/market-consolidation.test.js`,
  `tests/multilingual-product-family-owner-pages.test.js`, `tests/geo-fact-governance.test.js`

**Baseline measured during this audit (nothing was edited):** `node --test "tests/*.test.js" "root tests/*.test.js"`
→ **244 tests, 244 pass, 0 fail** (Node v24.15.0). This matches the “收口 PR 最终测试 / 网站 244” figure recorded
in `FOUNDATION_CLOSURE_AND_FREEZE.md` §2.

---

## 0. Boundary statement

This audit is read-only. It did **not** modify HTML, CSS, JS, Worker, API, canonical, hreflang, redirect,
sitemap, robots, H1, Schema IDs, Owner structures, tracking, forms or conversions. It created no PR,
performed no merge and deployed nothing. The only file written is this document.

GSC figures are supplied by the project owner and are **not reproducible from this repository**. They are
labelled as supplied data, never as independently measured facts.

---

## 1. Executive conclusion

1. **The ES CG page is the strongest asset in scope and needs no copy work.**
   Supplied GSC: ~120 impressions / avg. 9.6, with `motor cg` at 8.1 and `motores cg` at 8.0. Its title, H1
   and both spec tables agree with the approved CG records. **NO_ACTION** on copy. One visible asset defect
   is recorded in §3.

2. **EN Horizontal is already positioned for the global B2B buyer and is not Russia/YX-led.**
   Title `Horizontal Motorcycle Engine Manufacturer | CX 110–150 cc` (line 15), H1 `Horizontal Motorcycle
   Engine` (line 117), and the YX material is one lower-page clarification (line 132) plus a table column
   literally headed “Market/search reference”. YX and Russia appear nowhere in the title, description, H1 or
   hero. Supplied avg. position ~9.9. **NO_ACTION** on title, H1 or positioning.

3. **The `50cc-125cc` title is a live factual contradiction, and it is broader than the brief assumed.**
   It appears on **three** owner pages — `es/motor-horizontal.html:15`, `pt/motor-horizontal.html:15`,
   `ar/horizontal-engine.html:15` — while each of those same pages publishes the approved
   110/125/125/140/150 cc five-model CX table. `en/horizontal-engine.html:15` and
   `ru/gorizontalnyj-dvigatel.html:15` already say `110–150`, and `en/index.html:211` was already corrected
   to `110–150cc` with a test guarding it. This is a normalisation leftover, not a keyword decision. **P0.**

4. **The 24-hour reply promise has no approved basis anywhere in the fact governance.** Five occurrences,
   one per English commercial page. **P0 / UNSUPPORTED_COMMERCIAL_PROMISE.**

5. **`strong torque` / `low vibration` for the CB family are unsupported by the approved CB records, and
   they are not confined to `en/cb-engine.html`.** They appear in the EN CB page, the EN homepage card, the
   ES/PT/AR CB pages, and inside the shared CB card rendered on the audited horizontal and CG pages.
   **P1, multi-locale.** Per the brief, no replacement wording is invented.

6. **The generic Spanish query `motores horizontales` is not a prize to chase.** A live web search for that
   phrase returned industrial horizontal-shaft engine categories, an industrial machinery article, a Mexican
   power-equipment supplier and the Wikipedia “motor plano” entry — no motorcycle-engine manufacturer in the
   returned set. A second search for `motor horizontal para motocicleta` returned clearly
   motorcycle-qualified results, including this site. The current ES H1 and title already carry the
   `para Motocicleta` qualifier and must keep it. **WATCH; do not broaden targeting.** Note the limitation in
   §6: this was a non-geo-located web search, not a country-targeted SERP capture.

7. **NO_ACTION is the majority outcome.** Two of the five audited pages need no change at all, the third
   (ES CG) needs no copy change, and every recommended correction is a verifiable factual or asset defect
   with existing repository precedent.

---

## 2. Evidence table

Rows are **OBSERVED** (present in the repository, approved fact packs, or produced by a tool run during this
audit), **SUPPLIED** (owner-provided analytics this audit cannot reproduce), **INFERENCE** (reasoned SEO
interpretation, not a proven ranking cause) or **NEEDS_EVIDENCE**.

| # | Statement | Classification | Evidence located |
| --- | --- | --- | --- |
| E1 | ES CG title, H1, description | OBSERVED | `es/motor-cg.html:15`, `:16`, `:158` |
| E2 | ES CG publishes CG125/150/175/200/250 (air) + CG150SB/175SB/200SB/250SB (water) with nominal, actual, bore×stroke, cooling, start, clutch | OBSERVED | `es/motor-cg.html:184`, `:193` |
| E3 | Those ES CG values match the approved master rows | OBSERVED | `ENGINE_SPEC_MASTER.csv:3`–`:11` |
| E4 | ES CG subtitle and hero paragraph are the same sentence verbatim | OBSERVED | `es/motor-cg.html:159` vs `:167` |
| E5 | ES CG horizontal card image points at a `.png` that does not exist on disk | OBSERVED | `es/motor-cg.html:246`; directory `images/卧式电启动/` contains only `3.webp`, `3504ab0b-…-cddc34045a26.webp`, `7068e821-….webp` |
| E6 | The same broken `.png` reference exists in exactly **12** HTML files — always the shared “Products” CG/CB/parts cards, never the horizontal owner pages themselves | OBSERVED | `git grep -l "3504ab0b-…-cddc34045a26\.png"` → ES: `motor-cg.html:246`, `motor-cb.html:234`, `repuestos-motor.html:234`; PT: `motor-cg.html:246`, `motor-cb.html:234`, `pecas-de-motor.html:234`; RU: `dvigatel-cg.html`, `dvigatel-cb.html:234`, `zapchasti-dvigatelya.html`; AR: `cg-engine.html`, `cb-engine.html`, `engine-parts.html`. Negative check: `es/motor-horizontal.html`, `pt/motor-horizontal.html` and `ar/horizontal-engine.html` contain no `.png` reference and correctly use the `.webp` |
| E7 | A regression test already enforces the `.webp` / no-`.png` rule, but only for `en/index.html` | OBSERVED | `tests/market-consolidation.test.js:11`–`:17` |
| E8 | EN Horizontal title / description / H1 / hero | OBSERVED | `en/horizontal-engine.html:15`, `:16`, `:117`, `:118` |
| E9 | EN Horizontal owner table = CX152FMH 110, CX153FMI 125, CX154FMI 125, CX1P56FMJ 140, CX1P60FMJ 150; actual displacement / bore / stroke deliberately blank | OBSERVED | `en/horizontal-engine.html:128`; `ENGINE_SPEC_MASTER.csv:15`–`:19`; `AGENTS.md:18` |
| E10 | EN Horizontal YX note is one lower-page block phrased “Russian-market search and selection references” | OBSERVED | `en/horizontal-engine.html:132` |
| E11 | ES and PT horizontal owner blocks use neutral wording (“Referencia de mercado/búsqueda”), no “Russian-market” | OBSERVED | `es/motor-horizontal.html:187`; `pt/motor-horizontal.html:187` |
| E12 | EN Horizontal hero secondary CTA is an in-page model-comparison anchor `#cx-models` | OBSERVED | `en/horizontal-engine.html:118`, `:124` |
| E13 | ES/PT/AR horizontal have no equivalent comparison anchor | OBSERVED | `es/motor-horizontal.html:168`; `pt/motor-horizontal.html:168` |
| E14 | ES / PT / AR horizontal titles say `50cc-125cc` | OBSERVED | `es/motor-horizontal.html:15`, `pt/motor-horizontal.html:15`, `ar/horizontal-engine.html:15` |
| E15 | EN and RU horizontal already state 110–150 | OBSERVED | `en/horizontal-engine.html:15`; `ru/gorizontalnyj-dvigatel.html:15`, `:104` |
| E16 | `en/index.html` horizontal card states `110–150cc` and a test asserts the old `50–125cc` copy was removed | OBSERVED | `en/index.html:211`; `tests/market-consolidation.test.js:19`–`:24` |
| E17 | No existing test asserts the ES/PT/AR horizontal title range | OBSERVED | `git grep -iE "title\|50cc\|110" -- tests/` returns only `tests/geo-fact-governance.test.js:76` (model row, not title) |
| E18 | `Our sales team will reply within 24 hours.` occurs exactly 5×, one per English commercial page | OBSERVED | `en/cb-engine.html:159`, `en/cg-engine.html:171`, `en/engine-parts.html:159`, `en/horizontal-engine.html:160`, `en/index.html:368` |
| E19 | No approved response-time / SLA / reply-time fact exists in the company fact pack | OBSERVED | Full read of `COMPANY_FACT_PACK.csv:1`–`:29` |
| E20 | Frozen scope bars unapproved commercial-policy commitments | OBSERVED | `FOUNDATION_CLOSURE_AND_FREEZE.md:70`–`:71`; `AGENTS.md:16`–`:17` |
| E21 | EN CB states `strong torque and low vibration` in description, JSON-LD description, H1 subtitle and hero | OBSERVED | `en/cb-engine.html:16`, `:74`, `:117`, `:118` |
| E22 | Approved CB records carry only: air-cooled, 149/197/223 cc, electric-or-kick, manual wet multi-plate, 5-speed constant mesh, `Street and off-road motorcycles subject to configuration`; bore and stroke blank | OBSERVED | `ENGINE_SPEC_MASTER.csv:12`–`:14` |
| E23 | The only approved non-quantified vibration/smoothness benefit is CG balance-shaft, family level, explicitly barred from model-level transfer | OBSERVED | `ENGINE_SPEC_MASTER.csv:20` |
| E24 | ES/PT/AR CB pages repeat the same unsupported CB benefit language | OBSERVED | `es/motor-cb.html:16`, `:82`, `:159`, `:167`, `:228`; `pt/motor-cb.html:16`, `:82`, `:159`, `:167`, `:228`; `ar/cb-engine.html:16`, `:82`, `:159`, `:167`, `:228` (Arabic `بعزم قوي واهتزاز منخفض` = “strong torque and low vibration”); `ar/horizontal-engine.html:229` |
| E25 | Shared CB cards re-inject that sentence inside the audited pages | OBSERVED | `es/motor-horizontal.html:229`, `es/motor-cg.html:240`, `pt/motor-horizontal.html:229`, `en/index.html:233` |
| E26 | `en/products.html` and the noindex `en/product-detail.html` carry stronger CB wording (`ultra-quiet`, “comfortable long-duration riding without arm fatigue”, `Balancer Shaft` applied to CB) | OBSERVED | `en/products.html:335`; `en/product-detail.html:406`, `:545`, `:546`, `:563` |
| E27 | EN CB hero “View Detailed Specs” links to a `noindex` utility page | OBSERVED | `en/cb-engine.html:118` → `/en/product-detail?series=cb-offroad`; `en/product-detail.html:17` = `noindex,follow` |
| E28 | ES/PT CB titles use an `Off-Road e Rua / Off-Road` framing equivalent to the EN title | OBSERVED | `es/motor-cb.html:15`, `pt/motor-cb.html:15` |
| E29 | Desktop and mobile nav labels are English (`Home`, `Products`, `News`, `About Us`, `Contact Us`) inside ES/PT/AR/RU pages | OBSERVED | `es/motor-cg.html:122`–`:127`, `:133`–`:137`; `es/motor-horizontal.html:122`–`:127`, `:133`–`:137`; `pt/motor-horizontal.html:122`, `:133`; 8 `ru/*.html` files |
| E30 | Owner section, `data-product-family-owner`, breadcrumb, canonical, full hreflang cluster intact on all audited pages | OBSERVED | `es/motor-horizontal.html:19`–`:25`, `:157`, `:175`; `en/cb-engine.html:18`–`:24`, `:116`, `:120`; `en/horizontal-engine.html:18`–`:24`, `:116`, `:120`; `es/motor-cg.html:157`, `:175`; `pt/motor-horizontal.html:157`, `:175` |
| E31 | Water-cooled CG Transmission column shows `—` on ES and EN | OBSERVED | `es/motor-cg.html:193`; `en/cg-engine.html:138`; master leaves the field blank `ENGINE_SPEC_MASTER.csv:8`–`:11` |
| E32 | `ENGINE_SPEC_MASTER.csv` still describes a CG balance-shaft “hidden table” on `en/cg-engine` that no longer exists in that file | OBSERVED | `ENGINE_SPEC_MASTER.csv:20` vs `git grep CX156FMI` (absent from `en/cg-engine.html`; last touched by `31a39a2`) |
| E33 | `en/product-detail.html:305` model codes `CX162FMI`, `CX163FMI`, `CX167FMI` conflict with approved `CX162FMJ`, `CX162FMK`, `CX163FML`, `CX167FMM` | OBSERVED | `en/product-detail.html:305` vs `ENGINE_SPEC_MASTER.csv:3`–`:7` |
| E34 | Site totals 11 clicks / 844 impressions / CTR 1.3% / avg 28.6, plus the per-page and per-query figures in the brief | SUPPLIED → NEEDS_EVIDENCE for verification | Owner-supplied GSC export; not reproducible from the repository |
| E35 | `motores horizontales` returns industrial / machinery / flat-engine results, no motorcycle manufacturer, in a live non-geo-located web search | OBSERVED (tool run in this audit; **not** a country-targeted SERP capture) | Web search executed 2026-08-27 |
| E36 | `motor horizontal para motocicleta` returns motorcycle-engine-intent results, including this site | OBSERVED (same caveat as E35) | Web search executed 2026-08-27 |
| E37 | The 58 impressions on `motores horizontales` at avg. 40.1 are partly non-motorcycle intent | INFERENCE | Derived from E35/E36 + supplied GSC; unproven without a geo-targeted capture and query-level CTR |
| E38 | Brazil/PT has latent value not disproved by low current exposure | NEEDS_EVIDENCE | No PT/Brazil GSC export or sales record exists in the repository |
| E39 | At page-1 positions, a broad rewrite is likelier to destroy working signal than to improve it | INFERENCE | Risk reasoning about live rankings; no experiment exists |
| E40 | The range fix is normalisation, not new copy, because two sibling locales and the EN homepage already state 110–150 | OBSERVED | E15, E16 |
| E41 | AR page carries the same structure and the same two defects (title range, CB card) | OBSERVED | `ar/horizontal-engine.html:15`, `:158`, `:229` |

---

## 3. ES CG diagnosis — `es/motor-cg.html`

**Search intent served.** Supplier-selection intent for CG motorcycle engines in Latin America: model
classes, configurations, quotation inputs, FAQ. It is the family Owner page
(`data-product-family-owner="cg"`, line 175) with intact breadcrumb (line 157) and entity graph
(`#webpage`, `#breadcrumb`).

**Title / description / frozen H1.** Title `Motor CG para Motocicleta | Proveedor de Motores CG` (line 15)
states product + supplier role; H1 `Motor CG para Motocicleta` (line 158); description (line 16) adds
125cc–250cc, durability, easy maintenance, parts availability, Latin America. The manufacturer/supplier
signal the brief asks to protect is already present.

**Product facts.** Lines 184 and 193 publish the air-cooled and water-cooled tables. Every value was
compared cell-by-cell against `ENGINE_SPEC_MASTER.csv:3`–`:11` and matches (CG125 124 cc 56.5×49.5; CG150
149 cc 62×49.5; CG175 174 cc 62×57.5; CG200 197 cc 63.5×62.2; CG250 229.5 cc 67×65; CG150SB 149.5;
CG175SB 173.6; CG200SB 197; CG250SB 246.3). The family blocks at line 198 stay inside the approved
balance-shaft, Tsunami, HW Water and automatic-clutch scopes — including the non-quantified vibration
wording that **is** legitimately approved for the balance-shaft family (E23).

**Manufacturer / wholesale / OEM relevance.** Line 178 addresses B2B distributors, assembly projects and
replacement markets; line 200 lists work/street, cargo-tricycle/ATV-by-configuration and distributor
replacement; line 201 lists the four quotation inputs; lines 205–209 offer inquiry, all-products,
about-the-factory and sales email; the footer (line 264) states experience since 2003, registration in 2007
and ISO 9001, all matching approved company facts.

**Weak points that are correctly weak.** The water-cooled Transmission column shows `—` (line 193) because
the master leaves that field blank at model level. **Do not fill it in** (`AGENTS.md:18`,
`FOUNDATION_CLOSURE_AND_FREEZE.md:66`–`:67`). The “repuestos disponibles” wording stays inside the approved
scope of `COMPANY_FACT_PACK.csv:20` (“selected fast-moving service parts … require order confirmation”);
**do not expand** it into stock, universal compatibility or delivery claims.

**Weak points worth noting but not worth touching now.** The hero paragraph (line 167) duplicates the
subtitle (line 159) verbatim, and there is no model-comparison aid equivalent to EN Horizontal’s
`Compare CX Models`. Both are structural changes to a page already at positions 8–10. **Deferred** (E39).

**The one real defect on this page.** Line 246 references
`../images/卧式电启动/3504ab0b-70d8-42bd-ab24-cddc34045a26.png`, and that directory contains only `.webp`
files (E5). The buyer sees an empty placeholder where a product photo should be; the same broken reference
repeats in 11 further files, always inside this same shared card block (E6). Fixing an asset path is not a
copy change, and a repository test already declares the intended rule for another file (E7).

**Decision: NO_ACTION on every ES CG text node, title, H1, description and table. P1 asset repair at
line 246 only. WATCH on rankings.**

---

## 4. EN Horizontal diagnosis — `en/horizontal-engine.html`

**Brief question E — is the page over-weighting Russian-market YX references?** No, on current evidence.
YX appears in exactly two places: a table column headed “Market/search reference” whose cells hold
`YX152FMH | YX110-class` and similar (lines 127–128), and one explanatory block after the table (line 132)
stating that YX names are search/selection references, that these engines are manufactured by CHIXIANG
MOTOR, and that YX is not the brand. Nothing YX- or Russia-related appears in the title (15), description
(16), H1 (117), hero (118) or CTAs.

**Global buyer coverage is already the primary message, in the order the brief asks for.**
horizontal motorcycle engine (H1) → manufacturer (title, line 118 “CHIXIANG MOTOR manufactures”) →
distributor / wholesale / OEM-ODM (lines 16, 118, 123, 134) → nominal classes 110 / 125 / 140 / 150
(lines 16, 117, 123, 128). Factory evidence and trust: about-the-factory link (line 142), sales email
(line 143), quotation-input checklist (line 135), FAQ (line 152). CTA structure: “Request Factory Price”
plus an in-page comparison anchor plus WhatsApp (line 118), then the closing CTA section (line 160).

**Recommendation.** Keep unchanged. Two narrow options are recorded and deliberately **not** proposed for
Batch 1: (a) whether the “Russian-market” qualifier in line 132 should read as neutrally as the ES/PT
equivalent (E11) — a judgement that requires a query-level GSC split that does not exist here; (b) an LCP
review of the hero background image. Both are **P2 / WATCH**.

**Decision: NO_ACTION on title, H1, table, positioning and YX clarification. P0 only for the shared
24-hour line at 160.**

---

## 5. EN CB diagnosis — `en/cb-engine.html`

**Supplied position.** Page ~34 impressions / avg. 18.1; `cb engine` ~15.4 — page 2, with room to move up.

**Intent served.** Supplier selection for CB-series motorcycle engines. Owner page
(`data-product-family-owner="cb"`, line 120), correct breadcrumb (116), canonical and full hreflang set
(18–24), FAQ (151), quotation checklist (134), related-page links (139–142).

**The spec table is sound and must not be touched.** CB150 149 cc, CB200-C 197 cc, CB250 223 cc; air-cooled;
kick or electric start; manual wet multi-plate; 5-speed constant mesh (line 128) — an exact match to
`ENGINE_SPEC_MASTER.csv:12`–`:14`. Bore and stroke are correctly absent, and the master requires that they
stay absent. Line 133 correctly qualifies the off-road application as “subject to configuration”, matching
the approved `applications` field. So the `off-road` element of brief question C **is** supported; the other
two are not.

**Brief question C — `strong torque`, `low vibration`, `off-road`.**

| Claim | Verdict | Basis |
| --- | --- | --- |
| `off-road` | **Supported, with qualifier** | `ENGINE_SPEC_MASTER.csv:12`–`:14` `Street and off-road motorcycles subject to configuration`; page carries the qualifier at line 133 but drops it from the description/H1 sentence (16, 74, 117, 118) |
| `strong torque` | **UNSUPPORTED_CLAIM** | No CB torque value, no comparative torque evidence and no approved generic CB torque statement in `ENGINE_SPEC_MASTER.csv:12`–`:14`; bore/stroke are blank so no derivation is possible; `COMPANY_FACT_PACK.csv` has no performance entry |
| `low vibration` | **UNSUPPORTED_CLAIM** | The only approved non-quantified vibration/smoothness benefit is `intake-cg-balance-shaft` (`ENGINE_SPEC_MASTER.csv:20`), CG-family and explicitly non-transferable to model or other-family specifications |

Per the brief, no alternative wording is invented. The approved facts already describe the page: CB150,
CB200-C, CB250; 150–250 cc nominal classes; air-cooled; electric or kick start; manual wet multi-plate;
5-speed constant mesh; street and off-road motorcycles subject to configuration; qualified wholesale,
assembly and replacement supply; OEM/ODM at family level (`COMPANY_FACT_PACK.csv:16`).

**Scope correction to the brief.** This is not a one-page problem. The identical CB sentence appears on
`es/motor-cb.html` (5 lines), `pt/motor-cb.html` (5 lines), `ar/cb-engine.html` (5 lines), and inside the
shared CB card on `es/motor-horizontal.html:229`, `es/motor-cg.html:240`, `pt/motor-horizontal.html:229`,
`ar/horizontal-engine.html:229` and `en/index.html:233` (E24, E25, E41). Fixing only `en/cb-engine.html`
would leave Spanish, Portuguese and Arabic buyers reading the claim that English buyers no longer see, and
would leave the claim on the *audited* ES/PT/AR horizontal and CG pages through the shared card.

**Title framing.** `CB Motorcycle Engine Manufacturer | Street and Off-Road Engines` (line 15). Not a fact
conflict, but it omits the approved qualifier and omits the displacement range that the head query
`cb engine` most needs. **INFERENCE** that a 150–250 cc / manufacturer framing serves the query better —
recorded, not asserted, and only worth bundling with the claim removal. ES/PT already differ (E28).

**Conversion-path observation.** The hero’s secondary CTA sends buyers to a `noindex` utility page
(line 118 → `en/product-detail.html:17`), while the sibling horizontal page sends buyers to an on-page
comparison table. For a page that is not yet on page 1 and needs demonstrable depth, pointing its strongest
secondary action outside the indexable site is the weaker choice. **P2.**

---

## 6. ES Horizontal search-intent diagnosis — `es/motor-horizontal.html`

**Supplied data.** Page ~47 impressions / avg. 38.1; `motores horizontales` ~58 impressions / avg. 40.1.

**Live verification performed in this audit.** A web search for `motores horizontales` returned: an
industrial horizontal-engine category storefront, a machinery article on horizontal vs vertical industrial
motors, a Mexican power-equipment supplier describing horizontal-shaft engines for conveyors, and the
Wikipedia “motor plano” article. No motorcycle-engine manufacturer appeared in the returned set. A second
search for `motor horizontal para motocicleta` returned motorcycle-qualified results (150 cc / 140 cc
motorcycle engines, Zongshen and Cub-style motorcycle engine listings) — including this site.

**Limitation, stated plainly.** These were non-geo-located web searches, not country-targeted Google SERP
captures for Spain/Mexico/Colombia/Peru/Ecuador, and they carry no CTR or rank-position measurement. They
are directional evidence of intent ambiguity only. → **PARTIAL SERP VALIDATION OBTAINED;
GEO_TARGETED_SERP_VALIDATION_STILL_REQUIRED** before any targeting decision.

**Consequences for action.**

1. The generic term must **not** be pushed into the page. Doing so would trade a motorcycle-qualified owner
   page for mixed industrial intent — the opposite of what an importer or assembler needs to see.
2. The existing `para Motocicleta` qualifier in the title (15) and frozen H1 (158) is the correct defensive
   asset and must stay exactly as it is.
3. The page’s real defect is factual, not keyword-related. The title says `50cc-125cc` (15) while the owner
   section says “clases nominales aprobadas de 110 a 150 cc” (178) and the table lists 110, 125, 125, 140 and
   150 cc (183). A buyer who clicks a 50–125 snippet lands on a page whose first approved statement
   contradicts it.
4. Procurement clarity trails EN: the hero (167–168) repeats the meta description verbatim and never states
   a displacement class, and there is no in-page comparison anchor as on EN (118/124). **P2**, deliberately
   separated from the P0 factual fix so a correction is never bundled with a redesign.
5. Line 229 injects the unsupported CB torque/vibration sentence through the shared card (§5).
6. Nav labels are English inside the Spanish page (122–127, 133–137) — a localization defect, **P2**, and
   structurally outside Batch 1.

---

## 7. PT / Brazil observations — `pt/motor-horizontal.html`

- Title `Motor Horizontal para Moto | 50cc-125cc` (line 15) with the identical internal contradiction: the
  owner section states “classes nominais aprovadas de 110 a 150 cc” (178) and the same five CX models (183).
  `/pt/` is at supplied avg. 7.7 and `/pt/motor-horizontal` at 9.6, so this contradiction is visible on a
  page that already reaches the first page. **P0, same fix as ES.**
- The PT file mirrors the ES structure exactly: canonical and hreflang (19–25), breadcrumb (157), H1 (158),
  owner block (175), neutral market-reference wording (187), FAQ (203), English nav labels (122, 133). Its
  own card images use the correct `.webp` (E6 negative check).
- `pt/index.html`, `pt/motor-cg.html`, `pt/motor-cb.html` and `pt/pecas-de-motor.html` carry the same CB
  torque/vibration sentence, and the PT CG/CB/parts pages carry the broken `.png` card reference
  (`pt/motor-cg.html:246`).
- **No Brazil-specific GSC export, sales record or buyer-language evidence exists in this repository**
  (E38). The brief’s warning is accepted: low current exposure is not proof of low market value, and a
  position-7.7 homepage on an unoptimised locale suggests untapped coverage rather than a dead market.
- The correct output is a **Discovery** step, not a build: pull a PT/Brazil GSC segment (query × country ×
  device, 90 days), determine whether the existing PT owner pages already answer those queries, and only
  then decide whether any Brazil-specific content is warranted.
- Nothing here authorises a `pt/brazil/` landing page. `FOUNDATION_CLOSURE_AND_FREEZE.md:70` explicitly bars
  bulk creation of weak country pages, and `GEO_ENTITY_MATRIX.csv` records a `DO_NOT_BUILD_YET` discipline
  for model-level URLs.
- **NO_ACTION** on PT beyond the P0 title correction and the shared P1 items: no broadening toward generic
  `motor horizontal`, no volume/MOQ promises, no Brazil-only commercial terms inferred from silence.

---

## 8. Factual inconsistencies and unsupported commercial copy

| # | Finding | Where | Classification | Controlling source |
| --- | --- | --- | --- | --- |
| F1 | Horizontal title range `50cc-125cc` contradicts the approved 110–150 cc family published on the same page | `es/motor-horizontal.html:15`; `pt/motor-horizontal.html:15`; `ar/horizontal-engine.html:15` | **OBSERVED / P0 / FACTUAL_INCONSISTENCY** | `ENGINE_SPEC_MASTER.csv:15`–`:19`; owner text `:178`; table `:183` |
| F2 | The same contradiction is already fixed in EN and RU, and in the EN homepage card guarded by a test | `en/horizontal-engine.html:15`; `ru/gorizontalnyj-dvigatel.html:15`, `:104`; `en/index.html:211` | **OBSERVED / normalisation precedent** | E15, E16 |
| F3 | “Our sales team will reply within 24 hours.” — no approved response-time commitment exists anywhere | `en/cb-engine.html:159`, `en/cg-engine.html:171`, `en/engine-parts.html:159`, `en/horizontal-engine.html:160`, `en/index.html:368` | **OBSERVED / P0 / UNSUPPORTED_COMMERCIAL_PROMISE** | Full read `COMPANY_FACT_PACK.csv:1`–`:29`; `FOUNDATION_CLOSURE_AND_FREEZE.md:70`–`:71` |
| F4 | CB `strong torque` / `low vibration` have no CB approval; the only approved vibration benefit is CG balance-shaft, family level | `en/cb-engine.html:16`, `:74`, `:117`, `:118` | **OBSERVED / P1 / UNSUPPORTED_CLAIM** | `ENGINE_SPEC_MASTER.csv:12`–`:14`, `:20` |
| F5 | The same CB claim is mirrored in ES, PT and AR, and re-injected into the audited pages through shared cards | `es/motor-cb.html:16`, `:82`, `:159`, `:167`, `:228`; `pt/motor-cb.html` same; `ar/cb-engine.html:16`, `:82`, `:159`, `:167`, `:228`; `ar/horizontal-engine.html:229`; `es/motor-horizontal.html:229`; `es/motor-cg.html:240`; `pt/motor-horizontal.html:229`; `en/index.html:233` | **OBSERVED / P1 / UNSUPPORTED_CLAIM (multi-locale)** | as above |
| F6 | CB description drops the approved qualifier `subject to configuration` while the owner section keeps it | `en/cb-engine.html:16`, `:117` vs `:133` | **OBSERVED / P1 / incomplete qualification** | `ENGINE_SPEC_MASTER.csv:12`–`:14` |
| F7 | Broken `.png` reference where only `.webp` exists → visibly empty product image | 12 files (E6); inside the audit scope this hits `es/motor-cg.html:246` and `pt/motor-cg.html:246`, i.e. the shared CG/CB/parts card block duplicated per locale. The horizontal owner pages themselves are clean | **OBSERVED / P1 / ASSET_DEFECT** | directory listing; `tests/market-consolidation.test.js:14`–`:16` |
| F8 | The governance master still describes a CG balance-shaft “hidden table” that no longer exists on `en/cg-engine.html` | `ENGINE_SPEC_MASTER.csv:20` | **OBSERVED / P1 / STALE_GOVERNANCE_EVIDENCE** | `git grep CX156FMI`; commit `31a39a2` |
| F9 | Stronger unapproved CB copy on catalog and noindex tool pages (`ultra-quiet`, “without arm fatigue”, `Balancer Shaft` on CB) | `en/products.html:335`; `en/product-detail.html:406`, `:545`–`:563` | **OBSERVED / P2 / UNSUPPORTED_CLAIM (outside primary scope)** | `ENGINE_SPEC_MASTER.csv:12`–`:14`, `:20` |
| F10 | Noindex tool page lists CG model-code suffixes that conflict with the approved codes | `en/product-detail.html:305` | **OBSERVED / P2 / FACTUAL_INCONSISTENCY (non-indexed)** | `ENGINE_SPEC_MASTER.csv:3`–`:7` |
| F11 | English navigation labels inside ES/PT/AR/RU pages | E29 | **OBSERVED / P2 / LOCALIZATION_DEFECT** | — |
| F12 | ES generic horizontal intent may be diluted by industrial/agricultural searches | §6 | **INFERENCE / WATCH** | E35, E36, E37 |
| F13 | Repetitive hero/subtitle copy on ES CG, ES and PT horizontal (identical sentence twice) | `es/motor-cg.html:159`/`:167`; `es/motor-horizontal.html:159`/`:167`; `pt/motor-horizontal.html:159`/`:167` | **OBSERVED / P2 / repetition, not a defect worth ranking risk on page-1 pages** | — |

**No factual inconsistency was found in:** EN Horizontal, ES CG and PT horizontal approved owner sections;
the five CX model rows on EN/ES/PT/AR; the CG air-cooled and water-cooled tables; the CB displacement,
cooling, starting, clutch and transmission rows; the footer company statements on the audited pages; and the
CG balance-shaft / Tsunami / HW Water / automatic-clutch family wording. **The blank fields are correct
behaviour, not gaps.**

---

## 9. Priority table

| Priority | Item | Classification | Why this level | Files |
| --- | --- | --- | --- | --- |
| **P0** | Horizontal title range → approved 110–150 cc | OBSERVED | Public snippet contradicts the approved family on the same page; EN/RU/homepage already corrected, so this closes a cluster inconsistency | `es/motor-horizontal.html:15`, `pt/motor-horizontal.html:15`, `ar/horizontal-engine.html:15` |
| **P0** | Remove the 24-hour reply promise | OBSERVED / UNSUPPORTED_COMMERCIAL_PROMISE | An operational commitment made on the company’s behalf with zero approval trail | 5 EN pages (F3) |
| **P1** | Remove CB `strong torque` / `low vibration`, keep every approved CB fact and restore the `subject to configuration` qualifier | OBSERVED / UNSUPPORTED_CLAIM | No CB approval exists; the only vibration approval is a different family | `en/cb-engine.html:16`, `:74`, `:117`, `:118` first; then ES/PT/AR CB pages and the shared cards on audited pages |
| **P1** | Repair broken horizontal card image reference | OBSERVED / ASSET_DEFECT | A visible empty image on indexed commercial pages, including the best-ranked page in scope; the rule is already declared in a test for one file only | 12 files (F7) |
| **P1** | Correct the stale CG hidden-table description in the governance master | OBSERVED | The authoritative fact source points at content that no longer exists and will mislead the next audit and the next model-level decision | `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv:20` (documentation only) |
| **P2** | Re-point the EN CB “View Detailed Specs” CTA from the noindex tool page | OBSERVED | Buyers needing more trust are sent off-index; the sibling page uses an on-page comparison | `en/cb-engine.html:118` |
| **P2** | Localise nav labels in ES/PT/AR/RU | OBSERVED | Real buyer-quality defect, but it touches shared navigation structure inside a frozen area and needs its own approved batch | E29 set |
| **P2** | Clean noindex tool-page and catalog claim conflicts | OBSERVED | Wrong, but not indexed | `en/product-detail.html:305`, `:406`, `:545`–`:563`; `en/products.html:335` |
| **P2** | Add displacement clarity and a model-comparison anchor to ES/PT/AR horizontal | OBSERVED gap | Genuine buyer-value gap; deliberately separated from the P0 factual fix | ES/PT/AR horizontal |
| **P2** | LCP/asset review of horizontal hero images | NEEDS_EVIDENCE | No measurement exists; requires three mobile Lighthouse runs per the freeze doc | EN/ES/PT/AR heroes |
| **WATCH** | ES generic `motores horizontales` | INFERENCE | Live search suggests ambiguity (E35) but there is no geo-targeted capture or query-level CTR | — |
| **WATCH** | EN “Russian-market” wording at line 132 | INFERENCE | Present once, below the table, absent from title/H1/hero; only a query-level GSC split can justify changing it | `en/horizontal-engine.html:132` |
| **WATCH** | ES CG and EN Horizontal performance over the next 28 days | SUPPLIED | Both are at or near page 1; monitor before any experiment | both pages |
| **NO_ACTION** | ES CG title, H1, description, both spec tables, family blocks, FAQ, CTAs | OBSERVED | Facts match the master; best positions in scope; page-1 rewrite risk (E39) | `es/motor-cg.html` |
| **NO_ACTION** | EN Horizontal title, H1, description, CX table, global manufacturer/wholesale/OEM positioning, YX clarification placement | OBSERVED | Already matches the brief’s priority order | `en/horizontal-engine.html` |
| **NO_ACTION** | Any new blog, country page, model page or keyword-per-page landing | OBSERVED policy | Explicitly barred by the frozen foundation | `FOUNDATION_CLOSURE_AND_FREEZE.md:70` |
| **NO_ACTION** | Filling blank actual-displacement / bore / stroke values | OBSERVED policy | Frozen; must remain blank | `AGENTS.md:18`; freeze doc `:66`–`:67` |
| **NO_ACTION** | Expanding parts wording into stock/compatibility/delivery; adding `Offer`, `Review` or `AggregateRating` | OBSERVED policy | No verifiable price, stock or public reviews | freeze doc `:68`–`:69`; `COMPANY_FACT_PACK.csv:20` |
| **NO_ACTION** | Brazil-specific pages or commercial terms | NEEDS_EVIDENCE | No PT/Brazil evidence exists in the repository | — |

---

## 10. Files that WOULD change in a later approved batch

**Nothing below is changed by this audit.** Each row is a proposal requiring explicit approval, its own PR,
tests and Preview.

| File | Proposed narrow change | Explicitly out of scope in the same file |
| --- | --- | --- |
| `es/motor-horizontal.html` | Title range → approved 110–150 cc; CB sentence in the shared card (229) | canonical (19), hreflang (20–25), H1 (158), breadcrumb (157), owner attributes (175), `#webpage`/`#breadcrumb` Schema IDs, table values (183) |
| `pt/motor-horizontal.html` | Title (15); CB card sentence (229) | the same frozen set |
| `ar/horizontal-engine.html` | Title (15); CB card sentence (229) | the same frozen set |
| `en/cb-engine.html` | Remove `strong torque` / `low vibration` (16, 74, 117, 118) and restore the approved qualifier; remove the 24-hour line (159) | model table (128), approved application line (133), canonical/hreflang, form and CTA event semantics |
| `en/horizontal-engine.html` | Remove the 24-hour line (160) | title (15), H1 (117), hero (118), CX table (128), YX clarification (132) |
| `en/cg-engine.html` | Remove the 24-hour line (171) | CG tables and approved balance-shaft wording |
| `en/engine-parts.html` | Remove the 24-hour line (159) | parts scope wording |
| `en/index.html` | Remove the 24-hour line (368) | entity graph; the horizontal card at 211 is already correct |
| `es/motor-cb.html`, `pt/motor-cb.html`, `ar/cb-engine.html` | Remove the CB torque/vibration language (F5) | their H1, canonical, hreflang and tables |
| the 12 files in F7 | Broken `.png` → existing `.webp`, nothing else | every text node |
| `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv` | Update the `current_website_values` description that references a removed hidden table (F8) | any approved value |
| `tests/commercial-page-copy-governance.test.js` (new) | Guard all of the above (§12) | — |

---

## 11. Frozen contracts that remain untouched

Verified present and unmodified on all five audited pages during this audit: canonical and full hreflang
clusters (EN/ES/PT/RU/AR + `x-default`), exactly one `<h1>` per page, visible breadcrumbs with
`aria-current`, `data-product-family-owner` / `data-product-family-owner-faq` owner blocks, stable `#webpage`
and `#breadcrumb` Schema IDs, FAQPage JSON-LD, `/en/contact` and `wa.me/8619008225410` CTA paths, the single
`js/main.js` include, the Google Ads `gtag` config and the Yandex Metrika init.

Per `AGENTS.md:11`–`:21` and `FOUNDATION_CLOSURE_AND_FREEZE.md:64`–`:71`, the following remain off-limits and
this audit requests no change to any of them: production domain and root redirect rules, clean URLs,
canonical, hreflang, sitemap, robots, Owner relationships, primary H1, breadcrumb relationships, stable
Schema IDs, `/api/contact`, the Cloudflare Worker, Turnstile, form field names and success/failure
semantics, Worker-gated Google Ads and Yandex conversions, approved company and product facts, model naming,
confirmed commercial policies, and the intentionally blank 152FMH displacement/bore/stroke fields.

Any future change to a P0/P1 item above is a **copy or asset correction**, not a Foundation change, and must
still ship with explicit approval, tests, Preview review and a rollback path.

---

## 12. Proposed tests

To be written **before** any production copy change, in a new `tests/commercial-page-copy-governance.test.js`
plus one generalisation in `tests/market-consolidation.test.js`:

1. **Title range.** For `es/motor-horizontal.html`, `pt/motor-horizontal.html`,
   `ar/horizontal-engine.html`: `<title>` matches the page’s approved 110–150 wording, `doesNotMatch`
   `/50cc-125cc/`, and the motorcycle qualifier survives (`para Motocicleta` / `para Moto` / AR equivalent).
2. **Frozen-contract regression, asserted in the same test as (1)** — unchanged canonical, all six hreflang
   alternates, exactly one `<h1>`, the breadcrumb, `data-product-family-owner="horizontal"`, the `#webpage`
   and `#breadcrumb` IDs, and the five CX rows with nominal classes 110/125/125/140/150 and **no** filled
   actual-displacement or bore/stroke values.
3. **No SLA text.** `!/within 24 hours/i` and `!/reply within/i` across `en/index.html`,
   `en/cb-engine.html`, `en/cg-engine.html`, `en/horizontal-engine.html`, `en/engine-parts.html`, plus a
   non-invented-SLA guard rejecting `24 h`, `48 h` and `same day` reply wording.
4. **CB claim scope.** `en/cb-engine.html` contains no `strong torque` and no `low vibration`; still contains
   CB150 149 cc, CB200-C 197 cc, CB250 223 cc, `Air-cooled`, `5-speed constant mesh` and
   `subject to configuration`; contains no Nm figure and no balance-shaft wording transferred to CB. Repeat
   the negative assertions for the ES, PT and AR CB copies and the shared cards.
5. **Asset resolution, generalised.** Loop over **all** HTML files: no
   `images/卧式电启动/*.png` reference may exist, every referenced `.webp` must exist on disk — replacing the
   current single-file assertion at `tests/market-consolidation.test.js:11`–`:17`.
6. **ES CG stability.** During any Batch-1 PR, assert `es/motor-cg.html` title, description, H1, canonical
   and both table row sets are byte-stable, with line 246 as the only permitted diff in the file.
7. **Tracker and form stability.** Every edited page still loads `js/main.js` exactly once, registers one
   `gtag('config', 'AW-16777656395')` and one `ym(109483511,"init",…)`, and the form action, field names and
   Turnstile container are unchanged.
8. **Gate.** `node --test "tests/*.test.js" "root tests/*.test.js"` must remain at **244 pass / 0 fail** plus
   the new tests; the Worker suite must stay 13/13.

---

## 13. Recommended Batch 1 (proposed, not executed)

**Entry condition:** explicit user approval for one narrow, fact-driven PR; no Foundation contract touched;
tests written first (§12); per-page Preview review; rollback = revert one commit.

**Batch 1 — 3 items, all corrections of verifiable defects, zero speculative SEO rewriting:**

1. **Horizontal title range normalisation** on `es/motor-horizontal.html`, `pt/motor-horizontal.html`,
   `ar/horizontal-engine.html` → approved 110–150 cc, keeping the motorcycle qualifier. The only finding in
   this audit whose evidence chain is complete *and* already normalised against sibling locales inside the
   repository (F1, F2, E40).
2. **Delete the 24-hour reply sentence** from the five English commercial pages, inserting no replacement
   timing (F3).
3. **Delete the unsupported CB torque/vibration language** from `en/cb-engine.html` and from the ES/PT/AR CB
   pages and the shared CB card copies reached on the audited pages, keeping every approved CB fact and
   restoring the `subject to configuration` qualifier where it was dropped (F4–F6).

**Batch 1.5 — independent, no copy dependency, may ship separately:** the `.png` → `.webp` repair across the
12 files, including `es/motor-cg.html:246`. It is an asset reference rather than content, it removes a
visible empty image from the best-ranked page in scope, and a test already declares the intended rule (F7,
E7). Also independent: the `ENGINE_SPEC_MASTER.csv:20` documentation correction (F8).

**Explicitly excluded from Batch 1:** any ES CG copy change; EN Horizontal title/H1/YX restructuring; any
attempt to target generic `motores horizontales`; new ES/PT/AR comparison anchors or hero rewrites; CB title
reframing (do it only in a later approved experiment with GSC evidence); nav localisation; noindex tool-page
cleanup; new blogs, country pages or model pages; any new performance figure, Nm value, MOQ, stock, shipping
or SLA claim; any Foundation, form, Worker, Schema or tracking change.

**Which pages should really change first:** **three content files for the P0 title range, five English
commercial files for the P0 SLA removal, and `en/cb-engine.html` plus its ES/PT/AR mirrors for the P1 claim
removal — with `es/motor-cg.html` and `en/horizontal-engine.html` receiving NO_ACTION on copy.** The image
repair is a defect fix, not an SEO change, and should not be used as an excuse to touch anything else.

---

## 14. NEEDS_EVIDENCE register

| Open question | Evidence required before any action |
| --- | --- |
| Are `motores horizontales` impressions mostly non-motorcycle intent? | Country-targeted SERP capture (ES/MX/CO/PE) + GSC query export with clicks and CTR |
| Is the EN “Russian-market” phrase helping or hurting globally? | GSC query split (`horizontal motorcycle engine` vs `YX*`) by country for `/en/horizontal-engine` |
| Does Brazil/PT justify any dedicated page or commercial term? | PT/Brazil GSC segment (90 days, query × country × device) + sales-inquiry records |
| Is there any legitimate response-time commitment? | A written owner-approved commercial policy added to `COMPANY_FACT_PACK.csv`; until then, no timing wording anywhere |
| Are torque or vibration benefits defensible for CB? | Factory test data, or an approved CB-family wording entry in `ENGINE_SPEC_MASTER.csv` |
| Which CG balance-shaft content is actually live? | Re-confirmation after correcting the stale hidden-table reference (F8) |
| Do the horizontal heroes damage mobile LCP? | Three mobile Lighthouse runs, median value, per `FOUNDATION_CLOSURE_AND_FREEZE.md:77` |
| Is the supplied GSC snapshot still current? | Fresh 28-day GSC export at page and query level (E34) |

---

## 15. Stop condition

This audit ends here. It produced exactly one file — this document. No production page, Foundation contract,
PR, merge or deployment was created or modified, and no approved fact was changed.

**PRODUCTION_FILES_MODIFIED = NO**
