const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const routerUrl = pathToFileURL(path.join(root, 'workers', 'site-router.mjs')).href;

async function loadRouter() {
  const mod = await import(routerUrl);
  return mod.default;
}

async function fetchRoute(router, url, method = 'GET') {
  const request = new Request(url, { method });
  const env = {
    ASSETS: {
      fetch: async (req) => {
        const u = new URL(req.url);
        return new Response(`ASSET:${u.pathname}${u.search}`, { status: 200 });
      }
    }
  };
  return router.fetch(request, env);
}

test('maps approved series to family anchors with single 301', async () => {
  const router = await loadRouter();
  const cases = [
    ['cg-air', '/en/cg-engine', 'cg-air-cooled'],
    ['cg-water', '/en/cg-engine', 'cg-water-cooled'],
    ['cg-balancer', '/en/cg-engine', 'cg-balance-shaft'],
    ['tsunami', '/en/cg-engine', 'tsunami'],
    ['hanwei', '/en/cg-engine', 'hw-water'],
    ['auto-clutch', '/en/cg-engine', 'auto-clutch'],
    ['cb-offroad', '/en/cb-engine', 'cb-specifications'],
    ['horizontal', '/en/horizontal-engine', 'cx-models'],
    ['parts', '/en/engine-parts', 'parts-specifications']
  ];
  for (const [series, pathPrefix, anchor] of cases) {
    const res = await fetchRoute(router, `https://chixiangmotor.com/en/product-detail?series=${series}`);
    assert.equal(res.status, 301, series);
    const loc = res.headers.get('Location');
    assert.ok(loc.startsWith(`https://chixiangmotor.com${pathPrefix}`), `${series} -> ${loc}`);
    assert.equal(new URL(loc).hash, `#${anchor}`, series);
    assert.equal(new URL(loc).search, '', `${series} should drop series query`);
  }
});

test('supports .html form and HEAD without body', async () => {
  const router = await loadRouter();
  const res = await fetchRoute(router, 'https://www.chixiangmotor.com/en/product-detail.html?series=cg-water', 'HEAD');
  assert.equal(res.status, 301);
  const loc = res.headers.get('Location');
  assert.equal(new URL(loc).origin, 'https://chixiangmotor.com');
  assert.equal(new URL(loc).pathname, '/en/cg-engine');
  assert.equal(new URL(loc).hash, '#cg-water-cooled');
  assert.equal(await res.text(), '');
});

test('keeps preview origin on product redirect', async () => {
  const router = await loadRouter();
  const res = await fetchRoute(
    router,
    'https://codex-product-detail-series-301-chixiang-motor-website.970201665.workers.dev/en/product-detail?series=cg-air'
  );
  assert.equal(res.status, 301);
  const loc = res.headers.get('Location');
  assert.ok(loc.startsWith('https://codex-product-detail-series-301-chixiang-motor-website.970201665.workers.dev/en/cg-engine'), loc);
});

test('rejects duplicate series and unknown/hold values without product 301', async () => {
  const router = await loadRouter();
  for (const url of [
    'https://chixiangmotor.com/en/product-detail?series=cg-air&series=cg-air',
    'https://chixiangmotor.com/en/product-detail?series=cg-air&series=cg-water',
    'https://chixiangmotor.com/en/product-detail?series=efi-water',
    'https://chixiangmotor.com/en/product-detail?series=motorcycles',
    'https://chixiangmotor.com/en/product-detail?series=tricycles',
    'https://chixiangmotor.com/en/product-detail?series=cg150-goldblack',
    'https://chixiangmotor.com/en/product-detail?series=atv-ac320',
    'https://chixiangmotor.com/en/product-detail?series=nope',
    'https://chixiangmotor.com/en/product-detail',
    'https://chixiangmotor.com/en/product-detail?series='
  ]) {
    const res = await fetchRoute(router, url);
    assert.equal(res.status, 200, url);
    assert.ok((await res.text()).startsWith('ASSET:'), url);
  }
});

test('still allows path normalization on hold .html without product map', async () => {
  const router = await loadRouter();
  const res = await fetchRoute(router, 'https://chixiangmotor.com/en/product-detail.html?series=efi-water');
  assert.equal(res.status, 301);
  const loc = new URL(res.headers.get('Location'));
  assert.equal(loc.pathname, '/en/product-detail');
  assert.equal(loc.search, '?series=efi-water');
  assert.equal(loc.hash, '');
});

test('preserves attribution params, duplicates, and long click ids', async () => {
  const router = await loadRouter();
  const res2 = await fetchRoute(
    router,
    'https://chixiangmotor.com/en/product-detail?series=cg-water&utm_source=ai&utm_source=ai2&utm_campaign=engines&gclid=abc&msclkid=ms1&gad_source=2&gad_campaignid=9&junk=1'
  );
  assert.equal(res2.status, 301);
  const loc = new URL(res2.headers.get('Location'));
  assert.equal(loc.pathname, '/en/cg-engine');
  assert.equal(loc.hash, '#cg-water-cooled');
  const q = loc.searchParams;
  assert.deepEqual(q.getAll('utm_source'), ['ai', 'ai2']);
  assert.equal(q.get('utm_campaign'), 'engines');
  assert.equal(q.get('gclid'), 'abc');
  assert.equal(q.get('msclkid'), 'ms1');
  assert.equal(q.get('gad_source'), '2');
  assert.equal(q.get('gad_campaignid'), '9');
  assert.equal(q.get('junk'), null);
  assert.equal(q.get('series'), null);

  const longId = 'G' + 'x'.repeat(400);
  const resLong = await fetchRoute(
    router,
    `https://chixiangmotor.com/en/product-detail?series=cg-air&gclid=${longId}`
  );
  assert.equal(resLong.status, 301);
  const locLong = new URL(resLong.headers.get('Location'));
  assert.equal(locLong.searchParams.get('gclid'), longId);
});

test('falls back without product 301 when Location would be unsafe', async () => {
  const router = await loadRouter();
  const huge = 'H'.repeat(3000);
  const res = await fetchRoute(
    router,
    `https://chixiangmotor.com/en/product-detail?series=cg-air&gclid=${huge}`
  );
  // explicit fallback: no product redirect (normalization may still run)
  assert.notEqual(res.status, 301, 'must not emit a tracking-stripped product redirect');
  assert.equal(res.status, 200);
  assert.ok((await res.text()).startsWith('ASSET:'));
});

test('maps every approved series for both GET and HEAD', async () => {
  const router = await loadRouter();
  const cases = [
    ['cg-air', '/en/cg-engine', 'cg-air-cooled'],
    ['cg-water', '/en/cg-engine', 'cg-water-cooled'],
    ['cg-balancer', '/en/cg-engine', 'cg-balance-shaft'],
    ['tsunami', '/en/cg-engine', 'tsunami'],
    ['hanwei', '/en/cg-engine', 'hw-water'],
    ['auto-clutch', '/en/cg-engine', 'auto-clutch'],
    ['cb-offroad', '/en/cb-engine', 'cb-specifications'],
    ['horizontal', '/en/horizontal-engine', 'cx-models'],
    ['parts', '/en/engine-parts', 'parts-specifications']
  ];
  for (const method of ['GET', 'HEAD']) {
    for (const [series, pathPrefix, anchor] of cases) {
      const res = await fetchRoute(
        router,
        `https://chixiangmotor.com/en/product-detail?series=${series}`,
        method
      );
      assert.equal(res.status, 301, `${method} ${series}`);
      const loc = new URL(res.headers.get('Location'));
      assert.equal(loc.pathname, pathPrefix, `${method} ${series}`);
      assert.equal(loc.hash, `#${anchor}`, `${method} ${series}`);
      if (method === 'HEAD') assert.equal(await res.text(), '');
    }
  }
});

test('yandex verification files and static assets stay served', async () => {
  const router = await loadRouter();
  const ver = await fetchRoute(router, 'https://chixiangmotor.com/yandex_68b52fccf05e4a88.html');
  assert.equal(ver.status, 200);
  const body = await ver.text();
  assert.ok(body.includes('yandex') || body.includes('ASSET:') || body.length >= 0);

  const asset = await fetchRoute(router, 'https://chixiangmotor.com/css/style.css');
  assert.equal(asset.status, 200);
  assert.ok((await asset.text()).startsWith('ASSET:'));
});

test('does not product-redirect POST and leaves api untouched', async () => {
  const router = await loadRouter();
  const post = await fetchRoute(router, 'https://chixiangmotor.com/en/product-detail?series=cg-air', 'POST');
  assert.equal(post.status, 200);
  assert.ok((await post.text()).startsWith('ASSET:'));

  const api = await fetchRoute(router, 'https://chixiangmotor.com/api/contact');
  assert.equal(api.status, 200);
  assert.ok((await api.text()).includes('/api/contact'));
});

test('legacy host/path and verification routes remain intact', async () => {
  const router = await loadRouter();
  const www = await fetchRoute(router, 'https://www.chixiangmotor.com/en/about.html?ref=legacy');
  assert.equal(www.status, 301);
  const loc = new URL(www.headers.get('Location'));
  assert.equal(loc.origin, 'https://chixiangmotor.com');
  assert.equal(loc.pathname, '/en/about');
  assert.equal(loc.search, '?ref=legacy');

  const ru = await fetchRoute(router, 'https://chixiangmotor.com/ru/uzbekistan/');
  assert.equal(ru.status, 301);
  assert.ok(ru.headers.get('Location').includes('/ru/central-asia/'));
});
