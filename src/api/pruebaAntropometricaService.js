/**
 * Servicio para gestión de Pruebas Antropométricas
 * Conecta con el endpoint /api/v1/pruebas-antropometricas del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const PruebaAntropometricaService = {
  /**
   * Obtener todas las pruebas antropométricas
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.PRUEBAS_ANTROPOMETRICAS, { params })
    return response.data
  },

  /**
   * Obtener una prueba por ID
   * @param {number} id - ID de la prueba
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/${id}`)
    return response.data
  },

  /**
   * Crear una nueva prueba antropométrica
   * @param {Object} data - Datos de la prueba
   */
  create: async (data) => {
    const response = await apiClient.post(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/`, data)
    return response.data
  },

  /**
   * Actualizar una prueba existente
   * @param {number} id - ID de la prueba
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar una prueba
   * @param {number} id - ID de la prueba
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/${id}`)
    return response.data
  },

  /**
   * Obtener pruebas por atleta
   * @param {number} atletaId - ID del atleta
   */
  getByAtleta: async (atletaId) => {
    const response = await apiClient.get(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/atleta/${atletaId}/`)
    return response.data
  },

  /**
   * Cambiar estado de una prueba
   * @param {number} id - ID de la prueba
   */
  toggleEstado: async (id) => {
    const response = await apiClient.patch(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/${id}/toggle-estado/`)
    return response.data
  },

  /**
   * Compartir reporte por email
   * @param {number} id - ID de la prueba
   * @param {Object} data - Datos del reporte (email, etc.)
   */
  shareReport: async (id, data) => {
    const response = await apiClient.post(`${ENDPOINTS.PRUEBAS_ANTROPOMETRICAS}/${id}/share-report/`, data)
    return response.data
  },
}

export default PruebaAntropometricaService
