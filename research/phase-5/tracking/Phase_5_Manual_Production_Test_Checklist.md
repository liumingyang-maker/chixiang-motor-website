# Manual Production Test Checklist

Do not execute this checklist without explicit production authorization.

- [ ] Confirm approved test window, owner and test-lead label.
- [ ] Confirm Turnstile production keys and privacy notice.
- [ ] Open each approved country page with controlled UTM parameters and a test GCLID.
- [ ] Submit one labelled test lead per approved form; never use a real buyer identity.
- [ ] Verify exactly one `/api/contact` request and one success state.
- [ ] Verify no conversion fires before server success.
- [ ] Verify exactly one conversion fires after server success.
- [ ] Verify UTM source, medium, campaign, term, content and GCLID arrive intact.
- [ ] Verify email/CRM receipt, country, source form and product fields.
- [ ] Verify error and retry behavior using a safe non-production or authorized method.
- [ ] Verify WhatsApp links contain no sensitive or unsupported claims.
- [ ] Label and remove the test lead according to the approved retention process.
- [ ] Record screenshots, timestamp, browser, device and tester.
- [ ] Obtain marketing and compliance sign-off.
- [ ] Update Ads Verification separately; do not infer Ads Launch approval.

Current status: **MANUAL AUTHORIZATION REQUIRED**. Ads Launch: **NOT APPROVED**.
