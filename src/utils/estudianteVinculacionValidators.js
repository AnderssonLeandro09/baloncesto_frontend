/**
 * Validadores específicos para Estudiante de Vinculación
 * Estas validaciones replican las del backend para una doble capa de seguridad
 * 
 * Backend: basketball/serializar/estudiante_vinculacion.py
 *          basketball/serializar/persona.py
 */

// ==========================================
// CONSTANTES DE VALIDACIÓN
// ==========================================

export const ESTUDIANTE_VINCULACION_CONSTRAINTS = {
  // Datos de persona
  identification: {
    minLength: 5,
    maxLength: 15,
    pattern: /^\d+$/
  },
  first_name: {
    minLength: 2,
    maxLength: 50,
    // Letras (incluyendo tildes), espacios y apóstrofes
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/
  },
  last_name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    institutionalDomain: '@unl.edu.ec'
  },
  password: {
    minLength: 8,
    maxLength: 30,
    requireUppercase: true,
    requireNumber: true
  },
  phono: {
    minLength: 9,
    maxLength: 15,
    pattern: /^\d+$/
  },
  // Datos de estudiante
  carrera: {
    minLength: 5,
    maxLength: 100
  },
  semestre: {
    // Números del 1 al 10 o letras de la A a la J
    validOptions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  }
}

// ==========================================
// VALIDADORES INDIVIDUALES
// ==========================================

/**
 * Valida la identificación (cédula o pasaporte numérico)
 * Se ha deshabilitado la validación de Módulo 10 de Ecuador para permitir otros países
 * @param {string} value - Identificación a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateIdentification = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: 'La identificación es obligatoria' }
  }

  // Limpiar espacios y guiones
  const identification = value.replace(/[\s\-]/g, '').trim()

  if (!identification) {
    return { valid: false, message: 'La identificación es obligatoria' }
  }

  if (!/^\d+$/.test(identification)) {
    return { valid: false, message: 'La identificación debe contener solo dígitos numéricos' }
  }

  const { minLength, maxLength } = ESTUDIANTE_VINCULACION_CONSTRAINTS.identification
  if (identification.length < minLength || identification.length > maxLength) {
    return { 
      valid: false, 
      message: `La identificación debe tener entre ${minLength} y ${maxLength} dígitos` 
    }
  }

  return { valid: true }
}

/**
 * Valida el nombre
 * @param {string} value - Nombre a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateFirstName = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: 'El nombre es obligatorio' }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { valid: false, message: 'El nombre es obligatorio' }
  }

  if (trimmed.length < ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.minLength) {
    return { valid: false, message: `El nombre debe tener al menos ${ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.minLength} caracteres` }
  }

  if (trimmed.length > ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.maxLength) {
    return { valid: false, message: `El nombre no puede exceder ${ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.maxLength} caracteres` }
  }

  if (!ESTUDIANTE_VINCULACION_CONSTRAINTS.first_name.pattern.test(trimmed)) {
    return { valid: false, message: 'El nombre solo puede contener letras y espacios' }
  }

  return { valid: true }
}

/**
 * Valida el apellido
 * @param {string} value - Apellido a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateLastName = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: 'El apellido es obligatorio' }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { valid: false, message: 'El apellido es obligatorio' }
  }

  if (trimmed.length < ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.minLength) {
    return { valid: false, message: `El apellido debe tener al menos ${ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.minLength} caracteres` }
  }

  if (trimmed.length > ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.maxLength) {
    return { valid: false, message: `El apellido no puede exceder ${ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.maxLength} caracteres` }
  }

  if (!ESTUDIANTE_VINCULACION_CONSTRAINTS.last_name.pattern.test(trimmed)) {
    return { valid: false, message: 'El apellido solo puede contener letras y espacios' }
  }

  return { valid: true }
}

/**
 * Valida el email (obligatorio solo en creación)
 * @param {string} value - Email a validar
 * @param {boolean} isRequired - Si es obligatorio (modo creación)
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateEmail = (value, isRequired = true) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    if (isRequired) {
      return { valid: false, message: 'El email es obligatorio' }
    }
    return { valid: true }
  }

  const trimmed = value.trim().toLowerCase()

  if (!ESTUDIANTE_VINCULACION_CONSTRAINTS.email.pattern.test(trimmed)) {
    return { valid: false, message: 'El formato del email no es válido' }
  }

  if (!trimmed.endsWith(ESTUDIANTE_VINCULACION_CONSTRAINTS.email.institutionalDomain)) {
    return { valid: false, message: `El correo debe ser institucional (${ESTUDIANTE_VINCULACION_CONSTRAINTS.email.institutionalDomain})` }
  }

  return { valid: true }
}

/**
 * Valida la contraseña (obligatoria solo en creación)
 * @param {string} value - Contraseña a validar
 * @param {boolean} isRequired - Si es obligatorio (modo creación)
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePassword = (value, isRequired = true) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    if (isRequired) {
      return { valid: false, message: 'La contraseña es obligatoria' }
    }
    return { valid: true }
  }

  const { minLength, maxLength, requireUppercase, requireNumber } = ESTUDIANTE_VINCULACION_CONSTRAINTS.password

  if (value.length < minLength) {
    return { valid: false, message: `La contraseña debe tener al menos ${minLength} caracteres` }
  }

  if (value.length > maxLength) {
    return { valid: false, message: `La contraseña no puede exceder ${maxLength} caracteres` }
  }

  if (requireUppercase && !/[A-Z]/.test(value)) {
    return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' }
  }

  if (requireNumber && !/\d/.test(value)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' }
  }

  return { valid: true }
}

/**
 * Valida el teléfono (opcional)
 * @param {string} value - Teléfono a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePhono = (value) => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { valid: true } // El teléfono es opcional
  }

  // Limpiar caracteres comunes
  const cleaned = value.replace(/[\s\-\(\)\+]/g, '').trim()

  if (!cleaned) {
    return { valid: true }
  }

  if (!ESTUDIANTE_VINCULACION_CONSTRAINTS.phono.pattern.test(cleaned)) {
    return { valid: false, message: 'El teléfono debe contener solo dígitos numéricos' }
  }

  const { minLength, maxLength } = ESTUDIANTE_VINCULACION_CONSTRAINTS.phono
  if (cleaned.length < minLength || cleaned.length > maxLength) {
    return { valid: false, message: `El teléfono debe tener entre ${minLength} y ${maxLength} dígitos` }
  }

  return { valid: true }
}

/**
 * Valida la carrera
 * @param {string} value - Carrera a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateCarrera = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: 'La carrera es obligatoria' }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { valid: false, message: 'La carrera es obligatoria' }
  }

  if (trimmed.length < ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.minLength) {
    return { valid: false, message: `La carrera debe tener al menos ${ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.minLength} caracteres` }
  }

  if (trimmed.length > ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.maxLength) {
    return { valid: false, message: `La carrera no puede exceder ${ESTUDIANTE_VINCULACION_CONSTRAINTS.carrera.maxLength} caracteres` }
  }

  return { valid: true }
}

/**
 * Valida el semestre
 * @param {string} value - Semestre a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateSemestre = (value) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: 'El semestre es obligatorio' }
  }

  const trimmed = value.trim().toUpperCase()

  if (!trimmed) {
    return { valid: false, message: 'El semestre es obligatorio' }
  }

  if (!ESTUDIANTE_VINCULACION_CONSTRAINTS.semestre.validOptions.includes(trimmed)) {
    return { 
      valid: false, 
      message: 'Semestre inválido. Use números (1-10) o letras (A-J)' 
    }
  }

  return { valid: true }
}

// ==========================================
// VALIDACIÓN COMPLETA
// ==========================================

/**
 * Valida todos los campos de un estudiante de vinculación
 * @param {Object} data - Datos del estudiante
 * @param {boolean} isEdit - Si es modo edición (email y password no obligatorios)
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateEstudianteVinculacion = (data, isEdit = false) => {
  const errors = {}

  // Validar datos de persona
  const identificationResult = validateIdentification(data.identification)
  if (!identificationResult.valid) {
    errors.identification = identificationResult.message
  }

  const firstNameResult = validateFirstName(data.first_name)
  if (!firstNameResult.valid) {
    errors.first_name = firstNameResult.message
  }

  const lastNameResult = validateLastName(data.last_name)
  if (!lastNameResult.valid) {
    errors.last_name = lastNameResult.message
  }

  // Email y password solo son obligatorios en modo creación
  if (!isEdit) {
    const emailResult = validateEmail(data.email, true)
    if (!emailResult.valid) {
      errors.email = emailResult.message
    }

    const passwordResult = validatePassword(data.password, true)
    if (!passwordResult.valid) {
      errors.password = passwordResult.message
    }
  }

  // Teléfono es opcional
  const phonoResult = validatePhono(data.phono)
  if (!phonoResult.valid) {
    errors.phono = phonoResult.message
  }

  // Validar datos de estudiante
  const carreraResult = validateCarrera(data.carrera)
  if (!carreraResult.valid) {
    errors.carrera = carreraResult.message
  }

  const semestreResult = validateSemestre(data.semestre)
  if (!semestreResult.valid) {
    errors.semestre = semestreResult.message
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// ==========================================
// MENSAJES AMIGABLES
// ==========================================

/**
 * Mensajes de error amigables específicos para estudiante de vinculación
 */
export const ESTUDIANTE_FRIENDLY_MESSAGES = {
  'La identificación es requerida': 'Por favor, ingresa la identificación del estudiante',
  'La cédula es requerida': 'Por favor, ingresa la identificación del estudiante',
  'La identificación no es válida': 'La identificación ingresada no es válida. Por favor, verifícala',
  'La cédula no es válida': 'La identificación ingresada no es válida. Por favor, verifícala',
  'El nombre es requerido': 'Por favor, ingresa el nombre del estudiante',
  'El apellido es requerido': 'Por favor, ingresa el apellido del estudiante',
  'El email es obligatorio': 'Por favor, ingresa el correo institucional',
  'La contraseña es obligatoria': 'Por favor, ingresa una contraseña',
  'La carrera es obligatoria': 'Por favor, ingresa la carrera del estudiante',
  'El semestre es obligatorio': 'Por favor, selecciona el semestre',
  'Ya existe un estudiante de vinculación registrado con esta cédula': 'Ya existe un estudiante registrado con esta identificación',
  'ya existe un estudiante': 'Ya existe un estudiante registrado con esta identificación',
  'registrado con esta cédula': 'Ya existe un estudiante registrado con esta identificación',
  'Ya existe': 'Ya existe un estudiante con esos datos',
  'ya esta registrada': 'Esta identificación ya está registrada en el sistema',
  'already registered': 'Esta identificación ya está registrada en el sistema',
  'no encontrado': 'No se encontró el estudiante',
}

/**
 * Obtiene un mensaje amigable para errores de estudiante
 * @param {string} error - Mensaje de error
 * @returns {string} Mensaje amigable
 */
export const getEstudianteFriendlyMessage = (error) => {
  if (!error) return 'Ocurrió un error inesperado'

  // Buscar coincidencias parciales
  for (const [key, message] of Object.entries(ESTUDIANTE_FRIENDLY_MESSAGES)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message
    }
  }

  return error
}

/**
 * Traduce los nombres de campos a español
 */
export const FIELD_LABELS = {
  identification: 'Identificación',
  first_name: 'Nombre',
  last_name: 'Apellido',
  email: 'Correo electrónico',
  password: 'Contraseña',
  phono: 'Teléfono',
  direction: 'Dirección',
  carrera: 'Carrera',
  semestre: 'Semestre',
  persona: 'Datos personales',
  estudiante: 'Datos del estudiante'
}

/**
 * Obtiene la etiqueta de un campo
 * @param {string} fieldName - Nombre del campo en inglés
 * @returns {string} Etiqueta en español
 */
export const getFieldLabel = (fieldName) => {
  return FIELD_LABELS[fieldName] || fieldName
}
