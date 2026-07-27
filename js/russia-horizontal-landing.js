(function (root, factory) {
  'use strict';

  var api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (!root || !root.document) {
    return;
  }

  function start() {
    api.init(root.document, root);
  }

  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var WHATSAPP_NUMBER = '8619008225410';
  var ATTRIBUTION_FIELDS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'gbraid',
    'wbraid'
  ];

  function normalizeModels(values) {
    var unique = [];

    Array.prototype.forEach.call(values || [], function (value) {
      var normalized = String(value || '').trim();
      if (normalized && unique.indexOf(normalized) === -1) {
        unique.push(normalized);
      }
    });

    return unique.join(', ');
  }

  function getModelCheckboxes(form) {
    if (!form || typeof form.querySelectorAll !== 'function') {
      return [];
    }
    return Array.prototype.slice.call(
      form.querySelectorAll('[data-model-checkbox]')
    );
  }

  function syncModels(form) {
    if (!form || typeof form.querySelector !== 'function') {
      return '';
    }

    var hiddenProduct = form.querySelector('[name="product"]');
    var selected = getModelCheckboxes(form)
      .filter(function (checkbox) {
        return checkbox.checked;
      })
      .map(function (checkbox) {
        return checkbox.value;
      });
    var normalized = normalizeModels(selected);

    if (hiddenProduct) {
      hiddenProduct.value = normalized;
    }

    return normalized;
  }

  function selectModel(form, model) {
    var requested = String(model || '').trim();
    var matched = false;

    getModelCheckboxes(form).forEach(function (checkbox) {
      if (String(checkbox.value).trim() === requested) {
        checkbox.checked = true;
        matched = true;
      }
    });

    if (matched) {
      syncModels(form);
    }

    return matched;
  }

  function syncFreightContext(form) {
    if (!form || typeof form.querySelector !== 'function') {
      return '';
    }

    var freightForwarder = form.querySelector('[name="freight_forwarder"]');
    var application = form.querySelector('[name="application"]');
    var value = freightForwarder ? String(freightForwarder.value || '').trim() : '';
    var context = value ? 'Перевозчик в Китае: ' + value : '';

    if (application) {
      application.value = context;
    }

    return context;
  }

  function captureAttribution(form, search) {
    var captured = {};

    if (!form || typeof form.querySelector !== 'function') {
      return captured;
    }

    var params = new URLSearchParams(String(search || ''));

    ATTRIBUTION_FIELDS.forEach(function (name) {
      var value = String(params.get(name) || '').trim();
      var field = form.querySelector('[name="' + name + '"]');

      if (value && field) {
        field.value = value;
        captured[name] = value;
      }
    });

    return captured;
  }

  function setSourceCta(form, source) {
    if (!form || typeof form.querySelector !== 'function') {
      return '';
    }

    var field = form.querySelector('[name="source_cta"]');
    var value = String(source || '').trim();

    if (field && value) {
      field.value = value;
    }

    return value;
  }

  function buildWhatsAppUrl(model) {
    var product = String(model || 'Горизонтальные двигатели').trim();
    var message = [
      'Здравствуйте! Меня интересует оптовая закупка горизонтальных двигателей.',
      'Модель: ' + product + '.',
      'MOQ 40 шт., возможен смешанный заказ.',
      'Образцы: от 3 двигателей, только для компаний и профессиональных закупщиков.',
      'Компания:',
      'Ориентировочное количество:'
    ].join('\n');

    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
      encodeURIComponent(message);
  }

  function setModelError(form, message) {
    if (!form || typeof form.querySelector !== 'function') {
      return;
    }
    var error = form.querySelector('[data-model-error]');
    if (error) {
      error.textContent = message || '';
    }
  }

  function prefersReducedMotion(win) {
    return Boolean(
      win &&
      typeof win.matchMedia === 'function' &&
      win.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function focusModelSelector(form, win) {
    var firstCheckbox = getModelCheckboxes(form)[0];
    if (!firstCheckbox || typeof firstCheckbox.focus !== 'function') {
      return;
    }

    if (win && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(function () {
        firstCheckbox.focus({ preventScroll: true });
      });
    } else {
      firstCheckbox.focus();
    }
  }

  function scrollToForm(form, win) {
    if (!form || typeof form.scrollIntoView !== 'function') {
      return;
    }

    form.scrollIntoView({
      behavior: prefersReducedMotion(win) ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function init(doc, win) {
    if (!doc || typeof doc.querySelector !== 'function') {
      return false;
    }

    var form = doc.querySelector('.rh-inquiry-form');
    if (!form || form.dataset.russiaHorizontalInitialized === '1') {
      return false;
    }

    form.dataset.russiaHorizontalInitialized = '1';
    captureAttribution(
      form,
      win && win.location ? win.location.search : ''
    );
    syncFreightContext(form);

    Array.prototype.forEach.call(
      doc.querySelectorAll('[data-whatsapp-model]'),
      function (link) {
        link.href = buildWhatsAppUrl(
          link.getAttribute('data-whatsapp-model')
        );
      }
    );

    getModelCheckboxes(form).forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
        syncModels(form);
        setModelError(form, '');
      });
    });

    var freightForwarder = form.querySelector('[name="freight_forwarder"]');
    if (freightForwarder) {
      freightForwarder.addEventListener('change', function () {
        syncFreightContext(form);
      });
    }

    Array.prototype.forEach.call(
      doc.querySelectorAll('a[href^="#"]'),
      function (anchor) {
        anchor.addEventListener('click', function (event) {
          var href = anchor.getAttribute('href');
          var target = href && href !== '#' ? doc.querySelector(href) : null;

          if (!target) {
            return;
          }

          event.preventDefault();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }

          var sourceCta = anchor.getAttribute('data-source-cta');
          if (sourceCta) {
            setSourceCta(form, sourceCta);
          }

          target.scrollIntoView({
            behavior: prefersReducedMotion(win) ? 'auto' : 'smooth',
            block: 'start'
          });
        });
      }
    );

    Array.prototype.forEach.call(
      doc.querySelectorAll('[data-quote-model]'),
      function (button) {
        button.addEventListener('click', function () {
          var model = button.getAttribute('data-quote-model');
          if (!selectModel(form, model)) {
            return;
          }

          setSourceCta(form, 'model_card_' + model);

          setModelError(form, '');
          scrollToForm(form, win);

          var selectedCheckbox = getModelCheckboxes(form).find(
            function (checkbox) {
              return checkbox.value === model;
            }
          );

          if (selectedCheckbox && typeof selectedCheckbox.focus === 'function') {
            if (win && typeof win.requestAnimationFrame === 'function') {
              win.requestAnimationFrame(function () {
                selectedCheckbox.focus({ preventScroll: true });
              });
            } else {
              selectedCheckbox.focus();
            }
          }
        });
      }
    );

    form.addEventListener('submit', function (event) {
      syncFreightContext(form);

      if (syncModels(form)) {
        setModelError(form, '');
        return;
      }

      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      setModelError(form, 'Выберите хотя бы одну модель двигателя.');
      scrollToForm(form, win);
      focusModelSelector(form, win);
    });

    form.addEventListener('reset', function () {
      var resetModels = function () {
        syncModels(form);
        syncFreightContext(form);
        setModelError(form, '');
      };

      if (win && typeof win.setTimeout === 'function') {
        win.setTimeout(resetModels, 0);
      } else {
        resetModels();
      }
    });

    syncModels(form);
    syncFreightContext(form);
    return true;
  }

  return {
    normalizeModels: normalizeModels,
    syncModels: syncModels,
    selectModel: selectModel,
    syncFreightContext: syncFreightContext,
    captureAttribution: captureAttribution,
    setSourceCta: setSourceCta,
    buildWhatsAppUrl: buildWhatsAppUrl,
    init: init
  };
});
