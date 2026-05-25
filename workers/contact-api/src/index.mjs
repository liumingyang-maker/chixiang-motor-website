import { handleContactRequest } from './contact-handler.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return handleContactRequest(request, env);
    }

    return new Response('Not found', { status: 404 });
  }
};
