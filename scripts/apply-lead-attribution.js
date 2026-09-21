const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const publicRoots = ['en', 'es', 'pt', 'ru', 'ar', 'ads'];
const checkOnly = process.argv.includes('--check');
const moduleFile = path.join(root, 'js', 'lead-attribution.js');
const protectedPages = new Set(['ru/gorizontalnyj-dvigatel.html']);

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function eligible(html) {
  return /wa\.me|api\.whatsapp\.com|data-whatsapp-(?:link|model)|action=["']\/api\/contact|js\/main\.js/i.test(html);
}

function scriptSource(file) {
  return path.relative(path.dirname(file), moduleFile).replace(/\\/g, '/');
}

function renderedTag(file, html) {
  const counter = /ym\(109483511,\s*["']init["']/.test(html)
    ? ' data-yandex-counter="109483511"'
    : '';
  return `<script src="${scriptSource(file)}"${counter}></script>`;
}

function updatePage(before, file) {
  const newline = before.includes('\r\n') ? '\r\n' : '\n';
  const desired = renderedTag(file, before);
  const existing = /<script\b[^>]*\bsrc=["'][^"']*\/js\/lead-attribution\.js["'][^>]*><\/script>/i;
  const interaction = /<script\b[^>]*\bsrc=["'][^"']*\/(?:main|algeria-landing|latam-cg-landing|central-asia-landing|russia-horizontal-landing)\.js["'][^>]*><\/script>/i;
  const currentMatch = before.match(existing);
  const currentInteraction = before.match(interaction);
  if (
    currentMatch &&
    currentMatch[0] === desired &&
    (!currentInteraction || currentMatch.index < currentInteraction.index)
  ) return before;

  let working = before;
  if (currentMatch) {
    const beforeTag = working.slice(0, currentMatch.index);
    const afterTag = working.slice(currentMatch.index + currentMatch[0].length);
    working = beforeTag + afterTag.replace(/^\r?\n/, '');
  }

  const match = working.match(interaction);
  if (match) {
    const lineStart = working.lastIndexOf('\n', match.index - 1) + 1;
    const linePrefix = working.slice(lineStart, match.index);
    const indent = (linePrefix.match(/^[ \t]*/) || [''])[0];
    const separator = linePrefix.trim() ? newline + indent : '';
    return working.replace(interaction, `${separator}${desired}${newline}${indent}${match[0]}`);
  }

  const bodyClose = working.match(/(^[ \t]*)<\/body>/im);
  if (!bodyClose) throw new Error(`${path.relative(root, file)}: no interaction script or body close`);
  return working.replace(/(^[ \t]*)<\/body>/im, `${bodyClose[1]}${desired}${newline}${bodyClose[0]}`);
}

const changed = [];
for (const directory of publicRoots.map(name => path.join(root, name))) {
  for (const file of htmlFiles(directory)) {
    const relative = path.relative(root, file).replace(/\\/g, '/');
    if (protectedPages.has(relative)) continue;
    const before = fs.readFileSync(file, 'utf8');
    if (!eligible(before)) continue;
    const after = updatePage(before, file);
    if (after === before) continue;
    changed.push(path.relative(root, file).replace(/\\/g, '/'));
    if (!checkOnly) fs.writeFileSync(file, after, 'utf8');
  }
}

console.log(`${changed.length} attribution pages need updates`);
if (checkOnly && changed.length) {
  for (const file of changed) console.error(file);
  process.exitCode = 1;
}
