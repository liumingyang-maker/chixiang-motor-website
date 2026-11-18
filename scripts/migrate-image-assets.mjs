#!/usr/bin/env node
/**
 * migrate-image-assets.mjs
 * Deterministic image path normalization for chixiang-motor-website.
 * Renames CJK / WeChat-export / space-containing image paths to English kebab-case
 * and rewrites every repo reference (raw + URL-encoded variants), longest-first.
 *
 * Usage: node scripts/migrate-image-assets.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
console.log('ROOT =', ROOT);

/** Directory mapping: old dir relative to images/ -> new dir */
const DIR_MAP = {
  'cg银白色': 'cg-air-cooled-silver',
  'cg金色黑色双拼': 'cg-two-tone-gold-black',
  'cg平衡轴': 'cg-balance-shaft',
  '三轮车': 'cargo-tricycle',
  '卧式下置式': 'horizontal-under-engine',
  '卧式水冷': 'horizontal-water-cooled',
  '卧式电启动': 'horizontal-electric-start',
  '双离合发动机': 'dual-clutch-engine',
  '外置平衡轴': 'external-balance-shaft',
  '捍威': 'hw-water-heavy-duty',
  '摩托车': 'motorcycle-programs',
  '普通水冷': 'standard-water-cooled',
  '海啸': 'tsunami-water-cooled',
  '电喷水冷': 'efi-water-cooled',
  '联系方式': 'contact-channels',
  '脚启动发动机卧式': 'horizontal-kick-start',
  '落地页发动机俄罗斯': 'russia-landing-engines',
};

/**
 * Explicit file rename rules keyed by old repo-relative path (forward slashes).
 * Names derived from real page context (product cards / headings), never invented.
 */
const FILE_MAP = {
  'images/chixiang-main-hero.webp': 'images/chixiang-main-hero.webp',
  // CG air-cooled silver (products card "CG Air-Cooled")
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-01.webp': 'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-01.webp',
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-02.webp': 'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-02.webp',
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-03.webp': 'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-03.webp',
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-04.webp': 'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-04.webp',
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-05.webp': 'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-05.webp',
  // CG two-tone gold/black
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-01.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-01.webp',
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-02.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-02.webp',
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-03.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-03.webp',
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-04.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-04.webp',
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-05.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-05.webp',
  'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-06.webp': 'images/cg-two-tone-gold-black/chixiang-cg-two-tone-gold-black-06.webp',
  // CG balance shaft
  'images/cg-balance-shaft/chixiang-cg-balance-shaft-engine-parts-detail.webp': 'images/cg-balance-shaft/chixiang-cg-balance-shaft-engine-parts-detail.webp',
  'images/cg-balance-shaft/chixiang-cg-balance-shaft-engine-product-view.webp': 'images/cg-balance-shaft/chixiang-cg-balance-shaft-engine-product-view.webp',
  'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-closeup-01.webp': 'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-closeup-01.webp',
  'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-detail-02.webp': 'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-detail-02.webp',
  'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-closeup-03.webp': 'images/cg-balance-shaft/chixiang-cg-balance-shaft-black-engine-closeup-03.webp',
  // Cargo tricycle
  'images/cargo-tricycle/chixiang-cargo-tricycle-engine-01.webp': 'images/cargo-tricycle/chixiang-cargo-tricycle-engine-01.webp',
  'images/cargo-tricycle/chixiang-cargo-tricycle-engine-02.webp': 'images/cargo-tricycle/chixiang-cargo-tricycle-engine-02.webp',
  'images/cargo-tricycle/chixiang-cargo-tricycle-photo-03.webp': 'images/cargo-tricycle/chixiang-cargo-tricycle-photo-03.webp',
  'images/cargo-tricycle/chixiang-cargo-tricycle-photo-04.webp': 'images/cargo-tricycle/chixiang-cargo-tricycle-photo-04.webp',
  // Horizontal under-engine
  'images/horizontal-under-engine/chixiang-horizontal-under-engine-01.webp': 'images/horizontal-under-engine/chixiang-horizontal-under-engine-01.webp',
  'images/horizontal-under-engine/chixiang-horizontal-under-engine-02.webp': 'images/horizontal-under-engine/chixiang-horizontal-under-engine-02.webp',
  'images/horizontal-under-engine/chixiang-horizontal-under-engine-03.webp': 'images/horizontal-under-engine/chixiang-horizontal-under-engine-03.webp',
  'images/horizontal-under-engine/chixiang-horizontal-under-engine-04.webp': 'images/horizontal-under-engine/chixiang-horizontal-under-engine-04.webp',
  'images/horizontal-under-engine/chixiang-horizontal-under-engine-05.webp': 'images/horizontal-under-engine/chixiang-horizontal-under-engine-05.webp',
  // Horizontal water-cooled
  'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-01.webp': 'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-01.webp',
  'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-02.webp': 'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-02.webp',
  'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-03.webp': 'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-03.webp',
  'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-04.webp': 'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-04.webp',
  'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-05.webp': 'images/horizontal-water-cooled/chixiang-horizontal-water-cooled-05.webp',
  // Horizontal electric start
  'images/horizontal-electric-start/chixiang-horizontal-electric-start-01.webp': 'images/horizontal-electric-start/chixiang-horizontal-electric-start-01.webp',
  'images/horizontal-electric-start/chixiang-horizontal-electric-start-02.webp': 'images/horizontal-electric-start/chixiang-horizontal-electric-start-02.webp',
  'images/horizontal-electric-start/chixiang-horizontal-electric-start-03.webp': 'images/horizontal-electric-start/chixiang-horizontal-electric-start-03.webp',
  // Dual clutch
  'images/dual-clutch-engine/chixiang-dual-clutch-engine-01.webp': 'images/dual-clutch-engine/chixiang-dual-clutch-engine-01.webp',
  'images/dual-clutch-engine/chixiang-dual-clutch-engine-02.webp': 'images/dual-clutch-engine/chixiang-dual-clutch-engine-02.webp',
  'images/dual-clutch-engine/chixiang-dual-clutch-engine-03.webp': 'images/dual-clutch-engine/chixiang-dual-clutch-engine-03.webp',
  'images/dual-clutch-engine/chixiang-dual-clutch-engine-04.webp': 'images/dual-clutch-engine/chixiang-dual-clutch-engine-04.webp',
  // External balance shaft
  'images/external-balance-shaft/chixiang-external-balance-shaft-01.webp': 'images/external-balance-shaft/chixiang-external-balance-shaft-01.webp',
  'images/external-balance-shaft/chixiang-external-balance-shaft-02.webp': 'images/external-balance-shaft/chixiang-external-balance-shaft-02.webp',
  'images/external-balance-shaft/chixiang-external-balance-shaft-03.webp': 'images/external-balance-shaft/chixiang-external-balance-shaft-03.webp',
  'images/external-balance-shaft/chixiang-external-balance-shaft-04.webp': 'images/external-balance-shaft/chixiang-external-balance-shaft-04.webp',
  'images/external-balance-shaft/chixiang-external-balance-shaft-05.webp': 'images/external-balance-shaft/chixiang-external-balance-shaft-05.webp',
  // HW Water heavy-duty (捍威)
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp': 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp',
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-02.webp': 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-02.webp',
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-03.webp': 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-03.webp',
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-04.webp': 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-04.webp',
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-05.webp': 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-05.webp',
  // Motorcycle future-program photos (微信 export)
  'images/motorcycle-programs/chixiang-motorcycle-program-photo-01.webp': 'images/motorcycle-programs/chixiang-motorcycle-program-photo-01.webp',
  'images/motorcycle-programs/chixiang-motorcycle-program-photo-02.webp': 'images/motorcycle-programs/chixiang-motorcycle-program-photo-02.webp',
  'images/motorcycle-programs/chixiang-motorcycle-program-photo-03.webp': 'images/motorcycle-programs/chixiang-motorcycle-program-photo-03.webp',
  'images/motorcycle-programs/chixiang-motorcycle-program-photo-04.webp': 'images/motorcycle-programs/chixiang-motorcycle-program-photo-04.webp',
  'images/motorcycle-programs/chixiang-motorcycle-program-photo-05.webp': 'images/motorcycle-programs/chixiang-motorcycle-program-photo-05.webp',
  // Standard water-cooled (普通水冷)
  'images/standard-water-cooled/chixiang-standard-water-cooled-01.webp': 'images/standard-water-cooled/chixiang-standard-water-cooled-01.webp',
  'images/standard-water-cooled/chixiang-standard-water-cooled-02.webp': 'images/standard-water-cooled/chixiang-standard-water-cooled-02.webp',
  'images/standard-water-cooled/chixiang-standard-water-cooled-03.webp': 'images/standard-water-cooled/chixiang-standard-water-cooled-03.webp',
  'images/standard-water-cooled/chixiang-standard-water-cooled-04.webp': 'images/standard-water-cooled/chixiang-standard-water-cooled-04.webp',
  'images/standard-water-cooled/chixiang-standard-water-cooled-05.webp': 'images/standard-water-cooled/chixiang-standard-water-cooled-05.webp',
  // Tsunami water-cooled (海啸)
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-01.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-01.webp',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-02.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-02.webp',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-03.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-03.webp',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-04.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-04.webp',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-05.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-05.webp',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-06.webp': 'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-06.webp',
  // EFI water-cooled (电喷水冷)
  'images/efi-water-cooled/chixiang-efi-water-cooled-01.webp': 'images/efi-water-cooled/chixiang-efi-water-cooled-01.webp',
  'images/efi-water-cooled/chixiang-efi-water-cooled-02.webp': 'images/efi-water-cooled/chixiang-efi-water-cooled-02.webp',
  'images/efi-water-cooled/chixiang-efi-water-cooled-03.webp': 'images/efi-water-cooled/chixiang-efi-water-cooled-03.webp',
  'images/efi-water-cooled/chixiang-efi-water-cooled-04.webp': 'images/efi-water-cooled/chixiang-efi-water-cooled-04.webp',
  'images/efi-water-cooled/chixiang-efi-water-cooled-05.webp': 'images/efi-water-cooled/chixiang-efi-water-cooled-05.webp',
  // Contact channel QR codes
  'images/contact-channels/wechat-qr.webp': 'images/contact-channels/wechat-qr.webp',
  'images/contact-channels/whatsapp-qr.webp': 'images/contact-channels/whatsapp-qr.webp',
  // Horizontal kick-start
  'images/horizontal-kick-start/chixiang-horizontal-kick-start-01.webp': 'images/horizontal-kick-start/chixiang-horizontal-kick-start-01.webp',
  'images/horizontal-kick-start/chixiang-horizontal-kick-start-02.webp': 'images/horizontal-kick-start/chixiang-horizontal-kick-start-02.webp',
  'images/horizontal-kick-start/chixiang-horizontal-kick-start-03.webp': 'images/horizontal-kick-start/chixiang-horizontal-kick-start-03.webp',
  'images/horizontal-kick-start/chixiang-horizontal-kick-start-04.webp': 'images/horizontal-kick-start/chixiang-horizontal-kick-start-04.webp',
  // Russia landing engine renders (AI-draft artwork, named as such)
  'images/russia-landing-engines/chixiang-horizontal-110-upper-starter-render-01.webp': 'images/russia-landing-engines/chixiang-horizontal-110-upper-starter-render-01.webp',
  'images/russia-landing-engines/chixiang-horizontal-110-lower-starter-render-02.webp': 'images/russia-landing-engines/chixiang-horizontal-110-lower-starter-render-02.webp',
  'images/russia-landing-engines/chixiang-horizontal-125-upper-starter-render-03.png': 'images/russia-landing-engines/chixiang-horizontal-125-upper-starter-render-03.png',
  'images/russia-landing-engines/chixiang-horizontal-125-lower-starter-render-04.webp': 'images/russia-landing-engines/chixiang-horizontal-125-lower-starter-render-04.webp',
  'images/russia-landing-engines/chixiang-horizontal-140-lower-starter-render-05.webp': 'images/russia-landing-engines/chixiang-horizontal-140-lower-starter-render-05.webp',
  'images/russia-landing-engines/chixiang-builtin-reverse-render-06.webp': 'images/russia-landing-engines/chixiang-builtin-reverse-render-06.webp',
  'images/russia-landing-engines/chixiang-horizontal-kick-start-125-07.webp': 'images/russia-landing-engines/chixiang-horizontal-kick-start-125-07.webp',
  'images/russia-landing-engines/chixiang-horizontal-kick-start-140-08.webp': 'images/russia-landing-engines/chixiang-horizontal-kick-start-140-08.webp',
};

/** File-scoped HTML alt attribute upgrades (only for renamed images). */
const ALT_MAP = {
  'images/cg-air-cooled-silver/chixiang-cg-air-cooled-silver-01.webp': 'CHIXIANG CG air-cooled silver motorcycle engine',
  'images/horizontal-electric-start/chixiang-horizontal-electric-start-02.webp': 'CHIXIANG horizontal electric-start motorcycle engine',
  'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp': 'CHIXIANG HW Water heavy-duty water-cooled engine',
  'images/tsunami-water-cooled/chixiang-tsunami-water-cooled-01.webp': 'CHIXIANG Tsunami water-cooled engine',
  'images/contact-channels/wechat-qr.webp': 'CHIXIANG MOTOR WeChat QR code',
  'images/contact-channels/whatsapp-qr.webp': 'CHIXIANG MOTOR WhatsApp QR code',
  'images/chixiang-main-hero.webp': 'CHIXIANG MOTOR main product hero',
};

// ---------- helpers ----------
function encodeVariants(rel) {
  const parts = rel.split('/');
  return [
    rel,
    encodeURI(rel),
    parts.map(encodeURIComponent).join('/'),
  ];
}

function allPrefixVariants(rel) {
  // produce forms with ../ / leading slash (only for the plain rel; encoded forms same prefix)
  const bases = new Set();
  for (const v of encodeVariants(rel)) {
    bases.add(v);
    bases.add('/' + v);
    bases.add('../' + v);
    bases.add('../../' + v);
    bases.add('./' + v);
  }
  return [...bases];
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === '.git' || name === 'node_modules' || name.startsWith('_gpt') || name.startsWith('.playwright')) continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
}

// ---------- validate mapping ----------
const missing = [];
for (const [oldRel] of Object.entries(FILE_MAP)) {
  const abs = path.join(ROOT, oldRel.split('/').join(path.sep));
  if (!fs.existsSync(abs)) missing.push(oldRel);
}
if (missing.length) {
  console.error('MAPPING POINTS TO MISSING FILES:');
  for (const m of missing) console.error('  ', m);
  process.exit(1);
}

const targets = new Set(Object.values(FILE_MAP));
if (targets.size !== Object.keys(FILE_MAP).length) {
  console.error('DUPLICATE TARGET NAMES in FILE_MAP');
  process.exit(1);
}
console.log(`MAP OK: ${Object.keys(FILE_MAP).length} files, ${Object.keys(DIR_MAP).length} dirs`);

// ---------- build replacement pairs (longest first) ----------
const pairs = []; // [oldString, newString]
for (const [oldRel, newRel] of Object.entries(FILE_MAP)) {
  for (const o of allPrefixVariants(oldRel)) {
    // matching new variant with same prefix
    const prefix = o.startsWith('../../') ? '../../' : o.startsWith('../') ? '../' : o.startsWith('./') ? './' : o.startsWith('/') ? '/' : '';
    const bare = o.slice(prefix.length);
    const isEncodedFull = bare.includes('%');
    const isEncodedSeg = bare.split('/').some(s => s.includes('%')) && !isEncodedFull;
    let newBare = newRel;
    if (isEncodedFull) newBare = encodeURI(newRel);
    else if (isEncodedSeg) newBare = newRel.split('/').map(encodeURIComponent).join('/');
    pairs.push([o, prefix + newBare]);
  }
}
// sort by old length DESC so longer paths replace first
pairs.sort((a, b) => b[0].length - a[0].length);
console.log(`REPLACEMENT PAIRS: ${pairs.length}`);

// ---------- 1) rename files ----------
console.log('\n== RENAME ==');
for (const [oldRel, newRel] of Object.entries(FILE_MAP)) {
  const src = path.join(ROOT, oldRel.split('/').join(path.sep));
  const dst = path.join(ROOT, newRel.split('/').join(path.sep));
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (DRY) console.log(`  [dry] ${oldRel} -> ${newRel}`);
  else {
    fs.copyFileSync(src, dst);
    fs.unlinkSync(src);
    console.log(`  ok  ${oldRel} -> ${newRel}`);
  }
}

// ---------- 2) rewrite references ----------
console.log('\n== REWRITE REFS ==');
const exts = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.md', '.csv']);
const files = walk(ROOT);
let changedFiles = 0, totalRepl = 0;
for (const abs of files) {
  const ext = path.extname(abs).toLowerCase();
  if (!exts.has(ext)) continue;
  let text = fs.readFileSync(abs, 'utf8');
  const before = text;
  let n = 0;
  for (const [o, nw] of pairs) {
    if (text.includes(o)) {
      const c = text.split(o).length - 1;
      text = text.split(o).join(nw);
      n += c;
    }
  }
  if (text !== before) {
    changedFiles++;
    totalRepl += n;
    if (DRY) console.log(`  [dry] ${path.relative(ROOT, abs)}  (${n} replacements)`);
    else {
      fs.writeFileSync(abs, text);
      console.log(`  ok  ${path.relative(ROOT, abs)}  (${n} replacements)`);
    }
  }
}
console.log(`\nCHANGED ${changedFiles} files, ${totalRepl} string replacements`);

// ---------- 3) alt attribute pass ----------
console.log('\n== ALT PASS ==');
let altCount = 0;
for (const abs of files) {
  if (path.extname(abs).toLowerCase() !== '.html') continue;
  let html = fs.readFileSync(abs, 'utf8');
  const before = html;
  for (const [img, alt] of Object.entries(ALT_MAP)) {
    // match <img ... src="...img" ...> and set alt if empty/Chinese/meaningless
    const re = new RegExp(`(<img\\b[^>]*?src="[^"]*${img.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*?>)`, 'g');
    html = html.replace(re, (full) => {
      if (/\balt="[^"]*[一-鿿][^"]*"/.test(full) || /\balt=""/.test(full) || /\balt="(?:image|photo|img)"/i.test(full)) {
        return full.replace(/\salt="[^"]*"/, ` alt="${alt}"`).replace(/<img\b/, `<img alt="${alt}"`);
      }
      return full;
    });
  }
  if (html !== before) {
    altCount++;
    if (!DRY) fs.writeFileSync(abs, html);
    console.log(`  ${DRY ? '[dry] ' : 'ok  '}${path.relative(ROOT, abs)}`);
  }
}
console.log(`ALT updated in ${altCount} files`);

// ---------- 4) cleanup empty dirs ----------
console.log('\n== CLEANUP ==');
if (!DRY) {
  const dirs = Object.keys(DIR_MAP).map(d => path.join(ROOT, 'images', d.split('/').join(path.sep)))
    .concat([path.join(ROOT, 'images', '落地页发动机俄罗斯')]);
  for (const d of dirs) {
    if (fs.existsSync(d)) {
      // remove if empty (or only empty subdirs)
      const rmIfEmpty = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const name of fs.readdirSync(dir)) {
          const p = path.join(dir, name);
          if (fs.statSync(p).isDirectory()) rmIfEmpty(p);
        }
        if (fs.readdirSync(dir).length === 0) { fs.rmdirSync(dir); console.log('  removed empty', path.relative(ROOT, dir)); }
      };
      rmIfEmpty(d);
    }
  }
}
console.log('\nDONE');
