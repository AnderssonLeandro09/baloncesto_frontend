/**
 * Servicio para gestión de Estudiantes de Vinculación
 * Conecta con el endpoint /api/v1/estudiantes-vinculacion del backend
 * 
 * Formato de respuesta del backend:
 * { msg: string, data: any, code: number, status: 'success' | 'error' }
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'
import { getEstudianteFriendlyMessage, getFieldLabel } from '../utils/estudianteVinculacionValidators'

/**
 * Procesa la respuesta exitosa del backend
 * @param {Object} response - Respuesta de axios
 * @returns {Object} Datos procesados
 */
const processResponse = (response) => {
  const { data } = response

  // El backend ahora envía { msg, data, code, status }
  if (data && typeof data === 'object' && 'status' in data) {
    return {
      success: data.status === 'success',
      message: data.msg || '',
      data: data.data,
      code: data.code
    }
  }

  // Fallback para respuestas antiguas
  return {
    success: true,
    message: '',
    data: data,
    code: response.status
  }
}

/**
 * Detecta si un mensaje de error indica cédula duplicada
 * @param {string} message - Mensaje de error
 * @returns {boolean}
 */
const isDuplicateCedulaError = (message) => {
  if (!message) return false
  const lowerMessage = message.toLowerCase()
  return (
    lowerMessage.includes('ya existe un estudiante') ||
    lowerMessage.includes('registrado con esta cédula') ||
    lowerMessage.includes('ya esta registrada') ||
    lowerMessage.includes('already registered') ||
    lowerMessage.includes('cédula duplicada') ||
    lowerMessage.includes('cedula duplicada')
  )
}

/**
 * Procesa errores del backend y extrae información útil
 * @param {Error} error - Error de axios
 * @returns {Object} Error procesado con detalles
 */
const processError = (error) => {
  // Error de red o sin respuesta
  if (!error.response) {
    return {
      success: false,
      message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      data: null,
      code: 0,
      fieldErrors: {}
    }
  }

  const { data, status } = error.response

  // Procesar respuesta con formato { msg, data, code, status }
  if (data && typeof data === 'object' && 'status' in data) {
    const fieldErrors = {}
    let mainMessage = data.msg || 'Ocurrió un error'

    // Detectar error de cédula duplicada y asignar al campo identification
    if (isDuplicateCedulaError(mainMessage) || isDuplicateCedulaError(String(data.data))) {
      fieldErrors.identification = 'Ya existe un estudiante registrado con esta cédula'
      mainMessage = 'Ya existe un estudiante registrado con esta cédula'
    }

    // Si data.data contiene errores de campo
    if (data.data && typeof data.data === 'object' && !isDuplicateCedulaError(mainMessage)) {
      // Procesar errores de campos anidados (persona, estudiante)
      Object.entries(data.data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fieldErrors[key] = value.join('. ')
        } else if (typeof value === 'object' && value !== null) {
          // Errores anidados (ej: persona.identification)
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            const fullKey = `${key}.${nestedKey}`
            fieldErrors[nestedKey] = Array.isArray(nestedValue) 
              ? nestedValue.join('. ') 
              : String(nestedValue)
          })
        } else if (typeof value === 'string') {
          fieldErrors[key] = value
        }
      })
    }

    // Generar mensaje amigable
    if (Object.keys(fieldErrors).length > 0 && !isDuplicateCedulaError(mainMessage)) {
      const firstField = Object.keys(fieldErrors)[0]
      const firstError = fieldErrors[firstField]
      const fieldLabel = getFieldLabel(firstField)
      mainMessage = `${fieldLabel}: ${firstError}`
    }

    return {
      success: false,
      message: getEstudianteFriendlyMessage(mainMessage),
      data: data.data,
      code: data.code || status,
      fieldErrors
    }
  }

  // Procesar errores de validación de Django REST Framework
  if (data && typeof data === 'object') {
    const fieldErrors = {}
    let errorMessages = []

    // Verificar primero si es un error de cédula duplicada
    const dataStr = JSON.stringify(data)
    if (isDuplicateCedulaError(dataStr)) {
      fieldErrors.identification = 'Ya existe un estudiante registrado con esta cédula'
      return {
        success: false,
        message: 'Ya existe un estudiante registrado con esta cédula',
        data: null,
        code: status,
        fieldErrors
      }
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'detail') {
        errorMessages.push(String(value))
      } else if (Array.isArray(value)) {
        fieldErrors[key] = value.join('. ')
        errorMessages.push(`${getFieldLabel(key)}: ${value.join('. ')}`)
      } else if (typeof value === 'object' && value !== null) {
        // Errores anidados
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          const errorText = Array.isArray(nestedValue) 
            ? nestedValue.join('. ') 
            : String(nestedValue)
          fieldErrors[nestedKey] = errorText
          errorMessages.push(`${getFieldLabel(nestedKey)}: ${errorText}`)
        })
      } else {
        fieldErrors[key] = String(value)
        errorMessages.push(`${getFieldLabel(key)}: ${value}`)
      }
    })

    return {
      success: false,
      message: getEstudianteFriendlyMessage(errorMessages[0] || 'Error de validación'),
      data: null,
      code: status,
      fieldErrors
    }
  }

  // Error genérico
  return {
    success: false,
    message: getEstudianteFriendlyMessage(`Error ${status}: ${error.message}`),
    data: null,
    code: status,
    fieldErrors: {}
  }
}

const EstudianteVinculacionService = {
  /**
   * Obtener todos los estudiantes de vinculación
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.ESTUDIANTES_VINCULACION, { params })
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Obtener un estudiante por ID
   * @param {number} id - ID del estudiante
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.ESTUDIANTES_VINCULACION}${id}/`)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Crear un nuevo estudiante de vinculación
   * @param {Object} data - Datos del estudiante
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ESTUDIANTES_VINCULACION, data)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Actualizar un estudiante existente
   * @param {number} id - ID del estudiante
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.ESTUDIANTES_VINCULACION}${id}/`, data)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Eliminar un estudiante
   * @param {number} id - ID del estudiante
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.ESTUDIANTES_VINCULACION}${id}/`)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Buscar estudiantes por carrera
   * @param {string} carrera - Nombre de la carrera
   */
  getByCarrera: async (carrera) => {
    try {
      const response = await apiClient.get(ENDPOINTS.ESTUDIANTES_VINCULACION, { params: { carrera } })
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Toggle del estado de un estudiante (habilitar/deshabilitar)
   * @param {number} id - ID del estudiante
   * @returns {Promise<Object>} Estudiante actualizado
   */
  toggleEstado: async (id) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ESTUDIANTES_VINCULACION}${id}/toggle-estado/`, {})
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },
}

export default EstudianteVinculacionService
