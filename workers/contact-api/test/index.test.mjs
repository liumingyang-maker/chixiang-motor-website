import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import worker from '../src/index.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));

test('Wrangler config has bounded routes, D1 migration and daily cleanup settings', () => {
  assert.equal(config.workers_dev, false);
  assert.deepEqual(config.triggers, { crons: ['17 3 * * *'] });
  assert.equal(config.d1_databases.length, 1);
  assert.equal(config.d1_databases[0].binding, 'LEADS_DB');
  assert.equal(config.d1_databases[0].database_name, 'chixiang-lead-attribution-preview');
  assert.equal(config.d1_databases[0].migrations_dir, 'migrations');
  assert.match(config.d1_databases[0].database_id, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
  assert.doesNotMatch(config.d1_databases[0].database_id, /^0{8}-/);
  assert.deepEqual(config.routes.map(route => route.pattern).sort(), [
    'chixiangmotor.com/api/attribution/*',
    'chixiangmotor.com/api/contact*',
    'chixiangmotor.com/api/internal/leads*',
    'www.chixiangmotor.com/api/attribution/*',
    'www.chixiangmotor.com/api/contact*',
    'www.chixiangmotor.com/api/internal/leads*'
  ]);
});

test('dispatches only exact API paths', async () => {
  const origin = { origin: 'https://chixiangmotor.com' };
  const attribution = await worker.fetch(new Request(
    'https://chixiangmotor.com/api/attribution/whatsapp-click',
    { method: 'GET', headers: origin }
  ), {});
  assert.equal(attribution.status, 405, 'the exact attribution route reached its method guard');

  for (const path of [
    '/api/attribution/whatsapp-click/extra',
    '/api/attribution/whatsapp-click-fake',
    '/api/contact-extra',
    '/api/internal/leads-fake'
  ]) {
    const response = await worker.fetch(new Request(`https://chixiangmotor.com${path}`), {});
    assert.equal(response.status, 404, path);
  }

  const contact = await worker.fetch(new Request('https://chixiangmotor.com/api/contact?source=test'), {});
  assert.equal(contact.status, 405, 'query strings do not affect exact path matching');
});

test('scheduled cleanup is delegated through waitUntil without requiring a database', async () => {
  const pending = [];
  await worker.scheduled(
    { scheduledTime: Date.parse('2026-09-21T00:00:00.000Z') },
    {},
    { waitUntil(promise) { pending.push(promise); } }
  );
  assert.equal(pending.length, 1);
  assert.deepEqual(await pending[0], { events_deleted: 0, leads_deleted: 0 });
});

test('dispatches exact internal paths and passes the Access context through', async () => {
  const ctx = {
    access: { async getIdentity() { return { email: 'chixiangmotor@163.com' }; } }
  };
  const exact = await worker.fetch(
    new Request('https://chixiangmotor.com/api/internal/leads?lead_id=CX-7K3P2M9Q4D'),
    {},
    ctx
  );
  assert.equal(exact.status, 503, 'exact route reached the authenticated database guard');

  const lookalike = await worker.fetch(
    new Request('https://chixiangmotor.com/api/internal/leads/exported?lead_id=CX-7K3P2M9Q4D'),
    {},
    ctx
  );
  assert.equal(lookalike.status, 404);
});
