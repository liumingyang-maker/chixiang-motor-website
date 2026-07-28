const YANDEX_VERIFICATION_PATH = '/yandex_8a3590afcb928a95.html';
const YANDEX_VERIFICATION_ASSET_PATH = '/yandex_8a3590afcb928a95';

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === YANDEX_VERIFICATION_PATH) {
      requestUrl.pathname = YANDEX_VERIFICATION_ASSET_PATH;
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

    return env.ASSETS.fetch(request);
  }
};
