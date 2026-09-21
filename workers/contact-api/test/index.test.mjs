import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.mjs';

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
