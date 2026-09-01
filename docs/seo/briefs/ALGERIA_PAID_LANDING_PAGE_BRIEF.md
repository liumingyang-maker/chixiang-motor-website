# Page Brief - Algeria Paid Landing (V1)

Date: 2026-08-28. Branch: `ads/algeria-paid-landing-v1`. Base: `556f5ce65d624b2d2e1f11e597e0f2ef1143f507`.
Implements `docs/superpowers/specs/2026-07-30-b2b-landing-page-standard-design.md` section 11.
This is the decision record for `https://chixiangmotor.com/ads/algerie/`.

## Brief table

| Field | Value |
|---|---|
| URL | `https://chixiangmotor.com/ads/algerie/` (file `ads/algerie/index.html`) |
| Page state | `TEST_NOINDEX` - `noindex,follow`, outside sitemap / manifest / matrix |
| Country / language | Algeria / French (first FR document on the site; no FR locale architecture created) |
| Primary entity | Algeria + CG and CB motorcycle engine families + B2B import |
| Owner pages | Not linked from this page in V1 by owner decision (Arabic governance debt) - company facts live here under `COMPANY_FACT_PACK` ids only |
| Target buyers | Importateur, distributeur, grossiste, assembleur, revendeur de pieces |
| Secondary | Serious replacement-engine and B2B parts buyers |
| Not targeted | Consumers, repair-information seekers, used-engine shoppers, scooter-only buyers |
| Search / ad intent | "Where do I buy CG/CB motorcycle engines in quantity for the Algerian market" |
| Product facts | `model-cg125|cg150|cg175|cg200|cg250`, `model-cg150sb|cg175sb|cg200sb|cg250sb`, `model-cb150|cb200-c|cb250`, `model-152fmh|153fmi|154fmi|1p56fmj|1p60fmj`, `intake-automatic-clutch-water`, `intake-cg-balance-shaft` |
| Company facts | `history-founded-year`, `address-factory`, `facility-area-square-meters`, `facility-employee-count`, `capacity-monthly-engines`, `quality-first-pass-yield`, `certification-iso-9001`, `certification-ccc`, `capability-oem-odm`, `capability-testing`, `capability-engine-parts-support`, `contact-*` |
| Commercial policy | NONE published. No MOQ, no sample minimum, no mixed-order threshold, no lead time, no stock, no price. Wording: quantity / configuration / conditions confirmed per model and project |
| Primary CTA | On-page form `#offre` (all headers, hero and product CTAs land on the same form) |
| Secondary channels | WhatsApp `+86 190 0822 5410` (approved number), e-mail `chixiangmotor@163.com` |
| Tracking | Google Ads `AW-16777656395` base + the two existing labels owned by `js/main.js`. No Yandex on this page. No new label, no new counter |
| Images | Real repo assets only: `cg.../1.webp`, `.../6kjzxqqh.webp`, `CB/1.webp`, `parts.webp`, `.../3504ab0b-...webp`, `factory-showcase/factory-2..6.webp`, `logo.webp` |
| Forbidden claims | 24 h or any SLA; MOQ / sample / price / lead-time / stock; strong torque; low vibration; any kW/ch/Nm/top-speed/lifetime figure; CG = OHV vs CB = OHC; horizontal actual displacement, bore, stroke; `50cc-125cc`; `CG150B`; universal or model-independent fit; cargo tricycle as a horizontal application; complete motorcycles or complete tricycles as current supply; certificate numbers, versions, scope or validity; certificate images; "founded in 2003"; 18-pole magneto wording; best-selling / leading / cheapest; Bajaj or TVS compatibility in either direction |
| Success criteria | HTTP 200 on the trailing-slash URL; self-contained FR page; one form path; conversion only after Worker success; no horizontal overflow at 390 / 768 / 1024; Lighthouse median LCP under 4 s and CLS at or under 0.10 |

## Form contract actually used

Submitted names, all natively supported by `contact-handler.mjs normalizeInquiry()`:
`website` honeypot, hidden `market=Algeria`, hidden `country=Algeria`, `source_form=ads_algerie_fr`, `source_cta`,`requirements`,
then `name`, `company`, `contact`, `country`, `email`, `product_interest`, `displacement`, `quantity`,
`application`, `vehicle`, `engine_code`, `message`. `page_url` and `site_language` are injected by `js/main.js`.

Deliberate mappings (no backend change):
- `country` is submitted as the fixed value `Algeria` so lead segmentation, CRM export, market reporting and
  reuse across countries stay stable. The visitor's Wilaya / Ville is a visible control (`id="wilaya"`, no submitted
  name) that `js/algeria-landing.js` serialises into `requirements` as `Wilaya: ...`. Consequence: with JavaScript
  blocked the wilaya is not transmitted, while `country=Algeria` always is.
- `Type d'entreprise` has no backend field, so its select carries **no name attribute**; `js/algeria-landing.js`
  writes it into `requirements` as a compact `Key: value; ...` line at submit.
- The Worker reads `contact` first and only falls back to `email`, and the e-mail template has no separate
  Email row, so the optional e-mail address is mirrored into `requirements`.
- `requirements` is machine-composed and `message` keeps the buyer's own wording verbatim, so free text is
  never overwritten. Note the Worker collapses all whitespace and truncates at 2000 characters, therefore the
  compact line uses `; ` separators rather than line breaks.
- `vehicle` carries "which motor families or brands do you sell today", which is the platform-match question.

## Internal lead scoring (never shown to visitors)

`PLATFORM_MATCH` is applied by sales on the received fields, not by the page:
- HIGH: mentions CG, CB, CX, common Chinese engine codes (156FMI, 162FMJ, 162FMK, 163FML, 167FMM, 152FMH,
  1P56FMJ, 1P60FMJ) or "moteur chinois" families.
- MEDIUM: displacement plus application are clear but the platform is unspecified.
- LOW: an explicit Bajaj, TVS, Boxer, Apache, Piaggio or Keeway platform, or OEM-only part numbers -
  kept for manual review and answered by asking for engine code, mounting positions and photos.
- UNKNOWN: no platform information supplied.
An Indian-platform mention is a flag, never an automatic disqualification.

## Attribution and conversion

- `utm_source|medium|campaign|term|content` plus `gclid|gbraid|wbraid` are read at page load into module state
  and written into hidden inputs at load and again at submit, following `js/latam-cg-landing.js`. This avoids the
  Central Asia behaviour, where the landing script captures no ad parameters at all.
- No storage layer, no database, no second endpoint, no Worker change.
- Exactly one base tag and one config call. The page never fires `gtag('event')`; `js/main.js` fires the form
  label only after the Worker answers OK, so there is no conversion on page load, on validation failure, on
  Turnstile failure, on HTTP 400/502 or on e-mail delivery failure. Existing duplicate protection stays
  in-flight only (one guard per running request); permanent per-lead dedupe is out of scope.
- WhatsApp conversion keeps the existing delegated click listener and the approved number. The form sets
  `data-whatsapp-fallback="false"` so WhatsApp never opens automatically on failure, as required by the standard.

## Rollback plan

The page is additive: one document, one stylesheet, one behaviour script, one test file, one brief.
Rollback is a single revert of the page commit, which removes `ads/algerie/index.html` plus its CSS, JS and test.
Nothing else references it: `sitemap.xml`, `robots.txt`, `scripts/site-entity-manifest.js`,
`PAGE_CHANGE_MATRIX.csv`, `js/main.js` and `workers/**` are untouched, and a test asserts that no organic page
links to it. After a revert the URL returns 404 (verified behaviour for unknown paths on this host).
Campaign pause is the operational lever; the site needs no emergency change.

## Measurement discipline

- 28 days = early observation only (spend, clicks, form submissions, WhatsApp opens, junk share).
- 90 days = directional evaluation before any structural page change.
- Judge on qualified Q3/Q4/Q5 inquiries and booked meetings, not on raw click counts.
- Do not rewrite the page on 28-day noise; do not raise budget automatically because the page went live.
- One real production inquiry must be confirmed end to end (e-mail received, conversion credited in Google Ads)
  before spend is increased.

## Known gaps carried forward (not fixed in this branch)

- Arabic governance debt: 24 h promise, CB torque and vibration wording, `50cc` horizontal remnants,
  one leaked internal review instruction, generic CCC wall and a derived "22+ years" claim. The Algeria page
  links to no `/ar/` address by decision.
- `docs/**` and any future repository file is publicly served because `assets.directory = "."`, so nothing
  sensitive may ever be committed.
- E-mail is a fallback alias of `contact` in the Worker; a dedicated e-mail row would need a Worker change.
- Duplicate conversion semantics are in-flight only.
- Central Asia captures no ad parameters.
- `en/product-detail.html` references missing `CB/3.webp`, `CB/4.webp`, `CB/5.webp`.
- No real packaging, carton, container or warehouse photo exists in the repository, so the page describes
  export support in words and shows only assembly, equipment, inspection, testing and workshop images.
---

# V2 - Conversion design / UX refinement (2026-09-01)

V1 was approved on contract and facts but read as technical documentation. V2 changes
presentation only: shorter page, clearer hierarchy, stronger factory proof. No governed
fact, no tracking behaviour and no backend field was altered.

## Page order

| Before (V1) | After (V2) |
| --- | --- |
| header, hero, buyer cards, product families, CG/CB comparison, parts, factory, process, offer, FAQ, footer | header, hero, compact B2B strip, product families, CG/CB comparison, factory, offer, FAQ, footer |

Removed as standalone sections: the five buyer-profile cards, the four-step process block
and the separate Parts section. Parts information is now a secondary product card, so no
approved fact was deleted. The note about buyers selling other engine origins moved from a
section paragraph to the hint under the platform qualification field.

## Focal hierarchy instead of equal tiles

The hero keeps three real repository photos but gives one dominant visual (CG air) with two
supporting visuals (CG water, CB). Measured image area ratio main : secondary is 4.4x to 4.9x
at every tested width, so the eye lands on one product first.

## Layered product cards

Each card shows image, family, nominal displacement classes, cooling, typical application,
one configuration note and the quote action. Governed technical detail (model codes, starting,
clutch, gearbox, reverse, validation list) sits inside a native `<details>` row labelled
"Voir les details techniques". Internal priority labels (Priorite 1/2/3) are no longer
customer-visible. The old desktop pattern of a two-up grid containing a 320 px internal image
column is deleted; card text now always spans the full card body (266-563 px depending on
width, spec values 334 px at 1440).

## Copy

Comparison heading is "CG ou CB : reperes rapides" with a five-row decision table; factory
heading is "Fabrication, controle et essais a Chongqing"; the form heading is "Demandez une
offre pour votre configuration". Governance vocabulary that leaked into buyer copy was replaced
by customer language ("A confirmer selon le modele"), the defensive sentence about delivery,
price and availability was removed from the conversion path, and the `Comparation` aria-label
typo is fixed. Facts are still governed silently: the commercial boundary sentence stays in the
form and FAQ, the no-compatibility-without-evidence statement stays in the FAQ, certification
wording stays text-only and unchanged.

## Form

The first visible block is seven fields (Nom, Societe, Telephone / WhatsApp, Wilaya / Ville,
Type d'entreprise, Produit recherche, Quantite estimee). Cylindrée nominale, Application,
marques/familles vendues, Code moteur, E-mail and Message moved into one optional
"Ajouter des details techniques (optionnel)" disclosure. Field names, values, the fixed
market / country / source_form trio, the Wilaya and buyer-type serialisation into
`requirements`, attribution capture and the conversion path are untouched, and `js/algeria-landing.js`
was not modified. A closed disclosure keeps every control in `FormData` (verified in a real browser:
all six optional keys present) and holds no `required` attribute, so it can never block a submit.

## Measured before / after (same browser, both versions served locally)

| Metric at 390 px | V1 | V2 |
| --- | --- | --- |
| document height | 17,256 px | 9,290 px (-46.2%) |
| form height, default state | 1,548 px | 896 px (-42.1%) |
| distance from page top to the form | 14,144 px | 7,238 px |
| sections in main | 10 | 7 |
| elements carrying a box-shadow | 11 | 4 |
| rendered text characters | 9,153 | 4,912 (-46.2%) |
| initial transfer | 308 KB | 303 KB (-1.6%) |

At 1024 px the page is 36.6% shorter and the form 44.8% shorter; at 1440 px 38.6% and 43.7%.
No width tested (390 / 600 / 768 / 900 / 1024 / 1440) has horizontal overflow or clipped text,
the header stays one row of 65 px on mobile (73 px from 900 px up) and the smallest interactive
target is 44 px.