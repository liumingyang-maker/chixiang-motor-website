(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'peru', name: 'Perú', defaultCountry: 'Perú', sourceForm: 'es_peru_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'SUMINISTRO B2B PARA DISTRIBUIDORES Y ENSAMBLADORES EN PERÚ',
      title: 'Motores CG 200 y CG 150 para distribuidores y motos de trabajo en Perú',
      description: 'Motores CG200 y CG150 refrigerados por aire, paquetes de repuestos y selección técnica para trabajo, distribución y ensamblaje.',
      whatsappMessageTemplate: 'Hola, deseo una cotización mayorista para {market}.\nMotor de interés: {product}.\nAplicación: {application}.',
      replacementMessage: 'Hola, necesito reemplazar un motor para una moto o trimoto en Perú.\nPuedo enviar una foto y el código del motor.\nPor favor, ayúdeme a confirmar el modelo y el precio mayorista.'
    },
    productOrder: ['cg200', 'cg150', 'spares', 'cargo'],
    applications: [
      { title: 'Motos de trabajo y carga', text: 'CG200 para aplicaciones que requieren mayor cilindrada y uso comercial.', product: 'cg200' },
      { title: 'Trabajo diario y reparto', text: 'CG150 para motos de trabajo, reparto y distribución.', product: 'cg150' },
      { title: 'Motor y posventa', text: 'Paquete de repuestos preparado según el código y la configuración del motor.', product: 'spares' },
      { title: 'Carga con refrigeración por agua', text: 'Opciones para carga sujetas a confirmación del vehículo y la transmisión.', product: 'cargo' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Modelo' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'reverse', label: 'Reversa' },
      { key: 'bestFor', label: 'Uso recomendado' }
    ],
    comparisonActionLabel: 'Solicitar precio',
    quoteTitle: 'Solicitar precio mayorista', quoteDescription: 'Indique país, serie, aplicación y cantidad. Respondemos por WhatsApp o email.',
    heroPoints: ['Muestras y lotes pequeños', 'Carga mixta y opciones OEM', 'Paquetes de repuestos', 'Selección técnica antes de cotizar'],
    form: {
      applications: ['Moto de trabajo', 'Carga / trimoto', 'Motor de reemplazo', 'Repuestos / posventa', 'Distribución / ensamblaje', 'Otro'],
      displacements: ['150 cc', '200 cc', 'Otra', 'No estoy seguro']
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