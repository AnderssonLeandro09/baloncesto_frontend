/**
 * Store de Entrenadores - Estado global
 */
import { create } from 'zustand'
import { EntrenadorService } from '../api'

const resolveErrorMessage = (error) => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.error) return data.error
  if (data?.message) return data.message
  if (data?.detail) return data.detail
  return error?.message || 'Ocurrió un error inesperado'
}

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
        entrenadores: response.results || response || [],
        totalItems: response.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: resolveErrorMessage(error), loading: false })
    }
  },

  createEntrenador: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await EntrenadorService.create(data)
      set((state) => ({ 
        entrenadores: [...state.entrenadores, response],
        loading: false 
      }))
      return { success: true, data: response }
    } catch (error) {
      const message = resolveErrorMessage(error)
      set({ error: message, loading: false })
      return { success: false, error: message }
    }
  },

  updateEntrenador: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await EntrenadorService.update(id, data)
      set((state) => ({
        entrenadores: state.entrenadores.map(e => e.entrenador.id === parseInt(id) ? response : e),
        entrenadorSeleccionado: null,
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      const message = resolveErrorMessage(error)
      set({ error: message, loading: false })
      return { success: false, error: message }
    }
  },

  deleteEntrenador: async (id) => {
    set({ loading: true, error: null })
    try {
      await EntrenadorService.delete(id)
      set((state) => ({
        entrenadores: state.entrenadores.filter(e => e.entrenador.id !== parseInt(id)),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      const message = resolveErrorMessage(error)
      set({ error: message, loading: false })
      return { success: false, error: message }
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
