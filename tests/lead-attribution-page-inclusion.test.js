const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const publicRoots = ['en', 'es', 'pt', 'ru', 'ar', 'ads'];

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function eligiblePages() {
  return publicRoots.flatMap(name => htmlFiles(path.join(root, name)))
    .filter(file => /wa\.me|api\.whatsapp\.com|data-whatsapp-(?:link|model)|action=["']\/api\/contact|js\/main\.js/i.test(fs.readFileSync(file, 'utf8')))
    .sort();
}

function scriptTags(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)]
    .map(match => ({ tag: match[0], src: match[1], index: match.index }));
}

test('every public inquiry page loads attribution exactly once before interaction code', () => {
  const pages = eligiblePages();
  assert.ok(pages.length >= 50, `unexpected inquiry-page count: ${pages.length}`);
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const scripts = scriptTags(html);
    const attribution = scripts.filter(item => item.src.endsWith('/js/lead-attribution.js'));
    assert.equal(attribution.length, 1, `${relative(file)}: attribution script count`);
    const interaction = scripts.find(item => /\/(?:main|algeria-landing|latam-cg-landing|central-asia-landing|russia-horizontal-landing)\.js$/.test(item.src));
    if (interaction) assert.ok(attribution[0].index < interaction.index, `${relative(file)}: attribution must load first`);
  }
});

test('declares the main Yandex counter only where it already exists', () => {
  for (const file of eligiblePages()) {
    const html = fs.readFileSync(file, 'utf8');
    const attribution = scriptTags(html).find(item => item.src.endsWith('/js/lead-attribution.js'));
    const metadata = attribution && attribution.tag.match(/\bdata-yandex-counter=["'](\d+)["']/i);
    const expected = /ym\(109483511,\s*["']init["']/.test(html) ? '109483511' : '';
    assert.equal(metadata ? metadata[1] : '', expected, `${relative(file)}: counter metadata`);
  }
});

test('application script is idempotent in check mode', () => {
  const script = path.join(root, 'scripts', 'apply-lead-attribution.js');
  assert.equal(fs.existsSync(script), true, 'application script is missing');
  const result = childProcess.spawnSync(process.execPath, [script, '--check'], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
