(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'colombia', name: 'Colombia', defaultCountry: 'Colombia', sourceForm: 'es_colombia_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'MOTORES, REPUESTOS Y SOPORTE B2B PARA COLOMBIA',
      title: 'Motores y repuestos para distribuidores y canales de posventa en Colombia',
      description: 'Seleccionamos motores y repuestos según el vehículo, el código del motor, las interfaces y la cantidad solicitada.',
      whatsappMessageTemplate: 'Hola, deseo información mayorista para {market}.\nProducto de interés: {product}.\nAplicación: {application}.',
      replacementMessage: 'Hola, necesito seleccionar un motor o repuestos para Colombia.\nEnviaré foto del vehículo, código del motor, cilindrada, montaje, sistema eléctrico y cantidad.\nPor favor, ayúdeme a confirmar la opción adecuada.'
    },
    productOrder: ['spares', 'replacement'],
    applications: [
      { title: 'Distribución de repuestos', text: 'Listas de piezas y paquetes de posventa preparados según código o muestra.', product: 'spares' },
      { title: 'Selección de motor', text: 'Revisión por vehículo, código, fotos e interfaces antes de cotizar.', product: 'replacement' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Solución' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'bestFor', label: 'Uso recomendado' },
      { key: 'reverse', label: 'Cómo se confirma' }
    ],
    comparisonActionLabel: 'Solicitar información',
    quoteTitle: 'Solicitar información mayorista', quoteDescription: 'Comparta vehículo, código, fotos, interfaces y cantidad para preparar una opción adecuada.',
    heroPoints: ['Cooperación con distribuidores', 'Repuestos y posventa', 'Selección por código e interfaces', 'Opciones B2B según el proyecto'],
    form: {
      applications: ['Distribución de repuestos', 'Selección de motor', 'Posventa', 'Evaluación de motor completo', 'Otro'],
      displacements: ['125 cc', '150 cc', 'Otra', 'No estoy seguro']
    },
    faq: [
      ['¿Puedo solicitar un motor completo?', 'Sí. Envíe los datos del vehículo y del motor actual para confirmar qué configuración podemos ofrecer.'],
      ['¿Sirve como motor de reemplazo?', 'La sustitución depende del código, montaje, salida y sistema eléctrico. Confirmamos cada aplicación antes de cotizar.'],
      ['¿Puedo enviar una foto o el código del motor?', 'Sí. Envíelos por WhatsApp junto con la cantidad necesaria.'],
      ['¿Hay repuestos para posventa?', 'Podemos preparar repuestos y paquetes de posventa según el motor confirmado.'],
      ['¿Puedo solicitar cooperación como distribuidor?', 'Sí. Revisamos productos, cantidades, repuestos, empaque y necesidades de su canal.'],
      ['¿Cómo se confirma la compatibilidad?', 'Se revisan fotos, código, montaje, salida, sistema eléctrico y requisitos del cliente.'],
      ['¿Es compatible con AKT, Bajaj, TVS o Hero?', 'No ofrecemos una promesa de compatibilidad directa con esas plataformas. Cada aplicación requiere revisión técnica.']
    ]
  };
})(window);