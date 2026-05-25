# Chixiang Motor Website

Static multilingual website for Chixiang Motor.

## Cloudflare Pages

- Framework preset: None
- Build command: leave empty
- Build output directory: `/`
- Root directory: repository root

## Contact form

Contact forms submit to the Cloudflare Worker API:

`/api/contact`

The Worker source lives in `workers/contact-api` and sends inquiries to
`chixiangmotor@163.com` after the Cloudflare `EMAIL` binding is configured.

Turnstile anti-spam is required for live submissions:

- Create a Cloudflare Turnstile widget for `chixiangmotor.com` and
  `www.chixiangmotor.com`.
- Replace `PASTE_CLOUDFLARE_TURNSTILE_SITE_KEY` in `js/main.js` with the
  public Turnstile site key.
- Add the Worker secret `TURNSTILE_SECRET_KEY` with the private Turnstile
  secret key.
