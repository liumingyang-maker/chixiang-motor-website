/* Chixiang Motor first-party inquiry attribution. */
(function(root, factory) {
  'use strict';

  var library = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = library;
  }

  if (root && root.document) {
    var client = library.createClient(root, root.document);
    root.ChixiangAttribution = client;
    client.init();
  }
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  var VERSION = '1.0.0';
  var SCHEMA_VERSION = 1;
  var STORAGE_KEY = 'cx_attribution_v1';
  var SESSION_KEY = 'cx_attribution_session_v1';
  var RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
  var LEAD_ID_PATTERN = /^CX-[0-9A-HJKMNP-TV-Z]{10}$/;
  var ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  var CAMPAIGN_FIELDS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'yclid', 'ttclid'
  ];
  var DEFAULT_MESSAGES = {
    en: 'Hello, I am interested in your motorcycle engines.',
    es: 'Hola, me interesan sus motores para motocicletas.',
    pt: 'Olá, tenho interesse nos seus motores para motocicletas.',
    ru: 'Здравствуйте, меня интересуют ваши мотоциклетные двигатели.',
    ar: 'مرحبًا، أنا مهتم بمحركات الدراجات النارية لديكم.'
  };

  function clean(value, limit) {
    return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, limit || 160);
  }

  function cleanMessage(value, limit) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
      .trim()
      .slice(0, limit || 1800);
  }

  function sanitizeHostname(value) {
    var raw = clean(value, 500);
    if (!raw) return '';
    try {
      var url = raw.indexOf('://') >= 0 ? new URL(raw) : new URL('https://' + raw);
      return clean(url.hostname.toLowerCase().replace(/\.$/, ''), 253);
    } catch (error) {
      return '';
    }
  }

  function sanitizePath(value) {
    var raw = clean(value, 1000);
    if (!raw) return '';
    try {
      var url = new URL(raw, 'https://chixiangmotor.com');
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return clean(url.pathname.replace(/\/{2,}/g, '/'), 500) || '/';
    } catch (error) {
      return '';
    }
  }

  function readCampaign(search) {
    var params;
    try {
      params = new URLSearchParams(search || '');
    } catch (error) {
      params = new URLSearchParams();
    }
    return CAMPAIGN_FIELDS.reduce(function(result, name) {
      var limit = name.indexOf('utm_') === 0 ? 160 : 256;
      var value = clean(params.get(name), limit);
      if (value) result[name] = value;
      return result;
    }, {});
  }

  function isInternalReferrer(referrer, currentHostname) {
    if (!referrer) return false;
    try {
      return sanitizeHostname(referrer) === sanitizeHostname(currentHostname);
    } catch (error) {
      return false;
    }
  }

  function normalizedUtmSource(campaign) {
    var source = clean(campaign.utm_source, 160).toLowerCase();
    if (!source) return '';
    if (/^(facebook|fb|meta)$/.test(source)) return 'Facebook';
    if (/^(instagram|ig)$/.test(source)) return 'Instagram';
    if (/^(tiktok|tik-tok)$/.test(source)) return 'TikTok';
    if (/^(chatgpt|openai)$/.test(source)) return 'ChatGPT';
    if (source === 'perplexity') return 'Perplexity';
    if (source === 'claude') return 'Claude';
    if (source === 'gemini') return 'Gemini';
    if (/^(google|googleads)$/.test(source) && /^(cpc|ppc|paid|paid_search)$/.test(clean(campaign.utm_medium, 80).toLowerCase())) return 'Google Ads';
    return 'UTM: ' + source.slice(0, 80);
  }

  function classifySource(campaign, referrer, currentHostname) {
    var data = campaign || {};
    if (data.gclid || data.gbraid || data.wbraid) return 'Google Ads';
    if (data.msclkid) return 'Microsoft Ads';
    if (data.yclid) return 'Yandex Ads';
    if (data.ttclid) return 'TikTok Ads';
    if (data.fbclid) return 'Meta click, paid status unknown';

    var utm = normalizedUtmSource(data);
    if (utm) return utm;

    var hostname = sanitizeHostname(referrer);
    if (!hostname || (currentHostname && hostname === sanitizeHostname(currentHostname))) return 'Direct';
    if (hostname === 'gemini.google.com') return 'Gemini';
    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com' || hostname === 'openai.com' || hostname.endsWith('.openai.com')) return 'ChatGPT';
    if (hostname === 'perplexity.ai' || hostname.endsWith('.perplexity.ai')) return 'Perplexity';
    if (hostname === 'claude.ai' || hostname.endsWith('.claude.ai')) return 'Claude';
    if (hostname === 'google.com' || hostname.startsWith('www.google.') || hostname.endsWith('.google.com')) return 'Google Organic';
    if (hostname === 'bing.com' || hostname.endsWith('.bing.com')) return 'Bing Organic';
    if (hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'Meta Social';
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'TikTok Social';
    return 'Referral';
  }

  function createLeadId(fillRandom) {
    var bytes = new Uint8Array(10);
    fillRandom(bytes);
    var suffix = '';
    for (var index = 0; index < bytes.length; index += 1) {
      suffix += ALPHABET[bytes[index] % ALPHABET.length];
    }
    return 'CX-' + suffix;
  }

  function parseJson(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function validStoredFirst(record, nowMs) {
    return Boolean(
      record &&
      record.schema_version === SCHEMA_VERSION &&
      LEAD_ID_PATTERN.test(record.lead_id || '') &&
      record.first_source &&
      sanitizePath(record.landing_page) &&
      Date.parse(record.expires_at || '') > nowMs
    );
  }

  function validStoredSession(record, leadId) {
    return Boolean(
      record &&
      record.schema_version === SCHEMA_VERSION &&
      record.lead_id === leadId &&
      record.session_source &&
      sanitizePath(record.session_landing_page)
    );
  }

  function languageOf(document) {
    var lang = document && document.documentElement ? clean(document.documentElement.lang, 20).toLowerCase() : '';
    return (lang.match(/^[a-z]{2}/) || ['en'])[0];
  }

  function referrerEvidence(referrer, currentHostname) {
    if (!referrer || isInternalReferrer(referrer, currentHostname)) {
      return { url: '', domain: '', path: '' };
    }
    return {
      url: referrer,
      domain: sanitizeHostname(referrer),
      path: sanitizePath(referrer)
    };
  }

  function campaignEvidencePresent(campaign) {
    return CAMPAIGN_FIELDS.some(function(name) { return Boolean(campaign[name]); });
  }

  function copyCampaign(target, campaign, prefix) {
    CAMPAIGN_FIELDS.forEach(function(name) {
      if (campaign[name]) target[(prefix || '') + name] = campaign[name];
    });
    return target;
  }

  function createClient(window, document, options) {
    var config = options || {};
    var now = typeof config.now === 'function' ? config.now : function() { return new Date(); };
    var initialized = false;
    var storageAvailable = true;
    var first = null;
    var session = null;
    var listenersBound = false;
    var lastEventResult = 'not_sent';
    var yandexCounter = clean(document && document.currentScript && document.currentScript.dataset
      ? document.currentScript.dataset.yandexCounter
      : '', 20);

    function randomFill(bytes) {
      if (typeof config.randomFill === 'function') return config.randomFill(bytes);
      if (window.crypto && typeof window.crypto.getRandomValues === 'function') return window.crypto.getRandomValues(bytes);
      throw new Error('Secure random generation is unavailable.');
    }

    function readStorage(storage, key) {
      try {
        return parseJson(storage.getItem(key));
      } catch (error) {
        storageAvailable = false;
        return null;
      }
    }

    function writeStorage(storage, key, value) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        storageAvailable = false;
      }
    }

    function makeFirstRecord(campaign, referrer, page, currentDate) {
      var record = {
        schema_version: SCHEMA_VERSION,
        client_version: VERSION,
        lead_id: createLeadId(randomFill),
        first_source: classifySource(campaign, referrer.url, window.location.hostname),
        landing_page: page,
        first_referrer_domain: referrer.domain,
        first_referrer_path: referrer.path,
        language: languageOf(document),
        first_visit_time: currentDate.toISOString(),
        expires_at: new Date(currentDate.getTime() + RETENTION_MS).toISOString()
      };
      return copyCampaign(record, campaign, 'first_');
    }

    function makeSessionRecord(campaign, referrer, page, currentDate, previous) {
      var keepPrevious = previous && !campaignEvidencePresent(campaign) && !referrer.url;
      var record = keepPrevious ? Object.assign({}, previous) : {
        schema_version: SCHEMA_VERSION,
        client_version: VERSION,
        lead_id: first.lead_id,
        session_source: classifySource(campaign, referrer.url, window.location.hostname),
        session_landing_page: page,
        session_referrer_domain: referrer.domain,
        session_referrer_path: referrer.path,
        session_start_time: currentDate.toISOString()
      };
      if (!keepPrevious) copyCampaign(record, campaign, '');
      record.previous_page = previous ? sanitizePath(previous.current_page) : '';
      record.current_page = page;
      record.last_visit_time = currentDate.toISOString();
      return record;
    }

    function whatsappNumber(url) {
      if (url.hostname === 'wa.me') return clean(url.pathname.replace(/^\/+/, ''), 30);
      if (url.hostname === 'api.whatsapp.com') return clean(url.searchParams.get('phone'), 30);
      return '';
    }

    function decorateWhatsAppUrl(value) {
      if (!initialized) init();
      var raw = String(value || '');
      var url;
      try {
        url = new URL(raw, window.location.href);
      } catch (error) {
        return raw;
      }
      if (whatsappNumber(url) !== '8619008225410') return raw;

      var message = cleanMessage(url.searchParams.get('text'), 1800);
      message = message.replace(/(?:\r?\n){0,2}Ref:\s*CX-[0-9A-HJKMNP-TV-Z]{10}\s*$/i, '').trim();
      if (!message) message = DEFAULT_MESSAGES[languageOf(document)] || DEFAULT_MESSAGES.en;
      url.searchParams.set('text', message + '\n\nRef: ' + first.lead_id);
      return url.toString();
    }

    function eventId() {
      return 'EVT-' + createLeadId(randomFill).slice(3) + createLeadId(randomFill).slice(3);
    }

    function eventPayload(context) {
      var details = context || {};
      var payload = {
        schema_version: SCHEMA_VERSION,
        client_version: VERSION,
        event_id: eventId(),
        event_type: 'whatsapp_click',
        lead_id: first.lead_id,
        first_source: first.first_source,
        session_source: session.session_source,
        landing_page: first.landing_page,
        session_landing_page: session.session_landing_page,
        first_referrer_domain: first.first_referrer_domain || '',
        previous_page: session.previous_page || '',
        click_page: session.current_page || '',
        product: clean(details.product, 120),
        cta: clean(details.cta, 80),
        language: languageOf(document),
        first_visit_time: first.first_visit_time,
        client_timestamp: now().toISOString()
      };
      CAMPAIGN_FIELDS.forEach(function(name) {
        if (first['first_' + name]) payload['first_' + name] = first['first_' + name];
        if (session[name]) payload[name] = session[name];
      });
      return payload;
    }

    function sendEvent(payload) {
      var body = JSON.stringify(payload);
      try {
        if (window.navigator && typeof window.navigator.sendBeacon === 'function') {
          var queued = window.navigator.sendBeacon(
            '/api/attribution/whatsapp-click',
            new Blob([body], { type: 'application/json' })
          );
          if (queued) {
            lastEventResult = 'beacon_queued';
            return;
          }
        }
      } catch (error) {
        lastEventResult = 'beacon_failed';
      }

      if (typeof window.fetch !== 'function') {
        lastEventResult = 'transport_unavailable';
        return;
      }
      lastEventResult = 'fetch_queued';
      window.fetch('/api/attribution/whatsapp-click', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'same-origin'
      }).then(function(response) {
        lastEventResult = response.ok ? 'fetch_sent' : 'fetch_rejected';
      }).catch(function() {
        lastEventResult = 'fetch_failed';
      });
    }

    function reportYandex(payload) {
      if (yandexCounter !== '109483511' || typeof window.ym !== 'function') return;
      try {
        window.ym(109483511, 'reachGoal', 'whatsapp_click', {
          lead_id: payload.lead_id,
          product: payload.product,
          cta: payload.cta
        });
      } catch (error) {
        // Analytics must never prevent WhatsApp navigation.
      }
    }

    function recordWhatsAppOpen(context) {
      if (!initialized) init();
      var payload = eventPayload(context);
      sendEvent(payload);
      reportYandex(payload);
      return payload;
    }

    function prepareWhatsAppOpen(value, context) {
      var decorated = decorateWhatsAppUrl(value);
      if (decorated !== String(value || '') || whatsappNumber(new URL(decorated, window.location.href)) === '8619008225410') {
        recordWhatsAppOpen(context);
      }
      return decorated;
    }

    function setHiddenField(form, name, value) {
      if (!value) return;
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        form.appendChild(input);
      }
      input.value = clean(value, name.indexOf('clid') >= 0 || name.indexOf('braid') >= 0 ? 256 : 500);
    }

    function enrichForm(form) {
      if (!initialized) init();
      var fields = {
        lead_id: first.lead_id,
        first_source: first.first_source,
        session_source: session.session_source,
        landing_page: first.landing_page,
        session_landing_page: session.session_landing_page,
        first_referrer_domain: first.first_referrer_domain || '',
        previous_page: session.previous_page || '',
        last_page: session.current_page || '',
        first_visit_time: first.first_visit_time || '',
        attribution_client_version: VERSION
      };
      CAMPAIGN_FIELDS.forEach(function(name) {
        fields[name] = session[name] || first['first_' + name] || '';
        fields['first_' + name] = first['first_' + name] || '';
      });
      Object.keys(fields).forEach(function(name) { setHiddenField(form, name, fields[name]); });
      return fields;
    }

    function bindListeners() {
      if (listenersBound || !document || typeof document.addEventListener !== 'function') return;
      listenersBound = true;
      document.addEventListener('click', function(event) {
        var target = event.target;
        if (!target || typeof target.closest !== 'function') return;
        var anchor = target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]');
        if (!anchor) return;
        var raw = typeof anchor.getAttribute === 'function' ? anchor.getAttribute('href') : anchor.href;
        var data = anchor.dataset || {};
        var finalUrl = prepareWhatsAppOpen(raw || anchor.href, {
          product: data.attributionProduct || data.product || data.whatsappModel || '',
          cta: data.attributionCta || data.source || 'link'
        });
        if (typeof anchor.setAttribute === 'function') anchor.setAttribute('href', finalUrl);
        else anchor.href = finalUrl;
      }, true);
      document.addEventListener('submit', function(event) {
        var form = event.target;
        if (!form || typeof form.getAttribute !== 'function') return;
        var action = form.getAttribute('action') || '';
        if (action === '/api/contact' || action.endsWith('/api/contact')) enrichForm(form);
      }, true);
    }

    function init() {
      if (initialized) return api;
      initialized = true;
      var currentDate = now();
      var nowMs = currentDate.getTime();
      var page = sanitizePath(window.location.href || window.location.pathname) || '/';
      var campaign = readCampaign(window.location.search || '');
      var referrer = referrerEvidence(document.referrer || '', window.location.hostname);
      var storedFirst = readStorage(window.localStorage, STORAGE_KEY);

      first = validStoredFirst(storedFirst, nowMs)
        ? storedFirst
        : makeFirstRecord(campaign, referrer, page, currentDate);
      writeStorage(window.localStorage, STORAGE_KEY, first);

      var storedSession = readStorage(window.sessionStorage, SESSION_KEY);
      var previous = validStoredSession(storedSession, first.lead_id) ? storedSession : null;
      session = makeSessionRecord(campaign, referrer, page, currentDate, previous);
      writeStorage(window.sessionStorage, SESSION_KEY, session);
      bindListeners();
      return api;
    }

    function getDiagnostics() {
      if (!initialized) init();
      return {
        schema_version: SCHEMA_VERSION,
        client_version: VERSION,
        lead_id: first.lead_id,
        storage_available: storageAvailable,
        first_source: first.first_source,
        session_source: session.session_source,
        landing_page: first.landing_page,
        session_landing_page: session.session_landing_page,
        previous_page: session.previous_page || '',
        current_page: session.current_page || '',
        first_visit_time: first.first_visit_time,
        session_start_time: session.session_start_time,
        last_event_result: lastEventResult
      };
    }

    var api = {
      init: init,
      getDiagnostics: getDiagnostics,
      decorateWhatsAppUrl: decorateWhatsAppUrl,
      prepareWhatsAppOpen: prepareWhatsAppOpen,
      recordWhatsAppOpen: recordWhatsAppOpen,
      enrichForm: enrichForm
    };
    return api;
  }

  return {
    createClient: createClient,
    classifySource: classifySource,
    createLeadId: createLeadId,
    readCampaign: readCampaign,
    sanitizeHostname: sanitizeHostname,
    sanitizePath: sanitizePath
  };
});
