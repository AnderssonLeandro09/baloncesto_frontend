/**
 * Servicio para gestión de Entrenadores
 * Conecta con el endpoint /api/v1/entrenadores del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const EntrenadorService = {
  /**
   * Obtener todos los entrenadores
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ENTRENADORES, { params })
    return response.data
  },

  /**
   * Obtener un entrenador por ID
   * @param {number} id - ID del entrenador
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.ENTRENADORES}${id}/`)
    return response.data
  },

  /**
   * Crear un nuevo entrenador
   * @param {Object} data - Datos del entrenador
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.ENTRENADORES, data)
    return response.data
  },

  /**
   * Actualizar un entrenador existente
   * @param {number} id - ID del entrenador
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.ENTRENADORES}${id}/`, data)
    return response.data
  },

  /**
   * Eliminar un entrenador
   * @param {number} id - ID del entrenador
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.ENTRENADORES}${id}/`)
    return response.data
  },

  /**
   * Obtener grupos asignados a un entrenador
   * @param {number} id - ID del entrenador
   */
  getGrupos: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.ENTRENADORES}${id}/grupos/`)
    return response.data
  },

  /**
   * Asignar grupo a entrenador
   * @param {number} entrenadorId - ID del entrenador
   * @param {number} grupoId - ID del grupo
   */
  asignarGrupo: async (entrenadorId, grupoId) => {
    const response = await apiClient.post(`${ENDPOINTS.ENTRENADORES}${entrenadorId}/asignar-grupo/${grupoId}/`)
    return response.data
  },
}

export default EntrenadorService
