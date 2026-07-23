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
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace(/\/$/, '').split('/').pop())) {
        link.classList.add('active');
      }
    });

    // --- Lead form submission ---
    const leadFormEndpoint = '/api/contact';
    const whatsappNumber = '8619008225410';
    const turnstileSiteKey = '0x4AAAAAADWB99C8edFaOnai';

    function isRealEndpoint(endpoint) {
      return endpoint && endpoint.indexOf('YOUR_FORM_ID') === -1;
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
      const isSpanish = (document.documentElement.lang || '').toLowerCase().indexOf('es') === 0;
      const labels = isSpanish ? {
        title: 'Solicitud desde el sitio web de Chixiang', name: 'Nombre', contact: 'Contacto', email: 'Email', country: 'País', company: 'Empresa', product: 'Motor', quantity: 'Cantidad', application: 'Aplicación', message: 'Detalles', page: 'Página'
      } : {
        title: 'New inquiry from Chixiang website', name: 'Name', contact: 'Contact', email: 'Email', country: 'Country', company: 'Company', product: 'Product', quantity: 'Quantity', application: 'Application', message: 'Message', page: 'Page'
      };
      const lines = [
        labels.title,
        labels.name + ': ' + getFieldValue(form, ['[name="name"]']),
        labels.contact + ': ' + getFieldValue(form, ['[name="contact"]', '[name="email"]']),
        labels.email + ': ' + getFieldValue(form, ['[name="email"]']),
        labels.country + ': ' + getFieldValue(form, ['[name="country"]']),
        labels.company + ': ' + getFieldValue(form, ['[name="company"]']),
        labels.product + ': ' + getFieldValue(form, ['[name="product_interest"]', '[name="product"]']),
        labels.quantity + ': ' + getFieldValue(form, ['[name="quantity"]']),
        labels.application + ': ' + getFieldValue(form, ['[name="application"]']),
        labels.message + ': ' + getFieldValue(form, ['[name="message"]', '[name="requirements"]']),
        labels.page + ': ' + window.location.href
      ];
      return lines.filter(function(line) {
        return line.split(': ').pop();
      }).join('\n');
    }

    document.querySelectorAll('.contact-form form, form.p5-form').forEach(function(contactForm) {
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
          contactForm.dataset.submitting = '1';
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
            window.open('https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(buildWhatsAppText(contactForm)), '_blank', 'noopener');
            setFormStatus(contactForm, 'Form email service is not configured yet. We opened WhatsApp with your inquiry details.', 'success');
            if (submitBtn) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            }
            return;
          }

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
            window.open('https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(buildWhatsAppText(contactForm)), '_blank', 'noopener');
            setFormStatus(contactForm, getFormMessage(contactForm, 'fallback', 'The form could not be sent by email. We opened WhatsApp with your inquiry details.'), 'error');
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
