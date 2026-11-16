/**
 * Prefill contact-form context for Bajaj / TVS catalog inquiry links.
 * Additive only: injects hidden fields that already exist in the Worker
 * whitelist (vehicle, engine_code, source_cta) and seeds requirements.
 * Never changes form action, required fields, validation, or submit flow.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  var form = document.querySelector('form.contact-form, .contact-form form, form.p5-form');
  if (!form) return;

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

  var requirements = form.querySelector('[name="requirements"], [name="message"]');
  if (requirements && (part || pn || brand || engineCode)) {
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
  }
})();
