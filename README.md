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
