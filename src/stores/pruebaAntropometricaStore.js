/**
 * Store de Pruebas Antropométricas - Estado global
 */
import { create } from 'zustand'
import { PruebaAntropometricaService } from '../api'

const usePruebaAntropometricaStore = create((set, get) => ({
  // Estado
  pruebas: [],
  pruebaSeleccionada: null,
  loading: false,
  error: null,
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setPruebaSeleccionada: (prueba) => set({ pruebaSeleccionada: prueba }),

  clearPruebaSeleccionada: () => set({ pruebaSeleccionada: null }),

  fetchPruebas: async () => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.getAll(get().filtros)
      const data = response.results || response || []
      set({ 
        pruebas: Array.isArray(data) ? data : [],
        totalItems: response.count || (Array.isArray(data) ? data.length : 0),
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createPrueba: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.create(data)
      set((state) => ({ 
        pruebas: [...state.pruebas, response],
        loading: false 
      }))
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updatePrueba: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.update(id, data)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        pruebaSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deletePrueba: async (id) => {
    set({ loading: true, error: null })
    try {
      await PruebaAntropometricaService.delete(id)
      set((state) => ({
        pruebas: state.pruebas.filter(p => p.id !== id),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  toggleEstadoPrueba: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.toggleEstado(id)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  getPruebasByAtleta: async (atletaId) => {
    try {
      const response = await PruebaAntropometricaService.getByAtleta(atletaId)
      const data = response.results || response || []
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching pruebas by atleta:', error)
      return []
    }
  },

  shareReport: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.shareReport(id, data)
      set({ loading: false })
      return { success: true, data: response }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  reset: () => set({
    pruebas: [],
    pruebaSeleccionada: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default usePruebaAntropometricaStore
