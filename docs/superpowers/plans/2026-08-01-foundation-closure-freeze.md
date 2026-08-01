# Foundation Closure and Freeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the current SEO/GEO/conversion foundation with reproducible tests, record the final source-of-truth hierarchy, and freeze protected infrastructure before visual redesign begins.

**Architecture:** Keep the production website architecture unchanged. Repair only the cross-platform idempotency defect found in the site-entity generator, then add governance documentation and an automated policy contract that identifies the current baseline, protected surfaces, allowed visual work, and the exception process for future Foundation changes.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Cloudflare Workers/Pages, Markdown governance documents.

---

### Task 1: Make the entity generator reproducible on a fresh Windows checkout

**Files:**
- Modify: `scripts/apply-site-entity-schema.js`
- Test: `tests/multilingual-contact-procurement-owner-pages.test.js`

- [x] **Step 1: Reproduce the existing failure**

Run from a fresh worktree created from merge commit `08c446ead90db58e00a71095d5ba1f71756d1c7f`:

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js
```

Expected before the fix: FAIL at `site entity generator remains idempotent after Contact owner generation`, reporting 41 canonical pages as unsynchronized.

- [x] **Step 2: Preserve each file's newline convention**

In `updatePage`, detect CRLF versus LF from the source file and normalize the final generated result to that convention before comparing hashes or writing.

- [x] **Step 3: Verify the regression test**

```powershell
node --test tests/multilingual-contact-procurement-owner-pages.test.js
```

Expected: 11 passed, 0 failed, and no HTML files modified.

### Task 2: Define the Foundation freeze contract

**Files:**
- Create: `AGENTS.md`
- Create: `tests/foundation-freeze-governance.test.js`

- [x] **Step 1: Write the failing governance contract**

The test must require:

- a root `AGENTS.md` declaring `FOUNDATION_STATUS: FROZEN`;
- protected URL, SEO, form, Worker, tracking, and entity-ID surfaces;
- visual redesign permission with explicit preservation requirements;
- an exception rule requiring explicit user approval and a separate PR.

- [x] **Step 2: Run the contract and confirm it fails**

```powershell
node --test tests/foundation-freeze-governance.test.js
```

Expected: FAIL because the freeze instructions and closure report do not yet exist.

- [x] **Step 3: Add the project-specific Foundation guardrails**

Create `AGENTS.md` without changing production runtime files. It must make visual work the normal next phase while preventing accidental changes to canonical routing, Sitemap, robots, tracking, form success semantics, Worker delivery, or stable Schema IDs.

### Task 3: Publish one current closure baseline and supersede stale audit status

**Files:**
- Create: `docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md`
- Modify: `docs/geo-entity/GEO_ENTITY_AUDIT.md`
- Test: `tests/foundation-freeze-governance.test.js`

- [x] **Step 1: Record the verified production baseline**

Document PR #26 merge commit, single-hop domain redirects, robots/Sitemap status, the 51 canonical URLs, five production Contact routes, test counts, and the no-side-effect production smoke check.

- [x] **Step 2: Record the source-of-truth order**

The active order must be:

1. `FOUNDATION_CLOSURE_AND_FREEZE.md` for phase status and protected boundaries;
2. Company and engine fact-calibration CSV files for publishable facts;
3. the 51-page change matrix and entity manifest for URL ownership;
4. the landing-page standard for future page work;
5. the 2026-07-29 GEO audit/matrix as historical discovery evidence only.

- [x] **Step 3: Record deliberate exclusions and non-blocking observations**

Keep exact 152FMH actual displacement/bore/stroke unpublished, keep commerce/review Schema absent without evidence, and classify Lighthouse field data plus GSC/Yandex recrawl as observation work rather than Foundation development.

- [x] **Step 4: Mark GEO Entity Audit v1.0 as historical**

Add a prominent status notice at the top of `GEO_ENTITY_AUDIT.md` pointing to the closure document. Do not rewrite or erase the original audit evidence.

### Task 4: Verify and publish the closure PR

**Files:**
- Verify all files changed by Tasks 1-3.

- [x] **Step 1: Run targeted governance and generator tests**

```powershell
node --test tests/foundation-freeze-governance.test.js tests/multilingual-contact-procurement-owner-pages.test.js tests/site-entity-navigation-schema.test.js
```

Expected: all targeted tests pass.

- [x] **Step 2: Run the complete site and Worker suites**

```powershell
$siteTests = Get-ChildItem tests -Filter '*.test.js' | ForEach-Object FullName
node --test $siteTests
$workerTests = Get-ChildItem workers/contact-api/test -Filter '*.test.mjs' | ForEach-Object FullName
node --test $workerTests
```

Expected: 0 failures.

- [x] **Step 3: Verify scope and generator drift**

```powershell
node scripts/apply-contact-procurement-owner-content.js --check
node scripts/apply-site-entity-schema.js --check
git diff --check
git status --short
```

Expected: both generators report 0 updates, `git diff --check` exits 0, and only the intended generator, governance, test, plan, and closure files are modified.

- [ ] **Step 4: Commit, push, and open a draft PR**

Commit message:

```text
docs: close and freeze website foundation
```

Open a draft PR into `main`. Do not merge it without an explicit user instruction.
