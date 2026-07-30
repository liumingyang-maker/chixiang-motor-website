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

test('publishes approved configurations without legacy measurement conflicts', () => {
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

  assert.doesNotMatch(html, /CX152FMH-(?:5B|6)/);
  assert.doesNotMatch(html, /106\.7|123\.67|52\.4\s*[x×]\s*49\.5|54\s*[x×]\s*54/);
  assert.doesNotMatch(html, /Automatic wet multi-plate/);
});

test('retains canonical, one H1, and existing contact paths', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/chixiangmotor\.com\/en\/horizontal-engine">/);
  assert.match(html, /href="\/en\/contact"/);
  assert.match(html, /https:\/\/wa\.me\/8619008225410/);
});
