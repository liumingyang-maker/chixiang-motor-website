/* ============================================================
   Chixiang Motor - Algeria paid landing (fr)
   Enhancement only: every visitor-facing fact lives in the HTML.
   Responsibilities:
     1. capture ad parameters at page load and re-apply them at submit
     2. keep the selected family / application in sync with the form
     3. build contextual French WhatsApp links (number is unchanged)
     4. compose the compact qualification line into `requirements`
     5. show / hide the sticky mobile CTA
   No new backend fields, no storage, no second submit path.
   ============================================================ */

(function (window, document) {
  'use strict';

  var FORM_ID = 'dzQuoteForm';
  var WA_NUMBER = '8619008225410';
  var AD_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];

  // Captured once, at page load, so a later URL clean-up cannot lose attribution.
  var captured = readParams(window.location && window.location.search || '');
  var state = { sourceCta: '', product: '', application: '' };

  function readParams(search) {
    var out = {};
    if (typeof window.URLSearchParams === 'function') {
      var query = new window.URLSearchParams(search);
      AD_PARAMS.forEach(function (name) { out[name] = query.get(name) || ''; });
      return out;
    }
    AD_PARAMS.forEach(function (name) {
      var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(search);
      out[name] = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
    });
    return out;
  }

  function field(form, name) {
    return form ? form.querySelector('[name="' + name + '"]') : null;
  }

  function value(form, name) {
    var input = field(form, name);
    return input && input.value ? input.value.trim() : '';
  }

  function setHidden(form, name, val) {
    var input = field(form, name);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = val || '';
  }

  // Non-named qualification controls (wilaya / buyer type) are unsupported by the
  // backend, so they are folded into supported fields instead of inventing names.
  function qualificationLine(form) {
    var buyerType = document.getElementById('dz-buyer-type');
    var parts = [];
    function push(label, val) { if (val) { parts.push(label + ': ' + val); } }
    push('Pays / Wilaya', value(form, 'country') || 'Algeria');
    push('Type acheteur', buyerType ? buyerType.value : '');
    push('Produit', value(form, 'product_interest'));
    push('Cylindree', value(form, 'displacement'));
    push('Quantite', value(form, 'quantity'));
    push('Application', value(form, 'application'));
    push('Code moteur', value(form, 'engine_code'));
    push('Familles vendues', value(form, 'vehicle'));
    push('Email', value(form, 'email'));
    push('CTA', state.sourceCta);
    return parts.join('; ');
  }

  function composeRequirements(form) {
    var line = qualificationLine(form);
    if (!line) { return; }
    // `requirements` is a Worker-supported field with its own row in the inquiry email,
    // so nothing is lost when `contact` shadows the optional `email` input.
    setHidden(form, 'requirements', line);
  }

  function applyAdParams(form) {
    if (!form) { return; }
    AD_PARAMS.forEach(function (name) {
      var val = captured[name] || '';
      if (val) { setHidden(form, name, val); }
    });
    var pageUrl = field(form, 'page_url');
    if (pageUrl && !pageUrl.value) { pageUrl.value = window.location.href; }
  }

  function productLabel(form) {
    var select = field(form, 'product_interest');
    if (select && select.value) { return select.value; }
    return state.product || 'vos moteurs de moto';
  }

  function buildWhatsAppUrl(context) {
    var content = context || {};
    var lines = [
      'Bonjour, je suis en Algérie et je souhaite recevoir des informations sur ' + (content.product || 'vos moteurs de moto') + '.'
    ];
    if (content.application) { lines.push('Application : ' + content.application); }
    if (content.quantity) { lines.push('Quantité envisagée : ' + content.quantity); }
    if (content.wilaya) { lines.push('Wilaya : ' + content.wilaya); }
    lines.push('Demande : offre et confirmation de configuration selon modèle et projet.');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function refreshWhatsAppLinks(form) {
    var context = {
      product: productLabel(form),
      application: state.application || value(form, 'application'),
      quantity: value(form, 'quantity'),
      wilaya: value(form, 'country')
    };
    var url = buildWhatsAppUrl(context);
    var links = document.querySelectorAll('[data-whatsapp-link]');
    Array.prototype.forEach.call(links, function (link) {
      link.href = url;
    });
  }

  function syncSelection(form) {
    var select = field(form, 'product_interest');
    if (select) { state.product = select.value; }
    var application = field(form, 'application');
    if (application) { state.application = application.value; }
    refreshWhatsAppLinks(form);
  }

  function bindProductButtons(form) {
    var buttons = document.querySelectorAll('[data-select-product]');
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-select-product');
        var application = button.getAttribute('data-select-application');
        var select = field(form, 'product_interest');
        if (select) {
          Array.prototype.forEach.call(select.options, function (option) {
            if (option.value && name && option.value.indexOf(name) !== -1) { select.value = option.value; }
          });
        }
        if (application) {
          var applicationField = field(form, 'application');
          if (applicationField) {
            Array.prototype.forEach.call(applicationField.options, function (option) {
              if (option.value && option.value.indexOf(application) !== -1) { applicationField.value = option.value; }
            });
          }
        }
                syncSelection(form);
      });
    });
  }

  function bindSourceCta(form) {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') { return; }
      var trigger = target.closest('[data-source-cta]');
      if (!trigger) { return; }
      state.sourceCta = trigger.getAttribute('data-source-cta');
      setHidden(form, 'source_cta', state.sourceCta);
    });
  }

  function shouldShowMobileCta(mobileState) {
    return Boolean(mobileState && mobileState.passedHero &&
      !mobileState.offerVisible && !mobileState.footerVisible &&
      !mobileState.fieldFocused && !mobileState.keyboardOpen && !mobileState.nearPageBottom);
  }

  function initSticky() {
    var cta = document.querySelector('[data-mobile-cta]');
    if (!cta || !window.matchMedia || !window.matchMedia('(max-width: 899px)').matches) { return; }
    var mobileState = {};
    function update() {
      cta.hidden = !shouldShowMobileCta(mobileState);
      document.body.classList.toggle('has-al-mobile-cta', !cta.hidden);
    }
    ['top', 'offre', 'footer'].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node || typeof window.IntersectionObserver !== 'function') { return; }
      new window.IntersectionObserver(function (entries) {
        var entry = entries[0];
        if (id === 'top') { mobileState.passedHero = !entry.isIntersecting; }
        else if (id === 'offre') { mobileState.offerVisible = entry.isIntersecting; }
        else { mobileState.footerVisible = entry.isIntersecting; }
        update();
      }, { threshold: 0.05 }).observe(node);
    });
    document.addEventListener('focusin', function (event) {
      mobileState.fieldFocused = /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName || '');
      update();
    });
    document.addEventListener('focusout', function () { mobileState.fieldFocused = false; update(); });
    function pageState() {
      mobileState.nearPageBottom = window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 96;
      update();
    }
    window.addEventListener('scroll', pageState, { passive: true });
    window.addEventListener('resize', pageState);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        mobileState.keyboardOpen = window.visualViewport.height < window.innerHeight * 0.76;
        update();
      });
    }
    pageState();
  }

  function init() {
    var form = document.getElementById(FORM_ID);
    applyAdParams(form);
    if (!form) {
      initSticky();
      refreshWhatsAppLinks(form);
      return;
    }
    form.addEventListener('submit', function () {
      applyAdParams(form);
      composeRequirements(form);
      syncSelection(form);
    }, true);
    ['product_interest', 'application', 'quantity', 'displacement', 'country', 'vehicle'].forEach(function (name) {
      var input = field(form, name);
      if (input) { input.addEventListener('change', function () { syncSelection(form); }); }
    });
    bindProductButtons(form);
    bindSourceCta(form);
    syncSelection(form);
    initSticky();
  }

  window.ChixiangAlgeria = {
    AD_PARAMS: AD_PARAMS,
    readParams: readParams,
    captured: captured,
    qualificationLine: qualificationLine,
    buildWhatsAppUrl: buildWhatsAppUrl,
    shouldShowMobileCta: shouldShowMobileCta
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);