/**
 * Servicio para gestión de Grupos de Atletas
 * Conecta con el endpoint /api/v1/grupos-atletas del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const GrupoAtletaService = {
  /**
   * Obtener grupos del entrenador autenticado
   * El backend filtra automáticamente por el entrenador desde el JWT
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Array>} Lista de grupos del entrenador autenticado
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}`, { params })
    return response.data
  },

  /**
   * Obtener un grupo por ID
   * Solo permite ver el grupo si el entrenador autenticado es el dueño
   * @param {number} id - ID del grupo
   * @returns {Promise<Object>} Datos del grupo
   * @throws {403} Si el entrenador no es el dueño del grupo
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}${id}`)
    return response.data
  },

  /**
   * Crear un nuevo grupo
   * El entrenador se asigna automáticamente desde el JWT
   * @param {Object} data - Datos del grupo (nombre, categoria, rango_edad, atletas)
   * @returns {Promise<Object>} Grupo creado
   */
  create: async (data) => {
    const response = await apiClient.post(`${ENDPOINTS.GRUPOS_ATLETAS}/`, data)
    return response.data
  },

  /**
   * Actualizar un grupo existente
   * Solo permite actualizar si el entrenador autenticado es el dueño
   * No se puede cambiar el entrenador asignado
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Grupo actualizado
   * @throws {403} Si el entrenador no es el dueño del grupo
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.GRUPOS_ATLETAS}/${id}/`, data)
    return response.data
  },

  /**
   * Eliminar un grupo
   * Solo permite eliminar si el entrenador autenticado es el dueño
   * @param {number} id - ID del grupo
   * @returns {Promise<void>}
   * @throws {403} Si el entrenador no es el dueño del grupo
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.GRUPOS_ATLETAS}${id}/`)
    return response.data
  },

  /**
   * Obtener atletas elegibles para un grupo específico
   * @param {number} grupoId - ID del grupo
   */
  getAtletasElegibles: async (grupoId) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}${grupoId}/atletas-elegibles/`)
    return response.data
  },

  /**
   * Obtener atletas elegibles por rango de edad
   * @param {Object} params - Parámetros con min_edad y max_edad
   */
  getAtletasElegiblesPorEdad: async (params = {}) => {
    const response = await apiClient.get(`${ENDPOINTS.GRUPOS_ATLETAS}atletas-elegibles/`, { params })
    return response.data
  },
}

export default GrupoAtletaService
