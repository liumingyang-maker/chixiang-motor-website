# Multilingual Contact Procurement Owner Report

## Scope

This change governs the five canonical Contact owner pages:

| Language | Canonical URL | Source file |
| --- | --- | --- |
| English | `https://chixiangmotor.com/en/contact` | `en/contact.html` |
| Spanish | `https://chixiangmotor.com/es/contacto` | `es/contacto.html` |
| Portuguese | `https://chixiangmotor.com/pt/contato` | `pt/contato.html` |
| Russian | `https://chixiangmotor.com/ru/kontakty` | `ru/kontakty.html` |
| Arabic | `https://chixiangmotor.com/ar/contact` | `ar/contact.html` |

The pages now use raw, localized HTML as form-first B2B procurement owners. Header, Footer, canonical URLs, hreflang, the shared Contact Worker and success-only conversion logic remain unchanged.

## Public product and application scope

Product choices:

- Horizontal engine family
- CG engine family
- CB engine family
- Engine parts
- Multiple families / request a recommendation

Application choices:

- Motorcycle
- Cargo tricycle
- ATV / off-road vehicle
- Replacement market
- Assembly project
- Other B2B application

The form does not present complete motorcycles or complete cargo tricycles as currently supplied products.

## Form contract

Required:

- Name
- Company
- Primary contact
- Destination country or market
- Product interest
- Expected quantity
- Application

Optional:

- Email
- Models, configuration and other requirements

Each page posts to `/api/contact`, has a unique `source_form`, and sets `data-whatsapp-fallback="false"`. A failed submission retains the entered values and offers retry or Email instead of automatically opening WhatsApp.

## Contact hierarchy

| Language | Supplemental channel order | Mobile fixed actions |
| --- | --- | --- |
| English | Email → WeChat → WhatsApp → Phone | Inquiry form → Email |
| Spanish | Email → WhatsApp → WeChat → Phone | Inquiry form → Email |
| Portuguese | Email → WhatsApp → WeChat → Phone | Inquiry form → Email |
| Russian | Email → WeChat → WhatsApp → Phone | Inquiry form → Email |
| Arabic | Email → WhatsApp → WeChat → Phone | Inquiry form → Email |

The existing floating WhatsApp control remains available as an optional user-initiated channel.

## Fact and Schema boundaries

The pages do not publish a universal MOQ, sample quantity, price, stock promise, shipping period or delivery period. Page metadata and visible H1 content describe B2B procurement without adding unapproved commercial numbers.

Each page retains safe `ContactPage` and `BreadcrumbList` structured data. No `Product`, `ProductGroup`, `Offer`, `Review` or `AggregateRating` record was added.

## Protected implementation

The following approved runtime files remain byte-identical:

| File | SHA-256 |
| --- | --- |
| `js/main.js` | `d685fefc94ae57b27e470335b315d8cfacf8b8f6de56e3db8eebfbc391227ba8` |
| `js/yandex-metrica.js` | `7ff3c32d95e7672476cb33f4b3b3ee90880a5dceeb6ca1c9af342ca3d59f9608` |
| `workers/contact-api/src/contact-handler.mjs` | `c1315daccefc0f8543398ccf393d0eb916e5c4d6093aae1ecc875f3d82d115f5` |
| `workers/contact-api/src/index.mjs` | `d24cf2d2dc596265d57c9011909e2a0cf567fc8a2d1eee816f4c97f46c151c42` |

This change does not alter Turnstile verification, email delivery, Google Ads success-only conversion or Yandex lead-goal behavior.

## Automated verification

Completed before publishing:

- Contact owner contract: 10/10 passed.
- Contact/form/Google/Yandex focused regression set: 61/61 passed.
- Cloudflare Worker suite: 13/13 passed.
- Safe Schema, breadcrumb and governance checks: 23/23 passed.
- Deterministic Contact owner generator: zero drift.
- Deterministic site entity graph generator: zero drift.

The final full-suite total is recorded in the PR after the publish candidate commit.

## Browser verification

All five local pages were checked at:

- `390 × 844`
- `768 × 1024`
- `1440 × 1000`

Results across all 15 route/viewport combinations:

- Document width equals viewport width; no horizontal overflow.
- Exactly one visible H1.
- Form action is `/api/contact`.
- Company, quantity and application are required.
- Mobile actions are Inquiry form first and Email second.
- Supplemental contact channel order matches the approved language policy.
- Arabic remains RTL.
- No missing images.
- The obsolete English map placeholder is absent.

The local browser reports Cloudflare Turnstile error `110200` because `127.0.0.1` is not an approved Turnstile hostname. This is expected in local static preview and does not modify the production/Preview integration.

## Cloudflare Preview

Actual Preview URLs are added here only after GitHub/Cloudflare returns the deployed host:

- English: pending
- Spanish: pending
- Portuguese: pending
- Russian: pending
- Arabic: pending

## Submission safety

No real production inquiry was submitted during this implementation. Local and Preview acceptance uses source, DOM, HTML validation and integration regression tests only.

## Rollback

The complete change is contained in one Pull Request and can be rolled back with:

```text
git revert <merge-commit>
```

The PR must remain unmerged until the five Cloudflare Preview pages have been handed to the site owner for one-pass review.
