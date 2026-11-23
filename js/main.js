/* ============================================================
   Chixiang Motors - Main JavaScript
   ============================================================ */

(function() {
  'use strict';

  function init() {
    // --- Google Ads conversion tracking ---
    function gtag_report_conversion() {
      if (typeof window.gtag !== 'function') return false;
      try {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16777656395/Om_nCMCV4swcEMvwmsA-',
          'value': 1.0,
          'currency': 'USD'
        });
      } catch (error) {
        // Conversion measurement must never change a successful form submission.
      }
      return false;
    }

    function reportWhatsAppConversion() {
      if (typeof window.gtag !== 'function') return;

      try {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16777656395/bovKCKOx088cEMvwmsA-'
        });
      } catch (error) {
        // Tracking must never prevent the visitor from opening WhatsApp.
      }
    }

    document.addEventListener('click', function(event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      if (!target.closest('a[href*="wa.me/"]')) return;

      reportWhatsAppConversion();
    });

    // --- Full-Screen Mobile Nav ---
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobileNav');
    var mobileNavClose = document.getElementById('mobileNavClose');

    function openMobileNav() {
      if (mobileNav) {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Animate hamburger to X
        if (menuToggle) {
          var spans = menuToggle.querySelectorAll('span');
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        }
      }
    }

    function closeMobileNav() {
      if (mobileNav) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
        // Reset hamburger
        if (menuToggle) {
          var spans = menuToggle.querySelectorAll('span');
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        }
      }
    }

    if (menuToggle) {
      menuToggle.onclick = function(e) {
        e.stopPropagation();
        if (mobileNav && mobileNav.classList.contains('active')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      };
    }

    if (mobileNavClose) {
      mobileNavClose.onclick = function() {
        closeMobileNav();
      };
    }

    // Close when clicking any nav link inside the mobile nav
    if (mobileNav) {
      mobileNav.querySelectorAll('.mobile-nav-list a').forEach(function(link) {
        link.addEventListener('click', function() {
          closeMobileNav();
        });
      });
    }

    // --- Language Switcher ---
    const langCurrent = document.querySelector('.lang-current');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langSwitcher = document.querySelector('.lang-switcher');

    // Ensure every page exposes all 7 full-matrix languages with clean route mapping & root fallback
    (function ensureFullLangSwitcher() {
      if (!langDropdown) return;
      var norm = (window.location.pathname || '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
      if (norm !== '/' && !/^\/(?:en|es|pt|ru|ar|zh-cn|fr)\/$/.test(norm)) {
        norm = norm.replace(/\/+$/, '');
      }
      var MATRIX_GROUPS = [
        { en: '/en/', fr: '/fr/', es: '/es/', pt: '/pt/', ru: '/ru/', ar: '/ar/', 'zh-cn': '/zh-cn/' },
        { en: '/en/products', fr: '/fr/products', es: '/es/products', pt: '/pt/products', ru: '/ru/products', ar: '/ar/products', 'zh-cn': '/zh-cn/products' },
        { en: '/en/about', fr: '/fr/about', es: '/es/about', pt: '/pt/about', ru: '/ru/about', ar: '/ar/about', 'zh-cn': '/zh-cn/about' },
        { en: '/en/evidence', fr: '/fr/evidence', es: '/es/evidence', pt: '/pt/evidence', ru: '/ru/evidence', ar: '/ar/evidence', 'zh-cn': '/zh-cn/evidence' },
        { en: '/en/news', fr: '/fr/news', es: '/es/news', pt: '/pt/news', ru: '/ru/news', ar: '/ar/news', 'zh-cn': '/zh-cn/guides/' },
        { en: '/en/contact', fr: '/fr/contact', es: '/es/contacto', pt: '/pt/contato', ru: '/ru/kontakty', ar: '/ar/contact', 'zh-cn': '/zh-cn/contact' },
        { en: '/en/cg-engine', fr: '/fr/cg-engine', es: '/es/motor-cg', pt: '/pt/motor-cg', ru: '/ru/dvigatel-cg', ar: '/ar/cg-engine', 'zh-cn': '/zh-cn/cg-engine' },
        { en: '/en/cb-engine', fr: '/fr/cb-engine', es: '/es/motor-cb', pt: '/pt/motor-cb', ru: '/ru/dvigatel-cb', ar: '/ar/cb-engine', 'zh-cn': '/zh-cn/cb-engine' },
        { en: '/en/horizontal-engine', fr: '/fr/horizontal-engine', es: '/es/motor-horizontal', pt: '/pt/motor-horizontal', ru: '/ru/gorizontalnyj-dvigatel', ar: '/ar/horizontal-engine', 'zh-cn': '/zh-cn/horizontal-engine' },
        { en: '/en/ac320-atv-engine', fr: '/fr/ac320-atv-engine', es: '/es/ac320-atv-engine', pt: '/pt/ac320-atv-engine', ru: '/ru/ac320-atv-engine', ar: '/ar/ac320-atv-engine', 'zh-cn': '/zh-cn/ac320-atv-engine' },
        { en: '/en/engine-parts', fr: '/fr/engine-parts', es: '/es/repuestos-motor', pt: '/pt/pecas-de-motor', ru: '/ru/zapchasti-dvigatelya', ar: '/ar/engine-parts', 'zh-cn': '/zh-cn/engine-parts' },
        { en: '/en/engine-parts/hw-series', fr: '/fr/engine-parts/hw-series', es: '/es/engine-parts/hw-series', pt: '/pt/engine-parts/hw-series', ru: '/ru/engine-parts/hw-series', ar: '/ar/engine-parts/hw-series', 'zh-cn': '/zh-cn/engine-parts/hw-series' },
        { en: '/en/bajaj-tvs-engines-parts', fr: '/fr/bajaj-tvs-engines-parts', es: '/es/bajaj-tvs-engines-parts', pt: '/pt/bajaj-tvs-engines-parts', ru: '/ru/bajaj-tvs-engines-parts', ar: '/ar/bajaj-tvs-engines-parts', 'zh-cn': '/zh-cn/bajaj-tvs-engines-parts' },
        { en: '/en/bajaj-engine-parts', fr: '/fr/bajaj-engine-parts', es: '/es/bajaj-engine-parts', pt: '/pt/bajaj-engine-parts', ru: '/ru/bajaj-engine-parts', ar: '/ar/bajaj-engine-parts', 'zh-cn': '/zh-cn/bajaj-engine-parts' },
        { en: '/en/tvs-engine-parts', fr: '/fr/tvs-engine-parts', es: '/es/tvs-engine-parts', pt: '/pt/tvs-engine-parts', ru: '/ru/tvs-engine-parts', ar: '/ar/tvs-engine-parts', 'zh-cn': '/zh-cn/tvs-engine-parts' }
      ];
      var sharedPrefixes = [
        '/cg-engine/cg150-air-cooled-engine',
        '/cg-engine/cg200-air-cooled-engine',
        '/cg-engine/cg250sb-water-cooled-engine',
        '/cg-engine/hw300-water-cooled-engine',
        '/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine',
        '/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine',
        '/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine',
        '/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine',
        '/bajaj-tvs-engines-parts/tvs-king-200-complete-engine'
      ];
      var activeGroup = null;
      for (var i = 0; i < MATRIX_GROUPS.length; i++) {
        var grp = MATRIX_GROUPS[i];
        var keys = Object.keys(grp);
        for (var j = 0; j < keys.length; j++) {
          var candidate = grp[keys[j]].replace(/\/+$/, '') || '/';
          var testNorm = norm === '/' ? '/' : norm.replace(/\/+$/, '');
          if (grp[keys[j]] === norm || candidate === testNorm) {
            activeGroup = grp;
            break;
          }
        }
        if (activeGroup) break;
      }
      if (!activeGroup) {
        for (var s = 0; s < sharedPrefixes.length; s++) {
          if (norm.indexOf(sharedPrefixes[s]) !== -1) {
            var pfx = sharedPrefixes[s];
            activeGroup = { en: '/en' + pfx, fr: '/fr' + pfx, es: '/es' + pfx, pt: '/pt' + pfx, ru: '/ru' + pfx, ar: '/ar' + pfx, 'zh-cn': '/zh-cn' + pfx };
            break;
          }
        }
      }
      var ALL_LANGS = [
        { key: 'en', hreflang: 'en', label: 'English', fallback: '/en/' },
        { key: 'fr', hreflang: 'fr', label: 'Français', fallback: '/fr/' },
        { key: 'es', hreflang: 'es', label: 'Español', fallback: '/es/' },
        { key: 'pt', hreflang: 'pt', label: 'Português', fallback: '/pt/' },
        { key: 'ru', hreflang: 'ru', label: 'Русский', fallback: '/ru/' },
        { key: 'ar', hreflang: 'ar', label: 'العربية', fallback: '/ar/' },
        { key: 'zh-cn', hreflang: 'zh-CN', label: '简体中文', fallback: '/zh-cn/' }
      ];
      ALL_LANGS.forEach(function(item) {
        var existing = langDropdown.querySelector('a[href^="/' + item.key + '/"], a[href="/' + item.key + '"]');
        var targetHref = (activeGroup && activeGroup[item.key]) ? activeGroup[item.key] : item.fallback;
        if (existing) {
          if (activeGroup && activeGroup[item.key]) existing.setAttribute('href', targetHref);
          return;
        }
        var link = document.createElement('a');
        link.href = targetHref;
        link.setAttribute('hreflang', item.hreflang);
        link.textContent = item.label;
        langDropdown.appendChild(link);
      });
    })();

    if (langCurrent && langDropdown) {
      langCurrent.setAttribute('aria-expanded', 'false');

      langCurrent.addEventListener('click', function(e) {
        e.stopPropagation();
        const willOpen = !langDropdown.classList.contains('show');
        langDropdown.classList.toggle('show', willOpen);
        if (langSwitcher) {
          langSwitcher.classList.toggle('open', willOpen);
        }
        langCurrent.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      langDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
      });

      document.addEventListener('click', function() {
        langDropdown.classList.remove('show');
        if (langSwitcher) {
          langSwitcher.classList.remove('open');
        }
        langCurrent.setAttribute('aria-expanded', 'false');
      });
    }

    // --- Navbar scroll effect ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(255,255,255,0.98)';
          navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
        } else {
          navbar.style.background = '';
          navbar.style.boxShadow = '';
        }
      }, { passive: true });
    }

    // --- Scroll reveal animation ---
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (animatedElements.length > 0) {
      if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

        animatedElements.forEach(function(el) {
          revealObserver.observe(el);
        });
      } else {
        animatedElements.forEach(function(el) {
          el.classList.add('visible');
        });
      }
    }

    // --- Product filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-category]');

    function applyFilter(filter) {
      filterBtns.forEach(function(b) {
        b.classList.remove('active');
        if (b.getAttribute('data-filter') === filter) b.classList.add('active');
      });
      if (!document.querySelector('.filter-btn.active') && filterBtns.length > 0) {
        filterBtns[0].classList.add('active');
      }
      productCards.forEach(function(card) {
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        if (filter === 'all' || !filter || categories.indexOf(filter) !== -1) {
          card.style.display = '';
          setTimeout(function() {
            card.style.opacity = '1';
            card.style.transform = '';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(function() {
            card.style.display = 'none';
          }, 300);
        }
      });
    }

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        applyFilter(btn.getAttribute('data-filter'));
      });
    });

    // Apply filter from URL param on load
    var urlParams = new URLSearchParams(window.location.search);
    var urlFilter = urlParams.get('filter');
    if (urlFilter) applyFilter(urlFilter);

    // --- Counter animation ---
    const counters = document.querySelectorAll('.stat-number[data-count]');

    function animateCounters() {
      counters.forEach(function(counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        const rect = counter.getBoundingClientRect();
        if (rect.top < window.innerHeight && !counter.dataset.animated) {
          counter.dataset.animated = 'true';
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target;
            }
          }

          requestAnimationFrame(update);
        }
      });
    }

    if (counters.length > 0) {
      if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              animateCounters();
              counterObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        counters.forEach(function(counter) {
          counterObserver.observe(counter);
        });
      } else {
        window.addEventListener('scroll', animateCounters, { passive: true });
        animateCounters();
      }
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // --- Active nav link highlight ---
    const normalizeNavPath = function(p) {
      return (p || '/').replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    };
    const currentPath = normalizeNavPath(window.location.pathname);
    document.querySelectorAll('.nav-links > li > a').forEach(function(link) {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      try {
        const linkPath = normalizeNavPath(new URL(href, window.location.href).pathname);
        if (linkPath === currentPath) {
          link.classList.add('active');
        }
      } catch (e) {}
    });

    // --- Lead form submission ---
    const leadFormEndpoint = '/api/contact';
    const whatsappNumber = '8619008225410';
    const turnstileSiteKey = '0x4AAAAAADWB99C8edFaOnai';

    function isRealEndpoint(endpoint) {
      return endpoint && endpoint.indexOf('YOUR_FORM_ID') === -1;
    }

    function shouldOpenWhatsAppFallback(form) {
      return form.getAttribute('data-whatsapp-fallback') !== 'false';
    }

    function openWhatsAppFallback(form) {
      if (!shouldOpenWhatsAppFallback(form)) {
        return false;
      }

      window.open('https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(buildWhatsAppText(form)), '_blank', 'noopener');
      return true;
    }

    function isTurnstileConfigured() {
      return turnstileSiteKey && turnstileSiteKey.indexOf('PASTE_') !== 0;
    }

    function loadTurnstileScript() {
      if (!isTurnstileConfigured() || document.querySelector('script[data-turnstile-script]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-turnstile-script', 'true');
      document.head.appendChild(script);
    }

    function addTurnstileWidget(form) {
      if (!isTurnstileConfigured() || form.querySelector('.cf-turnstile')) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const wrapper = document.createElement('div');
      wrapper.className = 'turnstile-wrap';

      const widget = document.createElement('div');
      widget.className = 'cf-turnstile';
      widget.setAttribute('data-sitekey', turnstileSiteKey);
      widget.setAttribute('data-theme', 'light');
      widget.setAttribute('data-size', 'flexible');
      wrapper.appendChild(widget);

      if (submitBtn && submitBtn.parentNode) {
        submitBtn.parentNode.insertBefore(wrapper, submitBtn);
      } else {
        form.appendChild(wrapper);
      }

      loadTurnstileScript();
    }

    function getFieldValue(form, selectors) {
      for (let i = 0; i < selectors.length; i++) {
        const field = form.querySelector(selectors[i]);
        if (field && field.value.trim()) {
          return field.value.trim();
        }
      }
      return '';
    }

    function setFormStatus(form, message, type) {
      let status = form.querySelector('.form-status');
      if (!status) {
        status = document.createElement('p');
        status.className = 'form-status';
        status.setAttribute('aria-live', 'polite');
        form.appendChild(status);
      }
      status.textContent = message;
      status.classList.toggle('is-error', type === 'error');
      status.classList.toggle('is-success', type === 'success');
    }

    function getFormMessage(form, key, fallback) {
      return form.getAttribute('data-message-' + key) || fallback;
    }

    function addHiddenField(form, name, value) {
      let input = form.querySelector('[name="' + name + '"]');
      if (!input) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        form.appendChild(input);
      }
      input = form.querySelector('[name="' + name + '"]');
      input.value = value;
      input.defaultValue = value;
    }

    function buildWhatsAppText(form) {
      var docLang = (document.documentElement.lang || '').toLowerCase();
      var langKey = docLang.indexOf('zh') === 0 ? 'zh' : docLang.slice(0, 2);
      var LABELS = {
        es: { title: 'Solicitud desde el sitio web de Chixiang', name: 'Nombre', contact: 'Contacto', email: 'Email', country: 'País', company: 'Empresa', product: 'Motor', quantity: 'Cantidad', application: 'Aplicación', message: 'Detalles', page: 'Página' },
        fr: { title: 'Nouvelle demande depuis le site Chixiang', name: 'Nom', contact: 'Contact', email: 'Email', country: 'Pays', company: 'Société', product: 'Produit', quantity: 'Quantité', application: 'Application', message: 'Détails', page: 'Page' },
        pt: { title: 'Nova solicitação pelo site Chixiang', name: 'Nome', contact: 'Contato', email: 'Email', country: 'País', company: 'Empresa', product: 'Motor', quantity: 'Quantidade', application: 'Aplicação', message: 'Detalhes', page: 'Página' },
        ru: { title: 'Новый запрос с сайта Chixiang', name: 'Имя', contact: 'Контакт', email: 'Email', country: 'Страна', company: 'Компания', product: 'Двигатель', quantity: 'Количество', application: 'Применение', message: 'Детали', page: 'Страница' },
        ar: { title: 'استفسار جديد من موقع تشيشيانغ', name: 'الاسم', contact: 'التواصل', email: 'البريد', country: 'البلد', company: 'الشركة', product: 'المحرك', quantity: 'الكمية', application: 'التطبيق', message: 'التفاصيل', page: 'الصفحة' },
        zh: { title: '来自驰翔官网的采购询盘', name: '姓名', contact: '联系方式', email: '邮箱', country: '地区', company: '公司', product: '产品系列', quantity: '数量', application: '用途', message: '需求详情', page: '页面' },
        en: { title: 'New inquiry from Chixiang website', name: 'Name', contact: 'Contact', email: 'Email', country: 'Country', company: 'Company', product: 'Product', quantity: 'Quantity', application: 'Application', message: 'Message', page: 'Page' }
      };
      var labels = LABELS[langKey] || LABELS.en;
      var pairs = [
        [labels.name, getFieldValue(form, ['[name="name"]'])],
        [labels.contact, getFieldValue(form, ['[name="contact"]', '[name="email"]'])],
        [labels.email, getFieldValue(form, ['[name="email"]'])],
        [labels.country, getFieldValue(form, ['[name="country"]'])],
        [labels.company, getFieldValue(form, ['[name="company"]'])],
        [labels.product, getFieldValue(form, ['[name="product_interest"]', '[name="product"]'])],
        [labels.quantity, getFieldValue(form, ['[name="quantity"]'])],
        [labels.application, getFieldValue(form, ['[name="application"]'])],
        [labels.message, getFieldValue(form, ['[name="message"]', '[name="requirements"]'])],
        [labels.page, window.location.href]
      ];
      return [labels.title].concat(
        pairs.filter(function(p) { return p[1]; }).map(function(p) { return p[0] + ': ' + p[1]; })
      ).join('\n');
    }

    var contactForms = Array.prototype.slice.call(document.querySelectorAll('.contact-form form, form.p5-form'));
    document.querySelectorAll('form.contact-form').forEach(function(extraForm) {
      if (contactForms.indexOf(extraForm) === -1) contactForms.push(extraForm);
    });
    contactForms.forEach(function(contactForm) {
      if (contactForm.dataset.chixiangFormInitialized === '1') {
        return;
      }
      contactForm.dataset.chixiangFormInitialized = '1';
      contactForm.setAttribute('method', 'POST');
      if (!isRealEndpoint(contactForm.getAttribute('action'))) {
        contactForm.setAttribute('action', leadFormEndpoint);
      }
      addHiddenField(contactForm, '_subject', 'New Chixiang Motor website inquiry');
      addHiddenField(contactForm, 'page_url', window.location.href);
      addHiddenField(contactForm, 'site_language', (document.documentElement.lang || 'en'));
      addTurnstileWidget(contactForm);

      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = contactForm.querySelector('[name="name"]');
        const email = contactForm.querySelector('[name="email"]');
        const contact = contactForm.querySelector('[name="contact"]');
        const product = contactForm.querySelector('[name="product_interest"], [name="product"]');
        const message = contactForm.querySelector('[name="message"], [name="requirements"]');
        const honeypot = contactForm.querySelector('[name="website"]');

        if (contactForm.dataset.submitting === '1') {
          e.preventDefault();
          return;
        }
        const turnstileToken = contactForm.querySelector('[name="cf-turnstile-response"]');
        let valid = true;

        if (honeypot && honeypot.value.trim()) {
          return;
        }

        [name, contact || email, product].forEach(function(field) {
          if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--accent-red)';
            valid = false;
          } else if (field) {
            field.style.borderColor = '';
          }
        });

        if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          email.style.borderColor = 'var(--accent-red)';
          valid = false;
        }

        if (message && message.value.trim()) {
          const messageText = message.value.toLowerCase();
          const spamPatterns = ['[url=', 'buy cheap', 'viagra', 'casino', 'seo service'];
          for (let i = 0; i < spamPatterns.length; i++) {
            if (messageText.indexOf(spamPatterns[i]) !== -1) {
              message.style.borderColor = 'var(--accent-red)';
              setFormStatus(contactForm, getFormMessage(contactForm, 'spam', 'Please remove promotional or spam-like content from your message.'), 'error');
              valid = false;
              break;
            }
          }
        }

        if (isTurnstileConfigured() && (!turnstileToken || !turnstileToken.value.trim())) {
          setFormStatus(contactForm, getFormMessage(contactForm, 'turnstile', 'Please complete the anti-spam check before sending.'), 'error');
          valid = false;
        }

        if (valid) {
          const submitBtn = contactForm.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.textContent : '';
          let endpoint = contactForm.getAttribute('action') || leadFormEndpoint;
          addHiddenField(contactForm, 'page_url', window.location.href);
          addHiddenField(contactForm, 'site_language', (document.documentElement.lang || 'en'));
          if (!isRealEndpoint(endpoint) && isRealEndpoint(leadFormEndpoint)) {
            endpoint = leadFormEndpoint;
          }

          if (submitBtn) {
            submitBtn.textContent = getFormMessage(contactForm, 'sending', 'Sending...');
            submitBtn.disabled = true;
          }

          if (!isRealEndpoint(endpoint)) {
            if (openWhatsAppFallback(contactForm)) {
              setFormStatus(contactForm, 'Form email service is not configured yet. We opened WhatsApp with your inquiry details.', 'success');
            } else {
              setFormStatus(contactForm, getFormMessage(contactForm, 'fallback', 'The form could not be sent by email.'), 'error');
            }
            if (submitBtn) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            }
            return;
          }

          contactForm.dataset.submitting = '1';
          fetch(endpoint, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
          }).then(function(response) {
            if (!response.ok) {
              throw new Error('Submission failed');
            }
            setFormStatus(contactForm, getFormMessage(contactForm, 'success', 'Thank you. Your inquiry has been sent successfully.'), 'success');
            gtag_report_conversion();
            contactForm.reset();
            if (window.turnstile && typeof window.turnstile.reset === 'function') {
              window.turnstile.reset();
            }
          }).catch(function() {
            const whatsappOpened = openWhatsAppFallback(contactForm);
            setFormStatus(contactForm, getFormMessage(contactForm, 'fallback', whatsappOpened
              ? 'The form could not be sent by email. We opened WhatsApp with your inquiry details.'
              : 'The form could not be sent. Please contact us by email.'), 'error');
          }).finally(function() {
            contactForm.dataset.submitting = '';
            if (submitBtn) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            }
          });
        }
      });
    });
  }

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
