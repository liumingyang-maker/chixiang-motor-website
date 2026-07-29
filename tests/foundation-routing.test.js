const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const routerFile = path.join(root, 'workers', 'site-router.mjs');

async function loadRouter() {
  const { default: router } = await import(pathToFileURL(routerFile).href);
  return router;
}

function assetEnvironment(body = 'asset response') {
  const calls = [];
  return {
    calls,
    env: {
      ASSETS: {
        fetch(request) {
          calls.push(request);
          return Promise.resolve(new Response(body, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
          }));
        }
      }
    }
  };
}

const redirectCases = [
  ['http://chixiangmotor.com/en/about?utm_source=test', 'https://chixiangmotor.com/en/about?utm_source=test'],
  ['http://www.chixiangmotor.com/en/about', 'https://chixiangmotor.com/en/about'],
  ['https://www.chixiangmotor.com/en/about', 'https://chixiangmotor.com/en/about'],
  ['https://chixiangmotor.com/', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/index.html', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en/index.html', 'https://chixiangmotor.com/en/'],
  ['https://chixiangmotor.com/en/about.html', 'https://chixiangmotor.com/en/about'],
  ['https://chixiangmotor.com/en/about.html?ref=legacy', 'https://chixiangmotor.com/en/about?ref=legacy'],
  ['https://chixiangmotor.com/ru/uzbekistan/', 'https://chixiangmotor.com/ru/central-asia/'],
  ['https://chixiangmotor.com/ru/dvigateli-dlya-uzbekistana.html', 'https://chixiangmotor.com/ru/central-asia/'],
  ['https://chixiangmotor.com/ru/dvigatel-140/', 'https://chixiangmotor.com/ru/russia/#horizontal-engines']
];

for (const [source, destination] of redirectCases) {
  test(`redirects ${source} to ${destination} in one permanent hop`, async () => {
    const router = await loadRouter();
    const { env, calls } = assetEnvironment();

    const response = await router.fetch(new Request(source), env);

    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), destination);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300');
    assert.equal(calls.length, 0, 'redirects must not fetch a static asset first');
  });
}

test('normalizes preview document paths without replacing the workers.dev host', async () => {
  const router = await loadRouter();
  const { env } = assetEnvironment();

  const response = await router.fetch(
    new Request('https://preview-name.example.workers.dev/en/about.html?preview=1'),
    env
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get('location'),
    'https://preview-name.example.workers.dev/en/about?preview=1'
  );
});

test('passes a clean canonical document request to static assets unchanged', async () => {
  const router = await loadRouter();
  const { env, calls } = assetEnvironment();
  const request = new Request('https://chixiangmotor.com/en/about');

  const response = await router.fetch(request, env);

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0], request);
});

for (const [publicPath, assetPath, token] of [
  ['/yandex_68b52fccf05e4a88.html', '/yandex_68b52fccf05e4a88', '68b52fccf05e4a88'],
  ['/yandex_8a3590afcb928a95.html', '/yandex_8a3590afcb928a95', '8a3590afcb928a95']
]) {
  test(`serves ${publicPath} as a 200 verification exception`, async () => {
    const router = await loadRouter();
    const { env, calls } = assetEnvironment(`<html><body>Verification: ${token}</body></html>`);

    const response = await router.fetch(
      new Request(`https://www.chixiangmotor.com${publicPath}`),
      env
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.match(response.headers.get('cache-control'), /(?:^|,)\s*no-transform(?:,|$)/);
    assert.equal(new URL(calls[0].url).pathname, assetPath);
    assert.match(await response.text(), new RegExp(token));
  });
}

test('runs the Worker for documents while excluding static and API paths', () => {
  const wrangler = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');

  assert.match(
    wrangler,
    /^run_worker_first = \["\/\*", "!\/images\/\*", "!\/css\/\*", "!\/js\/\*", "!\/pdf\/\*", "!\/api\/\*"\]$/m
  );
});

test('keeps fallback redirect destinations canonical and loop-free', () => {
  const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');

  assert.match(redirects, /^\/en \/en\/ 301$/m);
  assert.match(redirects, /^\/es \/es\/ 301$/m);
  assert.match(redirects, /^\/pt \/pt\/ 301$/m);
  assert.match(redirects, /^\/ru \/ru\/ 301$/m);
  assert.match(redirects, /^\/ar \/ar\/ 301$/m);
  assert.doesNotMatch(redirects, /\/index\.html(?:\s|$)/);
});
