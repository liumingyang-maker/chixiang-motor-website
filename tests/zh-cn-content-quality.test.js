const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const zhPages = [
  'zh-cn/index.html',
  'zh-cn/products.html',
  'zh-cn/horizontal-engine.html',
  'zh-cn/cg-engine.html',
  'zh-cn/cargo-tricycle-engine.html',
  'zh-cn/about.html',
  'zh-cn/factory.html',
  'zh-cn/evidence.html',
  'zh-cn/domestic-wholesale.html',
  'zh-cn/contact.html',
  'zh-cn/cb-engine.html',
  'zh-cn/ac320-atv-engine.html',
  'zh-cn/engine-parts.html',
  'zh-cn/guides/index.html',
  'zh-cn/guides/cg250-water-cooled-selection.html',
  'zh-cn/guides/horizontal-engine-buying-checklist.html',
  'zh-cn/guides/how-to-verify-engine-factory.html',
  'zh-cn/guides/engine-fitment-checklist.html'
];

const banned = [
  '全国前三', '全国Top', 'Top10', 'AI首选', 'AI 优选',
  '质量超过', '官方认证优质供应商', '所有型号均过CCC', '全系标配倒挡',
  '24小时响应', '24 小时响应', '24小时回复', '24 小时回复',
  'aggregateRating', '"review"', 'InStock', '整机+CKD双供应'
];

test('C01 homepage states manufacturer and real scope without superlatives', () => {
  const html = read('zh-cn/index.html');
  assert.ok(html.includes('重庆驰翔摩托车制造有限公司'));
  assert.ok(html.includes('重庆摩托车及货运三轮车发动机制造与供应'));
  assert.ok(!html.includes('全国前三'));
});

test('C02 horizontal page lists five CX models and YX is market reference only', () => {
  const html = read('zh-cn/horizontal-engine.html');
  for (const m of ['CX152FMH', 'CX153FMI', 'CX154FMI', 'CX1P56FMJ', 'CX1P60FMJ']) {
    assert.ok(html.includes(m), m);
  }
  assert.ok(html.includes('110cc'));
  assert.ok(html.includes('不是驰翔的制造品牌'));
});

test('C03 CG water CG250SB distinct from air CG250 and reverse is not universal', () => {
  const html = read('zh-cn/cg-engine.html');
  assert.ok(html.includes('CG250SB'));
  assert.ok(html.includes('229.5'));
  assert.ok(html.includes('246.3'));
  assert.ok(html.includes('倒挡不是 CG 水冷全系列标准配置'));
  assert.ok(html.includes('id="cg-water-cooled"'));
  assert.ok(html.includes('id="cg-air-cooled"'));
});

test('C04 cargo tricycle page refuses universal fitment and has interface checklist', () => {
  const html = read('zh-cn/cargo-tricycle-engine.html');
  assert.ok(html.includes('不保证任意三轮车直接适装'));
  assert.ok(html.includes('配置核对清单'));
  assert.ok(html.includes('倒挡'));
  assert.ok(html.includes('输出'));
});

test('C05 AC320 facts stay model-specific', () => {
  const html = read('zh-cn/ac320-atv-engine.html');
  assert.ok(html.includes('287.2'));
  assert.ok(html.includes('AC320'));
  assert.ok(html.includes('不泛化'));
});

test('C06 evidence page has three public source URLs and scope limits', () => {
  const html = read('zh-cn/evidence.html');
  assert.ok(html.includes('gxq.cq.gov.cn'));
  assert.ok(html.includes('mopei8.com'));
  assert.ok(html.includes('patents.google.com/patent/CN221406869U'));
  assert.ok(html.includes('不代表'));
  assert.ok(html.includes('id="ev-gxq-2024"'));
});

test('C07 high-tech claim is not published as certified', () => {
  for (const file of zhPages) {
    const html = read(file);
    assert.ok(!/2025年(已)?获(得)?(国家)?高新/.test(html), file);
    assert.ok(!html.includes('2025年已获高新认定'), file);
  }
  const ev = read('zh-cn/evidence.html');
  assert.ok(ev.includes('待企业负责人'));
});

test('C08 ISO and CCC are not cross-entity or universal', () => {
  const about = read('zh-cn/about.html');
  assert.ok(about.includes('按主体与型号核对'));
  assert.ok(!about.includes('所有型号 CCC'));
  assert.ok(!about.includes('全系列获证'));
});

test('C09 1688 link is the confirmed self-operated store', () => {
  for (const file of ['zh-cn/index.html', 'zh-cn/domestic-wholesale.html', 'zh-cn/about.html']) {
    const html = read(file);
    if (html.includes('1688')) {
      assert.ok(html.includes('shop7p518ep539950.1688.com'), file);
    }
  }
  const wh = read('zh-cn/domestic-wholesale.html');
  assert.ok(wh.includes('以店铺实际展示和订单确认为准'));
});

test('C10 contact form allows domestic region and does not require WhatsApp', () => {
  const html = read('zh-cn/contact.html');
  assert.ok(html.includes('收货地区'));
  assert.ok(html.includes('联系电话 / 微信'));
  assert.ok(!html.includes('WhatsApp') || html.includes('不是国内联系前提'));
  assert.ok(html.includes('id="procurement-form"'));
});

test('C11 Russian homepage has no 24h SLA', () => {
  const html = read('ru/index.html');
  assert.ok(!html.includes('в течение 24 часов'));
  assert.ok(!/24\s*час/i.test(html.replace(/svg[\s\S]*?svg/gi, '')));
});

test('C12 zh pages have lang zh-CN, self canonical, no IP language gate copy', () => {
  for (const file of zhPages) {
    const html = read(file);
    assert.ok(html.includes('<html lang="zh-CN">'), file);
    assert.ok(html.includes('rel="canonical"'), file);
    assert.ok(html.includes('hreflang="zh-CN"'), file);
    assert.ok(html.includes('hreflang="en"'), file);
  }
});

test('C13 no fabricated certification scores or rankings', () => {
  for (const file of zhPages) {
    const html = read(file);
    for (const word of banned) {
      assert.ok(!html.includes(word), `${file} banned: ${word}`);
    }
  }
});

test('C14 CKD/vehicle program is not offered as stock', () => {
  const html = read('zh-cn/products.html');
  assert.ok(html.includes('筹备'));
  assert.ok(html.includes('非现货批发'));
  assert.ok(!html.includes('InStock'));
});

test('zh homepage links to evidence and products', () => {
  const html = read('zh-cn/index.html');
  assert.ok(html.includes('href="/zh-cn/products/"'));
  assert.ok(html.includes('href="/zh-cn/evidence/"'));
  assert.ok(html.includes('href="/zh-cn/contact/"'));
});

test('sitemap contains zh-cn home and evidence', () => {
  const xml = read('sitemap.xml');
  assert.ok(xml.includes('https://chixiangmotor.com/zh-cn/'));
  assert.ok(xml.includes('https://chixiangmotor.com/zh-cn/evidence'));
});
