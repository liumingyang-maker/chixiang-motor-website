(function(window) {
  'use strict';

  window.ChixiangCentralAsiaData = {
    market: {
      marketName: 'Центральная Азия',
      heroEyebrow: 'ПРЯМЫЕ ПОСТАВКИ С ЗАВОДА В ЦЕНТРАЛЬНУЮ АЗИЮ',
      defaultCountry: '',
      pageTitle: 'Двигатели CG 150–350 cc для Центральной Азии | Chixiang Motor',
      pageDescription: 'CG Air, CG Water и CG Heavy для мотоциклов и грузовых трициклов. Подбор комплектации, OEM/ODM, запасные части и экспортная упаковка.',
      whatsappMessageTemplate: 'Здравствуйте! Нужна оптовая цена для рынка {country}. Интересует серия {product}. Количество и применение: ',
      indexable: true,
      whatsappNumber: '8619008225410'
    },
    products: [
      {
        slug: 'cg-air',
        name: 'CG Air',
        displacement: '150–250 cc',
        cooling: 'Воздушное',
        reverse: 'По модели',
        bestFor: 'Мотоциклы и универсальные грузовые трициклы',
        summary: 'Простая конструкция и удобное обслуживание для повседневной работы.',
        heroImage: 'images/central-asia-hero-products/cg-air.png',
        advantages: [
          'Широкий выбор конфигураций',
          'Удобное обслуживание',
          'Подбор под мотоцикл или трицикл'
        ],
        gallery: [
          'images/cg银白色/1.webp',
          'images/cg银白色/2.webp',
          'images/cg银白色/3.webp',
          'images/cg银白色/4.webp',
          'images/cg银白色/5.webp'
        ]
      },
      {
        slug: 'cg-water',
        name: 'CG Water',
        displacement: '150–250 cc',
        cooling: 'Водяное',
        reverse: 'Опционально, встроенный',
        bestFor: 'Грузовые трициклы и длительная работа под нагрузкой',
        summary: 'Стабильный тепловой режим при длительной перевозке и регулярной нагрузке.',
        heroImage: 'images/central-asia-hero-products/cg-water.png',
        advantages: [
          'Водяная система охлаждения',
          'Встроенный реверс — опция',
          'Комплектация под рабочую нагрузку'
        ],
        gallery: [
          'images/普通水冷/6kjzxqqh.webp',
          'images/普通水冷/e8zlq6eb.webp',
          'images/普通水冷/pcdwa12q.webp',
          'images/普通水冷/po85qu0l.webp',
          'images/普通水冷/qog3j40j.webp'
        ]
      },
      {
        slug: 'cg-heavy',
        name: 'CG Heavy',
        displacement: '200–350 cc',
        cooling: 'Водяное',
        reverse: 'Без встроенного реверса',
        bestFor: 'Высокая нагрузка и тяжёлые грузовые трициклы',
        summary: 'Усиленная водяная серия CG для более тяжёлых режимов работы.',
        heroImage: 'images/central-asia-hero-products/cg-heavy.png',
        advantages: [
          'Без встроенного реверса'
        ],
        metrics: [
          { value: '20', label: 'роликов сцепления' },
          { value: '18', label: 'полюсов магнето' },
          { value: '1,5 л', label: 'объём масла' }
        ],
        gallery: [
          'images/捍威/product_main_image_1.webp',
          'images/捍威/product_main_image_2.webp',
          'images/捍威/product_main_image_3.webp',
          'images/捍威/product_main_image_4.webp',
          'images/捍威/product_main_image_5.webp'
        ]
      }
    ],
    applications: [
      {
        number: '01',
        title: 'Мотоциклы',
        description: 'Для повседневной эксплуатации и удобного обслуживания.',
        productSlug: 'cg-air'
      },
      {
        number: '02',
        title: 'Грузовые трициклы',
        description: 'Для регулярной перевозки и продолжительной работы.',
        productSlug: 'cg-water'
      },
      {
        number: '03',
        title: 'Высокая нагрузка',
        description: 'Для тяжёлых режимов и более высокой рабочей нагрузки.',
        productSlug: 'cg-heavy'
      }
    ],
    factoryImages: [
      {
        src: 'images/factory-showcase/factory-2.webp',
        alt: 'Сборочная линия двигателей Chixiang Motor',
        label: 'Сборка'
      },
      {
        src: 'images/factory-showcase/factory-3.webp',
        alt: 'Производственная линия двигателей Chixiang Motor',
        label: 'Производство'
      },
      {
        src: 'images/factory-showcase/factory-1.webp',
        alt: 'Погрузка экспортной партии у завода Chixiang Motor',
        label: 'Отгрузка'
      }
    ]
  };
})(window);
