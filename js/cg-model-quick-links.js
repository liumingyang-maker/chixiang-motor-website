(function () {
  if (typeof document === 'undefined') return;
  function syncModelQuickLinkHash(link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    if (window.location.hash === href) return;
    // location.hash updates :target; history.replaceState does not.
    window.location.hash = href.slice(1);
  }
  function bind() {
    document.querySelectorAll('.model-quick-links a[href^="#"]').forEach(function (link) {
      if (link.getAttribute('data-model-quick-link-hash') === '1') return;
      link.setAttribute('data-model-quick-link-hash', '1');
      link.addEventListener('click', function () {
        syncModelQuickLinkHash(link);
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
