/**
 * Servicio para gestión de Inscripciones
 * Conecta con el endpoint /api/basketball/inscripciones del backend Django
 * 
 * ESTRUCTURA DEL PAYLOAD ESPERADA POR EL BACKEND:
 * {
 *   persona: { firts_name, last_name, identification, email, password, phono, direction },
 *   atleta: { fecha_nacimiento, edad, sexo, tipo_sangre, alergias, ... },
 *   inscripcion: { fecha_inscripcion, tipo_inscripcion }
 * }
 * 
 * SEGURIDAD:
 * - Todos los IDs se validan antes de enviar al backend
 * - Los datos sensibles se manejan solo en el backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'

// Función helper para validar IDs
const validateId = (id, entityName = 'entidad') => {
  if (id === null || id === undefined) {
    throw new Error(`ID de ${entityName} es requerido`)
  }
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  if (isNaN(numericId) || numericId <= 0) {
    throw new Error(`ID de ${entityName} debe ser un número positivo`)
  }
  return numericId
}

const InscripcionService = {
  /**
   * Obtener todas las inscripciones
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Array>} Lista de inscripciones
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.INSCRIPCIONES, { params })
    return response.data
  },

  /**
   * Obtener una inscripción por ID
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} Datos de la inscripción
   */
  getById: async (id) => {
    const validId = validateId(id, 'inscripción')
    const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}${validId}/`)
    return response.data
  },

  /**
   * Crear una nueva inscripción con atleta y persona
   * El backend espera: { persona: {...}, atleta: {...}, inscripcion: {...} }
   * @param {Object} data - Datos estructurados
   * @returns {Promise<Object>} Inscripción creada
   */
  create: async (data) => {
    // Validar que el payload tenga la estructura correcta
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de inscripción inválidos')
    }
    if (!data.persona || !data.atleta || !data.inscripcion) {
      throw new Error('El payload debe incluir persona, atleta e inscripcion')
    }
    // El payload ya viene estructurado desde el formulario
    // No filtrar campos, enviar tal cual
    const response = await apiClient.post(ENDPOINTS.INSCRIPCIONES, data)
    return response.data
  },

  /**
   * Actualizar una inscripción existente
   * El backend espera: { persona: {...}, atleta: {...}, inscripcion: {...} }
   * @param {number} id - ID de la inscripción
   * @param {Object} data - Datos estructurados a actualizar
   * @returns {Promise<Object>} Inscripción actualizada
   */
  update: async (id, data) => {
    const validId = validateId(id, 'inscripción')
    // Validar estructura del payload
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de actualización inválidos')
    }
    // El payload ya viene estructurado desde el formulario
    const response = await apiClient.put(`${ENDPOINTS.INSCRIPCIONES}${validId}/`, data)
    return response.data
  },

  /**
   * Eliminar una inscripción
   * @param {number} id - ID de la inscripción
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const validId = validateId(id, 'inscripción')
    const response = await apiClient.delete(`${ENDPOINTS.INSCRIPCIONES}${validId}/`)
    return response.data
  },

  /**
   * Toggle del estado de una inscripción (habilitar/deshabilitar)
   * CRÍTICO: Este endpoint NO recibe body, se envía vacío explícitamente
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} { habilitada: boolean, mensaje: string }
   */
  toggleEstado: async (id) => {
    const validId = validateId(id, 'inscripción')
    // IMPORTANTE: Enviar body vacío {} explícitamente para evitar problemas con Django
    const response = await apiClient.post(`${ENDPOINTS.INSCRIPCIONES}${validId}/cambiar-estado/`, {})
    return response.data
  },

  /**
   * Alias para compatibilidad - cambiar estado de inscripción
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} Respuesta del servidor
   */
  cambiarEstado: async (id) => {
    return InscripcionService.toggleEstado(id)
  },
}

export default InscripcionService
