/**
 * Store de Inscripciones - Estado global con Zustand
 * Gestiona inscripciones de atletas al sistema
 */
import { create } from 'zustand'
import { InscripcionService } from '../api'

const useInscripcionStore = create((set, get) => ({
  // Estado
  inscripciones: [],
  inscripcionSeleccionada: null,
  loading: false,
  error: null,
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones de filtros
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  // Selección de inscripción
  setInscripcionSeleccionada: (inscripcion) => set({ inscripcionSeleccionada: inscripcion }),
  clearInscripcionSeleccionada: () => set({ inscripcionSeleccionada: null }),

  // Obtener todas las inscripciones
  fetchInscripciones: async () => {
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.getAll(get().filtros)
      // El backend puede retornar lista directa o paginada
      const data = Array.isArray(response) ? response : (response.results || response.data || [])
      const total = Array.isArray(response) ? response.length : (response.count || data.length)
      
      set({ 
        inscripciones: data,
        totalItems: total,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Crear nueva inscripción
  createInscripcion: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.create(data)
      set((state) => ({ 
        inscripciones: [...state.inscripciones, response],
        loading: false 
      }))
      return { success: true, data: response }
    } catch (error) {
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.atleta?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || error.message
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Actualizar inscripción existente
  updateInscripcion: async (id, data) => {
    // Validación de seguridad: verificar que el ID sea válido
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      return { success: false, error: 'ID de inscripción inválido' }
    }
    
    const sanitizedId = typeof id === 'string' ? parseInt(id, 10) : id
    if (isNaN(sanitizedId) || sanitizedId <= 0) {
      return { success: false, error: 'ID de inscripción debe ser un número positivo' }
    }
    
    // Validar que data no esté vacío
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Datos de actualización inválidos' }
    }
    
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.update(sanitizedId, data)
      set((state) => ({
        inscripciones: state.inscripciones.map(i => {
          const inscripcionId = i.inscripcion?.id || i.id
          return inscripcionId === sanitizedId ? response : i
        }),
        inscripcionSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Toggle estado de inscripción (habilitar/deshabilitar)
  toggleEstado: async (id) => {
    // Validación de seguridad: verificar que el ID sea válido
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      return { success: false, error: 'ID de inscripción inválido' }
    }
    
    // Sanitizar ID: convertir a número si es string numérico
    const sanitizedId = typeof id === 'string' ? parseInt(id, 10) : id
    if (isNaN(sanitizedId) || sanitizedId <= 0) {
      return { success: false, error: 'ID de inscripción debe ser un número positivo' }
    }
    
    set({ loading: true, error: null })
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
      
      return { 
        success: true, 
        habilitada: response.habilitada, 
        mensaje: response.mensaje || `Inscripción ${response.habilitada ? 'habilitada' : 'deshabilitada'} exitosamente`
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Alias para compatibilidad
  cambiarEstado: async (id) => {
    return get().toggleEstado(id)
  },

  // Eliminar inscripción
  deleteInscripcion: async (id) => {
    set({ loading: true, error: null })
    try {
      await InscripcionService.delete(id)
      set((state) => ({
        inscripciones: state.inscripciones.filter(i => {
          const inscripcionId = i.inscripcion?.id || i.id
          return inscripcionId !== id
        }),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  },

  // Reset del store
  reset: () => set({
    inscripciones: [],
    inscripcionSeleccionada: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useInscripcionStore
