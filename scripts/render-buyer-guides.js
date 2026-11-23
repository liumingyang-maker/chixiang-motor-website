#!/usr/bin/env node
/**
 * Render all 8 localized Buyer Guides across the 5 non-English export languages
 * (fr, es, pt, ru, ar -> 40 pages) and synchronize the 8 English guide pages
 * (48 canonical Buyer Guide pages total across 6 active export languages).
 *
 * Usage:
 *   node scripts/render-buyer-guides.js
 *   node scripts/render-buyer-guides.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const { officialSameAs } = require('./site-entity-manifest');
const { applyToHtml } = require('./apply-site-entity-schema');
const {
  ORIGIN,
  LANGS,
  HREFLANG_MAP,
  LANG_DISPLAY_NAMES,
  ROUTE_GROUPS,
  LOCALE_CHROME,
  escapeHtml,
  escapeAttr,
  rolePath,
  hreflangTagsHtml,
  langDropdownLinksHtml,
  waHref,
  renderMobileNav,
  renderNavbar,
  renderFooter
} = require('./i18n-matrix');

const root = path.join(__dirname, '..');
const guidesDir = path.join(root, 'data', 'i18n', 'guides');
const checkOnly = process.argv.includes('--check');
const TODAY = '2026-11-23';

const GUIDE_UI = {
  fr: { bcHome: 'Accueil', bcNews: 'Guides', ctaQuoteSuffix: 'Demander un devis' },
  es: { bcHome: 'Inicio', bcNews: 'Guías', ctaQuoteSuffix: 'Solicitar cotización' },
  pt: { bcHome: 'Início', bcNews: 'Guias', ctaQuoteSuffix: 'Solicitar cotação' },
  ru: { bcHome: 'Главная', bcNews: 'Руководства', ctaQuoteSuffix: 'Запросить расчёт' },
  ar: { bcHome: 'الرئيسية', bcNews: 'الأدلة', ctaQuoteSuffix: 'اطلب عرض سعر' }
};

function expandLinks(htmlFragment, lang) {
  return String(htmlFragment || '').replace(/\{([a-z0-9-]+)\}/g, (full, key) => {
    const aliases = {
      hw300: 'hw300-water-cooled-engine',
      cg250sb: 'cg250sb-water-cooled-engine',
      cg200: 'cg200-air-cooled-engine',
      cg150: 'cg150-air-cooled-engine',
      bm150: 'bajaj-boxer-bm150-complete-engine',
      ct100: 'bajaj-boxer-ct100-bm100-complete-engine',
      re4s: 'bajaj-re-4s-200-complete-engine',
      hlx150: 'tvs-hlx-150-complete-engine',
      king200: 'tvs-king-200-complete-engine'
    };
    const role = aliases[key] || key;
    return ROUTE_GROUPS[role] ? rolePath(role, lang) : full;
  });
}

function orgSchemaNode() {
  return {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'CHIXIANG MOTOR',
    legalName: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
    alternateName: 'Chixiang Motor',
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/images/logo.webp`,
    foundingDate: '2007',
    description: 'Motorcycle and cargo-tricycle engine manufacturer in Chongqing, China, with industry experience since 2003.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      addressLocality: 'Chongqing',
      addressCountry: 'CN'
    },
    sameAs: officialSameAs
  };
}

function renderGuideHtml(guide, lang) {
  const loc = guide.locales[lang];
  const ui = GUIDE_UI[lang];
  const chrome = LOCALE_CHROME[lang];
  const slug = guide.slug;
  const canonical = `${ORIGIN}/${lang}/${slug}`;
  const dirAttr = chrome.dir === 'rtl' ? ' dir="rtl"' : '';
  const align = chrome.dir === 'rtl' ? 'right' : 'left';
  const quoteHref = `${rolePath('contact', lang)}?product_interest=${encodeURIComponent(guide.quoteInterest || 'multiple')}&source_form=${encodeURIComponent(slug)}`;
  const waUrl = waHref(lang, guide.waModel || 'CG150 / CG200 / HW300');

  const rtlCss = lang === 'ar'
    ? '\n  <style>\n    body { direction: rtl; }\n    .navbar .container, .nav-logo, .nav-links, .nav-right, .hero-cta, .cta-actions, .footer-bottom { direction: rtl; }\n    .lang-dropdown { left: 0; right: auto; text-align: right; }\n  </style>'
    : '';

  const articleImages = (guide.figures || []).map((f) => `${ORIGIN}${f.src}`);
  if (!articleImages.length) articleImages.push(guide.ogImage);

  const articleLd = {
    '@context': 'https://schema.org',
    '@graph': [
      orgSchemaNode(),
      {
        '@type': ['Article', 'TechArticle'],
        '@id': `${canonical}#article`,
        headline: loc.h1,
        description: loc.description,
        image: articleImages,
        inLanguage: lang,
        author: { '@id': `${ORIGIN}/#organization` },
        publisher: { '@id': `${ORIGIN}/#organization` },
        datePublished: guide.datePublished || '2026-11-19',
        dateModified: TODAY,
        proficiencyLevel: 'Engineering & B2B Procurement',
        mainEntityOfPage: { '@id': `${canonical}#webpage` }
      }
    ]
  };

  const faqLdHtml = loc.faqs && loc.faqs.length
    ? `\n  <script type="application/ld+json">\n${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: loc.faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }, null, 2)}\n  </script>`
    : '';

  const figuresHtml = (guide.figures || []).length
    ? `\n        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;margin:0 0 2rem;">\n${guide.figures.map((fig, idx) => `          <figure style="margin:0;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;overflow:hidden;">\n            <img src="${escapeAttr(fig.src)}" alt="${escapeAttr(fig.alt[lang] || fig.alt.en)}" loading="${idx === 0 ? 'eager' : 'lazy'}" style="width:100%;aspect-ratio:4/3;object-fit:${fig.cover ? 'cover' : 'contain'};background:#f4f6f8;display:block;">\n            <figcaption style="padding:0.85rem 1rem;font-size:0.9rem;color:var(--text-secondary);">${expandLinks(fig.caption[lang], lang)}</figcaption>\n          </figure>`).join('\n')}\n        </div>`
    : '';

  const sectionsHtml = (loc.sections || []).map((sec) => {
    const parts = [];
    parts.push(`        <h2 style="font-size:1.5rem;margin-top:2.25rem;margin-bottom:1rem;">${escapeHtml(sec.heading)}</h2>`);
    for (const p of sec.paragraphs || []) {
      parts.push(`        <p>${expandLinks(p, lang)}</p>`);
    }
    if (sec.table && sec.table.headers && sec.table.rows) {
      const ths = sec.table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
      const trs = sec.table.rows.map((row) => {
        const [first, ...rest] = row;
        return `              <tr><th scope="row">${escapeHtml(first)}</th>${rest.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`;
      }).join('\n');
      parts.push(`        <div class="responsive-table-wrap" tabindex="0" style="margin:1.5rem 0;">
          <table class="specs-table catalog-spec-table">
            <thead><tr>${ths}</tr></thead>
            <tbody>
${trs}
            </tbody>
          </table>
        </div>`);
    }
    for (const sub of sec.subheadings || []) {
      if (sub.h3) parts.push(`        <h3 style="font-size:1.15rem;margin-top:1.5rem;margin-bottom:0.65rem;">${escapeHtml(sub.h3)}</h3>`);
      if (sub.paragraphs) {
        for (const sp of sub.paragraphs) parts.push(`        <p>${expandLinks(sp, lang)}</p>`);
      }
      if (sub.bullets && sub.bullets.length) {
        parts.push(`        <ul style="padding-${align === 'right' ? 'right' : 'left'}:1.35rem;margin:0.75rem 0 1.25rem;">\n${sub.bullets.map((b) => `          <li style="margin-bottom:0.55rem;">${expandLinks(b, lang)}</li>`).join('\n')}\n        </ul>`);
      }
    }
    if (sec.bullets && sec.bullets.length) {
      parts.push(`        <ul style="padding-${align === 'right' ? 'right' : 'left'}:1.35rem;margin:0.75rem 0 1.25rem;">\n${sec.bullets.map((b) => `          <li style="margin-bottom:0.55rem;">${expandLinks(b, lang)}</li>`).join('\n')}\n        </ul>`);
    }
    return parts.join('\n');
  }).join('\n\n');

  const regionalHtml = loc.regionalFieldBox
    ? `\n        <div style="margin:2rem 0;padding:1.35rem 1.5rem;background:var(--bg-secondary);border-radius:10px;border-${align === 'right' ? 'right' : 'left'}:4px solid var(--accent-red);">
          <h2 style="font-size:1.2rem;margin:0 0 0.75rem;">${escapeHtml(loc.regionalFieldBox.title)}</h2>
          <ul style="padding-${align === 'right' ? 'right' : 'left'}:1.25rem;margin:0;">
${loc.regionalFieldBox.items.map((item) => `            <li style="margin-bottom:0.45rem;">${expandLinks(item, lang)}</li>`).join('\n')}
          </ul>
        </div>`
    : '';

  const faqHtml = (loc.faqs || []).length
    ? `\n        <h2 style="font-size:1.5rem;margin-top:2.25rem;margin-bottom:1rem;">${escapeHtml(loc.faqTitle || 'FAQ')}</h2>\n${loc.faqs.map((item, idx) => `        <h3 style="font-size:1.1rem;margin-top:1.25rem;margin-bottom:0.4rem;">${idx + 1}. ${escapeHtml(item.q)}</h3>\n        <p>${expandLinks(item.a, lang)}</p>`).join('\n')}`
    : '';

  const ctaBoxHtml = loc.ctaCard
    ? `\n        <div style="margin-top:2.5rem;padding:1.75rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;">
          <h3 style="margin:0 0 0.65rem;">${escapeHtml(loc.ctaCard.title)}</h3>
          <p style="margin:0 0 1.25rem;color:var(--text-secondary);">${expandLinks(loc.ctaCard.body, lang)}</p>
          <div class="cta-actions" style="justify-content:flex-start;">
            <a href="${escapeAttr(quoteHref)}" class="btn btn-accent">${escapeHtml(loc.ctaCard.primaryBtn || ui.ctaQuoteSuffix)}</a>
            <a href="${escapeAttr(waUrl)}" class="btn btn-primary" target="_blank" rel="noopener">${escapeHtml(chrome.waLabel)}</a>
            <a href="${rolePath('evidence', lang)}" class="btn btn-outline">${escapeHtml(loc.ctaCard.secondaryBtn || chrome.nav.evidence)}</a>
          </div>
        </div>`
    : '';

  const rawHtml = `<!DOCTYPE html>
<html lang="${lang}"${dirAttr}>
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16777656395"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-16777656395');
  </script>
  <meta charset="UTF-8">
  <script type="text/javascript">(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109483511,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
  <noscript><div><img src="https://mc.yandex.ru/watch/109483511" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(loc.title)}</title>
  <meta name="description" content="${escapeAttr(loc.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#cc0000">
  <link rel="canonical" href="${canonical}">
${hreflangTagsHtml(slug, '  ')}
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="CHIXIANG MOTOR">
  <meta property="og:title" content="${escapeAttr(loc.h1)}">
  <meta property="og:description" content="${escapeAttr(loc.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeAttr(guide.ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/css/style.css?v=20261119-hero">${rtlCss}
  <script type="application/ld+json">
${JSON.stringify(articleLd, null, 2)}
  </script>${faqLdHtml}
</head>
<body>
${renderMobileNav(lang, slug, quoteHref)}
${renderNavbar(lang, slug, 'news', quoteHref)}
  <main>
    <section class="page-header">
      <div class="container">
        <nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb"><a href="/${lang}/">${escapeHtml(ui.bcHome)}</a><span aria-hidden="true">/</span><a href="/${lang}/news">${escapeHtml(ui.bcNews)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(loc.h1)}</span></nav>
        <h1>${escapeHtml(loc.h1)}</h1>
        <p style="color:var(--text-secondary);margin-top:0.5rem;">${escapeHtml(loc.metaLine)}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <article class="article-content" style="max-width:860px;margin:0 auto;font-size:1.05rem;line-height:1.85;color:var(--text-primary);text-align:${align};">
          <div class="hw-ai-capsule" style="margin-top:0;margin-bottom:2rem;">
            <p style="font-size:0.85rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--accent-red);margin-bottom:0.4rem;">${escapeHtml(loc.verdictLabel)}</p>
            <p style="margin:0;color:var(--text-primary);">${expandLinks(loc.verdictHtml, lang)}</p>
          </div>${figuresHtml}

${sectionsHtml}
${regionalHtml}
${faqHtml}
${ctaBoxHtml}
        </article>
      </div>
    </section>
  </main>
${renderFooter(lang, waUrl, quoteHref)}
</body>
</html>
`;
  return applyToHtml(rawHtml, canonical).replace(/\r?\n/g, '\r\n');
}

function syncEnglishGuidePage(slug) {
  const filePath = path.join(root, 'en', `${slug}.html`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const hrefBlock = hreflangTagsHtml(slug, '  ');
  let next = raw.replace(/[ \t]*<link\s+rel=["']alternate["'][^>]*>\r?\n?/gi, '');
  next = next.replace(/(<link\s+rel=["']canonical["'][^>]*>\r?\n?)/i, `$1${hrefBlock}\n`);
  const ddLinks = langDropdownLinksHtml(slug, 'en', '            ');
  next = next.replace(/(<div class="lang-dropdown">)[\s\S]*?(<\/div>)/, `$1\n${ddLinks}\n          $2`);
  const mobileLangLinks = LANGS.filter((l) => ROUTE_GROUPS[slug] && ROUTE_GROUPS[slug][l])
    .map((l) => `<a href="${ROUTE_GROUPS[slug][l]}" hreflang="${HREFLANG_MAP[l]}">${LANG_DISPLAY_NAMES[l]}</a>`)
    .join('');
  next = next.replace(/(<div class="mobile-nav-langs">)[\s\S]*?(<\/div>)/, `$1${mobileLangLinks}$2`);
  next = applyToHtml(next, `${ORIGIN}/en/${slug}`);
  return next.replace(/\r?\n/g, nl);
}

function main() {
  const guideFiles = fs.readdirSync(guidesDir).filter((f) => f.endsWith('.json')).sort();
  const changes = [];

  for (const gf of guideFiles) {
    const guide = JSON.parse(fs.readFileSync(path.join(guidesDir, gf), 'utf8'));
    const enNext = syncEnglishGuidePage(guide.slug);
    const enAbs = path.join(root, 'en', `${guide.slug}.html`);
    const enCur = fs.readFileSync(enAbs, 'utf8');
    if (enCur !== enNext) {
      changes.push(`en/${guide.slug}.html`);
      if (!checkOnly) fs.writeFileSync(enAbs, enNext, 'utf8');
    }

    for (const lang of ['fr', 'es', 'pt', 'ru', 'ar']) {
      if (!guide.locales || !guide.locales[lang]) {
        throw new Error(`Guide ${guide.slug} missing locale ${lang}`);
      }
      const nextHtml = renderGuideHtml(guide, lang);
      const abs = path.join(root, lang, `${guide.slug}.html`);
      const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
      if (cur !== nextHtml) {
        changes.push(`${lang}/${guide.slug}.html`);
        if (!checkOnly) {
          fs.mkdirSync(path.dirname(abs), { recursive: true });
          fs.writeFileSync(abs, nextHtml, 'utf8');
        }
      }
    }
  }

  if (checkOnly) {
    for (const c of changes) console.log(`STALE ${c}`);
    console.log(`${changes.length} buyer guide files need updates.`);
    process.exit(changes.length ? 1 : 0);
  }
  console.log(`${changes.length} buyer guide files updated.`);
}

main();
