(function(window) {
  'use strict';

  var products = {
    cg125: {
      slug: 'cg125', name: 'CG125', displacement: '125 cc', cooling: 'Refrigeración por aire', reverse: 'Según configuración',
      bestFor: 'Motos urbanas y de trabajo', image: 'images/central-asia-hero-products/cg-air.png',
      gallery: ['images/cg银白色/1.webp', 'images/cg银白色/2.webp', 'images/cg银白色/3.webp'],
      benefits: ['Opción para baja cilindrada', 'Selección según modelo o código', 'Repuestos para pedido mayorista']
    },
    cg150: {
      slug: 'cg150', name: 'CG150', displacement: '150 cc', cooling: 'Refrigeración por aire', reverse: 'Según configuración',
      bestFor: 'Trabajo diario y reemplazo', image: 'images/central-asia-hero-products/cg-air.png',
      gallery: ['images/cg银白色/1.webp', 'images/cg银白色/4.webp', 'images/cg银白色/5.webp'],
      benefits: ['Uso diario y comercial', 'Selección por vehículo o código', 'Repuestos disponibles para pedido']
    },
    cg200: {
      slug: 'cg200', name: 'CG200', displacement: '200 cc', cooling: 'Refrigeración por agua', reverse: 'Según modelo',
      bestFor: 'Trimotos de carga', image: 'images/central-asia-hero-products/cg-water.png',
      gallery: ['images/普通水冷/6kjzxqqh.webp', 'images/普通水冷/e8zlq6eb.webp', 'images/普通水冷/pcdwa12q.webp'],
      benefits: ['Pensado para trabajo y carga', 'Refrigeración por agua', 'Configuración confirmada antes de cotizar']
    },
    cargo: {
      slug: 'cargo', name: 'Configuración para carga', displacement: '150–200 cc', cooling: 'Aire o agua según modelo', reverse: 'Según modelo',
      bestFor: 'Carga y trabajo intensivo', image: 'images/central-asia-hero-products/cg-water.png',
      gallery: ['images/普通水冷/po85qu0l.webp', 'images/普通水冷/qog3j40j.webp', 'images/普通水冷/pcdwa12q.webp'],
      benefits: ['Selección según vehículo y carga', 'Reversa según el modelo', 'Opciones de repuestos y empaque']
    },
    replacement: {
      slug: 'replacement', name: 'Reemplazo y posventa', displacement: '125–150 cc', cooling: 'Según modelo', reverse: 'Se confirma por foto o código',
      bestFor: 'Reemplazo y posventa', image: 'images/central-asia-hero-products/cg-air.png',
      gallery: ['images/cg银白色/2.webp', 'images/cg银白色/5.webp', 'images/普通水冷/6kjzxqqh.webp'],
      benefits: ['Selección por foto, placa o código', 'Confirmación antes de cotizar', 'Repuestos para pedidos mayoristas']
    }
  };

  var factoryImages = [
    { src: 'images/factory-showcase/factory-1.webp', alt: 'Producción de Chixiang Motor' },
    { src: 'images/factory-showcase/factory-2.webp', alt: 'Área de fábrica de Chixiang Motor' },
    { src: 'images/factory-showcase/factory-3.webp', alt: 'Control de producto de Chixiang Motor' },
    { src: 'images/factory-showcase/factory-4.webp', alt: 'Preparación de pedidos de Chixiang Motor' }
  ];

  window.ChixiangLatamProducts = {
    products: products,
    factoryImages: factoryImages,
    referencedAssets: Object.keys(products).reduce(function(list, key) {
      return list.concat([products[key].image], products[key].gallery);
    }, factoryImages.map(function(item) { return item.src; }))
  };
})(window);
