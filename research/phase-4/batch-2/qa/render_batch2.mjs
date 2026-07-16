import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const delivery = new URL('../../deliveries/2026-07-16_phase-4-batch-2-ecuador-tanzania/', import.meta.url);
const rendered = new URL('./rendered/', import.meta.url);
const files = [
  'Phase_4_Country_Product_Demand_Ranking_v4.xlsx',
  'Phase_4_Product_Country_Matrix_v4.xlsx',
  'Phase_4_Competitor_Product_Map_v4.xlsx',
  'Phase_4_Keyword_Master_v4.xlsx',
  'Phase_4_Negative_Keywords_v4.xlsx',
  'Phase_4_Campaign_Architecture_v4.xlsx',
  'Phase_4_Landing_Page_Roadmap_v4.xlsx',
  'Phase_4_Budget_Models_v4.xlsx',
];

await fs.mkdir(rendered, { recursive: true });
for (const file of files) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(new URL(file, delivery))));
  const sheets = await workbook.inspect({ kind: 'sheet', include: 'id,name' });
  const first = JSON.parse(sheets.ndjson.split('\n').find(Boolean)).name;
  const preview = await workbook.render({ sheetName: first, autoCrop: 'all', scale: 1, format: 'png' });
  await fs.writeFile(new URL(file.replace('.xlsx', '.png'), rendered), new Uint8Array(await preview.arrayBuffer()));
  console.log(`${file}: ${first}`);
}
