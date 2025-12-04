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
    const response = await apiClient.get(ENDPOINTS.PRUEBAS_FISICAS, { params })
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
   * Crear una nueva prueba física
   * @param {Object} data - Datos de la prueba
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.PRUEBAS_FISICAS, data)
    return response.data
  },

  /**
   * Actualizar una prueba existente
   * @param {number} id - ID de la prueba
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.PRUEBAS_FISICAS}/${id}`, data)
    return response.data
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
