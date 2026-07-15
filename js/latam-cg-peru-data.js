(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'peru', name: 'Perú', defaultCountry: 'Perú', sourceForm: 'es_peru_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'SUMINISTRO DIRECTO DE FÁBRICA PARA PERÚ',
      title: 'Motores CG 150/200 cc para motos y trimotos de carga',
      description: 'Motores para trabajo diario, carga y reemplazo. Refrigeración por aire o agua, reversa según el modelo, repuestos y empaque de exportación.',
      whatsappMessageTemplate: 'Hola, deseo una cotización mayorista para {market}.\nMotor de interés: {product}.\nAplicación: {application}.',
      replacementMessage: 'Hola, necesito reemplazar un motor para una moto o trimoto en Perú.\nPuedo enviar una foto y el código del motor.\nPor favor, ayúdeme a confirmar el modelo y el precio mayorista.'
    },
    productOrder: ['cg150', 'cg200', 'cargo'],
    applications: [
      { title: 'Motocicletas de trabajo', text: 'Uso diario y reparto.', product: 'cg150' },
      { title: 'Trimotos de carga', text: 'Trabajo de carga según la configuración.', product: 'cg200' },
      { title: 'Carga y trabajo intensivo', text: 'Selección según vehículo y carga.', product: 'cargo' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Modelo' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'reverse', label: 'Reversa' },
      { key: 'bestFor', label: 'Uso recomendado' }
    ],
    comparisonActionLabel: 'Solicitar precio',
    quoteTitle: 'Solicitar precio mayorista', quoteDescription: 'Indique país, serie y cantidad. Respondemos por WhatsApp o email.',
    heroPoints: ['Suministro mayorista', 'OEM / ODM', 'Repuestos disponibles', 'Soporte de exportación'],
    form: {
      applications: ['Motocicleta', 'Trimoto de carga', 'Motor de reemplazo', 'Repuestos', 'Otro'],
      displacements: ['150 cc', '200 cc', 'Otra', 'No estoy seguro']
    },
    faq: [
      ['¿Qué motor conviene para una trimoto de carga?', 'Confirmamos la configuración según el vehículo, la carga y el uso previsto antes de cotizar.'],
      ['¿Cuál es la diferencia entre CG150 y CG200?', 'La selección depende de la cilindrada requerida, el tipo de vehículo y el trabajo diario.'],
      ['¿Está disponible la reversa?', 'La reversa se confirma según el modelo y la configuración solicitada.'],
      ['¿Puedo reemplazar el motor actual de mi vehículo?', 'Sí. Envíe una foto, placa o código para confirmar la opción adecuada.'],
      ['¿Se pueden incluir repuestos?', 'Podemos revisar los repuestos necesarios junto con el pedido mayorista.'],
      ['¿Cómo se confirma la configuración?', 'La confirmamos por vehículo, código, foto y condición de carga.']
    ]
  };
})(window);
