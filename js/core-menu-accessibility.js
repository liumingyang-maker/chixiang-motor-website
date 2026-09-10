(function () {
  'use strict';

  function init() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('mobileNav');
    var closeButton = document.getElementById('mobileNavClose');
    if (!toggle || !nav || !closeButton) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('.mobile-nav-list a'));
    var initialTabindex = new Map();
    links.concat([closeButton]).forEach(function (element) {
      initialTabindex.set(element, element.getAttribute('tabindex'));
    });
    var wasOpen = false;

    toggle.setAttribute('aria-controls', 'mobileNav');
    closeButton.setAttribute('aria-controls', 'mobileNav');

    function restoreTabindex(element) {
      var value = initialTabindex.get(element);
      if (value === null) {
        element.removeAttribute('tabindex');
      } else {
        element.setAttribute('tabindex', value);
      }
    }

    function sync() {
      var open = nav.classList.contains('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      links.concat([closeButton]).forEach(function (element) {
        if (open) {
          restoreTabindex(element);
        } else {
          element.setAttribute('tabindex', '-1');
        }
      });

      if (open && !wasOpen && links.length) {
        links[0].focus();
      } else if (!open && wasOpen && toggle.isConnected) {
        toggle.focus();
      }
      wasOpen = open;
    }

    function syncAfterExistingHandler() {
      window.setTimeout(sync, 0);
    }

    if (typeof MutationObserver === 'function') {
      new MutationObserver(sync).observe(nav, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    toggle.addEventListener('click', syncAfterExistingHandler);
    closeButton.addEventListener('click', syncAfterExistingHandler);

    document.addEventListener('keydown', function (event) {
      if (!nav.classList.contains('active')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeButton.click();
        return;
      }

      if (event.key !== 'Tab') return;
      var focusable = [closeButton].concat(links);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && nav.classList.contains('active')) {
        closeButton.click();
      }
    });

    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
