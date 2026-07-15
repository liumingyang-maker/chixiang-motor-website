# Phase 3 Market Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the Phase 3 research-only validation package and automated QA without contacting buyers, changing production pages, or launching ads.

**Architecture:** Keep all research in `research/phase-3/`. Store claims in a normalized evidence register; derive six auditable workbooks and country gate outcomes from those records. Use markdown for human-readable country, logistics, tracking, and data-gap reports; use Python only for deterministic QA.

**Tech Stack:** Static website repository, Markdown, Python standard library, bundled spreadsheet artifact workflow, public web sources.

---

### Task 1: Create the research scaffold and evidence schema

**Files:**
- Create: `research/phase-3/README.md`
- Create: `research/phase-3/data/evidence_register.csv`
- Create: `research/phase-3/data/gate_status.csv`
- Create: `research/phase-3/sources/README.md`

- [ ] Define the exact evidence columns: ID, country, claim, source type, URL, publisher, publication date, access date, reliability, primary/secondary, limitation, and gate use.
- [ ] Define gate-status columns for every country and every required gate.
- [ ] Record the Phase 2B snapshot as input only and explicitly prohibit overwriting it.
- [ ] Validate that every initial Evidence ID is unique.

### Task 2: Audit source pages and conversion implementation without submitting forms

**Files:**
- Create: `research/phase-3/Phase_3_Tracking_Test_Report.md`
- Create: `research/phase-3/Phase_3_Landing_Page_Readiness.xlsx`
- Create: `research/phase-3/data/site_audit.csv`

- [ ] Read the Peru, Colombia, and Central Asia pages plus the contact Worker and tracking code.
- [ ] Record only code-observable results; label production-only checks `MANUAL TEST REQUIRED`.
- [ ] Do not invoke `/api/contact`, WhatsApp links, or conversion events.

### Task 3: Research Lane A public evidence

**Files:**
- Create: `research/phase-3/peru/README.md`
- Create: `research/phase-3/ecuador/README.md`
- Create: `research/phase-3/tanzania/README.md`
- Modify: `research/phase-3/data/evidence_register.csv`

- [ ] Identify at least ten candidate B2B organisations in each Lane A country from official, importer, assembler, wholesale, service-network, or credible industry sources.
- [ ] Record contactability only where public business contact details are visible; do not contact anyone.
- [ ] Seek two independent complete-engine-demand proofs per country, or an import/assembly proof plus a complete-engine replacement-channel proof.
- [ ] Record channel, product-fit, search, logistics, and limitations with Evidence IDs.

### Task 4: Research Lane B and Lane C public evidence

**Files:**
- Create: `research/phase-3/uzbekistan/README.md`
- Create: `research/phase-3/russia/README.md`
- Create: `research/phase-3/colombia/README.md`
- Modify: `research/phase-3/data/evidence_register.csv`

- [ ] For Uzbekistan and Russia, identify the required buyer candidates and public contactability while separating factory-signal inputs from independent evidence.
- [ ] Add Russia sanctions, payment, freight, customs, and advertising-platform compliance as independent `NOT TESTED` or `FAIL` gates unless reliable evidence supports a narrower conclusion.
- [ ] For Colombia, look only for Chinese CG complete-engine evidence and separate it from Bajaj, TVS, Hero, Piaggio Ape, Mahindra, Royal Enfield, and parts-only signals.

### Task 5: Build Phase 3 workbooks and reports

**Files:**
- Create: `research/phase-3/Phase_3_B2B_Buyer_List.xlsx`
- Create: `research/phase-3/Phase_3_Competitor_Channel_Map.xlsx`
- Create: `research/phase-3/Phase_3_Product_Market_Fit.xlsx`
- Create: `research/phase-3/Phase_3_Landed_Cost_Margin_Model.xlsx`
- Create: `research/phase-3/Phase_3_Search_Intent_Validation.xlsx`
- Create: `research/phase-3/Phase_3_Ads_Verification_Gate.xlsx`
- Create: `research/phase-3/Phase_3_Import_Payment_Logistics.md`
- Create: `research/phase-3/Phase_3_Data_Gaps.md`
- Create: `research/phase-3/Phase_4_Keyword_Research_Input.md`

- [ ] Use blank factory-price, freight, tax, and selling-price inputs where no first-party data exists; label all corresponding margin cells `INPUT REQUIRED`.
- [ ] Limit each country search sheet to 20–30 Phase 3 seed terms and use no unsupported numeric volume or CPC.
- [ ] Keep products, compatibility risks, Indian-platform exclusions, and Evidence IDs visible in every relevant record.
- [ ] Make overall Ads Verification PASS conditional on every mandatory gate; keep Ads Launch `NOT APPROVED` for all countries.

### Task 6: Implement and run QA

**Files:**
- Create: `research/phase-3/qa/phase3_qa.py`
- Create: `research/phase-3/qa/QA_REPORT.md`

- [ ] Write tests/checks for unique Evidence IDs, existing evidence references, Lane A buyer/contact minimums, complete-engine evidence thresholds, product-fit evidence, missing-price treatment, margin treatment, search-claim precision, Indian-platform exclusion, gate completeness, launch status, and manual-test labels.
- [ ] Run `python research/phase-3/qa/phase3_qa.py`.
- [ ] Correct only research-file defects until QA is PASS or explicitly document blocked checks as required inputs.

### Task 7: Publish the executive summary and verify delivery

**Files:**
- Create: `research/phase-3/Phase_3_Executive_Summary.md`
- Modify: `research/phase-3/README.md`

- [ ] Reconcile every country outcome with the Ads Verification workbook.
- [ ] List all manual inputs, evidence gaps, and any `NOT TESTED`/`INPUT REQUIRED` gates.
- [ ] Confirm no production page changed and no contact or form submission occurred.
- [ ] Run the QA script, scan every workbook for formula errors, review rendered worksheets, and commit the research package on `research/phase-3-market-validation`.
