import { createEventId, normalizeAttributionEvent } from './attribution-contract.mjs';
import { recordSuccessfulForm as persistSuccessfulForm } from './lead-store.mjs';

const SALES_INBOX = 'chixiangmotor@163.com';
const SENDER = 'inquiry@chixiangmotor.com';
const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_ORIGINS = new Set([
  'https://chixiangmotor.com',
  'https://www.chixiangmotor.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

const SPAM_PATTERNS = [
  '[url=',
  'buy cheap',
  'viagra',
  'casino',
  'seo service',
  'crypto investment'
];

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

function htmlEscape(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pick(fields, names) {
  for (const name of names) {
    const value = clean(fields[name]);
    if (value) return value;
  }
  return '';
}

export function normalizeInquiry(fields) {
  return {
    name: pick(fields, ['name']),
    contact: pick(fields, ['contact', 'email']),
    country: pick(fields, ['country']),
    company: pick(fields, ['company']),
    product: pick(fields, ['product_interest', 'product']),
    message: pick(fields, ['message']),
    page_url: pick(fields, ['page_url']),
    site_language: pick(fields, ['site_language']),
    market: pick(fields, ['market']),
    source_form: pick(fields, ['source_form']),
    application: pick(fields, ['application']),
    displacement: pick(fields, ['displacement']),
    quantity: pick(fields, ['quantity']),
    vehicle: pick(fields, ['vehicle']),
    engine_code: pick(fields, ['engine_code']),
    requirements: pick(fields, ['requirements']),
    source_cta: pick(fields, ['source_cta']),
    utm_source: pick(fields, ['utm_source']),
    utm_medium: pick(fields, ['utm_medium']),
    utm_campaign: pick(fields, ['utm_campaign']),
    utm_content: pick(fields, ['utm_content']),
    utm_term: pick(fields, ['utm_term']),
    gclid: pick(fields, ['gclid']),
    gbraid: pick(fields, ['gbraid']),
    wbraid: pick(fields, ['wbraid']),
    fbclid: pick(fields, ['fbclid']),
    msclkid: pick(fields, ['msclkid']),
    yclid: pick(fields, ['yclid']),
    ttclid: pick(fields, ['ttclid']),
    lead_id: pick(fields, ['lead_id']),
    first_source: pick(fields, ['first_source']),
    session_source: pick(fields, ['session_source']),
    landing_page: pick(fields, ['landing_page']),
    session_landing_page: pick(fields, ['session_landing_page']),
    first_referrer_domain: pick(fields, ['first_referrer_domain']),
    previous_page: pick(fields, ['previous_page']),
    last_page: pick(fields, ['last_page']),
    attribution_client_version: pick(fields, ['attribution_client_version']),
    first_visit_time: pick(fields, ['first_visit_time']),
    first_utm_source: pick(fields, ['first_utm_source']),
    first_utm_medium: pick(fields, ['first_utm_medium']),
    first_utm_campaign: pick(fields, ['first_utm_campaign']),
    first_utm_content: pick(fields, ['first_utm_content']),
    first_utm_term: pick(fields, ['first_utm_term']),
    first_gclid: pick(fields, ['first_gclid']),
    first_gbraid: pick(fields, ['first_gbraid']),
    first_wbraid: pick(fields, ['first_wbraid']),
    first_fbclid: pick(fields, ['first_fbclid']),
    first_msclkid: pick(fields, ['first_msclkid']),
    first_yclid: pick(fields, ['first_yclid']),
    first_ttclid: pick(fields, ['first_ttclid']),
    website: pick(fields, ['website'])
  };
}

function getTurnstileToken(fields) {
  return pick(fields, ['cf-turnstile-response', 'turnstile_token']);
}

export function validateInquiry(fields) {
  const inquiry = normalizeInquiry(fields);

  if (inquiry.website) {
    return { ok: false, error: 'Spam submission rejected.' };
  }

  if (!inquiry.name) {
    return { ok: false, error: 'Name is required.' };
  }

  if (!inquiry.contact) {
    return { ok: false, error: 'Contact is required.' };
  }

  if (!inquiry.product) {
    return { ok: false, error: 'Product interest is required.' };
  }

  const searchableText = [
    inquiry.name,
    inquiry.contact,
    inquiry.company,
    inquiry.product,
    inquiry.message,
    inquiry.requirements
  ].join(' ').toLowerCase();

  for (const pattern of SPAM_PATTERNS) {
    if (searchableText.includes(pattern)) {
      return { ok: false, error: 'Spam-like content is not allowed.' };
    }
  }

  return { ok: true, inquiry };
}

export function buildInquiryEmail(fields) {
  const inquiry = normalizeInquiry(fields);
  const submittedAt = new Date().toISOString();
  const subjectProduct = inquiry.product || 'General inquiry';
  const subject = `New Chixiang Motor Inquiry - ${subjectProduct}`;

  const rows = [
    ['Name', inquiry.name],
    ['Contact', inquiry.contact],
    ['Country', inquiry.country],
    ['Company', inquiry.company],
    ['Product', inquiry.product],
    ['Market', inquiry.market],
    ['Source form', inquiry.source_form],
    ['Application', inquiry.application],
    ['Displacement', inquiry.displacement],
    ['Quantity', inquiry.quantity],
    ['Vehicle', inquiry.vehicle],
    ['Engine code', inquiry.engine_code],
    ['Requirements', inquiry.requirements],
    ['Source CTA', inquiry.source_cta],
    ['Message', inquiry.message],
    ['Page URL', inquiry.page_url],
    ['Language', inquiry.site_language],
    ['Lead ID', inquiry.lead_id],
    ['First source', inquiry.first_source],
    ['Session source', inquiry.session_source],
    ['Landing page', inquiry.landing_page],
    ['Session landing page', inquiry.session_landing_page],
    ['First referrer domain', inquiry.first_referrer_domain],
    ['Previous page', inquiry.previous_page],
    ['Last page', inquiry.last_page],
    ['Attribution client version', inquiry.attribution_client_version],
    ['First UTM source', inquiry.first_utm_source],
    ['First UTM medium', inquiry.first_utm_medium],
    ['First UTM campaign', inquiry.first_utm_campaign],
    ['First UTM content', inquiry.first_utm_content],
    ['First UTM term', inquiry.first_utm_term],
    ['UTM source', inquiry.utm_source],
    ['UTM medium', inquiry.utm_medium],
    ['UTM campaign', inquiry.utm_campaign],
    ['UTM content', inquiry.utm_content],
    ['UTM term', inquiry.utm_term],
    ['GCLID', inquiry.gclid],
    ['GBRAID', inquiry.gbraid],
    ['WBRAID', inquiry.wbraid],
    ['FBCLID', inquiry.fbclid],
    ['MSCLKID', inquiry.msclkid],
    ['YCLID', inquiry.yclid],
    ['TTCLID', inquiry.ttclid],
    ['Submitted At', submittedAt]
  ];

  const text = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  const htmlRows = rows
    .filter(([, value]) => value)
    .map(([label, value]) => (
      `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb;">${htmlEscape(label)}</th>` +
      `<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${htmlEscape(value)}</td></tr>`
    ))
    .join('');

  const html = [
    '<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">',
    '<h2>New Chixiang Motor Website Inquiry</h2>',
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px;">',
    htmlRows,
    '</table>',
    '</div>'
  ].join('');

  return {
    to: SALES_INBOX,
    from: SENDER,
    subject,
    text,
    html
  };
}

function jsonResponse(payload, status, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, accept'
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers.vary = 'Origin';
  }

  return new Response(JSON.stringify(payload), { status, headers });
}

async function parseRequestBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await request.json();
  }

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  throw new Error('Unsupported content type.');
}

async function sendInquiryEmail(email, env) {
  if (!env || !env.EMAIL || typeof env.EMAIL.send !== 'function') {
    throw new Error('Email binding is not configured.');
  }

  await env.EMAIL.send(email);
}

async function verifyTurnstile(fields, request, env, fetcher = fetch) {
  const token = getTurnstileToken(fields);

  if (!token) {
    return { ok: false, status: 400, error: 'Please complete the anti-spam check.' };
  }

  if (!env || !env.TURNSTILE_SECRET_KEY) {
    return { ok: false, status: 502, error: 'Anti-spam check is not configured.' };
  }

  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token);

  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const response = await fetcher(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      body
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      return { ok: false, status: 400, error: 'Anti-spam check failed. Please try again.' };
    }
  } catch {
    return { ok: false, status: 502, error: 'Anti-spam check is temporarily unavailable.' };
  }

  return { ok: true };
}

function buildFormAttributionEvent(fields, options = {}) {
  const inquiry = normalizeInquiry(fields);
  if (!inquiry.lead_id) return null;
  const nowValue = options.now ? options.now() : new Date();
  const now = (nowValue instanceof Date ? nowValue : new Date(nowValue)).toISOString();
  const eventId = options.createEventId ? options.createEventId() : createEventId();
  const input = {
    schema_version: 1,
    client_version: inquiry.attribution_client_version,
    event_id: eventId,
    event_type: 'form_submitted_successfully',
    lead_id: inquiry.lead_id,
    first_source: inquiry.first_source,
    session_source: inquiry.session_source,
    landing_page: inquiry.landing_page,
    session_landing_page: inquiry.session_landing_page,
    first_referrer_domain: inquiry.first_referrer_domain,
    previous_page: inquiry.previous_page,
    click_page: inquiry.last_page || inquiry.page_url,
    product: inquiry.product,
    cta: inquiry.source_cta || inquiry.source_form || 'contact_form',
    language: inquiry.site_language,
    first_visit_time: inquiry.first_visit_time,
    client_timestamp: now
  };
  for (const name of [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'yclid', 'ttclid'
  ]) {
    if (inquiry[name]) input[name] = inquiry[name];
    if (inquiry[`first_${name}`]) input[`first_${name}`] = inquiry[`first_${name}`];
  }
  const normalized = normalizeAttributionEvent(input);
  return normalized.ok ? { event: normalized.event, now } : null;
}

function logAttributionFailure(error) {
  console.error('Contact attribution storage failed.', {
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error)
  });
}

export async function handleContactRequest(request, env = {}, options = {}) {
  const origin = request.headers.get('origin') || '';

  if (request.method === 'OPTIONS') {
    return jsonResponse({ ok: true }, 204, origin);
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, origin);
  }

  let fields;
  try {
    fields = await parseRequestBody(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid form submission.' }, 400, origin);
  }

  const validation = validateInquiry(fields);
  if (!validation.ok) {
    return jsonResponse({ ok: false, error: validation.error }, 400, origin);
  }

  const turnstile = await verifyTurnstile(fields, request, env, options.fetch || fetch);
  if (!turnstile.ok) {
    return jsonResponse({ ok: false, error: turnstile.error }, turnstile.status, origin);
  }

  try {
    await sendInquiryEmail(buildInquiryEmail(fields), env);
  } catch (error) {
    // Log the delivery provider's reason without logging the inquirer's contact data.
    console.error('Contact email delivery failed.', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error)
    });

    return jsonResponse({
      ok: false,
      code: 'email_delivery_failed',
      error: 'Email service unavailable.'
    }, 502, origin);
  }

  const attribution = buildFormAttributionEvent(fields, options);
  if (attribution && env.LEADS_DB) {
    const save = options.recordSuccessfulForm || persistSuccessfulForm;
    const logFailure = options.logAttributionFailure || logAttributionFailure;
    const task = Promise.resolve().then(() => save(env.LEADS_DB, attribution.event, {
      country: request.cf?.country || '',
      country_source: request.cf?.country ? 'cloudflare_edge' : '',
      now: attribution.now
    })).catch(error => {
      logFailure(error);
      return { result: 'database_unavailable' };
    });
    if (options.waitUntil) options.waitUntil(task);
    else void task;
  }

  return jsonResponse({ ok: true }, 200, origin);
}
