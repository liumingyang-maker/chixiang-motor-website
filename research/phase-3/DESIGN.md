# Phase 3 Market Validation Design

## Goal

Create an auditable, research-only Phase 3 validation package for Peru, Ecuador, Tanzania, Uzbekistan, Russia, and Colombia. The package may qualify a country for Phase 4 advertising design only; it cannot approve an ad launch.

## Boundaries

- Phase 2B remains a read-only 2026-07-15 snapshot.
- No production page, contact form, Worker, campaign, RSA, or budget change is allowed.
- No buyer outreach, WhatsApp, email, form submission, or production conversion test is allowed.
- No unverified market, price, compatibility, compliance, or search-volume claim is allowed.

## Evidence model

Each country folder will contain source-backed research notes. A normalized evidence register in `data/` will assign one unique Evidence ID per claim and include URL, publisher, date, access date, reliability, limitations, and gate usage. Buyer and channel records must point to that ID.

## Country lanes

- Lane A: Peru, Ecuador, Tanzania. Full buyer, channel, complete-engine-demand, product-fit, search, logistics, landing-readiness, and gate assessment.
- Lane B: Uzbekistan and Russia. Accelerated validation using documented factory signal as a limitation-labelled input; neither is a Formal Top 15 market. Russia has an additional compliance gate.
- Lane C: Colombia. Limited proof of Chinese CG complete-engine demand only. If proof remains insufficient, output remains SEO/distributor-development only.

## Gate model

Every country is assessed against buyer contactability, complete-engine demand, margin/landed price, search intent, import/payment/logistics, landing page, and tracking. Statuses are limited to PASS, FAIL, NOT TESTED, INPUT REQUIRED, and MANUAL TEST REQUIRED. Overall Ads Verification can be PASS only if all required inputs pass; Ads Launch is always NOT APPROVED in Phase 3.

## Deliverables and QA

The output workbooks are generated from auditable data tables. `qa/phase3_qa.py` validates evidence references, lane minimums, prohibited assumptions, margin rules, Indian-platform exclusions, gate completeness, launch status, and workbook formula errors. `QA_REPORT.md` records the result.
