/**
 * Store de Pruebas Físicas - Estado global
 */
import { create } from 'zustand'
import { PruebaFisicaService } from '../api'

const usePruebaFisicaStore = create((set, get) => ({
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
      const data = await PruebaFisicaService.getAll(get().filtros)
      // El servicio ya retorna response.data
      set({ 
        pruebas: data?.results || data || [],
        totalItems: data?.count || (Array.isArray(data) ? data.length : 0),
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createPrueba: async (data) => {
    set({ loading: true, error: null })
    try {
      console.log('Store: enviando datos al servicio:', data)
      const response = await PruebaFisicaService.create(data)
      console.log('Store: respuesta del servicio:', response)
      set((state) => ({ 
        pruebas: [...state.pruebas, response],
        loading: false 
      }))
      return { success: true, data: response }
    } catch (error) {
      console.error('Store: error al crear prueba:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updatePrueba: async (id, data) => {
    set({ loading: true, error: null })
    try {
      console.log('Store update: enviando al servicio:', { id, data })
      const response = await PruebaFisicaService.update(id, data)
      console.log('Store update: respuesta del servicio:', response)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        pruebaSeleccionada: null,
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      console.error('Store update: error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  deletePrueba: async (id) => {
    set({ loading: true, error: null })
    try {
      await PruebaFisicaService.delete(id)
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

  toggleEstado: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await PruebaFisicaService.toggleEstado(id)
      set((state) => ({
        pruebas: state.pruebas.map(p => p.id === id ? response : p),
        loading: false
      }))
      return { success: true, data: response }
    } catch (error) {
      console.error('Store: error al cambiar estado:', error)
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

export default usePruebaFisicaStore
