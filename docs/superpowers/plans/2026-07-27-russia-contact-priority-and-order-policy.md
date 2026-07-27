# Russia Contact Priority and Order Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Russian horizontal-engine landing page form-first and publish the approved 3-engine sample and 40-engine standard-order policy without changing other markets.

**Architecture:** The landing page owns its contact hierarchy and commercial copy. A single `data-whatsapp-fallback="false"` attribute configures the existing shared form handler to skip the WhatsApp popup for this form, while the default shared behavior remains unchanged elsewhere. Static contract tests cover the page and interaction copy; VM-based form tests cover failure behavior.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner, Cloudflare Worker tests.

---

### Task 1: Lock the approved landing-page contract

**Files:**
- Modify: `tests/russia-horizontal-engine-landing.test.js`
- Modify: `tests/russia-horizontal-engine-interactions.test.js`

- [ ] **Step 1: Replace the old hero and MOQ expectations**

Update the hero contract to require `MOQ 40 шт.` and reject `MOQ 50 шт.`. Require the hero primary action to link to `#quote`, the secondary action to use `mailto:chixiangmotor@163.com`, and reject WhatsApp and WeChat inside the hero.

- [ ] **Step 2: Add the contact-priority and sample-policy assertions**

Require the header to contain only the brand and form action; require the mobile sticky bar to order `#quote` before Email and contain no messenger link. In `.rh-direct-contacts`, require Email before WeChat before the single supplemental WhatsApp link. Require sample copy to contain `от 3 двигателей`, company/professional-buyer qualification, and standard-order copy to contain 40 total engines and mixed models. Reject a 10–30 trial-order tier.

- [ ] **Step 3: Update the page-specific WhatsApp message expectation**

In `tests/russia-horizontal-engine-interactions.test.js`, require the decoded message to contain `MOQ 40`, `Образцы: от 3 двигателей`, company qualification, and quantity context.

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```powershell
node --test tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
```

Expected: failures identifying the current WhatsApp-first hierarchy, `MOQ 50`, and missing 3-engine sample policy.

### Task 2: Lock page-specific form fallback behavior

**Files:**
- Modify: `tests/russia-form.test.js`

- [ ] **Step 1: Let the form test harness read arbitrary data attributes**

Change the fake form's `getAttribute` implementation so it returns values previously stored in `form.attributes`, including `data-whatsapp-fallback`, while preserving the existing `action` and `method` values.

- [ ] **Step 2: Add the opt-out regression test**

Create a network-failure test that sets `data-whatsapp-fallback="false"` and a localized fallback message containing `chixiangmotor@163.com`. Assert that `window.open` is not called, the Email message is shown as an error, the entered requirements remain unchanged, and no Google conversion fires.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
node --test tests/russia-form.test.js
```

Expected: the new opt-out test fails because `js/main.js` still opens WhatsApp unconditionally.

### Task 3: Implement the commercial copy and contact hierarchy

**Files:**
- Modify: `ru/gorizontalnyj-dvigatel.html`
- Modify: `css/russia-horizontal-landing.css`
- Modify: `js/russia-horizontal-landing.js`

- [ ] **Step 1: Update metadata and standard-order copy**

Change the meta description, hero offer, procurement strip, inquiry explanation, quantity help, and every other page reference from a 50-engine MOQ to a 40-engine total standard order. Keep mixed-model language.

- [ ] **Step 2: Publish the qualified sample policy beside the form**

Add inquiry-section copy equivalent to:

```text
Образцы — от 3 двигателей, только для компаний и профессиональных закупщиков.
Серийный заказ — от 40 двигателей в общей партии; можно смешивать модели.
```

Do not add sample copy to the hero and do not publish a 10–30 unit trial tier.

- [ ] **Step 3: Reorder every contact entry point**

Remove WhatsApp from the header and hero. Make the hero form action primary and Email secondary. Replace the hero WeChat shortcut with no messenger shortcut. Change photo guidance to Email or WeChat. Order direct contacts as Email, WeChat, then a subdued WhatsApp link. Change the contact-field label to `Email, WeChat или WhatsApp`. Change mobile sticky actions to inquiry first and Email second.

- [ ] **Step 4: Add the form fallback opt-out and localized message**

Add:

```html
data-whatsapp-fallback="false"
data-message-fallback="Не удалось отправить форму. Напишите нам по Email: chixiangmotor@163.com. Введённые данные сохранены."
```

to the Russian horizontal-engine form.

- [ ] **Step 5: Update page styles**

Replace `.rh-button-whatsapp` with a red `.rh-button-primary`; remove unused header-WhatsApp and hero-WeChat rules; style `.rh-contact-supplemental` with lower visual emphasis; make the mobile grid favor the inquiry button and use red for inquiry with a dark neutral Email action.

- [ ] **Step 6: Update the optional WhatsApp qualification message**

Change `buildWhatsAppUrl` to state `MOQ 40 шт., возможен смешанный заказ.` and `Образцы: от 3 двигателей, только для компаний и профессиональных закупщиков.`

- [ ] **Step 7: Run the landing tests and verify GREEN**

Run:

```powershell
node --test tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
```

Expected: all focused landing tests pass.

### Task 4: Implement the shared fallback opt-out

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add the minimal opt-out helper**

Add a helper equivalent to:

```javascript
function shouldOpenWhatsAppFallback(form) {
  return form.getAttribute('data-whatsapp-fallback') !== 'false';
}
```

Use it before both existing fallback `window.open` calls. When the opt-out is active, show the form's localized fallback message as an error and do not reset the form. Preserve the existing default behavior when the attribute is absent.

- [ ] **Step 2: Run the form tests and verify GREEN**

Run:

```powershell
node --test tests/russia-form.test.js
```

Expected: all form tests pass, including both the new opt-out path and the existing default WhatsApp fallback path.

### Task 5: Verify the complete change and publish a draft PR

**Files:**
- Review: all modified files

- [ ] **Step 1: Run the full website suite**

Run:

```powershell
node --test tests/*.test.js
```

Expected: 0 failures.

- [ ] **Step 2: Run the Worker suite**

Run:

```powershell
node --test workers/contact-api/test/*.test.mjs
```

Expected: 0 failures.

- [ ] **Step 3: Review the exact diff and requirements**

Confirm the diff changes only the approved page, page stylesheet/script, shared fallback gate, tests, and design/plan documents. Search the page for stale `MOQ 50`, primary WhatsApp actions, trial-order copy, and unintended URL or analytics changes.

- [ ] **Step 4: Commit intentionally**

Stage only the scoped files and commit:

```powershell
git commit -m "prioritize Russia inquiry form and update MOQ"
```

- [ ] **Step 5: Push and open a draft PR**

Push `agent/russia-contact-moq-policy` to `origin` and open a draft PR targeting `main`. The PR body must describe contact ordering, failure behavior, order policy, test evidence, and rollback by reverting the PR.
