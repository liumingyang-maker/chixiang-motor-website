const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '../..');
const MANIFEST_PATH = path.join(ROOT, 'data/image-seo-manifest.json');
const ORIGIN = 'https://chixiangmotor.com';

let cachedManifest = null;

function loadManifest() {
  if (!cachedManifest) {
    cachedManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }
  return cachedManifest;
}

function normalizeImageRel(rawPath) {
  let clean = String(rawPath || '').trim();
  if (!clean) return '';
  if (clean.startsWith(ORIGIN)) clean = clean.slice(ORIGIN.length);
  clean = clean.replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');
  clean = clean.split(/[?#]/, 1)[0];
  return clean;
}

function resolveFile(rawPath) {
  const rel = normalizeImageRel(rawPath);
  const manifest = loadManifest();
  if (manifest.assets[rel]) return rel;
  if (manifest.legacyPathMap && manifest.legacyPathMap[rel]) {
    return manifest.legacyPathMap[rel];
  }
  return rel;
}

function resolveAsset(rawPath) {
  const file = resolveFile(rawPath);
  const manifest = loadManifest();
  return manifest.assets[file] || null;
}

function getAlt(rawPath, lang = 'en', fallback = '') {
  const asset = resolveAsset(rawPath);
  if (!asset || !asset.alt) return fallback;
  return asset.alt[lang] || asset.alt.en || fallback;
}

function getCaption(rawPath, lang = 'en', fallback = '') {
  const asset = resolveAsset(rawPath);
  if (!asset) return fallback;
  if (asset.caption) return asset.caption[lang] || asset.caption.en || fallback;
  if (asset.alt) return asset.alt[lang] || asset.alt.en || fallback;
  return fallback;
}

function getDims(rawPath, defaultW = 800, defaultH = 800) {
  const asset = resolveAsset(rawPath);
  if (!asset) return { width: defaultW, height: defaultH };
  return { width: asset.width || defaultW, height: asset.height || defaultH };
}

function getFitClass(rawPath, forceFit = null) {
  if (forceFit === 'cover') return 'img-fit-cover';
  if (forceFit === 'contain') return 'img-fit-contain';
  const asset = resolveAsset(rawPath);
  return asset && asset.fit === 'cover' ? 'img-fit-cover' : 'img-fit-contain';
}

function imageObjectNode(rawPath, lang = 'en', options = {}) {
  const file = resolveFile(rawPath);
  const asset = resolveAsset(file);
  const absUrl = `${ORIGIN}/${file}`;
  const dims = getDims(file, 1200, 1200);
  const alt = options.alt || getAlt(file, lang, options.name || 'CHIXIANG MOTOR');
  const caption = options.caption || getCaption(file, lang, alt);
  return {
    '@type': 'ImageObject',
    contentUrl: absUrl,
    url: absUrl,
    name: options.name || alt,
    caption,
    encodingFormat: 'image/webp',
    width: dims.width,
    height: dims.height,
    representativeOfPage: Boolean(options.representativeOfPage)
  };
}

function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderCardImg(rawPath, lang = 'en', options = {}) {
  const file = resolveFile(rawPath);
  const prefix = options.relPrefix !== undefined ? options.relPrefix : '/';
  const src = `${prefix}${file}`;
  const dims = getDims(file, 800, 800);
  const alt = options.alt || getAlt(file, lang, 'CHIXIANG MOTOR');
  const fitClass = getFitClass(file, options.fit || null);
  const eager = Boolean(options.eager);
  const loading = eager ? 'eager' : 'lazy';
  const fetchPriority = eager ? ' fetchpriority="high"' : '';
  const extraClass = options.className ? ` ${options.className}` : '';
  return `<img class="${fitClass}${extraClass}" src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" width="${dims.width}" height="${dims.height}" loading="${loading}"${fetchPriority} decoding="async">`;
}

module.exports = {
  ORIGIN,
  loadManifest,
  normalizeImageRel,
  resolveFile,
  resolveAsset,
  getAlt,
  getCaption,
  getDims,
  getFitClass,
  imageObjectNode,
  renderCardImg
};
