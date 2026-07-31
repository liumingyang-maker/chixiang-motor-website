const products = [
  {
    value: 'horizontal',
    owner: {
      en: '/en/horizontal-engine',
      es: '/es/motor-horizontal',
      pt: '/pt/motor-horizontal',
      ru: '/ru/gorizontalnyj-dvigatel',
      ar: '/ar/horizontal-engine'
    }
  },
  {
    value: 'cg',
    owner: {
      en: '/en/cg-engine',
      es: '/es/motor-cg',
      pt: '/pt/motor-cg',
      ru: '/ru/dvigatel-cg',
      ar: '/ar/cg-engine'
    }
  },
  {
    value: 'cb',
    owner: {
      en: '/en/cb-engine',
      es: '/es/motor-cb',
      pt: '/pt/motor-cb',
      ru: '/ru/dvigatel-cb',
      ar: '/ar/cb-engine'
    }
  },
  {
    value: 'parts',
    owner: {
      en: '/en/engine-parts',
      es: '/es/repuestos-motor',
      pt: '/pt/pecas-de-motor',
      ru: '/ru/zapchasti-dvigatelya',
      ar: '/ar/engine-parts'
    }
  },
  { value: 'multiple', owner: null }
];

const routes = [
  { file: 'en/contact.html', language: 'en', path: '/en/contact', sourceForm: 'contact_owner_en', dir: 'ltr' },
  { file: 'es/contacto.html', language: 'es', path: '/es/contacto', sourceForm: 'contact_owner_es', dir: 'ltr' },
  { file: 'pt/contato.html', language: 'pt', path: '/pt/contato', sourceForm: 'contact_owner_pt', dir: 'ltr' },
  { file: 'ru/kontakty.html', language: 'ru', path: '/ru/kontakty', sourceForm: 'contact_owner_ru', dir: 'ltr' },
  { file: 'ar/contact.html', language: 'ar', path: '/ar/contact', sourceForm: 'contact_owner_ar', dir: 'rtl' }
];

const locales = {
  en: {
    title: 'B2B Motorcycle Engine Inquiry | Contact CHIXIANG MOTOR',
    description: 'Send a B2B inquiry for horizontal, CG or CB motorcycle engines and engine parts. Include company, market, application and expected quantity.',
    h1: 'Send a B2B Engine Inquiry',
    home: 'Home',
    breadcrumbLabel: 'Breadcrumb',
    pageLead: 'Tell us your company, target market, engine family, application and expected quantity.',
    procurementHeading: 'Information for a useful quotation',
    procurementIntro: 'CHIXIANG MOTOR currently supplies motorcycle engines, cargo-tricycle engines, ATV/off-road engines and matching engine parts for qualified B2B projects.',
    checklistHeading: 'Please prepare',
    checklist: [
      'Company name and destination country or market',
      'Engine family, model reference or part information',
      'Vehicle application and expected quantity',
      'Required starting, clutch, transmission, cooling or reverse configuration'
    ],
    productLinksLabel: 'Product family pages',
    channelHeading: 'Supplemental contact channels',
    formHeading: 'Procurement inquiry form',
    formLead: 'The form is the primary inquiry route. We will review the details before discussing configuration and quotation.',
    fields: {
      name: 'Your name', company: 'Company', contact: 'Primary contact', email: 'Email (optional)',
      country: 'Destination country or market', product: 'Product interest', quantity: 'Expected quantity',
      application: 'Application', requirements: 'Models, configuration and other requirements'
    },
    placeholders: {
      name: 'Full name', company: 'Company name', contact: 'Email, phone, WeChat or another reachable contact',
      email: 'name@company.com', country: 'Country or target market', quantity: 'Expected quantity',
      requirements: 'Models, displacement, starting method, clutch, transmission, cooling, reverse, parts or packaging needs'
    },
    products: {
      horizontal: 'Horizontal engine family', cg: 'CG engine family', cb: 'CB engine family',
      parts: 'Engine parts', multiple: 'Multiple families / request a recommendation'
    },
    applications: {
      motorcycle: 'Motorcycle', cargoTricycle: 'Cargo tricycle', atvOffroad: 'ATV / off-road vehicle',
      replacement: 'Replacement market', assembly: 'Assembly project', other: 'Other B2B application'
    },
    selectProduct: 'Select a product family',
    selectApplication: 'Select an application',
    channels: { email: 'Email', wechat: 'WeChat', whatsapp: 'WhatsApp', phone: 'Phone' },
    channelOrder: ['email', 'wechat', 'whatsapp', 'phone'],
    wechatQrAlt: 'CHIXIANG MOTOR WeChat QR code',
    actions: { submit: 'Send procurement inquiry', form: 'Inquiry form', email: 'Email' },
    messages: {
      sending: 'Sending your inquiry...',
      success: 'Your inquiry was sent successfully. Our team will review it and reply.',
      validation: 'Please complete all required fields.',
      turnstile: 'Please complete the security verification.',
      spam: 'Submission could not be accepted.',
      fallback: 'We could not send the form. Your information has been kept. Please retry or email chixiangmotor@163.com.'
    }
  },
  es: {
    title: 'Consulta B2B de motores de motocicleta | CHIXIANG MOTOR',
    description: 'Envíe una consulta B2B sobre motores horizontales, CG, CB y repuestos. Incluya empresa, mercado, aplicación y cantidad estimada.',
    h1: 'Envíe una consulta B2B de motores',
    home: 'Inicio',
    breadcrumbLabel: 'Ruta de navegación',
    pageLead: 'Indique su empresa, mercado de destino, familia de motor, aplicación y cantidad estimada.',
    procurementHeading: 'Información para preparar una cotización útil',
    procurementIntro: 'CHIXIANG MOTOR suministra actualmente motores para motocicletas, motores para trimotos de carga, motores para ATV/todoterreno y repuestos compatibles para proyectos B2B calificados.',
    checklistHeading: 'Prepare estos datos',
    checklist: [
      'Nombre de la empresa y país o mercado de destino',
      'Familia de motor, referencia del modelo o datos del repuesto',
      'Aplicación del vehículo y cantidad estimada',
      'Configuración requerida de arranque, embrague, transmisión, refrigeración o reversa'
    ],
    productLinksLabel: 'Páginas de familias de productos',
    channelHeading: 'Canales de contacto complementarios',
    formHeading: 'Formulario de consulta de compras',
    formLead: 'El formulario es el canal principal. Revisaremos los datos antes de tratar la configuración y la cotización.',
    fields: {
      name: 'Nombre', company: 'Empresa', contact: 'Contacto principal', email: 'Email (opcional)',
      country: 'País o mercado de destino', product: 'Producto de interés', quantity: 'Cantidad estimada',
      application: 'Aplicación', requirements: 'Modelos, configuración y otros requisitos'
    },
    placeholders: {
      name: 'Nombre completo', company: 'Nombre de la empresa', contact: 'Email, teléfono, WeChat u otro contacto disponible',
      email: 'nombre@empresa.com', country: 'País o mercado objetivo', quantity: 'Cantidad estimada',
      requirements: 'Modelos, cilindrada, arranque, embrague, transmisión, refrigeración, reversa, repuestos o embalaje'
    },
    products: {
      horizontal: 'Familia de motores horizontales', cg: 'Familia de motores CG', cb: 'Familia de motores CB',
      parts: 'Repuestos de motor', multiple: 'Varias familias / solicitar recomendación'
    },
    applications: {
      motorcycle: 'Motocicleta', cargoTricycle: 'Trimoto de carga', atvOffroad: 'ATV / vehículo todoterreno',
      replacement: 'Mercado de reposición', assembly: 'Proyecto de ensamblaje', other: 'Otra aplicación B2B'
    },
    selectProduct: 'Seleccione una familia de productos',
    selectApplication: 'Seleccione una aplicación',
    channels: { email: 'Email', wechat: 'WeChat', whatsapp: 'WhatsApp', phone: 'Teléfono' },
    channelOrder: ['email', 'whatsapp', 'wechat', 'phone'],
    wechatQrAlt: 'Código QR de WeChat de CHIXIANG MOTOR',
    actions: { submit: 'Enviar consulta de compras', form: 'Formulario', email: 'Email' },
    messages: {
      sending: 'Enviando su consulta...',
      success: 'Su consulta se envió correctamente. Nuestro equipo la revisará y responderá.',
      validation: 'Complete todos los campos obligatorios.',
      turnstile: 'Complete la verificación de seguridad.',
      spam: 'No se pudo aceptar el envío.',
      fallback: 'No pudimos enviar el formulario. Sus datos se han conservado. Inténtelo de nuevo o escriba a chixiangmotor@163.com.'
    }
  },
  pt: {
    title: 'Consulta B2B de motores de motocicleta | CHIXIANG MOTOR',
    description: 'Envie uma consulta B2B sobre motores horizontais, CG, CB e peças. Inclua empresa, mercado, aplicação e quantidade estimada.',
    h1: 'Envie uma consulta B2B de motores',
    home: 'Início',
    breadcrumbLabel: 'Navegação estrutural',
    pageLead: 'Informe sua empresa, mercado de destino, família do motor, aplicação e quantidade estimada.',
    procurementHeading: 'Informações para uma cotação útil',
    procurementIntro: 'A CHIXIANG MOTOR fornece atualmente motores para motocicletas, motores para triciclos de carga, motores para ATV/off-road e peças compatíveis para projetos B2B qualificados.',
    checklistHeading: 'Prepare estes dados',
    checklist: [
      'Nome da empresa e país ou mercado de destino',
      'Família do motor, referência do modelo ou dados da peça',
      'Aplicação do veículo e quantidade estimada',
      'Configuração necessária de partida, embreagem, transmissão, refrigeração ou ré'
    ],
    productLinksLabel: 'Páginas das famílias de produtos',
    channelHeading: 'Canais de contato complementares',
    formHeading: 'Formulário de consulta de compras',
    formLead: 'O formulário é o canal principal. Analisaremos os dados antes de discutir configuração e cotação.',
    fields: {
      name: 'Nome', company: 'Empresa', contact: 'Contato principal', email: 'Email (opcional)',
      country: 'País ou mercado de destino', product: 'Produto de interesse', quantity: 'Quantidade estimada',
      application: 'Aplicação', requirements: 'Modelos, configuração e outros requisitos'
    },
    placeholders: {
      name: 'Nome completo', company: 'Nome da empresa', contact: 'Email, telefone, WeChat ou outro contato disponível',
      email: 'nome@empresa.com', country: 'País ou mercado-alvo', quantity: 'Quantidade estimada',
      requirements: 'Modelos, cilindrada, partida, embreagem, transmissão, refrigeração, ré, peças ou embalagem'
    },
    products: {
      horizontal: 'Família de motores horizontais', cg: 'Família de motores CG', cb: 'Família de motores CB',
      parts: 'Peças de motor', multiple: 'Várias famílias / solicitar recomendação'
    },
    applications: {
      motorcycle: 'Motocicleta', cargoTricycle: 'Triciclo de carga', atvOffroad: 'ATV / veículo off-road',
      replacement: 'Mercado de reposição', assembly: 'Projeto de montagem', other: 'Outra aplicação B2B'
    },
    selectProduct: 'Selecione uma família de produtos',
    selectApplication: 'Selecione uma aplicação',
    channels: { email: 'Email', wechat: 'WeChat', whatsapp: 'WhatsApp', phone: 'Telefone' },
    channelOrder: ['email', 'whatsapp', 'wechat', 'phone'],
    wechatQrAlt: 'Código QR do WeChat da CHIXIANG MOTOR',
    actions: { submit: 'Enviar consulta de compras', form: 'Formulário', email: 'Email' },
    messages: {
      sending: 'Enviando sua consulta...',
      success: 'Sua consulta foi enviada. Nossa equipe analisará os dados e responderá.',
      validation: 'Preencha todos os campos obrigatórios.',
      turnstile: 'Conclua a verificação de segurança.',
      spam: 'Não foi possível aceitar o envio.',
      fallback: 'Não foi possível enviar o formulário. Seus dados foram mantidos. Tente novamente ou envie um email para chixiangmotor@163.com.'
    }
  },
  ru: {
    title: 'B2B-запрос на мотоциклетные двигатели | CHIXIANG MOTOR',
    description: 'Отправьте B2B-запрос на горизонтальные двигатели, серии CG и CB или запчасти. Укажите компанию, рынок, применение и количество.',
    h1: 'Отправить B2B-запрос на двигатели',
    home: 'Главная',
    breadcrumbLabel: 'Навигационная цепочка',
    pageLead: 'Укажите компанию, целевой рынок, семейство двигателя, применение и планируемое количество.',
    procurementHeading: 'Данные для содержательного предложения',
    procurementIntro: 'CHIXIANG MOTOR поставляет мотоциклетные двигатели, двигатели для грузовых трициклов, двигатели для ATV/внедорожной техники и совместимые запчасти для квалифицированных B2B-проектов.',
    checklistHeading: 'Подготовьте информацию',
    checklist: [
      'Название компании и страна или целевой рынок',
      'Семейство двигателя, обозначение модели или данные запчасти',
      'Применение техники и планируемое количество',
      'Нужная конфигурация запуска, сцепления, коробки передач, охлаждения или реверса'
    ],
    productLinksLabel: 'Страницы семейств продукции',
    channelHeading: 'Дополнительные способы связи',
    formHeading: 'Форма запроса для закупки',
    formLead: 'Форма — основной канал запроса. Мы изучим данные до обсуждения конфигурации и предложения.',
    fields: {
      name: 'Имя', company: 'Компания', contact: 'Основной контакт', email: 'Email (необязательно)',
      country: 'Страна или целевой рынок', product: 'Интересующая продукция', quantity: 'Планируемое количество',
      application: 'Применение', requirements: 'Модели, конфигурация и другие требования'
    },
    placeholders: {
      name: 'Имя и фамилия', company: 'Название компании', contact: 'Email, телефон, WeChat или другой доступный контакт',
      email: 'name@company.com', country: 'Страна или рынок', quantity: 'Планируемое количество',
      requirements: 'Модели, объём, запуск, сцепление, передачи, охлаждение, реверс, запчасти или упаковка'
    },
    products: {
      horizontal: 'Семейство горизонтальных двигателей', cg: 'Семейство двигателей CG', cb: 'Семейство двигателей CB',
      parts: 'Запчасти для двигателей', multiple: 'Несколько семейств / нужна рекомендация'
    },
    applications: {
      motorcycle: 'Мотоцикл', cargoTricycle: 'Грузовой трицикл', atvOffroad: 'ATV / внедорожная техника',
      replacement: 'Рынок запчастей и замены', assembly: 'Сборочный проект', other: 'Другое B2B-применение'
    },
    selectProduct: 'Выберите семейство продукции',
    selectApplication: 'Выберите применение',
    channels: { email: 'Email', wechat: 'WeChat', whatsapp: 'WhatsApp', phone: 'Телефон' },
    channelOrder: ['email', 'wechat', 'whatsapp', 'phone'],
    wechatQrAlt: 'QR-код WeChat CHIXIANG MOTOR',
    actions: { submit: 'Отправить запрос на закупку', form: 'Форма запроса', email: 'Email' },
    messages: {
      sending: 'Запрос отправляется...',
      success: 'Запрос успешно отправлен. Наша команда изучит данные и ответит.',
      validation: 'Заполните все обязательные поля.',
      turnstile: 'Пройдите проверку безопасности.',
      spam: 'Не удалось принять отправку.',
      fallback: 'Форму не удалось отправить. Введённые данные сохранены. Повторите попытку или напишите на chixiangmotor@163.com.'
    }
  },
  ar: {
    title: 'استفسار B2B عن محركات الدراجات النارية | CHIXIANG MOTOR',
    description: 'أرسل استفسار B2B عن المحركات الأفقية أو فئات CG وCB وقطع المحركات، مع الشركة والسوق والاستخدام والكمية المتوقعة.',
    h1: 'أرسل استفسار شراء B2B عن المحركات',
    home: 'الرئيسية',
    breadcrumbLabel: 'مسار التنقل',
    pageLead: 'اذكر شركتك والسوق المستهدف وفئة المحرك والاستخدام والكمية المتوقعة.',
    procurementHeading: 'معلومات تساعدنا على إعداد عرض مفيد',
    procurementIntro: 'تورّد CHIXIANG MOTOR حاليًا محركات للدراجات النارية ومحركات لدراجات الشحن ثلاثية العجلات ومحركات ATV والطرق الوعرة وقطع محركات متوافقة لمشروعات B2B المؤهلة.',
    checklistHeading: 'يرجى تجهيز',
    checklist: [
      'اسم الشركة وبلد أو سوق الوجهة',
      'فئة المحرك أو مرجع الطراز أو بيانات القطعة',
      'استخدام المركبة والكمية المتوقعة',
      'متطلبات التشغيل والقابض وناقل الحركة والتبريد أو الرجوع للخلف'
    ],
    productLinksLabel: 'صفحات فئات المنتجات',
    channelHeading: 'قنوات اتصال إضافية',
    formHeading: 'نموذج استفسار المشتريات',
    formLead: 'النموذج هو قناة الاستفسار الأساسية. سنراجع التفاصيل قبل مناقشة التكوين وعرض السعر.',
    fields: {
      name: 'الاسم', company: 'الشركة', contact: 'وسيلة الاتصال الأساسية', email: 'البريد الإلكتروني (اختياري)',
      country: 'بلد أو سوق الوجهة', product: 'المنتج المطلوب', quantity: 'الكمية المتوقعة',
      application: 'الاستخدام', requirements: 'الطرازات والتكوين والمتطلبات الأخرى'
    },
    placeholders: {
      name: 'الاسم الكامل', company: 'اسم الشركة', contact: 'البريد أو الهاتف أو WeChat أو وسيلة اتصال متاحة',
      email: 'name@company.com', country: 'البلد أو السوق المستهدف', quantity: 'الكمية المتوقعة',
      requirements: 'الطرازات والسعة والتشغيل والقابض وناقل الحركة والتبريد والرجوع للخلف والقطع أو التغليف'
    },
    products: {
      horizontal: 'فئة المحركات الأفقية', cg: 'فئة محركات CG', cb: 'فئة محركات CB',
      parts: 'قطع المحركات', multiple: 'عدة فئات / طلب توصية'
    },
    applications: {
      motorcycle: 'دراجة نارية', cargoTricycle: 'دراجة شحن ثلاثية العجلات', atvOffroad: 'ATV / مركبة للطرق الوعرة',
      replacement: 'سوق الاستبدال', assembly: 'مشروع تجميع', other: 'استخدام B2B آخر'
    },
    selectProduct: 'اختر فئة المنتج',
    selectApplication: 'اختر الاستخدام',
    channels: { email: 'البريد الإلكتروني', wechat: 'WeChat', whatsapp: 'WhatsApp', phone: 'الهاتف' },
    channelOrder: ['email', 'whatsapp', 'wechat', 'phone'],
    wechatQrAlt: 'رمز WeChat الخاص بـ CHIXIANG MOTOR',
    actions: { submit: 'إرسال استفسار المشتريات', form: 'نموذج الاستفسار', email: 'البريد' },
    messages: {
      sending: 'جارٍ إرسال الاستفسار...',
      success: 'تم إرسال الاستفسار بنجاح. سيراجع فريقنا البيانات ويرد عليك.',
      validation: 'يرجى إكمال جميع الحقول المطلوبة.',
      turnstile: 'يرجى إكمال التحقق الأمني.',
      spam: 'تعذر قبول الإرسال.',
      fallback: 'تعذر إرسال النموذج. تم الاحتفاظ بالبيانات. حاول مرة أخرى أو راسل chixiangmotor@163.com.'
    }
  }
};

module.exports = { routes, products, locales };
