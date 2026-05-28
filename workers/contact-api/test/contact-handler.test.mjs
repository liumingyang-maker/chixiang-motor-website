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
