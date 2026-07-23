const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('ru/russia/index.html');
const css = read('css/russia-landing.css');

// 1. Exactly one H1
test('exactly one H1 on the page', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
});

// 2. H1 has id=rl-title
test('H1 has id="rl-title"', () => {
  assert.match(html, /<h1 id="rl-title">/);
});

// 3. aria-labelledby points to a real element
test('aria-labelledby points to a real element id', () => {
  const refs = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length > 0, 'has aria-labelledby');
  for (const ref of refs) {
    assert.match(html, new RegExp(`id="${ref}"`), `aria-labelledby target #${ref} exists`);
  }
});

// 4. Uses the same hero background as Central Asia
test('uses the Central Asia hero background image', () => {
  assert.match(html, /images\/central-asia-hero-bg-v2\.png/);
});

// 5. Hero has three figures
test('hero contains three figure elements', () => {
  const stage = (html.match(/class="rl-hero-stage p5-hero-art p5-hero-collage"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/) || [''])[0];
  assert.equal((stage.match(/<figure /g) || []).length, 3);
});

// 6. Three product labels exist
test('three hero product labels exist', () => {
  assert.match(html, /<strong>CB Off-Road<\/strong>/);
  assert.match(html, /<strong>CG Balancer<\/strong>/);
  assert.match(html, /<strong>Horizontal Under<\/strong>/);
});

// 7. CG Balancer uses cg平衡轴 image
test('CG Balancer card uses cg平衡轴 image', () => {
  assert.match(html, /images\/cg平衡轴\/黑色摩托车引擎特写\.webp/);
});

// 8. CG Balancer does NOT use cg银白色 image
test('CG Balancer does not use cg银白色 image', () => {
  assert.doesNotMatch(html, /images\/cg银白色\//);
});

// 9. Normal horizontal uses 卧式电启动 image
test('normal horizontal card uses 卧式电启动 image', () => {
  assert.match(html, /images\/卧式电启动\/3504ab0b-70d8-42bd-ab24-cddc34045a26\.webp/);
});

// 10. Normal horizontal does NOT use 普通水冷 image
test('normal horizontal does not use 普通水冷 image', () => {
  assert.doesNotMatch(html, /images\/普通水冷\//);
});

// 11. Horizontal Under has no unconfirmed 125–250
test('Horizontal Under has no unconfirmed 125–250 displacement', () => {
  const huCard = (html.match(/<h3>Horizontal Under<\/h3>[\s\S]*?<\/article>/) || [''])[0];
  assert.doesNotMatch(huCard, /125–250/);
});

// 12. No "усиленные крепления"
test('no "усиленные крепления" claim', () => {
  assert.doesNotMatch(html, /усиленные крепления/i);
});

// 13. No "для трициклов" promise for Horizontal Under
test('no "для трициклов" promise for Horizontal Under', () => {
  const huCard = (html.match(/<h3>Horizontal Under<\/h3>[\s\S]*?<\/article>/) || [''])[0];
  assert.doesNotMatch(huCard, /для трициклов/i);
});

// 14. hreflang ru-RU
test('hreflang ru-RU present', () => {
  assert.match(html, /hreflang="ru-RU"/);
});

// 15. hreflang ru
test('hreflang ru present', () => {
  assert.match(html, /hreflang="ru"/);
});

// 16. x-default
test('hreflang x-default present', () => {
  assert.match(html, /hreflang="x-default"/);
});

// 17. All product links use product-detail.html
test('all series detail links use product-detail.html', () => {
  const links = [...html.matchAll(/href="\/en\/product-detail[^"]*"/g)].map(m => m[0]);
  assert.ok(links.length > 0, 'has product-detail links');
  for (const link of links) {
    assert.match(link, /product-detail\.html\?series=/, `link uses .html route: ${link}`);
  }
});

// 18. Mobile CSS uses scroll-snap
test('mobile hero CSS uses scroll-snap', () => {
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /scroll-snap-align:\s*center/);
});

// 19. Mobile hero is NOT repeat(3,1fr)
test('mobile hero stage is not a forced 3-column grid', () => {
  const mobileBlock = css.split('@media (min-width: 768px)')[0];
  assert.doesNotMatch(mobileBlock, /\.rl-hero-stage\s*\{[^}]*repeat\(3,\s*1fr\)/);
  assert.match(mobileBlock, /\.rl-hero-stage\s*\{[\s\S]*?display:\s*flex/);
});

// 20. Full nav breakpoint is not earlier than 1024px
test('full nav breakpoint is >=1024px', () => {
  const navShow = css.match(/@media \(min-width: (\d+)px\)\s*\{[^@]*?\.rl-nav \{[^}]*display: flex/);
  assert.ok(navShow, 'nav display:flex is inside a media query');
  assert.ok(parseInt(navShow[1], 10) >= 1024, `nav breakpoint ${navShow[1]}px >= 1024px`);
});

// 21. form.p5-form preserved
test('form.p5-form preserved', () => {
  assert.match(html, /class="p5-form rl-form"/);
});

// 22. honeypot preserved
test('honeypot field preserved', () => {
  assert.match(html, /name="website"/);
  assert.match(html, /p5-honeypot/);
});

// 23. Russia is Yandex-only
test('Russia loads Yandex Metrica', () => {
  assert.match(html, /js\/yandex-metrica\.js/);
});

// 24. No Google Tag
test('no Google Tag on Russia page', () => {
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag/);
  assert.doesNotMatch(html, /AW-16777656395/);
});

// 25. All local image paths exist
test('all local image paths exist on disk', () => {
  const imgs = [...html.matchAll(/src="(\.\.\/\.\.\/images\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(imgs.length > 0, 'has local images');
  for (const rel of imgs) {
    const abs = path.join(root, 'ru', 'russia', rel);
    assert.ok(fs.existsSync(abs), `image exists: ${rel}`);
  }
});
