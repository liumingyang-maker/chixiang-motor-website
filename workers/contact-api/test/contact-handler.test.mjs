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
    freight_forwarder: 'Да, есть перевозчик в Китае',
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
  assert.match(email.text, /Freight forwarder in China: Да, есть перевозчик в Китае/);
  assert.match(email.text, /Engine code: CG150-01/);
  assert.match(email.text, /UTM campaign: cg-peru/);
  assert.match(email.text, /GCLID: test-gclid/);
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
