(function(window) {
  'use strict';
  window.ChixiangLatamMarket = {
    market: {
      key: 'colombia', name: 'Colombia', defaultCountry: 'Colombia', sourceForm: 'es_colombia_cg_landing', whatsappNumber: '8619008225410',
      eyebrow: 'CALIFICACIÓN TÉCNICA Y DESARROLLO DE DISTRIBUIDORES EN COLOMBIA',
      title: 'Repuestos y calificación de plataformas para distribuidores en Colombia',
      description: 'La demanda pública de motores completos no está verificada. Priorizamos repuestos, cooperación con distribuidores y validación técnica por foto, código, montaje, sistema eléctrico y cantidad.',
      whatsappMessageTemplate: 'Hola, deseo una cotización mayorista para {market}.\nMotor de interés: {product}.\nAplicación: {application}.',
      replacementMessage: 'Hola, necesito una revisión técnica para Colombia.\nEnviaré foto del vehículo, código del motor, cilindrada, montaje, sistema eléctrico y cantidad.\nPor favor, ayúdeme a revisar la plataforma o los repuestos.'
    },
    productOrder: ['spares', 'replacement'],
    applications: [
      { title: 'Distribución de repuestos', text: 'Revisión por código, muestra y necesidad de posventa.', product: 'spares' },
      { title: 'Calificación de plataforma', text: 'Validación por vehículo, código, fotos e interfaces.', product: 'replacement' }
    ],
    comparisonFields: [
      { key: 'name', label: 'Solución' },
      { key: 'displacement', label: 'Cilindrada' },
      { key: 'cooling', label: 'Refrigeración' },
      { key: 'bestFor', label: 'Uso recomendado' },
      { key: 'reverse', label: 'Cómo se confirma' }
    ],
    comparisonActionLabel: 'Solicitar revisión técnica',
    quoteTitle: 'Solicitar calificación técnica', quoteDescription: 'Comparta vehículo, código, fotos, interfaces y cantidad. No asumimos compatibilidad por cilindrada.',
    heroPoints: ['SEO y desarrollo de distribuidores', 'Repuestos y posventa', 'Compatibilidad no asumida', 'Motores completos: demanda no verificada'],
    form: {
      applications: ['Distribución de repuestos', 'Calificación de plataforma', 'Posventa', 'Evaluación de motor completo', 'Otro'],
      displacements: ['125 cc', '150 cc', 'Otra', 'No estoy seguro']
    },
    faq: [
      ['¿Está verificada la demanda de motores completos?', 'No. La evidencia pública disponible no permite verificarla; esta página prioriza SEO, distribuidores, repuestos y calificación técnica.'],
      ['¿Sirve como motor de reemplazo?', 'No prometemos reemplazo directo. Podemos revisar la plataforma con fotos, código, cilindrada, montaje y sistema eléctrico.'],
      ['¿Puedo enviar una foto o el código del motor?', 'Sí. Envíelo por WhatsApp para revisar la configuración adecuada.'],
      ['¿Hay repuestos para posventa?', 'Podemos revisar repuestos junto con el pedido mayorista.'],
      ['¿Puedo solicitar cooperación como distribuidor?', 'Sí. Revisamos el alcance de repuestos, plataforma, cantidades y necesidades de posventa.'],
      ['¿Cómo se confirma la compatibilidad?', 'No se confirma por cilindrada. Se revisan fotos, código, montaje, salida, sistema eléctrico y requisitos del cliente.'],
      ['¿Es compatible con AKT, Bajaj, TVS o Hero?', 'No ofrecemos una promesa de compatibilidad directa con esas plataformas. Cada aplicación requiere calificación técnica.']
    ]
  };
})(window);
