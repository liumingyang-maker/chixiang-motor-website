PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL,
  client_version TEXT NOT NULL,
  first_source TEXT NOT NULL,
  first_referrer_domain TEXT,
  first_landing_page TEXT NOT NULL,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,
  first_gclid TEXT,
  first_gbraid TEXT,
  first_wbraid TEXT,
  first_fbclid TEXT,
  first_msclkid TEXT,
  first_yclid TEXT,
  first_ttclid TEXT,
  language TEXT NOT NULL,
  first_visit_client_at TEXT,
  first_seen_server_at TEXT NOT NULL,
  cloudflare_country TEXT,
  country_source TEXT,
  status TEXT NOT NULL CHECK (status IN ('whatsapp_clicked', 'message_received', 'qualified')),
  message_received_at TEXT,
  qualified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  dedupe_key TEXT NOT NULL UNIQUE,
  lead_id TEXT NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'whatsapp_click',
    'form_submitted_successfully',
    'status_message_received',
    'status_qualified',
    'status_reverted'
  )),
  session_source TEXT,
  session_landing_page TEXT,
  previous_page TEXT,
  click_page TEXT,
  product TEXT,
  cta TEXT,
  language TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  fbclid TEXT,
  msclkid TEXT,
  yclid TEXT,
  ttclid TEXT,
  client_timestamp TEXT,
  server_timestamp TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  manual_status INTEGER NOT NULL DEFAULT 0 CHECK (manual_status IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads(updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_expires_at ON leads(expires_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_time ON lead_events(lead_id, server_timestamp DESC);
