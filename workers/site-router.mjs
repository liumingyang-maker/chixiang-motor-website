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

/* P1-SERIES-301 START */
/**
 * P1: query-aware product-series redirects for legacy product-detail URLs.
 * Marked region is the only intentional addition to site-router.mjs.
 */
const PRODUCT_DETAIL_PATHS = new Set(['/en/product-detail', '/en/product-detail.html']);
const PRODUCT_SERIES_ROUTES = new Map([
  ['cg-air', '/en/cg-engine#cg-air-cooled'],
  ['cg-water', '/en/cg-engine#cg-water-cooled'],
  ['cg-balancer', '/en/cg-engine#cg-balance-shaft'],
  ['tsunami', '/en/cg-engine#tsunami'],
  ['hanwei', '/en/cg-engine#hw-water'],
  ['auto-clutch', '/en/cg-engine#auto-clutch'],
  ['cb-offroad', '/en/cb-engine#cb-specifications'],
  ['horizontal', '/en/horizontal-engine#cx-models'],
  ['parts', '/en/engine-parts#parts-specifications']
]);
// Hold / deferred: do not product-redirect (path normalization may still apply).
const PRODUCT_SERIES_NO_REDIRECT = new Set([
  'cg150-goldblack',
  'efi-water',
  'horizontal-water',
  'horizontal-dualclutch',
  'horizontal-under',
  'atv-ac320',
  'motorcycles',
  'tricycles'
]);
const ALLOWED_ATTRIBUTION_PARAMS = new Set([
  'gclid',
  'gbraid',
  'wbraid',
  'yclid',
  'fbclid',
  'msclkid',
  'gad_source',
  'gad_campaignid',
  'dclid',
  'ttclid',
  'twclid',
  'wbraid',
  '_gl'
]);
const MAX_REDIRECT_LOCATION_LENGTH = 2048;

function isProductDetailPath(pathname) {
  return PRODUCT_DETAIL_PATHS.has(pathname);
}

function collectAttributionParams(sourceUrl) {
  const out = new URLSearchParams();
  for (const [key, value] of sourceUrl.searchParams.entries()) {
    if (key === 'series') continue;
    const lower = key.toLowerCase();
    const allowed =
      lower.startsWith('utm_') || ALLOWED_ATTRIBUTION_PARAMS.has(lower);
    if (!allowed) continue;
    // Preserve order and duplicate legal keys; never drop tracking values.
    out.append(key, value);
  }
  return out;
}

function productRedirectHref(requestUrl, targetPath) {
  const hashIndex = targetPath.indexOf('#');
  const path = hashIndex === -1 ? targetPath : targetPath.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : targetPath.slice(hashIndex);
  const targetOrigin = CUSTOM_HOSTS.has(requestUrl.hostname)
    ? CANONICAL_ORIGIN
    : requestUrl.origin;
  const attribution = collectAttributionParams(requestUrl);
  const qs = attribution.toString();
  const href = targetOrigin + path + (qs ? `?${qs}` : '') + hash;

  // Explicit fallback: if the full Location would be unsafe, keep the product
  // destination but do not silently drop attribution — fall back to no product
  // redirect so existing normalization can handle the request.
  if (href.length > MAX_REDIRECT_LOCATION_LENGTH) return null;
  return href;
}

function productSeriesRedirect(requestUrl, method) {
  if (method !== 'GET' && method !== 'HEAD') return null;
  if (!isProductDetailPath(requestUrl.pathname)) return null;
  const seriesValues = requestUrl.searchParams.getAll('series');
  if (seriesValues.length !== 1) return null;
  const series = seriesValues[0];
  if (!series || PRODUCT_SERIES_NO_REDIRECT.has(series)) return null;
  const targetPath = PRODUCT_SERIES_ROUTES.get(series);
  if (!targetPath) return null;

  return productRedirectHref(requestUrl, targetPath);
}
/* P1-SERIES-301 END */

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

function redirectLocation(requestUrl, method) {
  const productTarget = productSeriesRedirect(requestUrl, method || 'GET');
  if (productTarget) return productTarget;
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

    const location = redirectLocation(requestUrl, request.method);
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
