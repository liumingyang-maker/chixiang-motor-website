# PHASE 2 — GPT FINAL DECISION (authoritative layer)

Date: 2026-08-28. After GPT final review of the Phase 2 discovery + Wave 1 build.
This file is the DECISION OF RECORD for ES / PT-BR growth. Where it conflicts with the
earlier discovery docs (SEARCH_DEMAND_ES_PT_REPORT.md, SPANISH/PORTUGUESE plans,
LATAM_LANDING_PAGE_PLAN.md, SEO_OPPORTUNITY_REGISTRY_ES_PT.csv), THIS FILE WINS.
Labels: OBSERVED / SERP_OBSERVED (non-geo caveat) / GSC_OBSERVED (owner-supplied) / INFERENCE / NEEDS_EVIDENCE.

## Locked decisions
1. ES-G1 "¿Qué es un motor CG?" guide — APPROVED, Wave 1. Built on branch seo/es-cg-guide-wave-1 at URL
   /es/guia/que-es-un-motor-cg/ (article/WebPage, Inicio→Noticias→guide, links to CG/CB/parts/contact).
   Informational only; no supplier keywords in title/H1; Chixiang-scoped CG wording (no universal CG
   definition); selection keyed to concrete engine code + spec sheet. GPT review corrections applied. **STATUS: RELEASED + PRODUCTION VERIFIED** (see Waves / Verification sections).
2. ES Horizontal guide (Qué es / dónde se usa) — WATCH. Not built. Only reconsider after GSC query evidence
   confirms the motorcycle-intent demand is distinct enough from /es/motor-horizontal.
3. PT-BR: existing commercial owners FIRST (/pt/motor-cg, /pt/motor-cb, /pt/motor-horizontal,
   /pt/pecas-de-motor) — OPTIMIZE_EXISTING is the priority track, not new pages.
4. PT importer-from-China guide ("importar motor de moto da China") — WATCH. High business VALUE (INFERENCE),
   but NO approved query/volume evidence yet; do NOT build as a new page until GSC pt-BR query data supports it.
5. PT CG guide ("o que é um motor CG" / CG vs CB) — WATCH. Brazil "CG" is Honda-entangled and consumer-leaning
   (SERP_OBSERVED); do NOT auto-build a PT CG guide.
6. Dominican Republic market page — WATCH (was CREATE-CONDITIONAL). Candidate CREATE_MARKET_PAGE ONLY after
   GSC country × query shows distinct DR importer/distributor intent. Volume/position currently UNKNOWN.
   While no DR owner exists, the nearest owner is /es/motor-cg (NOT /es/peru).
7. /pt/brasil/ country page — NO_ACTION. Existing /pt/* owners absorb Brazil; no country clone.
8. No per-displacement pages anywhere (motor-cg-150/200/250, motor-horizontal-110/125/150). Variants stay on owners.
9. No generic industrial "motores horizontales" page. Keep every horizontal heading motorcycle-qualified.

## Metric discipline (must not regress)
- Never present a PAGE signal as a QUERY signal. /pt/motor-horizontal ~7 imp / ~pos 9.6 and
  /es/motor-horizontal ~pos 38.1 are PAGE-level; the query "motores horizontales" ~pos 40.1 / 58 imp is
  QUERY-level. Query-level position/impressions are left blank wherever a specific query is unproven.
- GSC figures are owner-supplied (not repo-verifiable); SERP findings are non-geo web searches (directional only).
- No fabricated search volume for DR, PT import, or PT CG/CB candidates.

## Approved-facts reminders (guardrails for any future build)
- Horizontal family applications are moto/pit bike/mini-enduro/ATV/assembly; cargo tricycle is NOT an approved
  horizontal application. Cargo-tricycle belongs to CG water / HW families.
- CX horizontal actual displacement / bore / stroke remain blank (UNKNOWN).
- CG valve-train (OHV/varillas) is NOT in ENGINE_SPEC_MASTER; do not assert CG=OHV vs CB=OHC. Only CB has a
  "camshaft upward" field.
- No strong torque / low vibration / invented performance; no 24-hour or any SLA; no MOQ/price/lead-time/stock;
  no certificate number/scope; Brazil copy in Brazilian Portuguese (no Spanish "por mayor").

## Waves (Wave 1 shipped and verified; Wave 2-4 plan only - nothing executed from this file)
- Wave 1 = RELEASED + PRODUCTION VERIFIED.
  Task A (ES/PT home claim cleanup) - branch seo/governance-cleanup-es-pt-home, PR #29,
  merge e61f7da6db66be102b98aa9a8ff7f063c2d3b296. Live /es/ and /pt/ checked: no 24-hour reply
  promise, no CB torque/vibration wording, configuration qualifier intact.
  Task B (ES-G1 guide + minimal Foundation extension) - branch seo/es-cg-guide-wave-1, PR #30,
  merge b53df1de9a10f02be46f65ca9246fc513d034de8 (= origin/main after Wave 1).
  Batch-1 governance corrections shipped earlier via PR #28, merge
  ea63342721401d78ea87864b131026f80fe51379 (the base of Wave 1).
- Wave 2: measure ES-G1 after reindex; then consider ES Horizontal support ONLY if query evidence clears item 2.
- Wave 3: strengthen existing PT owners via the two approved commercial briefs (docs/seo/briefs/*), pending evidence.
- Wave 4: revisit DR / Brazil market pages only on GSC country × query.

## Verification after deploy
- RESOLVED / OBSERVED PASS - the nested trailing-slash directory URL is served correctly in
  production: https://chixiangmotor.com/es/guia/que-es-un-motor-cg/ returns HTTP 200, no 404,
  no redirect loop (the earlier "repo test mocks asset fetch" caveat is closed).
- Production smoke for the same URL: canonical exact self-reference with trailing slash; UTF-8
  accents intact when the raw response bytes are decoded (no ? -mangled text, no U+FFFD); Article
  schema with inLanguage es; breadcrumb Inicio -> Noticias -> guide; owner links /es/motor-cg,
  /es/motor-cb, /es/repuestos-motor, /es/contacto present; /es/news shows the accented guide card;
  sitemap.xml lists the guide URL exactly once; owner pages /es/motor-cg, /es/motor-cb and
  /es/motor-horizontal still 200 with unchanged canonical and H1.
- STILL PENDING - post-Batch-1 GSC re-pull (old PT "50cc-125cc" title still cached in some SERP sources).