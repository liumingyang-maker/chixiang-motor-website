# Russia Horizontal CX/YX Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CHIXIANG 卧式发动机统一为五个 CX 正式型号，同时在俄文页面自然显示 YX 市场检索别名，并保持未经工厂确认的实际排量、缸径和行程不公开。

**Architecture:** `ENGINE_SPEC_MASTER.csv` 是公开事实的唯一主表，新增的规格确认表负责隔离仍缺证据的数值。俄文落地页承担俄罗斯 B2B 搜索与询盘转化，英文 Owner 页承担产品家族解释；两页只发布同一组已批准事实，表单仍提交 CX 正式型号。现有静态 HTML、CSS、JavaScript、Worker 和转化回调保持原架构。

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, CSV fact governance, Git/GitHub, Cloudflare Pages

---

### Task 1: Lock the approved fact contract with failing tests

**Files:**
- Modify: `tests/geo-fact-governance.test.js`
- Modify: `tests/russia-horizontal-engine-landing.test.js`
- Modify: `tests/russia-horizontal-engine-interactions.test.js`

- [ ] **Step 1: Add fact-governance assertions for all five CX models**

Add assertions that `model-152fmh`, `model-153fmi`, `model-154fmi`, `model-1p56fmj`, and `model-1p60fmj` use official CX codes, contain the approved YX aliases, remain `APPROVED_PUBLIC`, and keep `actual_displacement_cc`, `bore_mm`, and `stroke_mm` empty. Assert the 150 cooling text contains an internal cylinder-head oil circuit and explicitly excludes an external radiator.

- [ ] **Step 2: Add landing-page assertions for the five-card contract**

Require these exact official and market-reference pairs:

```text
CX152FMH — YX152FMH / YX110-class
CX153FMI — YX153FMI / YX125-class
CX154FMI — YX154FMI / YX125-class
CX1P56FMJ — YX1P56FMJ / YX140-class
CX1P60FMJ — YX1P60FMJ / YX150-class / W150-2
```

Require five product cards, five desktop comparison columns, five mobile comparison entries, and five CX form values. Assert that the page contains the unified YX disclaimer, publishes nominal 110/125/140/150 cm³ classes only, and does not publish the old `CX152FMH-5B`, `CX152FMH-6`, actual displacement, bore, or stroke values.

- [ ] **Step 3: Add configuration semantics assertions**

Require separate visible rows for `Способ запуска` and `Положение электростартера`, kick/electric availability for every model, upper/lower position only for electric start, approved clutch rules, 4-speed standard gear count, and supplemental reverse/1+1 availability across 110/125/140/150 classes. Assert 152 is not described as automatic clutch and 150 is not described or pictured with an external oil radiator.

- [ ] **Step 4: Add interaction assertions for CX form values**

Update selection tests so `selectModel('CX1P60FMJ')` selects and serializes the new official code, mixed selections de-duplicate CX codes, and unknown bare or competitor-only codes do not alter the form.

- [ ] **Step 5: Run the focused tests and verify the new contract fails**

Run:

```powershell
node --test tests/geo-fact-governance.test.js tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
```

Expected: FAIL because the CSV and pages still use four bare model codes, 152 still says automatic clutch, and 150 is absent.

- [ ] **Step 6: Commit the failing contract**

```powershell
git add tests/geo-fact-governance.test.js tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
git commit -m "test: define CX and YX horizontal model contract"
```

### Task 2: Establish the horizontal-engine fact source

**Files:**
- Modify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`
- Create: `docs/geo-entity/fact-calibration/HORIZONTAL_ENGINE_SPEC_CONFIRMATION.csv`
- Test: `tests/geo-fact-governance.test.js`

- [ ] **Step 1: Replace the four existing horizontal model records**

Set official model codes to `CX152FMH`, `CX153FMI`, `CX154FMI`, and `CX1P56FMJ`; add the approved YX market aliases; split start method from electric-starter position in the configuration text; apply the approved clutch rules; set four standard gears; and document built-in reverse plus 1+1 as optional supplemental configurations. Promote 152 to `APPROVED_PUBLIC` based on `owner-confirmation:2026-07-30` while leaving the three evidence-gated numeric fields empty.

- [ ] **Step 2: Add the 150 model record**

Create `model-1p60fmj` with official code `CX1P60FMJ`, aliases `YX1P60FMJ | YX150-class | W150-2`, nominal class 150, air cooling with an internal cylinder-head oil circuit, no external oil radiator, kick/electric start, upper/lower electric-starter position, manual/semi-automatic clutch, four standard gears, and supplemental reverse/1+1 options. Keep actual displacement, bore, and stroke empty.

- [ ] **Step 3: Create the evidence-gated confirmation sheet**

Create a five-row CSV with these columns:

```text
official_model,market_reference_names,nominal_displacement_cc,actual_displacement_cc,bore_mm,stroke_mm,cooling,start_method,electric_starter_position,clutch,standard_gears,reverse_options,evidence_source,owner_confirmation_status,public_status,notes
```

Set all three numeric measurement columns empty and use `BLOCKED_EVIDENCE` until a CHIXIANG nameplate, drawing, factory specification, or measurement record is available. Do not copy Yinxiang, Zongshen, or Russian retailer measurements into CHIXIANG fields.

- [ ] **Step 4: Run the fact-governance tests**

```powershell
node --test tests/geo-fact-governance.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the governed facts**

```powershell
git add docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv docs/geo-entity/fact-calibration/HORIZONTAL_ENGINE_SPEC_CONFIRMATION.csv
git commit -m "docs: govern five CX horizontal engine models"
```

### Task 3: Align the Russian B2B landing page

**Files:**
- Modify: `ru/gorizontalnyj-dvigatel.html`
- Modify: `css/russia-horizontal-landing.css`
- Test: `tests/russia-horizontal-engine-landing.test.js`
- Test: `tests/russia-horizontal-engine-interactions.test.js`

- [ ] **Step 1: Update SEO and hero copy**

Update title, description, keywords, and hero description to cover nominal 110/125/140/150 classes and the five CX models. Keep the existing B2B offer, price, MOQ, mixed-order wording, form-first contact order, canonical URL, Google tag, Yandex tag, and one H1 unchanged in behavior.

- [ ] **Step 2: Replace the product grid with five governed cards**

Each card must show the CX model first, a short YX market reference second, nominal class, cooling, kick/electric start, upper/lower position only for electric starter, approved clutch, four gears, and its existing inquiry button. Add `CX1P60FMJ` as the fifth card using a verified local horizontal-engine image without an external oil radiator and label it as a representative configuration image rather than an unverified exact product photograph.

- [ ] **Step 3: Add one unified YX market-reference notice**

Display exactly:

```text
Обозначения YX приведены как привычные российскому рынку названия класса и ориентиры для подбора. Двигатели серии CX производит CHIXIANG MOTOR.
```

Do not describe YX or Yinxiang as the product brand or manufacturer.

- [ ] **Step 4: Correct supplemental configuration copy**

Explain that all nominal classes can use kick or electric start; upper/lower applies only to electric-starter placement. Present built-in reverse and 1+1 as supplemental options for 110/125/140/150, not hero claims. Remove the generic pre-order compatibility sentence the owner rejected.

- [ ] **Step 5: Expand desktop, mobile, and form model lists**

Use five CX model columns/cards and CX codes as checkbox values. Keep YX aliases visible in labels only, ensuring the Worker and sales email receive official CX model codes.

- [ ] **Step 6: Adjust card typography only where required**

Add CSS for the market-reference line and five-card content wrapping. Preserve the current two-column desktop and one-column mobile visual system; do not redesign the page.

- [ ] **Step 7: Run the Russian page and interaction tests**

```powershell
node --test tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit the Russian landing-page alignment**

```powershell
git add ru/gorizontalnyj-dvigatel.html css/russia-horizontal-landing.css tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
git commit -m "feat: align Russia landing page to CX and YX models"
```

### Task 4: Align the English horizontal-engine Owner page

**Files:**
- Modify: `en/horizontal-engine.html`
- Create: `tests/horizontal-engine-owner-page.test.js`

- [ ] **Step 1: Write an English Owner-page contract test**

Require the page to describe the five official CX models and nominal classes, separate start method from electric-starter position, publish approved clutch and cooling facts, and keep actual displacement/bore/stroke absent. Assert the old conflicting `CX152FMH-5B`, `CX152FMH-6`, `106.7`, `107`, `123.67`, `52.4 x 49.5`, and `54 x 54` values are gone.

- [ ] **Step 2: Run the test and verify it fails**

```powershell
node --test tests/horizontal-engine-owner-page.test.js
```

Expected: FAIL because the current English table still publishes conflicting legacy numeric rows.

- [ ] **Step 3: Replace the legacy specification table**

Publish a fact-safe five-model comparison using nominal class, cooling, start method, electric-starter position, clutch, standard gears, and supplemental reverse options. Do not publish YX as the official model or manufacturer; explain it once as a Russian market-reference convention.

- [ ] **Step 4: Update English SEO and family copy**

Change the outdated 50–125 cc scope to 110–150 cc and describe distributor/OEM applications without adding unsupported fit guarantees, actual measurements, price, MOQ, or shipping promises.

- [ ] **Step 5: Run the English Owner-page test**

```powershell
node --test tests/horizontal-engine-owner-page.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the English Owner-page alignment**

```powershell
git add en/horizontal-engine.html tests/horizontal-engine-owner-page.test.js
git commit -m "feat: align horizontal engine owner page facts"
```

### Task 5: Regression and visual verification

**Files:**
- Modify only if verification exposes a scoped defect in the files listed above
- Generate locally: `outputs/russia-horizontal-cx-yx/desktop.png`
- Generate locally: `outputs/russia-horizontal-cx-yx/mobile-390.png`
- Generate locally: `outputs/russia-horizontal-cx-yx/tablet-768.png`

- [ ] **Step 1: Run all website tests**

```powershell
node --test tests/*.test.js
```

Expected: all tests PASS.

- [ ] **Step 2: Run Worker regression tests**

```powershell
node --test workers/contact-api/test/contact-handler.test.mjs
```

Expected: 13/13 tests PASS, confirming the contact endpoint and success-only conversion contract remain unchanged.

- [ ] **Step 3: Serve the site locally**

```powershell
python -m http.server 8123
```

Open `http://127.0.0.1:8123/ru/gorizontalnyj-dvigatel` and `http://127.0.0.1:8123/en/horizontal-engine`.

- [ ] **Step 4: Capture and inspect target viewports**

Verify desktop, 390×844, 768×1024, and 1024×1366. Confirm no horizontal overflow, truncated CX/YX labels, button collision, table clipping without scroll affordance, or form regression. Save the three representative Russian-page screenshots under `outputs/russia-horizontal-cx-yx/`; keep generated screenshots uncommitted.

- [ ] **Step 5: Validate public fact boundaries**

Search the two public pages for legacy suffixes and blocked measurements:

```powershell
rg -n "CX152FMH-5B|CX152FMH-6|106\.7|123\.67|52\.4 x 49\.5|54 x 54|external oil radiator|внешн.*радиатор" en/horizontal-engine.html ru/gorizontalnyj-dvigatel.html
```

Expected: no legacy or blocked measurement matches; the only external-radiator reference permitted is the explicit Russian statement that the 150 version has none.

- [ ] **Step 6: Commit any verification-only fixes**

If scoped defects were found, stage only the affected project files and commit:

```powershell
git commit -m "fix: polish CX horizontal model presentation"
```

If no defects were found, do not create an empty commit.

### Task 6: Publish, merge, deploy, and verify production

**Files:**
- No additional source files expected

- [ ] **Step 1: Review the exact diff and working tree**

```powershell
git status --short
git diff --check
git diff origin/main...HEAD --stat
```

Expected: only planned files are committed; existing unrelated `PRODUCTION_ACCEPTANCE_FINAL_REPORT.md` and `outputs/` remain untracked and untouched.

- [ ] **Step 2: Push the feature branch**

```powershell
git push -u origin feature/russia-horizontal-cx-yx-models
```

Expected: branch is available on GitHub.

- [ ] **Step 3: Create and merge the Pull Request**

Create a PR summarizing fact governance, page changes, tests, blocked numeric data, and rollback. Merge only after repository checks pass; do not force-merge failing checks.

- [ ] **Step 4: Monitor the main-branch deployment**

Wait for the GitHub/Cloudflare production deployment associated with the merge commit. Do not purge all Cloudflare cache unless the deployed HTML demonstrably remains stale.

- [ ] **Step 5: Verify production**

Check:

```text
https://chixiangmotor.com/ru/gorizontalnyj-dvigatel
https://chixiangmotor.com/en/horizontal-engine
```

Confirm HTTP 200, self-canonical URLs, five CX models, visible YX references, no blocked measurements, intact form endpoint, and unchanged Google/Yandex tags. Report the PR, merge commit, production URLs, test counts, and any asynchronous deployment caveat.
