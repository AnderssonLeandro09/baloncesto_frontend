/**
 * Validaciones para Pruebas Antropométricas
 * Este archivo contiene las mismas validaciones que el backend para mantener consistencia.
 */

// ============================================================================
// CONSTANTES DE VALIDACIÓN (Sincronizadas con el Backend)
// ============================================================================

export const VALIDACIONES_ANTROPOMETRICAS = {
  PESO: {
    MIN: 20.0,
    MAX: 200.0,
  },
  ESTATURA: {
    MIN: 1.0,
    MAX: 2.5,
  },
  ALTURA_SENTADO: {
    MIN: 0.5,
    MAX: 1.5,
    RATIO_MIN: 0.4, // 40% de la estatura
  },
  ENVERGADURA: {
    MIN: 1.0,
    MAX: 3.0,
    RATIO_MIN: 0.9,
    RATIO_MAX: 1.4,
  },
  FECHA: {
    MAX_ANTIGUEDAD_ANOS: 10,
  },
};

// ============================================================================
// MENSAJES DE ERROR (Idénticos al Backend)
// ============================================================================

export const MENSAJES_ERROR = {
  PESO: {
    REQUERIDO: 'El peso es requerido',
    POSITIVO: 'El peso debe ser mayor a 0 kg',
    MINIMO: `El peso es muy bajo (mínimo ${VALIDACIONES_ANTROPOMETRICAS.PESO.MIN} kg)`,
    MAXIMO: `El peso es muy alto (máximo ${VALIDACIONES_ANTROPOMETRICAS.PESO.MAX} kg)`,
  },
  ESTATURA: {
    REQUERIDO: 'La estatura es requerida',
    POSITIVA: 'La estatura debe ser mayor a 0 m',
    MINIMA: `La estatura es muy baja (mínimo ${VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MIN} m)`,
    MAXIMA: `La estatura es muy alta (máximo ${VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MAX} m)`,
  },
  ALTURA_SENTADO: {
    REQUERIDO: 'La altura sentado es requerida',
    POSITIVA: 'La altura sentado debe ser mayor a 0 m',
    MINIMA: `La altura sentado es muy baja (mínimo ${VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MIN} m)`,
    MAXIMA: `La altura sentado es muy alta (máximo ${VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MAX} m)`,
    MAYOR_ESTATURA: 'La altura sentado no puede ser mayor que la estatura',
    PROPORCION: 'La altura sentado parece incorrecta (muy baja respecto a estatura)',
  },
  ENVERGADURA: {
    REQUERIDO: 'La envergadura es requerida',
    POSITIVA: 'La envergadura debe ser mayor a 0 m',
    MINIMA: `La envergadura es muy baja (mínimo ${VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MIN} m)`,
    MAXIMA: `La envergadura es muy alta (máximo ${VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MAX} m)`,
    RATIO: (ratio) => `La relación envergadura/estatura (${ratio.toFixed(2)}) es inusual. Verifica los datos.`,
  },
  FECHA: {
    REQUERIDA: 'La fecha de registro es requerida',
    FUTURA: 'La fecha no puede ser futura',
    ANTIGUA: (fechaMinima) => `La fecha no puede ser anterior a ${fechaMinima}`,
  },
  ATLETA: {
    REQUERIDO: 'El ID del atleta es requerido',
  },
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Convierte un valor a decimal con 2 decimales
 * @param {*} value - Valor a convertir
 * @returns {number|undefined} - Número con 2 decimales o undefined
 */
export const toDecimal = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : parseFloat(num.toFixed(2));
};

/**
 * Obtiene la fecha mínima permitida (N años atrás)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const getFechaMinima = () => {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - VALIDACIONES_ANTROPOMETRICAS.FECHA.MAX_ANTIGUEDAD_ANOS);
  return fecha.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha máxima permitida (hoy)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const getFechaMaxima = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Valida el peso
 * @param {number} peso - Peso en kg
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarPeso = (peso) => {
  if (!peso || peso <= 0) return MENSAJES_ERROR.PESO.POSITIVO;
  if (peso < VALIDACIONES_ANTROPOMETRICAS.PESO.MIN) return MENSAJES_ERROR.PESO.MINIMO;
  if (peso > VALIDACIONES_ANTROPOMETRICAS.PESO.MAX) return MENSAJES_ERROR.PESO.MAXIMO;
  return null;
};

/**
 * Valida la estatura
 * @param {number} estatura - Estatura en metros
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarEstatura = (estatura) => {
  if (!estatura || estatura <= 0) return MENSAJES_ERROR.ESTATURA.POSITIVA;
  if (estatura < VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MIN) return MENSAJES_ERROR.ESTATURA.MINIMA;
  if (estatura > VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MAX) return MENSAJES_ERROR.ESTATURA.MAXIMA;
  return null;
};

/**
 * Valida la altura sentado
 * @param {number} alturaSentado - Altura sentado en metros
 * @param {number} estatura - Estatura en metros (para validaciones cruzadas)
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarAlturaSentado = (alturaSentado, estatura) => {
  if (!alturaSentado || alturaSentado <= 0) return MENSAJES_ERROR.ALTURA_SENTADO.POSITIVA;
  if (alturaSentado < VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MIN) 
    return MENSAJES_ERROR.ALTURA_SENTADO.MINIMA;
  if (alturaSentado > VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MAX) 
    return MENSAJES_ERROR.ALTURA_SENTADO.MAXIMA;
  
  // Validaciones cruzadas
  if (estatura) {
    if (alturaSentado > estatura) return MENSAJES_ERROR.ALTURA_SENTADO.MAYOR_ESTATURA;
    if (alturaSentado < estatura * VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.RATIO_MIN) 
      return MENSAJES_ERROR.ALTURA_SENTADO.PROPORCION;
  }
  
  return null;
};

/**
 * Valida la envergadura
 * @param {number} envergadura - Envergadura en metros
 * @param {number} estatura - Estatura en metros (para validaciones cruzadas)
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarEnvergadura = (envergadura, estatura) => {
  if (!envergadura || envergadura <= 0) return MENSAJES_ERROR.ENVERGADURA.POSITIVA;
  if (envergadura < VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MIN) 
    return MENSAJES_ERROR.ENVERGADURA.MINIMA;
  if (envergadura > VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MAX) 
    return MENSAJES_ERROR.ENVERGADURA.MAXIMA;
  
  // Validación de ratio con estatura
  if (estatura) {
    const ratio = envergadura / estatura;
    if (ratio < VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.RATIO_MIN || 
        ratio > VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.RATIO_MAX) {
      return MENSAJES_ERROR.ENVERGADURA.RATIO(ratio);
    }
  }
  
  return null;
};

/**
 * Valida la fecha de registro
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarFecha = (fecha) => {
  if (!fecha) return MENSAJES_ERROR.FECHA.REQUERIDA;
  
  const fechaRegistro = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  // No permitir fechas futuras
  if (fechaRegistro > hoy) return MENSAJES_ERROR.FECHA.FUTURA;
  
  // No permitir fechas muy antiguas
  const fechaMinima = new Date(getFechaMinima());
  if (fechaRegistro < fechaMinima) {
    return MENSAJES_ERROR.FECHA.ANTIGUA(getFechaMinima());
  }
  
  return null;
};

/**
 * Valida todos los datos antropométricos
 * @param {Object} datos - Objeto con todos los datos
 * @returns {Object} - Objeto con errores por campo o vacío si todo es válido
 */
export const validarDatosAntropometricos = (datos) => {
  const errores = {};
  
  // Validar peso
  const errorPeso = validarPeso(datos.peso);
  if (errorPeso) errores.peso = errorPeso;
  
  // Validar estatura
  const errorEstatura = validarEstatura(datos.estatura);
  if (errorEstatura) errores.estatura = errorEstatura;
  
  // Validar altura sentado
  const errorAlturaSentado = validarAlturaSentado(datos.altura_sentado, datos.estatura);
  if (errorAlturaSentado) errores.altura_sentado = errorAlturaSentado;
  
  // Validar envergadura
  const errorEnvergadura = validarEnvergadura(datos.envergadura, datos.estatura);
  if (errorEnvergadura) errores.envergadura = errorEnvergadura;
  
  // Validar fecha
  const errorFecha = validarFecha(datos.fecha_registro);
  if (errorFecha) errores.fecha_registro = errorFecha;
  
  return errores;
};

// ============================================================================
// CALCULADORES DE ÍNDICES
// ============================================================================

/**
 * Calcula el Índice de Masa Corporal (IMC)
 * @param {number} peso - Peso en kg
 * @param {number} estatura - Estatura en metros
 * @returns {number} - IMC con 2 decimales
 */
export const calcularIMC = (peso, estatura) => {
  if (!peso || !estatura || estatura <= 0) return 0;
  return parseFloat((peso / (estatura * estatura)).toFixed(2));
};

/**
 * Calcula el Índice Córmico
 * @param {number} alturaSentado - Altura sentado en metros
 * @param {number} estatura - Estatura en metros
 * @returns {number} - Índice córmico con 2 decimales
 */
export const calcularIndiceCormico = (alturaSentado, estatura) => {
  if (!alturaSentado || !estatura || estatura <= 0) return 0;
  return parseFloat(((alturaSentado / estatura) * 100).toFixed(2));
};

/**
 * Obtiene la clasificación del IMC
 * @param {number} imc - Valor del IMC
 * @returns {Object} - {text: string, color: string, categoria: string}
 */
export const clasificarIMC = (imc) => {
  if (isNaN(imc) || imc === 0) {
    return { text: '-', color: 'text-gray-500', bg: 'bg-gray-100', hexColor: '#6b7280', categoria: 'sin_datos' };
  }
  // Tres categorías solicitadas: Insuficiente, Normal, Sobrepeso
  if (imc < 18.5) {
    return { text: 'Insuficiente', color: 'text-blue-600', bg: 'bg-blue-100', hexColor: '#2563eb', categoria: 'insuficiente' };
  }
  if (imc < 25) {
    return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-100', hexColor: '#16a34a', categoria: 'normal' };
  }
  return { text: 'Sobrepeso', color: 'text-yellow-600', bg: 'bg-yellow-100', hexColor: '#f59e0b', categoria: 'sobrepeso' };
};

/**
 * Verifica si el índice córmico está en rango normal
 * @param {number} indiceCormico - Valor del índice córmico
 * @returns {Object} - {esNormal: boolean, mensaje: string, color: string}
 */
export const verificarIndiceCormico = (indiceCormico) => {
  if (isNaN(indiceCormico) || indiceCormico === 0) {
    return { esNormal: null, mensaje: '-', color: 'text-gray-500' };
  }
  if (indiceCormico >= 50 && indiceCormico <= 55) {
    return { esNormal: true, mensaje: 'Normal (50-55)', color: 'text-green-600' };
  }
  if (indiceCormico < 50) {
    return { esNormal: false, mensaje: 'Bajo (< 50)', color: 'text-blue-600' };
  }
  return { esNormal: false, mensaje: 'Alto (> 55)', color: 'text-yellow-600' };
};

/**
 * Clasifica el Índice Córmico en tres categorías
 * Braquicórmico (<50), Mesocórmico (50-55), Macrosquélico (>55)
 * @param {number} indiceCormico
 * @returns {Object} - {text: string, color: string, bg: string, hexColor: string, categoria: string}
 */
export const clasificarIndiceCormico = (indiceCormico) => {
  if (isNaN(indiceCormico) || indiceCormico === 0) {
    return { text: '-', color: 'text-gray-500', bg: 'bg-gray-100', hexColor: '#6b7280', categoria: 'sin_datos' };
  }
  if (indiceCormico < 50) {
    return { text: 'Braquicórmico', color: 'text-blue-600', bg: 'bg-blue-100', hexColor: '#2563eb', categoria: 'braquicormico' };
  }
  if (indiceCormico <= 55) {
    return { text: 'Mesocórmico', color: 'text-green-600', bg: 'bg-green-100', hexColor: '#16a34a', categoria: 'mesocormico' };
  }
  return { text: 'Macrosquélico', color: 'text-yellow-600', bg: 'bg-yellow-100', hexColor: '#f59e0b', categoria: 'macrosquelico' };
};

// ============================================================================
// AYUDAS Y TOOLTIPS
// ============================================================================

export const TOOLTIPS = {
  PESO: `Ingrese el peso en kilogramos. Rango válido: ${VALIDACIONES_ANTROPOMETRICAS.PESO.MIN}-${VALIDACIONES_ANTROPOMETRICAS.PESO.MAX} kg`,
  ESTATURA: `Ingrese la estatura en metros. Rango válido: ${VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MIN}-${VALIDACIONES_ANTROPOMETRICAS.ESTATURA.MAX} m`,
  ALTURA_SENTADO: `Ingrese la altura sentado en metros. Debe ser menor que la estatura. Rango: ${VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MIN}-${VALIDACIONES_ANTROPOMETRICAS.ALTURA_SENTADO.MAX} m`,
  ENVERGADURA: `Ingrese la envergadura en metros. Rango válido: ${VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MIN}-${VALIDACIONES_ANTROPOMETRICAS.ENVERGADURA.MAX} m`,
  FECHA: `Seleccione la fecha de registro. No puede ser futura ni anterior a ${VALIDACIONES_ANTROPOMETRICAS.FECHA.MAX_ANTIGUEDAD_ANOS} años`,
  IMC: 'Índice de Masa Corporal: calculado automáticamente como Peso / Estatura²',
  INDICE_CORMICO: 'Índice Córmico: calculado como (Altura Sentado / Estatura) × 100. Valores normales: 50-55',
};

export default {
  VALIDACIONES_ANTROPOMETRICAS,
  MENSAJES_ERROR,
  toDecimal,
  getFechaMinima,
  getFechaMaxima,
  validarPeso,
  validarEstatura,
  validarAlturaSentado,
  validarEnvergadura,
  validarFecha,
  validarDatosAntropometricos,
  calcularIMC,
  calcularIndiceCormico,
  clasificarIMC,
  verificarIndiceCormico,
  clasificarIndiceCormico,
  TOOLTIPS,
};
