/**
 * Shared 6-Language Export Full-Matrix Configuration, Routing, Hreflang & UI Chrome
 * Active public languages: EN / FR / ES / PT / RU / AR (zh-cn is archived & non-public).
 */
const ORIGIN = 'https://chixiangmotor.com';
const ORG_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;

const LANGS = ['en', 'fr', 'es', 'pt', 'ru', 'ar'];

const HREFLANG_MAP = {
  en: 'en',
  fr: 'fr',
  es: 'es',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar'
};

const LANG_DISPLAY_NAMES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية'
};

const GUIDE_SLUGS = [
  'air-cooled-vs-water-cooled-motorcycle-engine',
  'bajaj-tvs-replacement-engine-fitment-checklist',
  'cg-pushrod-vs-cb-ohc-motorcycle-engine-comparison',
  'chongqing-motorcycle-engine-factory-qa-dyno-testing-warranty',
  'horizontal-motorcycle-engine-110cc-150cc-selection-guide',
  'how-to-choose-motorcycle-engine-manufacturer-china',
  'hw250-hw300-vs-cg250-water-cooled-cargo-tricycle-engine',
  'motorcycle-engine-export-packaging-moq-50-mixed-loading-guide'
];

/**
 * Complete 32-role standard matrix map across all 6 active export languages.
 * Existing localized URLs (es/motor-cg, pt/motor-cg, ru/dvigatel-cg, contacto, contato, kontakty)
 * are preserved unchanged; all new pages use clean technical slugs.
 */
const ROUTE_GROUPS = {
  home: {
    en: '/en/', fr: '/fr/', es: '/es/', pt: '/pt/', ru: '/ru/', ar: '/ar/'
  },
  products: {
    en: '/en/products', fr: '/fr/products', es: '/es/products', pt: '/pt/products', ru: '/ru/products', ar: '/ar/products'
  },
  about: {
    en: '/en/about', fr: '/fr/about', es: '/es/about', pt: '/pt/about', ru: '/ru/about', ar: '/ar/about'
  },
  evidence: {
    en: '/en/evidence', fr: '/fr/evidence', es: '/es/evidence', pt: '/pt/evidence', ru: '/ru/evidence', ar: '/ar/evidence'
  },
  news: {
    en: '/en/news', fr: '/fr/news', es: '/es/news', pt: '/pt/news', ru: '/ru/news', ar: '/ar/news'
  },
  contact: {
    en: '/en/contact', fr: '/fr/contact', es: '/es/contacto', pt: '/pt/contato', ru: '/ru/kontakty', ar: '/ar/contact'
  },
  cg: {
    en: '/en/cg-engine', fr: '/fr/cg-engine', es: '/es/motor-cg', pt: '/pt/motor-cg', ru: '/ru/dvigatel-cg', ar: '/ar/cg-engine'
  },
  cb: {
    en: '/en/cb-engine', fr: '/fr/cb-engine', es: '/es/motor-cb', pt: '/pt/motor-cb', ru: '/ru/dvigatel-cb', ar: '/ar/cb-engine'
  },
  horizontal: {
    en: '/en/horizontal-engine', fr: '/fr/horizontal-engine', es: '/es/motor-horizontal', pt: '/pt/motor-horizontal', ru: '/ru/gorizontalnyj-dvigatel', ar: '/ar/horizontal-engine'
  },
  ac320: {
    en: '/en/ac320-atv-engine', fr: '/fr/ac320-atv-engine', es: '/es/ac320-atv-engine', pt: '/pt/ac320-atv-engine', ru: '/ru/ac320-atv-engine', ar: '/ar/ac320-atv-engine'
  },
  parts: {
    en: '/en/engine-parts', fr: '/fr/engine-parts', es: '/es/repuestos-motor', pt: '/pt/pecas-de-motor', ru: '/ru/zapchasti-dvigatelya', ar: '/ar/engine-parts'
  },
  'hw-series': {
    en: '/en/engine-parts/hw-series', fr: '/fr/engine-parts/hw-series', es: '/es/engine-parts/hw-series', pt: '/pt/engine-parts/hw-series', ru: '/ru/engine-parts/hw-series', ar: '/ar/engine-parts/hw-series'
  },
  'cg150-air-cooled-engine': {
    en: '/en/cg-engine/cg150-air-cooled-engine', fr: '/fr/cg-engine/cg150-air-cooled-engine', es: '/es/cg-engine/cg150-air-cooled-engine', pt: '/pt/cg-engine/cg150-air-cooled-engine', ru: '/ru/cg-engine/cg150-air-cooled-engine', ar: '/ar/cg-engine/cg150-air-cooled-engine'
  },
  'cg200-air-cooled-engine': {
    en: '/en/cg-engine/cg200-air-cooled-engine', fr: '/fr/cg-engine/cg200-air-cooled-engine', es: '/es/cg-engine/cg200-air-cooled-engine', pt: '/pt/cg-engine/cg200-air-cooled-engine', ru: '/ru/cg-engine/cg200-air-cooled-engine', ar: '/ar/cg-engine/cg200-air-cooled-engine'
  },
  'cg250sb-water-cooled-engine': {
    en: '/en/cg-engine/cg250sb-water-cooled-engine', fr: '/fr/cg-engine/cg250sb-water-cooled-engine', es: '/es/cg-engine/cg250sb-water-cooled-engine', pt: '/pt/cg-engine/cg250sb-water-cooled-engine', ru: '/ru/cg-engine/cg250sb-water-cooled-engine', ar: '/ar/cg-engine/cg250sb-water-cooled-engine'
  },
  'hw300-water-cooled-engine': {
    en: '/en/cg-engine/hw300-water-cooled-engine', fr: '/fr/cg-engine/hw300-water-cooled-engine', es: '/es/cg-engine/hw300-water-cooled-engine', pt: '/pt/cg-engine/hw300-water-cooled-engine', ru: '/ru/cg-engine/hw300-water-cooled-engine', ar: '/ar/cg-engine/hw300-water-cooled-engine'
  },
  'btv-hub': {
    en: '/en/bajaj-tvs-engines-parts', fr: '/fr/bajaj-tvs-engines-parts', es: '/es/bajaj-tvs-engines-parts', pt: '/pt/bajaj-tvs-engines-parts', ru: '/ru/bajaj-tvs-engines-parts', ar: '/ar/bajaj-tvs-engines-parts'
  },
  'btv-bajaj': {
    en: '/en/bajaj-engine-parts', fr: '/fr/bajaj-engine-parts', es: '/es/bajaj-engine-parts', pt: '/pt/bajaj-engine-parts', ru: '/ru/bajaj-engine-parts', ar: '/ar/bajaj-engine-parts'
  },
  'btv-tvs': {
    en: '/en/tvs-engine-parts', fr: '/fr/tvs-engine-parts', es: '/es/tvs-engine-parts', pt: '/pt/tvs-engine-parts', ru: '/ru/tvs-engine-parts', ar: '/ar/tvs-engine-parts'
  },
  'bajaj-boxer-ct100-bm100-complete-engine': {
    en: '/en/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine', fr: '/fr/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine', es: '/es/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine', pt: '/pt/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine', ru: '/ru/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine', ar: '/ar/bajaj-tvs-engines-parts/bajaj-boxer-ct100-bm100-complete-engine'
  },
  'bajaj-boxer-bm150-complete-engine': {
    en: '/en/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', fr: '/fr/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', es: '/es/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', pt: '/pt/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', ru: '/ru/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine', ar: '/ar/bajaj-tvs-engines-parts/bajaj-boxer-bm150-complete-engine'
  },
  'bajaj-re-4s-200-complete-engine': {
    en: '/en/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine', fr: '/fr/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine', es: '/es/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine', pt: '/pt/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine', ru: '/ru/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine', ar: '/ar/bajaj-tvs-engines-parts/bajaj-re-4s-200-complete-engine'
  },
  'tvs-hlx-150-complete-engine': {
    en: '/en/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine', fr: '/fr/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine', es: '/es/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine', pt: '/pt/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine', ru: '/ru/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine', ar: '/ar/bajaj-tvs-engines-parts/tvs-hlx-150-complete-engine'
  },
  'tvs-king-200-complete-engine': {
    en: '/en/bajaj-tvs-engines-parts/tvs-king-200-complete-engine', fr: '/fr/bajaj-tvs-engines-parts/tvs-king-200-complete-engine', es: '/es/bajaj-tvs-engines-parts/tvs-king-200-complete-engine', pt: '/pt/bajaj-tvs-engines-parts/tvs-king-200-complete-engine', ru: '/ru/bajaj-tvs-engines-parts/tvs-king-200-complete-engine', ar: '/ar/bajaj-tvs-engines-parts/tvs-king-200-complete-engine'
  }
};

for (const slug of GUIDE_SLUGS) {
  ROUTE_GROUPS[slug] = Object.fromEntries(LANGS.map((l) => [l, `/${l}/${slug}`]));
}

const LOCALE_CHROME = {
  en: {
    code: 'EN', dir: 'ltr',
    tagline: 'Professional Motorcycle Engine Manufacturer',
    closeMenu: 'Close menu', toggleMenu: 'Toggle menu', selectLang: 'Select language',
    navAria: 'Main navigation',
    nav: {
      home: 'Home', products: 'Products', parts: 'Engine Parts', allParts: 'All Engine Parts',
      hwParts: 'HW200–HW350 Kits & Parts', btv: 'Bajaj / TVS Engines & Parts',
      evidence: 'Evidence', about: 'About Us', news: 'News', contact: 'Contact', quote: 'Get a Quote'
    },
    mobile: {
      cg: 'CG Engine Series', cb: 'CB Engine Series', hz: 'Horizontal Engine Series',
      parts: 'Engine Parts Series', hw: 'HW200–HW350 Parts', btv: 'Bajaj / TVS Engines & Parts',
      evidence: 'Evidence Center', about: 'About Us', news: 'News', contact: 'Contact Us', quote: 'Get a Quote'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · Motorcycle engine industry experience since 2003. Company registered in 2007.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      linksHeading: 'Quick Links', seriesHeading: 'Product Matrix', contactHeading: 'Contact',
      cgLabel: 'CG Series', cbLabel: 'CB Series', hzLabel: 'Horizontal Engines', ac320Label: 'AC320 ATV Engine',
      hwLabel: 'HW200–HW350 Parts', btvLabel: 'Bajaj / TVS Catalog', hw300Label: 'HW300 300cc Water Engine',
      tel: 'Tel: +86 19008225410', wa: 'WhatsApp: +86 19008225410', email: 'Email: chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · Export documentation and logistics are executed through Chixiang's designated export division.",
      location: 'Chongqing, China'
    },
    waLabel: 'WhatsApp', waAria: 'Chat on WhatsApp',
    waTemplate: m => `Hello CHIXIANG MOTOR, I would like a wholesale FOB Guangzhou quote for: Model: ${m} | Quantity: [units] | Spare Parts: [yes/no] | Port: [destination port].`
  },
  fr: {
    code: 'FR', dir: 'ltr',
    tagline: 'Fabricant de moteurs moto & tricycle cargo',
    closeMenu: 'Fermer le menu', toggleMenu: 'Ouvrir le menu', selectLang: 'Choisir la langue',
    navAria: 'Navigation principale',
    nav: {
      home: 'Accueil', products: 'Produits', parts: 'Pièces moteur', allParts: 'Toutes les pièces',
      hwParts: 'Kits & Pièces HW200–HW350', btv: 'Moteurs & Pièces Bajaj / TVS',
      evidence: 'Preuves', about: "L'usine", news: 'Guides', contact: 'Devis & Export', quote: 'Demander un devis'
    },
    mobile: {
      cg: 'Moteurs CG & Tricycle', cb: 'Moteurs CB (Chaîne)', hz: 'Moteurs Horizontaux 110–150',
      parts: 'Toutes les pièces moteur', hw: 'Pièces HW200–HW350', btv: 'Moteurs & Pièces Bajaj / TVS',
      evidence: 'Centre de preuves', about: 'À propos de l\'usine', news: 'Guides d\'importation', contact: 'Contact & Export', quote: 'Demander un devis'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · Expérience moteur moto depuis 2003, société enregistrée en 2007. Test au banc chaud/froid à 100 %.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, Chine',
      linksHeading: 'Navigation rapide', seriesHeading: 'Gammes & Pièces', contactHeading: 'Contact Export',
      cgLabel: 'Moteurs CG (Air / Eau)', cbLabel: 'Moteurs CB (Chaîne)', hzLabel: 'Moteurs Horizontaux (Cub)', ac320Label: 'Moteur Quad AC320',
      hwLabel: 'Catalogue Pièces HW200–HW350', btvLabel: 'Bajaj & TVS Adaptables', hw300Label: 'HW300 Tricycle à Eau',
      tel: 'Tél : +86 19008225410', wa: 'WhatsApp : +86 19008225410', email: 'Email : chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · Les documents d'exportation et la logistique sont exécutés via la division export désignée de Chixiang.",
      location: 'Chongqing, Chine'
    },
    waLabel: 'WhatsApp', waAria: 'Discuter sur WhatsApp',
    waTemplate: m => `Bonjour, je suis importateur / grossiste en [pays]. Je souhaite un devis FOB Guangzhou pour : Modèle : ${m} | Quantité : [nombre] | Pièces détachées : [oui/non] | Port : [Abidjan / Douala / Cotonou / Dakar].`
  },
  es: {
    code: 'ES', dir: 'ltr',
    tagline: 'Fabricante de motores varilleros, cadenilleros y trimotos',
    closeMenu: 'Cerrar menú', toggleMenu: 'Abrir menú', selectLang: 'Seleccionar idioma',
    navAria: 'Navegación principal',
    nav: {
      home: 'Inicio', products: 'Productos', parts: 'Repuestos', allParts: 'Todos los repuestos',
      hwParts: 'Kits y Repuestos HW200–HW350', btv: 'Motores y Repuestos Bajaj / TVS',
      evidence: 'Evidencia', about: 'Fábrica', news: 'Guías', contact: 'Contacto', quote: 'Solicitar Cotización'
    },
    mobile: {
      cg: 'Motores CG Varilleros y Agua', cb: 'Motores CB Cadenilleros', hz: 'Motor Horizontal tipo Cub',
      parts: 'Repuestos de Motor', hw: 'Repuestos Carguero HW200–HW350', btv: 'Bajaj Boxer / Torito RE / TVS',
      evidence: 'Centro de Evidencia', about: 'Sobre la Fábrica', news: 'Guías Técnicas', contact: 'Contacto B2B', quote: 'Solicitar Cotización'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · Experiencia industrial desde 2003, empresa registrada en 2007. Prueba en banco en frío y caliente al 100 %.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      linksHeading: 'Accesos rápidos', seriesHeading: 'Líneas de Motores', contactHeading: 'Contacto Exportación',
      cgLabel: 'Motores CG (Varilleros)', cbLabel: 'Motores CB (Cadenilleros)', hzLabel: 'Horizontales tipo Cub 110–150', ac320Label: 'Motor ATV AC320 CVT',
      hwLabel: 'Repuestos HW200–HW350', btvLabel: 'Bajaj Boxer / Torito / TVS', hw300Label: 'Carguero HW300 Enfriado por Agua',
      tel: 'Tel: +86 19008225410', wa: 'WhatsApp: +86 19008225410', email: 'Email: chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · Documentación de exportación y logística ejecutadas mediante la división de exportación designada de Chixiang.",
      location: 'Chongqing, China'
    },
    waLabel: 'WhatsApp', waAria: 'Escribir por WhatsApp',
    waTemplate: m => `Hola, soy importador / distribuidor en [país]. Solicito cotización FOB Guangzhou para: Modelo: ${m} | Cantidad: [unidades] | Repuestos: [sí/no] | Puerto: [Callao / Buenaventura / Manzanillo / Guayaquil].`
  },
  pt: {
    code: 'PT', dir: 'ltr',
    tagline: 'Fabricante de motores vareta, OHC e triciclos de carga',
    closeMenu: 'Fechar menu', toggleMenu: 'Abrir menu', selectLang: 'Selecionar idioma',
    navAria: 'Navegação principal',
    nav: {
      home: 'Início', products: 'Produtos', parts: 'Peças', allParts: 'Todas as Peças',
      hwParts: 'Kits e Peças HW200–HW350', btv: 'Motores e Peças Bajaj / TVS',
      evidence: 'Evidências', about: 'Fábrica', news: 'Guias', contact: 'Contato', quote: 'Solicitar Cotação'
    },
    mobile: {
      cg: 'Motores CG Vareta e Água', cb: 'Motores CB Corrente de Comando', hz: 'Motor Horizontal tipo Cub',
      parts: 'Peças de Motor', hw: 'Peças Triciclo HW200–HW350', btv: 'Bajaj Boxer / RE / TVS HLX e King',
      evidence: 'Centro de Evidências', about: 'Sobre a Fábrica', news: 'Guias Técnicos', contact: 'Contato B2B', quote: 'Solicitar Cotação'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · Experiência industrial desde 2003, empresa registrada em 2007. Teste 100 % em bancada a frio e a quente.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      linksHeading: 'Links Rápidos', seriesHeading: 'Catálogo Completo', contactHeading: 'Contato Exportação',
      cgLabel: 'Motores CG (Vareta)', cbLabel: 'Motores CB (Corrente OHC)', hzLabel: 'Horizontais tipo Cub 110–150', ac320Label: 'Motor Quadriciclo AC320 CVT',
      hwLabel: 'Peças HW200–HW350', btvLabel: 'Bajaj Boxer / TVS HLX & King', hw300Label: 'Triciclo HW300 Refrigerado a Água',
      tel: 'Tel: +86 19008225410', wa: 'WhatsApp: +86 19008225410', email: 'Email: chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · Documentação de exportação e logística executadas pela divisão de exportação designada da Chixiang.",
      location: 'Chongqing, China'
    },
    waLabel: 'WhatsApp', waAria: 'Falar no WhatsApp',
    waTemplate: m => `Olá, sou importador / distribuidor em [país]. Gostaria de uma cotação FOB Guangzhou para: Modelo: ${m} | Quantidade: [unidades] | Peças de reposição: [sim/não] | Porto: [Luanda / Maputo / Santos].`
  },
  ru: {
    code: 'RU', dir: 'ltr',
    tagline: 'Завод-производитель двигателей для мото и грузовых трициклов',
    closeMenu: 'Закрыть меню', toggleMenu: 'Открыть меню', selectLang: 'Выбор языка',
    navAria: 'Основная навигация',
    nav: {
      home: 'Главная', products: 'Продукция', parts: 'Запчасти', allParts: 'Все запчасти',
      hwParts: 'Комплекты HW200–HW350', btv: 'Двигатели и запчасти Bajaj / TVS',
      evidence: 'Доказательства', about: 'О заводе', news: 'Статьи', contact: 'Контакты', quote: 'Запросить цену'
    },
    mobile: {
      cg: 'Двигатели CG (штанговые)', cb: 'Двигатели CB (цепные OHC)', hz: 'Горизонтальные (Альфа/Дельта/Питбайк)',
      parts: 'Запчасти для двигателей', hw: 'Запчасти HW200–HW350', btv: 'Bajaj Boxer / RE / TVS HLX и King',
      evidence: 'Центр доказательств', about: 'О заводе', news: 'Руководства', contact: 'Контакты B2B', quote: 'Запросить цену'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · Опыт в отрасли с 2003 года, компания зарегистрирована в 2007 году. 100 % стендовые испытания до отгрузки.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, Китай',
      linksHeading: 'Быстрые ссылки', seriesHeading: 'Матрица продукции', contactHeading: 'Отдел экспорта',
      cgLabel: 'Серия CG (воздушные / водяные)', cbLabel: 'Серия CB (цепные OHC)', hzLabel: 'Горизонтальные 110–150 см³', ac320Label: 'Двигатель ATV AC320 CVT',
      hwLabel: 'Каталог запчастей HW200–HW350', btvLabel: 'Запчасти и моторы Bajaj / TVS', hw300Label: 'Трициклы HW300 (водяное)',
      tel: 'Тел: +86 19008225410', wa: 'WhatsApp: +86 19008225410', email: 'Email: chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · Экспортная документация и логистика оформляются через уполномоченный экспортный отдел Chixiang.",
      location: 'Чунцин, Китай'
    },
    waLabel: 'WhatsApp', waAria: 'Написать в WhatsApp',
    waTemplate: m => `Здравствуйте! Я импортёр / оптовый покупатель в [страна]. Прошу расчёт FOB Гуанчжоу: Модель: ${m} | Количество: [шт.] | Запчасти: [да/нет] | Направление: [Ташкент / Алматы / Бишкек / Москва].`
  },
  ar: {
    code: 'AR', dir: 'rtl',
    tagline: 'مصنع محركات الدراجات النارية والتروسيكلات في تشونغتشينغ',
    closeMenu: 'إغلاق القائمة', toggleMenu: 'فتح القائمة', selectLang: 'اختر اللغة',
    navAria: 'التنقل الرئيسي',
    nav: {
      home: 'الرئيسية', products: 'المنتجات', parts: 'قطع الغيار', allParts: 'جميع قطع الغيار',
      hwParts: 'أطقم وقطع HW200–HW350', btv: 'محركات وقطع Bajaj / TVS',
      evidence: 'مركز الأدلة', about: 'عن المصنع', news: 'الأدلة', contact: 'اتصل بنا', quote: 'اطلب عرض سعر'
    },
    mobile: {
      cg: 'محركات CG أسياخ والتبريد المائي', cb: 'محركات CB كاتينة (OHC)', hz: 'المحركات الأفقية 110–150 سي سي',
      parts: 'قطع غيار المحركات', hw: 'قطع التروسيكلات HW200–HW350', btv: 'باجاج بوكسر وتوك توك / TVS',
      evidence: 'مركز الأدلة والوثائق', about: 'عن المصنع', news: 'أدلة الشراء', contact: 'التواصل والأسعار', quote: 'اطلب عرض سعر'
    },
    footer: {
      company: 'Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.',
      desc: 'CHIXIANG MOTOR · خبرة في قطاع المحركات منذ 2003 وشركة مسجلة عام 2007. اختبار بارد وساخن بنسبة 100% قبل الشحن.',
      address: 'No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China',
      linksHeading: 'روابط سريعة', seriesHeading: 'مصفوفة المنتجات', contactHeading: 'التواصل للتصدير',
      cgLabel: 'فئة CG (أسياخ / تبريد مياه)', cbLabel: 'فئة CB (كاتينة OHC)', hzLabel: 'المحركات الأفقية (Cub)', ac320Label: 'محرك ATV AC320 CVT',
      hwLabel: 'قطع التروسيكلات HW200–HW350', btvLabel: 'محركات وقطع Bajaj / TVS', hw300Label: 'محرك تروسيكل HW300 تبريد مياه',
      tel: 'هاتف: +86 19008225410', wa: 'واتساب: +86 19008225410', email: 'البريد: chixiangmotor@163.com',
      copyright: "© 2026 Chongqing Chixiang Motorcycle Manufacturing Co., Ltd. (CHIXIANG MOTOR) · تُنفَّذ وثائق التصدير والخدمات اللوجستية عبر قسم التصدير المعتمد لدى Chixiang.",
      location: 'تشونغتشينغ، الصين'
    },
    waLabel: 'WhatsApp', waAria: 'تواصل عبر واتساب',
    waTemplate: m => `مرحباً، أنا مستورد / موزع في [البلد]. أرجو عرض سعر FOB قوانغتشو: الطراز: ${m} | الكمية: [العدد] | قطع الغيار: [نعم/لا] | الميناء: [الإسكندرية / الجزائر / الدار البيضاء / بورتسودان].`
  }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function rolePath(role, lang) {
  const group = ROUTE_GROUPS[role];
  if (!group) throw new Error(`Unknown matrix role: ${role}`);
  return group[lang] || group.en;
}

function roleUrl(role, lang) {
  return `${ORIGIN}${rolePath(role, lang)}`;
}

function hreflangTagsHtml(role, indent = '  ') {
  const group = ROUTE_GROUPS[role];
  if (!group) throw new Error(`Unknown matrix role for hreflang: ${role}`);
  const lines = [];
  for (const lang of LANGS) {
    if (!group[lang]) continue;
    lines.push(`${indent}<link rel="alternate" hreflang="${HREFLANG_MAP[lang]}" href="${ORIGIN}${group[lang]}">`);
  }
  lines.push(`${indent}<link rel="alternate" hreflang="x-default" href="${ORIGIN}${group.en}">`);
  return lines.join('\n');
}

function waHref(lang, modelLabel) {
  const c = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  return `https://wa.me/8619008225410?text=${encodeURIComponent(c.waTemplate(modelLabel))}`;
}

function langDropdownLinksHtml(role, activeLang, indent = '            ') {
  const group = ROUTE_GROUPS[role] || ROUTE_GROUPS.home;
  return LANGS.filter(l => group[l]).map(l => {
    const cls = l === activeLang ? ' class="active"' : '';
    return `${indent}<a href="${group[l]}" hreflang="${HREFLANG_MAP[l]}"${cls}>${LANG_DISPLAY_NAMES[l]}</a>`;
  }).join('\n');
}

function renderMobileNav(lang, activeRole, quoteHref) {
  const c = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  const links = [
    ['home', c.nav.home],
    ['products', c.nav.products],
    ['cg', c.mobile.cg],
    ['cb', c.mobile.cb],
    ['horizontal', c.mobile.hz],
    ['parts', c.mobile.parts],
    ['hw-series', c.mobile.hw],
    ['btv-hub', c.mobile.btv],
    ['evidence', c.mobile.evidence],
    ['about', c.mobile.about],
    ['news', c.mobile.news],
    ['contact', c.mobile.contact]
  ].map(([role, label]) => {
    const href = rolePath(role, lang);
    const current = role === activeRole ? ' aria-current="page"' : '';
    return `      <li><a href="${href}"${current}>${escapeHtml(label)}<span class="mnav-arrow">&rsaquo;</span></a></li>`;
  }).join('\n');

  const langLinks = LANGS.map(l =>
    `<a href="${rolePath(activeRole || 'home', l)}" hreflang="${HREFLANG_MAP[l]}">${LANG_DISPLAY_NAMES[l]}</a>`
  ).join('');

  return `  <div class="mobile-nav" id="mobileNav"${lang === 'zh-cn' ? ' hidden' : ''}>
    <div class="mobile-nav-header">
      <div class="mobile-nav-brand">
        <div class="mobile-nav-logo">CHIXIANG MOTOR</div>
        <div class="mobile-nav-tagline">${escapeHtml(c.tagline)}</div>
      </div>
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="${escapeAttr(c.closeMenu)}">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <ul class="mobile-nav-list">
${links}
      <li><a href="${escapeAttr(quoteHref)}" class="mnav-accent">${escapeHtml(c.mobile.quote)}<span class="mnav-arrow">&rsaquo;</span></a></li>
    </ul>
    <div class="mobile-nav-langs">${langLinks}</div>
  </div>`;
}

function renderNavbar(lang, activeRole, activeKey, quoteHref) {
  const c = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  const activeAttr = key => (key === activeKey ? ' class="active"' : '');
  const partsActive = activeKey === 'parts' ? ' class="active"' : '';
  return `  <nav class="navbar">
    <div class="container">
      <a href="${rolePath('home', lang)}" class="nav-logo"><span class="logo-icon"><img src="/images/logo.webp" alt="CHIXIANG MOTOR" width="36" height="36" decoding="async"></span><span class="logo-text">CHIXIANG MOTOR</span></a>
      <ul class="nav-links" role="navigation" aria-label="${escapeAttr(c.navAria)}">
        <li><a href="${rolePath('home', lang)}"${activeAttr('home')}>${escapeHtml(c.nav.home)}</a></li>
        <li><a href="${rolePath('products', lang)}"${activeAttr('products')}>${escapeHtml(c.nav.products)}</a></li>
        <li class="nav-item-dropdown">
          <a href="${rolePath('parts', lang)}"${partsActive}>${escapeHtml(c.nav.parts)} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></a>
          <ul class="nav-dropdown">
            <li><a href="${rolePath('parts', lang)}"${activeRole === 'parts' ? ' aria-current="page"' : ''}>${escapeHtml(c.nav.allParts)}</a></li>
            <li><a href="${rolePath('hw-series', lang)}"${activeRole === 'hw-series' ? ' aria-current="page"' : ''}>${escapeHtml(c.nav.hwParts)}</a></li>
            <li><a href="${rolePath('btv-hub', lang)}"${activeRole === 'btv-hub' ? ' aria-current="page"' : ''}>${escapeHtml(c.nav.btv)}</a></li>
          </ul>
        </li>
        <li><a href="${rolePath('evidence', lang)}"${activeAttr('evidence')}>${escapeHtml(c.nav.evidence)}</a></li>
        <li><a href="${rolePath('about', lang)}"${activeAttr('about')}>${escapeHtml(c.nav.about)}</a></li>
        <li><a href="${rolePath('news', lang)}"${activeAttr('news')}>${escapeHtml(c.nav.news)}</a></li>
        <li><a href="${rolePath('contact', lang)}"${activeAttr('contact')}>${escapeHtml(c.nav.contact)}</a></li>
      </ul>
      <div class="nav-right">
        <div class="lang-switcher">
          <button class="lang-current" aria-label="${escapeAttr(c.selectLang)}"><span>${c.code}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          <div class="lang-dropdown">
${langDropdownLinksHtml(activeRole || 'home', lang)}
          </div>
        </div>
        <a href="${escapeAttr(quoteHref)}" class="btn btn-accent btn-sm">${escapeHtml(c.nav.quote)}</a>
        <button class="menu-toggle" aria-label="${escapeAttr(c.toggleMenu)}"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>`;
}

function renderFooter(lang, waUrl, quoteHref, extraScripts = []) {
  const c = LOCALE_CHROME[lang] || LOCALE_CHROME.en;
  const f = c.footer;
  const scriptsHtml = [
    '  <script src="/js/main.js" defer></script>',
    '  <script src="/js/core-menu-accessibility.js" defer></script>',
    ...extraScripts.map(s => `  <script src="${s}" defer></script>`)
  ].join('\n');

  return `  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>${escapeHtml(f.company)}</h4>
          <p>${escapeHtml(f.desc)}</p>
          <p style="margin-top:0.5rem;">${escapeHtml(f.address)}</p>
        </div>
        <div class="footer-col">
          <h4>${escapeHtml(f.linksHeading)}</h4>
          <a href="${rolePath('products', lang)}">${escapeHtml(c.nav.products)}</a><br>
          <a href="${rolePath('evidence', lang)}">${escapeHtml(c.mobile.evidence)}</a><br>
          <a href="${rolePath('about', lang)}">${escapeHtml(c.mobile.about)}</a><br>
          <a href="${rolePath('news', lang)}">${escapeHtml(c.mobile.news)}</a><br>
          <a href="${rolePath('contact', lang)}">${escapeHtml(c.nav.contact)}</a>
        </div>
        <div class="footer-col">
          <h4>${escapeHtml(f.seriesHeading)}</h4>
          <a href="${rolePath('cg', lang)}">${escapeHtml(f.cgLabel)}</a><br>
          <a href="${rolePath('hw300-water-cooled-engine', lang)}">${escapeHtml(f.hw300Label)}</a><br>
          <a href="${rolePath('cb', lang)}">${escapeHtml(f.cbLabel)}</a><br>
          <a href="${rolePath('horizontal', lang)}">${escapeHtml(f.hzLabel)}</a><br>
          <a href="${rolePath('ac320', lang)}">${escapeHtml(f.ac320Label)}</a><br>
          <a href="${rolePath('hw-series', lang)}">${escapeHtml(f.hwLabel)}</a><br>
          <a href="${rolePath('btv-hub', lang)}">${escapeHtml(f.btvLabel)}</a>
        </div>
        <div class="footer-col">
          <h4>${escapeHtml(f.contactHeading)}</h4>
          <p>${escapeHtml(f.tel)}</p>
          <p>${escapeHtml(f.wa)}</p>
          <p style="margin-top:0.5rem;">${escapeHtml(f.email)}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>${escapeHtml(f.copyright)}</span>
        <span>${escapeHtml(f.location)}</span>
      </div>
    </div>
  </footer>
  <a href="${escapeAttr(waUrl)}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="${escapeAttr(c.waAria)}">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
  <div class="mobile-cta-bar">
    <a href="${escapeAttr(waUrl)}" class="btn btn-wa" target="_blank" rel="noopener">${escapeHtml(c.waLabel)}</a>
    <a href="${escapeAttr(quoteHref)}" class="btn btn-quote">${escapeHtml(c.nav.quote)}</a>
  </div>
${scriptsHtml}`;
}

module.exports = {
  ORIGIN,
  ORG_ID,
  WEBSITE_ID,
  LANGS,
  HREFLANG_MAP,
  LANG_DISPLAY_NAMES,
  ROUTE_GROUPS,
  LOCALE_CHROME,
  escapeHtml,
  escapeAttr,
  rolePath,
  roleUrl,
  hreflangTagsHtml,
  langDropdownLinksHtml,
  waHref,
  renderMobileNav,
  renderNavbar,
  renderFooter
};
