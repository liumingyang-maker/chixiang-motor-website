# Chixiang Motor Phase 6.1A Fact Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce two evidence-prefilled, approval-controlled fact sources and two review workbooks for Chixiang company facts and engine specifications without modifying the production website.

**Architecture:** Keep version-controlled CSV files as the only source of truth, document governance rules in one Markdown guide, and generate two formatted XLSX review copies from those CSVs with `@oai/artifact-tool`. Existing website and audit values are preserved as source-labelled observations; unresolved values remain blank and cannot become approved public facts.

**Tech Stack:** Static HTML/JavaScript repository, Markdown, UTF-8 RFC 4180 CSV, PowerShell and Node.js for extraction/validation, `@oai/artifact-tool` for XLSX generation and visual verification.

---

### Task 1: Confirm the Phase 6.1A baseline and isolation

**Files:**
- Reference: `docs/superpowers/specs/2026-07-29-geo-fact-calibration-design.md`
- Reference: `docs/geo-entity/GEO_ENTITY_AUDIT.md`
- Reference: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`

- [ ] **Step 1: Confirm branch and clean worktree**

Run:

```powershell
git branch --show-current
git status --short
git rev-parse HEAD
```

Expected: branch is `docs/geo-fact-calibration`, worktree output is empty, and HEAD contains the approved design.

- [ ] **Step 2: Record the Phase 6.1A comparison base**

Run:

```powershell
git merge-base HEAD edb6fbd73980bde014e216b66b74625e78623353
```

Expected: `edb6fbd73980bde014e216b66b74625e78623353`. All final scope checks for this phase compare against that Phase 6.0 audit HEAD.

- [ ] **Step 3: Verify repository baseline tests**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$siteTests = Get-ChildItem tests -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName
& $node --test $siteTests
$workerTests = Get-ChildItem workers\contact-api\test -Filter '*.test.mjs' -File | Select-Object -ExpandProperty FullName
& $node --test $workerTests
```

Expected: 151 site tests and 13 Worker tests pass.

### Task 2: Scaffold the fact-source files and governance guide

**Files:**
- Create: `docs/geo-entity/fact-calibration/FACT_CALIBRATION_GUIDE.md`
- Create: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Create: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Create the guide skeleton**

Create these sections:

```markdown
# Chixiang Motor 事实校准审核指南

## 使用范围
## 事实源与优先级
## 证据状态
## 批准状态
## 公司事实审核责任
## 发动机规格审核责任
## 公开条件
## 私密证据处理
## 回写与版本管理
## Phase 6.1B 进入条件
```

The guide must state that CSV is authoritative, XLSX is a review copy, and no workbook approval is effective until written back to CSV.

- [ ] **Step 2: Write the exact Company CSV header**

Use exactly:

```text
fact_id,category,field_name_zh,field_name_en,current_website_value,other_source_values,candidate_master_value,approved_public_wording_zh,approved_public_wording_en,evidence_status,approval_status,visibility,evidence_sources,conflict_summary,affected_pages,review_owner_role,approved_by,approved_date,last_verified,notes
```

- [ ] **Step 3: Write the exact Engine CSV header**

Use exactly:

```text
spec_id,record_scope,family,model_code,marketing_name,aliases,configuration,nominal_displacement_cc,actual_displacement_cc,bore_mm,stroke_mm,cooling,start_method,clutch,gear_pattern,reverse_configuration,ignition,applications,fit_limitations,oem_options,current_website_values,candidate_master_values,evidence_status,approval_status,visibility,evidence_sources,conflict_summary,affected_pages,review_owner_role,approved_by,approved_date,last_verified,notes
```

- [ ] **Step 4: Validate the empty schemas**

Run:

```powershell
$company = Get-Content docs\geo-entity\fact-calibration\COMPANY_FACT_PACK.csv -First 1
$engine = Get-Content docs\geo-entity\fact-calibration\ENGINE_SPEC_MASTER.csv -First 1
if (($company -split ',').Count -ne 20) { throw 'Company schema must contain 20 columns' }
if (($engine -split ',').Count -ne 33) { throw 'Engine schema must contain 33 columns' }
```

Expected: exit code 0.

- [ ] **Step 5: Commit the scaffold**

```powershell
git add docs/geo-entity/fact-calibration
git commit -m "docs: scaffold GEO fact calibration packs"
```

### Task 3: Prefill the Company Fact Pack

**Files:**
- Read: `en/index.html`
- Read: `en/about.html`
- Read: `es/about.html`
- Read: `pt/about.html`
- Read: `ru/about.html`
- Read: `ar/about.html`
- Read: `docs/geo-entity/GEO_ENTITY_AUDIT.md`
- Read: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Modify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`

- [ ] **Step 1: Add identity and history records**

Use these stable IDs:

```text
identity-legal-name-zh
identity-legal-name-en
identity-brand-name
identity-brand-aliases
history-founded-year
```

Set `approval_status=PENDING_REVIEW`. Preserve 2003 and 2007 as source-labelled conflicting observations; leave the approved candidate and public wording blank.

- [ ] **Step 2: Add address and facility records**

Use:

```text
address-registered
address-factory
facility-area-square-meters
facility-employee-count
capacity-monthly-engines
quality-first-pass-yield
export-country-count
```

Keep Hangu Town, Gaoteng Avenue, Jiuli Village and Baishiyi Town in their source-labelled fields. Do not choose an address.

- [ ] **Step 3: Add certification records**

Use:

```text
certification-iso-9001
certification-ccc
```

Record current website wording and affected pages. Do not enter a certificate number, validity date or approved wording unless present in a traceable source.

- [ ] **Step 4: Add capability records**

Use:

```text
capability-oem-odm
capability-research-development
capability-testing
capability-mixed-model-orders
capability-engine-parts-support
```

Separate website presence from independently verified capability. Site-visible claims may be `SUPPORTED`; they are not automatically `APPROVED_PUBLIC` in this pack.

- [ ] **Step 5: Add brand assets, contacts, and profile-copy records**

Use:

```text
asset-official-logo
contact-official-website
contact-sales-email
contact-business-phone
profile-approved-short
profile-approved-long
```

Reference `repo:images/logo.webp` and record the missing `/images/logo.png` Schema reference as a conflict. Do not add private contacts.

- [ ] **Step 6: Validate Company rows**

Run:

```powershell
$rows = Import-Csv docs\geo-entity\fact-calibration\COMPANY_FACT_PACK.csv
if ($rows.Count -ne 25) { throw "Expected 25 company facts, got $($rows.Count)" }
if (($rows | Group-Object fact_id | Where-Object Count -gt 1).Count) { throw 'Duplicate company fact_id' }
if (($rows | Where-Object approval_status -ne 'PENDING_REVIEW').Count) { throw 'Initial company approvals must remain pending' }
if (($rows | Where-Object { $_.evidence_status -notin @('VERIFIED','SUPPORTED','CONFLICTING','UNKNOWN') }).Count) { throw 'Invalid company evidence status' }
```

Expected: 25 records, no duplicate IDs, and all approval states pending.

- [ ] **Step 7: Commit Company prefill**

```powershell
git add docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv
git commit -m "docs: prefill company fact pack"
```

### Task 4: Prefill the Engine Specification Master

**Files:**
- Read: `en/cg-engine.html`
- Read: `en/cb-engine.html`
- Read: `en/horizontal-engine.html`
- Read: `ru/gorizontalnyj-dvigatel.html`
- Read: `js/latam-cg-products.js`
- Read: `js/latam-cg-peru-data.js`
- Read: `js/latam-cg-colombia-data.js`
- Read: `js/central-asia-data.js`
- Read: `docs/geo-entity/GEO_ENTITY_MATRIX.csv`
- Modify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Add the 17 audited model records**

Add `MODEL` rows for:

```text
AC320 / 175MN
CG125
CG150
CG175
CG200
CG250
CG150SB
CG175SB
CG200SB
CG250SB
CB150
CB200-C
CB250
152FMH
153FMI
154FMI
1P56FMJ
```

Use stable IDs derived from the Phase 6.0 entity IDs. All approval states remain `PENDING_REVIEW`.

- [ ] **Step 2: Add family-intake records**

Add `FAMILY_INTAKE` rows for:

```text
CG balance-shaft family
Tsunami water-cooled family
Hanwei / HW heavy-duty water-cooled family
Horizontal automatic-clutch family
```

Leave `model_code` and numeric specification fields empty. These rows exist to request confirmed model/configuration data and cannot become `APPROVED_PUBLIC`.

- [ ] **Step 3: Preserve conflicting values**

For 152FMH and the Horizontal range, store every page-specific statement in `current_website_values` as `source=value`. Do the same for `CG150B` versus `CG150SB`, Hanwei/HW naming, and reverse-configuration wording.

Do not infer:

- displacement from model code;
- bore or stroke from displacement;
- fitment from market-page examples;
- reverse, clutch, or starter configuration from images;
- aliases such as YX110 or YX140 without Chixiang evidence.

- [ ] **Step 4: Populate evidence and affected pages**

Every non-empty specification must cite a production URL or `repo:` path. `affected_pages` must identify the pages that will need later reconciliation.

- [ ] **Step 5: Validate Engine rows**

Run:

```powershell
$rows = Import-Csv docs\geo-entity\fact-calibration\ENGINE_SPEC_MASTER.csv
if ($rows.Count -ne 21) { throw "Expected 21 engine records, got $($rows.Count)" }
if (($rows | Group-Object spec_id | Where-Object Count -gt 1).Count) { throw 'Duplicate engine spec_id' }
if (($rows | Where-Object record_scope -notin @('MODEL','CONFIGURATION','FAMILY_INTAKE')).Count) { throw 'Invalid record_scope' }
if (($rows | Where-Object approval_status -ne 'PENDING_REVIEW').Count) { throw 'Initial engine approvals must remain pending' }
if (($rows | Where-Object { $_.record_scope -eq 'FAMILY_INTAKE' -and $_.model_code }).Count) { throw 'Family intake rows cannot invent model codes' }
$numeric = @('nominal_displacement_cc','actual_displacement_cc','bore_mm','stroke_mm')
foreach ($row in $rows) {
  foreach ($field in $numeric) {
    if ($row.$field -and $row.$field -notmatch '^\d+(\.\d+)?$') { throw "Invalid numeric value $($row.spec_id).$field" }
  }
}
```

Expected: 21 records, unique IDs, legal scopes, pending approvals, and valid numeric values.

- [ ] **Step 6: Commit Engine prefill**

```powershell
git add docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv
git commit -m "docs: prefill engine specification master"
```

### Task 5: Complete the calibration guide and cross-file rules

**Files:**
- Modify: `docs/geo-entity/fact-calibration/FACT_CALIBRATION_GUIDE.md`
- Verify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Verify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Document the source hierarchy**

Use this order:

1. approved company/factory document referenced by controlled evidence ID;
2. approved factory specification record;
3. current production page and matching repository source;
4. Phase 6.0 audit and frozen research evidence;
5. citeable public third-party source;
6. unsupported inference, which remains `UNKNOWN` and cannot be approved.

- [ ] **Step 2: Document the approval workflow**

Assign company facts to company management, product specifications to factory technical review, and commercial policy to sales management. Explain that blank approver/date fields are intentional pending-review fields, not missing implementation.

- [ ] **Step 3: Document public-release rules**

State that `APPROVED_PUBLIC` requires a master value, evidence, approver and approval date; `APPROVED_INTERNAL_ONLY` cannot enter web content; `FAMILY_INTAKE` cannot publish model-specific specifications.

- [ ] **Step 4: Document the Phase 6.1B handoff**

The next plan may only select facts with `APPROVED_PUBLIC`. It must produce a page-by-page change map before modifying `/en/about`, `/en/horizontal-engine`, `/en/`, `/en/cg-engine`, `/en/products`, or market pages.

- [ ] **Step 5: Scan for placeholders and private data**

Run:

```powershell
rg -n '\b(TODO|TBD|FIXME|PLACEHOLDER)\b' docs/geo-entity/fact-calibration
rg -n '-----BEGIN [A-Z ]+PRIVATE KEY-----|(?i)(password|secret|api[_-]?key)\s*[:=]' docs/geo-entity/fact-calibration
```

Expected: no matches. Empty approval fields are governed fields and must not be replaced by placeholder text.

- [ ] **Step 6: Commit the completed guide**

```powershell
git add docs/geo-entity/fact-calibration/FACT_CALIBRATION_GUIDE.md
git commit -m "docs: define fact calibration workflow"
```

### Task 6: Run full fact-source validation

**Files:**
- Verify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Verify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Validate exact headers, IDs, enums and dates**

Use `Import-Csv` to compare the two exact header arrays from Task 2, check unique IDs, and limit evidence/approval/scope values to the design enums. Dates, when present, must match `YYYY-MM-DD`.

- [ ] **Step 2: Enforce approval invariants**

For any future row marked `APPROVED_PUBLIC`, require:

```text
candidate_master_value or candidate_master_values
evidence_sources
approved_by
approved_date
```

Reject `APPROVED_PUBLIC` when evidence is `CONFLICTING` or `UNKNOWN`, and reject it for `FAMILY_INTAKE`.

- [ ] **Step 3: Validate evidence paths and URLs**

For each `repo:` source, confirm the local path exists. For Chixiang URLs, require `https://chixiangmotor.com/` and reject `www`. External public URLs may remain only when already recorded by the Phase 6.0 audit.

- [ ] **Step 4: Reconcile record totals**

Expected:

```text
Company facts: 25
Engine records: 21
Engine MODEL rows: 17
Engine FAMILY_INTAKE rows: 4
APPROVED_PUBLIC: 0
PENDING_REVIEW: 46
```

### Task 7: Build the two review workbooks

**Files:**
- Read: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Read: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`
- Create: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-fact-calibration/COMPANY_FACT_PACK.xlsx`
- Create: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-fact-calibration/ENGINE_SPEC_MASTER.xlsx`

- [ ] **Step 1: Load the bundled workspace dependencies**

Call `codex_app__load_workspace_dependencies`, then use only its Node executable, `node_modules`, and `@oai/artifact-tool`. Read the spreadsheet skill, `style_guidelines.md`, complete `API_QUICK_START.md`, and marketing/advertising domain guidance before authoring.

- [ ] **Step 2: Create one temporary builder**

Create:

```text
C:/Users/97020/AppData/Local/Temp/codex-geo-fact-calibration/build_fact_calibration_workbooks.mjs
```

The builder must:

1. import both CSV files with `Workbook.fromCSV`;
2. create separate workbooks;
3. add the six Chinese sheets defined in the design;
4. populate the main table from CSV;
5. derive conflict/evidence/status sheets from the main rows;
6. use formulas for status counts;
7. freeze headers, enable filters, wrap long evidence text, and apply restrained status colors;
8. recalculate;
9. export with `SpreadsheetFile.exportXlsx`;
10. render every sheet to temporary PNG previews.

- [ ] **Step 3: Build Company workbook**

Use these sheet names exactly:

```text
审核说明
公司事实
冲突清单
证据登记
状态汇总
字段字典
```

Summary formulas must reconcile to 25 facts and show evidence/approval counts.

- [ ] **Step 4: Build Engine workbook**

Use these sheet names exactly:

```text
审核说明
发动机规格
冲突清单
证据登记
状态汇总
字段字典
```

Summary formulas must reconcile to 21 records, 17 `MODEL`, 4 `FAMILY_INTAKE`, and zero approved-public records.

- [ ] **Step 5: Keep only final XLSX files in the output directory**

Temporary previews, builders and inspection output stay under the temporary working directory. Do not export alternate workbook versions.

### Task 8: Verify both workbooks

**Files:**
- Verify: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-fact-calibration/COMPANY_FACT_PACK.xlsx`
- Verify: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-fact-calibration/ENGINE_SPEC_MASTER.xlsx`

- [ ] **Step 1: Re-import each XLSX**

Use `SpreadsheetFile.importXlsx(await FileBlob.load(path))`. Confirm exact sheet order, used ranges, expected row counts and formula counts.

- [ ] **Step 2: Scan formula errors**

Inspect workbook values for:

```text
#REF!
#DIV/0!
#VALUE!
#NAME?
#N/A
```

Expected: zero matches.

- [ ] **Step 3: Visually inspect every sheet**

Render all 12 sheets. Verify titles, filters, frozen headers, wrapped evidence, status colors, row heights, column widths, Chinese text and absence of clipping. Make focused builder repairs and regenerate both workbooks if any severe defect exists.

- [ ] **Step 4: Verify XLSX file signatures**

Confirm both files begin with ZIP magic `50 4B 03 04`, not PNG bytes, and can be parsed as valid XLSX packages.

### Task 9: Final repository and production-safety verification

**Files:**
- Verify: `docs/superpowers/specs/2026-07-29-geo-fact-calibration-design.md`
- Verify: `docs/superpowers/plans/2026-07-29-geo-fact-calibration.md`
- Verify: `docs/geo-entity/fact-calibration/FACT_CALIBRATION_GUIDE.md`
- Verify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Verify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: Run final CSV and workbook validation**

Repeat Task 6 and Task 8 after the final data or formatting change. Do not rely on an earlier run.

- [ ] **Step 2: Confirm phase scope**

Run:

```powershell
git diff --name-only edb6fbd73980bde014e216b66b74625e78623353...HEAD
git diff --check edb6fbd73980bde014e216b66b74625e78623353...HEAD
```

Expected tracked changes are limited to the Phase 6.1A design, plan, guide and two CSV fact sources. No HTML, CSS, JavaScript, Worker, Schema, Sitemap, robots, advertising or analytics file may change.

- [ ] **Step 3: Run full repository regression tests**

Run the exact 151-site-test and 13-Worker-test commands from Task 1.

- [ ] **Step 4: Commit any final fact-source corrections**

```powershell
git add docs/geo-entity/fact-calibration docs/superpowers/specs/2026-07-29-geo-fact-calibration-design.md docs/superpowers/plans/2026-07-29-geo-fact-calibration.md
git commit -m "docs: finalize GEO fact calibration packs"
```

If there are no changes after verification, do not create an empty commit.

- [ ] **Step 5: Deliver without publishing**

Report branch, commits, record counts, unresolved conflict counts, validation evidence and exact output locations. Do not push, create a PR, merge or modify production without a new user instruction.
