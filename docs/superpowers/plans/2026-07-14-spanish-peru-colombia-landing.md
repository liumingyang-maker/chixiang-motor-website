# Spanish Peru and Colombia Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two independent local-preview Spanish landing pages for Peru and Colombia from one shared static landing-page system.

**Architecture:** Route files contain country SEO metadata and forms. Shared CSS, JavaScript and verified asset data render the common components; country data modules provide products, wording, SEO, form choices and WhatsApp context.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node built-in test runner.

---

## File structure

- Create: `es/peru/index.html`, `es/colombia/index.html` — country SEO shells and forms.
- Create: `css/latam-cg-landing.css` — responsive shared visual system.
- Create: `js/latam-cg-products.js` — verified engine/gallery/factory asset references.
- Create: `js/latam-cg-peru-data.js`, `js/latam-cg-colombia-data.js` — country configuration.
- Create: `js/latam-cg-landing.js` — component rendering and interactions.
- Create: `tests/latam-cg-landing.test.js`, `tests/latam-cg-interactions.test.js` — route/data/interaction contracts.

### Task 1: Add failing contracts

**Files:** Create `tests/latam-cg-landing.test.js`, `tests/latam-cg-interactions.test.js`.

- [ ] Add tests that require `/es/peru/` and `/es/colombia/`, one H1 each, their exact canonical URLs, `es-PE`/`es-CO`, shared scripts/styles, and no sitemap update.
- [ ] Add VM-loaded data tests requiring Peru order `cg150`, `cg200`, `cargo`; Colombia order `cg125`, `cg150`, `replacement`; `cc` units; existing local asset paths; and the required default country/source form values.
- [ ] Add helper tests requiring `buildWhatsAppUrl`, `pickActiveSection`, one-open-product disclosure state and mobile CTA blocking rules.
- [ ] Run `node --test tests/latam-cg-landing.test.js tests/latam-cg-interactions.test.js`; expect failure because the routes/modules do not yet exist.
- [ ] Commit checkpoint: `git add tests/latam-cg-landing.test.js tests/latam-cg-interactions.test.js && git commit -m "test: define Latin America landing contracts"`.

### Task 2: Define verified reusable data and country configuration

**Files:** Create `js/latam-cg-products.js`, `js/latam-cg-peru-data.js`, `js/latam-cg-colombia-data.js`; modify `tests/latam-cg-landing.test.js` only if test fixtures need loading paths.

- [ ] Create `window.ChixiangLatamProducts` with the verified CG125/150/200 product references, cargo configuration reference, galleries, confirmed factory images and a complete referenced-asset list. The Colombia replacement entry is a service selection, not a third fictitious engine.
- [ ] Create Peru configuration with `key: 'peru'`, default country `Perú`, `sourceForm: 'es_peru_cg_landing'`, specified hero/FAQ/form text, CG150/CG200/cargo order, and the supplied replacement WhatsApp wording.
- [ ] Create Colombia configuration with `key: 'colombia'`, default country `Colombia`, `sourceForm: 'es_colombia_cg_landing'`, specified hero/FAQ/form text, CG125/CG150/replacement order, and the supplied replacement WhatsApp wording.
- [ ] Run `node --test tests/latam-cg-landing.test.js`; expect pass for product order, country defaults, SEO configuration and existing image assets.
- [ ] Commit checkpoint: `git add js/latam-cg-products.js js/latam-cg-peru-data.js js/latam-cg-colombia-data.js tests/latam-cg-landing.test.js && git commit -m "feat: add Peru and Colombia landing data"`.

### Task 3: Implement shared rendering and accessible interactions

**Files:** Create `js/latam-cg-landing.js`; modify `tests/latam-cg-interactions.test.js`.

- [ ] Render hero engines, selector, comparison, replacement helper, product details/galleries, delivery/factory, process, FAQ and form options entirely from the active market configuration.
- [ ] Keep selected product and application synchronized across card actions, quote form and WhatsApp URLs. Include market, product, application, source, UTM parameters and GCLID when present.
- [ ] Implement `aria-expanded`/`aria-controls`, keyboard/touch gallery interaction, a single active navigation state, one open mobile product disclosure, and sticky CTA visibility blocking for quote/footer/open FAQ/focused field/keyboard/page bottom.
- [ ] Run `node --test tests/latam-cg-interactions.test.js`; expect pass for deterministic helpers and contextual WhatsApp URLs.
- [ ] Commit checkpoint: `git add js/latam-cg-landing.js tests/latam-cg-interactions.test.js && git commit -m "feat: add shared Latin America landing interactions"`.

### Task 4: Implement route shells and responsive visual system

**Files:** Create `es/peru/index.html`, `es/colombia/index.html`, `css/latam-cg-landing.css`; modify `tests/latam-cg-landing.test.js`.

- [ ] Add exact titles, descriptions, canonical URLs and hreflang links; each document has one H1 and the named form fields for required buyer context and optional vehicle/code/email/requirements fields.
- [ ] Implement 0–767, 768–1199 and 1200+ layouts. Peru hero has only a restrained Andes/road scene; Colombia uses a lighter industrial-blue treatment. Use confirmed product/factory assets, white text on primary blue actions, visible focus states, scroll margins, safe-area mobile spacing and zero page-level horizontal overflow.
- [ ] Keep desktop comparison table, tablet comparison cards/adaptive grid, and concise mobile product disclosures. Do not add deployment, sitemap changes, or changes to existing Russian/legacy pages.
- [ ] Run `node --test tests/*.test.js`; expect all existing and new tests to pass.
- [ ] Commit checkpoint: `git add es/peru/index.html es/colombia/index.html css/latam-cg-landing.css js/latam-cg-landing.js js/latam-cg-products.js js/latam-cg-peru-data.js js/latam-cg-colombia-data.js tests/latam-cg-landing.test.js tests/latam-cg-interactions.test.js && git commit -m "feat: add Peru and Colombia landing previews"`.

### Task 5: Local visual QA and review handoff

**Files:** No new source files unless QA finds a defect.

- [ ] Start local preview and inspect both routes at `320x568`, `360x800`, `390x844`, `430x932`, `768x1024`, `820x1180`, `900x1024`, `1024x1366`, `1366x768`, `1440x900` and `1920x1080`.
- [ ] Verify no page horizontal scroll, anchor headings below the header, readable primary buttons, no sticky-CTA overlap, Spanish labels/errors, and country-specific WhatsApp form context.
- [ ] Capture desktop, tablet and mobile screenshots for both pages. Deliver only local preview URLs/screenshots; do not push, deploy or update `sitemap.xml` until approval.
