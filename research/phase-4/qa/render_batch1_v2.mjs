import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const packageDir = new URL("../deliveries/2026-07-16_phase-4-batch-1-corrected/", import.meta.url);
const outputDir = new URL("rendered/", import.meta.url);
await fs.mkdir(outputDir, { recursive: true });

const books = [
  "Phase_4_Product_Country_Matrix_v2.xlsx",
  "Phase_4_Country_Product_Demand_Ranking_v2.xlsx",
  "Phase_4_Competitor_Product_Map_v2.xlsx",
  "Phase_4_Keyword_Master_v2.xlsx",
  "Phase_4_Negative_Keywords_v2.xlsx",
  "Phase_4_Campaign_Architecture_v2.xlsx",
  "Phase_4_Landing_Page_Roadmap_v2.xlsx",
  "Phase_4_Budget_Models_v2.xlsx",
];

for (const name of books) {
  const blob = await FileBlob.load(fileURLToPath(new URL(name, packageDir)));
  const wb = await SpreadsheetFile.importXlsx(blob);
  const sheets = await wb.inspect({ kind: "sheet", include: "id,name" });
  const first = JSON.parse(sheets.ndjson.split("\n").find(line => line.includes('"name"'))).name;
  const image = await wb.render({ sheetName: first, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(new URL(`${name}.png`, outputDir), new Uint8Array(await image.arrayBuffer()));
}
