(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'peru', name: 'Perú', defaultCountry: 'Perú', sourceForm: 'es_peru_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'MOTORES B2B PARA DISTRIBUIDORES, ENSAMBLADORES Y MAYORISTAS EN PERÚ',
      title: 'Motores para motocicletas y trimotos de carga en Perú',
      description: 'Suministro B2B de motores CG refrigerados por aire de 150–250 cc, motores refrigerados por agua convencionales y motores HW refrigerados por agua de 200–350 cc para motocicletas y trimotos de carga.',
      whatsappMessageTemplate: 'Hola, deseo una cotización mayorista para {market}.\nSerie de producto: {product}.\nAplicación: {application}.\nCantidad estimada: {quantity}.',
      replacementMessage: 'Hola, necesito reemplazar un motor para una moto o trimoto en Perú.\nPuedo enviar una foto y el código del motor.\nPor favor, ayúdeme a confirmar el modelo y el precio mayorista.'
    },
    productOrder: ['cg-air-range', 'standard-water', 'hw-water', 'engine-spares'],
    applications: [
      { title: 'Motocicletas de calle y trabajo', text: 'CG150–250 refrigerados por aire para distribución, ensamblaje y uso comercial.', product: 'cg-air-range' },
      { title: 'Trabajo y carga con refrigeración por agua', text: 'Serie convencional para motocicletas de trabajo y trimotos de carga.', product: 'standard-water' },
      { title: 'Carga pesada y uso continuo', text: 'Serie HW 200–350 para proyectos que requieren una gama de mayor cilindrada.', product: 'hw-water' },
      { title: 'Motores y servicio posventa', text: 'Paquetes de repuestos preparados según los motores incluidos en el pedido.', product: 'engine-spares' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Modelo' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'reverse', label: 'Reversa' },
      { key: 'bestFor', label: 'Uso recomendado' }
    ],
    comparisonActionLabel: 'Solicitar precio',
    quoteTitle: 'Solicitar una propuesta B2B', quoteDescription: 'Indique empresa, país, serie, aplicación, código del motor, vehículo y cantidad total del pedido.',
    heroPoints: ['Muestras desde 2 motores en total', 'Pedidos mayoristas desde 50 en total', 'Pedidos mixtos y OEM desde 100 en total', 'Se pueden combinar distintos modelos'],
    form: {
      applications: ['Motocicleta de calle', 'Moto de trabajo', 'Trimoto de carga', 'Proyecto de ensamblaje', 'Distribución / mayorista', 'Repuestos / posventa', 'Otro'],
      displacements: ['150 cc', '175 cc', '200 cc', '250 cc', '300 cc', '350 cc', 'Otra', 'No estoy seguro']
    },
    faq: [
      ['¿Qué motor conviene para una trimoto de carga?', 'Confirmamos la configuración según el vehículo, la carga y el uso previsto antes de cotizar.'],
      ['¿Cuál es la diferencia entre CG150 y CG200?', 'La selección depende de la cilindrada requerida, el tipo de vehículo y el trabajo diario.'],
      ['¿La reversa define la selección?', 'No. Primero confirmamos el vehículo, la transmisión y las interfaces; la solución de reversa puede estar en el vehículo o en una configuración específica.'],
      ['¿Puedo reemplazar el motor actual de mi vehículo?', 'Sí. Envíe una foto, placa o código para confirmar la opción adecuada.'],
      ['¿Se pueden incluir repuestos?', 'Podemos preparar una lista de repuestos junto con el pedido mayorista.'],
      ['¿Cómo se confirma la configuración?', 'Necesitamos código del motor, fotos del vehículo, montaje, salida, sistema eléctrico, uso y cantidad.'],
      ['¿Es compatible con Bajaj, TVS, Hero o Piaggio Ape?', 'No prometemos compatibilidad directa con plataformas indias. Cada caso requiere revisión de interfaces y aceptación técnica.']
    ]
  };
})(window);
