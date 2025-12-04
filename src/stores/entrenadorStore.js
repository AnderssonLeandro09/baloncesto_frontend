/**
 * Store de Entrenadores - Estado global
 */
import { create } from 'zustand'
import { EntrenadorService } from '../api'

const useEntrenadorStore = create((set, get) => ({
  // Estado
  entrenadores: [],
  entrenadorSeleccionado: null,
  loading: false,
  error: null,
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setEntrenadorSeleccionado: (entrenador) => set({ entrenadorSeleccionado: entrenador }),

  clearEntrenadorSeleccionado: () => set({ entrenadorSeleccionado: null }),

  fetchEntrenadores: async () => {
    set({ loading: true, error: null })
    try {
      const response = await EntrenadorService.getAll(get().filtros)
      set({ 
        entrenadores: response.data?.results || response.data || [],
        totalItems: response.data?.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createEntrenador: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await EntrenadorService.create(data)
      set((state) => ({ 
        entrenadores: [...state.entrenadores, response.data],
        loading: false 
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updateEntrenador: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await EntrenadorService.update(id, data)
      set((state) => ({
        entrenadores: state.entrenadores.map(e => e.id === id ? response.data : e),
        entrenadorSeleccionado: null,
        loading: false
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  deleteEntrenador: async (id) => {
    set({ loading: true, error: null })
    try {
      await EntrenadorService.delete(id)
      set((state) => ({
        entrenadores: state.entrenadores.filter(e => e.id !== id),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  reset: () => set({
    entrenadores: [],
    entrenadorSeleccionado: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useEntrenadorStore
