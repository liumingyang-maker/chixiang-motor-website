const YANDEX_VERIFICATION_PATH = '/yandex_8a3590afcb928a95.html';
const YANDEX_VERIFICATION_ASSET_PATH = '/yandex_8a3590afcb928a95';

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === YANDEX_VERIFICATION_PATH) {
      requestUrl.pathname = YANDEX_VERIFICATION_ASSET_PATH;
      return env.ASSETS.fetch(new Request(requestUrl, request));
    }

    return env.ASSETS.fetch(request);
  }
};
