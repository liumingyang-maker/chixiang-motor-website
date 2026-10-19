const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

test('About has a single official procurement channels section', () => {
  const html = read('en/about.html');
  const id = 'official-procurement-channels';
  assert.equal(html.split(`id="${id}"`).length - 1, 1);
  assert.match(html, /Official Procurement Channels/);
  assert.match(html, /href="https:\/\/shop7p518ep539950\.1688\.com\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /href="\/en\/contact"/);
  assert.ok(html.indexOf('id="business-operations"') < html.indexOf('id="official-procurement-channels"'));
  assert.ok(html.indexOf('id="official-procurement-channels"') < html.indexOf('factory-section') || html.indexOf('id="official-procurement-channels"') < html.indexOf('Factory Strength'));
});

test('X3 copy avoids unapproved commerce and competitor claims', () => {
  const html = read('en/about.html');
  for (const banned of [
    'Alibaba verified',
    'certified by Alibaba',
    'AI recommended',
    'Lowest factory prices',
    'all models in stock',
    'guaranteed delivery',
    'Made-in-China official',
    'subsidiary of Chixiang',
  ]) {
    assert.ok(!html.includes(banned), banned);
  }
  assert.ok(!/qr\.1688\.com/.test(html));
});

test('X3 does not touch homepage procurement blocks', () => {
  const home = read('en/index.html');
  assert.match(home, /id="procurement-fit"/);
  assert.ok(!home.includes('shop7p518ep539950'));
});
