#!/usr/bin/env node
/**
 * Automated Search Engine & AI Indexing Push Script (IndexNow + GSC Batch Exporter)
 *
 * 1. Reads all 197 canonical URLs from sitemap.xml (EN / FR / ES / PT / RU / AR).
 * 2. Appends retired /zh-cn/ URLs so IndexNow engines (Bing, ChatGPT Search, Copilot,
 *    Yandex, Seznam, Naver) immediately recrawl them and observe HTTP 410 Gone.
 * 3. Exports a prioritized URL checklist to docs/geo-entity/GSC_PRIORITY_INDEXING_URLS.txt
 *    for Google Search Console.
 * 4. Optionally waits (--wait) for https://chixiangmotor.com/<KEY>.txt to be deployed
 *    on Cloudflare, then POSTs the full URL batch to IndexNow endpoints.
 *
 * Usage:
 *   node scripts/push-indexnow.js
 *   node scripts/push-indexnow.js --wait
 *   node scripts/push-indexnow.js --dry-run
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const HOST = 'chixiangmotor.com';
const ORIGIN = `https://${HOST}`;
const KEY = 'c8f4a2e9b1d74305a6c2e8f1b9d4037a';
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;

const isDryRun = process.argv.includes('--dry-run');
const shouldWait = process.argv.includes('--wait');

const RETIRED_ZH_URLS = [
  `${ORIGIN}/zh-cn/`,
  `${ORIGIN}/zh-cn/products`,
  `${ORIGIN}/zh-cn/about`,
  `${ORIGIN}/zh-cn/contact`,
  `${ORIGIN}/zh-cn/evidence`,
  `${ORIGIN}/zh-cn/factory`,
  `${ORIGIN}/zh-cn/domestic-wholesale`,
  `${ORIGIN}/zh-cn/cg-engine`,
  `${ORIGIN}/zh-cn/cb-engine`,
  `${ORIGIN}/zh-cn/horizontal-engine`,
  `${ORIGIN}/zh-cn/cargo-tricycle-engine`,
  `${ORIGIN}/zh-cn/ac320-atv-engine`,
  `${ORIGIN}/zh-cn/engine-parts`,
  `${ORIGIN}/zh-cn/engine-parts/hw-series`,
  `${ORIGIN}/zh-cn/bajaj-tvs-engines-parts`,
  `${ORIGIN}/zh-cn/bajaj-engine-parts`,
  `${ORIGIN}/zh-cn/tvs-engine-parts`,
  `${ORIGIN}/zh-cn/guides/`,
  `${ORIGIN}/zh-cn/guides/cg250-water-cooled-selection`,
  `${ORIGIN}/zh-cn/guides/engine-fitment-checklist`,
  `${ORIGIN}/zh-cn/guides/horizontal-engine-buying-checklist`,
  `${ORIGIN}/zh-cn/guides/how-to-verify-engine-factory`
];

function loadSitemapUrls() {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function writeGscChecklist(canonicalUrls) {
  const tier1 = canonicalUrls.filter((u) =>
    /^https:\/\/chixiangmotor\.com\/(?:en|fr|es|pt|ru|ar)\/(?:|products|news|evidence|about|contact|contacto|contato|kontakty)$/.test(u)
  );
  const tier2 = canonicalUrls.filter((u) =>
    !tier1.includes(u) &&
    /(?:cg-engine|motor-cg|dvigatel-cg|cb-engine|motor-cb|dvigatel-cb|horizontal-engine|motor-horizontal|gorizontalnyj-dvigatel|bajaj-tvs|hw-series|ac320|peru|colombia|russia|central-asia)/.test(u)
  );
  const tier3 = canonicalUrls.filter((u) => !tier1.includes(u) && !tier2.includes(u));

  const lines = [
    '# Chixiang Motor — Google Search Console & Bing Indexing Checklist',
    `# Generated: ${new Date().toISOString()}`,
    `# Active Canonical URLs: ${canonicalUrls.length} | Retired /zh-cn/ 410 URLs: ${RETIRED_ZH_URLS.length}`,
    '',
    '## 1. Google Search Console — Sitemap & Prefix Removal',
    `Sitemap URL: ${ORIGIN}/sitemap.xml`,
    `Removals (Prefix Removal for 410 Gone archive): ${ORIGIN}/zh-cn/`,
    '',
    `## 2. Tier 1 — Core Homepages, Product Hubs & Entry Pages (${tier1.length} URLs)`,
    ...tier1,
    '',
    `## 3. Tier 2 — Product Families, Flagship Engines, Bajaj/TVS & HW Parts (${tier2.length} URLs)`,
    ...tier2,
    '',
    `## 4. Tier 3 — 48 Multilingual B2B Buyer Guides (${tier3.length} URLs)`,
    ...tier3,
    ''
  ];

  const outPath = path.join(root, 'docs', 'geo-entity', 'GSC_PRIORITY_INDEXING_URLS.txt');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  return outPath;
}

async function waitForKeyDeployment(maxSeconds = 120) {
  const deadline = Date.now() + maxSeconds * 1000;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt += 1;
    try {
      const res = await fetch(`${KEY_LOCATION}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const text = (await res.text()).trim();
        if (text === KEY) {
          console.log(`[IndexNow] Key verified live at ${KEY_LOCATION} (attempt ${attempt}).`);
          return true;
        }
      }
      console.log(`[IndexNow] Waiting for Cloudflare deployment of ${KEY_LOCATION} (HTTP ${res.status}, attempt ${attempt})...`);
    } catch (err) {
      console.log(`[IndexNow] Network check attempt ${attempt}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return false;
}

async function submitIndexNow(endpoint, urlList) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const body = await res.text().catch(() => '');
  return { endpoint, status: res.status, statusText: res.statusText, body: body.slice(0, 300) };
}

async function main() {
  const canonicalUrls = loadSitemapUrls();
  const gscFile = writeGscChecklist(canonicalUrls);
  console.log(`[GSC] Exported prioritized URL checklist (${canonicalUrls.length} URLs) -> ${path.relative(root, gscFile)}`);

  const allUrls = [...new Set([...canonicalUrls, ...RETIRED_ZH_URLS])];
  console.log(`[IndexNow] Prepared ${allUrls.length} URLs (${canonicalUrls.length} canonical + ${RETIRED_ZH_URLS.length} retired /zh-cn/ 410 URLs).`);

  if (isDryRun) {
    console.log('[IndexNow] Dry run complete.');
    return;
  }

  if (shouldWait) {
    const ready = await waitForKeyDeployment(120);
    if (!ready) {
      console.warn(`[IndexNow] Warning: ${KEY_LOCATION} not yet reachable; attempting push anyway.`);
    }
  }

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ];

  for (const ep of endpoints) {
    try {
      const result = await submitIndexNow(ep, allUrls);
      console.log(`[IndexNow] POST ${result.endpoint} -> HTTP ${result.status} ${result.statusText}${result.body ? ` | ${result.body}` : ''}`);
    } catch (err) {
      console.error(`[IndexNow] POST ${ep} failed: ${err.message}`);
    }
  }
}

main();
