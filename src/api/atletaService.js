/**
 * Servicio para gestión de Atletas
 * Conecta con el endpoint /api/v1/atletas del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const AtletaService = {
  /**
   * Obtener todos los atletas
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ATLETAS, { params })
    return response.data
  },

  /**
   * Obtener un atleta por ID
   * @param {number} id - ID del atleta
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.ATLETAS}/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo atleta
   * @param {Object} data - Datos del atleta
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.ATLETAS, data)
    return response.data
  },

  /**
   * Actualizar un atleta existente
   * @param {number} id - ID del atleta
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.ATLETAS}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un atleta
   * @param {number} id - ID del atleta
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.ATLETAS}/${id}`)
    return response.data
  },

  /**
   * Buscar atletas por criterios
   * @param {Object} criteria - Criterios de búsqueda
   */
  search: async (criteria) => {
    const response = await apiClient.get(`${ENDPOINTS.ATLETAS}/buscar`, { params: criteria })
    return response.data
  },
}

export default AtletaService
