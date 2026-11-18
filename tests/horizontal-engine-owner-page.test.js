const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'en', 'horizontal-engine.html'),
  'utf8'
);

test('publishes the five official CX horizontal models and nominal classes', () => {
  const models = {
    CX152FMH: '110',
    CX153FMI: '125',
    CX154FMI: '125',
    CX1P56FMJ: '140',
    CX1P60FMJ: '150'
  };

  for (const [model, nominal] of Object.entries(models)) {
    assert.match(html, new RegExp(model));
    assert.match(html, new RegExp(`${nominal} cc`));
  }
  assert.match(html, /110–150 cc/);
});

test('keeps Russian YX terminology as a market reference rather than the manufacturer', () => {
  for (const value of ['YX110-class', 'YX125-class', 'YX140-class', 'YX150-class', 'W150-2']) {
    assert.match(html, new RegExp(value));
  }
  assert.match(html, /Russian-market search and selection references/i);
  assert.match(html, /manufactured by CHIXIANG MOTOR/i);
  assert.doesNotMatch(html, /manufactured by (?:YX|Yinxiang)/i);
});

test('publishes approved configurations and owner-supplied catalog table', () => {
  assert.match(html, /Starting method/);
  assert.match(html, /Electric-starter position/);
  assert.match(html, /Kick or electric start/);
  assert.match(html, /Upper or lower/);
  assert.match(html, /Manual or semi-automatic/);
  assert.match(html, /Manual clutch/);
  assert.match(html, /4 gears/);
  assert.match(html, /Built-in reverse or 1\+1 gearbox/);
  assert.match(html, /internal cylinder-head oil circuit/i);
  assert.match(html, /no external oil radiator/i);

  assert.match(html, /id="horizontal-catalog-specs"/);
  assert.match(html, /CX152FMH-5B/);
  assert.match(html, /CX152FMH-6/);
  assert.match(html, /106\.7 ml/);
  assert.match(html, /123\.67 ml/);
  assert.match(html, /52\.4 × 49\.5 mm/);
  assert.match(html, /54 × 54 mm/);
  assert.match(html, /56 × 57 mm/);
  assert.match(html, /60 × 53 mm/);
  assert.match(html, /140 ml/);
  assert.match(html, /149\.8 ml/);
  assert.match(html, /8\.2 kW @ 8,000 rpm/);
  assert.match(html, /10\.2 kW @ 9,500 rpm/);
  assert.match(html, /Automatic wet multi-plate/);
});

test('retains canonical, one H1, and existing contact paths', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/chixiangmotor\.com\/en\/horizontal-engine">/);
  assert.match(html, /href="\/en\/contact"/);
  assert.match(html, /https:\/\/wa\.me\/8619008225410/);
});
