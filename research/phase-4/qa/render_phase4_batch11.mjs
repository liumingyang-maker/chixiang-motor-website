import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const delivery=new URL("../deliveries/2026-07-16_phase-4-batch-1-1-freeze/",import.meta.url);
const preview=new URL("rendered-batch11/",import.meta.url); await fs.mkdir(preview,{recursive:true});
const files=(await fs.readdir(fileURLToPath(delivery))).filter(x=>x.endsWith('.xlsx'));
for(const name of files){const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(new URL(name,delivery))));const info=await wb.inspect({kind:'sheet',include:'id,name'});const line=info.ndjson.split('\n').find(x=>x.includes('"name"'));const sheet=JSON.parse(line).name;const png=await wb.render({sheetName:sheet,autoCrop:'all',scale:1,format:'png'});await fs.writeFile(new URL(`${name}.png`,preview),new Uint8Array(await png.arrayBuffer()));}
