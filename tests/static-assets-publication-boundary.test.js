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

/* The complete, reviewed rule set. Any new rule must be an explicit decision. */
const EXPECTED_RULES = [
  '.git/', '.git/**', '.github/', '.github/**', 'node_modules/', 'node_modules/**',
  '_deploy/', '_deploy/**', '_github_upload/', '_github_upload/**',
  '_github_upload_packages/', '_github_upload_packages/**',
  '\u6587\u6863/', '\u6587\u6863/**', '*.zip', '*.log', 'UPLOAD_STEPS.txt',
  '.assetsignore', '.gitignore', 'AGENTS.md', 'README.md',
  'FOUNDATION_AUDIT_REPORT.md', 'FOUNDATION_FIX_REPORT.md', 'serve.json',
  'wrangler.toml', 'package.json', 'package-lock.json',
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