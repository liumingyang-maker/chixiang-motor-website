(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'colombia', name: 'Colombia', defaultCountry: 'Colombia', sourceForm: 'es_colombia_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'SUMINISTRO DIRECTO DE FÁBRICA PARA COLOMBIA',
      title: 'Motores CG 125/150 cc para motos de trabajo y reemplazo',
      description: 'Opciones para baja cilindrada, uso diario y posventa. Seleccionamos el motor según el modelo, código o fotografía, con repuestos disponibles para pedidos mayoristas.',
      whatsappMessageTemplate: 'Hola, deseo una cotización mayorista para {market}.\nMotor de interés: {product}.\nAplicación: {application}.',
      replacementMessage: 'Hola, necesito un motor CG 125/150 cc de reemplazo en Colombia.\nPuedo enviar la foto, placa o código del motor.\nPor favor, ayúdeme a confirmar la opción adecuada.'
    },
    productOrder: ['cg125', 'cg150', 'replacement'],
    applications: [
      { title: 'Motos urbanas y de trabajo', text: 'Opción CG125 para baja cilindrada.', product: 'cg125' },
      { title: 'Reparto y uso comercial', text: 'Opción CG150 para trabajo diario.', product: 'cg150' },
      { title: 'Reemplazo y posventa', text: 'Selección por foto o código.', product: 'replacement' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Solución' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'bestFor', label: 'Uso recomendado' },
      { key: 'reverse', label: 'Cómo se confirma' }
    ],
    comparisonActionLabel: 'Solicitar precio',
    quoteTitle: 'Solicitar precio mayorista', quoteDescription: 'Indique país, serie y cantidad. Respondemos por WhatsApp o email.',
    heroPoints: ['Uso diario y trabajo', 'Motores de reemplazo', 'Repuestos para posventa', 'Suministro mayorista'],
    form: {
      applications: ['Moto urbana', 'Moto de trabajo', 'Reparto', 'Motor de reemplazo', 'Repuestos', 'Otro'],
      displacements: ['125 cc', '150 cc', 'Otra', 'No estoy seguro']
    },
    faq: [
      ['¿Cómo elegir entre CG125 y CG150?', 'La selección se confirma según el modelo, el uso diario y el código disponible.'],
      ['¿Sirve como motor de reemplazo?', 'Podemos revisar la opción con una foto, placa o código antes de cotizar.'],
      ['¿Puedo enviar una foto o el código del motor?', 'Sí. Envíelo por WhatsApp para revisar la configuración adecuada.'],
      ['¿Hay repuestos para posventa?', 'Podemos revisar repuestos junto con el pedido mayorista.'],
      ['¿Puedo solicitar OEM/ODM?', 'Las opciones de marca y configuración se revisan para cada solicitud mayorista.'],
      ['¿Cómo se confirma la compatibilidad?', 'La confirmamos por información del vehículo, foto, código y requisitos del cliente.']
    ]
  };
})(window);
