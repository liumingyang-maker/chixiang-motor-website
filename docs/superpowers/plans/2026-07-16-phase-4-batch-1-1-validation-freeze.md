# Phase 4 Batch 1.1 Validation and Freeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Peru and Uzbekistan Batch 1 semantic defects, produce a v3 auditable baseline, and create validation templates without authorizing ads, outreach, production inquiries, or site deployment.

**Architecture:** Treat Phase 4 v2 as read-only input. Write materially changed v3 workbooks and new validation templates under `research/phase-4/`; use `P4V-PE-` and `P4V-UZ-` only for new evidence. A cross-artifact QA script validates mappings, tiers, evidence scope and gate controls before the freeze package is assembled.

**Tech Stack:** Markdown, CSV, `.xlsx` generated with `@oai/artifact-tool`, Python standard-library QA, Git.

---

### Task 1: Establish v3 data dictionary and controlled values

**Files:**
- Create: `research/phase-4/data/phase4_batch11_data_dictionary.csv`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Data_Dictionary_v1.xlsx`
- Test: `research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

- [ ] **Step 1: Write a failing dictionary-presence check**

```python
required_domains = {"Record type", "Demand type", "Research status", "Ads eligibility",
                    "Confidence", "Compatibility requirement", "Listing status", "Match type", "Launch gate"}
assert required_domains <= set(dictionary_domains)
```

- [ ] **Step 2: Run the QA before the dictionary exists**

Run: `python research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

Expected: FAIL with a missing-data-dictionary finding.

- [ ] **Step 3: Create controlled vocabularies**

Include, at minimum: `Retained/Rejected`; `NOT APPROVED/NATIVE REVIEW REQUIRED/FIT REVIEW REQUIRED/ADS REVIEW CANDIDATE`; `Low/Medium/High/Not applicable`; `Observed active/Observed unavailable/Unknown`; `RESEARCH ONLY/VALIDATE BUYER/VALIDATE FIT/VALIDATE DEMAND/VALIDATE ECONOMICS/READY FOR ADS REVIEW`.

- [ ] **Step 4: Export the Data Dictionary workbook with validation lists**

Use the existing Phase 4 spreadsheet builder pattern, `@oai/artifact-tool`, frozen headers and a definition column for each allowed value.

- [ ] **Step 5: Run the QA and commit**

Run: `python research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

Expected: dictionary check passes.

Commit: `research: add batch 1.1 controlled vocabularies`

### Task 2: Correct v3 product demand, score and launch-gate logic

**Files:**
- Create: `research/phase-4/data/phase4_batch11_product_matrix.csv`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Product_Country_Matrix_v3.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Country_Product_Demand_Ranking_v3.xlsx`
- Modify: `research/phase-4/scripts/build_phase4_batch11.mjs`
- Test: `research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

- [ ] **Step 1: Add failing tier and unsupported-product checks**

```python
assert all(row.ranking_tier == row.matrix_tier for row in ranked_products)
assert all(row.score == 0 or row.evidence_ids != "No product-specific evidence" for row in unsupported_products)
```

- [ ] **Step 2: Run QA to capture the current v2 failures**

Expected: the Peru parts-pack tier and unsupported commercial-point checks fail.

- [ ] **Step 3: Build the v3 matrix**

Set unsupported commercial components to `0`, retain source-backed score components only, add `Scoring model version` (`ENGINE-V1` or `AFTERMARKET-V1`), and add the non-numeric launch-gate formula: compatibility Low → `VALIDATE FIT`; else complete-engine demand Low → `VALIDATE DEMAND`; else missing economics → `VALIDATE ECONOMICS`; else `READY FOR ADS REVIEW`.

- [ ] **Step 4: Build ranking from matrix-derived formulas**

Use the same threshold formula in both workbooks. The Peru parts-pack score of 57 must resolve to `B`; all rows must remain below `READY FOR ADS REVIEW`.

- [ ] **Step 5: Run QA and commit**

Expected: all ranking/matrix consistency checks pass.

Commit: `research: correct batch 1.1 score and gate model`

### Task 3: Correct competitor, evidence and keyword semantics

**Files:**
- Create: `research/phase-4/data/phase4_batch11_evidence_log.csv`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Competitor_Product_Map_v3.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Keyword_Master_v3.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Negative_Keywords_v3.xlsx`
- Modify: `research/phase-4/scripts/build_phase4_batch11.mjs`
- Test: `research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

- [ ] **Step 1: Add failing semantic checks**

```python
assert not any("P4" in row.complete_engine_sales for row in competitor_rows)
assert all(is_valid_url(row.proposed_landing_url) for row in keyword_rows)
assert all(displacement_matches_product(row.keyword, row.product) for row in keyword_rows)
assert all(evidence_scope_matches(row.evidence_ids, row.country, row.product) for row in keyword_rows)
```

- [ ] **Step 2: Run QA before v3 source data exists**

Expected: failures for CG250-to-CG200 mapping, descriptive landing mappings, broad evidence bundles and competitor status misuse.

- [ ] **Step 3: Create a normalized competitor map and evidence registry**

Add seller/entity, channel type, official-status verification, date observed, listing status and direct-competitor fields. Put evidence IDs only in the Evidence IDs field. Add archive path, recheck date, observed attribute, reviewer, review status and supported score components to the evidence CSV; leave unknown fields explicitly unknown rather than inventing values.

- [ ] **Step 4: Create corrected keyword and negative-keyword workbooks**

Map `motor CG 250 carguero` only to `CG250 air-cooled — research only` or reject it. Add `Current landing URL`, `Proposed landing URL`, `Page module/section`, `Implementation status`, `Research status`, `Ads eligibility`, native-wording provenance and brand-keyword controls. Keep raw proxy data separate from real search data. Add negative `Match type`, `Platform` and `Level` while retaining brand exclusions at ad-group scope only.

- [ ] **Step 5: Run QA and commit**

Expected: keyword/competitor/evidence semantic checks pass with no keyword marked launch-ready.

Commit: `research: correct batch 1.1 keyword and evidence semantics`

### Task 4: Create factory-fit, search and buyer-validation templates without inventing evidence

**Files:**
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Factory_Spec_Master_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Compatibility_Checklist_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Native_Term_Review_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Search_Data_Validation_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Buyer_Channel_Candidate_List_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Economics_Input_Register_v1.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Buyer_Technical_Intake_ES_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Buyer_Technical_Intake_RU_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Buyer_Interview_Guide_ES_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Buyer_Interview_Guide_RU_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Landed_Cost_Assumptions_v1.md`
- Test: `research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

- [ ] **Step 1: Add failing no-invention checks**

```python
assert not any(row.has_unsourced_price_or_volume for row in all_validation_rows)
assert all(row.contact_approval_status == "CONTACT NOT APPROVED" for row in buyer_rows)
```

- [ ] **Step 2: Build factory and compatibility templates**

Include every specified engine/interface field, mark all unsupplied fields `INPUT REQUIRED`, and use an explicit no-compatibility-claim warning.

- [ ] **Step 3: Build native-term and search-data templates**

Use `Machine-generated — review required` until a named reviewer/source is recorded. Keep monthly volume, CPC and bid fields blank until a real source screenshot/export is attached.

- [ ] **Step 4: Build buyer, interview and economics templates**

Set all contact approval cells to `CONTACT NOT APPROVED`; do not submit forms or contact anyone. Mark all unknown commercial inputs `INPUT REQUIRED`.

- [ ] **Step 5: Run QA and commit**

Expected: no invented commercial data and no contact approval.

Commit: `research: add batch 1.1 validation templates`

### Task 5: Prepare design-only landing specifications and freeze package

**Files:**
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Landing_Page_Roadmap_v2.xlsx`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Landing_Page_Content_Spec_ES_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Landing_Page_Content_Spec_RU_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Phase_4_Cross_Artifact_QA_Report_v1.md`
- Create: `research/phase-4/deliveries/2026-07-16_phase-4-batch-1-1-freeze/Batch_1_1_Freeze_Handoff.md`
- Test: `research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

- [ ] **Step 1: Add landing-page gate tests**

```python
assert all(row.implementation_status == "DESIGN ONLY" for row in landing_rows)
assert all("compatible" not in row.prohibited_claims.lower() for row in landing_rows)
```

- [ ] **Step 2: Write the page specifications**

Use the three specified Peru routes and a Russian Uzbekistan research wireframe only. Include evidence-backed scope, prohibited claims, qualification form fields, MOQ/quotation CTA, review status and implementation gate. Do not modify production files.

- [ ] **Step 3: Run full cross-artifact QA and render all changed workbooks**

Run: `python research/phase-4/qa/phase4_batch11_cross_artifact_qa.py`

Expected: PASS. Render each changed workbook with `@oai/artifact-tool`; fix any clipped header or formula error before export.

- [ ] **Step 4: Create the delta-only freeze delivery folder and commit**

Copy only materially changed files plus `Batch_1_1_Freeze_Handoff.md`. The handoff must list unchanged baseline files by reference rather than copying them.

Commit: `research: freeze phase 4 batch 1.1 validation baseline`

## Plan self-review

- Spec coverage: Tasks 1–3 cover all Workstream A must-fix items and semantic QA. Task 4 creates safe, no-invention templates for Workstreams B–E, including the specified technical intake and buyer-contact controls. Task 5 covers Workstream F and the freeze/delta delivery rule.
- External dependencies: factory specifications, named native reviewers, real search data, buyer verification, pricing and logistics evidence are unavailable without new supplied inputs or permitted research; their fields remain `INPUT REQUIRED`, `Machine-generated — review required`, `NOT TESTED` or `CONTACT NOT APPROVED`.
- No prohibited action is planned: no ads, outreach, production inquiry, site deployment or Phase 3 modification.
