const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const verificationFile = path.join(
  __dirname,
  '..',
  'yandex_8a3590afcb928a95.html'
);

test('publishes the Yandex Webmaster verification file at the site root', () => {
  assert.ok(
    fs.existsSync(verificationFile),
    'the exact verification filename must exist at the site root'
  );

  const html = fs.readFileSync(verificationFile, 'utf8');
  assert.match(
    html,
    /<meta http-equiv="Content-Type" content="text\/html; charset=UTF-8">/
  );
  assert.match(html, /<body>Verification: 8a3590afcb928a95<\/body>/);
});

test('routes the exact Yandex verification URL through the site Worker', () => {
  const wranglerConfig = fs.readFileSync(
    path.join(__dirname, '..', 'wrangler.toml'),
    'utf8'
  );

  assert.match(wranglerConfig, /^main = "workers\/site-router\.mjs"$/m);
  assert.match(wranglerConfig, /^binding = "ASSETS"$/m);
  assert.match(
    wranglerConfig,
    /^run_worker_first = \["\/\*", "!\/images\/\*", "!\/css\/\*", "!\/js\/\*", "!\/pdf\/\*", "!\/api\/\*"\]$/m
  );
});

test('returns the verification file with 200 instead of an HTML canonical redirect', async () => {
  const routerFile = path.join(__dirname, '..', 'workers', 'site-router.mjs');
  assert.ok(fs.existsSync(routerFile), 'the site Worker router must exist');

  const { default: router } = await import(pathToFileURL(routerFile).href);
  let fetchedPath = '';
  const env = {
    ASSETS: {
      fetch(request) {
        fetchedPath = new URL(request.url).pathname;
        return Promise.resolve(new Response(
          '<html><body>Verification: 8a3590afcb928a95</body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=UTF-8' } }
        ));
      }
    }
  };

  const response = await router.fetch(
    new Request('https://www.chixiangmotor.com/yandex_8a3590afcb928a95.html'),
    env
  );

  assert.equal(fetchedPath, '/yandex_8a3590afcb928a95');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
  assert.match(response.headers.get('cache-control'), /(?:^|,)\s*no-transform(?:,|$)/);
  assert.match(await response.text(), /Verification: 8a3590afcb928a95/);
});

test('passes every other clean canonical Worker request through to static assets unchanged', async () => {
  const routerFile = path.join(__dirname, '..', 'workers', 'site-router.mjs');
  assert.ok(fs.existsSync(routerFile), 'the site Worker router must exist');

  const { default: router } = await import(pathToFileURL(routerFile).href);
  const originalRequest = new Request('https://chixiangmotor.com/not-found');
  let forwardedRequest;
  const expectedResponse = new Response('asset response', { status: 404 });
  const env = {
    ASSETS: {
      fetch(request) {
        forwardedRequest = request;
        return Promise.resolve(expectedResponse);
      }
    }
  };

  const response = await router.fetch(originalRequest, env);

  assert.equal(forwardedRequest, originalRequest);
  assert.equal(response, expectedResponse);
});
