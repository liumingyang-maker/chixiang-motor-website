# CURRENT Handoff - SEO Growth V3

Branch: seo/commercial-fact-fixes-batch-1
Base: 94250424618bd130126fcb759e817bb6805a7dcd (main, Foundation FROZEN / PR #27)

## Batch 1 executed (this branch)

Approved from docs/seo/audits/2026-08-commercial-page-seo-audit-v1.md. Two commits:

- 9bbfbc3 Batch 1A - commercial fact / commercial-copy corrections (13 files)
  1. ES/PT/AR horizontal <title>: false "50cc-125cc" -> approved "110-150 cc";
     motorcycle qualifier, canonical, H1, hreflang, Owner attrs, Schema IDs untouched.
  2. Removed "Our sales team will reply within 24 hours." from the 5 EN commercial pages
     (en/index, en/cb-engine, en/cg-engine, en/engine-parts, en/horizontal-engine).
     No replacement SLA invented.
  3. CB unsupported "strong torque"/"low vibration" removed from EN/ES/PT/AR CB pages and the
     audit-named shared cards; approved CB facts kept; off-road retained WITH the
     subject-to-configuration qualifier (en: "subject to configuration", es: "segun configuracion",
     pt: "conforme configuracao", ar: hasb al-takwin). No new performance claim created.

- 3c11e9c Batch 1B - asset fix + governance test (12 files + test)
  Replaced non-existent "...cddc34045a26.png" with the real ".webp" asset across 12 shared-card
  files. Image content unchanged; no other asset swapped.
  Added tests/commercial-page-copy-governance.test.js (7 tests) guarding all Batch 1 invariants.

## Verification
- Full suite: node --test "tests/*.test.js" "root tests/*.test.js" => 251 tests, 251 pass, 0 fail.
- Baseline before batch was 244/244; +7 new tests => 251. No regression.
- git diff --check clean. Frozen-contract assertions included in the new test.

## Not done (explicitly out of Batch 1 scope, per audit)
- RU CB page torque/vibration language (audit scoped CB claim to EN/ES/PT/AR only).
- ES/PT/AR/RU English nav labels (P2, frozen nav area).
- ES/PT/AR horizontal hero clarity + comparison anchor (P2).
- en/cb-engine "View Detailed Specs" -> noindex CTA (P2).
- noindex tool-page / products.html stronger CB copy (P2).
- ENGINE_SPEC_MASTER.csv:20 stale hidden-table note (P1, docs-only; next batch).
- Any generic "motores horizontales" targeting; any new page/blog.

PRODUCTION_DEPLOYED = NO
READY_FOR_CODEX_REVIEW = YES
