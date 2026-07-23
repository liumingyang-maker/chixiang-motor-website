/* Yandex Metrica: Chixiang Motor — Russia */
(function (window, document) {
  'use strict';

  var COUNTER_ID = 110874170;

  if (typeof window.ym !== 'function') {
    window.ym = function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();
  }

  if (!document.querySelector('script[data-yandex-metrica-tag="' + COUNTER_ID + '"]')) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER_ID;
    script.setAttribute('data-yandex-metrica-tag', String(COUNTER_ID));
    document.head.appendChild(script);
  }

  window.ym(COUNTER_ID, 'init', {
    ssr: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true
  });

  function reachGoal(goalId, params) {
    try {
      window.ym(COUNTER_ID, 'reachGoal', goalId, params || {});
    } catch (error) {
      // Analytics must never block navigation or lead submission.
    }
  }

  window.chixiangMetricaGoal = reachGoal;

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    var link = target.closest('a[href*="wa.me/"]');
    if (!link) return;

    reachGoal('ym-open-chat', {
      channel: 'whatsapp',
      market: document.body && document.body.getAttribute('data-market') || '',
      page_url: window.location.href
    });
  });

  if (typeof window.fetch === 'function' && !window.fetch.__chixiangMetricaWrapped) {
    var originalFetch = window.fetch.bind(window);
    var wrappedFetch = function (input, init) {
      var requestUrl = typeof input === 'string' ? input : (input && input.url) || '';
      var method = (init && init.method) || (input && input.method) || 'GET';
      var responsePromise = originalFetch(input, init);

      if (/\/api\/contact(?:\?|$)/.test(requestUrl) && String(method).toUpperCase() === 'POST') {
        responsePromise.then(function (response) {
          if (!response || !response.ok) return;
          reachGoal('ym-submit-leadform', {
            market: document.body && document.body.getAttribute('data-market') || '',
            page_url: window.location.href
          });
        }).catch(function () {
          // Failed submissions are intentionally not counted as leads.
        });
      }

      return responsePromise;
    };
    wrappedFetch.__chixiangMetricaWrapped = true;
    window.fetch = wrappedFetch;
  }
})(window, document);
