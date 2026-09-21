import { jsonResponse, normalizeLeadId, normalizeStatusRequest } from './attribution-contract.mjs';
import {
  exportLead,
  listRecentLeads,
  revertLatestStatus,
  transitionLeadStatus
} from './lead-store.mjs';

const OWNER_EMAIL = 'chixiangmotor@163.com';
const MAX_STATUS_BODY_BYTES = 2048;

const DEFAULT_STORE = {
  exportLead,
  listRecentLeads,
  revertLatestStatus,
  transitionLeadStatus
};

async function isOwner(context) {
  if (!context?.access || typeof context.access.getIdentity !== 'function') return false;
  try {
    const identity = await context.access.getIdentity();
    return String(identity?.email || '').trim().toLowerCase() === OWNER_EMAIL;
  } catch {
    return false;
  }
}

function methodNotAllowed(allowed) {
  const response = jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
  response.headers.set('allow', allowed);
  return response;
}

function leadIdFrom(url) {
  return normalizeLeadId(url.searchParams.get('lead_id'));
}

async function readStatusBody(request) {
  const declared = Number.parseInt(request.headers.get('content-length') || '0', 10);
  if (declared > MAX_STATUS_BODY_BYTES) return null;
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_STATUS_BODY_BYTES) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function storeErrorResponse(result) {
  if (result.code === 'lead_not_found') return jsonResponse({ ok: false, error: result.code }, 404);
  return jsonResponse({ ok: false, error: result.code || 'invalid_status_transition' }, 409);
}

export async function handleInternalLeadsRequest(request, env = {}, context = {}, methods = DEFAULT_STORE) {
  if (!(await isOwner(context))) {
    return jsonResponse({ ok: false, error: 'unauthorized' }, 403);
  }

  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/api/internal/leads/status') {
    if (request.method !== 'POST') return methodNotAllowed('POST');
  } else if (request.method !== 'GET') {
    return methodNotAllowed('GET');
  }

  if (!env.LEADS_DB) {
    return jsonResponse({ ok: false, error: 'database_unavailable' }, 503);
  }

  try {
    if (path === '/api/internal/leads/recent') {
      const requested = Number.parseInt(url.searchParams.get('limit') || '50', 10);
      const limit = Math.max(1, Math.min(100, Number.isFinite(requested) ? requested : 50));
      const leads = await methods.listRecentLeads(env.LEADS_DB, limit);
      return jsonResponse({ ok: true, leads }, 200);
    }

    if (path === '/api/internal/leads' || path === '/api/internal/leads/export') {
      const leadId = leadIdFrom(url);
      if (!leadId) return jsonResponse({ ok: false, error: 'invalid_lead_id' }, 400);
      const lead = await methods.exportLead(env.LEADS_DB, leadId);
      if (!lead) return jsonResponse({ ok: false, error: 'lead_not_found' }, 404);
      return jsonResponse({ ok: true, lead }, 200);
    }

    if (path === '/api/internal/leads/status') {
      const body = await readStatusBody(request);
      const normalized = normalizeStatusRequest(body);
      if (!normalized.ok) return jsonResponse({ ok: false, error: normalized.code }, 400);
      const result = normalized.action === 'revert'
        ? await methods.revertLatestStatus(env.LEADS_DB, normalized.lead_id)
        : await methods.transitionLeadStatus(env.LEADS_DB, normalized.lead_id, normalized.action);
      return result.ok
        ? jsonResponse({ ok: true, status: result.status }, 200)
        : storeErrorResponse(result);
    }
  } catch (error) {
    console.error('Internal lead operation failed', error?.message || 'unknown_error');
    return jsonResponse({ ok: false, error: 'database_unavailable' }, 503);
  }

  return jsonResponse({ ok: false, error: 'not_found' }, 404);
}

