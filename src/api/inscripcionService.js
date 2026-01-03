/**
 * Servicio para gestión de Inscripciones
 * Conecta con el endpoint /api/v1/inscripciones del backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

const InscripcionService = {
  /**
   * Obtener todas las inscripciones
   * @param {Object} params - Parámetros de filtro y paginación
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.INSCRIPCIONES, { params })
    return response.data
  },

  /**
   * Obtener una inscripción por ID
   * @param {number} id - ID de la inscripción
   */
  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}/${id}`)
    return response.data
  },

  /**
   * Crear una nueva inscripción
   * @param {Object} data - Datos de la inscripción
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.INSCRIPCIONES, data)
    return response.data
  },

  /**
   * Actualizar una inscripción existente
   * @param {number} id - ID de la inscripción
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    const response = await apiClient.put(`${ENDPOINTS.INSCRIPCIONES}/${id}`, data)
    return response.data
  },

  /**
   * Eliminar una inscripción
   * @param {number} id - ID de la inscripción
   */
  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINTS.INSCRIPCIONES}/${id}`)
    return response.data
  },

  /**
   * Habilitar una inscripción
   * @param {number} id - ID de la inscripción
   */
  habilitar: async (id) => {
    const response = await apiClient.post(`${ENDPOINTS.INSCRIPCIONES}/${id}/habilitar`)
    return response.data
  },

  /**
   * Deshabilitar una inscripción
   * @param {number} id - ID de la inscripción
   */
  deshabilitar: async (id) => {
    const response = await apiClient.post(`${ENDPOINTS.INSCRIPCIONES}/${id}/deshabilitar`)
    return response.data
  },
}

export default InscripcionService
