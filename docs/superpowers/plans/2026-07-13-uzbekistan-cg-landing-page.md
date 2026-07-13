# Uzbekistan CG Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Russian Google Ads landing page for Uzbekistan that accurately presents CG air-cooled, CG water-cooled, and CG heavy-duty water-cooled engines and converts visitors through WhatsApp and the existing inquiry form.

**Architecture:** Add one static Russian HTML page, one page-scoped stylesheet, and one page-scoped carousel script. Reuse the existing shared navigation, contact form pipeline, Google Ads form conversion, and delegated WhatsApp conversion in `js/main.js`. Add Node contract tests and a browser preview checkpoint before any production push.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, existing Cloudflare Pages deployment.

---

## File map

- Create `ru/dvigateli-dlya-uzbekistana.html`: Russian metadata, semantic landing-page content, product galleries, FAQ schema, WhatsApp links, and inquiry form.
- Create `css/uzbekistan-landing.css`: page-scoped industrial design, responsive layout, accessibility states, gallery presentation, and mobile sticky CTA.
- Create `js/uzbekistan-landing.js`: accessible carousel behavior only; it must not duplicate analytics or form submission logic.
- Create `tests/uzbekistan-landing.test.js`: content, SEO, product-claim, asset, anchor, and sitemap contract tests.
- Create `tests/uzbekistan-carousel.test.js`: carousel control, pause, reduced-motion, failure handling, and graceful-degradation tests.
- Modify `sitemap.xml`: add the production URL.

## Task 1: Landing-page content contract

**Files:**
- Create: `tests/uzbekistan-landing.test.js`
- Create: `ru/dvigateli-dlya-uzbekistana.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Write the failing page contract test**

Create a Node test that reads the planned page, CSS, JavaScript, sitemap, and image files. The contract must include these exact assertions:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'ru', 'dvigateli-dlya-uzbekistana.html');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('publishes the Uzbekistan landing-page contract', () => {
  assert.ok(fs.existsSync(pagePath));
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /<html lang="ru"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="cg-engines"/);
  assert.match(html, /id="cg-heavy-duty"/);
  assert.match(html, /CG 150[–-]250/);
  assert.match(html, /CG 200[–-]350/);
  assert.match(html, /Опционально со встроенным реверсом/);
  assert.match(html, /Без встроенного реверса/);
  assert.doesNotMatch(html, /HW Heavy-Duty/);
  assert.match(html, /href="https:\/\/wa\.me\/8619008225410\?text=/);
  assert.match(html, /<form[^>]+id="contactForm"[^>]+action="\/api\/contact"/);
  assert.match(html, /\.\.\/js\/main\.js/);
  assert.match(html, /\.\.\/js\/uzbekistan-landing\.js/);
  assert.match(html, /\.\.\/css\/uzbekistan-landing\.css/);
  assert.match(html, /FAQPage/);
  assert.match(html, /rel="canonical" href="https:\/\/chixiangmotor\.com\/ru\/dvigateli-dlya-uzbekistana\.html"/);
});

test('registers the production URL in the sitemap', () => {
  assert.match(read('sitemap.xml'), /https:\/\/chixiangmotor\.com\/ru\/dvigateli-dlya-uzbekistana\.html/);
});

test('references only existing local product assets', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const sources = [...html.matchAll(/<img[^>]+src="\.\.\/images\/([^"]+)"/g)]
    .map(match => decodeURIComponent(match[1]));
  assert.ok(sources.length >= 10);
  for (const source of sources) {
    assert.ok(fs.existsSync(path.join(root, 'images', source)), source);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails because the page is missing**

Run:

```powershell
node --test tests/uzbekistan-landing.test.js
```

Expected: FAIL at `assert.ok(fs.existsSync(pagePath))`.

- [ ] **Step 3: Create the semantic Russian page**

The page must use this document structure and exact public product naming:

```html
<!DOCTYPE html>
<html lang="ru" dir="ltr">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','AW-16777656395');</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Двигатели CG для Узбекистана | 150–350 см³ | Chixiang Motor</title>
  <meta name="description" content="Двигатели CG 150–250 см³ и усиленные водяные двигатели CG 200–350 см³ для мотоциклов и грузовых трициклов в Узбекистане. Опт, OEM/ODM и экспортная поддержка.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://chixiangmotor.com/ru/dvigateli-dlya-uzbekistana.html">
  <link rel="stylesheet" href="../css/style.css?v=20260527-bg">
  <link rel="stylesheet" href="../css/uzbekistan-landing.css?v=20260713">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Как выбрать двигатель CG?","acceptedAnswer":{"@type":"Answer","text":"Сообщите модель транспорта, нагрузку, объём двигателя и количество. Мы предложим подходящую серию."}}]}</script>
</head>
<body class="uz-landing">
  <nav class="navbar"><div class="container"><a href="index.html" class="nav-logo">CHIXIANG MOTOR</a><a href="https://wa.me/8619008225410" class="btn btn-whatsapp">WhatsApp</a></div></nav>
  <main>
    <section class="uz-hero" aria-labelledby="uz-main-title">
      <p class="uz-eyebrow">Производитель двигателей с 2003 года</p>
      <h1 id="uz-main-title">Двигатели CG для мотоциклов и грузовых трициклов в Узбекистане</h1>
      <p>CG 150–250 см³ с воздушным и водяным охлаждением и усиленные водяные двигатели CG 200–350 см³.</p>
      <a class="btn btn-whatsapp" href="https://wa.me/8619008225410?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%9C%D0%B5%D0%BD%D1%8F%20%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D1%8E%D1%82%20%D0%B4%D0%B2%D0%B8%D0%B3%D0%B0%D1%82%D0%B5%D0%BB%D0%B8%20CG%20%D0%B4%D0%BB%D1%8F%20%D0%A3%D0%B7%D0%B1%D0%B5%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD%D0%B0.">Получить цену в WhatsApp</a>
      <a class="uz-secondary-link" href="#cg-engines">Выбрать двигатель</a>
    </section>
    <section class="uz-applications" aria-labelledby="applications-title"><h2 id="applications-title">Какой двигатель вам нужен?</h2><article><h3>Мотоциклы</h3><p>Замена двигателя и ежедневная эксплуатация.</p></article><article><h3>Грузовые трициклы</h3><p>Стабильная работа при перевозке грузов.</p></article><article><h3>Тяжёлые условия</h3><p>Длительная нагрузка, подъёмы и высокая температура.</p></article></section>
    <section id="cg-engines" class="uz-products" aria-labelledby="cg-title">
      <h2 id="cg-title">Двигатели CG 150–250 см³</h2>
      <article aria-labelledby="cg-air-title"><h3 id="cg-air-title">CG с воздушным охлаждением 150–250 см³</h3><p>Простая конструкция, доступные запчасти и удобное обслуживание.</p></article>
      <article aria-labelledby="cg-water-title">
        <h3 id="cg-water-title">CG с водяным охлаждением 150–250 см³</h3>
        <span>Опционально со встроенным реверсом</span>
      </article>
    </section>
    <section id="cg-heavy-duty" class="uz-heavy" aria-labelledby="heavy-title">
      <h2 id="heavy-title">Усиленные водяные двигатели CG 200–350 см³</h2>
      <span>Без встроенного реверса</span>
      <ul><li>20-роликовое сцепление</li><li>18-полюсный магнето</li><li>Объём масла 1,5 л</li></ul>
    </section>
    <section class="uz-comparison" aria-labelledby="comparison-title"><h2 id="comparison-title">Сравнение серий</h2><div class="uz-comparison-scroll"><table><thead><tr><th>Серия</th><th>Объём</th><th>Охлаждение</th><th>Реверс</th></tr></thead><tbody><tr><td>CG Air</td><td>150–250 см³</td><td>Воздушное</td><td>По модели</td></tr><tr><td>CG Water</td><td>150–250 см³</td><td>Водяное</td><td>Опция</td></tr><tr><td>CG Heavy</td><td>200–350 см³</td><td>Водяное</td><td>Нет</td></tr></tbody></table></div></section>
    <section class="uz-process" aria-labelledby="process-title"><h2 id="process-title">От запроса до поставки</h2><ol><li>Отправьте модель, объём и количество.</li><li>Получите подбор и цену.</li><li>Подтвердите OEM, упаковку и заказ.</li><li>Производство, контроль и отправка.</li></ol></section>
    <section class="uz-trust" aria-labelledby="trust-title"><h2 id="trust-title">Почему Chixiang Motor</h2><ul><li>Производство двигателей с 2003 года.</li><li>Контроль ключевых узлов и готовых двигателей.</li><li>OEM/ODM и экспортная поддержка.</li></ul></section>
    <section class="uz-faq" aria-labelledby="faq-title"><h2 id="faq-title">Частые вопросы</h2><details><summary>Как выбрать серию?</summary><p>Сообщите транспорт, нагрузку, объём и количество.</p></details><details><summary>Есть ли встроенный реверс?</summary><p>Для CG Water реверс доступен опционально; CG Heavy поставляется без встроенного реверса.</p></details><details><summary>Доступен ли OEM?</summary><p>Да, параметры OEM/ODM обсуждаются для оптовых заказов.</p></details></section>
    <section class="uz-inquiry" aria-labelledby="inquiry-title">
      <h2 id="inquiry-title">Получить оптовое предложение</h2><form id="contactForm" class="contact-form" method="POST" action="/api/contact"><div aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><label for="name">Имя / Компания</label><input id="name" name="name" required><label for="email">Email</label><input id="email" name="email" type="email"><label for="contact">WhatsApp</label><input id="contact" name="contact"><label for="product_interest">Серия</label><select id="product_interest" name="product_interest"><option value="cg-air">CG Air 150–250</option><option value="cg-water">CG Water 150–250</option><option value="cg-heavy">CG Heavy 200–350</option></select><label for="message">Количество и требования</label><textarea id="message" name="message" required></textarea><button type="submit" class="btn btn-primary">Получить предложение</button></form>
    </section>
  </main>
  <footer class="footer"><div class="container"><strong>CHIXIANG MOTOR</strong><a href="kontakty.html">Контакты</a></div></footer>
  <a class="uz-mobile-whatsapp" href="https://wa.me/8619008225410?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%9C%D0%B5%D0%BD%D1%8F%20%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D1%8E%D1%82%20%D0%B4%D0%B2%D0%B8%D0%B3%D0%B0%D1%82%D0%B5%D0%BB%D0%B8%20CG.">WhatsApp · Получить цену</a>
  <script src="../js/main.js"></script>
  <script src="../js/uzbekistan-landing.js"></script>
</body>
</html>
```

Expand the compact markup into the approved visual composition without changing the shown product claims or the existing contact-form field names.

- [ ] **Step 4: Add the sitemap entry before `</urlset>`**

```xml
  <url>
    <loc>https://chixiangmotor.com/ru/dvigateli-dlya-uzbekistana.html</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
```

- [ ] **Step 5: Run the content test**

Run `node --test tests/uzbekistan-landing.test.js`.

Expected: all Task 1 content, asset, and sitemap assertions PASS.

- [ ] **Step 6: Commit the content contract and page**

```powershell
git add tests/uzbekistan-landing.test.js ru/dvigateli-dlya-uzbekistana.html sitemap.xml
git commit -m "feat: add Uzbekistan CG landing page content"
```

## Task 2: Responsive industrial visual system

**Files:**
- Create: `css/uzbekistan-landing.css`
- Modify: `tests/uzbekistan-landing.test.js`

- [ ] **Step 1: Add failing stylesheet contract assertions**

```js
test('defines responsive and accessible page-scoped styles', () => {
  const css = read('css/uzbekistan-landing.css');
  assert.match(css, /\.uz-product-row/);
  assert.match(css, /@media\s*\(max-width:\s*680px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /scroll-margin-top/);
  assert.match(css, /overflow-x:\s*auto/);
}
```

- [ ] **Step 2: Run the test and verify the missing stylesheet failure**

Run `node --test tests/uzbekistan-landing.test.js`.

Expected: FAIL reading `css/uzbekistan-landing.css`.

- [ ] **Step 3: Create page-scoped CSS**

Implement these core layout contracts, followed by the complete approved styles for hero, trust strip, applications, comparison, process, FAQ, form, footer, and sticky mobile CTA:

```css
.uz-landing {
  --uz-ink: #122036;
  --uz-blue: #1754d8;
  --uz-blue-soft: #edf4ff;
  --uz-green: #16a34a;
  --uz-line: #dfe6ef;
  --uz-muted: #617087;
  --uz-surface: #f5f7fa;
  color: var(--uz-ink);
}

.uz-product-row {
  display: grid;
  grid-template-columns: minmax(0, .96fr) minmax(0, 1.04fr);
  min-height: 430px;
  overflow: hidden;
  border: 1px solid var(--uz-line);
  border-radius: 16px;
  background: #fff;
}

.uz-product-gallery {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #fff;
}

.uz-product-gallery img {
  position: absolute;
  inset: 7% 7% 11%;
  width: 86%;
  height: 82%;
  object-fit: contain;
  opacity: 0;
  transition: opacity .45s ease;
}

.uz-product-gallery img.is-active { opacity: 1; }
.uz-carousel-button { min-width: 44px; min-height: 44px; }
.uz-anchor-section { scroll-margin-top: 92px; }
.uz-comparison-scroll { overflow-x: auto; }

@media (max-width: 680px) {
  .uz-product-row { grid-template-columns: 1fr; min-height: 0; }
  .uz-product-gallery { min-height: 285px; }
}

@media (prefers-reduced-motion: reduce) {
  .uz-product-gallery img { transition: none; }
}
```

Use a pure-white gallery stage so the source images' white backgrounds disappear visually. Keep product images uncropped. Alternate gallery/content order on wide screens and normalize order on phones.

- [ ] **Step 4: Run the page tests**

Run `node --test tests/uzbekistan-landing.test.js`.

Expected: PASS for content, sitemap, assets, and stylesheet contracts except JavaScript behavior not yet implemented.

- [ ] **Step 5: Commit the responsive visual system**

```powershell
git add css/uzbekistan-landing.css tests/uzbekistan-landing.test.js
git commit -m "style: add responsive Uzbekistan landing design"
```

## Task 3: Accessible product carousels

**Files:**
- Create: `js/uzbekistan-landing.js`
- Create: `tests/uzbekistan-carousel.test.js`

- [ ] **Step 1: Write failing carousel behavior tests**

Test the public module contract rather than animation timing:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'uzbekistan-landing.js'), 'utf8');

test('exports the carousel initializer for deterministic testing', () => {
  const context = { window: {}, document: { querySelectorAll() { return []; } }, console };
  vm.runInNewContext(source, context);
  assert.equal(typeof context.window.ChixiangUzLanding.initCarousels, 'function');
});

test('contains pause and accessibility guards', () => {
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /mouseenter/);
  assert.match(source, /focusin/);
  assert.match(source, /touchstart/);
  assert.match(source, /error/);
});
```

- [ ] **Step 2: Run the test and verify the script is missing**

Run `node --test tests/uzbekistan-carousel.test.js`.

Expected: FAIL with `ENOENT` for `js/uzbekistan-landing.js`.

- [ ] **Step 3: Implement the carousel module**

Use this public structure and implement `createCarousel` with image filtering, dot creation, previous/next controls, counter updates, a 6000ms interval, IntersectionObserver, page visibility, user-interaction pause, and single-image control hiding:

```js
(function(window, document) {
  'use strict';

  function initCarousels() {
    document.querySelectorAll('[data-uz-carousel]').forEach(createCarousel);
  }

  function createCarousel(gallery) {
    const images = Array.from(gallery.querySelectorAll('img'));
    const previous = gallery.querySelector('[data-carousel-prev]');
    const next = gallery.querySelector('[data-carousel-next]');
    const dots = gallery.querySelector('[data-carousel-dots]');
    const counter = gallery.querySelector('[data-carousel-counter]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeImages = images.slice();
    let index = 0;
    let timer = null;
    let visible = true;
    let userPaused = false;

    activeImages.forEach(function(image, imageIndex) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Показать изображение ' + (imageIndex + 1));
      dot.addEventListener('click', function() { show(imageIndex); pauseForUser(); });
      dots.appendChild(dot);
    });

    function show(target) {
      if (!activeImages.length) return;
      index = (target + activeImages.length) % activeImages.length;
      activeImages.forEach(function(image, imageIndex) {
        const active = imageIndex === index;
        image.classList.toggle('is-active', active);
        image.setAttribute('aria-hidden', active ? 'false' : 'true');
        dots.children[imageIndex].classList.toggle('is-active', active);
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
      timer = window.setInterval(function() { show(index + 1); }, Number(gallery.dataset.delay || 6000));
    }
    function pauseForUser() { userPaused = true; stop(); }
    function removeFailedImage(image) {
      const failedIndex = activeImages.indexOf(image);
      if (failedIndex === -1) return;
      activeImages.splice(failedIndex, 1);
      if (dots.children[failedIndex]) dots.children[failedIndex].remove();
      image.remove();
      index = Math.min(index, Math.max(activeImages.length - 1, 0));
      const single = activeImages.length < 2;
      previous.hidden = single;
      next.hidden = single;
      dots.hidden = single;
      show(index);
      play();
    }

    previous.addEventListener('click', function() { show(index - 1); pauseForUser(); });
    next.addEventListener('click', function() { show(index + 1); pauseForUser(); });
    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', play);
    gallery.addEventListener('focusin', pauseForUser);
    gallery.addEventListener('touchstart', pauseForUser, { passive: true });
    images.forEach(function(image) { image.addEventListener('error', function() { removeFailedImage(image); }); });
    document.addEventListener('visibilitychange', function() { document.hidden ? stop() : play(); });
    new IntersectionObserver(function(entries) { visible = entries[0].isIntersecting; visible ? play() : stop(); }).observe(gallery);
    show(0);
    play();
  }

  window.ChixiangUzLanding = { initCarousels };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCarousels);
  else initCarousels();
})(window, document);
```

- [ ] **Step 4: Run carousel and full tests**

```powershell
node --test tests/uzbekistan-carousel.test.js
node --test tests/*.test.js
```

Expected: all tests PASS, including the existing WhatsApp conversion tests.

- [ ] **Step 5: Commit carousel behavior**

```powershell
git add js/uzbekistan-landing.js tests/uzbekistan-carousel.test.js
git commit -m "feat: add accessible engine galleries"
```

## Task 4: Local preview and browser QA

**Files:**
- Modify only if QA reveals defects: `ru/dvigateli-dlya-uzbekistana.html`, `css/uzbekistan-landing.css`, `js/uzbekistan-landing.js`, or their tests.

- [ ] **Step 1: Start the existing static preview server**

Run the repository's supported static server configuration, preferring the existing `serve.json`. If no project command exists, run:

```powershell
npx --yes serve . -c serve.json -l 4173
```

Expected: the preview is available at `http://localhost:4173/ru/dvigateli-dlya-uzbekistana.html`.

- [ ] **Step 2: Check desktop, tablet, and phone layouts**

Inspect at 1440×900, 768×1024, and 375×812. Confirm no page-level horizontal overflow, full product visibility, white gallery stages, correct alternating layout, and a non-obscuring mobile WhatsApp CTA.

- [ ] **Step 3: Check interaction and conversion paths**

Confirm arrows, dots, counter, six-second autoplay, offscreen pause, background-tab pause, user pause, reduced motion, anchored navigation, WhatsApp prefilled messages, and form validation. Do not submit a production inquiry during local QA.

- [ ] **Step 4: Fix observed defects with regression tests**

For every defect, add or tighten the relevant Node test first, verify failure, apply the smallest fix, and rerun the full suite.

- [ ] **Step 5: Commit preview fixes**

```powershell
git add ru/dvigateli-dlya-uzbekistana.html css/uzbekistan-landing.css js/uzbekistan-landing.js tests sitemap.xml
git commit -m "fix: polish Uzbekistan landing preview"
```

Skip this commit if QA required no changes.

## Task 5: User approval, deployment, and live verification

**Files:** No new source files unless live verification exposes a defect.

- [ ] **Step 1: Present the local preview and stop before production changes**

Give the user the local preview URL and request explicit approval. Do not merge, push, or deploy before approval.

- [ ] **Step 2: After approval, merge the isolated branch into local `main`**

Verify the main worktree is clean apart from known commits, merge without destructive reset, and rerun:

```powershell
node --test tests/*.test.js
git diff --check HEAD^ HEAD
```

Expected: all tests PASS and diff check is clean.

- [ ] **Step 3: Push `main` to GitHub**

```powershell
git push origin main
```

Expected: `origin/main` advances to the local `main` commit and triggers the existing Cloudflare Pages deployment.

- [ ] **Step 4: Verify the live deployment**

Confirm:

- `https://chixiangmotor.com/ru/dvigateli-dlya-uzbekistana.html` returns 200.
- Canonical, Russian title, one H1, FAQ schema, product claims, anchors, CSS, JavaScript, and images are present.
- `sitemap.xml` contains the URL.
- The common script still contains `AW-16777656395/bovKCKOx088cEMvwmsA-` and `AW-16777656395/Om_nCMCV4swcEMvwmsA-` exactly once each.
- A WhatsApp link opens with a Russian prefilled series message; do not send a message.
- The form renders and validates; do not send a live test inquiry without separate authorization.

- [ ] **Step 5: Report the production URL and commit**

Include the live URL, final commit hash, test totals, viewport checks, and any remaining Google Ads follow-up such as updating the final URL after the landing page is approved.
