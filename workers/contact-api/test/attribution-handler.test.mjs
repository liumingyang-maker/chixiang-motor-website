import assert from 'node:assert/strict';
import test from 'node:test';

import { handleAttributionRequest } from '../src/attribution-handler.mjs';

const payload = (overrides = {}) => ({
  schema_version: 1,
  client_version: '1.0.0',
  event_id: 'EVT-7K3P2M9Q4D7K3P2M9Q4D',
  event_type: 'whatsapp_click',
  lead_id: 'CX-7K3P2M9Q4D',
  first_source: 'Google Organic',
  session_source: 'Google Organic',
  landing_page: '/en/',
  session_landing_page: '/en/',
  click_page: '/en/cg-engine?secret=1#details',
  cta: 'hero_whatsapp',
  language: 'en',
  first_visit_time: '2026-09-21T00:00:00.000Z',
  client_timestamp: '2026-09-21T01:02:03.000Z',
  ...overrides
});

function request(body, options = {}) {
  const req = new Request('https://chixiangmotor.com/api/attribution/whatsapp-click', {
    method: options.method || 'POST',
    headers: {
      origin: options.origin || 'https://chixiangmotor.com',
      'content-type': options.contentType || 'application/json',
      ...(options.headers || {})
    },
    body: ['GET', 'HEAD'].includes(options.method) ? undefined :
      options.rawBody ?? JSON.stringify(body)
  });
  Object.defineProperty(req, 'cf', { value: { country: options.country || 'BR' } });
  return req;
}

test('accepts normalized JSON and records Cloudflare country provenance', async () => {
  const calls = [];
  const response = await handleAttributionRequest(request(payload()), { LEADS_DB: {} }, {
    recordEvent: async (...args) => {
      calls.push(args);
      return { result: 'recorded' };
    }
  });

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true, result: 'recorded' });
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://chixiangmotor.com');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].click_page, '/en/cg-engine');
  assert.equal(calls[0][2].country, 'BR');
  assert.equal(calls[0][2].country_source, 'cloudflare_edge');
});

test('accepts sendBeacon text/plain JSON and reports a duplicate without leaking fields', async () => {
  const response = await handleAttributionRequest(request(payload(), { contentType: 'text/plain;charset=UTF-8' }), { LEADS_DB: {} }, {
    recordEvent: async () => ({ result: 'event_already_recorded' })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, result: 'event_already_recorded' });
});

test('supports CORS preflight for production and approved branch Preview origins', async () => {
  for (const origin of [
    'https://chixiangmotor.com',
    'https://codex-inquiry-attribution-v1-chixiang-motor-website.970201665.workers.dev'
  ]) {
    const response = await handleAttributionRequest(request(null, { method: 'OPTIONS', origin }), {});
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
  }
});

test('rejects wrong methods, unapproved origins and unsupported content types', async () => {
  assert.equal((await handleAttributionRequest(request(null, { method: 'GET' }), {})).status, 405);
  assert.equal((await handleAttributionRequest(request(payload(), { origin: 'https://evil.example' }), {})).status, 403);
  assert.equal((await handleAttributionRequest(request(payload(), { contentType: 'application/x-www-form-urlencoded' }), {})).status, 415);
});

test('rejects oversized, malformed and non-WhatsApp payloads before storage', async () => {
  const oversized = request(null, { rawBody: 'x'.repeat(16 * 1024 + 1), contentType: 'text/plain' });
  assert.equal((await handleAttributionRequest(oversized, { LEADS_DB: {} })).status, 413);
  assert.equal((await handleAttributionRequest(request(null, { rawBody: '{broken' }), { LEADS_DB: {} })).status, 400);
  assert.equal((await handleAttributionRequest(request(payload({ lead_id: 'bad' })), { LEADS_DB: {} })).status, 400);
  assert.equal((await handleAttributionRequest(request(payload({ event_type: 'form_submitted_successfully' })), { LEADS_DB: {} })).status, 400);
});

test('reports unavailable storage without breaking into a false success', async () => {
  const missing = await handleAttributionRequest(request(payload()), {});
  assert.equal(missing.status, 503);
  assert.deepEqual(await missing.json(), { ok: false, error: 'database_unavailable' });

  const failed = await handleAttributionRequest(request(payload()), { LEADS_DB: {} }, {
    recordEvent: async () => { throw new Error('D1 unavailable'); },
    logError() {}
  });
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { ok: false, error: 'database_unavailable' });
});

