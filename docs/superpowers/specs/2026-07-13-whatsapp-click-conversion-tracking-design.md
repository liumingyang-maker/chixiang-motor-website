# WhatsApp Click Conversion Tracking Design

## Context

The site already loads the Google Ads tag `AW-16777656395` and records a successful contact-form submission with a dedicated conversion event. Google Ads now also has a secondary conversion action named `WhatsApp 点击` with destination:

`AW-16777656395/bovKCKOx088cEMvwmsA-`

WhatsApp is exposed through `wa.me` links across all language versions. These clicks are not currently reported to Google Ads.

## Goal

Record every user-initiated click on a site WhatsApp link as the secondary `WhatsApp 点击` conversion while preserving the link's existing navigation behavior.

## Non-goals

- Do not treat a click as a confirmed inquiry or sale.
- Do not change campaign bidding goals or promote this action to a primary conversion.
- Do not change page content, layout, forms, or the existing form-submission conversion.
- Do not add Google Tag Manager.
- Do not track programmatic WhatsApp fallbacks opened after a form delivery failure.

## Chosen approach

Add one delegated click listener to the shared `js/main.js` file. The listener will identify the nearest anchor whose URL targets `wa.me` and send the new Google Ads conversion event.

This approach covers current and future WhatsApp buttons without editing every HTML page. Of the 51 HTML files in the repository, 49 content pages load `js/main.js`; the two exceptions are the root redirect document and a search-engine verification document, neither of which contains a WhatsApp link.

## Alternatives considered

### Inline handlers on every link

Adding `onclick` handlers to each WhatsApp anchor follows Google's generated example closely, but it would require repetitive edits across many pages and could miss future buttons.

### Google Tag Manager

Google Tag Manager could centralize future event tracking, but the site does not currently use a GTM container. Introducing one for this single event would add unnecessary operational complexity.

## Runtime behavior

1. A user clicks an element inside, or directly on, an anchor whose `href` points to `wa.me`.
2. The delegated listener resolves the matching anchor.
3. If `window.gtag` is available, the listener sends a `conversion` event to `AW-16777656395/bovKCKOx088cEMvwmsA-`.
4. The link continues to open WhatsApp using its existing target and URL.
5. If Google Ads tracking is unavailable or throws an error, navigation still proceeds normally.

The WhatsApp helper will be separate from the existing contact-form conversion helper so the two conversion labels and behaviors cannot be confused.

## Failure handling

- Missing `gtag`: skip measurement and preserve navigation.
- Tracking exception: contain the error and preserve navigation.
- Click outside a `wa.me` anchor: do nothing.
- Nested element inside a WhatsApp button: resolve the parent anchor and record one event.

## Verification

- Confirm the shared script contains the exact WhatsApp conversion destination.
- Confirm the listener matches `wa.me` anchors across language pages.
- Test a direct anchor click and a click on a nested icon/text element.
- Stub `gtag` and verify exactly one event is emitted per click with the expected `send_to` value.
- Verify the WhatsApp destination still opens when `gtag` is present, absent, or throws.
- Confirm the existing form conversion destination remains unchanged.
- After deployment, use Google Tag Assistant and Google Ads diagnostics to verify receipt of the event.

## Acceptance criteria

- All user-initiated `wa.me` link clicks on content pages emit the `WhatsApp 点击` conversion event once.
- WhatsApp navigation remains functional under tracking success and failure conditions.
- Form submission tracking continues to use `AW-16777656395/Om_nCMCV4swcEMvwmsA-`.
- No HTML page requires an inline tracking handler.
- No unrelated website behavior or presentation changes.
