# Spanish Peru and Colombia landing-page design

## Goal

Create two local, reviewable Spanish Google Ads landing-page previews without changing the existing Russian site, Central Asia landing page, Spanish main site, sitemap, or production deployment.

The new routes are:

- `/es/peru/` for Peru
- `/es/colombia/` for Colombia

Both pages promote verified CG engine families and collect wholesale inquiries through the existing WhatsApp and form patterns. They must not invent MOQ, delivery periods, stock, compatibility, certifications, local warehouses, or technical specifications.

## Architecture

Use one reusable static landing-page system rather than duplicate country pages:

- two route-specific HTML files for SEO metadata, `lang`, canonical URL, and page shell;
- one shared Spanish landing stylesheet;
- one shared interaction script for navigation state, galleries, FAQ, product selection, sticky mobile CTA, form context, and WhatsApp links;
- one shared product-data module containing only verified reusable product/galleries/factory-media references;
- one market configuration module per page, containing local copy, default country, SEO metadata, form options, product order, and WhatsApp templates.

This keeps country wording and lead context out of scattered HTML while allowing each page to index and convert independently.

## Shared page flow

1. Header
2. Hero
3. Trust statistics
4. Application selector
5. Quick comparison
6. Replacement-engine helper
7. Product details
8. Delivery and factory support
9. Order process
10. FAQ
11. Quote form
12. Footer

Stable anchors are used for models, comparison, replacement, delivery, factory, FAQ, and quote. The fixed header height is applied as `scroll-margin-top` so headings remain visible after navigation.

## Visual system

Use the established navy, blue, white, pale-blue-grey and WhatsApp-green palette. Reuse real engine and factory assets from the Central Asia page.

- Peru receives a restrained Andes/road atmosphere in the hero only, with HTML product labels and no embedded text in imagery.
- Colombia uses a cleaner, lighter industrial-blue hero treatment suited to daily work, replacement, and after-sales.
- Product images are rendered as transparent assets or inside a single unified low-opacity display area; no three-card white-image collage.
- Factory media uses only confirmed project photos. If a required real image is unavailable, the page shows a neutral media placeholder rather than a stock image.

## Market differences

### Peru

- Hero: `Motores CG 150/200 cc para motos y trimotos de carga`.
- Main product focus: CG150, CG200, and a cargo/high-load configuration selection.
- Applications: work motorcycles, cargo trimotos, replacement/intensive work.
- Form defaults to Peru and uses 150 cc / 200 cc selection.
- Replacement CTA sends photo, code, vehicle context, market and source to WhatsApp.

### Colombia

- Hero: `Motores CG 125/150 cc para motos de trabajo y reemplazo`.
- Main product focus: CG125, CG150, and a replacement/after-sales selection service.
- CG Heavy is not positioned as a principal Colombia product.
- Applications: urban/work motorcycles, delivery/commercial use, replacement/after-sales.
- Form defaults to Colombia and uses 125 cc / 150 cc selection.

## Lead and tracking behaviour

The pages reuse the existing Google Ads conversion identifier `AW-16777656395` through the established page mechanism. A single click handler records CTA context without adding a second conversion binding.

All product, hero, replacement, form, and mobile CTA WhatsApp links receive market, selected product, selected application, source, UTM parameters, and GCLID when present. Users are asked to send photos through WhatsApp; no page image-upload feature is introduced.

The form includes required name, WhatsApp, country, application, displacement and estimated quantity, with optional vehicle/model, engine code, email and requirements. Local static preview may show Turnstile limitations, but the form layout, labels and payload context remain functional.

## Responsive behaviour

- Desktop (1200px and above): full navigation, two-column hero, complete comparison table, alternating product cards, no sticky CTA.
- Tablet (768px to 1199px): compact header, responsive hero, comparison cards or adaptive grid with no clipped content, and no sticky CTA.
- Mobile (below 768px): concise text-first hero, product-summary/accordion treatment, touch-friendly galleries and FAQ, single-column form, and a contextual sticky WhatsApp CTA. The CTA appears only after the hero and hides near form/footer, during typing, and while FAQ content is open.

No target viewport may produce page-level horizontal scrolling, header-covered anchor titles, or a fixed CTA covering page content.

## SEO and accessibility

Each route has one H1, its required `lang` value (`es-PE` or `es-CO`), title, description, canonical, hreflang links for `es-PE`, `es-CO`, `es`, and `x-default`. Sitemap changes are deferred until the user approves release.

Interactive controls have visible focus states, 44px minimum touch targets where practical, and `aria-expanded`/`aria-controls` for accordions and galleries. All labels and errors are Spanish with correct accents.

## Verification and delivery

Before the user reviews the preview, run the existing test suite/build checks and inspect local renders at 320, 360, 390, 430, 768, 820, 900, 1024, 1366, 1440 and 1920 pixel widths. Provide desktop, tablet and mobile screenshots for both routes. Do not commit, push, deploy or amend sitemap until the user explicitly approves the preview.
