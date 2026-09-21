export const ALLOWED_EVENT_TYPES = [
  'whatsapp_click',
  'form_submitted_successfully',
  'status_message_received',
  'status_qualified',
  'status_reverted'
];

export const ALLOWED_STATUSES = [
  'whatsapp_clicked',
  'message_received',
  'qualified'
];

export const ALLOWED_ORIGINS = new Set([
  'https://chixiangmotor.com',
  'https://www.chixiangmotor.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

const LEAD_ID = /^CX-[0-9A-HJKMNP-TV-Z]{10}$/;
const EVENT_ID = /^EVT-[0-9A-HJKMNP-TV-Z]{20}$/;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CAMPAIGN_FIELDS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'yclid', 'ttclid'
];

function clean(value, limit) {
  const text = String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return text.length <= limit ? text : null;
}

export function normalizeLeadId(value) {
  const id = String(value || '').trim().toUpperCase();
  return LEAD_ID.test(id) ? id : '';
}

export function createEventId(randomFill = values => crypto.getRandomValues(values)) {
  const bytes = new Uint8Array(20);
  randomFill(bytes);
  return `EVT-${[...bytes].map(byte => CROCKFORD[byte & 31]).join('')}`;
}

export function normalizeHostname(value) {
  const raw = clean(value, 500);
  if (!raw) return '';
  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return url.hostname.toLowerCase().replace(/\.$/, '').slice(0, 253);
  } catch {
    return '';
  }
}

export function normalizePath(value) {
  const raw = clean(value, 1000);
  if (!raw) return '';
  try {
    const url = new URL(raw, 'https://chixiangmotor.com');
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return (url.pathname.replace(/\/{2,}/g, '/').slice(0, 500) || '/');
  } catch {
    return '';
  }
}

export function normalizeCountry(value) {
  const country = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : '';
}

function validTimestamp(value) {
  const text = clean(value, 40);
  if (!text || !Number.isFinite(Date.parse(text))) return '';
  return new Date(text).toISOString();
}

function takeString(input, name, limit, required = false) {
  const value = clean(input[name], limit);
  if (value === null || (required && !value)) return { ok: false };
  return { ok: true, value: value || '' };
}

export function normalizeAttributionEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, code: 'invalid_payload' };
  }

  const leadId = normalizeLeadId(input.lead_id);
  if (!leadId) return { ok: false, code: 'invalid_lead_id' };

  const eventType = String(input.event_type || '').trim();
  const eventId = String(input.event_id || '').trim().toUpperCase();
  const timestamp = validTimestamp(input.client_timestamp);
  if (
    input.schema_version !== 1 ||
    !EVENT_ID.test(eventId) ||
    !ALLOWED_EVENT_TYPES.includes(eventType) ||
    !timestamp
  ) return { ok: false, code: 'invalid_payload' };

  const clientVersion = takeString(input, 'client_version', 20, true);
  const firstSource = takeString(input, 'first_source', 120, true);
  const sessionSource = takeString(input, 'session_source', 120, true);
  const product = takeString(input, 'product', 120);
  const cta = takeString(input, 'cta', 80);
  const language = takeString(input, 'language', 10, true);
  if (![clientVersion, firstSource, sessionSource, product, cta, language].every(field => field.ok)) {
    return { ok: false, code: 'invalid_payload' };
  }
  if (!/^[a-z]{2}(?:-[a-z0-9]{2,5})?$/i.test(language.value)) {
    return { ok: false, code: 'invalid_payload' };
  }

  const landingPage = normalizePath(input.landing_page);
  const sessionLandingPage = normalizePath(input.session_landing_page);
  const clickPage = normalizePath(input.click_page || input.last_page);
  if (!landingPage || !sessionLandingPage || !clickPage) {
    return { ok: false, code: 'invalid_payload' };
  }

  const event = {
    schema_version: 1,
    client_version: clientVersion.value,
    event_id: eventId,
    event_type: eventType,
    lead_id: leadId,
    first_source: firstSource.value,
    session_source: sessionSource.value,
    landing_page: landingPage,
    session_landing_page: sessionLandingPage,
    first_referrer_domain: normalizeHostname(input.first_referrer_domain),
    previous_page: normalizePath(input.previous_page),
    click_page: clickPage,
    product: product.value,
    cta: cta.value,
    language: language.value.toLowerCase(),
    first_visit_time: validTimestamp(input.first_visit_time),
    client_timestamp: timestamp
  };

  for (const name of CAMPAIGN_FIELDS) {
    for (const field of [name, `first_${name}`]) {
      const value = takeString(input, field, name.startsWith('utm_') ? 160 : 256);
      if (!value.ok) return { ok: false, code: 'invalid_payload' };
      if (value.value) event[field] = value.value;
    }
  }

  return { ok: true, event };
}

export function isAllowedTransition(fromStatus, toStatus) {
  return (
    (fromStatus === 'whatsapp_clicked' && toStatus === 'message_received') ||
    (fromStatus === 'message_received' && toStatus === 'qualified')
  );
}

export function normalizeStatusRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, code: 'invalid_payload' };
  }
  const leadId = normalizeLeadId(input.lead_id);
  if (!leadId) return { ok: false, code: 'invalid_lead_id' };
  const action = String(input.action || '').trim();
  if (!['mark_message_received', 'mark_qualified', 'revert'].includes(action)) {
    return { ok: false, code: 'invalid_payload' };
  }
  return { ok: true, lead_id: leadId, action };
}

export function jsonResponse(payload, status = 200, origin = '') {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers.vary = 'Origin';
  }
  return new Response(JSON.stringify(payload), { status, headers });
}
