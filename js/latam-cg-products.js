(function(window) {
  'use strict';

  var products = {
    'cg-air-range': {
      slug: 'cg-air-range', name: 'Motores CG refrigerados por aire de 150–250 cc', heroLabel: 'CG Air-Cooled 150–250 cc', displacement: 'CG150 / CG200 / CG250', cooling: 'Refrigeración por aire', reverse: 'Según la transmisión y la configuración del vehículo',
      bestFor: 'Motocicletas de calle, motos de trabajo y proyectos de ensamblaje', image: 'images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-cylinder-head-fins-detail.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp'],
      benefits: ['CG150, CG200 y CG250 disponibles para selección', 'Modelos combinables dentro de un mismo pedido', 'Confirmación por código, montaje, salida y sistema eléctrico']
    },
    'standard-water': {
      slug: 'standard-water', name: 'Motores refrigerados por agua para trabajo y carga', heroLabel: 'Standard Water-Cooled', displacement: 'CG150SB / CG175SB / CG200SB / CG250SB', cooling: 'Refrigeración por agua', reverse: 'Configuración opcional según el pedido; no es estándar en toda la serie',
      bestFor: 'Motocicletas de trabajo, trimotos de carga y operación comercial', image: 'images/cg-water-cooled/chixiang-cg250sb-water-cooled-cargo-tricycle-engine-front-view.webp',
      gallery: ['images/cg-water-cooled/chixiang-cg250sb-water-cooled-cargo-tricycle-engine-front-view.webp', 'images/cg-water-cooled/chixiang-cg250sb-right-clutch-water-pump-side.webp', 'images/cg-water-cooled/chixiang-cg250sb-left-magneto-output-shaft-side.webp'],
      benefits: ['Modelos de 150, 175, 200 y 250 cc disponibles en la gama local', 'Sistema de refrigeración para trabajo y carga', 'La aplicación se confirma según vehículo, transmisión y carga']
    },
    'hw-water': {
      slug: 'hw-water', name: 'HW Water 200–350 cc', heroLabel: 'HW Water 200–350 cc', displacement: 'HW200 / HW250 / HW300 / HW350', cooling: 'Refrigeración por agua con aletas de enfriamiento', reverse: 'Sin reversa interna',
      bestFor: 'Carga pesada, uso continuo y proyectos de ensamblaje', image: 'images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp',
      gallery: ['images/hw-water-cooled/chixiang-hw300-water-cooled-cargo-tricycle-engine-front-view.webp', 'images/hw-water-cooled/chixiang-hw300-finned-water-cooled-cylinder-sump-detail.webp', 'images/hw-water-cooled/chixiang-hw300-crankcase-20-roller-clutch-side.webp'],
      benefits: ['Capacidad de aceite de 1,5 L en la familia HW Water', 'Embrague de 20 rodillos y magneto de alta salida', 'Sin reversa interna; las especificaciones del modelo se confirman antes de cotizar']
    },
    'engine-spares': {
      slug: 'engine-spares', name: 'Motores y paquetes de repuestos', displacement: 'Según los motores incluidos en el pedido', cooling: 'Según cada modelo', reverse: 'No es un criterio de selección del paquete',
      bestFor: 'Distribuidores, mayoristas, ensambladores y servicio posventa', image: 'images/guides/chixiang-aftermarket-engine-parts-supply.webp',
      gallery: ['images/guides/chixiang-aftermarket-engine-parts-supply.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp', 'images/cg-water-cooled/chixiang-cg250sb-starter-rear-mounting-lugs.webp'],
      benefits: ['Motores y repuestos pueden combinarse para el canal posventa', 'Lista de repuestos preparada por código y configuración', 'Empaque y composición confirmados para el pedido completo']
    },
    cg125: {
      slug: 'cg125', name: 'CG125', displacement: '125 cc', cooling: 'Refrigeración por aire', reverse: 'Según configuración',
      bestFor: 'Motos urbanas y de trabajo', image: 'images/central-asia-hero-products/cg-air.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-right-clutch-kickstart-side.webp'],
      benefits: ['Opción para baja cilindrada', 'Selección según modelo o código', 'Repuestos para pedido mayorista']
    },
    cg150: {
      slug: 'cg150', name: 'CG150', displacement: '150 cc', cooling: 'Refrigeración por aire', reverse: 'Según configuración',
      bestFor: 'Trabajo diario, reparto y reemplazo', image: 'images/central-asia-hero-products/cg-air.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-cylinder-head-fins-detail.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp'],
      benefits: ['Uso diario y comercial', 'Selección por vehículo o código', 'Repuestos para pedidos mayoristas']
    },
    cg200: {
      slug: 'cg200', name: 'CG200', displacement: '200 cc', cooling: 'Refrigeración por aire; confirmar modelo', reverse: 'Se confirma con la configuración del vehículo',
      bestFor: 'Motos de trabajo y aplicaciones de carga', image: 'images/central-asia-hero-products/cg-air.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg150-cg200-ohv-air-cooled-engine-front-view.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-cylinder-head-fins-detail.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp'],
      benefits: ['Mayor cilindrada para trabajo comercial', 'Suministro B2B con selección técnica', 'Confirmación de código, montaje y sistema eléctrico']
    },
    cargo: {
      slug: 'cargo', name: 'Configuración para carga', displacement: '150–250 cc', cooling: 'Aire o agua según modelo', reverse: 'Según vehículo y configuración',
      bestFor: 'Carga y trabajo intensivo', image: 'images/central-asia-hero-products/cg-water.webp',
      gallery: ['images/cg-water-cooled/chixiang-cg250sb-water-cooled-cylinder-jacket-ports.webp', 'images/cg-water-cooled/chixiang-cg250sb-starter-rear-mounting-lugs.webp', 'images/cg-water-cooled/chixiang-cg250sb-left-magneto-output-shaft-side.webp'],
      benefits: ['Selección según vehículo y carga', 'Confirmación de transmisión e interfaces', 'Opciones de repuestos y empaque']
    },
    replacement: {
      slug: 'replacement', name: 'Motor y posventa', displacement: '125–150 cc', cooling: 'Según modelo', reverse: 'Se confirma por foto o código',
      bestFor: 'Selección de reemplazo y posventa', image: 'images/central-asia-hero-products/cg-air.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp', 'images/cg-water-cooled/chixiang-cg250sb-water-cooled-cargo-tricycle-engine-front-view.webp'],
      benefits: ['Selección por foto, placa o código', 'Confirmación antes de cotizar', 'Repuestos para pedidos mayoristas']
    },
    spares: {
      slug: 'spares', name: 'Motor + paquete de repuestos', displacement: 'Según motor confirmado', cooling: 'Según configuración', reverse: 'No es criterio principal de selección',
      bestFor: 'Distribuidores, talleres y posventa', image: 'images/central-asia-hero-products/cg-air.webp',
      gallery: ['images/cg-air-cooled/chixiang-cg-ohv-air-cooled-left-magneto-sprocket-side.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-right-clutch-kickstart-side.webp', 'images/cg-air-cooled/chixiang-cg-ohv-air-cooled-starter-rear-mount-detail.webp'],
      benefits: ['Lista de piezas por código o muestra', 'Carga mixta para pedidos B2B', 'Paquete de posventa para el canal']
    }
  };

  var factoryImages = [
    { src: 'images/factory-showcase/chixiang-chongqing-engine-production-workshop.webp', alt: 'Producción de Chixiang Motor' },
    { src: 'images/factory-showcase/chixiang-chongqing-engine-assembly-facility.webp', alt: 'Área de fábrica de Chixiang Motor' },
    { src: 'images/factory-showcase/chixiang-engine-machining-production-equipment.webp', alt: 'Control de producto de Chixiang Motor' },
    { src: 'images/factory-showcase/chixiang-engine-quality-inspection-lab.webp', alt: 'Preparación de pedidos de Chixiang Motor' }
  ];

  window.ChixiangLatamProducts = {
    products: products,
    factoryImages: factoryImages,
    referencedAssets: Object.keys(products).reduce(function(list, key) {
      return list.concat([products[key].image], products[key].gallery);
    }, factoryImages.map(function(item) { return item.src; }))
  };
})(window);
