const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const rules = read('.assetsignore').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

/*
 * A deliberately narrow model of the gitignore subset that this repository's
 * .assetsignore actually uses: directory prefixes ("docs/"), the duplicate
 * subtree form ("docs/**"), bare file names ("AGENTS.md") and single-segment
 * globs ("*.log"). It exists only to assert the publication boundary
 * structurally - it never replaces Wrangler and needs no network access.
 */
function toMatcher(raw) {
  const negated = raw.startsWith('!');
  let body = negated ? raw.slice(1) : raw;
  let subtree = false;
  if (body.endsWith('/')) { body = body.slice(0, -1); subtree = true; }
  else if (body.endsWith('/**')) { body = body.slice(0, -3); subtree = true; }
  const anchored = body.includes('/');
  const glob = body.split('/').map((seg) => seg
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*')).join('/');
  const source = (anchored ? '^' : '^(?:.*/)?') + glob + (subtree ? '(?:/.*)?$' : '$');
  const re = new RegExp(source);
  return { rule: raw, negated, test: (p) => re.test(p) };
}

const matchers = rules.map(toMatcher);

function isUploaded(candidate) {
  const file = candidate.split(path.sep).join('/');
  let excluded = false;
  for (const matcher of matchers) {
    if (matcher.test(file)) excluded = !matcher.negated;
  }
  return !excluded;
}

function listFiles(dir) {
  const out = [];
  (function walk(rel) {
    for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const child = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) { walk(child); continue; }
      out.push(child);
    }
  })(dir);
  return out;
}

const INTERNAL_DIRS = ['docs', 'research', 'scripts', 'tests', 'workers'];
const PUBLIC_DIRS = ['ar', 'css', 'en', 'es', 'images', 'js', 'pdf', 'pt', 'ru'];
/* Exact-file carve-outs that are deliberately withheld from the upload even though
 * they live under an otherwise public directory. Broad directory rules are forbidden. */
const PUBLIC_CARVE_OUTS = ['pdf/extracted.txt'];

/* The complete, reviewed rule set. Any new rule must be an explicit decision. */
const EXPECTED_RULES = [
  '.git/', '.git/**', '.github/', '.github/**', 'node_modules/', 'node_modules/**',
  '_deploy/', '_deploy/**', '_github_upload/', '_github_upload/**',
  '_github_upload_packages/', '_github_upload_packages/**',
  '\u6587\u6863/', '\u6587\u6863/**', '*.zip', '*.log', 'UPLOAD_STEPS.txt',
  '.assetsignore', '.gitignore', 'AGENTS.md', 'README.md',
  'FOUNDATION_AUDIT_REPORT.md', 'FOUNDATION_FIX_REPORT.md', 'serve.json',
  'wrangler.toml', 'package.json', 'package-lock.json',
  'pdf/extracted.txt',
  'docs/', 'docs/**', 'research/', 'research/**', 'scripts/', 'scripts/**',
  'tests/', 'tests/**', 'workers/', 'workers/**'
];

test('.assetsignore contains exactly the reviewed rule set and no broad pattern', () => {
  assert.deepEqual([...rules].sort(), [...EXPECTED_RULES].sort());
  for (const rule of rules) {
    assert.ok(!/^\/+$/.test(rule), 'root-wide rule is forbidden: ' + rule);
    assert.notEqual(rule, '**', 'a catch-all rule is forbidden');
    assert.ok(!/\.html$/.test(rule), 'no rule may exclude HTML documents: ' + rule);
    assert.ok(!/^[^/]*\*[^/]*\*$/.test(rule) || rule === '*.zip' || rule === '*.log',
      'unexpected wildcard rule: ' + rule);
  }
});

test('internal engineering sources are excluded from the static asset upload', () => {
  for (const dir of INTERNAL_DIRS) {
    const files = listFiles(dir);
    assert.ok(files.length > 0, 'expected content under ' + dir + '/ to prove the boundary');
    for (const file of files) {
      assert.equal(isUploaded(file), false, dir + '/ subtree must not be uploaded: ' + file);
    }
  }
  for (const file of ['AGENTS.md', 'wrangler.toml', 'README.md', 'serve.json', '.gitignore',
    'FOUNDATION_AUDIT_REPORT.md', 'FOUNDATION_FIX_REPORT.md']) {
    assert.equal(isUploaded(file), false, 'internal root file must not be uploaded: ' + file);
  }
  assert.equal(isUploaded('package.json'), false, 'a future npm manifest must not be published');
  assert.equal(isUploaded('package-lock.json'), false, 'a future lockfile must not be published');
});

test('every public runtime file on disk stays uploadable', () => {
  let checked = 0;
  for (const dir of PUBLIC_DIRS) {
    const files = listFiles(dir);
    assert.ok(files.length > 0, 'expected public content under ' + dir + '/');
    for (const file of files) {
      if (PUBLIC_CARVE_OUTS.includes(file)) {
        assert.equal(isUploaded(file), false, 'carved-out internal artifact must stay unpublished: ' + file);
        continue;
      }
      assert.equal(isUploaded(file), true, 'public runtime file must stay uploadable: ' + file);
      checked += 1;
    }
  }
  assert.ok(checked > 100, 'expected a realistic public file population, checked ' + checked);
  for (const file of ['index.html', 'robots.txt', 'sitemap.xml', '_headers', '_redirects',
    'yandex_68b52fccf05e4a88.html', 'yandex_8a3590afcb928a95.html', 'yandex_22d63909f0d852e1.html']) {
    assert.equal(isUploaded(file), true, 'required public root asset was excluded: ' + file);
  }
  for (const entry of fs.readdirSync(root)) {
    if (entry.toLowerCase().endsWith('.webp')) {
      assert.equal(isUploaded(entry), true, 'root-level public image must stay uploadable: ' + entry);
    }
  }
});

test('the paid landing subtree is preserved for future campaigns', () => {
  for (const file of ['ads/algerie/index.html', 'ads/algerie/fr/index.html', 'ads/other/land/index.html']) {
    assert.equal(isUploaded(file), true, 'ads/** must remain publishable: ' + file);
  }
});

test('the Worker entry point is untouched while its source stops being an asset', () => {
  const config = read('wrangler.toml');
  assert.match(config, /main = "workers\/site-router\.mjs"/, 'the Worker entry must not change');
  const Q = String.fromCharCode(34);
  assert.ok(config.includes('directory = ' + Q + '.' + Q), 'assets.directory must stay the repository root');
  assert.ok(config.includes('binding = ' + Q + 'ASSETS' + Q), 'the ASSETS binding must stay');
  const routing = config.split(/\r?\n/).find((line) => line.startsWith('run_worker_first'));
  assert.ok(routing, 'the run_worker_first routing list must still exist');
  for (const entry of ['"/*"', '"!/images/*"', '"!/css/*"', '"!/js/*"', '"!/pdf/*"', '"!/api/*"']) {
    assert.ok(routing.includes(entry), 'routing entry must stay unchanged: ' + entry);
  }
  assert.equal(isUploaded('workers/site-router.mjs'), false, 'Worker source must not be a public asset');
  assert.equal(isUploaded('workers/contact-api/src/index.mjs'), false);
  assert.equal(isUploaded('workers/contact-api/src/contact-handler.mjs'), false);
  assert.equal(isUploaded('workers/contact-api/wrangler.jsonc'), false);
  for (const kept of ['workers/site-router.mjs', 'workers/contact-api/src/index.mjs',
    'workers/contact-api/src/contact-handler.mjs', 'workers/contact-api/test/contact-handler.test.mjs',
    'workers/contact-api/wrangler.jsonc']) {
    assert.ok(fs.existsSync(path.join(root, kept)), 'source must stay in Git, not be deleted: ' + kept);
    assert.ok(fs.statSync(path.join(root, kept)).size > 0, 'kept source must be non-empty: ' + kept);
  }
  assert.ok(fs.readFileSync(path.join(root, 'workers/site-router.mjs'), 'utf8').includes('export default'),
    'the Router source content is unchanged in kind');
});

test('this hardening touches no governed Foundation file', () => {
  const sitemap = read('sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 52, 'sitemap entity set is unchanged');
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/chixiangmotor\.com\/sitemap\.xml$/m);
  assert.ok(!/ads/.test(sitemap), 'the paid page must stay out of the sitemap');
  const manifest = require('../scripts/site-entity-manifest.js').loadManifest(root);
  assert.equal(manifest.length, 52, 'manifest page set is unchanged');
});

test('the pdf directory stays public while the extracted text artifact is withheld', () => {
  // (4) only an exact-file rule was added - no broad pdf rule
  assert.ok(rules.includes('pdf/extracted.txt'), 'the exact carve-out rule must exist');
  assert.ok(!rules.includes('pdf/'), 'a broad pdf/ rule must not exist');
  assert.ok(!rules.includes('pdf/**'), 'a broad pdf/** rule must not exist');
  assert.deepEqual(rules.filter((r) => r.startsWith('pdf/')), ['pdf/extracted.txt'],
    'the pdf path may only carry the reviewed exact-file rule');
  // (1) the internal artifact is excluded from the upload but kept in Git
  assert.equal(isUploaded('pdf/extracted.txt'), false, 'extracted text must not be published');
  assert.ok(fs.existsSync(path.join(root, 'pdf', 'extracted.txt')),
    'the file must stay tracked on disk; only publication changes');
  // (2) and (3) every other real file under pdf/ remains uploadable
  const pdfFiles = listFiles('pdf');
  const realPdfs = pdfFiles.filter((file) => !PUBLIC_CARVE_OUTS.includes(file));
  assert.ok(realPdfs.length >= 1, 'expected at least one real PDF to stay public');
  for (const file of realPdfs) {
    assert.equal(isUploaded(file), true, 'actual PDF must stay uploadable: ' + file);
  }
  assert.ok(pdfFiles.includes('pdf/' + String.fromCharCode(0x6700, 0x65b0) + 'cdr21.pdf'),
    'the catalogue PDF must still be present under pdf/');
  // future PDFs must not be swallowed by a directory rule
  for (const file of ['pdf/catalog.pdf', 'pdf/2026 price list.pdf', 'pdf/deep/spec.pdf']) {
    assert.equal(isUploaded(file), true, 'future PDF assets must remain publishable: ' + file);
  }
  // (5) documented public roots keep working
  for (const sample of ['ads/algerie/index.html', 'ar/cg-engine.html', 'en/cg-engine.html',
    'es/motor-cg.html', 'pt/motor-cg.html', 'ru/dvigatel-cg.html', 'css/style.css',
    'css/algeria-landing.css', 'js/main.js', 'js/algeria-landing.js', 'images/logo.webp',
    'images/CB/1.webp']) {
    assert.equal(isUploaded(sample), true, 'public path must stay uploadable: ' + sample);
  }
  // (6) public root files
  for (const file of ['index.html', 'robots.txt', 'sitemap.xml', '_headers', '_redirects']) {
    assert.equal(isUploaded(file), true, 'public root file must stay uploadable: ' + file);
  }
  // (7) Worker invariants: still the Worker entry, still in Git, still not a static asset
  const Q = String.fromCharCode(34);
  const wrangler = read('wrangler.toml');
  assert.ok(wrangler.includes('main = ' + Q + 'workers/site-router.mjs' + Q),
    'the Worker entry point must remain unchanged');
  assert.ok(rules.includes('workers/') && rules.includes('workers/**'),
    'Worker source must stay excluded from the static asset upload');
  assert.equal(isUploaded('workers/site-router.mjs'), false);
  for (const kept of ['workers/site-router.mjs', 'workers/contact-api/src/index.mjs',
    'workers/contact-api/src/contact-handler.mjs']) {
    assert.ok(fs.existsSync(path.join(root, kept)), 'Worker source must remain in Git: ' + kept);
  }
});