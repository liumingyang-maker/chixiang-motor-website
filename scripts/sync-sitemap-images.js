#!/usr/bin/env node
/**
 * Synchronize Google Image Sitemap extension (xmlns:image) in sitemap.xml
 * across all 197 canonical export URLs.
 *
 * Strictly includes ONLY eligible product, spare-part, factory-showcase, and guide
 * images from data/image-seo-manifest.json (excludes logos, QR codes, UI icons).
 *
 * Usage:
 *   node scripts/sync-sitemap-images.js
 *   node scripts/sync-sitemap-images.js --check
 */
const fs = require('node:fs');
const path = require('node:path');
const imgSeo = require('./lib/image-seo-helper');

const ROOT = path.join(__dirname, '..');
const ORIGIN = imgSeo.ORIGIN;
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const checkOnly = process.argv.includes('--check');

function xmlEscape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fileFromUrl(url) {
  const rel = url.slice(ORIGIN.length + 1);
  if (!rel) return 'index.html';
  if (rel.endsWith('/')) return `${rel}index.html`;
  if (!rel.endsWith('.html') && fs.existsSync(path.join(ROOT, `${rel}.html`))) {
    return `${rel}.html`;
  }
  return rel;
}

function langFromUrl(url) {
  const m = url.match(/^https:\/\/chixiangmotor\.com\/(en|fr|es|pt|ru|ar)\//);
  return m ? m[1] : 'en';
}

function extractEligibleImages(html, lang) {
  const seen = new Set();
  const out = [];
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1];
    const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcM) continue;
    const rawSrc = srcM[1];
    if (/^(?:data:|https?:\/\/mc\.yandex\.ru)/i.test(rawSrc)) continue;
    const file = imgSeo.resolveFile(rawSrc);
    const asset = imgSeo.resolveAsset(file);
    if (!asset || !asset.sitemapEligible) continue;
    if (seen.has(file)) continue;
    seen.add(file);

    const altM = attrs.match(/\balt=(["'])([\s\S]*?)\1/i);
    const title = imgSeo.getAlt(file, lang, altM ? altM[2] : asset.alt?.[lang] || asset.alt?.en || 'CHIXIANG MOTOR');
    const caption = imgSeo.getCaption(file, lang, title);
    out.push({
      loc: `${ORIGIN}/${file}`,
      title,
      caption
    });
    if (out.length >= 10) break;
  }
  return out;
}

function main() {
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const orig = xml;

  // Ensure xmlns:image is declared on <urlset>
  if (!xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
    xml = xml.replace(
      /<urlset\b([^>]*)>/i,
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
    );
  }

  // Rebuild each <url> block with clean deduplicated <image:image> children
  xml = xml.replace(/ {0,2}<url>[\s\S]*?<\/url>/g, (block) => {
    const locM = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locM) return block;
    const url = locM[1];
    const cleanBlock = block.replace(/\s*<image:image>[\s\S]*?<\/image:image>/g, '');
    if (url.endsWith('.pdf')) return cleanBlock;
    const file = fileFromUrl(url);
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) return cleanBlock;
    const lang = langFromUrl(url);
    const html = fs.readFileSync(abs, 'utf8');
    const images = extractEligibleImages(html, lang);
    if (!images.length) return cleanBlock;

    const imageXml = images.map((im) => [
      '    <image:image>',
      `      <image:loc>${xmlEscape(im.loc)}</image:loc>`,
      `      <image:title>${xmlEscape(im.title)}</image:title>`,
      `      <image:caption>${xmlEscape(im.caption)}</image:caption>`,
      '    </image:image>'
    ].join('\n')).join('\n');

    return cleanBlock.replace(/\s*<\/url>/, `\n${imageXml}\n  </url>`);
  });

  if (xml !== orig) {
    if (checkOnly) {
      console.error('STALE sitemap.xml (image extensions out of sync)');
      process.exit(1);
    }
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
    console.log('sitemap.xml updated with xmlns:image entries.');
  } else {
    console.log('sitemap.xml image extensions already in sync.');
  }
}

main();
