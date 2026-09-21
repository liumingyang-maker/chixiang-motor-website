const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'internal', 'leads', 'index.html');
const cssPath = path.join(root, 'internal', 'leads', 'leads.css');
const jsPath = path.join(root, 'internal', 'leads', 'leads.js');

test('owner page has one clear heading, labelled search and explicit async states', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<h1[^>]*>Inquiry source lookup<\/h1>/);
  assert.match(html, /<label[^>]+for="lead-search"/);
  assert.match(html, /id="lead-search"/);
  assert.match(html, /id="recent-leads"/);
  assert.match(html, /id="loading-state"/);
  assert.match(html, /id="empty-state"/);
  assert.match(html, /id="error-state"[^>]+role="alert"/);
  assert.match(html, /id="service-status"[^>]+aria-live="polite"/);
  assert.match(html, /<th[^>]*>Lead ID<\/th>/);
  assert.match(html, /<th[^>]*>Source<\/th>/);
  assert.match(html, /<th[^>]*>Status<\/th>/);
  assert.match(html, /<th[^>]*>Updated<\/th>/);
  assert.match(html, />Copy for AI<\/button>/);
  assert.match(html, />Download JSON<\/button>/);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
});

test('owner page is self-contained, responsive and keeps accessible interaction safeguards', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const source = fs.readFileSync(jsPath, 'utf8');
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//i);
  assert.doesNotMatch(html, /<link[^>]+href="https?:\/\//i);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(source, /\.textContent\s*=/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /application\/json/);
  assert.match(source, /resultTitle\.focus\(\)/);
  assert.match(source, /\/api\/internal\/leads\/recent\?limit=50/);
});

test('UI helpers normalize IDs, expose only valid next actions and format stable AI JSON', () => {
  const ui = require(jsPath);
  assert.equal(ui.normalizeLeadId(' cx-7k3p2m9q4d '), 'CX-7K3P2M9Q4D');
  assert.equal(ui.normalizeLeadId('not-a-lead'), '');
  assert.deepEqual(ui.allowedActions({ status: 'whatsapp_clicked', events: [] }), ['mark_message_received']);
  assert.deepEqual(ui.allowedActions({
    status: 'message_received',
    events: [{ event_type: 'form_submitted_successfully' }]
  }), ['mark_qualified']);
  assert.deepEqual(ui.allowedActions({
    status: 'qualified',
    events: [{ event_type: 'status_qualified', from_status: 'message_received', to_status: 'qualified' }]
  }), ['revert']);

  const text = ui.formatForAi({ schema_version: 1, lead_id: 'CX-7K3P2M9Q4D' });
  assert.match(text, /"schema_version": 1/);
  assert.match(text, /"lead_id": "CX-7K3P2M9Q4D"/);
});
