/**
 * Store de Grupos de Atletas - Estado global
 */
import { create } from 'zustand'
import { GrupoAtletaService } from '../api'

const useGrupoStore = create((set, get) => ({
  // Estado
  grupos: [],
  grupoSeleccionado: null,
  loading: false,
  error: null,
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setGrupoSeleccionado: (grupo) => set({ grupoSeleccionado: grupo }),

  clearGrupoSeleccionado: () => set({ grupoSeleccionado: null }),

  fetchGrupos: async () => {
    set({ loading: true, error: null })
    try {
      const response = await GrupoAtletaService.getAll(get().filtros)
      set({ 
        grupos: response.data?.results || response.data || [],
        totalItems: response.data?.count || 0,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createGrupo: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await GrupoAtletaService.create(data)
      set((state) => ({ 
        grupos: [...state.grupos, response.data],
        loading: false 
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updateGrupo: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await GrupoAtletaService.update(id, data)
      set((state) => ({
        grupos: state.grupos.map(g => g.id === id ? response.data : g),
        grupoSeleccionado: null,
        loading: false
      }))
      return { success: true, data: response.data }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  deleteGrupo: async (id) => {
    set({ loading: true, error: null })
    try {
      await GrupoAtletaService.delete(id)
      set((state) => ({
        grupos: state.grupos.filter(g => g.id !== id),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  reset: () => set({
    grupos: [],
    grupoSeleccionado: null,
    loading: false,
    error: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useGrupoStore
