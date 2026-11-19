(function () {
  'use strict';

  // 1. Gallery thumbnail switcher & lightbox
  var mainImg = document.getElementById('flagshipMainImg');
  var mainCaption = document.getElementById('flagshipMainCaption');
  var thumbs = document.querySelectorAll('[data-flagship-thumb]');
  var lightbox = document.getElementById('flagshipLightbox');
  var lightboxImg = document.getElementById('flagshipLightboxImg');
  var lightboxClose = document.getElementById('flagshipLightboxClose');

  thumbs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-src');
      var alt = btn.getAttribute('data-alt') || '';
      var caption = btn.getAttribute('data-caption') || '';
      if (mainImg && src) {
        mainImg.src = src;
        mainImg.alt = alt;
      }
      if (mainCaption) mainCaption.textContent = caption;
      thumbs.forEach(function (other) {
        other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
      });
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('aria-hidden', 'true');
  }

  if (mainImg && lightbox && lightboxImg) {
    mainImg.addEventListener('click', function () {
      lightboxImg.src = mainImg.src;
      lightboxImg.alt = mainImg.alt;
      lightbox.setAttribute('aria-hidden', 'false');
    });
  }
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
        closeLightbox();
      }
    });
  }

  // 2. Complete Engine + Service Kit bundle quote prefill
  var bundleForm = document.getElementById('flagshipBundleForm');
  if (!bundleForm) return;

  bundleForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var model = bundleForm.getAttribute('data-model') || '';
    var engineCode = bundleForm.getAttribute('data-engine-code') || model;
    var vehicle = bundleForm.getAttribute('data-vehicle') || model;
    var productInterest = bundleForm.getAttribute('data-product-interest') || 'cg';
    var sourceForm = bundleForm.getAttribute('data-source-form') || 'flagship-engine-page';
    var sourceCta = bundleForm.getAttribute('data-source-cta') || 'flagship-bundle';
    var qtyEl = document.getElementById('flagshipBundleQty');
    var countryEl = document.getElementById('flagshipBundleCountry');
    var qty = qtyEl ? qtyEl.value.trim() : '';
    var country = countryEl ? countryEl.value.trim() : '';

    var items = [];
    var checks = bundleForm.querySelectorAll('input[type="checkbox"][data-bundle-item]:checked');
    checks.forEach(function (cb) {
      items.push({
        brand: 'CHIXIANG MOTOR',
        model: model,
        part: cb.getAttribute('data-part-name') || '',
        pn: cb.getAttribute('data-part-pn') || '',
        oem: cb.getAttribute('data-part-oem') || ''
      });
    });

    if (!items.length) {
      items.push({
        brand: 'CHIXIANG MOTOR',
        model: model,
        part: model + ' Complete Engine Assembly',
        pn: bundleForm.getAttribute('data-engine-sku') || '',
        oem: ''
      });
    }

    try {
      window.sessionStorage.setItem('btv_quote_basket', JSON.stringify(items));
    } catch (err) {
      // ignore storage errors; query params still carry core context
    }

    var params = new URLSearchParams();
    params.set('product_interest', productInterest);
    params.set('source_form', sourceForm);
    params.set('source_cta', sourceCta);
    params.set('engine_code', engineCode);
    params.set('vehicle', vehicle);
    params.set('btv_items_storage', '1');
    if (qty) params.set('quantity', qty);
    if (country) params.set('country', country);

    window.location.href = '/en/contact?' + params.toString();
  });
})();
