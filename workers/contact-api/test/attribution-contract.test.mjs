import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ALLOWED_EVENT_TYPES,
  ALLOWED_STATUSES,
  isAllowedTransition,
  normalizeAttributionEvent,
  normalizeCountry,
  normalizeHostname,
  normalizeLeadId,
  normalizePath,
  normalizeStatusRequest
} from '../src/attribution-contract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = fs.readFileSync(path.join(here, '..', 'migrations', '0001_inquiry_attribution.sql'), 'utf8');

function validEvent(overrides = {}) {
  return {
    schema_version: 1,
    client_version: '1.0.0',
    event_id: 'EVT-7K3P2M9Q4D7K3P2M9Q4D',
    event_type: 'whatsapp_click',
    lead_id: 'CX-7K3P2M9Q4D',
    first_source: 'Google Ads',
    session_source: 'Direct',
    landing_page: '/en/',
    session_landing_page: '/en/cg-engine',
    first_referrer_domain: 'www.google.com',
    previous_page: '/en/',
    click_page: '/en/cg-engine?private=value#x',
    product: 'CG150',
    cta: 'product_card',
    language: 'en',
    client_timestamp: '2026-09-21T00:05:00.000Z',
    utm_campaign: 'cg-search',
    gclid: 'gclid-value',
    ignored_private_field: 'must not survive',
    ...overrides
  };
}

test('normalizes identifiers, hostnames, paths and country codes', () => {
  assert.equal(normalizeLeadId('cx-7k3p2m9q4d'), 'CX-7K3P2M9Q4D');
  assert.equal(normalizeLeadId('CX-EMAIL@EXAMPLE'), '');
  assert.equal(normalizeHostname('HTTPS://WWW.Google.COM./search?q=x'), 'www.google.com');
  assert.equal(normalizePath('/en/cg-engine?email=a@b.com#x'), '/en/cg-engine');
  assert.equal(normalizePath('javascript:alert(1)'), '');
  assert.equal(normalizeCountry('br'), 'BR');
  assert.equal(normalizeCountry('Brazil'), '');
});

test('normalizes an allowlisted event and removes unknown or unsafe data', () => {
  const result = normalizeAttributionEvent(validEvent());
  assert.equal(result.ok, true);
  assert.equal(result.event.click_page, '/en/cg-engine');
  assert.equal(result.event.gclid, 'gclid-value');
  assert.equal(result.event.utm_campaign, 'cg-search');
  assert.equal('ignored_private_field' in result.event, false);
  assert.equal('ip' in result.event, false);
});

test('rejects malformed, unsupported and oversized events', () => {
  assert.deepEqual(normalizeAttributionEvent(validEvent({ lead_id: 'bad' })), { ok: false, code: 'invalid_lead_id' });
  assert.deepEqual(normalizeAttributionEvent(validEvent({ event_type: 'page_view' })), { ok: false, code: 'invalid_payload' });
  assert.deepEqual(normalizeAttributionEvent(validEvent({ client_timestamp: 'yesterday' })), { ok: false, code: 'invalid_payload' });
  assert.deepEqual(normalizeAttributionEvent(validEvent({ product: 'x'.repeat(121) })), { ok: false, code: 'invalid_payload' });
  assert.deepEqual(normalizeAttributionEvent(null), { ok: false, code: 'invalid_payload' });
});

test('permits only the approved status workflow', () => {
  assert.deepEqual(ALLOWED_STATUSES, ['whatsapp_clicked', 'message_received', 'qualified']);
  assert.equal(isAllowedTransition('whatsapp_clicked', 'message_received'), true);
  assert.equal(isAllowedTransition('message_received', 'qualified'), true);
  assert.equal(isAllowedTransition('whatsapp_clicked', 'qualified'), false);
  assert.equal(isAllowedTransition('qualified', 'whatsapp_clicked'), false);
  assert.deepEqual(
    normalizeStatusRequest({ lead_id: 'cx-7k3p2m9q4d', action: 'mark_qualified' }),
    { ok: true, lead_id: 'CX-7K3P2M9Q4D', action: 'mark_qualified' }
  );
  assert.deepEqual(normalizeStatusRequest({ lead_id: 'bad', action: 'mark_qualified' }), { ok: false, code: 'invalid_lead_id' });
});

test('publishes exactly the approved event and status values', () => {
  assert.deepEqual(ALLOWED_EVENT_TYPES, [
    'whatsapp_click',
    'form_submitted_successfully',
    'status_message_received',
    'status_qualified',
    'status_reverted'
  ]);
});

test('migration defines additive constrained tables and lookup indexes', () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS leads/i);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS lead_events/i);
  assert.match(migration, /lead_id TEXT PRIMARY KEY/i);
  assert.match(migration, /event_id TEXT NOT NULL UNIQUE/i);
  assert.match(migration, /dedupe_key TEXT NOT NULL UNIQUE/i);
  assert.match(migration, /CHECK\s*\(status IN \('whatsapp_clicked', 'message_received', 'qualified'\)\)/i);
  assert.match(migration, /CHECK\s*\(event_type IN \([\s\S]*'whatsapp_click'[\s\S]*'status_reverted'[\s\S]*\)\)/i);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS idx_leads_expires_at/i);
  assert.match(migration, /CREATE INDEX IF NOT EXISTS idx_lead_events_lead_time/i);
  assert.doesNotMatch(migration, /\b(?:email|phone|password|chat_message|ip_address)\b/i);
});
