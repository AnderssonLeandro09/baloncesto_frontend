/**
 * Validaciones para el módulo de Pruebas Físicas
 * 
 * Este módulo contiene todas las validaciones necesarias para garantizar
 * la integridad de los datos de pruebas físicas antes de enviarlos al backend.
 * Las validaciones están sincronizadas con las del backend para una capa extra de seguridad.
 * 
 * @module utils/validacionesPruebasFisicas
 */

/**
 * Tipos de prueba válidos
 * @constant
 */
export const TIPOS_PRUEBA = {
  FUERZA: 'FUERZA',
  VELOCIDAD: 'VELOCIDAD',
  AGILIDAD: 'AGILIDAD',
}

/**
 * Rangos máximos permitidos por tipo de prueba (sincronizado con backend)
 * @constant
 */
export const RANGOS_MAXIMOS = {
  [TIPOS_PRUEBA.FUERZA]: 300,    // Salto horizontal: hasta 300 cm
  [TIPOS_PRUEBA.VELOCIDAD]: 15,  // 30m velocidad: hasta ~15 seg
  [TIPOS_PRUEBA.AGILIDAD]: 25,   // Zigzag: hasta ~25 seg
}

/**
 * Unidades de medida por tipo de prueba
 * @constant
 */
export const UNIDADES_POR_TIPO = {
  [TIPOS_PRUEBA.FUERZA]: 'Centímetros (cm)',
  [TIPOS_PRUEBA.VELOCIDAD]: 'Segundos (seg)',
  [TIPOS_PRUEBA.AGILIDAD]: 'Segundos (seg)',
}

/**
 * Límites de validación
 * @constant
 */
export const LIMITES = {
  MAX_OBSERVACIONES: 200,
  MIN_RESULTADO: 0.01,
  MAX_ID: 2147483647, // Máximo INT en PostgreSQL
}

/**
 * Mensajes de error amigables para el usuario
 * @constant
 */
export const MENSAJES_ERROR = {
  // Errores de atleta
  ATLETA_REQUERIDO: 'Debes seleccionar un atleta para registrar la prueba',
  ATLETA_ID_INVALIDO: 'El atleta seleccionado no es válido',
  ATLETA_NO_EXISTE: 'El atleta seleccionado no existe en el sistema',
  ATLETA_SIN_INSCRIPCION: 'El atleta no tiene inscripción habilitada. No se puede registrar la prueba',
  
  // Errores de tipo de prueba
  TIPO_REQUERIDO: 'Debes seleccionar un tipo de prueba',
  TIPO_INVALIDO: 'El tipo de prueba seleccionado no es válido',
  
  // Errores de resultado
  RESULTADO_REQUERIDO: 'Debes ingresar el resultado de la prueba',
  RESULTADO_INVALIDO: 'El resultado debe ser un número válido',
  RESULTADO_NEGATIVO: 'El resultado debe ser mayor a 0',
  RESULTADO_EXCEDE_RANGO: (tipo, max) => `El resultado excede el máximo permitido para ${tipo}: ${max}`,
  
  // Errores de observaciones
  OBSERVACIONES_EXCEDE: `Las observaciones no pueden exceder ${LIMITES.MAX_OBSERVACIONES} caracteres`,
  
  // Errores de fecha
  FECHA_FUTURA: 'La fecha de registro no puede ser futura',
  
  // Errores de permisos
  SIN_PERMISO_CREAR: 'No tienes permiso para registrar pruebas físicas',
  SIN_PERMISO_EDITAR: 'No tienes permiso para modificar esta prueba',
  SIN_PERMISO_ATLETA: 'No tienes permiso para registrar pruebas a este atleta',
  
  // Errores de estado
  PRUEBA_INACTIVA: 'No se puede modificar una prueba inactiva',
  PRUEBA_NO_ENCONTRADA: 'La prueba física no fue encontrada',
  
  // Errores genéricos
  ERROR_SERVIDOR: 'Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo',
  ERROR_CONEXION: 'No se pudo conectar con el servidor. Verifica tu conexión a internet',
  ERROR_VALIDACION: 'Los datos ingresados no son válidos. Por favor, revisa el formulario',
}

/**
 * Mensajes de éxito amigables
 * @constant
 */
export const MENSAJES_EXITO = {
  CREAR: 'Prueba física registrada exitosamente',
  ACTUALIZAR: 'Prueba física actualizada exitosamente',
  ACTIVAR: 'Prueba física activada',
  DESACTIVAR: 'Prueba física desactivada',
  CARGAR: 'Datos cargados correctamente',
}

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/[<>"'&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      }
      return entities[char]
    })
    .trim()
    .substring(0, LIMITES.MAX_OBSERVACIONES)
}

/**
 * Calcula el semestre basado en una fecha
 * @param {Date|string} fecha - Fecha para calcular el semestre
 * @returns {string} Semestre en formato "YYYY-1" o "YYYY-2"
 */
export const calcularSemestre = (fecha = new Date()) => {
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  if (isNaN(date.getTime())) return 'N/A'
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const periodo = month <= 6 ? 1 : 2
  return `${year}-${periodo}`
}

/**
 * Valida el ID del atleta
 * @param {number|string} atletaId - ID del atleta
 * @returns {Object} Objeto con resultado de validación { valid: boolean, error?: string }
 */
export const validarAtletaId = (atletaId) => {
  if (!atletaId) {
    return { valid: false, error: MENSAJES_ERROR.ATLETA_REQUERIDO }
  }
  
  const id = parseInt(atletaId, 10)
  if (isNaN(id) || id <= 0 || id > LIMITES.MAX_ID) {
    return { valid: false, error: MENSAJES_ERROR.ATLETA_ID_INVALIDO }
  }
  
  return { valid: true }
}

/**
 * Valida el tipo de prueba
 * @param {string} tipo - Tipo de prueba
 * @returns {Object} Objeto con resultado de validación { valid: boolean, error?: string }
 */
export const validarTipoPrueba = (tipo) => {
  if (!tipo) {
    return { valid: false, error: MENSAJES_ERROR.TIPO_REQUERIDO }
  }
  
  if (!Object.values(TIPOS_PRUEBA).includes(tipo)) {
    return { valid: false, error: MENSAJES_ERROR.TIPO_INVALIDO }
  }
  
  return { valid: true }
}

/**
 * Valida el resultado de la prueba
 * @param {number|string} resultado - Resultado de la prueba
 * @param {string} tipoPrueba - Tipo de prueba para validar rango
 * @returns {Object} Objeto con resultado de validación { valid: boolean, error?: string }
 */
export const validarResultado = (resultado, tipoPrueba) => {
  if (resultado === undefined || resultado === null || resultado === '') {
    return { valid: false, error: MENSAJES_ERROR.RESULTADO_REQUERIDO }
  }
  
  const valor = parseFloat(resultado)
  if (isNaN(valor)) {
    return { valid: false, error: MENSAJES_ERROR.RESULTADO_INVALIDO }
  }
  
  if (valor <= 0) {
    return { valid: false, error: MENSAJES_ERROR.RESULTADO_NEGATIVO }
  }
  
  const rangoMax = RANGOS_MAXIMOS[tipoPrueba]
  if (rangoMax && valor > rangoMax) {
    return { 
      valid: false, 
      error: MENSAJES_ERROR.RESULTADO_EXCEDE_RANGO(tipoPrueba, rangoMax) 
    }
  }
  
  return { valid: true }
}

/**
 * Valida las observaciones
 * @param {string} observaciones - Texto de observaciones
 * @returns {Object} Objeto con resultado de validación { valid: boolean, error?: string }
 */
export const validarObservaciones = (observaciones) => {
  if (!observaciones) {
    return { valid: true } // Las observaciones son opcionales
  }
  
  if (observaciones.length > LIMITES.MAX_OBSERVACIONES) {
    return { valid: false, error: MENSAJES_ERROR.OBSERVACIONES_EXCEDE }
  }
  
  return { valid: true }
}

/**
 * Valida una fecha de registro
 * @param {Date|string} fecha - Fecha a validar
 * @returns {Object} Objeto con resultado de validación { valid: boolean, error?: string }
 */
export const validarFechaRegistro = (fecha) => {
  if (!fecha) {
    return { valid: true } // La fecha por defecto se asigna automáticamente
  }
  
  const fechaRegistro = fecha instanceof Date ? fecha : new Date(fecha)
  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999) // Fin del día de hoy
  
  if (fechaRegistro > hoy) {
    return { valid: false, error: MENSAJES_ERROR.FECHA_FUTURA }
  }
  
  return { valid: true }
}

/**
 * Valida todos los campos del formulario de prueba física
 * @param {Object} datos - Datos del formulario
 * @param {boolean} isEditing - Si es modo edición
 * @returns {Object} Objeto con errores por campo { [campo]: string }
 */
export const validarFormularioPruebaFisica = (datos, isEditing = false) => {
  const errores = {}
  
  // Validar atleta (solo requerido en creación)
  if (!isEditing) {
    const atletaValidation = validarAtletaId(datos.atleta || datos.atleta_id)
    if (!atletaValidation.valid) {
      errores.atleta = atletaValidation.error
    }
  }
  
  // Validar tipo de prueba
  const tipoValidation = validarTipoPrueba(datos.tipo_prueba)
  if (!tipoValidation.valid) {
    errores.tipo_prueba = tipoValidation.error
  }
  
  // Validar resultado
  const resultadoValidation = validarResultado(datos.resultado, datos.tipo_prueba)
  if (!resultadoValidation.valid) {
    errores.resultado = resultadoValidation.error
  }
  
  // Validar observaciones
  const observacionesValidation = validarObservaciones(datos.observaciones)
  if (!observacionesValidation.valid) {
    errores.observaciones = observacionesValidation.error
  }
  
  return errores
}

/**
 * Parsea errores del backend al formato amigable para el usuario
 * @param {Object|string} error - Error del backend
 * @param {number} statusCode - Código de estado HTTP
 * @returns {Object} Objeto con mensaje amigable y errores de campo
 */
export const parsearErrorBackend = (error, statusCode) => {
  let mensaje = MENSAJES_ERROR.ERROR_SERVIDOR
  let erroresCampos = {}
  
  // Si el error es del nuevo formato (msg, data, code, status)
  if (error?.msg) {
    mensaje = convertirMensajeAmigable(error.msg, statusCode)
    
    // Si hay errores de validación de campos
    if (error.data && typeof error.data === 'object') {
      erroresCampos = procesarErroresCampos(error.data)
    }
  } else if (typeof error === 'string') {
    mensaje = convertirMensajeAmigable(error, statusCode)
  } else if (error?.message) {
    mensaje = convertirMensajeAmigable(error.message, statusCode)
  }
  
  return { mensaje, erroresCampos }
}

/**
 * Convierte un mensaje del backend a uno amigable para el usuario
 * @param {string} mensaje - Mensaje original
 * @param {number} statusCode - Código de estado HTTP
 * @returns {string} Mensaje amigable
 */
export const convertirMensajeAmigable = (mensaje, statusCode) => {
  // Mapeo de mensajes del backend a mensajes amigables
  const mapasMensajes = {
    'El ID del atleta es requerido': MENSAJES_ERROR.ATLETA_REQUERIDO,
    'El atleta con ID': MENSAJES_ERROR.ATLETA_NO_EXISTE,
    'El atleta no tiene inscripción habilitada': MENSAJES_ERROR.ATLETA_SIN_INSCRIPCION,
    'No tiene permiso para registrar pruebas a este atleta': MENSAJES_ERROR.SIN_PERMISO_ATLETA,
    'No tiene permiso para modificar esta prueba': MENSAJES_ERROR.SIN_PERMISO_EDITAR,
    'No tiene permiso para realizar esta acción': MENSAJES_ERROR.SIN_PERMISO_CREAR,
    'Prueba física no encontrada': MENSAJES_ERROR.PRUEBA_NO_ENCONTRADA,
    'No se puede modificar una prueba inactiva': MENSAJES_ERROR.PRUEBA_INACTIVA,
    'La fecha de registro no puede ser futura': MENSAJES_ERROR.FECHA_FUTURA,
    'valores negativos o cero': MENSAJES_ERROR.RESULTADO_NEGATIVO,
    'excede el rango máximo': 'El resultado supera el límite permitido para este tipo de prueba',
    'observaciones no pueden exceder': MENSAJES_ERROR.OBSERVACIONES_EXCEDE,
    'Error interno del servidor': MENSAJES_ERROR.ERROR_SERVIDOR,
    'Datos de entrada inválidos': MENSAJES_ERROR.ERROR_VALIDACION,
  }
  
  // Buscar coincidencia parcial en el mensaje
  for (const [key, value] of Object.entries(mapasMensajes)) {
    if (mensaje && mensaje.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Mensajes por código de estado si no hay coincidencia
  switch (statusCode) {
    case 400:
      return MENSAJES_ERROR.ERROR_VALIDACION
    case 401:
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente'
    case 403:
      return MENSAJES_ERROR.SIN_PERMISO_CREAR
    case 404:
      return MENSAJES_ERROR.PRUEBA_NO_ENCONTRADA
    case 500:
      return MENSAJES_ERROR.ERROR_SERVIDOR
    default:
      return mensaje || MENSAJES_ERROR.ERROR_SERVIDOR
  }
}

/**
 * Procesa los errores de campos del backend
 * @param {Object} data - Objeto de errores del backend
 * @returns {Object} Errores mapeados a nombres de campos del frontend
 */
const procesarErroresCampos = (data) => {
  const erroresCampos = {}
  
  const mapeoCampos = {
    atleta_id: 'atleta',
    tipo_prueba: 'tipo_prueba',
    resultado: 'resultado',
    observaciones: 'observaciones',
    fecha_registro: 'fecha_registro',
  }
  
  for (const [campo, errores] of Object.entries(data)) {
    const campoFrontend = mapeoCampos[campo] || campo
    erroresCampos[campoFrontend] = Array.isArray(errores) ? errores[0] : errores
  }
  
  return erroresCampos
}

/**
 * Obtiene la etiqueta legible para un tipo de prueba
 * @param {string} tipo - Tipo de prueba
 * @returns {string} Etiqueta legible
 */
export const getTipoLabel = (tipo) => {
  const labels = {
    [TIPOS_PRUEBA.FUERZA]: 'Fuerza (Salto Horizontal)',
    [TIPOS_PRUEBA.VELOCIDAD]: 'Velocidad',
    [TIPOS_PRUEBA.AGILIDAD]: 'Agilidad (ZigZag)',
  }
  return labels[tipo] || tipo
}

/**
 * Obtiene el color CSS para un tipo de prueba
 * @param {string} tipo - Tipo de prueba
 * @returns {string} Clases de Tailwind CSS para el color
 */
export const getTipoColor = (tipo) => {
  const colors = {
    [TIPOS_PRUEBA.FUERZA]: 'bg-blue-100 text-blue-700',
    [TIPOS_PRUEBA.VELOCIDAD]: 'bg-green-100 text-green-700',
    [TIPOS_PRUEBA.AGILIDAD]: 'bg-amber-100 text-amber-700',
  }
  return colors[tipo] || 'bg-gray-100 text-gray-700'
}

export default {
  TIPOS_PRUEBA,
  RANGOS_MAXIMOS,
  UNIDADES_POR_TIPO,
  LIMITES,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  sanitizeText,
  calcularSemestre,
  validarAtletaId,
  validarTipoPrueba,
  validarResultado,
  validarObservaciones,
  validarFechaRegistro,
  validarFormularioPruebaFisica,
  parsearErrorBackend,
  convertirMensajeAmigable,
  getTipoLabel,
  getTipoColor,
}
