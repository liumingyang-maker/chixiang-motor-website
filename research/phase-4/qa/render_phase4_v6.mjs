import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const root = new URL('../../../', import.meta.url);
const input = new URL('research/phase-4/deliveries/2026-07-16_phase-4-v6-final/', root);
const output = new URL('research/phase-4/qa/v6-renders/', root);
const books = [
  ['Phase_4_Country_Product_Demand_Ranking_v6.xlsx',['Engine Top 3','Aftermarket Offer']],
  ['Phase_4_Product_Country_Matrix_v6.xlsx',['Product Country Matrix']],
  ['Phase_4_Competitor_Product_Map_v6.xlsx',['Competitor Channel Map']],
  ['Phase_4_Keyword_Master_v6.xlsx',['Keyword Master']],
  ['Phase_4_Negative_Keywords_v6.xlsx',['Negative Keywords']],
  ['Phase_4_Campaign_Architecture_v6.xlsx',['Campaign Architecture']],
  ['Phase_4_Landing_Page_Roadmap_v6.xlsx',['Landing Page Roadmap']],
  ['Phase_4_Budget_Models_v6.xlsx',['Budget Models']],
];
await fs.mkdir(output,{recursive:true});
for (const [name,sheets] of books) {
  const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(new URL(name,input))));
  for (const sheetName of sheets) {
    const preview = await wb.render({sheetName,range:'A1:N25',scale:1,format:'png'});
    const safe=(name.replace('.xlsx','')+'_'+sheetName).replaceAll(/[^a-zA-Z0-9_-]/g,'_');
    await fs.writeFile(new URL(`${safe}.png`,output),new Uint8Array(await preview.arrayBuffer()));
  }
}
console.log('Rendered Phase 4 v6 workbook previews');
