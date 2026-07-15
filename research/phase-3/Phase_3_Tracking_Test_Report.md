# Tracking Test Report

## Code audit

The existing site code contains a `/api/contact` endpoint, Turnstile handling and capture of UTM and GCLID fields. Peru, Colombia and Central Asia source pages include quotation forms.

## Untested production items

- Turnstile production validation
- Worker binding and email delivery
- CRM/email field completeness
- Google Ads conversion de-duplication
- Mobile CTA and WhatsApp action
- Valid lead marking

All production tests are `MANUAL TEST REQUIRED`. No form, WhatsApp link, conversion event, or production inquiry was submitted.
