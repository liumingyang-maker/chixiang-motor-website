(function(window, document) {
  'use strict';

  var data = window.ChixiangLatamMarket || { market: {}, productOrder: [], applications: [], faq: [] };
  var catalog = (window.ChixiangLatamProducts || {}).products || {};
  var selectedProduct = data.productOrder[0] || '';
  var selectedApplication = '';

  function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, function(char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }
  function params() {
    if (typeof URLSearchParams === 'undefined' || !window.location) return { get: function() { return ''; } };
    return new URLSearchParams(window.location.search || '');
  }
  function replaceTokens(template, context) { return String(template || '').replace(/\{(\w+)\}/g, function(_, key) { return context[key] || ''; }); }
  function buildWhatsAppUrl(context) {
    context = context || {};
    var market = data.market || {};
    var query = params();
    var content = {
      market: market.name || market.defaultCountry || '', product: context.product || selectedProduct || '', application: context.application || selectedApplication || 'No especificado', source: context.source || 'landing',
      utm_source: context.utm_source || query.get('utm_source') || '', utm_medium: context.utm_medium || query.get('utm_medium') || '', utm_campaign: context.utm_campaign || query.get('utm_campaign') || '', gclid: context.gclid || query.get('gclid') || ''
    };
    var message = context.message || replaceTokens(market.whatsappMessageTemplate, content);
    var details = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'].filter(function(key) { return content[key]; }).map(function(key) { return key + ': ' + content[key]; });
    if (details.length) message += '\n' + details.join(' | ');
    return 'https://wa.me/' + (market.whatsappNumber || '8619008225410') + '?text=' + encodeURIComponent(message);
  }
  function pickActiveSection(sections, headerHeight) {
    var point = Number(headerHeight || 0) + 40;
    var current = sections.filter(function(section) { return section.top <= point && section.bottom > point; });
    return current.length ? current[current.length - 1].id : (sections.find(function(section) { return section.bottom > point; }) || {}).id || '';
  }
  function getProductDisclosureState(slugs, active) { return slugs.reduce(function(result, slug) { result[slug] = slug === active; return result; }, {}); }
  function shouldShowMobileCta(state) { return Boolean(state && state.passedHero && !state.quoteVisible && !state.footerVisible && !state.faqOpen && !state.fieldFocused && !state.keyboardOpen && !state.nearPageBottom); }
  function product(slug) { return catalog[slug] || {}; }
  function scrollToId(id) { var target = document.getElementById(id); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function setSelectedProduct(slug, application) {
    selectedProduct = slug || selectedProduct;
    selectedApplication = application || selectedApplication;
    var select = document.querySelector('[name="product_interest"]');
    if (select) select.value = selectedProduct;
    var applicationInput = document.querySelector('[name="application"]');
    if (applicationInput && selectedApplication) applicationInput.value = selectedApplication;
    document.querySelectorAll('[data-product-card]').forEach(function(card) { card.classList.toggle('is-selected', card.dataset.productCard === selectedProduct); });
    document.querySelectorAll('[data-whatsapp-link]').forEach(function(link) { link.href = buildWhatsAppUrl({ product: link.dataset.product || selectedProduct, application: link.dataset.application || selectedApplication, source: link.dataset.source || 'cta' }); });
  }
  function renderHero() {
    var hero = document.querySelector('[data-hero]'); if (!hero) return;
    hero.querySelector('[data-eyebrow]').textContent = data.market.eyebrow;
    hero.querySelector('h1').textContent = data.market.title;
    hero.querySelector('[data-hero-description]').textContent = data.market.description;
    hero.querySelector('[data-hero-points]').innerHTML = data.heroPoints.map(function(point) { return '<li>' + escapeHtml(point) + '</li>'; }).join('');
    hero.querySelector('[data-hero-engines]').innerHTML = data.productOrder.slice(0, 3).map(function(slug) {
      var item = product(slug);
      return '<figure class="latam-hero-engine"><span class="latam-engine-glow"></span><img src="../../' + item.image + '" alt="' + escapeHtml(item.name) + '" fetchpriority="high"><figcaption><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.displacement) + '</span></figcaption></figure>';
    }).join('');
  }
  function renderApplications() {
    var node = document.querySelector('[data-applications]'); if (!node) return;
    node.innerHTML = data.applications.map(function(item, index) { return '<button class="latam-application" type="button" data-application="' + escapeHtml(item.title) + '" data-product="' + item.product + '"><span>0' + (index + 1) + '</span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.text) + '</small><em>' + escapeHtml(product(item.product).name) + ' →</em></button>'; }).join('');
    node.querySelectorAll('button').forEach(function(button) { button.addEventListener('click', function() { setSelectedProduct(button.dataset.product, button.dataset.application); scrollToId('products'); }); });
  }
  function productRows(item, labels) {
    var values = [item.name, item.displacement, item.cooling, item.reverse, item.bestFor];
    return values.map(function(value, index) { return '<div><dt>' + escapeHtml(labels[index]) + '</dt><dd>' + escapeHtml(value) + '</dd></div>'; }).join('');
  }
  function renderComparison() {
    var cards = document.querySelector('[data-comparison-cards]'); var table = document.querySelector('[data-comparison-table]');
    if (!cards || !table) return;
    cards.innerHTML = data.productOrder.map(function(slug) { var item = product(slug); return '<article class="latam-compare-card"><h3>' + escapeHtml(item.name) + '</h3><dl>' + productRows(item, data.comparisonLabels) + '</dl><button type="button" class="latam-text-action" data-product="' + slug + '">' + escapeHtml(data.comparisonLabels[5]) + ' →</button></article>'; }).join('');
    table.innerHTML = '<table><thead><tr>' + data.comparisonLabels.map(function(label) { return '<th>' + escapeHtml(label) + '</th>'; }).join('') + '</tr></thead><tbody><tr>' + data.productOrder.map(function(slug) { var item = product(slug); return '<td><strong>' + escapeHtml(item.name) + '</strong></td>'; }).join('') + '</tr><tr>' + data.productOrder.map(function(slug) { return '<td>' + escapeHtml(product(slug).displacement) + '</td>'; }).join('') + '</tr><tr>' + data.productOrder.map(function(slug) { return '<td>' + escapeHtml(product(slug).cooling) + '</td>'; }).join('') + '</tr><tr>' + data.productOrder.map(function(slug) { return '<td>' + escapeHtml(product(slug).reverse) + '</td>'; }).join('') + '</tr><tr>' + data.productOrder.map(function(slug) { return '<td>' + escapeHtml(product(slug).bestFor) + '</td>'; }).join('') + '</tr><tr>' + data.productOrder.map(function(slug) { return '<td><button type="button" class="latam-text-action" data-product="' + slug + '">Solicitar precio</button></td>'; }).join('') + '</tr></tbody></table>';
    document.querySelectorAll('[data-comparison-cards] [data-product], [data-comparison-table] [data-product]').forEach(function(button) { button.addEventListener('click', function() { setSelectedProduct(button.dataset.product); scrollToId('quote'); }); });
  }
  function renderProducts() {
    var node = document.querySelector('[data-products]'); if (!node) return;
    node.innerHTML = data.productOrder.map(function(slug, index) {
      var item = product(slug); var open = index === 0;
      return '<article id="product-' + slug + '" class="latam-product" data-product-card="' + slug + '"><div class="latam-product-copy"><p>Modelo seleccionado</p><h3>' + escapeHtml(item.name) + '</h3><span class="latam-volume">' + escapeHtml(item.displacement) + '</span><p class="latam-product-use">' + escapeHtml(item.bestFor) + '</p><button class="latam-product-toggle" type="button" aria-expanded="' + open + '" aria-controls="details-' + slug + '">Ver detalles</button><div id="details-' + slug + '" class="latam-product-details"' + (open ? '' : ' hidden') + '><ul>' + item.benefits.map(function(benefit) { return '<li>' + escapeHtml(benefit) + '</li>'; }).join('') + '</ul><a class="latam-button latam-button-primary" data-whatsapp-link data-product="' + escapeHtml(item.name) + '" data-source="product" target="_blank" rel="noopener">Cotizar ' + escapeHtml(item.name) + '</a></div></div><div class="latam-gallery" data-gallery>' + item.gallery.map(function(image, imageIndex) { return '<img src="../../' + image + '" alt="' + escapeHtml(item.name) + '" loading="' + (imageIndex ? 'lazy' : 'eager') + '">'; }).join('') + '<div class="latam-gallery-controls"><button type="button" aria-label="Imagen anterior">‹</button><span>1 / ' + item.gallery.length + '</span><button type="button" aria-label="Imagen siguiente">›</button></div></div></article>';
    }).join('');
    node.querySelectorAll('.latam-product-toggle').forEach(function(button) { button.addEventListener('click', function() { var card = button.closest('[data-product-card]'); var details = card.querySelector('.latam-product-details'); var willOpen = details.hidden; node.querySelectorAll('.latam-product-details').forEach(function(item) { item.hidden = true; item.closest('[data-product-card]').querySelector('.latam-product-toggle').setAttribute('aria-expanded', 'false'); }); details.hidden = !willOpen; button.setAttribute('aria-expanded', String(willOpen)); }); });
    node.querySelectorAll('[data-gallery]').forEach(initGallery);
  }
  function initGallery(gallery) {
    var images = Array.from(gallery.querySelectorAll('img')); var index = 0; var counter = gallery.querySelector('span'); var controls = gallery.querySelectorAll('button');
    function show(next) { index = (next + images.length) % images.length; images.forEach(function(image, current) { image.hidden = current !== index; }); counter.textContent = (index + 1) + ' / ' + images.length; }
    controls[0].addEventListener('click', function() { show(index - 1); }); controls[1].addEventListener('click', function() { show(index + 1); }); show(0);
  }
  function renderFactoryAndFaq() {
    var factory = document.querySelector('[data-factory]'); if (factory) factory.innerHTML = (window.ChixiangLatamProducts.factoryImages || []).map(function(image) { return '<img src="../../' + image.src + '" alt="' + escapeHtml(image.alt) + '" loading="lazy">'; }).join('');
    var faq = document.querySelector('[data-faq]'); if (faq) faq.innerHTML = data.faq.map(function(pair, index) { return '<details' + (index === 0 ? ' open' : '') + '><summary>' + escapeHtml(pair[0]) + '</summary><p>' + escapeHtml(pair[1]) + '</p></details>'; }).join('');
  }
  function bindReplacementLink() {
    document.querySelectorAll('[data-replacement-link]').forEach(function(link) {
      link.href = buildWhatsAppUrl({ source: 'replacement', product: 'Reemplazo', application: 'Reemplazo', message: data.market.replacementMessage });
    });
  }
  function populateForm() {
    var form = document.getElementById('latamQuoteForm'); if (!form) return;
    form.querySelector('[name="country"]').value = data.market.defaultCountry;
    form.querySelector('[name="market"]').value = data.market.key; form.querySelector('[name="source_form"]').value = data.market.sourceForm;
    form.querySelector('[name="product_interest"]').innerHTML = '<option value="">Seleccione una opción</option>' + data.productOrder.map(function(slug) { return '<option value="' + slug + '">' + escapeHtml(product(slug).name) + '</option>'; }).join('');
    form.querySelector('[name="application"]').innerHTML = '<option value="">Seleccione una opción</option>' + data.form.applications.map(function(value) { return '<option>' + escapeHtml(value) + '</option>'; }).join('');
    form.querySelector('[name="displacement"]').innerHTML = '<option value="">Seleccione una opción</option>' + data.form.displacements.map(function(value) { return '<option>' + escapeHtml(value) + '</option>'; }).join('');
    form.addEventListener('submit', function() { setSelectedProduct(form.querySelector('[name="product_interest"]').value, form.querySelector('[name="application"]').value); });
    document.querySelector('[data-quote-title]').textContent = data.quoteTitle; document.querySelector('[data-quote-description]').textContent = data.quoteDescription;
  }
  function formValue(form, name) { var field = form.querySelector('[name="' + name + '"]'); return field && field.value ? field.value.trim() : ''; }
  function serializeFormMessage(form) {
    var entries = [
      ['Mercado', data.market.name || data.market.defaultCountry], ['Pais', formValue(form, 'country')], ['Aplicacion', formValue(form, 'application')],
      ['Motor', formValue(form, 'product_interest')], ['Cilindrada', formValue(form, 'displacement')], ['Cantidad', formValue(form, 'quantity')],
      ['Vehiculo', formValue(form, 'vehicle')], ['Codigo de motor', formValue(form, 'engine_code')], ['Requisitos', formValue(form, 'requirements')]
    ].filter(function(entry) { return entry[1]; });
    form.querySelector('[name="message"]').value = entries.map(function(entry) { return entry[0] + ': ' + entry[1]; }).join('\n');
  }
  document.addEventListener('submit', function(event) { if (event.target && event.target.id === 'latamQuoteForm') serializeFormMessage(event.target); });
  function initNavigation() {
    var links = Array.from(document.querySelectorAll('[data-nav] a[href^="#"]'));
    var sections = links.map(function(link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
    function refresh() {
      var header = document.querySelector('.latam-header');
      var headerHeight = header ? header.getBoundingClientRect().height : 70;
      var active = pickActiveSection(sections.map(function(section) { var rect = section.getBoundingClientRect(); return { id: section.id, top: rect.top, bottom: rect.bottom }; }), headerHeight);
      links.forEach(function(link) { link.classList.toggle('is-active', link.getAttribute('href') === '#' + active); });
    }
    refresh();
    window.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh);
  }
  function initSticky() {
    var cta = document.querySelector('[data-mobile-cta]'); if (!cta || !window.matchMedia('(max-width: 767px)').matches) return; var state = {};
    function update() { cta.hidden = !shouldShowMobileCta(state); }
    ['top', 'quote', 'footer'].forEach(function(id) { var node = document.getElementById(id); if (node) new IntersectionObserver(function(entries) { state[id === 'top' ? 'passedHero' : id + 'Visible'] = id === 'top' ? !entries[0].isIntersecting : entries[0].isIntersecting; update(); }, { threshold: .05 }).observe(node); });
    var faqNode = document.querySelector('[data-faq]');
    if (faqNode) new IntersectionObserver(function(entries) { state.faqOpen = entries[0].isIntersecting && Array.from(faqNode.querySelectorAll('details')).some(function(detail) { return detail.open; }); update(); }, { threshold: .05 }).observe(faqNode);
    document.addEventListener('focusin', function(event) { state.fieldFocused = /INPUT|SELECT|TEXTAREA/.test(event.target.tagName); update(); }); document.addEventListener('focusout', function() { state.fieldFocused = false; update(); });
    document.querySelectorAll('[data-faq] details').forEach(function(item) { item.addEventListener('toggle', function() { state.faqOpen = Array.from(document.querySelectorAll('[data-faq] details')).some(function(detail) { return detail.open; }); update(); }); });
  }
  function init() { renderHero(); renderApplications(); renderComparison(); renderProducts(); renderFactoryAndFaq(); populateForm(); initNavigation(); setSelectedProduct(selectedProduct); bindReplacementLink(); initSticky(); }
  window.ChixiangLatam = { init: init, buildWhatsAppUrl: buildWhatsAppUrl, pickActiveSection: pickActiveSection, getProductDisclosureState: getProductDisclosureState, shouldShowMobileCta: shouldShowMobileCta };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
