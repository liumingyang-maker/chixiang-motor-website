import { createEventId, isAllowedTransition, normalizeCountry, normalizeLeadId } from './attribution-contract.mjs';

const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;
const CLICK_ID_FIELDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'yclid', 'ttclid'];

function isoTime(value = Date.now()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError('Invalid server timestamp');
  return date.toISOString();
}

function serverValues(context = {}) {
  const now = isoTime(context.now ?? Date.now());
  return {
    now,
    expires_at: new Date(Date.parse(now) + RETENTION_MS).toISOString(),
    country: normalizeCountry(context.country),
    country_source: context.country ? String(context.country_source || 'cloudflare_edge') : ''
  };
}

function changes(result) {
  return Number(result?.meta?.changes || 0);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function eventDedupeKey(event) {
  const timestamp = Date.parse(event.client_timestamp);
  const bucket = Math.floor(timestamp / 5000);
  return sha256([
    event.lead_id,
    event.event_type,
    event.click_page || '',
    event.cta || '',
    bucket
  ].join('|'));
}

function insertLeadStatement(db, event, server, initialStatus) {
  const messageReceivedAt = initialStatus === 'message_received' ? server.now : '';
  return db.prepare(`
    -- lead-store:upsert-lead
    INSERT INTO leads (
      lead_id, schema_version, client_version, first_source, first_referrer_domain,
      first_landing_page, first_utm_source, first_utm_medium, first_utm_campaign,
      first_utm_content, first_utm_term, first_gclid, first_gbraid, first_wbraid,
      first_fbclid, first_msclkid, first_yclid, first_ttclid, language,
      first_visit_client_at, first_seen_server_at, cloudflare_country, country_source,
      status, message_received_at, qualified_at, created_at, updated_at, expires_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      NULLIF(?, ''), NULL, ?, ?, ?
    )
    ON CONFLICT(lead_id) DO UPDATE SET
      client_version = excluded.client_version,
      cloudflare_country = COALESCE(leads.cloudflare_country, excluded.cloudflare_country),
      country_source = CASE
        WHEN leads.cloudflare_country IS NULL THEN excluded.country_source
        ELSE leads.country_source
      END,
      status = CASE
        WHEN leads.status = 'qualified' THEN leads.status
        WHEN excluded.status = 'message_received' THEN 'message_received'
        ELSE leads.status
      END,
      message_received_at = COALESCE(leads.message_received_at, excluded.message_received_at),
      updated_at = excluded.updated_at,
      expires_at = excluded.expires_at
  `).bind(
    event.lead_id,
    event.schema_version,
    event.client_version,
    event.first_source,
    event.first_referrer_domain || null,
    event.landing_page,
    event.first_utm_source || null,
    event.first_utm_medium || null,
    event.first_utm_campaign || null,
    event.first_utm_content || null,
    event.first_utm_term || null,
    event.first_gclid || null,
    event.first_gbraid || null,
    event.first_wbraid || null,
    event.first_fbclid || null,
    event.first_msclkid || null,
    event.first_yclid || null,
    event.first_ttclid || null,
    event.language,
    event.first_visit_time || null,
    server.now,
    server.country || null,
    server.country ? server.country_source : null,
    initialStatus,
    messageReceivedAt,
    server.now,
    server.now,
    server.expires_at
  );
}

function insertEventStatement(db, event, serverTimestamp, dedupeKey, status = {}) {
  return db.prepare(`
    -- lead-store:insert-event
    INSERT OR IGNORE INTO lead_events (
      event_id, dedupe_key, lead_id, event_type, session_source, session_landing_page,
      previous_page, click_page, product, cta, language, utm_source, utm_medium,
      utm_campaign, utm_content, utm_term, gclid, gbraid, wbraid, fbclid, msclkid,
      yclid, ttclid, client_timestamp, server_timestamp, from_status, to_status, manual_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.event_id,
    dedupeKey,
    event.lead_id,
    event.event_type,
    event.session_source || null,
    event.session_landing_page || null,
    event.previous_page || null,
    event.click_page || null,
    event.product || null,
    event.cta || null,
    event.language || null,
    event.utm_source || null,
    event.utm_medium || null,
    event.utm_campaign || null,
    event.utm_content || null,
    event.utm_term || null,
    event.gclid || null,
    event.gbraid || null,
    event.wbraid || null,
    event.fbclid || null,
    event.msclkid || null,
    event.yclid || null,
    event.ttclid || null,
    event.client_timestamp || null,
    serverTimestamp,
    status.from_status || null,
    status.to_status || null,
    status.manual_status ? 1 : 0
  );
}

export async function recordEvent(db, event, context = {}) {
  if (!db) return { result: 'database_unavailable' };
  const server = serverValues(context);
  const dedupeKey = await eventDedupeKey(event);
  const duplicate = await db.prepare(`
    -- lead-store:find-duplicate
    SELECT event_id FROM lead_events WHERE dedupe_key = ? OR event_id = ? LIMIT 1
  `).bind(dedupeKey, event.event_id).first();
  if (duplicate) return { result: 'event_already_recorded' };

  const initialStatus = event.event_type === 'form_submitted_successfully'
    ? 'message_received'
    : 'whatsapp_clicked';
  const results = await db.batch([
    insertLeadStatement(db, event, server, initialStatus),
    insertEventStatement(db, event, server.now, dedupeKey)
  ]);
  return { result: changes(results[1]) ? 'recorded' : 'event_already_recorded' };
}

export function recordSuccessfulForm(db, event, context = {}) {
  return recordEvent(db, { ...event, event_type: 'form_submitted_successfully' }, context);
}

async function getLeadRow(db, leadId) {
  const id = normalizeLeadId(leadId);
  if (!id) return null;
  return db.prepare(`
    -- lead-store:get-lead
    SELECT * FROM leads WHERE lead_id = ? LIMIT 1
  `).bind(id).first();
}

export async function getLead(db, leadId) {
  const lead = await getLeadRow(db, leadId);
  if (!lead) return null;
  const events = await db.prepare(`
    -- lead-store:get-events
    SELECT * FROM lead_events WHERE lead_id = ? ORDER BY id DESC
  `).bind(lead.lead_id).all();
  return { ...lead, events: events?.results || [] };
}

export async function listRecentLeads(db, limit = 50) {
  const boundedLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 50));
  const result = await db.prepare(`
    -- lead-store:list-recent
    SELECT lead_id, first_source, first_landing_page, language, cloudflare_country,
           country_source, status, first_visit_client_at, message_received_at,
           qualified_at, created_at, updated_at
    FROM leads ORDER BY updated_at DESC LIMIT ?
  `).bind(boundedLimit).all();
  return result?.results || [];
}

function statusEvent(leadId, eventType, timestamp) {
  return {
    event_id: createEventId(),
    lead_id: leadId,
    event_type: eventType,
    client_timestamp: timestamp
  };
}

async function updateStatus(db, lead, nextStatus, context, eventType, eventFrom = lead.status) {
  const server = serverValues(context);
  const event = statusEvent(lead.lead_id, eventType, server.now);
  const dedupeKey = await eventDedupeKey({ ...event, click_page: '', cta: `${eventFrom}:${nextStatus}` });
  const update = db.prepare(`
    -- lead-store:update-status
    UPDATE leads SET
      status = ?,
      message_received_at = COALESCE(NULLIF(?, ''), message_received_at),
      qualified_at = COALESCE(NULLIF(?, ''), qualified_at),
      updated_at = ?,
      expires_at = ?
    WHERE lead_id = ? AND status = ?
  `).bind(
    nextStatus,
    nextStatus === 'message_received' ? server.now : '',
    nextStatus === 'qualified' ? server.now : '',
    server.now,
    server.expires_at,
    lead.lead_id,
    lead.status
  );
  const insertion = insertEventStatement(db, event, server.now, dedupeKey, {
    from_status: eventFrom,
    to_status: nextStatus,
    manual_status: true
  });
  const result = await db.batch([update, insertion]);
  if (!changes(result[0])) return { ok: false, code: 'status_conflict' };
  return { ok: true, status: nextStatus };
}

export async function transitionLeadStatus(db, leadId, action, context = {}) {
  const lead = await getLeadRow(db, leadId);
  if (!lead) return { ok: false, code: 'lead_not_found' };
  const nextStatus = action === 'mark_message_received'
    ? 'message_received'
    : action === 'mark_qualified'
      ? 'qualified'
      : '';
  if (!nextStatus || !isAllowedTransition(lead.status, nextStatus)) {
    return { ok: false, code: 'invalid_status_transition' };
  }
  const eventType = nextStatus === 'message_received' ? 'status_message_received' : 'status_qualified';
  return updateStatus(db, lead, nextStatus, context, eventType);
}

export async function revertLatestStatus(db, leadId, context = {}) {
  const lead = await getLeadRow(db, leadId);
  if (!lead) return { ok: false, code: 'lead_not_found' };
  const transition = await db.prepare(`
    -- lead-store:latest-manual-transition
    SELECT e.* FROM lead_events e
    WHERE e.lead_id = ?
      AND e.manual_status = 1
      AND e.event_type IN ('status_message_received', 'status_qualified')
      AND NOT EXISTS (
        SELECT 1 FROM lead_events r
        WHERE r.lead_id = e.lead_id
          AND r.event_type = 'status_reverted'
          AND r.manual_status = 1
          AND r.from_status = e.to_status
          AND r.to_status = e.from_status
          AND r.id > e.id
      )
      AND NOT (
        e.from_status = 'whatsapp_clicked'
        AND EXISTS (
          SELECT 1 FROM lead_events f
          WHERE f.lead_id = e.lead_id
            AND f.event_type = 'form_submitted_successfully'
            AND f.id > e.id
        )
      )
    ORDER BY e.id DESC LIMIT 1
  `).bind(lead.lead_id).first();
  if (!transition || lead.status !== transition.to_status) {
    return { ok: false, code: 'no_revertible_status' };
  }
  return updateStatus(
    db,
    lead,
    transition.from_status,
    context,
    'status_reverted',
    transition.to_status
  );
}

function present(value) {
  return Boolean(value && String(value).trim());
}

export async function exportLead(db, leadId) {
  const lead = await getLead(db, leadId);
  if (!lead) return null;
  const latest = lead.events[0] || {};
  const firstClickIds = Object.fromEntries(CLICK_ID_FIELDS.map(name => [`first_${name}_present`, present(lead[`first_${name}`])]));
  const eventClickIds = Object.fromEntries(CLICK_ID_FIELDS.map(name => [
    `${name}_present`,
    lead.events.some(event => present(event[name]))
  ]));
  return {
    schema_version: 1,
    lead_id: lead.lead_id,
    status: lead.status,
    sources: {
      first_source: lead.first_source,
      inquiry_session_source: latest.session_source || ''
    },
    pages: {
      landing_page: lead.first_landing_page,
      session_landing_page: latest.session_landing_page || '',
      previous_page: latest.previous_page || '',
      conversion_page: latest.click_page || ''
    },
    product: latest.product || '',
    cta: latest.cta || '',
    language: latest.language || lead.language,
    country: {
      code: lead.cloudflare_country || '',
      source: lead.country_source || ''
    },
    campaigns: {
      first_utm_source: lead.first_utm_source || '',
      first_utm_medium: lead.first_utm_medium || '',
      first_utm_campaign: lead.first_utm_campaign || '',
      utm_source: latest.utm_source || '',
      utm_medium: latest.utm_medium || '',
      utm_campaign: latest.utm_campaign || ''
    },
    click_ids: { ...firstClickIds, ...eventClickIds },
    timestamps: {
      first_visit: lead.first_visit_client_at || '',
      first_seen: lead.first_seen_server_at,
      whatsapp_click: lead.events.find(event => event.event_type === 'whatsapp_click')?.server_timestamp || '',
      message_received: lead.message_received_at || '',
      qualified: lead.qualified_at || '',
      updated: lead.updated_at
    },
    events: lead.events.map(event => ({
      event_type: event.event_type,
      session_source: event.session_source || '',
      session_landing_page: event.session_landing_page || '',
      previous_page: event.previous_page || '',
      conversion_page: event.click_page || '',
      product: event.product || '',
      cta: event.cta || '',
      language: event.language || '',
      server_timestamp: event.server_timestamp,
      from_status: event.from_status || '',
      to_status: event.to_status || ''
    }))
  };
}

export async function cleanupExpiredLeads(db, scheduledTime = Date.now()) {
  if (!db) return { events_deleted: 0, leads_deleted: 0 };
  const cutoff = isoTime(scheduledTime);
  const eventResult = await db.prepare(`
    -- lead-store:cleanup-events
    DELETE FROM lead_events WHERE id IN (
      SELECT lead_events.id FROM lead_events
      INNER JOIN leads ON leads.lead_id = lead_events.lead_id
      WHERE leads.expires_at <= ?
      ORDER BY lead_events.id LIMIT 500
    )
  `).bind(cutoff).run();
  const leadResult = await db.prepare(`
    -- lead-store:cleanup-leads
    DELETE FROM leads WHERE lead_id IN (
      SELECT leads.lead_id FROM leads
      WHERE leads.expires_at <= ?
        AND NOT EXISTS (SELECT 1 FROM lead_events WHERE lead_events.lead_id = leads.lead_id)
      ORDER BY leads.expires_at LIMIT 500
    )
  `).bind(cutoff).run();
  return {
    events_deleted: changes(eventResult),
    leads_deleted: changes(leadResult)
  };
}
