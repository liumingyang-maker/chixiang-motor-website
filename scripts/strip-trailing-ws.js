const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('git diff --name-only b5acee0 HEAD', { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter(f => f.endsWith('.md') || f.endsWith('.html') || f.endsWith('.xml') || f.endsWith('.js') || f.endsWith('.csv'));

for (const f of files) {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  // strip trailing spaces/tabs on each line
  s = s.split(/\r?\n/).map(line => line.replace(/[ \t]+$/, '')).join('\n');
  // collapse trailing newlines at EOF to single newline
  s = s.replace(/\n+$/, '\n');
  if (s !== before) {
    fs.writeFileSync(p, s, 'utf8');
    console.log('cleaned', f);
  }
}
console.log('done');
