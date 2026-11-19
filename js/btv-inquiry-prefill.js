/**
 * Prefill contact-form context for Bajaj / TVS catalog inquiry links (single SKU
 * or multi-SKU BOM batch basket). Additive only: injects hidden fields that already
 * exist in the Worker whitelist (vehicle, engine_code, source_cta), seeds
 * requirements, and renders a visual Selected Parts summary card above the form.
 * Never changes form action, required fields, validation, or submit flow.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  var form = document.querySelector('form.contact-form, .contact-form form, form.p5-form');
  if (!form) return;

  var isZh = document.documentElement.lang && document.documentElement.lang.toLowerCase().indexOf('zh') === 0;

  function setOrAddHidden(name, value) {
    if (!value) return;
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function escapeText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var part = params.get('btv_part') || '';
  var pn = params.get('btv_pn') || '';
  var brand = params.get('btv_brand') || '';
  var sourceCta = params.get('source_cta') || '';
  var engineCode = params.get('engine_code') || '';
  var vehicle = params.get('vehicle') || '';
  var sourceForm = params.get('source_form') || '';

  if (sourceForm) setOrAddHidden('source_form', sourceForm);
  if (sourceCta) setOrAddHidden('source_cta', sourceCta);
  if (engineCode) setOrAddHidden('engine_code', engineCode);
  if (vehicle) setOrAddHidden('vehicle', vehicle);

  var productSelect = form.querySelector('[name="product_interest"], [name="product"]');
  if (productSelect && params.get('product_interest')) {
    productSelect.value = params.get('product_interest');
  }
  var qtyInput = form.querySelector('[name="quantity"]');
  if (qtyInput && params.get('quantity') && !qtyInput.value) {
    qtyInput.value = params.get('quantity');
  }
  var countryInput = form.querySelector('[name="country"]');
  if (countryInput && params.get('country') && !countryInput.value) {
    countryInput.value = params.get('country');
  }

  var batchItems = [];
  var rawItems = params.get('btv_items') || '';
  if (!rawItems && params.get('btv_items_storage') === '1') {
    try {
      rawItems = window.sessionStorage.getItem('btv_quote_basket') || '';
    } catch (e) { rawItems = ''; }
  }
  if (rawItems) {
    try {
      var parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) batchItems = parsed;
    } catch (e) { batchItems = []; }
  }

  var summaryItems = batchItems.slice();
  if (!summaryItems.length && (part || pn || brand || engineCode)) {
    summaryItems.push({
      brand: brand,
      model: vehicle || brand,
      part: part,
      pn: pn,
      oem: ''
    });
  }

  function renderSummaryCard(items) {
    if (!items.length) return;
    var existing = document.getElementById('btvSelectedPartsSummary');
    if (existing) existing.remove();

    var card = document.createElement('div');
    card.id = 'btvSelectedPartsSummary';
    card.className = 'btv-echo-card';

    var title = isZh
      ? '已选询价料号清单（' + items.length + ' 项）'
      : 'Selected Parts for Quotation (' + items.length + ')';

    var rowsHtml = items.map(function (item) {
      var label = item.part || item.pn || item.oem || 'Selected Part';
      var codes = [];
      if (item.pn) codes.push((isZh ? '驰翔料号: ' : 'Chixiang PN: ') + item.pn);
      if (item.oem) codes.push((isZh ? 'OEM 参考: ' : 'OEM Ref: ') + item.oem);
      return '<li><strong>' + escapeText(label) + '</strong>'
        + (item.model ? ' <span class="btv-echo-meta">(' + escapeText(item.model) + ')</span>' : '')
        + (codes.length ? '<br><span class="btv-echo-codes">' + escapeText(codes.join(' | ')) + '</span>' : '')
        + '</li>';
    }).join('');

    card.innerHTML = '<div class="btv-echo-card__head"><strong>' + escapeText(title) + '</strong></div>'
      + '<ul class="btv-echo-card__list">' + rowsHtml + '</ul>';

    form.parentNode.insertBefore(card, form);
  }

  var requirements = form.querySelector('[name="requirements"], [name="message"]');
  if (requirements && batchItems.length) {
    var bomLines = [
      (isZh ? '=== 批量配件询价清单 (' + batchItems.length + ' 项) ===' : '=== Selected Parts BOM (' + batchItems.length + ' items) ===')
    ];
    batchItems.forEach(function (item, idx) {
      var parts = [
        (idx + 1) + '.',
        item.model ? '[' + item.model + ']' : '',
        item.part || '',
        item.pn ? 'Chixiang PN: ' + item.pn : '',
        item.oem ? 'OEM Ref: ' + item.oem : ''
      ].filter(Boolean);
      bomLines.push(parts.join(' '));
    });
    var bomText = bomLines.join('\n');
    if (!requirements.value) {
      requirements.value = bomText;
    } else if (requirements.value.indexOf('Selected Parts BOM') === -1 && requirements.value.indexOf('批量配件询价清单') === -1) {
      requirements.value = bomText + '\n\n' + requirements.value;
    }
    renderSummaryCard(summaryItems);
  } else if (requirements && (part || pn || brand || engineCode)) {
    var lines = [];
    if (brand) lines.push('Brand: ' + brand);
    if (part) lines.push('Catalog product ID: ' + part);
    if (pn) lines.push('Part number: ' + pn);
    if (engineCode) lines.push('Engine code: ' + engineCode);
    if (vehicle && vehicle !== brand) lines.push('Vehicle: ' + vehicle);
    var prefix = lines.join('\n');
    if (!requirements.value) {
      requirements.value = prefix;
    } else if (requirements.value.indexOf('Catalog product ID:') === -1) {
      requirements.value = prefix + '\n' + requirements.value;
    }
    renderSummaryCard(summaryItems);
  }
})();
