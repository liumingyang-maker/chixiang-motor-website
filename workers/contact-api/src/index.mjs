import { handleContactRequest } from './contact-handler.mjs';
import { handleAttributionRequest } from './attribution-handler.mjs';
import { handleInternalLeadsRequest } from './internal-leads-handler.mjs';
import { cleanupExpiredLeads } from './lead-store.mjs';

const INTERNAL_LEAD_PATHS = new Set([
  '/api/internal/leads',
  '/api/internal/leads/recent',
  '/api/internal/leads/status',
  '/api/internal/leads/export'
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return handleContactRequest(request, env, {
        waitUntil: ctx?.waitUntil ? promise => ctx.waitUntil(promise) : undefined
      });
    }

    if (url.pathname === '/api/attribution/whatsapp-click') {
      return handleAttributionRequest(request, env);
    }

    if (INTERNAL_LEAD_PATHS.has(url.pathname)) {
      return handleInternalLeadsRequest(request, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },

  async scheduled(controller, env, ctx) {
    const cleanup = cleanupExpiredLeads(env.LEADS_DB, controller.scheduledTime)
      .catch(error => {
        console.error('Attribution cleanup failed', error?.message || 'unknown_error');
        return { events_deleted: 0, leads_deleted: 0 };
      });
    ctx.waitUntil(cleanup);
  }
};
