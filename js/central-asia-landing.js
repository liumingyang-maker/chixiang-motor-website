(function(window, document) {
  'use strict';

  var data = window.ChixiangCentralAsiaData || { market: {}, products: [], applications: [], factoryImages: [] };
  var state = { product: data.products[0] ? data.products[0].name : 'CG Air', country: '' };
  var reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function pickActiveSection(sections, activationLine) {
    var approaching = sections.filter(function(section) {
      return section.top > activationLine && section.top <= activationLine + 240;
    });
    if (approaching.length) return approaching[approaching.length - 1].id;
    var active = sections.filter(function(section) {
      return section.top <= activationLine && section.bottom > activationLine;
    });
    return active.length ? active[active.length - 1].id : null;
  }

  function getProductDisclosureState(slugs, openSlug) {
    return slugs.reduce(function(result, slug) {
      result[slug] = slug === openSlug;
      return result;
    }, {});
  }

  function shouldShowMobileCta(viewState) {
    return Boolean(viewState.passedHero && !viewState.quoteVisible && !viewState.footerVisible &&
      !viewState.faqOpen && !viewState.fieldFocused && !viewState.keyboardOpen && !viewState.nearPageBottom);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function asset(path) {
    return '../../' + path.split('/').map(encodeURIComponent).join('/');
  }

  function findProduct(value) {
    return data.products.find(function(product) {
      return product.slug === value || product.name === value;
    });
  }

  function buildWhatsAppUrl(productName, countryName) {
    var market = data.market || {};
    var template = market.whatsappMessageTemplate || 'Здравствуйте! Интересует {product}. Страна: {country}.';
    var message = template
      .replace('{product}', productName || state.product || 'CG Air')
      .replace('{country}', countryName || state.country || 'Центральная Азия');
    return 'https://wa.me/' + (market.whatsappNumber || '8619008225410') + '?text=' + encodeURIComponent(message);
  }

  function updateWhatsAppLinks() {
    if (!document.querySelectorAll) return;
    var countryField = document.querySelector('[name="country"]');
    state.country = countryField && countryField.value ? countryField.value : state.country;
    document.querySelectorAll('[data-whatsapp-link]').forEach(function(link) {
      link.href = buildWhatsAppUrl(link.dataset.product || state.product, state.country);
    });
  }

  function renderHero() {
    var host = document.querySelector('[data-hero-products]');
    if (!host) return;
    host.innerHTML = data.products.map(function(product, index) {
      return '<figure class="ca-hero-product ca-hero-product-' + (index + 1) + '">' +
        '<div class="ca-hero-product-image"><img src="' + asset(product.heroImage || product.gallery[0]) + '" alt="' + escapeHtml(product.name) + '" loading="eager" fetchpriority="high" width="520" height="520"></div>' +
        '<figcaption><strong>' + escapeHtml(product.name) + '</strong><span>' + escapeHtml(product.displacement) + '</span></figcaption>' +
      '</figure>';
    }).join('');
  }

  function renderApplications() {
    var host = document.querySelector('[data-applications]');
    if (!host) return;
    host.innerHTML = data.applications.map(function(item) {
      var product = findProduct(item.productSlug);
      return '<button class="ca-application-card" type="button" data-select-product="' + escapeHtml(item.productSlug) + '">' +
        '<span class="ca-application-number">' + escapeHtml(item.number) + '</span>' +
        '<span class="ca-application-copy"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.description) + '</small></span>' +
        '<span class="ca-application-result">' + escapeHtml(product ? product.name : '') + '<span aria-hidden="true">→</span></span>' +
      '</button>';
    }).join('');
  }

  function productAction(product, compact) {
    return '<button class="ca-text-action' + (compact ? ' ca-text-action-compact' : '') + '" type="button" data-quote-product="' + escapeHtml(product.slug) + '">Запросить цену <span aria-hidden="true">→</span></button>';
  }

  function renderComparison() {
    var tableHost = document.querySelector('[data-comparison-table]');
    var cardsHost = document.querySelector('[data-comparison-cards]');
    if (tableHost) {
      tableHost.innerHTML = '<table class="ca-compare-table"><thead><tr><th>Серия</th><th>Объём</th><th>Охлаждение</th><th>Реверс</th><th>Лучше всего для</th><th><span class="sr-only">Действие</span></th></tr></thead><tbody>' +
        data.products.map(function(product) {
          return '<tr><th scope="row">' + escapeHtml(product.name) + '</th><td><span class="ca-nowrap">' + escapeHtml(product.displacement) + '</span></td><td>' + escapeHtml(product.cooling) + '</td><td>' + escapeHtml(product.reverse) + '</td><td>' + escapeHtml(product.bestFor) + '</td><td>' + productAction(product, true) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    if (cardsHost) {
      cardsHost.innerHTML = data.products.map(function(product) {
        return '<article class="ca-compare-card"><div class="ca-compare-card-head"><h3>' + escapeHtml(product.name) + '</h3><span>' + escapeHtml(product.displacement) + '</span></div><dl>' +
          '<div><dt>Охлаждение</dt><dd>' + escapeHtml(product.cooling) + '</dd></div>' +
          '<div><dt>Реверс</dt><dd>' + escapeHtml(product.reverse) + '</dd></div>' +
          '<div><dt>Применение</dt><dd>' + escapeHtml(product.bestFor) + '</dd></div>' +
        '</dl>' + productAction(product, false) + '</article>';
      }).join('');
    }
  }

  function galleryMarkup(product) {
    return '<div class="ca-gallery" data-gallery data-product-gallery="' + escapeHtml(product.slug) + '">' +
      '<div class="ca-gallery-viewport"><div class="ca-gallery-track">' + product.gallery.map(function(src, index) {
        return '<img src="' + asset(src) + '" alt="' + escapeHtml(product.name) + ' — фото ' + (index + 1) + '" width="720" height="620" ' + (index ? 'loading="lazy"' : '') + ' aria-hidden="' + (index ? 'true' : 'false') + '">';
      }).join('') + '</div></div>' +
      '<div class="ca-gallery-controls"><button type="button" data-gallery-prev aria-label="Предыдущее фото">←</button><span data-gallery-count>1 / ' + product.gallery.length + '</span><button type="button" data-gallery-next aria-label="Следующее фото">→</button></div>' +
    '</div>';
  }

  function metricsMarkup(product) {
    if (!product.metrics) return '';
    return '<div class="ca-product-metrics">' + product.metrics.map(function(metric) {
      return '<div><strong>' + escapeHtml(metric.value) + '</strong><span>' + escapeHtml(metric.label) + '</span></div>';
    }).join('') + '</div>';
  }

  function renderProducts() {
    var host = document.querySelector('[data-products]');
    if (!host) return;
    host.innerHTML = data.products.map(function(product, index) {
      var detailId = 'details-' + product.slug;
      return '<article id="product-' + escapeHtml(product.slug) + '" class="ca-product-card ca-anchor-section" data-product-card="' + escapeHtml(product.slug) + '">' +
        '<div class="ca-product-heading"><p class="ca-product-label">Фото товара</p><div class="ca-product-title-row"><div><h3>' + escapeHtml(product.name) + '</h3><span class="ca-product-volume">' + escapeHtml(product.displacement) + '</span></div><button class="ca-product-toggle" type="button" aria-expanded="' + (index === 0 ? 'true' : 'false') + '" aria-controls="' + detailId + '" data-product-toggle><span>Подробнее</span><span aria-hidden="true">+</span></button></div></div>' +
        galleryMarkup(product) +
        '<div class="ca-product-content"><p class="ca-product-summary">' + escapeHtml(product.summary) + '</p>' +
        '<div class="ca-product-facts"><span>' + escapeHtml(product.cooling) + ' охлаждение</span><span>' + escapeHtml(product.reverse) + '</span></div>' +
        '<div id="' + detailId + '" class="ca-product-expand" data-product-expand ' + (index === 0 ? '' : 'hidden') + '><p class="ca-product-use"><strong>Лучше всего:</strong> ' + escapeHtml(product.bestFor) + '</p><ul>' + product.advantages.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>' + metricsMarkup(product) + '</div>' +
        '<button class="ca-button ca-button-product" type="button" data-quote-product="' + escapeHtml(product.slug) + '">Получить цену на ' + escapeHtml(product.name) + '</button></div>' +
      '</article>';
    }).join('');
  }

  function renderFactory() {
    var host = document.querySelector('[data-factory-gallery]');
    if (!host) return;
    host.innerHTML = data.factoryImages.map(function(item, index) {
      return '<figure class="ca-factory-photo ca-factory-photo-' + (index + 1) + '"><img src="' + asset(item.src) + '" alt="' + escapeHtml(item.alt) + '" width="900" height="600" loading="lazy"><figcaption>' + escapeHtml(item.label) + '</figcaption></figure>';
    }).join('');
  }

  function populateProductSelect() {
    var select = document.querySelector('[data-product-select]');
    if (!select) return;
    data.products.forEach(function(product) {
      var option = document.createElement('option');
      option.value = product.name;
      option.textContent = product.name + ' · ' + product.displacement;
      select.appendChild(option);
    });
    select.addEventListener('change', function() {
      state.product = select.value || state.product;
      document.querySelectorAll('[data-whatsapp-link]').forEach(function(link) { link.dataset.product = state.product; });
      updateWhatsAppLinks();
    });
  }

  function selectProduct(value, options) {
    var product = findProduct(value);
    if (!product) return;
    state.product = product.name;
    document.querySelectorAll('[data-select-product]').forEach(function(card) {
      var active = card.dataset.selectProduct === product.slug;
      card.classList.toggle('is-selected', active);
      card.setAttribute('aria-current', active ? 'true' : 'false');
    });
    var select = document.querySelector('[data-product-select]');
    if (select) select.value = product.name;
    document.querySelectorAll('[data-whatsapp-link]').forEach(function(link) { link.dataset.product = product.name; });
    updateWhatsAppLinks();
    if (options && options.scrollToProduct) {
      applyProductDisclosure(product.slug);
      var target = document.getElementById('product-' + product.slug);
      if (target) target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
    if (options && options.scrollToQuote) {
      var quote = document.getElementById('quote');
      if (quote) quote.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function applyProductDisclosure(openSlug) {
    var cards = Array.from(document.querySelectorAll('[data-product-card]'));
    var disclosure = getProductDisclosureState(cards.map(function(card) { return card.dataset.productCard; }), openSlug);
    cards.forEach(function(card) {
      var open = disclosure[card.dataset.productCard];
      var toggle = card.querySelector('[data-product-toggle]');
      var panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.hidden = !open;
    });
  }

  function initSelection() {
    document.addEventListener('click', function(event) {
      var application = event.target.closest && event.target.closest('[data-select-product]');
      if (application) selectProduct(application.dataset.selectProduct, { scrollToProduct: true });
      var quote = event.target.closest && event.target.closest('[data-quote-product]');
      if (quote) selectProduct(quote.dataset.quoteProduct, { scrollToQuote: true });
    });
    var country = document.querySelector('[name="country"]');
    if (country) country.addEventListener('change', updateWhatsAppLinks);
  }

  function initProductToggles() {
    document.querySelectorAll('[data-product-toggle]').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        var card = toggle.closest('[data-product-card]');
        if (card) applyProductDisclosure(card.dataset.productCard);
      });
    });
    applyProductDisclosure('cg-air');
  }

  function initGalleries() {
    document.querySelectorAll('[data-gallery]').forEach(function(gallery) {
      var images = Array.from(gallery.querySelectorAll('.ca-gallery-track img'));
      var count = gallery.querySelector('[data-gallery-count]');
      var index = 0;
      var touchStart = null;
      var timer = null;
      var visible = true;

      function show(nextIndex) {
        index = (nextIndex + images.length) % images.length;
        images.forEach(function(image, imageIndex) {
          var active = imageIndex === index;
          image.classList.toggle('is-active', active);
          image.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        gallery.style.setProperty('--gallery-index', index);
        count.textContent = (index + 1) + ' / ' + images.length;
      }
      function stop() { if (timer) window.clearInterval(timer); timer = null; }
      function play() {
        stop();
        if (reducedMotion.matches || document.hidden || !visible || images.length < 2) return;
        timer = window.setInterval(function() { show(index + 1); }, 6500);
      }
      gallery.querySelector('[data-gallery-prev]').addEventListener('click', function() { show(index - 1); stop(); });
      gallery.querySelector('[data-gallery-next]').addEventListener('click', function() { show(index + 1); stop(); });
      gallery.addEventListener('touchstart', function(event) { touchStart = event.touches[0].clientX; stop(); }, { passive: true });
      gallery.addEventListener('touchend', function(event) {
        if (touchStart == null) return;
        var delta = event.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) > 40) show(index + (delta < 0 ? 1 : -1));
        touchStart = null;
      }, { passive: true });
      document.addEventListener('visibilitychange', play);
      if (typeof window.IntersectionObserver === 'function') {
        new window.IntersectionObserver(function(entries) {
          visible = Boolean(entries[0] && entries[0].isIntersecting);
          if (visible) play(); else stop();
        }, { threshold: 0.1 }).observe(gallery);
      }
      show(0);
      play();
    });
  }

  function initActiveNavigation() {
    if (typeof window.IntersectionObserver !== 'function') return;
    var links = Array.from(document.querySelectorAll('.ca-nav a[href^="#"]'));
    var sections = Array.from(document.querySelectorAll('.ca-anchor-section[id]'));

    function updateActiveLink() {
      var headerHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--ca-header-height'), 10) || 78;
      var activeId = pickActiveSection(sections.map(function(section) {
        var rect = section.getBoundingClientRect();
        return { id: section.id, top: rect.top, bottom: rect.bottom };
      }), headerHeight + 36);
      links.forEach(function(link) {
        var active = link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }

    var observer = new window.IntersectionObserver(updateActiveLink, { threshold: [0, .01, .5] });
    sections.forEach(function(section) { observer.observe(section); });
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  function initMobileCta() {
    var cta = document.querySelector('[data-mobile-cta]');
    var heroButton = document.querySelector('.ca-hero-actions .ca-button-primary');
    var quote = document.getElementById('quote');
    var faq = document.getElementById('faq');
    var footer = document.querySelector('[data-footer]');
    if (!cta || !heroButton || typeof window.IntersectionObserver !== 'function') return;
    var viewState = {
      passedHero: false,
      quoteVisible: false,
      footerVisible: false,
      faqOpen: false,
      fieldFocused: false,
      keyboardOpen: false,
      nearPageBottom: false
    };
    function update() {
      var visible = shouldShowMobileCta(viewState);
      cta.classList.toggle('is-visible', visible);
      document.body.classList.toggle('ca-mobile-cta-enabled', visible);
    }
    new window.IntersectionObserver(function(entries) {
      viewState.passedHero = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      update();
    }).observe(heroButton);
    if (quote) {
      new window.IntersectionObserver(function(entries) {
        viewState.quoteVisible = Boolean(entries[0] && entries[0].isIntersecting);
        update();
      }, { threshold: 0.02 }).observe(quote);
    }
    if (footer) {
      new window.IntersectionObserver(function(entries) {
        viewState.footerVisible = Boolean(entries[0] && entries[0].isIntersecting);
        update();
      }, { threshold: 0.02 }).observe(footer);
    }
    function updateFaqState() {
      if (!faq) return;
      var rect = faq.getBoundingClientRect();
      var faqVisible = rect.top < window.innerHeight && rect.bottom > 0;
      viewState.faqOpen = faqVisible && Boolean(faq.querySelector('details[open]'));
      update();
    }
    if (faq) {
      faq.querySelectorAll('details').forEach(function(details) { details.addEventListener('toggle', updateFaqState); });
      new window.IntersectionObserver(updateFaqState, { threshold: [0, .02] }).observe(faq);
    }
    document.addEventListener('focusin', function(event) {
      viewState.fieldFocused = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      update();
    });
    document.addEventListener('focusout', function() { viewState.fieldFocused = false; update(); });
    if (window.visualViewport) {
      var initialHeight = window.visualViewport.height;
      window.visualViewport.addEventListener('resize', function() {
        viewState.keyboardOpen = initialHeight - window.visualViewport.height > 150;
        update();
      });
    }
    window.addEventListener('scroll', function() {
      viewState.nearPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 96;
      update();
    }, { passive: true });
    update();
  }

  function init() {
    renderHero();
    renderApplications();
    renderComparison();
    renderProducts();
    renderFactory();
    populateProductSelect();
    initSelection();
    initProductToggles();
    initGalleries();
    initActiveNavigation();
    initMobileCta();
    updateWhatsAppLinks();
  }

  window.ChixiangCentralAsia = {
    init: init,
    buildWhatsAppUrl: buildWhatsAppUrl,
    selectProduct: selectProduct,
    pickActiveSection: pickActiveSection,
    getProductDisclosureState: getProductDisclosureState,
    shouldShowMobileCta: shouldShowMobileCta
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
