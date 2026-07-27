# Russia Contact Priority and Order Policy Design

## Context

The Russian horizontal-engine landing page currently presents WhatsApp in the header, hero, mobile sticky bar, direct-contact list, product guidance, and form-failure fallback. WhatsApp is not a dependable primary channel for visitors in Russia, so the page must route qualified buyers through channels that remain usable without a messenger connection.

The commercial policy is also changing. Sample orders must start at 3 engines and are available only to companies and professional buyers. Standard production orders must total at least 40 engines, with mixed models allowed. The page must not advertise a 10–30 unit trial-order tier.

## Goals

- Make the same-page inquiry form the primary conversion path.
- Make Email the first direct fallback, followed by WeChat, with WhatsApp retained only as a supplemental option.
- Stop this page from automatically opening WhatsApp when the form submission fails.
- Publish one consistent B2B order policy: samples from 3 engines; standard orders from 40 engines total; mixed models allowed.
- Keep consumer buyers out of the main sales message by placing sample availability near the qualified inquiry form rather than in the hero.
- Preserve successful form submission, Turnstile, Google Ads conversion, Yandex goals, product content, URLs, SEO infrastructure, and all other market pages.

## Contact hierarchy

### Header

The header contains the CHIXIANG MOTOR brand and one action: `Отправить запрос`, linked to the same-page form. It contains no WhatsApp, WeChat, or Email shortcut.

### Hero

The primary red action is `Получить коммерческое предложение` and scrolls to the form. The secondary action is `Написать по Email` and opens `mailto:chixiangmotor@163.com`. WhatsApp and WeChat do not appear in the hero.

### Product guidance and inquiry section

Compatibility guidance asks buyers to send engine, mounting, and connector photos by Email or WeChat. The direct-contact cards appear in this order:

1. Email: `chixiangmotor@163.com`
2. WeChat: `19008225410`
3. WhatsApp: `+86 190 0822 5410`

The WhatsApp card is visually subdued and remains a real link so existing WhatsApp click tracking continues to work when a buyer deliberately chooses it.

### Mobile sticky actions

The first, visually dominant action is `Отправить запрос` and scrolls to the form. The second action is `Email`. The sticky bar contains no WhatsApp or WeChat action.

### Form failure

The Russian horizontal-engine form declares `data-whatsapp-fallback="false"`. The shared form handler reads this opt-out before opening WhatsApp. When a request fails, this page:

- does not open a new window;
- keeps all entered form values;
- displays a localized error directing the buyer to `chixiangmotor@163.com`;
- does not record a form conversion.

Forms without the opt-out retain the current WhatsApp fallback behavior.

## Order policy

The public rules are:

- `Образцы — от 3 двигателей`: only for companies and professional buyers.
- `Серийный заказ — от 40 двигателей в общей партии`: mixed models are allowed.
- No 10–30 unit trial-order offer is published.
- No retail or individual-consumer offer is published.

The hero and procurement strip emphasize the standard-order MOQ of 40 engines. The 3-engine sample policy appears only beside the inquiry form, where the company field remains mandatory. The quantity field remains required but does not use a hard HTML minimum, preserving the existing lead-quality workflow and allowing buyers to describe mixed quantities.

All prior `MOQ 50` references on this page and in its page-specific WhatsApp message are changed to 40. Metadata is updated so search snippets do not retain the previous MOQ.

## Implementation boundaries

### Modified production files

- `ru/gorizontalnyj-dvigatel.html`: contact order, CTAs, policy copy, metadata, form opt-out, and failure message.
- `css/russia-horizontal-landing.css`: remove primary WhatsApp styles, add primary inquiry styling, subordinate supplemental WhatsApp, and restyle mobile actions.
- `js/russia-horizontal-landing.js`: update the optional WhatsApp message to the approved 40-unit standard-order and 3-unit sample policy.
- `js/main.js`: add the page-controlled WhatsApp fallback opt-out while preserving default behavior.

### Modified tests

- `tests/russia-horizontal-engine-landing.test.js`: enforce the new contact hierarchy and public policy.
- `tests/russia-horizontal-engine-interactions.test.js`: enforce the updated qualified WhatsApp message.
- `tests/russia-form.test.js`: prove the opt-out prevents a popup, preserves fields, reports Email, and does not change the default fallback.

No Worker, security-header, analytics destination, URL, redirect, sitemap, product, or image change is required.

## Verification

- Run all site tests and Worker tests.
- Confirm ordinary page visits trigger no lead conversion.
- Confirm validation and Turnstile failures trigger no submission or popup.
- Confirm network and Worker failures on this page trigger no WhatsApp popup, preserve entered data, and display Email guidance.
- Confirm successful form submission still fires each configured lead conversion once.
- Confirm the remaining supplemental WhatsApp link still reports its distinct click goal.
- Check desktop, tablet, and mobile layouts for overflow, legibility, and action order.
