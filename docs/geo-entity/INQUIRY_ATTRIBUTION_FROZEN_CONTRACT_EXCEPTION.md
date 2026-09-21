# Inquiry Attribution V1 — Frozen Contract Exception

## Owner approval

On 2026-09-21 the Site Owner approved the written Inquiry Attribution V1 design and authorized implementation on the separate `codex/inquiry-attribution-v1` branch.

The Foundation baseline remains `5ce9254ab1ecd84dc9268efb55b9acaad7feb13d`. This record does not replace that baseline and does not remove any file from the frozen registry. It records one narrow, reviewable exception required to extend inquiry attribution.

## Authorized frozen files

- `ads/algerie/index.html` — load the shared attribution module without changing the Algeria offer, form, Turnstile, SEO or Ads behaviour.
- `js/main.js` — pass the existing programmatic WhatsApp fallback URL through the shared Ref decorator; keep both Google Ads conversion calls and their firing conditions unchanged.
- `workers/contact-api/src/contact-handler.mjs` — add allowlisted attribution fields to inquiry email and schedule D1 persistence only after successful email delivery.
- `workers/contact-api/src/index.mjs` — dispatch the new exact attribution/internal routes and scheduled retention cleanup while preserving `/api/contact`.
- `workers/contact-api/wrangler.jsonc` — add only the approved route, D1, schedule and Preview configuration needed by this package.

Every other frozen file remains byte-protected against the fixed baseline.

## Required safeguards

- Delivery occurs in a separate PR; it must not be mixed into Package C.
- Automated tests preserve the existing Google Ads destinations, one-click semantics, Turnstile validation, email delivery order, contact response meaning, Yandex counter boundaries and Algeria product/form facts.
- D1 failure must never convert successful email delivery into a failed form response.
- The owner interface and its API require a verified Cloudflare Access policy allowing only `chixiangmotor@163.com` before Preview evidence can be accepted.
- Preview must use non-production data and must not submit a real form or send a WhatsApp message.
- Merge, production deployment and Ads changes require separate authorization.

## Preview gate

The reviewer receives the complete patch, site and Worker test summaries, the final candidate SHA, non-production D1 evidence, Access allow/deny evidence, and browser checks for source retention, Ref decoration, form attribution and owner lookup.

## Rollback

1. Remove the generated `lead-attribution.js` page inclusions.
2. Revert the small `main.js` fallback adapter.
3. Disable the new attribution/internal Worker routes and schedule.
4. Restore the pre-feature contact-handler path while keeping email delivery and Turnstile untouched.
5. Retain D1 temporarily for evidence and recovery; deletion requires separate authorization.

This restores the previous public behaviour without rewriting Git history or destructively rolling back the database.
