/**
 * Servicio para gestión de Grupos de Atletas
 * Conecta con el endpoint /api/v1/grupos-atletas del backend
 * 
 * Formato de respuesta del backend:
 * { msg: string, data: any, code: number, status: 'success' | 'error' }
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

/**
 * Procesa la respuesta del backend con el nuevo formato estandarizado
 * @param {Object} response - Respuesta de axios
 * @returns {Object} Datos procesados con estructura { success, data, message, errors }
 */
const processResponse = (response) => {
  const { msg, data, status } = response.data || {}
  
  return {
    success: status === 'success',
    data: data,
    message: msg || '',
    errors: status === 'error' && typeof data === 'object' ? data : null
  }
}

/**
 * Procesa errores de la API
 * @param {Error} error - Error de axios
 * @returns {Object} Estructura de error normalizada
 */
const processError = (error) => {
  const responseData = error.response?.data || {}
  const { msg, data, code } = responseData

  return {
    success: false,
    data: null,
    message: msg || 'Ocurrió un error inesperado',
    errors: typeof data === 'object' ? data : null,
    code: code || error.response?.status
  }
}

const GrupoAtletaService = {
  /**
   * Obtener grupos del entrenador autenticado
   * El backend filtra automáticamente por el entrenador desde el JWT
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}`, { params })
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Obtener un grupo por ID
   * Solo permite ver el grupo si el entrenador autenticado es el dueño
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}${id}`)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Crear un nuevo grupo
   * El entrenador se asigna automáticamente desde el JWT
   * @param {Object} data - Datos del grupo (nombre, categoria, rango_edad, atletas)
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.GRUPOS_ATLETAS}/`, data)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Actualizar un grupo existente
   * Solo permite actualizar si el entrenador autenticado es el dueño
   * No se puede cambiar el entrenador asignado
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}/`, data)
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Eliminar un grupo
   * Solo permite eliminar si el entrenador autenticado es el dueño
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} { success, data, message }
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}/`)
      // Para DELETE exitoso, el backend devuelve 204 que puede no tener body
      if (response.status === 204) {
        return { success: true, data: null, message: 'Grupo eliminado correctamente', errors: null }
      }
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },

  /**
   * Toggle del estado de un grupo (habilitar/deshabilitar)
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  toggleEstado: async (id) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}/toggle-estado/`, {})
      return processResponse(response)
    } catch (error) {
      return processError(error)
    }
  },
}

export default GrupoAtletaService
