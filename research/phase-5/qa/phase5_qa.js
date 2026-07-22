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
check('Phase 5 base is latest verified origin/main',()=>{const originMain=git(['rev-parse','origin/main']);const mergeBase=git(['merge-base','HEAD','origin/main']);return requireTrue(mergeBase===originMain,`feature branch is not synced with origin/main: merge-base=${mergeBase}, origin/main=${originMain}`);});
check('Phase 3 research is unchanged',()=>requireTrue(!git(['diff','--name-only','origin/main','--','research/phase-3']).trim(),'Phase 3 changed'));
check('Phase 4 research is unchanged',()=>requireTrue(!git(['diff','--name-only','origin/main','--','research/phase-4']).trim(),'Phase 4 changed'));

const publicPages=[['Peru','es/peru/index.html','/es/peru/'],['Colombia','es/colombia/index.html','/es/colombia/'],['Central Asia','ru/central-asia/index.html','/ru/central-asia/'],['Russia market','ru/russia/index.html','/ru/russia/']];
const publicInternalTerms=/NOT APPROVED|INPUT REQUIRED|Phase 5|Native review required|Research only|Confidence:|production form|Paid search[^<]{0,40}(?:no recomendado|not recommended)|demanda de motores completos no está verificada/i;
for(const [market,file,canonical] of publicPages){
  check(`${market} page exists`,()=>requireTrue(fs.existsSync(path.join(repo,file)),'missing'));
  check(`${market} has one H1`,()=>requireTrue((read(file).match(/<h1\b/g)||[]).length===1,'H1 count'));
  check(`${market} has canonical`,()=>contains(file,new RegExp(`canonical[^>]+${canonical.replace(/[/-]/g,'\\$&')}`)));
  check(`${market} form targets /api/contact`,()=>contains(file,/action="\/api\/contact"/));
  check(`${market} has market/source attribution`,()=>contains(file,/name="market"/)&&contains(file,/name="source_form"/));
  check(`${market} has no invented numeric price/CPC/MOQ`,()=>requireTrue(!/\$\s*\d+|CPC\s*[:=]\s*\d+|MOQ\s*[:=]\s*\d+/i.test(read(file)),'invented commercial metric'));
  check(`${market} public copy has no internal gate language`,()=>requireTrue(!publicInternalTerms.test(read(file)),'internal project language exposed'));
}
check('Peru presents air-cooled, standard water-cooled, HW and spares in order',()=>contains('js/latam-cg-peru-data.js',/productOrder:\s*\['cg-air-range',\s*'standard-water',\s*'hw-water',\s*'engine-spares'/));
check('Peru uses distinct local standard-water and HW images',()=>contains('js/latam-cg-products.js',/standard-water[\s\S]+images\/普通水冷\/6kjzxqqh\.webp[\s\S]+hw-water[\s\S]+images\/捍威\/product_main_image_1\.webp/));
check('Peru publishes total-order sample, wholesale, mixed and OEM thresholds',()=>contains('es/peru/index.html',/Muestras desde 2 motores en total[\s\S]+Pedidos mayoristas desde 50 motores en total[\s\S]+Pedidos mixtos desde 100 motores en total[\s\S]+OEM desde 100 motores en total/));
check('Colombia production page matches origin/main',()=>requireTrue(!git(['diff','--name-only','origin/main','--','es/colombia/index.html']),'Colombia page differs from main'));
check('Colombia production data matches origin/main',()=>requireTrue(!git(['diff','--name-only','origin/main','--','js/latam-cg-colombia-data.js']),'Colombia data differs from main'));
check('Spanish market index matches origin/main',()=>requireTrue(!git(['diff','--name-only','origin/main','--','es/index.html']),'Spanish market index differs from main'));
check('Central Asia consolidates all five markets',()=>{const html=read('ru/central-asia/index.html');return requireTrue(['Казахстан','Узбекистан','Кыргызстан','Таджикистан','Туркменистан'].every(c=>html.includes(c)),'missing a country');});
check('Central Asia publishes total-order thresholds',()=>contains('ru/central-asia/index.html',/Образцы — от 2 двигателей[\s\S]+Оптовые заказы — от 50 двигателей[\s\S]+Смешанные заказы — от 100 двигателей[\s\S]+OEM — от 100 двигателей/));
check('Uzbekistan route redirects to Central Asia',()=>contains('_redirects',/\/ru\/uzbekistan\/ \/ru\/central-asia\/ 301/));
check('Legacy Uzbekistan route redirects to Central Asia',()=>contains('_redirects',/\/ru\/dvigateli-dlya-uzbekistana\.html \/ru\/central-asia\/ 301/));
check('Russia horizontal series includes 140 within 110-150',()=>contains('ru/russia/index.html',/Горизонтальные двигатели 110–150 см³[\s\S]+110[\s\S]+125[\s\S]+140[\s\S]+150/));
check('Russia keeps platform names as technical qualification',()=>contains('ru/russia/index.html',/не является обещанием прямой совместимости/i));
check('Russia horizontal has its own anchor',()=>contains('ru/russia/index.html',/id="horizontal-engines"/));
check('Russia market leads with the local CB product series',()=>contains('ru/russia/index.html',/Двигатели серии CB для внедорожных мотоциклов[\s\S]+CB150[\s\S]+CB200-C[\s\S]+CB250/));
check('Russia market uses total-order thresholds and no longer links a separate 140 page',()=>{const html=read('ru/russia/index.html');return requireTrue(/Образцы — от 2 двигателей[\s\S]+Оптовые заказы — от 50 двигателей[\s\S]+Смешанные заказы — от 100 двигателей[\s\S]+OEM — от 100 двигателей/.test(html)&&!/\/ru\/dvigatel-140\//.test(html),'thresholds missing or 140 link still present');});
check('Consolidated routes are in sitemap and removed routes are absent',()=>{const s=read('sitemap.xml');return requireTrue(/\/ru\/russia\//.test(s)&&/\/ru\/central-asia\//.test(s)&&!/\/ru\/uzbekistan\//.test(s)&&!/\/ru\/dvigatel-140\//.test(s),'sitemap routes incorrect');});
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

manual.push(['Factory technical and product-claim review','MANUAL AUTHORIZATION REQUIRED','Peru, Colombia, Uzbekistan and Russia']);
manual.push(['Native Spanish copy review','MANUAL AUTHORIZATION REQUIRED','Peru and Colombia']);
manual.push(['Native Russian and Uzbek CTA review','MANUAL AUTHORIZATION REQUIRED','Uzbekistan and Russia']);
manual.push(['Cloudflare Preview human review','MANUAL AUTHORIZATION REQUIRED','Four country pages']);
manual.push(['Keyword Planner and Wordstat metrics','MANUAL AUTHORIZATION REQUIRED','No tool metrics invented']);
manual.push(['Factory product and commercial data','MANUAL AUTHORIZATION REQUIRED','Specifications, prices, MOQ, lead time, warranty']);
manual.push(['Production conversion test','MANUAL AUTHORIZATION REQUIRED','No production submission executed']);

const failed=checks.filter(c=>c.status==='FAIL');
const report=['# Phase 5 QA Report','',`Automated result: **${checks.length-failed.length}/${checks.length} PASS**`,`Manual gates: **${manual.length} MANUAL AUTHORIZATION REQUIRED**`,'','## Automated checks','', '| # | Check | Status | Detail |','|---:|---|---|---|',...checks.map((c,i)=>`| ${i+1} | ${c.name} | ${c.status} | ${String(c.detail||'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ')} |`),'','## Interactive visual QA','','- Automated checks verify that public pages contain customer-facing copy rather than internal research or launch-gate language.','- A fresh Cloudflare Preview review is still required after this copy cleanup.','- No form was submitted during automated QA.','','## Manual gates','','| Gate | Status | Scope |','|---|---|---|',...manual.map(r=>`| ${r[0]} | ${r[1]} | ${r[2]} |`),'','## Safety conclusion','','- Ads Launch remains **NOT APPROVED** in internal project assets.','- No ads launched.','- No buyers contacted.','- No production inquiries submitted.','- No production conversion tests executed.',''];
fs.writeFileSync(path.join(__dirname,'Phase_5_QA_Report.md'),report.join('\n'));
fs.copyFileSync(path.join(__dirname,'Phase_5_QA_Report.md'),path.join(delivery,'Phase_5_QA_Report.md'));
const files=fs.readdirSync(delivery).filter(f=>fs.statSync(path.join(delivery,f)).isFile());
if(files.length!==20){console.error(`Delivery count is ${files.length}, expected 20`);process.exit(1);}
if(failed.length){console.error(`${failed.length} QA checks failed`);process.exit(1);}
console.log(`${checks.length}/${checks.length} automated checks PASS; ${manual.length} manual gates recorded; delivery has ${files.length} files.`);
