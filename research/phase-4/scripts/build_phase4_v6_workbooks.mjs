import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = new URL('../../../', import.meta.url);
const p4 = new URL('research/phase-4/', root);
const data = JSON.parse(await fs.readFile(new URL('data/phase4_v6_build.json', p4), 'utf8'));
const out = new URL('deliveries/2026-07-16_phase-4-v6-final/', p4);
const navy = '#163A5F', blue = '#D9EAF7', gold = '#F4B183', green = '#E2F0D9', red = '#FCE4D6';
const col = n => { let s=''; while(n){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)} return s };
const tier = n => n>=75?'S':n>=60?'A':n>=45?'B':n>=30?'C':'D';

async function book(name, sheets) {
  const wb = Workbook.create();
  for (const spec of sheets) {
    const ws = wb.worksheets.add(spec.name);
    const z = col(spec.headers.length), end = spec.rows.length + 1;
    ws.getRange(`A1:${z}${end}`).values = [spec.headers, ...spec.rows];
    ws.getRange(`A1:${z}1`).format = {fill:navy,font:{bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center'};
    ws.getRange(`A1:${z}${end}`).format.wrapText = true;
    ws.getRange(`A1:${z}${end}`).format.verticalAlignment = 'top';
    ws.getRange(`A1:${z}${end}`).format.rowHeight = 30;
    ws.getRange(`A:${z}`).format.columnWidth = 18;
    ws.getRange(`A1:${z}1`).format.rowHeight = 42;
    ws.freezePanes.freezeRows(1); ws.showGridLines = false;
    if (spec.formulas) for (const f of spec.formulas) ws.getRange(f.range).formulas = f.values;
    if (end > 1) {
      ws.getRange(`A2:${z}${end}`).conditionalFormats.addCustom(`=$A2="Colombia"`, {fill:blue});
      ws.getRange(`A2:${z}${end}`).conditionalFormats.addCustom(`=ISNUMBER(SEARCH("NOT APPROVED",$A2&$B2&$C2&$D2&$E2&$F2&$G2&$H2&$I2&$J2&$K2&$L2))`, {fill:red});
    }
  }
  const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:50}});
  if (!errors.ndjson.includes('matched 0')) throw new Error(`${name}: formula errors`);
  const file = await SpreadsheetFile.exportXlsx(wb); await file.save(fileURLToPath(new URL(name,out)));
}

await fs.mkdir(out,{recursive:true});
const mh=['Country','Product','Platform (0-30)','Complete-engine demand (0-20)','Channel (0-15)','Search (0-15)','Profit (0-10)','Supply (0-10)','Total (formula)','Tier (formula)','Demand type','Evidence IDs','Rationale','Market confidence','Engine confidence','Compatibility confidence','Application','Launch eligibility','Ads Launch'];
const mr=data.matrix.map(r=>[r.Country,r.Product,...r.scores,null,null,r['Demand type'],r['Evidence IDs'],r.Rationale,r['Market confidence'],r['Engine confidence'],r['Compatibility confidence'],r.Application,r['Launch eligibility'],'NOT APPROVED']);
const mf=mr.flatMap((_,i)=>[{range:`I${i+2}:J${i+2}`,values:[[`=SUM(C${i+2}:H${i+2})`,`=IF(I${i+2}>=75,"S",IF(I${i+2}>=60,"A",IF(I${i+2}>=45,"B",IF(I${i+2}>=30,"C","D"))))`]]}]);
await book('Phase_4_Product_Country_Matrix_v6.xlsx',[{name:'Product Country Matrix',headers:mh,rows:mr,formulas:mf}]);
await book('Phase_4_Country_Product_Demand_Ranking_v6.xlsx',[{name:'Engine Top 3',headers:['Country','Rank','Product','Total','Tier','Evidence IDs','Market confidence','Engine confidence','Compatibility confidence','Meaning'],rows:data.ranking.map(r=>[r.Country,r.Rank,r.Product,r.Total,r.Tier,r['Evidence IDs'],r['Market confidence'],r['Engine confidence'],r['Compatibility confidence'],r.Country==='Colombia'?'Relative research direction; demand not verified':'Frozen Phase 4 direction'])},{name:'Aftermarket Offer',headers:['Country','Offer','Route','Status','Ads Launch'],rows:data.countries.map(c=>[c,'Engine parts / spares pack',c==='Colombia'?'SEO / distributor development':'Aftermarket qualification','VALIDATE ECONOMICS','NOT APPROVED'])}]);
await book('Phase_4_Keyword_Master_v6.xlsx',[{name:'Keyword Master',headers:['Country','Language','Keyword','Chinese meaning','Product','Intent','Estimated demand','Search source','Status','Ad group','Landing page','Ads Launch','Evidence IDs'],rows:data.keywords.map(r=>[r.Country,r.Language,r.Keyword,r['Chinese meaning'],r.Product,r.Intent,r['Demand level'],r['Search source'],r.Status,r['Ad group'],r['Landing page'],r['Ads Launch'],r['Evidence IDs']])}]);

const genericNeg=['free','job','salary','toy','game','manual pdf','used motorcycle','repair near me','DIY','car engine','diesel','tractor','course','download','second hand'];
const neg=[]; for(const c of data.countries.filter(x=>x!=='Colombia')) for(const n of genericNeg) neg.push([c,'Local/native review required',n,'Phrase','Campaign','Policy rule']);
for(const r of data.colombia_negatives) neg.push([r.Country,r.Language,r['Negative keyword'],r['Match type'],r.Scope,r.Rule]);
await book('Phase_4_Negative_Keywords_v6.xlsx',[{name:'Negative Keywords',headers:['Country','Language','Negative keyword','Match type','Scope','Rule'],rows:neg}]);

const baseComp=[['Peru','Frozen baseline','See Batch 1.1','Frozen evidence map','See P4-PE IDs','Baseline preserved'],['Uzbekistan','Frozen baseline','See Batch 1.1','Frozen evidence map','See P4-UZ IDs','Baseline preserved'],['Ecuador','Frozen baseline','See Batch 2','Frozen evidence map','See P4-EC IDs','Baseline preserved'],['Tanzania','Frozen baseline','See Batch 2','Frozen evidence map','See P4-TZ IDs','Baseline preserved'],['Russia','Frozen baseline','YX / local retailers','Horizontal engines / parts','P4-RU-01..08','Baseline preserved']];
const coComp=data.colombia_competitors.map(r=>[r.Country,r['Record type'],r.Entity,r.Channel,r['Observed product'],r['Complete-engine status'],r['Evidence IDs'],r.Confidence]);
await book('Phase_4_Competitor_Product_Map_v6.xlsx',[{name:'Competitor Channel Map',headers:['Country','Record type','Entity','Channel','Observed product','Complete-engine status','Evidence IDs','Confidence'],rows:[...baseComp.map(r=>[...r.slice(0,5),'Frozen baseline',r[4],r[5]]),...coComp]}]);

const baseCamp=data.countries.filter(c=>c!=='Colombia').map(c=>[c,`${c} | Research Architecture`,c==='Russia'?'Yandex / SEO':'Google / SEO','Local language',c,'Frozen product directions','B2B research','PROXY DATA','DESIGN ONLY','NOT APPROVED','Frozen batch evidence']);
const coCamp=data.colombia_campaigns.map(r=>[r.Country,r.Campaign,r.Channel,r.Language,'Colombia',r['Primary product'],r.Intent,r['Search status'],r['Campaign status'],r['Ads Launch'],r['Evidence IDs']]);
await book('Phase_4_Campaign_Architecture_v6.xlsx',[{name:'Campaign Architecture',headers:['Country','Campaign','Channel','Language','Geo','Product','Intent','Search status','Campaign status','Ads Launch','Evidence IDs'],rows:[...baseCamp,...coCamp]}]);

const baseLand=data.countries.filter(c=>c!=='Colombia').map(c=>[c,'Existing Phase 4 roadmap','Country research page','Technical qualification before fit claims','INPUT REQUIRED','ROADMAP ONLY','NOT APPROVED','Frozen batch evidence']);
const coLand=data.colombia_landing.map(r=>[r.Country,r['Proposed URL'],r['Hero H1'],r['Supporting copy'],r['Compatibility disclaimer'],r.Status,'NOT APPROVED',r['Evidence IDs'],r.CTA,r['WhatsApp prefill'],r.FAQ,r['SEO title'],r['Meta description']]);
await book('Phase_4_Landing_Page_Roadmap_v6.xlsx',[{name:'Landing Page Roadmap',headers:['Country','URL','Hero / direction','Supporting copy','Compatibility disclaimer','Status','Ads Launch','Evidence IDs','CTA','WhatsApp prefill','FAQ','SEO title','Meta description'],rows:[...baseLand.map(r=>[...r,'','','','','']),...coLand]}]);
await book('Phase_4_Budget_Models_v6.xlsx',[{name:'Budget Models',headers:['Country','Model','CPC','Factory price','Freight','Margin','Status','Ads Launch'],rows:data.countries.map(c=>[c,'Ratio / formula framework only','','','','','INPUT REQUIRED','NOT APPROVED'])}]);
await book('Phase_4_Competitor_Product_Map_v6.xlsx',[{name:'Competitor Channel Map',headers:['Country','Record type','Entity','Channel','Observed product','Complete-engine status','Evidence IDs','Confidence'],rows:[...baseComp.map(r=>[...r.slice(0,5),'Frozen baseline',r[4],r[5]]),...coComp]}]);
console.log('Phase 4 v6 workbooks built with artifact-tool');
