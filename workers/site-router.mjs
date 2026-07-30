const CANONICAL_ORIGIN = 'https://chixiangmotor.com';
const CUSTOM_HOSTS = new Set(['chixiangmotor.com', 'www.chixiangmotor.com']);
const LANGUAGE_ROOTS = new Set(['/ar', '/en', '/es', '/pt', '/ru']);
const VERIFICATION_ASSETS = new Map([
  ['/yandex_68b52fccf05e4a88.html', '/yandex_68b52fccf05e4a88'],
  ['/yandex_8a3590afcb928a95.html', '/yandex_8a3590afcb928a95'],
  ['/yandex_22d63909f0d852e1.html', '/yandex_22d63909f0d852e1']
]);
const LEGACY_PATHS = new Map([
  ['/ru/uzbekistan/', '/ru/central-asia/'],
  ['/ru/dvigateli-dlya-uzbekistana.html', '/ru/central-asia/'],
  ['/ru/dvigatel-140/', '/ru/russia/#horizontal-engines']
]);

function normalizedDocumentPath(pathname) {
  if (LEGACY_PATHS.has(pathname)) return LEGACY_PATHS.get(pathname);
  if (pathname === '/' || pathname === '/index.html') return '/en/';
  if (LANGUAGE_ROOTS.has(pathname)) return `${pathname}/`;
  if (/^\/(?:ar|en|es|pt|ru)\/index\.html$/.test(pathname)) {
    return pathname.replace(/index\.html$/, '');
  }
  if (pathname.endsWith('.html')) return pathname.slice(0, -5);
  return pathname;
}

function redirectLocation(requestUrl) {
  const normalizedPath = normalizedDocumentPath(requestUrl.pathname);
  const customHost = CUSTOM_HOSTS.has(requestUrl.hostname);
  const targetOrigin = customHost ? CANONICAL_ORIGIN : requestUrl.origin;
  const pathChanged = normalizedPath !== requestUrl.pathname;
  const originChanged = targetOrigin !== requestUrl.origin;

  if (!pathChanged && !originChanged) return null;

  const target = new URL(normalizedPath, targetOrigin);
  target.search = requestUrl.search;
  return target.href;
}

async function verificationResponse(request, env, requestUrl, assetPath) {
  requestUrl.pathname = assetPath;
  const assetResponse = await env.ASSETS.fetch(new Request(requestUrl, request));
  const responseHeaders = new Headers(assetResponse.headers);
  const cacheControl = responseHeaders.get('Cache-Control');
  responseHeaders.set(
    'Cache-Control',
    cacheControl ? `${cacheControl}, no-transform` : 'no-transform'
  );

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers: responseHeaders
  });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const verificationAsset = VERIFICATION_ASSETS.get(requestUrl.pathname);

    if (verificationAsset) {
      return verificationResponse(request, env, requestUrl, verificationAsset);
    }

    const location = redirectLocation(requestUrl);
    if (location) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: location,
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
