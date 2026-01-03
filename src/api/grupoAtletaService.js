/**
 * Servicio para gestión de Grupos de Atletas
 * Conecta con el endpoint /api/v1/grupos-atletas del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const GrupoAtletaService = {
  /**
   * Obtener todos los grupos
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.GRUPOS_ATLETAS, { params })
    return response.data
  },

  /**
   * Obtener un grupo por ID
   * @param {number} id - ID del grupo
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo grupo
   * @param {Object} data - Datos del grupo
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.GRUPOS_ATLETAS, data)
    return response.data
  },

  /**
   * Actualizar un grupo existente
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un grupo
   * @param {number} id - ID del grupo
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}`)
    return response.data
  },

  /**
   * Obtener atletas de un grupo
   * @param {number} id - ID del grupo
   */
  getAtletas: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}/atletas`)
    return response.data
  },
}

export default GrupoAtletaService
