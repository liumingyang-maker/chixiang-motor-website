# Chixiang Motor GEO Entity Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a read-only, evidence-backed digital entity audit and normalized entity matrix for Chixiang Motor without changing production pages, tracking, routing, or SEO configuration.

**Architecture:** Treat the current production site and repository as the factual baseline, reconcile them with existing Phase 5 research and narrowly selected public sources, then normalize organization, product, application, market, capability, and commercial-policy entities into one CSV. The Markdown report explains conflicts, ownership, gaps, and page decisions; a formatted XLSX is generated from the same CSV only for human review.

**Tech Stack:** Static HTML/JavaScript repository, PowerShell and Node.js for read-only extraction/validation, Markdown, RFC 4180-compatible CSV, `@oai/artifact-tool` for the review workbook.

---

### Task 1: Freeze the audit contract and source hierarchy

**Files:**
- Reference: `docs/superpowers/specs/2026-07-29-geo-entity-audit-design.md`
- Create: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Create the audit report skeleton**

Create the report with sections for executive decision, scope, evidence rules, entity inventory, ownership, conflicts, page decisions, non-public claims, and Phase 6.1 recommendations.

- [ ] **Step 2: Record the immutable production baseline**

Record the canonical origin, deployed Foundation commit, 51-URL Sitemap state, product-detail noindex policy, mobile evidence scope, performance measurement limitation, and real-form verification boundary.

- [ ] **Step 3: Record the source hierarchy**

List production HTML, repository source, Foundation reports, Phase 5 research, and external public sources in descending authority. State that private customer/sales data is not used.

- [ ] **Step 4: Validate the skeleton**

Run:

```powershell
rg -n "Executive|Evidence|Organization|Product|Application|Market|Ownership|Conflict|Decision|Phase 6.1" docs/geo-entity/GEO_ENTITY_AUDIT.md
```

Expected: every required section has at least one heading.

- [ ] **Step 5: Commit the skeleton**

```powershell
git add docs/geo-entity/GEO_ENTITY_AUDIT.md
git commit -m "docs: scaffold GEO entity audit"
```

### Task 2: Inventory current pages and extract candidate entities

**Files:**
- Read: `sitemap.xml`
- Read: `en/*.html`, `ru/*.html`, `ru/*/index.html`, `es/*.html`, `es/*/index.html`, `pt/*.html`, `ar/*.html`
- Read: `js/product-data.js`, `js/latam-cg-products.js`, `js/latam-cg-peru-data.js`, `js/latam-cg-colombia-data.js`, `js/central-asia-data.js`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Parse the Sitemap and build a page inventory**

For every Sitemap URL, capture language, page type, title, description, H1, canonical, visible entity names, and relevant internal links. Do not treat noindex utility pages as Sitemap entities.

- [ ] **Step 2: Extract organization and brand facts**

Record legal name, brand aliases, Chongqing/China location, company role, founding year, factory/production claims, export claims, contact identity, and conflicting values with source paths.

- [ ] **Step 3: Extract product families and models**

Normalize family/model names and aliases without inventing missing specifications. Capture only models actually present in current pages or data files.

- [ ] **Step 4: Extract applications, markets, capabilities, and commercial policies**

Capture applications, market pages, OEM/ODM, production/testing, MOQ, sample, mixed-order, freight-forwarder, parts, and contact-priority statements.

- [ ] **Step 5: Add inventory evidence to the report**

Summarize page coverage and list all contradictions or missing sources rather than resolving them by assumption.

### Task 3: Reconcile existing research and public evidence

**Files:**
- Read: `research/phase-5/README.md`
- Read: `research/phase-5/Phase_5_Executive_Summary.md`
- Read: `research/phase-5/Phase_5_Data_Gaps.md`
- Read: `research/phase-5/source-freeze/PHASE_4_SOURCE_REFERENCE.md`
- Read: `research/phase-5/keyword-tool-input/*.csv`
- Read: `research/phase-5/deliveries/phase-5-priority-market-implementation/*.md`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Classify existing research sources**

For every market/product assertion used, identify whether the underlying support is public, internal reference, assumption, or missing.

- [ ] **Step 2: Verify only decision-critical public facts**

Use focused current browsing for facts that materially change entity status or page decisions. Prefer official/primary sources; record direct URLs and access date. Do not perform broad competitor scraping.

- [ ] **Step 3: Reclassify market-product relationships**

Assign `VERIFIED`, `SUPPORTED`, `HYPOTHESIS`, `UNKNOWN`, or `CONFLICTING` to Russia–horizontal/152FMH, Central Asia/Uzbekistan–cargo/water-cooled, Peru–CG models, Colombia–replacement models, and any other relationship found.

- [ ] **Step 4: Preserve data gaps**

Keep missing Keyword Planner, Wordstat, sales, inquiry, pricing, compatibility, certification, and country-specific proof as explicit gaps.

### Task 4: Build the normalized entity matrix

**Files:**
- Create: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Write the exact CSV header**

Use the 23 columns defined in the design, in the documented order, with UTF-8 encoding and one canonical entity per row.

- [ ] **Step 2: Populate organization, brand, capability, and policy rows**

Use stable kebab-case IDs and explicit parent relationships. Every row must have evidence status, visibility, readiness, recommended action, and decision reason.

- [ ] **Step 3: Populate product family and model rows**

Separate product families from models. Models without enough independent content must use `DO_NOT_BUILD_YET`, `NEEDS_EVIDENCE`, or an existing family Owner.

- [ ] **Step 4: Populate application and market rows**

Do not encode a product-market relationship as fact unless supported. Put uncertain relationships in `candidate_markets` with matching evidence status and reason.

- [ ] **Step 5: Validate CSV shape and enums**

Run a read-only validator that checks header order, unique entity IDs, allowed entity/action/status enums, ISO verification dates, canonical non-www URLs, and non-empty decision reasons.

Expected: 0 duplicate IDs, 0 invalid enums, 0 malformed rows, 0 www URLs.

### Task 5: Assign entity ownership and page decisions

**Files:**
- Modify: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Assign Owner, Supporting, and Mention relationships**

For every core entity, identify one Owner per language/search intent or record `OWNER MISSING`. Market pages remain Supporting unless they truly define a unique market entity.

- [ ] **Step 2: Detect page competition and thin-page risk**

Compare language, entity, intent, index status, title/H1, and content coverage. Do not label normal contextual mentions as cannibalization.

- [ ] **Step 3: Produce the page decision list**

List current/candidate URL, represented entity, current role, decision, evidence, missing proof, dependency, and implementation risk. Do not impose a page-count limit during audit.

- [ ] **Step 4: Define the Phase 6.1 shortlist gate**

State that only `HIGH + READY` or evidence-backed `MEDIUM + READY` entities can be shortlisted; unresolved conflicts and `NEEDS_EVIDENCE` cannot enter implementation.

### Task 6: Complete the narrative audit

**Files:**
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`

- [ ] **Step 1: Write entity findings**

Explain the company/brand model, product hierarchy, applications, markets, capabilities, and policies using the matrix as the source of truth.

- [ ] **Step 2: Write the prohibited-claims register**

List claims that must not be published yet, including unsupported market demand, compatibility guarantees, logistics times, market leadership, volume claims, and unverified certifications.

- [ ] **Step 3: Write Phase 6.1 recommendations**

Separate `ENHANCE_EXISTING`, `BUILD_NEW`, `DO_NOT_BUILD_YET`, and `NEEDS_EVIDENCE`. Recommend an implementation batch only after the complete audit; do not edit pages.

- [ ] **Step 4: Reconcile report and matrix**

Verify entity counts by type/status/action, every named priority entity exists in CSV, and every CSV action is explained in the report.

### Task 7: Generate and verify the review workbook

**Files:**
- Read: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Create: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/geo-entity-audit/GEO_ENTITY_MATRIX.xlsx`

- [ ] **Step 1: Import the CSV with `@oai/artifact-tool`**

Use the loader-provided Node.js and packages. Create a temporary builder directory and a `node_modules` junction to the bundled dependency path; do not install packages.

- [ ] **Step 2: Format the workbook**

Create an `Entities` table with filters, frozen header row, wrapped evidence/gap/reason columns, bounded widths, and status/action color rules. Add a compact `Summary` sheet derived from entity/status/action counts.

- [ ] **Step 3: Inspect values and formula errors**

Inspect the Summary and representative entity ranges; scan for `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, and `#N/A`.

- [ ] **Step 4: Render every sheet**

Render `Summary` and `Entities`, visually verify headers, wrapping, filters, colors, and clipping, then make focused repairs.

- [ ] **Step 5: Export one XLSX**

Export only `GEO_ENTITY_MATRIX.xlsx` to the output directory. CSV remains the repository source of truth.

### Task 8: Final verification and handoff

**Files:**
- Verify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`
- Verify: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Verify: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/geo-entity-audit/GEO_ENTITY_MATRIX.xlsx`

- [ ] **Step 1: Run document and CSV validation**

Confirm required sections, exact header, unique IDs, valid enums, source traceability, no placeholder text, no private data, and no broken local links.

- [ ] **Step 2: Confirm scope isolation**

Run:

```powershell
git diff --name-only origin/main...HEAD
git diff --check origin/main...HEAD
```

Expected: only design, plan, audit Markdown, and entity CSV are changed in Git; no production source files.

- [ ] **Step 3: Run repository regression tests**

```powershell
node --test tests/*.test.js
node --test workers/contact-api/test/*.test.mjs
```

Expected: 151 site tests and 13 Worker tests pass.

- [ ] **Step 4: Commit the audit**

```powershell
git add docs/geo-entity/GEO_ENTITY_AUDIT.md docs/geo-entity/GEO_ENTITY_MATRIX.csv
git commit -m "docs: audit GEO entity model"
```

- [ ] **Step 5: Deliver without merging**

Report the branch, commits, evidence limitations, entity/action counts, and exact output paths. Do not push, merge, or modify production without a new instruction.
