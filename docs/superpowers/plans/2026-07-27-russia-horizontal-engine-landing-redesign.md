# Russia Horizontal Engine Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/ru/gorizontalnyj-dvigatel.html` as a responsive Russian B2B horizontal-engine landing page with qualified WhatsApp and same-page inquiry paths.

**Architecture:** Replace the page’s inline presentation with one semantic HTML document, one page-scoped stylesheet, and one small page-scoped interaction module. Reuse the existing shared `/api/contact` form initializer, Turnstile, Google conversion helper, Yandex Metrica helper, and Worker contract without modifying shared production behavior.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, existing Cloudflare Pages/Worker infrastructure.

---

## File map

- Modify `ru/gorizontalnyj-dvigatel.html`: semantic page shell, B2B copy, products, factory proof, comparison, contact channels, and real inquiry form.
- Create `css/russia-horizontal-landing.css`: page-scoped desktop/tablet/mobile styles and reduced-motion behavior.
- Create `js/russia-horizontal-landing.js`: product-to-form selection, multi-model serialization, form model validation, and contextual WhatsApp links.
- Create `tests/russia-horizontal-engine-landing.test.js`: SEO, content, analytics, assets, form, responsive, and integration contracts.
- Create `tests/russia-horizontal-engine-interactions.test.js`: deterministic tests for the page-scoped interaction helpers.
- Create `images/russia-horizontal-hero-desktop.webp`: supplied 1672×941 landscape hero artwork.
- Create `images/russia-horizontal-hero-mobile.webp`: supplied 1030×1526 portrait hero artwork.
- Preserve `sitemap.xml`, `_redirects`, `robots.txt`, `js/main.js`, and `workers/contact-api/**`.

### Task 1: Define the page contract

**Files:**
- Create: `tests/russia-horizontal-engine-landing.test.js`

- [ ] **Step 1: Write the failing page contract**

Create a Node test that reads the planned HTML, CSS, and JavaScript and asserts:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'ru', 'gorizontalnyj-dvigatel.html');
const cssPath = path.join(root, 'css', 'russia-horizontal-landing.css');
const scriptPath = path.join(root, 'js', 'russia-horizontal-landing.js');
const html = fs.readFileSync(pagePath, 'utf8');

test('publishes the approved Russian B2B hero and SEO contract', () => {
  assert.match(html, /<html lang="ru">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Горизонтальные двигатели оптом с завода/);
  assert.match(html, /От \$99 за единицу/);
  assert.match(html, /MOQ 50 шт\./);
  assert.match(html, /Смешанные модели/);
  assert.match(html, /Только оптовые поставки и OEM\/ODM/);
  assert.doesNotMatch(html, /15\s*[–-]\s*25\s*(дн|дней)/i);
});

test('keeps Google Ads and the current Yandex Russia tag', () => {
  assert.equal((html.match(/AW-16777656395/g) || []).length >= 2, true);
  assert.match(html, /\.\.\/js\/yandex-metrica\.js/);
  assert.doesNotMatch(html, /109483511/);
});

test('keeps the product and factory proof contract', () => {
  for (const value of ['152FMH', '153FMI', '154FMI', '1P56FMJ']) {
    assert.match(html, new RegExp(value));
  }
  for (const value of ['2003', '15 000', '8 000', '50\\+', 'ISO 9001']) {
    assert.match(html, new RegExp(value));
  }
  assert.match(html, /перевозчик|экспедитор/i);
  assert.doesNotMatch(html, /Доставка в Россию 15/i);
});

test('embeds a qualified same-page inquiry form', () => {
  assert.match(html, /class="[^"]*contact-form/);
  assert.match(html, /action="\/api\/contact"/);
  for (const field of ['name', 'company', 'contact', 'product', 'quantity', 'freight_forwarder']) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
  assert.match(html, /name="source_form" value="russia_horizontal_engine_landing"/);
  assert.match(html, /name="website"/);
  assert.match(html, /data-model-checkbox/);
});

test('references only existing local assets', () => {
  for (const match of html.matchAll(/(?:src|href)="(\.\.\/(?:images|css|js)\/[^"]+)"/g)) {
    const relative = decodeURIComponent(match[1].replace(/^\.\.\//, ''));
    assert.ok(fs.existsSync(path.join(root, relative)), `missing ${relative}`);
  }
});

test('defines page-scoped responsive and accessible presentation', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.rh-page/);
  assert.match(css, /russia-horizontal-hero-desktop\.webp/);
  assert.match(css, /russia-horizontal-hero-mobile\.webp/);
  assert.match(css, /@media\s*\(max-width:\s*899px\)/);
  assert.match(css, /@media\s*\(max-width:\s*639px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*(clip|hidden)/);
  assert.ok(fs.existsSync(scriptPath));
});
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```powershell
node --test tests/russia-horizontal-engine-landing.test.js
```

Expected: FAIL because the page-scoped CSS, script, hero assets, approved form, and new content do not yet exist.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/russia-horizontal-engine-landing.test.js
git commit -m "test: define Russia horizontal landing contract"
```

### Task 2: Add responsive artwork and rebuild the page

**Files:**
- Create: `images/russia-horizontal-hero-desktop.webp`
- Create: `images/russia-horizontal-hero-mobile.webp`
- Create: `css/russia-horizontal-landing.css`
- Modify: `ru/gorizontalnyj-dvigatel.html`

- [ ] **Step 1: Copy the approved source artwork**

Copy:

```text
C:\Users\97020\Downloads\ChatGPT Image 2026年7月27日 20_02_48 (1).webp
  -> images/russia-horizontal-hero-desktop.webp
C:\Users\97020\Downloads\ChatGPT Image 2026年7月27日 20_02_48 (2).webp
  -> images/russia-horizontal-hero-mobile.webp
```

Verify dimensions with an image metadata reader:

```text
desktop: 1672×941
mobile: 1030×1526
```

- [ ] **Step 2: Implement the semantic HTML shell**

Replace the old inline-style page with:

- the existing Google tag;
- `<script src="../js/yandex-metrica.js" defer></script>`;
- the existing canonical URL;
- `../css/style.css` followed by `../css/russia-horizontal-landing.css`;
- minimal header with logo, WhatsApp, and `#quote`;
- one H1 and the approved hero text;
- procurement strip: wholesale, MOQ 50, mixed models, OEM/ODM;
- four product cards using existing assets;
- desktop comparison table and mobile comparison cards;
- verified factory facts and repository factory/certification images;
- delivery copy limited to the customer’s China freight forwarder;
- real `<form class="rh-inquiry-form">` inside a `.contact-form` wrapper;
- page-scoped script before shared `main.js`;
- WhatsApp/inquiry-only mobile sticky bar.

The form fields must include:

```html
<input name="name" required>
<input name="company" required>
<input name="contact" required>
<input name="quantity" required inputmode="numeric">
<select name="freight_forwarder" required>
  <option value="">Выберите вариант</option>
  <option value="Есть перевозчик в Китае">Да, есть перевозчик в Китае</option>
  <option value="Перевозчика пока нет">Пока нет</option>
</select>
<input type="hidden" name="product" value="">
<input type="hidden" name="source_form" value="russia_horizontal_engine_landing">
```

Model checkboxes use `data-model-checkbox` and do not share the Worker field name; the page script serializes checked values into hidden `product`.

Quantity remains required but has no `min="50"` attribute.

- [ ] **Step 3: Implement page-scoped CSS**

Use `.rh-page` as the top-level scope. Include:

- 1200 px content shell;
- transparent/minimal header over the hero;
- landscape background by default and portrait background under 899 px;
- strong left-side desktop gradient and mobile top-to-bottom gradient;
- responsive product/factory grids;
- desktop comparison table hidden below 640 px;
- mobile model comparison cards visible below 640 px;
- 2×2 mobile factory facts;
- fixed mobile CTA only below 640 px;
- touch targets at least 44 px;
- keyboard-visible focus states;
- `prefers-reduced-motion`;
- bottom padding so the sticky bar never covers form/footer content.

- [ ] **Step 4: Run the page contract and verify the remaining failure**

Run:

```powershell
node --test tests/russia-horizontal-engine-landing.test.js
```

Expected: the content/assets/styles assertions pass; only the missing page interaction module may still fail.

### Task 3: Add tested product-to-inquiry interactions

**Files:**
- Create: `tests/russia-horizontal-engine-interactions.test.js`
- Create: `js/russia-horizontal-landing.js`

- [ ] **Step 1: Write failing helper tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeModels,
  buildWhatsAppUrl,
  selectModel
} = require('../js/russia-horizontal-landing.js');

test('normalizes unique mixed-model selections', () => {
  assert.equal(
    normalizeModels(['152FMH', '154FMI', '152FMH', '']),
    '152FMH, 154FMI'
  );
});

test('builds a qualified Russian wholesale WhatsApp URL', () => {
  const url = buildWhatsAppUrl('154FMI');
  assert.match(url, /^https:\/\/wa\.me\/8619008225410\?text=/);
  const message = decodeURIComponent(url.split('?text=')[1]);
  assert.match(message, /оптов/i);
  assert.match(message, /154FMI/);
  assert.match(message, /50/);
});

test('selectModel checks the requested model and serializes the form value', () => {
  const first = { value: '152FMH', checked: false };
  const second = { value: '154FMI', checked: false };
  const hidden = { value: '' };
  const form = {
    querySelector: selector => selector === '[name="product"]' ? hidden : null,
    querySelectorAll: () => [first, second]
  };

  assert.equal(selectModel(form, '154FMI'), true);
  assert.equal(second.checked, true);
  assert.equal(hidden.value, '154FMI');
});
```

- [ ] **Step 2: Run tests and verify RED**

```powershell
node --test tests/russia-horizontal-engine-interactions.test.js
```

Expected: FAIL because the interaction module is missing.

- [ ] **Step 3: Implement the minimal UMD-style interaction module**

The module must export the three deterministic helpers under Node and initialize in the browser. Browser initialization must:

- synchronize all checked `data-model-checkbox` values into hidden `product`;
- make every `[data-quote-model]` button select its model and scroll/focus the form;
- update contextual WhatsApp links from `data-whatsapp-model`;
- reject an empty model group before the shared form handler by using `stopImmediatePropagation`;
- place a Russian error in `[data-model-error]`;
- clear the error when a model is selected.

Do not submit the form or report conversions in this module. Those responsibilities remain in `js/main.js` and `js/yandex-metrica.js`.

- [ ] **Step 4: Run focused tests and verify GREEN**

```powershell
node --test tests/russia-horizontal-engine-interactions.test.js tests/russia-horizontal-engine-landing.test.js
```

Expected: all new tests PASS.

- [ ] **Step 5: Commit the working page**

```powershell
git add ru/gorizontalnyj-dvigatel.html css/russia-horizontal-landing.css js/russia-horizontal-landing.js images/russia-horizontal-hero-desktop.webp images/russia-horizontal-hero-mobile.webp tests/russia-horizontal-engine-landing.test.js tests/russia-horizontal-engine-interactions.test.js
git commit -m "feat: redesign Russia horizontal engine landing"
```

### Task 4: Verify form safety and conversion boundaries

**Files:**
- Modify only if a regression is found: `tests/russia-horizontal-engine-landing.test.js`, `tests/russia-horizontal-engine-interactions.test.js`, or page-scoped production files.
- Verify only: `js/main.js`, `js/yandex-metrica.js`, `workers/contact-api/**`.

- [ ] **Step 1: Run the complete site and Worker suites**

```powershell
node --test tests/*.test.js
node --test workers/contact-api/test/*.test.mjs
```

Expected: all tests PASS, including:

- no conversion on validation, Worker, or network failure;
- one fetch during pending duplicate clicks;
- Google conversion only after Worker success;
- Yandex lead goal only after `/api/contact` 2xx;
- Turnstile and honeypot behavior.

- [ ] **Step 2: Verify the change boundary**

```powershell
git diff origin/main...HEAD --name-only
git diff --check
git status --short
```

Expected: no changes to `/ru/russia/`, Worker source, shared `main.js`, sitemap, redirects, robots, or unrelated content.

### Task 5: Browser QA and PR delivery

**Files:**
- Modify only if QA exposes a reproducible defect: the page, page CSS/script, or their tests.

- [ ] **Step 1: Start a local static server**

```powershell
python -m http.server 4173
```

- [ ] **Step 2: Inspect representative viewports**

Open `/ru/gorizontalnyj-dvigatel.html` at:

```text
390×844 phone
768×1024 portrait tablet
1024×768 landscape tablet
1440×900 desktop
```

Verify:

- correct portrait/landscape hero art;
- no duplicate logo;
- no horizontal overflow or clipped controls;
- product images load;
- desktop comparison table/mobile comparison cards switch correctly;
- model quote buttons select and focus the form;
- multiple models serialize into the hidden Worker field;
- quantity below 50 is not blocked;
- WeChat is absent from header/sticky bar but present in hero/final contact;
- both analytics scripts are present;
- no live inquiry is submitted.

- [ ] **Step 3: Add a regression test before each QA fix**

For any defect, first add or tighten a test, verify it fails, implement the smallest correction, and rerun focused plus full suites.

- [ ] **Step 4: Commit QA corrections**

```powershell
git add ru/gorizontalnyj-dvigatel.html css/russia-horizontal-landing.css js/russia-horizontal-landing.js tests
git commit -m "fix: polish Russia horizontal landing responsiveness"
```

Skip this commit if no corrections are necessary.

- [ ] **Step 5: Push and open a draft PR**

Push `feature/russia-horizontal-engine-landing-redesign` and create a draft PR against `main`. The PR body must list modified files, responsive artwork usage, B2B qualification choices, form/Worker behavior, Google and Yandex conversion boundaries, test commands, manual QA, and rollback instructions.

Do not merge the PR. Wait for Cloudflare Pages preview review.
