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
 * FORMATO DE RESPUESTA DEL BACKEND:
 * {
 *   msg: string,      // Mensaje descriptivo
 *   data: any,        // Datos de la respuesta
 *   code: number,     // Código HTTP
 *   status: string    // 'success' | 'error'
 * }
 * 
 * SEGURIDAD:
 * - Todos los IDs se validan antes de enviar al backend
 * - Los datos sensibles se manejan solo en el backend
 */

import apiClient from './apiClient'
import { ENDPOINTS } from '../config/api.config'
import { 
  parsearRespuestaBackend, 
  parsearErrorBackend,
  validarInscripcionCompleta 
} from '../utils/validacionesInscripcion'

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

/**
 * Procesa la respuesta del backend al nuevo formato estandarizado.
 * Detecta errores basados en el status y código de respuesta.
 * 
 * @param {Object} response - Respuesta de axios
 * @returns {Object} Datos procesados {mensaje, data, esExito, code}
 * @throws {Error} Si el backend indica status 'error' o código >= 400
 */
const procesarRespuesta = (response) => {
  const parsed = parsearRespuestaBackend(response)
  
  // Si el backend envía status 'error' o código de error, lanzar excepción
  if (!parsed.esExito || parsed.code >= 400) {
    const error = new Error(parsed.mensaje)
    error.code = parsed.code
    throw error
  }
  
  return parsed
}

const InscripcionService = {
  /**
   * Obtener todas las inscripciones
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Object>} { mensaje, data, esExito }
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.INSCRIPCIONES, { params })
      const parsed = procesarRespuesta(response)
      // Retornar los datos directamente para compatibilidad con el store
      return parsed.data || response.data
    } catch (error) {
      const { mensaje } = parsearErrorBackend(error)
      throw new Error(mensaje)
    }
  },

  /**
   * Obtener una inscripción por ID
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} { mensaje, data, esExito }
   */
  getById: async (id) => {
    try {
      const validId = validateId(id, 'inscripción')
      const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}${validId}/`)
      return procesarRespuesta(response)
    } catch (error) {
      const { mensaje } = parsearErrorBackend(error)
      throw new Error(mensaje)
    }
  },

  /**
   * Crear una nueva inscripción con atleta y persona.
   * Realiza validación local antes de enviar al backend.
   * 
   * El backend espera: { persona: {...}, atleta: {...}, inscripcion: {...} }
   * 
   * @param {Object} data - Datos estructurados con persona, atleta e inscripcion
   * @returns {Promise<Object>} { mensaje, data, esExito }
   * @throws {Error} Error con propiedades adicionales: fieldErrors (errores por campo), code (HTTP)
   */
  create: async (data) => {
    // Validar que el payload tenga la estructura correcta
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de inscripción inválidos')
    }
    if (!data.persona || !data.atleta || !data.inscripcion) {
      throw new Error('El payload debe incluir persona, atleta e inscripcion')
    }
    
    // Validar datos antes de enviar (capa extra de seguridad)
    const validacion = validarInscripcionCompleta(data)
    if (!validacion.valido) {
      const primerError = Object.values(validacion.errores)[0]
      const error = new Error(primerError)
      error.fieldErrors = validacion.errores
      throw error
    }
    
    try {
      const response = await apiClient.post(ENDPOINTS.INSCRIPCIONES, data)
      return procesarRespuesta(response)
    } catch (error) {
      const parsed = parsearErrorBackend(error)
      const err = new Error(parsed.mensaje)
      err.fieldErrors = parsed.fieldErrors
      err.code = parsed.code
      throw err
    }
  },

  /**
   * Actualizar una inscripción existente
   * El backend espera: { persona: {...}, atleta: {...}, inscripcion: {...} }
   * @param {number} id - ID de la inscripción
   * @param {Object} data - Datos estructurados a actualizar
   * @returns {Promise<Object>} { mensaje, data, esExito }
   */
  update: async (id, data) => {
    const validId = validateId(id, 'inscripción')
    // Validar estructura del payload
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de actualización inválidos')
    }
    
    try {
      const response = await apiClient.put(`${ENDPOINTS.INSCRIPCIONES}${validId}/`, data)
      return procesarRespuesta(response)
    } catch (error) {
      const parsed = parsearErrorBackend(error)
      const err = new Error(parsed.mensaje)
      err.fieldErrors = parsed.fieldErrors
      err.code = parsed.code
      throw err
    }
  },

  /**
   * Eliminar una inscripción
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} { mensaje, data, esExito }
   */
  delete: async (id) => {
    try {
      const validId = validateId(id, 'inscripción')
      const response = await apiClient.delete(`${ENDPOINTS.INSCRIPCIONES}${validId}/`)
      return procesarRespuesta(response)
    } catch (error) {
      const { mensaje } = parsearErrorBackend(error)
      throw new Error(mensaje)
    }
  },

  /**
   * Toggle del estado de una inscripción (habilitar/deshabilitar)
   * CRÍTICO: Este endpoint NO recibe body, se envía vacío explícitamente
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object>} { habilitada: boolean, mensaje: string }
   */
  toggleEstado: async (id) => {
    try {
      const validId = validateId(id, 'inscripción')
      // IMPORTANTE: Enviar body vacío {} explícitamente para evitar problemas con Django
      const response = await apiClient.post(`${ENDPOINTS.INSCRIPCIONES}${validId}/cambiar-estado/`, {})
      const parsed = procesarRespuesta(response)
      return {
        habilitada: parsed.data?.habilitada,
        mensaje: parsed.mensaje,
        esExito: parsed.esExito
      }
    } catch (error) {
      const { mensaje } = parsearErrorBackend(error)
      throw new Error(mensaje)
    }
  },

  /**
   * Verificar si una cédula ya tiene inscripción activa
   * @param {string} cedula - Número de cédula
   * @returns {Promise<Object>} { existe: boolean, mensaje: string }
   */
  verificarCedula: async (cedula) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}verificar-cedula/`, {
        params: { dni: cedula }
      })
      const parsed = procesarRespuesta(response)
      return {
        existe: parsed.data?.existe || false,
        mensaje: parsed.mensaje,
        esExito: parsed.esExito
      }
    } catch (error) {
      // Si hay error, permitir continuar (por seguridad)
      console.warn('Error verificando cédula:', error)
      return { existe: false, mensaje: '', esExito: true }
    }
  },

  /**
   * Verificar si una cédula ya está registrada como representante
   * @param {string} cedula - Número de cédula del representante
   * @returns {Promise<Object>} { existe: boolean, mensaje: string }
   */
  verificarCedulaRepresentante: async (cedula) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.INSCRIPCIONES}verificar-cedula-representante/`, {
        params: { dni: cedula }
      })
      const parsed = procesarRespuesta(response)
      return {
        existe: parsed.data?.existe || false,
        mensaje: parsed.mensaje || (parsed.data?.existe ? 'Representante ya registrado' : 'Disponible'),
        esExito: parsed.esExito
      }
    } catch (error) {
      console.warn('Error verificando cédula de representante:', error)
      return { existe: false, mensaje: '', esExito: true }
    }
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
