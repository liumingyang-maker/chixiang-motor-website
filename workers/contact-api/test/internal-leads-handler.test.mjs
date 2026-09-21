import assert from 'node:assert/strict';
import test from 'node:test';

import { handleInternalLeadsRequest } from '../src/internal-leads-handler.mjs';

function accessContext(email) {
  return {
    access: {
      async getIdentity() { return { email }; }
    }
  };
}

const owner = accessContext('chixiangmotor@163.com');

function request(path, init) {
  return new Request(`https://chixiangmotor.com${path}`, init);
}

function store(overrides = {}) {
  const safeLead = {
    schema_version: 1,
    lead_id: 'CX-7K3P2M9Q4D',
    status: 'whatsapp_clicked',
    sources: { first_source: 'Google Ads', inquiry_session_source: 'Google Ads' },
    click_ids: { gclid_present: true, first_gclid_present: true },
    events: []
  };
  return {
    exportLead: async () => safeLead,
    listRecentLeads: async () => [{ lead_id: safeLead.lead_id, status: safeLead.status }],
    transitionLeadStatus: async (_db, _leadId, action) => ({
      ok: true,
      status: action === 'mark_qualified' ? 'qualified' : 'message_received'
    }),
    revertLatestStatus: async () => ({ ok: true, status: 'whatsapp_clicked' }),
    ...overrides
  };
}

test('requires a verified Access identity matching the one owner email', async () => {
  const env = { LEADS_DB: {} };
  assert.equal((await handleInternalLeadsRequest(request('/api/internal/leads?lead_id=CX-7K3P2M9Q4D'), env, {})).status, 403);
  assert.equal((await handleInternalLeadsRequest(
    request('/api/internal/leads?lead_id=CX-7K3P2M9Q4D'), env, accessContext('other@example.com')
  )).status, 403);
  assert.equal((await handleInternalLeadsRequest(
    request('/api/internal/leads?lead_id=CX-7K3P2M9Q4D'), env, accessContext('CHIXIANGMOTOR@163.COM'), store()
  )).status, 200);
});

test('returns sanitized stable lookup and export JSON without raw click IDs', async () => {
  const methods = store();
  for (const path of [
    '/api/internal/leads?lead_id=cx-7k3p2m9q4d',
    '/api/internal/leads/export?lead_id=CX-7K3P2M9Q4D'
  ]) {
    const response = await handleInternalLeadsRequest(request(path), { LEADS_DB: {} }, owner, methods);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.lead.lead_id, 'CX-7K3P2M9Q4D');
    assert.equal(payload.lead.click_ids.gclid_present, true);
    assert.equal('gclid' in payload.lead, false);
  }
});

test('validates Lead IDs and reports missing records consistently', async () => {
  assert.equal((await handleInternalLeadsRequest(
    request('/api/internal/leads?lead_id=bad'), { LEADS_DB: {} }, owner, store()
  )).status, 400);
  const missingStore = store({ exportLead: async () => null });
  const missing = await handleInternalLeadsRequest(
    request('/api/internal/leads/export?lead_id=CX-7K3P2M9Q4D'), { LEADS_DB: {} }, owner, missingStore
  );
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { ok: false, error: 'lead_not_found' });
});

test('clamps the recent-list limit and returns only the store projection', async () => {
  const limits = [];
  const methods = store({
    listRecentLeads: async (_db, limit) => {
      limits.push(limit);
      return [{ lead_id: 'CX-7K3P2M9Q4D', status: 'whatsapp_clicked' }];
    }
  });
  const high = await handleInternalLeadsRequest(
    request('/api/internal/leads/recent?limit=5000'), { LEADS_DB: {} }, owner, methods
  );
  assert.equal(high.status, 200);
  assert.deepEqual(limits, [100]);
  assert.deepEqual(await high.json(), {
    ok: true,
    leads: [{ lead_id: 'CX-7K3P2M9Q4D', status: 'whatsapp_clicked' }]
  });
});

test('allows only approved status actions and maps transition results', async () => {
  const calls = [];
  const methods = store({
    transitionLeadStatus: async (...args) => {
      calls.push(['transition', ...args]);
      return { ok: true, status: 'message_received' };
    },
    revertLatestStatus: async (...args) => {
      calls.push(['revert', ...args]);
      return { ok: true, status: 'whatsapp_clicked' };
    }
  });
  const post = action => request('/api/internal/leads/status', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lead_id: 'CX-7K3P2M9Q4D', action })
  });

  const marked = await handleInternalLeadsRequest(post('mark_message_received'), { LEADS_DB: {} }, owner, methods);
  const reverted = await handleInternalLeadsRequest(post('revert'), { LEADS_DB: {} }, owner, methods);
  assert.deepEqual(await marked.json(), { ok: true, status: 'message_received' });
  assert.deepEqual(await reverted.json(), { ok: true, status: 'whatsapp_clicked' });
  assert.equal(calls[0][0], 'transition');
  assert.equal(calls[1][0], 'revert');

  const invalid = await handleInternalLeadsRequest(post('delete'), { LEADS_DB: {} }, owner, methods);
  assert.equal(invalid.status, 400);
  assert.equal(calls.length, 2);
});

test('reports invalid transitions, missing D1 and wrong methods without detail leakage', async () => {
  const conflicted = store({
    transitionLeadStatus: async () => ({ ok: false, code: 'invalid_status_transition' })
  });
  const statusRequest = request('/api/internal/leads/status', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lead_id: 'CX-7K3P2M9Q4D', action: 'mark_qualified' })
  });
  assert.equal((await handleInternalLeadsRequest(statusRequest, { LEADS_DB: {} }, owner, conflicted)).status, 409);
  assert.equal((await handleInternalLeadsRequest(
    request('/api/internal/leads?lead_id=CX-7K3P2M9Q4D'), {}, owner, store()
  )).status, 503);
  assert.equal((await handleInternalLeadsRequest(
    request('/api/internal/leads/recent', { method: 'POST' }), { LEADS_DB: {} }, owner, store()
  )).status, 405);
});

