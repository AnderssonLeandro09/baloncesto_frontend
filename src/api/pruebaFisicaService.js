/**
 * Servicio para gestión de Pruebas Físicas
 * Conecta con el endpoint /api/v1/pruebas-fisicas del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const PruebaFisicaService = {
  /**
   * Obtener todas las pruebas físicas
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    console.log(`${ENDPOINTS.PRUEBAS_FISICAS}`)
    const response = await apiClient.get(ENDPOINTS.PRUEBAS_FISICAS, { params })
    console.log(response)
    return response.data
  },

  /**
   * Obtener una prueba por ID
   * @param {number} id - ID de la prueba
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}`)
    return response.data
  },

  /**
   * Obtener atletas con inscripción habilitada
   */
  getAtletasHabilitados: async () => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/atletas-habilitados/`)
    return response.data
  },

  /**
   * Crear una nueva prueba física
   * @param {Object} data - Datos de la prueba
   */
  create: async (data) => {
    console.log('Service: enviando al backend:', data)
    try {
      const response = await apiClient.post(`${ENDPOINTS.PRUEBAS_FISICAS}/`, data)
      console.log('Service: respuesta del backend:', response)
      return response.data
    } catch (error) {
      console.error('Service: error detallado:', error.response?.data)
      throw error
    }
  },

  /**
   * Actualizar una prueba existente
   * @param {number} id - ID de la prueba
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    console.log('Service update: enviando al backend:', { id, data })
    try {
      const response = await apiClient.put(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}/`, data)
      console.log('Service update: respuesta del backend:', response)
      return response.data
    } catch (error) {
      console.error('Service update: error detallado:', error.response?.data)
      throw error
    }
  },

  /**
   * Eliminar una prueba
   * @param {number} id - ID de la prueba
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}`)
    return response.data
  },

  /**
   * Cambiar el estado de una prueba (activar/desactivar)
   * @param {number} id - ID de la prueba
   */
  toggleEstado: async (id) => {
    const response = await apiClient.patch(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}/toggle-estado/`)
    return response.data
  },

  /**
   * Obtener pruebas por atleta
   * @param {number} atletaId - ID del atleta
   */
  getByAtleta: async (atletaId) => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/atleta/${atletaId}`)
    return response.data
  },

  /**
   * Obtener pruebas por tipo
   * @param {string} tipo - Tipo de prueba
   */
  getByTipo: async (tipo) => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_FISICAS}/tipo/${tipo}`)
    return response.data
  },
}

export default PruebaFisicaService
