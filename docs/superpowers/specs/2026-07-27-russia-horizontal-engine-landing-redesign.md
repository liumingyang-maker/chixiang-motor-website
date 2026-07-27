# Russia Horizontal Engine Landing Page Redesign

## Goal

Turn `/ru/gorizontalnyj-dvigatel.html` into a focused Russian-language B2B landing page for wholesale horizontal motorcycle engines while preserving the useful product, specification, comparison, factory, and inquiry content already on the page.

This is an independent change from PR #12. It must not modify `/ru/russia/` or reuse the PR #12 branch.

## Audience and qualification

The primary audience is distributors, importers, repair-parts wholesalers, motorcycle assemblers, and other businesses that can purchase in bulk.

The page must consistently present:

- factory wholesale supply;
- pricing from USD 99 per unit;
- MOQ 50 units;
- mixed-model orders;
- OEM/ODM support;
- delivery to a customer-designated freight forwarder or warehouse in China.

The page must not promise delivery to Russia within 15–25 days. The customer is encouraged to use their own China freight forwarder.

Purchase quantity is required in the inquiry form, but it is lead-quality information rather than a hard validation threshold. A quantity below 50 must not prevent submission.

## Header and hero

Use a minimal landing-page header:

- CHIXIANG MOTOR logo;
- WhatsApp action;
- inquiry action that scrolls to the same-page form.

Do not include the full site navigation or language menu in the landing header.

Use the supplied landscape artwork on desktop and landscape tablets, and the supplied portrait artwork on phones and portrait tablets. Both artworks have no embedded top-left logo. Keep the branding on the rider and motorcycle visible.

Approved hero copy:

- `Горизонтальные двигатели оптом с завода`
- `От $99 за единицу · MOQ 50 шт. · Смешанные модели`
- `Только оптовые поставки и OEM/ODM`

WhatsApp is the primary action. The same-page inquiry form is the secondary action. WeChat remains a supplementary high-intent channel but is not placed in the header or mobile sticky bar.

The USD 99 price must always appear with the MOQ and wholesale qualification. It must not be presented as the price of every model.

## Product and specification content

Keep the existing horizontal-engine models and useful technical content:

- 152FMH;
- 153FMI;
- 154FMI;
- 1P56FMJ;
- 110 cc, 125 cc, and 140 cc configurations;
- starter variants and existing compatibility/specification information.

Each product card must include a product image, model, displacement, primary specifications, use case, and quote action. A product quote action scrolls to the form and preselects that model.

Do not put USD 99 on each model card. Use a neutral wholesale-quote action instead.

On desktop, retain a structured comparison table. On mobile, present comparison data as readable model cards rather than requiring horizontal table scrolling.

Use CHIXIANG MOTOR in page copy. Existing product artwork that contains CX MOTOR may remain unedited.

## Factory proof

The following facts are confirmed as true and public:

- founded in 2003;
- ISO 9001;
- exports to more than 50 countries;
- 15,000 m² factory in Chongqing;
- monthly capacity of 8,000 engines;
- casting, assembly, bench testing, and pre-shipment inspection.

Present these facts with real factory/certification images already in the repository. Replace emoji cards and aggressive “factory vs middleman” claims with objective benefits of working directly with the manufacturer.

The delivery statement is limited to shipment to a customer-designated China freight forwarder or warehouse.

## Inquiry flow

Embed a real Russian-language inquiry form on the page and reuse the existing `/api/contact` Worker, Cloudflare Turnstile, honeypot, failure fallback, and shared form initializer.

Required fields:

- name;
- company;
- contact method/value (WhatsApp, WeChat, or email);
- product/model selection;
- expected purchase quantity;
- whether the buyer already has a freight forwarder in China.

Optional:

- OEM/ODM and other requirements.

The form must carry the source page, source form, source CTA, and existing advertising-attribution fields through the shared pipeline.

Google Ads and Yandex tags both remain on this page. Successful form submission may fire each configured lead conversion once. Validation failure, Turnstile failure, network failure, and Worker/email failure must not fire a lead conversion. Duplicate clicks during a pending request must not create duplicate submissions.

## Responsive behavior

- Desktop: landscape hero, left-aligned copy, complete comparison table.
- Tablet: responsive two-column product/factory layouts with readable controls.
- Mobile: portrait hero, compact copy, model comparison cards, and a two-action sticky bar containing WhatsApp and inquiry only.
- WeChat appears in the hero as a supplementary text link and in the final contact area, but not in the header or sticky bar.
- The page must have no horizontal overflow and remain usable with keyboard navigation and reduced-motion preferences.

## SEO and scope

Preserve the existing canonical URL and sitemap entry. Update Russian title and description to match wholesale intent and remove the unsupported Russia delivery-time claim.

Do not change:

- `/ru/russia/`;
- the contact Worker contract or secrets;
- site URL structure;
- redirects, robots rules, or unrelated pages;
- shared site styling unless a verified compatibility fix is required.

## Delivery

Implement on `feature/russia-horizontal-engine-landing-redesign`, based on current `main`, in an isolated worktree.

Use a page-scoped stylesheet and a small page-scoped interaction script. Add regression tests for content, assets, responsive contracts, form fields, product-to-form selection, tags, and conversion safety. Verify locally at phone, tablet, and desktop widths before creating a draft pull request. Do not merge the pull request.
