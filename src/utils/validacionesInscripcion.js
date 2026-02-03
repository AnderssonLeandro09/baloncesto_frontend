/**
 * Validaciones y utilidades para el módulo de Inscripciones
 * 
 * Este módulo contiene todas las validaciones necesarias para garantizar
 * la integridad de los datos de inscripciones antes de enviarlos al backend.
 * Las validaciones están sincronizadas con las del backend para una capa extra de seguridad.
 * 
 * @module utils/validacionesInscripcion
 */

// ============================================================================
// CONSTANTES DE VALIDACIÓN - Sincronizadas con el backend
// ============================================================================

/**
 * Tipos de inscripción válidos
 * @constant
 */
export const TIPOS_INSCRIPCION = {
  MENOR_EDAD: 'MENOR_EDAD',
  MAYOR_EDAD: 'MAYOR_EDAD',
}

/**
 * Edad mínima y máxima permitida para atletas
 * @constant
 */
export const LIMITES_EDAD = {
  MINIMA: 5,
  MAXIMA: 80,
  MAYORIA: 18, // Edad legal para ser considerado mayor de edad
}

/**
 * Límites de caracteres para campos de texto
 * SINCRONIZADO CON BACKEND (models.py y serializers)
 * @constant
 */
export const LIMITES_TEXTO = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  CEDULA_EXACTA: 10,
  TELEFONO_EXACTA: 10,
  PARENTESCO_MIN: 3,
  PARENTESCO_MAX: 50,
  // Direcciones - Máximo 75 caracteres (sincronizado con backend)
  DIRECCION_MAX: 75,
  // Campos médicos - Máximo 100 caracteres (sincronizado con backend)
  CAMPOS_MEDICOS_MAX: 100,
  ALERGIAS_MAX: 100,
  ENFERMEDADES_MAX: 100,
  MEDICAMENTOS_MAX: 100,
  LESIONES_MAX: 100,
  OBSERVACIONES_MAX: 1000,
}

/**
 * Tipos de sangre válidos
 * @constant
 */
export const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

/**
 * Opciones de sexo válidas
 * @constant
 */
export const SEXOS_VALIDOS = ['M', 'F', 'O']

// ============================================================================
// MENSAJES DE ERROR AMIGABLES PARA EL USUARIO
// ============================================================================

/**
 * Mensajes de error amigables para mostrar al usuario
 * SINCRONIZADOS CON BACKEND - Los mensajes deben ser idénticos
 * @constant
 */
export const MENSAJES_ERROR = {
  // Errores de persona
  NOMBRE_REQUERIDO: 'Por favor, ingresa el nombre del atleta',
  NOMBRE_MUY_CORTO: 'El nombre debe tener al menos 2 caracteres',
  APELLIDO_REQUERIDO: 'Por favor, ingresa los apellidos del atleta',
  APELLIDO_MUY_CORTO: 'Los apellidos deben tener al menos 2 caracteres',
  CEDULA_REQUERIDA: 'La cédula es requerida.',
  CEDULA_INVALIDA: 'La cédula ingresada no es válida.',
  CEDULA_FORMATO: 'La cédula debe contener solo dígitos numéricos.',
  CEDULA_LONGITUD: 'La cédula debe tener exactamente 10 dígitos.',
  CEDULA_PROVINCIA_INVALIDA: 'Código de provincia inválido en la cédula.',
  CEDULA_DIGITO_VERIFICADOR: 'El dígito verificador de la cédula es incorrecto.',
  CEDULA_DUPLICADA: 'Este atleta ya tiene una inscripción activa. Verifica el número de cédula',
  TELEFONO_INVALIDO: 'El teléfono debe tener 10 dígitos',
  TELEFONO_FORMATO: 'El teléfono solo puede contener números',
  EMAIL_INVALIDO: 'Por favor, ingresa un correo electrónico válido',

  // Errores de dirección (sincronizado con backend)
  DIRECCION_MAX_LENGTH: `El campo dirección no puede exceder ${LIMITES_TEXTO.DIRECCION_MAX} caracteres.`,
  DIRECCION_REPRESENTANTE_MAX_LENGTH: `La dirección del representante no puede exceder ${LIMITES_TEXTO.DIRECCION_MAX} caracteres.`,

  // Errores de campos médicos (sincronizado con backend)
  ALERGIAS_MAX_LENGTH: `El campo alergias no puede exceder ${LIMITES_TEXTO.CAMPOS_MEDICOS_MAX} caracteres.`,
  ENFERMEDADES_MAX_LENGTH: `El campo enfermedades no puede exceder ${LIMITES_TEXTO.CAMPOS_MEDICOS_MAX} caracteres.`,
  MEDICAMENTOS_MAX_LENGTH: `El campo medicamentos no puede exceder ${LIMITES_TEXTO.CAMPOS_MEDICOS_MAX} caracteres.`,
  LESIONES_MAX_LENGTH: `El campo lesiones no puede exceder ${LIMITES_TEXTO.CAMPOS_MEDICOS_MAX} caracteres.`,

  // Errores de atleta
  FECHA_NACIMIENTO_REQUERIDA: 'La fecha de nacimiento es obligatoria',
  EDAD_FUERA_RANGO: `La edad del atleta debe estar entre ${LIMITES_EDAD.MINIMA} y ${LIMITES_EDAD.MAXIMA} años`,
  FECHA_FUTURA: 'La fecha de nacimiento no puede ser futura',
  SEXO_REQUERIDO: 'Por favor, selecciona el sexo del atleta',
  SEXO_OTRO_REQUERIDO: 'Por favor, especifica el sexo',

  // Errores de inscripción
  FECHA_INSCRIPCION_REQUERIDA: 'La fecha de inscripción es obligatoria',
  FECHA_INSCRIPCION_FUTURA: 'La fecha de inscripción no puede ser futura',
  
  // Errores de representante (menores de edad)
  REPRESENTANTE_REQUERIDO: 'Los menores de edad requieren un representante legal',
  NOMBRE_REPRESENTANTE_REQUERIDO: 'El nombre del representante es obligatorio para menores de edad',
  NOMBRE_REPRESENTANTE_MUY_CORTO: 'El nombre del representante debe tener al menos 3 caracteres',
  CEDULA_REPRESENTANTE_REQUERIDA: 'La cédula del representante es obligatoria',
  CEDULA_REPRESENTANTE_INVALIDA: 'La cédula del representante no es válida',
  PARENTESCO_REQUERIDO: 'El parentesco con el atleta es obligatorio',
  PARENTESCO_MUY_CORTO: 'El parentesco debe tener al menos 3 caracteres',
  TELEFONO_REPRESENTANTE_REQUERIDO: 'El teléfono del representante es obligatorio',
  TELEFONO_REPRESENTANTE_INVALIDO: 'El teléfono del representante debe tener 10 dígitos',
  EMAIL_REPRESENTANTE_INVALIDO: 'El correo del representante no es válido',

  // Errores genéricos
  ERROR_SERVIDOR: 'Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo',
  ERROR_CONEXION: 'No se pudo conectar con el servidor. Verifica tu conexión a internet',
  ERROR_VALIDACION: 'Los datos ingresados no son válidos. Por favor, revisa el formulario',
  ERROR_NO_ENCONTRADO: 'La inscripción que buscas no existe',
  ERROR_PERMISOS: 'No tienes permiso para realizar esta acción',
}

/**
 * Mensajes de éxito amigables para mostrar al usuario
 * @constant
 */
export const MENSAJES_EXITO = {
  CREAR: '¡Inscripción registrada exitosamente!',
  ACTUALIZAR: '¡Inscripción actualizada correctamente!',
  HABILITAR: '¡Inscripción habilitada! El atleta puede participar nuevamente',
  DESHABILITAR: 'Inscripción deshabilitada correctamente',
  ELIMINAR: 'Inscripción eliminada',
  CEDULA_DISPONIBLE: 'La cédula está disponible para registro',
}

// ============================================================================
// MAPEO DE CÓDIGOS HTTP A MENSAJES AMIGABLES
// ============================================================================

/**
 * Mapeo de códigos HTTP a mensajes amigables.
 * Usado cuando el backend no envía un mensaje específico.
 * @constant
 */
const CODIGO_A_MENSAJE = {
  400: 'Los datos enviados no son correctos. Por favor, revisa el formulario',
  401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
  403: 'No tienes permiso para realizar esta acción',
  404: 'El recurso que buscas no existe',
  409: 'Ya existe un registro con estos datos',
  422: 'Los datos no cumplen con el formato requerido',
  500: 'Ocurrió un error en el servidor. Por favor, intenta de nuevo más tarde',
  502: 'El servidor no está disponible en este momento',
  503: 'El servicio no está disponible. Intenta más tarde',
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que un campo de texto cumpla con los requisitos mínimos
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima requerida
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {boolean}
 */
export const validarTexto = (value, minLength = 1, maxLength = 255) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

/**
 * Valida que un valor contenga solo letras (incluyendo acentos y ñ)
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const validarSoloLetras = (value) => {
  if (!value) return false
  return /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/.test(value)
}

/**
 * Valida que un valor contenga solo números
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const validarSoloNumeros = (value) => {
  if (!value) return false
  return /^\d+$/.test(value)
}

/**
 * Valida una cédula ecuatoriana con algoritmo de módulo 10.
 * Sincronizado con la validación del backend (PersonaSerializer).
 * 
 * Reglas:
 * - Exactamente 10 dígitos numéricos
 * - Código de provincia válido (01-24)
 * - Tercer dígito < 6
 * - Dígito verificador correcto (módulo 10)
 * 
 * @param {string} cedula - Número de cédula
 * @returns {boolean} true si la cédula es válida
 */
export const validarCedula = (cedula) => {
  if (!cedula) return false
  
  // Limpiar caracteres no numéricos
  const cedulaLimpia = cedula.replace(/\D/g, '')
  
  // Debe tener exactamente 10 dígitos
  if (cedulaLimpia.length !== LIMITES_TEXTO.CEDULA_EXACTA) return false
  
  // Validar que solo contenga números
  if (!validarSoloNumeros(cedulaLimpia)) return false
  
  // Validar código de provincia (01-24)
  const provincia = parseInt(cedulaLimpia.substring(0, 2), 10)
  if (provincia < 1 || provincia > 24) return false
  
  // El tercer dígito debe ser menor a 6
  const tercerDigito = parseInt(cedulaLimpia[2], 10)
  if (tercerDigito >= 6) return false
  
  // Algoritmo de validación módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedulaLimpia[i], 10) * coeficientes[i]
    if (valor >= 10) valor -= 9
    suma += valor
  }
  
  const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  const digitoVerificadorReal = parseInt(cedulaLimpia[9], 10)
  
  return digitoVerificadorCalculado === digitoVerificadorReal
}

/**
 * Valida una cédula ecuatoriana y retorna el error específico si hay alguno.
 * Sincronizado con los mensajes del backend.
 * 
 * @param {string} cedula - Número de cédula
 * @returns {{ valido: boolean, error: string|null }} Resultado de validación con mensaje de error
 */
export const validarCedulaDetallado = (cedula) => {
  if (!cedula) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_REQUERIDA }
  }
  
  // Limpiar caracteres no numéricos
  const cedulaLimpia = cedula.replace(/\D/g, '')
  
  // Validar que solo contenga números
  if (!validarSoloNumeros(cedulaLimpia)) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_FORMATO }
  }
  
  // Debe tener exactamente 10 dígitos
  if (cedulaLimpia.length !== LIMITES_TEXTO.CEDULA_EXACTA) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_LONGITUD }
  }
  
  // Validar código de provincia (01-24)
  const provincia = parseInt(cedulaLimpia.substring(0, 2), 10)
  if (provincia < 1 || provincia > 24) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_PROVINCIA_INVALIDA }
  }
  
  // El tercer dígito debe ser menor a 6
  const tercerDigito = parseInt(cedulaLimpia[2], 10)
  if (tercerDigito >= 6) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_INVALIDA }
  }
  
  // Algoritmo de validación módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedulaLimpia[i], 10) * coeficientes[i]
    if (valor >= 10) valor -= 9
    suma += valor
  }
  
  const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  const digitoVerificadorReal = parseInt(cedulaLimpia[9], 10)
  
  if (digitoVerificadorCalculado !== digitoVerificadorReal) {
    return { valido: false, error: MENSAJES_ERROR.CEDULA_DIGITO_VERIFICADOR }
  }
  
  return { valido: true, error: null }
}

/**
 * Valida un número de teléfono
 * @param {string} telefono - Número de teléfono
 * @returns {boolean}
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return true // Teléfono es opcional
  const telefonoLimpio = telefono.replace(/\D/g, '')
  return telefonoLimpio.length === LIMITES_TEXTO.TELEFONO_EXACTA
}

/**
 * Valida un correo electrónico
 * @param {string} email - Correo electrónico
 * @returns {boolean}
 */
export const validarEmail = (email) => {
  if (!email) return true // Email puede ser opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string} fechaNacimiento - Fecha en formato YYYY-MM-DD
 * @returns {number|null}
 */
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad >= 0 ? edad : null
}

/**
 * Valida si una edad está dentro del rango permitido
 * @param {number} edad - Edad a validar
 * @returns {boolean}
 */
export const validarEdad = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  return !isNaN(edadNum) && edadNum >= LIMITES_EDAD.MINIMA && edadNum <= LIMITES_EDAD.MAXIMA
}

/**
 * Determina si un atleta es menor de edad
 * @param {number} edad - Edad del atleta
 * @returns {boolean}
 */
export const esMenorDeEdad = (edad) => {
  const edadNum = typeof edad === 'string' ? parseInt(edad, 10) : edad
  return !isNaN(edadNum) && edadNum < LIMITES_EDAD.MAYORIA
}

/**
 * Determina el tipo de inscripción según la edad
 * @param {number} edad - Edad del atleta
 * @returns {string}
 */
export const determinarTipoInscripcion = (edad) => {
  return esMenorDeEdad(edad) ? TIPOS_INSCRIPCION.MENOR_EDAD : TIPOS_INSCRIPCION.MAYOR_EDAD
}

/**
 * Valida todos los datos de una inscripción completa
 * @param {Object} datos - Datos de la inscripción
 * @returns {Object} { valido: boolean, errores: Object }
 */
export const validarInscripcionCompleta = (datos) => {
  const errores = {}
  const { persona, atleta, inscripcion } = datos || {}

  // Validar persona
  if (!persona?.firts_name?.trim()) {
    errores.firts_name = MENSAJES_ERROR.NOMBRE_REQUERIDO
  } else if (persona.firts_name.trim().length < LIMITES_TEXTO.NOMBRE_MIN) {
    errores.firts_name = MENSAJES_ERROR.NOMBRE_MUY_CORTO
  }

  if (!persona?.last_name?.trim()) {
    errores.last_name = MENSAJES_ERROR.APELLIDO_REQUERIDO
  } else if (persona.last_name.trim().length < LIMITES_TEXTO.NOMBRE_MIN) {
    errores.last_name = MENSAJES_ERROR.APELLIDO_MUY_CORTO
  }

  if (!persona?.identification) {
    errores.identification = MENSAJES_ERROR.CEDULA_REQUERIDA
  } else if (!validarCedula(persona.identification)) {
    errores.identification = MENSAJES_ERROR.CEDULA_INVALIDA
  }

  if (persona?.phono && !validarTelefono(persona.phono)) {
    errores.phono = MENSAJES_ERROR.TELEFONO_INVALIDO
  }

  // Validar atleta
  if (!atleta?.fecha_nacimiento) {
    errores.fecha_nacimiento = MENSAJES_ERROR.FECHA_NACIMIENTO_REQUERIDA
  } else {
    const edad = calcularEdad(atleta.fecha_nacimiento)
    if (edad === null || !validarEdad(edad)) {
      errores.fecha_nacimiento = MENSAJES_ERROR.EDAD_FUERA_RANGO
    }
  }

  if (!atleta?.sexo) {
    errores.sexo = MENSAJES_ERROR.SEXO_REQUERIDO
  }

  // Validar representante (solo para menores)
  const edad = atleta?.edad || calcularEdad(atleta?.fecha_nacimiento)
  if (esMenorDeEdad(edad)) {
    if (!atleta?.nombre_representante?.trim()) {
      errores.nombre_representante = MENSAJES_ERROR.NOMBRE_REPRESENTANTE_REQUERIDO
    } else if (atleta.nombre_representante.trim().length < LIMITES_TEXTO.PARENTESCO_MIN) {
      errores.nombre_representante = MENSAJES_ERROR.NOMBRE_REPRESENTANTE_MUY_CORTO
    }

    if (!atleta?.cedula_representante) {
      errores.cedula_representante = MENSAJES_ERROR.CEDULA_REPRESENTANTE_REQUERIDA
    } else if (!validarCedula(atleta.cedula_representante)) {
      errores.cedula_representante = MENSAJES_ERROR.CEDULA_REPRESENTANTE_INVALIDA
    }

    if (!atleta?.parentesco_representante?.trim()) {
      errores.parentesco_representante = MENSAJES_ERROR.PARENTESCO_REQUERIDO
    }

    if (!atleta?.telefono_representante) {
      errores.telefono_representante = MENSAJES_ERROR.TELEFONO_REPRESENTANTE_REQUERIDO
    } else if (!validarTelefono(atleta.telefono_representante)) {
      errores.telefono_representante = MENSAJES_ERROR.TELEFONO_REPRESENTANTE_INVALIDO
    }

    if (atleta?.correo_representante && !validarEmail(atleta.correo_representante)) {
      errores.correo_representante = MENSAJES_ERROR.EMAIL_REPRESENTANTE_INVALIDO
    }
  }

  // Validar inscripción
  if (!inscripcion?.fecha_inscripcion) {
    errores.fecha_inscripcion = MENSAJES_ERROR.FECHA_INSCRIPCION_REQUERIDA
  } else {
    // Validar que la fecha de inscripción no sea futura (sincronizado con backend)
    const fechaInscripcion = new Date(inscripcion.fecha_inscripcion)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (fechaInscripcion > hoy) {
      errores.fecha_inscripcion = MENSAJES_ERROR.FECHA_INSCRIPCION_FUTURA
    }
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}

// ============================================================================
// FUNCIONES DE PARSEO DE RESPUESTAS DEL BACKEND
// ============================================================================

/**
 * Parsea la respuesta del backend y extrae el mensaje amigable
 * El backend envía: { msg, data, code, status }
 * @param {Object} response - Respuesta del backend
 * @returns {Object} { mensaje, data, esExito }
 */
export const parsearRespuestaBackend = (response) => {
  // Manejar respuesta directa del axios
  const data = response?.data || response

  // Extraer campos del nuevo formato
  const msg = data?.msg || data?.message || data?.detail || ''
  const responseData = data?.data
  const code = data?.code || response?.status
  const status = data?.status

  // Determinar si es éxito
  const esExito = status === 'success' || (code >= 200 && code < 300)

  // Convertir mensaje técnico a amigable si es necesario
  const mensaje = convertirMensajeAmigable(msg, code, esExito)

  return {
    mensaje,
    data: responseData,
    esExito,
    code,
  }
}

/**
 * Parsea errores del backend y devuelve un mensaje amigable
 * @param {Error} error - Error de axios o similar
 * @returns {Object} { mensaje, fieldErrors, code }
 */
export const parsearErrorBackend = (error) => {
  // Si no hay error, retornar genérico
  if (!error) {
    return {
      mensaje: MENSAJES_ERROR.ERROR_SERVIDOR,
      fieldErrors: {},
      code: 500,
    }
  }

  // Error de conexión (sin respuesta)
  if (!error.response) {
    return {
      mensaje: MENSAJES_ERROR.ERROR_CONEXION,
      fieldErrors: {},
      code: 0,
    }
  }

  const { data, status } = error.response
  const fieldErrors = {}

  // Extraer mensaje del nuevo formato del backend
  let mensaje = data?.msg || data?.message || data?.detail || ''
  
  // Si hay errores de campo específicos, extraerlos
  if (data?.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, errors]) => {
      fieldErrors[field] = Array.isArray(errors) ? errors[0] : errors
    })
  }

  // Si el mensaje está vacío, usar mensaje genérico según código
  if (!mensaje) {
    mensaje = CODIGO_A_MENSAJE[status] || MENSAJES_ERROR.ERROR_SERVIDOR
  }

  // Convertir mensaje técnico a amigable
  mensaje = convertirMensajeAmigable(mensaje, status, false)

  return {
    mensaje,
    fieldErrors,
    code: status,
  }
}

/**
 * Convierte un mensaje técnico del backend a uno amigable para el usuario.
 * Detecta patrones comunes de error y los reemplaza con mensajes comprensibles.
 * 
 * @param {string} mensaje - Mensaje técnico del backend
 * @param {number} code - Código HTTP de la respuesta
 * @param {boolean} esExito - Indica si es un mensaje de éxito
 * @returns {string} Mensaje amigable para mostrar al usuario
 */
export const convertirMensajeAmigable = (mensaje, code, esExito = false) => {
  if (!mensaje) {
    return esExito ? MENSAJES_EXITO.CREAR : MENSAJES_ERROR.ERROR_SERVIDOR
  }

  const mensajeLower = mensaje.toLowerCase()

  // Detectar errores de servidor (código 500) - mensaje genérico amigable
  if (code >= 500) {
    return MENSAJES_ERROR.ERROR_SERVIDOR
  }

  // Detectar y reemplazar mensajes técnicos comunes
  if (mensajeLower.includes('ya se encuentra registrado') || 
      mensajeLower.includes('ya tiene una inscripción activa') ||
      mensajeLower.includes('ya existe') ||
      mensajeLower.includes('duplicate') ||
      mensajeLower.includes('unique constraint')) {
    return MENSAJES_ERROR.CEDULA_DUPLICADA
  }

  if (mensajeLower.includes('not found') || mensajeLower.includes('no encontrad')) {
    return MENSAJES_ERROR.ERROR_NO_ENCONTRADO
  }

  if (mensajeLower.includes('permission') || mensajeLower.includes('permiso')) {
    return MENSAJES_ERROR.ERROR_PERMISOS
  }

  if (mensajeLower.includes('connection') || mensajeLower.includes('conexión') ||
      mensajeLower.includes('timeout') || mensajeLower.includes('network')) {
    return MENSAJES_ERROR.ERROR_CONEXION
  }

  // Limpiar prefijos técnicos comunes que podrían venir del backend
  if (mensajeLower.includes('validation') || mensajeLower.includes('validación')) {
    // Si es un error de validación, limpiar el prefijo pero mantener el mensaje
    mensaje = mensaje
      .replace(/^error de validación:\s*/i, '')
      .replace(/^validation error:\s*/i, '')
  }

  // Limpiar formato técnico (corchetes, comillas, prefijos de error)
  let mensajeLimpio = mensaje
    .replace(/^\["?|"?\]$/g, '')
    .replace(/^\['|'\]$/g, '')
    .replace(/^error:\s*/i, '')
    .replace(/^error interno backend:\s*/i, '')
    .replace(/^ocurrió un error al procesar/i, 'Error al procesar')
    .trim()

  // Capitalizar primera letra
  if (mensajeLimpio.length > 0) {
    mensajeLimpio = mensajeLimpio.charAt(0).toUpperCase() + mensajeLimpio.slice(1)
  }

  return mensajeLimpio || (esExito ? MENSAJES_EXITO.CREAR : MENSAJES_ERROR.ERROR_SERVIDOR)
}

/**
 * Obtiene un mensaje de toast apropiado según la acción y resultado
 * @param {string} accion - 'crear', 'actualizar', 'habilitar', 'deshabilitar'
 * @param {boolean} esExito - Si la operación fue exitosa
 * @param {string} mensajeBackend - Mensaje del backend (opcional)
 * @returns {string}
 */
export const obtenerMensajeToast = (accion, esExito, mensajeBackend = '') => {
  if (esExito) {
    const mensajesExito = {
      crear: MENSAJES_EXITO.CREAR,
      actualizar: MENSAJES_EXITO.ACTUALIZAR,
      habilitar: MENSAJES_EXITO.HABILITAR,
      deshabilitar: MENSAJES_EXITO.DESHABILITAR,
      eliminar: MENSAJES_EXITO.ELIMINAR,
    }
    return mensajesExito[accion] || mensajeBackend || 'Operación exitosa'
  }

  // Si es error, usar mensaje del backend convertido a amigable
  return mensajeBackend || MENSAJES_ERROR.ERROR_SERVIDOR
}

export default {
  TIPOS_INSCRIPCION,
  LIMITES_EDAD,
  LIMITES_TEXTO,
  TIPOS_SANGRE,
  SEXOS_VALIDOS,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  validarTexto,
  validarSoloLetras,
  validarSoloNumeros,
  validarCedula,
  validarCedulaDetallado,
  validarTelefono,
  validarEmail,
  calcularEdad,
  validarEdad,
  esMenorDeEdad,
  determinarTipoInscripcion,
  validarInscripcionCompleta,
  parsearRespuestaBackend,
  parsearErrorBackend,
  convertirMensajeAmigable,
  obtenerMensajeToast,
}
