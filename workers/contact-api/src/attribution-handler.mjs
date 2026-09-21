import { jsonResponse, normalizeAttributionEvent } from './attribution-contract.mjs';
import { recordEvent as persistEvent } from './lead-store.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+-chixiang-motor-website\.970201665\.workers\.dev$/;
const FIXED_ORIGINS = new Set([
  'https://chixiangmotor.com',
  'https://www.chixiangmotor.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

export function isAllowedAttributionOrigin(origin) {
  return FIXED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin);
}

function withCors(response, origin) {
  if (isAllowedAttributionOrigin(origin)) {
    response.headers.set('access-control-allow-origin', origin);
    response.headers.set('vary', 'Origin');
  }
  return response;
}

function response(payload, status, origin) {
  return withCors(jsonResponse(payload, status, origin), origin);
}

function preflight(origin) {
  const headers = new Headers({
    'cache-control': 'no-store',
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
    vary: 'Origin'
  });
  return new Response(null, { status: 204, headers });
}

function contentTypeAllowed(request) {
  const type = (request.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase();
  return type === 'application/json' || type === 'text/plain';
}

async function readPayload(request) {
  const declared = Number.parseInt(request.headers.get('content-length') || '0', 10);
  if (declared > MAX_BODY_BYTES) return { ok: false, status: 413, code: 'payload_too_large' };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, code: 'payload_too_large' };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, code: 'invalid_payload' };
  }
}

export async function handleAttributionRequest(request, env = {}, options = {}) {
  const origin = request.headers.get('origin') || '';
  if (!isAllowedAttributionOrigin(origin)) {
    return jsonResponse({ ok: false, error: 'origin_not_allowed' }, 403);
  }
  if (request.method === 'OPTIONS') return preflight(origin);
  if (request.method !== 'POST') {
    const result = response({ ok: false, error: 'method_not_allowed' }, 405, origin);
    result.headers.set('allow', 'POST, OPTIONS');
    return result;
  }
  if (!contentTypeAllowed(request)) {
    return response({ ok: false, error: 'unsupported_media_type' }, 415, origin);
  }

  const input = await readPayload(request);
  if (!input.ok) return response({ ok: false, error: input.code }, input.status, origin);
  const normalized = normalizeAttributionEvent(input.value);
  if (!normalized.ok || normalized.event.event_type !== 'whatsapp_click') {
    return response({ ok: false, error: normalized.code || 'invalid_payload' }, 400, origin);
  }
  if (!env.LEADS_DB) {
    return response({ ok: false, error: 'database_unavailable' }, 503, origin);
  }

  const country = request.cf?.country || '';
  const record = options.recordEvent || persistEvent;
  try {
    const stored = await record(env.LEADS_DB, normalized.event, {
      country,
      country_source: country ? 'cloudflare_edge' : ''
    });
    const status = stored.result === 'recorded' ? 202 : 200;
    return response({ ok: true, result: stored.result }, status, origin);
  } catch (error) {
    (options.logError || console.error)('Attribution storage failed', error?.message || 'unknown_error');
    return response({ ok: false, error: 'database_unavailable' }, 503, origin);
  }
}

