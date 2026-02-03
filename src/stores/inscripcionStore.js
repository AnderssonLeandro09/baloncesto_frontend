/**
 * Store de Inscripciones - Estado global con Zustand
 * Gestiona inscripciones de atletas al sistema.
 * 
 * Estado:
 * - inscripciones: Lista de inscripciones cargadas
 * - inscripcionSeleccionada: Inscripción actual en edición/visualización
 * - loading: Indicador de operación en progreso
 * - error: Mensaje de error global
 * - fieldErrors: Errores específicos por campo del formulario
 * 
 * Formato de respuesta del backend:
 * { msg, data, code, status }
 */
import { create } from 'zustand'
import { InscripcionService } from '../api'
import { 
  parsearErrorBackend, 
  obtenerMensajeToast,
  MENSAJES_EXITO,
  MENSAJES_ERROR 
} from '../utils/validacionesInscripcion'

const useInscripcionStore = create((set, get) => ({
  // Estado
  inscripciones: [],
  inscripcionSeleccionada: null,
  loading: false,
  error: null,
  fieldErrors: {}, // Errores específicos de campos para formularios
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones de filtros
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  // Selección de inscripción
  setInscripcionSeleccionada: (inscripcion) => set({ inscripcionSeleccionada: inscripcion }),
  clearInscripcionSeleccionada: () => set({ inscripcionSeleccionada: null }),
  clearErrors: () => set({ error: null, fieldErrors: {} }),

  // Obtener todas las inscripciones
  fetchInscripciones: async () => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await InscripcionService.getAll(get().filtros)
      // El backend puede retornar lista directa o paginada
      const data = Array.isArray(response) ? response : (response.results || response.data || response || [])
      const total = Array.isArray(response) ? response.length : (response.count || data.length)
      
      set({ 
        inscripciones: data,
        totalItems: total,
        loading: false 
      })
      return { success: true, data }
    } catch (error) {
      const { mensaje } = parsearErrorBackend(error)
      set({ error: mensaje, loading: false })
      return { success: false, error: mensaje }
    }
  },

  /**
   * Crear nueva inscripción.
   * Envía datos estructurados al backend y actualiza el estado local.
   * 
   * @param {Object} data - Datos con estructura {persona, atleta, inscripcion}
   * @returns {Promise<Object>} {success, data?, error?, fieldErrors?, mensaje}
   */
  createInscripcion: async (data) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await InscripcionService.create(data)
      const inscripcionData = response.data || response
      
      set((state) => ({ 
        inscripciones: [...state.inscripciones, inscripcionData],
        loading: false 
      }))
      
      return { 
        success: true, 
        data: inscripcionData,
        mensaje: obtenerMensajeToast('crear', true, response.mensaje)
      }
    } catch (error) {
      // Extraer errores de campo específicos si existen
      const fieldErrors = error.fieldErrors || {}
      // Usar mensaje del error o fallback a mensaje genérico
      const mensaje = error.message || MENSAJES_ERROR.ERROR_SERVIDOR
      
      set({ 
        error: mensaje, 
        fieldErrors,
        loading: false 
      })
      
      return { 
        success: false, 
        error: mensaje,
        fieldErrors,
        mensaje: obtenerMensajeToast('crear', false, mensaje)
      }
    }
  },

  // Actualizar inscripción existente
  updateInscripcion: async (id, data) => {
    // Validación de seguridad: verificar que el ID sea válido
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      return { success: false, error: 'ID de inscripción inválido', mensaje: 'ID de inscripción inválido' }
    }
    
    const sanitizedId = typeof id === 'string' ? parseInt(id, 10) : id
    if (isNaN(sanitizedId) || sanitizedId <= 0) {
      return { success: false, error: 'ID de inscripción debe ser un número positivo', mensaje: 'ID de inscripción debe ser un número positivo' }
    }
    
    // Validar que data no esté vacío
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Datos de actualización inválidos', mensaje: 'Datos de actualización inválidos' }
    }
    
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await InscripcionService.update(sanitizedId, data)
      const inscripcionData = response.data || response
      
      set((state) => ({
        inscripciones: state.inscripciones.map(i => {
          const inscripcionId = i.inscripcion?.id || i.id
          return inscripcionId === sanitizedId ? inscripcionData : i
        }),
        inscripcionSeleccionada: null,
        loading: false
      }))
      
      return { 
        success: true, 
        data: inscripcionData,
        mensaje: obtenerMensajeToast('actualizar', true, response.mensaje)
      }
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      const mensaje = error.message || MENSAJES_ERROR.ERROR_SERVIDOR
      
      set({ 
        error: mensaje, 
        fieldErrors,
        loading: false 
      })
      
      return { 
        success: false, 
        error: mensaje,
        fieldErrors,
        mensaje: obtenerMensajeToast('actualizar', false, mensaje)
      }
    }
  },

  // Toggle estado de inscripción (habilitar/deshabilitar)
  toggleEstado: async (id) => {
    // Validación de seguridad: verificar que el ID sea válido
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      return { success: false, error: 'ID de inscripción inválido', mensaje: 'ID de inscripción inválido' }
    }
    
    // Sanitizar ID: convertir a número si es string numérico
    const sanitizedId = typeof id === 'string' ? parseInt(id, 10) : id
    if (isNaN(sanitizedId) || sanitizedId <= 0) {
      return { success: false, error: 'ID de inscripción debe ser un número positivo', mensaje: 'ID de inscripción debe ser un número positivo' }
    }
    
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      const response = await InscripcionService.toggleEstado(sanitizedId)
      
      // Actualizar el estado local inmediatamente
      set((state) => ({
        inscripciones: state.inscripciones.map(i => {
          const inscripcionId = i.inscripcion?.id || i.id
          if (inscripcionId === sanitizedId) {
            // Manejar estructura anidada o plana
            if (i.inscripcion) {
              return { 
                ...i, 
                inscripcion: { ...i.inscripcion, habilitada: response.habilitada } 
              }
            }
            return { ...i, habilitada: response.habilitada }
          }
          return i
        }),
        loading: false
      }))
      
      const accion = response.habilitada ? 'habilitar' : 'deshabilitar'
      return { 
        success: true, 
        habilitada: response.habilitada, 
        mensaje: obtenerMensajeToast(accion, true, response.mensaje)
      }
    } catch (error) {
      const mensaje = error.message || MENSAJES_ERROR.ERROR_SERVIDOR
      set({ error: mensaje, loading: false })
      return { 
        success: false, 
        error: mensaje,
        mensaje: mensaje
      }
    }
  },

  // Alias para compatibilidad
  cambiarEstado: async (id) => {
    return get().toggleEstado(id)
  },

  // Eliminar inscripción
  deleteInscripcion: async (id) => {
    set({ loading: true, error: null, fieldErrors: {} })
    try {
      await InscripcionService.delete(id)
      set((state) => ({
        inscripciones: state.inscripciones.filter(i => {
          const inscripcionId = i.inscripcion?.id || i.id
          return inscripcionId !== id
        }),
        loading: false
      }))
      return { 
        success: true,
        mensaje: obtenerMensajeToast('eliminar', true)
      }
    } catch (error) {
      const mensaje = error.message || MENSAJES_ERROR.ERROR_SERVIDOR
      set({ error: mensaje, loading: false })
      return { 
        success: false, 
        error: mensaje,
        mensaje
      }
    }
  },

  // Reset del store
  reset: () => set({
    inscripciones: [],
    inscripcionSeleccionada: null,
    loading: false,
    error: null,
    fieldErrors: {},
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useInscripcionStore
