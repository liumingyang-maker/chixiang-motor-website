# Inquiry Attribution V1 Design

**Status:** Approved for implementation
**Date:** 2026-09-21
**Base candidate:** `44ce7a5a5db38b1eab21f12d12ec07e7d03d94be`
**Implementation branch:** `codex/inquiry-attribution-v1`

## 1. Purpose

Build a small, maintainable first-party attribution system that helps the site owner connect a real WhatsApp or form inquiry with the website source that preceded it.

The system must distinguish four facts that are currently easy to conflate:

1. a browser visited the website;
2. the browser clicked WhatsApp;
3. the buyer sent a WhatsApp message containing a reference code;
4. the owner confirmed that the message is a qualified procurement inquiry.

The system is not a CRM. It is a single-owner lookup and classification tool designed for both human review and AI-readable export.

## 2. Non-goals

V1 will not:

- read WhatsApp conversations or use the WhatsApp Business API;
- claim that every WhatsApp click became a message;
- install GA4;
- change Google Ads conversion actions, attribution settings, Primary/Secondary status, bidding, budgets, or campaign configuration;
- upload offline conversions to Google Ads;
- replace Yandex Metrica or merge its two counters;
- add a multi-user permission system, CRM pipeline, customer profile, or sales automation;
- store passwords, IP addresses, full WhatsApp messages, names, phone numbers, email addresses, or form contents in the attribution tables;
- change the existing `/api/contact`, Turnstile, email delivery, or conversion success semantics.

Offline qualified-lead import may be considered in a later, separately approved package after V1 produces reliable confirmed-inquiry data.

## 3. Existing contracts that remain unchanged

The following current behaviour is frozen and must remain intact:

- Google Ads form conversion destination: `AW-16777656395/Om_nCMCV4swcEMvwmsA-`;
- Google Ads WhatsApp-click conversion destination: `AW-16777656395/bovKCKOx088cEMvwmsA-`;
- the WhatsApp conversion fires once from the existing delegated `main.js` listener;
- the form conversion fires only after `/api/contact` returns a successful response;
- `/api/contact` keeps Turnstile verification, honeypot checks, email delivery, and its existing success/failure response meaning;
- the WhatsApp number remains `8619008225410`;
- all current language-specific and product-specific WhatsApp message text remains intact before the reference line is appended;
- Yandex counter `109483511` remains on its existing ordinary pages;
- Yandex counter `110874170` remains on its existing Russian specialist pages;
- no existing statistics ID is removed and no counter is added to pages that do not already load it.

Because this feature extends frozen form and Worker contracts, it must be delivered in a separate PR with automated tests, a non-production Preview, and an explicit rollback plan.

## 4. Confirmed owner decisions

- Architecture: Cloudflare D1 plus Cloudflare Access.
- Allowed administrator email: `chixiangmotor@163.com`.
- Browser first-touch retention: 90 days.
- D1 attribution retention: 180 days.
- Human status workflow: `whatsapp_clicked` → `message_received` → `qualified`.
- Query experience: one small internal page, not a CRM.
- AI experience: copy a stable text summary or download sanitized JSON.
- Main reporting source for cross-page lead attribution: D1.
- Yandex counters keep their current page boundaries.
- GA4 is not required for V1.

## 5. Architecture

### 5.1 Browser attribution module

Create `js/lead-attribution.js` as a focused classic-script IIFE following the repository's existing browser-module pattern. It exposes a small diagnostic API at `window.ChixiangAttribution` and owns no visual interface.

Responsibilities:

- create and validate an anonymous Lead ID;
- capture immutable first-touch attribution;
- capture the current session's conversion-touch attribution;
- track current and previous same-origin page paths;
- append one short reference line to a WhatsApp message at click time;
- decorate programmatically opened WhatsApp URLs through the same tested API;
- send a first-party event without blocking navigation;
- call the correct existing Yandex helper goal only where that counter is already active;
- expose sanitized diagnostics for Preview QA and future AI agents.

It must not call `gtag`, submit a form, read form contact fields, or prevent a WhatsApp click.

The script is loaded explicitly before `main.js` on every page that contains a WhatsApp link, a programmatic WhatsApp fallback, or an `/api/contact` form. A deterministic application script and invariant test maintain this inclusion; the business logic is never copied into individual HTML pages.

### 5.2 Worker modules

Keep routing and business responsibilities separate:

- `workers/contact-api/src/index.mjs`: route dispatch only;
- `workers/contact-api/src/attribution-handler.mjs`: validate and normalize attribution event requests;
- `workers/contact-api/src/lead-store.mjs`: D1 statements, transactions, deduplication, lookup, status changes, and retention cleanup;
- `workers/contact-api/src/internal-leads-handler.mjs`: owner lookup, recent records, sanitized JSON export, and status updates;
- `workers/contact-api/src/contact-handler.mjs`: retain current contact behaviour and add only the approved attribution fields and best-effort D1 success event.

### 5.3 Internal owner page

Create a small standalone page under `internal/leads/` with its own script and stylesheet. It is protected by Cloudflare Access and is intentionally independent of public-site navigation and styling.

Cloudflare Access is a deployment prerequisite for both the internal page and every `/api/internal/leads*` route. The Access policy allowlist contains only `chixiangmotor@163.com`. Neither the page nor the Worker implements a second password system, and the internal routes must not be exposed until the Access policy has been verified in Preview.

The owner surface is served only on an Access-protected hostname and path. The production Worker disables any public `workers.dev` route that could expose `/api/internal/leads*` without the same policy. Preview uses a separately protected test hostname; if that hostname and Access policy are not available, internal-page browser QA remains blocked rather than publishing an unprotected temporary URL.

The page provides:

- search by Lead ID;
- a recent-record list;
- first-touch and conversion-touch summaries;
- an event timeline;
- buttons to mark `message_received`, mark `qualified`, or undo the latest manual status;
- a "Copy for AI" action;
- a sanitized JSON download.

There are no user roles, notes, customer records, messaging functions, or campaign-editing controls.

### 5.4 D1

Use D1 rather than KV. D1 supports unique event constraints, event history, status transitions, date cleanup, and indexed Lead ID lookup without inventing a bespoke storage format.

The migration is additive and creates new tables only. It does not alter contact-email storage because no contact inquiries are currently persisted in a database.

## 6. Lead identity and browser storage

### 6.1 Lead ID

Format:

```text
CX-7K3P2M9Q4D
```

The suffix contains 10 characters from a non-ambiguous Crockford Base32 alphabet and is generated from cryptographically secure random bytes. It contains no timestamp, IP address, phone number, email, or other personal information.

The browser keeps the same Lead ID for 90 days. A new ID is created when the record expires, the visitor clears storage, storage is unavailable across sessions, or the stored object fails validation.

### 6.2 Persistent first touch

`localStorage` key: `cx_attribution_v1`

The stored object contains:

- `schema_version`;
- `client_version`;
- `lead_id`;
- normalized first source and raw source evidence;
- first landing path;
- first external referrer domain and sanitized referrer path;
- allowlisted UTM and click-ID fields;
- language;
- client-observed first-visit time;
- expiry time.

The first-touch fields are immutable until expiry.

### 6.3 Session conversion touch

`sessionStorage` key: `cx_attribution_session_v1`

The session object contains:

- session source and raw source evidence;
- session landing path;
- allowlisted UTM and click-ID fields for the current entry;
- previous same-origin path;
- current path;
- session start time.

This second attribution view is necessary because a buyer may first discover the site directly and later return through a paid campaign that produces the inquiry. The UI therefore shows both "First source" and "Inquiry-session source".

### 6.4 Storage failure

If Web Storage is blocked or throws, the module creates an in-memory Lead ID for the current document and reports `storage_available: false` in diagnostics. WhatsApp and forms continue to work. Persistence is presented as unavailable rather than falsely claimed.

## 7. Source classification

Classification order:

1. recognized advertising click ID;
2. explicit UTM parameters;
3. recognized external referrer;
4. Direct.

Rules:

| Evidence | Normalized source |
| --- | --- |
| `gclid`, `gbraid`, or `wbraid` | Google Ads |
| `msclkid` | Microsoft Ads |
| `yclid` | Yandex Ads |
| `ttclid` | TikTok Ads |
| `fbclid` without decisive UTM medium | Meta click, paid status unknown |
| Google search hostname without advertising evidence | Google Organic |
| Bing search hostname without advertising evidence | Bing Organic |
| `chatgpt.com`, `chat.openai.com`, `openai.com` | ChatGPT |
| `perplexity.ai` | Perplexity |
| `claude.ai` | Claude |
| `gemini.google.com` | Gemini |
| Facebook or Instagram hostname | Meta Social |
| TikTok hostname | TikTok Social |
| no external referrer and no campaign evidence | Direct |
| any other external hostname | Referral |

Gemini matching is evaluated before the general Google rule. Internal referrers never replace the session entry source. Raw evidence is retained in normalized, length-limited fields so classification rules can be audited later.

## 8. URL and field sanitation

Persist only:

- lowercase hostname;
- normalized pathname;
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`;
- `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `yclid`, `ttclid`;
- language, product code/category, and CTA identifier from controlled page metadata.

Do not persist URL fragments or unknown query parameters. Do not accept a page-provided country value for WhatsApp attribution. The Worker may store `request.cf.country` as a two-letter edge estimate while explicitly labelling it `cloudflare_edge`; it never stores `CF-Connecting-IP`.

All strings use strict maximum lengths. Lead IDs, event types, languages, status values, CTA identifiers, and country codes use allowlists. Full raw request objects are never logged.

## 9. WhatsApp behaviour

At click time, one delegated capture-phase listener handles current and dynamically generated links matching either:

- `wa.me`;
- `api.whatsapp.com`.

The handler:

1. identifies the clicked anchor and controlled CTA/product metadata;
2. parses the URL with the platform URL API;
3. preserves the approved number and existing localized `text` value;
4. appends exactly one blank line and `Ref: CX-...`;
5. supplies a short language-appropriate default inquiry only when no text exists;
6. writes the final URL back synchronously before the browser's default navigation;
7. sends the attribution event by `navigator.sendBeacon` with one `fetch(..., {keepalive: true})` fallback;
8. calls only the explicitly declared, already active page-specific Yandex goal;
9. never prevents default navigation and never calls Google Ads.

The existing bubble-phase `main.js` WhatsApp listener remains the only Google Ads WhatsApp conversion caller.

`window.ChixiangAttribution` also exposes a narrow `decorateWhatsAppUrl(url, context)` method for the existing `window.open` form-fallback path. That method applies the same number validation, localized default, and exactly-one-reference rules. It does not open a window, call Google Ads, or silently turn a failed form submission into a tracked form conversion.

The event is named `whatsapp_click`, not `whatsapp_inquiry`.

## 10. Form behaviour

Immediately before an existing form creates its `FormData`, the shared browser logic adds or updates hidden attribution fields:

- `lead_id`;
- `first_source`;
- `session_source`;
- `landing_page`;
- `session_landing_page`;
- `first_referrer_domain`;
- `previous_page`;
- `last_page`;
- allowlisted UTM and click-ID fields;
- `attribution_client_version`.

The Worker extends its explicit normalization allowlist and renders the new attribution section in both text and escaped HTML email output.

The order remains:

1. validate required form data;
2. verify Turnstile;
3. send the email;
4. after email success, schedule `form_submitted_successfully` as a best-effort D1 write with the Worker execution context's `waitUntil`;
5. return the existing successful response body and status without waiting for D1;
6. allow the existing client to fire the Google Ads form conversion once after that response.

A D1 failure after successful email delivery is logged by the background task but never changes a successful contact response into a failure. The route dispatcher therefore accepts the Worker execution context and passes a small background-task adapter into the contact handler; tests use an injected deterministic adapter rather than real email, Turnstile, or D1 services.

## 11. D1 data model

### 11.1 `leads`

One row per Lead ID:

- identity and schema/client version;
- immutable first-touch fields;
- first client timestamp and first server timestamp;
- Cloudflare country estimate and provenance;
- current status;
- message-received and qualified timestamps;
- created, updated, and expiry timestamps.

The table does not contain form contact details or chat contents.

### 11.2 `lead_events`

Append-only event history:

- unique `event_id`;
- unique `dedupe_key`;
- Lead ID foreign key;
- event type;
- session/conversion source fields;
- page, previous page, product/category, CTA, and language;
- sanitized campaign fields and click IDs;
- client timestamp and authoritative server timestamp.

Allowed V1 event types:

- `whatsapp_click`;
- `form_submitted_successfully`;
- `status_message_received`;
- `status_qualified`;
- `status_reverted`.

### 11.3 Deduplication

Each browser event has a cryptographically random `event_id`. The Worker also derives a deduplication key from Lead ID, event type, conversion page, CTA identifier, and a five-second time bucket. D1 unique constraints make identical retries idempotent and collapse rapid double clicks without suppressing later intentional clicks.

## 12. HTTP surface

Public same-origin event endpoint:

```text
POST /api/attribution/whatsapp-click
```

It accepts only a compact JSON payload, uses strict validation and limits, and returns a small no-store JSON result. Invalid or unavailable attribution must never affect navigation.

Owner-only endpoints protected by Cloudflare Access:

```text
GET  /api/internal/leads?lead_id=CX-...
GET  /api/internal/leads/recent?limit=50
POST /api/internal/leads/status
GET  /api/internal/leads/export?lead_id=CX-...
```

The status endpoint accepts only the allowed transitions and does not accept arbitrary notes. The export endpoint returns sanitized AI JSON and does not return raw advertising click IDs by default; it reports presence booleans instead.

The existing Worker route configuration is expanded only for the new exact `/api/attribution/*` and `/api/internal/leads*` paths. `/api/contact` keeps its current handler. The internal static page is served by the existing site pipeline and is not linked from public navigation.

## 13. Internal page and AI output

The human result shows:

- Lead ID and current status;
- first source and inquiry-session source;
- landing, previous, and conversion pages;
- product/category, CTA, language, and Cloudflare country estimate;
- campaign names and whether supported click IDs were present;
- first visit, WhatsApp click, message-confirmed, and qualified timestamps;
- a compact event timeline.

The AI JSON uses stable snake_case keys and ISO 8601 UTC timestamps. It includes no HTML, phone number, email address, raw form content, IP address, or full click ID. The "Copy for AI" text includes a schema version so an agent can identify future format changes.

## 14. Status workflow

Automatic:

```text
new D1 lead + whatsapp_click event → whatsapp_clicked
successful form submission → message_received
```

Manual owner actions:

```text
whatsapp_clicked → message_received
message_received → qualified
qualified or message_received → previous status through one explicit revert action
```

The database records a timestamped status event for every manual transition. It does not store an operator identity because V1 has exactly one Access-authorized owner.

`form_submitted_successfully` is stronger evidence than a click, so it creates or advances the lead to `message_received` without requiring a WhatsApp reference. The undo control applies only to the latest manual status transition; it never reverses the automatic fact that a form was successfully delivered.

A message is considered attributable only when the received WhatsApp text still contains a valid `CX-...` reference. A click without a received reference remains a click.

## 15. Yandex and Google Ads

### 15.1 Google Ads

The new browser module never calls `gtag`. Existing form and WhatsApp click conversions remain unchanged and are protected by regression tests.

V1 records the Google click IDs needed for a possible later offline qualified-lead import, but performs no upload and changes no Ads setting. A later package may introduce a separate `qualified_lead` conversion only after the owner has enough confirmed records and Google Ads access has been audited.

### 15.2 Yandex Metrica

No counter is added or removed.

- ordinary pages already using `109483511` emit `whatsapp_click` to that same counter and no other counter;
- Russian specialist pages keep their existing `110874170` `ym-open-chat` behaviour;
- pages without a Yandex counter rely on D1 for attribution;
- D1, not Yandex, is the cross-site lead source of truth.

If access to `109483511` remains unavailable, the D1 system can still launch and the browser call can be verified locally, but receipt of the main-counter goal is recorded as a known external configuration gap rather than falsely reported as verified. Production release must not claim that this Yandex goal is collecting until counter access or an owner-provided report confirms it.

Counter selection is explicit, never inferred from the presence of a global `ym` function. Page inclusion records the already-existing counter ID in controlled metadata: the attribution module calls `ym(109483511, 'reachGoal', 'whatsapp_click', ...)` only when that metadata says `109483511`; it does not emit the new goal on `110874170` pages. The existing Russian helper remains the sole source of `ym-open-chat`.

## 16. Error handling and observability

Stable Worker result codes:

- `invalid_payload`;
- `invalid_lead_id`;
- `event_already_recorded`;
- `database_unavailable`;
- `unauthorized`;
- `lead_not_found`;
- `invalid_status_transition`.

Logs contain only request ID, Lead ID, event type, route, result code, and exception class/message. They exclude IPs, contact fields, campaign values, referrers, and request bodies.

`window.ChixiangAttribution.getDiagnostics()` returns a sanitized object containing module version, Lead ID, storage availability, normalized sources, page paths, and the last event-send result. It does not expose raw click IDs.

The internal page displays a small service state from its latest API call; it does not implement a separate monitoring platform.

## 17. Retention

- Browser attribution expires after 90 days.
- D1 leads and their events expire after 180 days, including qualified leads.
- A scheduled Worker task deletes expired event rows first and then expired lead rows in bounded batches.
- Cleanup failure is logged and retried at the next scheduled run; it never blocks event ingestion.

V1 adds a concise factual disclosure beside the existing contact/privacy notice on the five language contact pages: the site stores an anonymous reference and limited source information for up to 90 days in the browser and 180 days on the service to associate inquiries with their source. This is a product disclosure, not a claim of jurisdiction-specific legal compliance; translated wording must receive owner review before production.

## 18. Tests and acceptance

### 18.1 Unit tests

- every source-classification rule and precedence case;
- first-touch immutability and 90-day expiry;
- session-touch replacement and internal-referrer handling;
- malformed and unavailable storage;
- Lead ID format and randomness adapter;
- URL sanitization and field limits;
- localized WhatsApp defaults and exactly-one Ref behaviour;
- D1 normalization, deduplication, lookup, status transitions, and retention cleanup.

### 18.2 Integration and regression tests

- static and dynamically generated `wa.me` links;
- `api.whatsapp.com` links;
- EN, ES, PT, RU, and AR pages;
- double click and identical retry;
- attribution send failure without navigation failure;
- Google Ads WhatsApp conversion remains exactly once;
- form conversion remains after successful Worker response only;
- Turnstile, contact validation, email formatting, and error responses remain unchanged;
- Yandex goals fire only for the page's active counter;
- every page with WhatsApp or `/api/contact` loads the attribution module exactly once and before `main.js`;
- internal endpoints require Access in Preview configuration;
- AI JSON excludes raw click IDs and contact data.

### 18.3 Preview scenarios

Use a non-production D1 database and do not send a real WhatsApp message or production form:

1. Google Organic → `/en/` → `/en/cg-engine` → WhatsApp;
2. Facebook UTM campaign → multiple pages → WhatsApp;
3. Direct → WhatsApp;
4. Spanish page → WhatsApp;
5. successful and failed isolated form submissions;
6. first Direct visit → later Google Ads session → WhatsApp;
7. storage disabled;
8. D1 unavailable;
9. dynamic Algeria, LATAM, Central Asia, and Russian WhatsApp messages;
10. owner lookup, status transitions, AI copy, and JSON download.

Acceptance requires the existing targeted tracking and contact tests plus the full site and Worker test suites to pass.

## 19. Delivery sequence

1. Add failing browser-core and source-classification tests.
2. Implement the isolated browser attribution module without enabling it on pages.
3. Add the D1 migration, store, and Worker event tests.
4. Implement event ingestion and retention cleanup.
5. Add owner endpoints and the internal query page behind Preview Access.
6. Add page inclusion machinery and invariants.
7. Integrate the WhatsApp Ref path while preserving existing conversions.
8. Extend form fields, email output, and successful-form D1 event.
9. Complete targeted and full automated verification.
10. Deploy one non-production Preview with its own D1 database and Access policy.
11. Perform browser QA and hand the evidence to the owner/reviewer.
12. Merge and production deployment require separate explicit authorization.

The current Package C branch remains frozen. Attribution work stays isolated in `codex/inquiry-attribution-v1` and must not be pushed as part of Package C.

This implementation branch is intentionally based on Package C candidate `44ce7a5a5db38b1eab21f12d12ec07e7d03d94be`. It may be developed and tested in isolation, but a merge PR must not be opened against a `main` that lacks that reviewed base because the resulting diff would mix packages. When implementation is ready, the base relationship is checked once; if `main` has not incorporated the required base (or an explicitly accepted equivalent), the branch remains Preview-only and no automatic rebase, merge, or history rewrite is performed.

## 20. Rollback

Rollback is additive and ordered:

1. remove or disable the page inclusion of `lead-attribution.js`;
2. disable the new attribution and internal routes;
3. leave `/api/contact`, Google Ads, Yandex, WhatsApp links, and form behaviour on their pre-feature code paths;
4. retain the D1 database temporarily for evidence and recovery rather than deleting it during rollback;
5. remove D1 data only through a separately authorized retention or deletion action.

Because the migration does not alter existing tables and the event calls are non-blocking, disabling the new routes and browser module restores the previous user-facing behaviour without a destructive database rollback.
