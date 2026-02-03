/**
 * Mensajes de error estandarizados que coinciden con el backend
 * Espeja la estructura de basketball/constants/messages.py
 */

export const ERROR_MESSAGES = {
  // Errores generales
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  INVALID_INPUT_DATA: 'Datos de entrada inválidos',
  INVALID_ID: 'ID inválido',
  UNAUTHORIZED: 'No autorizado',

  // Errores de entrenador
  ENTRENADOR_NOT_FOUND: 'Entrenador no encontrado',
  ENTRENADOR_ALREADY_EXISTS: 'Ya existe un entrenador con ese external',
  ENTRENADOR_PERSONA_DATA_REQUIRED: 'Datos de persona son obligatorios',
  ENTRENADOR_ESPECIALIDAD_REQUIRED: 'especialidad y club_asignado son obligatorios',
  ENTRENADOR_EMAIL_REQUIRED: 'Email es obligatorio',
  ENTRENADOR_PASSWORD_REQUIRED: 'Password es obligatorio',
  ENTRENADOR_EXTERNAL_NOT_RETURNED: 'El módulo de usuarios no retornó external_id',
  ENTRENADOR_EXTERNAL_IN_USE: 'El external_id retornado ya está en uso por otro entrenador',

  // Errores de prueba antropométrica
  PRUEBA_ANTROPOMETRICA_NOT_FOUND: 'Prueba antropométrica no encontrada',
  NO_PERMISSION_TO_MODIFY: 'No tiene permiso para modificar esta prueba',

  // Errores de prueba física
  PRUEBA_FISICA_NOT_FOUND: 'Prueba física no encontrada',
  NO_PERMISSION_TO_REGISTER: 'No tiene permiso para registrar pruebas a este atleta',

  // Errores de atleta
  ATLETA_NOT_FOUND: 'El atleta no existe',
  ATLETA_NO_ACTIVE_INSCRIPTION: 'El atleta no tiene inscripción habilitada',
}

export const SUCCESS_MESSAGES = {
  CREATED_SUCCESSFULLY: 'Creado exitosamente',
  UPDATED_SUCCESSFULLY: 'Actualizado exitosamente',
  DELETED_SUCCESSFULLY: 'Eliminado exitosamente',
  OPERATION_SUCCESSFUL: 'Operación exitosa',
}

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_FORMAT: 'Formato inválido',
  VALUE_TOO_LOW: 'El valor es demasiado bajo',
  VALUE_TOO_HIGH: 'El valor es demasiado alto',
  INVALID_DATE_RANGE: 'Rango de fechas inválido',
}

/**
 * Resuelve mensajes de error desde respuesta del backend
 * @param {Error} error - Error de axios o similar
 * @returns {string} Mensaje de error a mostrar
 */
export const resolveBackendError = (error) => {
  const data = error?.response?.data

  // Si es string directo
  if (typeof data === 'string') return data

  // Si es un objeto con propiedades de error
  if (data?.error) return data.error
  if (data?.message) return data.message
  if (data?.detail) return data.detail

  // Si tiene múltiples errores (validaciones)
  if (data?.errors && typeof data.errors === 'object') {
    const errorMessages = Object.entries(data.errors)
      .map(([key, value]) => {
        if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
        return `${key}: ${value}`
      })
      .filter(Boolean)
    if (errorMessages.length > 0) return errorMessages.join('; ')
  }

  // Error de validación de Django en formato de lista
  if (Array.isArray(data)) {
    const messages = data.filter(e => typeof e === 'string')
    return messages.length > 0 ? messages.join('; ') : 'Error en validación'
  }

  // Fallback con más detalles
  console.error('Error no manejado:', error)
  return error?.message || 'Ocurrió un error inesperado'
}

/**
 * Categoriza un error para determinar si es de validación o del servidor
 * @param {Error} error - Error de axios
 * @returns {Object} { type: 'validation'|'server'|'network', message: string, statusCode: number }
 */
export const categorizeError = (error) => {
  if (!error?.response) {
    return {
      type: 'network',
      message: 'No se pudo conectar con el servidor',
      statusCode: null,
    }
  }

  const { status, data } = error.response

  // Errores de validación
  if (status === 400) {
    return {
      type: 'validation',
      message: resolveBackendError(error),
      statusCode: status,
    }
  }

  // Errores de autorización
  if (status === 401 || status === 403) {
    return {
      type: 'auth',
      message: 'No tienes permiso para realizar esta acción',
      statusCode: status,
    }
  }

  // Recurso no encontrado
  if (status === 404) {
    return {
      type: 'notfound',
      message: 'El recurso solicitado no existe',
      statusCode: status,
    }
  }

  // Errores del servidor
  if (status >= 500) {
    return {
      type: 'server',
      message: 'Error en el servidor. Intenta de nuevo más tarde',
      statusCode: status,
    }
  }

  return {
    type: 'server',
    message: resolveBackendError(error),
    statusCode: status,
  }
}
