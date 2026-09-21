# Inquiry Attribution V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a maintainable first-party system that links website source data to anonymous Lead IDs used by WhatsApp clicks and successful contact forms, then lets the single owner review and classify those records.

**Architecture:** A browser IIFE owns first-touch/session attribution, WhatsApp URL decoration, and form enrichment. The existing contact Worker gains strict public ingestion, D1 persistence, contact-success persistence, and Access-protected lookup routes; a small static owner page consumes only those lookup routes. Existing Google Ads and Yandex handlers remain the conversion owners and are protected by regression tests.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner and `vm`, Cloudflare Workers, Cloudflare D1 SQL migrations, Cloudflare Access, Wrangler.

---

## File map

New production files:

- `js/lead-attribution.js` — browser identity, source classification, storage, WhatsApp decoration/event delivery, form enrichment, and diagnostics.
- `scripts/apply-lead-attribution.js` — deterministic insertion of the attribution script and existing-counter metadata into eligible pages.
- `workers/contact-api/migrations/0001_inquiry_attribution.sql` — additive D1 schema and indexes.
- `workers/contact-api/src/attribution-contract.mjs` — shared validation, sanitation, field limits, event/status allowlists, and JSON responses.
- `workers/contact-api/src/lead-store.mjs` — D1 writes, reads, deduplication, status transitions, and retention cleanup.
- `workers/contact-api/src/attribution-handler.mjs` — public WhatsApp event route.
- `workers/contact-api/src/internal-leads-handler.mjs` — owner-only lookup, export, recent list, and status routes.
- `internal/leads/index.html` — owner lookup interface.
- `internal/leads/leads.css` — isolated owner interface styles.
- `internal/leads/leads.js` — owner API client, renderer, status actions, copy, and download.
- `docs/geo-entity/INQUIRY_ATTRIBUTION_FROZEN_CONTRACT_EXCEPTION.md` — explicit authorization, frozen-file scope, invariants, Preview and rollback gates.

Existing production files changed:

- `js/main.js` — use the attribution URL decorator only in the existing programmatic WhatsApp fallback.
- `scripts/contact-procurement-owner-manifest.js` — five approved disclosure translations.
- `scripts/apply-contact-procurement-owner-content.js` — render the disclosure beside the form.
- `css/style.css` — minimal disclosure styling.
- eligible public HTML pages — one generated attribution script tag before `main.js` or the page-specific WhatsApp script.
- `workers/contact-api/src/contact-handler.mjs` — normalize/email approved attribution fields and enqueue a successful-form D1 event after email delivery.
- `workers/contact-api/src/index.mjs` — exact route dispatch plus scheduled retention cleanup.
- `workers/contact-api/wrangler.jsonc` — new API route patterns, D1 binding, migrations directory, scheduled cleanup, and disabled public `workers.dev` route.

New or changed tests:

- `tests/lead-attribution-browser.test.js`
- `tests/lead-attribution-page-inclusion.test.js`
- `tests/inquiry-attribution-governance.test.js`
- `tests/whatsapp-conversion.test.js`
- `tests/site-optimization-invariants.test.js`
- `tests/multilingual-contact-procurement-owner-pages.test.js`
- `workers/contact-api/test/attribution-contract.test.mjs`
- `workers/contact-api/test/lead-store.test.mjs`
- `workers/contact-api/test/attribution-handler.test.mjs`
- `workers/contact-api/test/internal-leads-handler.test.mjs`
- `workers/contact-api/test/contact-handler.test.mjs`
- `workers/contact-api/test/index.test.mjs`

## Task 1: Record and enforce the frozen-contract exception

**Files:**
- Create: `docs/geo-entity/INQUIRY_ATTRIBUTION_FROZEN_CONTRACT_EXCEPTION.md`
- Create: `tests/inquiry-attribution-governance.test.js`
- Modify: `tests/site-optimization-invariants.test.js`

- [ ] **Step 1: Write the failing governance test**

Add assertions that the fixed baseline stays `5ce9254ab1ecd84dc9268efb55b9acaad7feb13d`, the existing frozen list stays present, and the only approved frozen-file exceptions are:

```js
const approvedFrozenExceptions = [
  'ads/algerie/index.html',
  'js/main.js',
  'workers/contact-api/src/contact-handler.mjs',
  'workers/contact-api/src/index.mjs',
  'workers/contact-api/wrangler.jsonc'
];

assert.equal(frozenBaseline, '5ce9254ab1ecd84dc9268efb55b9acaad7feb13d');
assert.deepEqual([...authorizedFrozenChanges].sort(), approvedFrozenExceptions);
assert.match(mainSource, /AW-16777656395\/Om_nCMCV4swcEMvwmsA-/);
assert.match(mainSource, /AW-16777656395\/bovKCKOx088cEMvwmsA-/);
assert.match(contactSource, /verifyTurnstile/);
assert.match(contactSource, /await sendInquiryEmail/);
```

- [ ] **Step 2: Run the test and verify the new exception contract is absent**

Run: `node --test tests/inquiry-attribution-governance.test.js`

Expected: FAIL because `authorizedFrozenChanges` and the exception record do not exist.

- [ ] **Step 3: Add the explicit exception record and narrow guard**

Keep `frozenBaseline` and `frozenFiles` unchanged. Add a separate exported set in `tests/site-optimization-invariants.test.js`:

```js
const authorizedFrozenChanges = new Set([
  'ads/algerie/index.html',
  'js/main.js',
  'workers/contact-api/src/contact-handler.mjs',
  'workers/contact-api/src/index.mjs',
  'workers/contact-api/wrangler.jsonc'
]);

const unchangedFrozenFiles = frozenFiles.filter(file => !authorizedFrozenChanges.has(file));
```

Run both candidate and working-tree comparisons against `unchangedFrozenFiles`, and document why each exception is needed, what must remain unchanged, required tests, Preview gate, and rollback order.

- [ ] **Step 4: Run governance and existing invariant tests**

Run: `node --test tests/inquiry-attribution-governance.test.js tests/site-optimization-invariants.test.js tests/whatsapp-conversion.test.js workers/contact-api/test/contact-handler.test.mjs`

Expected: PASS with the original Ads IDs, Turnstile path, email-before-success behaviour, baseline hash, and non-exempt frozen files still protected.

- [ ] **Step 5: Commit the governance slice**

```powershell
git add -- docs/geo-entity/INQUIRY_ATTRIBUTION_FROZEN_CONTRACT_EXCEPTION.md tests/inquiry-attribution-governance.test.js tests/site-optimization-invariants.test.js
git commit -m "test: authorize attribution contract extension"
```

## Task 2: Implement deterministic browser attribution primitives

**Files:**
- Create: `js/lead-attribution.js`
- Create: `tests/lead-attribution-browser.test.js`

- [ ] **Step 1: Write failing tests for identity, source, and sanitation**

Create a VM harness and assert these exact public helpers:

```js
const api = boot({
  href: 'https://chixiangmotor.com/en/?gclid=abc123',
  referrer: 'https://www.google.com/search?q=cg+engine'
});

assert.match(api.getDiagnostics().lead_id, /^CX-[0-9A-HJKMNP-TV-Z]{10}$/);
assert.equal(api.testing.classifySource({ gclid: 'abc123' }, ''), 'Google Ads');
assert.equal(api.testing.classifySource({}, 'https://www.google.com/search?q=x'), 'Google Organic');
assert.equal(api.testing.classifySource({}, 'https://chatgpt.com/c/123'), 'ChatGPT');
assert.equal(api.testing.classifySource({}, ''), 'Direct');
assert.equal(api.testing.sanitizePath('/en/cg-engine?email=a@b.com#x'), '/en/cg-engine');
```

Also test UTM precedence, `msclkid`, `yclid`, `ttclid`, `fbclid`, Bing, Instagram, TikTok, Perplexity, Claude, Gemini-before-Google, referral, internal referrer, field limits, and invalid stored objects.

- [ ] **Step 2: Run the browser test and verify it fails**

Run: `node --test tests/lead-attribution-browser.test.js`

Expected: FAIL with `ENOENT` for `js/lead-attribution.js`.

- [ ] **Step 3: Implement the module shell and pure helpers**

Use one classic-script IIFE with a versioned API:

```js
(function(window, document) {
  'use strict';
  var VERSION = '1.0.0';
  var STORAGE_KEY = 'cx_attribution_v1';
  var SESSION_KEY = 'cx_attribution_session_v1';
  var LEAD_ID_PATTERN = /^CX-[0-9A-HJKMNP-TV-Z]{10}$/;
  var api = createClient(window, document);
  window.ChixiangAttribution = api;
  api.init();
})(window, document);
```

Implement `createLeadId`, `classifySource`, `sanitizeHostname`, `sanitizePath`, `sanitizeValue`, `readCampaign`, and strict stored-record validation. Generate IDs with `crypto.getRandomValues`; the test harness injects deterministic bytes.

- [ ] **Step 4: Implement first-touch and session storage**

The persistent record is immutable for 90 days. The session record is recreated for a new external/campaign entry and updated for same-origin navigation. Storage exceptions fall back to in-memory state and set `storage_available: false`.

```js
{
  schema_version: 1,
  client_version: '1.0.0',
  lead_id: 'CX-7K3P2M9Q4D',
  first_source: 'Google Ads',
  landing_page: '/en/',
  first_referrer_domain: 'www.google.com',
  language: 'en',
  first_visit_time: '2026-09-21T00:00:00.000Z',
  expires_at: '2026-12-20T00:00:00.000Z'
}
```

- [ ] **Step 5: Run the browser test**

Run: `node --test tests/lead-attribution-browser.test.js`

Expected: PASS for identity, precedence, sanitation, expiry, immutability, session replacement, and storage failure.

- [ ] **Step 6: Commit the browser-core slice**

```powershell
git add -- js/lead-attribution.js tests/lead-attribution-browser.test.js
git commit -m "feat: add first-party attribution core"
```

## Task 3: Add WhatsApp decoration, event delivery, form enrichment, and diagnostics

**Files:**
- Modify: `js/lead-attribution.js`
- Modify: `tests/lead-attribution-browser.test.js`
- Modify: `js/main.js`
- Modify: `tests/whatsapp-conversion.test.js`

- [ ] **Step 1: Write failing WhatsApp and form tests**

Cover both URL hosts, existing localized text, no text, duplicate Ref removal, wrong phone rejection, CTA/product metadata, `sendBeacon` success, keepalive fallback, send failure, Yandex counter metadata, and hidden form fields:

```js
const decorated = api.decorateWhatsAppUrl(
  'https://wa.me/8619008225410?text=' + encodeURIComponent('Hello'),
  { product: 'CG Engine', cta: 'hero' }
);
assert.equal(new URL(decorated).searchParams.get('text'), 'Hello\n\nRef: CX-7K3P2M9Q4D');
assert.equal(api.decorateWhatsAppUrl(decorated).match(/Ref:/g).length, 1);

api.enrichForm(form);
assert.equal(form.field('lead_id').value, 'CX-7K3P2M9Q4D');
assert.equal(form.field('first_source').value, 'Google Ads');
assert.equal(form.field('last_page').value, '/en/cg-engine');
```

- [ ] **Step 2: Run tests and verify the interaction API is absent**

Run: `node --test tests/lead-attribution-browser.test.js tests/whatsapp-conversion.test.js`

Expected: FAIL for missing decoration, delivery, and enrichment methods.

- [ ] **Step 3: Implement the delegated capture listener and event payload**

Register one capture-phase listener for `wa.me` and `api.whatsapp.com`. Synchronously update the anchor, then send this allowlisted object:

```js
{
  schema_version: 1,
  client_version: '1.0.0',
  event_id: 'generated-random-id',
  event_type: 'whatsapp_click',
  lead_id: 'CX-7K3P2M9Q4D',
  first_source: 'Google Ads',
  session_source: 'Direct',
  landing_page: '/en/',
  session_landing_page: '/en/cg-engine',
  previous_page: '/en/',
  click_page: '/en/cg-engine',
  product: 'CG Engine',
  cta: 'hero',
  language: 'en',
  client_timestamp: '2026-09-21T00:05:00.000Z'
}
```

Use `navigator.sendBeacon('/api/attribution/whatsapp-click', blob)` first and one `fetch` call with `{method:'POST', keepalive:true, credentials:'same-origin'}` only when the beacon is unavailable or returns `false`.

- [ ] **Step 4: Implement form enrichment and the programmatic fallback adapter**

Add one capture-phase `submit` listener that creates or updates hidden fields before `main.js` constructs `FormData`. In `main.js`, change only the fallback URL construction:

```js
const attribution = window.ChixiangAttribution;
const rawUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(buildWhatsAppText(form));
const productField = form.querySelector('[name="product_interest"], [name="product"]');
const finalUrl = attribution && typeof attribution.decorateWhatsAppUrl === 'function'
  ? attribution.decorateWhatsAppUrl(rawUrl, {
      cta: 'form_fallback',
      product: productField && productField.value ? productField.value : ''
    })
  : rawUrl;
window.open(finalUrl, '_blank', 'noopener');
```

Do not move or duplicate either `gtag` call.

- [ ] **Step 5: Run interaction and conversion regression tests**

Run: `node --test tests/lead-attribution-browser.test.js tests/whatsapp-conversion.test.js tests/latam-cg-interactions.test.js tests/algeria-paid-landing.test.js tests/russia-horizontal-engine-interactions.test.js`

Expected: PASS; one anchor click still produces exactly one existing Google Ads WhatsApp conversion, and attribution failure never prevents navigation.

- [ ] **Step 6: Commit the browser-integration slice**

```powershell
git add -- js/lead-attribution.js js/main.js tests/lead-attribution-browser.test.js tests/whatsapp-conversion.test.js
git commit -m "feat: connect attribution to WhatsApp and forms"
```

## Task 4: Apply the browser module and disclosure deterministically

**Files:**
- Create: `scripts/apply-lead-attribution.js`
- Create: `tests/lead-attribution-page-inclusion.test.js`
- Modify: `scripts/contact-procurement-owner-manifest.js`
- Modify: `scripts/apply-contact-procurement-owner-content.js`
- Modify: `tests/multilingual-contact-procurement-owner-pages.test.js`
- Modify: `tests/site-optimization-invariants.test.js`
- Modify: `css/style.css`
- Modify: eligible `en/`, `es/`, `pt/`, `ru/`, `ar/`, and `ads/` HTML files

- [ ] **Step 1: Write failing page-inclusion tests**

Discover eligible files from controlled public roots, not from `docs/`, `research/`, or `images/`. Assert:

```js
assert.equal(scriptCount(html, 'lead-attribution.js'), 1, file);
assert.ok(scriptIndex(html, 'lead-attribution.js') < firstInteractionScriptIndex(html), file);
assert.equal(counterMetadata(html), html.includes('ym(109483511') ? '109483511' : '', file);
assert.equal(runApplyScript('--check').status, 0);
```

The eligibility rule is: a public HTML page under `en`, `es`, `pt`, `ru`, `ar`, or `ads` that contains a WhatsApp URL/marker, an `/api/contact` form, or loads `main.js` with its programmatic fallback capability.

- [ ] **Step 2: Run the inclusion test and verify it fails**

Run: `node --test tests/lead-attribution-page-inclusion.test.js`

Expected: FAIL because no eligible page loads the module.

- [ ] **Step 3: Implement the idempotent application script**

The script supports write mode and `--check`, preserves each file's newline style, refuses duplicate markers, and renders one of:

```html
<script src="../js/lead-attribution.js" data-yandex-counter="109483511"></script>
```

```html
<script src="../../js/lead-attribution.js"></script>
```

Insert immediately before the first existing interaction script. Never add `109483511` metadata when that exact counter is absent from the page.

- [ ] **Step 4: Add five factual disclosure translations to the contact generator**

Render this structure from locale data:

```html
<p class="contact-attribution-disclosure">
  We use an anonymous reference and limited source information to connect inquiries with their website source. Browser data expires after 90 days and service records after 180 days.
</p>
```

Provide semantically equivalent ES, PT, RU, and AR text in the manifest and assert the class, retention numbers, and generated output on all five managed contact pages.

- [ ] **Step 5: Generate pages and verify idempotence**

Run:

```powershell
node scripts/apply-contact-procurement-owner-content.js
node scripts/apply-lead-attribution.js
node scripts/apply-contact-procurement-owner-content.js --check
node scripts/apply-lead-attribution.js --check
```

Expected: all commands exit 0; both check commands report no drift.

- [ ] **Step 6: Run page, generator, and SEO contract tests**

Run: `node --test tests/lead-attribution-page-inclusion.test.js tests/multilingual-contact-procurement-owner-pages.test.js tests/site-optimization-invariants.test.js tests/foundation-seo.test.js tests/foundation-routing.test.js`

Expected: PASS; canonical, hreflang, H1, Schema IDs, form actions, field names, and existing script order remain unchanged apart from the one approved module.

- [ ] **Step 7: Commit the page-application slice**

```powershell
git add -- scripts/apply-lead-attribution.js scripts/contact-procurement-owner-manifest.js scripts/apply-contact-procurement-owner-content.js tests/lead-attribution-page-inclusion.test.js tests/multilingual-contact-procurement-owner-pages.test.js tests/site-optimization-invariants.test.js css/style.css en es pt ru ar ads
git commit -m "feat: enable attribution on inquiry pages"
```

## Task 5: Add the D1 schema and strict Worker contract

**Files:**
- Create: `workers/contact-api/migrations/0001_inquiry_attribution.sql`
- Create: `workers/contact-api/src/attribution-contract.mjs`
- Create: `workers/contact-api/test/attribution-contract.test.mjs`

- [ ] **Step 1: Write failing normalization tests**

Assert the contract rejects unknown event types, malformed Lead IDs, invalid timestamps, overlong values, non-allowlisted status transitions, fragments, and unknown query parameters. Assert it retains only the approved campaign fields and normalized paths.

```js
assert.deepEqual(normalizeLeadId('cx-7k3p2m9q4d'), 'CX-7K3P2M9Q4D');
assert.equal(normalizeLeadId('CX-EMAIL@EXAMPLE'), '');
assert.equal(normalizePath('/en/cg-engine?email=a@b.com#x'), '/en/cg-engine');
assert.equal(normalizeCountry('br'), 'BR');
assert.equal(isAllowedTransition('message_received', 'qualified'), true);
assert.equal(isAllowedTransition('whatsapp_clicked', 'qualified'), false);
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `node --test workers/contact-api/test/attribution-contract.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement constants and normalizers**

Export `normalizeLeadId`, `normalizePath`, `normalizeHostname`, `normalizeCountry`, `normalizeAttributionEvent`, `normalizeStatusRequest`, `isAllowedTransition`, `jsonResponse`, `ALLOWED_EVENT_TYPES`, and `ALLOWED_STATUSES`. Do not log request bodies.

- [ ] **Step 4: Add the additive migration**

Create `leads` and `lead_events` with foreign keys, `CHECK` constraints for statuses/event types, unique `event_id`, unique `dedupe_key`, and indexes on `updated_at`, `expires_at`, `status`, `lead_id`, and `server_timestamp`. The schema stores click IDs but no names, email addresses, phone numbers, chat text, IP addresses, or form message content.

- [ ] **Step 5: Run contract and migration-shape tests**

Run: `node --test workers/contact-api/test/attribution-contract.test.mjs`

Expected: PASS, including assertions for both table definitions, unique constraints, status/event `CHECK` constraints, and required indexes.

- [ ] **Step 6: Commit the schema/contract slice**

```powershell
git add -- workers/contact-api/migrations/0001_inquiry_attribution.sql workers/contact-api/src/attribution-contract.mjs workers/contact-api/test/attribution-contract.test.mjs
git commit -m "feat: define attribution data contract"
```

## Task 6: Implement D1 storage, deduplication, statuses, and retention

**Files:**
- Create: `workers/contact-api/src/lead-store.mjs`
- Create: `workers/contact-api/test/lead-store.test.mjs`

- [ ] **Step 1: Write failing store tests with a deterministic D1 fake**

Cover first-touch insert-once, session event append, identical retry, five-second double-click collapse, later click retention, WhatsApp-created status, form-created status, valid manual transitions, invalid skips, manual revert, lookup, recent list, sanitized export, and bounded deletion.

```js
const first = await store.recordEvent(db, whatsappEvent, serverContext);
const retry = await store.recordEvent(db, whatsappEvent, serverContext);
assert.equal(first.result, 'recorded');
assert.equal(retry.result, 'event_already_recorded');
assert.equal((await store.getLead(db, whatsappEvent.lead_id)).status, 'whatsapp_clicked');

await store.recordSuccessfulForm(db, formEvent, serverContext);
assert.equal((await store.getLead(db, formEvent.lead_id)).status, 'message_received');
```

- [ ] **Step 2: Run the store test and verify it fails**

Run: `node --test workers/contact-api/test/lead-store.test.mjs`

Expected: FAIL because `lead-store.mjs` does not exist.

- [ ] **Step 3: Implement parameterized D1 statements**

Use only `prepare(...).bind(...)`, `batch`, `first`, `all`, and `run`. Never interpolate payload values into SQL. Keep immutable first-touch columns out of the conflict-update clause; update only last-seen, status progression, country when previously absent, and expiry.

- [ ] **Step 4: Implement deterministic deduplication and status history**

Use Web Crypto SHA-256 over `lead_id|event_type|click_page|cta|five_second_bucket` for `dedupe_key`. Store every allowed manual transition as an event with `from_status` and `to_status`; revert reads the latest manual transition and restores only its `from_status`.

- [ ] **Step 5: Implement 180-day bounded cleanup**

Delete expired `lead_events` first and expired `leads` second, each with a maximum batch of 500 rows. Return counts without exposing row contents.

- [ ] **Step 6: Run store tests**

Run: `node --test workers/contact-api/test/lead-store.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the storage slice**

```powershell
git add -- workers/contact-api/src/lead-store.mjs workers/contact-api/test/lead-store.test.mjs
git commit -m "feat: persist attribution events in D1"
```

## Task 7: Add public WhatsApp event ingestion

**Files:**
- Create: `workers/contact-api/src/attribution-handler.mjs`
- Create: `workers/contact-api/test/attribution-handler.test.mjs`
- Modify: `workers/contact-api/src/index.mjs`
- Create: `workers/contact-api/test/index.test.mjs`

- [ ] **Step 1: Write failing handler and exact-route tests**

Test `POST` JSON and beacon text/plain JSON, `OPTIONS`, wrong methods, invalid origin, oversized body, invalid Lead ID, duplicate event, missing D1, country provenance, exact route matching, and 404 for lookalike paths.

```js
function eventRequest(pathname, body) {
  return new Request('https://chixiangmotor.com' + pathname, {
    method: 'POST',
    headers: { origin: 'https://chixiangmotor.com', 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

const response = await worker.fetch(
  eventRequest('/api/attribution/whatsapp-click', payload),
  { LEADS_DB: db },
  executionContext
);
assert.equal(response.status, 202);
assert.deepEqual(await response.json(), { ok: true, result: 'recorded' });
assert.equal(db.lead.cloudflare_country, 'BR');
assert.equal(db.lead.country_source, 'cloudflare_edge');
```

- [ ] **Step 2: Run tests and verify routes are missing**

Run: `node --test workers/contact-api/test/attribution-handler.test.mjs workers/contact-api/test/index.test.mjs`

Expected: FAIL with module-not-found and 404 responses.

- [ ] **Step 3: Implement strict public ingestion**

Accept only same-origin production/Preview origins, a maximum 16 KiB body, and `event_type: whatsapp_click`. Return `202 recorded`, `200 event_already_recorded`, `400 invalid_payload`, `405`, or `503 database_unavailable`. Never echo campaign or referrer data.

- [ ] **Step 4: Add exact route dispatch and scheduled cleanup**

Change the Worker entry signature to `fetch(request, env, ctx)` and route only exact approved paths. Add:

```js
async scheduled(controller, env, ctx) {
  ctx.waitUntil(cleanupExpiredLeads(env.LEADS_DB, controller.scheduledTime));
}
```

- [ ] **Step 5: Run route and handler tests**

Run: `node --test workers/contact-api/test/attribution-handler.test.mjs workers/contact-api/test/index.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the public-ingestion slice**

```powershell
git add -- workers/contact-api/src/attribution-handler.mjs workers/contact-api/src/index.mjs workers/contact-api/test/attribution-handler.test.mjs workers/contact-api/test/index.test.mjs
git commit -m "feat: ingest WhatsApp attribution events"
```

## Task 8: Extend successful contact delivery without changing success semantics

**Files:**
- Modify: `workers/contact-api/src/contact-handler.mjs`
- Modify: `workers/contact-api/test/contact-handler.test.mjs`

- [ ] **Step 1: Write failing normalization, email, and background-write tests**

Add all approved fields and assert escaped text/HTML labels:

```js
assert.match(email.text, /Lead ID: CX-7K3P2M9Q4D/);
assert.match(email.text, /First source: Google Ads/);
assert.match(email.text, /Landing page: \/en\//);
assert.match(email.text, /Last page: \/en\/contact/);
assert.match(email.text, /Language: en/);
```

Use an injected `waitUntil` collector. Assert it is called only after `EMAIL.send` succeeds; D1 rejection leaves the response `{ok:true}` and never triggers on Turnstile, validation, or email failure.

- [ ] **Step 2: Run contact tests and verify they fail**

Run: `node --test workers/contact-api/test/contact-handler.test.mjs`

Expected: FAIL because Lead ID/source rows and the background D1 task are absent.

- [ ] **Step 3: Extend the explicit allowlist and email rows**

Normalize `lead_id`, first/session sources, first/session landing paths, referrer domain, previous/last page, `attribution_client_version`, `fbclid`, `msclkid`, `yclid`, and `ttclid`. Continue to HTML-escape every value and preserve all existing procurement rows.

- [ ] **Step 4: Schedule D1 only after email success**

After `await sendInquiryEmail(...)`, build a sanitized `form_submitted_successfully` event and call the injected background adapter:

```js
const background = options.waitUntil || (promise => promise.catch(logAttributionFailure));
background(recordSuccessfulForm(env.LEADS_DB, event, serverContext)
  .catch(logAttributionFailure));
return jsonResponse({ ok: true }, 200, origin);
```

The entry router passes `promise => ctx.waitUntil(promise)`.

- [ ] **Step 5: Run the complete contact regression file**

Run: `node --test workers/contact-api/test/contact-handler.test.mjs`

Expected: PASS; existing Turnstile, spam, provider failure, CORS, email, and response tests remain green.

- [ ] **Step 6: Commit the contact slice**

```powershell
git add -- workers/contact-api/src/contact-handler.mjs workers/contact-api/src/index.mjs workers/contact-api/test/contact-handler.test.mjs workers/contact-api/test/index.test.mjs
git commit -m "feat: attach attribution to successful forms"
```

## Task 9: Add Access-protected owner API

**Files:**
- Create: `workers/contact-api/src/internal-leads-handler.mjs`
- Create: `workers/contact-api/test/internal-leads-handler.test.mjs`
- Modify: `workers/contact-api/src/index.mjs`
- Modify: `workers/contact-api/test/index.test.mjs`

- [ ] **Step 1: Write failing owner-route tests**

Test exact routes, valid email identity, missing Access identity, wrong email, lookup, recent limit clamping, sanitized export, valid status progression, invalid skips, manual revert, missing lead, and method rejection.

```js
function accessContext(email) {
  return {
    access: {
      async getIdentity() { return { email }; }
    }
  };
}

const ctx = accessContext('chixiangmotor@163.com');
assert.equal((await handleInternal(request, env, ctx)).status, 200);
assert.equal((await handleInternal(request, env, accessContext('other@example.com'))).status, 403);
assert.equal(exported.click_ids.gclid_present, true);
assert.equal('gclid' in exported, false);
```

- [ ] **Step 2: Run owner API tests and verify they fail**

Run: `node --test workers/contact-api/test/internal-leads-handler.test.mjs workers/contact-api/test/index.test.mjs`

Expected: FAIL because the internal handler and routes do not exist.

- [ ] **Step 3: Implement Access identity enforcement**

Require `ctx.access.getIdentity()` and exact case-insensitive email equality with `chixiangmotor@163.com`. Return a no-store `403 unauthorized` if Access context is absent or the identity does not match. Do not build a second login/password path.

- [ ] **Step 4: Implement owner operations and sanitized export**

Return stable snake_case JSON and ISO UTC timestamps. The export exposes campaign names and click-ID presence booleans, never raw click IDs, contact fields, form contents, IP addresses, or Access identity.

- [ ] **Step 5: Run owner API tests**

Run: `node --test workers/contact-api/test/internal-leads-handler.test.mjs workers/contact-api/test/index.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the owner API slice**

```powershell
git add -- workers/contact-api/src/internal-leads-handler.mjs workers/contact-api/src/index.mjs workers/contact-api/test/internal-leads-handler.test.mjs workers/contact-api/test/index.test.mjs
git commit -m "feat: add protected lead lookup API"
```

## Task 10: Build the human and AI-friendly owner page

**Files:**
- Create: `internal/leads/index.html`
- Create: `internal/leads/leads.css`
- Create: `internal/leads/leads.js`
- Create: `tests/internal-leads-ui.test.js`

- [ ] **Step 1: Write failing structural and behaviour tests**

Assert one H1, explicit search label, recent list, status buttons, empty/loading/error states, table headers, Copy for AI, JSON download, keyboard focus, no external scripts, and escaped rendering through `textContent`.

```js
assert.match(html, /<h1>Inquiry source lookup<\/h1>/);
assert.match(html, /id="lead-search"/);
assert.match(source, /textContent/);
assert.doesNotMatch(source, /innerHTML\s*=/);
assert.match(source, /navigator\.clipboard\.writeText/);
assert.match(source, /application\/json/);
```

- [ ] **Step 2: Run the UI test and verify it fails**

Run: `node --test tests/internal-leads-ui.test.js`

Expected: FAIL because the owner page files do not exist.

- [ ] **Step 3: Implement the isolated owner page**

Use plain HTML/CSS/JavaScript. Search normalizes the Lead ID, recent defaults to 50, status buttons render only allowed next actions, errors retain the last successful result, Copy for AI includes `schema_version`, and the JSON download uses the server's sanitized export response.

- [ ] **Step 4: Run UI and accessibility structure tests**

Run: `node --test tests/internal-leads-ui.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the owner-page slice**

```powershell
git add -- internal/leads/index.html internal/leads/leads.css internal/leads/leads.js tests/internal-leads-ui.test.js
git commit -m "feat: add inquiry source lookup page"
```

## Task 11: Configure local/Preview D1 and Cloudflare route boundaries

**Files:**
- Modify: `workers/contact-api/wrangler.jsonc`
- Modify: `workers/contact-api/test/index.test.mjs`
- Create outside repository: `C:\Users\97020\ZCodeProject\HANDOVER\inquiry-attribution-v1\CLOUDFLARE-PREVIEW-SETUP.md`

- [ ] **Step 1: Write failing configuration assertions**

Assert `workers_dev: false`, `LEADS_DB`, `migrations_dir`, daily cron, and only the required public/internal API route patterns. Assert no production database UUID is invented in tests.

- [ ] **Step 2: Run configuration tests and verify they fail**

Run: `node --test workers/contact-api/test/index.test.mjs`

Expected: FAIL because the D1 and route settings are absent.

- [ ] **Step 3: Add local binding structure and API routes**

Use the binding name `LEADS_DB`, database name `chixiang-lead-attribution`, migrations directory `migrations`, and a daily `03:17 UTC` cleanup cron. Keep `/api/contact*`, add only `/api/attribution/*` and `/api/internal/leads*`, and set `workers_dev` to `false`.

- [ ] **Step 4: Provision only the non-production database when authenticated CLI access is available**

Run from `workers/contact-api`:

```powershell
npx wrangler d1 create chixiang-lead-attribution-preview --location apac --binding LEADS_DB --update-config
npx wrangler d1 migrations apply chixiang-lead-attribution-preview --remote
```

Expected: Wrangler returns one real preview D1 UUID, updates the Preview binding, and reports migration 0001 applied. If authentication is unavailable, stop this step and record `PREVIEW_D1 = BLOCKED_AUTH`; do not invent an ID or create a production database.

- [ ] **Step 5: Configure the Access application in Preview**

Protect the Preview owner page and `/api/internal/leads*` route with an Allow policy for exactly `chixiangmotor@163.com`. Confirm an unauthenticated browser gets the Access gate and the authorized account reaches the page. Do not protect `/api/contact` or `/api/attribution/whatsapp-click`.

- [ ] **Step 6: Write the external setup evidence**

Record the database name/UUID, migration result, Access application identifier, protected paths, allowed email, timestamp, and any blocked external step in the repository-external handoff file. Do not store tokens, cookies, API keys, or Access assertions.

- [ ] **Step 7: Run configuration and Worker tests**

Run: `node --test workers/contact-api/test/*.test.mjs`

Expected: exit 0 with no failed, cancelled, skipped, or todo tests.

- [ ] **Step 8: Commit code configuration only**

```powershell
git add -- workers/contact-api/wrangler.jsonc workers/contact-api/test/index.test.mjs
git commit -m "chore: configure attribution preview services"
```

## Task 12: Verify the complete candidate and prepare review evidence

**Files:**
- Create outside repository: `C:\Users\97020\ZCodeProject\HANDOVER\inquiry-attribution-v1\IMPLEMENTATION-RESULT.md`
- Create outside repository: `C:\Users\97020\ZCodeProject\HANDOVER\inquiry-attribution-v1\TEST-SUMMARY.txt`
- Create outside repository: `C:\Users\97020\ZCodeProject\HANDOVER\inquiry-attribution-v1\CANDIDATE-PATCH.txt`

- [ ] **Step 1: Run all generator drift checks**

Run:

```powershell
node scripts/apply-contact-procurement-owner-content.js --check
node scripts/apply-product-family-owner-content.js --check
node scripts/apply-site-entity-schema.js --check
node scripts/apply-lead-attribution.js --check
```

Expected: all commands exit 0 and report no drift.

- [ ] **Step 2: Run targeted attribution and frozen-contract tests**

Run:

```powershell
node --test tests/lead-attribution-browser.test.js tests/lead-attribution-page-inclusion.test.js tests/internal-leads-ui.test.js tests/inquiry-attribution-governance.test.js tests/whatsapp-conversion.test.js tests/yandex-metrica.test.js tests/multilingual-contact-procurement-owner-pages.test.js tests/site-optimization-invariants.test.js
node --test workers/contact-api/test/attribution-contract.test.mjs workers/contact-api/test/lead-store.test.mjs workers/contact-api/test/attribution-handler.test.mjs workers/contact-api/test/internal-leads-handler.test.mjs workers/contact-api/test/contact-handler.test.mjs workers/contact-api/test/index.test.mjs
```

Expected: exit 0 and zero failures.

- [ ] **Step 3: Run full site and Worker suites separately**

Run:

```powershell
node --test tests/*.test.js
node --test workers/contact-api/test/*.test.mjs
```

Expected: both commands exit 0. Record site and Worker counts separately; do not claim an unexecuted combined count.

- [ ] **Step 4: Run static and Git checks**

Run:

```powershell
git diff --check
git status --short
git diff --name-only 44ce7a5a5db38b1eab21f12d12ec07e7d03d94be...HEAD
git log --oneline --decorate -12
```

Expected: no whitespace errors; only planned files plus the approved documentation are changed; no `_gpt_review_bundle*` path appears.

- [ ] **Step 5: Perform isolated browser acceptance without real delivery**

Use a non-production D1 binding, a stubbed contact email/Turnstile path, and no real WhatsApp send. Verify scenarios A–E plus Direct-first/Google-Ads-return, storage disabled, D1 unavailable, dynamic market pages, owner lookup, status progression, Copy for AI, and JSON download. Confirm the WhatsApp composer text contains one short Ref but do not send it.

- [ ] **Step 6: Produce repository-external evidence**

Save the exact commands/results, candidate SHA, data limitations, browser environment, Preview identifiers, Access result, D1 result, unchanged Google/Yandex conversion evidence, remaining external gaps, and full patch outside the repository.

- [ ] **Step 7: Final checkpoint**

Do not push, open a PR, merge, create a production D1 database, deploy production, submit a real form, send WhatsApp, change Ads settings, or start Ads without a new explicit authorization. If `main` still lacks base candidate `44ce7a5a5db38b1eab21f12d12ec07e7d03d94be` or an owner-approved equivalent, report the candidate as Preview-only.
