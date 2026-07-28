const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const verificationFile = path.join(
  __dirname,
  '..',
  'yandex_8a3590afcb928a95.html'
);

test('publishes the Yandex Webmaster verification file at the site root', () => {
  assert.ok(
    fs.existsSync(verificationFile),
    'the exact verification filename must exist at the site root'
  );

  const html = fs.readFileSync(verificationFile, 'utf8');
  assert.match(
    html,
    /<meta http-equiv="Content-Type" content="text\/html; charset=UTF-8">/
  );
  assert.match(html, /<body>Verification: 8a3590afcb928a95<\/body>/);
});
