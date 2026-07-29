const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function ruleBody(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'));
  assert.ok(match, `missing CSS rule for ${selector}`);
  return match[1];
}

test('Russia market page uses shrink-safe grids, actions, and media', () => {
  const css = read('css/phase5-market-pages.css');

  assert.match(css, /\.p5-hero-grid\s*>\s*\*[\s\S]*?min-width\s*:\s*0/);
  assert.match(css, /\.p5-button[\s\S]*?max-width\s*:\s*100%[\s\S]*?overflow-wrap\s*:\s*anywhere/);
  assert.match(css, /\.p5-hero-art\s+img[\s\S]*?max-width\s*:\s*100%/);
  assert.match(css, /\.p5-product-card[\s\S]*?min-width\s*:\s*0/);
});

test('Russian horizontal landing contains content without a page-level overflow mask', () => {
  const css = read('css/russia-horizontal-landing.css');

  assert.doesNotMatch(ruleBody(css, '.rh-page'), /overflow-x\s*:/);
  assert.match(css, /\.rh-hero-inner\s*>\s*\*[\s\S]*?min-width\s*:\s*0/);
  assert.match(css, /\.rh-button[\s\S]*?max-width\s*:\s*100%[\s\S]*?overflow-wrap\s*:\s*anywhere/);
  assert.match(css, /\.rh-product-image\s+img[\s\S]*?max-width\s*:\s*100%/);
});

test('Peru cards shrink to 390px without hiding root overflow', () => {
  const css = read('css/latam-cg-landing.css');

  assert.doesNotMatch(ruleBody(css, '.latam-page'), /overflow-x\s*:/);
  assert.match(css, /\.latam-product-copy[\s\S]*?min-width\s*:\s*0/);
  assert.match(css, /@media\s*\(max-width:767px\)[\s\S]*?\.latam-volume[\s\S]*?white-space\s*:\s*normal/);
  assert.match(css, /\.latam-button[\s\S]*?max-width\s*:\s*100%[\s\S]*?overflow-wrap\s*:\s*anywhere/);
  assert.match(css, /\.latam-hero-engine\s+img[\s\S]*?max-width\s*:\s*100%/);
});
