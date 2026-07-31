const fs = require('node:fs');
const path = require('node:path');
const { routes, products, locales } = require('./contact-procurement-owner-manifest');

const root = path.join(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const START = '<!-- CONTACT PROCUREMENT OWNER START -->';
const END = '<!-- CONTACT PROCUREMENT OWNER END -->';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceOwnerRegion(html, rendered, file) {
  const existing = new RegExp(`${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`);
  if (existing.test(html)) return html.replace(existing, rendered);

  const firstSection = html.indexOf('<section class="page-header"');
  const footer = html.indexOf('<footer class="footer"');
  if (firstSection < 0 || footer < 0 || footer <= firstSection) {
    throw new Error(`${file}: Contact owner boundaries not found`);
  }
  return `${html.slice(0, firstSection)}${rendered}\n\n  ${html.slice(footer)}`;
}

function renderInput(route, l, name, required, type = 'text') {
  const requiredLabel = required ? ' <span class="required">*</span>' : '';
  const requiredAttribute = required ? ' required' : '';
  return `<div class="form-group">
              <label for="${route.language}-${name}">${escapeHtml(l.fields[name])}${requiredLabel}</label>
              <input type="${type}" id="${route.language}-${name}" name="${name}" placeholder="${escapeHtml(l.placeholders[name])}"${requiredAttribute}>
            </div>`;
}

function renderOwnerLinks(language, l) {
  return `<nav class="contact-owner-links" aria-label="${escapeHtml(l.productLinksLabel)}">
          ${products.filter(product => product.owner).map(product =>
            `<a href="${product.owner[language]}">${escapeHtml(l.products[product.value])}</a>`
          ).join('\n          ')}
        </nav>`;
}

function renderChannels(l) {
  const channelHtml = {
    email: `<a data-contact-channel="email" href="mailto:chixiangmotor@163.com"><strong>${escapeHtml(l.channels.email)}</strong><span>chixiangmotor@163.com</span></a>`,
    wechat: `<div class="contact-channel" data-contact-channel="wechat"><strong>${escapeHtml(l.channels.wechat)}</strong><img src="../images/%E8%81%94%E7%B3%BB%E6%96%B9%E5%BC%8F/wechat.webp" alt="${escapeHtml(l.wechatQrAlt)}" width="90" height="90" loading="lazy" decoding="async"></div>`,
    whatsapp: `<a data-contact-channel="whatsapp" href="https://wa.me/8619008225410" target="_blank" rel="noopener"><strong>${escapeHtml(l.channels.whatsapp)}</strong><span>+86 19008225410</span></a>`,
    phone: `<a data-contact-channel="phone" href="tel:+8619008225410"><strong>${escapeHtml(l.channels.phone)}</strong><span>+86 19008225410</span></a>`
  };
  return l.channelOrder.map(channel => channelHtml[channel]).join('\n          ');
}

function renderOwner(route, l) {
  const option = (value, label) => `<option value="${value}">${escapeHtml(label)}</option>`;
  return `${START}
  <section class="page-header" data-contact-procurement-owner="${route.language}">
    <div class="container">
      <nav class="breadcrumb entity-breadcrumb" aria-label="${escapeHtml(l.breadcrumbLabel)}"><a href="/${route.language}/">${escapeHtml(l.home)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(l.h1)}</span></nav>
      <h1>${escapeHtml(l.h1)}</h1>
      <p class="section-subtitle">${escapeHtml(l.pageLead)}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="contact-layout">
        <div class="contact-owner-summary">
          <h2>${escapeHtml(l.procurementHeading)}</h2>
          <p>${escapeHtml(l.procurementIntro)}</p>
          <h3>${escapeHtml(l.checklistHeading)}</h3>
          <ul class="procurement-checklist">
            ${l.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>
          ${renderOwnerLinks(route.language, l)}
          <h3>${escapeHtml(l.channelHeading)}</h3>
          <!-- CONTACT CHANNEL LIST START -->
          <div class="contact-channel-list" data-contact-channel-list>
          ${renderChannels(l)}
          </div>
          <!-- CONTACT CHANNEL LIST END -->
        </div>

        <div class="contact-form" id="procurement-form">
          <h2>${escapeHtml(l.formHeading)}</h2>
          <p class="contact-form-intro">${escapeHtml(l.formLead)}</p>
          <form method="POST" action="/api/contact"
            data-whatsapp-fallback="false"
            data-message-sending="${escapeHtml(l.messages.sending)}"
            data-message-success="${escapeHtml(l.messages.success)}"
            data-message-validation="${escapeHtml(l.messages.validation)}"
            data-message-turnstile="${escapeHtml(l.messages.turnstile)}"
            data-message-spam="${escapeHtml(l.messages.spam)}"
            data-message-fallback="${escapeHtml(l.messages.fallback)}">
            <div class="contact-honeypot" aria-hidden="true">
              <label for="${route.language}-website">Website</label>
              <input type="text" id="${route.language}-website" name="website" tabindex="-1" autocomplete="off">
            </div>
            ${renderInput(route, l, 'name', true)}
            ${renderInput(route, l, 'company', true)}
            ${renderInput(route, l, 'contact', true)}
            ${renderInput(route, l, 'email', false, 'email')}
            ${renderInput(route, l, 'country', true)}
            <div class="form-group">
              <label for="${route.language}-product">${escapeHtml(l.fields.product)} <span class="required">*</span></label>
              <select id="${route.language}-product" name="product_interest" required>
                <option value="">${escapeHtml(l.selectProduct)}</option>
                ${option('horizontal', l.products.horizontal)}
                ${option('cg', l.products.cg)}
                ${option('cb', l.products.cb)}
                ${option('parts', l.products.parts)}
                ${option('multiple', l.products.multiple)}
              </select>
            </div>
            ${renderInput(route, l, 'quantity', true)}
            <div class="form-group">
              <label for="${route.language}-application">${escapeHtml(l.fields.application)} <span class="required">*</span></label>
              <select id="${route.language}-application" name="application" required>
                <option value="">${escapeHtml(l.selectApplication)}</option>
                ${option('motorcycle', l.applications.motorcycle)}
                ${option('cargo-tricycle', l.applications.cargoTricycle)}
                ${option('atv-offroad', l.applications.atvOffroad)}
                ${option('replacement', l.applications.replacement)}
                ${option('assembly', l.applications.assembly)}
                ${option('other', l.applications.other)}
              </select>
            </div>
            <div class="form-group">
              <label for="${route.language}-requirements">${escapeHtml(l.fields.requirements)}</label>
              <textarea id="${route.language}-requirements" name="requirements" rows="5" placeholder="${escapeHtml(l.placeholders.requirements)}"></textarea>
            </div>
            <input type="hidden" name="source_form" value="${route.sourceForm}">
            <button type="submit" class="btn btn-accent btn-lg">${escapeHtml(l.actions.submit)}</button>
          </form>
        </div>
      </div>
    </div>
  </section>
  ${END}`;
}

function renderMobileBar(l) {
  return `<div class="mobile-cta-bar">
    <a href="#procurement-form" class="btn btn-quote">${escapeHtml(l.actions.form)}</a>
    <a href="mailto:chixiangmotor@163.com" class="btn btn-email">${escapeHtml(l.actions.email)}</a>
  </div>`;
}

function replaceHeadValue(html, pattern, replacement, file, label) {
  if (!pattern.test(html)) throw new Error(`${file}: ${label} not found`);
  return html.replace(pattern, replacement);
}

function updatePage(before, route, l) {
  let after = replaceOwnerRegion(before, renderOwner(route, l), route.file);
  after = after.replace(/<div class="mobile-cta-bar">[\s\S]*?<\/div>/i, renderMobileBar(l));
  after = replaceHeadValue(after, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(l.title)}</title>`, route.file, 'title');
  after = replaceHeadValue(
    after,
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(l.description)}">`,
    route.file,
    'meta description'
  );
  after = after.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(l.title)}">`
  );
  after = after.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(l.description)}">`
  );
  return after.replace(/\r\n/g, '\n');
}

const changed = [];
for (const route of routes) {
  const file = path.join(root, route.file);
  const before = fs.readFileSync(file, 'utf8');
  const after = updatePage(before, route, locales[route.language]);
  if (after !== before) {
    changed.push(route.file);
    if (!checkOnly) fs.writeFileSync(file, after, 'utf8');
  }
}

if (checkOnly && changed.length) {
  console.error(`${changed.length} contact owner pages need updates.`);
  for (const file of changed) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`${changed.length} contact owner pages ${checkOnly ? 'need updates' : 'updated'}.`);
}
