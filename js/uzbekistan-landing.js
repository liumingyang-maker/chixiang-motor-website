(function(window, document) {
  'use strict';

  var DEFAULT_DELAY = 6000;

  function initCarousels() {
    document.querySelectorAll('[data-uz-carousel]').forEach(createCarousel);
  }

  function createCarousel(gallery) {
    if (gallery.dataset.carouselReady === 'true') return;
    gallery.dataset.carouselReady = 'true';

    var images = Array.from(gallery.querySelectorAll('img'));
    var previous = gallery.querySelector('[data-carousel-prev]');
    var next = gallery.querySelector('[data-carousel-next]');
    var dots = gallery.querySelector('[data-carousel-dots]');
    var counter = gallery.querySelector('[data-carousel-counter]');
    var reducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };
    var activeImages = images.slice();
    var index = 0;
    var timer = null;
    var visible = true;
    var userPaused = false;
    var delay = Number(gallery.dataset.delay || DEFAULT_DELAY);

    if (!activeImages.length || !previous || !next || !dots || !counter) return;

    activeImages.forEach(function(image, imageIndex) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Показать изображение ' + (imageIndex + 1));
      dot.addEventListener('click', function() {
        show(imageIndex);
        pauseForUser();
      });
      dots.appendChild(dot);
    });

    function updateControls() {
      var single = activeImages.length < 2;
      previous.hidden = single;
      next.hidden = single;
      dots.hidden = single;
    }

    function show(target) {
      if (!activeImages.length) {
        counter.textContent = '0 / 0';
        return;
      }

      index = (target + activeImages.length) % activeImages.length;
      activeImages.forEach(function(image, imageIndex) {
        var active = imageIndex === index;
        image.classList.toggle('is-active', active);
        image.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (dots.children[imageIndex]) {
          dots.children[imageIndex].classList.toggle('is-active', active);
          dots.children[imageIndex].setAttribute('aria-current', active ? 'true' : 'false');
        }
      });
      counter.textContent = (index + 1) + ' / ' + activeImages.length;
    }

    function stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function play() {
      stop();
      if (!visible || document.hidden || reducedMotion.matches || userPaused || activeImages.length < 2) return;
      timer = window.setInterval(function() { show(index + 1); }, delay);
    }

    function pauseForUser() {
      userPaused = true;
      stop();
    }

    function removeFailedImage(image) {
      var failedIndex = activeImages.indexOf(image);
      if (failedIndex === -1) return;

      activeImages.splice(failedIndex, 1);
      if (dots.children[failedIndex]) dots.children[failedIndex].remove();
      image.remove();
      index = Math.min(index, Math.max(activeImages.length - 1, 0));
      updateControls();
      show(index);
      play();
    }

    previous.addEventListener('click', function() {
      show(index - 1);
      pauseForUser();
    });
    next.addEventListener('click', function() {
      show(index + 1);
      pauseForUser();
    });
    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', play);
    gallery.addEventListener('focusin', pauseForUser);
    gallery.addEventListener('touchstart', pauseForUser, { passive: true });
    images.forEach(function(image) {
      image.addEventListener('error', function() { removeFailedImage(image); });
    });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stop();
      else play();
    });

    if (typeof window.IntersectionObserver === 'function') {
      new window.IntersectionObserver(function(entries) {
        visible = Boolean(entries[0] && entries[0].isIntersecting);
        if (visible) play();
        else stop();
      }, { threshold: .08 }).observe(gallery);
    }

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', play);
    }

    updateControls();
    show(0);
    play();
  }

  window.ChixiangUzLanding = {
    initCarousels: initCarousels,
    createCarousel: createCarousel
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
})(window, document);
