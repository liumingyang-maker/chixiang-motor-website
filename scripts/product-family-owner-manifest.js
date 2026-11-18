const routes = [
  { file: 'en/cg-engine.html', language: 'en', family: 'cg' },
  { file: 'en/cb-engine.html', language: 'en', family: 'cb' },
  { file: 'en/horizontal-engine.html', language: 'en', family: 'horizontal' },
  { file: 'en/engine-parts.html', language: 'en', family: 'parts' },
  { file: 'es/motor-cg.html', language: 'es', family: 'cg' },
  { file: 'es/motor-cb.html', language: 'es', family: 'cb' },
  { file: 'es/motor-horizontal.html', language: 'es', family: 'horizontal' },
  { file: 'es/repuestos-motor.html', language: 'es', family: 'parts' },
  { file: 'pt/motor-cg.html', language: 'pt', family: 'cg' },
  { file: 'pt/motor-cb.html', language: 'pt', family: 'cb' },
  { file: 'pt/motor-horizontal.html', language: 'pt', family: 'horizontal' },
  { file: 'pt/pecas-de-motor.html', language: 'pt', family: 'parts' },
  { file: 'ru/dvigatel-cg.html', language: 'ru', family: 'cg' },
  { file: 'ru/dvigatel-cb.html', language: 'ru', family: 'cb' },
  { file: 'ru/gorizontalnyj-dvigatel.html', language: 'ru', family: 'horizontal', protected: true },
  { file: 'ru/zapchasti-dvigatelya.html', language: 'ru', family: 'parts' },
  { file: 'ar/cg-engine.html', language: 'ar', family: 'cg', dir: 'rtl' },
  { file: 'ar/cb-engine.html', language: 'ar', family: 'cb', dir: 'rtl' },
  { file: 'ar/horizontal-engine.html', language: 'ar', family: 'horizontal', dir: 'rtl' },
  { file: 'ar/engine-parts.html', language: 'ar', family: 'parts', dir: 'rtl' }
];

const locales = {
  en: {
    labels: {
      approvedHeading: 'Approved product family information', model: 'Model', nominal: 'Nominal class',
      actual: 'Actual displacement', boreStroke: 'Bore × stroke', maxPower: 'Max power', maxTorque: 'Max torque',
      compression: 'Compression ratio', netWeight: 'Net weight', grossWeight: 'Gross weight (pkg)',
      dimensions: 'Overall dimensions', packageDimensions: 'Package dimensions', cooling: 'Cooling', start: 'Starting method',
      starterPosition: 'Electric-starter position', clutch: 'Clutch', gears: 'Transmission', options: 'Supplemental options',
      marketReference: 'Market/search reference', applications: 'Applications', checklist: 'Information needed for quotation',
      familyOptions: 'Approved family configurations', parts: 'Parts categories', category: 'Category', examples: 'Examples',
      related: 'Related product and company pages', faq: 'FAQ', contact: 'Send an inquiry', products: 'All products',
      about: 'About the factory', email: 'Email sales', carburetor: 'Carburetor',
      hwHeading: 'HW Water Heavy-Duty Specifications (200–350 cc)',
      hwNote: 'Single-cylinder, 4-stroke vertical water-cooled architecture with cooling fins, 1.5 L oil capacity, 20-roller clutch, and 18-stage DC magneto. Pressure-splash lubrication, CDI ignition, electric/kick start, manual wet multi-plate clutch. No built-in reverse.',
      horizontalCatalogHeading: 'Catalog & Reference Horizontal Specifications (110–150 cc)',
      horizontalCatalogNote: '110/125/130 specs reflect the owner catalog (10° inclined OHC four-stroke, AC CDI ignition, automatic wet multi-plate clutch, 4-speed constant mesh); 140 cc (CX1P56FMJ) and 150 cc (CX1P60FMJ) reflect standard YX-class reference metrics (manual or semi-automatic clutch; CX1P60FMJ uses an internal cylinder-head oil circuit with no external oil radiator).'
    },
    intro: {
      cg: 'CHIXIANG MOTOR supplies CG air-cooled and approved CG water-cooled engine families for international B2B distributors, assembly projects and replacement markets.',
      cb: 'CHIXIANG MOTOR supplies CB150, CB200-C and CB250 air-cooled motorcycle engines for qualified wholesale, assembly and replacement projects.',
      horizontal: 'CHIXIANG MOTOR supplies compact CX horizontal air-cooled engines in approved 110–150 cc nominal classes for wholesale and assembly projects.',
      parts: 'CHIXIANG MOTOR supplies motorcycle and cargo-tricycle engine parts for distributor stock, assembly support and after-sales service.'
    },
    values: {
      air: 'Air-cooled', water: 'Water-cooled', internalOil: 'Air-cooled with an internal cylinder-head oil circuit; no external oil radiator',
      electricKick: 'Electric / kick start', kickElectric: 'Kick or electric start', upperLower: 'Upper or lower for electric-start versions',
      manualWet: 'Manual wet multi-plate', autoWet: 'Automatic wet multi-plate', manualSemi: 'Manual or semi-automatic', manual: 'Manual clutch', five: '5-speed constant mesh', fiveRotaryReverse: '5-speed rotary (optional reverse)',
      four: '4 gears', fourConstant: '4-speed constant mesh', reverse: 'Built-in reverse or 1+1 gearbox is optional; confirm for the ordered configuration'
    },
    applications: {
      cg: ['Work and street motorcycles', 'Cargo-tricycle or ATV configurations when ordered for that application', 'Distributor replacement and assembly projects'],
      cb: ['Street, utility, and off-road motorcycles (150cc / 200cc / 250cc platforms)', 'Distributor replacement stock', 'Qualified motorcycle assembly projects'],
      horizontal: ['Mopeds, pit bikes and light enduro applications', 'Light ATV and OEM motorcycle assembly projects', 'Distributor wholesale supply'],
      parts: ['Distributor spare-parts stock', 'Engine assembly and maintenance support', 'After-sales service for matching engine families']
    },
    checklist: {
      engine: ['Target engine model or nominal displacement', 'Quantity and destination market', 'Starting, clutch, transmission and reverse configuration', 'Vehicle application and any interface requirements'],
      parts: ['Engine code and part name', 'Clear part photo or reference sample when available', 'Required quantity', 'Destination market']
    },
    marketNote: 'YX names are Russian-market search and selection references. These CX engines are manufactured by CHIXIANG MOTOR; YX is not the product brand or manufacturer.',
    familyCards: [
      ['CG balance-shaft configuration', 'For motorcycle applications, a balance shaft helps reduce single-cylinder vibration and improve running smoothness, with international 5-speed, rotary, or built-in reverse gearboxes tailored to the platform.'],
      ['Tsunami water-cooled family', 'A strengthened CG water-cooled family with cooling fins and enlarged oil capacity for improved heat dissipation and sustained-load stability. Exact oil volume remains unpublished.'],
      ['HW Water heavy-duty family', 'A heavy-duty CG water-cooled upgrade with cooling fins, 1.5 L oil capacity, heavy-duty internal parts, a 20-roller clutch and a high-output magneto. No built-in reverse.'],
      ['Automatic-clutch water-cooled family', 'Available only in CG150 and CG175 classes, with automatic centrifugal clutch. It is a separate family from built-in-reverse configurations.']
    ],
    partsCategories: [
      ['Cylinder Set', 'Cylinder blocks, pistons, rings and gasket kits (sized per displacement)'],
      ['Cylinder Head', 'Cylinder head assemblies, intake/exhaust ports and cam/valve seats'],
      ['Clutch Plate', 'Friction plates, steel plates, 20-roller one-way & heavy-duty clutch assemblies'],
      ['Magneto Coil', 'Stator coils (including high-output DC options) and rotor/flywheel assemblies'],
      ['Valve', 'Intake and exhaust valves paired per head and displacement specification'],
      ['Oil Pump', 'Oil pump assemblies and drive gears for pressurized splash lubrication'],
      ['Crankshaft', 'Crankshafts and connecting-rod assemblies matching exact stroke & pin specs'],
      ['Starting Shaft', 'Kick-starter shafts, return springs and ratchet gears'],
      ['Variable Shaft', 'Gearshift drums, shift forks and gear-selector shafts'],
      ['Main Shaft', 'Transmission main shafts, countershafts and constant-mesh gear sets'],
      ['Starter Motor', 'Electric starter motors (upper or lower mount depending on engine code)'],
      ['Bearings, Spark Plugs & Gears', 'Crankcase bearings, spark plugs and primary/timing drive gears'],
      ['Electrical & Ignition Parts', 'CDI units, voltage regulators/rectifiers, ignition coils and starter relays']
    ],
    partsMatrixHeading: 'Engine Platform Coverage & Fitment Checklist',
    partsMatrixColumns: ['Engine family', 'Core overhaul & wear parts supplied', 'Dimensions confirmed before quotation'],
    partsMatrixRows: [
      ['Horizontal CX (110–150 cc)', 'Cylinder set, head, clutch plates, magneto stator, 4-speed shafts, starter/shift shafts, AC CDI', 'Nominal/actual cc, bore size, manual vs. automatic/semi-auto clutch, upper/lower starter mount'],
      ['CG Air-Cooled (125–250 cc)', 'Cylinder & piston kit, pushrod/rocker head, 5-speed shafts, crankshaft, magneto, oil pump', 'Exact model code (CG125–CG250), bore × stroke, wristpin diameter, balance-shaft option'],
      ['CG Water & HW (150–350 cc)', 'Water-cooled cylinder/head, 20-roller clutch (HW), 18-stage DC magneto, valves, gaskets, PZ30-matched parts', 'Standard SB vs. HW series, output shaft/spline, magneto plug pins, presence or absence of reverse gear'],
      ['CB Series (150–250 cc)', 'OHC chain-driven cylinder head, timing chain & tensioner, 5-speed transmission, crankshaft, clutch', 'Exact model (CB150 / CB200-C / CB250), displacement (149 / 197 / 223 cc), electrical connector style']
    ],
    partsMatrixNote: 'Parts can be consolidated into mixed container orders alongside complete engines (MOQ 50 engines / mixed-order support, ~10 working days regular lead time, FOB Guangzhou or major Chinese ports, 60-day warranty after destination port arrival).',
    faq: {
      engine: [
        ['How do you confirm the correct configuration?', 'Send the model, intended vehicle, quantity and destination market. Starting, clutch, transmission, reverse and interfaces are confirmed before quotation.'],
        ['Can the engine be customized for a market?', 'OEM branding, packaging and approved configuration choices can be discussed for qualified bulk orders.'],
        ['Can matching spare parts ship with engines?', 'Matching service parts can be discussed after the engine model and ordered configuration are confirmed.']
      ],
      parts: [
        ['How do you identify the correct part?', 'Send the engine code, part name, clear photo or reference sample, quantity and destination market.'],
        ['How is parts compatibility checked?', 'Compatibility is checked against the engine code, configuration and sample information supplied with the inquiry.'],
        ['Can parts ship with engine orders?', 'Matching service parts can be combined with an engine order after the model and required quantities are confirmed.']
      ]
    },
    paths: { products: '/en/products', about: '/en/about', contact: '/en/contact', email: 'mailto:chixiangmotor@163.com' }
  },
  es: {
    labels: {
      approvedHeading: 'Información aprobada de la familia de productos', model: 'Modelo', nominal: 'Clase nominal',
      actual: 'Cilindrada real', boreStroke: 'Diámetro × carrera', maxPower: 'Potencia máx.', maxTorque: 'Torque máx.',
      compression: 'Compresión', netWeight: 'Peso neto', grossWeight: 'Peso bruto (empaque)',
      dimensions: 'Dimensiones', packageDimensions: 'Dimensiones de empaque', cooling: 'Refrigeración', start: 'Arranque',
      starterPosition: 'Posición del arranque eléctrico', clutch: 'Embrague', gears: 'Transmisión', options: 'Opciones adicionales',
      marketReference: 'Referencia de mercado/búsqueda', applications: 'Aplicaciones', checklist: 'Información necesaria para cotizar',
      familyOptions: 'Configuraciones de familia aprobadas', parts: 'Categorías de repuestos', category: 'Categoría', examples: 'Ejemplos',
      related: 'Páginas relacionadas de productos y empresa', faq: 'Preguntas frecuentes', contact: 'Enviar una consulta', products: 'Todos los productos',
      about: 'Acerca de la fábrica', email: 'Enviar correo a ventas', carburetor: 'Carburador',
      hwHeading: 'Especificaciones HW Water de servicio pesado (200–350 cc)',
      hwNote: 'Arquitectura vertical monocilíndrica de 4 tiempos refrigerada por agua con aletas de enfriamiento, capacidad de aceite de 1,5 L, embrague de 20 rodillos y magneto CC de 18 etapas. Lubricación por presión y salpicadura, encendido CDI, arranque eléctrico/pedal y embrague manual multidisco húmedo. Sin reversa interna.',
      horizontalCatalogHeading: 'Especificaciones horizontales de catálogo y referencia (110–150 cc)',
      horizontalCatalogNote: 'Los datos de 110/125/130 cc provienen del catálogo oficial (4 tiempos inclinado 10° OHC, encendido CDI CA, embrague automático multidisco húmedo y 4 velocidades); 140 cc (CX1P56FMJ) y 150 cc (CX1P60FMJ) corresponden a valores estándar de referencia clase YX (embrague manual o semiautomático; CX1P60FMJ incorpora circuito interno de aceite en culata sin radiador externo).'
    },
    intro: {
      cg: 'CHIXIANG MOTOR suministra familias de motores CG refrigerados por aire y familias CG refrigeradas por agua aprobadas para distribuidores B2B, proyectos de ensamblaje y mercados de reposición.',
      cb: 'CHIXIANG MOTOR suministra motores CB150, CB200-C y CB250 refrigerados por aire para proyectos mayoristas, de ensamblaje y reposición.',
      horizontal: 'CHIXIANG MOTOR suministra motores horizontales CX compactos, refrigerados por aire, en clases nominales aprobadas de 110 a 150 cc.',
      parts: 'CHIXIANG MOTOR suministra repuestos para motores de motocicletas y trimotos de carga destinados a distribuidores, ensamblaje y servicio posventa.'
    },
    values: {
      air: 'Refrigerado por aire', water: 'Refrigerado por agua', internalOil: 'Refrigerado por aire con circuito interno de aceite en la culata; sin radiador externo',
      electricKick: 'Arranque eléctrico / pedal', kickElectric: 'Arranque por pedal o eléctrico', upperLower: 'Superior o inferior en versiones con arranque eléctrico',
      manualWet: 'Manual multidisco húmedo', autoWet: 'Automático multidisco húmedo', manualSemi: 'Manual o semiautomático', manual: 'Manual', five: '5 velocidades de engrane constante', fiveRotaryReverse: '5 velocidades rotativo (reversa opcional)',
      four: '4 velocidades', fourConstant: '4 velocidades de engrane constante', reverse: 'Reversa integrada o caja 1+1 opcional; confirmar según la configuración pedida'
    },
    applications: {
      cg: ['Motocicletas de trabajo y de calle', 'Configuraciones para trimoto de carga o ATV cuando se solicitan para esa aplicación', 'Reposición y proyectos de ensamblaje para distribuidores'],
      cb: ['Motocicletas de calle y off-road según configuración', 'Stock de reposición para distribuidores', 'Proyectos calificados de ensamblaje'],
      horizontal: ['Ciclomotores, pit bikes y enduro ligero', 'ATV ligero y proyectos de ensamblaje según configuración', 'Suministro mayorista para distribuidores'],
      parts: ['Stock mayorista de repuestos', 'Soporte para ensamblaje y mantenimiento', 'Servicio posventa de familias de motor compatibles']
    },
    checklist: {
      engine: ['Modelo objetivo o cilindrada nominal', 'Cantidad y mercado de destino', 'Configuración de arranque, embrague, transmisión y reversa', 'Aplicación del vehículo y requisitos de interfaz'],
      parts: ['Código del motor y nombre de la pieza', 'Foto clara o muestra de referencia cuando esté disponible', 'Cantidad requerida', 'Mercado de destino']
    },
    marketNote: 'Los nombres YX son referencias de mercado y búsqueda. Estos motores CX son fabricados por CHIXIANG MOTOR; YX no es la marca ni el fabricante del producto.',
    familyCards: [
      ['Configuración CG con eje balanceador', 'Para motocicletas, el eje balanceador puede ayudar a reducir la vibración monocilíndrica y mejorar la suavidad. El cambio y la reversa dependen del pedido.'],
      ['Familia Tsunami refrigerada por agua', 'Familia CG reforzada con aletas de refrigeración y mayor capacidad de aceite para mejorar la disipación de calor y la estabilidad bajo carga. El volumen exacto no se publica.'],
      ['Familia pesada HW Water', 'Actualización pesada CG con aletas, 1,5 L de aceite, componentes internos reforzados, embrague de 20 rodillos y magneto de alta salida. Sin reversa integrada.'],
      ['Familia automática refrigerada por agua', 'Disponible solo en clases CG150 y CG175 con embrague centrífugo automático. Es distinta de las configuraciones con reversa integrada.']
    ],
    partsCategories: [
      ['Juego de cilindro (Cylinder Set)', 'Camisas, bloques, pistones, anillos y empaques según cilindrada'],
      ['Culata (Cylinder Head)', 'Conjuntos de culata, asientos de válvula y conductos'],
      ['Discos y embrague (Clutch Plate)', 'Discos de fricción, discos de acero, embrague de 20 rodillos (HW) y conjuntos'],
      ['Bobina de magneto (Magneto Coil)', 'Estatores (incluidas opciones CC de alta salida) y rotores'],
      ['Válvulas (Valve)', 'Válvulas de admisión y escape según culata y cilindrada'],
      ['Bomba de aceite (Oil Pump)', 'Conjuntos de bomba de aceite y engranajes de mando'],
      ['Cigüeñal (Crankshaft)', 'Cigüeñales y bielas según carrera y diámetro de bulón'],
      ['Eje de arranque (Starting Shaft)', 'Ejes de pedal de arranque, resortes y trinquetes'],
      ['Eje selector (Variable Shaft)', 'Tambores selectores, horquillas y ejes de cambio'],
      ['Eje principal (Main Shaft)', 'Ejes primario/secundario y juegos de piñones de transmisión'],
      ['Motor de arranque (Starter Motor)', 'Motores de arranque eléctrico (posición superior o inferior según modelo)'],
      ['Rodamientos, bujías y engranajes', 'Rodamientos de cárter, bujías y piñones primarios/distribución'],
      ['Sistema eléctrico y encendido', 'Unidades CDI, reguladores/rectificadores, bobinas de alta y relés']
    ],
    partsMatrixHeading: 'Cobertura por plataforma y lista de verificación',
    partsMatrixColumns: ['Familia de motor', 'Repuestos clave suministrados', 'Datos confirmados antes de cotizar'],
    partsMatrixRows: [
      ['Horizontal CX (110–150 cc)', 'Cilindro, culata, discos de embrague, estator, ejes de 4 velocidades, eje de arranque/cambio, CDI', 'Cilindrada real, diámetro del cilindro, embrague automático/semiautomático/manual, posición del arranque'],
      ['CG Aire (125–250 cc)', 'Kit de cilindro y pistón, culata, caja de 5 velocidades, cigüeñal, magneto, bomba de aceite', 'Código exacto (CG125–CG250), diámetro × carrera, diámetro de bulón, opción con eje balanceador'],
      ['CG Agua y HW (150–350 cc)', 'Cilindro/culata refrigerados por agua, embrague de 20 rodillos (HW), magneto de 18 etapas, válvulas y juntas', 'Serie SB estándar vs. HW pesado, eje de salida/estrías, conector de magneto y configuración de reversa'],
      ['Serie CB (150–250 cc)', 'Culata OHC por cadena, cadena de distribución y tensor, caja de 5 velocidades, cigüeñal y embrague', 'Modelo exacto (CB150 / CB200-C / CB250), cilindrada (149 / 197 / 223 cc) y tipo de conectores']
    ],
    partsMatrixNote: 'Los repuestos pueden consolidarse en contenedores mixtos junto con motores completos (pedidos mayoristas desde 50 motores mixtos, plazo habitual ~10 días hábiles, FOB Guangzhou o principales puertos de China, garantía de 60 días desde la llegada al puerto de destino).',
    faq: {
      engine: [
        ['¿Cómo confirman la configuración correcta?', 'Envíe modelo, vehículo, cantidad y mercado de destino. Antes de cotizar se confirman arranque, embrague, transmisión, reversa e interfaces.'],
        ['¿Se puede personalizar el motor para mi mercado?', 'Marca OEM, empaque y configuraciones aprobadas pueden revisarse para pedidos mayoristas calificados.'],
        ['¿Pueden enviarse repuestos junto con los motores?', 'Los repuestos compatibles pueden revisarse después de confirmar el modelo y la configuración solicitada.']
      ],
      parts: [
        ['¿Cómo identifican la pieza correcta?', 'Envíe código del motor, nombre de la pieza, foto clara o muestra, cantidad y mercado de destino.'],
        ['¿Cómo se verifica la compatibilidad?', 'Se comprueba según el código del motor, la configuración y la muestra enviada.'],
        ['¿Pueden combinar repuestos con un pedido de motores?', 'Sí, después de confirmar el modelo y las cantidades requeridas.']
      ]
    },
    paths: { products: '/es/products', about: '/es/about', contact: '/es/contacto', email: 'mailto:chixiangmotor@163.com' }
  },
  pt: {
    labels: {
      approvedHeading: 'Informações aprovadas da família de produtos', model: 'Modelo', nominal: 'Classe nominal',
      actual: 'Cilindrada real', boreStroke: 'Diâmetro × curso', maxPower: 'Potência máx.', maxTorque: 'Torque máx.',
      compression: 'Compressão', netWeight: 'Peso líquido', grossWeight: 'Peso bruto (embalagem)',
      dimensions: 'Dimensões', packageDimensions: 'Dimensões da embalagem', cooling: 'Refrigeração', start: 'Partida',
      starterPosition: 'Posição da partida elétrica', clutch: 'Embreagem', gears: 'Transmissão', options: 'Opções adicionais',
      marketReference: 'Referência de mercado/pesquisa', applications: 'Aplicações', checklist: 'Informações necessárias para cotação',
      familyOptions: 'Configurações de família aprovadas', parts: 'Categorias de peças', category: 'Categoria', examples: 'Exemplos',
      related: 'Páginas relacionadas de produtos e empresa', faq: 'Perguntas frequentes', contact: 'Enviar consulta', products: 'Todos os produtos',
      about: 'Sobre a fábrica', email: 'Enviar e-mail para vendas', carburetor: 'Carburador',
      hwHeading: 'Especificações HW Water para serviço pesado (200–350 cc)',
      hwNote: 'Arquitetura vertical monocilíndrica de 4 tempos refrigerada a água com aletas, 1,5 L de óleo, embreagem de 20 roletes e magneto CC de 18 estágios. Lubrificação por pressão e salpico, ignição CDI, partida elétrica/pedal e embreagem manual multidisco úmida. Sem marcha à ré interna.',
      horizontalCatalogHeading: 'Especificações horizontais de catálogo e referência (110–150 cc)',
      horizontalCatalogNote: 'Os modelos 110/125/130 cc seguem o catálogo oficial (4 tempos inclinado 10° OHC, ignição CDI CA, embreagem automática multidisco úmida e 4 marchas); 140 cc (CX1P56FMJ) e 150 cc (CX1P60FMJ) utilizam parâmetros padrão de referência classe YX (embreagem manual ou semiautomática; CX1P60FMJ com circuito interno de óleo no cabeçote e sem radiador externo).'
    },
    intro: {
      cg: 'A CHIXIANG MOTOR fornece famílias de motores CG refrigerados a ar e famílias CG refrigeradas a água aprovadas para distribuidores B2B, montagem e reposição.',
      cb: 'A CHIXIANG MOTOR fornece motores CB150, CB200-C e CB250 refrigerados a ar para atacado, montagem e reposição.',
      horizontal: 'A CHIXIANG MOTOR fornece motores horizontais CX compactos, refrigerados a ar, nas classes nominais aprovadas de 110 a 150 cc.',
      parts: 'A CHIXIANG MOTOR fornece peças para motores de motocicletas e triciclos de carga para estoque, montagem e pós-venda.'
    },
    values: {
      air: 'Refrigerado a ar', water: 'Refrigerado a água', internalOil: 'Refrigerado a ar com circuito interno de óleo no cabeçote; sem radiador externo',
      electricKick: 'Partida elétrica / pedal', kickElectric: 'Partida por pedal ou elétrica', upperLower: 'Superior ou inferior nas versões elétricas',
      manualWet: 'Manual multidisco úmida', autoWet: 'Automática multidisco úmida', manualSemi: 'Manual ou semiautomática', manual: 'Manual', five: '5 marchas de engrenamento constante', fiveRotaryReverse: '5 marchas rotativo (ré opcional)',
      four: '4 marchas', fourConstant: '4 marchas de engrenamento constante', reverse: 'Ré integrada ou caixa 1+1 opcional; confirmar na configuração pedida'
    },
    applications: {
      cg: ['Motocicletas de trabalho e urbanas', 'Configurações para triciclo de carga ou ATV quando pedidas para essa aplicação', 'Reposição e montagem para distribuidores'],
      cb: ['Motocicletas urbanas e off-road conforme configuração', 'Estoque de reposição para distribuidores', 'Projetos qualificados de montagem'],
      horizontal: ['Ciclomotores, pit bikes e enduro leve', 'ATV leve e montagem conforme configuração', 'Fornecimento atacadista'],
      parts: ['Estoque atacadista de peças', 'Suporte à montagem e manutenção', 'Pós-venda para famílias de motor correspondentes']
    },
    checklist: {
      engine: ['Modelo ou cilindrada nominal', 'Quantidade e mercado de destino', 'Partida, embreagem, transmissão e ré', 'Aplicação do veículo e interfaces necessárias'],
      parts: ['Código do motor e nome da peça', 'Foto clara ou amostra quando disponível', 'Quantidade necessária', 'Mercado de destino']
    },
    marketNote: 'Os nomes YX são referências de mercado e pesquisa. Estes motores CX são fabricados pela CHIXIANG MOTOR; YX não é a marca nem o fabricante do produto.',
    familyCards: [
      ['Configuração CG com eixo balanceador', 'Para motocicletas, o eixo pode ajudar a reduzir a vibração monocilíndrica e melhorar a suavidade. Marchas e ré dependem do pedido.'],
      ['Família Tsunami refrigerada a água', 'Família CG reforçada com aletas e maior capacidade de óleo para melhorar dissipação e estabilidade sob carga. O volume exato não é publicado.'],
      ['Família pesada HW Water', 'Atualização pesada CG com aletas, 1,5 L de óleo, internos reforçados, embreagem de 20 roletes e magneto de alta saída. Sem ré integrada.'],
      ['Família automática refrigerada a água', 'Disponível somente nas classes CG150 e CG175 com embreagem centrífuga automática. É separada das configurações com ré integrada.']
    ],
    partsCategories: [
      ['Conjunto de cilindro (Cylinder Set)', 'Cilindros, pistões, anéis e jogos de juntas por cilindrada'],
      ['Cabeçote (Cylinder Head)', 'Conjuntos de cabeçote, sedes de válvula e dutos'],
      ['Discos de embreagem (Clutch Plate)', 'Discos de fricção, discos de aço, embreagem de 20 roletes (HW) e conjuntos'],
      ['Bobina do magneto (Magneto Coil)', 'Estatores (incluindo versões CC de alta saída) e rotores'],
      ['Válvulas (Valve)', 'Válvulas de admissão e escape pareadas conforme cabeçote e cilindrada'],
      ['Bomba de óleo (Oil Pump)', 'Conjuntos de bomba de óleo e engrenagens de acionamento'],
      ['Virabrequim (Crankshaft)', 'Virabrequins e bielas conforme curso e diâmetro de pino'],
      ['Eixo de partida (Starting Shaft)', 'Eixos do pedal de partida, molas e catracas'],
      ['Eixo seletor (Variable Shaft)', 'Tambores seletores, garfos e eixos de mudança'],
      ['Eixo principal (Main Shaft)', 'Eixos primário/secundário e engrenagens de câmbio'],
      ['Motor de partida (Starter Motor)', 'Motores de partida elétrica (montagem superior ou inferior conforme modelo)'],
      ['Rolamentos, velas e engrenagens', 'Rolamentos de carcaça, velas e engrenagens primárias/distribuição'],
      ['Peças elétricas e ignição', 'Unidades CDI, reguladores/retificadores, bobinas de ignição e relés']
    ],
    partsMatrixHeading: 'Cobertura por plataforma e verificação de encaixe',
    partsMatrixColumns: ['Família do motor', 'Principais peças fornecidas', 'Parâmetros confirmados antes da cotação'],
    partsMatrixRows: [
      ['Horizontal CX (110–150 cc)', 'Conjunto de cilindro, cabeçote, discos, estator, eixos de 4 marchas, partida/câmbio e CDI', 'Cilindrada real, diâmetro, embreagem automática/semiautomática/manual, posição da partida elétrica'],
      ['CG a Ar (125–250 cc)', 'Kit cilindro/pistão, cabeçote, câmbio de 5 marchas, virabrequim, magneto e bomba de óleo', 'Código exato (CG125–CG250), diâmetro × curso, pino do pistão e opção com eixo balanceador'],
      ['CG Água e HW (150–350 cc)', 'Cilindro/cabeçote refrigerados a água, embreagem 20 roletes (HW), magneto 18 estágios, válvulas', 'Linha SB padrão vs. HW pesada, eixo de saída/estrias, conector do magneto e presença de marcha à ré'],
      ['Série CB (150–250 cc)', 'Cabeçote OHC por corrente, corrente de comando e tensor, câmbio de 5 marchas e embreagem', 'Modelo exato (CB150 / CB200-C / CB250), cilindrada (149 / 197 / 223 cc) e conectores elétricos']
    ],
    partsMatrixNote: 'As peças podem ser consolidadas no mesmo contêiner com motores completos (MOQ de 50 motores com modelos mistos, prazo padrão ~10 dias úteis, FOB Guangzhou ou principais portos da China, garantia de 60 dias após a chegada ao porto de destino).',
    faq: {
      engine: [
        ['Como confirmam a configuração correta?', 'Envie modelo, veículo, quantidade e mercado. Partida, embreagem, transmissão, ré e interfaces são confirmadas antes da cotação.'],
        ['O motor pode ser personalizado para meu mercado?', 'Marca OEM, embalagem e configurações aprovadas podem ser avaliadas para pedidos atacadistas qualificados.'],
        ['As peças podem ser enviadas com os motores?', 'Peças correspondentes podem ser avaliadas após a confirmação do modelo e da configuração.']
      ],
      parts: [
        ['Como identificam a peça correta?', 'Envie código do motor, nome da peça, foto clara ou amostra, quantidade e mercado de destino.'],
        ['Como a compatibilidade é verificada?', 'A verificação usa o código do motor, a configuração e a amostra fornecida.'],
        ['As peças podem acompanhar um pedido de motores?', 'Sim, depois da confirmação do modelo e das quantidades necessárias.']
      ]
    },
    paths: { products: '/pt/products', about: '/pt/about', contact: '/pt/contato', email: 'mailto:chixiangmotor@163.com' }
  },
  ru: {
    labels: {
      approvedHeading: 'Подтверждённая информация о семействе', model: 'Модель', nominal: 'Номинальный класс',
      actual: 'Фактический объём', boreStroke: 'Диаметр × ход', maxPower: 'Макс. мощность', maxTorque: 'Макс. крутящий момент',
      compression: 'Степень сжатия', netWeight: 'Вес нетто', grossWeight: 'Вес брутто (упак.)',
      dimensions: 'Габариты', packageDimensions: 'Габариты упаковки', cooling: 'Охлаждение', start: 'Запуск',
      starterPosition: 'Положение электростартера', clutch: 'Сцепление', gears: 'Коробка передач', options: 'Дополнительные варианты',
      marketReference: 'Рыночное/поисковое обозначение', applications: 'Применение', checklist: 'Данные для расчёта предложения',
      familyOptions: 'Подтверждённые конфигурации семейства', parts: 'Категории запчастей', category: 'Категория', examples: 'Примеры',
      related: 'Связанные страницы продукции и компании', faq: 'Частые вопросы', contact: 'Отправить запрос', products: 'Вся продукция',
      about: 'О заводе', email: 'Написать в отдел продаж', carburetor: 'Карбюратор',
      hwHeading: 'Характеристики серии HW Water повышенной прочности (200–350 см³)',
      hwNote: 'Одноцилиндровый 4-тактный вертикальный двигатель с водяным охлаждением и оребрением, объёмом масла 1,5 л, 20-роликовой муфтой, 18-катушечным магнето постоянного тока, смазкой под давлением и разбрызгиванием, зажиганием CDI, электро-/кикстартером и ручным многодисковым сцеплением. Без встроенного реверса.',
      horizontalCatalogHeading: 'Каталожные и справочные характеристики (110–150 см³)',
      horizontalCatalogNote: 'Данные для 110/125/130 см³ взяты из каталога производителя (4-тактный наклон 10°, верхний распредвал, AC CDI, автоматическое многодисковое сцепление, 4 передачи); для 140 см³ (CX1P56FMJ) и 150 см³ (CX1P60FMJ) приведены стандартные справочные параметры класса YX (ручное или полуавтоматическое сцепление; CX1P60FMJ оснащён внутренним масляным контуром головки без внешнего радиатора).'
    },
    intro: {
      cg: 'CHIXIANG MOTOR поставляет семейства воздушных и подтверждённых водяных двигателей CG для B2B-дистрибьюторов, сборочных проектов и рынка замены.',
      cb: 'CHIXIANG MOTOR поставляет воздушные двигатели CB150, CB200-C и CB250 для оптовых, сборочных и сервисных проектов.',
      horizontal: 'CHIXIANG MOTOR поставляет компактные горизонтальные двигатели CX подтверждённых номинальных классов 110–150 см³.',
      parts: 'CHIXIANG MOTOR поставляет запчасти для двигателей мотоциклов и грузовых трициклов для складов дистрибьюторов, сборки и сервиса.'
    },
    values: {
      air: 'Воздушное', water: 'Водяное', internalOil: 'Воздушное с внутренним масляным контуром в головке цилиндра; без внешнего радиатора',
      electricKick: 'Электро- / кикстартер', kickElectric: 'Кикстартер или электростартер', upperLower: 'Верхнее или нижнее для версий с электростартером',
      manualWet: 'Ручное многодисковое в масляной ванне', autoWet: 'Автоматическое многодисковое в масляной ванне', manualSemi: 'Ручное или полуавтоматическое', manual: 'Ручное', five: '5-ступенчатая постоянного зацепления', fiveRotaryReverse: '5-ступенчатая круговая (задний ход опционально)',
      four: '4 передачи', fourConstant: '4-ступенчатая постоянного зацепления', reverse: 'Опционально встроенный реверс или коробка 1+1; подтвердить для заказа'
    },
    applications: {
      cg: ['Рабочие и дорожные мотоциклы', 'Грузовые трициклы или ATV в соответствующей заказной конфигурации', 'Замена и сборочные проекты дистрибьюторов'],
      cb: ['Дорожные и внедорожные мотоциклы в зависимости от конфигурации', 'Сервисный запас дистрибьютора', 'Квалифицированные сборочные проекты'],
      horizontal: ['Мопеды, питбайки и лёгкий эндуро', 'Лёгкие ATV и сборочные проекты с подтверждением конфигурации', 'Оптовые поставки дистрибьюторам'],
      parts: ['Оптовый склад запчастей', 'Поддержка сборки и ремонта', 'Послепродажный сервис соответствующих семейств двигателей']
    },
    checklist: {
      engine: ['Модель или номинальный объём', 'Количество и рынок назначения', 'Запуск, сцепление, коробка и реверс', 'Применение техники и требования к интерфейсам'],
      parts: ['Код двигателя и название детали', 'Чёткое фото или образец при наличии', 'Требуемое количество', 'Рынок назначения']
    },
    marketNote: 'Обозначения YX используются как рыночные и поисковые ориентиры. Эти двигатели CX производит CHIXIANG MOTOR; YX не является брендом или производителем товара.',
    familyCards: [
      ['CG с балансирным валом', 'Для мотоциклов балансирный вал помогает уменьшить вибрацию одноцилиндрового двигателя и повысить плавность. Схема передач и реверс зависят от заказа.'],
      ['Водяное семейство Tsunami', 'Усиленное семейство CG с рёбрами охлаждения и увеличенным объёмом масла для теплоотвода и стабильности под нагрузкой. Точный объём не публикуется.'],
      ['Тяжёлое семейство HW Water', 'Усиленная версия CG с рёбрами, 1,5 л масла, тяжёлыми внутренними деталями, 20-роликовым сцеплением и магнето повышенной мощности. Без встроенного реверса.'],
      ['Водяное семейство с автоматическим сцеплением', 'Только классы CG150 и CG175 с центробежным автоматическим сцеплением. Отдельно от конфигураций со встроенным реверсом.']
    ],
    partsCategories: [
      ['Цилиндро-поршневая группа (Cylinder Set)', 'Цилиндры, поршни, кольца и комплекты прокладок по кубатуре'],
      ['Головка цилиндра (Cylinder Head)', 'Головки цилиндра в сборе, сёдла и каналы клапанов'],
      ['Сцепление и диски (Clutch Plate)', 'Фрикционные и стальные диски, 20-роликовая муфта (HW) и узлы в сборе'],
      ['Катушки магнето (Magneto Coil)', 'Статоры (включая 18-катушечные генераторы постоянного тока) и роторы'],
      ['Клапаны (Valve)', 'Впускные и выпускные клапаны под конкретную головку и объём'],
      ['Масляный насос (Oil Pump)', 'Масляные насосы и приводные шестерни смазки'],
      ['Коленвал (Crankshaft)', 'Коленчатые валы и шатуны под точный ход поршня и палец'],
      ['Вал кикстартера (Starting Shaft)', 'Валы кикстартера, пружины возврата и храповики'],
      ['Копирный вал КПП (Variable Shaft)', 'Барабаны переключения передач, вилки и валы селектора'],
      ['Первичный и вторичный валы (Main Shaft)', 'Первичные/вторичные валы КПП и комплекты шестерён'],
      ['Электростартер (Starter Motor)', 'Стартеры (верхнее или нижнее крепление в зависимости от модели)'],
      ['Подшипники, свечи и малые шестерни', 'Подшипники картера, свечи зажигания и первичные шестерни'],
      ['Электрика и зажигание', 'Коммутаторы CDI, реле-регуляторы, катушки зажигания и реле стартера']
    ],
    partsMatrixHeading: 'Охват по платформам и карта проверки перед заказом',
    partsMatrixColumns: ['Семейство двигателей', 'Основные узлы и детали в поставке', 'Параметры, сверяемые перед расчётом'],
    partsMatrixRows: [
      ['Горизонтальные CX (110–150 cc)', 'ЦПГ, головка, диски сцепления, статор, валы 4-ст. КПП, валы запуска/переключения, CDI', 'Фактический объём, диаметр цилиндра, тип сцепления (автомат/полуавтомат/механика), положение стартера'],
      ['CG воздушные (125–250 cc)', 'ЦПГ, головка толкательного типа, валы 5-ст. КПП, коленвал, магнето, масляный насос', 'Точный код (CG125–CG250), диаметр × ход, диаметр поршневого пальца, наличие балансирного вала'],
      ['CG водяные и HW (150–350 cc)', 'Цилиндр/головка водяного охлаждения, 20-роликовая муфта (HW), магнето 18 этапов, клапаны', 'Стандартная серия SB или тяжёлая HW, выходной вал/шлицы, разъём магнето, наличие встроенного реверса'],
      ['Серия CB (150–250 cc)', 'Верхневальная головка OHC, цепь ГРМ и натяжитель, 5-ст. КПП, коленвал и сцепление', 'Точная модель (CB150 / CB200-C / CB250), объём (149 / 197 / 223 cc) и тип разъёмов']
    ],
    partsMatrixNote: 'Запчасти можно объединять в смешанный контейнер с комплектными двигателями (MOQ от 50 двигателей разных моделей, стандартный срок ~10 рабочих дней, FOB Гуанчжоу или другие порты Китая, гарантия 60 дней после прибытия в порт назначения).',
    faq: {
      engine: [
        ['Как подтверждается нужная конфигурация?', 'Укажите модель, технику, количество и рынок. До расчёта подтверждаются запуск, сцепление, коробка, реверс и интерфейсы.'],
        ['Можно ли адаптировать двигатель под рынок?', 'OEM-маркировка, упаковка и подтверждённые конфигурации обсуждаются для квалифицированных оптовых заказов.'],
        ['Можно ли отправить запчасти вместе с двигателями?', 'Совместимые сервисные детали обсуждаются после подтверждения модели и заказной конфигурации.']
      ],
      parts: [
        ['Как определить нужную деталь?', 'Пришлите код двигателя, название детали, чёткое фото или образец, количество и рынок назначения.'],
        ['Как проверяется совместимость деталей?', 'Проверка выполняется по коду двигателя, конфигурации и предоставленному образцу.'],
        ['Можно ли объединить детали с заказом двигателей?', 'Да, после подтверждения модели и требуемого количества.']
      ]
    },
    paths: { products: '/ru/products', about: '/ru/about', contact: '/ru/kontakty', email: 'mailto:chixiangmotor@163.com' }
  },
  ar: {
    labels: {
      approvedHeading: 'معلومات معتمدة عن عائلة المنتج', model: 'الطراز', nominal: 'الفئة الاسمية',
      actual: 'السعة الفعلية', boreStroke: 'القطر × الشوط', maxPower: 'أقصى قدرة', maxTorque: 'أقصى عزم',
      compression: 'نسبة الانضغاط', netWeight: 'الوزن الصافي', grossWeight: 'الوزن الإجمالي (التغليف)',
      dimensions: 'الأبعاد', packageDimensions: 'أبعاد التغليف', cooling: 'التبريد', start: 'طريقة التشغيل',
      starterPosition: 'موضع بادئ التشغيل الكهربائي', clutch: 'القابض', gears: 'ناقل الحركة', options: 'خيارات إضافية',
      marketReference: 'مرجع السوق/البحث', applications: 'الاستخدامات', checklist: 'المعلومات المطلوبة لعرض السعر',
      familyOptions: 'تكوينات عائلة معتمدة', parts: 'فئات قطع الغيار', category: 'الفئة', examples: 'أمثلة',
      related: 'صفحات المنتجات والشركة ذات الصلة', faq: 'الأسئلة الشائعة', contact: 'إرسال استفسار', products: 'جميع المنتجات',
      about: 'عن المصنع', email: 'مراسلة المبيعات', carburetor: 'المكربن',
      hwHeading: 'مواصفات سلسلة HW Water للخدمة الشاقة (200–350 سم³)',
      hwNote: 'محرك عمودي أحادي الأسطوانة رباعي الأشواط مبرد بالماء مع زعانف تبريد وسعة زيت 1.5 لتر وقابض من 20 بكرة ومغناطيس تيار مستمر 18 مرحلة. تزييت بالضغط والطرطشة، إشعال CDI، تشغيل كهربائي/بالقدم، وقابض يدوي متعدد الأقراص رطب. دون ترس رجوع داخلي.',
      horizontalCatalogHeading: 'مواصفات الكتالوج والمرجع للمحركات الأفقية (110–150 سم³)',
      horizontalCatalogNote: 'بيانات 110/125/130 سم³ وفق الكتالوج الرسمي (رباعي الأشواط مائل 10 درجات بعمود حدبات علوي، إشعال AC CDI، قابض أوتوماتيكي متعدد الأقراص، 4 سرعات)؛ وتعتمد فئتا 140 سم³ (CX1P56FMJ) و150 سم³ (CX1P60FMJ) معايير المرجع القياسية لفئة YX (قابض يدوي أو نصف أوتوماتيكي؛ ويضم CX1P60FMJ دائرة زيت داخلية في رأس الأسطوانة دون مبرد خارجي).'
    },
    intro: {
      cg: 'توفر CHIXIANG MOTOR عائلات محركات CG المبردة بالهواء وعائلات CG المبردة بالماء المعتمدة للموزعين ومشاريع التجميع وأسواق الاستبدال B2B.',
      cb: 'توفر CHIXIANG MOTOR محركات CB150 وCB200-C وCB250 المبردة بالهواء لمشاريع الجملة والتجميع والاستبدال المؤهلة.',
      horizontal: 'توفر CHIXIANG MOTOR محركات CX أفقية مدمجة مبردة بالهواء ضمن الفئات الاسمية المعتمدة من 110 إلى 150 سم³.',
      parts: 'توفر CHIXIANG MOTOR قطع غيار محركات الدراجات النارية ودراجات الشحن ثلاثية العجلات لمخزون الموزعين والتجميع وخدمة ما بعد البيع.'
    },
    values: {
      air: 'تبريد بالهواء', water: 'تبريد بالماء', internalOil: 'تبريد بالهواء مع دائرة زيت داخلية في رأس الأسطوانة؛ دون مبرد خارجي',
      electricKick: 'تشغيل كهربائي / بالقدم', kickElectric: 'تشغيل بالقدم أو كهربائي', upperLower: 'علوي أو سفلي في نسخ التشغيل الكهربائي',
      manualWet: 'يدوي متعدد الأقراص رطب', autoWet: 'أوتوماتيكي متعدد الأقراص رطب', manualSemi: 'يدوي أو نصف أوتوماتيكي', manual: 'يدوي', five: '5 سرعات بتعشيق ثابت', fiveRotaryReverse: '5 سرعات دائرية (رجوع للخلف اختياري)',
      four: '4 سرعات', fourConstant: '4 سرعات بتعشيق ثابت', reverse: 'رجوع مدمج أو علبة 1+1 اختيارية؛ يؤكد حسب التكوين المطلوب'
    },
    applications: {
      cg: ['دراجات العمل والدراجات العادية', 'تكوينات دراجات الشحن أو ATV عند طلبها لهذا الاستخدام', 'الاستبدال ومشاريع التجميع للموزعين'],
      cb: ['دراجات الطريق والطرق الوعرة حسب التكوين', 'مخزون استبدال للموزعين', 'مشاريع تجميع مؤهلة'],
      horizontal: ['الدراجات الصغيرة وpit bike وenduro الخفيف', 'ATV خفيف ومشاريع تجميع حسب التكوين', 'توريد بالجملة للموزعين'],
      parts: ['مخزون قطع غيار بالجملة', 'دعم التجميع والصيانة', 'خدمة ما بعد البيع لعائلات المحركات المطابقة']
    },
    checklist: {
      engine: ['طراز المحرك أو السعة الاسمية', 'الكمية وسوق الوجهة', 'تكوين التشغيل والقابض والناقل والرجوع', 'استخدام المركبة ومتطلبات التوصيل'],
      parts: ['رمز المحرك واسم القطعة', 'صورة واضحة أو عينة مرجعية عند توفرها', 'الكمية المطلوبة', 'سوق الوجهة']
    },
    marketNote: 'أسماء YX مراجع للسوق والبحث. تصنع CHIXIANG MOTOR محركات CX هذه؛ وليست YX علامة المنتج أو الشركة المصنعة.',
    familyCards: [
      ['تكوين CG بعمود موازنة', 'للدراجات النارية يمكن لعمود الموازنة المساعدة في تقليل اهتزاز الأسطوانة الواحدة وتحسين السلاسة. يعتمد نمط السرعات والرجوع على الطلب.'],
      ['عائلة Tsunami المبردة بالماء', 'عائلة CG معززة بزعانف تبريد وسعة زيت أكبر لتحسين تبديد الحرارة والثبات تحت الحمل. لا تنشر سعة الزيت الدقيقة.'],
      ['عائلة HW Water للخدمة الشاقة', 'تطوير ثقيل لـCG بزعانف و1.5 لتر زيت وأجزاء داخلية ثقيلة وقابض 20 بكرة ومولد عالي الخرج. دون رجوع مدمج.'],
      ['عائلة مبردة بالماء بقابض أوتوماتيكي', 'متاحة فقط لفئتي CG150 وCG175 بقابض طرد مركزي أوتوماتيكي، ومنفصلة عن تكوينات الرجوع المدمج.']
    ],
    partsCategories: [
      ['طقم الأسطوانة (Cylinder Set)', 'أسطوانات ومكابس وحلقات وجوانات حسب السعة الفعلية'],
      ['رأس الأسطوانة (Cylinder Head)', 'مجموعات رأس الأسطوانة ومقاعد الصمامات'],
      ['أقراص ومجموعة القابض (Clutch Plate)', 'أقراص احتكاك وفولاذية وقابض 20 بكرة للخدمة الشاقة (HW)'],
      ['ملف المغناطيس (Magneto Coil)', 'ملفات ثابتة (تشمل خيارات تيار مستمر عالية الخرج) ودوارات'],
      ['الصمامات (Valve)', 'صمامات السحب والعادم المطابقة لكل رأس أسطوانة'],
      ['مضخة الزيت (Oil Pump)', 'مضخات الزيت وتروس الدفع لنظام التزييت بالضغط'],
      ['عمود المرفق (Crankshaft)', 'أعمدة المرفق وأذرع التوصيل حسب الشوط وقطر المسمار'],
      ['عمود التشغيل (Starting Shaft)', 'أعمدة بادئ القدم والنوابض والتروس'],
      ['عمود تبديل السرعات (Variable Shaft)', 'طبلة التبديل والشوكات وأعمدة التبديل'],
      ['العمود الرئيسي (Main Shaft)', 'الأعمدة الرئيسية والثانوية ومجموعات تروس النقل'],
      ['محرك بادئ التشغيل (Starter Motor)', 'محركات التشغيل الكهربائي (تركيب علوي أو سفلي حسب الطراز)'],
      ['المحامل وشمعات الاحتراق والتروس', 'محامل الكرنك وشمعات الإشعال والتروس الأولية'],
      ['القطع الكهربائية والإشعال', 'وحدات CDI ومنظمات الجهد وملفات الإشعال والمرحلات']
    ],
    partsMatrixHeading: 'تغطية المنصات وقائمة التحقق قبل عرض السعر',
    partsMatrixColumns: ['عائلة المحرك', 'القطع الأساسية الموردة', 'الأبعاد المطلوب تأكيدها قبل التسعير'],
    partsMatrixRows: [
      ['المحركات الأفقية CX (110–150 سم³)', 'طقم أسطوانة ورأس وأقراص قابض وملف ثابت وأعمدة 4 سرعات وCDI', 'السعة الفعلية وقطر الأسطوانة ونوع القابض (أوتوماتيكي/نصف أوتوماتيكي/يدوي) وموضع البادئ'],
      ['CG المبردة بالهواء (125–250 سم³)', 'طقم أسطوانة ومكبس ورأس وصمامات وناقل 5 سرعات وعمود مرفق ومضخة زيت', 'رمز الطراز الدقيق (CG125–CG250) والقطر × الشوط وقطر مسمار المكبس وخيار عمود الموازنة'],
      ['CG المبردة بالماء وHW (150–350 سم³)', 'أسطوانة ورأس تبريد مائي وقابض 20 بكرة (HW) ومغناطيس 18 مرحلة وصمامات', 'سلسلة SB القياسية مقابل HW الشاقة وعمود الخرج وأطراف قابس المغناطيس وخيار الرجوع'],
      ['سلسلة CB (150–250 سم³)', 'رأس أسطوانة OHC بجنزير وجنزير التوقيت والشداد وناقل 5 سرعات وعمود مرفق', 'الطراز الدقيق (CB150 / CB200-C / CB250) والسعة (149 / 197 / 223 سم³) ونوع المقابس']
    ],
    partsMatrixNote: 'يمكن تجميع قطع الغيار في نفس الحاوية المختلطة مع المحركات الكاملة (الحد الأدنى للطلب 50 محركاً بطرازات مختلطة، مدة التجهيز ~10 أيام عمل، FOB قوانغتشو أو الموانئ الصينية الرئيسية، وضمان 60 يوماً بعد الوصول إلى ميناء الوجهة).',
    faq: {
      engine: [
        ['كيف يتم تأكيد التكوين الصحيح؟', 'أرسل الطراز والمركبة والكمية وسوق الوجهة. يتم تأكيد التشغيل والقابض والناقل والرجوع والتوصيلات قبل عرض السعر.'],
        ['هل يمكن تخصيص المحرك للسوق؟', 'يمكن مناقشة علامة OEM والتغليف والتكوينات المعتمدة للطلبات المؤهلة بالجملة.'],
        ['هل يمكن شحن قطع مطابقة مع المحركات؟', 'تتم مناقشة قطع الخدمة المطابقة بعد تأكيد طراز المحرك والتكوين المطلوب.']
      ],
      parts: [
        ['كيف يتم تحديد القطعة الصحيحة؟', 'أرسل رمز المحرك واسم القطعة وصورة واضحة أو عينة والكمية وسوق الوجهة.'],
        ['كيف يتم التحقق من توافق القطع؟', 'يتم الفحص حسب رمز المحرك والتكوين والعينة المقدمة.'],
        ['هل يمكن دمج القطع مع طلب المحركات؟', 'نعم، بعد تأكيد الطراز والكميات المطلوبة.']
      ]
    },
    paths: { products: '/ar/products', about: '/ar/about', contact: '/ar/contact', email: 'mailto:chixiangmotor@163.com' }
  }
};

module.exports = { routes, locales };
