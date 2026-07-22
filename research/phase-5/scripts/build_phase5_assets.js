'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Workbook, SpreadsheetFile } = require('@oai/artifact-tool');

const root = path.resolve(__dirname, '..');
const delivery = path.join(root, 'deliveries', 'phase-5-priority-market-implementation');
fs.mkdirSync(delivery, { recursive: true });

const palette = { navy: '#0B1F33', blue: '#1557A0', cyan: '#DCEFF7', orange: '#F47A20', white: '#FFFFFF', gray: '#E8EEF4', green: '#DDF4E7', red: '#FBE2E2' };

function colName(n) { let s = ''; while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); } return s; }
function styleSheet(sheet, rows, widths = []) {
  const cols = Math.max(...rows.map(r => r.length));
  const last = colName(cols);
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  sheet.getRange(`A1:${last}1`).format = { fill: palette.navy, font: { bold: true, color: palette.white }, wrapText: true, verticalAlignment: 'center' };
  sheet.getRange(`A1:${last}${rows.length}`).format = { borders: { bottom: { style: 'thin', color: palette.gray } }, verticalAlignment: 'top' };
  sheet.getRange(`A2:${last}${rows.length}`).format.wrapText = true;
  widths.forEach((w, i) => { sheet.getRange(`${colName(i + 1)}:${colName(i + 1)}`).format.columnWidth = w; });
  sheet.getRange(`A1:${last}1`).format.rowHeight = 34;
  if (rows.length > 1) sheet.getRange(`A2:${last}${rows.length}`).format.rowHeight = 42;
}
function addSheet(wb, name, rows, widths) {
  const sheet = wb.worksheets.add(name);
  sheet.getRangeByIndexes(0, 0, rows.length, Math.max(...rows.map(r => r.length))).values = rows;
  styleSheet(sheet, rows, widths);
  return sheet;
}
async function saveWorkbook(name, build) {
  const wb = Workbook.create();
  await build(wb);
  const xlsx = await SpreadsheetFile.exportXlsx(wb);
  fs.writeFileSync(path.join(delivery, name), Buffer.from(xlsx.data));
}

const adGroups = [
  { country: 'Peru', engine: 'Google', campaign: 'P5_PE_Search_CG200_B2B', group: 'CG200 Mayorista', url: '/es/peru/', product: 'CG200 aire', headlines: ['Motor CG200 Mayorista','CG200 Para Distribuidores','Proveedor De Motor CG200','Motor Para Motos De Trabajo','Consulta Técnica CG200','Fabricante De Motores CG','Muestras Sujetas A Confirmar','Lotes Mixtos Por Confirmar','Repuestos Para Motor CG','Cotice Con Datos Técnicos','Envíe Código Y Fotografías','Chixiang Motor B2B'], descriptions: ['Motor CG200 de aire para evaluación B2B en Perú. Confirme código, montaje y cantidad.','Para distribuidores y ensambladores. Precio, MOQ y plazo requieren confirmación.','Solicite revisión técnica con fotos, salida, sistema eléctrico y aplicación.','Muestras, lotes pequeños y repuestos sujetos a confirmación comercial.'] },
  { country: 'Peru', engine: 'Google', campaign: 'P5_PE_Search_CG150_B2B', group: 'CG150 Mayorista', url: '/es/peru/', product: 'CG150 aire', headlines: ['Motor CG150 Mayorista','CG150 Para Distribuidores','Proveedor De Motor CG150','Motor Para Trabajo Diario','Consulta Técnica CG150','Fabricante De Motores CG','Muestras Por Confirmar','Lote Pequeño Por Confirmar','Repuestos Para Motor CG','Cotice Con Código Y Fotos','Compatibilidad Se Revisa','Chixiang Motor B2B'], descriptions: ['Motor CG150 de aire para evaluación mayorista. La cilindrada no garantiza compatibilidad.','Envíe código, fotos, montaje, salida, sistema eléctrico y cantidad estimada.','Para distribuidores, talleres y ensambladores; condiciones por confirmar.','Motor y paquete de repuestos disponibles solo tras la revisión de configuración.'] },
  { country: 'Peru', engine: 'Google', campaign: 'P5_PE_Search_Spares_B2B', group: 'Repuestos CG', url: '/es/peru/', product: 'Spares', headlines: ['Repuestos Motor CG Mayorista','Kit De Repuestos Para Motor','Partes CG Para Distribuidor','Paquete Motor Y Repuestos','Confirme Código De Motor','Lista De Piezas Por Revisar','Proveedor De Repuestos CG','Pedido Mixto Por Confirmar','Soporte Para Posventa B2B','Envíe Fotos Y Cantidades','Configuración Antes De Cotizar','Chixiang Motor Repuestos'], descriptions: ['Paquetes de repuestos vinculados a un código y configuración confirmados.','Comparta lista de piezas, fotos y cantidades para revisión técnica y comercial.','Carga mixta, MOQ, precio y plazo se confirman antes de cualquier pedido.','Oferta para distribuidores y talleres; no es una promesa de stock inmediato.'] },
  { country: 'Uzbekistan', engine: 'Google', campaign: 'P5_UZ_Search_WC150_200_B2B', group: '150–200 Water Cooled', url: '/ru/central-asia/', product: '150–200 water-cooled', headlines: ['Двигатель 150–200 Оптом','Водяное Охлаждение B2B','Двигатель Для Трицикла','Поставщик Двигателей Китай','Для Грузовой Работы','Проверка Перед Предложением','Код И Фото Обязательны','Крепления И Вал Проверяются','Электрика По Конфигурации','Запчасти После Проверки','Условия Требуют Подтверждения','Chixiang Motor B2B'], descriptions: ['Водяные двигатели 150–200 см³ для технической B2B проверки в Узбекистане.','Пришлите код, фото, крепления, вал, электрику, применение и количество.','Цена, MOQ, срок, образец и логистика подтверждаются отдельно.','Совпадение объёма не означает совместимость с конкретным трициклом.'] },
  { country: 'Uzbekistan', engine: 'Google', campaign: 'P5_UZ_Search_WC200_250_B2B', group: '200–250 Water Cooled', url: '/ru/central-asia/', product: '200–250 water-cooled', headlines: ['Двигатель 200–250 Оптом','Водяной Двигатель Трицикла','Для Продолжительной Нагрузки','Грузовое Направление B2B','Поставщик Из Китая','Техническая Проверка','Пришлите Код И Фото','Проверка Выходного Вала','Проверка Системы Охлаждения','Запчасти По Коду','MOQ И Цена По Запросу','Chixiang Motor'], descriptions: ['Направление 200–250 см³ с водяным охлаждением для грузовой эксплуатации.','Модель предлагается только после проверки установки, привода и охлаждения.','Коммерческие параметры не указаны без заводского и логистического ввода.','Внешний реверс относится к конструкции автомобиля и не снижает оценку двигателя.'] },
  { country: 'Uzbekistan', engine: 'Yandex', campaign: 'P5_UZ_Yandex_Cargo_Spares', group: 'Cargo Spares B2B', url: '/ru/central-asia/', product: 'Spares', headlines: ['Запчасти Двигателя Трицикла','Комплект Запчастей Оптом','Запчасти По Коду Двигателя','Для Дистрибьюторов И Сборщиков','Смешанная Партия По Запросу','Список Деталей Для Проверки','Фото И Количество Обязательны','Поставщик Запчастей Китай','Техническое Подтверждение','Цена И MOQ По Запросу','Без Обещания Наличия','Chixiang Motor B2B'], descriptions: ['Комплект запчастей формируется для подтверждённого кода и конфигурации двигателя.','Отправьте список деталей, фотографии и количество для технической проверки.','Смешанная партия, цена, MOQ и срок требуют коммерческого подтверждения.','Дизайн кампании; Ads Launch остаётся NOT APPROVED.'] },
  { country: 'Russia', engine: 'Yandex', campaign: 'P5_RU_Yandex_Horizontal140_B2B', group: 'Нижний 140', url: '/ru/russia/', product: 'Lower horizontal 140', headlines: ['Двигатель 140 Кубов Оптом','Горизонтальный Двигатель 140','Нижний Двигатель 140','Для Дистрибьюторов B2B','Поставщик Двигателей Китай','Проверка Кода И Фото','Крепления И Вал Проверяются','Сцепление И Передачи','Запчасти После Проверки','MOQ И Цена По Запросу','Совместимость Не Предполагается','Chixiang Motor'], descriptions: ['Нижний горизонтальный двигатель 140 см³ для оптовой технической проверки.','Пришлите код, фото, крепления, вал, электрику, сцепление и количество.','Alpha, Delta и Cub — контекст применения, не обещание прямой установки.','Цена, MOQ, срок, гарантия и логистика требуют подтверждения.'] },
  { country: 'Russia', engine: 'Yandex', campaign: 'P5_RU_Yandex_HondaStyle140', group: 'Honda-style 140', url: '/ru/russia/', product: 'Honda-style horizontal 140', headlines: ['Honda Style Двигатель 140','Горизонтальная Архитектура','Двигатель 140 Для B2B','Без Заявления OEM Связи','Код Двигателя Для Проверки','Фото Креплений И Вала','Проверка Электрики','Оптовый Запрос 140 Кубов','Поставщик Из Китая','Условия По Подтверждению','Не Универсальная Замена','Chixiang Motor B2B'], descriptions: ['Honda-style описывает архитектуру и не означает OEM-связь или совместимость.','Точная конфигурация проверяется по коду, фотографиям и интерфейсам.','Для дистрибьюторов и сборщиков; коммерческие условия требуют ввода.','Дизайн кампании не является разрешением на запуск рекламы.'] },
  { country: 'Russia', engine: 'Yandex', campaign: 'P5_RU_Yandex_Spares140_B2B', group: 'Запчасти 140', url: '/ru/russia/', product: 'Spares 140', headlines: ['Запчасти Двигателя 140','Комплект Запчастей Оптом','Запчасти По Коду 140','Для Дистрибьюторов','Список Деталей Для Проверки','Фото И Количество','Поставщик Запчастей Китай','Пакет Двигатель И Запчасти','MOQ По Подтверждению','Цена По Запросу','Без Обещания Наличия','Chixiang Motor'], descriptions: ['Запчасти подбираются только по подтверждённому коду и конфигурации 140 см³.','Отправьте список деталей, фотографии и количество для проверки.','Наличие, цена, MOQ, срок и гарантия не предполагаются без ввода завода.','Только проект кампании; Ads Launch остаётся NOT APPROVED.'] }
];

async function build() {
  await saveWorkbook('Phase_5_Ad_Copy_Drafts.xlsx', async wb => {
    const head = ['Country','Engine','Campaign','Ad Group','Product','Final URL',...Array.from({length:12},(_,i)=>`Headline ${i+1}`),...Array.from({length:4},(_,i)=>`Description ${i+1}`),'Native Review','Status','Ads Launch'];
    const rows = [head, ...adGroups.map(g => [g.country,g.engine,g.campaign,g.group,g.product,g.url,...g.headlines,...g.descriptions,g.country==='Peru'?'Spanish native review required':'Russian native review required','DESIGN ONLY','NOT APPROVED'])];
    addSheet(wb,'Ad Copy Drafts',rows,[14,12,28,25,24,22,...Array(12).fill(22),...Array(4).fill(42),26,16,16]);
    addSheet(wb,'Data Dictionary',[['Field','Meaning'],['DESIGN ONLY','Draft content; not uploaded to an ad account'],['Native Review','Required before any approval'],['Ads Launch','Always NOT APPROVED in Phase 5'],['Product claim rule','No compatibility, price, MOQ, lead-time or certification claim without evidence']],[24,80]);
  });

  await saveWorkbook('Phase_5_Campaign_Import_Draft.xlsx', async wb => {
    const head=['Country','Platform','Campaign','Ad Group','Campaign Status','Ad Group Status','Final URL','Language','Location','Daily Budget','Bid Strategy','Keyword Source','Negative File','Evidence/Data Status','Ads Launch'];
    const rows=[head,...adGroups.map(g=>[g.country,g.engine,g.campaign,g.group,'PAUSED — DESIGN ONLY','PAUSED — DESIGN ONLY',g.url,g.country==='Peru'?'Spanish':'Russian',g.country,'','INPUT REQUIRED',g.engine==='Google'?'Keyword Planner input':'Wordstat input',g.country==='Peru'?'peru_negative_keywords.csv':g.country==='Uzbekistan'?'uzbekistan_negative_keywords.csv':'russia_negative_keywords.csv','PROXY DATA; tool metrics INPUT REQUIRED','NOT APPROVED'])];
    addSheet(wb,'Campaign Draft',rows,[14,13,30,26,22,22,22,14,15,15,20,22,28,40,16]);
    addSheet(wb,'Colombia SEO Only',[['Country','Channel','Action','Paid Complete-Engine Search','Reason','Status'],['Colombia','SEO + distributor development','Publish cautious technical content and validate distributors','NOT RECOMMENDED','Complete-engine demand is not verified','DESIGN ONLY']],[14,26,50,30,55,16]);
  });

  await saveWorkbook('Phase_5_Test_Budget_Allocation.xlsx', async wb => {
    const models=[
      ['Model A — Balanced','Peru',0.40],['Model A — Balanced','Uzbekistan',0.35],['Model A — Balanced','Russia',0.25],
      ['Model B — Peru weighted','Peru',0.50],['Model B — Peru weighted','Uzbekistan',0.30],['Model B — Peru weighted','Russia',0.20],
      ['Model C — Eurasia learning','Peru',0.30],['Model C — Eurasia learning','Uzbekistan',0.35],['Model C — Eurasia learning','Russia',0.35]
    ];
    const rows=[['Scenario','Country','Allocation %','Scenario Total USD','Country Budget USD','CPC','Clicks','Conversions','Profit','Status'],...models.map((r,i)=>[...r,1000,`=C${i+2}*D${i+2}`,'','','','','DESIGN ONLY'])];
    const s=addSheet(wb,'USD 1000 Models',rows,[28,15,15,20,20,14,14,16,14,18]);
    s.getRange('C2:C10').format.numberFormat='0%'; s.getRange('D2:E10').format.numberFormat='$#,##0.00';
    addSheet(wb,'Scenario Checks',[['Scenario','Allocation Check','Budget Check','Gate'],['Model A — Balanced',`=SUMIF('USD 1000 Models'!A:A,A2,'USD 1000 Models'!C:C)`,`=SUMIF('USD 1000 Models'!A:A,A2,'USD 1000 Models'!E:E)`,'INPUT REQUIRED'],['Model B — Peru weighted',`=SUMIF('USD 1000 Models'!A:A,A3,'USD 1000 Models'!C:C)`,`=SUMIF('USD 1000 Models'!A:A,A3,'USD 1000 Models'!E:E)`,'INPUT REQUIRED'],['Model C — Eurasia learning',`=SUMIF('USD 1000 Models'!A:A,A4,'USD 1000 Models'!C:C)`,`=SUMIF('USD 1000 Models'!A:A,A4,'USD 1000 Models'!E:E)`,'INPUT REQUIRED']],[28,20,20,22]);
  });

  await saveWorkbook('Phase_5_Landing_Page_Change_Log.xlsx', async wb => {
    const rows=[['Market','URL','Action','Product Direction','Evidence Boundary','Native Review','Ads Priority','Status'],
      ['Peru','/es/peru/','Updated','CG200 air → CG150 air; spares separate','No same-displacement compatibility; Indian platforms excluded from direct fit','Spanish required','Priority design','IMPLEMENTED'],
      ['Uzbekistan','/ru/central-asia/','New canonical page','150–250 water-cooled cargo; spares separate','Vehicle listing is not complete-engine demand or compatibility proof','Russian required; Uzbek CTA required','Priority design','IMPLEMENTED'],
      ['Russia','/ru/russia/','New page','Lower horizontal 140 → Honda-style 140; CB/pit-bike research only','Platform names are context, not fit claims','Russian required','Priority design','IMPLEMENTED'],
      ['Colombia','/es/colombia/','Repositioned','Spares + platform qualification','Complete-engine demand not verified','Spanish required','SEO only','IMPLEMENTED'],
      ['Uzbekistan legacy','/ru/dvigateli-dlya-uzbekistana.html','Noindex compatibility redirect','Points to canonical page','No duplicate indexable content','Russian required','None','IMPLEMENTED']];
    addSheet(wb,'Change Log',rows,[18,38,20,52,60,30,20,18]);
  });

  await saveWorkbook('Phase_5_Conversion_Map.xlsx', async wb => {
    const rows=[['Market','Page','Conversion Surface','Endpoint/Target','Trigger','Pre-success Conversion','Attribution','Phase 5 Test','Status'],
      ['Peru','/es/peru/','B2B form','/api/contact','Server success required','Must not fire','UTM + GCLID via shared script','Static only','PASS'],
      ['Peru','/es/peru/','WhatsApp','wa.me/8619008225410','User click','N/A','Country/source message','Link only','PASS'],
      ['Uzbekistan','/ru/central-asia/','B2B form','/api/contact','Server success required','Must not fire','market + source_form; shared attribution','Static only','PASS'],
      ['Uzbekistan','/ru/central-asia/','WhatsApp','wa.me/8619008225410','User click','N/A','Prefilled market message','Link only','PASS'],
      ['Russia','/ru/russia/','B2B form','/api/contact','Server success required','Must not fire','market + source_form; shared attribution','Static only','PASS'],
      ['Russia','/ru/russia/','WhatsApp','wa.me/8619008225410','User click','N/A','Prefilled market message','Link only','PASS'],
      ['Colombia','/es/colombia/','Technical review form','/api/contact','Server success required','Must not fire','UTM + GCLID via shared script','Static only','PASS'],
      ['All','Production','End-to-end receipt','Email/CRM/Ads','Explicit authorization','Unknown until controlled test','Must be verified','Not executed','MANUAL AUTHORIZATION REQUIRED']];
    addSheet(wb,'Conversion Map',rows,[16,28,26,30,28,26,38,18,30]);
  });

  const copies=[
    ['Phase_5_Executive_Summary.md','Phase_5_Executive_Summary.md'],['Phase_5_Implementation_Handoff.md','Phase_5_Implementation_Handoff.md'],['tracking/Phase_5_Tracking_Audit.md','Phase_5_Tracking_Audit.md'],['tracking/Phase_5_Manual_Production_Test_Checklist.md','Phase_5_Manual_Production_Test_Checklist.md'],['Phase_5_Data_Gaps.md','Phase_5_Data_Gaps.md'],['Phase_5_Codex_Implementation_Log.md','Phase_5_Codex_Implementation_Log.md'],
    ['keyword-tool-input/peru_google_keyword_planner.csv','Peru_Google_Keyword_Planner_Input.csv'],['keyword-tool-input/uzbekistan_google_keyword_planner.csv','Uzbekistan_Google_Keyword_Planner_Input.csv'],['keyword-tool-input/uzbekistan_yandex_wordstat.csv','Uzbekistan_Yandex_Wordstat_Input.csv'],['keyword-tool-input/russia_yandex_wordstat.csv','Russia_Yandex_Wordstat_Input.csv'],['keyword-tool-input/colombia_seo_keywords.csv','Colombia_SEO_Keywords.csv'],['ads/peru/peru_negative_keywords.csv','Peru_Negative_Keywords.csv'],['ads/uzbekistan/uzbekistan_negative_keywords.csv','Uzbekistan_Negative_Keywords.csv'],['ads/russia/russia_negative_keywords.csv','Russia_Negative_Keywords.csv']
  ];
  for (const [src,dst] of copies) fs.copyFileSync(path.join(root,src),path.join(delivery,dst));
  console.log(`Built five workbooks and copied ${copies.length} source artifacts to ${delivery}`);
}

// Generate machine-verifiable URL manifest from the same adGroups source
function generateManifest() {
  const manifest = { generated: new Date().toISOString().slice(0, 10), source: 'build_phase5_assets.js adGroups', activeUrls: {}, redirects: [] };
  for (const g of adGroups) {
    if (!manifest.activeUrls[g.country]) manifest.activeUrls[g.country] = new Set();
    manifest.activeUrls[g.country].add(g.url);
  }
  for (const k of Object.keys(manifest.activeUrls)) manifest.activeUrls[k] = [...manifest.activeUrls[k]];
  manifest.redirects = [
    { from: '/ru/uzbekistan/', to: '/ru/central-asia/', code: 301 },
    { from: '/ru/dvigateli-dlya-uzbekistana.html', to: '/ru/central-asia/', code: 301 },
    { from: '/ru/dvigatel-140/', to: '/ru/russia/#horizontal-engines', code: 301 }
  ];
  const qaDir = path.join(root, 'qa');
  fs.mkdirSync(qaDir, { recursive: true });
  fs.writeFileSync(path.join(qaDir, 'phase5_active_url_manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}

build().then(() => { generateManifest(); console.log('URL manifest generated.'); }).catch(err => { console.error(err); process.exit(1); });
