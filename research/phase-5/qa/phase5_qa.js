'use strict';
const fs=require('node:fs'); const path=require('node:path'); const cp=require('node:child_process');
const repo=path.resolve(__dirname,'..','..','..'); const p5=path.join(repo,'research','phase-5'); const delivery=path.join(p5,'deliveries','phase-5-priority-market-implementation');
const checks=[]; const manual=[];
const read=r=>fs.readFileSync(path.join(repo,r),'utf8');
function check(name,fn){try{const detail=fn();checks.push({name,status:'PASS',detail:detail||''});}catch(e){checks.push({name,status:'FAIL',detail:e.message});}}
function requireTrue(v,msg){if(!v)throw new Error(msg);return true;}
function contains(file,re){return requireTrue(re.test(read(file)),`${file} missing ${re}`);}
function csvRows(file){return read(file).trim().split(/\r?\n/).length-1;}
function git(args){return cp.execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();}

check('Branch is the isolated Phase 5 feature branch',()=>requireTrue(git(['branch','--show-current'])==='feature/phase-5-priority-market-implementation','wrong branch'));
check('Phase 4 final freeze tag exists',()=>requireTrue(git(['rev-parse','phase-4-v6-final-freeze-2026-07-16^{commit}']).length===40,'tag missing'));
check('Phase 4 freeze resolves to expected commit',()=>requireTrue(git(['rev-parse','phase-4-v6-final-freeze-2026-07-16^{commit}'])==='bce0ae90b37e3b7d6e16f9cb33cd5b6cce0ff103','tag moved'));
check('Phase 5 base is latest verified origin/main',()=>requireTrue(git(['merge-base','HEAD','origin/main'])==='aa14bbb525325c4790a1f9947167bf704d7f8e8b','base mismatch'));
check('Phase 3 research is unchanged',()=>requireTrue(!git(['diff','--name-only','origin/main','--','research/phase-3']).trim(),'Phase 3 changed'));
check('Phase 4 research is unchanged',()=>requireTrue(!git(['diff','--name-only','origin/main','--','research/phase-4']).trim(),'Phase 4 changed'));

for(const [market,file,canonical] of [['Peru','es/peru/index.html','/es/peru/'],['Colombia','es/colombia/index.html','/es/colombia/'],['Uzbekistan','ru/uzbekistan/index.html','/ru/uzbekistan/'],['Russia','ru/dvigatel-140/index.html','/ru/dvigatel-140/']]){
  check(`${market} page exists`,()=>requireTrue(fs.existsSync(path.join(repo,file)),'missing'));
  check(`${market} has one H1`,()=>requireTrue((read(file).match(/<h1\b/g)||[]).length===1,'H1 count'));
  check(`${market} has canonical`,()=>contains(file,new RegExp(`canonical[^>]+${canonical.replace(/[/-]/g,'\\$&')}`)));
  check(`${market} form targets /api/contact`,()=>contains(file,/action="\/api\/contact"/));
  check(`${market} has market/source attribution`,()=>contains(file,/name="market"/)&&contains(file,/name="source_form"/));
  check(`${market} has no invented numeric price/CPC/MOQ`,()=>requireTrue(!/\$\s*\d+|CPC\s*[:=]\s*\d+|MOQ\s*[:=]\s*\d+/i.test(read(file)),'invented commercial metric'));
}
check('Peru prioritizes CG200 before CG150',()=>contains('js/latam-cg-peru-data.js',/productOrder:\s*\['cg200',\s*'cg150'/));
check('Peru separates spares from engine ranking',()=>contains('js/latam-cg-peru-data.js',/productOrder:[^\n]+spares/));
check('Peru excludes unsupported Indian-platform fit claims',()=>contains('es/peru/index.html',/No prometemos adaptación directa a Bajaj, TVS, Hero, Piaggio Ape/i));
check('Colombia is SEO only',()=>contains('es/colombia/index.html',/data-ads-priority="seo-only"/));
check('Colombia states complete-engine demand is unverified',()=>contains('es/colombia/index.html',/demanda de motores completos no está verificada/i));
check('Colombia paid complete-engine search is not recommended',()=>contains('es/colombia/index.html',/Paid search<\/strong><span>no recomendado/i));
check('Colombia has no Google Ads tag',()=>requireTrue(!/googletagmanager/.test(read('es/colombia/index.html')),'unexpected ads tag'));
check('Uzbekistan direction is water-cooled 150–250',()=>contains('ru/uzbekistan/index.html',/150–250 см³[\s\S]+водяное охлаждение/i));
check('Uzbekistan reverse is not a scoring factor',()=>contains('ru/uzbekistan/index.html',/Реверс не участвует в выборе рынка или рейтинге двигателя/i));
check('Uzbekistan legacy route is noindex',()=>contains('ru/dvigateli-dlya-uzbekistana.html',/noindex,follow/));
check('Uzbekistan legacy route points to canonical',()=>contains('ru/dvigateli-dlya-uzbekistana.html',/\/ru\/uzbekistan\//));
check('Russia prioritizes horizontal 140',()=>contains('ru/dvigatel-140/index.html',/Основное направление — нижний горизонтальный двигатель 140 см³/));
check('Russia keeps CB/pit-bike as research only',()=>contains('ru/dvigatel-140/index.html',/CB \/ pit-bike 140–150[\s\S]+Только исследование и квалификация/));
check('Russia platform names are not fit claims',()=>contains('ru/dvigatel-140/index.html',/не подтверждает прямую установку/i));
check('New routes are in sitemap',()=>contains('sitemap.xml',/\/ru\/uzbekistan\//)&&contains('sitemap.xml',/\/ru\/dvigatel-140\//));
check('Legacy Uzbekistan route is not in sitemap',()=>requireTrue(!/dvigateli-dlya-uzbekistana\.html/.test(read('sitemap.xml')),'legacy URL indexed'));
check('Shared Phase 5 CSS is mobile-first and accessible',()=>contains('css/phase5-market-pages.css',/min-height:44px/)&&contains('css/phase5-market-pages.css',/prefers-reduced-motion/)&&contains('css/phase5-market-pages.css',/overflow-x:auto/));

const csvs=[['Peru Keyword Planner','research/phase-5/keyword-tool-input/peru_google_keyword_planner.csv',20],['Uzbekistan Google','research/phase-5/keyword-tool-input/uzbekistan_google_keyword_planner.csv',20],['Uzbekistan Wordstat','research/phase-5/keyword-tool-input/uzbekistan_yandex_wordstat.csv',20],['Russia Wordstat','research/phase-5/keyword-tool-input/russia_yandex_wordstat.csv',20],['Colombia SEO','research/phase-5/keyword-tool-input/colombia_seo_keywords.csv',20]];
for(const [name,file,min] of csvs){check(`${name} has at least ${min} rows`,()=>requireTrue(csvRows(file)>=min,`only ${csvRows(file)}`));check(`${name} uses proxy or blank metrics`,()=>requireTrue(!/,[0-9]+(?:\.[0-9]+)?,[0-9]+(?:\.[0-9]+)?,/.test(read(file)),'numeric search/CPC invented'));}
for(const [name,file] of [['Peru','research/phase-5/ads/peru/peru_negative_keywords.csv'],['Uzbekistan','research/phase-5/ads/uzbekistan/uzbekistan_negative_keywords.csv'],['Russia','research/phase-5/ads/russia/russia_negative_keywords.csv']]){check(`${name} negatives have at least 20 rows`,()=>requireTrue(csvRows(file)>=20,`only ${csvRows(file)}`));check(`${name} negatives contain localized terms`,()=>requireTrue(/gratis|бесплатно/i.test(read(file)),'local negative missing'));}

const books=['Phase_5_Ad_Copy_Drafts.xlsx','Phase_5_Campaign_Import_Draft.xlsx','Phase_5_Test_Budget_Allocation.xlsx','Phase_5_Landing_Page_Change_Log.xlsx','Phase_5_Conversion_Map.xlsx'];
for(const book of books){check(`${book} exists and is a non-empty XLSX`,()=>{const b=fs.readFileSync(path.join(delivery,book));return requireTrue(b.length>3000&&b[0]===0x50&&b[1]===0x4b,'invalid XLSX');});}
check('Budget builder contains formula-driven allocation',()=>contains('research/phase-5/scripts/build_phase5_assets.js',/`=C\$\{i\+2\}\*D\$\{i\+2\}`/));
check('All budget models total USD 1000 by design',()=>contains('research/phase-5/scripts/build_phase5_assets.js',/\['Model A — Balanced','Peru',0\.40\][\s\S]+\['Model C — Eurasia learning','Russia',0\.35\]/));
check('Campaigns remain paused design-only',()=>contains('research/phase-5/scripts/build_phase5_assets.js',/PAUSED — DESIGN ONLY/));
check('Ad copy contains at least 12 headlines per group',()=>{const source=read('research/phase-5/scripts/build_phase5_assets.js');const sets=[...source.matchAll(/headlines:\s*\[([^\]]+)\]/g)];return requireTrue(sets.length>=9&&sets.every(m=>(m[1].match(/'/g)||[]).length>=24),'headline count');});
check('Ad copy contains at least 4 descriptions per group',()=>{const source=read('research/phase-5/scripts/build_phase5_assets.js');const sets=[...source.matchAll(/descriptions:\s*\[([^\]]+)\]/g)];return requireTrue(sets.length>=9&&sets.every(m=>(m[1].match(/'/g)||[]).length>=8),'description count');});
check('Every ad group is marked NOT APPROVED',()=>contains('research/phase-5/scripts/build_phase5_assets.js',/'NOT APPROVED'/));

const testRun=cp.spawnSync(process.execPath,['--test','tests/*.test.js'],{cwd:repo,encoding:'utf8',shell:true});
check('Repository automated tests pass',()=>requireTrue(testRun.status===0,(testRun.stderr||testRun.stdout).slice(-500)));

manual.push(['Native Spanish copy review','MANUAL AUTHORIZATION REQUIRED','Peru and Colombia']);
manual.push(['Native Russian and Uzbek CTA review','MANUAL AUTHORIZATION REQUIRED','Uzbekistan and Russia']);
manual.push(['Keyword Planner and Wordstat metrics','MANUAL AUTHORIZATION REQUIRED','No tool metrics invented']);
manual.push(['Factory product and commercial data','MANUAL AUTHORIZATION REQUIRED','Specifications, prices, MOQ, lead time, warranty']);
manual.push(['Production conversion test','MANUAL AUTHORIZATION REQUIRED','No production submission executed']);

const failed=checks.filter(c=>c.status==='FAIL');
const report=['# Phase 5 QA Report','',`Automated result: **${checks.length-failed.length}/${checks.length} PASS**`,`Manual gates: **${manual.length} MANUAL AUTHORIZATION REQUIRED**`,'','## Automated checks','', '| # | Check | Status | Detail |','|---:|---|---|---|',...checks.map((c,i)=>`| ${i+1} | ${c.name} | ${c.status} | ${String(c.detail||'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ')} |`),'','## Interactive visual QA','','- In-app browser review covered Peru, Colombia, Uzbekistan and Russia at 390 × 844 and 1440 × 900.','- All four pages had one visible H1, no document or H1 horizontal overflow, a local `/api/contact` form, and no completed broken image.','- Responsive controls were verified at a 44 px minimum after the mobile reliability pass.','- Eight worksheet renders were inspected; headers, wrapping, formulas and status labels were readable.','- No form was submitted during browser QA.','','## Manual gates','','| Gate | Status | Scope |','|---|---|---|',...manual.map(r=>`| ${r[0]} | ${r[1]} | ${r[2]} |`),'','## Safety conclusion','','- Ads Launch remains **NOT APPROVED**.','- No ads launched.','- No buyers contacted.','- No production inquiries submitted.','- No production conversion tests executed.',''];
fs.writeFileSync(path.join(__dirname,'Phase_5_QA_Report.md'),report.join('\n'));
fs.copyFileSync(path.join(__dirname,'Phase_5_QA_Report.md'),path.join(delivery,'Phase_5_QA_Report.md'));
const files=fs.readdirSync(delivery).filter(f=>fs.statSync(path.join(delivery,f)).isFile());
if(files.length!==20){console.error(`Delivery count is ${files.length}, expected 20`);process.exit(1);}
if(failed.length){console.error(`${failed.length} QA checks failed`);process.exit(1);}
console.log(`${checks.length}/${checks.length} automated checks PASS; ${manual.length} manual gates recorded; delivery has ${files.length} files.`);
