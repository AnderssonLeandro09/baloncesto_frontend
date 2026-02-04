/**
 * Servicio para gestión de Pruebas Físicas
 * Conecta con el endpoint /api/v1/pruebas-fisicas del backend
 * 
 * El backend devuelve respuestas en formato: { msg, data, code, status }
 * Este servicio procesa ese formato y extrae los datos relevantes
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'
import { parsearErrorBackend, MENSAJES_ERROR } from '../utils/validacionesPruebasFisicas'

/**
 * Procesa la respuesta del backend con el nuevo formato
 * @param {Object} response - Respuesta del backend
 * @returns {Object} Datos procesados
 * @throws {Object} Error con mensaje amigable si status es 'error'
 */
const processResponse = (response) => {
  const { msg, data, code, status } = response
  
  // Si el status es 'error', lanzar excepción con mensaje amigable
  if (status === 'error') {
    const { mensaje, erroresCampos } = parsearErrorBackend({ msg, data, code, status }, code)
    const error = new Error(mensaje)
    error.fieldErrors = erroresCampos
    error.code = code
    error.originalMessage = msg
    throw error
  }
  
  // Retornar solo los datos si todo está bien
  return data
}

/**
 * Maneja errores de la API y los convierte a mensajes amigables
 * @param {Error} error - Error de axios
 * @throws {Error} Error con mensaje amigable
 */
const handleApiError = (error) => {
  // Si el error ya fue procesado por nosotros
  if (error.fieldErrors !== undefined) {
    throw error
  }
  
  // Si hay respuesta del servidor
  if (error.response?.data) {
    const { msg, data, code, status } = error.response.data
    const statusCode = error.response.status || code
    const { mensaje, erroresCampos } = parsearErrorBackend({ msg, data, code, status }, statusCode)
    
    const processedError = new Error(mensaje)
    processedError.fieldErrors = erroresCampos
    processedError.code = statusCode
    processedError.originalMessage = msg
    throw processedError
  }
  
  // Error de conexión
  if (error.request && !error.response) {
    const connectionError = new Error(MENSAJES_ERROR.ERROR_CONEXION)
    connectionError.code = 0
    throw connectionError
  }
  
  // Otros errores
  throw new Error(MENSAJES_ERROR.ERROR_SERVIDOR)
}

const PruebaFisicaService = {
  /**
   * Obtener todas las pruebas físicas
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Array>} Lista de pruebas físicas
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.PRUEBAS_FISICAS, { params })
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Obtener una prueba por ID
   * @param {number} id - ID de la prueba
   * @returns {Promise<Object>} Datos de la prueba
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Obtener atletas con inscripción habilitada
   * @returns {Promise<Array>} Lista de atletas habilitados
   */
  getAtletasHabilitados: async () => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/atletas-habilitados/`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Crear una nueva prueba física
   * @param {Object} data - Datos de la prueba
   * @returns {Promise<Object>} Prueba creada
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.PRUEBAS_FISICAS}/`, data)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Actualizar una prueba existente
   * @param {number} id - ID de la prueba
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Prueba actualizada
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}/`, data)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Eliminar una prueba
   * @param {number} id - ID de la prueba
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Cambiar el estado de una prueba (activar/desactivar)
   * @param {number} id - ID de la prueba
   * @returns {Promise<Object>} Prueba con estado actualizado
   */
  toggleEstado: async (id) => {
    try {
      const response = await apiClient.patch(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}/toggle-estado/`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Obtener pruebas por atleta
   * @param {number} atletaId - ID del atleta
   * @returns {Promise<Array>} Pruebas del atleta
   */
  getByAtleta: async (atletaId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/atleta/${atletaId}`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },

  /**
   * Obtener pruebas por tipo
   * @param {string} tipo - Tipo de prueba
   * @returns {Promise<Array>} Pruebas del tipo especificado
   */
  getByTipo: async (tipo) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/tipo/${tipo}`)
      return processResponse(response.data)
    } catch (error) {
      handleApiError(error)
    }
  },
}

export default PruebaFisicaService
