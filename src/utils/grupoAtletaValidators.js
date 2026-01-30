/**
 * Validadores específicos para Grupo de Atletas
 * Estas validaciones replican las del backend para una doble capa de seguridad
 * Backend: basketball/serializar/grupo_atleta.py
 */

/**
 * Constantes de validación para Grupo de Atletas
 * Debe coincidir con las validaciones del backend (serializar/grupo_atleta.py)
 */
export const GRUPO_ATLETA_CONSTRAINTS = {
  nombre: {
    minLength: 3,
    maxLength: 100
  },
  categoria: {
    minLength: 5,
    maxLength: 30
  },
  edad: {
    min: 10,
    max: 50
  },
  atletas: {
    maxCount: 100,
    minId: 1,
    maxId: 999999999
  }
}

/**
 * Valida el nombre del grupo
 * @param {string} nombre - Nombre del grupo
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoNombre = (nombre) => {
  if (!nombre || typeof nombre !== 'string') {
    return { valid: false, message: 'El nombre es obligatorio' }
  }
  
  const trimmed = nombre.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, message: 'El nombre no puede estar vacío' }
  }
  
  if (trimmed.length < GRUPO_ATLETA_CONSTRAINTS.nombre.minLength) {
    return { 
      valid: false, 
      message: `El nombre debe tener al menos ${GRUPO_ATLETA_CONSTRAINTS.nombre.minLength} caracteres` 
    }
  }
  
  if (trimmed.length > GRUPO_ATLETA_CONSTRAINTS.nombre.maxLength) {
    return { 
      valid: false, 
      message: `El nombre no puede exceder ${GRUPO_ATLETA_CONSTRAINTS.nombre.maxLength} caracteres` 
    }
  }
  
  return { valid: true }
}

/**
 * Valida la categoría del grupo
 * @param {string} categoria - Categoría del grupo
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoCategoria = (categoria) => {
  if (!categoria || typeof categoria !== 'string') {
    return { valid: false, message: 'La categoría es obligatoria' }
  }
  
  const trimmed = categoria.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, message: 'La categoría no puede estar vacía' }
  }
  
  if (trimmed.length < GRUPO_ATLETA_CONSTRAINTS.categoria.minLength) {
    return { 
      valid: false, 
      message: `La categoría debe tener al menos ${GRUPO_ATLETA_CONSTRAINTS.categoria.minLength} caracteres` 
    }
  }
  
  if (trimmed.length > GRUPO_ATLETA_CONSTRAINTS.categoria.maxLength) {
    return { 
      valid: false, 
      message: `La categoría no puede exceder ${GRUPO_ATLETA_CONSTRAINTS.categoria.maxLength} caracteres` 
    }
  }
  
  return { valid: true }
}

/**
 * Valida la edad mínima del grupo
 * @param {number|string} edad - Edad mínima
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoEdadMinima = (edad) => {
  const numEdad = parseInt(edad, 10)
  
  if (isNaN(numEdad)) {
    return { valid: false, message: 'La edad mínima debe ser un número válido' }
  }
  
  if (numEdad < GRUPO_ATLETA_CONSTRAINTS.edad.min) {
    return { 
      valid: false, 
      message: `La edad mínima debe ser al menos ${GRUPO_ATLETA_CONSTRAINTS.edad.min} años` 
    }
  }
  
  if (numEdad > GRUPO_ATLETA_CONSTRAINTS.edad.max) {
    return { 
      valid: false, 
      message: `La edad mínima no puede ser mayor a ${GRUPO_ATLETA_CONSTRAINTS.edad.max} años` 
    }
  }
  
  return { valid: true }
}

/**
 * Valida la edad máxima del grupo
 * @param {number|string} edad - Edad máxima
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoEdadMaxima = (edad) => {
  const numEdad = parseInt(edad, 10)
  
  if (isNaN(numEdad)) {
    return { valid: false, message: 'La edad máxima debe ser un número válido' }
  }
  
  if (numEdad < GRUPO_ATLETA_CONSTRAINTS.edad.min) {
    return { 
      valid: false, 
      message: `La edad máxima debe ser al menos ${GRUPO_ATLETA_CONSTRAINTS.edad.min} años` 
    }
  }
  
  if (numEdad > GRUPO_ATLETA_CONSTRAINTS.edad.max) {
    return { 
      valid: false, 
      message: `La edad máxima no puede ser mayor a ${GRUPO_ATLETA_CONSTRAINTS.edad.max} años` 
    }
  }
  
  return { valid: true }
}

/**
 * Valida el rango de edad (edad mínima <= edad máxima)
 * @param {number|string} edadMinima - Edad mínima
 * @param {number|string} edadMaxima - Edad máxima
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoRangoEdad = (edadMinima, edadMaxima) => {
  const min = parseInt(edadMinima, 10)
  const max = parseInt(edadMaxima, 10)
  
  if (isNaN(min) || isNaN(max)) {
    return { valid: false, message: 'Las edades deben ser números válidos' }
  }
  
  if (min > max) {
    return { valid: false, message: 'La edad mínima no puede ser mayor que la edad máxima' }
  }
  
  return { valid: true }
}

/**
 * Valida la lista de IDs de atletas
 * @param {Array} atletas - Lista de IDs de atletas
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateGrupoAtletas = (atletas) => {
  if (!Array.isArray(atletas)) {
    return { valid: true } // Los atletas son opcionales
  }
  
  if (atletas.length > GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount) {
    return { 
      valid: false, 
      message: `No se pueden asignar más de ${GRUPO_ATLETA_CONSTRAINTS.atletas.maxCount} atletas` 
    }
  }
  
  for (const id of atletas) {
    const numId = parseInt(id, 10)
    if (isNaN(numId) || numId < GRUPO_ATLETA_CONSTRAINTS.atletas.minId || numId > GRUPO_ATLETA_CONSTRAINTS.atletas.maxId) {
      return { valid: false, message: `ID de atleta inválido: ${id}` }
    }
  }
  
  return { valid: true }
}

/**
 * Valida todos los campos de un grupo de atletas
 * @param {Object} data - Datos del grupo
 * @param {string} data.nombre - Nombre del grupo
 * @param {string} data.categoria - Categoría del grupo
 * @param {number|string} data.rango_edad_minima - Edad mínima
 * @param {number|string} data.rango_edad_maxima - Edad máxima
 * @param {Array} data.atletas - Lista de IDs de atletas (opcional)
 * @returns {{ valid: boolean, errors: Object }}
 */
export const validateGrupoAtleta = (data) => {
  const errors = {}
  
  // Validar nombre
  const nombreResult = validateGrupoNombre(data.nombre)
  if (!nombreResult.valid) {
    errors.nombre = nombreResult.message
  }
  
  // Validar categoría
  const categoriaResult = validateGrupoCategoria(data.categoria)
  if (!categoriaResult.valid) {
    errors.categoria = categoriaResult.message
  }
  
  // Validar edad mínima
  const edadMinimaResult = validateGrupoEdadMinima(data.rango_edad_minima)
  if (!edadMinimaResult.valid) {
    errors.rango_edad_minima = edadMinimaResult.message
  }
  
  // Validar edad máxima
  const edadMaximaResult = validateGrupoEdadMaxima(data.rango_edad_maxima)
  if (!edadMaximaResult.valid) {
    errors.rango_edad_maxima = edadMaximaResult.message
  }
  
  // Validar rango de edad (solo si ambas edades son válidas)
  if (!errors.rango_edad_minima && !errors.rango_edad_maxima) {
    const rangoResult = validateGrupoRangoEdad(data.rango_edad_minima, data.rango_edad_maxima)
    if (!rangoResult.valid) {
      errors.rango_edad_minima = rangoResult.message
    }
  }
  
  // Validar atletas
  if (data.atletas) {
    const atletasResult = validateGrupoAtletas(data.atletas)
    if (!atletasResult.valid) {
      errors.atletas = atletasResult.message
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Mensajes de error amigables para el usuario
 * Traduce errores técnicos a mensajes comprensibles
 */
export const FRIENDLY_ERROR_MESSAGES = {
  // Errores de red
  'Network Error': 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  'timeout': 'La operación tardó demasiado. Por favor, intenta de nuevo.',
  
  // Errores de autenticación
  401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  
  // Errores de validación
  400: 'Por favor, verifica los datos ingresados.',
  
  // Errores del servidor
  500: 'Ocurrió un error en el servidor. Por favor, intenta más tarde.',
  502: 'El servidor no está disponible temporalmente.',
  503: 'El servicio no está disponible. Por favor, intenta más tarde.',
  
  // Errores específicos de grupos
  'Ya existe un grupo': 'Ya existe un grupo con ese nombre. Por favor, usa un nombre diferente.',
  'No tienes permiso': 'Solo puedes modificar tus propios grupos.',
  'Grupo no encontrado': 'El grupo que buscas no existe o fue eliminado.'
}

/**
 * Obtiene un mensaje de error amigable
 * @param {string|number} error - Error o código de error
 * @returns {string} Mensaje amigable
 */
export const getFriendlyErrorMessage = (error) => {
  if (typeof error === 'number') {
    return FRIENDLY_ERROR_MESSAGES[error] || 'Ocurrió un error inesperado.'
  }
  
  if (typeof error === 'string') {
    // Buscar coincidencias parciales
    for (const [key, message] of Object.entries(FRIENDLY_ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }
  }
  
  return error || 'Ocurrió un error inesperado.'
}
