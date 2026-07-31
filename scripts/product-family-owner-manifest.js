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
      actual: 'Actual displacement', boreStroke: 'Bore × stroke', cooling: 'Cooling', start: 'Starting method',
      starterPosition: 'Electric-starter position', clutch: 'Clutch', gears: 'Transmission', options: 'Supplemental options',
      marketReference: 'Market/search reference', applications: 'Applications', checklist: 'Information needed for quotation',
      familyOptions: 'Approved family configurations', parts: 'Parts categories', category: 'Category', examples: 'Examples',
      related: 'Related product and company pages', faq: 'FAQ', contact: 'Send an inquiry', products: 'All products',
      about: 'About the factory', email: 'Email sales'
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
      manualWet: 'Manual wet multi-plate', manualSemi: 'Manual or semi-automatic', manual: 'Manual clutch', five: '5-speed constant mesh',
      four: '4 gears', reverse: 'Built-in reverse or 1+1 gearbox is optional; confirm for the ordered configuration'
    },
    applications: {
      cg: ['Work and street motorcycles', 'Cargo-tricycle or ATV configurations when ordered for that application', 'Distributor replacement and assembly projects'],
      cb: ['Street and off-road motorcycles subject to configuration', 'Distributor replacement stock', 'Qualified motorcycle assembly projects'],
      horizontal: ['Mopeds, pit bikes and light enduro applications', 'Light ATV and assembly projects subject to configuration', 'Distributor wholesale supply'],
      parts: ['Distributor spare-parts stock', 'Engine assembly and maintenance support', 'After-sales service for matching engine families']
    },
    checklist: {
      engine: ['Target engine model or nominal displacement', 'Quantity and destination market', 'Starting, clutch, transmission and reverse configuration', 'Vehicle application and any interface requirements'],
      parts: ['Engine code and part name', 'Clear part photo or reference sample when available', 'Required quantity', 'Destination market']
    },
    marketNote: 'YX names are Russian-market search and selection references. These CX engines are manufactured by CHIXIANG MOTOR; YX is not the product brand or manufacturer.',
    familyCards: [
      ['CG balance-shaft configuration', 'For motorcycle applications, a balance shaft can help reduce single-cylinder vibration and improve running smoothness. Shift and reverse configuration depends on the order.'],
      ['Tsunami water-cooled family', 'A strengthened CG water-cooled family with cooling fins and enlarged oil capacity for improved heat dissipation and sustained-load stability. Exact oil volume remains unpublished.'],
      ['HW Water heavy-duty family', 'A heavy-duty CG water-cooled upgrade with cooling fins, 1.5 L oil capacity, heavy-duty internal parts, a 20-roller clutch and a high-output magneto. No built-in reverse.'],
      ['Automatic-clutch water-cooled family', 'Available only in CG150 and CG175 classes, with automatic centrifugal clutch. It is a separate family from built-in-reverse configurations.']
    ],
    partsCategories: [
      ['Cylinder and piston kits', 'Cylinders, pistons, rings and gasket sets'], ['Cylinder heads and valve train', 'Head assemblies, intake and exhaust valves'],
      ['Clutch components', 'Clutch housings, friction plates, steel plates and assemblies'], ['Magneto and electrical parts', 'Stators, coils, CDI units, ignition coils and starter motors'],
      ['Oil and starting systems', 'Oil pumps, starter shafts and related service parts'], ['Transmission and reverse parts', 'Main shafts, shift shafts, gears and reverse components'],
      ['Crankshaft components', 'Crankshafts, connecting rods and related assemblies'], ['Routine service parts', 'Spark plugs, bearings, filters and related engine service items']
    ],
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
      actual: 'Cilindrada real', boreStroke: 'Diámetro × carrera', cooling: 'Refrigeración', start: 'Arranque',
      starterPosition: 'Posición del arranque eléctrico', clutch: 'Embrague', gears: 'Transmisión', options: 'Opciones adicionales',
      marketReference: 'Referencia de mercado/búsqueda', applications: 'Aplicaciones', checklist: 'Información necesaria para cotizar',
      familyOptions: 'Configuraciones de familia aprobadas', parts: 'Categorías de repuestos', category: 'Categoría', examples: 'Ejemplos',
      related: 'Páginas relacionadas de productos y empresa', faq: 'Preguntas frecuentes', contact: 'Enviar una consulta', products: 'Todos los productos',
      about: 'Acerca de la fábrica', email: 'Enviar correo a ventas'
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
      manualWet: 'Manual multidisco húmedo', manualSemi: 'Manual o semiautomático', manual: 'Manual', five: '5 velocidades de engrane constante',
      four: '4 velocidades', reverse: 'Reversa integrada o caja 1+1 opcional; confirmar según la configuración pedida'
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
      ['Kits de cilindro y pistón', 'Cilindros, pistones, aros y juntas'], ['Culatas y tren de válvulas', 'Culatas, válvulas de admisión y escape'],
      ['Componentes de embrague', 'Campanas, discos de fricción, discos de acero y conjuntos'], ['Magneto y piezas eléctricas', 'Estatores, bobinas, CDI, bobinas de encendido y motores de arranque'],
      ['Sistemas de aceite y arranque', 'Bombas de aceite, ejes de arranque y piezas de servicio'], ['Transmisión y reversa', 'Ejes principales, ejes de cambio, engranajes y componentes de reversa'],
      ['Componentes del cigüeñal', 'Cigüeñales, bielas y conjuntos relacionados'], ['Piezas de mantenimiento', 'Bujías, rodamientos, filtros y piezas de servicio']
    ],
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
      actual: 'Cilindrada real', boreStroke: 'Diâmetro × curso', cooling: 'Refrigeração', start: 'Partida',
      starterPosition: 'Posição da partida elétrica', clutch: 'Embreagem', gears: 'Transmissão', options: 'Opções adicionais',
      marketReference: 'Referência de mercado/pesquisa', applications: 'Aplicações', checklist: 'Informações necessárias para cotação',
      familyOptions: 'Configurações de família aprovadas', parts: 'Categorias de peças', category: 'Categoria', examples: 'Exemplos',
      related: 'Páginas relacionadas de produtos e empresa', faq: 'Perguntas frequentes', contact: 'Enviar consulta', products: 'Todos os produtos',
      about: 'Sobre a fábrica', email: 'Enviar e-mail para vendas'
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
      manualWet: 'Manual multidisco úmida', manualSemi: 'Manual ou semiautomática', manual: 'Manual', five: '5 marchas de engrenamento constante',
      four: '4 marchas', reverse: 'Ré integrada ou caixa 1+1 opcional; confirmar na configuração pedida'
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
      ['Kits de cilindro e pistão', 'Cilindros, pistões, anéis e juntas'], ['Cabeçotes e válvulas', 'Cabeçotes e válvulas de admissão e escape'],
      ['Componentes de embreagem', 'Campanas, discos de fricção, discos de aço e conjuntos'], ['Magneto e elétrica', 'Estatores, bobinas, CDI, bobinas de ignição e motores de partida'],
      ['Óleo e partida', 'Bombas de óleo, eixos de partida e peças de serviço'], ['Transmissão e ré', 'Eixos principais, eixos de câmbio, engrenagens e componentes de ré'],
      ['Componentes do virabrequim', 'Virabrequins, bielas e conjuntos'], ['Peças de manutenção', 'Velas, rolamentos, filtros e itens de serviço']
    ],
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
      actual: 'Фактический объём', boreStroke: 'Диаметр × ход', cooling: 'Охлаждение', start: 'Запуск',
      starterPosition: 'Положение электростартера', clutch: 'Сцепление', gears: 'Коробка передач', options: 'Дополнительные варианты',
      marketReference: 'Рыночное/поисковое обозначение', applications: 'Применение', checklist: 'Данные для расчёта предложения',
      familyOptions: 'Подтверждённые конфигурации семейства', parts: 'Категории запчастей', category: 'Категория', examples: 'Примеры',
      related: 'Связанные страницы продукции и компании', faq: 'Частые вопросы', contact: 'Отправить запрос', products: 'Вся продукция',
      about: 'О заводе', email: 'Написать в отдел продаж'
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
      manualWet: 'Ручное многодисковое в масляной ванне', manualSemi: 'Ручное или полуавтоматическое', manual: 'Ручное', five: '5-ступенчатая постоянного зацепления',
      four: '4 передачи', reverse: 'Опционально встроенный реверс или коробка 1+1; подтвердить для заказа'
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
      ['Цилиндро-поршневые комплекты', 'Цилиндры, поршни, кольца и прокладки'], ['Головки и клапанный механизм', 'Головки, впускные и выпускные клапаны'],
      ['Детали сцепления', 'Корзины, фрикционные и стальные диски, узлы'], ['Магнето и электрика', 'Статоры, катушки, CDI, катушки зажигания и стартеры'],
      ['Масляная система и запуск', 'Масляные насосы, валы стартера и сервисные детали'], ['Трансмиссия и реверс', 'Главные и переключающие валы, шестерни и детали реверса'],
      ['Кривошипно-шатунные детали', 'Коленвалы, шатуны и связанные узлы'], ['Расходные сервисные детали', 'Свечи, подшипники, фильтры и сервисные позиции']
    ],
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
      actual: 'السعة الفعلية', boreStroke: 'القطر × الشوط', cooling: 'التبريد', start: 'طريقة التشغيل',
      starterPosition: 'موضع بادئ التشغيل الكهربائي', clutch: 'القابض', gears: 'ناقل الحركة', options: 'خيارات إضافية',
      marketReference: 'مرجع السوق/البحث', applications: 'الاستخدامات', checklist: 'المعلومات المطلوبة لعرض السعر',
      familyOptions: 'تكوينات عائلة معتمدة', parts: 'فئات قطع الغيار', category: 'الفئة', examples: 'أمثلة',
      related: 'صفحات المنتجات والشركة ذات الصلة', faq: 'الأسئلة الشائعة', contact: 'إرسال استفسار', products: 'جميع المنتجات',
      about: 'عن المصنع', email: 'مراسلة المبيعات'
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
      manualWet: 'يدوي متعدد الأقراص رطب', manualSemi: 'يدوي أو نصف أوتوماتيكي', manual: 'يدوي', five: '5 سرعات بتعشيق ثابت',
      four: '4 سرعات', reverse: 'رجوع مدمج أو علبة 1+1 اختيارية؛ يؤكد حسب التكوين المطلوب'
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
      ['أطقم الأسطوانة والمكبس', 'أسطوانات ومكابس وحلقات وجوانات'], ['رؤوس الأسطوانات والصمامات', 'رؤوس وصمامات سحب وعادم'],
      ['مكونات القابض', 'أجراس وأقراص احتكاك وأقراص فولاذية ومجموعات'], ['المولد والأجزاء الكهربائية', 'ملفات ثابتة وملفات وCDI وملفات إشعال ومحركات بادئ'],
      ['نظام الزيت والتشغيل', 'مضخات زيت وأعمدة تشغيل وقطع صيانة'], ['ناقل الحركة والرجوع', 'أعمدة رئيسية وأعمدة تبديل وتروس ومكونات رجوع'],
      ['مكونات عمود المرفق', 'أعمدة مرفق وأذرع توصيل ومجموعات'], ['قطع الصيانة الدورية', 'شمعات ومحامل وفلاتر وقطع خدمة']
    ],
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
