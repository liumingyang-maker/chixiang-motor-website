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

  var docLang = (document.documentElement.lang || '').toLowerCase();
  var langKey = docLang.indexOf('zh') === 0 ? 'zh' : docLang.slice(0, 2);
  var PREFILL_I18N = {
    zh: {
      title: function (n) { return '已选询价料号清单（' + n + ' 项）'; },
      pn: '驰翔料号: ',
      oem: 'OEM 参考: ',
      bomHead: function (n) { return '=== 批量配件询价清单 (' + n + ' 项) ==='; }
    },
    fr: {
      title: function (n) { return 'Pièces sélectionnées pour devis (' + n + ')'; },
      pn: 'Réf. Chixiang : ',
      oem: 'Réf. OEM : ',
      bomHead: function (n) { return '=== Liste de pièces sélectionnées (' + n + ' articles) ==='; }
    },
    es: {
      title: function (n) { return 'Repuestos seleccionados para cotización (' + n + ')'; },
      pn: 'Ref. Chixiang: ',
      oem: 'Ref. OEM: ',
      bomHead: function (n) { return '=== Lista de repuestos seleccionados (' + n + ' artículos) ==='; }
    },
    pt: {
      title: function (n) { return 'Peças selecionadas para cotação (' + n + ')'; },
      pn: 'Ref. Chixiang: ',
      oem: 'Ref. OEM: ',
      bomHead: function (n) { return '=== Lista de peças selecionadas (' + n + ' itens) ==='; }
    },
    ru: {
      title: function (n) { return 'Выбранные позиции для расчёта (' + n + ')'; },
      pn: 'Арт. Chixiang: ',
      oem: 'OEM-ref: ',
      bomHead: function (n) { return '=== Список выбранных позиций (' + n + ' шт.) ==='; }
    },
    ar: {
      title: function (n) { return 'القطع المختارة لعرض السعر (' + n + ')'; },
      pn: 'مرجع Chixiang: ',
      oem: 'مرجع OEM: ',
      bomHead: function (n) { return '=== قائمة القطع المختارة (' + n + ') ==='; }
    },
    en: {
      title: function (n) { return 'Selected Parts for Quotation (' + n + ')'; },
      pn: 'Chixiang PN: ',
      oem: 'OEM Ref: ',
      bomHead: function (n) { return '=== Selected Parts BOM (' + n + ' items) ==='; }
    }
  };
  var T = PREFILL_I18N[langKey] || PREFILL_I18N.en;

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
  var interestVal = params.get('product_interest');
  if (productSelect && interestVal) {
    productSelect.value = interestVal;
    if (!productSelect.value && interestVal === 'cg') {
      var isWater = /water|sb|hw/i.test((engineCode || '') + ' ' + (vehicle || ''));
      productSelect.value = isWater ? 'cg-water' : 'cg-air';
    }
    if (!productSelect.value && interestVal === 'multiple') {
      productSelect.value = 'other';
    }
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

    var title = T.title(items.length);

    var rowsHtml = items.map(function (item) {
      var label = item.part || item.pn || item.oem || 'Selected Part';
      var codes = [];
      if (item.pn) codes.push(T.pn + item.pn);
      if (item.oem) codes.push(T.oem + item.oem);
      return '<li><strong>' + escapeText(label) + '</strong>'
        + (item.model ? ' <span class="btv-echo-meta">(' + escapeText(item.model) + ')</span>' : '')
        + (codes.length ? '<br><span class="btv-echo-codes">' + escapeText(codes.join(' | ')) + '</span>' : '')
        + '</li>';
    }).join('');

    card.innerHTML = '<div class="btv-echo-card__head"><strong>' + escapeText(title) + '</strong></div>'
      + '<ul class="btv-echo-card__list">' + rowsHtml + '</ul>';

    form.parentNode.insertBefore(card, form);
  }

  var SINGLE_LABELS = {
    zh: { brand: '品牌：', part: '产品/配件编号：', pn: '料号：', code: '发动机代码：', vehicle: '适用车型：' },
    fr: { brand: 'Marque : ', part: 'Référence catalogue : ', pn: 'Réf. pièce : ', code: 'Code moteur : ', vehicle: 'Véhicule : ' },
    es: { brand: 'Marca: ', part: 'ID de catálogo: ', pn: 'N.º de parte: ', code: 'Código de motor: ', vehicle: 'Vehículo: ' },
    pt: { brand: 'Marca: ', part: 'ID de catálogo: ', pn: 'Código da peça: ', code: 'Código do motor: ', vehicle: 'Veículo: ' },
    ru: { brand: 'Бренд: ', part: 'Позиция каталога: ', pn: 'Артикул: ', code: 'Код двигателя: ', vehicle: 'Техника: ' },
    ar: { brand: 'العلامة: ', part: 'مرجع الكتالوج: ', pn: 'رقم القطعة: ', code: 'رمز المحرك: ', vehicle: 'المركبة: ' },
    en: { brand: 'Brand: ', part: 'Catalog product ID: ', pn: 'Part number: ', code: 'Engine code: ', vehicle: 'Vehicle: ' }
  };
  var SL = SINGLE_LABELS[langKey] || SINGLE_LABELS.en;

  var requirements = form.querySelector('[name="requirements"], [name="message"]');
  if (requirements && batchItems.length) {
    var bomLines = [T.bomHead(batchItems.length)];
    batchItems.forEach(function (item, idx) {
      var parts = [
        (idx + 1) + '.',
        item.model ? '[' + item.model + ']' : '',
        item.part || '',
        item.pn ? T.pn + item.pn : '',
        item.oem ? T.oem + item.oem : ''
      ].filter(Boolean);
      bomLines.push(parts.join(' '));
    });
    var bomText = bomLines.join('\n');
    var existingBomRe = /^===\s.*?\s===[\s\S]*?(?:\n\n|$)/;
    if (!requirements.value) {
      requirements.value = bomText;
    } else if (existingBomRe.test(requirements.value)) {
      requirements.value = requirements.value.replace(existingBomRe, bomText + '\n\n').trim();
    } else {
      requirements.value = bomText + '\n\n' + requirements.value;
    }
    renderSummaryCard(summaryItems);
  } else if (requirements && (part || pn || brand || engineCode)) {
    var lines = [];
    if (brand) lines.push(SL.brand + brand);
    if (part) lines.push(SL.part + part);
    if (pn) lines.push(SL.pn + pn);
    if (engineCode) lines.push(SL.code + engineCode);
    if (vehicle && vehicle !== brand) lines.push(SL.vehicle + vehicle);
    var prefix = lines.join('\n');
    if (!requirements.value) {
      requirements.value = prefix;
    } else if (requirements.value.indexOf(SL.part) === -1 && requirements.value.indexOf('Catalog product ID:') === -1) {
      requirements.value = prefix + '\n' + requirements.value;
    }
    renderSummaryCard(summaryItems);
  }
})();
