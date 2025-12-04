/**
 * Store de Atletas - Estado global de atletas
 * Maneja: lista, filtros, atleta seleccionado
 */
import { create } from 'zustand'
import { AtletaService } from '../api'

const useAtletaStore = create((set, get) => ({
  // Estado
  atletas: [],
  atletaSeleccionado: null,
  loading: false,
  error: null,
  
  // Filtros y paginación
  filtros: {
    search: '',
    page: 1,
    pageSize: 10,
  },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setAtletaSeleccionado: (atleta) => set({ atletaSeleccionado: atleta }),

  clearAtletaSeleccionado: () => set({ atletaSeleccionado: null }),

  // Fetch atletas
  fetchAtletas: async () => {
    set({ loading: true, error: null })
    try {
      const response = await AtletaService.getAll(get().filtros)
      set({ 
        atletas: response.data?.results || response.data || [],
        totalItems: response.data?.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Crear atleta
  createAtleta: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await AtletaService.create(data)
      set((state) => ({ 
        atletas: [...state.atletas, response.data],
        loading: false 
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Actualizar atleta
  updateAtleta: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await AtletaService.update(id, data)
      set((state) => ({
        atletas: state.atletas.map(a => a.id === id ? response.data : a),
        atletaSeleccionado: null,
        loading: false
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Eliminar atleta
  deleteAtleta: async (id) => {
    set({ loading: true, error: null })
    try {
      await AtletaService.delete(id)
      set((state) => ({
        atletas: state.atletas.filter(a => a.id !== id),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Reset store
  reset: () => set({
    atletas: [],
    atletaSeleccionado: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useAtletaStore
