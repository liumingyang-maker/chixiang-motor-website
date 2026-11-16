/**
 * Interactive model/category/OEM-PN search filter + Multi-Select BOM Quote Basket
 * for Bajaj / TVS model-hub tables. Pure client-side enhancement; never modifies
 * form submission contracts.
 */
(function () {
  'use strict';

  var hubsRoot = document.getElementById('model-hubs');
  if (!hubsRoot) return;

  var isZh = document.documentElement.lang && document.documentElement.lang.toLowerCase().indexOf('zh') === 0;
  var modelSelect = hubsRoot.querySelector('[data-btv-filter-model]');
  var categorySelect = hubsRoot.querySelector('[data-btv-filter-category]');
  var searchInput = hubsRoot.querySelector('[data-btv-filter-search]');
  var countEl = hubsRoot.querySelector('[data-btv-filter-count]');
  var hubBlocks = Array.prototype.slice.call(hubsRoot.querySelectorAll('[data-btv-model-hub]'));
  var checkboxes = Array.prototype.slice.call(hubsRoot.querySelectorAll('.btv-part-checkbox'));

  function applyFilters() {
    var modelVal = modelSelect ? modelSelect.value : '';
    var catVal = categorySelect ? categorySelect.value : '';
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visibleRows = 0;

    hubBlocks.forEach(function (block) {
      var hubId = block.getAttribute('data-btv-model-hub') || '';
      var modelMatch = !modelVal || hubId === modelVal;
      var rows = Array.prototype.slice.call(block.querySelectorAll('tbody tr'));
      var blockVisible = 0;

      rows.forEach(function (row) {
        var rowCat = row.getAttribute('data-btv-row-category') || '';
        var rowText = (row.getAttribute('data-btv-search') || row.textContent || '').toLowerCase();
        var catMatch = !catVal || rowCat === catVal;
        var textMatch = !query || rowText.indexOf(query) !== -1;
        var show = modelMatch && catMatch && textMatch;
        row.hidden = !show;
        if (show) {
          blockVisible += 1;
          visibleRows += 1;
        }
      });

      block.hidden = !modelMatch || blockVisible === 0;
    });

    if (countEl) {
      countEl.textContent = isZh
        ? '显示 ' + visibleRows + ' 项配件'
        : 'Showing ' + visibleRows + ' matching part(s)';
    }
  }

  if (modelSelect) modelSelect.addEventListener('change', applyFilters);
  if (categorySelect) categorySelect.addEventListener('change', applyFilters);
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  var basket = document.getElementById('btvQuoteBasket');
  var basketCount = basket && basket.querySelector('[data-btv-basket-count]');
  var basketClear = basket && basket.querySelector('[data-btv-basket-clear]');
  var basketSubmit = basket && basket.querySelector('[data-btv-basket-submit]');

  function selectedItems() {
    return checkboxes
      .filter(function (cb) { return cb.checked; })
      .map(function (cb) {
        return {
          brand: cb.getAttribute('data-btv-brand') || '',
          model: cb.getAttribute('data-btv-model') || '',
          part: cb.getAttribute('data-btv-part') || '',
          category: cb.getAttribute('data-btv-category') || '',
          pn: cb.getAttribute('data-btv-pn') || '',
          oem: cb.getAttribute('data-btv-oem') || ''
        };
      });
  }

  function updateBasket() {
    var items = selectedItems();
    if (!basket) return;
    if (basketCount) basketCount.textContent = String(items.length);
    basket.hidden = items.length === 0;
  }

  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', updateBasket);
  });

  if (basketClear) {
    basketClear.addEventListener('click', function () {
      checkboxes.forEach(function (cb) { cb.checked = false; });
      updateBasket();
    });
  }

  if (basketSubmit) {
    basketSubmit.addEventListener('click', function () {
      var items = selectedItems();
      if (!items.length) return;
      var contactPath = isZh ? '/zh-cn/contact' : '/en/contact';
      var params = new URLSearchParams();
      params.set('product_interest', 'parts');
      params.set('source_form', 'bajaj-tvs-catalog');
      params.set('source_cta', 'batch-quote');

      var brands = [];
      var models = [];
      items.forEach(function (item) {
        if (item.brand && brands.indexOf(item.brand) === -1) brands.push(item.brand);
        if (item.model && models.indexOf(item.model) === -1) models.push(item.model);
      });
      if (brands.length) params.set('btv_brand', brands.join('+'));
      if (models.length) params.set('vehicle', models.join(', '));

      var serialized = JSON.stringify(items);
      try {
        window.sessionStorage.setItem('btv_quote_basket', serialized);
      } catch (e) { /* ignore storage restrictions */ }

      if (serialized.length <= 1200) {
        params.set('btv_items', serialized);
      } else {
        params.set('btv_items_storage', '1');
      }
      window.location.href = contactPath + '?' + params.toString();
    });
  }

  applyFilters();
  updateBasket();
})();
