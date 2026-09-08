const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const generatorFile = path.join(root, 'scripts', 'apply-product-family-owner-content.js');
const manifestFile = path.join(root, 'scripts', 'product-family-owner-manifest.js');
const generatorSource = fs.readFileSync(generatorFile, 'utf8');
const { routes, locales } = require(manifestFile);

function toCrlf(text) {
  return text.replace(/\r?\n/g, '\r\n');
}

function memoryFiles(overrides = {}) {
  const files = new Map();
  const factFile = path.join(root, 'docs', 'geo-entity', 'fact-calibration', 'ENGINE_SPEC_MASTER.csv');
  files.set(path.resolve(factFile), fs.readFileSync(factFile, 'utf8'));
  for (const route of routes) {
    const file = path.resolve(root, route.file);
    files.set(file, toCrlf(fs.readFileSync(file, 'utf8')));
  }
  for (const [file, content] of Object.entries(overrides)) {
    files.set(path.resolve(root, file), content);
  }
  return files;
}

function runGenerator(files, { checkOnly = false } = {}) {
  const writes = [];
  const logs = [];
  const controlledFs = {
    readFileSync(file) {
      const resolved = path.resolve(file);
      if (!files.has(resolved)) throw new Error(`Unexpected read: ${resolved}`);
      return files.get(resolved);
    },
    writeFileSync(file, content) {
      const resolved = path.resolve(file);
      if (!files.has(resolved)) throw new Error(`Unexpected write: ${resolved}`);
      writes.push(resolved);
      files.set(resolved, content);
    }
  };
  const processStub = {
    argv: checkOnly ? ['node', generatorFile, '--check'] : ['node', generatorFile],
    exitCode: 0
  };
  const allowedModules = new Map([
    ['node:fs', controlledFs],
    ['node:path', path],
    ['node:crypto', require('node:crypto')],
    ['./product-family-owner-manifest', { routes, locales }]
  ]);
  const controlledRequire = request => {
    if (!allowedModules.has(request)) throw new Error(`Blocked module request: ${request}`);
    return allowedModules.get(request);
  };
  const wrapped = `(function (require, module, exports, __dirname, __filename, process, console) {\n${generatorSource}\n})`;
  const execute = vm.runInNewContext(wrapped, {}, { filename: generatorFile });
  execute(
    controlledRequire,
    { exports: {} },
    {},
    path.dirname(generatorFile),
    generatorFile,
    processStub,
    { log: message => logs.push(message), error: message => logs.push(message) }
  );
  return { writes, logs, exitCode: processStub.exitCode };
}

test('does not rewrite synchronized CRLF product-family pages', () => {
  const result = runGenerator(memoryFiles());
  assert.deepEqual(result.writes, []);
  assert.equal(result.exitCode, 0);
});

test('detects a real managed-content drift on a CRLF page', () => {
  const file = 'en/cg-engine.html';
  const source = toCrlf(fs.readFileSync(path.join(root, file), 'utf8'));
  const marker = '<!-- PRODUCT FAMILY OWNER START -->';
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1);
  const beforeOwner = source.slice(0, markerIndex + marker.length);
  const afterOwner = source.slice(markerIndex + marker.length);
  const changedOwner = afterOwner.replace('Approved product family information', 'Drifted product family information');
  assert.notEqual(changedOwner, afterOwner);

  const result = runGenerator(memoryFiles({ [file]: beforeOwner + changedOwner }));
  assert.deepEqual(result.writes, [path.resolve(root, file)]);
  assert.equal(result.exitCode, 0);
});

test('rejects mixed newlines rather than normalizing a whole page', () => {
  const file = 'en/cg-engine.html';
  const source = toCrlf(fs.readFileSync(path.join(root, file), 'utf8'));
  const firstNewline = source.indexOf('\r\n');
  assert.notEqual(firstNewline, -1);
  const mixed = source.slice(0, firstNewline) + '\n' + source.slice(firstNewline + 2);

  assert.throws(
    () => runGenerator(memoryFiles({ [file]: mixed })),
    /Unsupported mixed page newlines: .*en[\\/]cg-engine\.html/
  );
});

test('never writes the protected Russian horizontal page', () => {
  const file = 'ru/gorizontalnyj-dvigatel.html';
  const source = toCrlf(fs.readFileSync(path.join(root, file), 'utf8'));
  const changed = source.replace(' data-product-family-owner="horizontal"', '');
  assert.notEqual(changed, source);

  const result = runGenerator(memoryFiles({ [file]: changed }));
  assert.ok(!result.writes.includes(path.resolve(root, file)));
});
