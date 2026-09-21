import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildInquiryEmail,
  handleContactRequest,
  validateInquiry
} from '../src/contact-handler.mjs';

function formRequest(fields) {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => body.set(key, value));

  return new Request('https://chixiangmotor.com/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://chixiangmotor.com'
    },
    body
  });
}

function turnstileEnv(sent = [], verificationResults = [{ success: true }]) {
  const verificationRequests = [];

  return {
    env: {
      TURNSTILE_SECRET_KEY: 'test-secret',
      EMAIL: {
        async send(message) {
          sent.push(message);
        }
      }
    },
    verificationRequests,
    async fetch(url, init) {
      verificationRequests.push({ url: String(url), body: init.body });
      return Response.json(verificationResults.shift() || { success: true });
    }
  };
}

test('validateInquiry accepts a real export inquiry', () => {
  const result = validateInquiry({
    name: 'Carlos Rivera',
    contact: '+55 11 99999-0000',
    country: 'Brazil',
    company: 'Rivera Moto Parts',
    product: 'CG engine',
    message: 'Please quote 100 CG150 engines for Brazil.'
  });

  assert.equal(result.ok, true);
});

test('validateInquiry rejects missing contact details', () => {
  const result = validateInquiry({
    name: 'Carlos Rivera',
    product: 'CG engine',
    message: 'Please quote 100 CG150 engines.'
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /contact/i);
});

test('buildInquiryEmail includes the sales inbox and source page', () => {
  const email = buildInquiryEmail({
    name: 'Carlos Rivera',
    contact: '+55 11 99999-0000',
    country: 'Brazil',
    company: 'Rivera Moto Parts',
    product: 'CG engine',
    message: 'Please quote 100 CG150 engines for Brazil.',
    page_url: 'https://chixiangmotor.com/pt/motor-cg.html',
    site_language: 'pt'
  });

  assert.equal(email.to, 'chixiangmotor@163.com');
  assert.equal(email.from, 'inquiry@chixiangmotor.com');
  assert.match(email.subject, /New Chixiang Motor Inquiry/);
  assert.match(email.text, /Carlos Rivera/);
  assert.match(email.text, /pt\/motor-cg\.html/);
});

test('buildInquiryEmail preserves detailed procurement and attribution fields', () => {
  const email = buildInquiryEmail({
    name: 'Carlos Rivera',
    contact: '+55 11 99999-0000',
    country: 'Peru',
    product_interest: 'CG150',
    application: 'Motocicleta de trabajo',
    displacement: '150 cc',
    quantity: '100',
    vehicle: 'Trimoto X',
    engine_code: 'CG150-01',
    requirements: 'Reversa y repuestos',
    market: 'Peru',
    source_form: 'es_peru_cg_landing',
    utm_campaign: 'cg-peru',
    gclid: 'test-gclid'
  });

  assert.match(email.text, /Application: Motocicleta de trabajo/);
  assert.match(email.text, /Quantity: 100/);
  assert.match(email.text, /Engine code: CG150-01/);
  assert.match(email.text, /UTM campaign: cg-peru/);
  assert.match(email.text, /GCLID: test-gclid/);
});

test('buildInquiryEmail includes escaped Lead ID and first/session attribution rows', () => {
  const email = buildInquiryEmail({
    name: 'Carlos <Rivera>',
    contact: '+55 11 99999-0000',
    product: 'CG150',
    lead_id: 'CX-7K3P2M9Q4D',
    first_source: 'Google Ads',
    session_source: 'Direct',
    landing_page: '/en/',
    session_landing_page: '/en/contact',
    first_referrer_domain: 'google.com',
    previous_page: '/en/cg-engine',
    last_page: '/en/contact',
    attribution_client_version: '1.0.0',
    fbclid: 'meta-click-id',
    msclkid: 'microsoft-click-id',
    yclid: 'yandex-click-id',
    ttclid: 'tiktok-click-id'
  });

  assert.match(email.text, /Lead ID: CX-7K3P2M9Q4D/);
  assert.match(email.text, /First source: Google Ads/);
  assert.match(email.text, /Session source: Direct/);
  assert.match(email.text, /Landing page: \/en\//);
  assert.match(email.text, /Last page: \/en\/contact/);
  assert.match(email.text, /FBCLID: meta-click-id/);
  assert.match(email.html, /Carlos &lt;Rivera&gt;/);
  assert.doesNotMatch(email.html, /Carlos <Rivera>/);
});

test('handleContactRequest sends email and returns json success', async () => {
  const sent = [];
  const verify = turnstileEnv(sent);

  const response = await handleContactRequest(
    formRequest({
      name: 'Carlos Rivera',
      contact: '+55 11 99999-0000',
      country: 'Brazil',
      company: 'Rivera Moto Parts',
      product: 'CG engine',
      message: 'Please quote 100 CG150 engines for Brazil.',
      page_url: 'https://chixiangmotor.com/pt/motor-cg.html',
      site_language: 'pt',
      'cf-turnstile-response': 'valid-token'
    }),
    verify.env,
    { fetch: verify.fetch }
  );

  assert.equal(response.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(verify.verificationRequests.length, 1);
  assert.equal((await response.json()).ok, true);
});

test('successful email schedules a sanitized form attribution event in D1', async () => {
  const sent = [];
  const verify = turnstileEnv(sent);
  verify.env.LEADS_DB = { name: 'preview-db' };
  const pending = [];
  const stored = [];

  const attributedRequest = formRequest({
      name: 'Carlos Rivera',
      contact: '+55 11 99999-0000',
      product: 'CG engine',
      message: 'Please quote 100 engines.',
      lead_id: 'CX-7K3P2M9Q4D',
      first_source: 'Google Organic',
      session_source: 'Google Ads',
      landing_page: '/en/',
      session_landing_page: '/en/cg-engine',
      first_referrer_domain: 'google.com',
      previous_page: '/en/',
      last_page: '/en/contact?private=1',
      attribution_client_version: '1.0.0',
      first_utm_campaign: 'original-campaign',
      utm_campaign: 'return-campaign',
      first_gclid: 'first-click-id',
      gclid: 'return-click-id',
      site_language: 'en',
      source_cta: 'contact_form',
      'cf-turnstile-response': 'valid-token'
    });
  Object.defineProperty(attributedRequest, 'cf', { value: { country: 'PE' } });
  const response = await handleContactRequest(
    attributedRequest,
    verify.env,
    {
      fetch: verify.fetch,
      now: () => new Date('2026-09-21T05:00:00.000Z'),
      createEventId: () => 'EVT-7K3P2M9Q4D7K3P2M9Q4D',
      recordSuccessfulForm: async (...args) => {
        stored.push(args);
        return { result: 'recorded' };
      },
      waitUntil(promise) { pending.push(promise); }
    }
  );

  assert.equal(response.status, 200);
  assert.equal(sent.length, 1, 'existing email remains the success gate');
  assert.equal(pending.length, 1);
  await pending[0];
  assert.equal(stored.length, 1);
  assert.equal(stored[0][0], verify.env.LEADS_DB);
  assert.deepEqual(stored[0][1], {
    schema_version: 1,
    client_version: '1.0.0',
    event_id: 'EVT-7K3P2M9Q4D7K3P2M9Q4D',
    event_type: 'form_submitted_successfully',
    lead_id: 'CX-7K3P2M9Q4D',
    first_source: 'Google Organic',
    session_source: 'Google Ads',
    landing_page: '/en/',
    session_landing_page: '/en/cg-engine',
    first_referrer_domain: 'google.com',
    previous_page: '/en/',
    click_page: '/en/contact',
    product: 'CG engine',
    cta: 'contact_form',
    language: 'en',
    first_visit_time: '',
    client_timestamp: '2026-09-21T05:00:00.000Z',
    utm_campaign: 'return-campaign',
    first_utm_campaign: 'original-campaign',
    gclid: 'return-click-id',
    first_gclid: 'first-click-id'
  });
  assert.equal('name' in stored[0][1], false);
  assert.equal('contact' in stored[0][1], false);
  assert.deepEqual(stored[0][2], { country: 'PE', country_source: 'cloudflare_edge', now: '2026-09-21T05:00:00.000Z' });
});

test('D1 failure after email delivery is absorbed and preserves contact success', async () => {
  const verify = turnstileEnv();
  verify.env.LEADS_DB = {};
  const pending = [];
  const logged = [];
  const response = await handleContactRequest(
    formRequest({
      name: 'Carlos Rivera', contact: '+55 11 99999-0000', product: 'CG engine',
      lead_id: 'CX-7K3P2M9Q4D', first_source: 'Direct', session_source: 'Direct',
      landing_page: '/en/contact', session_landing_page: '/en/contact', last_page: '/en/contact',
      attribution_client_version: '1.0.0', site_language: 'en',
      'cf-turnstile-response': 'valid-token'
    }),
    verify.env,
    {
      fetch: verify.fetch,
      recordSuccessfulForm: async () => { throw new Error('D1 down'); },
      waitUntil(promise) { pending.push(promise); },
      logAttributionFailure(error) { logged.push(error.message); }
    }
  );
  assert.equal(response.status, 200);
  await pending[0];
  assert.deepEqual(logged, ['D1 down']);
});

test('does not schedule D1 before validation, Turnstile and email success', async () => {
  const cases = [
    { fields: { product: 'CG engine' }, emailFails: false },
    {
      fields: { name: 'Carlos', contact: 'x', product: 'CG engine', 'cf-turnstile-response': 'bad' },
      verifyResult: { success: false }
    },
    {
      fields: { name: 'Carlos', contact: 'x', product: 'CG engine', 'cf-turnstile-response': 'ok' },
      emailFails: true
    }
  ];
  for (const item of cases) {
    const pending = [];
    const verify = turnstileEnv([], [item.verifyResult || { success: true }]);
    verify.env.LEADS_DB = {};
    if (item.emailFails) verify.env.EMAIL.send = async () => { throw new Error('email down'); };
    await handleContactRequest(formRequest(item.fields), verify.env, {
      fetch: verify.fetch,
      waitUntil(promise) { pending.push(promise); },
      recordSuccessfulForm: async () => ({ result: 'recorded' })
    });
    assert.equal(pending.length, 0);
  }
});

test('handleContactRequest rejects missing Turnstile token before sending email', async () => {
  const sent = [];
  const verify = turnstileEnv(sent);

  const response = await handleContactRequest(
    formRequest({
      name: 'Carlos Rivera',
      contact: '+55 11 99999-0000',
      product: 'CG engine',
      message: 'Please quote 100 CG150 engines for Brazil.'
    }),
    verify.env,
    { fetch: verify.fetch }
  );

  assert.equal(response.status, 400);
  assert.equal(sent.length, 0);
  assert.equal(verify.verificationRequests.length, 0);
  assert.match((await response.json()).error, /anti-spam/i);
});

test('handleContactRequest rejects failed Turnstile verification', async () => {
  const sent = [];
  const verify = turnstileEnv(sent, [{ success: false, 'error-codes': ['invalid-input-response'] }]);

  const response = await handleContactRequest(
    formRequest({
      name: 'Carlos Rivera',
      contact: '+55 11 99999-0000',
      product: 'CG engine',
      message: 'Please quote 100 CG150 engines for Brazil.',
      'cf-turnstile-response': 'invalid-token'
    }),
    verify.env,
    { fetch: verify.fetch }
  );

  assert.equal(response.status, 400);
  assert.equal(sent.length, 0);
  assert.equal(verify.verificationRequests.length, 1);
  assert.match((await response.json()).error, /anti-spam/i);
});

test('handleContactRequest returns a stable error code when email delivery fails', async () => {
  const verify = turnstileEnv();
  verify.env.EMAIL.send = async () => {
    throw new Error('Sender domain is not enabled.');
  };

  const response = await handleContactRequest(
    formRequest({
      name: 'TEST Central Asia',
      contact: '+86 10000000000',
      product: 'CG Water',
      message: 'Test only.',
      'cf-turnstile-response': 'valid-token'
    }),
    verify.env,
    { fetch: verify.fetch }
  );

  assert.equal(response.status, 502);
  const payload = await response.json();
  assert.equal(payload.code, 'email_delivery_failed');
});

test('validateInquiry rejects spam in requirements field (buy cheap viagra)', () => {
  const result = validateInquiry({
    name: 'Test User',
    contact: '+7 999 000-00-00',
    product: 'CB150',
    requirements: 'buy cheap viagra online'
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /spam/i);
});

test('validateInquiry rejects spam in requirements field (casino promotion)', () => {
  const result = validateInquiry({
    name: 'Test User',
    contact: '+7 999 000-00-00',
    product: 'CB150',
    requirements: 'casino promotion bonus code'
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /spam/i);
});

test('validateInquiry accepts normal requirements', () => {
  const result = validateInquiry({
    name: 'Ivan Petrov',
    contact: '+7 999 123-45-67',
    product: 'Horizontal 150',
    requirements: 'Need electric start, 12V battery, reinforced crankshaft'
  });
  assert.equal(result.ok, true);
});

test('buildInquiryEmail includes requirements in text and html', () => {
  const email = buildInquiryEmail({
    name: 'Ivan Petrov',
    contact: '+7 999 123-45-67',
    product: 'Horizontal 150',
    requirements: 'Electric start and reinforced crankshaft'
  });
  assert.match(email.text, /Requirements: Electric start and reinforced crankshaft/);
  assert.match(email.html, /Electric start and reinforced crankshaft/);
});

test('handleContactRequest rejects requirements spam even with valid Turnstile', async () => {
  const sent = [];
  const verify = turnstileEnv(sent);

  const response = await handleContactRequest(
    formRequest({
      name: 'Spammer',
      contact: '+7 999 000-00-00',
      product: 'CB150',
      requirements: 'buy cheap viagra',
      'cf-turnstile-response': 'valid-token'
    }),
    verify.env,
    { fetch: verify.fetch }
  );

  assert.equal(response.status, 400);
  assert.equal(sent.length, 0, 'email must not be sent for spam requirements');
  assert.match((await response.json()).error, /spam/i);
});
