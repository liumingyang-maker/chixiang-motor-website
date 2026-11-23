(function(window) {
  'use strict';

  window.ChixiangCentralAsiaData = {
    market: {
      marketName: 'Центральная Азия',
      heroEyebrow: 'ПРЯМЫЕ ПОСТАВКИ С ЗАВОДА В ЦЕНТРАЛЬНУЮ АЗИЮ',
      defaultCountry: '',
      pageTitle: 'Двигатели CG 150–350 cc для Центральной Азии | Chixiang Motor',
      pageDescription: 'CG Air, CG Water и HW Water для мотоциклов и грузовых трициклов. Подбор комплектации, OEM/ODM, запасные части и экспортная упаковка.',
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
        heroImage: 'images/central-asia-hero-products/cg-air.webp',
        advantages: [
          'Широкий выбор конфигураций',
          'Удобное обслуживание',
          'Подбор под мотоцикл или трицикл'
        ],
        gallery: [
          'images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp',
          'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp',
          'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-right-clutch-kickstart-side.webp',
          'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-cylinder-head-fins-detail.webp',
          'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp'
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
        heroImage: 'images/central-asia-hero-products/cg-water.webp',
        advantages: [
          'Водяная система охлаждения',
          'Встроенный реверс — опция',
          'Комплектация под рабочую нагрузку'
        ],
        gallery: [
          'images/cg-water-cooled/chixiang-cg250sb-water-cooled-cargo-tricycle-engine-front-view.webp',
          'images/cg-water-cooled/chixiang-cg250sb-right-clutch-water-pump-side.webp',
          'images/cg-water-cooled/chixiang-cg250sb-left-magneto-output-shaft-side.webp',
          'images/cg-water-cooled/chixiang-cg250sb-water-cooled-cylinder-jacket-ports.webp',
          'images/cg-water-cooled/chixiang-cg250sb-starter-rear-mounting-lugs.webp'
        ]
      },
      {
        slug: 'cg-heavy',
        name: 'HW Water',
        displacement: '200–350 cc',
        cooling: 'Водяное',
        reverse: 'Без встроенного реверса',
        bestFor: 'Высокая нагрузка и тяжёлые грузовые трициклы',
        summary: 'Усиленная водяная серия HW Water с рёбрами охлаждения и компонентами для длительной работы под нагрузкой.',
        heroImage: 'images/central-asia-hero-products/cg-heavy.webp',
        advantages: [
          'Без встроенного реверса',
          '20-роликовая муфта и магнето повышенной мощности',
          'Точные характеристики модели подтверждаются до расчёта'
        ],
        metrics: [
          { value: '20', label: 'роликов сцепления' },
          { value: 'Высокая', label: 'мощность магнето' },
          { value: '1,5 л', label: 'объём масла' }
        ],
        gallery: [
          'images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp',
          'images/hw-water-cooled/chixiang-hw300-finned-water-cooled-cylinder-sump-detail.webp',
          'images/hw-water-cooled/chixiang-hw300-crankcase-20-roller-clutch-side.webp',
          'images/hw-water-cooled/chixiang-hw300-water-pump-coolant-ports-detail.webp',
          'images/hw-water-cooled/chixiang-hw300-output-shaft-external-reverse-interface.webp'
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
        src: 'images/factory-showcase/chixiang-chongqing-engine-assembly-facility.webp',
        alt: 'Сборочная линия двигателей Chixiang Motor',
        label: 'Сборка'
      },
      {
        src: 'images/factory-showcase/chixiang-engine-machining-production-equipment.webp',
        alt: 'Производственная линия двигателей Chixiang Motor',
        label: 'Производство'
      },
      {
        src: 'images/factory-showcase/chixiang-chongqing-engine-production-workshop.webp',
        alt: 'Погрузка экспортной партии у завода Chixiang Motor',
        label: 'Отгрузка'
      }
    ]
  };
})(window);
