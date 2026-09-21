import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cleanupExpiredLeads,
  exportLead,
  getLead,
  listRecentLeads,
  recordEvent,
  recordSuccessfulForm,
  revertLatestStatus,
  transitionLeadStatus
} from '../src/lead-store.mjs';

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.args = [];
  }

  bind(...args) {
    assert.equal((this.sql.match(/\?/g) || []).length, args.length, 'every D1 placeholder must be bound');
    this.args = args;
    return this;
  }

  first() {
    return this.db.execute(this, 'first');
  }

  all() {
    return this.db.execute(this, 'all');
  }

  run() {
    return this.db.execute(this, 'run');
  }
}

class FakeD1 {
  constructor() {
    this.leads = new Map();
    this.events = [];
    this.sequence = 0;
  }

  prepare(sql) {
    assert.equal(typeof sql, 'string');
    assert.equal(sql.includes("'" + 'CX-' + "'"), false, 'payload values must not be interpolated into SQL');
    return new FakeStatement(this, sql);
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  async execute(statement, mode) {
    const marker = /lead-store:([a-z-]+)/.exec(statement.sql)?.[1];
    const a = statement.args;

    if (marker === 'find-duplicate') {
      return this.events.find(event => event.dedupe_key === a[0] || event.event_id === a[1]) || null;
    }
    if (marker === 'upsert-lead') {
      const incoming = {
        lead_id: a[0], schema_version: a[1], client_version: a[2], first_source: a[3],
        first_referrer_domain: a[4], first_landing_page: a[5], first_utm_source: a[6],
        first_utm_medium: a[7], first_utm_campaign: a[8], first_utm_content: a[9],
        first_utm_term: a[10], first_gclid: a[11], first_gbraid: a[12], first_wbraid: a[13],
        first_fbclid: a[14], first_msclkid: a[15], first_yclid: a[16], first_ttclid: a[17],
        language: a[18], first_visit_client_at: a[19], first_seen_server_at: a[20],
        cloudflare_country: a[21], country_source: a[22], status: a[23],
        message_received_at: a[24] || null, qualified_at: null, created_at: a[25], updated_at: a[26], expires_at: a[27]
      };
      const current = this.leads.get(incoming.lead_id);
      if (!current) this.leads.set(incoming.lead_id, incoming);
      else {
        current.client_version = incoming.client_version;
        current.updated_at = incoming.updated_at;
        current.expires_at = incoming.expires_at;
        if (!current.cloudflare_country && incoming.cloudflare_country) {
          current.cloudflare_country = incoming.cloudflare_country;
          current.country_source = incoming.country_source;
        }
        if (incoming.status === 'message_received' && current.status === 'whatsapp_clicked') {
          current.status = 'message_received';
          current.message_received_at ||= incoming.message_received_at;
        }
      }
      return { success: true, meta: { changes: current ? 1 : 1 } };
    }
    if (marker === 'insert-event') {
      if (this.events.some(event => event.event_id === a[0] || event.dedupe_key === a[1])) {
        return { success: true, meta: { changes: 0 } };
      }
      this.events.push({
        id: ++this.sequence, event_id: a[0], dedupe_key: a[1], lead_id: a[2], event_type: a[3],
        session_source: a[4], session_landing_page: a[5], previous_page: a[6], click_page: a[7],
        product: a[8], cta: a[9], language: a[10], utm_source: a[11], utm_medium: a[12],
        utm_campaign: a[13], utm_content: a[14], utm_term: a[15], gclid: a[16], gbraid: a[17],
        wbraid: a[18], fbclid: a[19], msclkid: a[20], yclid: a[21], ttclid: a[22],
        client_timestamp: a[23], server_timestamp: a[24], from_status: a[25], to_status: a[26],
        manual_status: a[27]
      });
      return { success: true, meta: { changes: 1 } };
    }
    if (marker === 'get-lead') return this.leads.get(a[0]) || null;
    if (marker === 'get-events') {
      return { results: this.events.filter(event => event.lead_id === a[0]).sort((x, y) => y.id - x.id) };
    }
    if (marker === 'list-recent') {
      return { results: [...this.leads.values()].sort((x, y) => y.updated_at.localeCompare(x.updated_at)).slice(0, a[0]) };
    }
    if (marker === 'update-status') {
      const lead = this.leads.get(a[5]);
      if (!lead || lead.status !== a[6]) return { success: true, meta: { changes: 0 } };
      lead.status = a[0];
      lead.message_received_at = a[1] || lead.message_received_at;
      lead.qualified_at = a[2] || lead.qualified_at;
      lead.updated_at = a[3];
      lead.expires_at = a[4];
      return { success: true, meta: { changes: 1 } };
    }
    if (marker === 'latest-manual-transition') {
      const reversals = this.events.filter(event => event.lead_id === a[0] && event.event_type === 'status_reverted');
      const candidate = [...this.events].reverse().find(event =>
        event.lead_id === a[0] && event.manual_status === 1 &&
        ['status_message_received', 'status_qualified'].includes(event.event_type) &&
        !reversals.some(revert => revert.from_status === event.to_status && revert.to_status === event.from_status && revert.id > event.id)
      );
      return candidate || null;
    }
    if (marker === 'cleanup-events') {
      const expiredLeadIds = new Set([...this.leads.values()].filter(lead => lead.expires_at <= a[0]).map(lead => lead.lead_id));
      const selected = this.events.filter(event => expiredLeadIds.has(event.lead_id)).slice(0, 500);
      const ids = new Set(selected.map(event => event.id));
      this.events = this.events.filter(event => !ids.has(event.id));
      return { success: true, meta: { changes: selected.length } };
    }
    if (marker === 'cleanup-leads') {
      const deletable = [...this.leads.values()].filter(lead =>
        lead.expires_at <= a[0] && !this.events.some(event => event.lead_id === lead.lead_id)
      ).slice(0, 500);
      for (const lead of deletable) this.leads.delete(lead.lead_id);
      return { success: true, meta: { changes: deletable.length } };
    }
    throw new Error(`Unsupported fake D1 statement (${mode}): ${marker || statement.sql}`);
  }
}

const baseEvent = (overrides = {}) => ({
  schema_version: 1,
  client_version: '1.0.0',
  event_id: 'EVT-7K3P2M9Q4D7K3P2M9Q4D',
  event_type: 'whatsapp_click',
  lead_id: 'CX-7K3P2M9Q4D',
  first_source: 'Google Organic',
  session_source: 'Google Organic',
  landing_page: '/en/',
  session_landing_page: '/en/',
  first_referrer_domain: 'google.com',
  previous_page: '/en/',
  click_page: '/en/cg-engine',
  product: 'CG Engine',
  cta: 'hero_whatsapp',
  language: 'en',
  first_visit_time: '2026-09-21T00:00:00.000Z',
  client_timestamp: '2026-09-21T01:02:03.000Z',
  first_utm_campaign: 'organic-test',
  gclid: 'session-click-id',
  ...overrides
});

const server = (now = '2026-09-21T01:02:04.000Z', country = 'BR') => ({ now, country, country_source: 'cloudflare_edge' });

test('records immutable first touch, appends session events and collapses retries/double clicks', async () => {
  const db = new FakeD1();
  const first = await recordEvent(db, baseEvent(), server());
  const retry = await recordEvent(db, baseEvent(), server('2026-09-21T01:02:05.000Z'));
  const doubleClick = await recordEvent(db, baseEvent({
    event_id: 'EVT-8K3P2M9Q4D7K3P2M9Q4D',
    client_timestamp: '2026-09-21T01:02:04.900Z'
  }), server('2026-09-21T01:02:05.000Z'));
  const later = await recordEvent(db, baseEvent({
    event_id: 'EVT-9K3P2M9Q4D7K3P2M9Q4D',
    first_source: 'Direct',
    session_source: 'Google Ads',
    click_page: '/en/cb-engine',
    cta: 'sticky_whatsapp',
    client_timestamp: '2026-09-21T01:02:10.000Z'
  }), server('2026-09-21T01:02:11.000Z', 'MX'));

  assert.equal(first.result, 'recorded');
  assert.equal(retry.result, 'event_already_recorded');
  assert.equal(doubleClick.result, 'event_already_recorded');
  assert.equal(later.result, 'recorded');
  const lead = await getLead(db, 'CX-7K3P2M9Q4D');
  assert.equal(lead.status, 'whatsapp_clicked');
  assert.equal(lead.first_source, 'Google Organic', 'first touch must never be overwritten');
  assert.equal(lead.first_landing_page, '/en/');
  assert.equal(lead.cloudflare_country, 'BR', 'first reliable edge country wins');
  assert.equal(lead.events.length, 2);
  assert.equal(lead.events[0].session_source, 'Google Ads');
});

test('successful form creates or advances to message_received without weakening qualified', async () => {
  const db = new FakeD1();
  const form = baseEvent({ event_type: 'form_submitted_successfully' });
  assert.equal((await recordSuccessfulForm(db, form, server())).result, 'recorded');
  assert.equal((await getLead(db, form.lead_id)).status, 'message_received');

  await transitionLeadStatus(db, form.lead_id, 'mark_qualified', server('2026-09-21T02:00:00.000Z'));
  await recordSuccessfulForm(db, baseEvent({
    event_id: 'EVT-AK3P2M9Q4D7K3P2M9Q4D',
    event_type: 'form_submitted_successfully',
    client_timestamp: '2026-09-21T03:00:00.000Z'
  }), server('2026-09-21T03:00:01.000Z'));
  assert.equal((await getLead(db, form.lead_id)).status, 'qualified');
});

test('allows only sequential manual status changes and reverts only the latest manual fact', async () => {
  const db = new FakeD1();
  await recordEvent(db, baseEvent(), server());

  const skip = await transitionLeadStatus(db, 'CX-7K3P2M9Q4D', 'mark_qualified', server());
  assert.deepEqual(skip, { ok: false, code: 'invalid_status_transition' });

  const received = await transitionLeadStatus(db, 'CX-7K3P2M9Q4D', 'mark_message_received', server('2026-09-21T02:00:00.000Z'));
  const qualified = await transitionLeadStatus(db, 'CX-7K3P2M9Q4D', 'mark_qualified', server('2026-09-21T03:00:00.000Z'));
  assert.equal(received.ok, true);
  assert.equal(qualified.ok, true);
  assert.equal((await getLead(db, 'CX-7K3P2M9Q4D')).status, 'qualified');

  const reverted = await revertLatestStatus(db, 'CX-7K3P2M9Q4D', server('2026-09-21T04:00:00.000Z'));
  assert.deepEqual(reverted, { ok: true, status: 'message_received' });
  assert.equal((await getLead(db, 'CX-7K3P2M9Q4D')).status, 'message_received');

  const revertedAgain = await revertLatestStatus(db, 'CX-7K3P2M9Q4D', server('2026-09-21T05:00:00.000Z'));
  assert.deepEqual(revertedAgain, { ok: true, status: 'whatsapp_clicked' });
  assert.equal((await getLead(db, 'CX-7K3P2M9Q4D')).status, 'whatsapp_clicked');
  assert.deepEqual(await revertLatestStatus(db, 'CX-7K3P2M9Q4D', server()), { ok: false, code: 'no_revertible_status' });
});

test('does not revert an automatic form-delivery fact', async () => {
  const db = new FakeD1();
  await recordSuccessfulForm(db, baseEvent({ event_type: 'form_submitted_successfully' }), server());
  assert.deepEqual(await revertLatestStatus(db, 'CX-7K3P2M9Q4D', server()), { ok: false, code: 'no_revertible_status' });
});

test('returns recent records and a sanitized AI export without raw click IDs', async () => {
  const db = new FakeD1();
  await recordEvent(db, baseEvent({ first_gclid: 'first-secret-id' }), server());

  const recent = await listRecentLeads(db, 50);
  assert.equal(recent.length, 1);
  assert.equal(recent[0].lead_id, 'CX-7K3P2M9Q4D');

  const exported = await exportLead(db, 'CX-7K3P2M9Q4D');
  assert.equal(exported.schema_version, 1);
  assert.equal(exported.lead_id, 'CX-7K3P2M9Q4D');
  assert.equal(exported.click_ids.gclid_present, true);
  assert.equal(exported.click_ids.first_gclid_present, true);
  assert.equal('gclid' in exported, false);
  assert.equal(JSON.stringify(exported).includes('session-click-id'), false);
  assert.equal(JSON.stringify(exported).includes('first-secret-id'), false);
});

test('cleanup is bounded to 500 events then 500 event-free leads', async () => {
  const db = new FakeD1();
  for (let index = 0; index < 501; index += 1) {
    const leadId = `CX-${String(index).padStart(10, '0')}`;
    db.leads.set(leadId, { lead_id: leadId, expires_at: '2026-01-01T00:00:00.000Z' });
    db.events.push({ id: ++db.sequence, lead_id: leadId });
  }

  const first = await cleanupExpiredLeads(db, '2026-09-21T00:00:00.000Z');
  assert.deepEqual(first, { events_deleted: 500, leads_deleted: 500 });
  assert.equal(db.events.length, 1);
  assert.equal(db.leads.size, 1);

  const second = await cleanupExpiredLeads(db, '2026-09-21T00:00:00.000Z');
  assert.deepEqual(second, { events_deleted: 1, leads_deleted: 1 });
  assert.equal(db.events.length, 0);
  assert.equal(db.leads.size, 0);
});
