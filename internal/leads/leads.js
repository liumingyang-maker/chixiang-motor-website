(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChixiangLeadLookup = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.init);
    else api.init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  var LEAD_ID = /^CX-[0-9A-HJKMNP-TV-Z]{10}$/;
  var currentLead = null;
  var lastRequest = null;

  function normalizeLeadId(value) {
    var normalized = String(value || '').trim().toUpperCase();
    return LEAD_ID.test(normalized) ? normalized : '';
  }

  function canRevert(lead) {
    var events = Array.isArray(lead.events) ? lead.events : [];
    var manualIndex = events.findIndex(function(event) {
      return event.event_type === 'status_message_received' || event.event_type === 'status_qualified' || event.event_type === 'status_reverted';
    });
    if (manualIndex < 0 || events[manualIndex].event_type === 'status_reverted') return false;
    var transition = events[manualIndex];
    if (transition.to_status !== lead.status) return false;
    if (transition.from_status === 'whatsapp_clicked') {
      return !events.slice(0, manualIndex).some(function(event) {
        return event.event_type === 'form_submitted_successfully';
      });
    }
    return true;
  }

  function allowedActions(lead) {
    var actions = [];
    if (lead.status === 'whatsapp_clicked') actions.push('mark_message_received');
    if (lead.status === 'message_received') actions.push('mark_qualified');
    if (canRevert(lead)) actions.push('revert');
    return actions;
  }

  function formatForAi(lead) {
    return JSON.stringify(lead, null, 2);
  }

  function text(element, value) {
    element.textContent = value == null || value === '' ? '—' : String(value);
  }

  function setBusy(busy, label) {
    document.getElementById('loading-state').hidden = !busy;
    document.getElementById('search-button').disabled = busy;
    document.getElementById('refresh-recent').disabled = busy;
    text(document.getElementById('service-status'), label || (busy ? 'Loading' : 'Ready'));
  }

  function showError(message) {
    var panel = document.getElementById('error-state');
    text(document.getElementById('error-message'), message);
    panel.hidden = false;
    text(document.getElementById('service-status'), 'Needs attention');
  }

  function clearError() {
    document.getElementById('error-state').hidden = true;
  }

  async function requestJson(url, options) {
    var response = await fetch(url, Object.assign({
      headers: { accept: 'application/json' },
      credentials: 'same-origin'
    }, options || {}));
    var contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) throw new Error('Access sign-in or JSON response required.');
    var payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'The request could not be completed.');
    return payload;
  }

  function addFact(list, label, value) {
    var wrapper = document.createElement('div');
    wrapper.className = 'fact';
    var term = document.createElement('dt');
    var description = document.createElement('dd');
    text(term, label);
    text(description, value);
    wrapper.appendChild(term);
    wrapper.appendChild(description);
    list.appendChild(wrapper);
  }

  function formatTime(value) {
    if (!value) return '—';
    var parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : value;
  }

  function renderActions(lead) {
    var actions = allowedActions(lead);
    document.querySelectorAll('[data-action]').forEach(function(button) {
      button.hidden = !actions.includes(button.dataset.action);
      button.disabled = false;
    });
  }

  function renderLead(lead) {
    currentLead = lead;
    var facts = document.getElementById('lead-facts');
    facts.replaceChildren();
    addFact(facts, 'Lead ID', lead.lead_id);
    addFact(facts, 'First source', lead.sources && lead.sources.first_source);
    addFact(facts, 'Inquiry source', lead.sources && lead.sources.inquiry_session_source);
    addFact(facts, 'Landing page', lead.pages && lead.pages.landing_page);
    addFact(facts, 'Conversion page', lead.pages && lead.pages.conversion_page);
    addFact(facts, 'Previous page', lead.pages && lead.pages.previous_page);
    addFact(facts, 'Product', lead.product);
    addFact(facts, 'CTA', lead.cta);
    addFact(facts, 'Language', lead.language);
    addFact(facts, 'Country estimate', lead.country && lead.country.code);
    addFact(facts, 'Campaign', lead.campaigns && (lead.campaigns.utm_campaign || lead.campaigns.first_utm_campaign));
    addFact(facts, 'First visit', formatTime(lead.timestamps && lead.timestamps.first_visit));

    text(document.getElementById('lead-status'), String(lead.status || 'unknown').replaceAll('_', ' '));
    renderActions(lead);

    var timeline = document.getElementById('event-timeline');
    timeline.replaceChildren();
    (lead.events || []).forEach(function(event) {
      var row = document.createElement('tr');
      [
        String(event.event_type || '').replaceAll('_', ' '),
        event.conversion_page,
        event.session_source,
        formatTime(event.server_timestamp)
      ].forEach(function(value) {
        var cell = document.createElement('td');
        text(cell, value);
        row.appendChild(cell);
      });
      timeline.appendChild(row);
    });

    document.getElementById('result-panel').hidden = false;
    var resultTitle = document.getElementById('result-title');
    resultTitle.focus();
  }

  async function loadLead(leadId) {
    lastRequest = function() { return loadLead(leadId); };
    setBusy(true, 'Loading lead');
    clearError();
    try {
      var payload = await requestJson('/api/internal/leads?lead_id=' + encodeURIComponent(leadId));
      renderLead(payload.lead);
      text(document.getElementById('service-status'), 'Lead loaded');
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false, document.getElementById('error-state').hidden ? 'Ready' : 'Needs attention');
    }
  }

  function appendRecentRow(body, lead) {
    var row = document.createElement('tr');
    var values = [lead.lead_id, lead.first_source, String(lead.status || '').replaceAll('_', ' '), formatTime(lead.updated_at)];
    values.forEach(function(value, index) {
      var cell = document.createElement('td');
      text(cell, value);
      if (index === 0) cell.className = 'lead-code';
      row.appendChild(cell);
    });
    var actionCell = document.createElement('td');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'table-button';
    text(button, 'View');
    button.addEventListener('click', function() {
      document.getElementById('lead-search').value = lead.lead_id;
      loadLead(lead.lead_id);
    });
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    body.appendChild(row);
  }

  async function loadRecent() {
    lastRequest = loadRecent;
    setBusy(true, 'Loading recent');
    clearError();
    try {
      var payload = await requestJson('/api/internal/leads/recent?limit=50');
      var body = document.getElementById('recent-body');
      body.replaceChildren();
      payload.leads.forEach(function(lead) { appendRecentRow(body, lead); });
      document.getElementById('empty-state').hidden = payload.leads.length !== 0;
      text(document.getElementById('service-status'), 'Recent records loaded');
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false, document.getElementById('error-state').hidden ? 'Ready' : 'Needs attention');
    }
  }

  async function changeStatus(action) {
    if (!currentLead) return;
    setBusy(true, 'Updating status');
    clearError();
    document.querySelectorAll('[data-action]').forEach(function(button) { button.disabled = true; });
    try {
      await requestJson('/api/internal/leads/status', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ lead_id: currentLead.lead_id, action: action })
      });
      await loadLead(currentLead.lead_id);
      await loadRecent();
    } catch (error) {
      showError(error.message);
      renderActions(currentLead);
    } finally {
      setBusy(false, document.getElementById('error-state').hidden ? 'Ready' : 'Needs attention');
    }
  }

  async function downloadJson() {
    if (!currentLead) return;
    try {
      var payload = await requestJson('/api/internal/leads/export?lead_id=' + encodeURIComponent(currentLead.lead_id));
      var blob = new Blob([formatForAi(payload.lead)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = payload.lead.lead_id + '-attribution.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      text(document.getElementById('service-status'), 'JSON downloaded');
    } catch (error) {
      showError(error.message);
    }
  }

  function init() {
    var form = document.getElementById('lookup-form');
    var input = document.getElementById('lead-search');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var leadId = normalizeLeadId(input.value);
      text(document.getElementById('lead-error'), leadId ? '' : 'Enter a valid Lead ID such as CX-7K3P2M9Q4D.');
      if (!leadId) {
        input.focus();
        return;
      }
      input.value = leadId;
      loadLead(leadId);
    });

    document.getElementById('refresh-recent').addEventListener('click', loadRecent);
    document.getElementById('retry-button').addEventListener('click', function() {
      if (lastRequest) lastRequest();
    });
    document.querySelectorAll('[data-action]').forEach(function(button) {
      button.addEventListener('click', function() { changeStatus(button.dataset.action); });
    });
    document.getElementById('copy-ai').addEventListener('click', async function() {
      if (!currentLead) return;
      try {
        await navigator.clipboard.writeText(formatForAi(currentLead));
        text(document.getElementById('service-status'), 'Copied for AI');
      } catch {
        showError('Clipboard access was blocked. Use Download JSON instead.');
      }
    });
    document.getElementById('download-json').addEventListener('click', downloadJson);
    loadRecent();
  }

  return {
    init: init,
    normalizeLeadId: normalizeLeadId,
    allowedActions: allowedActions,
    formatForAi: formatForAi
  };
});
