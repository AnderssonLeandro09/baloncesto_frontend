/**
 * Store de Grupos de Atletas - Estado global
 * Adaptado para el nuevo formato de respuesta del backend:
 * { msg: string, data: any, code: number, status: 'success' | 'error' }
 */
import { create } from 'zustand'
import { GrupoAtletaService } from '../api'

const useGrupoStore = create((set, get) => ({
  // Estado
  grupos: [],
  grupoSeleccionado: null,
  loading: false,
  error: null,
  fieldErrors: null, // Errores de validación por campo
  filtros: { search: '', page: 1, pageSize: 10 },
  totalItems: 0,

  // Acciones
  setFiltros: (filtros) => set((state) => ({ 
    filtros: { ...state.filtros, ...filtros } 
  })),

  setGrupoSeleccionado: (grupo) => set({ grupoSeleccionado: grupo }),

  clearGrupoSeleccionado: () => set({ grupoSeleccionado: null }),

  clearErrors: () => set({ error: null, fieldErrors: null }),

  fetchGrupos: async () => {
    set({ loading: true, error: null, fieldErrors: null })
    try {
      const response = await GrupoAtletaService.getAll(get().filtros)
      
      if (response.success) {
        const grupos = Array.isArray(response.data) ? response.data : []
        set({ 
          grupos: grupos,
          totalItems: grupos.length,
          loading: false 
        })
      } else {
        set({ 
          error: response.message || 'No se pudieron cargar los grupos',
          loading: false 
        })
      }
    } catch (error) {
      set({ error: 'Error de conexión al cargar los grupos', loading: false })
    }
  },

  createGrupo: async (data) => {
    set({ loading: true, error: null, fieldErrors: null })
    try {
      const response = await GrupoAtletaService.create(data)
      
      if (response.success) {
        const nuevoGrupo = response.data
        set((state) => ({ 
          grupos: [...state.grupos, nuevoGrupo],
          loading: false 
        }))
        return { 
          success: true, 
          data: nuevoGrupo,
          message: response.message || 'Grupo creado correctamente'
        }
      } else {
        // Manejar errores de validación por campo
        const fieldErrors = response.errors
        set({ 
          error: response.message,
          fieldErrors: fieldErrors,
          loading: false 
        })
        return { 
          success: false, 
          message: response.message || 'Error al crear el grupo',
          errors: fieldErrors
        }
      }
    } catch (error) {
      const errorMsg = 'Error de conexión al crear el grupo'
      set({ error: errorMsg, loading: false })
      return { success: false, message: errorMsg }
    }
  },

  updateGrupo: async (id, data) => {
    set({ loading: true, error: null, fieldErrors: null })
    try {
      const response = await GrupoAtletaService.update(id, data)
      
      if (response.success) {
        const grupoActualizado = response.data
        set((state) => ({
          grupos: state.grupos.map(g => g.id === id ? grupoActualizado : g),
          grupoSeleccionado: null,
          loading: false
        }))
        return { 
          success: true, 
          data: grupoActualizado,
          message: response.message || 'Grupo actualizado correctamente'
        }
      } else {
        // Manejar errores de validación por campo
        const fieldErrors = response.errors
        set({ 
          error: response.message,
          fieldErrors: fieldErrors,
          loading: false 
        })
        return { 
          success: false, 
          message: response.message || 'Error al actualizar el grupo',
          errors: fieldErrors
        }
      }
    } catch (error) {
      const errorMsg = 'Error de conexión al actualizar el grupo'
      set({ error: errorMsg, loading: false })
      return { success: false, message: errorMsg }
    }
  },

  deleteGrupo: async (id) => {
    set({ loading: true, error: null, fieldErrors: null })
    try {
      const response = await GrupoAtletaService.delete(id)
      
      if (response.success) {
        set((state) => ({
          grupos: state.grupos.filter(g => g.id !== id),
          loading: false
        }))
        return { 
          success: true,
          message: response.message || 'Grupo eliminado correctamente'
        }
      } else {
        set({ error: response.message, loading: false })
        return { 
          success: false, 
          message: response.message || 'Error al eliminar el grupo'
        }
      }
    } catch (error) {
      const errorMsg = 'Error de conexión al eliminar el grupo'
      set({ error: errorMsg, loading: false })
      return { success: false, message: errorMsg }
    }
  },

  toggleEstado: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await GrupoAtletaService.toggleEstado(id)
      const grupoActualizado = response?.data || response
      set((state) => ({
        grupos: state.grupos.map(g => g.id === id ? grupoActualizado : g),
        loading: false
      }))
      return { 
        success: true, 
        data: grupoActualizado,
        message: response?.msg || 'Estado actualizado exitosamente'
      }
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
    fieldErrors: null,
    filtros: { search: '', page: 1, pageSize: 10 },
    totalItems: 0,
  }),
}))

export default useGrupoStore
