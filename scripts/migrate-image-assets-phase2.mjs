#!/usr/bin/env node
/**
 * migrate-image-assets-phase2.mjs
 * Deterministic phase-2 image path normalization for chixiang-motor-website.
 *
 * Phase 1 (migrate-image-assets.mjs) already migrated CJK / WeChat-export /
 * space-containing paths. Phase 2 finishes the English kebab-case standard for
 * the remaining non-conforming assets:
 *   - images/CB/           (uppercase directory + bare numeric file names)
 *   - images/atv/tb_image_share_*.webp  (Taobao export names, underscores)
 *
 * It also repairs the historical broken CB gallery references in
 * en/product-detail.html (CB/3.webp was deleted in 06ec6be while CB/4.webp and
 * CB/5.webp were replaced by 4.png / 5.png but the gallery kept the old names).
 *
 * Every repo reference is rewritten, including raw / URL-encoded /
 * per-segment-encoded / regex-escaped variants, longest string first.
 * Names are derived from the real product-card context on the site
 * (CB Series Off-Road Motorcycle Engine; AC320 287cc ATV/UTV engine),
 * never from invented model designations.
 *
 * Usage: node scripts/migrate-image-assets-phase2.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
console.log('ROOT =', ROOT);

/**
 * Explicit file rename rules (old repo-relative path -> new repo-relative path,
 * forward slashes). Extensions are preserved exactly.
 */
const FILE_MAP = {
  // CB Series Off-Road Motorcycle Engine (product card "Off-Road" / cb-offroad)
  'images/CB/1.webp': 'images/cb-offroad/chixiang-cb-offroad-engine-01.webp',
  'images/CB/2.webp': 'images/cb-offroad/chixiang-cb-offroad-engine-02.webp',
  'images/CB/4.png': 'images/cb-offroad/chixiang-cb-offroad-engine-03.png',
  'images/CB/5.png': 'images/cb-offroad/chixiang-cb-offroad-engine-04.png',
  // AC320 (175MN) ATV/UTV engine gallery (product card "ATV / CVT" / atv-ac320)
  'images/atv/tb_image_share_1773217554909.webp': 'images/atv/chixiang-ac320-atv-engine-01.webp',
  'images/atv/tb_image_share_1773217558802.webp': 'images/atv/chixiang-ac320-atv-engine-02.webp',
  'images/atv/tb_image_share_1773217584373.webp': 'images/atv/chixiang-ac320-atv-engine-03.webp',
  'images/atv/tb_image_share_1773217588029.webp': 'images/atv/chixiang-ac320-atv-engine-04.webp',
  'images/atv/tb_image_share_1773218230493.webp': 'images/atv/chixiang-ac320-atv-engine-05.webp',
};

/**
 * Exact block repairs applied BEFORE generic path replacement.
 * The cb-offroad gallery listed five paths of which CB/3.webp no longer exists
 * and CB/4.webp / CB/5.webp were superseded by 4.png / 5.png in 06ec6be.
 */
const BLOCK_FIXES = [
  {
    file: 'en/product-detail.html',
    label: 'cb-offroad gallery (5 broken entries -> 4 real images)',
    old: [
      "          '../images/CB/1.webp',",
      "          '../images/CB/2.webp',",
      "          '../images/CB/3.webp',",
      "          '../images/CB/4.webp',",
      "          '../images/CB/5.webp'",
    ].join('\n'),
    new: [
      "          '../images/cb-offroad/chixiang-cb-offroad-engine-01.webp',",
      "          '../images/cb-offroad/chixiang-cb-offroad-engine-02.webp',",
      "          '../images/cb-offroad/chixiang-cb-offroad-engine-03.png',",
      "          '../images/cb-offroad/chixiang-cb-offroad-engine-04.png'",
    ].join('\n'),
  },
];

/** File-scoped HTML alt upgrades for renamed images (only where an <img> exists). */
const ALT_UPGRADES = [
  {
    file: 'en/ac320-atv-engine.html',
    oldAlt: 'Chixiang Motor AC320 ATV engine',
    newAlt: 'CHIXIANG AC320 287cc liquid-cooled CVT ATV/UTV engine',
  },
];

// ---------- helpers ----------
function encodeVariants(rel) {
  const parts = rel.split('/');
  return [
    rel,
    encodeURI(rel),
    parts.map(encodeURIComponent).join('/'),
    // regex-escaped forms used inside test files (e.g. images\/atv\/x\.webp)
    rel.replace(/\//g, '\\/'),
    rel.replace(/\./g, '\\.').replace(/\//g, '\\/'),
  ];
}

function allPrefixVariants(rel) {
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
    if (name === '.git' || name === 'node_modules' || name.startsWith('_gpt') ||
        name.startsWith('.playwright') || name.startsWith('.vscode') || name === '.preview-tmp') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Migration tooling documents the old paths on purpose — never rewrite it.
const TOOLING = new Set([
  'scripts/migrate-image-assets.mjs',
  'scripts/migrate-image-assets-phase2.mjs',
  'scripts/fix-tests-image-paths.py',
  'scripts/verify-image-migration.py',
]);

/**
 * Historical broken references (deleted in 06ec6be) that must not survive
 * anywhere in site content after the block fix above.
 */
const PHANTOM_PATHS = [
  'images/CB/3.webp',
  'images/CB/4.webp',
  'images/CB/5.webp',
];
// This test keeps the literals on purpose as a negative guard against
// reintroduction of the broken references.
const PHANTOM_ALLOWED = new Set(['tests/algeria-paid-landing.test.js']);

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

const targets = Object.values(FILE_MAP);
if (new Set(targets).size !== targets.length) {
  console.error('DUPLICATE TARGET NAMES in FILE_MAP');
  process.exit(1);
}
for (const t of targets) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.(webp|png|jpg|jpeg)$/.test(path.basename(t))) {
    console.error('TARGET NOT KEBAB-CASE:', t);
    process.exit(1);
  }
}
console.log(`MAP OK: ${Object.keys(FILE_MAP).length} files`);

// ---------- build replacement pairs (longest first) ----------
const pairs = [];
for (const [oldRel, newRel] of Object.entries(FILE_MAP)) {
  for (const o of allPrefixVariants(oldRel)) {
    const prefix = o.startsWith('../../') ? '../../' : o.startsWith('../') ? '../'
      : o.startsWith('./') ? './' : o.startsWith('/') ? '/' : '';
    const bare = o.slice(prefix.length);
    const isRegexEscaped = bare.includes('\\/');
    const isEncodedFull = bare.includes('%');
    const isEncodedSeg = bare.split('/').some((s) => s.includes('%')) && !isEncodedFull;
    let newBare = newRel;
    if (isRegexEscaped) newBare = newRel.replace(/\//g, '\\/').replace(/\./g, '\\.');
    else if (isEncodedFull) newBare = encodeURI(newRel);
    else if (isEncodedSeg) newBare = newRel.split('/').map(encodeURIComponent).join('/');
    pairs.push([o, prefix + newBare]);
  }
}
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

// ---------- 2) exact block repairs ----------
console.log('\n== BLOCK FIXES ==');
for (const fix of BLOCK_FIXES) {
  const abs = path.join(ROOT, fix.file.split('/').join(path.sep));
  let text = fs.readFileSync(abs, 'utf8');
  const crlfOld = fix.old.replace(/\n/g, '\r\n');
  const crlfNew = fix.new.replace(/\n/g, '\r\n');
  let applied = false;
  if (text.includes(fix.old)) {
    text = text.split(fix.old).join(fix.new);
    applied = true;
  } else if (text.includes(crlfOld)) {
    text = text.split(crlfOld).join(crlfNew);
    applied = true;
  }
  if (!applied) {
    console.error(`  MISS ${fix.file}: ${fix.label}`);
    process.exit(1);
  }
  if (!DRY) fs.writeFileSync(abs, text);
  console.log(`  ${DRY ? '[dry] ' : 'ok  '} ${fix.file}: ${fix.label}`);
}

// ---------- 3) rewrite references ----------
console.log('\n== REWRITE REFS ==');
const exts = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.md', '.csv']);
const files = walk(ROOT);
let changedFiles = 0;
let totalRepl = 0;
for (const abs of files) {
  const ext = path.extname(abs).toLowerCase();
  if (!exts.has(ext)) continue;
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  if (TOOLING.has(rel)) continue;
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
    changedFiles += 1;
    totalRepl += n;
    if (DRY) console.log(`  [dry] ${path.relative(ROOT, abs)}  (${n} replacements)`);
    else {
      fs.writeFileSync(abs, text);
      console.log(`  ok  ${path.relative(ROOT, abs)}  (${n} replacements)`);
    }
  }
}
console.log(`CHANGED ${changedFiles} files, ${totalRepl} string replacements`);

// ---------- 4) alt attribute upgrades ----------
console.log('\n== ALT UPGRADES ==');
let altCount = 0;
for (const up of ALT_UPGRADES) {
  const abs = path.join(ROOT, up.file.split('/').join(path.sep));
  let html = fs.readFileSync(abs, 'utf8');
  if (!html.includes(`alt="${up.oldAlt}"`)) {
    console.error(`  MISS alt="${up.oldAlt}" in ${up.file}`);
    process.exit(1);
  }
  html = html.split(`alt="${up.oldAlt}"`).join(`alt="${up.newAlt}"`);
  if (!DRY) fs.writeFileSync(abs, html);
  altCount += 1;
  console.log(`  ${DRY ? '[dry] ' : 'ok  '}${up.file}: "${up.newAlt}"`);
}
console.log(`ALT updated in ${altCount} files`);

// ---------- 5) cleanup emptied directories ----------
if (!DRY) {
  const rmIfEmpty = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) rmIfEmpty(p);
    }
    if (fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      console.log('  removed empty', path.relative(ROOT, dir));
    }
  };
  rmIfEmpty(path.join(ROOT, 'images', 'CB'));
}

// ---------- 6) residual scan (real runs only) ----------
if (DRY) {
  console.log('\n== RESIDUAL SCAN ==\n  skipped in dry-run (files unchanged on disk)');
} else {
  console.log('\n== RESIDUAL SCAN ==');
  let residual = 0;
  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase();
    if (!exts.has(ext)) continue;
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (TOOLING.has(rel)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    for (const oldRel of Object.keys(FILE_MAP)) {
      if (text.includes(oldRel) || text.includes(oldRel.replace(/\//g, '\\/'))) {
        console.log(`  RESIDUAL ${oldRel} in ${rel}`);
        residual += 1;
      }
    }
    if (!PHANTOM_ALLOWED.has(rel)) {
      for (const ph of PHANTOM_PATHS) {
        if (text.includes(ph)) {
          console.log(`  RESIDUAL (phantom) ${ph} in ${rel}`);
          residual += 1;
        }
      }
    }
  }
  if (residual) {
    console.error(`RESIDUAL REFERENCES REMAIN: ${residual}`);
    process.exit(1);
  }
  console.log('residual scan clean');
}

console.log('\nDONE');
