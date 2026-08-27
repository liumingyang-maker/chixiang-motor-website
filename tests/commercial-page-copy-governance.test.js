const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");
const { test } = require("node:test");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const H_PAGES = [
  "es/motor-horizontal.html",
  "pt/motor-horizontal.html",
  "ar/horizontal-engine.html",
];

const EN24 = [
  "en/index.html",
  "en/cb-engine.html",
  "en/cg-engine.html",
  "en/engine-parts.html",
  "en/horizontal-engine.html",
];

const CB_SHARED = [
  "es/motor-horizontal.html",
  "es/motor-cg.html",
  "pt/motor-horizontal.html",
  "pt/motor-cg.html",
  "ar/horizontal-engine.html",
  "en/index.html",
];

test("horizontal titles drop the false 50cc-125cc range and keep approved 110-150", () => {
  for (const f of H_PAGES) {
    const title = (read(f).match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
    assert.ok(!/50cc-125cc/i.test(title), f + " title still has 50cc-125cc");
    assert.match(title, /110/, f + " title missing 110");
    assert.match(title, /150/, f + " title missing 150");
  }
  // motorcycle qualifier survives, in each page language
  assert.match(read("es/motor-horizontal.html"), /para Motocicleta/);
  assert.match(read("pt/motor-horizontal.html"), /para Moto\b/);
  assert.match(read("ar/horizontal-engine.html"), /\u0644\u0644\u062f\u0631\u0627\u062c\u0627\u062a \u0627\u0644\u0646\u0627\u0631\u064a\u0629/);
});

test("no 24-hour reply promise on the five English commercial pages", () => {
  for (const f of EN24) {
    assert.doesNotMatch(read(f), /within 24 hours/i, f + " still has 24h promise");
    assert.doesNotMatch(read(f), /reply within/i, f + " still has reply within");
  }
});

test("CB pages and shared cards carry no unsupported torque/vibration claim", () => {
  const en = read("en/cb-engine.html");
  assert.doesNotMatch(en, /strong torque/i);
  assert.doesNotMatch(en, /low vibration/i);
  const es = read("es/motor-cb.html");
  assert.doesNotMatch(es, /buen torque/i);
  assert.doesNotMatch(es, /baja vibraci/i);
  const pt = read("pt/motor-cb.html");
  assert.doesNotMatch(pt, /bom torque/i);
  assert.doesNotMatch(pt, /baixa vibra/i);
  const ar = read("ar/cb-engine.html");
  assert.doesNotMatch(ar, /\u0639\u0632\u0645 \u0642\u0648\u064a/);
  assert.doesNotMatch(ar, /\u0648\u0627\u0647\u062a\u0632\u0627\u0632/);
  for (const f of CB_SHARED) {
    const t = read(f);
    assert.doesNotMatch(t, /strong torque|buen torque|bom torque/i, f);
    assert.doesNotMatch(t, /low vibration|baja vibraci|baixa vibra/i, f);
    assert.doesNotMatch(t, /\u0639\u0632\u0645 \u0642\u0648\u064a/, f);
  }
});

test("approved CB facts and the off-road qualifier are preserved", () => {
  const en = read("en/cb-engine.html");
  for (const s of ["CB150", "149 cc", "Air-cooled", "5-speed constant mesh", "subject to configuration"]) {
    assert.ok(en.includes(s), "en/cb missing approved fact: " + s);
  }
  assert.match(read("es/motor-cb.html"), /seg\u00fan configuraci\u00f3n/);
  assert.match(read("pt/motor-cb.html"), /conforme configura\u00e7\u00e3o/);
  assert.match(read("ar/cb-engine.html"), /\u062d\u0633\u0628 \u0627\u0644\u062a\u0643\u0648\u064a\u0646/);
});

test("no broken horizontal-card png reference remains in any HTML file", () => {
  const pngToken = "3504ab0b-70d8-42bd-ab24-cddc34045a26.png";
  const htmls = [];
  (function walk(d) {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const rel = path.join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith(".html")) htmls.push(rel);
    }
  })(".");
  assert.ok(htmls.length > 0, "no html files discovered");
  for (const h of htmls) {
    assert.ok(!fs.readFileSync(path.join(root, h), "utf8").includes(pngToken), h + " still references broken png");
  }
});

test("the corresponding webp asset exists on disk", () => {
  assert.ok(
    fs.existsSync(path.join(root, "images", "\u5367\u5F0F\u7535\u542F\u52A8", "3504ab0b-70d8-42bd-ab24-cddc34045a26.webp")),
    "webp asset missing"
  );
});

test("frozen contracts intact on the three edited horizontal owner pages", () => {
  const canon = {
    "es/motor-horizontal.html": "https://chixiangmotor.com/es/motor-horizontal",
    "pt/motor-horizontal.html": "https://chixiangmotor.com/pt/motor-horizontal",
    "ar/horizontal-engine.html": "https://chixiangmotor.com/ar/horizontal-engine",
  };
  for (const f in canon) {
    const t = read(f);
    assert.equal((t.match(/<h1\b/gi) || []).length, 1, f + " h1 count");
    assert.ok(t.includes(canon[f]), f + " canonical changed");
    assert.ok(t.includes('data-product-family-owner="horizontal"'), f + " owner attr changed");
    assert.ok(t.includes("#webpage") && t.includes("#breadcrumb"), f + " schema ids changed");
  }
});
