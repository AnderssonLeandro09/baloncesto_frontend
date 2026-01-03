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
      set({ 
        pruebas: response.data?.results || response.data || [],
        totalItems: response.data?.count || 0,
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
        pruebas: [...state.pruebas, response.data],
        loading: false 
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updatePrueba: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaAntropometricaService.update(id, data)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response.data : p),
        pruebaSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
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
      return { success: false, error: error.message }
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
