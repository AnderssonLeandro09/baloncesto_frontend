/**
 * Store de Inscripciones - Estado global
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

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setInscripcionSeleccionada: (inscripcion) => set({ inscripcionSeleccionada: inscripcion }),

  clearInscripcionSeleccionada: () => set({ inscripcionSeleccionada: null }),

  fetchInscripciones: async () => {
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.getAll(get().filtros)
      set({ 
        inscripciones: response.data?.results || response.data || [],
        totalItems: response.data?.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createInscripcion: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.create(data)
      set((state) => ({ 
        inscripciones: [...state.inscripciones, response.data],
        loading: false 
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updateInscripcion: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await InscripcionService.update(id, data)
      set((state) => ({
        inscripciones: state.inscripciones.map(i => i.id === id ? response.data : i),
        inscripcionSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  deleteInscripcion: async (id) => {
    set({ loading: true, error: null })
    try {
      await InscripcionService.delete(id)
      set((state) => ({
        inscripciones: state.inscripciones.filter(i => i.id !== id),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

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
