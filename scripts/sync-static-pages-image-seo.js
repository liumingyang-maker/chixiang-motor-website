#!/usr/bin/env node
/**
 * Synchronize Image SEO across non-generated / owner-managed static HTML pages
 * across the 6 active public export languages (en, fr, es, pt, ru, ar).
 *
 * - Resolves legacy image paths via data/image-seo-manifest.json
 * - Converts CSS background-image cards (.product-img, .card-img, .about-hero-img) to native <img>
 * - Ensures explicit width, height, decoding="async", and localized alt on all <img> tags
 * - Injects missing <meta property="og:image"> on canonical pages
 * - Upgrades string Product/Article JSON-LD image values to schema.org ImageObject[]
 *
 * Usage:
 *   node scripts/sync-static-pages-image-seo.js
 *   node scripts/sync-static-pages-image-seo.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const imgSeo = require('./lib/image-seo-helper');

const ROOT = path.join(__dirname, '..');
const ORIGIN = imgSeo.ORIGIN;
const checkOnly = process.argv.includes('--check');

function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCanonicalUrls() {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...sm.matchAll(/<loc>(https:\/\/chixiangmotor\.com\/[^<]*)<\/loc>/g)].map((m) => {
    const u = m[1];
    const rel = u.slice(ORIGIN.length + 1);
    if (!rel) return { url: u, file: 'index.html' };
    if (rel.endsWith('/')) return { url: u, file: `${rel}index.html` };
    if (!rel.endsWith('.html') && fs.existsSync(path.join(ROOT, `${rel}.html`))) {
      return { url: u, file: `${rel}.html` };
    }
    return { url: u, file: rel };
  });
}

function defaultOgImageForFile(file) {
  if (file.includes('cb-engine') || file.includes('motor-cb') || file.includes('dvigatel-cb')) {
    return `${ORIGIN}/images/cb-ohc/chixiang-cb150-cb200-cb250-ohc-chain-offroad-engine-front-view.webp`;
  }
  if (file.includes('horizontal') || file.includes('gorizontalnyj') || file.startsWith('ru/russia/')) {
    return `${ORIGIN}/images/horizontal-electric-start/chixiang-cx-horizontal-110-125-electric-start-engine-02.webp`;
  }
  if (file.includes('engine-parts') || file.includes('repuestos') || file.includes('pecas') || file.includes('zapchasti')) {
    return `${ORIGIN}/images/parts/chixiang-motorcycle-tricycle-engine-spare-parts-overview.webp`;
  }
  if (file.includes('cg-engine') || file.includes('motor-cg') || file.includes('dvigatel-cg') || file.includes('peru') || file.includes('colombia') || file.includes('central-asia')) {
    return `${ORIGIN}/images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp`;
  }
  if (file.includes('hw250-hw300')) {
    return `${ORIGIN}/images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp`;
  }
  return `${ORIGIN}/images/factory-showcase/chixiang-engine-hot-cold-bench-testing.webp`;
}

function transformHtml(file, rawHtml) {
  const nl = rawHtml.includes('\r\n') ? '\r\n' : '\n';
  const lang = file.split('/')[0] || 'en';
  const manifest = imgSeo.loadManifest();
  let html = rawHtml;

  // 1. Replace all legacy paths anywhere in HTML (CSS, og:image, src, JSON-LD)
  const sortedLegacy = Object.entries(manifest.legacyPathMap || {}).sort((a, b) => b[0].length - a[0].length);
  for (const [oldRel, newRel] of sortedLegacy) {
    if (html.includes(oldRel)) {
      html = html.split(oldRel).join(newRel);
    }
  }

  // 2. Convert background-image product-img / card-img / about-hero-img elements into native <img>
  const relPrefixForAttr = (bgUrl) => {
    if (bgUrl.startsWith('/')) return '/';
    const depth = file.split('/').length - 1;
    return depth > 0 ? '../'.repeat(depth) : '/';
  };

  // 2a. Convert <a|div class="product-img|card-img ... " style="background-image:url('...');">...</a>/</div>
  html = html.replace(
    /<(a|div)\b([^>]*\bclass=["'][^"']*\b(?:product-img|card-img)\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, inner) => {
      if (/<img\b/i.test(inner)) return full;
      const bgMatch = attrs.match(/background-image\s*:\s*url\((['"]?)([^)'"]+)\1\)/i);
      if (!bgMatch) return full;
      const bgUrl = bgMatch[2];
      const ariaMatch = attrs.match(/\baria-label=["']([^"']*)["']/i);
      const fallbackAlt = ariaMatch ? ariaMatch[1] : '';
      let cleanAttrs = attrs
        .replace(/\s*style=["'][^"']*["']/i, '')
        .replace(/\s*role=["']img["']/i, '')
        .replace(/\s*aria-label=["'][^"']*["']/i, '');
      if (tag.toLowerCase() === 'div' && !/\bhas-img\b/.test(cleanAttrs)) {
        cleanAttrs = cleanAttrs.replace(/\bclass=["']([^"']*)["']/i, 'class="$1 has-img"');
      }
      const imgTag = imgSeo.renderCardImg(bgUrl, lang, {
        relPrefix: relPrefixForAttr(bgUrl),
        alt: imgSeo.getAlt(bgUrl, lang, fallbackAlt)
      });
      const preservedInner = inner.trim() ? `\n          ${inner.trim()}` : '';
      return `<${tag}${cleanAttrs}>${imgTag}${preservedInner}</${tag}>`;
    }
  );

  // 2c. <div class="about-hero-img ..." style="background-image:url('...');..."></div>
  html = html.replace(
    /<div\b([^>]*\bclass=["'][^"']*\babout-hero-img\b[^"']*["'][^>]*)>\s*<\/div>/gi,
    (full, attrs) => {
      const bgMatch = attrs.match(/background-image\s*:\s*url\((['"]?)([^)'"]+)\1\)/i);
      if (!bgMatch) return full;
      const bgUrl = bgMatch[2];
      let cleanAttrs = attrs
        .replace(/\s*style=["'][^"']*["']/i, '')
        .replace(/\s*role=["']img["']/i, '')
        .replace(/\s*aria-label=["'][^"']*["']/i, '');
      const imgTag = imgSeo.renderCardImg(bgUrl, lang, {
        relPrefix: relPrefixForAttr(bgUrl),
        eager: true,
        fit: 'contain'
      });
      return `<div${cleanAttrs}>${imgTag}</div>`;
    }
  );

  // 3. Ensure every <img> tag has width, height, decoding="async", and non-empty alt (excluding Yandex pixel)
  html = html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcM || /mc\.yandex\.ru/i.test(srcM[1])) return full;
    const src = srcM[1];
    let out = attrs;
    const isLogo = /images\/logo\.webp/i.test(src);
    const isQr = /wechat-qr\.webp|whatsapp-qr\.webp/i.test(src);

    // Fix empty or missing alt
    const altM = out.match(/\balt=(["'])([\s\S]*?)\1/i);
    if (!altM) {
      const defaultAlt = isLogo ? 'CHIXIANG MOTOR' : imgSeo.getAlt(src, lang, 'CHIXIANG MOTOR');
      out += ` alt="${escapeAttr(defaultAlt)}"`;
    } else if (!altM[2].trim()) {
      const defaultAlt = isLogo ? 'CHIXIANG MOTOR' : imgSeo.getAlt(src, lang, 'CHIXIANG MOTOR');
      out = out.replace(/\balt=(["'])([\s\S]*?)\1/i, `alt="${escapeAttr(defaultAlt)}"`);
    }

    // Add explicit width & height when missing
    if (!/\bwidth=/i.test(out) || !/\bheight=/i.test(out)) {
      let dims = imgSeo.getDims(src, 800, 800);
      if (isLogo) dims = { width: 36, height: 36 };
      else if (isQr) dims = { width: 90, height: 90 };
      if (!/\bwidth=/i.test(out)) out += ` width="${dims.width}"`;
      if (!/\bheight=/i.test(out)) out += ` height="${dims.height}"`;
    }
    if (!/\bdecoding=/i.test(out)) {
      out += ' decoding="async"';
    }
    return `<img${out}>`;
  });

  // 4. Inject missing <meta property="og:image">
  if (!/<meta\b[^>]*property=["']og:image["']/i.test(html)) {
    const ogImg = defaultOgImageForFile(file);
    if (/<meta\b[^>]*property=["']og:url["'][^>]*>/i.test(html)) {
      html = html.replace(
        /(<meta\b[^>]*property=["']og:url["'][^>]*>\r?\n?)/i,
        `$1  <meta property="og:image" content="${escapeAttr(ogImg)}">\n`
      );
    } else if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(
        /(<link\b[^>]*rel=["']canonical["'][^>]*>\r?\n?)/i,
        `$1  <meta property="og:image" content="${escapeAttr(ogImg)}">\n`
      );
    }
  }

  // 5. Upgrade Product / Article JSON-LD string images to ImageObject[]
  html = html.replace(/<script\b([^>]*)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi, (full, a1, a2, body) => {
    if (/data-site-entity-graph/i.test(a1 + a2)) return full;
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return full;
    }
    let changed = false;
    const upgrade = (node) => {
      if (!node || !node['@type']) return;
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      if (!types.includes('Product') && !types.includes('Article') && !types.includes('TechArticle')) return;
      if (typeof node.image === 'string') {
        node.image = [imgSeo.imageObjectNode(node.image, lang, { representativeOfPage: true, name: node.name || node.headline })];
        changed = true;
      } else if (Array.isArray(node.image) && node.image.length && typeof node.image[0] === 'string') {
        node.image = node.image.map((u, idx) => imgSeo.imageObjectNode(u, lang, { representativeOfPage: idx === 0, name: node.name || node.headline }));
        changed = true;
      }
    };
    upgrade(data);
    if (Array.isArray(data['@graph'])) data['@graph'].forEach(upgrade);
    if (!changed) return full;
    return `<script${a1}type="application/ld+json"${a2}>\n${JSON.stringify(data, null, 2)}\n  </script>`;
  });

  return html.replace(/\r?\n/g, nl);
}

function main() {
  const canonicalFiles = new Set(getCanonicalUrls().map((e) => e.file));
  // Also include historical noindex artifact under images/factory-showcase if present so no broken refs remain
  if (fs.existsSync(path.join(ROOT, 'images/factory-showcase/gorizontalnyj-dvigatel.html'))) {
    canonicalFiles.add('images/factory-showcase/gorizontalnyj-dvigatel.html');
  }

  const changed = [];
  for (const rel of canonicalFiles) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf8');
    const next = transformHtml(rel, raw);
    if (next !== raw) {
      changed.push(rel);
      if (!checkOnly) fs.writeFileSync(abs, next, 'utf8');
    }
  }

  if (checkOnly && changed.length) {
    for (const c of changed) console.log(`STALE ${c}`);
    console.error(`${changed.length} static HTML files need Image SEO sync.`);
    process.exit(1);
  }
  console.log(`${changed.length} static HTML files ${checkOnly ? 'need sync' : 'synced'}.`);
}

main();
