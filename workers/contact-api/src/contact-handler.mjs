const SALES_INBOX = 'chixiangmotor@163.com';
const SENDER = 'inquiry@chixiangmotor.com';
const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_ORIGINS = new Set([
  'https://www.chixiangmotor.com',
  'https://chixiangmotor.com',
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
    inquiry.message
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
    ['Message', inquiry.message],
    ['Page URL', inquiry.page_url],
    ['Language', inquiry.site_language],
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
    await sendInquiryEmail(buildInquiryEmail(validation.inquiry), env);
  } catch {
    return jsonResponse({ ok: false, error: 'Email service unavailable.' }, 502, origin);
  }

  return jsonResponse({ ok: true }, 200, origin);
}
